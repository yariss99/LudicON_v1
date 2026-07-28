/**
 * Prompt Builder & Compiler — P-C-005
 * Compiles educational context + intent into a canonical PromptPackage.
 * Does not call AI providers. Does not validate pedagogy for publication.
 */

import {
  PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
  type CoreEducationalContext,
  type PromptAstNode,
  type PromptPackage,
  type PromptResult,
} from '@prima/contracts';

export type PromptCompileInput = {
  readonly intent: string;
  readonly requestType?: string;
  readonly schemaId?: string;
  readonly locale?: string;
  readonly educationalContext: CoreEducationalContext;
  readonly instructions?: readonly string[];
  readonly tone?: string;
  readonly outputLanguage?: string;
  readonly variables?: Readonly<Record<string, string>>;
  readonly resolvedContext?: Readonly<Record<string, unknown>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export class PromptEngineError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'PromptEngineError';
    this.code = code;
  }
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function renderAst(nodes: readonly PromptAstNode[]): string {
  const parts: string[] = [];
  for (const n of nodes) {
    if (n.kind === 'system' || n.kind === 'user') parts.push(n.text);
    else if (n.kind === 'variable') parts.push(`${n.name}=${n.value}`);
    else if (n.kind === 'section') {
      parts.push(`## ${n.title}`);
      parts.push(renderAst(n.children));
    }
  }
  return parts.filter(Boolean).join('\n');
}

export class PromptEngine {
  /**
   * Compile a mandatory PromptPackage. Fails closed if intent or topic context is empty.
   */
  compile(input: PromptCompileInput): PromptResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input.intent?.trim()) {
      errors.push('intent is required');
    }
    const edu = input.educationalContext ?? {};
    if (!edu.topic && !edu.subject && !input.resolvedContext) {
      errors.push(
        'educationalContext must include topic or subject (or resolvedContext)',
      );
    }

    const packageId = newId('pp');
    const requestType = input.requestType ?? 'GenerateLesson';
    const schemaId = input.schemaId ?? 'educational.artifact.v1';
    const locale = input.locale ?? edu.locale;

    const systemNodes: PromptAstNode[] = [
      {
        kind: 'system',
        text: [
          'You are an educational assistant inside PRIMA.',
          'Pedagogy first. Teacher authority is absolute.',
          'Never diagnose or label learners.',
          'Return structured content matching the requested schema fields.',
          locale ? `Prefer locale: ${locale}.` : undefined,
          input.tone ? `Tone: ${input.tone}.` : undefined,
          input.outputLanguage
            ? `Output language: ${input.outputLanguage}.`
            : undefined,
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ];

    const eduChildren: PromptAstNode[] = [];
    if (edu.subject) {
      eduChildren.push({ kind: 'variable', name: 'subject', value: edu.subject });
    }
    if (edu.grade) {
      eduChildren.push({ kind: 'variable', name: 'grade', value: edu.grade });
    }
    if (edu.topic) {
      eduChildren.push({ kind: 'variable', name: 'topic', value: edu.topic });
    }
    if (edu.curriculumRef) {
      eduChildren.push({
        kind: 'variable',
        name: 'curriculum',
        value: edu.curriculumRef,
      });
    }

    const userNodes: PromptAstNode[] = [
      {
        kind: 'section',
        title: 'Educational context',
        children: eduChildren,
      },
      {
        kind: 'user',
        text: [
          `Intent: ${input.intent.trim()}`,
          edu.learningObjectives?.length
            ? `Objectives: ${edu.learningObjectives.join('; ')}`
            : undefined,
          edu.competencies?.length
            ? `Competencies: ${edu.competencies.join('; ')}`
            : undefined,
          edu.constraints?.length
            ? `Constraints: ${edu.constraints.join('; ')}`
            : undefined,
          edu.teacherNotes ? `Teacher notes: ${edu.teacherNotes}` : undefined,
          input.instructions?.length
            ? `Instructions:\n${input.instructions.map((i) => `- ${i}`).join('\n')}`
            : undefined,
          input.variables
            ? `Variables:\n${Object.entries(input.variables)
                .map(([k, v]) => `- ${k}: ${v}`)
                .join('\n')}`
            : undefined,
          `Schema: ${schemaId}`,
          `Request type: ${requestType}`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ];

    if (eduChildren.length === 0) {
      warnings.push('No structured educational fields on AST (subject/grade/topic)');
    }

    if (errors.length > 0) {
      return {
        schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
        resultId: newId('pr'),
        packageId,
        promptPackage: {
          schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
          packageId,
          system: '',
          user: '',
          requestType,
          schemaId,
          locale,
          ast: [],
          educationalContext: Object.freeze({ ...edu }),
          compiledAt: new Date().toISOString(),
          metadata: input.metadata,
        },
        ok: false,
        errors: Object.freeze(errors),
        warnings: Object.freeze(warnings),
      };
    }

    const ast = Object.freeze([...systemNodes, ...userNodes]);
    const promptPackage: PromptPackage = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      packageId,
      system: renderAst(systemNodes),
      user: renderAst(userNodes),
      requestType,
      schemaId,
      locale,
      ast,
      educationalContext: Object.freeze({ ...edu }),
      compiledAt: new Date().toISOString(),
      metadata: input.metadata
        ? Object.freeze({ ...input.metadata })
        : undefined,
    };

    return {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      resultId: newId('pr'),
      packageId,
      promptPackage,
      ok: true,
      errors: Object.freeze([]),
      warnings: Object.freeze(warnings),
    };
  }

  /** Fail-closed helper used by Runtime adapters. */
  compileOrThrow(input: PromptCompileInput): PromptPackage {
    const result = this.compile(input);
    if (!result.ok) {
      throw new PromptEngineError(
        'PROMPT_COMPILE_FAILED',
        result.errors.join('; '),
      );
    }
    return result.promptPackage;
  }
}

export function createPromptEngine(): PromptEngine {
  return new PromptEngine();
}
