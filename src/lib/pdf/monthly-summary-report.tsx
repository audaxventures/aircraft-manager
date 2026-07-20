import { Document, Page, Text, View } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDateTime } from "@/lib/format";
import type { MonthlyGrid } from "@/lib/costs";

interface MonthlySummaryReportProps {
  aircraftTailNumber: string;
  year: number;
  grid: MonthlyGrid;
  generatedAt: Date;
}

function money(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

function perUnit(n: number | null) {
  if (n === null) return "—";
  return n.toLocaleString("en-CA", { maximumFractionDigits: 2 });
}

function metrics(row: { hours: number; miles: number; fixedTotal: number; directTotal: number; total: number }) {
  const div = (n: number, d: number) => (d > 0 ? n / d : null);
  return {
    directCostPerHour: div(row.directTotal, row.hours),
    fixedCostPerHour: div(row.fixedTotal, row.hours),
    totalCostPerHour: div(row.total, row.hours),
    directCostPerMile: div(row.directTotal, row.miles),
    totalCostPerMile: div(row.total, row.miles),
  };
}

function MonthlySummaryReport({ aircraftTailNumber, year, grid, generatedAt }: MonthlySummaryReportProps) {
  const categories = grid.categories;
  const colWidth = `${Math.floor(70 / Math.max(categories.length, 1))}%`;

  return (
    <Document title={`Monthly Cost Summary ${year}`}>
      <Page size="LETTER" orientation="landscape" style={s.page}>
        <View style={s.headerBlock}>
          <Text style={s.title}>Monthly Cost Summary</Text>
          <Text style={s.subtitle}>Fiscal year {year}</Text>
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

        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={[s.th, { width: "10%" }]}>Month</Text>
            {categories.map((c) => (
              <Text key={c.id} style={[s.th, { width: colWidth }]}>
                {c.name}
              </Text>
            ))}
            <Text style={[s.th, { width: "10%" }]}>Fixed</Text>
            <Text style={[s.th, { width: "10%" }]}>Direct</Text>
            <Text style={[s.th, { width: "10%" }]}>Total</Text>
          </View>
          {grid.rows.map((row) => (
            <View key={row.monthIndex} style={s.tableRow}>
              <Text style={[s.td, { width: "10%" }]}>{row.monthLabel}</Text>
              {categories.map((c) => (
                <Text key={c.id} style={[s.tdRight, { width: colWidth }]}>
                  {money(row.byCategory[c.id])}
                </Text>
              ))}
              <Text style={[s.tdRight, { width: "10%" }]}>{money(row.fixedTotal)}</Text>
              <Text style={[s.tdRight, { width: "10%" }]}>{money(row.directTotal)}</Text>
              <Text style={[s.tdRight, { width: "10%" }]}>{money(row.total)}</Text>
            </View>
          ))}
          <View style={[s.tableRow, { borderTopWidth: 1, borderTopColor: "#171717" }]}>
            <Text style={[s.td, { width: "10%", fontFamily: "Helvetica-Bold" }]}>Total</Text>
            {categories.map((c) => (
              <Text key={c.id} style={[s.tdRight, { width: colWidth, fontFamily: "Helvetica-Bold" }]}>
                {money(grid.yearTotal.byCategory[c.id])}
              </Text>
            ))}
            <Text style={[s.tdRight, { width: "10%", fontFamily: "Helvetica-Bold" }]}>{money(grid.yearTotal.fixedTotal)}</Text>
            <Text style={[s.tdRight, { width: "10%", fontFamily: "Helvetica-Bold" }]}>{money(grid.yearTotal.directTotal)}</Text>
            <Text style={[s.tdRight, { width: "10%", fontFamily: "Helvetica-Bold" }]}>{money(grid.yearTotal.total)}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>{aircraftTailNumber} · Monthly Cost Summary {year}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      <Page size="LETTER" style={s.page}>
        <Text style={s.sectionTitle}>Flying Activity &amp; Cost-per-Unit</Text>
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={[s.th, { width: "14%" }]}>Month</Text>
            <Text style={[s.th, { width: "12%" }]}>Hours</Text>
            <Text style={[s.th, { width: "12%" }]}>Miles</Text>
            <Text style={[s.th, { width: "15%" }]}>Direct $/hr</Text>
            <Text style={[s.th, { width: "15%" }]}>Fixed $/hr</Text>
            <Text style={[s.th, { width: "16%" }]}>Total $/hr</Text>
            <Text style={[s.th, { width: "16%" }]}>Total $/mi</Text>
          </View>
          {grid.rows.map((row) => {
            const m = metrics(row);
            return (
              <View key={row.monthIndex} style={s.tableRow}>
                <Text style={[s.td, { width: "14%" }]}>{row.monthLabel}</Text>
                <Text style={[s.tdRight, { width: "12%" }]}>{row.hours.toFixed(1)}</Text>
                <Text style={[s.tdRight, { width: "12%" }]}>{money(row.miles)}</Text>
                <Text style={[s.tdRight, { width: "15%" }]}>{perUnit(m.directCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "15%" }]}>{perUnit(m.fixedCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "16%" }]}>{perUnit(m.totalCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "16%" }]}>{perUnit(m.totalCostPerMile)}</Text>
              </View>
            );
          })}
          {(() => {
            const m = metrics(grid.yearTotal);
            return (
              <View style={[s.tableRow, { borderTopWidth: 1, borderTopColor: "#171717" }]}>
                <Text style={[s.td, { width: "14%", fontFamily: "Helvetica-Bold" }]}>Total</Text>
                <Text style={[s.tdRight, { width: "12%", fontFamily: "Helvetica-Bold" }]}>{grid.yearTotal.hours.toFixed(1)}</Text>
                <Text style={[s.tdRight, { width: "12%", fontFamily: "Helvetica-Bold" }]}>{money(grid.yearTotal.miles)}</Text>
                <Text style={[s.tdRight, { width: "15%", fontFamily: "Helvetica-Bold" }]}>{perUnit(m.directCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "15%", fontFamily: "Helvetica-Bold" }]}>{perUnit(m.fixedCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "16%", fontFamily: "Helvetica-Bold" }]}>{perUnit(m.totalCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "16%", fontFamily: "Helvetica-Bold" }]}>{perUnit(m.totalCostPerMile)}</Text>
              </View>
            );
          })()}
        </View>

        <View style={s.footer} fixed>
          <Text>{aircraftTailNumber} · Monthly Cost Summary {year}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export { MonthlySummaryReport };
