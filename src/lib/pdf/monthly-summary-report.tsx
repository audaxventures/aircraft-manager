import { Document, Page, Text, View } from "@react-pdf/renderer";

import { pdfStyles as s } from "@/lib/pdf/styles";
import { formatDateTime } from "@/lib/format";
import type { MonthlyGrid, MonthlyGridRow } from "@/lib/costs";

interface MonthlySummaryReportProps {
  aircraftTailNumber: string;
  year: number;
  grid: MonthlyGrid;
  generatedAt: Date;
}

const CATEGORY_COL = "17%";
const MONTH_COL = "6%";
const TOTAL_COL = "11%";
const BOLD = { fontFamily: "Helvetica-Bold" as const };

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
  const fixedCategories = grid.categories.filter((c) => c.type === "FIXED");
  const directCategories = grid.categories.filter((c) => c.type === "DIRECT");

  function categoryRow(id: string, name: string) {
    return (
      <View key={id} style={s.tableRow} wrap={false}>
        <Text style={[s.td, { width: CATEGORY_COL }]}>{name}</Text>
        {grid.rows.map((row) => (
          <Text key={row.monthIndex} style={[s.tdRight, { width: MONTH_COL }]}>
            {money(row.byCategory[id])}
          </Text>
        ))}
        <Text style={[s.tdRight, { width: TOTAL_COL }]}>{money(grid.yearTotal.byCategory[id])}</Text>
      </View>
    );
  }

  function subtotalRow(label: string, pick: (row: MonthlyGridRow) => number) {
    return (
      <View key={label} style={[s.tableRow, { borderTopWidth: 0.5, borderTopColor: "#a3a3a3" }]} wrap={false}>
        <Text style={[s.td, { width: CATEGORY_COL }, BOLD]}>{label}</Text>
        {grid.rows.map((row) => (
          <Text key={row.monthIndex} style={[s.tdRight, { width: MONTH_COL }, BOLD]}>
            {money(pick(row))}
          </Text>
        ))}
        <Text style={[s.tdRight, { width: TOTAL_COL }, BOLD]}>{money(pick(grid.yearTotal))}</Text>
      </View>
    );
  }

  return (
    <Document title={`Monthly Cost Summary ${year}`}>
      <Page size="LETTER" orientation="landscape" style={s.page}>
        <View style={s.headerBlock}>
          <Text style={s.title}>Monthly Cost Summary</Text>
          <Text style={s.subtitle}>
            Fiscal year {year} · {grid.currency}
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

        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={[s.th, { width: CATEGORY_COL }]}>Category</Text>
            {grid.rows.map((row) => (
              <Text key={row.monthIndex} style={[s.th, { width: MONTH_COL, textAlign: "right" }]}>
                {row.monthLabel}
              </Text>
            ))}
            <Text style={[s.th, { width: TOTAL_COL, textAlign: "right" }]}>Total</Text>
          </View>

          {fixedCategories.map((c) => categoryRow(c.id, c.name))}
          {subtotalRow("Fixed total", (row) => row.fixedTotal)}

          {directCategories.map((c) => categoryRow(c.id, c.name))}
          {subtotalRow("Direct total", (row) => row.directTotal)}

          <View style={[s.tableRow, { borderTopWidth: 1, borderTopColor: "#171717" }]} wrap={false}>
            <Text style={[s.td, { width: CATEGORY_COL }, BOLD]}>Grand total</Text>
            {grid.rows.map((row) => (
              <Text key={row.monthIndex} style={[s.tdRight, { width: MONTH_COL }, BOLD]}>
                {money(row.total)}
              </Text>
            ))}
            <Text style={[s.tdRight, { width: TOTAL_COL }, BOLD]}>{money(grid.yearTotal.total)}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {aircraftTailNumber} · Monthly Cost Summary {year}
          </Text>
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
              <View key={row.monthIndex} style={s.tableRow} wrap={false}>
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
              <View style={[s.tableRow, { borderTopWidth: 1, borderTopColor: "#171717" }]} wrap={false}>
                <Text style={[s.td, { width: "14%" }, BOLD]}>Total</Text>
                <Text style={[s.tdRight, { width: "12%" }, BOLD]}>{grid.yearTotal.hours.toFixed(1)}</Text>
                <Text style={[s.tdRight, { width: "12%" }, BOLD]}>{money(grid.yearTotal.miles)}</Text>
                <Text style={[s.tdRight, { width: "15%" }, BOLD]}>{perUnit(m.directCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "15%" }, BOLD]}>{perUnit(m.fixedCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "16%" }, BOLD]}>{perUnit(m.totalCostPerHour)}</Text>
                <Text style={[s.tdRight, { width: "16%" }, BOLD]}>{perUnit(m.totalCostPerMile)}</Text>
              </View>
            );
          })()}
        </View>

        <View style={s.footer} fixed>
          <Text>
            {aircraftTailNumber} · Monthly Cost Summary {year}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export { MonthlySummaryReport };
