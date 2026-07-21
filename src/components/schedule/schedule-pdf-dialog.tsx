"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthKey(year: number, month: number) {
  return `${year}-${month}`;
}

interface SchedulePdfDialogProps {
  currentYear: number;
  currentMonth: number; // 0-indexed
}

function SchedulePdfDialog({ currentYear, currentMonth }: SchedulePdfDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState(currentYear);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function handleOpenChange(next: boolean) {
    if (next) {
      setPickerYear(currentYear);
      setSelected(new Set([monthKey(currentYear, currentMonth)]));
    }
    setOpen(next);
  }

  function toggle(year: number, month: number) {
    const key = monthKey(year, month);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const months = Array.from(selected)
    .map((key) => {
      const [y, m] = key.split("-").map(Number);
      return `${y}-${m + 1}`;
    })
    .join(",");
  const href = `/api/reports/schedule/pdf?months=${months}`;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)}>
        <FileText /> Export PDF
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export schedule as PDF</DialogTitle>
            <DialogDescription>Pick one or more months — each gets its own page in the export.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setPickerYear((y) => y - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">{pickerYear}</span>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setPickerYear((y) => y + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MONTH_LABELS.map((label, m) => {
              const key = monthKey(pickerYear, m);
              return (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm hover:bg-secondary/50"
                >
                  <Checkbox checked={selected.has(key)} onCheckedChange={() => toggle(pickerYear, m)} />
                  {label}
                </label>
              );
            })}
          </div>

          <DialogFooter>
            <span className="mr-auto text-xs text-muted-foreground">
              {selected.size} month{selected.size === 1 ? "" : "s"} selected
            </span>
            <Button asChild disabled={selected.size === 0}>
              <a href={href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
                <FileText /> Export PDF
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { SchedulePdfDialog };
