import { cache } from "react";

import type { LiveStream } from "@/types/live-stream";
import type { Streamer } from "@/types/streamer";
import type { YoutubeSearchResponse } from "@/types/youtube";

export const SCAN_INTERVAL_SECONDS = 60;

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

function getYoutubeApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error("Missing YOUTUBE_API_KEY environment variable.");
  }
  return key;
}

async function youtubeFetchJson<TResponse>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<TResponse> {
  const apiKey = getYoutubeApiKey();
  const url = new URL(`${YOUTUBE_BASE_URL}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    next: { revalidate: SCAN_INTERVAL_SECONDS },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `YouTube API error (${res.status}) while fetching ${path}: ${body}`,
    );
  }
  return (await res.json()) as TResponse;
}

async function getLiveVideoForChannel(channelId: string) {
  const data = await youtubeFetchJson<YoutubeSearchResponse>("search", {
    part: "snippet",
    channelId,
    eventType: "live",
    type: "video",
    maxResults: 1,
  });

  const first = data.items[0];
  const videoId = first?.id?.videoId;
  if (!videoId) return null;

  const thumbnails = first.snippet.thumbnails;
  const thumbnailUrl =
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url;

  if (!thumbnailUrl) return null;

  return {
    channelId: first.snippet.channelId,
    videoId,
    title: first.snippet.title,
    thumbnailUrl,
    publishedAt: first.snippet.publishedAt,
  };
}

async function mapWithConcurrency<TIn, TOut>(
  items: readonly TIn[],
  concurrency: number,
  mapper: (item: TIn) => Promise<TOut>,
): Promise<TOut[]> {
  const results: TOut[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= items.length) return;
      results[current] = await mapper(items[current]);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export const getLiveStreamsForStreamers = cache(
  async (streamers: Streamer[]): Promise<LiveStream[]> => {
    getYoutubeApiKey();
    const errors: Error[] = [];
    const liveResults = await mapWithConcurrency(
      streamers,
      5,
      async (streamer) => {
        try {
          const live = await getLiveVideoForChannel(streamer.channelId);
          if (!live) return null;

          const liveStream: LiveStream = {
            channelId: streamer.channelId,
            streamerName: streamer.name,
            videoId: live.videoId,
            title: live.title,
            thumbnailUrl: live.thumbnailUrl,
            startedAt: live.publishedAt,
          };

          return liveStream;
        } catch (err) {
          errors.push(err instanceof Error ? err : new Error("Unknown error."));
          return null;
        }
      },
    );

    const liveStreams = liveResults.filter((x): x is LiveStream => x !== null);
    if (liveStreams.length === 0 && errors.length > 0) {
      throw new Error(
        `Unable to query YouTube for live status. First error: ${errors[0].message}`,
      );
    }
    return liveStreams;
  },
);
