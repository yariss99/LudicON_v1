import type { ProjectIconId } from "../../../types/project";
import { PROJECT_ICON_IDS } from "../constants";
import { getProjectIcon } from "../iconMap";

type IconPickerProps = {
  value: ProjectIconId;
  onChange: (icon: ProjectIconId) => void;
  accentColor: string;
};

function IconPicker({ value, onChange, accentColor }: IconPickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">Iconiță</legend>
      <div className="grid grid-cols-5 gap-2" role="listbox" aria-label="Alege iconița">
        {PROJECT_ICON_IDS.map((iconId) => {
          const Icon = getProjectIcon(iconId);
          const selected = iconId === value;
          return (
            <button
              key={iconId}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={iconId}
              onClick={() => onChange(iconId)}
              className={[
                "flex h-11 items-center justify-center rounded-xl border transition-all",
                selected
                  ? "border-transparent text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
              style={selected ? { backgroundColor: accentColor } : undefined}
            >
              <Icon size={18} strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default IconPicker;
