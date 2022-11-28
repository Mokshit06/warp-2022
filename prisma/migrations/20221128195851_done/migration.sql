/*
  Warnings:

  - Added the required column `type` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Journey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Journey` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    CONSTRAINT "Suggestion_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserFollows" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserFollows_A_fkey" FOREIGN KEY ("A") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserFollows_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "longitude" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "firstVisitedAt" DATETIME NOT NULL,
    "journeyId" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Place_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Place_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Place" ("firstVisitedAt", "id", "journeyId", "latitude", "longitude", "name", "photo", "userId") SELECT "firstVisitedAt", "id", "journeyId", "latitude", "longitude", "name", "photo", "userId" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
CREATE TABLE "new_Journey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "image" TEXT NOT NULL
);
INSERT INTO "new_Journey" ("from", "id", "to") SELECT "from", "id", "to" FROM "Journey";
DROP TABLE "Journey";
ALTER TABLE "new_Journey" RENAME TO "Journey";
CREATE UNIQUE INDEX "Journey_from_to_key" ON "Journey"("from", "to");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_UserFollows_AB_unique" ON "_UserFollows"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFollows_B_index" ON "_UserFollows"("B");
