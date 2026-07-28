-- AlterTable
ALTER TABLE "DutyDayLog" ADD COLUMN     "unforeseenCircumstancesApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unforeseenCircumstancesNote" TEXT,
ADD COLUMN     "unforeseenSignedAt" TIMESTAMP(3),
ADD COLUMN     "unforeseenSignedByName" TEXT;

-- AlterTable
ALTER TABLE "RegulatorySettings" DROP COLUMN "currencyLandingsRequired",
DROP COLUMN "currencyTakeoffsRequired",
ADD COLUMN     "currencyDayLandingsRequired" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "currencyDayTakeoffsRequired" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "currencyNightLandingsRequired" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "currencyNightTakeoffsRequired" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "instrumentApproachesPeriodMonths" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "instrumentApproachesRequired" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "unforeseenMaxDutyHours" DECIMAL(4,2) NOT NULL DEFAULT 18,
ADD COLUMN     "unforeseenMaxExtensionHours" DECIMAL(4,2) NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "pilotInstrumentApproaches" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "secondPilotInstrumentApproaches" INTEGER NOT NULL DEFAULT 0;

