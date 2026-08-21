import { ASSESSMENT_SECTION_GROUPS, ASSESSMENT_SECTIONS } from "../constants";
import { useAssessmentBuilder } from "../hooks/useAssessmentBuilder";
import type { AssessmentDocument, AssessmentSectionId } from "../types";

const SECTION_LABELS = new Map<AssessmentSectionId, string>(
  ASSESSMENT_SECTIONS.map((section) => [section.id, section.label]),
);

/** Count of already-filled content, so the nav shows what still needs work. */
function countFor(
  sectionId: AssessmentSectionId,
  assessment: AssessmentDocument,
): number | null {
  switch (sectionId) {
    case "objectives":
      return assessment.objectives.length;
    case "competencies":
      return assessment.competencies.length;
    case "criteria":
      return assessment.criteria.length;
    case "questions":
      return assessment.groups.reduce((sum, g) => sum + g.questions.length, 0);
    case "answer_key":
      return assessment.groups.reduce(
        (sum, g) => sum + g.questions.filter((q) => q.answerKey?.trim()).length,
        0,
      );
    case "rubrics":
      return assessment.rubrics.length;
    default:
      return null;
  }
}

export function AssessmentSectionNav() {
  const { assessment, sectionId, setSectionId, setPanel } =
    useAssessmentBuilder();

  return (
    <aside className="ab-sidebar" aria-label="Secțiuni evaluare">
      <div className="ab-kicker" style={{ marginBottom: "0.85rem" }}>
        Structura evaluării
      </div>

      {ASSESSMENT_SECTION_GROUPS.map((group) => (
        <nav
          key={group.id}
          className="ab-nav-group"
          aria-labelledby={`ab-nav-${group.id}`}
        >
          <div id={`ab-nav-${group.id}`} className="ab-nav-group-title">
            {group.label}
          </div>
          <div className="ab-nav">
            {group.sectionIds.map((id) => {
              const count = countFor(id, assessment);
              return (
                <button
                  key={id}
                  type="button"
                  className={[
                    "ab-nav-btn",
                    sectionId === id ? "is-active" : "",
                  ].join(" ")}
                  aria-current={sectionId === id ? "true" : undefined}
                  onClick={() => {
                    setSectionId(id);
                    if (id === "analytics") setPanel("analytics");
                    else if (id === "export") setPanel("export");
                    else setPanel("editor");
                  }}
                >
                  <span>{SECTION_LABELS.get(id) ?? id}</span>
                  {count !== null ? (
                    <span
                      className={[
                        "ab-nav-count",
                        count === 0 ? "is-empty" : "",
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>
      ))}
    </aside>
  );
}
