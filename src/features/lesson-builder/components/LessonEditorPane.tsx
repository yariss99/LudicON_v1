import { useLessonBuilder } from "../hooks/useLessonBuilder";
import { StringListEditor } from "./StringListEditor";
import { BlockCanvas } from "./BlockCanvas";
import { LESSON_PHASES } from "../constants";

export function LessonEditorPane() {
  const { lesson, sectionId, patchLesson } = useLessonBuilder();

  if (sectionId === "general") {
    return (
      <section>
        <h2 className="lb-section-title">Informații generale</h2>
        <p className="lb-lead">
          Contextul lecției moștenește proiectul; poți rafina detaliile orei.
        </p>
        <div className="lb-grid-2">
          <label className="lb-field">
            Disciplină
            <input
              className="lb-input"
              value={lesson.general.subject}
              onChange={(e) =>
                patchLesson((prev) => ({
                  ...prev,
                  general: { ...prev.general, subject: e.target.value },
                }))
              }
            />
          </label>
          <label className="lb-field">
            Clasă
            <input
              className="lb-input"
              value={lesson.general.grade}
              onChange={(e) =>
                patchLesson((prev) => ({
                  ...prev,
                  general: { ...prev.general, grade: e.target.value },
                }))
              }
            />
          </label>
          <label className="lb-field">
            Durată (min)
            <input
              className="lb-input"
              type="number"
              min={10}
              value={lesson.general.durationMinutes}
              onChange={(e) =>
                patchLesson((prev) => ({
                  ...prev,
                  general: {
                    ...prev.general,
                    durationMinutes: Number(e.target.value) || 45,
                  },
                }))
              }
            />
          </label>
          <label className="lb-field">
            Data
            <input
              className="lb-input"
              type="date"
              value={lesson.general.date}
              onChange={(e) =>
                patchLesson((prev) => ({
                  ...prev,
                  general: { ...prev.general, date: e.target.value },
                }))
              }
            />
          </label>
          <label className="lb-field">
            Autor
            <input
              className="lb-input"
              value={lesson.general.author}
              onChange={(e) =>
                patchLesson((prev) => ({
                  ...prev,
                  general: { ...prev.general, author: e.target.value },
                }))
              }
            />
          </label>
          <label className="lb-field">
            An școlar
            <input
              className="lb-input"
              value={lesson.general.schoolYear ?? ""}
              onChange={(e) =>
                patchLesson((prev) => ({
                  ...prev,
                  general: { ...prev.general, schoolYear: e.target.value },
                }))
              }
            />
          </label>
        </div>
      </section>
    );
  }

  if (sectionId === "objectives") {
    return (
      <section>
        <h2 className="lb-section-title">Obiective de învățare</h2>
        <p className="lb-lead">Formulează obiective observabile și măsurabile.</p>
        <StringListEditor
          items={[...lesson.objectives]}
          onChange={(objectives) => patchLesson((prev) => ({ ...prev, objectives }))}
          placeholder="Elevii vor putea…"
        />
      </section>
    );
  }

  if (sectionId === "competencies") {
    return (
      <section>
        <h2 className="lb-section-title">Competențe</h2>
        <p className="lb-lead">Leagă lecția de curriculumul proiectului.</p>
        <StringListEditor
          items={[...lesson.competencies]}
          onChange={(competencies) =>
            patchLesson((prev) => ({ ...prev, competencies }))
          }
        />
      </section>
    );
  }

  if (sectionId === "prerequisites") {
    return (
      <section>
        <h2 className="lb-section-title">Cunoștințe anterioare</h2>
        <StringListEditor
          items={[...lesson.prerequisites]}
          onChange={(prerequisites) =>
            patchLesson((prev) => ({ ...prev, prerequisites }))
          }
        />
      </section>
    );
  }

  if (sectionId === "resources") {
    return (
      <section>
        <h2 className="lb-section-title">Resurse</h2>
        <StringListEditor
          items={[...lesson.resources]}
          onChange={(resources) => patchLesson((prev) => ({ ...prev, resources }))}
          placeholder="Material, link, fișier…"
        />
      </section>
    );
  }

  if (sectionId === "phases") {
    return (
      <section>
        <h2 className="lb-section-title">Faze ale lecției</h2>
        <p className="lb-lead">
          Introducere → Motivație → Construcție → Practică → Evaluare → Reflecție →
          Încheiere.
        </p>
        {lesson.phases.map((phase) => (
          <div key={phase.id} className="lb-card">
            <div className="lb-card-head">
              <strong>
                {LESSON_PHASES.find((p) => p.id === phase.id)?.label ?? phase.title}
              </strong>
              <label className="lb-field" style={{ margin: 0, minWidth: 90 }}>
                Min
                <input
                  className="lb-input"
                  type="number"
                  min={0}
                  value={phase.durationMinutes}
                  onChange={(e) =>
                    patchLesson((prev) => ({
                      ...prev,
                      phases: prev.phases.map((p) =>
                        p.id === phase.id
                          ? {
                              ...p,
                              durationMinutes: Number(e.target.value) || 0,
                            }
                          : p,
                      ),
                    }))
                  }
                />
              </label>
            </div>
            <textarea
              className="lb-textarea"
              value={phase.content}
              onChange={(e) =>
                patchLesson((prev) => ({
                  ...prev,
                  phases: prev.phases.map((p) =>
                    p.id === phase.id ? { ...p, content: e.target.value } : p,
                  ),
                }))
              }
            />
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "activities") {
    return (
      <section>
        <h2 className="lb-section-title">Activități / Blocuri</h2>
        <p className="lb-lead">
          Editor cu drag & drop, blocuri reutilizabile și asistență AI inline.
        </p>
        <BlockCanvas />
      </section>
    );
  }

  const textSections = {
    differentiation: {
      title: "Diferențiere",
      lead: "Adaptări pentru ritmuri și nevoi diferite.",
      key: "differentiation" as const,
    },
    assessment: {
      title: "Evaluare",
      lead: "Verificare formativă și criterii.",
      key: "assessment" as const,
    },
    homework: {
      title: "Temă pentru acasă",
      lead: "Sarcină scurtă, fezabilă.",
      key: "homework" as const,
    },
    reflection: {
      title: "Reflecție",
      lead: "Întrebări pentru elevi și profesor.",
      key: "reflection" as const,
    },
    notes: {
      title: "Note profesor",
      lead: "Observații private pentru predare.",
      key: "teacherNotes" as const,
    },
  } as const;

  const cfg =
    sectionId in textSections
      ? textSections[sectionId as keyof typeof textSections]
      : null;

  if (!cfg) return null;

  return (
    <section>
      <h2 className="lb-section-title">{cfg.title}</h2>
      <p className="lb-lead">{cfg.lead}</p>
      <textarea
        className="lb-textarea"
        style={{ minHeight: "12rem" }}
        value={lesson[cfg.key]}
        onChange={(e) =>
          patchLesson((prev) => ({
            ...prev,
            [cfg.key]: e.target.value,
          }))
        }
      />
    </section>
  );
}
