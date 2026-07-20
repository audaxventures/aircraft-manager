import { Document, Page, Text, View } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import type { DutyDayLogDto } from "@/lib/duty";

interface DutyDayReportProps {
  aircraftTailNumber: string;
  pilotName: string | "All pilots";
  from: Date | null;
  to: Date | null;
  logs: DutyDayLogDto[];
  generatedAt: Date;
}

const COLS = [
  { w: "9%", label: "Date" },
  { w: "11%", label: "Pilot" },
  { w: "9%", label: "Report" },
  { w: "9%", label: "Duty end" },
  { w: "9%", label: "FDT (hrs)" },
  { w: "10%", label: "Rest before (hrs)" },
  { w: "11%", label: "30-day (hrs)" },
  { w: "9%", label: "Limit (hrs)" },
  { w: "7%", label: "Result" },
  { w: "16%", label: "Notes" },
];

function DutyDayReport({ aircraftTailNumber, pilotName, from, to, logs, generatedAt }: DutyDayReportProps) {
  return (
    <Document title={`Duty Day Compliance Report - ${pilotName}`}>
      <Page size="LETTER" orientation="landscape" style={s.page}>
        <View style={s.headerBlock}>
          <Text style={s.title}>Duty Day Compliance Report</Text>
          <Text style={s.subtitle}>CARS Subpart 604 — Flight Duty Time Record</Text>
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Aircraft</Text>
              <Text style={s.metaValue}>{aircraftTailNumber}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Pilot</Text>
              <Text style={s.metaValue}>{pilotName}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Date range</Text>
              <Text style={s.metaValue}>
                {from ? formatDate(from) : "Start"} – {to ? formatDate(to) : "Present"}
              </Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Generated</Text>
              <Text style={s.metaValue}>{formatDateTime(generatedAt)}</Text>
            </View>
          </View>
        </View>

        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            {COLS.map((c) => (
              <Text key={c.label} style={[s.th, { width: c.w }]}>
                {c.label}
              </Text>
            ))}
          </View>
          {logs.map((log) => (
            <View key={log.id} style={s.tableRow} wrap={false}>
              <Text style={[s.td, { width: COLS[0].w }]}>{formatDate(log.date)}</Text>
              <Text style={[s.td, { width: COLS[1].w }]}>{log.pilotName}</Text>
              <Text style={[s.td, { width: COLS[2].w }]}>{formatTime(log.reportTime)}</Text>
              <Text style={[s.td, { width: COLS[3].w }]}>{formatTime(log.dutyEndTime)}</Text>
              <Text style={[s.tdRight, { width: COLS[4].w }]}>{log.flightDutyHours.toFixed(1)}</Text>
              <Text style={[s.tdRight, { width: COLS[5].w }]}>{log.restPeriodBeforeHours.toFixed(1)}</Text>
              <Text style={[s.tdRight, { width: COLS[6].w }]}>{log.rolling30DayHours.toFixed(1)}</Text>
              <Text style={[s.tdRight, { width: COLS[7].w }]}>{log.effectiveLimitHours.toFixed(1)}</Text>
              <Text style={[log.withinLimit ? s.badgePass : s.badgeFail, { width: COLS[8].w }]}>
                {log.withinLimit ? "PASS" : "FAIL"}
              </Text>
              <Text style={[s.td, { width: COLS[9].w }]}>{log.notes ?? ""}</Text>
            </View>
          ))}
        </View>

        {logs.length === 0 && <Text style={{ marginTop: 12, color: "#737373" }}>No duty logs recorded for this range.</Text>}

        <Text style={s.disclaimer}>
          Regulatory thresholds applied reflect CARS Subpart 604 and the Private Operator Passenger Transportation
          Standards as configured in this system at the time of generation. Verify against the current regulatory
          text — this report is an operational record, not a substitute for regulatory review.
        </Text>

        <View style={s.footer} fixed>
          <Text>{aircraftTailNumber} · Duty Day Compliance Report</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export { DutyDayReport };
