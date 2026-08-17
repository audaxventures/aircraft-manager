"use server";

import { randomUUID } from "crypto";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { decimalHourToUtcDate, parseDecimalHour } from "@/lib/flight-time";
import { upsertDutyDayLogFromTrip } from "@/lib/duty";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };
type CreateResult = { ok: true; id: string; name: string } | { ok: false; error: string };

const timeSchema = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v) return undefined;
    const parsed = parseDecimalHour(v);
    if (parsed === null) {
      ctx.addIssue({ code: "custom", message: "Time must be in HH.T format, e.g. 14.3" });
      return z.NEVER;
    }
    return parsed;
  });

const legSchema = z
  .object({
    date: z.coerce.date(),
    departureAirport: z.string().min(1, "Departure is required"),
    arrivalAirport: z.string().min(1, "Arrival is required"),
    departureTime: timeSchema,
    landingTime: timeSchema,
    hours: z.coerce.number({ message: "Enter valid hours" }).nonnegative(),
    miles: z.coerce.number().int().nonnegative(),
    dayTakeoffs: z.coerce.number().int().nonnegative(),
    dayLandings: z.coerce.number().int().nonnegative(),
    nightTakeoffs: z.coerce.number().int().nonnegative(),
    nightLandings: z.coerce.number().int().nonnegative(),
    pilotInstrumentApproaches: z.coerce.number().int().nonnegative().default(0),
    secondPilotInstrumentApproaches: z.coerce.number().int().nonnegative().default(0),
    passengerIds: z.array(z.string()).default([]),
  })
  .refine((d) => d.dayTakeoffs + d.nightTakeoffs === d.dayLandings + d.nightLandings, {
    message: "Total takeoffs must equal total landings on each leg",
    path: ["dayTakeoffs"],
  });

const tripSchema = z
  .object({
    id: z.string().optional(),
    isSimulator: z.boolean().default(false),
    routeLabel: z.string().optional(),
    purpose: z.string().optional(),
    notes: z.string().optional(),
    pilotId: z.string().optional(),
    secondPilotId: z.string().optional(),
    legs: z.array(legSchema).min(1, "At least one leg is required"),
  })
  .refine((d) => !d.pilotId || !d.secondPilotId || d.pilotId !== d.secondPilotId, {
    message: "Pilot in command and second in command must be different pilots",
    path: ["secondPilotId"],
  });

/** "CYWG - CYYZ" for a single leg; "CYWG → KPSP → CYWG" for a multi-leg itinerary. */
function autoRouteLabel(legs: { departureAirport: string; arrivalAirport: string }[]): string {
  if (legs.length === 1) return `${legs[0].departureAirport} - ${legs[0].arrivalAirport}`;
  return [legs[0].departureAirport, ...legs.map((l) => l.arrivalAirport)].join(" → ");
}

export async function saveTrip(input: unknown): Promise<ActionResult> {
  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, routeLabel, purpose, notes, pilotId, secondPilotId, legs, isSimulator } = parsed.data;

  const legDates = legs.map((l) => l.date.getTime());
  const minDate = new Date(Math.min(...legDates));
  const maxDate = new Date(Math.max(...legDates));
  const totalHours = legs.reduce((s, l) => s + l.hours, 0);
  const totalMiles = isSimulator ? 0 : legs.reduce((s, l) => s + l.miles, 0);
  const totalCycles = legs.reduce((s, l) => s + l.dayTakeoffs + l.nightTakeoffs, 0);

  const data = {
    date: minDate,
    endDate: maxDate.getTime() !== minDate.getTime() ? maxDate : null,
    hours: totalHours,
    cycles: totalCycles,
    miles: totalMiles,
    routeLabel: routeLabel || autoRouteLabel(legs),
    purpose: purpose || null,
    notes: notes || null,
    pilotId: pilotId || null,
    secondPilotId: secondPilotId || null,
    status: totalHours > 0 ? ("COMPLETED" as const) : ("PLANNED" as const),
    isSimulator,
  };

  const tripId = await prisma.$transaction(async (tx) => {
    let trip;
    if (id) {
      trip = await tx.trip.update({ where: { id }, data });
      // Cascades away that trip's TripLegPassenger rows along with the legs.
      await tx.tripLeg.deleteMany({ where: { tripId: id } });
    } else {
      trip = await tx.trip.create({ data });
    }
    // IDs generated client-side (rather than left to the DB default) so the
    // passenger junction rows below can reference them in the same batch.
    const legRows = legs.map((l, i) => ({
      id: randomUUID(),
      tripId: trip.id,
      legOrder: i,
      date: l.date,
      departureAirport: l.departureAirport,
      arrivalAirport: l.arrivalAirport,
      departureTime: l.departureTime ?? null,
      landingTime: l.landingTime ?? null,
      hours: l.hours,
      cycles: l.dayTakeoffs + l.nightTakeoffs,
      miles: isSimulator ? 0 : l.miles,
      dayTakeoffs: l.dayTakeoffs,
      dayLandings: l.dayLandings,
      nightTakeoffs: l.nightTakeoffs,
      nightLandings: l.nightLandings,
      pilotInstrumentApproaches: l.pilotInstrumentApproaches,
      secondPilotInstrumentApproaches: l.secondPilotInstrumentApproaches,
    }));
    await tx.tripLeg.createMany({ data: legRows });

    const passengerRows = legs.flatMap((l, i) =>
      l.passengerIds.map((passengerId) => ({ tripLegId: legRows[i].id, passengerId }))
    );
    if (passengerRows.length > 0) {
      await tx.tripLegPassenger.createMany({ data: passengerRows });
    }
    return trip.id;
  });

  // One duty-day upsert per leg that has both a departure and landing time --
  // upsertDutyDayLogFromTrip widens an existing same-pilot/same-date entry
  // rather than creating a conflicting second one, so multiple legs flown by
  // the same pilot on the same calendar day naturally collapse into a single
  // duty day log entry.
  const pilotIds = [...new Set([data.pilotId, data.secondPilotId].filter((p): p is string => !!p))];
  for (const leg of legs) {
    if (leg.departureTime === undefined || leg.landingTime === undefined) continue;
    const reportTime = decimalHourToUtcDate(leg.date, leg.departureTime - 1);
    const landingForDutyCalc = leg.landingTime < leg.departureTime ? leg.landingTime + 24 : leg.landingTime;
    const dutyEndTime = decimalHourToUtcDate(leg.date, landingForDutyCalc + 0.5);
    for (const pid of pilotIds) {
      await upsertDutyDayLogFromTrip(pid, leg.date, reportTime, dutyEndTime);
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
  await prisma.trip.update({ where: { id }, data: { archived: true } });
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
