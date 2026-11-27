BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "products" p
    JOIN "subcategories" s ON s."id" = p."subcategoryId"
    WHERE p."categoryId" <> s."categoryId"
  ) THEN
    RAISE EXCEPTION 'Some products reference a subcategory in a different category. Correct these associations before applying the migration.';
  END IF;
END $$;

ALTER TABLE "products"
  ALTER COLUMN "price" TYPE DECIMAL(12, 2),
  ADD COLUMN "oldPrice" DECIMAL(12, 2),
  ADD COLUMN "description" TEXT;

ALTER TABLE "categories" ADD COLUMN "isOutlet" BOOLEAN NOT NULL DEFAULT false;
UPDATE "categories" SET "isOutlet" = true WHERE "slug" = 'utsenka';

CREATE UNIQUE INDEX "subcategories_categoryId_id_key" ON "subcategories" ("categoryId", "id");

ALTER TABLE "products"
  DROP CONSTRAINT "products_subcategoryId_fkey",
  ADD CONSTRAINT "products_categoryId_subcategoryId_fkey"
    FOREIGN KEY ("categoryId", "subcategoryId")
    REFERENCES "subcategories" ("categoryId", "id")
    ON DELETE CASCADE ON UPDATE RESTRICT;

COMMIT;
