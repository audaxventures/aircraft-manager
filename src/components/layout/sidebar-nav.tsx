"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight } from "lucide-react";

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
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {visibleItems.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="size-5" />
            {item.label}
            {active && <ChevronRight className="ml-auto size-4" />}
          </Link>
        );
      })}
    </nav>
  );
}

export { SidebarNav };
