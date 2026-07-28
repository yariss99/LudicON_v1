import { AIOrchestratorError } from '../errors.js';
import {
  createConfigurableProvider,
  type BaseProviderOptions,
  type CompletionTransport,
} from './base-provider.js';
import type { AIProvider } from '../types.js';

export {
  createConfigurableProvider,
  type CompletionTransport,
  type BaseProviderOptions,
};

export function createOpenAIProvider(options?: {
  transport?: CompletionTransport;
  model?: string;
}): AIProvider {
  return createConfigurableProvider({
    id: 'openai',
    displayName: 'OpenAI',
    defaultModel: options?.model ?? 'gpt-4o-mini',
    transport: options?.transport,
    usdPer1kTokens: 0.005,
  });
}

export function createClaudeProvider(options?: {
  transport?: CompletionTransport;
  model?: string;
}): AIProvider {
  return createConfigurableProvider({
    id: 'claude',
    displayName: 'Claude',
    defaultModel: options?.model ?? 'claude-sonnet',
    transport: options?.transport,
    usdPer1kTokens: 0.008,
  });
}

export function createGeminiProvider(options?: {
  transport?: CompletionTransport;
  model?: string;
}): AIProvider {
  return createConfigurableProvider({
    id: 'gemini',
    displayName: 'Gemini',
    defaultModel: options?.model ?? 'gemini-pro',
    transport: options?.transport,
    usdPer1kTokens: 0.003,
  });
}

export function createAzureOpenAIProvider(options?: {
  transport?: CompletionTransport;
  model?: string;
}): AIProvider {
  return createConfigurableProvider({
    id: 'azure-openai',
    displayName: 'Azure OpenAI',
    defaultModel: options?.model ?? 'gpt-4o',
    transport: options?.transport,
    usdPer1kTokens: 0.006,
  });
}

export function createMistralProvider(options?: {
  transport?: CompletionTransport;
  model?: string;
}): AIProvider {
  return createConfigurableProvider({
    id: 'mistral',
    displayName: 'Mistral',
    defaultModel: options?.model ?? 'mistral-small',
    transport: options?.transport,
    usdPer1kTokens: 0.002,
  });
}

export function createLocalLlmProvider(options?: {
  transport?: CompletionTransport;
  model?: string;
}): AIProvider {
  return createConfigurableProvider({
    id: 'local-llm',
    displayName: 'Local LLM',
    defaultModel: options?.model ?? 'local-default',
    transport: options?.transport,
    usdPer1kTokens: 0,
    simulatedLatencyMs: 20,
  });
}

/** Test double that can fail N times with a recoverable error. */
export function createStubProvider(options?: {
  healthy?: boolean;
  failTimes?: number;
  failCode?: 'TIMEOUT' | 'RATE_LIMIT' | 'PROVIDER_UNAVAILABLE';
}): AIProvider {
  let failuresLeft = options?.failTimes ?? 0;
  const base = createConfigurableProvider({
    id: 'local-llm',
    displayName: 'Stub Provider',
    defaultModel: 'stub-1',
    healthy: options?.healthy ?? true,
    usdPer1kTokens: 0.001,
  });

  return {
    ...base,
    async generate(input) {
      if (failuresLeft > 0) {
        failuresLeft -= 1;
        const code = options?.failCode ?? 'TIMEOUT';
        throw new AIOrchestratorError(code, `Simulated ${code}`, {
          retryable: true,
        });
      }
      return base.generate(input);
    },
  };
}
