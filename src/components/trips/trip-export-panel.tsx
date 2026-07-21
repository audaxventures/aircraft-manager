"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Download, FileText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TRIP_EXPORT_COLUMNS, DEFAULT_TRIP_EXPORT_COLUMNS } from "@/lib/trip-export-columns";
import { getTripColumnValue } from "@/lib/trip-export-format";
import { toCsv, downloadCsv } from "@/lib/csv";
import { saveTripExportPreset, deleteTripExportPreset } from "@/lib/actions/trips";
import type { TripDto, TripExportPresetDto } from "@/lib/trips";

interface TripExportPanelProps {
  trips: TripDto[];
  presets: TripExportPresetDto[];
}

function TripExportPanel({ trips, presets }: TripExportPanelProps) {
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(DEFAULT_TRIP_EXPORT_COLUMNS);
  const [presetId, setPresetId] = React.useState("");
  const [newPresetName, setNewPresetName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  function toggle(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setPresetId("");
  }

  function loadPreset(id: string) {
    setPresetId(id);
    if (id === "none") return;
    const preset = presets.find((p) => p.id === id);
    if (preset) setSelected(preset.columns);
  }

  async function handleSavePreset() {
    const name = newPresetName.trim();
    if (!name) return;
    setSaving(true);
    const result = await saveTripExportPreset({ name, columns: selected });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Preset saved");
    setNewPresetName("");
  }

  async function handleDeletePreset() {
    if (!presetId) return;
    setDeleting(true);
    await deleteTripExportPreset(presetId);
    setDeleting(false);
    setPresetId("");
    toast.success("Preset deleted");
  }

  const selectedColumns = TRIP_EXPORT_COLUMNS.filter((c) => selected.includes(c.key));

  function exportCsv() {
    const csv = toCsv(
      trips,
      selectedColumns.map((c) => ({ header: c.label, accessor: (t: TripDto) => getTripColumnValue(t, c.key) }))
    );
    downloadCsv(`trips-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    setOpen(false);
  }

  function pdfHref() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("columns", selected.join(","));
    return `/api/reports/trips/pdf?${params.toString()}`;
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={trips.length === 0}>
        <Download /> Export
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export trips</DialogTitle>
            <DialogDescription>Choose which columns to include, then export as CSV or PDF.</DialogDescription>
          </DialogHeader>

          {presets.length > 0 && (
            <div className="flex items-center gap-2">
              <Select value={presetId || "none"} onValueChange={loadPreset}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Load a saved preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Custom selection</SelectItem>
                  {presets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {presetId && (
                <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={handleDeletePreset} disabled={deleting}>
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          )}

          <div className="grid max-h-64 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto rounded-md border p-3">
            {TRIP_EXPORT_COLUMNS.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-sm">
                <Checkbox checked={selected.includes(c.key)} onCheckedChange={() => toggle(c.key)} />
                {c.label}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Save current selection as a new preset…"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleSavePreset} disabled={saving || !newPresetName.trim()}>
              {saving ? "Saving…" : "Save preset"}
            </Button>
          </div>

          <DialogFooter>
            <Label className="mr-auto text-xs font-normal text-muted-foreground">
              {selected.length} of {TRIP_EXPORT_COLUMNS.length} columns selected
            </Label>
            <Button variant="outline" onClick={exportCsv} disabled={selected.length === 0}>
              <Download /> Export CSV
            </Button>
            <Button asChild disabled={selected.length === 0}>
              <a href={pdfHref()} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
                <FileText /> Export PDF
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { TripExportPanel };
