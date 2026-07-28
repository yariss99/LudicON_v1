import { teacherProfile } from "../../../data/workspaceData";
import type {
  AlignmentDecision,
  AssetStudioDocument,
  AssetStudioOpenInput,
  ExportFormat,
  StructureItem,
} from "../types";
import { buildStudioNodes } from "./structureBuilder";
import { checkAlignment, nodeAlignment } from "./alignmentService";
import { revisionManager } from "./revisionManager";
import { commentManager } from "./commentManager";
import { exportService } from "./exportService";
import { proposeSmartCommand } from "./smartCommands";
import { assetSynchronizer } from "./assetSynchronizer";
import { studioRepository } from "./studioRepository";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Asset Studio orchestrator — editing while preserving Blueprint integrity.
 */
export const studioOrchestrator = {
  open(input: AssetStudioOpenInput): AssetStudioDocument {
    const existing = studioRepository.getByWorkspaceAsset(
      input.workspaceId,
      input.assetTypeId,
    );
    if (existing) {
      // Refresh Blueprint snapshot linkage without wiping teacher edits
      const linked = assetSynchronizer.preserveBlueprintLink(existing, {
        blueprintSnapshot: structuredClone(input.blueprintSnapshot),
        blueprintVersionId: input.blueprintVersionId,
        blueprintVersionLabel: input.blueprintVersionLabel,
        relatedAssetTypeIds: input.relatedAssetTypeIds,
        title: input.title,
      });
      const alignment = checkAlignment(linked.nodes, linked.blueprintSnapshot);
      return studioRepository.save({ ...linked, alignment });
    }

    const nodes = buildStudioNodes(input.assetTypeId, input.blocks);
    const alignment = checkAlignment(nodes, input.blueprintSnapshot);
    const revisionId = uid("asrev");

    const doc: AssetStudioDocument = {
      id: uid("astudio"),
      workspaceId: input.workspaceId,
      blueprintId: input.blueprintId,
      assetTypeId: input.assetTypeId,
      title: input.title,
      blueprintVersionId: input.blueprintVersionId,
      blueprintVersionLabel: input.blueprintVersionLabel,
      blueprintSnapshot: structuredClone(input.blueprintSnapshot),
      nodes,
      selectedNodeId: nodes[0]?.id ?? null,
      revisions: [
        {
          id: revisionId,
          versionLabel: "s1.0",
          createdAt: new Date().toISOString(),
          author: input.author,
          summary: "Opened from Generation Workspace",
          nodes: structuredClone(nodes),
          branchFromId: null,
          kind: "save",
        },
      ],
      currentRevisionId: revisionId,
      comments: [],
      alignment,
      pendingProposal: null,
      relatedAssetTypeIds: input.relatedAssetTypeIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return studioRepository.save(doc);
  },

  structure(doc: AssetStudioDocument): StructureItem[] {
    return doc.nodes
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((node) => ({
        id: node.id,
        title: node.title,
        depth: node.parentId ? 1 : 0,
        alignment: nodeAlignment(doc.alignment, node.id),
      }));
  },

  selectNode(doc: AssetStudioDocument, nodeId: string): AssetStudioDocument {
    return studioRepository.save(
      assetSynchronizer.preserveBlueprintLink(doc, { selectedNodeId: nodeId }),
    );
  },

  /**
   * Edit node body — live alignment check. Blueprint link always preserved.
   */
  updateNodeBody(
    doc: AssetStudioDocument,
    nodeId: string,
    body: string,
  ): AssetStudioDocument {
    const nodes = doc.nodes.map((node) =>
      node.id === nodeId ? { ...node, body } : node,
    );
    const alignment = checkAlignment(nodes, doc.blueprintSnapshot);
    return studioRepository.save(
      assetSynchronizer.preserveBlueprintLink(doc, { nodes, alignment }),
    );
  },

  updateNodeKind(
    doc: AssetStudioDocument,
    nodeId: string,
    kind: AssetStudioDocument["nodes"][number]["kind"],
  ): AssetStudioDocument {
    const nodes = doc.nodes.map((node) =>
      node.id === nodeId ? { ...node, kind } : node,
    );
    return studioRepository.save(
      assetSynchronizer.preserveBlueprintLink(doc, { nodes }),
    );
  },

  saveRevision(
    doc: AssetStudioDocument,
    summary = "Teacher save",
  ): AssetStudioDocument {
    const { doc: next } = revisionManager.createRevision(doc, {
      author: teacherProfile.fullName,
      summary,
      kind: "save",
    });
    return studioRepository.save(next);
  },

  restoreRevision(
    doc: AssetStudioDocument,
    revisionId: string,
  ): AssetStudioDocument | { error: string } {
    const restored = revisionManager.restore(
      doc,
      revisionId,
      teacherProfile.fullName,
    );
    if (!restored) return { error: "Versiunea nu a fost găsită." };
    const alignment = checkAlignment(
      restored.nodes,
      restored.blueprintSnapshot,
    );
    return studioRepository.save({ ...restored, alignment });
  },

  duplicate(doc: AssetStudioDocument): AssetStudioDocument {
    return studioRepository.save(
      revisionManager.duplicate(doc, teacherProfile.fullName),
    );
  },

  branch(doc: AssetStudioDocument, name: string): AssetStudioDocument {
    return studioRepository.save(
      revisionManager.branch(doc, teacherProfile.fullName, name),
    );
  },

  compare(
    doc: AssetStudioDocument,
    leftId: string,
    rightId: string,
  ) {
    return revisionManager.compare(doc, leftId, rightId);
  },

  addComment(
    doc: AssetStudioDocument,
    nodeId: string,
    body: string,
  ): AssetStudioDocument {
    return studioRepository.save(
      commentManager.add(doc, {
        nodeId,
        body,
        author: teacherProfile.fullName,
      }),
    );
  },

  resolveComment(
    doc: AssetStudioDocument,
    commentId: string,
  ): AssetStudioDocument {
    return studioRepository.save(commentManager.resolve(doc, commentId));
  },

  requestSmartCommand(
    doc: AssetStudioDocument,
    command: string,
  ): AssetStudioDocument | { error: string } {
    const node = doc.nodes.find((n) => n.id === doc.selectedNodeId);
    if (!node) return { error: "Select a section first." };
    const proposal = proposeSmartCommand(command, node);
    return studioRepository.save(
      assetSynchronizer.preserveBlueprintLink(doc, {
        pendingProposal: proposal,
      }),
    );
  },

  decideSmartCommand(
    doc: AssetStudioDocument,
    approve: boolean,
  ): AssetStudioDocument {
    const proposal = doc.pendingProposal;
    if (!proposal) return doc;

    if (!approve) {
      return studioRepository.save(
        assetSynchronizer.preserveBlueprintLink(doc, {
          pendingProposal: { ...proposal, status: "rejected" },
        }),
      );
    }

    const nodes = doc.nodes.map((node) =>
      node.id === proposal.nodeId
        ? { ...node, body: proposal.proposedBody }
        : node,
    );
    const alignment = checkAlignment(nodes, doc.blueprintSnapshot);
    let next = assetSynchronizer.preserveBlueprintLink(doc, {
      nodes,
      alignment,
      pendingProposal: { ...proposal, status: "approved" },
    });
    next = revisionManager.createRevision(next, {
      author: teacherProfile.fullName,
      summary: `Approved smart command: ${proposal.summary}`,
    }).doc;
    return studioRepository.save(next);
  },

  resolveAlignment(
    doc: AssetStudioDocument,
    issueId: string,
    decision: AlignmentDecision,
  ): AssetStudioDocument | { blueprintReview: true; blueprintId: string } {
    const issue = doc.alignment?.issues.find((i) => i.id === issueId);
    if (!issue) return doc;

    if (decision === "update_blueprint") {
      return { blueprintReview: true, blueprintId: doc.blueprintId };
    }

    if (decision === "revise") {
      return studioRepository.save(
        assetSynchronizer.preserveBlueprintLink(doc, {
          selectedNodeId: issue.nodeId,
        }),
      );
    }

    // keep — dismiss this issue from current report
    const alignment = doc.alignment
      ? {
          ...doc.alignment,
          issues: doc.alignment.issues.filter((i) => i.id !== issueId),
          status:
            doc.alignment.issues.filter((i) => i.id !== issueId).length === 0
              ? ("aligned" as const)
              : doc.alignment.status,
        }
      : doc.alignment;

    return studioRepository.save(
      assetSynchronizer.preserveBlueprintLink(doc, { alignment }),
    );
  },

  export(doc: AssetStudioDocument, format: ExportFormat) {
    return exportService.export(doc, format);
  },

  load(id: string): AssetStudioDocument | null {
    return studioRepository.getById(id);
  },
};
