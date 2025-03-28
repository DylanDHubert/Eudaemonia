-- AlterTable
ALTER TABLE "DailyEntry" ADD COLUMN     "foodQuality" INTEGER,
ADD COLUMN     "meals" INTEGER;

-- CreateTable
CREATE TABLE "CustomCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomCategoryEntry" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "dailyEntryId" TEXT NOT NULL,
    "customCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomCategoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomCategory_userId_name_key" ON "CustomCategory"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomCategoryEntry_dailyEntryId_customCategoryId_key" ON "CustomCategoryEntry"("dailyEntryId", "customCategoryId");

-- AddForeignKey
ALTER TABLE "CustomCategory" ADD CONSTRAINT "CustomCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomCategoryEntry" ADD CONSTRAINT "CustomCategoryEntry_dailyEntryId_fkey" FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomCategoryEntry" ADD CONSTRAINT "CustomCategoryEntry_customCategoryId_fkey" FOREIGN KEY ("customCategoryId") REFERENCES "CustomCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
