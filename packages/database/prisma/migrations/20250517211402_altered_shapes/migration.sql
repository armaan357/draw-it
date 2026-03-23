/*
  Warnings:

  - You are about to drop the column `shapeId` on the `Chats` table. All the data in the column will be lost.
  - You are about to drop the `Shapes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `x` to the `Chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y` to the `Chats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chats" DROP CONSTRAINT "Chats_id_fkey";

-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "shapeId",
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "rad" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER,
ADD COLUMN     "x" INTEGER NOT NULL,
ADD COLUMN     "y" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Shapes";
