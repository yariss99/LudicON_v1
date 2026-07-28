/**
 * AI Orchestrator domain types.
 * Application code speaks only these types — never provider SDKs.
 */

/** Extensible request catalogue — add kinds without changing the engine core. */
export type AIRequestType =
  | 'GenerateLesson'
  | 'GenerateWorksheet'
  | 'GenerateQuiz'
  | 'GenerateStory'
  | 'GeneratePresentation'
  | 'ImproveLesson'
  | 'Summarize'
  | 'Translate'
  | 'ExplainConcept'
  | 'GenerateImagePrompt'
  | (string & {});

export type AIRequestPriority = 'low' | 'normal' | 'high';

export type AIProviderId =
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'azure-openai'
  | 'mistral'
  | 'local-llm'
  | (string & {});

export type AIExecutionStatus =
  | 'succeeded'
  | 'failed'
  | 'rejected'
  | 'partial';

/** Structured educational facts — never a raw chat string as the sole input. */
export type EducationalContext = {
  readonly locale?: string;
  readonly subject?: string;
  readonly grade?: string;
  readonly topic?: string;
  readonly curriculumRef?: string;
  readonly learningObjectives?: readonly string[];
  readonly competencies?: readonly string[];
  readonly constraints?: readonly string[];
  readonly teacherNotes?: string;
  readonly extra?: Readonly<Record<string, unknown>>;
};

/**
 * Prompt context is structured intent for the PromptDispatcher.
 * Raw free-text alone is insufficient to pass request validation.
 */
export type PromptContext = {
  readonly intent: string;
  readonly instructions?: readonly string[];
  readonly tone?: string;
  readonly outputLanguage?: string;
  readonly examples?: readonly string[];
  readonly variables?: Readonly<Record<string, string>>;
};

export type ExpectedOutputSchema = {
  readonly schemaId: string;
  readonly requiredFields: readonly string[];
  readonly description?: string;
};

export type AIRequest = {
  readonly requestId: string;
  readonly workflowId: string;
  readonly teacherId: string;
  readonly projectId: string;
  readonly requestType: AIRequestType;
  readonly educationalContext: EducationalContext;
  readonly promptContext: PromptContext;
  readonly expectedOutputSchema: ExpectedOutputSchema;
  readonly priority: AIRequestPriority;
  readonly metadata: Readonly<Record<string, unknown>>;
  /** Optional soft preference — selector may override. */
  readonly preferredProviderId?: AIProviderId;
  /**
   * When set (Runtime Prompt Builder output), PromptDispatcher is bypassed.
   * Production Runtime path MUST supply this — compilation is mandatory upstream.
   */
  readonly compiledPrompt?: PromptPackage;
};

export type ValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
  readonly severity: 'error' | 'warning';
};

/** AI output schema check — distinct from publication ValidationReport (@prima/contracts). */
export type AiOutputValidationReport = {
  readonly ok: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly repaired: boolean;
};

/** @deprecated Use AiOutputValidationReport — name reserved for canonical gate report in @prima/contracts. */
export type ValidationReport = AiOutputValidationReport;

export type TokenUsage = {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
};

export type AIResponse = {
  readonly responseId: string;
  readonly requestId: string;
  readonly provider: AIProviderId;
  readonly model: string;
  readonly tokens: TokenUsage;
  readonly latencyMs: number;
  readonly costUsd: number;
  readonly status: AIExecutionStatus;
  readonly structuredResult: Readonly<Record<string, unknown>>;
  readonly rawResponse: string;
  readonly validationReport: ValidationReport;
  readonly attempts: number;
  readonly metadata: Readonly<Record<string, unknown>>;
};

/** Provider-facing prompt package built by PromptDispatcher — never exposed to app UI. */
export type PromptPackage = {
  readonly system: string;
  readonly user: string;
  readonly requestType: AIRequestType;
  readonly schemaId: string;
  readonly locale?: string;
};

export type ProviderGenerateInput = {
  readonly prompt: PromptPackage;
  readonly model?: string;
  readonly correlationId: string;
};

export type ProviderGenerateResult = {
  readonly rawText: string;
  readonly model: string;
  readonly tokens: TokenUsage;
  readonly latencyMs: number;
  /** Optional structured parse from provider adapter. */
  readonly parsed?: Readonly<Record<string, unknown>>;
};

export type ProviderStreamChunk = {
  readonly text: string;
  readonly done: boolean;
};

export type ProviderHealth = {
  readonly healthy: boolean;
  readonly latencyMs?: number;
  readonly message?: string;
};

export type CostEstimate = {
  readonly currency: 'USD';
  readonly estimatedUsd: number;
  readonly basis: string;
};

export type ProviderCapability =
  | 'text-generation'
  | 'streaming'
  | 'json-object'
  | 'image-prompt'
  | 'multilingual';

export type AIProvider = {
  readonly id: AIProviderId;
  readonly displayName: string;
  readonly capabilities: readonly ProviderCapability[];
  generate(input: ProviderGenerateInput): Promise<ProviderGenerateResult>;
  stream(
    input: ProviderGenerateInput,
  ): AsyncIterable<ProviderStreamChunk>;
  healthCheck(): Promise<ProviderHealth>;
  estimateCost(input: {
    promptTokens: number;
    completionTokens: number;
    model?: string;
  }): CostEstimate;
  supports(requestType: AIRequestType): boolean;
};

export type ExecutionLogEntry = {
  readonly entryId: string;
  readonly timestamp: string;
  readonly requestId: string;
  readonly workflowId: string;
  readonly teacherId: string;
  readonly provider: AIProviderId;
  readonly model: string;
  readonly latencyMs: number;
  readonly tokens: TokenUsage;
  readonly costUsd: number;
  readonly status: AIExecutionStatus;
  readonly attempt: number;
  readonly errorCode?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type UsageSnapshot = {
  readonly totalRequests: number;
  readonly totalTokens: number;
  readonly totalCostUsd: number;
  readonly byProvider: Readonly<Record<string, number>>;
  readonly byTeacher: Readonly<Record<string, number>>;
  readonly byDay: Readonly<Record<string, number>>;
  readonly byMonth: Readonly<Record<string, number>>;
};

export type SelectionCriteria = {
  readonly requestType: AIRequestType;
  readonly priority: AIRequestPriority;
  readonly preferredProviderId?: AIProviderId;
  readonly teacherPreferences?: {
    readonly preferLowCost?: boolean;
    readonly preferLowLatency?: boolean;
    readonly allowProviders?: readonly AIProviderId[];
    readonly denyProviders?: readonly AIProviderId[];
  };
};

export type RetryPolicy = {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly retryOn: readonly RecoverableErrorCode[];
};

export type RecoverableErrorCode =
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'PROVIDER_UNAVAILABLE'
  | 'NETWORK_FAILURE'
  | 'TRANSIENT';

export type OrchestratorErrorCode =
  | RecoverableErrorCode
  | 'INVALID_REQUEST'
  | 'INVALID_PROMPT'
  | 'SCHEMA_MISMATCH'
  | 'UNSAFE_CONTENT'
  | 'PROVIDER_NOT_FOUND'
  | 'NO_PROVIDER'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN';
