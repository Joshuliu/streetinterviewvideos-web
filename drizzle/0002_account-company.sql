ALTER TABLE "accounts" ADD COLUMN "company" text;--> statement-breakpoint
UPDATE "accounts" SET "company" = "name" WHERE "company" IS NULL;--> statement-breakpoint
UPDATE "orders" SET "brand" = a."name" FROM "accounts" a WHERE "orders"."account_id" = a."id" AND "orders"."brand" IS NULL;
