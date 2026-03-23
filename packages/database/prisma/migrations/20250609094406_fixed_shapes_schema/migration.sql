/*
  Warnings:

  - You are about to drop the column `rad` on the `Chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "rad",
ADD COLUMN     "radX" INTEGER,
ADD COLUMN     "radY" INTEGER,
ADD COLUMN     "toX" INTEGER,
ADD COLUMN     "toY" INTEGER;
