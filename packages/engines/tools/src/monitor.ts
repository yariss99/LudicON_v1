/**
 * ToolMonitor — execution metrics and health aggregation.
 */

import { newId, nowIso } from './ids.js';
import type {
  ToolExecutionLog,
  ToolExecutionStatus,
  ToolMonitorSnapshot,
  ToolResult,
} from './types.js';

export class ToolMonitor {
  private readonly logs: ToolExecutionLog[] = [];
  private readonly byTool = new Map<
    string,
    { ok: number; fail: number; totalMs: number }
  >();

  constructor(private readonly clock: () => Date = () => new Date()) {}

  record(result: ToolResult, teacherId: string, workflowId?: string): void {
    const fail =
      result.status !== 'succeeded' && result.status !== 'partial';
    const stats = this.byTool.get(result.toolId) ?? {
      ok: 0,
      fail: 0,
      totalMs: 0,
    };
    if (fail) stats.fail += 1;
    else stats.ok += 1;
    stats.totalMs += result.durationMs;
    this.byTool.set(result.toolId, stats);

    this.logs.push({
      entryId: newId('tlog'),
      timestamp: nowIso(this.clock),
      executionId: result.executionId,
      toolId: result.toolId,
      action: result.action,
      teacherId,
      workflowId,
      status: result.status,
      durationMs: result.durationMs,
      costUsd: result.costUsd,
      attempts: result.attempts,
      error: result.errors[0],
    });
  }

  snapshot(): ToolMonitorSnapshot {
    const byTool: Record<string, { ok: number; fail: number; avgMs: number }> =
      {};
    for (const [id, s] of this.byTool) {
      const n = s.ok + s.fail;
      byTool[id] = {
        ok: s.ok,
        fail: s.fail,
        avgMs: n === 0 ? 0 : Math.round(s.totalMs / n),
      };
    }
    const successCount = [...this.byTool.values()].reduce((a, s) => a + s.ok, 0);
    const failureCount = [...this.byTool.values()].reduce(
      (a, s) => a + s.fail,
      0,
    );
    return {
      totalExecutions: this.logs.length,
      successCount,
      failureCount,
      deniedCount: this.logs.filter((l) => l.status === 'denied').length,
      totalDurationMs: this.logs.reduce((a, l) => a + l.durationMs, 0),
      totalCostUsd: this.logs.reduce((a, l) => a + l.costUsd, 0),
      byTool: Object.freeze(byTool),
    };
  }

  listLogs(): readonly ToolExecutionLog[] {
    return Object.freeze([...this.logs]);
  }

  successRate(toolId?: string): number {
    if (toolId) {
      const s = this.byTool.get(toolId);
      if (!s) return 0;
      const n = s.ok + s.fail;
      return n === 0 ? 0 : s.ok / n;
    }
    const snap = this.snapshot();
    const n = snap.successCount + snap.failureCount;
    return n === 0 ? 0 : snap.successCount / n;
  }
}

export type { ToolExecutionStatus };
