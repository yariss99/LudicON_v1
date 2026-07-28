import type { EngineCapabilityManifest, EngineMetadata, SemanticVersion } from '@prima/contracts';
import { compareSemVer, satisfiesMinVersion } from './semver.js';

export function metadataFromManifest(manifest: EngineCapabilityManifest): EngineMetadata {
  return {
    id: manifest.engineId,
    name: manifest.name,
    constitutionalCode: manifest.constitutionalCode,
    version: manifest.version,
    capabilities: [...manifest.capabilities],
    dependencies: [...manifest.dependencies],
  };
}

/**
 * Kernel version must satisfy at least one compatible range entry.
 * Entries are minimum versions (inclusive), e.g. "0.1.0".
 */
export function checkKernelCompatibility(
  manifest: EngineCapabilityManifest,
  kernelVersion: SemanticVersion,
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!manifest.compatibleKernelVersions.length) {
    issues.push('compatibleKernelVersions must declare at least one minimum version');
    return { ok: false, issues };
  }
  const ok = manifest.compatibleKernelVersions.some((min) =>
    satisfiesMinVersion(kernelVersion, min),
  );
  if (!ok) {
    issues.push(
      `Kernel ${kernelVersion} incompatible with Engine ${manifest.engineId} (requires one of: ${manifest.compatibleKernelVersions.join(', ')})`,
    );
  }
  // Prefer documented ordering for clarity
  void compareSemVer;
  return { ok, issues };
}
