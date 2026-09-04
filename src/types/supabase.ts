export type LiveStateRow = {
  channel_id: string;
  streamer_name: string;
  video_id: string;
  title: string | null;
  thumbnail_url: string | null;
  started_at: string | null;
  notified_at: string;
  updated_at: string;
};

export type NotificationLogRow = {
  id: number;
  channel_id: string;
  streamer_name: string;
  video_id: string;
  title: string | null;
  sent_at: string;
};
