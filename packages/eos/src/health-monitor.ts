import type {
  EngineHealthSnapshot,
  HealthMonitor,
  HealthStatus,
  KernelHealthReport,
  KernelLifecycleState,
} from '@prima/contracts';
import type { InMemoryEngineRegistry } from './registry.js';

export class DefaultHealthMonitor implements HealthMonitor {
  private readonly listeners = new Set<(report: KernelHealthReport) => void>();

  constructor(
    private readonly registry: InMemoryEngineRegistry,
    private readonly getKernelState: () => KernelLifecycleState,
  ) {}

  probe(engineId: string): EngineHealthSnapshot {
    const engine = this.registry.getEngine(engineId);
    const snapshot = engine.health();
    const lifecycleState = this.registry.getLifecycleState(engineId);
    return {
      ...snapshot,
      engineId,
      lifecycleState,
      checkedAt: new Date().toISOString(),
    };
  }

  probeAll(): KernelHealthReport {
    const engines = this.registry.list().map((reg) => this.probe(reg.metadata.id));
    const kernelState = this.getKernelState();
    let kernelStatus: HealthStatus = 'healthy';
    if (kernelState === 'failed') kernelStatus = 'unhealthy';
    else if (kernelState === 'degraded') kernelStatus = 'degraded';
    else if (kernelState !== 'running') kernelStatus = 'unknown';
    else if (engines.some((e) => e.status === 'unhealthy' || e.status === 'unavailable')) {
      kernelStatus = 'degraded';
    } else if (engines.some((e) => e.status === 'degraded')) {
      kernelStatus = 'degraded';
    }

    const report: KernelHealthReport = {
      kernelStatus,
      kernelState,
      engines,
      checkedAt: new Date().toISOString(),
    };
    for (const listener of this.listeners) listener(report);
    return report;
  }

  watch(listener: (report: KernelHealthReport) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
