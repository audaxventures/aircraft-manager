import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AircraftForm } from "@/components/settings/aircraft-form";
import { CostCategoriesManager } from "@/components/settings/cost-categories-manager";
import { PilotsManager } from "@/components/settings/pilots-manager";
import { VendorsManager } from "@/components/settings/vendors-manager";
import { EventCategoriesManager } from "@/components/settings/event-categories-manager";
import { RegulatorySettingsForm } from "@/components/settings/regulatory-settings-form";
import { getPrimaryAircraft } from "@/lib/aircraft";
import {
  getCostCategories,
  getEventCategories,
  getPilots,
  getRegulatorySettings,
  getVendors,
} from "@/lib/settings";
import { toNumber } from "@/lib/format";

export default async function SettingsPage() {
  const [aircraft, categories, pilots, vendors, eventCategories, regSettings] = await Promise.all([
    getPrimaryAircraft(),
    getCostCategories(true),
    getPilots(true),
    getVendors(true),
    getEventCategories(true),
    getRegulatorySettings(),
  ]);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Aircraft, cost categories, vendors, pilots, event categories, and regulatory thresholds."
      />
      <Tabs defaultValue="aircraft">
        <TabsList>
          <TabsTrigger value="aircraft">Aircraft</TabsTrigger>
          <TabsTrigger value="categories">Cost categories</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="pilots">Pilots</TabsTrigger>
          <TabsTrigger value="event-categories">Event categories</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory thresholds</TabsTrigger>
        </TabsList>
        <TabsContent value="aircraft">
          <AircraftForm
            aircraft={
              aircraft && {
                id: aircraft.id,
                tailNumber: aircraft.tailNumber,
                type: aircraft.type,
                baseAirport: aircraft.baseAirport,
                fiscalYearStartMonth: aircraft.fiscalYearStartMonth,
                serialNumber: aircraft.serialNumber,
                ownerOperator: aircraft.ownerOperator,
                programManager: aircraft.programManager,
                purchaseTotalHours: toNumber(aircraft.purchaseTotalHours),
                purchaseTotalCycles: aircraft.purchaseTotalCycles,
              }
            }
          />
        </TabsContent>
        <TabsContent value="categories">
          <CostCategoriesManager categories={categories} />
        </TabsContent>
        <TabsContent value="vendors">
          <VendorsManager vendors={vendors} />
        </TabsContent>
        <TabsContent value="pilots">
          <PilotsManager pilots={pilots} />
        </TabsContent>
        <TabsContent value="event-categories">
          <EventCategoriesManager categories={eventCategories} />
        </TabsContent>
        <TabsContent value="regulatory">
          <RegulatorySettingsForm
            settings={{
              id: regSettings.id,
              maxFlightDutyHours: toNumber(regSettings.maxFlightDutyHours),
              extendedMaxFlightDutyHours: toNumber(regSettings.extendedMaxFlightDutyHours),
              rolling30DayFlightHoursLimit: toNumber(regSettings.rolling30DayFlightHoursLimit),
              extensionRestPeriodHours: toNumber(regSettings.extensionRestPeriodHours),
              minRestPeriodHours: toNumber(regSettings.minRestPeriodHours),
              restPeriodWindowDays: regSettings.restPeriodWindowDays,
              splitDutyMaxExtensionHours: toNumber(regSettings.splitDutyMaxExtensionHours),
              splitDutyMinRestHours: toNumber(regSettings.splitDutyMinRestHours),
              currencyTakeoffsRequired: regSettings.currencyTakeoffsRequired,
              currencyLandingsRequired: regSettings.currencyLandingsRequired,
              currencyPeriodMonths: regSettings.currencyPeriodMonths,
              flightHours30DayLimit: toNumber(regSettings.flightHours30DayLimit),
              flightHours90DayLimit: toNumber(regSettings.flightHours90DayLimit),
              flightHours12MonthLimit: toNumber(regSettings.flightHours12MonthLimit),
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
