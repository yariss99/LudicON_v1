/**
 * UsageTracker + CostTracker — aggregated consumption metrics.
 */

import { dayKey, monthKey } from './ids.js';
import type { AIProviderId, TokenUsage, UsageSnapshot } from './types.js';

export class CostTracker {
  private totalUsd = 0;
  private readonly byProvider = new Map<string, number>();

  add(provider: AIProviderId, costUsd: number): void {
    this.totalUsd += costUsd;
    this.byProvider.set(
      provider,
      (this.byProvider.get(provider) ?? 0) + costUsd,
    );
  }

  getTotalUsd(): number {
    return this.totalUsd;
  }

  getByProvider(): Readonly<Record<string, number>> {
    return Object.fromEntries(this.byProvider);
  }
}

export class UsageTracker {
  private totalRequests = 0;
  private totalTokens = 0;
  private readonly byProvider = new Map<string, number>();
  private readonly byTeacher = new Map<string, number>();
  private readonly byDay = new Map<string, number>();
  private readonly byMonth = new Map<string, number>();

  constructor(
    private readonly costTracker: CostTracker = new CostTracker(),
    private readonly clock: () => Date = () => new Date(),
  ) {}

  record(input: {
    teacherId: string;
    provider: AIProviderId;
    tokens: TokenUsage;
    costUsd: number;
  }): void {
    const now = this.clock();
    this.totalRequests += 1;
    this.totalTokens += input.tokens.totalTokens;
    this.byProvider.set(
      input.provider,
      (this.byProvider.get(input.provider) ?? 0) + 1,
    );
    this.byTeacher.set(
      input.teacherId,
      (this.byTeacher.get(input.teacherId) ?? 0) + 1,
    );
    const day = dayKey(now);
    const month = monthKey(now);
    this.byDay.set(day, (this.byDay.get(day) ?? 0) + 1);
    this.byMonth.set(month, (this.byMonth.get(month) ?? 0) + 1);
    this.costTracker.add(input.provider, input.costUsd);
  }

  snapshot(): UsageSnapshot {
    return {
      totalRequests: this.totalRequests,
      totalTokens: this.totalTokens,
      totalCostUsd: this.costTracker.getTotalUsd(),
      byProvider: Object.freeze({ ...Object.fromEntries(this.byProvider) }),
      byTeacher: Object.freeze({ ...Object.fromEntries(this.byTeacher) }),
      byDay: Object.freeze({ ...Object.fromEntries(this.byDay) }),
      byMonth: Object.freeze({ ...Object.fromEntries(this.byMonth) }),
    };
  }

  getCostTracker(): CostTracker {
    return this.costTracker;
  }
}
