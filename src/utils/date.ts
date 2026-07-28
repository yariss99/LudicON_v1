const relativeFormatter = new Intl.RelativeTimeFormat("ro", {
  numeric: "auto",
});

const absoluteFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: "day", ms: 1000 * 60 * 60 * 24 },
  { unit: "hour", ms: 1000 * 60 * 60 },
  { unit: "minute", ms: 1000 * 60 },
];

export function formatRelativeTime(isoDate: string, now = Date.now()): string {
  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) return isoDate;

  const delta = timestamp - now;

  for (const { unit, ms } of units) {
    if (Math.abs(delta) >= ms || unit === "minute") {
      return relativeFormatter.format(Math.round(delta / ms), unit);
    }
  }

  return "acum";
}

export function formatAbsoluteDate(isoDate: string): string {
  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) return isoDate;
  return absoluteFormatter.format(timestamp);
}

export function nowIso(): string {
  return new Date().toISOString();
}
