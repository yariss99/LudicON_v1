import { useState } from "react";

type Props = {
  items: readonly string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
};

export function StringListEditor({
  items,
  onChange,
  placeholder = "Element nou",
}: Props) {
  const [draft, setDraft] = useState("");
  return (
    <div className="gb-list-editor">
      {items.map((item, index) => (
        <div key={`${index}-${item.slice(0, 12)}`} className="gb-list-row">
          <input
            className="gb-input"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="gb-btn gb-btn-ghost gb-btn-danger"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            Șterge
          </button>
        </div>
      ))}
      <div className="gb-list-row">
        <input
          className="gb-input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          className="gb-btn"
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...items, draft.trim()]);
            setDraft("");
          }}
        >
          Adaugă
        </button>
      </div>
    </div>
  );
}
