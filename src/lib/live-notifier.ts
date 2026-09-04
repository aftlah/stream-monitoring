import { sendLiveNotification } from "@/lib/discord";
import { getMonitoredStreamers } from "@/lib/streamers";
import {
  deleteLiveState,
  getAllLiveState,
  logNotification,
  upsertLiveState,
} from "@/lib/supabase";
import { getLiveStreamsForStreamersFresh } from "@/lib/youtube";
import type { LiveStream } from "@/types/live-stream";

export type LiveNotifyResult = {
  checked: number;
  liveNow: number;
  notified: string[];
  ended: string[];
};

function shouldNotify(
  stream: LiveStream,
  previousVideoId: string | undefined,
): boolean {
  if (!previousVideoId) return true;
  return previousVideoId !== stream.videoId;
}

export async function runLiveNotificationCheck(): Promise<LiveNotifyResult> {
  const streamers = await getMonitoredStreamers();
  const liveStreams = await getLiveStreamsForStreamersFresh(streamers);
  const previousState = await getAllLiveState();

  const previousByChannel = new Map(
    previousState.map((row) => [row.channel_id, row.video_id] as const),
  );
  const liveChannelIds = new Set(liveStreams.map((s) => s.channelId));

  const notified: string[] = [];

  for (const stream of liveStreams) {
    const previousVideoId = previousByChannel.get(stream.channelId);
    if (!shouldNotify(stream, previousVideoId)) {
      await upsertLiveState({
        channelId: stream.channelId,
        streamerName: stream.streamerName,
        videoId: stream.videoId,
        title: stream.title,
        thumbnailUrl: stream.thumbnailUrl,
        startedAt: stream.startedAt,
      });
      continue;
    }

    await sendLiveNotification(stream);
    await upsertLiveState({
      channelId: stream.channelId,
      streamerName: stream.streamerName,
      videoId: stream.videoId,
      title: stream.title,
      thumbnailUrl: stream.thumbnailUrl,
      startedAt: stream.startedAt,
    });
    await logNotification({
      channelId: stream.channelId,
      streamerName: stream.streamerName,
      videoId: stream.videoId,
      title: stream.title,
    });
    notified.push(stream.streamerName);
  }

  const ended = previousState
    .filter((row) => !liveChannelIds.has(row.channel_id))
    .map((row) => row.streamer_name);

  if (ended.length > 0) {
    await deleteLiveState(
      previousState
        .filter((row) => !liveChannelIds.has(row.channel_id))
        .map((row) => row.channel_id),
    );
  }

  return {
    checked: streamers.length,
    liveNow: liveStreams.length,
    notified,
    ended,
  };
}
