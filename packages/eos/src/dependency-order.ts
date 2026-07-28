import type { EngineId, EngineMetadata } from '@prima/contracts';
import { FatalKernelError } from '@prima/contracts';

export function detectCycles(engines: readonly EngineMetadata[]): string[] {
  const byId = new Map(engines.map((e) => [e.id, e] as const));
  const visiting = new Set<EngineId>();
  const visited = new Set<EngineId>();
  const cycles: string[] = [];

  const visit = (id: EngineId, path: EngineId[]): void => {
    if (visiting.has(id)) {
      cycles.push([...path, id].join(' -> '));
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const meta = byId.get(id);
    if (meta) {
      for (const dep of meta.dependencies) {
        visit(dep, [...path, id]);
      }
    }
    visiting.delete(id);
    visited.add(id);
  };

  for (const e of engines) visit(e.id, []);
  return cycles;
}

/**
 * Topological order: dependencies before dependents.
 */
export function resolveStartupOrder(engines: readonly EngineMetadata[]): EngineId[] {
  const cycles = detectCycles(engines);
  if (cycles.length > 0) {
    throw new FatalKernelError(`Engine dependency cycle detected: ${cycles[0]}`);
  }

  const byId = new Map(engines.map((e) => [e.id, e] as const));
  for (const e of engines) {
    for (const dep of e.dependencies) {
      if (!byId.has(dep)) {
        throw new FatalKernelError(
          `Engine "${e.id}" depends on missing engine "${dep}"`,
          { engineId: e.id },
        );
      }
    }
  }

  const ordered: EngineId[] = [];
  const seen = new Set<EngineId>();

  const visit = (id: EngineId): void => {
    if (seen.has(id)) return;
    const meta = byId.get(id);
    if (!meta) return;
    for (const dep of meta.dependencies) visit(dep);
    seen.add(id);
    ordered.push(id);
  };

  for (const e of engines) visit(e.id);
  return ordered;
}
