/*
  Warnings:

  - You are about to drop the column `message` on the `Chats` table. All the data in the column will be lost.
  - Added the required column `shapeId` to the `Chats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "message",
ADD COLUMN     "shapeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Shapes" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "rad" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "Shapes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_id_fkey" FOREIGN KEY ("id") REFERENCES "Shapes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
