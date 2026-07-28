import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { DecisionSession } from "../../../engines/decision";
import { useProjects } from "../../../context/ProjectContext";
import { parseStudioIntent } from "../../studio/intentParser";
import { reviewOrchestrator } from "../services/reviewOrchestrator";
import { blueprintReviewRepository } from "../services/blueprintReviewRepository";
import type {
  BlueprintReviewDocument,
  ComparisonResult,
  ReviewUiState,
  SectionReviewView,
} from "../types";

const HANDOFF_KEY = "prima.blueprint.review.handoff";

export function stashReviewHandoff(session: DecisionSession): void {
  sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(session));
}

function readHandoff(): DecisionSession | null {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(HANDOFF_KEY);
    return JSON.parse(raw) as DecisionSession;
  } catch {
    return null;
  }
}

export function useBlueprintReview() {
  const { blueprintId = "" } = useParams();
  const navigate = useNavigate();
  const { createStudioProject } = useProjects();

  const [doc, setDoc] = useState<BlueprintReviewDocument | null>(null);
  const [uiState, setUiState] = useState<ReviewUiState>("loading");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    "learning_context",
  );
  const [improveInput, setImproveInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [approving, setApproving] = useState(false);

  const sections: SectionReviewView[] = useMemo(
    () => (doc ? reviewOrchestrator.getSectionViews(doc) : []),
    [doc],
  );

  const load = useCallback(async () => {
    setUiState("loading");
    setError(null);

    try {
      if (blueprintId && blueprintId !== "new") {
        const existing = reviewOrchestrator.load(blueprintId);
        if (!existing) {
          setDoc(null);
          setUiState("empty");
          return;
        }
        const validated = await reviewOrchestrator.runValidation(existing);
        const saved = blueprintReviewRepository.save(validated);
        setDoc(saved);
        setUiState("ready");
        return;
      }

      const handoff = readHandoff();
      if (!handoff) {
        setDoc(null);
        setUiState("empty");
        return;
      }

      const created =
        await reviewOrchestrator.createFromDecisionSession(handoff);
      setDoc(created);
      setUiState("ready");
      navigate(`/blueprint/review/${created.id}`, { replace: true });
    } catch {
      setError("Nu am putut deschide verificarea. Munca ta este păstrată.");
      setUiState("error");
    }
  }, [blueprintId, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const scrollToSection = useCallback((id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(`blueprint-section-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const runValidation = useCallback(async () => {
    if (!doc) return;
    setUiState("validating");
    try {
      const next = await reviewOrchestrator.runValidation(doc);
      const saved = blueprintReviewRepository.save(next);
      setDoc(saved);
      setUiState("ready");
    } catch {
      setError("Mai verificăm împreună un aspect al lecției. Proiectul e păstrat.");
      setUiState("error");
    }
  }, [doc]);

  const requestImprovement = useCallback(async () => {
    if (!doc || !improveInput.trim()) return;
    setUiState("improving");
    setError(null);
    try {
      const next = await reviewOrchestrator.requestImprovement(
        doc,
        improveInput.trim(),
      );
      setDoc(next);
      setImproveInput("");
      setUiState("ready");
    } catch {
      setError("Cererea de îmbunătățire nu a reușit. Proiectul e păstrat — încearcă din nou.");
      setUiState("error");
    }
  }, [doc, improveInput]);

  const approve = useCallback(async () => {
    if (!doc) return;
    setApproving(true);
    setError(null);
    try {
      const result = reviewOrchestrator.approve(doc);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      // Create / attach Living Workspace project for Generation
      let projectId = result.projectId;
      if (!projectId) {
        const ctx = result.blueprint.learningContext;
        const intent = parseStudioIntent(
          [
            ctx.subject && `Subject: ${ctx.subject}`,
            ctx.grade && `Grade: ${ctx.grade}`,
            ctx.topic && `Topic: ${ctx.topic}`,
            result.blueprint.objectives[0] &&
              `Objective: ${result.blueprint.objectives[0]}`,
          ]
            .filter(Boolean)
            .join(". ") || result.title,
        );
        if (ctx.subject) intent.subject = ctx.subject;
        if (ctx.grade) intent.grade = ctx.grade;
        if (ctx.topic) {
          intent.title = `${ctx.topic[0]?.toUpperCase() ?? ""}${ctx.topic.slice(1)}`;
        }
        const project = createStudioProject(intent);
        projectId = project.id;
      }

      const withProject = blueprintReviewRepository.save({
        ...result,
        projectId,
        generationUnlocked: true,
      });
      setDoc(withProject);
    } catch {
      setError("Confirmarea nu a reușit. Proiectul e păstrat — încearcă din nou.");
    } finally {
      setApproving(false);
    }
  }, [createStudioProject, doc]);

  const restoreVersion = useCallback(
    async (versionId: string) => {
      if (!doc) return;
      const result = await reviewOrchestrator.restoreAndValidate(doc, versionId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setDoc(result);
    },
    [doc],
  );

  const compareVersions = useCallback(
    (leftId: string, rightId: string) => {
      if (!doc) return;
      setComparison(reviewOrchestrator.compare(doc, leftId, rightId));
      setUiState("comparing");
    },
    [doc],
  );

  const openGeneration = useCallback(() => {
    if (!doc?.generationUnlocked) return;
    navigate(`/generation/${doc.id}`);
  }, [doc, navigate]);

  return {
    doc,
    uiState,
    sections,
    activeSectionId,
    improveInput,
    setImproveInput,
    error,
    comparison,
    approving,
    scrollToSection,
    runValidation,
    requestImprovement,
    approve,
    restoreVersion,
    compareVersions,
    closeComparison: () => {
      setComparison(null);
      setUiState("ready");
    },
    openGeneration,
    retryLoad: load,
    clearError: () => setError(null),
  };
}
