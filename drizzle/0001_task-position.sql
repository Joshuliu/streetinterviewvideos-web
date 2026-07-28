ALTER TABLE "tasks" ADD COLUMN "position" double precision;--> statement-breakpoint
UPDATE "tasks" SET "position" = extract(epoch from "created_at");--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "position" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "position" SET DEFAULT extract(epoch from now());
