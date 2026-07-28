import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { AppShell } from "../components/layout";
import SurfaceCard from "../components/ui/SurfaceCard";
import Button from "../components/ui/Button";
import {
  createExamples,
  createIntentions,
} from "../data/workspaceData";

const intentRoutes: Record<string, string> = {
  lesson: "/prima/lesson",
  worksheet: "/studio/create?type=worksheet",
  assessment: "/studio/create?type=assessment",
  game: "/studio/create?type=game",
};

function Create() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preset = searchParams.get("intent") ?? "";
  const [message, setMessage] = useState(() => {
    const match = createIntentions.find((i) => i.id === preset);
    return match?.prompt ?? "";
  });

  const startHref = useMemo(() => {
    if (preset && intentRoutes[preset]) return intentRoutes[preset];
    if (message.toLowerCase().includes("evaluare")) return "/prima/lesson";
    if (message.toLowerCase().includes("joc")) return "/studio/create?type=game";
    if (
      message.toLowerCase().includes("fișă") ||
      message.toLowerCase().includes("fisa")
    )
      return "/studio/create?type=worksheet";
    return "/prima/lesson";
  }, [message, preset]);

  function handleStart() {
    navigate(startHref);
  }

  return (
    <AppShell variant="partner">
      <header className="mb-10 text-center sm:text-left">
        <p className="text-sm font-medium text-blue-600">Create</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Ce vrei să pregătești?
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-500">
          Spune-i lui PRIMA intenția ta. Nu alegi un modul software — începi o
          conversație despre învățare.
        </p>
      </header>

      <SurfaceCard padding="lg" bordered className="mb-8">
        <label htmlFor="intention" className="sr-only">
          Intenția ta
        </label>
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessageCircle size={18} />
          </div>
          <textarea
            id="intention"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Pregătesc o lecție despre fracții pentru clasa a III-a, mâine…"
            className="min-h-[96px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[15px] leading-relaxed text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            PRIMA clarifică, propune un plan, apoi generează resurse — după
            aprobarea ta.
          </p>
          <Button
            variant="primary"
            size="default"
            onClick={handleStart}
            className="!rounded-xl !shadow-blue-600/20"
          >
            Începe cu PRIMA
            <ArrowRight size={16} />
          </Button>
        </div>
      </SurfaceCard>

      <section aria-labelledby="intentions" className="mb-10">
        <h2
          id="intentions"
          className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-400"
        >
          Sau alege o intenție
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {createIntentions.map((intention) => {
            const Icon = intention.icon;
            return (
              <Link
                key={intention.id}
                to={intention.href}
                className="group block no-underline"
              >
                <SurfaceCard
                  hover
                  padding="md"
                  bordered
                  className="h-full transition-colors group-hover:border-blue-100"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {intention.prompt}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {intention.helper}
                  </p>
                </SurfaceCard>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="examples">
        <h2
          id="examples"
          className="mb-3 text-sm font-medium text-slate-500"
        >
          Exemple
        </h2>
        <ul className="flex flex-col gap-2">
          {createExamples.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => setMessage(example)}
                className="w-full rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900"
              >
                „{example}”
              </button>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

export default Create;
