import type { ProjectColorId } from "../../../types/project";
import { PROJECT_COLORS } from "../constants";

type ColorPickerProps = {
  value: ProjectColorId;
  onChange: (color: ProjectColorId) => void;
};

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">Culoare</legend>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Alege culoarea">
        {PROJECT_COLORS.map((color) => {
          const selected = color.id === value;
          return (
            <button
              key={color.id}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={color.label}
              title={color.label}
              onClick={() => onChange(color.id)}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full transition-transform",
                selected
                  ? "scale-110 ring-2 ring-offset-2 ring-slate-900/20"
                  : "hover:scale-105",
              ].join(" ")}
              style={{ backgroundColor: color.swatch }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

export default ColorPicker;
