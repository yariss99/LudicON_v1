import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { wizardPath } from "../../universal-creation-wizard/constants";
import { computeDynamicProgress } from "../services/dynamicProgress";

export function WorkspaceHeader() {
  const { project, metadata } = useProjectWorkspace();
  const progress = useMemo(
    () => computeDynamicProgress(project.id),
    [project.id, project.updatedAt],
  );

  return (
    <header className="pw-header">
      <div>
        <div className="pw-kicker">Project workspace</div>
        <h1 className="pw-title">{project.title}</h1>
        <div className="pw-meta" aria-label="Project info">
          <span className="pw-chip">{project.subject}</span>
          <span className="pw-chip">{project.grade}</span>
          {project.schoolYear ? (
            <span className="pw-chip">{project.schoolYear}</span>
          ) : null}
          {metadata.semester ? (
            <span className="pw-chip">Sem. {metadata.semester}</span>
          ) : null}
        </div>
        <div className="mt-3 max-w-md">
          <div className="mb-1 flex justify-between text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            <span>Progress</span>
            <motion.span
              key={progress.percentComplete}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="tabular-nums text-slate-600"
            >
              {progress.percentComplete}%
            </motion.span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-slate-900"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentComplete}%` }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
      <div className="pw-header-actions">
        <Link className="pw-btn" to="/projects">
          All projects
        </Link>
        <Link
          className="pw-btn pw-btn-primary"
          to={wizardPath({ projectId: project.id, source: "blank" })}
        >
          Create resource
        </Link>
      </div>
    </header>
  );
}
