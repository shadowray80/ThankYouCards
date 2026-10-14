-- Homepage gallery entries point at real cards instead of holding a copy.
-- A gallery entry with a campaign_id is drawn live from that card; older entries (made in the
-- retired showcase builder) have none and keep their copied fields until they're removed.
-- Deleting a card removes its gallery entry.
alter table showcase_cards
  add column if not exists campaign_id uuid references campaigns(id) on delete cascade;

create unique index if not exists showcase_cards_campaign_id_key
  on showcase_cards (campaign_id) where campaign_id is not null;
