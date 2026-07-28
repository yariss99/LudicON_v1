import { createSeedKnowledge } from "./seed";
import type {
  KnowledgeCollection,
  KnowledgeEdge,
  KnowledgeNode,
} from "./types";

const KEY = "prima.khpm.graph.v1";

type GraphState = {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  collections: KnowledgeCollection[];
  seeded: boolean;
};

let memory: GraphState | null = null;

function defaultState(): GraphState {
  const seed = createSeedKnowledge();
  return {
    nodes: seed.nodes,
    edges: seed.edges,
    collections: seed.collections,
    seeded: true,
  };
}

function read(): GraphState {
  if (memory) return memory;
  if (typeof localStorage === "undefined") {
    memory = defaultState();
    return memory;
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      memory = defaultState();
      write(memory);
      return memory;
    }
    memory = JSON.parse(raw) as GraphState;
    return memory;
  } catch {
    memory = defaultState();
    return memory;
  }
}

function write(state: GraphState): void {
  memory = state;
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export const khpmStore = {
  getState(): GraphState {
    return read();
  },

  listNodes(): KnowledgeNode[] {
    return [...read().nodes];
  },

  getNode(id: string): KnowledgeNode | undefined {
    return read().nodes.find((n) => n.id === id);
  },

  upsertNode(node: KnowledgeNode): void {
    const state = read();
    const nodes = state.nodes.filter((n) => n.id !== node.id);
    nodes.unshift(node);
    write({ ...state, nodes });
  },

  listEdges(): KnowledgeEdge[] {
    return [...read().edges];
  },

  upsertEdge(edge: KnowledgeEdge): void {
    const state = read();
    const edges = state.edges.filter((e) => e.id !== edge.id);
    edges.push(edge);
    write({ ...state, edges });
  },

  listCollections(): KnowledgeCollection[] {
    return [...read().collections];
  },

  upsertCollection(collection: KnowledgeCollection): void {
    const state = read();
    const collections = state.collections.filter((c) => c.id !== collection.id);
    collections.unshift(collection);
    write({ ...state, collections });
  },

  resetSeed(): void {
    memory = defaultState();
    write(memory);
  },

  clear(): void {
    memory = { nodes: [], edges: [], collections: [], seeded: false };
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(KEY);
    }
  },
};
