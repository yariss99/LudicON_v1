import type { DashboardStat } from "../../types/dashboard";
import { dashboardRo } from "../../i18n";
import SectionHeader from "../ui/SectionHeader";

const { sections } = dashboardRo;

type StatCardProps = {
  stat: DashboardStat;
};

function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;

  return (
    <div className="flex items-center gap-3 rounded-2xl px-1 py-1">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold tracking-tight text-slate-800">
          {stat.value}
        </p>
        <p className="truncate text-xs text-slate-500">{stat.label}</p>
      </div>

      {stat.trend && (
        <span className="shrink-0 text-[11px] font-medium text-emerald-600">
          {stat.trend}
        </span>
      )}
    </div>
  );
}

type StatisticsProps = {
  stats: DashboardStat[];
};

function Statistics({ stats }: StatisticsProps) {
  return (
    <section className="opacity-80">
      <SectionHeader title={sections.overview} size="subtle" />
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}

export default Statistics;
export { StatCard };
