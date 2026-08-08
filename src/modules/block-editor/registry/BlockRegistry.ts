import { createId } from "../../../utils/id";
import { CORE_BLOCK_DEFINITIONS } from "../constants";
import type {
  BlockDefinition,
  UniversalBlock,
  UniversalBlockType,
} from "../types";

/**
 * BlockRegistry — new block types can be registered without changing the editor UI.
 */
class BlockRegistryImpl {
  private readonly defs = new Map<string, BlockDefinition>();

  constructor(seed: readonly BlockDefinition[] = CORE_BLOCK_DEFINITIONS) {
    for (const def of seed) this.register(def);
  }

  register(definition: BlockDefinition) {
    this.defs.set(definition.type, definition);
  }

  get(type: string): BlockDefinition | undefined {
    return this.defs.get(type);
  }

  list(): BlockDefinition[] {
    return [...this.defs.values()];
  }

  types(): string[] {
    return [...this.defs.keys()];
  }

  createBlock(type: UniversalBlockType | string, order: number): UniversalBlock {
    const def = this.get(type);
    if (!def) {
      throw new Error(`Unknown block type: ${type}`);
    }
    if (def.create) return def.create(order);
    return {
      id: createId("ublk"),
      type: def.type,
      title: def.label,
      content: "",
      collapsed: false,
      order,
      copilotDismissed: false,
    };
  }
}

export const BlockRegistry = new BlockRegistryImpl();

/** Allow apps to extend the registry at runtime. */
export function registerBlockType(definition: BlockDefinition) {
  BlockRegistry.register(definition);
}
