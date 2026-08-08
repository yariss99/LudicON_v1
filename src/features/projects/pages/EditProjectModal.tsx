import { useEffect, useState, type FormEvent } from "react";
import type { Project, ProjectFormInput } from "../../../types/project";
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

type EditProjectModalProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (input: ProjectFormInput) => void;
  isTitleTaken: (title: string, excludeId?: string) => boolean;
};

export function EditProjectModal({
  open,
  project,
  onClose,
  onSave,
  isTitleTaken,
}: EditProjectModalProps) {
  const [form, setForm] = useState<ProjectFormInput>(() => emptyProjectForm());
  const [errors, setErrors] = useState<ReturnType<typeof validateProjectForm>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open || !project) return;
    setForm(
      emptyProjectForm({
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        description: project.description,
        schoolYear: project.schoolYear,
        curriculum: project.curriculum,
        status: project.status,
        color: project.coverColor || project.color,
        icon: project.icon,
        favorite: project.favorite,
      }),
    );
    setErrors({});
    setSubmitted(false);
  }, [open, project]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!project) return;
    setSubmitted(true);
    const next = validateProjectForm(form, isTitleTaken, project.id);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({
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
      title="Edit project"
      lead="Update metadata for this project."
      footer={
        <>
          <button type="button" className="pm-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="edit-project-modal-form"
            className="pm-btn pm-btn-primary"
          >
            Save changes
          </button>
        </>
      }
    >
      <form id="edit-project-modal-form" onSubmit={handleSubmit}>
        <label className="pm-field">
          Project Name
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
        </label>

        <label className="pm-field">
          Subject
          <select
            value={form.subject}
            onChange={(e) =>
              setForm((f) => ({ ...f, subject: e.target.value }))
            }
          >
            {PROJECT_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
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
        </label>

        <label className="pm-field">
          Description
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
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
          <div className="pm-color-row">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`pm-color-swatch${form.color === color.id ? " is-active" : ""}`}
                style={{ background: color.swatch }}
                aria-label={color.label}
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

export default EditProjectModal;
