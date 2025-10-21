-- CreateTable
CREATE TABLE "KatanaDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT,
    "guestToken" TEXT,
    "handleColor" TEXT NOT NULL,
    "bladeTint" TEXT NOT NULL,
    "metalness" REAL NOT NULL,
    "roughness" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KatanaDraft_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "KatanaDraft_guestToken_key" ON "KatanaDraft"("guestToken");
