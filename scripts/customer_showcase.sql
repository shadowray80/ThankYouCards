-- Customer card showcase (see /admin/customer-cards). Senders opt in to having the card's
-- cover (never the messages) featured on the site and Instagram. Run once in the Supabase SQL editor.
alter table public.campaigns add column if not exists feature_ok           boolean not null default false;
alter table public.campaigns add column if not exists feature_dismissed    boolean not null default false;
alter table public.campaigns add column if not exists feature_exported_at  timestamptz;
alter table public.campaigns add column if not exists feature_showcase_id  uuid;
