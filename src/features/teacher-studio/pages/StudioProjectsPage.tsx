import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { ProjectCard } from "../components/ProjectCard";
import { useTeacherStudio } from "../context/TeacherStudioContext";

type ProjectFilter = "all" | "favorites" | "recent" | "archived" | "templates";

export function StudioProjectsPage() {
  const { projects, toggleFavorite, openProject } = useProjects();
  const { setActiveProjectId } = useTeacherStudio();
  const [params] = useSearchParams();
  // Seeded by the top bar search, which navigates here with `?q=`.
  const [query, setQuery] = useState(() => params.get("q") ?? "");
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

  const hasNoProjects = projects.length === 0;

  return (
    <div>
      <header className="ts-block-head">
        <div>
          <h1 className="ts-page-title">Proiectele mele</h1>
          <p className="ts-page-lead">
            Toate evaluările și resursele la care ai lucrat.
          </p>
        </div>
        <Link to="/create/experience" className="ts-icon-btn">
          <Sparkles size={15} aria-hidden />
          Creează ceva nou
        </Link>
      </header>

      {hasNoProjects ? (
        <div className="ts-desk-empty" style={{ marginTop: "2rem" }}>
          <h2 className="ts-desk-empty-title">Încă nu ai niciun proiect.</h2>
          <p className="ts-desk-empty-text">
            Începe cu o idee și transform-o într-o resursă pentru clasa ta.
          </p>
          <Link to="/create/experience" className="ts-icon-btn">
            <Sparkles size={15} aria-hidden />
            Creează ceva nou
          </Link>
        </div>
      ) : (
        <>
          <div className="ts-filters" role="toolbar" aria-label="Filtre proiecte">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={["ts-filter", filter === f.id ? "is-active" : ""].join(
                  " ",
                )}
                aria-pressed={filter === f.id}
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
          </div>

          <div className="ts-section">
            {results.length === 0 ? (
              <p className="ts-page-lead">
                Niciun proiect pentru filtrele curente.
              </p>
            ) : (
              <div className="ts-project-grid">
                {results.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() => {
                      setActiveProjectId(project.id);
                      openProject(project.id);
                    }}
                    action={
                      <button
                        type="button"
                        className="ts-project-fav-btn"
                        aria-pressed={Boolean(project.favorite)}
                        aria-label={
                          project.favorite
                            ? `Elimină „${project.title}” de la favorite`
                            : `Adaugă „${project.title}” la favorite`
                        }
                        onClick={() => toggleFavorite(project.id)}
                      >
                        {project.favorite ? "★" : "☆"}
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
