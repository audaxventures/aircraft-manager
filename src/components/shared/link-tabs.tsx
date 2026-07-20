import Link from "next/link";

import { cn } from "@/lib/utils";

interface LinkTabsProps {
  items: { label: string; href: string; active: boolean }[];
  className?: string;
}

function LinkTabs({ items, className }: LinkTabsProps) {
  return (
    <div className={cn("inline-flex h-9 w-fit items-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex h-7 items-center justify-center rounded-sm px-3 text-sm font-medium whitespace-nowrap transition-colors",
            item.active ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export { LinkTabs };
