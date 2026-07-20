"use client";

import * as React from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/slide-over";
import { saveCostCategory, setCostCategoryArchived } from "@/lib/actions/settings";

interface CostCategory {
  id: string;
  name: string;
  type: "FIXED" | "DIRECT";
  sortOrder: number;
  archived: boolean;
}

function CostCategoriesManager({ categories }: { categories: CostCategory[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CostCategory | null>(null);

  const fixed = categories.filter((c) => c.type === "FIXED");
  const direct = categories.filter((c) => c.type === "DIRECT");

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(c: CostCategory) {
    setEditing(c);
    setOpen(true);
  }

  async function toggleArchive(c: CostCategory) {
    await setCostCategoryArchived(c.id, !c.archived);
    toast.success(c.archived ? "Category restored" : "Category archived");
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={openNew}>
          <Plus /> Add category
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CategoryGroup title="Fixed" items={fixed} onEdit={openEdit} onToggleArchive={toggleArchive} />
        <CategoryGroup title="Direct / variable" items={direct} onEdit={openEdit} onToggleArchive={toggleArchive} />
      </div>

      <CategoryForm open={open} onOpenChange={setOpen} category={editing} />
    </div>
  );
}

function CategoryGroup({
  title,
  items,
  onEdit,
  onToggleArchive,
}: {
  title: string;
  items: CostCategory[];
  onEdit: (c: CostCategory) => void;
  onToggleArchive: (c: CostCategory) => void;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">{title}</div>
      <ul className="divide-y">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
            <button
              type="button"
              onClick={() => onEdit(c)}
              className={c.archived ? "text-muted-foreground line-through" : "text-foreground hover:underline"}
            >
              {c.name}
            </button>
            <div className="flex items-center gap-2">
              {c.archived && <Badge variant="outline">Archived</Badge>}
              <Button variant="ghost" size="icon" className="size-7" onClick={() => onToggleArchive(c)}>
                {c.archived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
              </Button>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No categories</li>}
      </ul>
    </div>
  );
}

function CategoryForm({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CostCategory | null;
}) {
  const [name, setName] = React.useState(category?.name ?? "");
  const [type, setType] = React.useState<"FIXED" | "DIRECT">(category?.type ?? "DIRECT");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setType(category?.type ?? "DIRECT");
      setError(null);
    }
  }, [open, category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveCostCategory({ id: category?.id, name, type, sortOrder: category?.sortOrder ?? 0 });
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
      title={category ? "Edit category" : "Add category"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Name</Label>
          <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as "FIXED" | "DIRECT")}>
            <SelectTrigger id="cat-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED">Fixed</SelectItem>
              <SelectItem value="DIRECT">Direct / variable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { CostCategoriesManager };
