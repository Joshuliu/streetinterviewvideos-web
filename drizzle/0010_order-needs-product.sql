-- Does something physical have to reach the host before we can shoot? True for
-- most orders, false for apps/services — it renames the client's approval
-- milestone and drops the product from the chase copy. Defaults true, so every
-- existing order keeps the wording it already had and the currently-deployed
-- code (which never reads the column) is unaffected.
ALTER TABLE "orders" ADD COLUMN "needs_product" boolean DEFAULT true NOT NULL;
