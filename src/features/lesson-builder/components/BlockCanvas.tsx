import { useState } from "react";
import { BLOCK_KINDS, LESSON_PHASES, REUSABLE_BLOCK_TEMPLATES } from "../constants";
import { useLessonBuilder } from "../hooks/useLessonBuilder";
import type { LessonPhaseId } from "../types";

export function BlockCanvas() {
  const {
    lesson,
    addBlock,
    addTemplateBlock,
    updateBlock,
    removeBlock,
    moveBlock,
  } = useLessonBuilder();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const blocks = [...lesson.blocks].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="lb-actions" style={{ marginBottom: "0.85rem" }}>
        {BLOCK_KINDS.map((kind) => (
          <button
            key={kind.id}
            type="button"
            className="lb-btn"
            onClick={() => addBlock(kind.id)}
          >
            + {kind.label}
          </button>
        ))}
      </div>

      <div className="lb-kicker" style={{ marginBottom: "0.45rem" }}>
        Blocuri reutilizabile
      </div>
      <div className="lb-actions" style={{ marginBottom: "1rem" }}>
        {REUSABLE_BLOCK_TEMPLATES.map((t, i) => (
          <button
            key={t.title}
            type="button"
            className="lb-btn lb-btn-ghost"
            onClick={() => addTemplateBlock(i)}
          >
            {t.title}
          </button>
        ))}
      </div>

      {blocks.length === 0 ? (
        <div className="lb-empty">
          Trage sau adaugă blocuri pentru a construi activitățile lecției.
        </div>
      ) : (
        blocks.map((block, index) => (
          <div
            key={block.id}
            className={["lb-card", dragIndex === index ? "is-dragging" : ""].join(
              " ",
            )}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              moveBlock(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            <div className="lb-card-head">
              <span className="lb-drag-handle" title="Trage pentru reordonare">
                ⋮⋮ {BLOCK_KINDS.find((k) => k.id === block.kind)?.label}
                {block.reusable ? " · reutilizabil" : ""}
              </span>
              <button
                type="button"
                className="lb-btn lb-btn-ghost lb-btn-danger"
                onClick={() => removeBlock(block.id)}
              >
                Șterge
              </button>
            </div>
            <label className="lb-field">
              Titlu
              <input
                className="lb-input"
                value={block.title}
                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
              />
            </label>
            <div className="lb-grid-2">
              <label className="lb-field">
                Fază
                <select
                  className="lb-select"
                  value={block.phaseId ?? ""}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      phaseId: (e.target.value || undefined) as
                        | LessonPhaseId
                        | undefined,
                    })
                  }
                >
                  <option value="">—</option>
                  {LESSON_PHASES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="lb-field">
                Minute
                <input
                  className="lb-input"
                  type="number"
                  min={0}
                  value={block.durationMinutes ?? 0}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      durationMinutes: Number(e.target.value) || 0,
                    })
                  }
                />
              </label>
            </div>
            <label className="lb-field">
              Conținut
              <textarea
                className="lb-textarea"
                value={block.content}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value })
                }
              />
            </label>
          </div>
        ))
      )}
    </div>
  );
}
