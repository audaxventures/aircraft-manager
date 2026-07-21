"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { getWeekOverviewStats, buildOverviewDraft, getMaintenanceCandidates, type MaintenanceItem } from "@/lib/weekly-reports";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export async function regenerateOverviewDraft(reportDate: string): Promise<{ ok: true; draft: string } | { ok: false; error: string }> {
  const date = new Date(reportDate);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Invalid date" };
  const [aircraft, stats] = await Promise.all([getPrimaryAircraft(), getWeekOverviewStats(date)]);
  return { ok: true, draft: buildOverviewDraft(stats, aircraft?.tailNumber ?? "") };
}

export async function regenerateMaintenanceCandidates(
  reportDate: string
): Promise<{ ok: true; items: MaintenanceItem[] } | { ok: false; error: string }> {
  const date = new Date(reportDate);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Invalid date" };
  const items = await getMaintenanceCandidates(date);
  return { ok: true, items };
}

const maintenanceItemSchema = z.object({
  description: z.string(),
  due: z.string(),
});

const weeklyReportSchema = z.object({
  id: z.string().optional(),
  reportDate: z.coerce.date(),
  ownerOperator: z.string().optional(),
  programManager: z.string().optional(),
  weekOverview: z.string(),
  accomplishments: z.array(z.string()),
  newIssues: z.array(z.string()),
  toBeCompleted: z.array(z.string()),
  customerDecisions: z.array(z.string()),
  maintenanceItems: z.array(maintenanceItemSchema),
});

export async function saveWeeklyReport(input: unknown): Promise<ActionResult> {
  const parsed = weeklyReportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, ownerOperator, programManager, accomplishments, newIssues, toBeCompleted, customerDecisions, maintenanceItems, ...rest } =
    parsed.data;
  const data = {
    ...rest,
    ownerOperator: ownerOperator || null,
    programManager: programManager || null,
    accomplishments: accomplishments.filter((s) => s.trim() !== ""),
    newIssues: newIssues.filter((s) => s.trim() !== ""),
    toBeCompleted: toBeCompleted.filter((s) => s.trim() !== ""),
    customerDecisions: customerDecisions.filter((s) => s.trim() !== ""),
    maintenanceItems: maintenanceItems.filter((m) => m.description.trim() !== "" || m.due.trim() !== ""),
  };

  let reportId = id;
  if (id) {
    await prisma.weeklyReport.update({ where: { id }, data });
  } else {
    const created = await prisma.weeklyReport.create({ data });
    reportId = created.id;
  }

  revalidatePath("/weekly-reports");
  return { ok: true, id: reportId };
}

export async function deleteWeeklyReport(id: string): Promise<ActionResult> {
  await prisma.weeklyReport.delete({ where: { id } });
  revalidatePath("/weekly-reports");
  return { ok: true };
}
