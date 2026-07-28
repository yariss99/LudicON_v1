import { buildClassDashboard } from "./analyze";
import { SLI_SEED_META } from "./seed";
import { sliStore } from "./store";
import type {
  DifferentiationSuggestion,
  SuggestionApproval,
  TeacherObservation,
} from "./types";

export const SLI_SCHEMA_VERSION = "1.0.0";

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function ensureSeeded(): void {
  const state = sliStore.getState();
  if (!state.seeded || state.learners.length === 0) {
    sliStore.resetSeed();
  }
}

export function getClassDashboard(classId = SLI_SEED_META.classId) {
  ensureSeeded();
  sliStore.audit("dashboard_view", classId);
  const result = buildClassDashboard(
    classId,
    sliStore.listLearners(),
    sliStore.listEvidence(),
    sliStore.listObservations(),
  );

  // Persist freshly derived pending suggestions if store empty
  if (sliStore.listSuggestions().length === 0) {
    sliStore.saveSuggestions(result.suggestions);
  } else {
    result.suggestions = sliStore.listSuggestions();
  }

  return result;
}

export function listProfiles(classId = SLI_SEED_META.classId) {
  return getClassDashboard(classId).profiles;
}

export function getProfile(learnerId: string) {
  sliStore.audit("profile_view", learnerId);
  return listProfiles().find((p) => p.learnerId === learnerId) ?? null;
}

export function addObservation(input: {
  learnerId: string;
  note: string;
  tags?: string[];
}): TeacherObservation {
  ensureSeeded();
  const obs: TeacherObservation = {
    id: uid("obs"),
    learnerId: input.learnerId,
    note: input.note.trim(),
    recordedAt: new Date().toISOString(),
    tags: input.tags ?? [],
    editable: true,
  };
  sliStore.addObservation(obs);
  return obs;
}

export function updateObservation(id: string, note: string): void {
  sliStore.updateObservation(id, note);
  sliStore.audit("observation_updated", id);
}

export function resolveSuggestion(
  suggestionId: string,
  status: Exclude<SuggestionApproval, "pending">,
): DifferentiationSuggestion | null {
  const all = sliStore.listSuggestions();
  const next = all.map((s) =>
    s.id === suggestionId ? { ...s, status } : s,
  );
  sliStore.saveSuggestions(next);
  sliStore.audit("suggestion_" + status, suggestionId);
  return next.find((s) => s.id === suggestionId) ?? null;
}

export function listPortfolio(learnerId?: string) {
  ensureSeeded();
  const items = sliStore.listPortfolio();
  return learnerId
    ? items.filter((i) => i.learnerId === learnerId)
    : items;
}

export function progressTimeline() {
  ensureSeeded();
  return sliStore.listTimeline();
}

export function learningMap(classId = SLI_SEED_META.classId) {
  const { dashboard } = getClassDashboard(classId);
  return {
    competencies: dashboard.competencies.map((c) => ({
      ...c,
      objectives: dashboard.objectives.filter((o) =>
        // MVP link: measure competency ↔ measure objective naming
        c.competencyId.includes("measure")
          ? o.objectiveId.includes("measure")
          : o.objectiveId.includes("equiv"),
      ),
    })),
    misconceptions: dashboard.misconceptions,
  };
}

export function pieHandoffForClass(classId = SLI_SEED_META.classId) {
  return getClassDashboard(classId).pieHandoff;
}

export const studentLearningEngine = {
  getClassDashboard,
  listProfiles,
  getProfile,
  addObservation,
  updateObservation,
  resolveSuggestion,
  listPortfolio,
  progressTimeline,
  learningMap,
  pieHandoffForClass,
  listObservations: () => {
    ensureSeeded();
    return sliStore.listObservations();
  },
  listAudit: () => sliStore.listAudit(),
  resetSeed: () => sliStore.resetSeed(),
};
