import type { ProjectProgress } from "../types";
import {
  buildWorkspaceInventory,
  type WorkspaceResourceItem,
} from "./workspaceInventory";

/**
 * Completion rules for Dynamic Project Workspace.
 * Each rule contributes weight when satisfied; total = 100.
 */
export const PROGRESS_RULES = [
  {
    id: "has_lesson",
    label: "At least one lesson",
    weight: 25,
    test: (items: WorkspaceResourceItem[]) =>
      items.some((i) => i.kind === "lesson"),
  },
  {
    id: "has_worksheet",
    label: "At least one worksheet",
    weight: 20,
    test: (items: WorkspaceResourceItem[]) =>
      items.some((i) => i.kind === "worksheet"),
  },
  {
    id: "has_assessment",
    label: "At least one assessment",
    weight: 20,
    test: (items: WorkspaceResourceItem[]) =>
      items.some((i) => i.kind === "assessment"),
  },
  {
    id: "has_presentation",
    label: "At least one presentation",
    weight: 15,
    test: (items: WorkspaceResourceItem[]) =>
      items.some((i) => i.kind === "presentation"),
  },
  {
    id: "has_game",
    label: "At least one game",
    weight: 10,
    test: (items: WorkspaceResourceItem[]) =>
      items.some((i) => i.kind === "game"),
  },
  {
    id: "has_story",
    label: "At least one story",
    weight: 10,
    test: (items: WorkspaceResourceItem[]) =>
      items.some((i) => i.kind === "story"),
  },
] as const;

export type DynamicProgress = ProjectProgress & {
  readonly ruleResults: readonly {
    id: string;
    label: string;
    weight: number;
    met: boolean;
  }[];
};

export function computeDynamicProgress(
  projectId: string,
  inventory?: WorkspaceResourceItem[],
): DynamicProgress {
  const items = inventory ?? buildWorkspaceInventory(projectId);
  const ruleResults = PROGRESS_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    weight: rule.weight,
    met: rule.test(items),
  }));
  const earned = ruleResults
    .filter((r) => r.met)
    .reduce((acc, r) => acc + r.weight, 0);
  const kindsPresent = new Set(items.map((i) => i.kind)).size;

  return {
    totalArtifacts: items.length,
    readyCount: kindsPresent,
    draftCount: Math.max(0, 6 - kindsPresent),
    percentComplete: earned,
    ruleResults,
  };
}
