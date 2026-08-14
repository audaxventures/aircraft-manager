"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const calendarEventSchema = z
  .object({
    id: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    title: z.string().min(1, "Title is required"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    pilotId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((d) => d.endDate >= d.startDate, { message: "End date must be on or after the start date", path: ["endDate"] });

export async function saveCalendarEvent(input: unknown): Promise<ActionResult> {
  const parsed = calendarEventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, pilotId, notes, ...rest } = parsed.data;
  const data = { ...rest, pilotId: pilotId || null, notes: notes || null };

  let eventId = id;
  if (id) {
    await prisma.calendarEvent.update({ where: { id }, data });
  } else {
    const created = await prisma.calendarEvent.create({ data });
    eventId = created.id;
  }

  revalidatePath("/schedule");
  return { ok: true, id: eventId };
}

export async function deleteCalendarEvent(id: string): Promise<ActionResult> {
  await prisma.calendarEvent.update({ where: { id }, data: { archived: true } });
  revalidatePath("/schedule");
  return { ok: true };
}

const plannedTripSchema = z
  .object({
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    departureAirport: z.string().min(1, "Departure is required"),
    arrivalAirport: z.string().min(1, "Arrival is required"),
    pilotId: z.string().optional(),
    secondPilotId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((d) => !d.endDate || d.endDate >= d.date, { message: "End date must be on or after the start date", path: ["endDate"] })
  .refine((d) => !d.pilotId || !d.secondPilotId || d.pilotId !== d.secondPilotId, {
    message: "Pilot 1 and Pilot 2 must be different pilots",
    path: ["secondPilotId"],
  });

export async function savePlannedTrip(input: unknown): Promise<ActionResult> {
  const parsed = plannedTripSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { date, endDate, departureAirport, arrivalAirport, pilotId, secondPilotId, notes } = parsed.data;
  const hasReturn = !!endDate && endDate.getTime() !== date.getTime();
  const trip = await prisma.trip.create({
    data: {
      date,
      endDate: hasReturn ? endDate : null,
      pilotId: pilotId || null,
      secondPilotId: secondPilotId || null,
      notes: notes || null,
      status: "PLANNED",
      routeLabel: `${departureAirport} - ${arrivalAirport}`,
      legs: {
        create: [
          { legOrder: 0, date, departureAirport, arrivalAirport },
          // A placeholder return leg so the Schedule shows "At {destination}"
          // for the days in between and the return date itself, even before
          // the actual return flight's times are known.
          ...(hasReturn ? [{ legOrder: 1, date: endDate, departureAirport: arrivalAirport, arrivalAirport: departureAirport }] : []),
        ],
      },
    },
  });

  revalidatePath("/schedule");
  revalidatePath("/trips");
  return { ok: true, id: trip.id };
}
