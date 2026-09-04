import { cache } from "react";

import type { LiveStream } from "@/types/live-stream";
import type { Streamer } from "@/types/streamer";
import type { YoutubeVideosResponse } from "@/types/youtube";

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
  fresh = false,
): Promise<TResponse> {
  const apiKey = getYoutubeApiKey();
  const url = new URL(`${YOUTUBE_BASE_URL}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
  url.searchParams.set("key", apiKey);

  const res = await fetch(
    url.toString(),
    fresh ? { cache: "no-store" } : { next: { revalidate: SCAN_INTERVAL_SECONDS } },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `YouTube API error (${res.status}) while fetching ${path}: ${body}`,
    );
  }
  return (await res.json()) as TResponse;
}

function parseVideoIdsFromRss(xml: string): string[] {
  const ids: string[] = [];
  const re = /<yt:videoId>([^<]+)<\/yt:videoId>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    ids.push(match[1]);
  }
  return Array.from(new Set(ids));
}

async function getRecentVideoIdsForChannel(
  channelId: string,
  fresh = false,
): Promise<string[]> {
  const url = new URL("https://www.youtube.com/feeds/videos.xml");
  url.searchParams.set("channel_id", channelId);
  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; RageLiveMonitor/1.0; +https://rage-live.vercel.app)",
      Accept: "application/atom+xml,application/xml,text/xml,*/*",
    },
    ...(fresh
      ? { cache: "no-store" as const }
      : { next: { revalidate: SCAN_INTERVAL_SECONDS } }),
  });
  if (!res.ok) return [];
  const xml = await res.text();
  if (xml.includes("<!DOCTYPE html>") || xml.includes("<html")) return [];
  return parseVideoIdsFromRss(xml).slice(0, 8);
}

/**
 * New live streams often appear on /channel/{id}/live before the Atom RSS feed.
 * This avoids missing "just went live" broadcasts (no YouTube API quota).
 */
async function getLiveVideoIdFromChannelPage(
  channelId: string,
  fresh = false,
): Promise<string | null> {
  const url = `https://www.youtube.com/channel/${encodeURIComponent(channelId)}/live`;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      ...(fresh
        ? { cache: "no-store" as const }
        : { next: { revalidate: SCAN_INTERVAL_SECONDS } }),
    });
    if (!res.ok) return null;

    const finalUrl = res.url;
    const fromRedirect = finalUrl.match(/[?&]v=([\w-]{11})/);
    if (fromRedirect) return fromRedirect[1];

    const html = await res.text();
    if (
      /LIVE_STREAM_OFFLINE/i.test(html) ||
      /"isLiveNow"\s*:\s*false/i.test(html) ||
      /this channel has gone offline/i.test(html)
    ) {
      return null;
    }

    const canonical = html.match(
      /<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/i,
    );
    if (canonical) return canonical[1];

    const liveNow = html.match(
      /"isLiveNow"\s*:\s*true[\s\S]{0,400}?"videoId"\s*:\s*"([\w-]{11})"/i,
    );
    if (liveNow) return liveNow[1];

    const videoThenLive = html.match(
      /"videoId"\s*:\s*"([\w-]{11})"[\s\S]{0,400}?"isLiveNow"\s*:\s*true/i,
    );
    if (videoThenLive) return videoThenLive[1];

    return null;
  } catch {
    return null;
  }
}

async function getCandidateVideoIdsForChannel(
  channelId: string,
  fresh = false,
): Promise<string[]> {
  const [rssIds, liveId] = await Promise.all([
    getRecentVideoIdsForChannel(channelId, fresh),
    getLiveVideoIdFromChannelPage(channelId, fresh),
  ]);
  const ids = [...rssIds];
  if (liveId) ids.unshift(liveId);
  return Array.from(new Set(ids));
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
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

export const getLiveStreamsForStreamers = cache(async (streamers: Streamer[]) =>
  queryLiveStreamsForStreamers(streamers, false),
);

export async function getLiveStreamsForStreamersFresh(
  streamers: Streamer[],
): Promise<LiveStream[]> {
  return queryLiveStreamsForStreamers(streamers, true);
}

async function queryLiveStreamsForStreamers(
  streamers: Streamer[],
  fresh: boolean,
): Promise<LiveStream[]> {
  const youtubeStreamers = streamers.filter(
    (s) => s.channelId.trim().length > 0,
  );
  if (youtubeStreamers.length === 0) return [];

  getYoutubeApiKey();
  const errors: Error[] = [];
  const recentIdsByChannel = await mapWithConcurrency(
    youtubeStreamers,
    5,
    async (streamer) => {
      try {
        const ids = await getCandidateVideoIdsForChannel(streamer.channelId, fresh);
        return { channelId: streamer.channelId, ids };
      } catch {
        return { channelId: streamer.channelId, ids: [] };
      }
    },
  );

  const allVideoIds = Array.from(
    new Set(recentIdsByChannel.flatMap((x) => x.ids)),
  );
  if (allVideoIds.length === 0) return [];

  const streamerByChannelId = new Map(
    youtubeStreamers.map((s) => [s.channelId, s] as const),
  );

  const videoChunks = chunk(allVideoIds, 50);
  const videoItems = (
    await mapWithConcurrency(videoChunks, 2, async (ids) => {
      try {
        const data = await youtubeFetchJson<YoutubeVideosResponse>(
          "videos",
          {
            part: "snippet,liveStreamingDetails",
            id: ids.join(","),
          },
          fresh,
        );
        return data.items;
      } catch (err) {
        errors.push(err instanceof Error ? err : new Error("Unknown error."));
        return [];
      }
    })
  ).flat();

  const liveStreams: LiveStream[] = [];
  for (const item of videoItems) {
    const details = item.liveStreamingDetails;
    if (!details?.actualStartTime || details.actualEndTime) continue;

    const thumbnails = item.snippet.thumbnails;
    const thumbnailUrl =
      thumbnails.maxres?.url ??
      thumbnails.standard?.url ??
      thumbnails.high?.url ??
      thumbnails.medium?.url ??
      thumbnails.default?.url;

    if (!thumbnailUrl) continue;

    const streamer = streamerByChannelId.get(item.snippet.channelId);
    if (!streamer) continue;

    if (liveStreams.some((s) => s.channelId === streamer.channelId)) continue;

    liveStreams.push({
      channelId: streamer.channelId,
      streamerName: streamer.name,
      videoId: item.id,
      title: item.snippet.title,
      thumbnailUrl,
      startedAt: details.actualStartTime,
    });
  }

  if (liveStreams.length === 0 && errors.length > 0) {
    throw new Error(
      `Unable to query YouTube for live status. First error: ${errors[0].message}`,
    );
  }
  return liveStreams;
}
