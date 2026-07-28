/**
 * Integration example — Validation Engine with Workflow + AI Orchestrator contracts.
 * Documentation-as-code (not a test runner entry).
 */

import { createValidationEngine, isDeliverableToTeacher } from '../index.js';

/**
 * Call after AI Orchestrator returns structuredResult and before
 * WorkflowEngine.dispatch(..., 'ValidationPassed').
 */
export async function gateAiArtifactBeforeTeacher(input: {
  workflowId: string;
  teacherId: string;
  artifactId: string;
  structuredResult: Readonly<Record<string, unknown>>;
}): Promise<boolean> {
  const engine = createValidationEngine();
  const report = await engine.validate(
    {
      artifactId: input.artifactId,
      artifactType: 'Lesson',
      version: '1',
      workflowId: input.workflowId,
      teacherId: input.teacherId,
      payload: { ...input.structuredResult },
    },
    {
      profileId: 'Publication',
      expectedSubject:
        typeof input.structuredResult.subject === 'string'
          ? input.structuredResult.subject
          : undefined,
      allowRepair: true,
    },
  );

  // Workflow: ValidationPassed only when deliverable; else ValidationFailed → Editing
  return isDeliverableToTeacher(report);
}
