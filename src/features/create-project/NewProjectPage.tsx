import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import {
  DEFAULT_PROJECT_COLOR,
  DEFAULT_PROJECT_ICON,
} from "../projects/constants";
import { CreateProjectForm } from "./components/CreateProjectForm";
import { CreateProjectLayout } from "./components/CreateProjectLayout";
import type { QuickProjectErrors, QuickProjectInput } from "./types";
import { emptyQuickProject, validateQuickProject } from "./validation";

/**
 * Feature 002 — Create Project in under 60 seconds.
 * Route: `/projects/new`
 */
export function NewProjectPage() {
  const navigate = useNavigate();
  const { createProject, isTitleTaken } = useProjects();
  const [form, setForm] = useState<QuickProjectInput>(emptyQuickProject);
  const [errors, setErrors] = useState<QuickProjectErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    const nextErrors = validateQuickProject(form, isTitleTaken);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      const project = createProject({
        title: form.title.trim(),
        subject: form.subject,
        grade: form.grade,
        schoolYear: form.schoolYear,
        description: "",
        curriculum: "Curriculum național",
        status: "active",
        color: DEFAULT_PROJECT_COLOR,
        icon: DEFAULT_PROJECT_ICON,
        favorite: false,
      });
      navigate(`/studio/${project.id}/overview`, { replace: true });
    } catch {
      setBusy(false);
      setErrors({ title: "Could not create project. Try another title." });
    }
  };

  return (
    <CreateProjectLayout>
      <CreateProjectForm
        value={form}
        errors={errors}
        submitted={submitted}
        busy={busy}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/projects")}
      />
    </CreateProjectLayout>
  );
}

export default NewProjectPage;
