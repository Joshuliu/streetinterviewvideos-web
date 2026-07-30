CREATE TABLE "lead_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"start_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"notes" text DEFAULT '' NOT NULL,
	"position" double precision DEFAULT extract(epoch from now()) - 1000000000000 NOT NULL,
	"calendly_event_uri" text,
	"calendly_invitee_uri" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_meetings" ADD CONSTRAINT "lead_meetings_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lead_meetings_event_uri_unique" ON "lead_meetings" USING btree ("calendly_event_uri");--> statement-breakpoint
CREATE INDEX "lead_meetings_lead_idx" ON "lead_meetings" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_meetings_start_idx" ON "lead_meetings" USING btree ("start_at");--> statement-breakpoint
INSERT INTO "lead_meetings" ("lead_id", "start_at", "position", "calendly_event_uri", "calendly_invitee_uri", "created_at", "updated_at")
SELECT "id", "meeting_at", "position", "calendly_event_uri", "calendly_invitee_uri", "created_at", "updated_at"
FROM "leads"
WHERE "meeting_at" IS NOT NULL OR "calendly_event_uri" IS NOT NULL;
-- NOTE: leads.meeting_at / position / calendly_event_uri / calendly_invitee_uri
-- and the leads_meeting_idx index are left in place on purpose: prod and local
-- dev share this database, and the deployed code still reads them until this
-- change ships. They're orphans as of this migration (nothing in this codebase
-- reads or writes them); drop them in a follow-up migration once deployed.