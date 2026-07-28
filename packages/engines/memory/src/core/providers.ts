/**
 * Typed helpers for common memory writes (Factory-style conveniences).
 */

import type { MemoryEngine } from './memory-engine.js';
import type {
  AiDecisionMemoryPayload,
  KnowledgeMemoryPayload,
  LessonMemoryPayload,
  MemoryEducationalContext,
  MemoryRecord,
  PreferenceMemoryPayload,
  ProjectMemoryPayload,
  SessionMemoryPayload,
  TeacherMemoryPayload,
  WorkflowMemoryPayload,
  ArtifactMemoryPayload,
} from './types.js';

export function rememberSession(
  engine: MemoryEngine,
  input: {
    actorId: string;
    context: MemoryEducationalContext;
    payload: SessionMemoryPayload;
    tags?: readonly string[];
  },
): MemoryRecord<SessionMemoryPayload> {
  return engine.create({
    memoryType: 'session',
    actorId: input.actorId,
    context: input.context,
    payload: input.payload,
    tags: input.tags ?? ['session'],
  });
}

export function rememberWorkflow(
  engine: MemoryEngine,
  input: {
    actorId: string;
    context: MemoryEducationalContext;
    payload: WorkflowMemoryPayload;
  },
): MemoryRecord<WorkflowMemoryPayload> {
  return engine.create({
    memoryType: 'workflow',
    actorId: input.actorId,
    context: {
      ...input.context,
      workflowId: input.payload.workflowId,
    },
    payload: input.payload,
    tags: ['workflow', input.payload.workflowKind],
  });
}

export function rememberTeacher(
  engine: MemoryEngine,
  input: {
    actorId: string;
    teacherId: string;
    payload: TeacherMemoryPayload;
  },
): MemoryRecord<TeacherMemoryPayload> {
  return engine.create({
    memoryType: 'teacher',
    actorId: input.actorId,
    context: { teacherId: input.teacherId },
    payload: input.payload,
    tags: ['teacher'],
  });
}

export function rememberProject(
  engine: MemoryEngine,
  input: {
    actorId: string;
    context: MemoryEducationalContext;
    payload: ProjectMemoryPayload;
  },
): MemoryRecord<ProjectMemoryPayload> {
  return engine.create({
    memoryType: 'project',
    actorId: input.actorId,
    context: { ...input.context, projectId: input.payload.projectId },
    payload: input.payload,
    tags: ['project'],
  });
}

export function rememberLesson(
  engine: MemoryEngine,
  input: {
    actorId: string;
    context: MemoryEducationalContext;
    payload: LessonMemoryPayload;
  },
): MemoryRecord<LessonMemoryPayload> {
  return engine.create({
    memoryType: 'lesson',
    actorId: input.actorId,
    context: {
      ...input.context,
      lessonId: input.payload.lessonId,
      competencyIds: input.payload.competencies,
    },
    payload: input.payload,
    tags: ['lesson'],
  });
}

export function rememberArtifact(
  engine: MemoryEngine,
  input: {
    actorId: string;
    context: MemoryEducationalContext;
    payload: ArtifactMemoryPayload;
  },
): MemoryRecord<ArtifactMemoryPayload> {
  return engine.create({
    memoryType: 'artifact',
    actorId: input.actorId,
    context: {
      ...input.context,
      artifactId: input.payload.artifactId,
    },
    payload: input.payload,
    tags: ['artifact', input.payload.artifactType],
  });
}

export function rememberAiDecision(
  engine: MemoryEngine,
  input: {
    actorId: string;
    context: MemoryEducationalContext;
    payload: AiDecisionMemoryPayload;
  },
): MemoryRecord<AiDecisionMemoryPayload> {
  return engine.create({
    memoryType: 'ai-decision',
    actorId: input.actorId,
    context: input.context,
    payload: input.payload,
    tags: ['ai-decision', input.payload.provider ?? 'unknown'],
  });
}

export function rememberPreference(
  engine: MemoryEngine,
  input: {
    actorId: string;
    teacherId: string;
    payload: PreferenceMemoryPayload;
  },
): MemoryRecord<PreferenceMemoryPayload> {
  return engine.create({
    memoryType: 'preference',
    actorId: input.actorId,
    context: { teacherId: input.teacherId },
    payload: input.payload,
    tags: ['preference', input.payload.key],
  });
}

export function rememberKnowledge(
  engine: MemoryEngine,
  input: {
    actorId: string;
    context: MemoryEducationalContext;
    payload: KnowledgeMemoryPayload;
  },
): MemoryRecord<KnowledgeMemoryPayload> {
  return engine.create({
    memoryType: 'knowledge',
    actorId: input.actorId,
    context: input.context,
    payload: input.payload,
    tags: ['knowledge', input.payload.patternKind],
  });
}
