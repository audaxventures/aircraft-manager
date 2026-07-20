// Seeds reference data (aircraft, cost categories, regulatory settings) that
// the app needs before any historical records are imported. Safe to re-run.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const FIXED_CATEGORIES = ["Hangar", "Pilot Salary", "Insurance", "Training", "Publications"];
const DIRECT_CATEGORIES = [
  "Nav Canada",
  "Crew Expenses",
  "Catering",
  "Parking/Customs/Landing",
  "Maintenance",
  "Fuel",
  "WAA",
  "Fast Air",
  "RRCC",
  "Gogo",
];

async function main() {
  const aircraft = await prisma.aircraft.findFirst();
  if (!aircraft) {
    await prisma.aircraft.create({
      data: {
        tailNumber: "C-FPFX",
        type: "Cessna Citation 750 (Citation X)",
        baseAirport: "CYWG — Winnipeg, MB",
        fiscalYearStartMonth: 1,
      },
    });
    console.log("Created aircraft C-FPFX");
  }

  for (const [i, name] of FIXED_CATEGORIES.entries()) {
    await prisma.costCategory.upsert({
      where: { name },
      update: {},
      create: { name, type: "FIXED", sortOrder: i },
    });
  }
  for (const [i, name] of DIRECT_CATEGORIES.entries()) {
    await prisma.costCategory.upsert({
      where: { name },
      update: {},
      create: { name, type: "DIRECT", sortOrder: i },
    });
  }
  console.log(`Ensured ${FIXED_CATEGORIES.length + DIRECT_CATEGORIES.length} cost categories`);

  const regSettings = await prisma.regulatorySettings.findFirst();
  if (!regSettings) {
    await prisma.regulatorySettings.create({ data: {} });
    console.log("Created default regulatory settings");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
