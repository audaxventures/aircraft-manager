import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#171717",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#525252",
    marginBottom: 10,
  },
  headerBlock: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  metaItem: {
    width: "50%",
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 8,
    color: "#737373",
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    display: "flex",
    width: "100%",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
  },
  th: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#525252",
  },
  td: {
    fontSize: 8.5,
  },
  tdRight: {
    fontSize: 8.5,
    textAlign: "right",
  },
  badgePass: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
  },
  badgeFail: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#b91c1c",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7.5,
    color: "#a3a3a3",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e5e5",
    paddingTop: 6,
  },
  disclaimer: {
    fontSize: 7.5,
    color: "#a3a3a3",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 6,
  },
});
