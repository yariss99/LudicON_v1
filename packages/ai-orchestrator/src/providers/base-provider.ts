/**
 * Shared helpers for provider adapters.
 * Real HTTP/SDK clients are injected via CompletionTransport — never imported here.
 */

import type {
  AIProvider,
  AIProviderId,
  AIRequestType,
  CostEstimate,
  ProviderCapability,
  ProviderGenerateInput,
  ProviderGenerateResult,
  ProviderHealth,
  ProviderStreamChunk,
  TokenUsage,
} from '../types.js';

/** Port for real provider SDKs / HTTP — keeps this package SDK-free. */
export type CompletionTransport = {
  complete(input: {
    system: string;
    user: string;
    model: string;
    correlationId: string;
  }): Promise<{
    text: string;
    model: string;
    tokens: TokenUsage;
    latencyMs: number;
  }>;
};

export type BaseProviderOptions = {
  readonly id: AIProviderId;
  readonly displayName: string;
  readonly defaultModel: string;
  readonly capabilities?: readonly ProviderCapability[];
  readonly supportedTypes?: readonly AIRequestType[];
  readonly transport?: CompletionTransport;
  /** USD per 1K tokens (blended estimate). */
  readonly usdPer1kTokens?: number;
  readonly healthy?: boolean;
  readonly simulatedLatencyMs?: number;
};

const DEFAULT_TYPES: readonly AIRequestType[] = [
  'GenerateLesson',
  'GenerateWorksheet',
  'GenerateQuiz',
  'GenerateStory',
  'GeneratePresentation',
  'ImproveLesson',
  'Summarize',
  'Translate',
  'ExplainConcept',
  'GenerateImagePrompt',
];

/**
 * Abstract-ish base used by example providers.
 * Without a transport, generate() returns a deterministic structured stub
 * suitable for local/dev — production must inject CompletionTransport.
 */
export function createConfigurableProvider(
  options: BaseProviderOptions,
): AIProvider {
  const capabilities = options.capabilities ?? [
    'text-generation',
    'json-object',
    'multilingual',
  ];
  const supported = new Set(options.supportedTypes ?? DEFAULT_TYPES);
  const usdPer1k = options.usdPer1kTokens ?? 0.002;
  const healthy = options.healthy ?? true;
  const simulatedLatencyMs = options.simulatedLatencyMs ?? 5;

  const provider: AIProvider = {
    id: options.id,
    displayName: options.displayName,
    capabilities,
    supports(requestType) {
      return supported.has(requestType) || supported.has('*');
    },
    async healthCheck(): Promise<ProviderHealth> {
      return {
        healthy,
        latencyMs: simulatedLatencyMs,
        message: healthy ? 'ok' : 'unhealthy',
      };
    },
    estimateCost(input): CostEstimate {
      const tokens = input.promptTokens + input.completionTokens;
      return {
        currency: 'USD',
        estimatedUsd: (tokens / 1000) * usdPer1k,
        basis: `${usdPer1k}/1k tokens`,
      };
    },
    async generate(input: ProviderGenerateInput): Promise<ProviderGenerateResult> {
      const started = Date.now();
      if (options.transport) {
        const result = await options.transport.complete({
          system: input.prompt.system,
          user: input.prompt.user,
          model: input.model ?? options.defaultModel,
          correlationId: input.correlationId,
        });
        return {
          rawText: result.text,
          model: result.model,
          tokens: result.tokens,
          latencyMs: result.latencyMs,
          parsed: tryParseJsonObject(result.text),
        };
      }

      const stub = buildStubPayload(input);
      const rawText = JSON.stringify(stub);
      const promptTokens = Math.ceil(
        (input.prompt.system.length + input.prompt.user.length) / 4,
      );
      const completionTokens = Math.ceil(rawText.length / 4);
      const tokens: TokenUsage = {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      };
      return {
        rawText,
        model: input.model ?? options.defaultModel,
        tokens,
        latencyMs: Date.now() - started + simulatedLatencyMs,
        parsed: stub,
      };
    },
    async *stream(input: ProviderGenerateInput): AsyncIterable<ProviderStreamChunk> {
      const result = await provider.generate(input);
      yield { text: result.rawText, done: true };
    },
  };

  return provider;
}

function tryParseJsonObject(
  text: string,
): Readonly<Record<string, unknown>> | undefined {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function buildStubPayload(
  input: ProviderGenerateInput,
): Record<string, unknown> {
  return {
    title: `PRIMA draft (${input.prompt.requestType})`,
    subject: extractAfter(input.prompt.user, 'Subject:'),
    grade: extractAfter(input.prompt.user, 'Grade:'),
    topic: extractAfter(input.prompt.user, 'Topic:'),
    content: `Structured educational draft for ${input.prompt.requestType}.`,
    language: input.prompt.locale ?? 'ro',
    providerNote: 'stub-generation',
  };
}

function extractAfter(text: string, label: string): string | undefined {
  const idx = text.indexOf(label);
  if (idx < 0) return undefined;
  const line = text.slice(idx + label.length).split('\n')[0]?.trim();
  return line || undefined;
}
