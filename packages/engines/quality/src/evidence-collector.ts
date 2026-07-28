import { uid } from './ids.js';
import type {
  EvidenceItem,
  PolicyEvaluationResult,
  QualityDimension,
  QualityPolicy,
} from './types.js';

/**
 * EvidenceCollector — stores evidence statements for explainability.
 */
export class EvidenceCollector {
  private readonly bySubject = new Map<string, EvidenceItem[]>();

  collect(
    subjectKey: string,
    policy: QualityPolicy,
    passed: boolean,
    refs: string[],
  ): EvidenceItem {
    const item: EvidenceItem = {
      id: uid('ev'),
      policyId: policy.policyId,
      dimension: policy.category,
      statement: passed
        ? policy.evidenceRules.strengthWhenPass
        : policy.evidenceRules.weaknessWhenFail,
      kind: passed ? 'strength' : 'weakness',
      refs: [...refs],
    };
    const list = this.bySubject.get(subjectKey) ?? [];
    list.push(item);
    this.bySubject.set(subjectKey, list);
    return item;
  }

  fromResults(subjectKey: string, results: PolicyEvaluationResult[]): EvidenceItem[] {
    const items = results.flatMap((r) => r.evidence);
    this.bySubject.set(subjectKey, items);
    return items.map((i) => structuredClone(i));
  }

  list(subjectKey: string, dimension?: QualityDimension): EvidenceItem[] {
    const items = this.bySubject.get(subjectKey) ?? [];
    return items
      .filter((i) => (dimension ? i.dimension === dimension : true))
      .map((i) => structuredClone(i));
  }

  clear(subjectKey: string): void {
    this.bySubject.delete(subjectKey);
  }
}
