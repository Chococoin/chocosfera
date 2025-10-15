-- AlterTable
ALTER TABLE "User" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "User_parentId_idx" ON "User"("parentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
