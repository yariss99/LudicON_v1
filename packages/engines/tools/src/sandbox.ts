/**
 * ToolSandbox — isolates execution policy (network/fs/credentials).
 * Handlers should honour policy flags; engine enforces denial for unsafe requests.
 */

import { ToolEngineError } from './errors.js';
import type { SandboxPolicy, ToolDescriptor, ToolInvokeRequest } from './types.js';

export const DEFAULT_SANDBOX_POLICY: SandboxPolicy = {
  allowNetwork: false,
  allowFilesystem: false,
  allowCredentials: false,
  maxMemoryHintMb: 256,
};

export class ToolSandbox {
  constructor(private readonly policy: SandboxPolicy = DEFAULT_SANDBOX_POLICY) {}

  getPolicy(): SandboxPolicy {
    return this.policy;
  }

  /**
   * Assert the tool may run under current sandbox policy.
   * Tools requiring external-access need allowNetwork.
   */
  assertAllowed(descriptor: ToolDescriptor, _request: ToolInvokeRequest): void {
    const needsExternal = descriptor.requiredPermissions.includes('external-access');
    if (needsExternal && !this.policy.allowNetwork) {
      throw new ToolEngineError(
        'SANDBOX_DENIED',
        `Tool ${descriptor.toolId} requires network; sandbox.allowNetwork is false.`,
      );
    }
    const needsSensitive = descriptor.requiredPermissions.includes('sensitive');
    if (needsSensitive && !this.policy.allowCredentials) {
      throw new ToolEngineError(
        'SANDBOX_DENIED',
        `Tool ${descriptor.toolId} requires credentials; sandbox.allowCredentials is false.`,
      );
    }
  }

  withPolicy(policy: Partial<SandboxPolicy>): ToolSandbox {
    return new ToolSandbox({ ...this.policy, ...policy });
  }
}
