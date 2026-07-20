"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };
type CreateResult = { ok: true; id: string; name: string } | { ok: false; error: string };

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
  });

export async function saveTrip(input: unknown): Promise<ActionResult> {
  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, endDate, routeLabel, purpose, notes, pilotId, passengerIds, ...rest } = parsed.data;
  const data = {
    ...rest,
    endDate: endDate ?? null,
    routeLabel: routeLabel || `${rest.departureAirport} - ${rest.arrivalAirport}`,
    purpose: purpose || null,
    notes: notes || null,
    pilotId: pilotId || null,
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
