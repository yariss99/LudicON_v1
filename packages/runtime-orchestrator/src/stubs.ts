/**
 * Stub engine ports for tests / local composition (replace with real adapters).
 */

import type { EngineStepResult, RuntimeEnginePort } from './types.js';

function ok(
  output: Record<string, unknown>,
  emit?: EngineStepResult['emit'],
): EngineStepResult {
  return { ok: true, output, emit };
}

export function createStubWorkflowEngine(): RuntimeEnginePort {
  return {
    engineId: 'workflow',
    displayName: 'Workflow Engine (stub)',
    version: '0.0.0',
    async execute(input) {
      return ok(
        {
          workflowId: `wf-stub-${String(input.teacherId ?? 'x')}`,
          workflowState: 'Initializing',
        },
        'WorkflowStarted',
      );
    },
  };
}

export function createStubContextEngine(): RuntimeEnginePort {
  return {
    engineId: 'context',
    displayName: 'Context Engine (stub)',
    version: '0.0.0',
    async execute(_input, ctx) {
      const edu = (ctx.bag.educationalContext ?? {}) as Record<string, unknown>;
      return ok(
        {
          resolvedContext: {
            ...edu,
            teacherId: ctx.teacherId,
            projectId: ctx.projectId,
          },
        },
        'ContextLoaded',
      );
    },
  };
}

export function createStubPromptEngine(): RuntimeEnginePort {
  return {
    engineId: 'prompt',
    displayName: 'Prompt Builder (stub)',
    version: '0.0.0',
    async execute(_input, ctx) {
      return ok(
        {
          promptPackage: {
            system: 'PRIMA educational assistant',
            user: String(ctx.bag.intent ?? ''),
          },
        },
        'PromptCompiled',
      );
    },
  };
}

export function createStubAiEngine(options?: {
  failOnce?: boolean;
}): RuntimeEnginePort {
  let failed = false;
  return {
    engineId: 'ai',
    displayName: 'AI Orchestrator (stub)',
    version: '0.0.0',
    async execute(_input, ctx) {
      if (options?.failOnce && !failed) {
        failed = true;
        return {
          ok: false,
          error: 'provider timeout',
          retryable: true,
        };
      }
      const edu = (ctx.bag.educationalContext ?? {}) as Record<string, unknown>;
      return ok(
        {
          aiResult: {
            title: `${edu.subject ?? 'Lesson'}: ${edu.topic ?? 'Topic'}`,
            subject: edu.subject,
            topic: edu.topic,
            content: 'Generated educational draft',
            objectives: ['Learn the topic'],
          },
        },
        'AICompleted',
      );
    },
  };
}

export function createStubValidationEngine(): RuntimeEnginePort {
  return {
    engineId: 'validation',
    displayName: 'Validation Engine (stub)',
    version: '0.0.0',
    async execute(input, ctx) {
      if (input.phase === 'repair') {
        return ok(
          {
            validationStatus: 'repaired',
            artifact: {
              ...(ctx.bag.aiResult as object),
              repaired: true,
            },
            readyToExport: true,
          },
          'RepairCompleted',
        );
      }
      const ai = ctx.bag.aiResult as Record<string, unknown> | undefined;
      if (!ai?.content) {
        return ok(
          { validationStatus: 'rejected', readyToExport: false },
          'ValidationFailed',
        );
      }
      return ok(
        {
          validationStatus: 'approved',
          artifact: ai,
          readyToExport: true,
        },
        'ValidationPassed',
      );
    },
  };
}

export function createStubMemoryEngine(): RuntimeEnginePort {
  return {
    engineId: 'memory',
    displayName: 'Memory Engine (stub)',
    version: '0.0.0',
    async execute(_input, ctx) {
      return ok(
        {
          memorySaved: true,
          memoryRef: `mem://${ctx.executionId}`,
        },
        'MemorySaved',
      );
    },
  };
}

export function createStubToolsEngine(): RuntimeEnginePort {
  return {
    engineId: 'tools',
    displayName: 'Tool Engine (stub)',
    version: '0.0.0',
    async execute(_input, ctx) {
      return ok(
        {
          exportUri: `memory://exports/${ctx.executionId}.pdf`,
        },
        'ArtifactPublished',
      );
    },
  };
}

export function registerCoreStubs(
  register: (engine: RuntimeEnginePort) => void,
  options?: { aiFailOnce?: boolean },
): void {
  register(createStubWorkflowEngine());
  register(createStubContextEngine());
  register(createStubPromptEngine());
  register(createStubAiEngine({ failOnce: options?.aiFailOnce }));
  register(createStubValidationEngine());
  register(createStubMemoryEngine());
  register(createStubToolsEngine());
}
