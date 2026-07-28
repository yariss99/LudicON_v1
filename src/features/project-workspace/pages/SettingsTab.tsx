import { useState } from "react";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import type { ProjectMetadata, ProjectWorkspaceStatus } from "../types";

export function SettingsTab() {
  const { project, metadata, saveMetadata } = useProjectWorkspace();
  const [form, setForm] = useState<ProjectMetadata>({ ...metadata });
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    saveMetadata({
      ...form,
      competencies: form.competencies
        .map((c) => c.trim())
        .filter(Boolean),
      tags: form.tags.map((t) => t.trim()).filter(Boolean),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <p className="pw-lead">
        Metadate proiect: an școlar, semestru, curriculum, competențe, etichete
        și status. Informațiile alimentează Context Engine.
      </p>

      <div className="pw-card" style={{ marginBottom: "1.25rem" }}>
        <div className="pw-row-title">{project.title}</div>
        <div className="pw-row-meta">
          ID {project.id} · {project.subject} · {project.grade}
        </div>
      </div>

      <div className="pw-form">
        <label className="pw-label">
          An școlar
          <input
            className="pw-input"
            value={form.schoolYear ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, schoolYear: e.target.value }))
            }
          />
        </label>
        <label className="pw-label">
          Semestru
          <input
            className="pw-input"
            value={form.semester ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, semester: e.target.value }))
            }
          />
        </label>
        <label className="pw-label">
          Referință curriculum
          <input
            className="pw-input"
            value={form.curriculumRef ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, curriculumRef: e.target.value }))
            }
            placeholder="ex. MEN · Matematică · clasa III"
          />
        </label>
        <label className="pw-label">
          Competențe (câte una pe linie)
          <textarea
            className="pw-textarea"
            value={form.competencies.join("\n")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                competencies: e.target.value.split("\n"),
              }))
            }
          />
        </label>
        <label className="pw-label">
          Etichete (separate prin virgulă)
          <input
            className="pw-input"
            value={form.tags.join(", ")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                tags: e.target.value.split(","),
              }))
            }
          />
        </label>
        <label className="pw-label">
          Profesor
          <input
            className="pw-input"
            value={form.teacherName ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, teacherName: e.target.value }))
            }
          />
        </label>
        <label className="pw-label">
          Status
          <select
            className="pw-input"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as ProjectWorkspaceStatus,
              }))
            }
          >
            <option value="draft">Ciornă</option>
            <option value="active">Activ</option>
            <option value="completed">Finalizat</option>
            <option value="archived">Arhivat</option>
          </select>
        </label>
        <div className="pw-header-actions">
          <button type="button" className="pw-btn pw-btn-primary" onClick={onSave}>
            Salvează setările
          </button>
          {saved ? <span className="pw-chip">Salvat</span> : null}
        </div>
      </div>
    </div>
  );
}
