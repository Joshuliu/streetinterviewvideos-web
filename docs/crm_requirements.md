# CRM: requirements

REWRITTEN 2026-08-30 (Neil's ask). The client-facing tracker
(studio.streetinterviewvideos.com) and the whole milestone pipeline were
removed: the CRM is internal-only, and an order is a stored status plus a
notes box. The old spec — derived status engine, per-step deadlines vs
expected dates, the studio onboarding hand-off — lives in this file's git
history if it's ever needed again.

## Architecture
One app, one database, one CRM subdomain routed by host (middleware.ts):
- team.streetinterviewvideos.com: internal, Joshua + Neil (admins). Task
  board + leads + clients. This IS the CRM.
- studio.streetinterviewvideos.com: REMOVED. Requests 308-redirect to the
  marketing homepage until the subdomain is deleted from Vercel/DNS.

## Auth (team. only)
Email OTP, passwordless:
1. Enter email, receive 6-digit code at that email, enter code, get a signed
   session cookie (30 days).
2. Codes expire in 10 minutes, max 5 attempts, rate-limited per email and IP.
3. Only admin emails log in, kept in env (ADMIN_EMAILS), never the DB.
4. OTP emails go through Resend. Never any cold-email infrastructure.
5. Unknown emails get the same "code sent if this email is on file" response
   as known ones (never leak which emails exist).

## Data model (live tables)
- Account: id, name (a HUMAN — the point of contact, not a company), company
  (who they represent: their own brand, or the agency they work at; nullable
  in the DB for legacy rows, required by the UI), type, created_at. Brands
  live on orders.
- Order: id, account_id, title, brand (required by the UI; nullable column
  for legacy rows, which fall back to the account's company), status
  (ongoing | completed | canceled — stored, edited by hand from the order
  card), notes (one free-text box: scope, delivery links, anything worth
  keeping; the 2026-08-30 migration flattened each order's old milestone
  history into it), created_at (backdatable on the new-order form). A client
  can have many orders, any mix of statuses.
- Task (personal): id, owner (josh|neil), title, due_date (nullable),
  completed_at (nullable), notes, position. Always self-assigned. Completed
  tasks fold into a collapsed "Completed" section (restore / delete).
- Note: ONE internal-notes stream per PERSON, spanning the whole
  relationship. A note hangs off either a lead (written during sales) or an
  account (once they're a client) — exactly one, enforced by the
  `notes_one_owner` check. Nothing is re-pointed at conversion: the client
  page reads its account's notes UNION the notes of the lead(s) that
  converted into it. EVERY note is internal; clients are updated by email.
- Lead: one row per PERSON, before and after conversion. /api/lead upserts
  funnel posts (by funnel session, then email); carries everything the funnel
  captured plus converted_account_id and archived_at. Converting a lead
  creates the account and links back — the lead survives as the person
  record, so its calls and notes carry onto the client page.
- CalendarEvent: the admins' Google Calendars mirrored in on a 10-minute cron
  (lib/crm/calendar.ts); one row per MEETING keyed on ical_uid. Google is the
  source of truth; nothing writes back. Events match to leads by attendee
  email (a converted lead carries its account too); unmatched rows render as
  plain calendar rows.
- OnboardingForm: a BUSINESS-SIDE tool — the brief we fill in on a lead's
  behalf during the sales call (six fixed questions, wording in
  lib/crm/onboarding.ts). One per lead, edited on the lead page; the shoot
  brief is written from it. The client never sees it. Rows attached to an
  order are historical (from the studio. era) and render read-only on the
  order card.

Orphaned, pending the post-deploy drop migration: milestones, login_emails,
lead_meetings, orders.needs_product, notes.client_visible,
onboarding_forms.confirmed_at + brief_link, otp_audience 'studio', and the
0006-era leads.* columns listed in CLAUDE.md.

## team. views
0. Leads: ordered by heat (lib/crm/leads.ts), searchable; lead detail has
   captured info + attribution, Notes, the onboarding form, archive toggle,
   and Convert to client (name/company, prefilled).
1. My Tasks (default after login): personal tasks + calendar meetings,
   merged into one hand-sortable list per day (shared fractional position
   space). Meetings drag within their own day only; tapping one joins the
   call and opens the person's #notes. Undated tasks on top, next 7 days
   always shown, completed work folds away after a one-day grace window.
2. Clients: one row per account, grouped Ongoing orders / Nothing live,
   searchable, sorted by last activity or name. The chip shows the current
   order's stored status.
3. Client detail: order cards (status select + notes box, saved together;
   past orders behind a fold), Notes (the one stream, sales-era notes tagged
   SALES), new-order button, delete-client danger zone.
4. New client / new order: title, brand, placed date (backdatable), status,
   notes. That's the whole order record.

## Design
Reuse this site's existing design system; lift real tokens/components:
- Fonts: Bungee for display/headings (--font-display), DM Sans for body.
- team. follows the device theme via the --crm-* tokens (see CLAUDE.md's
  "CRM theming" section). Status chips: ongoing orange #ea580c, completed
  sign-green #1f7a3a, canceled neutral chip tokens.

## Non-goals (hold this line)
- No client-facing surfaces. Clients are updated by email.
- No automations, integrations, or webhooks beyond the calendar sync cron.
- No payments, file uploads, or comments.
- No roles beyond admin.

## Infra
Postgres (Neon, shared by prod and local dev — migrations must stay
non-breaking for deployed code), Resend for OTP, Vercel cron for the
calendar sync. Daily DB backup.
