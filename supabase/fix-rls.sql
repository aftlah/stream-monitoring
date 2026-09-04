-- PASTE THIS in Supabase → SQL Editor → Run
-- Fixes: "new row violates row-level security policy for table live_state"

-- A) Allow anon/authenticated to read+write (cron uses ANON key)
drop policy if exists "cron_all_live_state" on public.live_state;
create policy "cron_all_live_state"
  on public.live_state
  for all
  to anon, authenticated, service_role
  using (true)
  with check (true);

drop policy if exists "cron_all_notification_log" on public.notification_log;
create policy "cron_all_notification_log"
  on public.notification_log
  for all
  to anon, authenticated, service_role
  using (true)
  with check (true);

-- B) Or turn RLS off entirely for these internal tables
alter table public.live_state disable row level security;
alter table public.notification_log disable row level security;
