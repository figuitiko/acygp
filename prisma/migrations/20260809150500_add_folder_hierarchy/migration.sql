-- DropIndex
DROP INDEX "FileCategory_name_key";

-- AlterTable
ALTER TABLE "FileCategory" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "FileCategory_parentId_idx" ON "FileCategory"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "FileCategory_parentId_name_key" ON "FileCategory"("parentId", "name");

-- AddForeignKey
ALTER TABLE "FileCategory" ADD CONSTRAINT "FileCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FileCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
