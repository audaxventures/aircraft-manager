"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { PAGE_KEYS } from "@/lib/page-access";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireOwner() {
  const session = await auth();
  return session?.user?.role === "OWNER" ? session : null;
}

/** True if removing/demoting this user would leave the team with no active owner. */
async function wouldRemoveLastOwner(userId: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing?.role !== "OWNER") return false;
  const ownerCount = await prisma.user.count({ where: { role: "OWNER", archived: false } });
  return ownerCount <= 1;
}

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().optional(),
  role: z.enum(["OWNER", "MEMBER"]),
  allowedPages: z.array(z.enum(PAGE_KEYS)).default([]),
});

export async function saveUser(input: unknown): Promise<ActionResult> {
  if (!(await requireOwner())) return { ok: false, error: "Only the owner can manage team members." };

  const parsed = userSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, name, email, password, role, allowedPages } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  if (!id && !password) return { ok: false, error: "Set a password for the new team member." };
  if (password && password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  if (id && role === "MEMBER" && (await wouldRemoveLastOwner(id))) {
    return { ok: false, error: "Can't demote the last owner — promote someone else first." };
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  try {
    if (id) {
      await prisma.user.update({ where: { id }, data: { name, email: normalizedEmail, role, allowedPages, ...(passwordHash ? { passwordHash } : {}) } });
    } else {
      // passwordHash is guaranteed set here — validated above that a new user must have a password.
      await prisma.user.create({ data: { name, email: normalizedEmail, role, allowedPages, passwordHash: passwordHash! } });
    }
  } catch {
    return { ok: false, error: "A team member with that email already exists." };
  }

  revalidatePath("/settings");
  return { ok: true };
}

export async function setUserArchived(id: string, archived: boolean): Promise<ActionResult> {
  if (!(await requireOwner())) return { ok: false, error: "Only the owner can manage team members." };

  if (archived && (await wouldRemoveLastOwner(id))) {
    return { ok: false, error: "Can't deactivate the last owner." };
  }

  await prisma.user.update({ where: { id }, data: { archived } });
  revalidatePath("/settings");
  return { ok: true };
}
