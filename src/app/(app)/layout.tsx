import { AppShell } from "@/components/layout/app-shell";
import { getPrimaryAircraft } from "@/lib/aircraft";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const aircraft = await getPrimaryAircraft();

  return <AppShell tailNumber={aircraft?.tailNumber ?? "Aircraft Manager"}>{children}</AppShell>;
}
