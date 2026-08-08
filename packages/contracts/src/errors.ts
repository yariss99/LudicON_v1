/**
 * Structured error taxonomy shared by the API, the worker and the web app.
 *
 * Two audiences, two channels:
 *   - `code`    — the machine-readable discriminant. English, stable, switchable.
 *   - `message` — the teacher-facing sentence. Romanian, calm, never blaming.
 *
 * UX-001 (Teacher Language First) is a product rule, not a style preference:
 * architecture vocabulary stays in `code` and in server logs. It never reaches
 * the interface. `isTeacherSafeMessage` makes that rule executable rather than
 * aspirational — the message catalogue below is checked against it.
 */
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Codes                                                                      */
/* -------------------------------------------------------------------------- */

export const ERROR_CODES = [
  "VALIDATION_FAILED",
  "NOT_FOUND",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL",
  "APPROVAL_REQUIRED",
] as const;

export const ErrorCode = z.enum(ERROR_CODES);
export type ErrorCode = z.infer<typeof ErrorCode>;

/** The only HTTP statuses this API produces for failures. */
export type ApiErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500;

/**
 * `APPROVAL_REQUIRED` is a state conflict, not an authorization failure: the
 * teacher is allowed to generate materials, the lesson design simply has not
 * passed the approval gate yet. 409 says "not in this state", which is exactly
 * what the client needs in order to offer the approval action instead of an
 * access-denied dead end.
 */
export const ERROR_STATUS: Readonly<Record<ErrorCode, ApiErrorStatus>> =
  Object.freeze({
    VALIDATION_FAILED: 422,
    NOT_FOUND: 404,
    UNAUTHENTICATED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    INTERNAL: 500,
    APPROVAL_REQUIRED: 409,
  });

/* -------------------------------------------------------------------------- */
/* UX-001 — teacher-safe language                                             */
/* -------------------------------------------------------------------------- */

/**
 * Matched case-insensitively: no inflection of these ever belongs in interface
 * copy, in any language.
 */
export const FORBIDDEN_MESSAGE_TERMS = [
  "Engine",
  "Pipeline",
  "Blueprint",
  "Validation",
  "Error",
  "Invalid",
  "Required",
] as const;

/**
 * Matched case-sensitively. Lowercased "ai" is an ordinary Romanian verb form
 * ("tu ai"), so a case-insensitive rule would reject perfectly good copy while
 * catching nothing real. The acronym is what UX-001 forbids.
 */
export const FORBIDDEN_MESSAGE_ACRONYMS = ["AI"] as const;

const FORBIDDEN_TERM_PATTERN = new RegExp(
  `\\b(?:${FORBIDDEN_MESSAGE_TERMS.join("|")})\\b`,
  "i",
);
const FORBIDDEN_ACRONYM_PATTERN = new RegExp(
  `\\b(?:${FORBIDDEN_MESSAGE_ACRONYMS.join("|")})\\b`,
);

/** True when `message` may be shown to a teacher. See UX-001. */
export const isTeacherSafeMessage = (message: string): boolean =>
  !FORBIDDEN_TERM_PATTERN.test(message) &&
  !FORBIDDEN_ACRONYM_PATTERN.test(message);

/**
 * The canonical Romanian sentence per code.
 *
 * Every one of these is written to be *actionable and calm*: it says what
 * happened in the teacher's terms and, where possible, what to do next. None
 * of them attributes fault to the teacher.
 */
export const TEACHER_MESSAGE: Readonly<Record<ErrorCode, string>> =
  Object.freeze({
    VALIDATION_FAILED:
      "Câteva informații încă lipsesc. Verifică datele completate și încearcă din nou.",
    NOT_FOUND: "Nu am găsit ceea ce cauți. Poate a fost mutat sau șters.",
    UNAUTHENTICATED:
      "Sesiunea ta s-a încheiat. Conectează-te din nou pentru a continua.",
    FORBIDDEN: "Acest material nu îți este disponibil.",
    CONFLICT:
      "Materialul a fost modificat între timp. Reîmprospătează pagina și reia modificarea.",
    RATE_LIMITED:
      "Prea multe cereri într-un timp scurt. Așteaptă câteva momente.",
    INTERNAL: "Ceva nu a mers bine de partea noastră. Am notat și revenim.",
    APPROVAL_REQUIRED:
      "Designul lecției trebuie aprobat înainte de a crea materialele.",
  });

/** Every catalogued message satisfies UX-001. Guards against future edits. */
export const teacherMessageCatalogueIsSafe = (): boolean =>
  ERROR_CODES.every((code) => isTeacherSafeMessage(TEACHER_MESSAGE[code]));

/* -------------------------------------------------------------------------- */
/* Wire shape                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Free-form, teacher-safe supplementary data. Field-level hints for forms live
 * here (`{ field: "title", hint: "..." }`); stack traces and SQL never do.
 */
export const ApiErrorDetails = z.record(z.string().min(1), z.unknown());
export type ApiErrorDetails = z.infer<typeof ApiErrorDetails>;

export const ApiError = z.object({
  code: ErrorCode,
  /** Romanian, teacher-facing. See `isTeacherSafeMessage`. */
  message: z.string().min(1).max(400),
  details: ApiErrorDetails.optional(),
  /** Correlates the client-side failure with the full server-side log entry. */
  requestId: z.string().min(1).max(128).optional(),
});
export type ApiError = z.infer<typeof ApiError>;

export const ApiFailure = z.object({
  ok: z.literal(false),
  error: ApiError,
});
export type ApiFailure = z.infer<typeof ApiFailure>;

/** Success half of the envelope, parameterised by the payload schema. */
export function apiSuccessOf<TData extends z.ZodType>(data: TData) {
  return z.object({ ok: z.literal(true), data });
}

/** The full `Result` envelope as a Zod schema, for response validation. */
export function apiResultOf<TData extends z.ZodType>(data: TData) {
  return z.discriminatedUnion("ok", [apiSuccessOf(data), ApiFailure]);
}

export type ApiSuccess<TData> = { ok: true; data: TData };
export type Result<TData> = ApiSuccess<TData> | ApiFailure;

export const ok = <TData>(data: TData): ApiSuccess<TData> => ({
  ok: true,
  data,
});
export const fail = (error: ApiError): ApiFailure => ({ ok: false, error });

export const isOk = <TData>(
  result: Result<TData>,
): result is ApiSuccess<TData> => result.ok;
export const isFail = <TData>(result: Result<TData>): result is ApiFailure =>
  !result.ok;

/**
 * Builds an `ApiError` with the catalogued Romanian message for `code`.
 *
 * A caller may override `message`, but only with another teacher-safe sentence;
 * an unsafe override silently falls back to the catalogue rather than leaking
 * jargon into the interface.
 */
export const apiError = (
  code: ErrorCode,
  extra?: { message?: string; details?: ApiErrorDetails; requestId?: string },
): ApiError => {
  const override = extra?.message;
  const message =
    override !== undefined && isTeacherSafeMessage(override)
      ? override
      : TEACHER_MESSAGE[code];
  return {
    code,
    message,
    ...(extra?.details === undefined ? {} : { details: extra.details }),
    ...(extra?.requestId === undefined ? {} : { requestId: extra.requestId }),
  };
};
