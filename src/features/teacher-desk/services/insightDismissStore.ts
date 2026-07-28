import { INSIGHT_DISMISS_STORAGE_KEY } from "../constants";

type DismissRecord = {
  insightId: string;
  dayKey: string;
};

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function readRecords(): DismissRecord[] {
  try {
    const raw = window.localStorage.getItem(INSIGHT_DISMISS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DismissRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecords(records: DismissRecord[]) {
  try {
    window.localStorage.setItem(
      INSIGHT_DISMISS_STORAGE_KEY,
      JSON.stringify(records),
    );
  } catch {
    // Private mode / quota — dismiss stays in-session only.
  }
}

export function isInsightDismissedForToday(insightId: string): boolean {
  const day = todayKey();
  return readRecords().some(
    (record) => record.insightId === insightId && record.dayKey === day,
  );
}

/** Soft dismiss — never permanent; expires next calendar day. */
export function dismissInsightForToday(insightId: string) {
  const day = todayKey();
  const next = readRecords().filter(
    (record) => !(record.insightId === insightId && record.dayKey === day),
  );
  next.push({ insightId, dayKey: day });
  writeRecords(next);
}
