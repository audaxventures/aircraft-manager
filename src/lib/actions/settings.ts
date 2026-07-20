"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

type ActionResult = { ok: true } | { ok: false; error: string };

const aircraftSchema = z.object({
  id: z.string().optional(),
  tailNumber: z.string().min(1, "Tail number is required").toUpperCase(),
  type: z.string().min(1, "Aircraft type is required"),
  baseAirport: z.string().min(1, "Base airport is required"),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12),
});

export async function saveAircraft(input: unknown): Promise<ActionResult> {
  const parsed = aircraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.aircraft.update({ where: { id }, data });
    } else {
      await prisma.aircraft.create({ data });
    }
  } catch {
    return { ok: false, error: "That tail number is already in use." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

const costCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["FIXED", "DIRECT"]),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveCostCategory(input: unknown): Promise<ActionResult> {
  const parsed = costCategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.costCategory.update({ where: { id }, data });
    } else {
      await prisma.costCategory.create({ data });
    }
  } catch {
    return { ok: false, error: "A category with that name already exists." };
  }

  revalidatePath("/settings");
  revalidatePath("/costs");
  return { ok: true };
}

export async function setCostCategoryArchived(id: string, archived: boolean): Promise<ActionResult> {
  await prisma.costCategory.update({ where: { id }, data: { archived } });
  revalidatePath("/settings");
  revalidatePath("/costs");
  return { ok: true };
}

const pilotSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
});

export async function savePilot(input: unknown): Promise<ActionResult> {
  const parsed = pilotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.pilot.update({ where: { id }, data });
    } else {
      await prisma.pilot.create({ data });
    }
  } catch {
    return { ok: false, error: "A pilot with that name already exists." };
  }

  revalidatePath("/settings");
  revalidatePath("/trips");
  revalidatePath("/duty-days");
  revalidatePath("/currency");
  return { ok: true };
}

export async function setPilotArchived(id: string, archived: boolean): Promise<ActionResult> {
  await prisma.pilot.update({ where: { id }, data: { archived } });
  revalidatePath("/settings");
  return { ok: true };
}

const vendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
});

export async function saveVendor(input: unknown): Promise<ActionResult> {
  const parsed = vendorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.vendor.update({ where: { id }, data });
    } else {
      await prisma.vendor.create({ data });
    }
  } catch {
    return { ok: false, error: "A vendor with that name already exists." };
  }

  revalidatePath("/settings");
  revalidatePath("/costs");
  return { ok: true };
}

export async function setVendorArchived(id: string, archived: boolean): Promise<ActionResult> {
  await prisma.vendor.update({ where: { id }, data: { archived } });
  revalidatePath("/settings");
  revalidatePath("/costs");
  return { ok: true };
}

const eventCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveEventCategory(input: unknown): Promise<ActionResult> {
  const parsed = eventCategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.eventCategory.update({ where: { id }, data });
    } else {
      await prisma.eventCategory.create({ data });
    }
  } catch {
    return { ok: false, error: "An event category with that name already exists." };
  }

  revalidatePath("/settings");
  revalidatePath("/schedule");
  return { ok: true };
}

export async function setEventCategoryArchived(id: string, archived: boolean): Promise<ActionResult> {
  await prisma.eventCategory.update({ where: { id }, data: { archived } });
  revalidatePath("/settings");
  revalidatePath("/schedule");
  return { ok: true };
}

const regulatorySettingsSchema = z.object({
  id: z.string(),
  maxFlightDutyHours: z.coerce.number().positive(),
  extendedMaxFlightDutyHours: z.coerce.number().positive(),
  rolling30DayFlightHoursLimit: z.coerce.number().positive(),
  extensionRestPeriodHours: z.coerce.number().positive(),
  minRestPeriodHours: z.coerce.number().positive(),
  restPeriodWindowDays: z.coerce.number().int().positive(),
  splitDutyMaxExtensionHours: z.coerce.number().nonnegative(),
  splitDutyMinRestHours: z.coerce.number().nonnegative(),
  currencyTakeoffsRequired: z.coerce.number().int().positive(),
  currencyLandingsRequired: z.coerce.number().int().positive(),
  currencyPeriodMonths: z.coerce.number().int().positive(),
});

export async function saveRegulatorySettings(input: unknown): Promise<ActionResult> {
  const parsed = regulatorySettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, ...data } = parsed.data;
  await prisma.regulatorySettings.update({ where: { id }, data });

  revalidatePath("/settings");
  revalidatePath("/duty-days");
  revalidatePath("/currency");
  return { ok: true };
}
