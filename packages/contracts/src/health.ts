/** Health monitoring contracts. */

export type HealthStatus = 'unknown' | 'healthy' | 'degraded' | 'unhealthy' | 'unavailable';

export interface EngineHealthSnapshot {
  readonly engineId: string;
  readonly status: HealthStatus;
  readonly availability: boolean;
  readonly version: string;
  readonly lifecycleState: import('./lifecycle.js').EngineLifecycleState;
  readonly initializationComplete: boolean;
  readonly runtimeOk: boolean;
  readonly recoveryInProgress: boolean;
  readonly dependencyStatuses: Readonly<Record<string, HealthStatus>>;
  readonly checkedAt: string;
  readonly detail?: string;
}

export interface KernelHealthReport {
  readonly kernelStatus: HealthStatus;
  readonly kernelState: import('./lifecycle.js').KernelLifecycleState;
  readonly engines: readonly EngineHealthSnapshot[];
  readonly checkedAt: string;
}

export interface HealthMonitor {
  probe(engineId: string): EngineHealthSnapshot;
  probeAll(): KernelHealthReport;
  watch(listener: (report: KernelHealthReport) => void): () => void;
}
