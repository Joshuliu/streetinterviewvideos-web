-- Backfilled per row rather than taking the column default, so existing rows
-- keep the order the board already showed: meetings by start time (top band),
-- milestones by pipeline sequence (bottom band). now() is constant within a
-- statement, so the plain default would flatten every row to one value.
ALTER TABLE "leads" ADD COLUMN "position" double precision;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "position" double precision;--> statement-breakpoint
UPDATE "leads" SET "position" = extract(epoch from coalesce("meeting_at", "created_at")) - 1000000000000;--> statement-breakpoint
UPDATE "milestones" SET "position" = extract(epoch from now()) + 1000000000000 + "sequence";--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "position" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "position" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "position" SET DEFAULT extract(epoch from now()) - 1000000000000;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "position" SET DEFAULT extract(epoch from now()) + 1000000000000;
