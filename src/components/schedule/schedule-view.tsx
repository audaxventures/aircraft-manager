"use client";

import * as React from "react";
import { CalendarPlus, PlaneTakeoff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/schedule/calendar-grid";
import { EventForm, type EventCategoryOption, type EventFormValue, type PilotOption } from "@/components/schedule/event-form";
import { PlannedTripForm } from "@/components/schedule/planned-trip-form";
import type { CalendarItemDto } from "@/lib/schedule";

interface ScheduleViewProps {
  year: number;
  month: number;
  items: CalendarItemDto[];
  categories: EventCategoryOption[];
  pilots: PilotOption[];
}

function ScheduleView({ year, month, items, categories, pilots }: ScheduleViewProps) {
  const [eventFormOpen, setEventFormOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventFormValue | null>(null);
  const [plannedTripOpen, setPlannedTripOpen] = React.useState(false);

  function openNewEvent() {
    setEditingEvent(null);
    setEventFormOpen(true);
  }

  function openEventFromItem(item: CalendarItemDto) {
    setEditingEvent({
      id: item.id,
      categoryId: item.categoryId ?? "",
      title: item.title,
      startDate: item.startDate.toISOString().slice(0, 10),
      endDate: item.endDate.toISOString().slice(0, 10),
      pilotId: item.pilotId ?? "",
      notes: item.notes ?? "",
    });
    setEventFormOpen(true);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PlaneTakeoff className="size-3" /> Trips
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPlannedTripOpen(true)}>
            <PlaneTakeoff /> Add planned trip
          </Button>
          <Button size="sm" onClick={openNewEvent}>
            <CalendarPlus /> Add event
          </Button>
        </div>
      </div>

      <CalendarGrid year={year} month={month} items={items} onEventClick={openEventFromItem} />

      <EventForm
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        categories={categories}
        pilots={pilots}
        initial={editingEvent}
      />
      <PlannedTripForm open={plannedTripOpen} onOpenChange={setPlannedTripOpen} pilots={pilots} />
    </div>
  );
}

export { ScheduleView };
