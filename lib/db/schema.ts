import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Schema for the CRM (team.) + client order tracker (studio.).
// Full requirements: docs/crm_requirements.md. The load-bearing invariant:
// order status is DERIVED from the last completed milestone, never stored.

export const accountTypeEnum = pgEnum('account_type', ['client', 'prospect', 'lead']);
// 'client' marks a milestone the CLIENT completes (e.g. strategy: confirming
// onboarding from studio.) — it appears on no admin's task board.
export const ownerEnum = pgEnum('owner', ['josh', 'neil', 'client']);
// Canonical milestone kinds. Display names + the status each one maps to live
// in code (lib/crm/status.ts) — the pipeline is fixed, not configurable.
export const milestoneKindEnum = pgEnum('milestone_kind', [
  'strategy',
  'scripting',
  // The client's second hand-off (added 2026-07-31): approve the brief we
  // wrote back to them AND get the product to the host. Nothing can be shot
  // until both land, so it's its own step rather than part of the shoot.
  'approval',
  'shoot',
  'delivered',
  'revisions_ordered',
  'revised_delivered',
  'completed',
]);
export const otpAudienceEnum = pgEnum('otp_audience', ['team', 'studio']);

// The paying client: a HUMAN point of contact, not a company. `name` is the
// person; `company` is the brand or agency they represent. The brand each
// order is for lives on the order (for direct clients it usually matches
// `company`; for agencies it usually doesn't).
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  // Nullable for legacy rows only — the UI requires it on create.
  company: text('company'),
  type: accountTypeEnum('type').notNull().default('client'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Emails allowed to log in to studio. for an account. Globally unique so a
// login resolves to exactly one account.
export const loginEmails = pgTable(
  'login_emails',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('login_emails_email_unique').on(t.email), index('login_emails_account_idx').on(t.accountId)],
);

// No status column by design — status derives from milestones.
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    // The brand this order is for. Required by the UI/engine (every order is
    // for a brand); the column stays nullable for migration safety, and the
    // UI falls back to the account's company for any legacy null.
    brand: text('brand'),
    // Does something physical have to reach the host before we can shoot?
    // True for most orders (the product is in the interviewees' hands); false
    // for apps, services and software, where the client's brief approval is
    // the whole hand-off. Drives the wording of the 'approval' milestone and
    // its chase copy — milestoneLabel() in lib/crm/status.ts.
    needsProduct: boolean('needs_product').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('orders_account_idx').on(t.accountId)],
);

export const milestones = pgTable(
  'milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    kind: milestoneKindEnum('kind').notNull(),
    // Completion is enforced in sequence order; revision rounds insert new
    // milestones before the terminal 'completed' one by renumbering it.
    sequence: integer('sequence').notNull(),
    owner: ownerEnum('owner').notNull(),
    // The committed deadline, INTERNAL. Set on the NEXT incomplete milestone
    // ONLY (amended 2026-07-31): a date is a promise, and promising five of
    // them at order creation just manufactured overdue rows for work that was
    // never startable yet. Everything behind the next step shows an EXPECTED
    // date instead (expectedDates(), rolled forward from this one), which is
    // also what the CLIENT sees on their own tracker — so re-cutting a
    // deadline moves their plan with it instead of reading as a broken
    // promise. Null on a completed milestone's successors and on
    // 'revisions_ordered' (an event, not work).
    // lib/crm/engine.ts#resyncDeadlines is what keeps the invariant true.
    targetDate: date('target_date'),
    // Required at completion time for 'delivered' / 'revised_delivered' —
    // clients open deliveries from the dashboard, not from a raw emailed URL.
    deliveredLink: text('delivered_link'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    // Manual sort order on the task board, in the SAME number space as
    // tasks.position and leads.position — a day's rows are one merged list, so
    // dragging can put a milestone above a task or below a meeting. The +1e12
    // band on the default keeps freshly spawned milestones at the bottom of
    // their day (where they used to render) until someone drags them.
    position: doublePrecision('position')
      .notNull()
      .default(sql`extract(epoch from now()) + 1000000000000`),
  },
  (t) => [uniqueIndex('milestones_order_sequence_unique').on(t.orderId, t.sequence)],
);

// Personal tasks, always self-assigned. Completed rows are soft-hidden
// (completed_at set), never deleted.
export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    owner: ownerEnum('owner').notNull(),
    title: text('title').notNull(),
    dueDate: date('due_date'),
    // Manual sort order within a day (drag to reorder). Fractional: dropping
    // between two tasks takes the midpoint of their positions.
    position: doublePrecision('position')
      .notNull()
      .default(sql`extract(epoch from now())`),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    notes: text('notes').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('tasks_owner_idx').on(t.owner)],
);

// Internal notes — ONE stream per person, spanning the whole relationship.
// A note hangs off either a lead (written during the sales process) or an
// account (written once they're a client); exactly one, enforced below. Notes
// are never re-pointed at conversion: the client page reads its account's
// notes UNION the notes of the lead(s) that converted into it, so the sales
// history and the delivery history render as one list with nothing to move.
//
// This is the only notes mechanism. Anything internal about a person goes
// here (amended 2026-07-29 — per-meeting notes on lead_meetings were a second
// mechanism competing with this one, and were folded back in).
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    text: text('text').notNull(),
    // Flick this on and the note appears in the client's studio "Updates".
    // Only meaningful on an account note: a lead has no studio access, so the
    // lead-side UI doesn't offer it (and conversion never flips it on).
    clientVisible: boolean('client_visible').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('notes_account_idx').on(t.accountId),
    index('notes_lead_idx').on(t.leadId),
    check(
      'notes_one_owner',
      sql`(${t.accountId} is null) <> (${t.leadId} is null)`,
    ),
  ],
);

// Funnel leads. One row per funnel session (funnel_id is the funnel's stable
// per-session id, upserted as the visitor progresses contact → brand →
// qualified/unqualified → booked). Leads are NOT accounts: conversion (after
// they pay, or manually) creates the account and records it here. The Google
// Sheet webhook keeps receiving the same posts — this table is the CRM's copy.
export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // The funnel's per-session leadId; unique so each post upserts one row.
    funnelId: text('funnel_id'),
    // Latest funnel progress marker: contact | brand | qualified | unqualified | booked.
    stage: text('stage').notNull().default(''),
    name: text('name').notNull().default(''),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    company: text('company').notNull().default(''),
    website: text('website').notNull().default(''),
    adspend: text('adspend').notNull().default(''),
    // null until they've answered ad spend; then true unless lowest tier.
    qualified: boolean('qualified'),
    utm: jsonb('utm').$type<Record<string, string>>().notNull().default({}),
    source: text('source').notNull().default(''),
    // Set when the lead becomes a paying client (account created from it).
    convertedAccountId: uuid('converted_account_id').references(() => accounts.id, { onDelete: 'set null' }),
    // Soft-dismiss for dead leads; restorable.
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('leads_funnel_id_unique').on(t.funnelId),
    index('leads_email_idx').on(t.email),
  ],
);

// A lead's meetings, one row per call — first strategy call, follow-ups,
// whatever comes next. Calendly is the source of truth for rows that carry an
// event URI (the sync upserts on it: time changes, cancellations); rows
// without one are hand-entered and never touched by the sync. History stays:
// past meetings keep their row, so a follow-up never erases the first call.
export const leadMeetings = pgTable(
  'lead_meetings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    // Nullable: a booking can be known before its time resolves (Calendly
    // lookup failed); the admin sets the time by hand and the sync corrects it.
    startAt: timestamp('start_at', { withTimezone: true }),
    // Set when Calendly reports the event canceled (a reschedule is a cancel
    // plus a fresh event). Canceled rows leave the board but stay as history.
    canceledAt: timestamp('canceled_at', { withTimezone: true }),
    // DEPRECATED 2026-07-29, do not read or write. Per-meeting notes were a
    // second notes mechanism competing with the `notes` table; migration 0007
    // copied every non-empty value into a dated lead note and nothing reads
    // this column now. Kept only until the deploy that stopped reading it has
    // shipped (prod and dev share the DB), then dropped with the other orphans
    // listed in CLAUDE.md.
    notes: text('notes').notNull().default(''),
    // Where this call sits in its day on the task board. Same number space as
    // tasks.position / milestones.position; the -1e12 band on the default
    // anchors a newly booked call at the top of its day (a timed appointment
    // shapes the day around it) until it's dragged. The meeting's DAY still
    // comes from start_at — dragging only reorders.
    position: doublePrecision('position')
      .notNull()
      .default(sql`extract(epoch from now()) - 1000000000000`),
    calendlyEventUri: text('calendly_event_uri'),
    calendlyInviteeUri: text('calendly_invitee_uri'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('lead_meetings_event_uri_unique').on(t.calendlyEventUri),
    index('lead_meetings_lead_idx').on(t.leadId),
    index('lead_meetings_start_idx').on(t.startAt),
  ],
);

// Google Calendar events for the admins' own calendars, mirrored in so the
// task board can show the day Neil actually has. Google is the source of
// truth: every field here is overwritten on each sync and nothing in the CRM
// writes back, so a reschedule or cancellation is made in Calendar and lands
// here on the next pass.
//
// One row per MEETING, not per calendar: `ical_uid` is identical across every
// attendee's copy of an event, so a call Neil and Josh are both on dedupes to
// a single row carrying both of them in `owners`. Google's per-copy `id`
// differs and would have produced two.
export const calendarEvents = pgTable(
  'calendar_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    icalUid: text('ical_uid').notNull(),
    // 'neil' / 'josh' — whose calendars this was found on. A joint call has
    // both and shows on both boards.
    owners: text('owners').array().notNull().default(sql`'{}'`),
    summary: text('summary').notNull().default(''),
    startAt: timestamp('start_at', { withTimezone: true }),
    endAt: timestamp('end_at', { withTimezone: true }),
    // All-day events carry a date and no clock time; they get their own row
    // shape on the board rather than a bogus midnight.
    allDay: boolean('all_day').notNull().default(false),
    // Google's own status. 'cancelled' rows are kept, not deleted, so a
    // cancellation is visible rather than a silent disappearance.
    status: text('status').notNull().default('confirmed'),
    // Every attendee address, internal ones included, for re-matching later
    // without another round trip to Google.
    attendees: jsonb('attendees').$type<string[]>().notNull().default([]),
    htmlLink: text('html_link'),
    // The match, both nullable: an unmatched event is an ordinary, expected
    // state (Neil booked someone who never filled the funnel, or it's a
    // vendor selling to us). Those render as plain rows you can link or leave.
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    // Set when a human linked this event by hand. The sync then leaves the
    // match alone, so an automatic guess can never overwrite a human's answer.
    linkedManually: boolean('linked_manually').notNull().default(false),
    // Same number space as tasks/milestones/lead_meetings positions, so a
    // calendar row can be dragged among them. Meetings band = top of the day.
    position: doublePrecision('position')
      .notNull()
      .default(sql`extract(epoch from now()) - 1000000000000`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('calendar_events_ical_uid_unique').on(t.icalUid),
    index('calendar_events_start_idx').on(t.startAt),
    index('calendar_events_lead_idx').on(t.leadId),
    index('calendar_events_account_idx').on(t.accountId),
  ],
);

// Onboarding form: the sales-call notes we take on a lead's behalf (the five
// questions live in code, lib/crm/onboarding.ts). Starts on the lead during
// the sales process; attaches to the client's order at/after conversion so the
// client can read, extend, and confirm it from studio. (phase 2).
export const onboardingForms = pgTable(
  'onboarding_forms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
    products: text('products').notNull().default(''),
    hooks: text('hooks').notNull().default(''),
    ctas: text('ctas').notNull().default(''),
    hostPreferences: text('host_preferences').notNull().default(''),
    intervieweePreferences: text('interviewee_preferences').notNull().default(''),
    additionalNotes: text('additional_notes').notNull().default(''),
    // The client's alternative to the form: a link to their own brief doc.
    briefLink: text('brief_link'),
    // Set when the client presses confirm (or submits a brief link); either
    // path auto-completes the order's Strategy milestone.
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('onboarding_forms_lead_unique').on(t.leadId), uniqueIndex('onboarding_forms_order_unique').on(t.orderId)],
);

// OTP login codes. Only the hash is stored. Rate limiting counts recent rows
// per email and per IP — no separate rate-limit store.
export const otpCodes = pgTable(
  'otp_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    codeHash: text('code_hash').notNull(),
    audience: otpAudienceEnum('audience').notNull(),
    ip: text('ip').notNull(),
    attempts: integer('attempts').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('otp_codes_email_created_idx').on(t.email, t.createdAt),
    index('otp_codes_ip_created_idx').on(t.ip, t.createdAt),
  ],
);
