/*
  Warnings:

  - You are about to drop the column `userEmail` on the `Gratitude` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Gratitude` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the userId column as nullable
ALTER TABLE "Gratitude" ADD COLUMN "userId" TEXT;

-- Update existing records to set userId based on userEmail
UPDATE "Gratitude" g
SET "userId" = u.id
FROM "User" u
WHERE g."userEmail" = u.email;

-- Make userId required and add the foreign key constraint
ALTER TABLE "Gratitude" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Gratitude" ADD CONSTRAINT "Gratitude_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old userEmail column and its foreign key constraint
ALTER TABLE "Gratitude" DROP CONSTRAINT "Gratitude_userEmail_fkey";
ALTER TABLE "Gratitude" DROP COLUMN "userEmail";
