import {
  LayoutDashboard,
  PlaneTakeoff,
  Receipt,
  Timer,
  BadgeCheck,
  FileBarChart,
  CalendarDays,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Trips", href: "/trips", icon: PlaneTakeoff },
  { label: "Costs", href: "/costs", icon: Receipt },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "Duty Days", href: "/duty-days", icon: Timer },
  { label: "Currency", href: "/currency", icon: BadgeCheck },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings },
];
