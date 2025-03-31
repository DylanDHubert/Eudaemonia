-- First add the new columns
ALTER TABLE "DailyEntry" ADD COLUMN "cannabis" BOOLEAN;
ALTER TABLE "DailyEntry" ADD COLUMN "cannabisAmount" INTEGER;

-- Copy data from old columns to new columns
UPDATE "DailyEntry" SET "cannabis" = "weed";
UPDATE "DailyEntry" SET "cannabisAmount" = "weedAmount";

-- Drop the old columns
ALTER TABLE "DailyEntry" DROP COLUMN "weed";
ALTER TABLE "DailyEntry" DROP COLUMN "weedAmount"; 