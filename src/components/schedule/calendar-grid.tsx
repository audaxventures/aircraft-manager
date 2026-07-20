"use client";

import Link from "next/link";
import { PlaneTakeoff } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CalendarItemDto } from "@/lib/schedule";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
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
          const inMonth = day.getUTCMonth() === month;
          const isToday = key === todayKey;
          const visible = dayItems.slice(0, 3);
          const overflow = dayItems.length - visible.length;

          return (
            <div
              key={key}
              className={cn("min-h-[104px] border-r border-b p-1.5 last:border-r-0", !inMonth && "bg-secondary/10")}
            >
              <div
                className={cn(
                  "mb-1 flex size-5 items-center justify-center rounded-full text-xs",
                  isToday ? "bg-primary font-semibold text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/50"
                )}
              >
                {day.getUTCDate()}
              </div>
              <div className="space-y-1">
                {visible.map((item) =>
                  item.kind === "event" ? (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onEventClick(item)}
                      title={item.title}
                      className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.title}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href="/trips"
                      title={`${item.title} — view or complete in Trips`}
                      className={cn(
                        "flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[11px]",
                        item.tripStatus === "PLANNED"
                          ? "border border-dashed border-foreground/40 text-foreground"
                          : "bg-foreground text-background"
                      )}
                    >
                      <PlaneTakeoff className="size-2.5 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  )
                )}
                {overflow > 0 && <div className="px-1.5 text-[11px] text-muted-foreground">+{overflow} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CalendarGrid };
