import { STORY_SECTIONS } from "../constants";
import { useStoryBuilder } from "../hooks/useStoryBuilder";

export function StorySectionNav() {
  const { sectionId, setSectionId, setPanel } = useStoryBuilder();

  return (
    <aside className="sb-sidebar" aria-label="Secțiuni poveste">
      <div className="sb-kicker" style={{ marginBottom: "0.65rem" }}>
        Structură
      </div>
      <nav className="sb-nav">
        {STORY_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={[
              "sb-nav-btn",
              sectionId === section.id ? "is-active" : "",
            ].join(" ")}
            onClick={() => {
              setSectionId(section.id);
              if (section.id === "preview") setPanel("preview");
              else if (section.id === "branching") setPanel("branching");
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
