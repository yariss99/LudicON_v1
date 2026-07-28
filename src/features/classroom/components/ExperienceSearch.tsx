import { Link } from "react-router-dom";
import type {
  ClassroomSearchHit,
  ClassroomSearchQuery,
} from "../../../types/classroom";

type Facets = {
  competencies: string[];
  topics: string[];
  methods: string[];
  resources: string[];
  schoolYears: string[];
};

type ExperienceSearchProps = {
  query: ClassroomSearchQuery;
  onChange: (next: ClassroomSearchQuery) => void;
  facets: Facets;
  hits: ClassroomSearchHit[];
};

function ExperienceSearch({
  query,
  onChange,
  facets,
  hits,
}: ExperienceSearchProps) {
  const patch = (partial: Partial<ClassroomSearchQuery>) =>
    onChange({ ...query, ...partial });

  return (
    <section>
      <header className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Search memory
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          Find what you learned
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Competency · topic · method · resource · school year · feedback
        </p>
      </header>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
        <input
          type="search"
          value={query.text}
          onChange={(event) => patch({ text: event.target.value })}
          placeholder="Search your experience memory…"
          className="w-full rounded-xl border-0 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200/80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <FacetSelect
            label="Competency"
            value={query.competency ?? ""}
            options={facets.competencies}
            onChange={(competency) => patch({ competency })}
          />
          <FacetSelect
            label="Topic"
            value={query.topic ?? ""}
            options={facets.topics}
            onChange={(topic) => patch({ topic })}
          />
          <FacetSelect
            label="Method"
            value={query.method ?? ""}
            options={facets.methods}
            onChange={(method) => patch({ method })}
          />
          <FacetSelect
            label="Resource"
            value={query.resource ?? ""}
            options={facets.resources}
            onChange={(resource) => patch({ resource })}
          />
          <FacetSelect
            label="School year"
            value={query.schoolYear ?? ""}
            options={facets.schoolYears}
            onChange={(schoolYear) => patch({ schoolYear })}
          />
          <label className="block text-[11px] font-medium text-slate-500">
            Feedback
            <select
              value={query.feedback ?? ""}
              onChange={(event) =>
                patch({
                  feedback: event.target.value as ClassroomSearchQuery["feedback"],
                })
              }
              className="mt-1 w-full rounded-xl border-0 bg-slate-50 px-2.5 py-2 text-sm text-slate-700 ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">Any</option>
              <option value="positive">Positive</option>
              <option value="mixed">Mixed</option>
              <option value="needs_work">Needs work</option>
            </select>
          </label>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {hits.map((hit) => (
          <li key={hit.projectId}>
            <Link
              to={`/studio/${hit.projectId}`}
              className="block rounded-2xl bg-white px-4 py-3 no-underline ring-1 ring-slate-200/60 transition-shadow hover:shadow-md hover:shadow-slate-900/[0.04]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {hit.title}
                </p>
                <span className="text-[11px] text-slate-400">
                  {hit.schoolYear}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {hit.subject} · {hit.grade}
              </p>
              {hit.feedbackPreview ? (
                <p className="mt-2 text-xs italic text-slate-500">
                  “{hit.feedbackPreview}”
                </p>
              ) : null}
              {hit.matchedOn.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {hit.matchedOn.map((facet) => (
                    <span
                      key={facet}
                      className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                    >
                      {facet.replace("_", " ")}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FacetSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-[11px] font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border-0 bg-slate-50 px-2.5 py-2 text-sm text-slate-700 ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ExperienceSearch;
