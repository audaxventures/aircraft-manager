-- CreateTable
CREATE TABLE "HistoricalAnnualTotal" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "hours" DECIMAL(8,1) NOT NULL,
    "cycles" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoricalAnnualTotal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalAnnualTotal_year_key" ON "HistoricalAnnualTotal"("year");
