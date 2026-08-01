CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ical_uid" text NOT NULL,
	"owners" text[] DEFAULT '{}' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"all_day" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"attendees" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"html_link" text,
	"lead_id" uuid,
	"account_id" uuid,
	"linked_manually" boolean DEFAULT false NOT NULL,
	"position" double precision DEFAULT extract(epoch from now()) - 1000000000000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "calendar_events_ical_uid_unique" ON "calendar_events" USING btree ("ical_uid");--> statement-breakpoint
CREATE INDEX "calendar_events_start_idx" ON "calendar_events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "calendar_events_lead_idx" ON "calendar_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "calendar_events_account_idx" ON "calendar_events" USING btree ("account_id");