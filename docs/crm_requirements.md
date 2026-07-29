# CRM v2 + client dashboard: requirements

## Architecture
One app, one database, two subdomains routed by host:
- team.streetinterviewvideos.com: internal, Joshua + Neil (admins). Task lists + client management. This IS the CRM.
- studio.streetinterviewvideos.com: clients, read-only order tracker (car-tracker style progress view).
Same codebase, same DB. Updating the CRM and updating what the client sees are the same action. No sync, no automation.

## Auth (both subdomains)
Email OTP, passwordless:
1. Enter email, receive 6-digit code at that email, enter code, get a signed session cookie.
2. Codes expire in 10 minutes, max 5 attempts, rate-limited per email and per IP.
3. team. only accepts admin emails (josh@streetinterviewvideos.com, neil@streetinterviewvideos.com), kept in config/env, not the DB. studio. only accepts emails on a client account's allowed-login list.
4. Sessions: 30 days for admins, 7 days for clients.
5. OTP emails go through a transactional provider (Resend). Never through any cold-email infrastructure.
6. Login pages are public but restricted. Team copy: "Team access only". Studio copy: "Client access: enter the email on your account". Unknown emails get the same "code sent if this email is on file" response as known ones (never leak which emails exist).

## Data model
- Account: id, name (a HUMAN — the point of contact, not a company), company (who they represent: their own brand, or the agency they work at; nullable in the DB for legacy rows, required by the UI), type (client now; prospect/lead reserved for later), created_at. The account is the PAYING CLIENT's contact person. Brands live on orders (amended 2026-07-28; earlier revisions made the account a company).
- LoginEmail: account_id, email (globally unique — one email maps to exactly one account). Admins add/remove; any listed email can log in to studio. for that account.
- Order: id, account_id, title, brand (REQUIRED in the UI/engine — every order is for a brand; for direct clients it usually equals the account's company, for agencies it usually doesn't; the column stays nullable for legacy rows, which fall back to the account's company in UI), created_at. Status is DERIVED, never stored. A client can have many orders; the pipeline lives on the Order, not the Account. Concurrent orders are supported (a new order can start while an old one still has an open revision round).
- Milestone: id, order_id, name, sequence, owner (josh|neil|client), target_date (client-visible, defaulted per the table below, freely editable), completed_at (nullable), delivered_link (nullable URL; REQUIRED when completing "Order delivered" / "Revised order delivered" — deliveries are opened from the dashboard, so we send clients the branded dashboard link instead of a raw delivery URL). Milestones ARE tasks: they appear in the owner's task list with a client badge. Owner 'client' (added 2026-07-28) marks a step the CLIENT completes (strategy: confirming onboarding from studio.); client-owned milestones appear on NO admin's task board — the Clients view and client detail are where the team watches for stalls.
- Task (personal): id, owner (josh|neil), title, due_date (nullable), completed_at (nullable), notes. Always self-assigned. Completed tasks disappear from the active list into a collapsed "Completed" section where they can be restored (unchecked) or permanently deleted (amended 2026-07-27).
- Note: account_id, date, text, client_visible flag (default off).
- Lead (added 2026-07-28): one row per /qualify funnel session (funnel_id unique, upserted as the visitor progresses contact → brand → qualified/unqualified → booked). Carries everything the funnel captured (name, email, phone, company, website, adspend, qualified, utm, source) plus meeting_at (resolved from the Calendly API via CALENDLY_API_TOKEN when the embed reports a booking; hand-editable fallback), calendly_event/invitee_uri, converted_account_id (set at conversion), archived_at (soft dismiss). Leads are NOT accounts; converting creates the account + studio login email and links back. /api/lead keeps forwarding to the Google Sheet webhook unchanged — the DB row is the CRM's copy.
- OnboardingForm (added 2026-07-28): the sales-call notes we take on a lead's behalf. Five fixed questions, wording in code (lib/crm/onboarding.ts): products/value props, hooks, CTAs, host demographic, additional notes. One per lead (unique), attachable to an order (unique). Phase 2 SHIPPED (2026-07-28): while an order's Strategy milestone is open, studio. shows the client two paths — extend + confirm the form (pre-seeded with the sales-call notes; the lead's form attaches to the order on their first save/confirm), or submit a brief_link to their own doc. Either path stamps confirmed_at and AUTO-completes Strategy. The confirmed answers/brief render read-only on studio. and inside the order card on the team client detail. Between that and scripting we turn their notes/brief into our own brief for their approval.

## Status engine
Status is a pure function of the last completed milestone (by completion order). Never stored, so it can never go stale.
- (none completed): Onboarding in progress
- Strategy completed: Scripting in progress
- Scripting completed: Pre-production (casting & scheduling)
- Shoot completed: Post-production (editing)
- Order delivered: Optional revisions
- Revisions ordered: Revisions in progress
- Revised order delivered: Optional revisions (another round may be ordered)
- Order completed: Completed (terminal, order archives)

Rules:
- Milestones complete only in sequence (UI enforces next-incomplete only). Completing one flips the client-visible status, so there is an undo.
- Order creation spawns 5 milestones: Strategy completed, Scripting completed, Shoot completed, Order delivered, Order completed. Revision milestones do NOT spawn up front.
- "Start revision round" button (available while status = Optional revisions): marks "Revisions ordered" complete immediately (it is an event, not work) and spawns a "Revised order delivered" milestone task. Repeatable for multiple rounds.
- "Order completed" is marked manually when the client confirms or the feedback window lapses.

## Default owners and target dates
Applied at order creation (or revision-round start); every date and owner editable per order. The new-order form has an "order placed" date (backdatable, defaults to today, also sets the order's created_at); changing it refills all milestone dates from the offsets below (amended 2026-07-27). Split: the client owns strategy (amended 2026-07-28 — it was Neil's, but it's the client's action, so it cluttered his board), Neil owns through the shoot, Joshua owns everything post-production.
- Strategy completed: Client, order creation + 2 days (they confirm onboarding or submit a brief from studio.)
- Scripting completed: Neil, strategy target + 5 days (creation + 7)
- Shoot completed: Neil, scripting target + 4 days (creation + 11; anywhere between scripting and delivery is fine)
- Order delivered: Joshua, scripting target + 14 days (creation + 21)
- Order completed: Joshua, delivery + 10 days (the feedback window: no revisions ordered by then means close it out)
- Revised order delivered: Joshua, revisions ordered + 10 days
After a revised delivery, the "Order completed" target resets to revised delivery + 10 days (fresh feedback window).
Date edits are manual in v1: slipping one milestone does NOT auto-shift later ones.

## team. views
0. Leads (added 2026-07-28): every funnel lead, meetings-booked first (soonest on top — the row to open at call time), then no-meeting leads, converted/archived collapsed. Lead detail: captured info + attribution, meeting time (edit fallback), the onboarding form to fill during the call, archive toggle, and a manual Convert to client button (prefilled name/company/email; Stripe will drive conversion automatically later).
1. My tasks (default after login): personal tasks + my milestone tasks, merged. Layout mirrors Neil's Notes-app list (amended 2026-07-27): undated tasks on top, then day-of-week groups with dates (next 7 days always shown); tapping "Add task" under a day creates a task dated to that day; a drag handle on every row reorders tasks freely (fractional position column) and dragging to another day re-dates the task (milestone drags change the target date). Inline add/edit/complete with large tap targets (mobile-first; used via Safari add-to-home-screen). Checking off a task keeps it in its day group, crossed out (tap the green check to restore, or the small x to clear it); it moves to the collapsed Completed section automatically once its day AND its completion are both older than yesterday (amended 2026-07-29: yesterday's section stays on the board as the list of what got finished, and clearing a long-overdue task doesn't make it vanish mid-tap). A past day header only reads "overdue" while something in it is still open. Yesterday's meetings ride the same grace day. That section offers restore/delete (tasks) and undo (milestones, only while still the order's latest completion). Milestone rows carry a client badge, tap-to-edit owner/target date, complete directly, and delivery milestones state up front that a delivery link is required.
2. Clients: one row per account: current order, derived status, next milestone + target date.
3. Client detail: orders + milestones (edit target dates, owner), notes (internal vs client-visible), login-email management, new-order button.
4. New client / new order: instantiates the 5-milestone template with owners and target dates pre-filled from the defaults, editable before saving.

## studio. views
1. Order tracker: progress bar over the stages, current status highlighted, target dates on upcoming milestones, delivered links (from the milestone's delivered_link) on done ones.
2. Order routing: login lands directly on the single active order. If the account has multiple non-completed orders or past orders, a simple switcher/history list shows them; completed orders display as Completed with their delivery links.
3. Updates: notes flagged client_visible, newest first.
4. Read-only, with ONE exception (2026-07-28): the onboarding hand-off. While Strategy is open the tracker leads with a choice — fill/confirm the onboarding form or submit a brief link — and either completes Strategy. Everything else stays display-only. A client sees only their own account's data.

## Design
Reuse this site's existing design system; lift real tokens/components:
- Fonts: Bungee for display/headings (--font-display), DM Sans for body (--font-sans).
- Dark theme: background #0a0a0a, white text, grays #1a1a1a / #2a2a2a / #3a3a3a for surfaces and borders, muted text #9ca3af.
- Accents (street-sign palette): CTA orange #ea580c (hover #f97316, deep #9a3412), sign green #1f7a3a (hover #2a9a4a, deep #0e4a22), rivet cream #e9e6da, yellow #ffc72c.
- The studio tracker is the showpiece: style it in the site's highway-sign aesthetic (sign green for completed stages, orange for the current one).

## Non-goals for v1 (hold this line)
- No automations, integrations, email sync, or webhooks.
- No configurable pipelines; the milestone set is code.
- No prospect/lead features (the type field is the only concession).
- No payments, file uploads, or comments. Client-side actions are limited to the onboarding hand-off (amended 2026-07-28); nothing else on studio. mutates.
- No roles beyond admin/client.

## Infra
Postgres (Neon), Resend for OTP, deployed with both subdomains attached to this project. Daily DB backup.
