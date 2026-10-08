-- Log of "Email the card" sends, used to rate-limit the feature (see
-- app/api/manage/[slug]/email/route.ts). Run once in the Supabase SQL editor.
create table if not exists public.card_emails (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  to_email    text not null,
  ip          text,
  created_at  timestamptz not null default now()
);

create index if not exists card_emails_campaign_idx on public.card_emails (campaign_id);
create index if not exists card_emails_created_idx  on public.card_emails (created_at);
create index if not exists card_emails_ip_idx       on public.card_emails (ip, created_at);

-- Only the server (service role) touches this table; no public access.
alter table public.card_emails enable row level security;
