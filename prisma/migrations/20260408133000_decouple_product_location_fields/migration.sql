ALTER TABLE "product_location"
ALTER COLUMN "shelfId" DROP NOT NULL;

ALTER TABLE "product_location"
ADD COLUMN "aisleName" TEXT,
ADD COLUMN "sectionName" TEXT,
ADD COLUMN "shelfLabel" TEXT;
