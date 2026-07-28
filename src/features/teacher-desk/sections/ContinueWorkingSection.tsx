import { PrimaButton } from "../../../design-system";
import type { Project } from "../../../types/project";
import AtelierSectionHeader from "../components/AtelierSectionHeader";
import ContinueLessonCard from "../components/ContinueLessonCard";

type ContinueWorkingSectionProps = {
  projects: readonly Project[];
  onContinue: (projectId: string) => void;
  onCreate: () => void;
};

function ContinueWorkingSection({
  projects,
  onContinue,
  onCreate,
}: ContinueWorkingSectionProps) {
  return (
    <section
      className="atelier-section"
      aria-labelledby="continue-working-heading"
    >
      <AtelierSectionHeader
        id="continue-working-heading"
        title="Continuă ce ai început"
        description="Revino la lecțiile în lucru — fără să pierzi firul."
      />

      {projects.length === 0 ? (
        <div className="atelier-card max-w-xl">
          <p className="atelier-card-title">Nu ai încă o lecție în lucru.</p>
          <p className="atelier-body mt-2">
            Când începi una, o vei găsi aici pentru a continua ușor.
          </p>
          <div className="atelier-card-foot">
            <PrimaButton
              variant="primary"
              className="min-h-11"
              onClick={onCreate}
            >
              Creează prima lecție
            </PrimaButton>
          </div>
        </div>
      ) : (
        <div className="atelier-grid-lessons">
          {projects.map((project) => (
            <ContinueLessonCard
              key={project.id}
              project={project}
              onContinue={onContinue}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ContinueWorkingSection;
