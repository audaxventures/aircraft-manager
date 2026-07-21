import { Document, Page, Text, View } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDate } from "@/lib/format";
import { getTripColumnValue } from "@/lib/trip-export-format";
import type { TripDto } from "@/lib/trips";
import type { TripExportColumn } from "@/lib/trip-export-columns";

interface TripsReportProps {
  aircraftTailNumber: string;
  from: Date | null;
  to: Date | null;
  columns: TripExportColumn[];
  trips: TripDto[];
}

function TripsReport({ aircraftTailNumber, from, to, columns, trips }: TripsReportProps) {
  const width = `${100 / Math.max(columns.length, 1)}%`;

  return (
    <Document title="Trip Log">
      <Page size="LETTER" orientation="landscape" style={s.page}>
        <View style={s.headerBlock}>
          <Text style={s.title}>Trip Log</Text>
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Aircraft</Text>
              <Text style={s.metaValue}>{aircraftTailNumber}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Date range</Text>
              <Text style={s.metaValue}>
                {from ? formatDate(from) : "Start"} – {to ? formatDate(to) : "Present"}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            {columns.map((c) => (
              <Text key={c.key} style={[s.th, { width }]}>
                {c.label}
              </Text>
            ))}
          </View>
          {trips.map((trip) => (
            <View key={trip.id} style={s.tableRow} wrap={false}>
              {columns.map((c) => (
                <Text key={c.key} style={[s.td, { width }]}>
                  {getTripColumnValue(trip, c.key)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {trips.length === 0 && <Text style={{ marginTop: 12, color: "#737373" }}>No trips for this range.</Text>}

        <View style={s.footer} fixed>
          <Text>{aircraftTailNumber} · Trip Log</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export { TripsReport };
