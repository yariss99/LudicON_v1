/**
 * ExecutionLogger — append-only execution audit trail.
 */

import { newId, nowIso } from './ids.js';
import type { ExecutionLogEntry } from './types.js';

export class ExecutionLogger {
  private readonly entries: ExecutionLogEntry[] = [];

  constructor(private readonly clock: () => Date = () => new Date()) {}

  record(
    entry: Omit<ExecutionLogEntry, 'entryId' | 'timestamp'> & {
      timestamp?: string;
      entryId?: string;
    },
  ): ExecutionLogEntry {
    const full: ExecutionLogEntry = {
      entryId: entry.entryId ?? newId('ailog'),
      timestamp: entry.timestamp ?? nowIso(this.clock),
      requestId: entry.requestId,
      workflowId: entry.workflowId,
      teacherId: entry.teacherId,
      provider: entry.provider,
      model: entry.model,
      latencyMs: entry.latencyMs,
      tokens: entry.tokens,
      costUsd: entry.costUsd,
      status: entry.status,
      attempt: entry.attempt,
      errorCode: entry.errorCode,
      metadata: Object.freeze({ ...(entry.metadata ?? {}) }),
    };
    this.entries.push(full);
    return full;
  }

  list(): readonly ExecutionLogEntry[] {
    return Object.freeze([...this.entries]);
  }

  forRequest(requestId: string): readonly ExecutionLogEntry[] {
    return Object.freeze(
      this.entries.filter((e) => e.requestId === requestId),
    );
  }

  forWorkflow(workflowId: string): readonly ExecutionLogEntry[] {
    return Object.freeze(
      this.entries.filter((e) => e.workflowId === workflowId),
    );
  }
}
