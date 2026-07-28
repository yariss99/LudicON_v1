/**
 * ToolRegistry + CapabilityRegistry — discover and resolve tools.
 */

import { ToolEngineError } from './errors.js';
import type { ToolCategory, ToolDescriptor, ToolHandler } from './types.js';

export class ToolRegistry {
  private readonly handlers = new Map<string, ToolHandler>();

  register(handler: ToolHandler): void {
    const id = handler.descriptor.toolId;
    if (this.handlers.has(id)) {
      throw new ToolEngineError(
        'DUPLICATE_TOOL',
        `Tool already registered: ${id}`,
      );
    }
    this.handlers.set(id, handler);
  }

  unregister(toolId: string): boolean {
    return this.handlers.delete(toolId);
  }

  get(toolId: string): ToolHandler {
    const h = this.handlers.get(toolId);
    if (!h) {
      throw new ToolEngineError('TOOL_NOT_FOUND', `Unknown tool: ${toolId}`);
    }
    return h;
  }

  tryGet(toolId: string): ToolHandler | undefined {
    return this.handlers.get(toolId);
  }

  list(): readonly ToolHandler[] {
    return [...this.handlers.values()];
  }

  listDescriptors(): readonly ToolDescriptor[] {
    return this.list().map((h) => h.descriptor);
  }

  discover(filter?: {
    category?: ToolCategory;
    action?: string;
  }): readonly ToolDescriptor[] {
    return this.listDescriptors().filter((d) => {
      if (filter?.category && d.category !== filter.category) return false;
      if (filter?.action && !d.supportedActions.includes(filter.action)) {
        return false;
      }
      return true;
    });
  }
}

/** Capability aliases → toolId (replaceable without workflow changes). */
export class CapabilityRegistry {
  private readonly map = new Map<string, string>();

  bind(capability: string, toolId: string): void {
    this.map.set(capability, toolId);
  }

  resolve(capability: string): string | undefined {
    return this.map.get(capability);
  }

  list(): Readonly<Record<string, string>> {
    return Object.freeze(Object.fromEntries(this.map));
  }
}
