import { Document, Page, Text, View } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDate, formatDateTime } from "@/lib/format";
import type { PilotCurrency } from "@/lib/currency-shared";

interface CurrencyReportProps {
  aircraftTailNumber: string;
  currencies: PilotCurrency[];
  thresholds: { takeoffsRequired: number; landingsRequired: number; periodMonths: number };
  generatedAt: Date;
}

function statusText(current: boolean, lapseDate: Date | null): string {
  if (!lapseDate) return "Not current";
  return current ? `Current until ${formatDate(lapseDate)}` : `Expired ${formatDate(lapseDate)}`;
}

function CurrencyReport({ aircraftTailNumber, currencies, thresholds, generatedAt }: CurrencyReportProps) {
  return (
    <Document title="Pilot Currency Report">
      <Page size="LETTER" style={s.page}>
        <View style={s.headerBlock}>
          <Text style={s.title}>Pilot Currency Report</Text>
          <Text style={s.subtitle}>CAR 401.05(2) — Recency for Carrying Passengers</Text>
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Aircraft</Text>
              <Text style={s.metaValue}>{aircraftTailNumber}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Requirement</Text>
              <Text style={s.metaValue}>
                {thresholds.takeoffsRequired} takeoffs / {thresholds.landingsRequired} landings in {thresholds.periodMonths} months
              </Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Generated</Text>
              <Text style={s.metaValue}>{formatDateTime(generatedAt)}</Text>
            </View>
          </View>
        </View>

        {currencies.map((c) => (
          <View key={c.pilotId} wrap={false} style={{ marginBottom: 14 }}>
            <Text style={s.sectionTitle}>{c.pilotName}</Text>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <Text style={{ fontSize: 9, width: "50%" }}>
                Day: <Text style={{ fontFamily: "Helvetica-Bold" }}>{statusText(c.day.current, c.day.lapseDate)}</Text>
              </Text>
              <Text style={{ fontSize: 9, width: "50%" }}>
                Night: <Text style={{ fontFamily: "Helvetica-Bold" }}>{statusText(c.night.current, c.night.lapseDate)}</Text>
              </Text>
            </View>

            <CurrencyDetailTable label="Day takeoffs" calc={c.day.takeoffs} />
            <CurrencyDetailTable label="Day landings" calc={c.day.landings} />
            <CurrencyDetailTable label="Night takeoffs" calc={c.night.takeoffs} />
            <CurrencyDetailTable label="Night landings" calc={c.night.landings} />
          </View>
        ))}

        {currencies.length === 0 && <Text style={{ color: "#737373" }}>No pilots on record.</Text>}

        <Text style={s.disclaimer}>
          Recency rules can change or vary by aircraft category and class. Verify against the current CARs before
          relying on this report for compliance decisions — it is an operational record, not a substitute for
          regulatory review.
        </Text>

        <View style={s.footer} fixed>
          <Text>{aircraftTailNumber} · Pilot Currency Report</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

function CurrencyDetailTable({
  label,
  calc,
}: {
  label: string;
  calc: PilotCurrency["day"]["takeoffs"];
}) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
        {label} — {calc.current ? "Current" : "Not current"}
      </Text>
      {calc.qualifyingTrips.length > 0 ? (
        <View>
          {calc.qualifyingTrips.map((t) => (
            <View key={t.tripId} style={{ flexDirection: "row", paddingVertical: 1 }}>
              <Text style={{ fontSize: 8, width: "20%" }}>{formatDate(t.date)}</Text>
              <Text style={{ fontSize: 8, width: "60%" }}>{t.routeLabel ?? ""}</Text>
              <Text style={{ fontSize: 8, width: "20%", textAlign: "right" }}>{t.count}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: 8, color: "#737373" }}>No qualifying flights on record.</Text>
      )}
    </View>
  );
}

export { CurrencyReport };
