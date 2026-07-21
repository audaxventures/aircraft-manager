"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateInput } from "@/components/ui/date-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/slide-over";
import { savePlannedTrip } from "@/lib/actions/schedule";

export interface PilotOption {
  id: string;
  name: string;
}

interface PlannedTripFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilots: PilotOption[];
  defaultDate?: string;
}

function PlannedTripForm({ open, onOpenChange, pilots, defaultDate }: PlannedTripFormProps) {
  const [date, setDate] = React.useState(defaultDate ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = React.useState("");
  const [departureAirport, setDepartureAirport] = React.useState("");
  const [arrivalAirport, setArrivalAirport] = React.useState("");
  const [pilotId, setPilotId] = React.useState("");
  const [secondPilotId, setSecondPilotId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
      setEndDate("");
      setDepartureAirport("");
      setArrivalAirport("");
      setPilotId("");
      setSecondPilotId("");
      setNotes("");
      setError(null);
    }
  }, [open, defaultDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await savePlannedTrip({
      date,
      endDate: endDate || undefined,
      departureAirport,
      arrivalAirport,
      pilotId,
      secondPilotId,
      notes,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Planned trip added — complete it in Trips once details are known.");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title="Add planned trip"
      description="Just the dates and locations — fill in the rest from the Trips page once it's flown."
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="planned-trip-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="planned-trip-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pt-date">Date</Label>
            <DateInput id="pt-date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pt-end-date">End date (optional)</Label>
            <DateInput id="pt-end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pt-dep">Departure</Label>
            <Input id="pt-dep" value={departureAirport} onChange={(e) => setDepartureAirport(e.target.value)} placeholder="Winnipeg, MB" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pt-arr">Arrival</Label>
            <Input id="pt-arr" value={arrivalAirport} onChange={(e) => setArrivalAirport(e.target.value)} placeholder="Palm Springs, CA" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pt-pilot">Pilot 1</Label>
            <Select value={pilotId || "none"} onValueChange={(v) => setPilotId(v === "none" ? "" : v)}>
              <SelectTrigger id="pt-pilot">
                <SelectValue placeholder="No pilot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {pilots
                  .filter((p) => p.id !== secondPilotId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pt-second-pilot">Pilot 2</Label>
            <Select value={secondPilotId || "none"} onValueChange={(v) => setSecondPilotId(v === "none" ? "" : v)}>
              <SelectTrigger id="pt-second-pilot">
                <SelectValue placeholder="No pilot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {pilots
                  .filter((p) => p.id !== pilotId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pt-notes">Notes</Label>
          <Textarea id="pt-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { PlannedTripForm };
