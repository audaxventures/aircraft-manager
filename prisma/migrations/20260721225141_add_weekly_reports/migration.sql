-- AlterTable
ALTER TABLE "Aircraft" ADD COLUMN     "ownerOperator" TEXT,
ADD COLUMN     "programManager" TEXT,
ADD COLUMN     "purchaseTotalCycles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "purchaseTotalHours" DECIMAL(8,1) NOT NULL DEFAULT 0,
ADD COLUMN     "serialNumber" TEXT;

-- CreateTable
CREATE TABLE "WeeklyReport" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "ownerOperator" TEXT,
    "programManager" TEXT,
    "weekOverview" TEXT NOT NULL,
    "accomplishments" TEXT[],
    "newIssues" TEXT[],
    "toBeCompleted" TEXT[],
    "customerDecisions" TEXT[],
    "maintenanceItems" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyReport_reportDate_idx" ON "WeeklyReport"("reportDate");
