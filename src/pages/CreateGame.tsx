import { useState } from "react";
import "./CreateGame.css";

function CreateGame() {
  const [step, setStep] = useState(1);
  const [lesson, setLesson] = useState("");
  const [grade, setGrade] = useState("III");
  const [subject, setSubject] = useState("Matematică");
  const [activityType, setActivityType] = useState("Consolidare");

  function nextStep() {
    if (step === 1) {
      if (!lesson.trim()) {
        alert("Te rog introdu tema lecției.");
        return;
      }
      setStep(2);
    }
  }

  function backStep() {
    setStep(1);
  }

  return (
    <div className="create-page">
      <div className="create-card">

        <div className="progress-wrapper">
          <div className="progress-header">
            <span>Pasul {step} din 2</span>
            <span>{step === 1 ? "50%" : "100%"}</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: step === 1 ? "50%" : "100%" }}
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

            <div className="form-group">
              <label>Tip activitate</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <option>Predare</option>
                <option>Exersare</option>
                <option>Consolidare</option>
                <option>Evaluare</option>
                <option>Remediere</option>
              </select>
            </div>

            <hr />

            <p><strong>Tema:</strong> {lesson}</p>
            <p><strong>Clasa:</strong> {grade}</p>
            <p><strong>Disciplina:</strong> {subject}</p>
            <p><strong>Scop:</strong> {activityType}</p>

            <div
              className="actions"
              style={{ justifyContent: "space-between" }}
            >
              <button className="primary-button" onClick={backStep}>
                ← Înapoi
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  alert("În Sprintul următor vom genera activitatea.")
                }
              >
                Generează →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateGame;
