import { PrimaButton } from "../../../design-system";
import type { Project } from "../../../types/project";
import { CONTINUE_EXPERIENCE_LABEL } from "../constants";
import {
  formatRelativeEdited,
  progressPercentFromState,
} from "../services/atelierMetrics";

type ContinueLessonCardProps = {
  project: Project;
  onContinue: (projectId: string) => void;
};

function ContinueLessonCard({ project, onContinue }: ContinueLessonCardProps) {
  const progress = progressPercentFromState(project.state);

  return (
    <article className="atelier-card atelier-card--lift atelier-lesson-card">
      <div className="atelier-card-stack">
        <h3 className="atelier-card-title atelier-line-clamp-2">
          {project.title}
        </h3>

        <p className="atelier-meta atelier-card-gap-sm">
          <span>{project.subject}</span>
          {project.grade ? (
            <>
              <span aria-hidden> · </span>
              <span>{project.grade}</span>
            </>
          ) : null}
        </p>
        <p className="atelier-meta">
          Editat {formatRelativeEdited(project.updatedAt)}
        </p>
      </div>

      <div className="atelier-card-foot">
        <div className="atelier-caption mb-2 flex items-center justify-between">
          <span>Progres</span>
          <span className="font-medium tabular-nums text-[var(--atelier-ink)]">
            {progress}%
          </span>
        </div>
        <div
          className="atelier-progress-track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progres ${progress} la sută`}
        >
          <div
            className="atelier-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="atelier-card-gap-lg">
          <PrimaButton
            variant="primary"
            className="min-h-11 w-full"
            onClick={() => onContinue(project.id)}
          >
            {CONTINUE_EXPERIENCE_LABEL}
          </PrimaButton>
        </div>
      </div>
    </article>
  );
}

export default ContinueLessonCard;
