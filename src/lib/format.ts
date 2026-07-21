const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyFormatterNoDecimals = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-CA", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatCurrency(value: number | string | null | undefined, opts?: { noDecimals?: boolean }) {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return opts?.noDecimals ? currencyFormatterNoDecimals.format(n) : currencyFormatter.format(n);
}

export function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return numberFormatter.format(n);
}

export function formatHours(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return `${numberFormatter.format(n)} hrs`;
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return dateFormatter.format(d);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return dateTimeFormatter.format(d);
}


export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "toNumber" in (value as object)) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const n = parseFloat(String(value));
  return Number.isNaN(n) ? 0 : n;
}
