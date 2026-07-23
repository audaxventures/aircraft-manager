-- CreateEnum
CREATE TYPE "DutyLogType" AS ENUM ('FLIGHT', 'ADMIN');

-- AlterTable
ALTER TABLE "DutyDayLog" ADD COLUMN     "dutyType" "DutyLogType" NOT NULL DEFAULT 'FLIGHT';
