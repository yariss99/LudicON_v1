import { Link } from "react-router-dom";
import type { QuickAction } from "../../types/dashboard";
import { dashboardRo } from "../../i18n";

const { workspace } = dashboardRo;

type BuilderCardProps = {
  action: QuickAction;
  index: number;
};

function BuilderCard({ action, index }: BuilderCardProps) {
  const Icon = action.icon;

  return (
    <Link
      to={action.href}
      className="dashboard-card-enter group block h-full cursor-pointer"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <article className="flex min-h-[220px] flex-col rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-transparent transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(15,23,42,0.12)] hover:ring-blue-500/40">
        <div
          className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full transition-transform duration-[250ms] ease-out group-hover:scale-[1.08] ${action.iconClass}`}
        >
          <Icon size={34} strokeWidth={1.5} />
        </div>

        <h3 className="mt-6 text-[22px] font-semibold leading-tight tracking-tight text-slate-900">
          {action.title}
        </h3>
        <p className="mt-2 text-base leading-[1.6] text-[#64748B]">
          {action.description}
        </p>
      </article>
    </Link>
  );
}

type CreativeWorkspaceProps = {
  actions: QuickAction[];
};

function CreativeWorkspace({ actions }: CreativeWorkspaceProps) {
  return (
    <section aria-label={workspace.ariaLabel}>
      <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.5rem] lg:text-[3rem]">
          {workspace.heroTitle}
        </h1>

        <p className="mt-8 max-w-[640px] text-lg leading-[1.6] text-[#64748B] sm:text-xl">
          {workspace.mission}
        </p>

        <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {workspace.actionTitle}
        </h2>

        <p className="mt-4 max-w-[600px] text-base leading-[1.6] text-[#64748B] sm:text-lg">
          {workspace.helperText}
        </p>
      </header>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {actions.map((action, index) => (
          <BuilderCard key={action.id} action={action} index={index} />
        ))}
      </div>
    </section>
  );
}

export default CreativeWorkspace;
export { BuilderCard };
