import type { EngineContract } from '@prima/contracts';
import {
  assertEngineIsolationRules,
  validateEngineManifest,
} from '@prima/contracts';
import { checkKernelCompatibility } from './compatibility.js';

export function assertEngineContract(
  engine: EngineContract,
  options?: { kernelVersion?: string },
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const manifestCheck = validateEngineManifest(engine.manifest, engine.metadata);
  issues.push(...manifestCheck.issues);
  const isolation = assertEngineIsolationRules(engine.manifest);
  issues.push(...isolation.issues);

  if (!engine.getConfigurationSchema) {
    issues.push('getConfigurationSchema missing');
  }
  if (typeof engine.getOperationalState !== 'function') {
    issues.push('getOperationalState missing');
  }
  if (typeof engine.diagnostics !== 'function') {
    issues.push('diagnostics missing');
  }

  if (options?.kernelVersion) {
    const compat = checkKernelCompatibility(engine.manifest, options.kernelVersion);
    issues.push(...compat.issues);
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Lightweight contract suite for CI — invoke against any EngineContract.
 */
export async function runEngineContractSuite(
  engine: EngineContract,
  options: {
    kernelVersion?: string;
    createKernelContext: () => import('@prima/contracts').KernelContext;
    createExecutionContext: () => import('@prima/contracts').ExecutionContext;
    config?: Readonly<Record<string, unknown>>;
  },
): Promise<{ ok: boolean; issues: string[] }> {
  const issues: string[] = [];
  const staticCheck = assertEngineContract(engine, {
    kernelVersion: options.kernelVersion,
  });
  issues.push(...staticCheck.issues);

  try {
    await engine.initialize(options.createKernelContext());
    await engine.configure(options.config ?? {});
    await engine.start(options.createExecutionContext());
    const health = engine.health();
    if (!health.runtimeOk && engine.getOperationalState() === 'ready') {
      issues.push('health.runtimeOk should be true when ready');
    }
    const op = engine.getOperationalState();
    if (op !== 'ready' && op !== 'busy') {
      issues.push(`expected ready/busy after start, got ${op}`);
    }
    await engine.stop();
    await engine.shutdown();
    await engine.destroy();
  } catch (error) {
    issues.push(`lifecycle suite failed: ${String(error)}`);
  }

  return { ok: issues.length === 0, issues };
}
