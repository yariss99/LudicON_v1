import type { GradeLevel, ProjectColor } from "@ludicon/domain";

import { withoutSeed } from "./material-kinds";

/**
 * A first reading of what the teacher wrote.
 *
 * Moved out of the route unchanged in spirit: it proposes a starting point
 * the teacher corrects on the very next step, so a wrong guess costs one edit
 * rather than a wrong lesson. Nothing here is a decision.
 */

const SUBJECT_HINTS: readonly {
  pattern: RegExp;
  subject: string;
  color: ProjectColor;
}[] = [
  {
    pattern: /matematic|fracți|fracti|geometri|înmulțir|adunar|numer/i,
    subject: "Matematică",
    color: "blue",
  },
  {
    pattern: /științe|stiinte|fotosintez|plante|corpul|natur|experiment/i,
    subject: "Științe ale naturii",
    color: "emerald",
  },
  {
    pattern: /limba român|romana|gramatic|lectur|povest|text|ortograf/i,
    subject: "Limba și literatura română",
    color: "amber",
  },
  {
    pattern: /englez|english/i,
    subject: "Limba engleză",
    color: "teal",
  },
  { pattern: /istorie|istoric/i, subject: "Istorie", color: "rose" },
  { pattern: /geografi|hart|relief/i, subject: "Geografie", color: "teal" },
  {
    pattern: /desen|plastic|muzic|art[ăa]\b/i,
    subject: "Arte vizuale",
    color: "rose",
  },
];

const GRADE_HINTS: readonly { pattern: RegExp; grade: GradeLevel }[] = [
  { pattern: /pregătitoare|pregatitoare/i, grade: "pregatitoare" },
  { pattern: /clasa\s*(a\s*)?(viii|8)\b/i, grade: "clasa_8" },
  { pattern: /clasa\s*(a\s*)?(vii|7)\b/i, grade: "clasa_7" },
  { pattern: /clasa\s*(a\s*)?(vi|6)\b/i, grade: "clasa_6" },
  { pattern: /clasa\s*(a\s*)?(v|5)\b/i, grade: "clasa_5" },
  { pattern: /clasa\s*(a\s*)?(iv|4)\b/i, grade: "clasa_4" },
  { pattern: /clasa\s*(a\s*)?(iii|3)\b/i, grade: "clasa_3" },
  { pattern: /clasa\s*(a\s*)?(ii|2)\b/i, grade: "clasa_2" },
  { pattern: /clasa\s*(a\s*)?(i|1)\b/i, grade: "clasa_1" },
];

/** One class hour, the default across Romanian primary and secondary. */
export const DEFAULT_DURATION_MINUTES = 45;

/** Durations offered on the last step. Everything a period is normally worth. */
export const DURATION_CHOICES: readonly number[] = [20, 30, 40, 45, 50, 60, 90];

const MINUTES_PATTERN = /(\d{2,3})\s*(?:de\s*)?(?:minute|min\b)/i;
const HOUR_PATTERN = /\bo\s+or[ăa]\b/i;
const TWO_HOURS_PATTERN = /\bdou[ăa]\s+ore\b/i;

function readDuration(text: string): number | null {
  const minutes = MINUTES_PATTERN.exec(text);
  if (minutes) {
    const parsed = Number.parseInt(minutes[1] ?? "", 10);
    if (Number.isFinite(parsed) && parsed >= 5 && parsed <= 240) return parsed;
  }
  if (TWO_HOURS_PATTERN.test(text)) return 90;
  if (HOUR_PATTERN.test(text)) return 60;
  return null;
}

/**
 * What the sentence actually said.
 *
 * `null` and the empty subject mean "the teacher did not say", not "we chose
 * a default" — the difference is what lets the last step mark only the values
 * it genuinely read. Claiming to have understood a fallback would make the
 * mark worthless everywhere else.
 */
export interface IntentReading {
  /** Short, sentence-cased topic. Empty when the teacher wrote nothing yet. */
  topic: string;
  subject: string;
  grade: GradeLevel | null;
  color: ProjectColor;
  durationMinutes: number | null;
}

/** Whatever a subject hint could not name. Never shown as a failure. */
export const SUBJECT_UNKNOWN = "";

export function readIntent(text: string): IntentReading {
  const trimmed = text.trim();
  const subjectHit = SUBJECT_HINTS.find((hint) => hint.pattern.test(trimmed));
  const gradeHit = GRADE_HINTS.find((hint) => hint.pattern.test(trimmed));

  const topicSource = withoutSeed(trimmed).trim();
  const firstClause = (topicSource.split(/[.\n?!]/)[0] ?? topicSource).trim();
  const shortened =
    firstClause.length > 80 ? `${firstClause.slice(0, 77)}…` : firstClause;
  const topic =
    shortened.length > 0
      ? shortened.charAt(0).toLocaleUpperCase("ro-RO") + shortened.slice(1)
      : "";

  return {
    topic,
    subject: subjectHit?.subject ?? SUBJECT_UNKNOWN,
    grade: gradeHit?.grade ?? null,
    color: subjectHit?.color ?? "blue",
    durationMinutes: readDuration(trimmed),
  };
}
