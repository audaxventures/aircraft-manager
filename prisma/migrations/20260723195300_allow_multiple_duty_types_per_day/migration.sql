-- DropIndex
DROP INDEX "DutyDayLog_pilotId_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "DutyDayLog_pilotId_date_dutyType_key" ON "DutyDayLog"("pilotId", "date", "dutyType");

