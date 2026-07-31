"use client";

import { ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function NoAccessPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 text-center shadow-xs">
        <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-warning/15 text-warning-foreground">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">No access yet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account hasn&apos;t been granted access to any pages. Contact your administrator to have some
            enabled in Settings &gt; Team members.
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
