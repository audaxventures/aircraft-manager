-- CreateTable
CREATE TABLE "TripLeg" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "legOrder" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "departureAirport" TEXT NOT NULL,
    "arrivalAirport" TEXT NOT NULL,
    "departureTime" DECIMAL(4,1),
    "landingTime" DECIMAL(4,1),
    "hours" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "cycles" INTEGER NOT NULL DEFAULT 0,
    "miles" INTEGER NOT NULL DEFAULT 0,
    "dayTakeoffs" INTEGER NOT NULL DEFAULT 0,
    "dayLandings" INTEGER NOT NULL DEFAULT 0,
    "nightTakeoffs" INTEGER NOT NULL DEFAULT 0,
    "nightLandings" INTEGER NOT NULL DEFAULT 0,
    "pilotInstrumentApproaches" INTEGER NOT NULL DEFAULT 0,
    "secondPilotInstrumentApproaches" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripLeg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TripLeg_tripId_idx" ON "TripLeg"("tripId");

-- CreateIndex
CREATE INDEX "TripLeg_date_idx" ON "TripLeg"("date");

-- AddForeignKey
ALTER TABLE "TripLeg" ADD CONSTRAINT "TripLeg_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: backfill leg #1 (the outbound/only leg) for every existing trip,
-- from the about-to-be-dropped flat Trip columns.
INSERT INTO "TripLeg" (
    "id", "tripId", "legOrder", "date", "departureAirport", "arrivalAirport",
    "departureTime", "landingTime", "hours", "cycles", "miles",
    "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings",
    "pilotInstrumentApproaches", "secondPilotInstrumentApproaches",
    "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text, "id", 0, "date", "departureAirport", "arrivalAirport",
    "takeoffTime", "landingTime", "hours", "cycles", "miles",
    "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings",
    "pilotInstrumentApproaches", "secondPilotInstrumentApproaches",
    "createdAt", "updatedAt"
FROM "Trip";

-- DataMigration: backfill leg #2 (the return leg) for multi-day trips that had a
-- distinct returnDepartureTime -- airports reversed since the old model only
-- stored a single departure/arrival pair for the whole trip.
INSERT INTO "TripLeg" (
    "id", "tripId", "legOrder", "date", "departureAirport", "arrivalAirport",
    "departureTime", "landingTime", "hours", "cycles", "miles",
    "dayTakeoffs", "dayLandings", "nightTakeoffs", "nightLandings",
    "pilotInstrumentApproaches", "secondPilotInstrumentApproaches",
    "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text, "id", 1, "endDate", "arrivalAirport", "departureAirport",
    "returnDepartureTime", NULL, 0, 0, 0,
    0, 0, 0, 0,
    0, 0,
    "createdAt", "updatedAt"
FROM "Trip"
WHERE "endDate" IS NOT NULL AND "endDate" != "date";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "arrivalAirport",
DROP COLUMN "dayLandings",
DROP COLUMN "dayTakeoffs",
DROP COLUMN "departureAirport",
DROP COLUMN "landingTime",
DROP COLUMN "nightLandings",
DROP COLUMN "nightTakeoffs",
DROP COLUMN "pilotInstrumentApproaches",
DROP COLUMN "returnDepartureTime",
DROP COLUMN "secondPilotInstrumentApproaches",
DROP COLUMN "takeoffTime";
