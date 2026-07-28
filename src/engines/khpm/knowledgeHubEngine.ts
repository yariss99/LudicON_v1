import {
  neighbors,
  pathLabels,
  suggestSemanticLinks,
  traverse,
} from "./graph";
import {
  detectPatterns,
  knowledgeTimeline,
  recommendForContext,
} from "./recommendations";
import { parseNaturalLanguageQuery, searchKnowledge } from "./search";
import { khpmStore } from "./store";
import type {
  KnowledgeCollection,
  KnowledgeEdge,
  KnowledgeNode,
  KnowledgeSearchQuery,
} from "./types";

export const KHPM_SCHEMA_VERSION = "1.0.0";

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function ensureSeeded(): void {
  const state = khpmStore.getState();
  if (!state.seeded || state.nodes.length === 0) {
    khpmStore.resetSeed();
  }
}

export function search(query: KnowledgeSearchQuery | string) {
  ensureSeeded();
  const structured =
    typeof query === "string" ? parseNaturalLanguageQuery(query) : query;
  return searchKnowledge(khpmStore.listNodes(), structured);
}

export function getNode(id: string) {
  ensureSeeded();
  return khpmStore.getNode(id);
}

export function graphPathFrom(startId: string, maxDepth = 5) {
  ensureSeeded();
  const ids = traverse(startId, khpmStore.listEdges(), maxDepth);
  return {
    nodeIds: ids,
    labels: pathLabels(ids, khpmStore.listNodes()),
    neighbors: neighbors(startId, khpmStore.listEdges()),
  };
}

export function listCollections() {
  ensureSeeded();
  return khpmStore.listCollections();
}

export function addToCollection(collectionId: string, nodeId: string) {
  const collection = khpmStore.listCollections().find((c) => c.id === collectionId);
  if (!collection) return null;
  if (collection.nodeIds.includes(nodeId)) return collection;
  const next: KnowledgeCollection = {
    ...collection,
    nodeIds: [...collection.nodeIds, nodeId],
    updatedAt: new Date().toISOString(),
  };
  khpmStore.upsertCollection(next);
  return next;
}

export function createCollection(input: {
  title: string;
  description?: string;
  autoSuggest?: boolean;
}): KnowledgeCollection {
  const now = new Date().toISOString();
  const collection: KnowledgeCollection = {
    id: uid("col"),
    title: input.title,
    description: input.description ?? "",
    nodeIds: [],
    autoSuggest: input.autoSuggest ?? true,
    visibility: "private",
    createdAt: now,
    updatedAt: now,
  };
  khpmStore.upsertCollection(collection);
  return collection;
}

export function recommend(context: {
  subject?: string;
  grade?: string;
  topicText?: string;
  strategy?: string;
}) {
  ensureSeeded();
  return recommendForContext(
    khpmStore.listNodes(),
    khpmStore.listEdges(),
    context,
  );
}

export function patterns() {
  ensureSeeded();
  return detectPatterns(khpmStore.listNodes());
}

export function timeline() {
  ensureSeeded();
  return knowledgeTimeline(khpmStore.listNodes());
}

export function pendingLinkSuggestions() {
  ensureSeeded();
  const existing = khpmStore.listEdges();
  const fresh = suggestSemanticLinks(khpmStore.listNodes(), existing);
  for (const edge of fresh) {
    if (!existing.some((e) => e.id === edge.id)) {
      khpmStore.upsertEdge(edge);
    }
  }
  return khpmStore.listEdges().filter((e) => e.status === "pending");
}

export function resolveLinkSuggestion(
  edgeId: string,
  decision: "approved" | "rejected",
): KnowledgeEdge | null {
  const edge = khpmStore.listEdges().find((e) => e.id === edgeId);
  if (!edge) return null;
  const next: KnowledgeEdge = {
    ...edge,
    status: decision,
    kind: decision === "approved" ? "similar_to" : edge.kind,
  };
  khpmStore.upsertEdge(next);
  return next;
}

export function upsertProfessionalNote(input: {
  title: string;
  summary: string;
  tags?: string[];
}): KnowledgeNode {
  const now = new Date().toISOString();
  const node: KnowledgeNode = {
    id: uid("note"),
    schemaVersion: KHPM_SCHEMA_VERSION,
    kind: "professional_note",
    title: input.title,
    summary: input.summary,
    tags: input.tags ?? ["notă"],
    visibility: "private",
    createdAt: now,
    updatedAt: now,
  };
  khpmStore.upsertNode(node);
  return node;
}

export function ingestReflectionStub(input: {
  reflectionId: string;
  title: string;
  summary: string;
  lessonProjectId?: string;
  subject?: string;
  grade?: string;
}): KnowledgeNode {
  const now = new Date().toISOString();
  const node: KnowledgeNode = {
    id: `kn_refl_${input.reflectionId}`,
    schemaVersion: KHPM_SCHEMA_VERSION,
    kind: "reflection_note",
    title: input.title,
    summary: input.summary,
    reflectionId: input.reflectionId,
    lessonProjectId: input.lessonProjectId,
    subject: input.subject,
    grade: input.grade,
    tags: ["reflecție"],
    visibility: "private",
    createdAt: now,
    updatedAt: now,
  };
  khpmStore.upsertNode(node);
  if (input.lessonProjectId) {
    const lesson = khpmStore
      .listNodes()
      .find((n) => n.lessonProjectId === input.lessonProjectId);
    if (lesson) {
      khpmStore.upsertEdge({
        id: uid("e"),
        kind: "related_reflection",
        fromId: node.id,
        toId: lesson.id,
        status: "active",
        createdAt: now,
      });
    }
  }
  return node;
}

export function listNodesByKind(kind: KnowledgeNode["kind"]) {
  ensureSeeded();
  return khpmStore.listNodes().filter((n) => n.kind === kind);
}

export const knowledgeHubEngine = {
  search,
  getNode,
  graphPathFrom,
  listCollections,
  addToCollection,
  createCollection,
  recommend,
  patterns,
  timeline,
  pendingLinkSuggestions,
  resolveLinkSuggestion,
  upsertProfessionalNote,
  ingestReflectionStub,
  listNodesByKind,
  listNodes: () => {
    ensureSeeded();
    return khpmStore.listNodes();
  },
  resetSeed: () => khpmStore.resetSeed(),
};
