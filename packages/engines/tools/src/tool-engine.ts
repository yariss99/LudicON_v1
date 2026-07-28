/**
 * ToolEngine — sole gateway for external capabilities.
 */

import { ToolExecutor } from './executor.js';
import { ToolMonitor } from './monitor.js';
import { ToolPermissionManager } from './permission-manager.js';
import { CapabilityRegistry, ToolRegistry } from './registry.js';
import {
  DEFAULT_SANDBOX_POLICY,
  ToolSandbox,
} from './sandbox.js';
import { ToolValidator } from './validator.js';
import type {
  SandboxPolicy,
  ToolDescriptor,
  ToolHandler,
  ToolInvokeRequest,
  ToolMonitorSnapshot,
  ToolResult,
} from './types.js';

export type CreateToolEngineOptions = {
  readonly registry?: ToolRegistry;
  readonly capabilities?: CapabilityRegistry;
  readonly validator?: ToolValidator;
  readonly permissions?: ToolPermissionManager;
  readonly sandbox?: ToolSandbox;
  readonly monitor?: ToolMonitor;
  readonly sandboxPolicy?: Partial<SandboxPolicy>;
  readonly clock?: () => Date;
};

export class ToolEngine {
  private readonly registry: ToolRegistry;
  private readonly capabilities: CapabilityRegistry;
  private readonly executor: ToolExecutor;
  private readonly monitor: ToolMonitor;
  private readonly validator: ToolValidator;

  constructor(options: CreateToolEngineOptions = {}) {
    this.registry = options.registry ?? new ToolRegistry();
    this.capabilities = options.capabilities ?? new CapabilityRegistry();
    this.validator = options.validator ?? new ToolValidator();
    const permissions = options.permissions ?? new ToolPermissionManager();
    const sandbox =
      options.sandbox ??
      new ToolSandbox({
        ...DEFAULT_SANDBOX_POLICY,
        ...(options.sandboxPolicy ?? {}),
      });
    this.monitor = options.monitor ?? new ToolMonitor(options.clock);
    this.executor = new ToolExecutor(
      this.registry,
      this.validator,
      permissions,
      sandbox,
      this.monitor,
    );
  }

  register(handler: ToolHandler): void {
    this.validator.validateDescriptor(handler.descriptor);
    this.registry.register(handler);
  }

  bindCapability(capability: string, toolId: string): void {
    if (!this.registry.tryGet(toolId)) {
      throw new Error(`Cannot bind capability to unknown tool: ${toolId}`);
    }
    this.capabilities.bind(capability, toolId);
  }

  discover(filter?: {
    category?: ToolDescriptor['category'];
    action?: string;
  }): readonly ToolDescriptor[] {
    return this.registry.discover(filter);
  }

  listTools(): readonly ToolDescriptor[] {
    return this.registry.listDescriptors();
  }

  getCapabilities(): Readonly<Record<string, string>> {
    return this.capabilities.list();
  }

  /** Execute by toolId. */
  async execute(request: ToolInvokeRequest): Promise<ToolResult> {
    return this.executor.execute(request);
  }

  /** Execute by capability alias (workflows stay provider-independent). */
  async executeCapability(
    capability: string,
    request: Omit<ToolInvokeRequest, 'toolId'>,
  ): Promise<ToolResult> {
    const toolId = this.capabilities.resolve(capability);
    if (!toolId) {
      return {
        executionId: 'none',
        toolId: capability,
        action: request.action,
        status: 'unavailable',
        durationMs: 0,
        output: {},
        logs: [],
        warnings: [],
        errors: [`No tool bound for capability: ${capability}`],
        costUsd: 0,
        attempts: 0,
        metadata: { errorCode: 'CAPABILITY_UNBOUND' },
      };
    }
    return this.execute({ ...request, toolId });
  }

  getMonitorSnapshot(): ToolMonitorSnapshot {
    return this.monitor.snapshot();
  }

  getMonitor(): ToolMonitor {
    return this.monitor;
  }

  getRegistry(): ToolRegistry {
    return this.registry;
  }
}

export function createToolEngine(
  options?: CreateToolEngineOptions,
): ToolEngine {
  return new ToolEngine(options);
}
