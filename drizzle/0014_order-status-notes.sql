CREATE TYPE "public"."order_status" AS ENUM('ongoing', 'completed', 'canceled');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "status" "order_status" DEFAULT 'ongoing' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "notes" text DEFAULT '' NOT NULL;