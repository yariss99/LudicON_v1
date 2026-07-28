import { ASSESSMENT_SECTIONS } from "../constants";
import { useAssessmentBuilder } from "../hooks/useAssessmentBuilder";

export function AssessmentSectionNav() {
  const { sectionId, setSectionId, setPanel } = useAssessmentBuilder();

  return (
    <aside className="ab-sidebar" aria-label="Secțiuni evaluare">
      <div className="ab-kicker" style={{ marginBottom: "0.65rem" }}>
        Structură
      </div>
      <nav className="ab-nav">
        {ASSESSMENT_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={[
              "ab-nav-btn",
              sectionId === section.id ? "is-active" : "",
            ].join(" ")}
            onClick={() => {
              setSectionId(section.id);
              if (section.id === "analytics") setPanel("analytics");
              else if (section.id === "export") setPanel("export");
              else setPanel("editor");
            }}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
