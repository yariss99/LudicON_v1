import type { KnowledgeRegistry } from './knowledge-registry.js';
import type { KnowledgeEntity } from './types.js';

export class CurriculumService {
  constructor(private readonly registry: KnowledgeRegistry) {}
  list(): KnowledgeEntity[] {
    return this.registry.byCategory('curriculum');
  }
  get(id: string): KnowledgeEntity | undefined {
    const e = this.registry.get(id);
    return e?.category === 'curriculum' ? e : undefined;
  }
}

export class CompetencyService {
  constructor(private readonly registry: KnowledgeRegistry) {}
  list(): KnowledgeEntity[] {
    return this.registry.byCategory('competencies');
  }
  specific(): KnowledgeEntity[] {
    return this.registry.byCategory('specific_competencies');
  }
  get(id: string): KnowledgeEntity | undefined {
    const e = this.registry.get(id);
    return e?.category === 'competencies' || e?.category === 'specific_competencies'
      ? e
      : undefined;
  }
}

export class MethodService {
  constructor(private readonly registry: KnowledgeRegistry) {}
  list(): KnowledgeEntity[] {
    return this.registry.byCategory('pedagogical_methods');
  }
  strategies(): KnowledgeEntity[] {
    return this.registry.byCategory('teaching_strategies');
  }
}

export class ActivityService {
  constructor(private readonly registry: KnowledgeRegistry) {}
  list(): KnowledgeEntity[] {
    return this.registry.byCategory('learning_activities');
  }
}

export class AssessmentService {
  constructor(private readonly registry: KnowledgeRegistry) {}
  list(): KnowledgeEntity[] {
    return this.registry.byCategory('assessment_strategies');
  }
  instruments(): KnowledgeEntity[] {
    return this.registry.byCategory('assessment_instruments');
  }
}

export class ResourceService {
  constructor(private readonly registry: KnowledgeRegistry) {}
  list(): KnowledgeEntity[] {
    return this.registry.byCategory('educational_resources');
  }
  digitalTools(): KnowledgeEntity[] {
    return this.registry.byCategory('digital_tools');
  }
}
