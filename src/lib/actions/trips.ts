"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { decimalHourToUtcDate } from "@/lib/flight-time";
import { upsertDutyDayLogFromTrip } from "@/lib/duty";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };
type CreateResult = { ok: true; id: string; name: string } | { ok: false; error: string };

const DECIMAL_HOUR_RE = /^([0-9]|1[0-9]|2[0-3])\.[0-9]$/;

const timeSchema = z
  .string()
  .optional()
  .refine((v) => !v || DECIMAL_HOUR_RE.test(v), "Time must be in HH.T format, e.g. 14.3")
  .transform((v) => (v ? Math.round(parseFloat(v) * 10) / 10 : undefined));

const tripSchema = z
  .object({
    id: z.string().optional(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    departureAirport: z.string().min(1, "Departure is required"),
    arrivalAirport: z.string().min(1, "Arrival is required"),
    routeLabel: z.string().optional(),
    hours: z.coerce.number({ message: "Enter valid hours" }).nonnegative(),
    cycles: z.coerce.number().int().nonnegative(),
    miles: z.coerce.number().int().nonnegative(),
    purpose: z.string().optional(),
    notes: z.string().optional(),
    pilotId: z.string().optional(),
    secondPilotId: z.string().optional(),
    takeoffTime: timeSchema,
    landingTime: timeSchema,
    dayTakeoffs: z.coerce.number().int().nonnegative(),
    dayLandings: z.coerce.number().int().nonnegative(),
    nightTakeoffs: z.coerce.number().int().nonnegative(),
    nightLandings: z.coerce.number().int().nonnegative(),
    passengerIds: z.array(z.string()).default([]),
  })
  .refine((d) => d.dayTakeoffs + d.nightTakeoffs === d.cycles, {
    message: "Day + night takeoffs must equal total cycles",
    path: ["dayTakeoffs"],
  })
  .refine((d) => d.dayLandings + d.nightLandings === d.cycles, {
    message: "Day + night landings must equal total cycles",
    path: ["dayLandings"],
  })
  .refine((d) => !d.pilotId || !d.secondPilotId || d.pilotId !== d.secondPilotId, {
    message: "Pilot in command and second in command must be different pilots",
    path: ["secondPilotId"],
  });

export async function saveTrip(input: unknown): Promise<ActionResult> {
  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, endDate, routeLabel, purpose, notes, pilotId, secondPilotId, takeoffTime, landingTime, passengerIds, ...rest } =
    parsed.data;
  const data = {
    ...rest,
    takeoffTime,
    landingTime,
    endDate: endDate ?? null,
    routeLabel: routeLabel || `${rest.departureAirport} - ${rest.arrivalAirport}`,
    purpose: purpose || null,
    notes: notes || null,
    pilotId: pilotId || null,
    secondPilotId: secondPilotId || null,
    status: rest.hours > 0 ? ("COMPLETED" as const) : ("PLANNED" as const),
  };

  const tripId = await prisma.$transaction(async (tx) => {
    let trip;
    if (id) {
      trip = await tx.trip.update({ where: { id }, data });
      await tx.tripPassenger.deleteMany({ where: { tripId: id } });
    } else {
      trip = await tx.trip.create({ data });
    }
    if (passengerIds.length > 0) {
      await tx.tripPassenger.createMany({
        data: passengerIds.map((passengerId) => ({ tripId: trip.id, passengerId })),
      });
    }
    return trip.id;
  });

  if (takeoffTime !== undefined && landingTime !== undefined) {
    const reportTime = decimalHourToUtcDate(data.date, takeoffTime - 1);
    const landingForDutyCalc = landingTime < takeoffTime ? landingTime + 24 : landingTime;
    const dutyEndTime = decimalHourToUtcDate(data.date, landingForDutyCalc + 0.5);

    const pilotIds = [...new Set([data.pilotId, data.secondPilotId].filter((p): p is string => !!p))];
    for (const pid of pilotIds) {
      await upsertDutyDayLogFromTrip(pid, data.date, reportTime, dutyEndTime);
    }
  }

  revalidatePath("/trips");
  revalidatePath("/costs");
  revalidatePath("/duty-days");
  revalidatePath("/currency");
  revalidatePath("/reports");
  revalidatePath("/schedule");
  revalidatePath("/");
  return { ok: true, id: tripId };
}

export async function deleteTrip(id: string): Promise<ActionResult> {
  await prisma.trip.delete({ where: { id } });
  revalidatePath("/trips");
  revalidatePath("/costs");
  revalidatePath("/duty-days");
  revalidatePath("/currency");
  revalidatePath("/reports");
  revalidatePath("/schedule");
  revalidatePath("/");
  return { ok: true };
}

const presetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  columns: z.array(z.string()).min(1, "Select at least one column"),
});

export async function saveTripExportPreset(input: unknown): Promise<ActionResult> {
  const parsed = presetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.tripExportPreset.update({ where: { id }, data });
    } else {
      await prisma.tripExportPreset.create({ data });
    }
  } catch {
    return { ok: false, error: "A preset with that name already exists." };
  }

  revalidatePath("/trips");
  return { ok: true };
}

export async function deleteTripExportPreset(id: string): Promise<ActionResult> {
  await prisma.tripExportPreset.delete({ where: { id } });
  revalidatePath("/trips");
  return { ok: true };
}

export async function createPassenger(name: string): Promise<CreateResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required" };

  try {
    const passenger = await prisma.passenger.upsert({
      where: { name: trimmed },
      update: {},
      create: { name: trimmed },
    });
    revalidatePath("/trips");
    return { ok: true, id: passenger.id, name: passenger.name };
  } catch {
    return { ok: false, error: "Could not add passenger" };
  }
}
