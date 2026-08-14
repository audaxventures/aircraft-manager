import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDecimalHour } from "@/lib/flight-time";
import type { CalendarItemDto } from "@/lib/schedule";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const styles = StyleSheet.create({
  weekRow: { flexDirection: "row" },
  weekdayHeader: {
    width: "14.2857%",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingVertical: 3,
    backgroundColor: "#f5f5f5",
    color: "#525252",
  },
  dayCell: {
    width: "14.2857%",
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#d4d4d4",
  },
  dayCellOutside: { backgroundColor: "#fafafa" },
  dayNumberOutside: { color: "#a3a3a3" },
  itemRow: { flexDirection: "row", alignItems: "flex-start" },
  itemText: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 3 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  legendText: { fontSize: 9, color: "#525252" },
});

// A LETTER-landscape page (612pt tall) minus its top/bottom padding, with a
// small safety margin, is the hard budget every month's grid must fit
// within -- no matter how busy a day gets, it must never spill onto a
// second page. Header/weekday-row/legend stay a fixed size; only the week
// rows (and their text) shrink, proportional to how much content they hold.
const AVAILABLE_CONTENT_HEIGHT = 500;
const HEADER_HEIGHT = 95;
const WEEKDAY_ROW_HEIGHT = 17;
const LEGEND_HEIGHT = 24;
const MIN_ROW_HEIGHT = 80;
const CELL_PADDING_BASE = 3;
const DAY_NUMBER_BLOCK_BASE = 13; // day-number font + its bottom margin
const ITEM_LINE_HEIGHT_BASE = 11.2; // 8pt font * 1.15 line-height + 2pt gap between items
const MIN_SCALE = 0.35;

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Departure time only labels the trip's start day; return time only labels its end day. */
function labelForDay(item: CalendarItemDto, day: Date): string {
  const dayKey = toKey(day);
  if (dayKey === toKey(item.startDate) && item.departureTime !== null) {
    return `${item.title} · Dep ${formatDecimalHour(item.departureTime)}`;
  }
  if (dayKey === toKey(item.endDate) && dayKey !== toKey(item.startDate) && item.returnTime !== null) {
    return `${item.title} · Ret ${formatDecimalHour(item.returnTime)}`;
  }
  return item.title;
}

function buildWeeks(year: number, month: number): Date[][] {
  const monthStart = new Date(Date.UTC(year, month, 1));
  const startWeekday = monthStart.getUTCDay();
  const days = Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(year, month, 1 - startWeekday + i)));
  const weeks: Date[][] = [];
  for (let i = 0; i < 42; i += 7) weeks.push(days.slice(i, i + 7));
  // Drop a trailing week that's entirely outside the month so short months don't waste a row.
  while (weeks.length > 4 && weeks[weeks.length - 1].every((d) => d.getUTCMonth() !== month)) {
    weeks.pop();
  }
  return weeks;
}

function itemsOnDay(items: CalendarItemDto[], day: Date): number {
  const t = day.getTime();
  return items.filter((it) => it.startDate.getTime() <= t && it.endDate.getTime() >= t).length;
}

/**
 * Computes how much every week row needs at normal size, then -- only if
 * that total would overflow the page -- a single scale factor applied to
 * every row and to item text/spacing so the whole grid always fits.
 */
function computeMonthLayout(weeks: Date[][], items: CalendarItemDto[]) {
  const naturalRowHeight = (maxItems: number) =>
    Math.max(MIN_ROW_HEIGHT, CELL_PADDING_BASE * 2 + DAY_NUMBER_BLOCK_BASE + maxItems * ITEM_LINE_HEIGHT_BASE);

  const weekMaxItems = weeks.map((week) => Math.max(0, ...week.map((day) => itemsOnDay(items, day))));
  const totalWeeksNatural = weekMaxItems.reduce((sum, n) => sum + naturalRowHeight(n), 0);
  const availableForWeeks = AVAILABLE_CONTENT_HEIGHT - HEADER_HEIGHT - WEEKDAY_ROW_HEIGHT - LEGEND_HEIGHT;

  const scale = totalWeeksNatural > availableForWeeks ? Math.max(MIN_SCALE, availableForWeeks / totalWeeksNatural) : 1;
  const rowHeights = weekMaxItems.map((n) => naturalRowHeight(n) * scale);

  return { scale, rowHeights };
}

interface ScheduleMonthData {
  year: number;
  month: number; // 0-indexed
  items: CalendarItemDto[];
}

interface ScheduleReportProps {
  aircraftTailNumber: string;
  months: ScheduleMonthData[];
  categoryLegend: { name: string; color: string }[];
}

function ScheduleReport({ aircraftTailNumber, months, categoryLegend }: ScheduleReportProps) {
  const title =
    months.length === 1
      ? `Schedule - ${MONTH_LABELS[months[0].month]} ${months[0].year}`
      : `Schedule - ${months.length} months`;

  return (
    <Document title={title}>
      {months.map(({ year, month, items }) => {
        const weeks = buildWeeks(year, month);
        const { scale, rowHeights } = computeMonthLayout(weeks, items);
        const cellPadding = CELL_PADDING_BASE * scale;
        const dayNumberStyle = { fontSize: 9.5 * scale, fontFamily: "Helvetica-Bold" as const, marginBottom: 2 * scale, color: "#171717" };
        const itemTextStyle = { fontSize: 8 * scale, lineHeight: 1.15 };
        const itemDotStyle = { width: 4.5 * scale, height: 4.5 * scale, borderRadius: 2.25 * scale, marginRight: 2.5 * scale, marginTop: 3 * scale };

        return (
          <Page key={`${year}-${month}`} size="LETTER" orientation="landscape" style={s.page}>
            <View style={s.headerBlock}>
              <Text style={s.title}>Monthly Schedule</Text>
              <Text style={s.subtitle}>
                {MONTH_LABELS[month]} {year}
              </Text>
              <View style={s.metaGrid}>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>Aircraft</Text>
                  <Text style={s.metaValue}>{aircraftTailNumber}</Text>
                </View>
              </View>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((d) => (
                <Text key={d} style={styles.weekdayHeader}>
                  {d}
                </Text>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={[styles.weekRow, { height: rowHeights[wi] }]} wrap={false}>
                {week.map((day) => {
                  const key = toKey(day);
                  const dayItems = items.filter(
                    (it) => it.startDate.getTime() <= day.getTime() && it.endDate.getTime() >= day.getTime()
                  );
                  const inMonth = day.getUTCMonth() === month;
                  return (
                    <View
                      key={key}
                      style={[styles.dayCell, { padding: cellPadding }, inMonth ? {} : styles.dayCellOutside]}
                    >
                      <Text style={[dayNumberStyle, inMonth ? {} : styles.dayNumberOutside]}>{day.getUTCDate()}</Text>
                      {dayItems.map((item) => (
                        <View key={item.id} style={[styles.itemRow, { marginBottom: 2 * scale }]} wrap={false}>
                          <View style={[itemDotStyle, { backgroundColor: item.color }]} />
                          <Text style={[styles.itemText, itemTextStyle]} hyphenationCallback={(word) => [word]}>
                            {labelForDay(item, day)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={styles.legendRow}>
              {categoryLegend.map((c) => (
                <View key={c.name} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                  <Text style={styles.legendText}>{c.name}</Text>
                </View>
              ))}
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#171717" }]} />
                <Text style={styles.legendText}>Trips</Text>
              </View>
            </View>

            <View style={s.footer} fixed>
              <Text>
                {aircraftTailNumber} · Monthly Schedule — {MONTH_LABELS[month]} {year}
              </Text>
              <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

export { ScheduleReport };
