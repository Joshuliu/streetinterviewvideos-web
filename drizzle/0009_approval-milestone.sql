-- The client's second hand-off: approve the brief we wrote back to them, and
-- get the product to the host. Adding the enum value is non-breaking for the
-- currently-deployed code (nothing reads a kind it has never seen); the value
-- only starts appearing on rows once the new build ships and
-- scripts/crm-backfill-approval-step.ts runs.
ALTER TYPE "public"."milestone_kind" ADD VALUE 'approval' BEFORE 'shoot';
