import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import type { Project, ProjectStatus } from "../../../types/project";
import {
  PROJECT_GRADES,
  PROJECT_SCHOOL_YEARS,
  PROJECT_STATUSES,
  PROJECT_SUBJECTS,
} from "../constants";
import { CreateProjectModal } from "./CreateProjectModal";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { EditProjectModal } from "./EditProjectModal";
import { ProjectCard } from "./ProjectCard";
import "../styles/projects.css";

type SortOption = "updated" | "alpha" | "created";

function filterProjects(
  projects: Project[],
  query: string,
  schoolYear: string,
  klass: string,
  subject: string,
  status: string,
): Project[] {
  const q = query.trim().toLowerCase();
  return projects.filter((project) => {
    if (schoolYear && project.schoolYear !== schoolYear) return false;
    if (klass && project.grade !== klass) return false;
    if (subject && project.subject !== subject) return false;
    if (status && project.status !== status) return false;
    if (!q) return true;
    const haystack = [
      project.title,
      project.description,
      project.subject,
      project.grade,
      project.curriculum,
      project.schoolYear,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

function sortProjects(projects: Project[], sort: SortOption): Project[] {
  const next = [...projects];
  if (sort === "alpha") {
    next.sort((a, b) => a.title.localeCompare(b.title, "ro"));
  } else if (sort === "created") {
    next.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } else {
    next.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }
  return next;
}

export function ProjectsDashboard() {
  const navigate = useNavigate();
  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    setProjectStatus,
    isTitleTaken,
  } = useProjects();

  const [booting, setBooting] = useState(true);
  const [query, setQuery] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [klass, setKlass] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<SortOption>("updated");

  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 420);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = useMemo(
    () =>
      sortProjects(
        filterProjects(projects, query, schoolYear, klass, subject, status),
        sort,
      ),
    [projects, query, schoolYear, klass, subject, status, sort],
  );

  const hasAny = projects.length > 0;
  const filtersActive = Boolean(query || schoolYear || klass || subject || status);

  return (
    <div className="pm">
      <header>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 className="shell-page-title">Projects</h1>
            <p className="shell-page-lead">
              Everything in P.R.R.I.M.A. ON belongs to a project.
            </p>
          </div>
          <button
            type="button"
            className="pm-btn pm-btn-primary"
            style={{ minHeight: 40, paddingInline: "1rem" }}
            onClick={() => navigate("/projects/new")}
          >
            New project
          </button>
        </div>
      </header>

      {hasAny ? (
        <div className="pm-toolbar">
          <label className="pm-search">
            <span aria-hidden="true" style={{ color: "#9ca3af" }}>
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              aria-label="Search projects"
            />
          </label>

          <div className="pm-filters">
            <select
              className="pm-select"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              aria-label="Filter by school year"
            >
              <option value="">School year</option>
              {PROJECT_SCHOOL_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              className="pm-select"
              value={klass}
              onChange={(e) => setKlass(e.target.value)}
              aria-label="Filter by class"
            >
              <option value="">Class</option>
              {PROJECT_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>

            <select
              className="pm-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-label="Filter by subject"
            >
              <option value="">Subject</option>
              {PROJECT_SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              className="pm-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">Status</option>
              {PROJECT_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              className="pm-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label="Sort projects"
            >
              <option value="updated">Recently Updated</option>
              <option value="alpha">Alphabetical</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
        </div>
      ) : null}

      {booting ? (
        <div className="pm-grid" aria-busy="true" aria-label="Loading projects">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="pm-skeleton" />
          ))}
        </div>
      ) : !hasAny ? (
        <div className="pm-empty">
          <div className="pm-empty-art" aria-hidden="true" />
          <h2>Create your first project</h2>
          <p>
            Projects are the foundation of P.R.R.I.M.A. ON. Lessons, assessments,
            stories, and resources all live inside a project.
          </p>
          <button
            type="button"
            className="pm-btn pm-btn-primary"
            style={{ minHeight: 40, paddingInline: "1.1rem" }}
            onClick={() => navigate("/projects/new")}
          >
            Create project
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="pm-empty">
          <div className="pm-empty-art" aria-hidden="true" />
          <h2>No matching projects</h2>
          <p>
            {filtersActive
              ? "Try clearing search or filters to see more projects."
              : "Nothing to show yet."}
          </p>
          <button
            type="button"
            className="pm-btn"
            onClick={() => {
              setQuery("");
              setSchoolYear("");
              setKlass("");
              setSubject("");
              setStatus("");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="pm-grid">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={setEditProject}
              onDuplicate={(item) => {
                const copy = duplicateProject(item.id);
                navigate(`/projects/${copy.id}`);
              }}
              onArchive={(item) => {
                const next: ProjectStatus =
                  item.status === "archived" ? "active" : "archived";
                setProjectStatus(item.id, next);
              }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isTitleTaken={isTitleTaken}
          onCreate={(input) => {
          const created = createProject(input);
          navigate(`/studio/${created.id}/overview`);
        }}
      />

      <EditProjectModal
        open={Boolean(editProject)}
        project={editProject}
        onClose={() => setEditProject(null)}
        isTitleTaken={isTitleTaken}
        onSave={(input) => {
          if (!editProject) return;
          updateProject(editProject.id, input);
        }}
      />

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        projectTitle={deleteTarget?.title ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteProject(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default ProjectsDashboard;
