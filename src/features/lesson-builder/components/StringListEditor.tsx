import { useState } from "react";

type Props = {
  items: readonly string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
};

export function StringListEditor({
  items,
  onChange,
  placeholder = "Element nou",
  addLabel = "Adaugă",
}: Props) {
  const [draft, setDraft] = useState("");

  return (
    <div className="lb-list-editor">
      {items.map((item, index) => (
        <div key={`${index}-${item.slice(0, 12)}`} className="lb-list-row">
          <input
            className="lb-input"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="lb-btn lb-btn-ghost lb-btn-danger"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            Șterge
          </button>
        </div>
      ))}
      <div className="lb-list-row">
        <input
          className="lb-input"
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
          className="lb-btn"
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...items, draft.trim()]);
            setDraft("");
          }}
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}
