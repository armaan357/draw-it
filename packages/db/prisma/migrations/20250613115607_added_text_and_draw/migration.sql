-- AlterTable
ALTER TABLE "Chats" ADD COLUMN     "allCoordinates" JSONB[] DEFAULT ARRAY[]::JSONB[];
