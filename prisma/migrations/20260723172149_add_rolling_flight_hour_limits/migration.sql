-- AlterTable
ALTER TABLE "RegulatorySettings" ADD COLUMN     "flightHours12MonthLimit" DECIMAL(6,2) NOT NULL DEFAULT 1200,
ADD COLUMN     "flightHours30DayLimit" DECIMAL(6,2) NOT NULL DEFAULT 120,
ADD COLUMN     "flightHours90DayLimit" DECIMAL(6,2) NOT NULL DEFAULT 300;
