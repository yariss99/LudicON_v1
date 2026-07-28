import {
  READING_LEVELS,
  STORY_KINDS,
} from "../constants";
import { useStoryBuilder } from "../hooks/useStoryBuilder";
import type { ReadingLevel, StoryKind } from "../types";
import { StringListEditor } from "./StringListEditor";
import { SceneEditor } from "./SceneEditor";
import { StoryPreview } from "./StoryPreview";

export function StoryEditorPane() {
  const {
    story,
    sectionId,
    patchStory,
    addCharacter,
    updateChoice,
    addChoice,
    exportFormat,
  } = useStoryBuilder();

  if (sectionId === "general") {
    return (
      <section>
        <h2 className="sb-section-title">Informații generale</h2>
        <p className="sb-lead">
          Povestea aparține lecției și proiectului — engagement cu obiective
          clare.
        </p>
        <div className="sb-grid-2">
          <label className="sb-field">
            Tip poveste
            <select
              className="sb-select"
              value={story.kind}
              onChange={(e) =>
                patchStory((prev) => ({
                  ...prev,
                  kind: e.target.value as StoryKind,
                }))
              }
            >
              {STORY_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sb-field">
            Nivel de lectură
            <select
              className="sb-select"
              value={story.readingLevel}
              onChange={(e) =>
                patchStory((prev) => ({
                  ...prev,
                  readingLevel: e.target.value as ReadingLevel,
                }))
              }
            >
              {READING_LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sb-field">
            Disciplină
            <input
              className="sb-input"
              value={story.subject}
              onChange={(e) =>
                patchStory((prev) => ({ ...prev, subject: e.target.value }))
              }
            />
          </label>
          <label className="sb-field">
            Clasă
            <input
              className="sb-input"
              value={story.grade}
              onChange={(e) =>
                patchStory((prev) => ({ ...prev, grade: e.target.value }))
              }
            />
          </label>
        </div>
        <div className="sb-meta">
          <span className="sb-chip">Lesson: {story.lessonId}</span>
          <span className="sb-chip">Project: {story.projectId}</span>
          <span className="sb-chip">~{story.estimatedMinutes} min citire</span>
        </div>
      </section>
    );
  }

  if (sectionId === "characters") {
    return (
      <section>
        <div className="sb-card-head">
          <div>
            <h2 className="sb-section-title">Personaje</h2>
            <p className="sb-lead">Roluri pedagogice clare, nu doar decor.</p>
          </div>
          <button type="button" className="sb-btn sb-btn-primary" onClick={addCharacter}>
            Personaj nou
          </button>
        </div>
        {story.characters.length === 0 ? (
          <div className="sb-empty">Generează personaje cu AI.</div>
        ) : (
          story.characters.map((c) => (
            <div key={c.id} className="sb-card">
              <div className="sb-grid-2">
                <label className="sb-field">
                  Nume
                  <input
                    className="sb-input"
                    value={c.name}
                    onChange={(e) =>
                      patchStory((prev) => ({
                        ...prev,
                        characters: prev.characters.map((x) =>
                          x.id === c.id ? { ...x, name: e.target.value } : x,
                        ),
                      }))
                    }
                  />
                </label>
                <label className="sb-field">
                  Rol
                  <input
                    className="sb-input"
                    value={c.role}
                    onChange={(e) =>
                      patchStory((prev) => ({
                        ...prev,
                        characters: prev.characters.map((x) =>
                          x.id === c.id ? { ...x, role: e.target.value } : x,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <label className="sb-field">
                Trăsături
                <textarea
                  className="sb-textarea"
                  value={c.traits}
                  onChange={(e) =>
                    patchStory((prev) => ({
                      ...prev,
                      characters: prev.characters.map((x) =>
                        x.id === c.id ? { ...x, traits: e.target.value } : x,
                      ),
                    }))
                  }
                />
              </label>
              <label className="sb-field">
                Prompt ilustrație
                <input
                  className="sb-input"
                  value={c.illustrationPrompt ?? ""}
                  onChange={(e) =>
                    patchStory((prev) => ({
                      ...prev,
                      characters: prev.characters.map((x) =>
                        x.id === c.id
                          ? { ...x, illustrationPrompt: e.target.value }
                          : x,
                      ),
                    }))
                  }
                />
              </label>
            </div>
          ))
        )}
      </section>
    );
  }

  if (sectionId === "setting") {
    return (
      <section>
        <h2 className="sb-section-title">Cadru</h2>
        <textarea
          className="sb-textarea"
          style={{ minHeight: "10rem" }}
          value={story.setting}
          onChange={(e) =>
            patchStory((prev) => ({ ...prev, setting: e.target.value }))
          }
        />
      </section>
    );
  }

  if (sectionId === "objectives") {
    return (
      <section>
        <h2 className="sb-section-title">Obiective & competențe</h2>
        <p className="sb-kicker">Obiective</p>
        <StringListEditor
          items={[...story.objectives]}
          onChange={(objectives) =>
            patchStory((prev) => ({ ...prev, objectives }))
          }
        />
        <p className="sb-kicker" style={{ marginTop: "1rem" }}>
          Competențe
        </p>
        <StringListEditor
          items={[...story.competencies]}
          onChange={(competencies) =>
            patchStory((prev) => ({ ...prev, competencies }))
          }
        />
        <p className="sb-kicker" style={{ marginTop: "1rem" }}>
          Conexiuni cross-curricular
        </p>
        <StringListEditor
          items={[...story.crossCurricular]}
          onChange={(crossCurricular) =>
            patchStory((prev) => ({ ...prev, crossCurricular }))
          }
        />
        <p className="sb-kicker" style={{ marginTop: "1rem" }}>
          Vocabular suport
        </p>
        <StringListEditor
          items={[...story.vocabulary]}
          onChange={(vocabulary) =>
            patchStory((prev) => ({ ...prev, vocabulary }))
          }
        />
      </section>
    );
  }

  if (sectionId === "arc") {
    return (
      <section>
        <h2 className="sb-section-title">Arc narativ</h2>
        <textarea
          className="sb-textarea"
          style={{ minHeight: "10rem" }}
          value={story.storyArc}
          onChange={(e) =>
            patchStory((prev) => ({ ...prev, storyArc: e.target.value }))
          }
        />
        <label className="sb-field" style={{ marginTop: "1rem" }}>
          Diferențiere
          <textarea
            className="sb-textarea"
            value={story.differentiation}
            onChange={(e) =>
              patchStory((prev) => ({
                ...prev,
                differentiation: e.target.value,
              }))
            }
          />
        </label>
        <label className="sb-field">
          Accesibilitate
          <textarea
            className="sb-textarea"
            value={story.accessibilityNotes}
            onChange={(e) =>
              patchStory((prev) => ({
                ...prev,
                accessibilityNotes: e.target.value,
              }))
            }
          />
        </label>
      </section>
    );
  }

  if (sectionId === "scenes") return <SceneEditor />;

  if (sectionId === "branching") {
    const decisionScenes = story.scenes.filter(
      (s) => s.type === "decision" || s.choices.length > 0,
    );
    return (
      <section>
        <h2 className="sb-section-title">Editor de ramificații</h2>
        <p className="sb-lead">
          Leagă alegerile de scene țintă pentru branching / choose-your-own-adventure.
        </p>
        {decisionScenes.length === 0 ? (
          <div className="sb-empty">
            Adaugă o scenă de tip „Punct de decizie”.
          </div>
        ) : (
          decisionScenes.map((scene) => (
            <div key={scene.id} className="sb-card">
              <div className="sb-card-head">
                <strong>{scene.title}</strong>
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
                    Alegere
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
                    Țintă
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
                      {story.scenes
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
          ))
        )}
      </section>
    );
  }

  if (sectionId === "activities") {
    return (
      <section>
        <h2 className="sb-section-title">Activități</h2>
        <StringListEditor
          items={[...story.activities]}
          onChange={(activities) =>
            patchStory((prev) => ({ ...prev, activities }))
          }
        />
      </section>
    );
  }

  if (sectionId === "reflection") {
    return (
      <section>
        <h2 className="sb-section-title">Reflecție</h2>
        <textarea
          className="sb-textarea"
          style={{ minHeight: "10rem" }}
          value={story.reflection}
          onChange={(e) =>
            patchStory((prev) => ({ ...prev, reflection: e.target.value }))
          }
        />
      </section>
    );
  }

  if (sectionId === "assessment") {
    return (
      <section>
        <h2 className="sb-section-title">Momente de evaluare</h2>
        <StringListEditor
          items={[...story.assessmentMoments]}
          onChange={(assessmentMoments) =>
            patchStory((prev) => ({ ...prev, assessmentMoments }))
          }
        />
      </section>
    );
  }

  if (sectionId === "notes") {
    return (
      <section>
        <h2 className="sb-section-title">Note profesor</h2>
        <textarea
          className="sb-textarea"
          style={{ minHeight: "12rem" }}
          value={story.teacherNotes}
          onChange={(e) =>
            patchStory((prev) => ({ ...prev, teacherNotes: e.target.value }))
          }
        />
      </section>
    );
  }

  if (sectionId === "metadata") {
    return (
      <section>
        <h2 className="sb-section-title">Metadate</h2>
        {Object.entries(story.metadata).map(([key, value]) => (
          <div key={key} className="sb-grid-2">
            <label className="sb-field">
              Cheie
              <input className="sb-input" value={key} readOnly />
            </label>
            <label className="sb-field">
              Valoare
              <input
                className="sb-input"
                value={value}
                onChange={(e) =>
                  patchStory((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, [key]: e.target.value },
                  }))
                }
              />
            </label>
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "preview") return <StoryPreview />;

  if (sectionId === "export") {
    return (
      <section>
        <h2 className="sb-section-title">Export</h2>
        <p className="sb-lead">
          HTML interactiv, PDF/storybook, presentation, print, teacher & student.
        </p>
        <div className="sb-actions">
          {(
            [
              "html",
              "pdf",
              "presentation",
              "print",
              "teacher",
              "student",
            ] as const
          ).map((f) => (
            <button
              key={f}
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={() => exportFormat(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </section>
    );
  }

  return null;
}
