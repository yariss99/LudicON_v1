import { RESOURCE_SECTIONS } from "../constants";
import { useResourceCenter } from "../hooks/useResourceCenter";

export function ResourceSectionNav() {
  const { sectionId, setSectionId, setPanel } = useResourceCenter();
  return (
    <aside className="rc-sidebar" aria-label="Secțiuni Resource Center">
      <div className="rc-kicker" style={{ marginBottom: "0.65rem" }}>
        Knowledge
      </div>
      <nav className="rc-nav">
        {RESOURCE_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={[
              "rc-nav-btn",
              sectionId === section.id ? "is-active" : "",
            ].join(" ")}
            onClick={() => {
              setSectionId(section.id);
              if (section.id === "search") setPanel("search");
              else if (section.id === "graph") setPanel("graph");
              else if (section.id === "analytics") setPanel("analytics");
              else if (section.id === "ai") setPanel("ai");
              else if (section.id === "sharing") setPanel("sharing");
              else if (section.id === "versions") setPanel("versions");
              else if (section.id === "detail" || section.id === "metadata")
                setPanel("detail");
              else setPanel("browse");
            }}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
