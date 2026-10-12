-- One login session per device instead of one per email (run 12 Oct 2026). Before this, logging
-- in on one device silently replaced the session on every other device.
alter table public.organiser_sessions drop constraint if exists organiser_sessions_pkey;
alter table public.organiser_sessions drop constraint if exists organiser_sessions_email_key;
alter table public.organiser_sessions add primary key (session_token);
create index if not exists organiser_sessions_email_idx on public.organiser_sessions (email);
