import {
  BLOOM_LEVELS,
  DIFFICULTIES,
  QUESTION_TYPES,
} from "../constants";
import { useAssessmentBuilder } from "../hooks/useAssessmentBuilder";
import type { BloomLevel, DifficultyLevel, QuestionType } from "../types";

export function QuestionGroupsEditor() {
  const {
    assessment,
    addGroup,
    addQuestion,
    updateQuestion,
    removeQuestion,
    patchAssessment,
  } = useAssessmentBuilder();

  return (
    <section>
      <div className="ab-card-head">
        <div>
          <h2 className="ab-section-title">Grupuri de itemi</h2>
          <p className="ab-lead">
            Tipuri multiple, bareme, dificultate Bloom și mapare pe competențe.
          </p>
        </div>
        <button type="button" className="ab-btn ab-btn-primary" onClick={addGroup}>
          Grup nou
        </button>
      </div>

      {assessment.groups.map((group) => (
        <div key={group.id} className="ab-card">
          <label className="ab-field">
            Titlu grup
            <input
              className="ab-input"
              value={group.title}
              onChange={(e) =>
                patchAssessment((prev) => ({
                  ...prev,
                  groups: prev.groups.map((g) =>
                    g.id === group.id ? { ...g, title: e.target.value } : g,
                  ),
                }))
              }
            />
          </label>
          <label className="ab-field">
            Instrucțiuni
            <textarea
              className="ab-textarea"
              value={group.instructions}
              onChange={(e) =>
                patchAssessment((prev) => ({
                  ...prev,
                  groups: prev.groups.map((g) =>
                    g.id === group.id
                      ? { ...g, instructions: e.target.value }
                      : g,
                  ),
                }))
              }
            />
          </label>

          <div className="ab-actions" style={{ marginBottom: "0.75rem" }}>
            {QUESTION_TYPES.slice(0, 6).map((t) => (
              <button
                key={t.id}
                type="button"
                className="ab-btn"
                onClick={() => addQuestion(group.id, t.id)}
              >
                + {t.label}
              </button>
            ))}
            <select
              className="ab-select"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                addQuestion(group.id, e.target.value as QuestionType);
                e.target.value = "";
              }}
            >
              <option value="">Mai multe tipuri…</option>
              {QUESTION_TYPES.slice(6).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {group.questions.length === 0 ? (
            <div className="ab-empty">Niciun item în acest grup.</div>
          ) : (
            group.questions.map((q, index) => (
              <div key={q.id} className="ab-card" style={{ background: "#f8fafc" }}>
                <div className="ab-card-head">
                  <strong>
                    {index + 1}.{" "}
                    {QUESTION_TYPES.find((t) => t.id === q.type)?.label}
                  </strong>
                  <button
                    type="button"
                    className="ab-btn ab-btn-ghost ab-btn-danger"
                    onClick={() => removeQuestion(group.id, q.id)}
                  >
                    Șterge
                  </button>
                </div>
                <label className="ab-field">
                  Enunț
                  <textarea
                    className="ab-textarea"
                    value={q.prompt}
                    onChange={(e) =>
                      updateQuestion(group.id, q.id, { prompt: e.target.value })
                    }
                  />
                </label>
                <div className="ab-grid-2">
                  <label className="ab-field">
                    Puncte
                    <input
                      className="ab-input"
                      type="number"
                      min={0}
                      value={q.points}
                      onChange={(e) =>
                        updateQuestion(group.id, q.id, {
                          points: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </label>
                  <label className="ab-field">
                    Secunde estimate
                    <input
                      className="ab-input"
                      type="number"
                      min={10}
                      value={q.estimatedSeconds}
                      onChange={(e) =>
                        updateQuestion(group.id, q.id, {
                          estimatedSeconds: Number(e.target.value) || 60,
                        })
                      }
                    />
                  </label>
                  <label className="ab-field">
                    Dificultate
                    <select
                      className="ab-select"
                      value={q.difficulty}
                      onChange={(e) =>
                        updateQuestion(group.id, q.id, {
                          difficulty: e.target.value as DifficultyLevel,
                        })
                      }
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="ab-field">
                    Bloom
                    <select
                      className="ab-select"
                      value={q.bloom}
                      onChange={(e) =>
                        updateQuestion(group.id, q.id, {
                          bloom: e.target.value as BloomLevel,
                        })
                      }
                    >
                      {BLOOM_LEVELS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {q.choices ? (
                  <div className="ab-list-editor">
                    {q.choices.map((c) => (
                      <label key={c.id} className="ab-list-row">
                        <input
                          type="checkbox"
                          checked={Boolean(c.isCorrect)}
                          onChange={(e) =>
                            updateQuestion(group.id, q.id, {
                              choices: q.choices!.map((x) =>
                                x.id === c.id
                                  ? { ...x, isCorrect: e.target.checked }
                                  : x,
                              ),
                            })
                          }
                        />
                        <input
                          className="ab-input"
                          value={c.label}
                          onChange={(e) =>
                            updateQuestion(group.id, q.id, {
                              choices: q.choices!.map((x) =>
                                x.id === c.id
                                  ? { ...x, label: e.target.value }
                                  : x,
                              ),
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                ) : null}
                <label className="ab-field">
                  Barem / răspuns
                  <input
                    className="ab-input"
                    value={q.answerKey ?? ""}
                    onChange={(e) =>
                      updateQuestion(group.id, q.id, {
                        answerKey: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="ab-field">
                  Competențe (separate prin virgulă)
                  <input
                    className="ab-input"
                    value={q.competencyIds.join(", ")}
                    onChange={(e) =>
                      updateQuestion(group.id, q.id, {
                        competencyIds: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
              </div>
            ))
          )}
        </div>
      ))}
    </section>
  );
}
