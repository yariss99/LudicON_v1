import { useEffect, useState, type FormEvent } from "react";
import type { ProjectFormInput } from "../../../types/project";
import {
  PROJECT_COLORS,
  PROJECT_CURRICULA,
  PROJECT_GRADES,
  PROJECT_SCHOOL_YEARS,
  PROJECT_STATUSES,
  PROJECT_SUBJECTS,
  getProjectColor,
} from "../constants";
import { ProjectModalShell } from "./ProjectModalShell";
import {
  emptyProjectForm,
  validateProjectForm,
} from "./projectFormUtils";
import "../styles/projects.css";

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: ProjectFormInput) => void;
  isTitleTaken: (title: string) => boolean;
};

export function CreateProjectModal({
  open,
  onClose,
  onCreate,
  isTitleTaken,
}: CreateProjectModalProps) {
  const [form, setForm] = useState<ProjectFormInput>(() => emptyProjectForm());
  const [errors, setErrors] = useState<ReturnType<typeof validateProjectForm>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyProjectForm({ status: "draft" }));
    setErrors({});
    setSubmitted(false);
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const next = validateProjectForm(form, isTitleTaken);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onCreate({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
    onClose();
  };

  return (
    <ProjectModalShell
      open={open}
      onClose={onClose}
      title="Create project"
      lead="Start a new educational project. Everything in P.R.R.I.M.A. ON belongs to a project."
      footer={
        <>
          <button type="button" className="pm-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="create-project-modal-form"
            className="pm-btn pm-btn-primary"
          >
            Create Project
          </button>
        </>
      }
    >
      <form id="create-project-modal-form" onSubmit={handleSubmit}>
        <label className="pm-field">
          Project Name
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Fractions — Unit 1"
            autoFocus
          />
          {submitted && errors.title ? (
            <span className="pm-field-error">{errors.title}</span>
          ) : null}
        </label>

        <label className="pm-field">
          School Year
          <select
            value={form.schoolYear}
            onChange={(e) =>
              setForm((f) => ({ ...f, schoolYear: e.target.value }))
            }
          >
            {PROJECT_SCHOOL_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {submitted && errors.schoolYear ? (
            <span className="pm-field-error">{errors.schoolYear}</span>
          ) : null}
        </label>

        <label className="pm-field">
          Class
          <select
            value={form.grade}
            onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
          >
            {PROJECT_GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          {submitted && errors.grade ? (
            <span className="pm-field-error">{errors.grade}</span>
          ) : null}
        </label>

        <label className="pm-field">
          Subject
          <select
            value={form.subject}
            onChange={(e) =>
              setForm((f) => ({ ...f, subject: e.target.value }))
            }
          >
            <option value="">Select subject</option>
            {PROJECT_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          {submitted && errors.subject ? (
            <span className="pm-field-error">{errors.subject}</span>
          ) : null}
        </label>

        <label className="pm-field">
          Curriculum
          <select
            value={form.curriculum}
            onChange={(e) =>
              setForm((f) => ({ ...f, curriculum: e.target.value }))
            }
          >
            {PROJECT_CURRICULA.map((curriculum) => (
              <option key={curriculum} value={curriculum}>
                {curriculum}
              </option>
            ))}
          </select>
          {submitted && errors.curriculum ? (
            <span className="pm-field-error">{errors.curriculum}</span>
          ) : null}
        </label>

        <label className="pm-field">
          Description
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Short summary of the learning focus"
          />
        </label>

        <label className="pm-field">
          Status
          <select
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as ProjectFormInput["status"],
              }))
            }
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <div className="pm-field">
          Color
          <div className="pm-color-row" role="listbox" aria-label="Cover color">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`pm-color-swatch${form.color === color.id ? " is-active" : ""}`}
                style={{ background: color.swatch }}
                aria-label={color.label}
                aria-selected={form.color === color.id}
                onClick={() => setForm((f) => ({ ...f, color: color.id }))}
              />
            ))}
          </div>
          <span style={{ fontWeight: 400, color: "#9ca3af" }}>
            {getProjectColor(form.color).label}
          </span>
        </div>
      </form>
    </ProjectModalShell>
  );
}

export default CreateProjectModal;
