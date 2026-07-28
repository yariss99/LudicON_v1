const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Friendly current-day label for Daily Brief. */
export function formatDeskDay(date = new Date()): string {
  return dayFormatter.format(date);
}
