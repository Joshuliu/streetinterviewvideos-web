CREATE TYPE "public"."account_type" AS ENUM('client', 'prospect', 'lead');--> statement-breakpoint
CREATE TYPE "public"."milestone_kind" AS ENUM('strategy', 'scripting', 'shoot', 'delivered', 'revisions_ordered', 'revised_delivered', 'completed');--> statement-breakpoint
CREATE TYPE "public"."otp_audience" AS ENUM('team', 'studio');--> statement-breakpoint
CREATE TYPE "public"."owner" AS ENUM('josh', 'neil');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "account_type" DEFAULT 'client' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"kind" "milestone_kind" NOT NULL,
	"sequence" integer NOT NULL,
	"owner" "owner" NOT NULL,
	"target_date" date,
	"delivered_link" text,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"date" date NOT NULL,
	"text" text NOT NULL,
	"client_visible" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"title" text NOT NULL,
	"brand" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"audience" "otp_audience" NOT NULL,
	"ip" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner" "owner" NOT NULL,
	"title" text NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "login_emails" ADD CONSTRAINT "login_emails_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "login_emails_email_unique" ON "login_emails" USING btree ("email");--> statement-breakpoint
CREATE INDEX "login_emails_account_idx" ON "login_emails" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "milestones_order_sequence_unique" ON "milestones" USING btree ("order_id","sequence");--> statement-breakpoint
CREATE INDEX "notes_account_idx" ON "notes" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "orders_account_idx" ON "orders" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "otp_codes_email_created_idx" ON "otp_codes" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "otp_codes_ip_created_idx" ON "otp_codes" USING btree ("ip","created_at");--> statement-breakpoint
CREATE INDEX "tasks_owner_idx" ON "tasks" USING btree ("owner");