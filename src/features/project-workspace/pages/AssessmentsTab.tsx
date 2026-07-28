import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import {
  createAssessmentInProject,
} from "../../assessment-builder/hooks/useAssessmentBuilder";
import { assessmentBuilderRepository } from "../../assessment-builder/services/assessmentBuilderRepository";
import {
  applyAssessmentAiAction,
  ensureLessonForProject,
} from "../../assessment-builder/services/assessmentCoreBridge";
import { ASSESSMENT_KINDS } from "../../assessment-builder/constants";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { EmptyState } from "../components/EmptyState";
import type { AssessmentKind } from "../../assessment-builder/types";

/**
 * Project Workspace → Assessments tab.
 * Opens Assessment Builder; assessments always bind to a lesson + project.
 */
export function AssessmentsTab() {
  const { project, refresh } = useProjectWorkspace();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [kind, setKind] = useState<AssessmentKind>("formative");
  const [lessonId, setLessonId] = useState("");

  const lessons = useMemo(
    () => lessonBuilderRepository.listByProject(project.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, tick],
  );

  const assessments = useMemo(
    () => assessmentBuilderRepository.listByProject(project.id),
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
    navigate(`/assessment-builder/${project.id}/${id}`);
  };

  return (
    <div>
      <div className="pw-toolbar">
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            Evaluări
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            Assessment Builder — formative, sumative, diagnostice, rubrici —
            mereu legate de o lecție din acest proiect.
          </p>
        </div>
        <div className="pw-header-actions">
          <select
            className="pw-input"
            style={{ minHeight: "2.35rem", borderRadius: 999 }}
            value={lessonId || lessons[0]?.id || ""}
            onChange={(e) => setLessonId(e.target.value)}
            aria-label="Lecție părinte"
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
            onChange={(e) => setKind(e.target.value as AssessmentKind)}
            aria-label="Tip evaluare"
          >
            {ASSESSMENT_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="pw-btn"
            onClick={() => {
              const lid = resolveLessonId();
              const created = createAssessmentInProject({
                project,
                lessonId: lid,
                kind,
              });
              const { assessment: generated } = applyAssessmentAiAction({
                project,
                assessment: created,
                action: "generate_complete",
              });
              assessmentBuilderRepository.save(generated, {
                note: "ai:generate_complete",
                actor: "ai",
              });
              reload();
              openBuilder(generated.id);
            }}
          >
            Generează cu AI
          </button>
          <button
            type="button"
            className="pw-btn pw-btn-primary"
            onClick={() => {
              const created = createAssessmentInProject({
                project,
                lessonId: resolveLessonId(),
                kind,
              });
              reload();
              openBuilder(created.id);
            }}
          >
            Evaluare nouă
          </button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <EmptyState
          title="Nicio evaluare în proiect"
          description="Creează o evaluare legată de o lecție. Profesorul rămâne în control; AI asistă."
          action={
            <button
              type="button"
              className="pw-btn pw-btn-primary"
              onClick={() => {
                const created = createAssessmentInProject({
                  project,
                  lessonId: resolveLessonId(),
                  kind,
                });
                reload();
                openBuilder(created.id);
              }}
            >
              Deschide Assessment Builder
            </button>
          }
        />
      ) : (
        <div className="pw-list">
          {assessments.map((a) => {
            const lesson = lessonBuilderRepository.getById(a.lessonId);
            return (
              <div key={a.id} className="pw-row">
                <div className="pw-row-main">
                  <div className="pw-row-title">{a.title}</div>
                  <div className="pw-row-meta">
                    {ASSESSMENT_KINDS.find((k) => k.id === a.kind)?.label ??
                      a.kind}
                    {" · "}
                    {lesson?.general.title ?? a.lessonId}
                    {" · "}v{a.version} · {a.status} ·{" "}
                    {formatRelativeTime(a.updatedAt)}
                    {a.validation ? ` · scor ${a.validation.score}` : ""}
                  </div>
                </div>
                <div className="pw-row-actions">
                  <Link
                    className="pw-btn pw-btn-primary"
                    to={`/assessment-builder/${project.id}/${a.id}`}
                  >
                    Editează
                  </Link>
                  <button
                    type="button"
                    className="pw-btn"
                    onClick={() => {
                      const copy = assessmentBuilderRepository.duplicate(a.id);
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
                      assessmentBuilderRepository.archive(a.id);
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
