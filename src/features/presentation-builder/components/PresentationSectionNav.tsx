import { PRESENTATION_SECTIONS } from "../constants";
import { usePresentationBuilder } from "../hooks/usePresentationBuilder";

export function PresentationSectionNav() {
  const { sectionId, setSectionId, setPanel } = usePresentationBuilder();
  return (
    <aside className="pb-sidebar" aria-label="Secțiuni prezentare">
      <div className="pb-kicker" style={{ marginBottom: "0.65rem" }}>
        Structură
      </div>
      <nav className="pb-nav">
        {PRESENTATION_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={[
              "pb-nav-btn",
              sectionId === section.id ? "is-active" : "",
            ].join(" ")}
            onClick={() => {
              setSectionId(section.id);
              if (section.id === "preview") setPanel("preview");
              else if (section.id === "outline") setPanel("outline");
              else if (section.id === "theme") setPanel("theme");
              else if (section.id === "export") setPanel("export");
              else if (section.id === "presenter") setPanel("editor");
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
