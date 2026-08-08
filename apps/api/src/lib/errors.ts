/**
 * The application's error hierarchy.
 *
 * Every deliberate failure in the service layer is an `AppError`. That gives
 * the error middleware exactly one thing to recognise, and gives each failure a
 * machine code that is decided where the business rule lives rather than
 * guessed from an HTTP status at the edge.
 *
 * Anything that is *not* an `AppError` reaching the middleware is, by
 * definition, a bug: it is logged in full and reported as `INTERNAL`.
 */
import type {
  ApiErrorDetails,
  ApiErrorStatus,
  ErrorCode,
} from "@ludicon/contracts";
import { ERROR_STATUS, TEACHER_MESSAGE } from "@ludicon/contracts";

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;

  /** Teacher-safe detail shown alongside the message. Never contains internals. */
  readonly details: ApiErrorDetails | undefined;

  /**
   * Server-only context: ids, query shapes, upstream messages. Logged, never
   * serialised to a client.
   */
  readonly context: Readonly<Record<string, unknown>>;

  // Public rather than protected: TypeScript propagates constructor visibility
  // to subclasses, and a protected base would make `new ConflictError(...)`
  // illegal from outside this module. `AppError` is abstract, so nothing can be
  // constructed from the base itself anyway.
  constructor(
    technicalMessage: string,
    options?: {
      details?: ApiErrorDetails;
      context?: Record<string, unknown>;
      cause?: unknown;
    },
  ) {
    super(
      technicalMessage,
      options?.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = this.constructor.name;
    this.details = options?.details;
    this.context = Object.freeze({ ...options?.context });
  }

  get status(): ApiErrorStatus {
    return ERROR_STATUS[this.code];
  }

  /** The Romanian sentence a teacher sees for this failure. */
  get teacherMessage(): string {
    return TEACHER_MESSAGE[this.code];
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;

/* -------------------------------------------------------------------------- */

/** Input did not satisfy a contract or a business rule. */
export class ValidationFailedError extends AppError {
  override readonly code = "VALIDATION_FAILED" as const;
}

/** The row does not exist, or the caller may not know that it does. */
export class NotFoundError extends AppError {
  override readonly code = "NOT_FOUND" as const;

  constructor(resource: string, id: string) {
    super(`${resource} ${id} not found`, { context: { resource, id } });
  }
}

/** No usable session token on the request. */
export class UnauthenticatedError extends AppError {
  override readonly code = "UNAUTHENTICATED" as const;

  constructor(reason = "missing or unusable session token", cause?: unknown) {
    super(reason, { context: { reason }, cause });
  }
}

/** A valid session, but not for this row. */
export class ForbiddenError extends AppError {
  override readonly code = "FORBIDDEN" as const;

  constructor(resource: string, id: string, actorId: string) {
    super(`actor ${actorId} may not access ${resource} ${id}`, {
      context: { resource, id, actorId },
    });
  }
}

/** The row moved underneath the caller — stale version, duplicate key, races. */
export class ConflictError extends AppError {
  override readonly code = "CONFLICT" as const;
}

export class RateLimitedError extends AppError {
  override readonly code = "RATE_LIMITED" as const;
}

/** A bug, an unreachable dependency, or an invariant we failed to keep. */
export class InternalError extends AppError {
  override readonly code = "INTERNAL" as const;
}

/**
 * The product's central invariant, as an error type.
 *
 * Materials may not be produced from a lesson design the teacher has not
 * approved. This is Teacher Authority: the gate is enforced in the service
 * layer so that it holds for the API, the worker, a script and any future
 * client — not only for the button that happens to be disabled in the UI.
 */
export class ApprovalRequiredError extends AppError {
  override readonly code = "APPROVAL_REQUIRED" as const;

  constructor(projectId: string, lessonPlanId: string | null) {
    super(`project ${projectId} has no approved lesson plan`, {
      context: { projectId, lessonPlanId },
    });
  }
}
