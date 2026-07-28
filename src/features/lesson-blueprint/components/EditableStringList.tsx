import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState, type DragEvent } from "react";
import { EMPTY_SECTION_HINT } from "../constants";

type EditableStringListProps = {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  enableDrag?: boolean;
};

function EditableStringList({
  items,
  onChange,
  placeholder = "Scrie aici…",
  addLabel = "Adaugă",
  enableDrag = true,
}: EditableStringListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const updateAt = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  const onDragStart = (index: number) => {
    if (!enableDrag) return;
    setDragIndex(index);
  };

  const onDragOver = (event: DragEvent, index: number) => {
    if (!enableDrag || dragIndex === null) return;
    event.preventDefault();
    if (dragIndex === index) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    if (moved === undefined) return;
    next.splice(index, 0, moved);
    setDragIndex(index);
    onChange(next);
  };

  const onDragEnd = () => setDragIndex(null);

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-500">
          {EMPTY_SECTION_HINT}
        </p>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={14} aria-hidden />
          {addLabel}
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`item-${index}`}
          draggable={enableDrag}
          onDragStart={() => onDragStart(index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragEnd={onDragEnd}
          className={[
            "flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100",
            dragIndex === index ? "opacity-70 ring-sky-200" : "",
          ].join(" ")}
        >
          {enableDrag ? (
            <span
              className="cursor-grab text-slate-300 active:cursor-grabbing"
              aria-hidden
            >
              <GripVertical size={16} />
            </span>
          ) : null}
          <input
            value={item}
            onChange={(e) => updateAt(index, e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => removeAt(index)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
            aria-label="Șterge"
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={addItem}
          className="mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <Plus size={14} aria-hidden />
          {addLabel}
        </button>
      </li>
    </ul>
  );
}

export default EditableStringList;
