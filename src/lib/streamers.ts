import { cache } from "react";

import type { Streamer } from "@/types/streamer";

import streamersJson from "../../data/streamers.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTiktokUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  return `https://www.tiktok.com/@${handle}`;
}

function parseStreamer(input: unknown): Streamer {
  if (!isRecord(input)) {
    throw new Error("Invalid streamer entry: expected object.");
  }
  const name = input.name;
  const channelId = input.channelId;
  const tiktokUrl = input.tiktokUrl;
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Invalid streamer entry: missing name.");
  }
  if (channelId !== undefined && typeof channelId !== "string") {
    throw new Error("Invalid streamer entry: channelId must be a string.");
  }
  if (tiktokUrl !== undefined && typeof tiktokUrl !== "string") {
    throw new Error("Invalid streamer entry: tiktokUrl must be a string.");
  }

  const normalizedChannelId =
    typeof channelId === "string" && channelId.trim().length > 0
      ? channelId.trim()
      : undefined;
  const normalizedTiktokUrl =
    typeof tiktokUrl === "string" && tiktokUrl.trim().length > 0
      ? normalizeTiktokUrl(tiktokUrl)
      : undefined;

  if (!normalizedChannelId && !normalizedTiktokUrl) {
    throw new Error(
      "Invalid streamer entry: provide channelId or tiktokUrl (or both).",
    );
  }

  return {
    name: name.trim(),
    channelId: normalizedChannelId,
    tiktokUrl: normalizedTiktokUrl,
  };
}

export const getMonitoredStreamers = cache(async (): Promise<Streamer[]> => {
  if (!Array.isArray(streamersJson)) {
    throw new Error("/data/streamers.json must be a JSON array.");
  }
  return streamersJson.map(parseStreamer);
});
