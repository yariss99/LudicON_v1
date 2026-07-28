import type { PlannedMaterialId } from "../../blueprint-review/types";
import { EMPTY_SECTION_HINT, PLANNED_MATERIAL_OPTIONS } from "../constants";
import EditableCard from "./EditableCard";

type MaterialsChecklistCardProps = {
  collapsed: boolean;
  onToggle: () => void;
  selected: PlannedMaterialId[];
  onChange: (selected: PlannedMaterialId[]) => void;
  readOnly?: boolean;
};

function MaterialsChecklistCard({
  collapsed,
  onToggle,
  selected,
  onChange,
  readOnly,
}: MaterialsChecklistCardProps) {
  const toggle = (id: PlannedMaterialId) => {
    if (readOnly) return;
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
      return;
    }
    onChange([...selected, id]);
  };

  return (
    <EditableCard
      id="lesson-card-materials"
      title="Materiale de creat"
      collapsed={collapsed}
      onToggle={onToggle}
      readOnly={readOnly}
      hint={
        selected.length === 0
          ? EMPTY_SECTION_HINT
          : "Alege ce materiale vrei să pregătim pentru clasă."
      }
      showAddInfo={selected.length === 0 && !readOnly}
      onAddInfo={() => onChange(["worksheet"])}
    >
      <ul className="space-y-2">
        {PLANNED_MATERIAL_OPTIONS.map((option) => {
          const checked = selected.includes(option.id);
          return (
            <li key={option.id}>
              <label
                className={[
                  "flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100",
                  readOnly
                    ? "cursor-default opacity-80"
                    : "cursor-pointer hover:bg-slate-100/80",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={readOnly}
                  onChange={() => toggle(option.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-sky-400"
                />
                <span className="text-sm font-medium text-slate-800">
                  {option.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </EditableCard>
  );
}

export default MaterialsChecklistCard;
