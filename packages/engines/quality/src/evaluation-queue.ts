import type { QualityTrigger } from './types.js';

export type EvaluationJob = {
  id: string;
  subjectType: 'blueprint' | 'asset' | 'lesson';
  subjectId: string;
  trigger: QualityTrigger;
  enqueuedAt: string;
};

/**
 * EvaluationQueue — real-time re-evaluation jobs (event-driven, not polling UI).
 */
export class EvaluationQueue {
  private readonly queue: EvaluationJob[] = [];

  enqueue(job: Omit<EvaluationJob, 'enqueuedAt'>): EvaluationJob {
    const full: EvaluationJob = {
      ...job,
      enqueuedAt: new Date().toISOString(),
    };
    this.queue.push(full);
    return full;
  }

  dequeue(): EvaluationJob | undefined {
    return this.queue.shift();
  }

  pending(): readonly EvaluationJob[] {
    return this.queue;
  }

  size(): number {
    return this.queue.length;
  }
}
