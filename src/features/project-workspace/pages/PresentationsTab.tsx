import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { createPresentationInProject } from "../../presentation-builder/hooks/usePresentationBuilder";
import { presentationBuilderRepository } from "../../presentation-builder/services/presentationBuilderRepository";
import {
  applyPresentationAiAction,
  ensureLessonForProject,
} from "../../presentation-builder/services/presentationCoreBridge";
import {
  PRESENTATION_KINDS,
  SOURCE_KINDS,
} from "../../presentation-builder/constants";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { EmptyState } from "../components/EmptyState";
import type {
  PresentationKind,
  PresentationSourceKind,
} from "../../presentation-builder/types";

/**
 * Project Workspace → Presentations tab.
 * Opens Presentation Builder; decks are seeded from PRIMA sources.
 */
export function PresentationsTab() {
  const { project, refresh } = useProjectWorkspace();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [kind, setKind] = useState<PresentationKind>("lesson");
  const [sourceKind, setSourceKind] =
    useState<PresentationSourceKind>("lesson");
  const [lessonId, setLessonId] = useState("");

  const lessons = useMemo(
    () => lessonBuilderRepository.listByProject(project.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, tick],
  );

  const presentations = useMemo(
    () => presentationBuilderRepository.listByProject(project.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, tick],
  );

  const reload = () => {
    setTick((t) => t + 1);
    refresh();
  };

  const resolveLessonId = () => {
    if (lessonId) return lessonId;
    if (lessons[0]) return lessons[0].id;
    return ensureLessonForProject(project);
  };

  const openBuilder = (id: string) => {
    navigate(`/presentation-builder/${project.id}/${id}`);
  };

  const createFromSource = (aiAction?: "generate_entire" | "summarize_lesson") => {
    const created = createPresentationInProject({
      project,
      lessonId: resolveLessonId(),
      kind,
      seedFromSource: !aiAction,
    });
    if (aiAction) {
      const withSource = {
        ...created,
        kind,
        source: {
          ...created.source,
          kind: sourceKind,
          label:
            SOURCE_KINDS.find((s) => s.id === sourceKind)?.label ??
            created.source.label,
        },
      };
      const { presentation: generated } = applyPresentationAiAction({
        project,
        presentation: withSource,
        action: aiAction,
      });
      presentationBuilderRepository.save(generated, {
        note: `ai:${aiAction}`,
        actor: "ai",
      });
      reload();
      openBuilder(generated.id);
      return;
    }
    reload();
    openBuilder(created.id);
  };

  return (
    <div>
      <div className="pw-toolbar">
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            Prezentări
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            Presentation Builder — diapozitive din lecții, povești, fișe,
            evaluări și proiecte, cu teme, note vorbitor și Presenter Mode.
          </p>
        </div>
        <div className="pw-header-actions">
          <select
            className="pw-input"
            style={{ minHeight: "2.35rem", borderRadius: 999 }}
            value={lessonId || lessons[0]?.id || ""}
            onChange={(e) => setLessonId(e.target.value)}
            aria-label="Lecție legată"
          >
            {lessons.length === 0 ? (
              <option value="">Lecție automată</option>
            ) : (
              lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.general.title}
                </option>
              ))
            )}
          </select>
          <select
            className="pw-input"
            style={{ minHeight: "2.35rem", borderRadius: 999 }}
            value={kind}
            onChange={(e) => setKind(e.target.value as PresentationKind)}
            aria-label="Tip prezentare"
          >
            {PRESENTATION_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
          <select
            className="pw-input"
            style={{ minHeight: "2.35rem", borderRadius: 999 }}
            value={sourceKind}
            onChange={(e) =>
              setSourceKind(e.target.value as PresentationSourceKind)
            }
            aria-label="Sursă"
          >
            {SOURCE_KINDS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="pw-btn"
            onClick={() => createFromSource("generate_entire")}
          >
            Generează cu AI
          </button>
          <button
            type="button"
            className="pw-btn pw-btn-primary"
            onClick={() => createFromSource()}
          >
            Prezentare nouă
          </button>
        </div>
      </div>

      {presentations.length === 0 ? (
        <EmptyState
          title="Nicio prezentare în proiect"
          description="Creează o prezentare dintr-o lecție sau altă resursă PRIMA — editorul vine pre-populat."
          action={
            <button
              type="button"
              className="pw-btn pw-btn-primary"
              onClick={() => createFromSource()}
            >
              Deschide Presentation Builder
            </button>
          }
        />
      ) : (
        <div className="pw-list">
          {presentations.map((p) => {
            const lesson = p.lessonId
              ? lessonBuilderRepository.getById(p.lessonId)
              : undefined;
            return (
              <div key={p.id} className="pw-row">
                <div className="pw-row-main">
                  <div className="pw-row-title">{p.title}</div>
                  <div className="pw-row-meta">
                    {PRESENTATION_KINDS.find((k) => k.id === p.kind)?.label ??
                      p.kind}
                    {" · "}
                    {lesson?.general.title ?? p.lessonId ?? "fără lecție"}
                    {" · "}sursă {p.source.kind}
                    {" · "}
                    {p.slides.length} slide-uri
                    {" · "}v{p.version} · {p.status} · ~{p.estimatedMinutes} min
                    {" · "}
                    {formatRelativeTime(p.updatedAt)}
                    {p.validation ? ` · scor ${p.validation.score}` : ""}
                  </div>
                </div>
                <div className="pw-row-actions">
                  <Link
                    className="pw-btn pw-btn-primary"
                    to={`/presentation-builder/${project.id}/${p.id}`}
                  >
                    Editează
                  </Link>
                  <button
                    type="button"
                    className="pw-btn"
                    onClick={() => {
                      const copy = presentationBuilderRepository.duplicate(
                        p.id,
                      );
                      reload();
                      openBuilder(copy.id);
                    }}
                  >
                    Duplică
                  </button>
                  <button
                    type="button"
                    className="pw-btn pw-btn-ghost pw-btn-danger"
                    onClick={() => {
                      presentationBuilderRepository.archive(p.id);
                      reload();
                    }}
                  >
                    Arhivează
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
