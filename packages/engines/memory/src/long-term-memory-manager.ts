import type { MemoryRegistry } from './memory-registry.js';
import type {
  MemoryDomain,
  MemoryItem,
  MemorySource,
} from './types.js';

const LONG_TERM_DOMAINS: MemoryDomain[] = [
  'teacher_profile',
  'teaching_preferences',
  'class_profiles',
  'school_context',
  'pedagogical_preferences',
  'generated_assets',
  'blueprint_history',
  'resource_usage',
  'interaction_patterns',
  'custom_templates',
];

/**
 * LongTermMemoryManager — durable, teacher-owned memory with long-term value only.
 */
export class LongTermMemoryManager {
  constructor(private readonly registry: MemoryRegistry) {}

  list(teacherId: string, domain?: MemoryDomain): MemoryItem[] {
    return this.registry.list({
      teacherId,
      tier: 'long_term',
      status: 'active',
      domain,
    });
  }

  store(input: {
    teacherId: string;
    domain: MemoryDomain;
    title: string;
    payload: Record<string, unknown>;
    source: MemorySource;
    confidence: number;
    canonicalKey?: string;
  }): MemoryItem | { error: string } {
    if (!LONG_TERM_DOMAINS.includes(input.domain)) {
      return { error: `Domain ${input.domain} is not long-term` };
    }
    if (input.source.kind === 'system_observed' && !input.source.label) {
      return { error: 'Observed memory requires evidence label' };
    }
    if (this.rejectTemporaryReasoning(input.payload)) {
      return { error: 'Temporary reasoning cannot be stored in long-term memory' };
    }
    return this.registry.create({
      ...input,
      tier: 'long_term',
    });
  }

  /** Reject temporary reasoning payloads */
  rejectTemporaryReasoning(payload: Record<string, unknown>): boolean {
    const keys = Object.keys(payload);
    return keys.some((k) =>
      ['scratchpad', 'tempReasoning', 'llmTrace', 'chainOfThought'].includes(k),
    );
  }
}
