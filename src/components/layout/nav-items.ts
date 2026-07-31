import {
  LayoutDashboard,
  PlaneTakeoff,
  Receipt,
  Timer,
  BadgeCheck,
  FileBarChart,
  CalendarDays,
  ClipboardList,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { PageKey } from "@/lib/page-access";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  // Omitted for Settings, which is always Owner-only regardless of allowedPages.
  key?: PageKey;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, key: "dashboard" },
  { label: "Trips", href: "/trips", icon: PlaneTakeoff, key: "trips" },
  { label: "Costs", href: "/costs", icon: Receipt, key: "costs" },
  { label: "Schedule", href: "/schedule", icon: CalendarDays, key: "schedule" },
  { label: "Duty Days", href: "/duty-days", icon: Timer, key: "duty-days" },
  { label: "Currency", href: "/currency", icon: BadgeCheck, key: "currency" },
  { label: "Reports", href: "/reports", icon: FileBarChart, key: "reports" },
  { label: "Weekly Reports", href: "/weekly-reports", icon: ClipboardList, key: "weekly-reports" },
  { label: "Settings", href: "/settings", icon: Settings },
];
