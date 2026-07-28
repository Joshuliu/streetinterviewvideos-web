import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
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
export const ownerEnum = pgEnum('owner', ['josh', 'neil']);
// Canonical milestone kinds. Display names + the status each one maps to live
// in code (lib/crm/status.ts) — the pipeline is fixed, not configurable.
export const milestoneKindEnum = pgEnum('milestone_kind', [
  'strategy',
  'scripting',
  'shoot',
  'delivered',
  'revisions_ordered',
  'revised_delivered',
  'completed',
]);
export const otpAudienceEnum = pgEnum('otp_audience', ['team', 'studio']);

// The paying client (for agencies: the agency, never the brand — brands live
// on orders).
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
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
    // The brand this order is for; null falls back to the account name in UI.
    brand: text('brand'),
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
    // Client-visible. Null only for 'revisions_ordered' (an event, not work).
    targetDate: date('target_date'),
    // Required at completion time for 'delivered' / 'revised_delivered' —
    // clients open deliveries from the dashboard, not from a raw emailed URL.
    deliveredLink: text('delivered_link'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
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

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    text: text('text').notNull(),
    clientVisible: boolean('client_visible').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('notes_account_idx').on(t.accountId)],
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
