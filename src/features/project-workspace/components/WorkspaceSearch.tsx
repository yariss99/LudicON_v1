import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

/** Instant client-side search — no page reload. */
export function WorkspaceSearch({ value, onChange, resultCount }: Props) {
  return (
    <label className="relative block">
      <span className="sr-only">Search project resources</span>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search lessons, worksheets, games…"
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
      />
      {value.trim() ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums text-slate-400">
          {resultCount}
        </span>
      ) : null}
    </label>
  );
}
