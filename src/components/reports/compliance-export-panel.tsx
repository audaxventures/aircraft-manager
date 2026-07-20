"use client";

import * as React from "react";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";

interface CompliancePanelProps {
  pilots: { id: string; name: string }[];
}

function ComplianceExportPanel({ pilots }: CompliancePanelProps) {
  const [pilotId, setPilotId] = React.useState<string>("all");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const dutyParams = new URLSearchParams();
  if (pilotId !== "all") dutyParams.set("pilotId", pilotId);
  if (from) dutyParams.set("from", from);
  if (to) dutyParams.set("to", to);

  const currencyParams = new URLSearchParams();
  if (pilotId !== "all") currencyParams.set("pilotId", pilotId);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="mb-3 text-sm font-medium text-foreground">Compliance exports</h2>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={pilotId} onValueChange={setPilotId}>
          <SelectTrigger className="h-8 w-44 text-sm">
            <SelectValue />
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
        <DateInput aria-label="From" className="h-8 w-36" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-xs text-muted-foreground">to</span>
        <DateInput aria-label="To" className="h-8 w-36" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={`/api/reports/duty-day/pdf?${dutyParams.toString()}`} target="_blank" rel="noreferrer">
            <FileText /> Duty day report (PDF)
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={`/api/reports/currency/pdf?${currencyParams.toString()}`} target="_blank" rel="noreferrer">
            <FileText /> Pilot currency report (PDF)
          </a>
        </Button>
      </div>
    </div>
  );
}

export { ComplianceExportPanel };
