import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { SchedulePdfDialog } from "@/components/schedule/schedule-pdf-dialog";
import { getCalendarMonth } from "@/lib/schedule";
import { getEventCategories, getPilots } from "@/lib/settings";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface SchedulePageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getUTCFullYear();
  const month = params.month ? parseInt(params.month, 10) - 1 : now.getUTCMonth();

  const [items, categories, pilots] = await Promise.all([
    getCalendarMonth(year, month),
    getEventCategories(),
    getPilots(),
  ]);

  const prevMonth = month === 0 ? 12 : month;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 1 : month + 2;
  const nextYear = month === 11 ? year + 1 : year;

  return (
    <div>
      <PageHeader
        title="Schedule"
        description="Trips, maintenance downtime, and pilot time away in one calendar."
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border bg-card p-0.5">
              <Link href={`/schedule?year=${prevYear}&month=${prevMonth}`}>
                <Button variant="ghost" size="icon" className="size-7">
                  <ChevronLeft className="size-4" />
                </Button>
              </Link>
              <span className="px-2 text-sm font-medium text-foreground">
                {MONTH_LABELS[month]} {year}
              </span>
              <Link href={`/schedule?year=${nextYear}&month=${nextMonth}`}>
                <Button variant="ghost" size="icon" className="size-7">
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            </div>
            <SchedulePdfDialog currentYear={year} currentMonth={month} />
          </div>
        }
      />

      <ScheduleView year={year} month={month} items={items} categories={categories} pilots={pilots} />
    </div>
  );
}
