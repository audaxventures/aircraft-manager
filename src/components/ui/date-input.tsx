import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// A native date input styled to match the design system. Native inputs give us
// real OS-level date pickers (including on mobile at small widths) without
// pulling in a separate calendar widget implementation.
function DateInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <input
        type="date"
        data-slot="date-input"
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 pr-9 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:opacity-0",
          className
        )}
        {...props}
      />
      <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { DateInput };
