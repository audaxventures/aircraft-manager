"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveRegulatorySettings } from "@/lib/actions/settings";
import { toNumber } from "@/lib/format";

interface RegulatorySettings {
  id: string;
  maxFlightDutyHours: number;
  extendedMaxFlightDutyHours: number;
  rolling30DayFlightHoursLimit: number;
  extensionRestPeriodHours: number;
  minRestPeriodHours: number;
  restPeriodWindowDays: number;
  splitDutyMaxExtensionHours: number;
  splitDutyMinRestHours: number;
  currencyTakeoffsRequired: number;
  currencyLandingsRequired: number;
  currencyPeriodMonths: number;
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input type="number" step="0.1" value={value} onChange={(e) => onChange(e.target.value)} className="max-w-32" />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function RegulatorySettingsForm({ settings }: { settings: RegulatorySettings }) {
  const [form, setForm] = React.useState({
    maxFlightDutyHours: String(toNumber(settings.maxFlightDutyHours)),
    extendedMaxFlightDutyHours: String(toNumber(settings.extendedMaxFlightDutyHours)),
    rolling30DayFlightHoursLimit: String(toNumber(settings.rolling30DayFlightHoursLimit)),
    extensionRestPeriodHours: String(toNumber(settings.extensionRestPeriodHours)),
    minRestPeriodHours: String(toNumber(settings.minRestPeriodHours)),
    restPeriodWindowDays: String(settings.restPeriodWindowDays),
    splitDutyMaxExtensionHours: String(toNumber(settings.splitDutyMaxExtensionHours)),
    splitDutyMinRestHours: String(toNumber(settings.splitDutyMinRestHours)),
    currencyTakeoffsRequired: String(settings.currencyTakeoffsRequired),
    currencyLandingsRequired: String(settings.currencyLandingsRequired),
    currencyPeriodMonths: String(settings.currencyPeriodMonths),
  });
  const [saving, setSaving] = React.useState(false);

  function set(key: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await saveRegulatorySettings({ id: settings.id, ...form });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Regulatory thresholds saved");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          These figures reflect CARS Subpart 604 and CAR 401.05(2) as commonly applied at the time this tool was
          built. Regulations are amended periodically — verify these thresholds against the current CARS 604 text
          and the Private Operator Passenger Transportation Standards before relying on this tool for compliance
          decisions.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">CARS 604 — duty day limits</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Max flight duty time" value={form.maxFlightDutyHours} onChange={set("maxFlightDutyHours")} suffix="hrs" />
          <Field
            label="Extended max flight duty time"
            value={form.extendedMaxFlightDutyHours}
            onChange={set("extendedMaxFlightDutyHours")}
            suffix="hrs"
          />
          <Field
            label="30-day flight time limit"
            value={form.rolling30DayFlightHoursLimit}
            onChange={set("rolling30DayFlightHoursLimit")}
            suffix="hrs"
          />
          <Field
            label="Rest period for extension"
            value={form.extensionRestPeriodHours}
            onChange={set("extensionRestPeriodHours")}
            suffix="hrs"
          />
          <Field label="Min rest period" value={form.minRestPeriodHours} onChange={set("minRestPeriodHours")} suffix="hrs" />
          <Field
            label="Rest period window"
            value={form.restPeriodWindowDays}
            onChange={set("restPeriodWindowDays")}
            suffix="days"
          />
          <Field
            label="Split-duty max extension"
            value={form.splitDutyMaxExtensionHours}
            onChange={set("splitDutyMaxExtensionHours")}
            suffix="hrs"
          />
          <Field
            label="Split-duty min rest"
            value={form.splitDutyMinRestHours}
            onChange={set("splitDutyMinRestHours")}
            suffix="hrs"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">CAR 401.05(2) — recency</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field
            label="Takeoffs required"
            value={form.currencyTakeoffsRequired}
            onChange={set("currencyTakeoffsRequired")}
          />
          <Field
            label="Landings required"
            value={form.currencyLandingsRequired}
            onChange={set("currencyLandingsRequired")}
          />
          <Field
            label="Currency period"
            value={form.currencyPeriodMonths}
            onChange={set("currencyPeriodMonths")}
            suffix="months"
          />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save thresholds"}
      </Button>
    </form>
  );
}

export { RegulatorySettingsForm };
