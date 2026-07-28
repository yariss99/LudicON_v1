/**
 * @prima/core-kernel — PRIMA Core Kernel (platform bootstrap entry)
 */

export type {
  PlatformState,
  CoreEngineState,
  PlatformEventType,
  HealthStatus,
  CoreEngineHealth,
  CoreEngineModule,
  CoreKernelContext,
  FeatureFlags,
  PlatformConfiguration,
  PlatformEvent,
  PlatformEventListener,
  EngineHealthSnapshot,
  PlatformHealthReport,
  StartupReport,
  DependencyGraphReport,
  ConfigurationReport,
  EngineReport,
  VersionReport,
  DiagnosticsBundle,
  RuntimeStarter,
  CoreKernelOptions,
  EngineDiscoverer,
} from './types.js';

export { CORE_KERNEL_VERSION, PLATFORM_NAME, PLATFORM_VERSION } from './version.js';
export { CoreKernelError } from './errors.js';
export {
  loadConfiguration,
  validateConfiguration,
  mergeConfiguration,
} from './configuration/loader.js';
export { DependencyContainer, token } from './di/container.js';
export type { ServiceToken, Factory } from './di/container.js';
export { ServiceRegistry } from './registry/service-registry.js';
export type { LazyEngineFactory } from './registry/service-registry.js';
export { PlatformEventBus } from './events/platform-event-bus.js';
export {
  resolveStartupOrder,
  detectCycles,
} from './lifecycle/dependency-order.js';
export { EngineLifecycleManager } from './lifecycle/engine-lifecycle.js';
export { HealthMonitor } from './health/health-monitor.js';
export { Diagnostics } from './diagnostics/diagnostics.js';
export { Bootstrapper, staticDiscoverer } from './bootstrap/bootstrapper.js';
export {
  PrimaCoreKernel,
  createPrimaCoreKernel,
  TOKENS,
} from './kernel/core-kernel.js';
export { createStubCoreEngine } from './stubs.js';
export { createRuntimeBridge } from './runtime/runtime-bridge.js';
export type { RuntimeBridge } from './runtime/runtime-bridge.js';
