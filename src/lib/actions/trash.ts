"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import type { TrashKind } from "@/lib/trash";

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll() {
  revalidatePath("/trips");
  revalidatePath("/costs");
  revalidatePath("/duty-days");
  revalidatePath("/currency");
  revalidatePath("/reports");
  revalidatePath("/schedule");
  revalidatePath("/weekly-reports");
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function restoreTrashItem(kind: TrashKind, id: string): Promise<ActionResult> {
  try {
    switch (kind) {
      case "trip":
        await prisma.trip.update({ where: { id }, data: { archived: false } });
        break;
      case "cost":
        await prisma.costEntry.update({ where: { id }, data: { archived: false } });
        break;
      case "duty":
        await prisma.dutyDayLog.update({ where: { id }, data: { archived: false } });
        break;
      case "event":
        await prisma.calendarEvent.update({ where: { id }, data: { archived: false } });
        break;
      case "weekly-report":
        await prisma.weeklyReport.update({ where: { id }, data: { archived: false } });
        break;
    }
  } catch {
    return { ok: false, error: "Could not restore this item — it may have already been restored or removed." };
  }

  revalidateAll();
  return { ok: true };
}
