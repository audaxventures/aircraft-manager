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
    serialNumber: string | null;
    ownerOperator: string | null;
    programManager: string | null;
    purchaseTotalHours: number;
    purchaseTotalCycles: number;
  } | null;
}

function AircraftForm({ aircraft }: AircraftFormProps) {
  const [tailNumber, setTailNumber] = React.useState(aircraft?.tailNumber ?? "");
  const [type, setType] = React.useState(aircraft?.type ?? "");
  const [baseAirport, setBaseAirport] = React.useState(aircraft?.baseAirport ?? "");
  const [fiscalMonth, setFiscalMonth] = React.useState(String(aircraft?.fiscalYearStartMonth ?? 1));
  const [serialNumber, setSerialNumber] = React.useState(aircraft?.serialNumber ?? "");
  const [ownerOperator, setOwnerOperator] = React.useState(aircraft?.ownerOperator ?? "");
  const [programManager, setProgramManager] = React.useState(aircraft?.programManager ?? "");
  const [purchaseTotalHours, setPurchaseTotalHours] = React.useState(String(aircraft?.purchaseTotalHours ?? 0));
  const [purchaseTotalCycles, setPurchaseTotalCycles] = React.useState(String(aircraft?.purchaseTotalCycles ?? 0));
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
      serialNumber,
      ownerOperator,
      programManager,
      purchaseTotalHours,
      purchaseTotalCycles,
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

      <div className="border-t pt-4">
        <div className="mb-3 text-xs font-medium text-muted-foreground">Weekly report letterhead</div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="serialNumber">Serial number</Label>
            <Input id="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="0266" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ownerOperator">Owner / Operator</Label>
            <Input id="ownerOperator" value={ownerOperator} onChange={(e) => setOwnerOperator(e.target.value)} placeholder="Saults & Pollard" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="programManager">Program manager</Label>
            <Input id="programManager" value={programManager} onChange={(e) => setProgramManager(e.target.value)} placeholder="Michael Zaporzan" />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="mb-3 text-xs font-medium text-muted-foreground">
          Totals at purchase (used to compute lifetime hours/cycles on the weekly report)
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="purchaseTotalHours">Total time (hrs)</Label>
            <Input
              id="purchaseTotalHours"
              type="number"
              step="0.1"
              min="0"
              value={purchaseTotalHours}
              onChange={(e) => setPurchaseTotalHours(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchaseTotalCycles">Total cycles</Label>
            <Input
              id="purchaseTotalCycles"
              type="number"
              step="1"
              min="0"
              value={purchaseTotalCycles}
              onChange={(e) => setPurchaseTotalCycles(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save aircraft"}
      </Button>
    </form>
  );
}

export { AircraftForm };
