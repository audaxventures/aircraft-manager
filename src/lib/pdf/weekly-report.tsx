import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import { formatDate } from "@/lib/format";
import type { WeeklyReportDto } from "@/lib/weekly-reports";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#171717",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textDecoration: "underline",
    marginBottom: 16,
  },
  headerGrid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  headerCol: { width: "50%" },
  headerRow: { flexDirection: "row", marginBottom: 3 },
  headerLabel: { fontFamily: "Helvetica-Bold", fontSize: 9.5 },
  headerValue: { fontSize: 9.5 },
  section: { marginBottom: 12 },
  sectionHeader: {
    backgroundColor: "#e5e5e5",
    paddingVertical: 5,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    borderWidth: 0.75,
    borderColor: "#a3a3a3",
  },
  sectionHeaderHighlight: {
    backgroundColor: "#fde047",
  },
  overviewBox: {
    borderWidth: 0.75,
    borderColor: "#a3a3a3",
    borderTopWidth: 0,
    padding: 8,
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  listRow: {
    flexDirection: "row",
    borderWidth: 0.75,
    borderColor: "#a3a3a3",
    borderTopWidth: 0,
  },
  listNum: {
    width: 22,
    padding: 5,
    fontSize: 9,
    borderRightWidth: 0.75,
    borderColor: "#a3a3a3",
  },
  listText: { flex: 1, padding: 5, fontSize: 9.5 },
  maintHeaderRow: {
    flexDirection: "row",
    borderWidth: 0.75,
    borderColor: "#a3a3a3",
    borderTopWidth: 0,
    backgroundColor: "#f5f5f5",
  },
  maintHeaderDue: {
    width: 90,
    padding: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    borderLeftWidth: 0.75,
    borderColor: "#a3a3a3",
  },
  maintDue: {
    width: 90,
    padding: 5,
    fontSize: 9.5,
    textAlign: "right",
    borderLeftWidth: 0.75,
    borderColor: "#a3a3a3",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: "#a3a3a3",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e5e5",
    paddingTop: 6,
  },
});

function ListSection({ title, items, highlight }: { title: string; items: string[]; highlight?: boolean }) {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={[styles.sectionHeader, highlight ? styles.sectionHeaderHighlight : {}]}>{title}</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.listRow}>
          <Text style={styles.listNum}>{i + 1}.</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
      {items.length === 0 && (
        <View style={styles.listRow}>
          <Text style={styles.listNum}>1.</Text>
          <Text style={styles.listText}> </Text>
        </View>
      )}
    </View>
  );
}

interface WeeklyReportPdfProps {
  aircraftTailNumber: string;
  aircraftType: string;
  serialNumber: string;
  report: WeeklyReportDto;
}

function WeeklyReportPdf({ aircraftTailNumber, aircraftType, serialNumber, report }: WeeklyReportPdfProps) {
  return (
    <Document title={`Weekly Status Report ${formatDate(report.reportDate)}`}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Weekly Status Report</Text>

        <View style={styles.headerGrid}>
          <View style={styles.headerCol}>
            <View style={styles.headerRow}>
              <Text style={styles.headerLabel}>Owner/ Operator: </Text>
              <Text style={styles.headerValue}>{report.ownerOperator || "—"}</Text>
            </View>
            <View style={styles.headerRow}>
              <Text style={styles.headerLabel}>Aircraft Make and Model: </Text>
              <Text style={styles.headerValue}>{aircraftType}</Text>
            </View>
            <View style={styles.headerRow}>
              <Text style={styles.headerLabel}>Program Manager: </Text>
              <Text style={styles.headerValue}>{report.programManager || "—"}</Text>
            </View>
          </View>
          <View style={styles.headerCol}>
            <View style={styles.headerRow}>
              <Text style={styles.headerLabel}>Registration: </Text>
              <Text style={styles.headerValue}>{aircraftTailNumber}</Text>
            </View>
            <View style={styles.headerRow}>
              <Text style={styles.headerLabel}>Serial Number: </Text>
              <Text style={styles.headerValue}>{serialNumber || "—"}</Text>
            </View>
            <View style={styles.headerRow}>
              <Text style={styles.headerLabel}>Date: </Text>
              <Text style={styles.headerValue}>{formatDate(report.reportDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionHeader}>1. Week Overview</Text>
          <Text style={styles.overviewBox}>{report.weekOverview}</Text>
        </View>

        <ListSection title="2. Accomplishments" items={report.accomplishments} />
        <ListSection title="3. New Issues" items={report.newIssues} highlight />
        <ListSection title="4. To Be Completed" items={report.toBeCompleted} />
        <ListSection title="5. Issues Requiring Customer Input/ Decisions" items={report.customerDecisions} />

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionHeader}>6. Maintenance Due List</Text>
          <View style={styles.maintHeaderRow}>
            <Text style={{ flex: 1, padding: 4 }} />
            <Text style={styles.maintHeaderDue}>DATE/DUE</Text>
          </View>
          {report.maintenanceItems.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.listNum}>{i + 1}.</Text>
              <Text style={styles.listText}>{item.description}</Text>
              <Text style={styles.maintDue}>{item.due}</Text>
            </View>
          ))}
          {report.maintenanceItems.length === 0 && (
            <View style={styles.listRow}>
              <Text style={styles.listNum}>1.</Text>
              <Text style={styles.listText}> </Text>
              <Text style={styles.maintDue}> </Text>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {aircraftTailNumber} · Weekly Status Report {formatDate(report.reportDate)}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export { WeeklyReportPdf };
