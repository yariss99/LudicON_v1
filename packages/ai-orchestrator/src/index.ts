/**
 * @prima/ai-orchestrator — sole AI gateway for PRIMA
 */

export type {
  AIRequestType,
  AIRequestPriority,
  AIProviderId,
  AIExecutionStatus,
  EducationalContext,
  PromptContext,
  ExpectedOutputSchema,
  AIRequest,
  ValidationIssue,
  AiOutputValidationReport,
  ValidationReport,
  TokenUsage,
  AIResponse,
  PromptPackage,
  ProviderGenerateInput,
  ProviderGenerateResult,
  ProviderStreamChunk,
  ProviderHealth,
  CostEstimate,
  ProviderCapability,
  AIProvider,
  ExecutionLogEntry,
  UsageSnapshot,
  SelectionCriteria,
  RetryPolicy,
  RecoverableErrorCode,
  OrchestratorErrorCode,
} from './types.js';

export { AIOrchestratorError, isRetryableError } from './errors.js';

export { RequestValidator } from './request-validator.js';
export { EducationalContextLoader } from './context-loader.js';
export type { ContextEnricher } from './context-loader.js';
export { PromptDispatcher } from './prompt-dispatcher.js';
export { ProviderRegistry } from './provider-registry.js';
export { ProviderSelector } from './provider-selector.js';
export type { ProviderScore } from './provider-selector.js';
export {
  RetryManager,
  DEFAULT_RETRY_POLICY,
  classifyProviderFailure,
} from './retry-manager.js';
export { OutputValidator } from './output-validator.js';
export { ExecutionLogger } from './execution-logger.js';
export { UsageTracker, CostTracker } from './usage-tracker.js';

export {
  AIOrchestrator,
  createAIOrchestrator,
} from './ai-orchestrator.js';
export type { AIOrchestratorDeps } from './ai-orchestrator.js';

export {
  createConfigurableProvider,
  createOpenAIProvider,
  createClaudeProvider,
  createGeminiProvider,
  createAzureOpenAIProvider,
  createMistralProvider,
  createLocalLlmProvider,
  createStubProvider,
} from './providers/index.js';
export type {
  CompletionTransport,
  BaseProviderOptions,
} from './providers/index.js';
