"use client";

import * as React from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlideOver } from "@/components/shared/slide-over";
import { savePilot, setPilotArchived } from "@/lib/actions/settings";

interface Pilot {
  id: string;
  name: string;
  archived: boolean;
}

function PilotsManager({ pilots }: { pilots: Pilot[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Pilot | null>(null);

  async function toggleArchive(p: Pilot) {
    await setPilotArchived(p.id, !p.archived);
    toast.success(p.archived ? "Pilot restored" : "Pilot archived");
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus /> Add pilot
        </Button>
      </div>
      <div className="rounded-lg border bg-card">
        <ul className="divide-y">
          {pilots.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEditing(p);
                  setOpen(true);
                }}
                className={p.archived ? "text-muted-foreground line-through" : "text-foreground hover:underline"}
              >
                {p.name}
              </button>
              <div className="flex items-center gap-2">
                {p.archived && <Badge variant="outline">Archived</Badge>}
                <Button variant="ghost" size="icon" className="size-7" onClick={() => toggleArchive(p)}>
                  {p.archived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
                </Button>
              </div>
            </li>
          ))}
          {pilots.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No pilots yet</li>}
        </ul>
      </div>

      <PilotForm open={open} onOpenChange={setOpen} pilot={editing} />
    </div>
  );
}

function PilotForm({
  open,
  onOpenChange,
  pilot,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilot: Pilot | null;
}) {
  const [name, setName] = React.useState(pilot?.name ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(pilot?.name ?? "");
      setError(null);
    }
  }, [open, pilot]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await savePilot({ id: pilot?.id, name });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(pilot ? "Pilot updated" : "Pilot added");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={pilot ? "Edit pilot" : "Add pilot"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="pilot-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="pilot-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pilot-name">Name</Label>
          <Input id="pilot-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { PilotsManager };
