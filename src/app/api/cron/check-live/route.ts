import { NextResponse } from "next/server";

import { runLiveNotificationCheck } from "@/lib/live-notifier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.trim().length === 0) {
    return process.env.NODE_ENV === "development";
  }

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runLiveNotificationCheck();
    return NextResponse.json({
      ok: true,
      ...result,
    }); 
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    console.error("Live notification cron failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
