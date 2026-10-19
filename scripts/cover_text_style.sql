-- "Aa" cover text look: font, colour and outline of the name + cover message on the photo.
-- Nulls mean the default (white script, no outline), so existing cards look exactly as before.
alter table campaigns add column if not exists card_font text;
alter table campaigns add column if not exists card_text_color text;
alter table campaigns add column if not exists card_text_stroke boolean;

-- Solo card sign-off before the sender's name ("Love from", "Lots of love"…). Null = "From".
alter table campaigns add column if not exists card_sign_off text;
