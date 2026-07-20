import { formatCurrency } from "@/lib/format";

interface CategoryBreakdownProps {
  categories: { name: string; type: "FIXED" | "DIRECT"; total: number }[];
}

function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const withAmounts = categories.filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
  const max = withAmounts[0]?.total ?? 0;

  if (withAmounts.length === 0) {
    return <p className="text-sm text-muted-foreground">No costs recorded for this period.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {withAmounts.map((c) => (
        <li key={c.name} className="grid grid-cols-[7rem_1fr_5.5rem] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{c.name}</span>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-chart-fixed"
              style={{ width: max > 0 ? `${Math.max((c.total / max) * 100, 2)}%` : 0 }}
            />
          </div>
          <span className="text-right tabular-nums">{formatCurrency(c.total, { noDecimals: true })}</span>
        </li>
      ))}
    </ul>
  );
}

export { CategoryBreakdown };
