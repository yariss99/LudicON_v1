/**
 * Command Bus contracts — coordination only (ES-004).
 */

import type {
  Command,
  CommandContext,
  CommandDraft,
  CommandType,
  DispatchOptions,
  PipelineStageName,
} from './command-envelope.js';

export type CommandResultStatus =
  | 'success'
  | 'validation_failed'
  | 'authorization_failed'
  | 'business_error'
  | 'timeout'
  | 'cancelled'
  | 'handler_missing'
  | 'failed';

export interface CommandIssue {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
  readonly severity: 'error' | 'warning';
  readonly stage?: PipelineStageName;
}

export interface CommandExecutionMetadata {
  readonly commandId: string;
  readonly commandType: CommandType;
  readonly correlationId: string;
  readonly durationMs: number;
  readonly stagesCompleted: readonly PipelineStageName[];
  readonly handlerName?: string;
  readonly warnings: readonly CommandIssue[];
}

export interface CommandResult<TValue = unknown> {
  readonly status: CommandResultStatus;
  readonly success: boolean;
  readonly value?: TValue;
  readonly issues: readonly CommandIssue[];
  readonly execution: CommandExecutionMetadata;
  readonly error?: string;
}

/** Exactly one handler per command type. */
export interface CommandHandler<TPayload = unknown, TResult = unknown> {
  readonly commandType: CommandType;
  readonly name?: string;
  handle(command: Command<TPayload>, context: CommandContext): Promise<TResult> | TResult;
}

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationOutcome {
  readonly ok: boolean;
  readonly issues: readonly CommandIssue[];
}

/**
 * Pluggable validators — bus invokes them; they own rules (not the bus).
 */
export interface CommandValidator {
  readonly name: string;
  readonly stage:
    | 'structuralValidation'
    | 'preconditions'
    | 'policyValidation'
    | 'businessValidation'
    | 'blueprintValidation';
  /** Optional: limit to command types; omit = all */
  readonly commandTypes?: readonly CommandType[];
  validate(command: Command, context: CommandContext): Promise<ValidationOutcome> | ValidationOutcome;
}

export interface CommandAuthorizer {
  readonly name: string;
  authorize(command: Command, context: CommandContext): Promise<ValidationOutcome> | ValidationOutcome;
}

export interface CommandBus {
  registerHandler<TPayload = unknown, TResult = unknown>(
    handler: CommandHandler<TPayload, TResult>,
  ): void;
  unregisterHandler(commandType: CommandType): void;
  registerValidator(validator: CommandValidator): void;
  registerAuthorizer(authorizer: CommandAuthorizer): void;

  createCommand<T>(draft: CommandDraft<T>): Command<T>;
  dispatch<TPayload = unknown, TResult = unknown>(
    draft: CommandDraft<TPayload> | Command<TPayload>,
    options?: DispatchOptions,
  ): Promise<CommandResult<TResult>>;

  hasHandler(commandType: CommandType): boolean;
  listHandlers(): readonly CommandType[];
  stats(): CommandBusStats;
}

export interface CommandBusStats {
  readonly dispatchedCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly validationRejectCount: number;
  readonly authorizationRejectCount: number;
  readonly averageDurationMs: number;
  readonly handlerCount: number;
}

export interface CommandBusOptions {
  readonly busId?: string;
  readonly defaultTimeoutMs?: number;
  readonly serviceLocator?: import('./context.js').ServiceLocator;
  readonly eventBus?: import('./event-bus.js').EventBus;
  /** When set, successful handlers' domain events publish here (category domain by default). */
  readonly publishCommandLifecycleEvents?: boolean;
}
