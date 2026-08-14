"use client";

import * as React from "react";
import Link from "next/link";
import { PlaneTakeoff } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { decimalHourToHHMM } from "@/lib/flight-time";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CalendarItemDto } from "@/lib/schedule";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Departure time only labels the trip's start day; return time only labels its end day. */
function labelForDay(item: CalendarItemDto, day: Date): string {
  const dayKey = toKey(day);
  if (dayKey === toKey(item.startDate) && item.departureTime !== null) {
    return `${item.title} · Dep ${decimalHourToHHMM(item.departureTime)}`;
  }
  if (dayKey === toKey(item.endDate) && dayKey !== toKey(item.startDate) && item.returnTime !== null) {
    return `${item.title} · Ret ${decimalHourToHHMM(item.returnTime)}`;
  }
  return item.title;
}

function ItemPill({
  item,
  day,
  onEventClick,
  size = "sm",
}: {
  item: CalendarItemDto;
  day: Date;
  onEventClick: (item: CalendarItemDto) => void;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs";
  const label = labelForDay(item, day);

  if (item.kind === "event") {
    return (
      <button
        type="button"
        onClick={() => onEventClick(item)}
        title={label}
        className={cn("block w-full truncate rounded text-left text-white", padding)}
        style={{ backgroundColor: item.color }}
      >
        {label}
      </button>
    );
  }

  return (
    <Link
      href="/trips"
      title={`${label} — view or complete in Trips`}
      className={cn(
        "flex items-center gap-1 truncate rounded",
        padding,
        item.tripStatus === "PLANNED" ? "border border-dashed border-foreground/40 text-foreground" : "bg-foreground text-background"
      )}
    >
      <PlaneTakeoff className="size-2.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function DayCell({
  day,
  dayItems,
  inMonth,
  isToday,
  onEventClick,
}: {
  day: Date;
  dayItems: CalendarItemDto[];
  inMonth: boolean;
  isToday: boolean;
  onEventClick: (item: CalendarItemDto) => void;
}) {
  const [overflowOpen, setOverflowOpen] = React.useState(false);
  const visible = dayItems.slice(0, 3);
  const overflow = dayItems.length - visible.length;

  function handleOverflowItemClick(item: CalendarItemDto) {
    setOverflowOpen(false);
    onEventClick(item);
  }

  return (
    <div className={cn("min-h-[104px] border-r border-b p-1.5 last:border-r-0", !inMonth && "bg-secondary/10")}>
      <div
        className={cn(
          "mb-1 flex size-5 items-center justify-center rounded-full text-xs",
          isToday ? "bg-primary font-semibold text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/50"
        )}
      >
        {day.getUTCDate()}
      </div>
      <div className="space-y-1">
        {visible.map((item) => (
          <ItemPill key={item.id} item={item} day={day} onEventClick={onEventClick} />
        ))}
        {overflow > 0 && (
          <Popover open={overflowOpen} onOpenChange={setOverflowOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                +{overflow} more
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-1.5 p-2" align="start">
              <div className="px-1 text-xs font-medium text-muted-foreground">{formatDate(day)}</div>
              {dayItems.map((item) => (
                <ItemPill key={item.id} item={item} day={day} onEventClick={handleOverflowItemClick} size="md" />
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  items: CalendarItemDto[];
  onEventClick: (item: CalendarItemDto) => void;
}

function CalendarGrid({ year, month, items, onEventClick }: CalendarGridProps) {
  const monthStart = new Date(Date.UTC(year, month, 1));
  const startWeekday = monthStart.getUTCDay();
  const days = Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(year, month, 1 - startWeekday + i)));
  const todayKey = toKey(new Date());

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid grid-cols-7 border-b bg-secondary/30">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = toKey(day);
          const dayTime = day.getTime();
          const dayItems = items.filter((it) => it.startDate.getTime() <= dayTime && it.endDate.getTime() >= dayTime);
          return (
            <DayCell
              key={key}
              day={day}
              dayItems={dayItems}
              inMonth={day.getUTCMonth() === month}
              isToday={key === todayKey}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
}

export { CalendarGrid };
