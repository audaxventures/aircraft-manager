import { Document, Page, Text, View } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDate, formatDateTime } from "@/lib/format";
import type { CostEntryDto } from "@/lib/costs";

interface CostEntriesReportProps {
  aircraftTailNumber: string;
  title: string;
  from: Date | null;
  to: Date | null;
  vendorName: string | null;
  entries: CostEntryDto[];
  generatedAt: Date;
}

const COLS = [
  { w: "10%", label: "Date" },
  { w: "17%", label: "Category" },
  { w: "18%", label: "Vendor" },
  { w: "15%", label: "Invoice #" },
  { w: "20%", label: "Notes" },
  { w: "10%", label: "Currency" },
  { w: "10%", label: "Amount" },
];

function money(n: number) {
  return n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CostEntriesReport({ aircraftTailNumber, title, from, to, vendorName, entries, generatedAt }: CostEntriesReportProps) {
  const totalsByCurrency = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.currency] = (acc[e.currency] ?? 0) + e.amount;
    return acc;
  }, {});

  return (
    <Document title={title}>
      <Page size="LETTER" orientation="landscape" style={s.page}>
        <View style={s.headerBlock}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>C-FPFX Aircraft Manager — Cost Entries</Text>
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
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Vendor</Text>
              <Text style={s.metaValue}>{vendorName ?? "All vendors"}</Text>
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
          {entries.map((e) => (
            <View key={e.id} style={s.tableRow} wrap={false}>
              <Text style={[s.td, { width: COLS[0].w }]}>{formatDate(e.date)}</Text>
              <Text style={[s.td, { width: COLS[1].w }]}>{e.categoryName}</Text>
              <Text style={[s.td, { width: COLS[2].w }]}>{e.vendorName ?? "—"}</Text>
              <Text style={[s.td, { width: COLS[3].w }]}>{e.invoiceNumber ?? "—"}</Text>
              <Text style={[s.td, { width: COLS[4].w }]}>{e.notes ?? ""}</Text>
              <Text style={[s.td, { width: COLS[5].w }]}>{e.currency}</Text>
              <Text style={[s.tdRight, { width: COLS[6].w }]}>{money(e.amount)}</Text>
            </View>
          ))}
        </View>

        {entries.length === 0 && <Text style={{ marginTop: 12, color: "#737373" }}>No cost entries for this range.</Text>}

        <View style={{ marginTop: 16, alignItems: "flex-end" }}>
          {Object.entries(totalsByCurrency).map(([currency, total]) => (
            <Text key={currency} style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 }}>
              Total ({currency}): {money(total)}
            </Text>
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text>
            {aircraftTailNumber} · {title}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export { CostEntriesReport };
