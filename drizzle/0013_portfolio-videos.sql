CREATE TYPE "public"."work_kind" AS ENUM('scripted', 'unscripted');--> statement-breakpoint
CREATE TABLE "portfolio_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"goal" text DEFAULT '' NOT NULL,
	"format" text DEFAULT '' NOT NULL,
	"deliverables" text DEFAULT '' NOT NULL,
	"why_it_worked" text DEFAULT '' NOT NULL,
	"src" text NOT NULL,
	"poster" text NOT NULL,
	"kind" "work_kind" NOT NULL,
	"position" double precision NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_videos_slug_unique" ON "portfolio_videos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "portfolio_videos_position_idx" ON "portfolio_videos" USING btree ("position");