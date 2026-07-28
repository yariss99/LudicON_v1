import {
  ASSESSMENT_KINDS,
  BLOOM_LEVELS,
  DIFFICULTIES,
  SCORING_MODES,
} from "../constants";
import { useAssessmentBuilder } from "../hooks/useAssessmentBuilder";
import type { AssessmentKind, ScoringMode } from "../types";
import { StringListEditor } from "./StringListEditor";
import { QuestionGroupsEditor } from "./QuestionGroupsEditor";

export function AssessmentEditorPane() {
  const {
    assessment,
    sectionId,
    patchAssessment,
    addRubric,
    addFromBank,
    exportFormat,
  } = useAssessmentBuilder();

  if (sectionId === "general") {
    return (
      <section>
        <h2 className="ab-section-title">Informații generale</h2>
        <p className="ab-lead">
          Evaluarea aparține lecției și proiectului — contextul nu poate fi
          izolat.
        </p>
        <div className="ab-grid-2">
          <label className="ab-field">
            Tip evaluare
            <select
              className="ab-select"
              value={assessment.kind}
              onChange={(e) =>
                patchAssessment((prev) => ({
                  ...prev,
                  kind: e.target.value as AssessmentKind,
                }))
              }
            >
              {ASSESSMENT_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="ab-field">
            Durată (min)
            <input
              className="ab-input"
              type="number"
              min={5}
              value={assessment.durationMinutes}
              onChange={(e) =>
                patchAssessment((prev) => ({
                  ...prev,
                  durationMinutes: Number(e.target.value) || 20,
                }))
              }
            />
          </label>
          <label className="ab-field">
            Disciplină
            <input
              className="ab-input"
              value={assessment.subject}
              onChange={(e) =>
                patchAssessment((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
            />
          </label>
          <label className="ab-field">
            Clasă
            <input
              className="ab-input"
              value={assessment.grade}
              onChange={(e) =>
                patchAssessment((prev) => ({
                  ...prev,
                  grade: e.target.value,
                }))
              }
            />
          </label>
        </div>
        <div className="ab-meta" style={{ marginTop: "0.75rem" }}>
          <span className="ab-chip">Lesson: {assessment.lessonId}</span>
          <span className="ab-chip">Project: {assessment.projectId}</span>
        </div>
      </section>
    );
  }

  if (sectionId === "objectives") {
    return (
      <section>
        <h2 className="ab-section-title">Obiective</h2>
        <StringListEditor
          items={[...assessment.objectives]}
          onChange={(objectives) =>
            patchAssessment((prev) => ({ ...prev, objectives }))
          }
        />
      </section>
    );
  }

  if (sectionId === "competencies") {
    return (
      <section>
        <h2 className="ab-section-title">Competențe</h2>
        <StringListEditor
          items={[...assessment.competencies]}
          onChange={(competencies) =>
            patchAssessment((prev) => ({ ...prev, competencies }))
          }
        />
      </section>
    );
  }

  if (sectionId === "criteria") {
    return (
      <section>
        <h2 className="ab-section-title">Criteria de evaluare</h2>
        <StringListEditor
          items={[...assessment.criteria]}
          onChange={(criteria) =>
            patchAssessment((prev) => ({ ...prev, criteria }))
          }
        />
      </section>
    );
  }

  if (sectionId === "questions") {
    return (
      <>
        <QuestionGroupsEditor />
        <section style={{ marginTop: "1.5rem" }}>
          <h2 className="ab-section-title">Bancă de itemi</h2>
          <p className="ab-lead">
            Itemi reutilizabili generați cu AI — adaugă-i într-un grup.
          </p>
          {assessment.bank.length === 0 ? (
            <div className="ab-empty">Banca este goală.</div>
          ) : (
            assessment.bank.map((q) => (
              <div key={q.id} className="ab-card">
                <div>{q.prompt || "(item gol)"}</div>
                <div className="ab-actions" style={{ marginTop: "0.5rem" }}>
                  {assessment.groups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className="ab-btn"
                      onClick={() => addFromBank(g.id, q.id)}
                    >
                      Adaugă în {g.title}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </>
    );
  }

  if (sectionId === "scoring") {
    return (
      <section>
        <h2 className="ab-section-title">Punctaj</h2>
        <p className="ab-lead">
          Automat, manual, rubrică, ponderat, pe competențe sau model
          personalizat.
        </p>
        <div className="ab-grid-2">
          <label className="ab-field">
            Mod
            <select
              className="ab-select"
              value={assessment.scoring.mode}
              onChange={(e) =>
                patchAssessment((prev) => ({
                  ...prev,
                  scoring: {
                    ...prev.scoring,
                    mode: e.target.value as ScoringMode,
                  },
                }))
              }
            >
              {SCORING_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="ab-field">
            Prag promovare (%)
            <input
              className="ab-input"
              type="number"
              min={0}
              max={100}
              value={assessment.scoring.passingScore}
              onChange={(e) =>
                patchAssessment((prev) => ({
                  ...prev,
                  scoring: {
                    ...prev.scoring,
                    passingScore: Number(e.target.value) || 0,
                  },
                }))
              }
            />
          </label>
        </div>
        <div className="ab-card">
          <div className="ab-score">{assessment.scoring.totalPoints}</div>
          <div className="ab-kicker">Puncte totale (calculate din itemi)</div>
        </div>
        <label className="ab-field">
          Notă model personalizat
          <textarea
            className="ab-textarea"
            value={assessment.scoring.customModelNote ?? ""}
            onChange={(e) =>
              patchAssessment((prev) => ({
                ...prev,
                scoring: {
                  ...prev.scoring,
                  customModelNote: e.target.value,
                },
              }))
            }
          />
        </label>
      </section>
    );
  }

  if (sectionId === "rubrics") {
    return (
      <section>
        <div className="ab-card-head">
          <div>
            <h2 className="ab-section-title">Rubrici</h2>
            <p className="ab-lead">Criterii, greutăți și niveluri de performanță.</p>
          </div>
          <button type="button" className="ab-btn ab-btn-primary" onClick={addRubric}>
            Rubrică nouă
          </button>
        </div>
        {assessment.rubrics.length === 0 ? (
          <div className="ab-empty">
            Nicio rubrică. Generează cu AI sau creează manual.
          </div>
        ) : (
          assessment.rubrics.map((rubric) => (
            <div key={rubric.id} className="ab-card">
              <label className="ab-field">
                Titlu
                <input
                  className="ab-input"
                  value={rubric.title}
                  onChange={(e) =>
                    patchAssessment((prev) => ({
                      ...prev,
                      rubrics: prev.rubrics.map((r) =>
                        r.id === rubric.id
                          ? { ...r, title: e.target.value }
                          : r,
                      ),
                    }))
                  }
                />
              </label>
              {rubric.criteria.map((c) => (
                <div key={c.id} style={{ marginBottom: "0.75rem" }}>
                  <strong>{c.title}</strong>
                  <div className="ab-kicker">{c.description}</div>
                  <div className="ab-actions" style={{ marginTop: "0.35rem" }}>
                    {c.levels.map((l) => (
                      <span key={l.id} className="ab-chip">
                        {l.label}: {l.points}p
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    );
  }

  if (sectionId === "answer_key") {
    const items = assessment.groups.flatMap((g) =>
      g.questions.map((q, i) => ({
        group: g.title,
        index: i + 1,
        prompt: q.prompt,
        answerKey: q.answerKey ?? "",
        groupId: g.id,
        questionId: q.id,
      })),
    );
    return (
      <section>
        <h2 className="ab-section-title">Bareme</h2>
        {items.length === 0 ? (
          <div className="ab-empty">Adaugă itemi pentru a edita baremele.</div>
        ) : (
          items.map((item) => (
            <div key={item.questionId} className="ab-card">
              <div className="ab-kicker">
                {item.group} · #{item.index}
              </div>
              <div style={{ marginBottom: "0.45rem" }}>
                {item.prompt || "(fără enunț)"}
              </div>
              <input
                className="ab-input"
                value={item.answerKey}
                onChange={(e) =>
                  patchAssessment((prev) => ({
                    ...prev,
                    groups: prev.groups.map((g) =>
                      g.id === item.groupId
                        ? {
                            ...g,
                            questions: g.questions.map((q) =>
                              q.id === item.questionId
                                ? { ...q, answerKey: e.target.value }
                                : q,
                            ),
                          }
                        : g,
                    ),
                  }))
                }
              />
            </div>
          ))
        )}
      </section>
    );
  }

  if (sectionId === "notes") {
    return (
      <section>
        <h2 className="ab-section-title">Note profesor</h2>
        <textarea
          className="ab-textarea"
          style={{ minHeight: "12rem" }}
          value={assessment.teacherNotes}
          onChange={(e) =>
            patchAssessment((prev) => ({
              ...prev,
              teacherNotes: e.target.value,
            }))
          }
        />
      </section>
    );
  }

  if (sectionId === "metadata") {
    const entries = Object.entries(assessment.metadata);
    return (
      <section>
        <h2 className="ab-section-title">Metadate</h2>
        {entries.map(([key, value]) => (
          <div key={key} className="ab-grid-2">
            <label className="ab-field">
              Cheie
              <input className="ab-input" value={key} readOnly />
            </label>
            <label className="ab-field">
              Valoare
              <input
                className="ab-input"
                value={value}
                onChange={(e) =>
                  patchAssessment((prev) => ({
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

  if (sectionId === "analytics") {
    const analytics = assessment.analytics;
    if (!analytics) {
      return (
        <div className="ab-empty">
          Salvează evaluarea pentru a calcula analitica.
        </div>
      );
    }
    const total = analytics.totalQuestions || 1;
    return (
      <section>
        <h2 className="ab-section-title">Analitică</h2>
        <div className="ab-grid-2">
          <div className="ab-card">
            <div className="ab-score">{analytics.qualityScore}</div>
            <div className="ab-kicker">Scor calitate</div>
          </div>
          <div className="ab-card">
            <div className="ab-score">{analytics.estimatedSuccessRate}%</div>
            <div className="ab-kicker">Rată estimată de succes</div>
          </div>
          <div className="ab-card">
            <div className="ab-score">{analytics.estimatedMinutes}</div>
            <div className="ab-kicker">Minute estimate</div>
          </div>
          <div className="ab-card">
            <div className="ab-score">{analytics.totalQuestions}</div>
            <div className="ab-kicker">Itemi</div>
          </div>
        </div>
        <h3 className="ab-kicker">Dificultate</h3>
        {DIFFICULTIES.map((d) => {
          const count = analytics.difficultyDistribution[d.id];
          return (
            <div key={d.id} style={{ marginBottom: "0.55rem" }}>
              <div className="ab-kicker">
                {d.label}: {count}
              </div>
              <div className="ab-bar">
                <span style={{ width: `${(count / total) * 100}%` }} />
              </div>
            </div>
          );
        })}
        <h3 className="ab-kicker" style={{ marginTop: "1rem" }}>
          Bloom
        </h3>
        {BLOOM_LEVELS.map((b) => {
          const count = analytics.bloomDistribution[b.id];
          return (
            <div key={b.id} style={{ marginBottom: "0.55rem" }}>
              <div className="ab-kicker">
                {b.label}: {count}
              </div>
              <div className="ab-bar">
                <span style={{ width: `${(count / total) * 100}%` }} />
              </div>
            </div>
          );
        })}
        <h3 className="ab-kicker" style={{ marginTop: "1rem" }}>
          Acoperire competențe
        </h3>
        {analytics.competencyCoverage.map((c) => (
          <div key={c.competency} className="ab-card">
            {c.competency || "(fără nume)"} — {c.questionCount} itemi
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "export") {
    return (
      <section>
        <h2 className="ab-section-title">Export</h2>
        <p className="ab-lead">
          PDF, DOCX, HTML interactiv, variantă printabilă și pachet LMS.
        </p>
        <div className="ab-actions">
          {(["pdf", "docx", "html", "printable", "lms"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="ab-btn ab-btn-primary"
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
