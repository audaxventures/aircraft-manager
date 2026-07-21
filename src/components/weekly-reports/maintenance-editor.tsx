"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MaintenanceItem } from "@/lib/weekly-reports";

interface MaintenanceEditorProps {
  items: MaintenanceItem[];
  onChange: (items: MaintenanceItem[]) => void;
}

function MaintenanceEditor({ items, onChange }: MaintenanceEditorProps) {
  function update(index: number, field: "description" | "due", value: string) {
    onChange(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    onChange([...items, { description: "", due: "" }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b bg-secondary/40 px-4 py-2 text-sm font-medium text-foreground">
        Maintenance Due List
        <Button type="button" variant="ghost" size="icon" className="size-6" onClick={addItem}>
          <Plus className="size-3.5" />
        </Button>
      </div>
      <div className="divide-y">
        {items.length === 0 && (
          <button
            type="button"
            onClick={addItem}
            className="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:text-foreground"
          >
            + Add item
          </button>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <span className="w-4 shrink-0 text-xs text-muted-foreground">{i + 1}.</span>
            <Input
              value={item.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="Description"
              className="h-8 flex-1 border-none shadow-none focus-visible:ring-1"
            />
            <Input
              value={item.due}
              onChange={(e) => update(i, "due", e.target.value)}
              placeholder="Date/due"
              className="h-8 w-36 shrink-0 border-none shadow-none focus-visible:ring-1"
            />
            <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => removeItem(i)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export { MaintenanceEditor };
