"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRESETS = [
  { key: "mtd", label: "This month" },
  { key: "ytd", label: "This year" },
  { key: "all", label: "All time" },
] as const;

interface TripFiltersProps {
  pilots: { id: string; name: string }[];
}

function TripFilters({ pilots }: TripFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const preset = searchParams.get("range") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const search = searchParams.get("q") ?? "";
  const pilotId = searchParams.get("pilotId") ?? "";

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-48">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search route or purpose…"
          defaultValue={search}
          className="h-8 pl-8 text-sm"
          onChange={(e) => updateParams({ q: e.target.value })}
        />
      </div>

      <Select value={pilotId || "all"} onValueChange={(v) => updateParams({ pilotId: v === "all" ? null : v })}>
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue placeholder="Pilot" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All pilots</SelectItem>
          {pilots.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
      <DateInput aria-label="From date" className="h-8 w-36" value={from} onChange={(e) => updateParams({ from: e.target.value, range: null })} />
      <span className="text-xs text-muted-foreground">to</span>
      <DateInput aria-label="To date" className="h-8 w-36" value={to} onChange={(e) => updateParams({ to: e.target.value, range: null })} />
    </div>
  );
}

export { TripFilters };
