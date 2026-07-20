"use client";

import * as React from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Check, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlideOver } from "@/components/shared/slide-over";
import { saveEventCategory, setEventCategoryArchived } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#2a78d6",
  "#008300",
  "#e87ba4",
  "#eda100",
  "#1baf7a",
  "#eb6834",
  "#4a3aa7",
  "#e34948",
];

interface EventCategory {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  archived: boolean;
}

function EventCategoriesManager({ categories }: { categories: EventCategory[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EventCategory | null>(null);

  async function toggleArchive(c: EventCategory) {
    await setEventCategoryArchived(c.id, !c.archived);
    toast.success(c.archived ? "Category restored" : "Category archived");
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
          <Plus /> Add category
        </Button>
      </div>
      <div className="rounded-lg border bg-card">
        <ul className="divide-y">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEditing(c);
                  setOpen(true);
                }}
                className={cn(
                  "flex items-center gap-2",
                  c.archived ? "text-muted-foreground line-through" : "text-foreground hover:underline",
                )}
              >
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </button>
              <div className="flex items-center gap-2">
                {c.archived && <Badge variant="outline">Archived</Badge>}
                <Button variant="ghost" size="icon" className="size-7" onClick={() => toggleArchive(c)}>
                  {c.archived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
                </Button>
              </div>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">No event categories yet</li>
          )}
        </ul>
      </div>

      <EventCategoryForm open={open} onOpenChange={setOpen} category={editing} />
    </div>
  );
}

function EventCategoryForm({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: EventCategory | null;
}) {
  const [name, setName] = React.useState(category?.name ?? "");
  const [color, setColor] = React.useState(category?.color ?? PALETTE[0]);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setColor(category?.color ?? PALETTE[0]);
      setError(null);
    }
  }, [open, category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveEventCategory({
      id: category?.id,
      name,
      color,
      sortOrder: category?.sortOrder ?? 0,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(category ? "Category updated" : "Category added");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "Edit event category" : "Add event category"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="event-category-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="event-category-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="event-cat-name">Name</Label>
          <Input id="event-cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                className="flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background focus-visible:outline-none"
                style={{ backgroundColor: swatch, boxShadow: color === swatch ? `0 0 0 2px ${swatch}` : undefined }}
                aria-label={swatch}
              >
                {color === swatch && <Check className="size-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { EventCategoriesManager };
