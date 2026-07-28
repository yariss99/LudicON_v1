import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { QuickAction } from "../../types/dashboard";
import SurfaceCard from "../ui/SurfaceCard";
import SectionHeader from "../ui/SectionHeader";

type QuickActionCardProps = {
  action: QuickAction;
};

function QuickActionCard({ action }: QuickActionCardProps) {
  const Icon = action.icon;

  return (
    <Link to={action.href} className="group block h-full">
      <SurfaceCard hover padding="md" className="h-full">
        <div className="flex h-full flex-col gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.iconClass}`}
          >
            <Icon size={22} />
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700">
                {action.title}
              </h3>
              <ArrowUpRight
                size={16}
                className="shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              {action.description}
            </p>
          </div>
        </div>
      </SurfaceCard>
    </Link>
  );
}

type QuickActionsProps = {
  actions: QuickAction[];
};

function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section>
      <SectionHeader
        title="Quick Actions"
        subtitle="Start creating with specialized builders"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
export { QuickActionCard };
