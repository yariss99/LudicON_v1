import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { useTeacherStudio } from "../context/TeacherStudioContext";

type ProjectFilter = "all" | "favorites" | "recent" | "archived" | "templates";

export function StudioProjectsPage() {
  const { projects, toggleFavorite, openProject } = useProjects();
  const { setActiveProjectId } = useTeacherStudio();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [sort, setSort] = useState<"updated" | "title">("updated");

  const results = useMemo(() => {
    let list = [...projects];
    if (filter === "favorites") list = list.filter((p) => p.favorite);
    if (filter === "archived") list = list.filter((p) => p.archived);
    if (filter === "recent") {
      list = list
        .filter((p) => !p.archived)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 8);
    }
    if (filter === "templates") {
      list = list.filter((p) =>
        (p.title + (p.subject ?? "")).toLowerCase().includes("model"),
      );
    }
    if (filter === "all") list = list.filter((p) => !p.archived);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.subject ?? "").toLowerCase().includes(q),
      );
    }

    if (sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title, "ro"));
    } else if (filter !== "recent") {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
    return list;
  }, [projects, query, filter, sort]);

  const filters: { id: ProjectFilter; label: string }[] = [
    { id: "all", label: "Toate" },
    { id: "recent", label: "Recente" },
    { id: "favorites", label: "Favorite" },
    { id: "archived", label: "Arhivate" },
    { id: "templates", label: "Șabloane" },
  ];

  return (
    <div>
      <header>
        <h1 className="ts-page-title">Proiecte</h1>
        <p className="ts-page-lead">
          Fiecare material aparține unui proiect. Caută, filtrează și deschide
          spațiul de lucru.
        </p>
      </header>

      <div className="ts-filters" role="toolbar" aria-label="Filtre proiecte">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={["ts-filter", filter === f.id ? "is-active" : ""].join(
              " ",
            )}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          className="ts-search"
          type="search"
          placeholder="Caută proiecte…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Caută proiecte"
        />
        <label className="text-sm text-slate-500">
          Sortare{" "}
          <select
            className="ml-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as "updated" | "title")}
          >
            <option value="updated">Actualizate</option>
            <option value="title">Titlu</option>
          </select>
        </label>
        <Link to="/create/experience" className="ts-icon-btn">
          Proiect nou
        </Link>
      </div>

      <div className="ts-section ts-list">
        {results.length === 0 ? (
          <p className="ts-page-lead">Niciun proiect pentru filtrele curente.</p>
        ) : (
          results.map((project) => (
            <div key={project.id} className="ts-row">
              <Link
                to={`/studio/${project.id}`}
                className="min-w-0 flex-1"
                onClick={() => {
                  setActiveProjectId(project.id);
                  openProject(project.id);
                }}
              >
                <div className="ts-row-title">{project.title}</div>
                <div className="ts-row-meta">
                  {project.subject ?? "Fără disciplină"}
                  {project.archived ? " · Arhivat" : ""}
                </div>
              </Link>
              <button
                type="button"
                className="ts-icon-btn"
                aria-pressed={Boolean(project.favorite)}
                onClick={() => toggleFavorite(project.id)}
              >
                {project.favorite ? "★ Favorit" : "☆ Favorit"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
