CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funnel_id" text,
	"stage" text DEFAULT '' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"adspend" text DEFAULT '' NOT NULL,
	"qualified" boolean,
	"utm" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"meeting_at" timestamp with time zone,
	"calendly_event_uri" text,
	"calendly_invitee_uri" text,
	"converted_account_id" uuid,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"order_id" uuid,
	"products" text DEFAULT '' NOT NULL,
	"hooks" text DEFAULT '' NOT NULL,
	"ctas" text DEFAULT '' NOT NULL,
	"host_preferences" text DEFAULT '' NOT NULL,
	"additional_notes" text DEFAULT '' NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_account_id_accounts_id_fk" FOREIGN KEY ("converted_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_forms" ADD CONSTRAINT "onboarding_forms_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_forms" ADD CONSTRAINT "onboarding_forms_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "leads_funnel_id_unique" ON "leads" USING btree ("funnel_id");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_meeting_idx" ON "leads" USING btree ("meeting_at");--> statement-breakpoint
CREATE UNIQUE INDEX "onboarding_forms_lead_unique" ON "onboarding_forms" USING btree ("lead_id");--> statement-breakpoint
CREATE UNIQUE INDEX "onboarding_forms_order_unique" ON "onboarding_forms" USING btree ("order_id");