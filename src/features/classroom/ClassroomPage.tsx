import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Brain, Sparkles } from "lucide-react";
import { classroomService } from "../../services/classroomService";
import { useProjects } from "../../context/ProjectContext";
import EvolutionTimeline from "./components/EvolutionTimeline";
import ExperienceSearch from "./components/ExperienceSearch";
import HistorySuggestions from "./components/HistorySuggestions";
import InsightsPanel from "./components/InsightsPanel";
import VersionRestoreDialog from "./components/VersionRestoreDialog";
import { useClassroomIntelligence } from "./hooks/useClassroomIntelligence";
import type { ExperienceVersion } from "../../types/classroom";

function ClassroomPage() {
  const navigate = useNavigate();
  const { refresh: refreshProjects } = useProjects();
  const [params] = useSearchParams();
  const initialProject = params.get("project") ?? undefined;

  const {
    insights,
    suggestions,
    facets,
    hits,
    query,
    setQuery,
    selectedProjectId,
    setSelectedProjectId,
    evolution,
    experienceOptions,
    restoreVersion,
  } = useClassroomIntelligence(initialProject);

  const [pendingVersion, setPendingVersion] =
    useState<ExperienceVersion | null>(null);

  const selectedTitle = useMemo(
    () =>
      experienceOptions.find((o) => o.id === selectedProjectId)?.title ??
      "this experience",
    [experienceOptions, selectedProjectId],
  );

  const confirmRestore = () => {
    if (!pendingVersion) return;
    const project = restoreVersion(pendingVersion.id);
    refreshProjects();
    setPendingVersion(null);
    if (project) {
      navigate(`/studio/${project.id}`);
    }
  };

  return (
    <div className="classroom-shell min-h-screen text-slate-900 antialiased">
      <div className="classroom-atmosphere pointer-events-none fixed inset-0" aria-hidden />

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">PRIMA</p>
            <p className="text-[11px] text-slate-400">Classroom Intelligence</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/dna"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline hover:bg-white/80 hover:text-slate-800"
          >
            DNA
          </Link>
          <Link
            to="/timeline"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline hover:bg-white/80 hover:text-slate-800"
          >
            Timeline
          </Link>
          <Link
            to="/desk"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline hover:bg-white/80 hover:text-slate-800"
          >
            Desk
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/60">
            <Brain size={13} />
            Teacher memory · never student profiles
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.15rem]">
            Learn from your own teaching
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            PRIMA remembers what worked in your classroom — patterns, versions,
            and reflections — so you feel yourself becoming a better teacher.
            You always decide.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <InsightsPanel insights={insights} />
          <HistorySuggestions suggestions={suggestions} />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <div className="mb-4">
              <label className="text-[11px] font-medium text-slate-500">
                Experience
                <select
                  value={selectedProjectId}
                  onChange={(event) =>
                    setSelectedProjectId(event.target.value)
                  }
                  className="mt-1 block w-full max-w-md rounded-xl border-0 bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {experienceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <EvolutionTimeline
              title={selectedTitle}
              points={evolution}
              onOpenVersion={(versionId) => {
                const version = classroomService.getVersion(versionId);
                if (version) setPendingVersion(version);
              }}
            />
          </div>

          <ExperienceSearch
            query={query}
            onChange={setQuery}
            facets={facets}
            hits={hits}
          />
        </div>
      </main>

      {pendingVersion ? (
        <VersionRestoreDialog
          version={pendingVersion}
          onConfirm={confirmRestore}
          onCancel={() => setPendingVersion(null)}
        />
      ) : null}
    </div>
  );
}

export default ClassroomPage;
