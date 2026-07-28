import type { ProjectSortOption } from "../../../types/project";
import { PROJECT_SORT_OPTIONS } from "../../../utils/projectSort";

type ProjectSortSelectProps = {
  value: ProjectSortOption;
  onChange: (value: ProjectSortOption) => void;
};

function ProjectSortSelect({ value, onChange }: ProjectSortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-500">
      <span className="shrink-0">Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ProjectSortOption)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      >
        {PROJECT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ProjectSortSelect;
