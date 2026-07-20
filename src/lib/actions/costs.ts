"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

import { prisma } from "@/lib/db";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const costEntrySchema = z.object({
  id: z.string().optional(),
  date: z.coerce.date(),
  categoryId: z.string().min(1, "Category is required"),
  vendorId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  amount: z.coerce.number({ message: "Enter a valid amount" }).finite("Enter a valid amount"),
  currency: z.enum(["CAD", "USD"]).default("CAD"),
  notes: z.string().optional(),
});

export async function saveCostEntry(input: unknown): Promise<ActionResult> {
  const parsed = costEntrySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, vendorId, invoiceNumber, notes, ...rest } = parsed.data;
  const data = {
    ...rest,
    vendorId: vendorId || null,
    invoiceNumber: invoiceNumber || null,
    notes: notes || null,
  };

  let entryId = id;
  if (id) {
    await prisma.costEntry.update({ where: { id }, data });
  } else {
    const created = await prisma.costEntry.create({ data });
    entryId = created.id;
  }

  revalidatePath("/costs");
  revalidatePath("/reports");
  revalidatePath("/");
  return { ok: true, id: entryId };
}

export async function deleteCostEntry(id: string): Promise<ActionResult> {
  const attachments = await prisma.attachment.findMany({ where: { costEntryId: id } });
  await prisma.costEntry.delete({ where: { id } });
  for (const a of attachments) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(a.url).catch(() => {});
    }
  }

  revalidatePath("/costs");
  revalidatePath("/reports");
  revalidatePath("/");
  return { ok: true };
}

export async function uploadCostAttachment(costEntryId: string, formData: FormData): Promise<ActionResult> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "No file selected" };
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, error: "File storage is not configured (BLOB_READ_WRITE_TOKEN missing)" };
  }

  const blob = await put(`cost-entries/${costEntryId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  await prisma.attachment.create({
    data: {
      filename: file.name,
      url: blob.url,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      costEntryId,
    },
  });

  revalidatePath("/costs");
  return { ok: true };
}

export async function deleteAttachment(id: string): Promise<ActionResult> {
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment) return { ok: false, error: "Attachment not found" };

  await prisma.attachment.delete({ where: { id } });
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(attachment.url).catch(() => {});
  }

  revalidatePath("/costs");
  return { ok: true };
}
