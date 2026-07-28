import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "../components/layout";
import SurfaceCard from "../components/ui/SurfaceCard";
import Button from "../components/ui/Button";
import { useProjects } from "../context/ProjectContext";

function AiPartner() {
  const [params] = useSearchParams();
  const projectId = params.get("project");
  const { projects } = useProjects();
  const project = projects.find((p) => p.id === projectId) ?? projects[0];
  const [draft, setDraft] = useState("");
  const projectHref = project ? `/projects/${project.id}` : "/projects";

  const contextualSuggestions = useMemo(() => {
    if (!project) return [];
    const suggestions = [];
    if (project.state === "blueprint_review") {
      suggestions.push({
        id: "review",
        text: "Hai să revizuim împreună obiectivele din planul pedagogic.",
        href: "/prima/planning",
      });
    }
    if (project.resources.some((r) => r.type === "lesson" && r.status === "ready")) {
      suggestions.push({
        id: "worksheet",
        text: "Pot propune o fișă de consolidare aliniată lecției existente.",
        href: `/create?intent=worksheet&project=${project.id}`,
      });
    }
    if (project.state === "conversation") {
      suggestions.push({
        id: "continue",
        text: "Continuăm de unde am rămas — spune-mi ce vrei să finalizezi.",
        href: "/prima/lesson",
      });
    }
    suggestions.push({
      id: "explain",
      text: "Vrei să-ți explic de ce am structurat planul în felul acesta?",
      href: projectHref,
    });
    return suggestions.slice(0, 3);
  }, [project, projectHref]);

  return (
    <AppShell variant="partner">
      <header className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Sparkles size={22} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Colegul tău de design
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-500">
          Nu este un chatbot. Este colegul tău de design pedagogic — calm,
          contextual, fără întrebări repetitive.
        </p>
      </header>

      {project && (
        <SurfaceCard padding="md" bordered className="mb-6 bg-slate-50/80">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Lecția activă
          </p>
          <p className="mt-1 font-semibold text-slate-900">{project.title}</p>
          <p className="text-sm text-slate-500">
            {project.subject} · {project.grade}
          </p>
          <Link
            to={projectHref}
            className="mt-2 inline-flex text-sm font-medium text-blue-600 no-underline hover:text-blue-700"
          >
            Deschide lecția →
          </Link>
        </SurfaceCard>
      )}

      <div className="mb-8 space-y-4">
        <div className="rounded-2xl bg-slate-100/80 px-5 py-4 text-[15px] leading-relaxed text-slate-700">
          <p className="mb-1 text-xs font-medium text-slate-400">PRIMA</p>
          Am contextul lecției tale
          {project ? ` „${project.title}”` : ""}. Putem continua proiectarea,
          explica planul sau propune următorul material — fără să te întrebăm
          din nou clasa și disciplina.
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Sugestii contextuale
          </p>
          {contextualSuggestions.map((s) => (
            <Link key={s.id} to={s.href} className="block no-underline">
              <SurfaceCard
                hover
                padding="sm"
                bordered
                className="flex items-center justify-between gap-3 transition-colors hover:border-blue-100"
              >
                <span className="text-sm text-slate-700">{s.text}</span>
                <ArrowRight size={14} className="shrink-0 text-slate-300" />
              </SurfaceCard>
            </Link>
          ))}
        </div>
      </div>

      <SurfaceCard padding="md" bordered>
        <label htmlFor="partner-input" className="sr-only">
          Mesaj pentru PRIMA
        </label>
        <textarea
          id="partner-input"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Spune-mi ce vrei să îmbunătățești în această lecție…"
          className="w-full resize-none rounded-xl border-0 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        <div className="mt-3 flex justify-end">
          <Button
            to={draft.trim() ? "/prima/lesson" : `/ai?project=${project?.id ?? ""}`}
            variant="primary"
            className="!rounded-xl"
          >
            Continuă cu PRIMA
          </Button>
        </div>
      </SurfaceCard>
    </AppShell>
  );
}

export default AiPartner;
