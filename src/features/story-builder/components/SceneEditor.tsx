import { useState } from "react";
import { SCENE_TYPES } from "../constants";
import { useStoryBuilder } from "../hooks/useStoryBuilder";
import type { SceneType } from "../types";

export function SceneEditor() {
  const {
    story,
    addScene,
    updateScene,
    removeScene,
    moveScene,
    addChoice,
    updateChoice,
  } = useStoryBuilder();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const scenes = [...story.scenes].sort((a, b) => a.order - b.order);

  return (
    <section>
      <div className="sb-card-head">
        <div>
          <h2 className="sb-section-title">Scene</h2>
          <p className="sb-lead">
            Introducere, dialog, provocări, decizii, explorare, reflecție, final.
          </p>
        </div>
      </div>
      <div className="sb-actions" style={{ marginBottom: "0.85rem" }}>
        {SCENE_TYPES.slice(0, 6).map((t) => (
          <button
            key={t.id}
            type="button"
            className="sb-btn"
            onClick={() => addScene(t.id)}
          >
            + {t.label}
          </button>
        ))}
        <select
          className="sb-select"
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return;
            addScene(e.target.value as SceneType);
            e.target.value = "";
          }}
        >
          <option value="">Mai multe tipuri…</option>
          {SCENE_TYPES.slice(6).map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {scenes.length === 0 ? (
        <div className="sb-empty">
          Generează povestea cu AI sau adaugă prima scenă.
        </div>
      ) : (
        scenes.map((scene, index) => (
          <div
            key={scene.id}
            className={["sb-card", dragIndex === index ? "is-dragging" : ""].join(
              " ",
            )}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              moveScene(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            <div className="sb-card-head">
              <span className="sb-drag">
                ⋮⋮ {SCENE_TYPES.find((t) => t.id === scene.type)?.label}
              </span>
              <button
                type="button"
                className="sb-btn sb-btn-ghost sb-btn-danger"
                onClick={() => removeScene(scene.id)}
              >
                Șterge
              </button>
            </div>
            <div className="sb-grid-2">
              <label className="sb-field">
                Titlu
                <input
                  className="sb-input"
                  value={scene.title}
                  onChange={(e) =>
                    updateScene(scene.id, { title: e.target.value })
                  }
                />
              </label>
              <label className="sb-field">
                Tip
                <select
                  className="sb-select"
                  value={scene.type}
                  onChange={(e) =>
                    updateScene(scene.id, {
                      type: e.target.value as SceneType,
                    })
                  }
                >
                  {SCENE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="sb-field">
              Narațiune
              <textarea
                className="sb-textarea"
                value={scene.narration}
                onChange={(e) =>
                  updateScene(scene.id, { narration: e.target.value })
                }
              />
            </label>
            <label className="sb-field">
              Dialog
              <textarea
                className="sb-textarea"
                value={scene.dialogue ?? ""}
                onChange={(e) =>
                  updateScene(scene.id, { dialogue: e.target.value })
                }
              />
            </label>
            <div className="sb-grid-2">
              <label className="sb-field">
                Provocare
                <textarea
                  className="sb-textarea"
                  value={scene.challenge ?? ""}
                  onChange={(e) =>
                    updateScene(scene.id, { challenge: e.target.value })
                  }
                />
              </label>
              <label className="sb-field">
                Activitate
                <textarea
                  className="sb-textarea"
                  value={scene.activity ?? ""}
                  onChange={(e) =>
                    updateScene(scene.id, { activity: e.target.value })
                  }
                />
              </label>
            </div>
            {(scene.type === "decision" || scene.choices.length > 0) && (
              <div>
                <div className="sb-card-head">
                  <strong>Alegeri (branching)</strong>
                  <button
                    type="button"
                    className="sb-btn"
                    onClick={() => addChoice(scene.id)}
                  >
                    + Alegere
                  </button>
                </div>
                {scene.choices.map((choice) => (
                  <div key={choice.id} className="sb-grid-2">
                    <label className="sb-field">
                      Text
                      <input
                        className="sb-input"
                        value={choice.label}
                        onChange={(e) =>
                          updateChoice(scene.id, choice.id, {
                            label: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="sb-field">
                      Scenă țintă
                      <select
                        className="sb-select"
                        value={choice.targetSceneId ?? ""}
                        onChange={(e) =>
                          updateChoice(scene.id, choice.id, {
                            targetSceneId: e.target.value || undefined,
                          })
                        }
                      >
                        <option value="">—</option>
                        {scenes
                          .filter((s) => s.id !== scene.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </section>
  );
}
