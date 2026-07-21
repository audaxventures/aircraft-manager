-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "landingTime" DECIMAL(4,1),
ADD COLUMN     "secondPilotId" TEXT,
ADD COLUMN     "takeoffTime" DECIMAL(4,1);

-- CreateTable
CREATE TABLE "TripExportPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "columns" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripExportPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripExportPreset_name_key" ON "TripExportPreset"("name");

-- CreateIndex
CREATE INDEX "Trip_secondPilotId_idx" ON "Trip"("secondPilotId");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_secondPilotId_fkey" FOREIGN KEY ("secondPilotId") REFERENCES "Pilot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
