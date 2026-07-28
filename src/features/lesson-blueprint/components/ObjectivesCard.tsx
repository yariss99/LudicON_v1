import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState, type DragEvent } from "react";
import { EMPTY_SECTION_HINT } from "../constants";
import EditableCard from "./EditableCard";

type ObjectivesCardProps = {
  collapsed: boolean;
  onToggle: () => void;
  items: string[];
  onChange: (items: string[]) => void;
  readOnly?: boolean;
};

function ObjectivesCard({
  collapsed,
  onToggle,
  items,
  onChange,
  readOnly,
}: ObjectivesCardProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const updateAt = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const add = () => onChange([...items, ""]);
  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index));
  const duplicate = (index: number) => {
    const source = items[index];
    if (source === undefined) return;
    const next = [...items];
    next.splice(index + 1, 0, source);
    onChange(next);
  };

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
      id="lesson-card-objectives"
      title="Obiective"
      collapsed={collapsed}
      onToggle={onToggle}
      readOnly={readOnly}
      hint={
        items.length === 0
          ? EMPTY_SECTION_HINT
          : "Trage pentru a reordona. Obiectivele sunt numerotate automat."
      }
      showAddInfo={items.length === 0 && !readOnly}
      onAddInfo={add}
    >
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`obj-${index}`}
              draggable={!readOnly}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={() => setDragIndex(null)}
              className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
            >
              <div className="mb-2 flex items-center gap-2">
                {!readOnly ? (
                  <span className="cursor-grab text-slate-300" aria-hidden>
                    <GripVertical size={16} />
                  </span>
                ) : null}
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <div className="ml-auto flex gap-1">
                  {!readOnly ? (
                    <>
                      <button
                        type="button"
                        onClick={() => duplicate(index)}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                        aria-label="Duplică"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                        aria-label="Șterge"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              <textarea
                value={item}
                disabled={readOnly}
                onChange={(e) => updateAt(index, e.target.value)}
                rows={2}
                placeholder="Ce vor putea face elevii la final…"
                className="w-full resize-y border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-70"
              />
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
                Adaugă obiectiv
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </EditableCard>
  );
}

export default ObjectivesCard;
