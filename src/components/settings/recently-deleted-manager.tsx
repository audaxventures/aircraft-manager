"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { restoreTrashItem } from "@/lib/actions/trash";
import { formatDateTime } from "@/lib/format";
import type { TrashItem } from "@/lib/trash";

const KIND_LABELS: Record<TrashItem["kind"], string> = {
  trip: "Trip",
  cost: "Cost",
  duty: "Duty log",
  event: "Event",
  "weekly-report": "Weekly report",
};

function RecentlyDeletedManager({ items }: { items: TrashItem[] }) {
  const [restoringId, setRestoringId] = React.useState<string | null>(null);
  const [restoredIds, setRestoredIds] = React.useState<Set<string>>(new Set());

  async function handleRestore(item: TrashItem) {
    setRestoringId(item.id);
    const result = await restoreTrashItem(item.kind, item.id);
    setRestoringId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setRestoredIds((prev) => new Set(prev).add(item.id));
    toast.success("Restored");
  }

  const visible = items.filter((i) => !restoredIds.has(i.id));

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Deleted trips, costs, duty logs, calendar events, and weekly reports land here instead of being permanently
        erased. Restore anything deleted by mistake.
      </p>
      <div className="rounded-lg border bg-card">
        <ul className="divide-y">
          {visible.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{KIND_LABELS[item.kind]}</Badge>
                  <span className="truncate font-medium text-foreground">{item.title}</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {item.subtitle} · Deleted {formatDateTime(item.deletedAt)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestore(item)}
                disabled={restoringId === item.id}
              >
                <RotateCcw className="size-3.5" /> {restoringId === item.id ? "Restoring…" : "Restore"}
              </Button>
            </li>
          ))}
          {visible.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">Nothing deleted recently</li>}
        </ul>
      </div>
    </div>
  );
}

export { RecentlyDeletedManager };
