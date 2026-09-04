-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists live_state (
  channel_id text primary key,
  streamer_name text not null,
  video_id text not null,
  title text,
  thumbnail_url text,
  started_at timestamptz,
  notified_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_state_updated_at_idx on live_state (updated_at desc);

-- Server cron uses the anon key; disable RLS for this internal state table.
alter table live_state disable row level security;

-- Optional: notification history
create table if not exists notification_log (
  id bigint generated always as identity primary key,
  channel_id text not null,
  streamer_name text not null,
  video_id text not null,
  title text,
  sent_at timestamptz not null default now()
);

alter table notification_log disable row level security;
