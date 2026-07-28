export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return "Bună dimineața";
  if (hour < 18) return "Bună ziua";
  return "Bună seara";
}
