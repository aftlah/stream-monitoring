import { cache } from "react";

import type { Streamer } from "@/types/streamer";

import streamersJson from "../../data/streamers.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseStreamer(input: unknown): Streamer {
  if (!isRecord(input)) {
    throw new Error("Invalid streamer entry: expected object.");
  }
  const name = input.name;
  const channelId = input.channelId;
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Invalid streamer entry: missing name.");
  }
  if (typeof channelId !== "string" || channelId.trim().length === 0) {
    throw new Error("Invalid streamer entry: missing channelId.");
  }

  return {
    name: name.trim(),
    channelId: channelId.trim(),
  };
}

export const getMonitoredStreamers = cache(async (): Promise<Streamer[]> => {
  if (!Array.isArray(streamersJson)) {
    throw new Error("/data/streamers.json must be a JSON array.");
  }
  return streamersJson.map(parseStreamer);
});
