/**
 * AIOrchestrator — sole gateway between PRIMA and any AI provider.
 *
 * Pipeline:
 * Validate → Load Context → Build Prompt → Select Provider →
 * Execute (+ Retry) → Validate Output → Log / Track → Return
 */

import { EducationalContextLoader } from './context-loader.js';
import { AIOrchestratorError } from './errors.js';
import { ExecutionLogger } from './execution-logger.js';
import { newId } from './ids.js';
import { OutputValidator } from './output-validator.js';
import { PromptDispatcher } from './prompt-dispatcher.js';
import { ProviderRegistry } from './provider-registry.js';
import { ProviderSelector } from './provider-selector.js';
import { RequestValidator } from './request-validator.js';
import {
  classifyProviderFailure,
  DEFAULT_RETRY_POLICY,
  RetryManager,
} from './retry-manager.js';
import { CostTracker, UsageTracker } from './usage-tracker.js';
import type {
  AIRequest,
  AIResponse,
  PromptPackage,
  ProviderGenerateResult,
  RetryPolicy,
  SelectionCriteria,
  ValidationReport,
} from './types.js';

export type AIOrchestratorDeps = {
  readonly registry: ProviderRegistry;
  readonly selector?: ProviderSelector;
  readonly requestValidator?: RequestValidator;
  readonly contextLoader?: EducationalContextLoader;
  readonly promptDispatcher?: PromptDispatcher;
  readonly outputValidator?: OutputValidator;
  readonly retryManager?: RetryManager;
  readonly executionLogger?: ExecutionLogger;
  readonly usageTracker?: UsageTracker;
  readonly costTracker?: CostTracker;
  readonly clock?: () => Date;
  readonly selectionDefaults?: Partial<SelectionCriteria['teacherPreferences']>;
};

export class AIOrchestrator {
  private readonly registry: ProviderRegistry;
  private readonly selector: ProviderSelector;
  private readonly requestValidator: RequestValidator;
  private readonly contextLoader: EducationalContextLoader;
  private readonly promptDispatcher: PromptDispatcher;
  private readonly outputValidator: OutputValidator;
  private readonly retryManager: RetryManager;
  private readonly executionLogger: ExecutionLogger;
  private readonly usageTracker: UsageTracker;
  private readonly selectionDefaults: Partial<
    NonNullable<SelectionCriteria['teacherPreferences']>
  >;

  constructor(deps: AIOrchestratorDeps) {
    this.registry = deps.registry;
    this.selector = deps.selector ?? new ProviderSelector(deps.registry);
    this.requestValidator = deps.requestValidator ?? new RequestValidator();
    this.contextLoader = deps.contextLoader ?? new EducationalContextLoader();
    this.promptDispatcher = deps.promptDispatcher ?? new PromptDispatcher();
    this.outputValidator = deps.outputValidator ?? new OutputValidator();
    this.retryManager =
      deps.retryManager ?? new RetryManager(DEFAULT_RETRY_POLICY);
    this.executionLogger =
      deps.executionLogger ?? new ExecutionLogger(deps.clock);
    const cost = deps.costTracker ?? new CostTracker();
    this.usageTracker =
      deps.usageTracker ?? new UsageTracker(cost, deps.clock);
    this.selectionDefaults = deps.selectionDefaults ?? {};
  }

  getRegistry(): ProviderRegistry {
    return this.registry;
  }

  getUsageSnapshot() {
    return this.usageTracker.snapshot();
  }

  getExecutionLogs() {
    return this.executionLogger.list();
  }

  /**
   * Execute a structured AI request end-to-end.
   * Callers never select or contact a provider.
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    this.requestValidator.validate(request);

    const educationalContext = await this.contextLoader.load(request);
    const prompt =
      request.compiledPrompt ??
      this.promptDispatcher.build(request, educationalContext);

    const provider = await this.selector.select({
      requestType: request.requestType,
      priority: request.priority,
      preferredProviderId: request.preferredProviderId,
      teacherPreferences: {
        ...this.selectionDefaults,
        ...(typeof request.metadata.teacherPreferences === 'object' &&
        request.metadata.teacherPreferences !== null
          ? (request.metadata.teacherPreferences as SelectionCriteria['teacherPreferences'])
          : {}),
      },
    });

    let attempts = 0;
    let lastValidation: ValidationReport | undefined;
    let providerResult: ProviderGenerateResult | undefined;

    try {
      const ran = await this.retryManager.execute(async (attempt) => {
        attempts = attempt;
        try {
          const result = await provider.generate({
            prompt,
            correlationId: request.requestId,
          });
          const structured = coerceStructured(result, prompt);
          let validation = this.outputValidator.validate({
            request,
            educationalContext,
            structured,
            rawText: result.rawText,
          });

          if (!validation.ok) {
            const repaired = this.outputValidator.repair({
              request,
              educationalContext,
              structured,
              rawText: result.rawText,
            });
            validation = repaired.report;
            if (!validation.ok) {
              const fatal = validation.issues.find(
                (i) =>
                  i.severity === 'error' &&
                  (i.code === 'UNSAFE_CONTENT' || i.code === 'EMPTY_RESPONSE'),
              );
              if (fatal) {
                throw new AIOrchestratorError(
                  fatal.code === 'UNSAFE_CONTENT'
                    ? 'UNSAFE_CONTENT'
                    : 'VALIDATION_FAILED',
                  fatal.message,
                  { retryable: false, details: { issues: validation.issues } },
                );
              }
              // Schema mismatch may retry once (transient malformed JSON)
              throw new AIOrchestratorError(
                'SCHEMA_MISMATCH',
                'Output failed schema validation.',
                {
                  retryable: attempt < this.retryManager.maxAttempts,
                  details: { issues: validation.issues },
                },
              );
            }
            lastValidation = validation;
            return {
              result,
              structured: repaired.structured,
              validation,
            };
          }

          lastValidation = validation;
          return { result, structured, validation };
        } catch (err) {
          throw classifyProviderFailure(err);
        }
      });

      providerResult = ran.result.result;
      const structured = ran.result.structured;
      const validation = ran.result.validation;
      attempts = ran.attempts;

      const cost = provider.estimateCost({
        promptTokens: providerResult.tokens.promptTokens,
        completionTokens: providerResult.tokens.completionTokens,
        model: providerResult.model,
      }).estimatedUsd;

      const response: AIResponse = {
        responseId: newId('aires'),
        requestId: request.requestId,
        provider: provider.id,
        model: providerResult.model,
        tokens: providerResult.tokens,
        latencyMs: providerResult.latencyMs,
        costUsd: cost,
        status: 'succeeded',
        structuredResult: Object.freeze({ ...structured }),
        rawResponse: providerResult.rawText,
        validationReport: validation,
        attempts,
        metadata: Object.freeze({
          workflowId: request.workflowId,
          requestType: request.requestType,
          schemaId: request.expectedOutputSchema.schemaId,
        }),
      };

      this.executionLogger.record({
        requestId: request.requestId,
        workflowId: request.workflowId,
        teacherId: request.teacherId,
        provider: provider.id,
        model: providerResult.model,
        latencyMs: providerResult.latencyMs,
        tokens: providerResult.tokens,
        costUsd: cost,
        status: 'succeeded',
        attempt: attempts,
        metadata: { requestType: request.requestType },
      });

      this.usageTracker.record({
        teacherId: request.teacherId,
        provider: provider.id,
        tokens: providerResult.tokens,
        costUsd: cost,
      });

      return response;
    } catch (err) {
      const classified = classifyProviderFailure(err);
      const emptyTokens = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };

      this.executionLogger.record({
        requestId: request.requestId,
        workflowId: request.workflowId,
        teacherId: request.teacherId,
        provider: provider.id,
        model: providerResult?.model ?? 'unknown',
        latencyMs: providerResult?.latencyMs ?? 0,
        tokens: providerResult?.tokens ?? emptyTokens,
        costUsd: 0,
        status: 'failed',
        attempt: attempts || 1,
        errorCode: classified.code,
        metadata: { message: classified.message },
      });

      if (
        classified.code === 'INVALID_REQUEST' ||
        classified.code === 'INVALID_PROMPT' ||
        classified.code === 'UNSAFE_CONTENT' ||
        classified.code === 'VALIDATION_FAILED' ||
        classified.code === 'SCHEMA_MISMATCH'
      ) {
        return {
          responseId: newId('aires'),
          requestId: request.requestId,
          provider: provider.id,
          model: providerResult?.model ?? 'unknown',
          tokens: providerResult?.tokens ?? emptyTokens,
          latencyMs: providerResult?.latencyMs ?? 0,
          costUsd: 0,
          status: 'rejected',
          structuredResult: Object.freeze({}),
          rawResponse: providerResult?.rawText ?? '',
          validationReport: lastValidation ?? {
            ok: false,
            issues: [
              {
                code: classified.code,
                message: classified.message,
                severity: 'error',
              },
            ],
            repaired: false,
          },
          attempts: attempts || 1,
          metadata: Object.freeze({ errorCode: classified.code }),
        };
      }

      throw classified;
    }
  }
}

function coerceStructured(
  result: ProviderGenerateResult,
  prompt: PromptPackage,
): Record<string, unknown> {
  if (result.parsed) return { ...result.parsed };
  try {
    const parsed = JSON.parse(result.rawText) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { ...(parsed as Record<string, unknown>) };
    }
  } catch {
    /* fall through */
  }
  return {
    content: result.rawText,
    schemaId: prompt.schemaId,
  };
}

export function createAIOrchestrator(
  deps: AIOrchestratorDeps,
): AIOrchestrator {
  return new AIOrchestrator(deps);
}

export type { RetryPolicy };
