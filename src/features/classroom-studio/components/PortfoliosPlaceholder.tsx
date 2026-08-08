import { FUTURE_PLACEHOLDERS } from "../constants";

export function PortfoliosPlaceholder() {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">
        Student Portfolios
      </h2>
      <p className="mt-1 max-w-xl text-sm text-slate-500">
        Placeholder — portfolios will collect evidence from lessons,
        assessments, games, and stories across the project.
      </p>
      <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-slate-100" />
        <h3 className="text-lg font-semibold tracking-tight">Coming soon</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Teachers will review growth over time without leaving Classroom
          Studio.
        </p>
      </div>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {FUTURE_PLACEHOLDERS.filter((p) => p.id === "portfolios").map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500"
          >
            <span className="font-semibold text-slate-700">{p.label}</span>
            <span className="mt-0.5 block text-xs">{p.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
