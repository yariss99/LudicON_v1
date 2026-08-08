import type { ValidationIssue } from "@ludicon/domain";

/**
 * Reusable checks.
 *
 * The five builders shipped 45 hand-written `if (…) issues.push(…)` statements
 * across five validation services. Nearly all of them were one of the eight
 * shapes below with a different noun, so they are parameters now.
 *
 * Wording follows UX-001: never "Validation", "Error", "Invalid", "Required" or
 * "Missing"; never blame; always say what would help. `blocking` is reserved for
 * the two things that genuinely stop a material being useful to a class.
 */

const nonBlank = (value: string): boolean => value.trim().length > 0;

export const countFilled = (values: readonly string[]): number =>
  values.filter(nonBlank).length;

export function titlePresent(title: string): ValidationIssue | null {
  if (nonBlank(title)) return null;
  return {
    code: "TITLE",
    severity: "blocking",
    message: "Materialul are nevoie de un titlu.",
    path: "general",
    remedy: "Scrie un titlu scurt, pe care îl recunoști dintr-o privire.",
  };
}

export function contextPresent(
  subject: string,
  grade: string,
): ValidationIssue | null {
  if (nonBlank(subject) && nonBlank(grade)) return null;
  return {
    code: "CONTEXT",
    severity: "warning",
    message: "Disciplina și clasa ajută la potrivirea materialului.",
    path: "general",
    remedy: "Completează-le în setările proiectului.",
  };
}

export function objectivesPresent(
  objectives: readonly string[],
): ValidationIssue | null {
  if (countFilled(objectives) > 0) return null;
  return {
    code: "OBJECTIVES",
    severity: "blocking",
    message: "Adaugă cel puțin un obiectiv de învățare.",
    path: "objectives",
    remedy: "Formulează 1–3 obiective observabile la finalul orei.",
  };
}

export function competenciesPresent(
  competencies: readonly string[],
): ValidationIssue | null {
  if (countFilled(competencies) > 0) return null;
  return {
    code: "COMPETENCIES",
    severity: "warning",
    message: "Competențele leagă materialul de curriculum.",
    path: "competencies",
    remedy: "Preia competențele din programa clasei.",
  };
}

export function minimumItems(options: {
  code: string;
  count: number;
  minimum: number;
  path: string;
  message: string;
  remedy: string;
}): ValidationIssue | null {
  if (options.count >= options.minimum) return null;
  return {
    code: options.code,
    severity: "blocking",
    message: options.message,
    path: options.path,
    remedy: options.remedy,
  };
}

export function emptyFields(options: {
  code: string;
  count: number;
  path: string;
  message: (count: number) => string;
  remedy: string;
}): ValidationIssue | null {
  if (options.count === 0) return null;
  return {
    code: options.code,
    severity: "warning",
    message: options.message(options.count),
    path: options.path,
    remedy: options.remedy,
  };
}

export function durationBand(options: {
  code: string;
  minutes: number;
  low: number;
  high: number;
  path: string;
  remedy: string;
}): ValidationIssue | null {
  const { minutes, low, high } = options;
  if (minutes >= low && minutes <= high) return null;
  return {
    code: options.code,
    severity: "info",
    message: `Durata estimată este de ${minutes} minute.`,
    path: options.path,
    remedy: options.remedy,
  };
}

export function durationMatches(options: {
  planned: number;
  actual: number;
  tolerance: number;
  path: string;
}): ValidationIssue | null {
  const { planned, actual, tolerance } = options;
  if (planned <= 0 || Math.abs(actual - planned) <= tolerance) return null;
  return {
    code: "TIMING",
    severity: "info",
    message: `Etapele însumează ${actual} minute, iar ora are ${planned}.`,
    path: options.path,
    remedy: "Ajustează minutele pe etape pentru un ritm realist.",
  };
}

export function textLength(options: {
  code: string;
  count: number;
  path: string;
  message: (count: number) => string;
  remedy: string;
}): ValidationIssue | null {
  if (options.count === 0) return null;
  return {
    code: options.code,
    severity: "warning",
    message: options.message(options.count),
    path: options.path,
    remedy: options.remedy,
  };
}

export function duplicates(options: {
  values: readonly string[];
  path: string;
  message: string;
  remedy: string;
}): ValidationIssue | null {
  const seen = new Set<string>();
  const repeated = options.values.some((value) => {
    const key = value.trim().toLowerCase();
    if (key.length === 0) return false;
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
  if (!repeated) return null;
  return {
    code: "DUPLICATES",
    severity: "warning",
    message: options.message,
    path: options.path,
    remedy: options.remedy,
  };
}

/** Drops the nulls, so every validator reads as a flat list of checks. */
export const collect = (
  candidates: readonly (ValidationIssue | null)[],
): ValidationIssue[] =>
  candidates.filter((issue): issue is ValidationIssue => issue !== null);

/**
 * A support metric, never a grade.
 *
 * The old scoring subtracted 20–25 points per error and gated publish on a
 * 55–60 threshold, which reads as marking the teacher's work. Publishing is
 * gated on blocking issues alone; this number only shows balance, and the UI
 * labels it as such.
 */
export function balanceScore(issues: readonly ValidationIssue[]): number {
  const weight = { blocking: 22, error: 16, warning: 7, info: 0 } as const;
  const penalty = issues.reduce(
    (total, issue) => total + weight[issue.severity],
    0,
  );
  return Math.max(0, Math.min(100, 100 - penalty));
}
