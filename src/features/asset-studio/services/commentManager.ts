import type { AssetStudioDocument, StudioComment } from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * CommentManager — inline comments, resolve, teacher notes.
 * Collaboration-ready (author field preserved).
 */
export const commentManager = {
  add(
    doc: AssetStudioDocument,
    input: { nodeId: string; body: string; author: string },
  ): AssetStudioDocument {
    const comment: StudioComment = {
      id: uid("cmt"),
      nodeId: input.nodeId,
      body: input.body.trim(),
      author: input.author,
      status: "open",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    return {
      ...doc,
      comments: [comment, ...doc.comments],
      updatedAt: new Date().toISOString(),
    };
  },

  resolve(doc: AssetStudioDocument, commentId: string): AssetStudioDocument {
    return {
      ...doc,
      comments: doc.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              status: "resolved" as const,
              resolvedAt: new Date().toISOString(),
            }
          : c,
      ),
      updatedAt: new Date().toISOString(),
    };
  },

  forNode(doc: AssetStudioDocument, nodeId: string): StudioComment[] {
    return doc.comments.filter((c) => c.nodeId === nodeId);
  },
};
