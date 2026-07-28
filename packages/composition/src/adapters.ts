/**
 * RuntimeEnginePort adapters — real engines only (no stubs).
 */

import {
  createAIOrchestrator,
  ProviderRegistry,
  type AIOrchestrator,
  type CompletionTransport,
  createConfigurableProvider,
} from '@prima/ai-orchestrator';
import {
  PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
  type PromptPackage,
  type ValidationReport as CanonicalValidationReport,
} from '@prima/contracts';
import { createContextPlatform, type ContextPlatform } from '@prima/engine-context';
import { createMemoryEngine, type MemoryEngine } from '@prima/engine-memory';
import { createPromptEngine, type PromptEngine } from '@prima/engine-prompt';
import {
  createPdfExportTool,
  createToolEngine,
  type ToolEngine,
} from '@prima/engine-tools';
import {
  createValidationEngine,
  isDeliverableToTeacher,
  type ValidationEngine,
} from '@prima/engine-validation';
import {
  createDefaultWorkflowRegistry,
  createWorkflowEngine,
  type WorkflowEngine,
} from '@prima/engine-workflow';
import type {
  EngineStepResult,
  RuntimeEnginePort,
  RuntimeExecutionContext,
} from '@prima/runtime-orchestrator';

function ok(
  output: Record<string, unknown>,
  emit?: EngineStepResult['emit'],
): EngineStepResult {
  return { ok: true, output, emit };
}

function asEdu(bag: Record<string, unknown>) {
  const edu = (bag.educationalContext ?? {}) as Record<string, unknown>;
  return {
    subject: typeof edu.subject === 'string' ? edu.subject : undefined,
    grade: typeof edu.grade === 'string' ? edu.grade : undefined,
    topic: typeof edu.topic === 'string' ? edu.topic : undefined,
    locale: typeof edu.locale === 'string' ? edu.locale : undefined,
    curriculumRef:
      typeof edu.curriculumRef === 'string' ? edu.curriculumRef : undefined,
    learningObjectives: Array.isArray(edu.learningObjectives)
      ? (edu.learningObjectives as string[])
      : undefined,
    competencies: Array.isArray(edu.competencies)
      ? (edu.competencies as string[])
      : undefined,
  };
}

export type ProductionEngines = {
  readonly workflow: WorkflowEngine;
  readonly context: ContextPlatform;
  readonly prompt: PromptEngine;
  readonly ai: AIOrchestrator;
  readonly validation: ValidationEngine;
  readonly memory: MemoryEngine;
  readonly tools: ToolEngine;
};

export type CreateProductionEnginesOptions = {
  /**
   * Required in production. Test composition may pass an in-process transport.
   * Never silently falls back to stub provider.
   */
  readonly completionTransport: CompletionTransport;
  readonly providerId?: string;
  readonly providerModel?: string;
};

export function createProductionEngines(
  options: CreateProductionEnginesOptions,
): ProductionEngines {
  if (!options.completionTransport) {
    throw new Error(
      'Production composition requires completionTransport (fail-closed).',
    );
  }

  const workflow = createWorkflowEngine();
  const context = createContextPlatform();
  const prompt = createPromptEngine();
  const validation = createValidationEngine();
  const memory = createMemoryEngine();
  const tools = createToolEngine({
    sandboxPolicy: {
      allowNetwork: false,
      allowFilesystem: false,
      allowCredentials: false,
    },
  });
  tools.register(createPdfExportTool());
  tools.bindCapability('export.pdf', 'export.pdf.v1');

  const registry = new ProviderRegistry();
  registry.register(
    createConfigurableProvider({
      id: options.providerId ?? 'openai',
      displayName: 'Configured Provider',
      defaultModel: options.providerModel ?? 'gpt-4o-mini',
      transport: options.completionTransport,
      usdPer1kTokens: 0.005,
    }),
  );
  const ai = createAIOrchestrator({ registry });

  return { workflow, context, prompt, ai, validation, memory, tools };
}

export function createWorkflowAdapter(
  engine: WorkflowEngine,
): RuntimeEnginePort {
  const registry = createDefaultWorkflowRegistry();
  return {
    engineId: 'workflow',
    displayName: 'Workflow Engine',
    version: '0.1.0',
    async execute(input, ctx) {
      const kind = String(
        input.bag &&
          typeof input.bag === 'object' &&
          (input.bag as Record<string, unknown>).workflowKind
          ? (input.bag as Record<string, unknown>).workflowKind
          : ctx.bag.workflowKind ?? 'create-lesson',
      );
      const catalogId = kind.includes('/') ? kind : kind;
      let definition;
      try {
        definition = registry.toEngineDefinition(
          catalogId as Parameters<typeof registry.toEngineDefinition>[0],
        );
      } catch {
        definition = registry.toEngineDefinition('create-lesson');
      }
      const snap = engine.startWorkflow({
        definition,
        teacher: {
          teacherId: ctx.teacherId,
          displayName: ctx.teacherId,
        },
        actor: { role: 'teacher', id: ctx.teacherId },
        autoCreate: true,
      });
      return ok(
        {
          workflowId: snap.workflowId,
          workflowState: snap.state,
          workflowContext: {
            schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
            workflowId: snap.workflowId,
            workflowKind: catalogId,
            teacherId: ctx.teacherId,
            projectId: ctx.projectId,
            state: snap.state,
            educationalContext: asEdu(ctx.bag),
          },
        },
        'WorkflowStarted',
      );
    },
  };
}

export function createContextAdapter(
  platform: ContextPlatform,
): RuntimeEnginePort {
  return {
    engineId: 'context',
    displayName: 'Context Engine',
    version: '0.1.0',
    async execute(_input, ctx) {
      const edu = asEdu(ctx.bag);
      const init = platform.initialize({
        sessionId: `ctx-${ctx.executionId}`,
        teacherId: ctx.teacherId,
        ttlMs: 60 * 60 * 1000,
        teacher: {
          teacherId: ctx.teacherId,
          selectedSubject: edu.subject,
          currentGrade: edu.grade,
        },
        workflow: ctx.workflowId,
        activeScreen: 'runtime',
      });

      if ('error' in init) {
        return { ok: false, error: init.error, retryable: false };
      }

      const resolvedContext = {
        schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
        snapshotId: init.sessionId,
        sessionId: init.sessionId,
        teacherId: ctx.teacherId,
        projectId: ctx.projectId,
        workflowId: ctx.workflowId,
        educationalContext: Object.freeze({
          ...edu,
          subject: edu.subject ?? init.teacher?.selectedSubject,
          grade: edu.grade ?? init.teacher?.currentGrade,
        }),
        resolvedAt: new Date().toISOString(),
        domains: {
          teacher: init.teacher,
          session: init.session,
          blueprint: init.blueprint,
        },
      };

      return ok({ resolvedContext, contextSessionId: init.sessionId }, 'ContextLoaded');
    },
  };
}

export function createPromptAdapter(engine: PromptEngine): RuntimeEnginePort {
  return {
    engineId: 'prompt',
    displayName: 'Prompt Builder',
    version: '0.1.0',
    async execute(_input, ctx) {
      const edu = asEdu(ctx.bag);
      const resolved = ctx.bag.resolvedContext as
        | { educationalContext?: Record<string, unknown> }
        | undefined;
      const result = engine.compile({
        intent: String(ctx.bag.intent ?? ''),
        educationalContext: {
          ...edu,
          ...(resolved?.educationalContext ?? {}),
        },
        locale: ctx.locale ?? edu.locale,
        resolvedContext: (ctx.bag.resolvedContext as Record<string, unknown>) ?? undefined,
        requestType: 'GenerateLesson',
        schemaId: 'educational.artifact.v1',
      });
      if (!result.ok) {
        return {
          ok: false,
          error: result.errors.join('; '),
          retryable: false,
        };
      }
      const promptPackage: PromptPackage = result.promptPackage;
      return ok(
        {
          promptPackage,
          promptResult: result,
          // Convenience flat fields for AI adapter
          compiledPrompt: {
            system: promptPackage.system,
            user: promptPackage.user,
            requestType: promptPackage.requestType,
            schemaId: promptPackage.schemaId,
            locale: promptPackage.locale,
          },
        },
        'PromptCompiled',
      );
    },
  };
}

export function createAiAdapter(ai: AIOrchestrator): RuntimeEnginePort {
  return {
    engineId: 'ai',
    displayName: 'AI Orchestrator',
    version: '0.1.0',
    async execute(_input, ctx) {
      const compiled = ctx.bag.compiledPrompt as
        | {
            system: string;
            user: string;
            requestType: string;
            schemaId: string;
            locale?: string;
          }
        | undefined;
      if (!compiled?.system || !compiled?.user) {
        return {
          ok: false,
          error:
            'AI Orchestrator requires compiledPrompt from Prompt Builder (no architectural bypass).',
          retryable: false,
        };
      }

      const edu = asEdu(ctx.bag);
      const response = await ai.execute({
        requestId: ctx.requestId,
        workflowId: ctx.workflowId ?? ctx.executionId,
        teacherId: ctx.teacherId,
        projectId: ctx.projectId,
        requestType: 'GenerateLesson',
        educationalContext: edu,
        promptContext: {
          intent: String(ctx.bag.intent ?? 'Generate educational artifact'),
        },
        expectedOutputSchema: {
          schemaId: compiled.schemaId,
          requiredFields: ['content'],
        },
        priority: 'normal',
        metadata: {},
        compiledPrompt: compiled,
      });

      if (response.status === 'failed' || response.status === 'rejected') {
        return {
          ok: false,
          error: 'AI execution failed',
          retryable: true,
          costUsd: response.costUsd,
          tokens: response.tokens.totalTokens,
        };
      }

      return ok(
        {
          aiResult: {
            ...response.structuredResult,
            content:
              (response.structuredResult.content as string | undefined) ??
              response.rawResponse,
            subject: edu.subject,
            topic: edu.topic,
            title:
              (response.structuredResult.title as string | undefined) ??
              `${edu.subject ?? 'Lesson'}: ${edu.topic ?? 'Topic'}`,
          },
          aiResponseId: response.responseId,
        },
        'AICompleted',
      );
    },
  };
}

export function createValidationAdapter(
  engine: ValidationEngine,
): RuntimeEnginePort {
  return {
    engineId: 'validation',
    displayName: 'Validation Engine',
    version: '0.1.0',
    async execute(input, ctx) {
      const phase = input.phase;
      const ai = (ctx.bag.aiResult ?? {}) as Record<string, unknown>;
      const artifact = {
        artifactId: String(ctx.bag.artifactId ?? `art-${ctx.executionId}`),
        artifactType: 'Lesson' as const,
        version: '1',
        workflowId: ctx.workflowId,
        teacherId: ctx.teacherId,
        projectId: ctx.projectId,
        locale: ctx.locale,
        payload:
          phase === 'repair' && ctx.bag.repairedPayload
            ? (ctx.bag.repairedPayload as Record<string, unknown>)
            : ai,
      };

      const report = await engine.validate(artifact, {
        profileId: 'Publication',
        expectedSubject: asEdu(ctx.bag).subject,
        expectedGrade: asEdu(ctx.bag).grade,
        allowRepair: phase === 'repair',
      });

      const summary = {
        schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
        overallStatus: report.overallStatus,
        overallScore: report.overallScore,
        criticalCount: report.errors.filter((e) => e.severity === 'CRITICAL')
          .length,
        errorCount: report.errors.length,
        warningCount: report.warnings.length,
        readyToExport: isDeliverableToTeacher(report),
      };

      const canonical: CanonicalValidationReport = {
        schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
        reportId: report.reportId,
        artifactId: report.artifactId,
        artifactType: report.artifactType,
        profileId: report.profileId,
        summary,
        overallScore: report.overallScore,
        overallStatus: report.overallStatus,
        issues: report.results.map((r) => ({
          code: r.validatorId,
          message: r.message,
          severity: r.severity,
          validatorId: r.validatorId,
        })),
        executionTimeMs: report.executionTimeMs,
        timestamp: report.timestamp,
        repairedPayload: report.repairedPayload,
      };

      if (phase === 'repair') {
        return ok(
          {
            validationReport: canonical,
            validationStatus: report.overallStatus,
            artifact: report.repairedPayload ?? ai,
            readyToExport: isDeliverableToTeacher(report),
            repairedPayload: report.repairedPayload,
          },
          'RepairCompleted',
        );
      }

      const emit =
        report.overallStatus === 'rejected'
          ? 'ValidationFailed'
          : 'ValidationPassed';

      return ok(
        {
          validationReport: canonical,
          validationStatus: report.overallStatus,
          artifact: isDeliverableToTeacher(report)
            ? (report.repairedPayload ?? ai)
            : undefined,
          readyToExport: isDeliverableToTeacher(report),
          repairedPayload: report.repairedPayload,
        },
        emit,
      );
    },
  };
}

export function createMemoryAdapter(engine: MemoryEngine): RuntimeEnginePort {
  return {
    engineId: 'memory',
    displayName: 'Memory Engine',
    version: '0.1.0',
    async execute(_input, ctx) {
      const record = engine.create({
        memoryType: 'artifact',
        actorId: ctx.teacherId,
        context: {
          teacherId: ctx.teacherId,
          projectId: ctx.projectId,
          workflowId: ctx.workflowId,
          subject: asEdu(ctx.bag).subject,
          grade: asEdu(ctx.bag).grade,
          locale: ctx.locale,
        },
        payload: {
          artifact: ctx.bag.artifact ?? ctx.bag.aiResult ?? {},
          validationStatus: ctx.bag.validationStatus,
          promptPackageId: (ctx.bag.promptPackage as { packageId?: string } | undefined)
            ?.packageId,
        },
        tags: ['runtime', 'core-pipeline'],
      });
      return ok(
        {
          memorySaved: true,
          memoryRef: record.memoryId,
          memorySnapshot: {
            schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
            snapshotId: record.memoryId,
            label: 'runtime-save',
            createdAt: record.createdAt,
            createdBy: ctx.teacherId,
            memoryIds: [record.memoryId],
            recordCount: 1,
          },
        },
        'MemorySaved',
      );
    },
  };
}

export function createToolsAdapter(engine: ToolEngine): RuntimeEnginePort {
  return {
    engineId: 'tools',
    displayName: 'Tool Engine',
    version: '0.1.0',
    async execute(_input, ctx) {
      const result = await engine.executeCapability('export.pdf', {
        action: 'export',
        input: {
          artifactId: String(ctx.bag.artifactId ?? ctx.executionId),
          title: String(
            (ctx.bag.artifact as { title?: string } | undefined)?.title ??
              'PRIMA Artifact',
          ),
          content: ctx.bag.artifact ?? {},
        },
        context: {
          teacherId: ctx.teacherId,
          projectId: ctx.projectId,
          workflowId: ctx.workflowId,
          permissions: ['export', 'read'],
        },
      });
      return ok(
        {
          exportUri: String(result.output.uri ?? result.output.path ?? `memory://exports/${ctx.executionId}`),
          toolExecutionResult: {
            schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
            executionId: result.executionId,
            toolId: result.toolId,
            action: result.action,
            status: result.status,
            durationMs: result.durationMs,
            output: result.output,
            errors: result.errors,
            warnings: result.warnings,
            costUsd: result.costUsd,
          },
        },
        'ArtifactPublished',
      );
    },
  };
}

export function registerProductionPorts(
  register: (engine: RuntimeEnginePort) => void,
  engines: ProductionEngines,
): void {
  register(createWorkflowAdapter(engines.workflow));
  register(createContextAdapter(engines.context));
  register(createPromptAdapter(engines.prompt));
  register(createAiAdapter(engines.ai));
  register(createValidationAdapter(engines.validation));
  register(createMemoryAdapter(engines.memory));
  register(createToolsAdapter(engines.tools));
}

/** Ensure Runtime bag always requires prompt — used by tests asserting no bypass. */
export function assertPromptGate(ctx: RuntimeExecutionContext): void {
  if (!ctx.bag.compiledPrompt && !ctx.bag.promptPackage) {
    throw new Error('Prompt compilation gate failed');
  }
}
