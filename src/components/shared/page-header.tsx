import * as React from "react";
import { Plane } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/70 to-blue-100/50 p-6 shadow-sm dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-900/10">
      <HeaderIllustration />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Icon className="size-6" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}

// Purely decorative: a faint plane silhouette with a contrail streak, echoing
// the aviation photography used elsewhere in the app without needing an
// actual image asset for every page header.
function HeaderIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-1/2 left-[56%] h-px w-56 -translate-y-8 -rotate-12 bg-gradient-to-r from-transparent to-foreground/15" />
      <Plane className="absolute top-1/2 left-[62%] size-16 -translate-y-1/2 text-foreground/10" strokeWidth={1} />
    </div>
  );
}

export { PageHeader };
