import { cache } from "react";

import { SCAN_INTERVAL_SECONDS } from "@/lib/youtube";

export type TiktokLiveResult = {
  tiktokUrl: string;
  isLive: boolean;
};

function extractTiktokHandle(tiktokUrl: string): string | null {
  try {
    const url = new URL(tiktokUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const at = parts.find((p) => p.startsWith("@"));
    if (!at) return null;
    const handle = at.slice(1).trim();
    return handle.length > 0 ? handle : null;
  } catch {
    return null;
  }
}

function looksBlockedOrChallenged(html: string): boolean {
  return (
    /captcha/i.test(html) ||
    /verify to continue/i.test(html) ||
    /security check/i.test(html) ||
    /unusual traffic/i.test(html) ||
    /challenge/i.test(html) ||
    /Please enable JavaScript/i.test(html)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function coerceJsonText(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) return trimmed.slice(firstBrace, lastBrace + 1);
  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) return trimmed.slice(firstBracket, lastBracket + 1);
  return null;
}

function extractJsonScripts(html: string): string[] {
  const scriptIds = ["__UNIVERSAL_DATA_FOR_REHYDRATION__", "SIGI_STATE", "__NEXT_DATA__"];
  const results: string[] = [];

  for (const id of scriptIds) {
    const re = new RegExp(
      `<script[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`,
      "gi",
    );
    let match: RegExpExecArray | null = null;
    while ((match = re.exec(html)) !== null) {
      const jsonText = coerceJsonText(match[1] ?? "");
      if (jsonText) results.push(jsonText);
    }
  }

  return results;
}

function isLiveFromJsonValue(root: unknown): boolean {
  const stack: unknown[] = [root];

  while (stack.length > 0) {
    const value = stack.pop();
    if (!isRecord(value)) continue;

    const rec = value;
    const isLive = rec.isLive;
    if (isLive === true) return true;

    const status = rec.status;
    const statusNumber = typeof status === "number" ? status : undefined;
    const statusString = typeof status === "string" ? Number(status) : undefined;
    const normalizedStatus =
      statusNumber !== undefined && Number.isFinite(statusNumber)
        ? statusNumber
        : statusString !== undefined && Number.isFinite(statusString)
          ? statusString
          : undefined;

    const roomKeys = [
      "roomId",
      "roomID",
      "room_id",
      "room_id_str",
      "liveRoomId",
      "live_room_id",
      "liveRoomID",
    ] as const;
    const roomIdValue = roomKeys
      .map((k) => rec[k])
      .find((v) => typeof v === "string" || typeof v === "number");
    const roomIdString =
      typeof roomIdValue === "number"
        ? String(roomIdValue)
        : typeof roomIdValue === "string"
          ? roomIdValue
          : null;

    if (normalizedStatus === 2 && roomIdString && /^\d+$/.test(roomIdString)) return true;

    for (const v of Object.values(rec)) {
      if (isRecord(v) || Array.isArray(v)) stack.push(v);
    }
  }

  return false;
}

function isProbablyLiveFromHtml(html: string): boolean {
  if (/"isLive"\s*:\s*true/.test(html)) return true;
  if (
    /"status"\s*:\s*2/.test(html) &&
    (/"roomId"\s*:\s*"?\d+"?/.test(html) || /"liveRoomId"\s*:\s*"?\d+"?/.test(html))
  ) {
    return true;
  }
  const scripts = extractJsonScripts(html);
  for (const jsonText of scripts) {
    try {
      const parsed: unknown = JSON.parse(jsonText);
      if (isLiveFromJsonValue(parsed)) return true;
    } catch {
      continue;
    }
  }
  return false;
}

async function checkTiktokUrlLive(tiktokUrl: string): Promise<TiktokLiveResult> {
  const handle = extractTiktokHandle(tiktokUrl);
  if (!handle) return { tiktokUrl, isLive: false };

  const encoded = encodeURIComponent(handle);
  const attempts: Array<{ url: string; headers: Record<string, string> }> = [
    {
      url: `https://www.tiktok.com/@${encoded}/live`,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
    },
    {
      url: `https://m.tiktok.com/@${encoded}/live`,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
        Accept: "text/html,application/xhtml+xml,application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
    },
  ];

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, {
        headers: attempt.headers,
        redirect: "follow",
        next: { revalidate: SCAN_INTERVAL_SECONDS },
      });

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const json: unknown = await res.json();
        if (isLiveFromJsonValue(json)) return { tiktokUrl, isLive: true };
        continue;
      }

      const html = await res.text();
      if (isProbablyLiveFromHtml(html)) return { tiktokUrl, isLive: true };
      if (looksBlockedOrChallenged(html)) continue;
    } catch {
      continue;
    }
  }

  return { tiktokUrl, isLive: false };
}

export const getTiktokLiveStatuses = cache(
  async (tiktokUrls: string[]): Promise<TiktokLiveResult[]> => {
    const unique = Array.from(new Set(tiktokUrls.filter(Boolean)));
    const results = await Promise.all(unique.map(checkTiktokUrlLive));
    return results;
  },
);
