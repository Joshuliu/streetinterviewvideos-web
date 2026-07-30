# StreetInterviewVideos.com — Working Rules for Claude

This file is **required reading** at the start of every session in this repo.
Read it fully before touching any UI, CSS, or layout code.

---

## Why this file exists

Past sessions have repeatedly shipped changes that look fine on desktop and
broken on mobile. The user's quote: "site looks shit on mobile again. how do I
make sure u stop breaking the mobile version, develop a skill or something?"

This file is that skill. The rules below are not suggestions — they are the
acceptance bar for any layout, CSS, or component change.

---

## Mobile is the default

The site's primary surface is a phone. Real visitors are on iPhones and
Androids — 320–430px viewports — coming in from TikTok / Instagram / Meta
links. Desktop is the secondary surface.

**Default viewport assumption when designing or auditing any new section:**
375 × 812 (iPhone reference). If it works there, it works on bigger phones
too. If you want to be paranoid, also check 320 (iPhone SE).

---

## Anti-patterns that have shipped before

These are real bugs that have hit production. Watch for them on every change.

### 1. Floating nav with no backdrop

The site uses a `position: fixed` floating nav (`.nav-hanging` in
`app/globals.css`) with hanging-sign chrome. It sits over page content as the
user scrolls.

- The nav is **intentionally always transparent** on every page. A scrolled
  backdrop (`.nav-hanging.is-scrolled` + a `scrollY > 60` toggle) used to exist
  but was **deliberately removed** — the frosted/solid backdrop looked bad over
  white sections. Do not re-add a global backdrop without a design that reads
  well on light pages; the prior attempts did not. The transient overlap of a
  heading passing under the brand sign on scroll is considered **acceptable**,
  not a bug to chase. (A scoped dark scrim was tried on `/qualify` and reverted
  for the same reason — it solved a non-issue.)
- The ONE thing that IS a real bug: content **permanently stuck behind the nav
  with no way to scroll to it**. That only happens if a page's first content
  starts under the nav (< ~65px) with no scroll room. Every page clears this
  via top padding — `main > section:first-of-type > .section-body` gets `7rem`
  / `8rem` (lg), and the `/qualify` funnel uses its own `pt-36` / `lg:pt-40`.
  Keep that clearance; that's the actual acceptance bar here, not the cosmetic
  overlap.

### 2. `whitespace-nowrap` on long titles

Any element with `white-space: nowrap` that contains a multi-word title is a
mobile overflow waiting to happen.

- Brand plate: `.hang-plate` has `white-space: nowrap` — tightly tuned. Do
  not add new long-text plates without a mobile font-size override.
- Compare card titles: `.compare-card h3.compare-title` has
  `white-space: nowrap` desktop, `normal` on mobile (already in CSS). Do not
  remove the mobile override.

### 3. Fixed pixel widths

Avoid `min-w-[NNNpx]`, `w-[NNNpx]` on anything in the page flow. Use
`max-w-*` Tailwind classes (which cap on big screens but allow shrinking on
small screens).

### 4. Horizontal-scrolling marquees without `overflow-x: hidden`

The `LogoStrip` is wider than the viewport on purpose — its parent has
`overflow-hidden`. Any new horizontally-scrolling content (carousels,
tickers, marquees) **must** have an `overflow-x: hidden` parent.

Also: **marquee images must use `loading="eager"`, never `loading="lazy"`.**
The marquee duplicates its track (`[...items, ...items]`) and animates `-50%`
for a seamless loop, so it's far wider than the viewport. Lazy-loading keys
off layout position, so the off-screen copies (the entire duplicated half,
plus anything past the right edge) never load — you get **missing logos** AND
a narrower second half that breaks the `-50%` loop, producing a visible
**jump/"refresh"** every cycle. Eager-loading makes both halves identical so
the loop is seamless. (This shipped as a bug twice before it was found.)

### 5. Long uninterrupted strings

URLs, file names, large numbers without separators, code snippets — all of
them can blow out a card on mobile. Use `break-words` or `overflow-wrap:
anywhere` on containers that might receive user-generated or unpredictable
text.

### 6. Display-1 / Display-2 H1s in narrow grids

The display fonts are huge. An H1 inside `lg:col-span-7` with a 5/7 split
layout is fine, but the same H1 inside a card or `lg:col-span-4` is going to
stack into 6 lines on mobile and look broken.

### 7. Desktop nav overflow at narrow laptop widths

The hanging-sign desktop nav in `components/NavBar.tsx` shows 8 signs in one
row at `lg:` (≥1024px): brand wordmark + 6 nav links + "Book a Call" CTA.
The brand sign alone is ~297px wide at full size because
"StreetInterviewVideos.com" is a long name. Without intervention, the CTA
slides past the right edge on 13"–15" laptops.

The fix is layered:

1. **A `@media (min-width: 1024px) and (max-width: 1439.95px)` rule in
   `app/globals.css`** shrinks all hanging plates (`.hang-plate`,
   `.hang-plate--brand`, `.hang-plate--cta`) — smaller fonts, smaller
   padding. This covers all common laptop widths up to a 15" MacBook.
2. **NavBar row uses `lg:px-5 xl:px-10` and `gap-2 lg:gap-2 xl:gap-3`** —
   tight container padding + tight parent gap at `lg`.
3. **Inner nav uses `lg:flex items-start gap-1 xl:gap-3`** — 4px between
   nav links at `lg`, 12px at `xl`.

If you change the nav (add a link, rename a link to something longer, swap
the brand wordmark), verify the CTA `[data-cta="nav-book"]` right edge at
1024, 1280, 1366, 1440, and 1536 viewport widths. Renaming "Work" → 
"Portfolio" was the change that forced the layered fix; the old single
media query (1024–1279 only) wasn't enough because the longer label
overflowed at 1280–1440 too.

If you outgrow this approach (e.g., adding a 7th nav link), the cleanest
escape hatches are: drop a link, move the desktop breakpoint to `xl:`
(forces 1024–1279 to the hamburger), or shrink the brand wordmark globally.

### 8. Hero locked to viewport height clips on short laptops

The homepage hero (`app/page.tsx`) holds a kicker, a display-1 headline,
a lead paragraph, two CTA buttons, and a 3-up stats row. That stack is
~700px tall at lg sizes, which doesn't fit inside a `h-[100svh]` section
on shorter laptop screens (13" MacBook ~600–700px viewport height after
browser chrome). Combined with `overflow-hidden`, this clips the CTAs
and stats at the bottom.

- The hero must use `min-h-[100svh]`, NOT `h-[100svh]`. With min-h the
  section grows to fit content on short screens; with h it locks to
  viewport and clips.
- Sized tightening (`[@media(max-height:760px)]:pt-20`, smaller
  headline, smaller margins) helps fit more often but is a safety net,
  not a substitute for `min-h`.
- The text font-sizes are `clamp()`-based on viewport WIDTH, so they
  don't shrink when only height drops. Any short-height fixes need
  explicit max-height media queries.

### 9. Redefining next/font CSS variables anywhere in CSS

`--font-display` / `--font-sans` are set by next/font via `.variable`
classNames on `<html>`. A `:root { --font-display: Impact, ... }` "fallback"
has the SAME specificity as those classes, so whichever lands later in the
bundled CSS wins — and bundle order shifts when layouts/route groups change.
This shipped once (July 2026): the `(marketing)` route-group refactor flipped
the order and the whole site silently rendered in Impact instead of Bungee.

- Never define `--font-display` / `--font-sans` in any stylesheet. Put
  fallbacks inside the usage: `font-family: var(--font-display, Impact,
  'Oswald', sans-serif);`.
- Font regressions don't show up in overflow checks — when touching layouts,
  route groups, or globals.css, eyeball a headline (Bungee is unmistakable:
  chunky, rounded, uppercase-only) or assert
  `getComputedStyle(document.querySelector('h1')).fontFamily` starts with
  `__Bungee`.

### 10. Form fields under 16px font-size trigger iOS Safari zoom

Any input/select/textarea with a computed font-size below 16px makes iOS
Safari ZOOM THE PAGE when the field is focused. The page then pans
horizontally and buttons hang off the right edge — it looks exactly like a
layout overflow bug, but no overflow audit will catch it (the layout is
fine; the viewport is scaled). Shipped once on the CRM task list (July
2026): the add-task input was text-sm, so tapping it on Neil's iPhone
shoved the Done button off screen.

- Every form field that renders on mobile must be at least 16px at the
  default breakpoint: `text-base sm:text-sm` (or `sm:text-xs` for compact
  desktop fields), never bare `text-sm`/`text-xs` on an input.
- Do NOT "fix" this with `maximum-scale=1` in the viewport meta — it breaks
  pinch-zoom accessibility.

---

## Self-audit checklist — run BEFORE marking work done

If you added or changed a layout / section / component, you must verify
mobile manually before committing. Skipping this is the exact failure mode
this file exists to prevent.

### The 5-step mobile check

1. **Start the preview**
   ```
   mcp__Claude_Preview__preview_start  →  name: "site"
   ```

2. **Resize to mobile**
   ```
   mcp__Claude_Preview__preview_resize  →  preset: "mobile"  (375 × 812)
   ```

3. **Audit horizontal overflow** — eval this in the page after navigating
   to any page you changed:
   ```js
   (() => {
     const html = document.documentElement, body = document.body;
     const overflows = [];
     for (const el of document.querySelectorAll('*')) {
       const r = el.getBoundingClientRect();
       const cls = (typeof el.className === 'string' ? el.className : (el.className?.baseVal || ''));
       if (cls.includes('marquee-track')) continue;
       let p = el.parentElement, contained = false;
       while (p) {
         const pcs = getComputedStyle(p);
         if (pcs.overflowX === 'hidden' || pcs.overflow === 'hidden') { contained = true; break; }
         p = p.parentElement;
       }
       if (contained) continue;
       if (r.right > window.innerWidth + 1 || r.left < -1) {
         overflows.push({ tag: el.tagName, cls: cls.slice(0,80), left: Math.round(r.left), right: Math.round(r.right) });
         if (overflows.length > 10) break;
       }
     }
     return { viewport: window.innerWidth, bodyScrollWidth: body.scrollWidth, overflows };
   })()
   ```
   Pass = `bodyScrollWidth === viewport` and `overflows: []`.

4. **Visual screenshot** of every page with a new section. Scroll into the
   middle of the page (not just the top) so you see how the floating nav
   interacts with H2 headings.

5. **Open the mobile menu** (click the hamburger) and verify the close
   button is visible and the menu items are readable.

### Sections this matters MOST for

- Anything using `lg:grid-cols-12` with a 5/7 or 4/8 split — verify the
  small-side column doesn't push the page wider than viewport on mobile.
- Anything inside `<Section>` that wasn't already mobile-tested.
- Anything using new Tailwind utility classes you haven't used in this
  repo before.
- Card grids with fixed inner padding (`p-6 lg:p-7`) — verify text doesn't
  clip.

---

## Layout patterns that are known-good on mobile

When in doubt, copy these patterns from existing code rather than inventing
new ones.

### Two-column section with stacked-on-mobile behavior
```jsx
<Section>
  <div className="grid lg:grid-cols-12 gap-10">
    <div className="lg:col-span-5">
      <Eyebrow>...</Eyebrow>
      <H2 className="mt-4">...</H2>
    </div>
    <div className="lg:col-span-7 space-y-4">
      <p className="text-lead text-text-700">...</p>
    </div>
  </div>
</Section>
```
Works because `grid` with no template on mobile = 1 column.

### Card grid that scales 1 → 2 → 3 columns
```jsx
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
  {items.map(...)}
</div>
```

### Numbered/labeled list with circular markers
```jsx
<ol className="space-y-5">
  <li className="flex gap-5 items-start">
    <div className="shrink-0 h-9 w-9 rounded-full bg-accent text-white font-extrabold flex items-center justify-center text-sm">
      1
    </div>
    <div>...</div>
  </li>
</ol>
```
The `shrink-0` on the circle is critical — without it the circle deforms
when text is long.

---

## Backgrounds: alternate light / dark to keep the page from going flat

Standard pattern:
- White (no className)
- `bg-paper-soft` (warm off-white)
- `dark` prop on `Section` (ink-900 with white text)

Two whites in a row reads as one section. Two paper-softs in a row reads as
one section. Always alternate when adding a new section to a page.

---

## Brand voice

- Short sentences. No filler intros.
- "Real people. Real reactions." is the brand line — the rest of the site
  voice ladders to that energy.
- No "In today's fast-paced digital landscape..." style throat-clearing.
- No emojis in headlines. Emojis in body copy only when quoting customer
  reviews verbatim.
- No exclamation marks in marketing copy (acceptable in customer review
  quotes).
- "As little as 5–10 days" — never just "5–10 days" unstated, because that's
  the fastest path, not the average.

---

## CRM (team. / studio. subdomains)

Full requirements: `docs/crm_requirements.md` (required reading before CRM
work). Architecture in brief: one app, host-routed by `middleware.ts` —
`team.streetinterviewvideos.com` → `app/team` (internal CRM),
`studio.streetinterviewvideos.com` → `app/studio` (read-only client tracker).
Marketing pages live in `app/(marketing)/` with the chrome in that group's
layout; the root layout is bare. Order status is DERIVED from milestones
(`lib/crm/status.ts`), never stored. Engine mutations + invariants:
`lib/crm/engine.ts`, smoke-tested by `scripts/crm-engine-smoke.ts` (run with
`set -a; source .env.local; set +a; npx tsx scripts/crm-engine-smoke.ts`).

Meetings (added 2026-07-29): one `lead_meetings` row per call (follow-ups get
their own row, plus its task-board position). Calendly is the source of truth
— `lib/crm/calendly.ts` polls the Calendly API and upserts on the event URI;
`/api/calendly-sync` (auth: `CALENDLY_SYNC_SECRET`, header `x-sync-key`) is
pinged every 5 minutes by the auto-guests Apps Script
(`scripts/calendly-auto-guests.gs`, script property `CRM_SYNC_KEY`; the URL
must be the canonical `www` one with a trailing slash, or the redirect turns
the POST into a GET). So: never hand-create meetings for Calendly bookings
(the sync does), never delete a Calendly-URI meeting row (the sync recreates
it — cancel in Calendly instead), and lead status "booked" derives from having
a non-canceled meeting row, NOT from `qualified` (an unqualified form answer
plus a booked call = booked, on purpose).

**A lead row is the PERSON record, before and after conversion.** Conversion
only stamps `converted_account_id`; the lead and everything hanging off it
survives. So:

- Internal notes are ONE stream per person (`notes`, with nullable
  `account_id` XOR `lead_id`, `lib/crm/notes.ts`). Written on a lead they stay
  on the lead; the client page reads account notes UNION its linked leads'
  notes. Do not add a second notes mechanism — per-meeting notes on
  `lead_meetings` were exactly that and got folded back in (2026-07-29). The
  `onboarding_forms` answers are a different thing: that's the client-facing
  brief, not internal history.
- Anything that lists meetings or notes must NOT filter on
  `converted_account_id`. A client still has calls; filtering them made a
  client's kickoff call vanish from Neil's board (2026-07-29). Filter on
  `archived_at` and `canceled_at` instead.
- A client with no lead row (created via New Client) gets one minted on demand
  (`personLeadId` in team actions, and the Calendly sync does the same when an
  invitee email matches a studio login) so their calls have an owner.

Hard-won gotchas:

- **Never call `redirect()` inside a server action.** A server-action
  redirect renders the target path internally WITHOUT re-running the
  host-rewrite middleware, so on team./studio. it 404s into the marketing
  not-found page. Instead: the action returns the destination (or an error)
  and a client component does `router.push(...)`. Plain render-time
  `redirect()` (layouts/pages) is fine — that's a real HTTP redirect.
- **Never run `npm run build` while the dev server is running.** Both write
  `.next/`; the prod build corrupts the dev server's incremental state and
  every page starts throwing "Cannot find module './NNN.js'". Stop the dev
  server first (or `rm -rf .next` and restart it after).
- Local dev hosts: `team.localhost:3000` / `studio.localhost:3000` (browsers
  resolve `*.localhost` natively). With no `RESEND_API_KEY` in `.env.local`,
  OTP codes print in the dev-server console (`[auth] DEV MODE`).
- Prod and local dev currently share the same Neon DB (the Vercel Neon
  integration's `DATABASE_URL`). Anything you create locally is visible to
  production clients — keep test data on obviously-fake accounts. Corollary:
  a schema migration hits prod INSTANTLY while the deployed code is still
  old, so migrations must be non-breaking for the currently-deployed code
  (add + copy now, drop columns in a later migration after the deploy).
  Pending drops, all orphaned on 2026-07-29 and safe to remove in one
  migration once that day's two deploys are live: `leads.meeting_at`,
  `leads.position`, `leads.calendly_event_uri`, `leads.calendly_invitee_uri`
  (data moved to `lead_meetings` in 0006) and `lead_meetings.notes` (moved to
  `notes` in 0007). Nothing in the codebase reads any of them.

---

## File / data conventions

- `lib/site.ts` — single source of truth for SITE name, URL, CTA copy,
  PUBLIC_PATHS allowlist (15 paths), `filterPublicLinks()`. Do not bypass
  PUBLIC_PATHS when adding any sitemap, navigation, or internal-link block.
- `lib/services.ts` — 17 service entries. Only 5 are publicly indexable
  (the slugs in `PUBLIC_SERVICE_SLUGS` in `app/services/[slug]/page.tsx`).
  Adding a new public service requires updating the allowlist there too.
- `lib/faq.ts` — categorized FAQ data. Improving an existing answer is
  preferred over adding a new question.
- `lib/work.ts` — portfolio video metadata.
- **Portfolio video ingest** — library spec is h264 720x1280 yuv420p +
  faststart, poster JPEG at ~1s. BEFORE transcoding, probe the source:
  `ffprobe -show_entries stream=color_transfer <src>`. If it is not
  `bt709` (iPhone HDR sources show `arib-std-b67` HLG or `smpte2084` PQ),
  tonemap FIRST with Apple's converter, then transcode from that output:
  `avconvert -p PresetHighestQuality -s <src> -o sdr.mov`. Skipping this
  ships washed-out gray posters (JPEG can't carry HDR) — this bug hit
  production once (clips 43/45/46, July 2026).
- `app/services/[slug]/page.tsx` — shared template for the 5 public service
  detail pages. Per-slug logic uses `isTestimonial`, `isBranded`,
  `isSocialMedia`, `isVideoAd`, `isStreetInterview` flags.

---

## Build commands

- Dev: `npm run dev` (used by the preview MCP via `.claude/launch.json`)
- Production build: `npm run build` (must pass before pushing)
- The build runs as part of Vercel deploy; if it fails locally it fails on
  Vercel too.

---

## Git conventions

- Default branch: `main`. Vercel auto-deploys from `main`.
- One commit per logical change. The user reviews commits in the GitHub UI.
- Never amend commits unless the user explicitly asks.
- Never push to `main` without an explicit "push it" / "ship it" / "deploy
  it" from the user.
- Commit message style: subject line under 72 chars, imperative mood
  ("Reviews: swap placeholders for real Fiverr client reviews"). Body
  optional but useful for multi-section changes.
- Co-author footer line is fine to include.

---

## When a mobile bug ships anyway

If the user reports "site looks shit on mobile" or any equivalent:

1. **Don't guess.** Spin up the preview, resize to mobile, screenshot the
   page they mentioned. Run the horizontal-overflow eval (step 3 of the
   self-audit checklist).
2. **Find the actual cause** before proposing a fix. The CSS rule that's
   wrong is usually obvious once you see the actual DOM at mobile width.
3. **Fix it AND update this file** with the new anti-pattern, so the same
   class of bug doesn't ship again. The point of this document is that it
   gets longer over time, not that it stays the same.
