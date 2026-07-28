import { Link } from "react-router-dom";
import { FileDown } from "lucide-react";
import { AppShell } from "../components/layout";
import SurfaceCard from "../components/ui/SurfaceCard";
import { recentResources } from "../data/dashboardData";

function Library() {
  return (
    <AppShell>
      <header className="mb-10">
        <p className="text-sm font-medium text-slate-500">Biblioteca</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Biblioteca ta
        </h1>
        <p className="mt-2 max-w-xl text-base text-slate-500">
          Lecții, evaluări și resurse salvate — gata de refolosit într-o lecție
          nouă.
        </p>
        <p className="mt-3">
          <Link
            to="/knowledge"
            className="text-sm font-semibold text-slate-800 no-underline hover:text-slate-950"
          >
            Deschide Knowledge Hub →
          </Link>
        </p>
      </header>

      <div className="grid gap-3">
        {recentResources.map((resource) => (
          <SurfaceCard
            key={resource.id}
            padding="md"
            bordered
            className="flex items-center gap-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FileDown size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{resource.title}</p>
              <p className="text-xs text-slate-500">
                {resource.type} · {resource.format} · {resource.updatedAt}
              </p>
            </div>
            <Link
              to="/create/experience"
              className="text-sm font-medium text-slate-700 no-underline hover:text-slate-900"
            >
              Reuse
            </Link>
          </SurfaceCard>
        ))}
      </div>
    </AppShell>
  );
}

export default Library;
