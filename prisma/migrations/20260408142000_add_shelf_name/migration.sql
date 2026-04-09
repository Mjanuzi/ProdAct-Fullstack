ALTER TABLE "shelves"
ADD COLUMN "name" TEXT;

UPDATE "shelves"
SET "name" = 'Hylla ' || "id"
WHERE "name" IS NULL OR BTRIM("name") = '';

ALTER TABLE "shelves"
ALTER COLUMN "name" SET NOT NULL;
