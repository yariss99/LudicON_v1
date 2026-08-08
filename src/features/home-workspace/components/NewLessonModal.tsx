import { useState, type FormEvent } from "react";
import Modal from "../../../components/ui/Modal";
import { useProjects } from "../../../context/ProjectContext";
import {
  DEFAULT_PROJECT_COLOR,
  DEFAULT_PROJECT_ICON,
  PROJECT_GRADES,
  PROJECT_SUBJECTS,
} from "../../projects/constants";
import { createLessonInStudio } from "../../lesson-studio/services/lessonStudioRepository";
import {
  homeLessonProgressStore,
  notifyArtifactsChanged,
  type HomeLessonProgress,
} from "../services/homeLessonProgressStore";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (entry: HomeLessonProgress) => void;
};

export function NewLessonModal({ open, onClose, onCreated }: Props) {
  const { projects, createProject, isTitleTaken } = useProjects();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>(PROJECT_SUBJECTS[0]);
  const [grade, setGrade] = useState<string>(PROJECT_GRADES[2]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setTitle("");
    setSubject(PROJECT_SUBJECTS[0]);
    setGrade(PROJECT_GRADES[2]);
    setError(null);
    setBusy(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Lesson title is required.");
      return;
    }
    if (!subject.trim() || !grade.trim()) {
      setError("Subject and grade are required.");
      return;
    }

    setBusy(true);
    try {
      const active = projects.filter((p) => !p.archived);
      let project =
        active.find((p) => p.subject === subject && p.grade === grade) ??
        active[0];

      if (!project) {
        let projectTitle = trimmed;
        let n = 1;
        while (isTitleTaken(projectTitle)) {
          projectTitle = `${trimmed} (${n++})`;
        }
        project = createProject({
          title: projectTitle,
          subject,
          grade,
          description: "",
          schoolYear: "2025-2026",
          curriculum: "Curriculum național",
          status: "active",
          color: DEFAULT_PROJECT_COLOR,
          icon: DEFAULT_PROJECT_ICON,
          favorite: false,
        });
      }

      const lesson = createLessonInStudio(project.id, {
        title: trimmed,
        subject,
        grade,
      });

      const entry: HomeLessonProgress = {
        lessonId: lesson.id,
        projectId: project.id,
        title: lesson.properties.title || trimmed,
        subject,
        grade,
        createdAt: lesson.createdAt,
      };
      homeLessonProgressStore.add(entry);
      notifyArtifactsChanged();
      onCreated(entry);
      reset();
      onClose();
    } catch {
      setError("Could not create the lesson. Try again.");
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Lesson"
      description="Save a lesson locally and track what to build next."
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-lesson-form"
            disabled={busy}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create"}
          </button>
        </>
      }
    >
      <form id="new-lesson-form" className="space-y-4" onSubmit={onSubmit}>
        <label className="block text-xs font-semibold text-slate-500">
          Lesson title
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            autoFocus
            placeholder="e.g. Introduction to fractions"
            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-500">
          Subject
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-slate-400"
          >
            {PROJECT_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-500">
          Grade
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-900 outline-none focus:border-slate-400"
          >
            {PROJECT_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </Modal>
  );
}
