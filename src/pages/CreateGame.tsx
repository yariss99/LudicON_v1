import { useState } from "react";
import ActivityCard from "../components/ActivityCard";
import GameTypeCard from "../components/GameTypeCard";
import "./CreateGame.css";

const TOTAL_STEPS = 5;

const ACTIVITY_TYPES = [
  {
    title: "Predare",
    icon: "📖",
    description: "Introducerea conceptelor noi",
  },
  {
    title: "Exersare",
    icon: "✏️",
    description: "Aplicarea cunoștințelor",
  },
  {
    title: "Consolidare",
    icon: "🧩",
    description: "Fixarea informațiilor",
  },
  {
    title: "Evaluare",
    icon: "✅",
    description: "Verificarea progresului",
  },
  {
    title: "Remediere",
    icon: "🔧",
    description: "Corectarea lacunelor",
  },
];

const GAME_TYPES = [
  {
    title: "Quiz",
    icon: "🧠",
    description: "Întrebări și răspunsuri",
  },
  {
    title: "Puzzle",
    icon: "🧩",
    description: "Reconstituire imagine",
  },
  {
    title: "Memory",
    icon: "🃏",
    description: "Perechi de imagini",
  },
  {
    title: "Potrivește",
    icon: "🎯",
    description: "Asociere elemente",
  },
  {
    title: "Roata",
    icon: "🎡",
    description: "Roata norocului",
  },
  {
    title: "Escape Room",
    icon: "🏃",
    description: "Misiuni succesive",
  },
  {
    title: "Poveste",
    icon: "📖",
    description: "Activitate narativă",
  },
  {
    title: "Recomandare AI",
    icon: "🤖",
    description: "AI alege jocul optim",
  },
];

const QUESTION_COUNTS = [5, 10, 15, 20] as const;
const DIFFICULTIES = ["Ușor", "Mediu", "Avansat"] as const;
const TIMER_OPTIONS = [
  "Fără limită",
  "30 secunde",
  "60 secunde",
  "90 secunde",
] as const;
const GAME_MODES = ["Individual", "Echipe"] as const;

type QuestionCount = (typeof QUESTION_COUNTS)[number];
type Difficulty = (typeof DIFFICULTIES)[number];
type TimerOption = (typeof TIMER_OPTIONS)[number];
type GameMode = (typeof GAME_MODES)[number];

function formatFeedback(showCorrect: boolean, explain: boolean) {
  const parts: string[] = [];

  if (showCorrect) {
    parts.push("Arată răspunsurile corecte");
  }

  if (explain) {
    parts.push("Explică răspunsul");
  }

  return parts.length > 0 ? parts.join(", ") : "Fără feedback";
}

function CreateGame() {
  const [step, setStep] = useState(1);
  const [lesson, setLesson] = useState("");
  const [grade, setGrade] = useState("III");
  const [subject, setSubject] = useState("Matematică");
  const [activityType, setActivityType] = useState("Consolidare");
  const [gameType, setGameType] = useState("Quiz");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("Mediu");
  const [timer, setTimer] = useState<TimerOption>("60 secunde");
  const [gameMode, setGameMode] = useState<GameMode>("Individual");
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [explainAnswer, setExplainAnswer] = useState(true);

  const progressPercent = `${(step / TOTAL_STEPS) * 100}%`;

  function nextStep() {
    if (step === 1 && !lesson.trim()) {
      alert("Te rog introdu tema lecției.");
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  }

  function backStep() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  return (
    <div className="create-page">
      <div className="create-card">

        <div className="progress-wrapper">
          <div className="progress-header">
            <span>Pasul {step} din {TOTAL_STEPS}</span>
            <span>{progressPercent}</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: progressPercent }}
            />
          </div>
        </div>

        <h1>✨ Creează o activitate</h1>

        {step === 1 && (
          <>
            <p className="subtitle">
              Configurează lecția pe care dorești să o transformi într-o
              activitate interactivă.
            </p>

            <div className="form-group">
              <label>Tema lecției</label>
              <input
                type="text"
                placeholder="Ex: Fracțiile"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Clasa</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option>CP</option>
                <option>I</option>
                <option>II</option>
                <option>III</option>
                <option>IV</option>
              </select>
            </div>

            <div className="form-group">
              <label>Disciplina</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option>Limba și literatura română</option>
                <option>Matematică</option>
                <option>Științe ale naturii</option>
                <option>Istorie</option>
                <option>Geografie</option>
                <option>Educație civică</option>
                <option>Arte vizuale</option>
                <option>Muzică și mișcare</option>
              </select>
            </div>

            <div className="actions">
              <button className="primary-button" onClick={nextStep}>
                Continuă →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="subtitle">
              Alege scopul principal al activității.
            </p>

            <div className="activity-grid">
              {ACTIVITY_TYPES.map((type) => (
                <ActivityCard
                  key={type.title}
                  icon={type.icon}
                  title={type.title}
                  description={type.description}
                  selected={activityType === type.title}
                  onClick={() => setActivityType(type.title)}
                />
              ))}
            </div>

            <div
              className="actions"
              style={{ justifyContent: "space-between" }}
            >
              <button className="primary-button" onClick={backStep}>
                ← Înapoi
              </button>

              <button className="primary-button" onClick={nextStep}>
                Continuă →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="subtitle">
              Alege tipul de joc pentru activitate.
            </p>

            <div className="game-type-grid">
              {GAME_TYPES.map((type) => (
                <GameTypeCard
                  key={type.title}
                  icon={type.icon}
                  title={type.title}
                  description={type.description}
                  selected={gameType === type.title}
                  onClick={() => setGameType(type.title)}
                />
              ))}
            </div>

            <div
              className="actions"
              style={{ justifyContent: "space-between" }}
            >
              <button className="primary-button" onClick={backStep}>
                ← Înapoi
              </button>

              <button className="primary-button" onClick={nextStep}>
                Continuă →
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p className="subtitle">
              Configurează setările jocului.
            </p>

            <div className="config-section">
              <label className="config-label">Număr întrebări</label>
              <div className="option-group">
                {QUESTION_COUNTS.map((count) => (
                  <label key={count} className="option-item">
                    <input
                      type="radio"
                      name="questionCount"
                      value={count}
                      checked={questionCount === count}
                      onChange={() => setQuestionCount(count)}
                    />
                    <span>{count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="config-section">
              <label className="config-label">Dificultate</label>
              <div className="option-group">
                {DIFFICULTIES.map((level) => (
                  <label key={level} className="option-item">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={() => setDifficulty(level)}
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="config-section">
              <label className="config-label">Cronometru</label>
              <div className="option-group">
                {TIMER_OPTIONS.map((option) => (
                  <label key={option} className="option-item">
                    <input
                      type="radio"
                      name="timer"
                      value={option}
                      checked={timer === option}
                      onChange={() => setTimer(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="config-section">
              <label className="config-label">Mod joc</label>
              <div className="option-group">
                {GAME_MODES.map((mode) => (
                  <label key={mode} className="option-item">
                    <input
                      type="radio"
                      name="gameMode"
                      value={mode}
                      checked={gameMode === mode}
                      onChange={() => setGameMode(mode)}
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="config-section">
              <label className="config-label">Feedback</label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={showCorrectAnswers}
                    onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                  />
                  <span>Arată răspunsurile corecte</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={explainAnswer}
                    onChange={(e) => setExplainAnswer(e.target.checked)}
                  />
                  <span>Explică răspunsul</span>
                </label>
              </div>
            </div>

            <div
              className="actions"
              style={{ justifyContent: "space-between" }}
            >
              <button className="primary-button" onClick={backStep}>
                ← Înapoi
              </button>

              <button className="primary-button" onClick={nextStep}>
                Continuă →
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <p className="subtitle">
              Verifică detaliile înainte de generare.
            </p>

            <div className="summary">
              <div className="summary-row">
                <span className="summary-label">Tema</span>
                <span className="summary-value">{lesson}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Clasa</span>
                <span className="summary-value">{grade}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Disciplina</span>
                <span className="summary-value">{subject}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Scop</span>
                <span className="summary-value">{activityType}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Tip joc</span>
                <span className="summary-value">{gameType}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Număr întrebări</span>
                <span className="summary-value">{questionCount}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Dificultate</span>
                <span className="summary-value">{difficulty}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Cronometru</span>
                <span className="summary-value">{timer}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Mod joc</span>
                <span className="summary-value">{gameMode}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Feedback</span>
                <span className="summary-value">
                  {formatFeedback(showCorrectAnswers, explainAnswer)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="primary-button generate-button"
              onClick={() =>
                alert("În Sprintul următor vom genera activitatea.")
              }
            >
              🚀 Generează joc
            </button>

            <button
              type="button"
              className="back-link"
              onClick={backStep}
            >
              ← Înapoi
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateGame;
