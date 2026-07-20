import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDateTime } from "@/lib/format";
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
    paddingVertical: 4,
    backgroundColor: "#f5f5f5",
    color: "#525252",
  },
  dayCell: {
    width: "14.2857%",
    minHeight: 68,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#d4d4d4",
    padding: 3,
  },
  dayCellOutside: { backgroundColor: "#fafafa" },
  dayNumber: { fontSize: 7.5, fontFamily: "Helvetica-Bold", marginBottom: 2, color: "#171717" },
  dayNumberOutside: { color: "#a3a3a3" },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 1.5 },
  itemDot: { width: 4, height: 4, borderRadius: 2, marginRight: 2.5 },
  itemText: { fontSize: 6, flexShrink: 1 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  legendText: { fontSize: 8, color: "#525252" },
});

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

interface ScheduleReportProps {
  aircraftTailNumber: string;
  year: number;
  month: number; // 0-indexed
  items: CalendarItemDto[];
  categoryLegend: { name: string; color: string }[];
  generatedAt: Date;
}

function ScheduleReport({ aircraftTailNumber, year, month, items, categoryLegend, generatedAt }: ScheduleReportProps) {
  const monthStart = new Date(Date.UTC(year, month, 1));
  const startWeekday = monthStart.getUTCDay();
  const days = Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(year, month, 1 - startWeekday + i)));
  const weeks: Date[][] = [];
  for (let i = 0; i < 42; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <Document title={`Schedule - ${MONTH_LABELS[month]} ${year}`}>
      <Page size="LETTER" orientation="landscape" style={s.page}>
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
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Generated</Text>
              <Text style={s.metaValue}>{formatDateTime(generatedAt)}</Text>
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
          <View key={wi} style={styles.weekRow} wrap={false}>
            {week.map((day) => {
              const key = toKey(day);
              const dayTime = day.getTime();
              const dayItems = items.filter((it) => it.startDate.getTime() <= dayTime && it.endDate.getTime() >= dayTime);
              const inMonth = day.getUTCMonth() === month;
              return (
                <View key={key} style={[styles.dayCell, inMonth ? {} : styles.dayCellOutside]}>
                  <Text style={[styles.dayNumber, inMonth ? {} : styles.dayNumberOutside]}>{day.getUTCDate()}</Text>
                  {dayItems.slice(0, 6).map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={[styles.itemDot, { backgroundColor: item.color }]} />
                      <Text style={styles.itemText}>{item.title}</Text>
                    </View>
                  ))}
                  {dayItems.length > 6 && <Text style={styles.itemText}>+{dayItems.length - 6} more</Text>}
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
    </Document>
  );
}

export { ScheduleReport };
