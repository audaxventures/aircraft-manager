"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const dutySchema = z.object({
  id: z.string().optional(),
  pilotId: z.string().min(1, "Pilot is required"),
  dutyType: z.enum(["FLIGHT", "ADMIN"]).default("FLIGHT"),
  date: z.coerce.date(),
  reportTime: z.coerce.date(),
  dutyEndTime: z.coerce.date(),
  restPeriodBeforeHours: z.coerce.number().nonnegative(),
  splitDutyApplied: z.boolean().default(false),
  splitDutyNote: z.string().optional(),
  notes: z.string().optional(),
});

export async function saveDutyDayLog(input: unknown): Promise<ActionResult> {
  const parsed = dutySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (parsed.data.dutyEndTime <= parsed.data.reportTime) {
    return { ok: false, error: "Duty end time must be after report time" };
  }

  const { id, splitDutyNote, notes, ...rest } = parsed.data;
  const data = { ...rest, splitDutyNote: splitDutyNote || null, notes: notes || null };

  let logId = id;
  try {
    if (id) {
      await prisma.dutyDayLog.update({ where: { id }, data });
    } else {
      const created = await prisma.dutyDayLog.create({ data });
      logId = created.id;
    }
  } catch {
    return { ok: false, error: "A duty log of this type for this pilot on this date already exists." };
  }

  revalidatePath("/duty-days");
  revalidatePath("/");
  return { ok: true, id: logId };
}

export async function deleteDutyDayLog(id: string): Promise<ActionResult> {
  await prisma.dutyDayLog.delete({ where: { id } });
  revalidatePath("/duty-days");
  revalidatePath("/");
  return { ok: true };
}
