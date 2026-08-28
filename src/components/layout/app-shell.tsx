"use client";

import * as React from "react";
import Image from "next/image";
import { Menu, Plane, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";

interface AppShellProps {
  tailNumber: string;
  children: React.ReactNode;
}

function AppShell({ tailNumber, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-svh w-full bg-background">
      {/* Desktop sidebar — floating card, pinned in place while the page scrolls */}
      <aside className="sticky top-4 my-4 ml-4 hidden h-[calc(100svh-2rem)] w-64 shrink-0 overflow-hidden rounded-3xl shadow-xl md:flex">
        <SidebarPanel tailNumber={tailNumber} />
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-semibold">{tailNumber}</span>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile nav drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 gap-0 border-transparent bg-transparent p-0 sm:max-w-64">
          <SidebarPanel tailNumber={tailNumber} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SidebarPanel({ tailNumber, onNavigate }: { tailNumber: string; onNavigate?: () => void }) {
  return (
    <div className="relative flex h-full w-full flex-1 flex-col">
      <Image src="/images/sidebar-background.png" alt="" fill priority className="object-cover" />
      <div className="relative flex h-full flex-col">
        <SidebarBrand tailNumber={tailNumber} />
        <SidebarNav onNavigate={onNavigate} />
        <SidebarFooter />
      </div>
    </div>
  );
}

function SidebarBrand({ tailNumber }: { tailNumber: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/15 px-5 py-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
        <Plane className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xl font-bold text-white">{tailNumber}</div>
        <div className="text-xs font-semibold tracking-widest text-white/60">OPERATIONS</div>
      </div>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="p-3">
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </div>
  );
}

export { AppShell };
