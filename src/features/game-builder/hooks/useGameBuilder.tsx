import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useProjects } from "../../../context/ProjectContext";
import type { Project } from "../../../types/project";
import { AUTOSAVE_DELAY_MS } from "../constants";
import {
  createBlankChallenge,
  createBlankLevel,
  createBlankQuestion,
  createBlankReward,
  gameBuilderRepository,
} from "../services/gameBuilderRepository";
import {
  applyGameAiAction,
  seedGameFromBestSource,
  syncGameToWorkspace,
  type GameCorePromptPackage,
} from "../services/gameCoreBridge";
import {
  downloadExport,
  exportGame,
  type GameExportResult,
} from "../services/gameExport";
import { validateGame } from "../services/gameValidation";
import type {
  ChallengeType,
  GameAiActionId,
  GameBuilderPanel,
  GameChallenge,
  GameDocument,
  GameExportFormat,
  GameMechanicId,
  GameQuestion,
  GameSectionId,
  GameSourceKind,
  GameVersion,
} from "../types";

type SimState = {
  readonly levelIndex: number;
  readonly questionIndex: number;
  readonly score: number;
  readonly lives: number;
  readonly log: readonly string[];
  readonly finished: boolean;
};

type GameBuilderContextValue = {
  readonly project: Project;
  readonly game: GameDocument;
  readonly versions: readonly GameVersion[];
  readonly sectionId: GameSectionId;
  readonly setSectionId: (id: GameSectionId) => void;
  readonly panel: GameBuilderPanel;
  readonly setPanel: (panel: GameBuilderPanel) => void;
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly lastSavedAt: string | null;
  readonly lastPrompt: GameCorePromptPackage | null;
  readonly sim: SimState;
  readonly patchGame: (
    updater: (prev: GameDocument) => GameDocument,
    options?: { immediate?: boolean; note?: string },
  ) => void;
  readonly saveNow: (note?: string) => void;
  readonly runValidation: () => void;
  readonly publish: () => { ok: boolean; error?: string };
  readonly archive: () => void;
  readonly duplicate: () => GameDocument;
  readonly runAi: (action: GameAiActionId) => void;
  readonly setSourceKind: (kind: GameSourceKind) => void;
  readonly toggleMechanic: (id: GameMechanicId) => void;
  readonly addLevel: () => void;
  readonly addChallenge: (type: ChallengeType) => void;
  readonly addQuestion: () => void;
  readonly updateQuestion: (id: string, patch: Partial<GameQuestion>) => void;
  readonly updateChallenge: (id: string, patch: Partial<GameChallenge>) => void;
  readonly addReward: () => void;
  readonly restoreVersion: (versionId: string) => void;
  readonly exportFormat: (format: GameExportFormat) => GameExportResult;
  readonly resetSimulation: () => void;
  readonly simAnswer: (choiceIndex: number) => void;
  readonly simNextLevel: () => void;
};

const GameBuilderContext = createContext<GameBuilderContextValue | null>(null);

function persistGame(doc: GameDocument, note: string): GameDocument {
  const artifactId = syncGameToWorkspace(doc);
  const withArtifact =
    doc.workspaceArtifactId === artifactId
      ? doc
      : { ...doc, workspaceArtifactId: artifactId };
  return gameBuilderRepository.save(withArtifact, {
    note,
    actor: "teacher",
  });
}

function initialSim(game: GameDocument): SimState {
  const lives =
    game.mechanics.find((m) => m.id === "lives" && m.enabled)?.value ?? 3;
  return {
    levelIndex: 0,
    questionIndex: 0,
    score: 0,
    lives,
    log: ["Simulare pornită — joacă ca un elev."],
    finished: false,
  };
}

export function GameBuilderProvider({
  projectId,
  gameId,
  children,
}: {
  projectId: string;
  gameId: string;
  children: ReactNode;
}) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [game, setGame] = useState<GameDocument | null>(null);
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [sectionId, setSectionId] = useState<GameSectionId>("general");
  const [panel, setPanel] = useState<GameBuilderPanel>("editor");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<GameCorePromptPackage | null>(
    null,
  );
  const [sim, setSim] = useState<SimState>({
    levelIndex: 0,
    questionIndex: 0,
    score: 0,
    lives: 3,
    log: [],
    finished: false,
  });
  const ref = useRef<GameDocument | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    ref.current = game;
  }, [game]);

  const refreshVersions = useCallback((id: string) => {
    setVersions(gameBuilderRepository.listVersions(id));
  }, []);

  useEffect(() => {
    if (!project) return;
    const existing = gameBuilderRepository.getById(gameId);
    if (!existing || existing.projectId !== project.id || !existing.lessonId) {
      setGame(null);
      return;
    }
    setGame(existing);
    setSim(initialSim(existing));
    refreshVersions(existing.id);
  }, [project, gameId, refreshVersions]);

  const commit = useCallback(
    (doc: GameDocument, note: string) => {
      setSaving(true);
      try {
        const saved = persistGame(doc, note);
        ref.current = saved;
        setGame(saved);
        setDirty(false);
        setLastSavedAt(saved.updatedAt);
        refreshVersions(saved.id);
        return saved;
      } finally {
        setSaving(false);
      }
    },
    [refreshVersions],
  );

  const schedule = useCallback(
    (doc: GameDocument) => {
      ref.current = doc;
      setGame(doc);
      setDirty(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const pending = ref.current;
        if (pending) commit(pending, "autosave");
      }, AUTOSAVE_DELAY_MS);
    },
    [commit],
  );

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const patchGame = useCallback(
    (
      updater: (prev: GameDocument) => GameDocument,
      options?: { immediate?: boolean; note?: string },
    ) => {
      const prev = ref.current;
      if (!prev) return;
      const next = updater(prev);
      if (options?.immediate) {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        commit(next, options.note ?? "save");
        return;
      }
      schedule(next);
    },
    [commit, schedule],
  );

  if (!project || !game) return null;

  const value: GameBuilderContextValue = {
    project,
    game,
    versions,
    sectionId,
    setSectionId,
    panel,
    setPanel,
    dirty,
    saving,
    lastSavedAt,
    lastPrompt,
    sim,
    patchGame,
    saveNow: (note) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      commit(ref.current ?? game, note ?? "manual-save");
    },
    runValidation: () => {
      const current = ref.current ?? game;
      const report = validateGame(current);
      commit(
        {
          ...current,
          validation: report,
          status: report.passed
            ? current.status === "published"
              ? "published"
              : "validated"
            : "draft",
        },
        "validation",
      );
      setPanel("validation");
    },
    publish: () => {
      try {
        const current = ref.current ?? game;
        const report = validateGame(current);
        const validated = commit(
          {
            ...current,
            validation: report,
            status: report.passed ? current.status : "draft",
          },
          "pre-publish-validation",
        );
        if (!report.passed) {
          setPanel("validation");
          return {
            ok: false,
            error: "Validarea a eșuat. Remediază erorile înainte de publicare.",
          };
        }
        const published = gameBuilderRepository.publish(validated.id);
        syncGameToWorkspace(published);
        ref.current = published;
        setGame(published);
        refreshVersions(published.id);
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Publicare eșuată",
        };
      }
    },
    archive: () => {
      const archived = gameBuilderRepository.archive(game.id);
      syncGameToWorkspace(archived);
      ref.current = archived;
      setGame(archived);
      refreshVersions(archived.id);
    },
    duplicate: () => {
      const copy = gameBuilderRepository.duplicate(game.id);
      return persistGame(copy, "duplicate-link");
    },
    runAi: (action) => {
      const current = ref.current ?? game;
      const { game: generated, prompt } = applyGameAiAction({
        project,
        game: current,
        action,
        sectionId,
      });
      setLastPrompt(prompt);
      const saved = commit(generated, `ai:${action}`);
      setSim(initialSim(saved));
      setPanel("ai");
    },
    setSourceKind: (kind) => {
      patchGame((prev) => ({
        ...prev,
        source: { ...prev.source, kind, label: prev.source.label },
      }));
    },
    toggleMechanic: (id) => {
      patchGame((prev) => ({
        ...prev,
        mechanics: prev.mechanics.map((m) =>
          m.id === id ? { ...m, enabled: !m.enabled } : m,
        ),
      }));
    },
    addLevel: () => {
      patchGame(
        (prev) => ({
          ...prev,
          levels: [...prev.levels, createBlankLevel(prev.levels.length)],
        }),
        { immediate: true, note: "add-level" },
      );
    },
    addChallenge: (type) => {
      patchGame(
        (prev) => ({
          ...prev,
          challenges: [
            ...prev.challenges,
            createBlankChallenge(type, prev.challenges.length),
          ],
        }),
        { immediate: true, note: "add-challenge" },
      );
    },
    addQuestion: () => {
      patchGame(
        (prev) => ({
          ...prev,
          questions: [
            ...prev.questions,
            createBlankQuestion(prev.questions.length),
          ],
        }),
        { immediate: true, note: "add-question" },
      );
    },
    updateQuestion: (id, patch) => {
      patchGame((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === id ? { ...q, ...patch } : q,
        ),
      }));
    },
    updateChallenge: (id, patch) => {
      patchGame((prev) => ({
        ...prev,
        challenges: prev.challenges.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      }));
    },
    addReward: () => {
      patchGame(
        (prev) => ({
          ...prev,
          rewards: [...prev.rewards, createBlankReward()],
        }),
        { immediate: true, note: "add-reward" },
      );
    },
    restoreVersion: (versionId) => {
      const restored = gameBuilderRepository.restoreVersion(versionId);
      syncGameToWorkspace(restored);
      ref.current = restored;
      setGame(restored);
      setSim(initialSim(restored));
      refreshVersions(restored.id);
      setPanel("versions");
    },
    exportFormat: (format) => {
      const current = ref.current ?? game;
      const result = exportGame(current, format);
      downloadExport(result);
      setPanel("export");
      return result;
    },
    resetSimulation: () => setSim(initialSim(ref.current ?? game)),
    simAnswer: (choiceIndex) => {
      setSim((prev) => {
        if (prev.finished) return prev;
        const current = ref.current ?? game;
        const q = current.questions[prev.questionIndex];
        if (!q) {
          return {
            ...prev,
            finished: true,
            log: [...prev.log, "Nu mai sunt întrebări — simulare încheiată."],
          };
        }
        const correct = choiceIndex === q.correctIndex;
        const score = prev.score + (correct ? q.points : 0);
        const lives = correct ? prev.lives : Math.max(0, prev.lives - 1);
        const nextIndex = prev.questionIndex + 1;
        const finished =
          lives <= 0 || nextIndex >= current.questions.length;
        return {
          ...prev,
          score,
          lives,
          questionIndex: finished ? prev.questionIndex : nextIndex,
          finished,
          log: [
            ...prev.log,
            correct
              ? `Corect (+${q.points}p)`
              : `Greșit — vieți rămase: ${lives}`,
            finished
              ? lives <= 0
                ? "Simulare eșuată (fără vieți)."
                : `Simulare completă. Scor final: ${score}`
              : "",
          ].filter(Boolean),
        };
      });
    },
    simNextLevel: () => {
      setSim((prev) => {
        const current = ref.current ?? game;
        const next = prev.levelIndex + 1;
        if (next >= current.levels.length) {
          return {
            ...prev,
            finished: true,
            log: [...prev.log, "Toate nivelele au fost parcurse."],
          };
        }
        return {
          ...prev,
          levelIndex: next,
          log: [...prev.log, `Ai avansat la ${current.levels[next]?.title}`],
        };
      });
    },
  };

  return (
    <GameBuilderContext.Provider value={value}>
      {children}
    </GameBuilderContext.Provider>
  );
}

export function useGameBuilder(): GameBuilderContextValue {
  const ctx = useContext(GameBuilderContext);
  if (!ctx) {
    throw new Error("useGameBuilder must be used within GameBuilderProvider");
  }
  return ctx;
}

export function createGameInProject(input: {
  project: Project;
  lessonId: string;
  title?: string;
  kind?: GameDocument["kind"];
  seedFromSource?: boolean;
}): GameDocument {
  const created = gameBuilderRepository.create({
    projectId: input.project.id,
    lessonId: input.lessonId,
    title: input.title,
    subject: input.project.subject,
    grade: input.project.grade,
    kind: input.kind,
  });
  const seeded =
    input.seedFromSource === false
      ? created
      : seedGameFromBestSource(input.project, created);
  return persistGame(seeded, seeded === created ? "link-artifact" : "seed-source");
}
