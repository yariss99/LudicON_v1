import { ArrowRight, Check } from "lucide-react";
import { useAssessmentBuilder } from "../hooks/useAssessmentBuilder";
import {
  buildNextAction,
  buildWorkflowStages,
} from "../services/assessmentWorkflow";

/**
 * Makes the four-stage journey visible above the editor.
 * Orientation only — every stage stays freely clickable and nothing is gated.
 */
export function AssessmentWorkflowBar() {
  const {
    assessment,
    sectionId,
    setSectionId,
    setPanel,
    addGroup,
    runValidation,
    publish,
  } = useAssessmentBuilder();

  const stages = buildWorkflowStages(assessment, sectionId);
  const next = buildNextAction(assessment);
  const current = stages.find((stage) => stage.isCurrent);

  function goTo(section: Parameters<typeof setSectionId>[0]) {
    setSectionId(section);
    if (section === "analytics") setPanel("analytics");
    else if (section === "export") setPanel("export");
    else setPanel("editor");
  }

  function runNext() {
    if (next.command === "addGroup") addGroup();
    if (next.command === "runValidation") {
      runValidation();
      return;
    }
    if (next.command === "publish") {
      const result = publish();
      if (!result.ok) window.alert(result.error);
      return;
    }
    if (next.sectionId) goTo(next.sectionId);
  }

  return (
    <section className="ab-workflow" aria-label="Etapele evaluării">
      <ol className="ab-wf-track">
        {stages.map((stage, index) => (
          <li key={stage.id} className="ab-wf-item">
            {index > 0 ? <span className="ab-wf-link" aria-hidden /> : null}
            <button
              type="button"
              className={[
                "ab-wf-stage",
                `is-${stage.status}`,
                stage.isCurrent ? "is-current" : "",
              ].join(" ")}
              aria-current={stage.isCurrent ? "step" : undefined}
              title={stage.hint}
              onClick={() => goTo(stage.entrySectionId)}
            >
              <span className="ab-wf-marker" aria-hidden>
                {stage.status === "done" ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  stage.index + 1
                )}
              </span>
              <span className="ab-wf-label">{stage.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="ab-wf-next">
        <p className="ab-wf-now">
          {current ? (
            <>
              <span className="ab-wf-now-stage">{current.label}</span>
              <span className="ab-wf-now-hint">{current.hint}</span>
            </>
          ) : null}
        </p>

        <div className="ab-wf-cta">
          <span className="ab-wf-cta-hint">{next.hint}</span>
          <button
            type="button"
            className="ab-btn ab-btn-primary ab-wf-cta-btn"
            onClick={runNext}
          >
            {next.label}
            <ArrowRight size={14} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
