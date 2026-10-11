-- "Superseded" cards: taken out of the library by a folder sync (see /admin/cards).
-- They're hidden from the picker and the main library view, and only come back via Restore.
-- Run once in the Supabase SQL editor.
alter table public.cards add column if not exists superseded_at timestamptz;
