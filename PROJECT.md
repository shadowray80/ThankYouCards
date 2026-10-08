# thankyoucards.au — Project Context

> Hand this file to any new Claude conversation (Claude Code or the Claude app). It covers everything needed to pick up the work.
> Last updated: 8 October 2026. Claude Code keeps this file current; re-upload it to the Claude app Project after changes.

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
```

### App Router pages
```
app/page.tsx                 Root — renders HomeView
app/card/[slug]/page.tsx     Contributor entry point → renders ContribView
app/view/[slug]/page.tsx     Recipient views the finished card → ViewContent
app/view/[slug]/ViewContent.tsx  Actual card view logic
app/manage/[slug]/page.tsx   Organiser dashboard (GROUP CARDS ONLY)
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
/admin, /admin/cards, /admin/showcase   Admin area (card library synced from Supabase Storage,
                                        home-page showcase). Access by ADMIN_EMAILS.
Brand kits + magic-link login           Corporate users save colours/logo; login by emailed link
                                        (login_links, organiser_sessions, brand_kits tables)
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

### `card_emails`
Log of every "Email the card" send (`campaign_id`, `to_email`, `ip`, `created_at`), used for rate
limits. Created by `scripts/card_emails.sql` (already run in Supabase).

### Other tables
`cards` (card library), `showcase_cards`, `site_settings`, `brand_kits`, `login_links`, `organiser_sessions`.

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

Sections (top to bottom):
1. Header with status badge + refresh button
2. "Ready to send" section (shown after sending) — recipient link Copy button + ✉️ Email the card
3. Email confirmation notice
4. Stats (contributors, days left)
5. Contributor share link (shown before sending)
6. Card preview (live, updates on save)
7. **Edit card** — card message, from text, cover photo
8. **Header colour** (corporate only) — palette swatches + custom colour picker
9. **Company logo** (corporate only) — upload/replace/remove
10. Contributors list
11. **Send the card — $15 →** button (shown before sending)
12. Organiser link (bookmark/return access)

PATCH actions available:
- `update_card` — saves card_message, occasion, card_image_url
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
| Printable keepsake (casual + corporate) | ✅ Live — needs a better layout (see Plans) |
| Brand kits + magic-link login | ✅ Live |
| Gift cards | ❌ Dropped (removed from solo flow) — a different gift offering is planned |
| Scrapbook card style | 🔜 Planned |
| Contributor payment (gift contributions) | 🔜 Planned |
| ABN in Privacy Policy | ✅ Live |
| DNS / domain pointing to Vercel | ⚠️ Pending |

---

## Plans & ideas (Tim's roadmap)

**Next up, in order:**
1. **More card designs** Tim is happy with (library via /admin/cards).
2. **Better printable version** — idea: one tall strip laid out like the phone view (cover on top,
   messages flowing down), set out well for A4. Watch for page breaks splitting a message.
3. **Find partners** — especially for the gift side.

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

