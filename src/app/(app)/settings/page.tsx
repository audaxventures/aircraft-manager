import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AircraftForm } from "@/components/settings/aircraft-form";
import { CostCategoriesManager } from "@/components/settings/cost-categories-manager";
import { PilotsManager } from "@/components/settings/pilots-manager";
import { RegulatorySettingsForm } from "@/components/settings/regulatory-settings-form";
import { getPrimaryAircraft } from "@/lib/aircraft";
import { getCostCategories, getPilots, getRegulatorySettings } from "@/lib/settings";
import { toNumber } from "@/lib/format";

export default async function SettingsPage() {
  const [aircraft, categories, pilots, regSettings] = await Promise.all([
    getPrimaryAircraft(),
    getCostCategories(true),
    getPilots(true),
    getRegulatorySettings(),
  ]);

  return (
    <div>
      <PageHeader title="Settings" description="Aircraft, cost categories, pilots, and regulatory thresholds." />
      <Tabs defaultValue="aircraft">
        <TabsList>
          <TabsTrigger value="aircraft">Aircraft</TabsTrigger>
          <TabsTrigger value="categories">Cost categories</TabsTrigger>
          <TabsTrigger value="pilots">Pilots</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory thresholds</TabsTrigger>
        </TabsList>
        <TabsContent value="aircraft">
          <AircraftForm aircraft={aircraft} />
        </TabsContent>
        <TabsContent value="categories">
          <CostCategoriesManager categories={categories} />
        </TabsContent>
        <TabsContent value="pilots">
          <PilotsManager pilots={pilots} />
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
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
