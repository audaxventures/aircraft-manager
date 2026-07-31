"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const allowedPages = session?.user?.allowedPages ?? [];

  const visibleItems = navItems.filter((item) => {
    if (role === "OWNER") return true;
    if (!item.key) return false; // Settings — Owner-only
    return allowedPages.includes(item.key);
  });

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {visibleItems.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { SidebarNav };
