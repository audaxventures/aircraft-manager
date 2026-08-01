// Grantable sidebar pages for team members. Deliberately excludes Settings —
// that page (and the Team members tab within it) is always Owner-only,
// never something a Member can be granted, since it can change everyone's
// access including their own.
export const PAGE_KEYS = [
  "dashboard",
  "trips",
  "costs",
  "schedule",
  "duty-days",
  "currency",
  "reports",
  "weekly-reports",
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LABELS: Record<PageKey, string> = {
  dashboard: "Dashboard",
  trips: "Trips",
  costs: "Costs",
  schedule: "Schedule",
  "duty-days": "Duty Days",
  currency: "Currency",
  reports: "Reports",
  "weekly-reports": "Weekly Reports",
};

export const PAGE_HREFS: Record<PageKey, string> = {
  dashboard: "/",
  trips: "/trips",
  costs: "/costs",
  schedule: "/schedule",
  "duty-days": "/duty-days",
  currency: "/currency",
  reports: "/reports",
  "weekly-reports": "/weekly-reports",
};

export function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(value);
}

// Report/export API routes, mapped to the page whose UI triggers them, so a
// member without that page's access can't reach the download endpoint by
// hitting the URL directly either.
const EXTRA_PATH_PAGE: { prefix: string; page: PageKey }[] = [
  { prefix: "/api/reports/duty-day", page: "duty-days" },
  { prefix: "/api/reports/unforeseen-circumstances", page: "duty-days" },
  { prefix: "/api/reports/currency", page: "currency" },
  { prefix: "/api/reports/costs", page: "costs" },
  { prefix: "/api/reports/schedule", page: "schedule" },
  { prefix: "/api/reports/trips", page: "trips" },
  { prefix: "/api/reports/weekly", page: "weekly-reports" },
  { prefix: "/api/reports/monthly-summary", page: "reports" },
];

/** Resolves a request pathname to the page it belongs to, for server-side access checks. */
export function resolvePageForPath(pathname: string): PageKey | "settings" | null {
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return "settings";
  // Full-database export dumps every table (all costs, all trips, etc.) —
  // always Owner-only, same as the Settings page it's downloaded from.
  if (pathname.startsWith("/api/reports/full-export")) return "settings";
  for (const { prefix, page } of EXTRA_PATH_PAGE) {
    if (pathname.startsWith(prefix)) return page;
  }
  if (pathname === "/") return "dashboard";
  for (const key of PAGE_KEYS) {
    const href = PAGE_HREFS[key];
    if (href !== "/" && (pathname === href || pathname.startsWith(href + "/"))) return key;
  }
  return null;
}
