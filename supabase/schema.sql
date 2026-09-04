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

create table if not exists notification_log (
  id bigint generated always as identity primary key,
  channel_id text not null,
  streamer_name text not null,
  video_id text not null,
  title text,
  sent_at timestamptz not null default now()
);

-- Cron uses SUPABASE_ANON_KEY — must allow inserts
alter table live_state disable row level security;
alter table notification_log disable row level security;

drop policy if exists "cron_all_live_state" on live_state;
create policy "cron_all_live_state"
  on live_state
  for all
  to anon, authenticated, service_role
  using (true)
  with check (true);

drop policy if exists "cron_all_notification_log" on notification_log;
create policy "cron_all_notification_log"
  on notification_log
  for all
  to anon, authenticated, service_role
  using (true)
  with check (true);
