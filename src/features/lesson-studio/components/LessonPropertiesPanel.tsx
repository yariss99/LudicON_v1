import { LESSON_DIFFICULTIES, LESSON_STATUSES } from "../constants";
import { useLessonStudio } from "../hooks/useLessonStudio";
import type { LessonDifficulty, LessonStudioStatus } from "../types";

export function LessonPropertiesPanel() {
  const {
    lesson,
    setProperties,
    setStatus,
    setCompetenciesText,
    setObjectivesText,
    setKeywordsText,
  } = useLessonStudio();
  const p = lesson.properties;

  return (
    <aside className="ls-panel" aria-label="Lesson properties">
      <h2 className="ls-panel-title">Lesson Properties</h2>

      <label className="ls-field">
        Lesson Title
        <input
          value={p.title}
          onChange={(e) => setProperties({ title: e.target.value })}
          placeholder="Untitled lesson"
        />
      </label>

      <label className="ls-field">
        Subject
        <input
          value={p.subject}
          onChange={(e) => setProperties({ subject: e.target.value })}
          placeholder="e.g. Mathematics"
        />
      </label>

      <label className="ls-field">
        Grade
        <input
          value={p.grade}
          onChange={(e) => setProperties({ grade: e.target.value })}
          placeholder="e.g. Clasa a V-a"
        />
      </label>

      <label className="ls-field">
        Duration (minutes)
        <input
          type="number"
          min={5}
          max={240}
          value={p.durationMinutes}
          onChange={(e) =>
            setProperties({
              durationMinutes: Number(e.target.value) || 0,
            })
          }
        />
      </label>

      <label className="ls-field">
        Teaching Unit
        <input
          value={p.teachingUnit}
          onChange={(e) => setProperties({ teachingUnit: e.target.value })}
          placeholder="Unit name"
        />
      </label>

      <label className="ls-field">
        Competencies
        <textarea
          value={p.competencies.join("\n")}
          onChange={(e) => setCompetenciesText(e.target.value)}
          placeholder="One competency per line"
        />
      </label>

      <label className="ls-field">
        Learning Objectives
        <textarea
          value={p.learningObjectives.join("\n")}
          onChange={(e) => setObjectivesText(e.target.value)}
          placeholder="One objective per line"
        />
      </label>

      <label className="ls-field">
        Keywords
        <textarea
          value={p.keywords.join(", ")}
          onChange={(e) => setKeywordsText(e.target.value)}
          placeholder="Comma or line separated"
        />
      </label>

      <label className="ls-field">
        Difficulty
        <select
          value={p.difficulty}
          onChange={(e) =>
            setProperties({
              difficulty: e.target.value as LessonDifficulty,
            })
          }
        >
          {LESSON_DIFFICULTIES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      <label className="ls-field">
        Lesson Status
        <select
          value={lesson.status}
          onChange={(e) => setStatus(e.target.value as LessonStudioStatus)}
        >
          {LESSON_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}
