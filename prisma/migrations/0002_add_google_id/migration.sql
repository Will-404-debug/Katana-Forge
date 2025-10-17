-- Add the Google ID column to store OAuth identifiers
ALTER TABLE "User"
ADD COLUMN "googleId" TEXT;

-- Ensure Google IDs remain unique across users
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
