import SurfaceCard from "../../../components/ui/SurfaceCard";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

type RecentActivityProps = {
  items: readonly ActivityItem[];
};

function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section aria-labelledby="teaching-timeline">
      <h2
        id="teaching-timeline"
        className="mb-4 text-lg font-semibold text-slate-900"
      >
        Teaching Timeline
      </h2>
      <SurfaceCard padding="none" bordered className="overflow-hidden">
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Your teaching timeline will appear here
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Blueprint updates, resources, and assessments will show as you teach.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="px-5 py-4">
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                <p className="mt-2 text-xs text-slate-400">{item.time}</p>
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </section>
  );
}

export default RecentActivity;
