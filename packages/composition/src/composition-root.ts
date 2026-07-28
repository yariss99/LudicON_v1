/**
 * Production Composition Root — single entry that wires real Core engines.
 * Fail-closed: never registers Runtime stubs silently.
 */

import {
  createPrimaCoreKernel,
  type PrimaCoreKernel,
} from '@prima/core-kernel';
import {
  createRuntimeOrchestrator,
  type RuntimeOrchestrator,
  type RuntimeRequest,
  type RuntimeResult,
} from '@prima/runtime-orchestrator';
import type { CompletionTransport } from '@prima/ai-orchestrator';
import {
  createProductionEngines,
  registerProductionPorts,
  type ProductionEngines,
} from './adapters.js';

export type CompositionMode = 'production' | 'integration-test';

export type CreateCompositionOptions = {
  /**
   * production (default): requires CompletionTransport; no stubs.
   * integration-test: still uses real engines; transport may be in-process fake.
   */
  readonly mode?: CompositionMode;
  readonly completionTransport: CompletionTransport;
  readonly platformId?: string;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly providerId?: string;
  readonly providerModel?: string;
  /**
   * Explicit opt-in only. When true, throws — stubs are forbidden in this package.
   * Kept to fail loudly if callers migrate from old APIs.
   */
  readonly useStubs?: boolean;
};

export type PrimaComposition = {
  readonly mode: CompositionMode;
  readonly kernel: PrimaCoreKernel;
  readonly runtime: RuntimeOrchestrator;
  readonly engines: ProductionEngines;
  start(): Promise<void>;
  stop(): Promise<void>;
  execute(request: RuntimeRequest): Promise<RuntimeResult>;
};

/**
 * Create the official PRIMA Core Composition Root.
 * Registers real Workflow/Context/Prompt/AI/Validation/Memory/Tools adapters.
 */
export function createProductionComposition(
  options: CreateCompositionOptions,
): PrimaComposition {
  if (options.useStubs) {
    throw new Error(
      'Composition Root refuse stubs (AFPRR H2). Use @prima/runtime-orchestrator registerCoreStubs only in isolated unit tests with explicit opt-in.',
    );
  }
  if (!options.completionTransport) {
    throw new Error(
      'Production Composition Root requires completionTransport (fail-closed).',
    );
  }

  const mode = options.mode ?? 'production';
  const engines = createProductionEngines({
    completionTransport: options.completionTransport,
    providerId: options.providerId,
    providerModel: options.providerModel,
  });

  const runtime = createRuntimeOrchestrator();
  registerProductionPorts((port) => runtime.registerEngine(port), engines);

  const required = [
    'workflow',
    'context',
    'prompt',
    'ai',
    'validation',
    'memory',
    'tools',
  ] as const;
  for (const id of required) {
    if (!runtime.getEngineRegistry().has(id)) {
      throw new Error(`Composition Root missing required engine port: ${id}`);
    }
  }

  const kernel = createPrimaCoreKernel({
    platformId: options.platformId ?? 'prima-core-production',
    env: options.env ?? { NODE_ENV: mode === 'production' ? 'production' : 'test' },
    runtime: {
      version: '0.1.0',
      async start() {
        /* runtime ports already registered */
      },
      async stop() {
        /* no-op */
      },
      async health(): Promise<'healthy' | 'degraded' | 'unhealthy' | 'unknown'> {
        return 'healthy';
      },
    },
    discoverers: [
      () => [
        {
          id: 'workflow',
          displayName: 'Workflow Engine',
          version: '0.1.0',
        },
        {
          id: 'context',
          displayName: 'Context Engine',
          version: '0.1.0',
        },
        {
          id: 'prompt',
          displayName: 'Prompt Builder',
          version: '0.1.0',
        },
        {
          id: 'ai',
          displayName: 'AI Orchestrator',
          version: '0.1.0',
        },
        {
          id: 'validation',
          displayName: 'Validation Engine',
          version: '0.1.0',
        },
        {
          id: 'memory',
          displayName: 'Memory Engine',
          version: '0.1.0',
        },
        {
          id: 'tools',
          displayName: 'Tool Engine',
          version: '0.1.0',
        },
      ],
    ],
  });

  return {
    mode,
    kernel,
    runtime,
    engines,
    async start() {
      await kernel.start();
    },
    async stop() {
      await kernel.stop();
    },
    execute(request) {
      return runtime.execute(request);
    },
  };
}

/** Deterministic in-process transport for integration tests (not a Runtime engine stub). */
export function createDeterministicCompletionTransport(): CompletionTransport {
  return {
    async complete(input) {
      const topicMatch = /Topic:\s*(.+)/i.exec(input.user);
      const subjectMatch = /Subject:\s*(.+)/i.exec(input.user);
      const gradeMatch = /Grade:\s*(.+)/i.exec(input.user);
      const topic = topicMatch?.[1]?.trim() ?? 'Topic';
      const subject = subjectMatch?.[1]?.trim() ?? 'Subject';
      const grade = gradeMatch?.[1]?.trim() ?? 'Clasa a III-a';
      const payload = {
        title: `${subject}: ${topic}`,
        subject,
        grade,
        topic,
        content: `Educational draft for ${topic}`,
        objectives: [`Understand ${topic}`],
        competencies: ['Core competency'],
        language: 'ro',
      };
      return {
        text: JSON.stringify(payload),
        model: 'deterministic-test',
        tokens: { promptTokens: 40, completionTokens: 60, totalTokens: 100 },
        latencyMs: 1,
      };
    },
  };
}
