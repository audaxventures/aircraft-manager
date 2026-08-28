import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { PAGE_KEYS, PAGE_HREFS, resolvePageForPath } from "@/lib/page-access";

/**
 * The very first successful login bootstraps a single OWNER row in the
 * database from ADMIN_EMAIL/ADMIN_PASSWORD_HASH, carrying the existing
 * bcrypt hash over unchanged. Once any User row exists, the env vars are
 * never consulted again — all logins (including the owner's) go through
 * the User table, and new team members are added via Settings > Team members.
 */
async function bootstrapOwnerIfNeeded(email: string, password: string) {
  const userCount = await prisma.user.count();
  if (userCount > 0) return null;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminPasswordHash) return null;
  if (email !== adminEmail.trim().toLowerCase()) return null;

  const valid = await bcrypt.compare(password, adminPasswordHash);
  if (!valid) return null;

  return prisma.user.create({
    data: {
      email: adminEmail.trim().toLowerCase(),
      passwordHash: adminPasswordHash,
      name: "Operator",
      role: "OWNER",
      allowedPages: [...PAGE_KEYS],
    },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Vercel (and most reverse-proxy hosts) terminate TLS in front of the app
  // and forward the real host via headers — without this, Auth.js rejects
  // every request in production as an "untrusted host".
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const emailInput = credentials?.email;
        const password = credentials?.password;
        if (typeof emailInput !== "string" || typeof password !== "string") return null;
        const email = emailInput.trim().toLowerCase();

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await bootstrapOwnerIfNeeded(email, password);
          if (!user) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role, allowedPages: user.allowedPages };
        }

        if (user.archived) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role, allowedPages: user.allowedPages };
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth, request }) => {
      if (!auth?.user) return false;
      if (auth.user.role === "OWNER") return true;

      const pageKey = resolvePageForPath(request.nextUrl.pathname);
      if (pageKey === null) return true; // unmapped route — allow, just require login
      if (pageKey !== "settings" && auth.user.allowedPages.includes(pageKey)) return true;

      // Blocked: bounce to the member's first allowed page, or a dedicated
      // "no access" screen if they haven't been granted anything yet.
      const firstAllowed = PAGE_KEYS.find((k) => auth.user.allowedPages.includes(k));
      const target = firstAllowed ? PAGE_HREFS[firstAllowed] : "/no-access";
      if (request.nextUrl.pathname === target) return true; // avoid a redirect loop
      return NextResponse.redirect(new URL(target, request.nextUrl));
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.allowedPages = user.allowedPages;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "MEMBER";
        session.user.allowedPages = token.allowedPages ?? [];
      }
      return session;
    },
  },
});
