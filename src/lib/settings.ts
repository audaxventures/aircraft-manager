import { prisma } from "@/lib/db";

export async function getRegulatorySettings() {
  const existing = await prisma.regulatorySettings.findFirst();
  if (existing) return existing;
  return prisma.regulatorySettings.create({ data: {} });
}

export async function getCostCategories(includeArchived = false) {
  return prisma.costCategory.findMany({
    where: includeArchived ? undefined : { archived: false },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getPilots(includeArchived = false) {
  return prisma.pilot.findMany({
    where: includeArchived ? undefined : { archived: false },
    orderBy: { name: "asc" },
  });
}
