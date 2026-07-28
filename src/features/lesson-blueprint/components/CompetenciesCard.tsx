import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState, type DragEvent } from "react";
import { EMPTY_SECTION_HINT } from "../constants";
import EditableCard from "./EditableCard";

type CompetenciesCardProps = {
  collapsed: boolean;
  onToggle: () => void;
  items: string[];
  onChange: (items: string[]) => void;
  readOnly?: boolean;
};

function CompetenciesCard({
  collapsed,
  onToggle,
  items,
  onChange,
  readOnly,
}: CompetenciesCardProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const updateAt = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const add = () => onChange([...items, ""]);
  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index));

  const onDragOver = (event: DragEvent, index: number) => {
    if (readOnly || dragIndex === null) return;
    event.preventDefault();
    if (dragIndex === index) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    if (moved === undefined) return;
    next.splice(index, 0, moved);
    setDragIndex(index);
    onChange(next);
  };

  return (
    <EditableCard
      id="lesson-card-competencies"
      title="Competențe"
      collapsed={collapsed}
      onToggle={onToggle}
      readOnly={readOnly}
      hint={items.length === 0 ? EMPTY_SECTION_HINT : undefined}
      showAddInfo={items.length === 0 && !readOnly}
      onAddInfo={add}
    >
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`comp-${index}`}
              draggable={!readOnly}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={() => setDragIndex(null)}
              className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
            >
              <div className="flex items-start gap-2">
                {!readOnly ? (
                  <span className="mt-1 cursor-grab text-slate-300" aria-hidden>
                    <GripVertical size={16} />
                  </span>
                ) : null}
                <textarea
                  value={item}
                  disabled={readOnly}
                  onChange={(e) => updateAt(index, e.target.value)}
                  rows={2}
                  placeholder="Competența pe care o întărește lecția…"
                  className="min-w-0 flex-1 resize-y border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-70"
                />
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                    aria-label="Șterge"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
          {!readOnly ? (
            <li>
              <button
                type="button"
                onClick={add}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <Plus size={14} aria-hidden />
                Adaugă competență
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </EditableCard>
  );
}

export default CompetenciesCard;
