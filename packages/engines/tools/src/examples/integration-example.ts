/**
 * Integration example — Tool Engine with Workflow / AI / Validation / Memory / Export.
 */

import {
  createAiBridgeTool,
  createPdfExportTool,
  createToolEngine,
  createTranslationTool,
} from '../index.js';

export function createPrimaToolPlatform() {
  const tools = createToolEngine({
    sandboxPolicy: {
      allowNetwork: true,
      allowFilesystem: false,
      allowCredentials: false,
    },
  });

  tools.register(createPdfExportTool());
  tools.register(createTranslationTool());
  tools.register(createAiBridgeTool());

  // Workflows call capabilities — not concrete toolIds — so tools stay replaceable.
  tools.bindCapability('export.pdf', 'export.pdf.v1');
  tools.bindCapability('translate.text', 'translate.text.v1');
  tools.bindCapability('ai.generate', 'ai.orchestrator.bridge');

  return tools;
}

/**
 * Workflow Export step → ToolEngine capability (never call a PDF vendor SDK).
 * After success, Validation Engine (Export profile) + Memory Engine can record artifacts.
 */
export async function exportLessonPdf(input: {
  teacherId: string;
  projectId: string;
  workflowId: string;
  artifactId: string;
  title: string;
}) {
  const tools = createPrimaToolPlatform();
  return tools.executeCapability('export.pdf', {
    action: 'export',
    input: { artifactId: input.artifactId, title: input.title },
    context: {
      teacherId: input.teacherId,
      projectId: input.projectId,
      workflowId: input.workflowId,
      permissions: ['read', 'export'],
      educationalContext: { locale: 'ro' },
    },
  });
}
