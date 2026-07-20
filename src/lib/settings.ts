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

export async function getVendors(includeArchived = false) {
  return prisma.vendor.findMany({
    where: includeArchived ? undefined : { archived: false },
    orderBy: { name: "asc" },
  });
}

export async function getEventCategories(includeArchived = false) {
  return prisma.eventCategory.findMany({
    where: includeArchived ? undefined : { archived: false },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
