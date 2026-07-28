import { Link } from "react-router-dom";
import { BookMarked, PlusCircle, Sparkles } from "lucide-react";
import SurfaceCard from "../../../components/ui/SurfaceCard";

type QuickAction = {
  id: string;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: typeof PlusCircle;
  iconClass: string;
};

type QuickActionsProps = {
  onCreateProject: () => void;
};

function QuickActions({ onCreateProject }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "create",
      title: "Creează o lecție",
      description: "Pornește de la o idee — PRIMA te ghidează până la materiale pentru clasă.",
      onClick: onCreateProject,
      icon: PlusCircle,
      iconClass: "bg-slate-900/[0.08] text-slate-900",
    },
    {
      id: "library",
      title: "Biblioteca",
      description: "Refolosește lecții, evaluări și resurse în care ai deja încredere.",
      href: "/library",
      icon: BookMarked,
      iconClass: "bg-amber-600/[0.08] text-amber-700",
    },
    {
      id: "create-flow",
      title: "Spune-mi despre lecția ta",
      description: "Deschide conversația cu PRIMA pentru a proiecta lecția.",
      href: "/create/experience",
      icon: Sparkles,
      iconClass: "bg-sky-600/[0.08] text-sky-700",
    },
  ];

  return (
    <section aria-label="Începe aici" className="mb-12">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Cu ce dorești să lucrezi astăzi?</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <SurfaceCard
              hover
              padding="lg"
              bordered
              className="h-full transition-colors group-hover:border-slate-200"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${action.iconClass}`}
              >
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {action.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {action.description}
              </p>
            </SurfaceCard>
          );

          if (action.href) {
            return (
              <Link
                key={action.id}
                to={action.href}
                className="group dashboard-card-enter block no-underline"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className="group dashboard-card-enter block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default QuickActions;
