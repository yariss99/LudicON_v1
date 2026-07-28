import {
  CHALLENGE_TYPES,
  GAME_KINDS,
  MECHANICS_LIBRARY,
  SOURCE_KINDS,
} from "../constants";
import { useGameBuilder } from "../hooks/useGameBuilder";
import type { ChallengeType, GameKind, GameSourceKind } from "../types";
import { StringListEditor } from "./StringListEditor";
import { GameSimulation } from "./GameSimulation";

export function GameEditorPane() {
  const {
    game,
    sectionId,
    patchGame,
    setSourceKind,
    toggleMechanic,
    addLevel,
    addChallenge,
    addQuestion,
    updateQuestion,
    updateChallenge,
    addReward,
    exportFormat,
    runAi,
  } = useGameBuilder();

  if (sectionId === "general") {
    return (
      <section>
        <h2 className="gb-section-title">Informații joc</h2>
        <p className="gb-lead">
          Jocurile PRIMA pornesc din resurse existente — niciodată dintr-un
          canvas gol.
        </p>
        <div className="gb-grid-2">
          <label className="gb-field">
            Tip joc
            <select
              className="gb-select"
              value={game.kind}
              onChange={(e) =>
                patchGame((prev) => ({
                  ...prev,
                  kind: e.target.value as GameKind,
                }))
              }
            >
              {GAME_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="gb-field">
            Durată estimată (min)
            <input
              className="gb-input"
              type="number"
              min={5}
              value={game.estimatedMinutes}
              onChange={(e) =>
                patchGame((prev) => ({
                  ...prev,
                  estimatedMinutes: Number(e.target.value) || 15,
                }))
              }
            />
          </label>
          <label className="gb-field">
            Disciplină
            <input
              className="gb-input"
              value={game.subject}
              onChange={(e) =>
                patchGame((prev) => ({ ...prev, subject: e.target.value }))
              }
            />
          </label>
          <label className="gb-field">
            Clasă
            <input
              className="gb-input"
              value={game.grade}
              onChange={(e) =>
                patchGame((prev) => ({ ...prev, grade: e.target.value }))
              }
            />
          </label>
        </div>
        <div className="gb-meta">
          <span className="gb-chip">Lesson: {game.lessonId}</span>
          <span className="gb-chip">Project: {game.projectId}</span>
        </div>
      </section>
    );
  }

  if (sectionId === "source") {
    return (
      <section>
        <h2 className="gb-section-title">Sursă PRIMA</h2>
        <p className="gb-lead">
          Generează din lecție, fișă, evaluare, poveste, competențe sau obiective.
        </p>
        <div className="gb-card">
          <strong>Sursă curentă:</strong> {game.source.label}
          <div className="gb-kicker">{game.source.kind}</div>
        </div>
        <label className="gb-field">
          Tip sursă
          <select
            className="gb-select"
            value={game.source.kind}
            onChange={(e) => setSourceKind(e.target.value as GameSourceKind)}
          >
            {SOURCE_KINDS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div className="gb-actions">
          <button
            type="button"
            className="gb-btn gb-btn-primary"
            onClick={() => runAi("generate_complete")}
          >
            Regenerează din sursă
          </button>
          <button type="button" className="gb-btn" onClick={() => runAi("from_lesson")}>
            Din lecție
          </button>
          <button type="button" className="gb-btn" onClick={() => runAi("from_worksheet")}>
            Din fișă
          </button>
          <button type="button" className="gb-btn" onClick={() => runAi("from_story")}>
            Din poveste
          </button>
          <button type="button" className="gb-btn" onClick={() => runAi("from_assessment")}>
            Din evaluare
          </button>
        </div>
      </section>
    );
  }

  if (sectionId === "objectives") {
    return (
      <section>
        <h2 className="gb-section-title">Obiective</h2>
        <StringListEditor
          items={[...game.objectives]}
          onChange={(objectives) =>
            patchGame((prev) => ({ ...prev, objectives }))
          }
        />
      </section>
    );
  }

  if (sectionId === "competencies") {
    return (
      <section>
        <h2 className="gb-section-title">Competențe</h2>
        <StringListEditor
          items={[...game.competencies]}
          onChange={(competencies) =>
            patchGame((prev) => ({ ...prev, competencies }))
          }
        />
      </section>
    );
  }

  if (sectionId === "rules") {
    return (
      <section>
        <h2 className="gb-section-title">Reguli</h2>
        <textarea
          className="gb-textarea"
          style={{ minHeight: "12rem" }}
          value={game.rules}
          onChange={(e) =>
            patchGame((prev) => ({ ...prev, rules: e.target.value }))
          }
        />
      </section>
    );
  }

  if (sectionId === "mechanics") {
    return (
      <section>
        <h2 className="gb-section-title">Bibliotecă de mecanici</h2>
        <p className="gb-lead">
          Points, badges, lives, levels, unlockables, adaptive difficulty…
        </p>
        {game.mechanics.map((m) => {
          const meta = MECHANICS_LIBRARY.find((x) => x.id === m.id);
          return (
            <div key={m.id} className="gb-toggle">
              <div>
                <strong>{meta?.label ?? m.id}</strong>
                <div className="gb-kicker">{meta?.description}</div>
              </div>
              <div className="gb-actions">
                <input
                  className="gb-input"
                  style={{ width: 72 }}
                  type="number"
                  value={m.value}
                  onChange={(e) =>
                    patchGame((prev) => ({
                      ...prev,
                      mechanics: prev.mechanics.map((x) =>
                        x.id === m.id
                          ? { ...x, value: Number(e.target.value) || 0 }
                          : x,
                      ),
                    }))
                  }
                />
                <button
                  type="button"
                  className={["gb-btn", m.enabled ? "gb-btn-primary" : ""].join(
                    " ",
                  )}
                  onClick={() => toggleMechanic(m.id)}
                >
                  {m.enabled ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  if (sectionId === "levels") {
    return (
      <section>
        <div className="gb-card-head">
          <div>
            <h2 className="gb-section-title">Nivele</h2>
            <p className="gb-lead">Timeline / progresie pe etape.</p>
          </div>
          <button type="button" className="gb-btn gb-btn-primary" onClick={addLevel}>
            Nivel nou
          </button>
        </div>
        {game.levels.length === 0 ? (
          <div className="gb-empty">Generează jocul pentru a popula nivelele.</div>
        ) : (
          game.levels.map((level) => (
            <div key={level.id} className="gb-card">
              <label className="gb-field">
                Titlu
                <input
                  className="gb-input"
                  value={level.title}
                  onChange={(e) =>
                    patchGame((prev) => ({
                      ...prev,
                      levels: prev.levels.map((l) =>
                        l.id === level.id
                          ? { ...l, title: e.target.value }
                          : l,
                      ),
                    }))
                  }
                />
              </label>
              <label className="gb-field">
                Obiectiv nivel
                <textarea
                  className="gb-textarea"
                  value={level.objective}
                  onChange={(e) =>
                    patchGame((prev) => ({
                      ...prev,
                      levels: prev.levels.map((l) =>
                        l.id === level.id
                          ? { ...l, objective: e.target.value }
                          : l,
                      ),
                    }))
                  }
                />
              </label>
              <div className="gb-kicker">
                Provocări legate: {level.challengeIds.length}
              </div>
            </div>
          ))
        )}
      </section>
    );
  }

  if (sectionId === "challenges") {
    return (
      <section>
        <div className="gb-card-head">
          <div>
            <h2 className="gb-section-title">Provocări</h2>
          </div>
          <select
            className="gb-select"
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              addChallenge(e.target.value as ChallengeType);
              e.target.value = "";
            }}
          >
            <option value="">+ Tip provocare…</option>
            {CHALLENGE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        {game.challenges.map((c) => (
          <div key={c.id} className="gb-card">
            <div className="gb-grid-2">
              <label className="gb-field">
                Titlu
                <input
                  className="gb-input"
                  value={c.title}
                  onChange={(e) =>
                    updateChallenge(c.id, { title: e.target.value })
                  }
                />
              </label>
              <label className="gb-field">
                Dificultate
                <select
                  className="gb-select"
                  value={c.difficulty}
                  onChange={(e) =>
                    updateChallenge(c.id, {
                      difficulty: e.target.value as GameChallengeDifficulty,
                    })
                  }
                >
                  <option value="easy">Ușor</option>
                  <option value="medium">Mediu</option>
                  <option value="hard">Greu</option>
                </select>
              </label>
            </div>
            <label className="gb-field">
              Descriere
              <textarea
                className="gb-textarea"
                value={c.description}
                onChange={(e) =>
                  updateChallenge(c.id, { description: e.target.value })
                }
              />
            </label>
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "questions") {
    return (
      <section>
        <div className="gb-card-head">
          <h2 className="gb-section-title">Întrebări</h2>
          <button type="button" className="gb-btn gb-btn-primary" onClick={addQuestion}>
            Întrebare nouă
          </button>
        </div>
        {game.questions.map((q, index) => (
          <div key={q.id} className="gb-card">
            <label className="gb-field">
              #{index + 1} Enunț
              <textarea
                className="gb-textarea"
                value={q.prompt}
                onChange={(e) =>
                  updateQuestion(q.id, { prompt: e.target.value })
                }
              />
            </label>
            <div className="gb-list-editor">
              {q.choices.map((choice, ci) => (
                <div key={ci} className="gb-list-row">
                  <input
                    type="radio"
                    checked={q.correctIndex === ci}
                    onChange={() =>
                      updateQuestion(q.id, { correctIndex: ci })
                    }
                  />
                  <input
                    className="gb-input"
                    value={choice}
                    onChange={(e) => {
                      const choices = [...q.choices];
                      choices[ci] = e.target.value;
                      updateQuestion(q.id, { choices });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "rewards") {
    return (
      <section>
        <div className="gb-card-head">
          <h2 className="gb-section-title">Recompense</h2>
          <button type="button" className="gb-btn gb-btn-primary" onClick={addReward}>
            Recompensă nouă
          </button>
        </div>
        {game.rewards.map((r) => (
          <div key={r.id} className="gb-card">
            <strong>{r.title}</strong>
            <div className="gb-kicker">
              {r.kind} · prag {r.threshold}
            </div>
            <div>{r.description}</div>
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "hints") {
    return (
      <section>
        <h2 className="gb-section-title">Indicii</h2>
        <StringListEditor
          items={[...game.hints]}
          onChange={(hints) => patchGame((prev) => ({ ...prev, hints }))}
        />
      </section>
    );
  }

  if (sectionId === "feedback") {
    return (
      <section>
        <h2 className="gb-section-title">Feedback</h2>
        <textarea
          className="gb-textarea"
          style={{ minHeight: "10rem" }}
          value={game.feedbackNotes}
          onChange={(e) =>
            patchGame((prev) => ({ ...prev, feedbackNotes: e.target.value }))
          }
        />
      </section>
    );
  }

  if (sectionId === "notes") {
    return (
      <section>
        <h2 className="gb-section-title">Note profesor</h2>
        <textarea
          className="gb-textarea"
          style={{ minHeight: "12rem" }}
          value={game.teacherNotes}
          onChange={(e) =>
            patchGame((prev) => ({ ...prev, teacherNotes: e.target.value }))
          }
        />
      </section>
    );
  }

  if (sectionId === "metadata") {
    return (
      <section>
        <h2 className="gb-section-title">Metadate</h2>
        {Object.entries(game.metadata).map(([key, value]) => (
          <div key={key} className="gb-grid-2">
            <label className="gb-field">
              Cheie
              <input className="gb-input" value={key} readOnly />
            </label>
            <label className="gb-field">
              Valoare
              <input
                className="gb-input"
                value={value}
                onChange={(e) =>
                  patchGame((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, [key]: e.target.value },
                  }))
                }
              />
            </label>
          </div>
        ))}
        <h3 className="gb-kicker" style={{ marginTop: "1rem" }}>
          Prompturi vizuale
        </h3>
        <StringListEditor
          items={[...game.visualAssetPrompts]}
          onChange={(visualAssetPrompts) =>
            patchGame((prev) => ({ ...prev, visualAssetPrompts }))
          }
        />
      </section>
    );
  }

  if (sectionId === "preview") {
    return (
      <section>
        <h2 className="gb-section-title">Preview</h2>
        <div className="gb-card">
          <strong>{game.title}</strong>
          <div className="gb-kicker">
            {game.levels.length} nivele · {game.challenges.length} provocări ·{" "}
            {game.questions.length} întrebări · {game.rewards.length} recompense
          </div>
          <pre className="gb-pre" style={{ marginTop: "0.75rem" }}>
            {game.rules}
          </pre>
        </div>
        {game.levels.map((l) => (
          <div key={l.id} className="gb-card">
            <strong>{l.title}</strong>
            <div>{l.objective}</div>
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "simulate") return <GameSimulation />;

  if (sectionId === "export") {
    return (
      <section>
        <h2 className="gb-section-title">Export</h2>
        <div className="gb-actions">
          {(["html", "web", "classroom", "print", "qr"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="gb-btn gb-btn-primary"
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

type GameChallengeDifficulty = "easy" | "medium" | "hard";
