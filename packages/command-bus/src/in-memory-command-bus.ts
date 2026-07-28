import type {
  Command,
  CommandAuthorizer,
  CommandBus,
  CommandBusOptions,
  CommandBusStats,
  CommandContext,
  CommandDraft,
  CommandHandler,
  CommandIssue,
  CommandResult,
  CommandType,
  CommandValidator,
  DispatchOptions,
  EventBus,
  PipelineStageName,
  ServiceLocator,
} from '@prima/contracts';
import { createCommandId, createCorrelationId } from './ids.js';
import { LocalServiceLocator } from './service-locator.js';
import { StructuralRequiredFieldsValidator } from './builtins.js';

function isCommand<T>(value: CommandDraft<T> | Command<T>): value is Command<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'commandId' in value &&
    'timestamp' in value &&
    'correlationId' in value &&
    'metadata' in value
  );
}

function freezeCommand<T>(command: Command<T>): Command<T> {
  return Object.freeze({
    ...command,
    payload:
      command.payload !== null && typeof command.payload === 'object'
        ? Object.freeze({ ...(command.payload as object) })
        : command.payload,
    metadata: Object.freeze({ ...command.metadata }),
    userContext: command.userContext ? Object.freeze({ ...command.userContext }) : undefined,
    executionContext: command.executionContext
      ? Object.freeze({ ...command.executionContext })
      : undefined,
  }) as Command<T>;
}

const VALIDATION_STAGES: CommandValidator['stage'][] = [
  'structuralValidation',
  'preconditions',
  'policyValidation',
  'businessValidation',
  'blueprintValidation',
];

type LifecycleEventType =
  | 'CommandReceived'
  | 'CommandValidated'
  | 'CommandRejected'
  | 'CommandAuthorized'
  | 'CommandAuthorizationFailed'
  | 'CommandExecuting'
  | 'CommandExecuted'
  | 'CommandFailed'
  | 'CommandCompleted'
  | 'CommandTimedOut'
  | 'CommandCancelled'
  | 'CommandHandlerMissing';

export class InMemoryCommandBus implements CommandBus {
  readonly busId: string;
  private readonly handlers = new Map<CommandType, CommandHandler>();
  private readonly validators: CommandValidator[] = [];
  private readonly authorizers: CommandAuthorizer[] = [];
  private readonly services: ServiceLocator;
  private readonly eventBus?: EventBus;
  private readonly publishLifecycle: boolean;
  private readonly defaultTimeoutMs: number;
  private dispatchedCount = 0;
  private successCount = 0;
  private failureCount = 0;
  private validationRejectCount = 0;
  private authorizationRejectCount = 0;
  private durationTotal = 0;

  constructor(options: CommandBusOptions = {}) {
    this.busId = options.busId ?? `cmd-bus-${createCommandId()}`;
    this.services = options.serviceLocator ?? new LocalServiceLocator();
    this.eventBus = options.eventBus;
    this.publishLifecycle = options.publishCommandLifecycleEvents ?? true;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 30_000;
    this.validators.push(StructuralRequiredFieldsValidator);
  }

  registerHandler<TPayload = unknown, TResult = unknown>(
    handler: CommandHandler<TPayload, TResult>,
  ): void {
    if (this.handlers.has(handler.commandType)) {
      throw new Error(`Handler already registered for ${handler.commandType}`);
    }
    this.handlers.set(handler.commandType, handler as CommandHandler);
  }

  unregisterHandler(commandType: CommandType): void {
    this.handlers.delete(commandType);
  }

  registerValidator(validator: CommandValidator): void {
    this.validators.push(validator);
  }

  registerAuthorizer(authorizer: CommandAuthorizer): void {
    this.authorizers.push(authorizer);
  }

  createCommand<T>(draft: CommandDraft<T>): Command<T> {
    return freezeCommand({
      commandId: draft.commandId ?? createCommandId(),
      commandType: draft.commandType,
      payload: draft.payload,
      metadata: draft.metadata ?? {},
      priority: draft.priority ?? 'normal',
      correlationId: draft.correlationId ?? createCorrelationId(),
      causationId: draft.causationId,
      timestamp: draft.timestamp ?? new Date().toISOString(),
      version: draft.version ?? '1.0.0',
      tenantId: draft.tenantId,
      userContext: draft.userContext,
      executionContext: draft.executionContext,
      aggregateId: draft.aggregateId,
      source: draft.source,
    });
  }

  async dispatch<TPayload = unknown, TResult = unknown>(
    draft: CommandDraft<TPayload> | Command<TPayload>,
    options: DispatchOptions = {},
  ): Promise<CommandResult<TResult>> {
    const started = Date.now();
    const stagesCompleted: PipelineStageName[] = [];
    const warnings: CommandIssue[] = [];
    const skip = new Set(options.skipStages ?? []);

    const command = isCommand(draft) ? freezeCommand(draft) : this.createCommand(draft);
    const priority = options.priority ?? command.priority;
    const effective =
      priority === command.priority ? command : freezeCommand({ ...command, priority });

    this.dispatchedCount += 1;
    await this.emitLifecycle('CommandReceived', effective);

    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const deadlineAt = new Date(Date.now() + timeoutMs).toISOString();
    const controller = new AbortController();
    if (options.signal) {
      if (options.signal.aborted) {
        return this.finish(
          effective,
          {
            status: 'cancelled',
            success: false,
            issues: [
              {
                code: 'CMD_CANCELLED',
                message: 'Command cancelled before execution',
                severity: 'error',
              },
            ],
            error: 'cancelled',
          },
          stagesCompleted,
          warnings,
          started,
          'CommandCancelled',
        );
      }
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const context = this.buildContext(effective, deadlineAt, controller.signal);

    try {
      stagesCompleted.push('received');

      // Structural + other validators
      if (!skip.has('structuralValidation')) {
        const structural = await this.runValidators(effective, context, 'structuralValidation');
        warnings.push(...structural.warnings);
        if (!structural.ok) {
          this.validationRejectCount += 1;
          await this.emitLifecycle('CommandRejected', effective, {
            stage: 'structuralValidation',
            issues: structural.errors,
          });
          return this.finish(
            effective,
            {
              status: 'validation_failed',
              success: false,
              issues: structural.errors,
              error: 'validation_failed',
            },
            stagesCompleted,
            warnings,
            started,
          );
        }
        stagesCompleted.push('structuralValidation');
      }

      // Authorization before remaining business validators (Teacher Authority gate pattern)
      if (!skip.has('authorization')) {
        const authz = await this.runAuthorizers(effective, context);
        warnings.push(...authz.warnings);
        if (!authz.ok) {
          this.authorizationRejectCount += 1;
          await this.emitLifecycle('CommandAuthorizationFailed', effective, {
            issues: authz.errors,
          });
          return this.finish(
            effective,
            {
              status: 'authorization_failed',
              success: false,
              issues: authz.errors,
              error: 'authorization_failed',
            },
            stagesCompleted,
            warnings,
            started,
          );
        }
        stagesCompleted.push('authorization');
        await this.emitLifecycle('CommandAuthorized', effective);
      }

      for (const stage of VALIDATION_STAGES) {
        if (stage === 'structuralValidation') continue;
        if (skip.has(stage)) continue;
        const outcome = await this.runValidators(effective, context, stage);
        warnings.push(...outcome.warnings);
        if (!outcome.ok) {
          this.validationRejectCount += 1;
          await this.emitLifecycle('CommandRejected', effective, {
            stage,
            issues: outcome.errors,
          });
          return this.finish(
            effective,
            {
              status: 'validation_failed',
              success: false,
              issues: outcome.errors,
              error: 'validation_failed',
            },
            stagesCompleted,
            warnings,
            started,
          );
        }
        stagesCompleted.push(stage);
      }

      await this.emitLifecycle('CommandValidated', effective);

      const handler = this.handlers.get(effective.commandType);
      if (!handler) {
        await this.emitLifecycle('CommandHandlerMissing', effective);
        return this.finish(
          effective,
          {
            status: 'handler_missing',
            success: false,
            issues: [
              {
                code: 'CMD_HANDLER_MISSING',
                message: `No handler for ${effective.commandType}`,
                severity: 'error',
                stage: 'execution',
              },
            ],
            error: 'handler_missing',
          },
          stagesCompleted,
          warnings,
          started,
        );
      }

      if (controller.signal.aborted) {
        return this.finish(
          effective,
          {
            status: 'cancelled',
            success: false,
            issues: [
              {
                code: 'CMD_CANCELLED',
                message: 'Command cancelled',
                severity: 'error',
                stage: 'execution',
              },
            ],
            error: 'cancelled',
          },
          stagesCompleted,
          warnings,
          started,
          'CommandCancelled',
        );
      }

      stagesCompleted.push('execution');
      await this.emitLifecycle('CommandExecuting', effective);

      let value: TResult;
      try {
        value = (await Promise.race([
          Promise.resolve(handler.handle(effective as Command<TPayload>, context)),
          abortPromise(controller.signal, timeoutMs),
        ])) as TResult;
      } catch (error) {
        if (controller.signal.aborted) {
          const status =
            error instanceof TimeoutError || !options.signal?.aborted
              ? 'timeout'
              : 'cancelled';
          const eventType = status === 'timeout' ? 'CommandTimedOut' : 'CommandCancelled';
          return this.finish(
            effective,
            {
              status,
              success: false,
              issues: [
                {
                  code: status === 'timeout' ? 'CMD_TIMEOUT' : 'CMD_CANCELLED',
                  message: String(error),
                  severity: 'error',
                  stage: 'execution',
                },
              ],
              error: String(error),
            },
            stagesCompleted,
            warnings,
            started,
            eventType,
          );
        }

        const business = error instanceof BusinessCommandError;
        await this.emitLifecycle('CommandFailed', effective, { error: String(error) });
        return this.finish(
          effective,
          {
            status: business ? 'business_error' : 'failed',
            success: false,
            issues: [
              {
                code: business ? error.code : 'CMD_HANDLER_FAILED',
                message: error instanceof Error ? error.message : String(error),
                severity: 'error',
                stage: 'execution',
              },
            ],
            error: String(error),
          },
          stagesCompleted,
          warnings,
          started,
        );
      }

      stagesCompleted.push('completed');
      await this.emitLifecycle('CommandExecuted', effective);
      await this.emitLifecycle('CommandCompleted', effective);
      return this.finish(
        effective,
        {
          status: 'success',
          success: true,
          value,
          issues: [],
        },
        stagesCompleted,
        warnings,
        started,
        undefined,
        handler.name ?? handler.commandType,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  hasHandler(commandType: CommandType): boolean {
    return this.handlers.has(commandType);
  }

  listHandlers(): readonly CommandType[] {
    return [...this.handlers.keys()];
  }

  stats(): CommandBusStats {
    return {
      dispatchedCount: this.dispatchedCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      validationRejectCount: this.validationRejectCount,
      authorizationRejectCount: this.authorizationRejectCount,
      averageDurationMs:
        this.dispatchedCount === 0 ? 0 : this.durationTotal / this.dispatchedCount,
      handlerCount: this.handlers.size,
    };
  }

  private buildContext(
    command: Command,
    deadlineAt: string,
    signal: AbortSignal,
  ): CommandContext {
    return {
      command,
      correlationId: command.correlationId,
      causationId: command.causationId ?? command.commandId,
      startedAt: new Date().toISOString(),
      deadlineAt,
      signal,
      services: this.services,
      publishDomainEvent: async (eventType, payload, extras) => {
        if (!this.eventBus) return;
        await this.eventBus.publishAsync({
          eventType,
          category: extras?.category ?? 'domain',
          source: `command:${command.commandType}`,
          payload: payload as object,
          aggregateId: extras?.aggregateId ?? command.aggregateId,
          correlationId: command.correlationId,
          causationId: command.commandId,
          userContext: command.userContext,
          executionContext: command.executionContext,
          metadata: {
            ...(extras?.metadata ?? {}),
            commandId: command.commandId,
            commandType: command.commandType,
          },
        });
      },
    };
  }

  private async runValidators(
    command: Command,
    context: CommandContext,
    stage: CommandValidator['stage'],
  ): Promise<{ ok: boolean; errors: CommandIssue[]; warnings: CommandIssue[] }> {
    const errors: CommandIssue[] = [];
    const warnings: CommandIssue[] = [];
    for (const validator of this.validators) {
      if (validator.stage !== stage) continue;
      if (
        validator.commandTypes &&
        validator.commandTypes.length > 0 &&
        !validator.commandTypes.includes(command.commandType)
      ) {
        continue;
      }
      const outcome = await validator.validate(command, context);
      for (const issue of outcome.issues) {
        const tagged = { ...issue, stage: issue.stage ?? stage };
        if (tagged.severity === 'warning') warnings.push(tagged);
        else errors.push(tagged);
      }
      if (!outcome.ok) {
        /* continue collecting from this stage then fail */
      }
    }
    return { ok: errors.length === 0, errors, warnings };
  }

  private async runAuthorizers(
    command: Command,
    context: CommandContext,
  ): Promise<{ ok: boolean; errors: CommandIssue[]; warnings: CommandIssue[] }> {
    const errors: CommandIssue[] = [];
    const warnings: CommandIssue[] = [];
    if (this.authorizers.length === 0) {
      // Fail closed for state-changing commands when no authorizer registered —
      // composition root must register at least one (allow-all only in explicit test roots).
      return {
        ok: false,
        errors: [
          {
            code: 'AUTHZ_NOT_CONFIGURED',
            message: 'No CommandAuthorizer registered on CommandBus',
            severity: 'error',
            stage: 'authorization',
          },
        ],
        warnings,
      };
    }
    for (const authorizer of this.authorizers) {
      const outcome = await authorizer.authorize(command, context);
      for (const issue of outcome.issues) {
        const tagged = { ...issue, stage: issue.stage ?? ('authorization' as const) };
        if (tagged.severity === 'warning') warnings.push(tagged);
        else errors.push(tagged);
      }
    }
    return { ok: errors.length === 0, errors, warnings };
  }

  private async finish<TResult>(
    command: Command,
    partial: Omit<CommandResult<TResult>, 'execution'>,
    stagesCompleted: PipelineStageName[],
    warnings: CommandIssue[],
    started: number,
    lifecycleEvent?: LifecycleEventType,
    handlerName?: string,
  ): Promise<CommandResult<TResult>> {
    const durationMs = Date.now() - started;
    this.durationTotal += durationMs;
    if (partial.success) this.successCount += 1;
    else this.failureCount += 1;

    if (lifecycleEvent) {
      await this.emitLifecycle(lifecycleEvent, command);
    }

    return {
      ...partial,
      issues: [...partial.issues, ...warnings.filter((w) => w.severity === 'warning')],
      execution: {
        commandId: command.commandId,
        commandType: command.commandType,
        correlationId: command.correlationId,
        durationMs,
        stagesCompleted: [...stagesCompleted],
        handlerName,
        warnings: warnings.filter((w) => w.severity === 'warning'),
      },
    };
  }

  private async emitLifecycle(
    type: LifecycleEventType,
    command: Command,
    payload: Record<string, unknown> = {},
  ): Promise<void> {
    if (!this.publishLifecycle || !this.eventBus) return;
    await this.eventBus.publishAsync({
      eventType: type,
      category: 'system',
      source: `command-bus:${this.busId}`,
      payload: {
        commandId: command.commandId,
        commandType: command.commandType,
        ...payload,
      },
      correlationId: command.correlationId,
      causationId: command.commandId,
      aggregateId: command.aggregateId,
      userContext: command.userContext,
      executionContext: command.executionContext,
      metadata: { commandBusId: this.busId },
    });
  }
}

export class BusinessCommandError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'BusinessCommandError';
    this.code = code;
  }
}

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

function abortPromise(signal: AbortSignal, timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    if (signal.aborted) {
      reject(new TimeoutError(`Command timed out after ${timeoutMs}ms`));
      return;
    }
    signal.addEventListener(
      'abort',
      () => reject(new TimeoutError(`Command timed out after ${timeoutMs}ms`)),
      { once: true },
    );
  });
}

export function createCommandBus(options?: CommandBusOptions): CommandBus {
  return new InMemoryCommandBus(options);
}
