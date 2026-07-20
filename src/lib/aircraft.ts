import { prisma } from "@/lib/db";

// Single-aircraft tool for now: always operate on the first Aircraft row.
// Modeled as a table (not a hardcoded constant) so a second tail number
// could be added later without a schema change.
export async function getPrimaryAircraft() {
  return prisma.aircraft.findFirst({ orderBy: { createdAt: "asc" } });
}
