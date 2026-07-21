"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, RefreshCw, Trash2, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateInput } from "@/components/ui/date-input";
import { ListEditor } from "@/components/weekly-reports/list-editor";
import { MaintenanceEditor } from "@/components/weekly-reports/maintenance-editor";
import { saveWeeklyReport, deleteWeeklyReport, regenerateOverviewDraft, regenerateMaintenanceCandidates } from "@/lib/actions/weekly-reports";
import type { MaintenanceItem } from "@/lib/weekly-reports";

export interface WeeklyReportFormValue {
  reportDate: string; // yyyy-mm-dd
  ownerOperator: string;
  programManager: string;
  weekOverview: string;
  accomplishments: string[];
  newIssues: string[];
  toBeCompleted: string[];
  customerDecisions: string[];
  maintenanceItems: MaintenanceItem[];
}

interface WeeklyReportEditorProps {
  reportId?: string;
  initial: WeeklyReportFormValue;
  aircraftHeader: { tailNumber: string; type: string; serialNumber: string };
}

function WeeklyReportEditor({ reportId, initial, aircraftHeader }: WeeklyReportEditorProps) {
  const router = useRouter();
  const [value, setValue] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [pullingMaintenance, setPullingMaintenance] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await saveWeeklyReport({ id: reportId, ...value });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Report saved");
    if (!reportId && result.id) {
      router.push(`/weekly-reports/${result.id}`);
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!reportId) return;
    setDeleting(true);
    await deleteWeeklyReport(reportId);
    toast.success("Report deleted");
    router.push("/weekly-reports");
  }

  async function handleRegenerateOverview() {
    setRegenerating(true);
    const result = await regenerateOverviewDraft(value.reportDate);
    setRegenerating(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setValue((v) => ({ ...v, weekOverview: result.draft }));
    toast.success("Overview regenerated from current data");
  }

  async function handlePullMaintenance() {
    setPullingMaintenance(true);
    const result = await regenerateMaintenanceCandidates(value.reportDate);
    setPullingMaintenance(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setValue((v) => {
      const existingKeys = new Set(v.maintenanceItems.map((m) => `${m.description}|${m.due}`));
      const additions = result.items.filter((m) => !existingKeys.has(`${m.description}|${m.due}`));
      return { ...v, maintenanceItems: [...v.maintenanceItems, ...additions] };
    });
    toast.success("Pulled upcoming maintenance from Schedule");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 text-center text-lg font-semibold text-foreground">Weekly Status Report</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Owner/Operator: </span>
            <Input
              value={value.ownerOperator}
              onChange={(e) => setValue((v) => ({ ...v, ownerOperator: e.target.value }))}
              className="mt-1 h-8"
            />
          </div>
          <div>
            <span className="text-muted-foreground">Registration: </span>
            <span className="font-medium">{aircraftHeader.tailNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Aircraft Make and Model: </span>
            <span className="font-medium">{aircraftHeader.type}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Serial Number: </span>
            <span className="font-medium">{aircraftHeader.serialNumber || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Program Manager: </span>
            <Input
              value={value.programManager}
              onChange={(e) => setValue((v) => ({ ...v, programManager: e.target.value }))}
              className="mt-1 h-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="wr-date" className="text-muted-foreground">
              Date:
            </Label>
            <DateInput
              id="wr-date"
              value={value.reportDate}
              onChange={(e) => setValue((v) => ({ ...v, reportDate: e.target.value }))}
              className="h-8"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b bg-secondary/40 px-4 py-2 text-sm font-medium text-foreground">
          1. Week Overview
          <Button type="button" variant="outline" size="sm" onClick={handleRegenerateOverview} disabled={regenerating}>
            <RefreshCw className="size-3.5" /> {regenerating ? "Regenerating…" : "Regenerate from current data"}
          </Button>
        </div>
        <div className="p-3">
          <Textarea
            value={value.weekOverview}
            onChange={(e) => setValue((v) => ({ ...v, weekOverview: e.target.value }))}
            className="min-h-24"
          />
        </div>
      </div>

      <ListEditor
        title="2. Accomplishments"
        items={value.accomplishments}
        onChange={(items) => setValue((v) => ({ ...v, accomplishments: items }))}
      />
      <ListEditor
        title="3. New Issues"
        items={value.newIssues}
        onChange={(items) => setValue((v) => ({ ...v, newIssues: items }))}
        highlight
      />
      <ListEditor
        title="4. To Be Completed"
        items={value.toBeCompleted}
        onChange={(items) => setValue((v) => ({ ...v, toBeCompleted: items }))}
      />
      <ListEditor
        title="5. Issues Requiring Customer Input/ Decisions"
        items={value.customerDecisions}
        onChange={(items) => setValue((v) => ({ ...v, customerDecisions: items }))}
      />

      <div>
        <div className="mb-2 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handlePullMaintenance} disabled={pullingMaintenance}>
            <Wrench className="size-3.5" /> {pullingMaintenance ? "Pulling…" : "Pull from Schedule"}
          </Button>
        </div>
        <MaintenanceEditor
          items={value.maintenanceItems}
          onChange={(items) => setValue((v) => ({ ...v, maintenanceItems: items }))}
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        {reportId && (
          <Button type="button" variant="outline" className="mr-auto text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 /> {deleting ? "Deleting…" : "Delete"}
          </Button>
        )}
        {reportId && (
          <Button variant="outline" asChild>
            <a href={`/api/reports/weekly/pdf?id=${reportId}`} target="_blank" rel="noreferrer">
              <Download /> Export PDF
            </a>
          </Button>
        )}
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save report"}
        </Button>
      </div>
    </div>
  );
}

export { WeeklyReportEditor };
