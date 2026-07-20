"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAircraft } from "@/lib/actions/settings";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface AircraftFormProps {
  aircraft: {
    id: string;
    tailNumber: string;
    type: string;
    baseAirport: string;
    fiscalYearStartMonth: number;
  } | null;
}

function AircraftForm({ aircraft }: AircraftFormProps) {
  const [tailNumber, setTailNumber] = React.useState(aircraft?.tailNumber ?? "");
  const [type, setType] = React.useState(aircraft?.type ?? "");
  const [baseAirport, setBaseAirport] = React.useState(aircraft?.baseAirport ?? "");
  const [fiscalMonth, setFiscalMonth] = React.useState(String(aircraft?.fiscalYearStartMonth ?? 1));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveAircraft({
      id: aircraft?.id,
      tailNumber,
      type,
      baseAirport,
      fiscalYearStartMonth: fiscalMonth,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Aircraft settings saved");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg border bg-card p-5">
      <div className="space-y-1.5">
        <Label htmlFor="tailNumber">Tail number</Label>
        <Input id="tailNumber" value={tailNumber} onChange={(e) => setTailNumber(e.target.value)} placeholder="C-FPFX" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="type">Aircraft type</Label>
        <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Cessna Citation 750" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="baseAirport">Base airport</Label>
        <Input id="baseAirport" value={baseAirport} onChange={(e) => setBaseAirport(e.target.value)} placeholder="CYWG — Winnipeg" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fiscalMonth">Fiscal year start</Label>
        <Select value={fiscalMonth} onValueChange={setFiscalMonth}>
          <SelectTrigger id="fiscalMonth">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save aircraft"}
      </Button>
    </form>
  );
}

export { AircraftForm };
