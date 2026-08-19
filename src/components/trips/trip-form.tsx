"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DateInput } from "@/components/ui/date-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/slide-over";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MultiCombobox, type ComboboxOption } from "@/components/shared/multi-combobox";
import { saveTrip, deleteTrip, createPassenger } from "@/lib/actions/trips";
import { formatDate } from "@/lib/format";
import { decimalHoursBetween, formatDecimalHour, decimalHourToHHMM, parseDecimalHour } from "@/lib/flight-time";

export interface PilotOption {
  id: string;
  name: string;
}

export interface TripLegFormValue {
  key: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  landingTime: string;
  hours: string;
  miles: string;
  dayTakeoffs: string;
  dayLandings: string;
  nightTakeoffs: string;
  nightLandings: string;
  pilotInstrumentApproaches: string;
  secondPilotInstrumentApproaches: string;
  passengerIds: string[];
}

export interface TripFormValue {
  id: string;
  isSimulator: boolean;
  routeLabel: string;
  purpose: string;
  notes: string;
  pilotId: string;
  secondPilotId: string;
  legs: TripLegFormValue[];
}

let legKeySeq = 0;
function nextLegKey(): string {
  legKeySeq += 1;
  return `leg-${legKeySeq}`;
}

function emptyLeg(previous?: TripLegFormValue): TripLegFormValue {
  return {
    key: nextLegKey(),
    date: previous?.date ?? new Date().toISOString().slice(0, 10),
    // Continuation default: a new leg usually departs from wherever the
    // previous one arrived, which also happens to give a return leg the
    // "flipped" route the user expects without any special-casing. Passengers
    // carry over too, since the same people are usually still aboard --
    // editable per leg for drop-offs/pickups.
    departureAirport: previous?.arrivalAirport ?? "",
    arrivalAirport: "",
    departureTime: "",
    landingTime: "",
    hours: "",
    miles: "",
    dayTakeoffs: "1",
    dayLandings: "1",
    nightTakeoffs: "0",
    nightLandings: "0",
    pilotInstrumentApproaches: "0",
    secondPilotInstrumentApproaches: "0",
    passengerIds: previous?.passengerIds ?? [],
  };
}

function emptyValue(): TripFormValue {
  return {
    id: "",
    isSimulator: false,
    routeLabel: "",
    purpose: "",
    notes: "",
    pilotId: "",
    secondPilotId: "",
    legs: [emptyLeg()],
  };
}

function applyComputedHours(leg: TripLegFormValue): TripLegFormValue {
  const to = leg.departureTime ? parseDecimalHour(leg.departureTime) : null;
  const ld = leg.landingTime ? parseDecimalHour(leg.landingTime) : null;
  if (to !== null && ld !== null) {
    return { ...leg, hours: formatDecimalHour(decimalHoursBetween(to, ld)) };
  }
  return leg;
}

interface TripFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilots: PilotOption[];
  passengerOptions: ComboboxOption[];
  initial?: TripFormValue | null;
}

function TripForm({ open, onOpenChange, pilots, passengerOptions: initialPassengerOptions, initial }: TripFormProps) {
  const [value, setValue] = React.useState<TripFormValue>(initial ?? emptyValue());
  const [passengerOptions, setPassengerOptions] = React.useState(initialPassengerOptions);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setValue(initial ?? emptyValue());
      setPassengerOptions(initialPassengerOptions);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const isEditing = !!value.id;

  const pilotName = pilots.find((p) => p.id === value.pilotId)?.name;
  const secondPilotName = pilots.find((p) => p.id === value.secondPilotId)?.name;

  const legTotals = value.legs.map((leg) => ({
    takeoffSum: parseInt(leg.dayTakeoffs || "0", 10) + parseInt(leg.nightTakeoffs || "0", 10),
    landingSum: parseInt(leg.dayLandings || "0", 10) + parseInt(leg.nightLandings || "0", 10),
  }));
  const mismatchedLegIndex = legTotals.findIndex((t) => t.takeoffSum !== t.landingSum);

  const totalHours = value.legs.reduce((s, l) => s + (parseFloat(l.hours) || 0), 0);
  const totalCycles = legTotals.reduce((s, t) => s + t.takeoffSum, 0);
  const totalMiles = value.legs.reduce((s, l) => s + (parseInt(l.miles, 10) || 0), 0);
  const isPlanned = isEditing && totalHours === 0;

  function updateLeg(index: number, patch: Partial<TripLegFormValue> | ((leg: TripLegFormValue) => TripLegFormValue)) {
    setValue((v) => ({
      ...v,
      legs: v.legs.map((leg, i) => (i === index ? (typeof patch === "function" ? patch(leg) : { ...leg, ...patch }) : leg)),
    }));
  }

  function addLeg() {
    setValue((v) => ({ ...v, legs: [...v.legs, emptyLeg(v.legs[v.legs.length - 1])] }));
  }

  function removeLeg(index: number) {
    setValue((v) => ({ ...v, legs: v.legs.filter((_, i) => i !== index) }));
  }

  async function handleCreatePassenger(legIndex: number, name: string) {
    const result = await createPassenger(name);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPassengerOptions((opts) => [...opts, { value: result.id, label: result.name }]);
    updateLeg(legIndex, (leg) => ({ ...leg, passengerIds: [...leg.passengerIds, result.id] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mismatchedLegIndex !== -1) {
      setError(
        value.legs.length === 1
          ? "Total takeoffs and total landings must match."
          : `Total takeoffs and total landings must match on leg ${mismatchedLegIndex + 1}.`
      );
      return;
    }
    setSaving(true);
    const result = await saveTrip({
      id: value.id || undefined,
      isSimulator: value.isSimulator,
      routeLabel: value.routeLabel,
      purpose: value.purpose,
      notes: value.notes,
      pilotId: value.pilotId,
      secondPilotId: value.secondPilotId,
      legs: value.legs.map((leg) => ({
        date: leg.date,
        departureAirport: leg.departureAirport,
        arrivalAirport: leg.arrivalAirport,
        departureTime: leg.departureTime,
        landingTime: leg.landingTime,
        hours: leg.hours || "0",
        miles: value.isSimulator ? "0" : leg.miles || "0",
        dayTakeoffs: leg.dayTakeoffs,
        dayLandings: leg.dayLandings,
        nightTakeoffs: leg.nightTakeoffs,
        nightLandings: leg.nightLandings,
        pilotInstrumentApproaches: leg.pilotInstrumentApproaches,
        secondPilotInstrumentApproaches: leg.secondPilotInstrumentApproaches,
        passengerIds: leg.passengerIds,
      })),
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(isEditing ? "Trip updated" : "Trip added");
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!value.id) return;
    setDeleting(true);
    await deleteTrip(value.id);
    setDeleting(false);
    setConfirmDelete(false);
    toast.success("Trip deleted");
    onOpenChange(false);
  }

  return (
    <>
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit trip" : "Add trip"}
      description={
        isEditing
          ? `${formatDate(value.legs[0]?.date ? new Date(value.legs[0].date) : new Date())}${isPlanned ? " · Planned — add hours to mark as flown" : ""}`
          : undefined
      }
      footer={
        <>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              className="mr-auto text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
            >
              <Trash2 /> {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="trip-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="trip-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label htmlFor="tr-simulator">Simulator session</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Counts toward currency and duty-day/flight-hour tracking, but not toward the aircraft&apos;s hours,
              cycles, or miles.
            </p>
          </div>
          <Switch
            id="tr-simulator"
            checked={value.isSimulator}
            onCheckedChange={(isSimulator) => setValue((v) => ({ ...v, isSimulator }))}
          />
        </div>

        <div className="space-y-3">
          {value.legs.map((leg, index) => {
            const takeoffDecimal = leg.departureTime ? parseDecimalHour(leg.departureTime) : null;
            const landingDecimal = leg.landingTime ? parseDecimalHour(leg.landingTime) : null;
            const hoursAutoComputed = takeoffDecimal !== null && landingDecimal !== null;
            const { takeoffSum, landingSum } = legTotals[index];
            const mismatch = takeoffSum !== landingSum;

            return (
              <div key={leg.key} className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">
                    {value.legs.length > 1 ? `Leg ${index + 1}` : "Flight details"}
                  </div>
                  {value.legs.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-destructive hover:text-destructive" onClick={() => removeLeg(index)}>
                      <Trash2 className="size-3.5" /> Remove leg
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`tr-leg-date-${index}`} className="text-xs font-normal">
                    Date
                  </Label>
                  <DateInput id={`tr-leg-date-${index}`} value={leg.date} onChange={(e) => updateLeg(index, { date: e.target.value })} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`tr-leg-dep-${index}`} className="text-xs font-normal">
                      Departure
                    </Label>
                    <Input
                      id={`tr-leg-dep-${index}`}
                      value={leg.departureAirport}
                      onChange={(e) => updateLeg(index, { departureAirport: e.target.value })}
                      placeholder="Winnipeg, MB"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`tr-leg-arr-${index}`} className="text-xs font-normal">
                      Arrival
                    </Label>
                    <Input
                      id={`tr-leg-arr-${index}`}
                      value={leg.arrivalAirport}
                      onChange={(e) => updateLeg(index, { arrivalAirport: e.target.value })}
                      placeholder="Palm Springs, CA"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`tr-leg-takeoff-${index}`} className="text-xs font-normal">
                      Departure time (UTC decimal)
                    </Label>
                    <Input
                      id={`tr-leg-takeoff-${index}`}
                      value={leg.departureTime}
                      onChange={(e) => updateLeg(index, (l) => applyComputedHours({ ...l, departureTime: e.target.value }))}
                      placeholder="14.3"
                      inputMode="decimal"
                      className={leg.departureTime && takeoffDecimal === null ? "border-destructive" : undefined}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`tr-leg-landing-${index}`} className="text-xs font-normal">
                      Landing time (UTC decimal)
                    </Label>
                    <Input
                      id={`tr-leg-landing-${index}`}
                      value={leg.landingTime}
                      onChange={(e) => updateLeg(index, (l) => applyComputedHours({ ...l, landingTime: e.target.value }))}
                      placeholder="18.5"
                      inputMode="decimal"
                      className={leg.landingTime && landingDecimal === null ? "border-destructive" : undefined}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Each 0.1 is a 6-minute increment, e.g. 14.3 = 14:18Z.
                  {((leg.departureTime && takeoffDecimal === null) || (leg.landingTime && landingDecimal === null)) && (
                    <span className="text-destructive"> Use HH.T format, e.g. 14.3.</span>
                  )}
                </p>
                {hoursAutoComputed && (
                  <p className="text-xs text-muted-foreground">
                    Duty day will default to {decimalHourToHHMM(((takeoffDecimal ?? 0) - 1 + 24) % 24)}–
                    {decimalHourToHHMM(((landingDecimal ?? 0) + 0.5) % 24)} UTC for each pilot on this trip (editable on the Duty Days page).
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`tr-leg-hours-${index}`} className="text-xs font-normal">
                      Hours{hoursAutoComputed && <span className="ml-1 text-muted-foreground">(auto)</span>}
                    </Label>
                    <Input
                      id={`tr-leg-hours-${index}`}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Unknown until flown"
                      value={leg.hours}
                      onChange={(e) => updateLeg(index, { hours: e.target.value })}
                      readOnly={hoursAutoComputed}
                      className={hoursAutoComputed ? "bg-secondary/50" : undefined}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`tr-leg-cycles-${index}`} className="text-xs font-normal">
                      Cycles<span className="ml-1 text-muted-foreground">(auto)</span>
                    </Label>
                    <Input id={`tr-leg-cycles-${index}`} type="number" value={takeoffSum} readOnly className="bg-secondary/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`tr-leg-miles-${index}`} className="text-xs font-normal">
                      Miles{value.isSimulator && <span className="ml-1 text-muted-foreground">(n/a)</span>}
                    </Label>
                    <Input
                      id={`tr-leg-miles-${index}`}
                      type="number"
                      step="1"
                      min="0"
                      placeholder={value.isSimulator ? undefined : "Unknown until flown"}
                      value={value.isSimulator ? "0" : leg.miles}
                      onChange={(e) => updateLeg(index, { miles: e.target.value })}
                      disabled={value.isSimulator}
                      className={value.isSimulator ? "bg-secondary/50" : undefined}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">Takeoffs &amp; landings</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`tr-leg-day-to-${index}`} className="text-xs font-normal">
                        Day takeoffs
                      </Label>
                      <Input
                        id={`tr-leg-day-to-${index}`}
                        type="number"
                        min="0"
                        value={leg.dayTakeoffs}
                        onChange={(e) => updateLeg(index, { dayTakeoffs: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`tr-leg-night-to-${index}`} className="text-xs font-normal">
                        Night takeoffs
                      </Label>
                      <Input
                        id={`tr-leg-night-to-${index}`}
                        type="number"
                        min="0"
                        value={leg.nightTakeoffs}
                        onChange={(e) => updateLeg(index, { nightTakeoffs: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`tr-leg-day-ldg-${index}`} className="text-xs font-normal">
                        Day landings
                      </Label>
                      <Input
                        id={`tr-leg-day-ldg-${index}`}
                        type="number"
                        min="0"
                        value={leg.dayLandings}
                        onChange={(e) => updateLeg(index, { dayLandings: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`tr-leg-night-ldg-${index}`} className="text-xs font-normal">
                        Night landings
                      </Label>
                      <Input
                        id={`tr-leg-night-ldg-${index}`}
                        type="number"
                        min="0"
                        value={leg.nightLandings}
                        onChange={(e) => updateLeg(index, { nightLandings: e.target.value })}
                      />
                    </div>
                  </div>
                  {mismatch && (
                    <p className="mt-2 text-xs text-destructive">
                      Total takeoffs ({takeoffSum}) must equal total landings ({landingSum}).
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">Instrument approaches</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`tr-leg-pic-ia-${index}`} className="text-xs font-normal">
                        {pilotName ?? "Pilot in command"}
                      </Label>
                      <Input
                        id={`tr-leg-pic-ia-${index}`}
                        type="number"
                        min="0"
                        value={leg.pilotInstrumentApproaches}
                        onChange={(e) => updateLeg(index, { pilotInstrumentApproaches: e.target.value })}
                        disabled={!value.pilotId}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`tr-leg-sic-ia-${index}`} className="text-xs font-normal">
                        {secondPilotName ?? "Second in command"}
                      </Label>
                      <Input
                        id={`tr-leg-sic-ia-${index}`}
                        type="number"
                        min="0"
                        value={leg.secondPilotInstrumentApproaches}
                        onChange={(e) => updateLeg(index, { secondPilotInstrumentApproaches: e.target.value })}
                        disabled={!value.secondPilotId}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Passengers</Label>
                  <MultiCombobox
                    options={passengerOptions}
                    value={leg.passengerIds}
                    onChange={(passengerIds) => updateLeg(index, { passengerIds })}
                    onCreate={(name) => handleCreatePassenger(index, name)}
                    placeholder="Add passenger"
                  />
                </div>
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" onClick={addLeg}>
            <Plus /> Add leg
          </Button>
        </div>

        <div className="rounded-md border bg-secondary/30 p-3 text-xs text-muted-foreground">
          Trip total: {formatDecimalHour(totalHours)} hrs · {totalCycles} cycles
          {!value.isSimulator && <> · {totalMiles} mi</>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tr-route">Route label</Label>
          <Input
            id="tr-route"
            value={value.routeLabel}
            onChange={(e) => setValue((v) => ({ ...v, routeLabel: e.target.value }))}
            placeholder="Auto-filled from the legs if left blank"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tr-pilot">Pilot in command</Label>
            <Select value={value.pilotId} onValueChange={(pilotId) => setValue((v) => ({ ...v, pilotId }))}>
              <SelectTrigger id="tr-pilot">
                <SelectValue placeholder="Select a pilot" />
              </SelectTrigger>
              <SelectContent>
                {pilots
                  .filter((p) => p.id !== value.secondPilotId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tr-second-pilot">Second in command</Label>
            <Select value={value.secondPilotId} onValueChange={(secondPilotId) => setValue((v) => ({ ...v, secondPilotId }))}>
              <SelectTrigger id="tr-second-pilot">
                <SelectValue placeholder="Select a pilot" />
              </SelectTrigger>
              <SelectContent>
                {pilots
                  .filter((p) => p.id !== value.pilotId)
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
          <Label htmlFor="tr-purpose">Purpose</Label>
          <Input id="tr-purpose" value={value.purpose} onChange={(e) => setValue((v) => ({ ...v, purpose: e.target.value }))} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tr-notes">Notes</Label>
          <Textarea id="tr-notes" value={value.notes} onChange={(e) => setValue((v) => ({ ...v, notes: e.target.value }))} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
    <ConfirmDialog
      open={confirmDelete}
      onOpenChange={setConfirmDelete}
      title="Delete this trip?"
      description="This trip will be moved to Recently deleted in Settings, where it can be restored."
      pending={deleting}
      onConfirm={handleDelete}
    />
    </>
  );
}

export { TripForm, emptyValue as emptyTripValue };
