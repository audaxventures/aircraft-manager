import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "OWNER" | "MEMBER";
    allowedPages: string[];
  }

  interface Session {
    user: {
      id: string;
      role: "OWNER" | "MEMBER";
      allowedPages: string[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "OWNER" | "MEMBER";
    allowedPages?: string[];
  }
}
