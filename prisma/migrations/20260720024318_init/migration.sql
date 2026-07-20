-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('FIXED', 'DIRECT');

-- CreateTable
CREATE TABLE "Aircraft" (
    "id" TEXT NOT NULL,
    "tailNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseAirport" TEXT NOT NULL,
    "fiscalYearStartMonth" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aircraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CostType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "vendor" TEXT,
    "invoiceNumber" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pilot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pilot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "departureAirport" TEXT NOT NULL,
    "arrivalAirport" TEXT NOT NULL,
    "routeLabel" TEXT,
    "hours" DECIMAL(6,2) NOT NULL,
    "cycles" INTEGER NOT NULL DEFAULT 1,
    "miles" INTEGER NOT NULL DEFAULT 0,
    "purpose" TEXT,
    "notes" TEXT,
    "pilotId" TEXT,
    "dayTakeoffs" INTEGER NOT NULL DEFAULT 0,
    "dayLandings" INTEGER NOT NULL DEFAULT 0,
    "nightTakeoffs" INTEGER NOT NULL DEFAULT 0,
    "nightLandings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPassenger" (
    "tripId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,

    CONSTRAINT "TripPassenger_pkey" PRIMARY KEY ("tripId","passengerId")
);

-- CreateTable
CREATE TABLE "DutyDayLog" (
    "id" TEXT NOT NULL,
    "pilotId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reportTime" TIMESTAMP(3) NOT NULL,
    "dutyEndTime" TIMESTAMP(3) NOT NULL,
    "restPeriodBeforeHours" DECIMAL(6,2) NOT NULL,
    "splitDutyApplied" BOOLEAN NOT NULL DEFAULT false,
    "splitDutyNote" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DutyDayLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "costEntryId" TEXT,
    "tripId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatorySettings" (
    "id" TEXT NOT NULL,
    "maxFlightDutyHours" DECIMAL(4,2) NOT NULL DEFAULT 14,
    "extendedMaxFlightDutyHours" DECIMAL(4,2) NOT NULL DEFAULT 15,
    "rolling30DayFlightHoursLimit" DECIMAL(5,2) NOT NULL DEFAULT 70,
    "extensionRestPeriodHours" DECIMAL(4,2) NOT NULL DEFAULT 24,
    "minRestPeriodHours" DECIMAL(4,2) NOT NULL DEFAULT 36,
    "restPeriodWindowDays" INTEGER NOT NULL DEFAULT 7,
    "splitDutyMaxExtensionHours" DECIMAL(4,2) NOT NULL DEFAULT 4,
    "splitDutyMinRestHours" DECIMAL(4,2) NOT NULL DEFAULT 4,
    "currencyTakeoffsRequired" INTEGER NOT NULL DEFAULT 5,
    "currencyLandingsRequired" INTEGER NOT NULL DEFAULT 5,
    "currencyPeriodMonths" INTEGER NOT NULL DEFAULT 6,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegulatorySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Aircraft_tailNumber_key" ON "Aircraft"("tailNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CostCategory_name_key" ON "CostCategory"("name");

-- CreateIndex
CREATE INDEX "CostEntry_date_idx" ON "CostEntry"("date");

-- CreateIndex
CREATE INDEX "CostEntry_categoryId_idx" ON "CostEntry"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Pilot_name_key" ON "Pilot"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_name_key" ON "Passenger"("name");

-- CreateIndex
CREATE INDEX "Trip_date_idx" ON "Trip"("date");

-- CreateIndex
CREATE INDEX "Trip_pilotId_idx" ON "Trip"("pilotId");

-- CreateIndex
CREATE INDEX "TripPassenger_passengerId_idx" ON "TripPassenger"("passengerId");

-- CreateIndex
CREATE INDEX "DutyDayLog_pilotId_date_idx" ON "DutyDayLog"("pilotId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DutyDayLog_pilotId_date_key" ON "DutyDayLog"("pilotId", "date");

-- AddForeignKey
ALTER TABLE "CostEntry" ADD CONSTRAINT "CostEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CostCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPassenger" ADD CONSTRAINT "TripPassenger_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPassenger" ADD CONSTRAINT "TripPassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyDayLog" ADD CONSTRAINT "DutyDayLog_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_costEntryId_fkey" FOREIGN KEY ("costEntryId") REFERENCES "CostEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
