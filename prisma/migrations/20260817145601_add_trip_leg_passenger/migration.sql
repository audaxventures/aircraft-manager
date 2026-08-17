-- CreateTable
CREATE TABLE "TripLegPassenger" (
    "tripLegId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,

    CONSTRAINT "TripLegPassenger_pkey" PRIMARY KEY ("tripLegId","passengerId")
);

-- CreateIndex
CREATE INDEX "TripLegPassenger_passengerId_idx" ON "TripLegPassenger"("passengerId");

-- Defensive: a foreign key target needs an actual PRIMARY KEY/UNIQUE
-- constraint, not just a unique index -- add one if somehow missing (see the
-- add_trip_legs migration's history for why this matters).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = '"TripLeg"'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE "TripLeg" ADD CONSTRAINT "TripLeg_pkey" PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = '"Passenger"'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_pkey" PRIMARY KEY (id);
  END IF;
END $$;

-- AddForeignKey
ALTER TABLE "TripLegPassenger" ADD CONSTRAINT "TripLegPassenger_tripLegId_fkey" FOREIGN KEY ("tripLegId") REFERENCES "TripLeg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripLegPassenger" ADD CONSTRAINT "TripLegPassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: assign each existing trip-level passenger to every leg of
-- that trip (matches prior semantics, where a passenger was implicitly on
-- the whole trip since legs weren't tracked separately yet).
INSERT INTO "TripLegPassenger" ("tripLegId", "passengerId")
SELECT tl."id", tp."passengerId"
FROM "TripPassenger" tp
JOIN "TripLeg" tl ON tl."tripId" = tp."tripId"
ON CONFLICT DO NOTHING;

-- DropTable
DROP TABLE "TripPassenger";
