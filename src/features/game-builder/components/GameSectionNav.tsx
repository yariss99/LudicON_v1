import { GAME_SECTIONS } from "../constants";
import { useGameBuilder } from "../hooks/useGameBuilder";

export function GameSectionNav() {
  const { sectionId, setSectionId, setPanel } = useGameBuilder();
  return (
    <aside className="gb-sidebar" aria-label="Secțiuni joc">
      <div className="gb-kicker" style={{ marginBottom: "0.65rem" }}>
        Structură
      </div>
      <nav className="gb-nav">
        {GAME_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={[
              "gb-nav-btn",
              sectionId === section.id ? "is-active" : "",
            ].join(" ")}
            onClick={() => {
              setSectionId(section.id);
              if (section.id === "preview") setPanel("preview");
              else if (section.id === "simulate") setPanel("simulate");
              else if (section.id === "mechanics") setPanel("mechanics");
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
