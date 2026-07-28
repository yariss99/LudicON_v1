/**
 * Integration example — how application services call the orchestrator.
 * This file is documentation-as-code; not executed as a test suite entrypoint.
 */

import {
  createAIOrchestrator,
  createAzureOpenAIProvider,
  createLocalLlmProvider,
  createMistralProvider,
  createOpenAIProvider,
  ProviderRegistry,
} from '../index.js';
import { newId } from '../ids.js';

export async function exampleGenerateLesson(): Promise<void> {
  const registry = new ProviderRegistry();
  // Register adapters. Inject CompletionTransport in production for real HTTP/SDK calls.
  registry.register(createOpenAIProvider());
  registry.register(createMistralProvider());
  registry.register(createAzureOpenAIProvider());
  registry.register(createLocalLlmProvider());

  const orchestrator = createAIOrchestrator({
    registry,
    selectionDefaults: { preferLowCost: true },
  });

  // Application code never imports OpenAI/Claude SDKs.
  const response = await orchestrator.execute({
    requestId: newId('req'),
    workflowId: 'wf-lesson-42',
    teacherId: 'teacher-ana',
    projectId: 'proj-primary',
    requestType: 'GenerateLesson',
    educationalContext: {
      subject: 'Matematică',
      grade: 'Clasa a III-a',
      topic: 'Fracții',
      curriculumRef: 'RO-MEN-primary',
      learningObjectives: ['Identifică fracții unitare'],
      constraints: ['No learner labeling', 'Romanian language'],
    },
    promptContext: {
      intent: 'Create a 45-minute lesson outline',
      instructions: ['Include warm-up, exploration, practice, exit ticket'],
      outputLanguage: 'ro',
      tone: 'professional-collegial',
    },
    expectedOutputSchema: {
      schemaId: 'lesson.outline.v1',
      requiredFields: ['title', 'subject', 'topic', 'content'],
      description: 'Lesson outline JSON',
    },
    priority: 'normal',
    metadata: {},
  });

  if (response.status !== 'succeeded') {
    throw new Error(`Generation rejected: ${response.validationReport.issues[0]?.message}`);
  }

  // structuredResult is what Workflow / Generation engines consume.
  void response.structuredResult;
  void orchestrator.getUsageSnapshot();
}
