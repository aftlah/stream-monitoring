import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { LiveStateRow } from "@/types/supabase";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || url.trim().length === 0) {
    throw new Error("Missing SUPABASE_URL environment variable.");
  }
  if (!key || key.trim().length === 0) {
    throw new Error(
      "Missing SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable.",
    );
  }

  return { url: url.trim(), key: key.trim() };
}

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const { url, key } = getSupabaseConfig();
  client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return client;
}

export async function getAllLiveState(): Promise<LiveStateRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("live_state").select("*");
  if (error) {
    throw new Error(`Supabase live_state read failed: ${error.message}`);
  }
  return (data ?? []) as LiveStateRow[];
}

export async function upsertLiveState(row: {
  channelId: string;
  streamerName: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  startedAt?: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase.from("live_state").upsert(
    {
      channel_id: row.channelId,
      streamer_name: row.streamerName,
      video_id: row.videoId,
      title: row.title,
      thumbnail_url: row.thumbnailUrl,
      started_at: row.startedAt ?? null,
      updated_at: now,
    },
    { onConflict: "channel_id" },
  );
  if (error) {
    throw new Error(`Supabase live_state upsert failed: ${error.message}`);
  }
}

export async function deleteLiveState(channelIds: string[]): Promise<void> {
  if (channelIds.length === 0) return;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("live_state")
    .delete()
    .in("channel_id", channelIds);
  if (error) {
    throw new Error(`Supabase live_state delete failed: ${error.message}`);
  }
}

export async function logNotification(row: {
  channelId: string;
  streamerName: string;
  videoId: string;
  title: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("notification_log").insert({
    channel_id: row.channelId,
    streamer_name: row.streamerName,
    video_id: row.videoId,
    title: row.title,
  });
  if (error) {
    // Non-fatal: logging should not break the cron job
    console.error("Supabase notification_log insert failed:", error.message);
  }
}
