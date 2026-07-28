import type { LearningRecord, RecommendationStatus } from './types.js';

const IGNORE_SUPPRESS_THRESHOLD = 3;
const DISMISS_SUPPRESS_THRESHOLD = 2;

/**
 * RecommendationLearning — adapt from teacher decisions.
 * Never repeatedly recommend items consistently ignored.
 */
export class RecommendationLearning {
  private readonly records = new Map<string, LearningRecord>();

  private key(teacherId: string, policyId: string): string {
    return `${teacherId}::${policyId}`;
  }

  get(teacherId: string, policyId: string): LearningRecord | undefined {
    return this.records.get(this.key(teacherId, policyId));
  }

  list(teacherId?: string): LearningRecord[] {
    const all = [...this.records.values()];
    return teacherId ? all.filter((r) => r.teacherId === teacherId) : all;
  }

  update(
    teacherId: string,
    policyId: string,
    outcome: RecommendationStatus,
  ): LearningRecord {
    const key = this.key(teacherId, policyId);
    const now = new Date().toISOString();
    const current = this.records.get(key) ?? {
      teacherId,
      policyId,
      accepted: 0,
      dismissed: 0,
      ignored: 0,
      displayed: 0,
      lastUpdated: now,
    };

    if (outcome === 'accepted') current.accepted += 1;
    if (outcome === 'dismissed') current.dismissed += 1;
    if (outcome === 'ignored') current.ignored += 1;
    if (outcome === 'displayed' || outcome === 'new') current.displayed += 1;
    current.lastOutcome = outcome;
    current.lastUpdated = now;
    this.records.set(key, current);
    return structuredClone(current);
  }

  /** True when policy should be suppressed for this teacher */
  shouldSuppress(teacherId: string, policyId: string): boolean {
    const record = this.get(teacherId, policyId);
    if (!record) return false;
    if (record.ignored >= IGNORE_SUPPRESS_THRESHOLD) return true;
    if (record.dismissed >= DISMISS_SUPPRESS_THRESHOLD) return true;
    return false;
  }

  /** Boost confidence when teacher often accepts */
  confidenceAdjustment(teacherId: string, policyId: string): number {
    const record = this.get(teacherId, policyId);
    if (!record) return 0;
    if (record.accepted >= 2) return 0.1;
    if (record.dismissed >= 1) return -0.05;
    return 0;
  }
}
