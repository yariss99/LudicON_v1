/**
 * Loads / enriches educational context before prompt construction.
 * Pedagogy first — context is assembled here, not inside providers.
 */

import type { AIRequest, EducationalContext } from './types.js';

export type ContextEnricher = (
  context: EducationalContext,
  request: AIRequest,
) => EducationalContext | Promise<EducationalContext>;

export class EducationalContextLoader {
  constructor(private readonly enrichers: readonly ContextEnricher[] = []) {}

  async load(request: AIRequest): Promise<EducationalContext> {
    let ctx: EducationalContext = { ...request.educationalContext };
    for (const enrich of this.enrichers) {
      ctx = await enrich(ctx, request);
    }
    return Object.freeze({
      ...ctx,
      learningObjectives: ctx.learningObjectives
        ? Object.freeze([...ctx.learningObjectives])
        : undefined,
      competencies: ctx.competencies
        ? Object.freeze([...ctx.competencies])
        : undefined,
      constraints: ctx.constraints
        ? Object.freeze([...ctx.constraints])
        : undefined,
      extra: ctx.extra ? Object.freeze({ ...ctx.extra }) : undefined,
    });
  }
}
