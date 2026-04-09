-- DropForeignKey
ALTER TABLE "product_location" DROP CONSTRAINT "product_location_shelfId_fkey";

-- AddForeignKey
ALTER TABLE "product_location" ADD CONSTRAINT "product_location_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "shelves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
