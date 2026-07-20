import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

function TimeInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <input
        type="time"
        data-slot="time-input"
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 pr-9 text-sm shadow-xs transition-colors outline-none tabular-nums placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { TimeInput };
