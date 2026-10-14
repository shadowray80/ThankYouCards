# thankyoucards.au — Project Context

> Hand this file to any new Claude conversation (Claude Code or the Claude app). It covers everything needed to pick up the work.
> Last updated: 14 October 2026. Claude Code keeps this file current; re-upload it to the Claude app Project after changes.

---

## What the product is

**thankyoucards.au** is an Australian digital greeting card platform. People create beautiful digital cards for someone they care about, share a link so others can add messages, and then send the finished card to the recipient.

There are **two completely separate card types**:

| | Solo card | Group card |
|---|---|---|
| Who signs it | Just the sender | Multiple contributors |
| Cost | Free | $15 (Stripe) |
| Flow | Create → done, share link immediately | Create → share contributor link → pay → recipient gets link |
| Entry point | "Send a solo card" on home page | "Create a group card" on home page |
| Manage page? | No | Yes |

---

## Tech stack

- **Next.js 16** App Router (`app/` directory), client components with `'use client'`
- **Supabase** — PostgreSQL database + Storage (for uploaded images/logos)
- **Stripe** — payments for group cards only
- **Vercel** — hosting
- **TypeScript** throughout

---

## Card styles

Three styles currently live; Scrapbook is planned but not built.

| Style | View component | Notes |
|---|---|---|
| `classic` | `CardScrollView` | Scrollable card with cover photo, serif fonts |
| `casual` | `CasualView` | Masonry grid, colourful rotating cards, Dancing Script font |
| `corporate` | `CorporateView` | Split header (text left / photo right), navy & gold, serif typography, no rotations |

`card_style` is stored on the campaign. `card_palette` is either a named palette ID (`'navy'`, `'sky'`) or a hex colour string (`'#1A2744'`) for custom colours. Corporate and casual each have their own palette arrays in `lib/palettes.ts`.

---

## Key file map

### Views (full-page React components rendered from `app/page.tsx`)
```
views/HomeView.tsx          Home page — two entry buttons (solo / group)
views/SoloFlow.tsx          Solo card builder + done screen
views/GroupFlow.tsx         Group card builder (step 1 — creates card, goes to manage)
views/ContribView.tsx       Contributor adds their message to an existing group card
```

### Shared components worth knowing
```
components/cards/CardPicker.tsx     "Browse designs" accordion under the cover (filters + card grid).
                                    browseHeader/headerLead/headerAction props give the solo flow its
                                    toolbar: [Image only] [Browse designs ⌃] [📷]
components/forms/EmailCardForm.tsx  "✉️ Email the card" form (solo done screen + group dashboard)
components/ui/PreviewToggle.tsx     Preview switch, top-left of the cover (same spot in edit + preview)
components/ui/Nav.tsx               Site top bar on every page: logo, LoginMenu, MoreMenu (Organiser view,
                                    card code, contact). LoginForm is shared by LoginMenu and /organiser.
```

### App Router pages
```
app/page.tsx                 Root — renders HomeView
app/card/[slug]/page.tsx     Contributor entry point → renders ContribView
app/view/[slug]/page.tsx     Recipient views the finished card → ViewContent
app/view/[slug]/ViewContent.tsx  Actual card view logic. Under every card: Print card + Save to Photos (KeepsakeButtons)
app/print/[slug]/page.tsx    Printable A5 card on A4 landscape: double-sided (with "flip inside" switch) or
                             single-sided (cover sheet + inside sheet). components/print/PrintableCard.tsx +
                             lib/printLayout.ts (mm-exact layout; messages measured and packed into columns,
                             never split; text at the on-screen size (16px), extra inside sheets as needed). Landscape cover →
                             whole photo framed with names below; portrait → photo fills the front.
app/manage/[slug]/page.tsx   Organiser dashboard (GROUP CARDS ONLY). Site top bar + card switcher dropdown
                             (logged-in organiser's cards, Current/Previous) via lib/useMyCards + /api/my-cards
app/organiser/page.tsx       "Organiser view" (More menu): logged out → log-in form; logged in → newest card
```

### Card renderers
```
components/cards/CardScrollView.tsx   Classic card
components/cards/CasualView.tsx       Casual card
components/cards/CorporateView.tsx    Corporate card
```
All three accept `preview?: boolean` (lighter wrapper, used in manage page) and `noHeader?: boolean` (hides cover + footer, used in builder previews).

### API routes
```
app/api/campaigns/route.ts              POST — create a new campaign
app/api/campaigns/[slug]/route.ts       GET  — public campaign + contributions (for view/contrib pages)
app/api/manage/[slug]/route.ts          GET  — organiser view (requires token)
                                        PATCH actions: mark_sent | update_card | update_palette | update_logo
app/api/manage/[slug]/email/route.ts    POST — "Email the card": sends the card to the recipient via Resend
                                        (requires token, card must be sent, rate-limited — see below)
app/api/contributions/route.ts          POST — add a contribution to a campaign
app/api/contributions/[id]/route.ts     PATCH — update a contribution
app/api/upload/route.ts                 POST — upload file to Supabase Storage, returns { url }
app/api/checkout/send-card/route.ts     POST — create Stripe checkout session ($15) for group card
app/api/webhooks/stripe/route.ts        POST — Stripe webhook handler
```

### Library
```
lib/supabase.ts      supabaseAdmin client
lib/themes.ts        THEMES array — classic card themes (name, colour, images, frontMsg)
lib/palettes.ts      CASUAL_PALETTES, CORPORATE_PALETTES, buildCustomPalette(hex)
lib/email.ts         Resend emails: sendOrganiserLink, sendContactMessage, sendLoginLink, sendCardEmail
lib/cardEmail.ts     Occasion-aware subject + default message for "Email the card" (client + server)
lib/occasions.ts     OCCASIONS list for group cards (Birthday, Farewell, Retirement, Sympathy…)
lib/cardTaxonomy.ts  Card library categories/tags/sports used by CardPicker filters
```

### Admin + accounts
```
/admin, /admin/cards, /admin/showcase   Admin area (card library, home-page showcase). Access by ADMIN_EMAILS.
                                        Card library = `cards` bucket + `cards` table. "Sync from my folder"
                                        (pick Tim's culled PC folder → preview → confirm) uploads new files via
                                        signed URLs and moves cards missing from the folder to Superseded
                                        (`superseded_at`; hidden from picker, only back via Restore). "Delete
                                        forever" refuses if a campaign/showcase card uses the image.
Brand kits + email/password login      Corporate users save colours/logo. Log in with email + password
                                        (/api/auth/login); new account / forgot password = emailed link to
                                        /login/verify to choose a password (login_links, organiser_sessions,
                                        account_passwords, login_attempts, brand_kits tables)
```

---

## Database schema

### `campaigns`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | URL-safe unique identifier (`name-xxxxx`) |
| `organiser_token` | text | Secret that grants manage access |
| `recipient_name` | text | |
| `occasion` | text | Also used as "From" label |
| `card_theme` | text | Theme ID from `lib/themes.ts` (classic only) |
| `card_message` | text | Cover tagline / front message |
| `card_image_url` | text | Cover photo URL |
| `card_style` | text | `classic` \| `casual` \| `corporate` |
| `card_palette` | text | Palette ID or hex colour string |
| `card_logo_url` | text | Company logo (corporate cards) |
| `funded_amount` | int | Gift fund total (cents) |
| `target_amount` | int | Gift fund target (0 = card only) |
| `deadline` | date | Contributor deadline |
| `status` | text | `open` → `sent`. Only `sent` allows recipient to view card |
| `organiser_email` | text | Where organiser confirmation email goes |
| `card_occasion` | text | Group cards: what it's for (Birthday, Farewell…). Solo cards: null |
| `card_text_on_image` | bool | false = "Image only" cover (name/message not drawn on the photo) |
| `card_note` | text | Longer personal note (optional) |
| `card_accent`, `card_logo_url`, `card_logo_scale`, `card_logo_position` | | Corporate styling |

> ⚠️ Naming trap: the `occasion` column actually stores the **"From" text** shown on the card
> (e.g. "the Under 12s"). What the card is *for* lives in `card_occasion`.

**Solo vs group in the DB:** group cards always have a `deadline`; solo cards never do.

### Customer card showcase
Solo senders opt in with "Happy for us to feature this card (the cover and your message)" (`FeatureOptIn`,
unticked by default) → `campaigns.feature_ok`. Group cards can't opt in (contributors never agreed to their
messages being shared) — group examples on the homepage are made up in /admin/showcase. `/admin/customer-cards`
lists opted-in sent solo cards: Add to homepage (copies cover + sender's message into `showcase_cards`),
download an Instagram carousel (1080×1350: cover + message slide, `lib/instagramImage.ts`), dismiss.
Columns `feature_ok`, `feature_dismissed`, `feature_exported_at`, `feature_showcase_id` from
`scripts/customer_showcase.sql`.

### `card_emails`
Log of every "Email the card" send (`campaign_id`, `to_email`, `ip`, `created_at`), used for rate
limits. Created by `scripts/card_emails.sql` (already run in Supabase).

### Other tables
`cards` (card library), `showcase_cards`, `site_settings`, `brand_kits`, `login_links`, `organiser_sessions`,
`account_passwords` (scrypt hashes, `lib/passwords.ts`), `login_attempts` (failed-login rate limit) —
the last two from `scripts/account_passwords.sql` (already run).

### `contributions`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `campaign_id` | uuid | FK → campaigns |
| `contributor_name` | text | |
| `message` | text | Text message (nullable) |
| `photo_url` | text | Photo URL from Supabase Storage (nullable) |
| `photo_label` | text | Caption badge on photo (nullable) |
| `amount` | int | Gift contribution (cents, 0 for card-only) |
| `status` | text | `pending` \| `paid` |
| `stripe_payment_intent_id` | text | |
| `created_at` | timestamptz | |

Only contributions with `status = 'paid'` are shown on the card.

---

## The two card flows in detail

### Solo card flow
1. User hits "Send a solo card" → `SoloFlow` renders
2. They pick a card from the library ("Browse designs") or upload their own photo (📷), type the
   recipient name + cover message directly on the cover (or tap "Image only" to hide all cover text),
   then write their message
3. Hit "Continue → Send this card"
4. `handleSubmit` in `SoloFlow`:
   - POST `/api/campaigns` → creates campaign (`status: 'open'`)
   - POST `/api/contributions` → adds their message
   - PATCH `/api/manage/[slug]` with `action: mark_sent` → flips to `status: 'sent'` immediately
5. Done screen shown — sender either **Copies** the plain `/view/[slug]` link (texts/WhatsApp show
   the logo preview card) or uses **✉️ Email the card** to have the site email it
6. Recipient visits link → `ViewContent` checks `status === 'sent'` → shows card ✓

### Group card flow
1. User hits "Create a group card" → `GroupFlow` renders
2. They set up the card (style, palette, message, deadline, email)
3. Hit "Create card & get link →" → POST `/api/campaigns`
4. Redirected to `/manage/[slug]?token=...` (organiser dashboard)
5. Organiser copies the **contributor link** `/card/[slug]` and shares it
6. Contributors visit `/card/[slug]` → `ContribView` → POST `/api/contributions`
7. When ready: organiser clicks "Send the card — $15 →"
8. `handlePay` → POST `/api/checkout/send-card` → Stripe checkout ($15 AUD)
9. On success → Stripe redirects to `/manage/[slug]?token=...&paid=1`
10. Manage page fires `mark_sent` PATCH → awaits it → reloads dashboard
11. Organiser copies **recipient link** `/view/[slug]` or uses **✉️ Email the card** → recipient
12. Recipient visits → `ViewContent` → `status === 'sent'` → card shown ✓

---

## Recipient view logic (`ViewContent.tsx`)

```
/view/[slug]             → checks status === 'sent', shows card or waiting screen
/view/[slug]?preview=1   → bypasses status check (organiser preview from dashboard)
```

The "on its way" waiting screen shows when `status !== 'sent'` and `?preview=1` is absent.

---

## Manage page (`app/manage/[slug]/page.tsx`)

**Group cards only.** Access requires the `organiser_token` in the URL (`?token=...`).

Layout (top to bottom, redesigned 14 Oct — a dashboard people return to, before and after paying):
1. Teal header — card selector (dropdown when logged in), Signed / Days left (tap to change the deadline)
2. **Card preview** accordion — whole cover + card message, messages in a fixed window; footer expands all
3. **Ready when you are** block (no padlocks, no "unlock" wording; Tim wants it friendly and warm) — before paying: faded Send/Email/Print/Save + "Make it official · $15";
   after paying (Stripe returns here with ?paid=1): "Send it to <name>" (link, Copy, Share, Email the card) +
   Open full preview / Print / Save. Paying switches them on ("All set" chip); nothing is sent to the recipient automatically.
4. Share with contributors (Copy + native Share) — stays after paying (late messages allowed)
5. Contributors (time ago, ⋮ edit/remove, Add a message manually)
6. Send a reminder (Copy + Share)
7. Edit card (cover/messages/photo + library designs, text-on-photo switch saves instantly, colours, logo,
   brand template) — text fields + photo use Save changes
8. Your organiser link (+ one line: links were emailed)
All sections soft white; colour only on the header and main buttons.

PATCH actions available:
- `update_card` — saves card_message, card_note, occasion, card_image_url, card_text_on_image
- `update_cover_text` — saves card_text_on_image on its own (the instant switch)
- `update_deadline` — new deadline (must stay set, not in the past)
- `update_palette` — saves card_palette
- `update_logo` — saves card_logo_url
- `mark_sent` — flips status to 'sent'

---

## Important patterns and gotchas

- **`status: 'sent'` is the gate.** Until this is set, recipients see a waiting screen. Solo cards must call `mark_sent` immediately. Group cards need Stripe payment first.
- **`organiser_token` is secret.** The manage API requires it for all write operations. Never expose it to contributors.
- **Corporate palette dual-use.** `card_palette` stores either a named ID (`'navy'`) or a hex string (`'#1A2744'`). Use `buildCustomPalette(hex)` when it starts with `#`.
- **`noHeader` prop.** Pass to `CasualView`/`CorporateView` to hide the cover + footer. Used in GroupFlow so the builder renders its own editable header above the messages preview.
- **Supabase Storage bucket** for uploads is `contribution-photos` — reused for logos too. `/api/upload` returns `{ url: publicUrl }`.
- **Stripe webhook** handles `payment_intent.succeeded` for `send_card` type → sets `status: 'sent'`. The manage page `mark_sent` is a belt-and-braces fallback via `?paid=1` redirect.
- **`canCreate` in GroupFlow** requires `recip`, `occasion`, `deadline`, AND `organiserEmail` — all four needed before the create button is active.
- **Copy buttons copy the plain link only.** We tried copying rich HTML for email; on phones it
  pasted the bare cover photo into SMS and mangled emails. Plain links let iMessage/WhatsApp build the
  logo preview from the page's Open Graph tags (`app/view/[slug]/page.tsx` generateMetadata).
- **Email the card is site-sent, not paste-in** — the only way it looks right in every mail app
  (same approach as Jacquie Lawson). Sent as "<name> via thankyoucards.au", reply-to the sender,
  optional bcc copy. Limits: 10 per card, 20 per IP per day, 90 site-wide per day (Resend free plan is
  100/day). Fails closed if `card_emails` can't be read. Web links aren't allowed in the message.
- **Viewport has `maximumScale: 1`** (app/layout.tsx) to stop iPhone Safari zooming into small-font
  fields. Side effect: Android can't pinch-zoom.
- **On-cover text** (name/cover message) and its placeholder prompts are white with a soft 3-layer
  text-shadow so they read on any photo; keep the editor and the final card renderers in sync.
- **Print files and Save to Photos are made on the server** (`/api/render/print`, `/api/render/image`,
  `lib/renderBrowser.ts`): a real Chrome (puppeteer-core 24.4.0 + @sparticuz/chromium 133.0.0 on Vercel —
  keep the two versions in step; local Chrome in dev) opens `/print/[slug]?render=1` or `/view/[slug]` and
  captures it. Phones can't be trusted to draw the card themselves (iPhone Safari dropped photos/fonts and
  boosted text). The serverless Chrome has no emoji font: Noto Color Emoji is downloaded into `/tmp/fonts`
  at launch (NOT via the package's `font()` helper — that saves to $HOME/.fonts, which isn't scanned on
  Vercel). `next.config.ts` includes the chromium `bin/` files in the render functions.
- **AGENTS.md** note: this repo uses Next.js 16 with breaking changes from earlier versions. Always check `node_modules/next/dist/docs/` for current API.

---

## What's live / what's not

| Feature | Status |
|---|---|
| Solo card (create + view) | ✅ Live |
| Group card (create + manage + view) | ✅ Live |
| Classic / Casual / Corporate card styles | ✅ Live |
| Organiser dashboard (edit, palette, logo) | ✅ Live |
| Stripe payment for group cards | ✅ Live |
| Email to organiser on creation | ✅ Live (Resend) |
| Email the card (site-sent, Outlook-safe) | ✅ Live |
| Image-only covers | ✅ Live |
| Printable A5 card + Save to Photos (all styles) | ✅ Live |
| Brand kits + email/password login | ✅ Live |
| Gift cards | ❌ Dropped (removed from solo flow) — a different gift offering is planned |
| Scrapbook card style | 🔜 Planned |
| Contributor payment (gift contributions) | 🔜 Planned |
| ABN in Privacy Policy | ✅ Live |
| DNS / domain pointing to Vercel | ⚠️ Pending |

---

## Plans & ideas (Tim's roadmap)

### The guiding idea — "Pellegrini's"
Like Pellegrini's in Melbourne: a short menu, every item excellent. Few card designs that are all
great, a handful of gifts that are all great, a site that feels premium (as if Apple made it).
Less is more.

### Phase 1 — NOW: a solid website, then get it out there
1. **Card designs** Tim is happy with (pipeline → "Sync from my folder" on /admin/cards). Christmas set.
2. **Design refresh** — make it look premium, not AI-made. Tim has the full list in Anytype. Headlines:
   desktop layout (currently a phone column on desktop), drop rainbow pastel boxes / gradients,
   remaining emojis, "→" on every button, made-up-looking testimonials, Nunito everywhere, tiny pale
   text, no home-page footer. **Discuss each change with Tim before editing.**
3. **Proper email** (`tim@`/`hello@thankyoucards.au`) — free first: Crazy Domains email forwarding or
   Zoho Mail free plan; Google Workspace later. Root domain has no MX yet; Resend uses `send.` so no clash.
4. **Promotion** — Instagram (customer showcase exports 1080×1350 posts), testimonials from real cards
   (Coach Matt).
5. ~~Better printable version~~ — done 12 Oct: printable A5 card + Save to Photos. Later: a "post a printed
   card" option via a print-on-demand company (same mm layout + 3mm bleed, A5 pages, their page order).

### To-do pile (agreed 14 Oct, not started) — premium, intuitive, flexible
**Organiser page redesign — DONE 14 Oct** (built from Tim's mock-up; notes kept for reference).
Accordions in components/dashboard/DashboardParts.tsx; placeholder line icons (print/open/share/
refresh/bell/lock) until Tim draws his own. Reminder stays copy/share (we can't know who hasn't signed).
**Organiser page redesign** (it's a dashboard people come back to, not a step-by-step form):
- Compact teal header: card selector (title + "Appreciation · 12 October"; dropdown only when logged in),
  Signed / Days left counters inside it, small Refresh icon. Drop the "ORGANISER VIEW" pill.
- Order: overview → card preview (Open full preview; Print/Save quietly beside it) → invite contributors
  (Copy + native Share button) → contributors with the reminder inside → Edit card **collapsed** (cover,
  message, photo, colours, logo, brand template inside it) → Send the card for $15 → extras (organiser link).
- After payment the "Ready to send" block (recipient link + Email the card) moves up under the header; everything
  stays editable and the contributor link/reminder stay (late messages allowed — done 14 Oct).
- Clearer pay wording: "Pay $15 to send the card to Lance. People can still add messages afterwards."
- Admin toolbar (Tim only) → one compact "Admin ▾" menu; it overflows on iPhone.
- Confirmation-email note: shrink to one line near the bottom (or remove) — Tim to decide.

**Exports: lock exporting, not viewing — remove the preview watermark — DONE 14 Oct**
(exportAllowed() in lib/renderPage.ts; KeepsakeButtons `locked`; print page shows "Ready to print once the card is finished"):
- Previews always full and clean. Solo: Print/Save free. Group: Print/Save switch on when the card is paid/sent
  (faded until then). Print & Post later = paid add-on for both.
- Enforce on the server: /api/render/* refuse unpaid group cards (not just hidden buttons).

**Solo cards in "My cards"**: solo cards made while logged in remember the account; Organiser view / My cards
lists them as Sent (opens the card with Print/Save, no organiser page). Ties into birthday reminders later.

**Later — event cards**: golf day, Christmas party, birthday… a QR code at the event, a live view (e.g. on a TV),
messages/in-jokes/photos added during it, and a keepsake for everyone who was there (photo-heavy print layout).
Cards are living things, not frozen at payment — keep designing that way.
Plus: let **recipients / attendees order a printed copy** (print-on-demand) themselves — a big event could
mean many paid prints. Ties in with the "post a printed card" idea (same mm layout + bleed).

**Small leftovers**: printed solo inside to match the screen (centred italic message, "From Tim", no box);
style-picker descriptions still say "masonry"; home page "Handwrite it if you want" still uses pencil.png.

### Phase 2 — the gift shelf ("Add a little something")
**End product:** a small shelf of 6–12 hand-picked gifts, mostly for **solo** card senders, shown on the
"Your card is ready" screen (and maybe a Gifts page). Categories: coffee, chocolate, skincare, drinks,
something for kids, a few-months subscription. Each tile: photo, name, brand, price, who delivers it.
Clear, honest labelling of partner brands. Managed by Tim from an admin page.

**Two kinds of gift on the same shelf:**
- **Sold on our site (preferred, "seamless"):** customer pays once in our checkout (card + gift),
  enters the address once; we email/send the order to the partner, who packs and ships Australia-wide.
  We buy at a wholesale/partner price and keep the margin. We're the seller (consumer law, refunds,
  "where's my parcel"). Normal Stripe e-commerce — no crowdfunding approval needed.
  **Not alcohol** — selling booze through our checkout needs a liquor licence.
- **Affiliate link-out:** customer buys on the brand's own site; we earn a commission (a few %), paid
  weeks later. Use for alcohol and anything we can't get a partner deal on.

**Finding partners (Australia-wide):** look for brands that already offer "corporate gifting" (they
already ship on someone else's behalf); coffee roasters (subscriptions too); small Aussie skincare/candle
brands; hamper companies. Ask for "dropship / gift fulfilment": ships Australia-wide with tracking,
dispatch in 1–2 days, gift-ready packaging, no price in the box, partner price invoiced monthly.
Beware chocolate in summer heat (Christmas!). Claude can draft the outreach email.

**Affiliate networks (for link-outs):** Commission Factory (Australian, part of Awin; free for affiliates;
$5 refundable card hold; review ≤3 business days; $50 payout minimum; public advertiser directory at
commissionfactory.com/advertiser-directory — check it actually has alcohol brands before signing up).
Also Awin and Impact (RedBalloon uses Impact). Tracking: the click sets a cookie (often 30 days, last
click wins, same device only); exclusive discount codes credit us regardless of device — ask brands for
one. Self-referral (buying through our own link) is banned, so affiliate only works when the customer buys.

### Phase 3 — group money collection (needs Stripe's written OK first)
Goal: Sarah collects $20 × 20 for Coach Pete with a progress bar; the pool pays the $15 card fee; the
rest buys a gift (ours, an affiliate one, or anything she likes).
- Plan: **Stripe Connect** — contributions go into **the organiser's own Stripe account** (Stripe does
  ID checks, holds and pays out); we take the card fee as a platform fee. We never hold the money.
- **Organiser chooses the gift up front.** Avoid "recipient chooses later" (that's a stored-value /
  gift-card-like fund — the ASIC territory Zai warned about) and avoid us buying with the pool (kills
  the affiliate commission).
- Prepaid Visa cards: no (gift cards again, fees, we'd hold money, no commission).
- Before building: email Stripe (Claude can draft) + one call with a payments/fintech lawyer.
- Bridge until then: show the organiser's PayID with an "I've chipped in" tick on the same screens.
- Competitor to watch: GroupTogether (AU) — collections + cards; earns on fees (contributor %, cash
  withdrawal %) and gift cards. Industry pattern: fees on the collection are the dependable income;
  gifts/affiliates are the extra. Our difference: real gifts, not gift cards.

### Later
- Christmas extras: scheduled sending ("deliver 25 Dec, 8am"), Christmas category — also the base for
  reminders below.
- UK / overseas gifting (Tim's own pain: UK relatives at Christmas) — maybe a tested "gifts to the UK
  from Australia" guide via Awin UK brands. Not now; stay Australian first.

**Big idea — "Never forget Mum's birthday" reminders:**
- Users save people + dates in their account (Mum, wife, anniversary…).
- Before each date the site **texts them** (SMS, they give their number) and emails: "Mum's birthday
  is next Thursday — we've picked a card + gift. Tap to send it." One tap, pay (e.g. $59.95), and the
  card goes out on the day.
- Pitch: "Don't be the one who forgot Mum's birthday."
- Stage 1 (before gifts are ready): saved dates, reminders, scheduled sending on the day.
  Stage 2: gift suggestions + one-tap paid "yes" with a Stripe-saved card.
- Needs: a daily scheduled job (Vercel cron), SMS provider (e.g. Twilio, sender ID "TYCards"),
  Spam Act 2003 compliance (clear opt-in, identify sender, "Reply STOP"), Privacy Policy update for
  storing birthdays, price shown clearly before any charge.

