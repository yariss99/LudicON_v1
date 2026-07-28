import type { AssetTypeId, GeneratedBlock } from "../../generation-workspace/types";
import { STRUCTURE_TEMPLATES } from "../constants";
import type { StudioBlockKind, StudioNode } from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function inferKind(title: string, body: string): StudioBlockKind {
  if (/table|criteria|levels/i.test(title)) return "table";
  if (/visual|image|slide/i.test(title)) return "image";
  if (/list|rules|items/i.test(title)) return "list";
  if (/note|tip|warning|callout/i.test(title) || body.startsWith(">")) {
    return "callout";
  }
  if (/template/i.test(title)) return "template";
  return "text";
}

/**
 * Builds navigable Asset Structure from generated blocks + type templates.
 * Future asset types register templates in STRUCTURE_TEMPLATES automatically.
 */
export function buildStudioNodes(
  assetTypeId: AssetTypeId,
  blocks: GeneratedBlock[],
): StudioNode[] {
  if (blocks.length > 0) {
    return blocks.map((block, index) => ({
      id: block.id || uid("node"),
      title: block.title,
      kind: inferKind(block.title, block.body),
      body: block.body,
      sourceSections: [...block.sourceSections],
      parentId: null,
      order: index,
    }));
  }

  const template = STRUCTURE_TEMPLATES[assetTypeId] ?? ["Section 1"];
  return template.map((title, index) => ({
    id: uid("node"),
    title,
    kind: "text" as const,
    body: "",
    sourceSections: [],
    parentId: null,
    order: index,
  }));
}
