ALTER TABLE "notes" ALTER COLUMN "account_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "lead_id" uuid;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notes_lead_idx" ON "notes" USING btree ("lead_id");--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_one_owner" CHECK (("notes"."account_id" is null) <> ("notes"."lead_id" is null));--> statement-breakpoint
-- Fold the per-meeting notes back into the one notes stream, dated to the
-- meeting's day so they land in the right place chronologically. Runs before
-- anything stops reading lead_meetings.notes, so no note is ever only in the
-- deprecated column. lead_meetings.notes itself is left in place (prod shares
-- this DB and still reads it until the deploy lands); it is dropped with the
-- other orphan columns in a later migration.
INSERT INTO "notes" ("lead_id", "date", "text", "client_visible", "created_at")
SELECT "lead_id",
       COALESCE(("start_at" AT TIME ZONE 'America/Los_Angeles')::date, "created_at"::date),
       "notes",
       false,
       "created_at"
FROM "lead_meetings"
WHERE "notes" <> '';