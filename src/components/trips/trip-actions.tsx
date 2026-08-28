"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TripForm, type PilotOption } from "@/components/trips/trip-form";
import type { ComboboxOption } from "@/components/shared/multi-combobox";

interface TripActionsProps {
  pilots: PilotOption[];
  passengerOptions: ComboboxOption[];
}

function TripActions({ pilots, passengerOptions }: TripActionsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button className="rounded-full" onClick={() => setOpen(true)}>
        <Plus /> Add trip
      </Button>
      <TripForm open={open} onOpenChange={setOpen} pilots={pilots} passengerOptions={passengerOptions} initial={null} />
    </>
  );
}

export { TripActions };
