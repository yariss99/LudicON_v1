import {
  createSeedEvidence,
  createSeedLearners,
  createSeedObservations,
  createSeedPortfolio,
  createSeedTimeline,
} from "./seed";
import type {
  DifferentiationSuggestion,
  LearningEvidence,
  LearnerAlias,
  LearnerPortfolioItem,
  ProgressTimelinePoint,
  TeacherObservation,
} from "./types";

const KEY = "prima.sli.state.v1";

type SliState = {
  learners: LearnerAlias[];
  evidence: LearningEvidence[];
  observations: TeacherObservation[];
  portfolio: LearnerPortfolioItem[];
  timeline: ProgressTimelinePoint[];
  suggestions: DifferentiationSuggestion[];
  auditLog: Array<{ at: string; action: string; detail: string }>;
  seeded: boolean;
};

let memory: SliState | null = null;

function defaultState(): SliState {
  return {
    learners: createSeedLearners(),
    evidence: createSeedEvidence(),
    observations: createSeedObservations(),
    portfolio: createSeedPortfolio(),
    timeline: createSeedTimeline(),
    suggestions: [],
    auditLog: [],
    seeded: true,
  };
}

function read(): SliState {
  if (memory) return memory;
  if (typeof localStorage === "undefined") {
    memory = defaultState();
    return memory;
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      memory = defaultState();
      persist(memory);
      return memory;
    }
    memory = JSON.parse(raw) as SliState;
    return memory;
  } catch {
    memory = defaultState();
    return memory;
  }
}

function persist(state: SliState): void {
  memory = state;
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export const sliStore = {
  getState(): SliState {
    return read();
  },

  resetSeed(): void {
    memory = defaultState();
    persist(memory);
  },

  clear(): void {
    memory = {
      learners: [],
      evidence: [],
      observations: [],
      portfolio: [],
      timeline: [],
      suggestions: [],
      auditLog: [],
      seeded: false,
    };
    if (typeof localStorage !== "undefined") localStorage.removeItem(KEY);
  },

  listLearners(): LearnerAlias[] {
    return [...read().learners];
  },

  listEvidence(): LearningEvidence[] {
    return [...read().evidence];
  },

  listObservations(): TeacherObservation[] {
    return [...read().observations];
  },

  addObservation(obs: TeacherObservation): void {
    const state = read();
    state.observations.unshift(obs);
    state.auditLog.unshift({
      at: new Date().toISOString(),
      action: "observation_added",
      detail: obs.learnerId,
    });
    persist(state);
  },

  updateObservation(id: string, note: string): void {
    const state = read();
    state.observations = state.observations.map((o) =>
      o.id === id ? { ...o, note } : o,
    );
    persist(state);
  },

  listPortfolio(): LearnerPortfolioItem[] {
    return [...read().portfolio];
  },

  listTimeline(): ProgressTimelinePoint[] {
    return [...read().timeline];
  },

  listSuggestions(): DifferentiationSuggestion[] {
    return [...read().suggestions];
  },

  saveSuggestions(suggestions: DifferentiationSuggestion[]): void {
    const state = read();
    state.suggestions = suggestions;
    persist(state);
  },

  audit(action: string, detail: string): void {
    const state = read();
    state.auditLog.unshift({
      at: new Date().toISOString(),
      action,
      detail,
    });
    persist(state);
  },

  listAudit() {
    return [...read().auditLog];
  },
};
