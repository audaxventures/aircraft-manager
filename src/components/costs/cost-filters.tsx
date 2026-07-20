"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { DateInput } from "@/components/ui/date-input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PRESETS = [
  { key: "mtd", label: "This month" },
  { key: "ytd", label: "This year" },
  { key: "all", label: "All time" },
] as const;

function CostFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const preset = searchParams.get("range") ?? "ytd";
  const type = searchParams.get("type") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <Tabs value={type} onValueChange={(v) => updateParams({ type: v === "all" ? null : v })}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="FIXED">Fixed</TabsTrigger>
          <TabsTrigger value="DIRECT">Direct</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-md border bg-card p-0.5">
          {PRESETS.map((p) => (
            <Button
              key={p.key}
              type="button"
              size="sm"
              variant={preset === p.key && !from && !to ? "secondary" : "ghost"}
              className="h-7 px-2.5 text-xs"
              onClick={() => updateParams({ range: p.key, from: null, to: null })}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <DateInput
          aria-label="From date"
          className="h-8 w-36"
          value={from}
          onChange={(e) => updateParams({ from: e.target.value, range: null })}
        />
        <span className="text-xs text-muted-foreground">to</span>
        <DateInput
          aria-label="To date"
          className="h-8 w-36"
          value={to}
          onChange={(e) => updateParams({ to: e.target.value, range: null })}
        />
      </div>
    </div>
  );
}

export { CostFilters };
