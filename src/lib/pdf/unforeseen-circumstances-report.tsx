import { Document, Page, Text, View } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDate, formatDateTime } from "@/lib/format";
import { dateToDecimalHour, formatDecimalHour } from "@/lib/flight-time";
import type { DutyDayLogDto } from "@/lib/duty";

interface UnforeseenCircumstancesReportProps {
  aircraftTailNumber: string;
  pilotName: string | "All pilots";
  from: Date | null;
  to: Date | null;
  logs: DutyDayLogDto[];
  generatedAt: Date;
}

const COLS = [
  { w: "8%", label: "Date" },
  { w: "10%", label: "Pilot" },
  { w: "9%", label: "Report (UTC)" },
  { w: "9%", label: "Duty end (UTC)" },
  { w: "7%", label: "FDT (hrs)" },
  { w: "7%", label: "Limit (hrs)" },
  { w: "13%", label: "Signed by" },
  { w: "13%", label: "Signed at" },
  { w: "24%", label: "Unforeseen circumstances" },
];

function UnforeseenCircumstancesReport({
  aircraftTailNumber,
  pilotName,
  from,
  to,
  logs,
  generatedAt,
}: UnforeseenCircumstancesReportProps) {
  const entries = logs.filter((l) => l.unforeseenCircumstancesApplied);

  return (
    <Document title={`Unforeseen Operational Circumstances Report - ${pilotName}`}>
      <Page size="LETTER" orientation="landscape" style={s.page}>
        <View style={s.headerBlock}>
          <Text style={s.title}>Unforeseen Operational Circumstances Report</Text>
          <Text style={s.subtitle}>CARS 604.102 — Flight Duty Period Extension Notifications</Text>
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
              <Text key={c.label} style={[s.th, { width: c.w, paddingRight: 4 }]}>
                {c.label}
              </Text>
            ))}
          </View>
          {entries.map((log) => (
            <View key={log.id} style={s.tableRow} wrap={false}>
              <Text style={[s.td, { width: COLS[0].w, paddingRight: 4 }]}>{formatDate(log.date)}</Text>
              <Text style={[s.td, { width: COLS[1].w, paddingRight: 4 }]}>{log.pilotName}</Text>
              <Text style={[s.td, { width: COLS[2].w, paddingRight: 4 }]}>{formatDecimalHour(dateToDecimalHour(log.reportTime))}</Text>
              <Text style={[s.td, { width: COLS[3].w, paddingRight: 4 }]}>{formatDecimalHour(dateToDecimalHour(log.dutyEndTime))}</Text>
              <Text style={[s.tdRight, { width: COLS[4].w, paddingRight: 4 }]}>{log.flightDutyHours.toFixed(1)}</Text>
              <Text style={[s.tdRight, { width: COLS[5].w, paddingRight: 4 }]}>{log.effectiveLimitHours.toFixed(1)}</Text>
              <Text style={[s.td, { width: COLS[6].w, paddingRight: 4 }]}>{log.unforeseenSignedByName ?? ""}</Text>
              <Text style={[s.td, { width: COLS[7].w, paddingRight: 4 }]}>
                {log.unforeseenSignedAt ? formatDateTime(log.unforeseenSignedAt) : ""}
              </Text>
              <Text style={[s.td, { width: COLS[8].w }]}>{log.unforeseenCircumstancesNote ?? ""}</Text>
            </View>
          ))}
        </View>

        {entries.length === 0 && (
          <Text style={{ marginTop: 12, color: "#737373" }}>No unforeseen operational circumstances recorded for this range.</Text>
        )}

        <Text style={s.disclaimer}>
          Reflects CARS 604.102 as configured in this system at the time of generation. Verify against the current
          regulatory text — this report is an operational record, not a substitute for regulatory review.
        </Text>

        <View style={s.footer} fixed>
          <Text>{aircraftTailNumber} · Unforeseen Operational Circumstances Report</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export { UnforeseenCircumstancesReport };
