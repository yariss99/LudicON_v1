/**
 * Platform health monitor.
 */

import type { EngineLifecycleManager } from '../lifecycle/engine-lifecycle.js';
import type { PlatformEventBus } from '../events/platform-event-bus.js';
import type { ServiceRegistry } from '../registry/service-registry.js';
import type {
  EngineHealthSnapshot,
  HealthStatus,
  PlatformHealthReport,
  PlatformState,
  RuntimeStarter,
} from '../types.js';

function memoryUsage(): PlatformHealthReport['memoryUsage'] {
  if (typeof process === 'undefined' || !process.memoryUsage) return undefined;
  const m = process.memoryUsage();
  return {
    heapUsedMb: Math.round((m.heapUsed / 1024 / 1024) * 100) / 100,
    heapTotalMb: Math.round((m.heapTotal / 1024 / 1024) * 100) / 100,
    rssMb: Math.round((m.rss / 1024 / 1024) * 100) / 100,
  };
}

export class HealthMonitor {
  private last?: PlatformHealthReport;

  constructor(
    private readonly services: ServiceRegistry,
    private readonly lifecycle: EngineLifecycleManager,
    private readonly events: PlatformEventBus,
    private readonly getPlatformState: () => PlatformState,
    private readonly getStartupTimeMs: () => number | undefined,
    private readonly getRuntime: () => RuntimeStarter | undefined,
    private readonly getErrors: () => readonly string[],
    private readonly getWarnings: () => readonly string[],
    private readonly getProviderAvailability: () => Readonly<Record<string, boolean>>,
  ) {}

  async probe(): Promise<PlatformHealthReport> {
    const engines: EngineHealthSnapshot[] = [];
    for (const id of this.services.listIds()) {
      const module = await this.services.resolve(id);
      const health = (await module.health?.()) ?? { status: 'healthy' as const };
      engines.push({
        engineId: id,
        state: this.lifecycle.getState(id),
        status: health.status,
        message: health.message,
        dependencies: module.dependencies ?? [],
        checkedAt: new Date().toISOString(),
      });
    }

    const runtime = this.getRuntime();
    let runtimeStatus: HealthStatus | undefined;
    if (runtime?.health) {
      runtimeStatus = await runtime.health();
    }

    const platformState = this.getPlatformState();
    let status: HealthStatus = 'healthy';
    if (platformState === 'failed') status = 'unhealthy';
    else if (platformState === 'degraded') status = 'degraded';
    else if (platformState !== 'ready') status = 'unknown';
    else if (
      engines.some((e) => e.status === 'unhealthy') ||
      runtimeStatus === 'unhealthy'
    ) {
      status = 'degraded';
    } else if (
      engines.some((e) => e.status === 'degraded') ||
      runtimeStatus === 'degraded'
    ) {
      status = 'degraded';
    }

    const report: PlatformHealthReport = {
      status,
      platformState,
      startupTimeMs: this.getStartupTimeMs(),
      memoryUsage: memoryUsage(),
      engines,
      errors: [...this.getErrors()],
      warnings: [...this.getWarnings()],
      providerAvailability: this.getProviderAvailability(),
      checkedAt: new Date().toISOString(),
    };

    const changed =
      !this.last ||
      this.last.status !== report.status ||
      this.last.platformState !== report.platformState;
    this.last = report;
    if (changed) {
      this.events.publish({
        type: 'HealthChanged',
        payload: { status: report.status, platformState: report.platformState },
      });
    }
    return report;
  }

  lastReport(): PlatformHealthReport | undefined {
    return this.last;
  }
}
