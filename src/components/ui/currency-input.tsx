"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

function formatDisplay(raw: string) {
  if (raw === "" || raw === "-") return raw;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return raw;
  return n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Stores the canonical numeric string in `value` (e.g. "1234.5") while
// displaying a thousands-separated, two-decimal string. Reformats on blur so
// the user isn't fighting comma insertion while typing.
function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const [display, setDisplay] = React.useState(() => formatDisplay(value));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setDisplay(formatDisplay(value));
  }, [value, focused]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
      <input
        inputMode="decimal"
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-background py-1 pr-3 pl-6 text-sm shadow-xs transition-colors outline-none tabular-nums placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={focused ? value : display}
        onFocus={() => setFocused(true)}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.-]/g, "");
          onChange(raw);
        }}
        onBlur={() => {
          setFocused(false);
          setDisplay(formatDisplay(value));
        }}
        {...props}
      />
    </div>
  );
}

export { CurrencyInput };
