import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { useExperienceMode } from "../../experience-mode";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import {
  ASSESSMENT_PURPOSES,
  ASSESSMENT_STUDIO_STATUSES,
  assessmentPurposeLabel,
  assessmentStatusLabel,
} from "../constants";
import { openAssessmentPath } from "../AssessmentStudioPage";
import {
  createAssessmentInStudio,
  assessmentStudioRepository,
} from "../services/assessmentStudioRepository";
import type {
  AssessmentSortOption,
  AssessmentStudioDocument,
  AssessmentStudioStatus,
  AssessmentViewMode,
} from "../types";

type Props = {
  projectId: string;
  projectSubject?: string;
  projectGrade?: string;
};

export function AssessmentsLibrary({
  projectId,
  projectSubject = "",
  projectGrade = "",
}: Props) {
  const navigate = useNavigate();
  const { preference } = useExperienceMode();
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [purpose, setPurpose] = useState("");
  const [sort, setSort] = useState<AssessmentSortOption>("updated");
  const [view, setView] = useState<AssessmentViewMode>("grid");

  const assessments = useMemo(
    () => assessmentStudioRepository.listByProject(projectId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, tick],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = assessments.filter((a) => {
      if (status && a.status !== status) return false;
      if (purpose && a.properties.purpose !== purpose) return false;
      if (!q) return true;
      return (
        a.properties.title.toLowerCase().includes(q) ||
        a.properties.subject.toLowerCase().includes(q) ||
        assessmentPurposeLabel(a.properties.purpose).toLowerCase().includes(q)
      );
    });
    list = [...list];
    if (sort === "alpha") {
      list.sort((a, b) =>
        a.properties.title.localeCompare(b.properties.title),
      );
    } else if (sort === "created") {
      list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    } else if (sort === "status") {
      list.sort((a, b) => a.status.localeCompare(b.status));
    } else {
      list.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    }
    return list;
  }, [assessments, query, status, purpose, sort]);

  const reload = () => setTick((t) => t + 1);

  const openAssessment = (doc: AssessmentStudioDocument) => {
    navigate(
      openAssessmentPath(
        projectId,
        doc.id,
        preference.mode,
        doc.guidedCompleted,
      ),
    );
  };

  const createAssessment = () => {
    const meta = projectWorkspaceRepository.getMetadata(projectId);
    const doc = createAssessmentInStudio(projectId, {
      subject: projectSubject,
      grade: projectGrade,
      title: "Untitled assessment",
      projectCompetencies: [...meta.competencies],
    });
    openAssessment(doc);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Assessment Library
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {preference.mode === "guided"
              ? "Guided mode — new assessments open as a step-by-step wizard."
              : "Measure competencies and support future learning — not just tests."}
          </p>
        </div>
        <button
          type="button"
          onClick={createAssessment}
          className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          New Assessment
        </button>
      </div>

      {assessments.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assessments…"
            className="h-10 min-w-[180px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Status</option>
            {ASSESSMENT_STUDIO_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Purpose</option>
            {ASSESSMENT_PURPOSES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as AssessmentSortOption)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="alpha">Alphabetical</option>
            <option value="status">Status</option>
          </select>
          <select
            value={view}
            onChange={(e) => setView(e.target.value as AssessmentViewMode)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </div>
      ) : null}

      {assessments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-slate-100" />
          <h3 className="text-lg font-semibold tracking-tight">
            Create your first assessment
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Compose items that target project competencies — formative,
            summative, progress monitoring, and more.
          </p>
          <button
            type="button"
            onClick={createAssessment}
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            New Assessment
          </button>
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-2"
          }
        >
          {visible.map((doc) => {
            const href = openAssessmentPath(
              projectId,
              doc.id,
              preference.mode,
              doc.guidedCompleted,
            );
            return (
              <article
                key={doc.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold tracking-tight text-slate-900">
                    {doc.properties.title}
                  </h3>
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500">
                    {assessmentStatusLabel(doc.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {assessmentPurposeLabel(doc.properties.purpose)} ·{" "}
                  {doc.summary.itemCount} items · ~
                  {doc.summary.estimatedDurationMinutes} min
                </p>
                <p className="text-xs text-slate-400">
                  Updated {formatRelativeTime(doc.updatedAt)}
                  {doc.summary.targetedCompetencies.length
                    ? ` · ${doc.summary.targetedCompetencies.length} competencies`
                    : ""}
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link
                    to={href}
                    className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white no-underline"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium"
                    onClick={() => {
                      const copy = assessmentStudioRepository.duplicate(doc.id);
                      reload();
                      openAssessment(copy);
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-red-600"
                    onClick={() => {
                      if (window.confirm(`Delete “${doc.properties.title}”?`)) {
                        assessmentStudioRepository.delete(doc.id);
                        reload();
                      }
                    }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium"
                    onClick={() => {
                      const next: AssessmentStudioStatus =
                        doc.status === "published"
                          ? "in_progress"
                          : "published";
                      assessmentStudioRepository.save({ ...doc, status: next });
                      reload();
                    }}
                  >
                    {doc.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AssessmentsLibrary;
