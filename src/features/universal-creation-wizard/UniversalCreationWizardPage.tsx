import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import {
  DEFAULT_PROJECT_COLOR,
  DEFAULT_PROJECT_ICON,
  PROJECT_GRADES,
  PROJECT_SUBJECTS,
} from "../projects/constants";
import {
  COMPATIBLE_SOURCES,
  DEFAULT_STRUCTURE,
  RESOURCE_TYPES,
  SOURCE_LABELS,
} from "./constants";
import { createResourceFromWizard } from "./services/createResource";
import { listSourceOptions } from "./services/listSources";
import type {
  WizardDraft,
  WizardResourceType,
  WizardSourceKind,
  WizardStep,
} from "./types";

const stepTitles: Record<WizardStep, string> = {
  1: "Choose resource type",
  2: "Choose creation source",
  3: "Basic information",
  4: "Create resource",
};

function isResourceType(v: string | null): v is WizardResourceType {
  return RESOURCE_TYPES.some((r) => r.id === v);
}

function isSourceKind(v: string | null): v is WizardSourceKind {
  return Boolean(v && v in SOURCE_LABELS);
}

export function UniversalCreationWizardPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { projects, createProject, isTitleTaken } = useProjects();

  const activeProjects = useMemo(
    () =>
      [...projects]
        .filter((p) => !p.archived)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [projects],
  );

  const initialType = params.get("type");
  const initialProject = params.get("project");
  const initialSource = params.get("source");
  const initialSourceId = params.get("sourceId");
  const initialTitle = params.get("title") ?? "";
  const initialSubject = params.get("subject");
  const initialGrade = params.get("grade");

  const [step, setStep] = useState<WizardStep>(() => {
    if (!isResourceType(initialType)) return 1;
    // Prefill from teaching flow → jump to basics when we have title/project
    if (initialTitle || initialProject) return 3;
    return 2;
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<WizardDraft>(() => {
    const projectId =
      (initialProject &&
        activeProjects.find((p) => p.id === initialProject)?.id) ||
      activeProjects[0]?.id ||
      "";
    const project = activeProjects.find((p) => p.id === projectId);
    const type = isResourceType(initialType) ? initialType : null;
    const compatible = type ? COMPATIBLE_SOURCES[type] : [];
    const source =
      isSourceKind(initialSource) && compatible.includes(initialSource)
        ? initialSource
        : type
          ? "blank"
          : null;
    return {
      resourceType: type,
      sourceKind: source,
      sourceId: initialSourceId,
      title:
        initialTitle ||
        (type
          ? `Untitled ${RESOURCE_TYPES.find((r) => r.id === type)?.title ?? "resource"}`
          : ""),
      projectId,
      subject: initialSubject || project?.subject || PROJECT_SUBJECTS[0],
      grade: initialGrade || project?.grade || PROJECT_GRADES[2],
    };
  });

  const sources = useMemo(() => {
    if (!draft.resourceType) return [];
    return COMPATIBLE_SOURCES[draft.resourceType];
  }, [draft.resourceType]);

  const sourceOptions = useMemo(() => {
    if (!draft.projectId || !draft.sourceKind || draft.sourceKind === "blank") {
      return [];
    }
    return listSourceOptions(draft.projectId, draft.sourceKind);
  }, [draft.projectId, draft.sourceKind]);

  useEffect(() => {
    if (draft.sourceKind === "blank") {
      setDraft((d) => (d.sourceId ? { ...d, sourceId: null } : d));
    }
  }, [draft.sourceKind]);

  const patch = useCallback((partial: Partial<WizardDraft>) => {
    setDraft((d) => ({ ...d, ...partial }));
    setError(null);
  }, []);

  const resourceMeta = RESOURCE_TYPES.find((r) => r.id === draft.resourceType);

  const canNext = () => {
    if (step === 1) return Boolean(draft.resourceType);
    if (step === 2) {
      if (!draft.sourceKind) return false;
      if (draft.sourceKind !== "blank" && !draft.sourceId) return false;
      return true;
    }
    if (step === 3) {
      return Boolean(
        draft.title.trim() && draft.projectId && draft.subject && draft.grade,
      );
    }
    return true;
  };

  const ensureProject = () => {
    if (draft.projectId) return draft.projectId;
    let title = draft.title.trim() || "New project";
    let n = 1;
    while (isTitleTaken(title)) title = `${draft.title.trim()} (${n++})`;
    const project = createProject({
      title,
      subject: draft.subject,
      grade: draft.grade,
      description: "",
      schoolYear: "2025-2026",
      curriculum: "Curriculum național",
      status: "active",
      color: DEFAULT_PROJECT_COLOR,
      icon: DEFAULT_PROJECT_ICON,
      favorite: false,
    });
    patch({ projectId: project.id });
    return project.id;
  };

  const goNext = () => {
    if (!canNext()) {
      if (step === 2 && draft.sourceKind !== "blank" && !draft.sourceId) {
        setError("Select a source document, or choose Blank.");
      } else if (step === 3) {
        setError("Title, project, subject, and grade are required.");
      }
      return;
    }
    setStep((s) => (s < 4 ? ((s + 1) as WizardStep) : s));
  };

  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));

  const onCreate = () => {
    setBusy(true);
    setError(null);
    try {
      const projectId = ensureProject();
      const result = createResourceFromWizard({ ...draft, projectId });
      navigate(result.href);
    } catch {
      setError("Could not create the resource. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Universal Creation Wizard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Create educational resource
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              One workflow for every studio — lesson through story.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 no-underline hover:bg-slate-50"
          >
            Cancel
          </Link>
        </header>

        <ol className="mb-6 flex flex-wrap gap-2">
          {([1, 2, 3, 4] as WizardStep[]).map((n) => (
            <li
              key={n}
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                step === n
                  ? "bg-slate-900 text-white"
                  : step > n
                    ? "bg-slate-200 text-slate-700"
                    : "bg-white text-slate-400 ring-1 ring-slate-200",
              ].join(" ")}
            >
              {n}. {stepTitles[n]}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] sm:p-7"
          >
            <h2 className="text-lg font-semibold tracking-tight">
              {stepTitles[step]}
            </h2>

            {step === 1 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {RESOURCE_TYPES.map((r, index) => {
                  const selected = draft.resourceType === r.id;
                  return (
                    <motion.button
                      key={r.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ y: -2 }}
                      onClick={() => {
                        const nextSources = COMPATIBLE_SOURCES[r.id];
                        patch({
                          resourceType: r.id,
                          sourceKind: nextSources.includes(
                            draft.sourceKind as WizardSourceKind,
                          )
                            ? draft.sourceKind
                            : "blank",
                          sourceId: null,
                          title: draft.title || `Untitled ${r.title}`,
                        });
                      }}
                      className={[
                        "min-h-[8.5rem] rounded-2xl border p-4 text-left transition",
                        selected
                          ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                          : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white",
                      ].join(" ")}
                    >
                      <span className="text-2xl" aria-hidden>
                        {r.emoji}
                      </span>
                      <span className="mt-3 block text-base font-semibold">
                        {r.title}
                      </span>
                      <span
                        className={[
                          "mt-1 block text-xs leading-relaxed",
                          selected ? "text-slate-300" : "text-slate-500",
                        ].join(" ")}
                      >
                        {r.description}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-5 space-y-4">
                {activeProjects.length > 0 ? (
                  <label className="block text-xs font-semibold text-slate-500">
                    Project (for source lookup)
                    <select
                      value={draft.projectId}
                      onChange={(e) => {
                        const p = activeProjects.find(
                          (x) => x.id === e.target.value,
                        );
                        patch({
                          projectId: e.target.value,
                          subject: p?.subject || draft.subject,
                          grade: p?.grade || draft.grade,
                          sourceId: null,
                        });
                      }}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal"
                    >
                      {activeProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2">
                  {sources.map((kind) => {
                    const selected = draft.sourceKind === kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        onClick={() =>
                          patch({ sourceKind: kind, sourceId: null })
                        }
                        className={[
                          "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 hover:border-slate-300",
                        ].join(" ")}
                      >
                        {SOURCE_LABELS[kind]}
                      </button>
                    );
                  })}
                </div>

                {draft.sourceKind && draft.sourceKind !== "blank" ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      Select source
                    </p>
                    {!draft.projectId ? (
                      <p className="text-sm text-slate-500">
                        Create a project first, or choose Blank.
                      </p>
                    ) : sourceOptions.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        No{" "}
                        {SOURCE_LABELS[draft.sourceKind]
                          .replace("From ", "")
                          .toLowerCase()}
                        s in this project yet. Pick Blank or another source.
                      </p>
                    ) : (
                      <ul className="max-h-56 space-y-1.5 overflow-auto">
                        {sourceOptions.map((opt) => (
                          <li key={opt.id}>
                            <button
                              type="button"
                              onClick={() => patch({ sourceId: opt.id })}
                              className={[
                                "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition",
                                draft.sourceId === opt.id
                                  ? "border-slate-900 bg-slate-50"
                                  : "border-slate-100 hover:border-slate-200",
                              ].join(" ")}
                            >
                              <span className="font-medium text-slate-800">
                                {opt.title}
                              </span>
                              {opt.meta ? (
                                <span className="mt-0.5 block text-xs text-slate-500">
                                  {opt.meta}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-500 sm:col-span-2">
                  Title
                  <input
                    value={draft.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
                    placeholder="Resource title"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-500 sm:col-span-2">
                  Project
                  <select
                    value={draft.projectId}
                    onChange={(e) => {
                      const p = activeProjects.find(
                        (x) => x.id === e.target.value,
                      );
                      patch({
                        projectId: e.target.value,
                        subject: p?.subject || draft.subject,
                        grade: p?.grade || draft.grade,
                        sourceId: null,
                      });
                    }}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  >
                    {activeProjects.length === 0 ? (
                      <option value="">New project will be created</option>
                    ) : null}
                    {activeProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-500">
                  Subject
                  <select
                    value={draft.subject}
                    onChange={(e) => patch({ subject: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  >
                    {PROJECT_SUBJECTS.map((s: string) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-500">
                  Grade
                  <select
                    value={draft.grade}
                    onChange={(e) => patch({ grade: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  >
                    {PROJECT_GRADES.map((g: string) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Preview summary
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {resourceMeta?.emoji} {draft.title || "Untitled"} ·{" "}
                    {resourceMeta?.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {SOURCE_LABELS[draft.sourceKind ?? "blank"]} ·{" "}
                    {draft.subject} · {draft.grade}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {(draft.resourceType
                      ? DEFAULT_STRUCTURE[draft.resourceType]
                      : []
                    ).map((label) => (
                      <li
                        key={label}
                        className="rounded-lg bg-white px-2 py-1 text-[0.7rem] font-medium text-slate-600 ring-1 ring-slate-200"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-slate-600">
                  Ready to create{" "}
                  <strong className="text-slate-900">
                    {draft.title || "Untitled"}
                  </strong>{" "}
                  with the default {resourceMeta?.title.toLowerCase()} structure.
                </p>
                <ol className="space-y-2">
                  {(draft.resourceType
                    ? DEFAULT_STRUCTURE[draft.resourceType]
                    : []
                  ).map((label, i) => (
                    <li
                      key={label}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[0.65rem] font-bold text-white">
                        {i + 1}
                      </span>
                      {label}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap justify-between gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1 || busy}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Back
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onCreate}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {busy ? "Creating…" : "Create resource"}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UniversalCreationWizardPage;
