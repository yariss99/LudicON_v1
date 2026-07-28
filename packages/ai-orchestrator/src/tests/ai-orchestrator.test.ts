import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createAIOrchestrator,
  createClaudeProvider,
  createOpenAIProvider,
  createStubProvider,
  ProviderRegistry,
  RetryManager,
} from '../index.js';
import type { AIRequest } from '../types.js';
import { newId } from '../ids.js';

function sampleRequest(overrides?: Partial<AIRequest>): AIRequest {
  return {
    requestId: newId('req'),
    workflowId: 'wf-1',
    teacherId: 'teacher-1',
    projectId: 'proj-1',
    requestType: 'GenerateLesson',
    educationalContext: {
      subject: 'Matematică',
      grade: 'Clasa a III-a',
      topic: 'Fracții',
      locale: 'ro',
      learningObjectives: ['Compară fracții unitare'],
    },
    promptContext: {
      intent: 'Draft a short lesson outline',
      instructions: ['Keep language age-appropriate'],
      outputLanguage: 'ro',
    },
    expectedOutputSchema: {
      schemaId: 'lesson.v1',
      requiredFields: ['title', 'subject', 'topic', 'content'],
    },
    priority: 'normal',
    metadata: {},
    ...overrides,
  };
}

describe('AIOrchestrator', () => {
  it('executes through the gateway without the caller knowing the provider', async () => {
    const registry = new ProviderRegistry();
    registry.register(createOpenAIProvider());
    registry.register(createClaudeProvider());

    const orchestrator = createAIOrchestrator({ registry });
    const response = await orchestrator.execute(sampleRequest());

    assert.equal(response.status, 'succeeded');
    assert.ok(response.structuredResult.title);
    assert.equal(response.structuredResult.subject, 'Matematică');
    assert.ok(['openai', 'claude'].includes(response.provider));
    assert.ok(response.validationReport.ok);
    assert.equal(orchestrator.getExecutionLogs().length, 1);
    assert.ok(orchestrator.getUsageSnapshot().totalRequests >= 1);
  });

  it('rejects requests without educational context (no raw prompts)', async () => {
    const registry = new ProviderRegistry();
    registry.register(createStubProvider());
    const orchestrator = createAIOrchestrator({ registry });

    await assert.rejects(
      () =>
        orchestrator.execute(
          sampleRequest({
            educationalContext: {},
            metadata: { rawUserPrompt: 'just chat with me' },
          }),
        ),
      (err: Error & { code?: string }) => err.code === 'INVALID_REQUEST',
    );
  });

  it('retries recoverable provider failures', async () => {
    const registry = new ProviderRegistry();
    registry.register(
      createStubProvider({ failTimes: 2, failCode: 'TIMEOUT' }),
    );
    const orchestrator = createAIOrchestrator({
      registry,
      retryManager: new RetryManager({
        maxAttempts: 3,
        baseDelayMs: 1,
        retryOn: ['TIMEOUT', 'RATE_LIMIT', 'PROVIDER_UNAVAILABLE', 'NETWORK_FAILURE', 'TRANSIENT'],
      }),
    });

    const response = await orchestrator.execute(sampleRequest());
    assert.equal(response.status, 'succeeded');
    assert.equal(response.attempts, 3);
  });

  it('honours preferred provider when healthy and supporting', async () => {
    const registry = new ProviderRegistry();
    registry.register(createOpenAIProvider());
    registry.register(createClaudeProvider());
    const orchestrator = createAIOrchestrator({ registry });

    const response = await orchestrator.execute(
      sampleRequest({ preferredProviderId: 'claude' }),
    );
    assert.equal(response.provider, 'claude');
  });
});
