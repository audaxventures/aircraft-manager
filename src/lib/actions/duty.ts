"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const dutySchema = z
  .object({
    id: z.string().optional(),
    pilotId: z.string().min(1, "Pilot is required"),
    dutyType: z.enum(["FLIGHT", "ADMIN"]).default("FLIGHT"),
    date: z.coerce.date(),
    reportTime: z.coerce.date(),
    dutyEndTime: z.coerce.date(),
    restPeriodBeforeHours: z.coerce.number().nonnegative(),
    splitDutyApplied: z.boolean().default(false),
    splitDutyNote: z.string().optional(),
    unforeseenCircumstancesApplied: z.boolean().default(false),
    unforeseenCircumstancesNote: z.string().optional(),
    unforeseenSignedByName: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((d) => !(d.splitDutyApplied && d.unforeseenCircumstancesApplied), {
    message: "Split-duty and unforeseen operational circumstances extensions can't both be applied to the same duty entry.",
    path: ["unforeseenCircumstancesApplied"],
  })
  .refine((d) => !d.unforeseenCircumstancesApplied || !!d.unforeseenSignedByName?.trim(), {
    message: "Enter the pilot's name to sign the unforeseen operational circumstances notification.",
    path: ["unforeseenSignedByName"],
  });

export async function saveDutyDayLog(input: unknown): Promise<ActionResult> {
  const parsed = dutySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (parsed.data.dutyEndTime <= parsed.data.reportTime) {
    return { ok: false, error: "Duty end time must be after report time" };
  }

  const { id, splitDutyNote, unforeseenCircumstancesNote, unforeseenSignedByName, notes, ...rest } = parsed.data;

  // Preserve the original signature timestamp across edits that don't change
  // who signed; only a new or changed signature gets re-stamped.
  const signedName = unforeseenSignedByName?.trim() || null;
  let unforeseenSignedAt: Date | null = null;
  if (signedName) {
    const existing = id
      ? await prisma.dutyDayLog.findUnique({
          where: { id },
          select: { unforeseenSignedByName: true, unforeseenSignedAt: true },
        })
      : null;
    unforeseenSignedAt =
      existing?.unforeseenSignedByName === signedName && existing.unforeseenSignedAt ? existing.unforeseenSignedAt : new Date();
  }

  const data = {
    ...rest,
    splitDutyNote: splitDutyNote || null,
    unforeseenCircumstancesNote: unforeseenCircumstancesNote || null,
    unforeseenSignedByName: signedName,
    unforeseenSignedAt,
    notes: notes || null,
  };

  let logId = id;
  try {
    if (id) {
      await prisma.dutyDayLog.update({ where: { id }, data });
    } else {
      // A previously soft-deleted log can still hold this pilot+date+dutyType
      // slot (the unique constraint doesn't know about `archived`) -- restore
      // it instead of failing with a false "already exists" error.
      const archivedDuplicate = await prisma.dutyDayLog.findUnique({
        where: { pilotId_date_dutyType: { pilotId: data.pilotId, date: data.date, dutyType: data.dutyType } },
      });
      if (archivedDuplicate?.archived) {
        await prisma.dutyDayLog.update({ where: { id: archivedDuplicate.id }, data: { ...data, archived: false } });
        logId = archivedDuplicate.id;
      } else {
        const created = await prisma.dutyDayLog.create({ data });
        logId = created.id;
      }
    }
  } catch {
    return { ok: false, error: "A duty log of this type for this pilot on this date already exists." };
  }

  revalidatePath("/duty-days");
  revalidatePath("/reports");
  revalidatePath("/");
  return { ok: true, id: logId };
}

export async function deleteDutyDayLog(id: string): Promise<ActionResult> {
  await prisma.dutyDayLog.update({ where: { id }, data: { archived: true } });
  revalidatePath("/duty-days");
  revalidatePath("/");
  return { ok: true };
}
