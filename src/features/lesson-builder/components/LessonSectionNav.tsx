import { LESSON_SECTIONS } from "../constants";
import { useLessonBuilder } from "../hooks/useLessonBuilder";

export function LessonSectionNav() {
  const { sectionId, setSectionId, setPanel } = useLessonBuilder();

  return (
    <aside className="lb-sidebar" aria-label="Secțiuni lecție">
      <div className="lb-kicker" style={{ marginBottom: "0.65rem" }}>
        Structură
      </div>
      <nav className="lb-nav">
        {LESSON_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={[
              "lb-nav-btn",
              sectionId === section.id ? "is-active" : "",
            ].join(" ")}
            onClick={() => {
              setSectionId(section.id);
              setPanel("editor");
            }}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
