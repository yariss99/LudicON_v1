import { useEffect, useMemo, useState } from "react";
import { COMMANDS } from "../constants";
import { useAiCopilot } from "../hooks/useAiCopilot";
import type { CommandId } from "../types";

export function CommandPalette() {
  const { commandOpen, setCommandOpen, runCommand } = useAiCopilot();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...COMMANDS];
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q)),
    );
  }, [query]);

  useEffect(() => {
    if (!commandOpen) {
      setQuery("");
      setActive(0);
    }
  }, [commandOpen]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!commandOpen) return null;

  const run = (id: CommandId) => runCommand(id);

  return (
    <div
      className="ac-cmd-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setCommandOpen(false);
      }}
    >
      <div className="ac-cmd" role="dialog" aria-label="Command palette">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command…"
          aria-label="Command search"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setCommandOpen(false);
              return;
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, items.length - 1));
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
              return;
            }
            if (e.key === "Enter" && items[active]) {
              e.preventDefault();
              run(items[active].id);
            }
          }}
        />
        <div className="ac-cmd-list">
          {items.length === 0 ? (
            <div style={{ padding: "0.85rem", color: "#9ca3af", fontSize: "0.875rem" }}>
              No matching commands
            </div>
          ) : (
            items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`ac-cmd-item${index === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => run(item.id)}
              >
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
