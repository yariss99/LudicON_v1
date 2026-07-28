/**
 * Example tool handlers — replaceable adapters (no vendor SDKs in-core).
 */

import { ToolEngineError } from '../errors.js';
import {
  DEFAULT_RETRY_POLICY,
  type ToolHandler,
} from '../types.js';

/** Deterministic PDF export stub — swap for real exporter via registry.replace pattern. */
export function createPdfExportTool(): ToolHandler {
  return {
    descriptor: {
      toolId: 'export.pdf.v1',
      toolName: 'PDF Export',
      category: 'pdf-generation',
      version: '1.0.0',
      description: 'Export an educational artifact to PDF.',
      requiredPermissions: ['export', 'read'],
      requiredContext: ['teacherId', 'projectId'],
      supportedActions: ['export'],
      inputSchema: {
        schemaId: 'pdf.export.input',
        requiredFields: ['artifactId', 'title'],
      },
      outputSchema: {
        schemaId: 'pdf.export.output',
        requiredFields: ['uri', 'bytesEstimate'],
      },
      timeoutMs: 5000,
      retryPolicy: DEFAULT_RETRY_POLICY,
      metadata: { format: 'pdf' },
    },
    async execute({ action, input, context }) {
      if (action !== 'export') {
        throw new ToolEngineError('INVALID_INPUT', `Unsupported action ${action}`);
      }
      return {
        output: {
          uri: `memory://exports/${String(input.artifactId)}.pdf`,
          bytesEstimate: 12_000,
          title: input.title,
          teacherId: context.teacherId,
          projectId: context.projectId,
        },
        logs: ['pdf-stub-generated'],
        costUsd: 0,
      };
    },
    async healthCheck() {
      return { healthy: true, latencyMs: 1, message: 'ok' };
    },
  };
}

/** Search stub — demonstrates external-access permission + sandbox. */
export function createSearchTool(options?: {
  failTimes?: number;
}): ToolHandler {
  let failures = options?.failTimes ?? 0;
  return {
    descriptor: {
      toolId: 'search.web.v1',
      toolName: 'Educational Search',
      category: 'search',
      version: '1.0.0',
      description: 'Search educational references (provider-agnostic adapter).',
      requiredPermissions: ['read', 'external-access'],
      requiredContext: ['teacherId'],
      supportedActions: ['search'],
      inputSchema: {
        schemaId: 'search.input',
        requiredFields: ['query'],
      },
      outputSchema: {
        schemaId: 'search.output',
        requiredFields: ['hits'],
      },
      timeoutMs: 3000,
      retryPolicy: {
        maxAttempts: 3,
        baseDelayMs: 10,
        retryOn: ['timeout', 'network', 'unavailable', 'transient'],
      },
      metadata: {},
    },
    async execute({ input, signal }) {
      if (signal?.aborted) {
        throw new ToolEngineError('TIMEOUT', 'aborted', { retryable: true });
      }
      if (failures > 0) {
        failures -= 1;
        throw new ToolEngineError('NETWORK', 'transient network failure', {
          retryable: true,
        });
      }
      return {
        output: {
          hits: [
            {
              title: `Result for ${String(input.query)}`,
              url: 'https://example.edu/resource',
            },
          ],
        },
        logs: ['search-complete'],
        costUsd: 0.001,
      };
    },
  };
}

/** Translation stub for Export / Workflow integration examples. */
export function createTranslationTool(): ToolHandler {
  return {
    descriptor: {
      toolId: 'translate.text.v1',
      toolName: 'Translate Text',
      category: 'translation',
      version: '1.0.0',
      description: 'Translate educational text to a target language.',
      requiredPermissions: ['generate', 'read'],
      requiredContext: ['teacherId'],
      supportedActions: ['translate'],
      inputSchema: {
        schemaId: 'translate.input',
        requiredFields: ['text', 'targetLanguage'],
      },
      outputSchema: {
        schemaId: 'translate.output',
        requiredFields: ['translatedText', 'targetLanguage'],
      },
      timeoutMs: 4000,
      retryPolicy: DEFAULT_RETRY_POLICY,
      metadata: {},
    },
    async execute({ input }) {
      return {
        output: {
          translatedText: `[${String(input.targetLanguage)}] ${String(input.text)}`,
          targetLanguage: input.targetLanguage,
        },
        warnings: ['stub-translation'],
        costUsd: 0.002,
      };
    },
  };
}

/** AI provider bridge tool — delegates conceptually to AI Orchestrator at composition root. */
export function createAiBridgeTool(): ToolHandler {
  return {
    descriptor: {
      toolId: 'ai.orchestrator.bridge',
      toolName: 'AI Orchestrator Bridge',
      category: 'ai-provider',
      version: '1.0.0',
      description:
        'Capability bridge to @prima/ai-orchestrator — never call vendors from workflows.',
      requiredPermissions: ['generate', 'external-access'],
      requiredContext: ['teacherId', 'workflowId'],
      supportedActions: ['generate'],
      inputSchema: {
        schemaId: 'ai.bridge.input',
        requiredFields: ['requestType'],
      },
      outputSchema: {
        schemaId: 'ai.bridge.output',
        requiredFields: ['accepted'],
      },
      timeoutMs: 60_000,
      retryPolicy: DEFAULT_RETRY_POLICY,
      metadata: { integratesWith: '@prima/ai-orchestrator' },
    },
    async execute({ input, context }) {
      return {
        output: {
          accepted: true,
          requestType: input.requestType,
          workflowId: context.workflowId,
          note: 'Wire CompletionTransport / AIOrchestrator at composition root.',
        },
        logs: ['ai-bridge-ack'],
      };
    },
  };
}
