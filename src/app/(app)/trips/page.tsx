import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { LinkTabs } from "@/components/shared/link-tabs";
import { TripFilters } from "@/components/trips/trip-filters";
import { TripsView } from "@/components/trips/trips-view";
import { PassengerPicker } from "@/components/trips/passenger-picker";
import { EmptyState } from "@/components/shared/empty-state";
import { getTrips, getTripHoursAndMiles, getPassengerOptions, getPassengerHistory } from "@/lib/trips";
import { getPilots } from "@/lib/settings";
import { getMtdRange, getYtdRange } from "@/lib/date-ranges";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { formatDate, formatHours, formatNumber } from "@/lib/format";
import { Users } from "lucide-react";

interface TripsPageProps {
  searchParams: Promise<{
    tab?: string;
    range?: string;
    from?: string;
    to?: string;
    q?: string;
    pilotId?: string;
    passengerId?: string;
  }>;
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const params = await searchParams;
  const aircraft = await getPrimaryAircraft();
  const fiscalStartMonth = aircraft?.fiscalYearStartMonth ?? 1;
  const now = new Date();

  let range: { start: Date; end: Date } | undefined;
  if (params.from || params.to) {
    range = {
      start: params.from ? new Date(params.from) : new Date(0),
      end: params.to ? new Date(new Date(params.to).getTime() + 86400000) : new Date(now.getTime() + 86400000),
    };
  } else if (params.range === "mtd") {
    range = getMtdRange(now);
  } else if (params.range === "ytd") {
    range = getYtdRange(now, fiscalStartMonth);
  } else {
    range = undefined;
  }

  const [trips, pilots, passengerOptions, ytdFlying, mtdFlying] = await Promise.all([
    getTrips({ from: range?.start, to: range?.end, pilotId: params.pilotId, search: params.q }),
    getPilots(),
    getPassengerOptions(),
    getTripHoursAndMiles(getYtdRange(now, fiscalStartMonth)),
    getTripHoursAndMiles(getMtdRange(now)),
  ]);

  const activeTab = params.tab === "passengers" ? "passengers" : "trips";
  const passengerHistory = params.passengerId ? await getPassengerHistory(params.passengerId) : null;

  return (
    <div>
      <PageHeader title="Trips" description="Flight log, hours, and passenger history." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="YTD hours" value={formatHours(ytdFlying.hours)} />
        <KpiCard label="MTD hours" value={formatHours(mtdFlying.hours)} />
        <KpiCard label="YTD trips" value={ytdFlying.tripCount} />
        <KpiCard label="YTD miles" value={formatNumber(ytdFlying.miles)} />
      </div>

      <LinkTabs
        className="mb-5"
        items={[
          { label: "All trips", href: "/trips?tab=trips", active: activeTab === "trips" },
          { label: "Passengers", href: "/trips?tab=passengers", active: activeTab === "passengers" },
        ]}
      />

      {activeTab === "trips" ? (
        <>
          <TripFilters pilots={pilots} />
          <TripsView trips={trips} pilots={pilots} passengerOptions={passengerOptions} />
        </>
      ) : (
        <div className="space-y-5">
          <PassengerPicker options={passengerOptions} />
          {passengerHistory ? (
            passengerHistory.trips.length > 0 ? (
              <div className="rounded-lg border bg-card">
                <div className="border-b px-4 py-2.5 text-sm font-medium">
                  {passengerHistory.passengerName} · {passengerHistory.trips.length} trip
                  {passengerHistory.trips.length === 1 ? "" : "s"}
                </div>
                <ul className="divide-y">
                  {passengerHistory.trips.map((t) => (
                    <li key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{formatDate(t.date)}</span>
                      <span>{t.routeLabel || `${t.departureAirport} - ${t.arrivalAirport}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyState icon={<Users className="size-8" />} title="No trips found for this passenger" />
            )
          ) : (
            <EmptyState
              icon={<Users className="size-8" />}
              title="Search for a passenger"
              description="Pick a name above to see every trip they've flown on."
            />
          )}
        </div>
      )}
    </div>
  );
}
