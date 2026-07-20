import { AppShell } from "@/components/layout/app-shell";
import { getPrimaryAircraft } from "@/lib/aircraft";

// Every page under this layout reads live operational data straight from the
// database (costs, trips, duty logs, currency) — none of it should ever be
// served from a build-time static cache.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const aircraft = await getPrimaryAircraft();

  return <AppShell tailNumber={aircraft?.tailNumber ?? "Aircraft Manager"}>{children}</AppShell>;
}
