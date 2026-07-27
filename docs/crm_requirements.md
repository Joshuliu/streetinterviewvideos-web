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
- Account: id, client/company name, type (client now; prospect/lead reserved for later), created_at. The account is the PAYING CLIENT — for an agency that's the agency itself, never the brand. Brands live on orders (amended 2026-07-27; the original spec conflated company and brand).
- LoginEmail: account_id, email (globally unique — one email maps to exactly one account). Admins add/remove; any listed email can log in to studio. for that account.
- Order: id, account_id, title, brand (nullable — the brand this order is for; agencies run concurrent orders for different brands; blank falls back to the account name in UI), created_at. Status is DERIVED, never stored. A client can have many orders; the pipeline lives on the Order, not the Account. Concurrent orders are supported (a new order can start while an old one still has an open revision round).
- Milestone: id, order_id, name, sequence, owner (josh|neil), target_date (client-visible, defaulted per the table below, freely editable), completed_at (nullable), delivered_link (nullable URL; REQUIRED when completing "Order delivered" / "Revised order delivered" — deliveries are opened from the dashboard, so we send clients the branded dashboard link instead of a raw delivery URL). Milestones ARE tasks: they appear in the owner's task list with a client badge.
- Task (personal): id, owner (josh|neil), title, due_date (nullable), completed_at (nullable), notes. Always self-assigned. Completed tasks disappear from the list (soft-hide, row kept).
- Note: account_id, date, text, client_visible flag (default off).

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
Applied at order creation (or revision-round start); every date and owner editable per order. Split: Neil owns everything through the shoot, Joshua owns everything post-production.
- Strategy completed: Neil, order creation + 2 days (waiting on client)
- Scripting completed: Neil, strategy target + 5 days (creation + 7)
- Shoot completed: Neil, scripting target + 4 days (creation + 11; anywhere between scripting and delivery is fine)
- Order delivered: Joshua, scripting target + 14 days (creation + 21)
- Order completed: Joshua, delivery + 10 days (the feedback window: no revisions ordered by then means close it out)
- Revised order delivered: Joshua, revisions ordered + 10 days
After a revised delivery, the "Order completed" target resets to revised delivery + 10 days (fresh feedback window).
Date edits are manual in v1: slipping one milestone does NOT auto-shift later ones.

## team. views
1. My tasks (default after login): personal tasks + my milestone tasks, merged, sorted by due/target date. Inline add/edit/complete. Completed rows vanish. Milestone rows carry a client badge and complete the milestone directly.
2. Clients: one row per account: current order, derived status, next milestone + target date.
3. Client detail: orders + milestones (edit target dates, owner), notes (internal vs client-visible), login-email management, new-order button.
4. New client / new order: instantiates the 5-milestone template with owners and target dates pre-filled from the defaults, editable before saving.

## studio. views
1. Order tracker: progress bar over the stages, current status highlighted, target dates on upcoming milestones, delivered links (from the milestone's delivered_link) on done ones.
2. Order routing: login lands directly on the single active order. If the account has multiple non-completed orders or past orders, a simple switcher/history list shows them; completed orders display as Completed with their delivery links.
3. Updates: notes flagged client_visible, newest first.
4. Strictly read-only. A client sees only their own account's data.

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
- No payments, file uploads, comments, or client-side actions.
- No roles beyond admin/client.

## Infra
Postgres (Neon), Resend for OTP, deployed with both subdomains attached to this project. Daily DB backup.
