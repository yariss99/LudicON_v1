/**
 * Dependency order + cycle detection for Core engines.
 */

import { CoreKernelError } from '../errors.js';
import type { CoreEngineModule } from '../types.js';

export function detectCycles(
  modules: readonly Pick<CoreEngineModule, 'id' | 'dependencies'>[],
): string[][] {
  const graph = new Map<string, readonly string[]>();
  for (const m of modules) {
    graph.set(m.id, m.dependencies ?? []);
  }
  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  const dfs = (id: string): void => {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      const idx = stack.indexOf(id);
      cycles.push(stack.slice(idx).concat(id));
      return;
    }
    visiting.add(id);
    stack.push(id);
    for (const dep of graph.get(id) ?? []) {
      if (!graph.has(dep)) continue;
      dfs(dep);
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  };

  for (const id of graph.keys()) dfs(id);
  return cycles;
}

export function resolveStartupOrder(
  modules: readonly Pick<CoreEngineModule, 'id' | 'dependencies'>[],
): string[] {
  const cycles = detectCycles(modules);
  if (cycles.length > 0) {
    throw new CoreKernelError(
      'DEPENDENCY_CYCLE',
      `Engine dependency cycle detected: ${cycles.map((c) => c.join(' → ')).join('; ')}`,
    );
  }

  const byId = new Map(modules.map((m) => [m.id, m]));
  for (const m of modules) {
    for (const dep of m.dependencies ?? []) {
      if (!byId.has(dep)) {
        throw new CoreKernelError(
          'MISSING_DEPENDENCY',
          `Engine ${m.id} depends on missing engine ${dep}`,
        );
      }
    }
  }

  const remaining = new Set(modules.map((m) => m.id));
  const started = new Set<string>();
  const order: string[] = [];

  while (remaining.size > 0) {
    const wave = [...remaining].filter((id) =>
      (byId.get(id)?.dependencies ?? []).every((d) => started.has(d)),
    );
    if (wave.length === 0) {
      throw new CoreKernelError(
        'DEPENDENCY_DEADLOCK',
        'Unable to resolve engine startup order',
      );
    }
    wave.sort();
    for (const id of wave) {
      remaining.delete(id);
      started.add(id);
      order.push(id);
    }
  }
  return order;
}
