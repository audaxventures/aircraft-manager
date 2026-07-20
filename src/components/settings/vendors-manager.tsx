"use client";

import * as React from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlideOver } from "@/components/shared/slide-over";
import { saveVendor, setVendorArchived } from "@/lib/actions/settings";

interface Vendor {
  id: string;
  name: string;
  archived: boolean;
}

function VendorsManager({ vendors }: { vendors: Vendor[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vendor | null>(null);

  async function toggleArchive(v: Vendor) {
    await setVendorArchived(v.id, !v.archived);
    toast.success(v.archived ? "Vendor restored" : "Vendor archived");
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
          <Plus /> Add vendor
        </Button>
      </div>
      <div className="rounded-lg border bg-card">
        <ul className="divide-y">
          {vendors.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEditing(v);
                  setOpen(true);
                }}
                className={v.archived ? "text-muted-foreground line-through" : "text-foreground hover:underline"}
              >
                {v.name}
              </button>
              <div className="flex items-center gap-2">
                {v.archived && <Badge variant="outline">Archived</Badge>}
                <Button variant="ghost" size="icon" className="size-7" onClick={() => toggleArchive(v)}>
                  {v.archived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
                </Button>
              </div>
            </li>
          ))}
          {vendors.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No vendors yet</li>}
        </ul>
      </div>

      <VendorForm open={open} onOpenChange={setOpen} vendor={editing} />
    </div>
  );
}

function VendorForm({
  open,
  onOpenChange,
  vendor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}) {
  const [name, setName] = React.useState(vendor?.name ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(vendor?.name ?? "");
      setError(null);
    }
  }, [open, vendor]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveVendor({ id: vendor?.id, name });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(vendor ? "Vendor updated" : "Vendor added");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={vendor ? "Edit vendor" : "Add vendor"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="vendor-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="vendor-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="vendor-name">Name</Label>
          <Input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { VendorsManager };
