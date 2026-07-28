/**
 * Diagnostics — startup, dependency, config, engine, health, version reports.
 */

import { CORE_KERNEL_VERSION } from '../version.js';
import { detectCycles, resolveStartupOrder } from '../lifecycle/dependency-order.js';
import type { EngineLifecycleManager } from '../lifecycle/engine-lifecycle.js';
import type { ServiceRegistry } from '../registry/service-registry.js';
import type {
  ConfigurationReport,
  DependencyGraphReport,
  DiagnosticsBundle,
  EngineReport,
  PlatformConfiguration,
  PlatformHealthReport,
  RuntimeStarter,
  StartupReport,
  VersionReport,
} from '../types.js';

export class Diagnostics {
  constructor(
    private readonly services: ServiceRegistry,
    private readonly lifecycle: EngineLifecycleManager,
    private readonly getConfig: () => PlatformConfiguration,
    private readonly getStartup: () => StartupReport,
    private readonly getHealth: () => Promise<PlatformHealthReport>,
    private readonly getRuntime: () => RuntimeStarter | undefined,
  ) {}

  startupReport(): StartupReport {
    return this.getStartup();
  }

  async dependencyGraph(): Promise<DependencyGraphReport> {
    const modules = await this.services.listModules();
    const nodes = modules.map((m) => ({ id: m.id, version: m.version }));
    const edges = modules.flatMap((m) =>
      (m.dependencies ?? []).map((to) => ({ from: m.id, to })),
    );
    let startupOrder: string[] = [];
    let cycles: string[][] = [];
    try {
      startupOrder = resolveStartupOrder(modules);
      cycles = detectCycles(modules);
    } catch {
      cycles = detectCycles(modules);
    }
    return {
      nodes,
      edges,
      startupOrder,
      cycles,
    };
  }

  configurationReport(): ConfigurationReport {
    const config = this.getConfig();
    return {
      environment: config.environment,
      featureFlags: config.featureFlags,
      experimental: config.experimental,
      engineIds: Object.keys(config.engines),
      providerIds: Object.keys(config.providers),
      locale: config.localization.defaultLocale,
      loggingLevel: config.logging.level,
      security: config.security,
    };
  }

  async engineReport(): Promise<EngineReport> {
    const modules = await this.services.listModules();
    return {
      engines: modules.map((m) => this.lifecycle.describe(m)),
    };
  }

  async versionReport(): Promise<VersionReport> {
    const modules = await this.services.listModules();
    const engines: Record<string, string> = {};
    for (const m of modules) engines[m.id] = m.version;
    return {
      platformVersion: this.getConfig().platform.version,
      kernelVersion: CORE_KERNEL_VERSION,
      runtimeOrchestratorVersion: this.getRuntime()?.version,
      nodeVersion: typeof process !== 'undefined' ? process.version : 'unknown',
      engines,
    };
  }

  async generate(): Promise<DiagnosticsBundle> {
    const bundle: DiagnosticsBundle = {
      generatedAt: new Date().toISOString(),
      startup: this.startupReport(),
      dependencyGraph: await this.dependencyGraph(),
      configuration: this.configurationReport(),
      engines: await this.engineReport(),
      health: await this.getHealth(),
      version: await this.versionReport(),
    };
    return bundle;
  }
}
