import { useGameBuilder } from "../hooks/useGameBuilder";

export function GameSimulation() {
  const { game, sim, resetSimulation, simAnswer, simNextLevel } =
    useGameBuilder();
  const question = game.questions[sim.questionIndex];
  const level = game.levels[sim.levelIndex];

  return (
    <section>
      <div className="gb-card-head">
        <div>
          <h2 className="gb-section-title">Simulare</h2>
          <p className="gb-lead">Joacă ca un elev — scor, vieți, progres pe nivele.</p>
        </div>
        <button type="button" className="gb-btn" onClick={resetSimulation}>
          Reset
        </button>
      </div>
      <div className="gb-sim">
        <div className="gb-meta">
          <span className="gb-chip">Scor {sim.score}</span>
          <span className="gb-chip">Vieți {sim.lives}</span>
          <span className="gb-chip">
            Nivel {sim.levelIndex + 1}/{Math.max(1, game.levels.length)}
          </span>
        </div>
        {level ? (
          <p style={{ marginTop: "0.75rem" }}>
            <strong>{level.title}</strong> — {level.objective}
          </p>
        ) : null}
        {sim.finished ? (
          <div className="gb-empty" style={{ marginTop: "1rem" }}>
            Simulare încheiată. Scor final: {sim.score}
          </div>
        ) : question ? (
          <div style={{ marginTop: "1rem" }}>
            <h3>{question.prompt || "(întrebare fără enunț)"}</h3>
            <div className="gb-actions" style={{ marginTop: "0.75rem" }}>
              {question.choices.map((choice, index) => (
                <button
                  key={`${question.id}-${index}`}
                  type="button"
                  className="gb-btn gb-btn-primary"
                  onClick={() => simAnswer(index)}
                >
                  {choice}
                </button>
              ))}
            </div>
            {question.hint ? (
              <p className="gb-kicker" style={{ marginTop: "0.65rem" }}>
                Indiciu: {question.hint}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="gb-empty" style={{ marginTop: "1rem" }}>
            Nu există întrebări — generează jocul dintr-o resursă.
          </div>
        )}
        <div className="gb-actions" style={{ marginTop: "1rem" }}>
          <button type="button" className="gb-btn" onClick={simNextLevel}>
            Nivel următor
          </button>
        </div>
        <div className="gb-sim-log" style={{ marginTop: "0.85rem" }}>
          {sim.log.map((line, i) => (
            <div key={`${i}-${line.slice(0, 12)}`}>{line}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
