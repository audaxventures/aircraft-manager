import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
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
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingVertical: 3,
    backgroundColor: "#f5f5f5",
    color: "#525252",
  },
  dayCell: {
    width: "14.2857%",
    height: 62,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#d4d4d4",
    padding: 2.5,
    overflow: "hidden",
  },
  dayCellOutside: { backgroundColor: "#fafafa" },
  dayNumber: { fontSize: 7, fontFamily: "Helvetica-Bold", marginBottom: 1.5, color: "#171717" },
  dayNumberOutside: { color: "#a3a3a3" },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 1 },
  itemDot: { width: 3.5, height: 3.5, borderRadius: 1.75, marginRight: 2 },
  itemText: { fontSize: 5.5, flexShrink: 1 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  legendText: { fontSize: 8, color: "#525252" },
});

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
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
        return (
          <Page key={`${year}-${month}`} size="LETTER" orientation="landscape" style={s.page} wrap={false}>
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
              <View key={wi} style={styles.weekRow}>
                {week.map((day) => {
                  const key = toKey(day);
                  const dayTime = day.getTime();
                  const dayItems = items.filter((it) => it.startDate.getTime() <= dayTime && it.endDate.getTime() >= dayTime);
                  const inMonth = day.getUTCMonth() === month;
                  return (
                    <View key={key} style={[styles.dayCell, inMonth ? {} : styles.dayCellOutside]}>
                      <Text style={[styles.dayNumber, inMonth ? {} : styles.dayNumberOutside]}>{day.getUTCDate()}</Text>
                      {dayItems.slice(0, 3).map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                          <View style={[styles.itemDot, { backgroundColor: item.color }]} />
                          <Text style={styles.itemText}>{item.title}</Text>
                        </View>
                      ))}
                      {dayItems.length > 3 && <Text style={styles.itemText}>+{dayItems.length - 3} more</Text>}
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
