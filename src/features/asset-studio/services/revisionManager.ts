import type { AssetStudioDocument, StudioRevision } from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * RevisionManager — every save creates a revision; restore / compare / duplicate / branch.
 */
export const revisionManager = {
  createRevision(
    doc: AssetStudioDocument,
    input: {
      author: string;
      summary: string;
      kind?: StudioRevision["kind"];
      branchFromId?: string | null;
    },
  ): { doc: AssetStudioDocument; revision: StudioRevision } {
    const revision: StudioRevision = {
      id: uid("asrev"),
      versionLabel: `s${doc.revisions.length + 1}.0`,
      createdAt: new Date().toISOString(),
      author: input.author,
      summary: input.summary,
      nodes: structuredClone(doc.nodes),
      branchFromId: input.branchFromId ?? doc.currentRevisionId,
      kind: input.kind ?? "save",
    };

    const next: AssetStudioDocument = {
      ...doc,
      revisions: [revision, ...doc.revisions],
      currentRevisionId: revision.id,
      updatedAt: new Date().toISOString(),
    };

    return { doc: next, revision };
  },

  restore(doc: AssetStudioDocument, revisionId: string, author: string): AssetStudioDocument | null {
    const revision = doc.revisions.find((r) => r.id === revisionId);
    if (!revision) return null;

    const restored: AssetStudioDocument = {
      ...doc,
      nodes: structuredClone(revision.nodes),
      selectedNodeId: revision.nodes[0]?.id ?? null,
      updatedAt: new Date().toISOString(),
    };

    return this.createRevision(restored, {
      author,
      summary: `Restored ${revision.versionLabel}`,
      kind: "restore",
      branchFromId: revision.id,
    }).doc;
  },

  duplicate(doc: AssetStudioDocument, author: string): AssetStudioDocument {
    return this.createRevision(doc, {
      author,
      summary: "Duplicated current studio state",
      kind: "duplicate",
    }).doc;
  },

  branch(doc: AssetStudioDocument, author: string, name: string): AssetStudioDocument {
    return this.createRevision(doc, {
      author,
      summary: `Branch: ${name}`,
      kind: "branch",
    }).doc;
  },

  compare(
    doc: AssetStudioDocument,
    leftId: string,
    rightId: string,
  ): Array<{ nodeId: string; title: string; before: string; after: string }> {
    const left = doc.revisions.find((r) => r.id === leftId);
    const right = doc.revisions.find((r) => r.id === rightId);
    if (!left || !right) return [];

    const titles = new Map(
      [...left.nodes, ...right.nodes].map((n) => [n.id, n.title]),
    );
    const leftMap = new Map(left.nodes.map((n) => [n.id, n.body]));
    const rightMap = new Map(right.nodes.map((n) => [n.id, n.body]));
    const ids = new Set([...leftMap.keys(), ...rightMap.keys()]);

    const diffs: Array<{
      nodeId: string;
      title: string;
      before: string;
      after: string;
    }> = [];

    for (const id of ids) {
      const before = leftMap.get(id) ?? "";
      const after = rightMap.get(id) ?? "";
      if (before !== after) {
        diffs.push({
          nodeId: id,
          title: titles.get(id) ?? id,
          before,
          after,
        });
      }
    }
    return diffs;
  },
};
