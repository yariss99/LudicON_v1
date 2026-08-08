import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import type { Project, ProjectStatus } from "../../../types/project";
import {
  formatAbsoluteDate,
  formatRelativeTime,
} from "../../../utils/date";
import { getProjectColor } from "../constants";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { EditProjectModal } from "./EditProjectModal";
import { assetCount, statusLabel } from "./projectFormUtils";
import "../styles/projects.css";

function mockTimeline(project: Project) {
  return [
    {
      id: "created",
      title: "Project created",
      detail: project.title,
      at: project.createdAt,
    },
    {
      id: "updated",
      title: "Project updated",
      detail: "Metadata and status synced",
      at: project.updatedAt,
    },
    ...project.resources
      .filter((r) => r.status !== "empty")
      .slice(0, 3)
      .map((resource) => ({
        id: resource.id,
        title: `${resource.label} ready`,
        detail: `Status: ${resource.status}`,
        at: project.updatedAt,
      })),
  ];
}

export function ProjectDetails() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const {
    getProject,
    updateProject,
    deleteProject,
    duplicateProject,
    setProjectStatus,
    isTitleTaken,
  } = useProjects();

  const project = getProject(projectId);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const color = project
    ? getProjectColor(project.coverColor || project.color)
    : null;
  const assets = project ? assetCount(project.resources) : 0;
  const recentAssets = useMemo(
    () =>
      project
        ? project.resources.filter((r) => r.status !== "empty").slice(0, 5)
        : [],
    [project],
  );
  const timeline = useMemo(
    () => (project ? mockTimeline(project) : []),
    [project],
  );

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="pm">
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/projects" className="pm-btn" style={{ textDecoration: "none" }}>
          ← All projects
        </Link>
      </div>

      <div className="pm-details-header">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              alignItems: "center",
            }}
          >
            <h1 className="shell-page-title" style={{ margin: 0 }}>
              {project.title}
            </h1>
            <span className={`pm-badge pm-badge-${project.status}`}>
              {statusLabel(project.status)}
            </span>
          </div>
          <p className="shell-page-lead" style={{ marginTop: "0.5rem" }}>
            {project.description || "No description yet."}
          </p>
          <div className="pm-card-meta" style={{ marginTop: "0.35rem" }}>
            {[project.schoolYear, project.grade, project.subject, project.curriculum]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>

        <div className="pm-card-actions" style={{ marginTop: 0 }}>
          <Link
            className="pm-btn pm-btn-primary"
            to={`/studio/${project.id}`}
          >
            Open workspace
          </Link>
          <button
            type="button"
            className="pm-btn"
            onClick={() => setEditOpen(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="pm-btn"
            onClick={() => {
              const copy = duplicateProject(project.id);
              navigate(`/projects/${copy.id}`);
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="pm-btn"
            onClick={() => {
              const next: ProjectStatus =
                project.status === "archived" ? "active" : "archived";
              setProjectStatus(project.id, next);
            }}
          >
            {project.status === "archived" ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            className="pm-btn pm-btn-danger"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {color ? (
        <div className="pm-cover-bar" style={{ background: color.swatch }} />
      ) : null}

      <section className="shell-section" style={{ marginTop: "1.5rem" }}>
        <h2 className="shell-section-title">Metadata</h2>
        <div className="pm-list">
          <div className="pm-row">
            <span>School year</span>
            <strong>{project.schoolYear || "—"}</strong>
          </div>
          <div className="pm-row">
            <span>Class</span>
            <strong>{project.grade || "—"}</strong>
          </div>
          <div className="pm-row">
            <span>Subject</span>
            <strong>{project.subject || "—"}</strong>
          </div>
          <div className="pm-row">
            <span>Curriculum</span>
            <strong>{project.curriculum || "—"}</strong>
          </div>
          <div className="pm-row">
            <span>Created</span>
            <strong>{formatAbsoluteDate(project.createdAt)}</strong>
          </div>
          <div className="pm-row">
            <span>Updated</span>
            <strong>{formatRelativeTime(project.updatedAt)}</strong>
          </div>
        </div>
      </section>

      <div className="pm-stats">
        <div className="pm-stat">
          <span className="pm-card-meta">Educational assets</span>
          <strong>{assets}</strong>
        </div>
        <div className="pm-stat">
          <span className="pm-card-meta">Resource slots</span>
          <strong>{project.resources.length}</strong>
        </div>
        <div className="pm-stat">
          <span className="pm-card-meta">Status</span>
          <strong style={{ fontSize: "1.1rem" }}>
            {statusLabel(project.status)}
          </strong>
        </div>
      </div>

      <section className="shell-section">
        <h2 className="shell-section-title">Recent assets</h2>
        {recentAssets.length === 0 ? (
          <div className="pm-empty" style={{ marginTop: "0.75rem", padding: "2rem" }}>
            <div className="pm-empty-art" aria-hidden="true" />
            <h2>No assets yet</h2>
            <p>
              Open the workspace to build lessons, assessments, presentations,
              and more for this project.
            </p>
            <Link
              className="pm-btn pm-btn-primary"
              to={`/studio/${project.id}`}
              style={{ display: "inline-flex" }}
            >
              Open workspace
            </Link>
          </div>
        ) : (
          <div className="pm-list">
            {recentAssets.map((asset) => (
              <div key={asset.id} className="pm-row">
                <div>
                  <div className="shell-row-title">{asset.label}</div>
                  <div className="shell-row-meta">{asset.type}</div>
                </div>
                <span className={`pm-badge pm-badge-${asset.status === "ready" ? "active" : "draft"}`}>
                  {asset.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="shell-section">
        <h2 className="shell-section-title">Activity timeline</h2>
        <div className="pm-list">
          {timeline.map((item) => (
            <div key={item.id} className="pm-row">
              <div>
                <div className="shell-row-title">{item.title}</div>
                <div className="shell-row-meta">{item.detail}</div>
              </div>
              <span className="shell-row-meta">
                {formatRelativeTime(item.at)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <EditProjectModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        isTitleTaken={isTitleTaken}
        onSave={(input) => updateProject(project.id, input)}
      />

      <DeleteConfirmation
        open={deleteOpen}
        projectTitle={project.title}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteProject(project.id);
          navigate("/projects");
        }}
      />
    </div>
  );
}

export default ProjectDetails;
