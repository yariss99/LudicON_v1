import AtelierSectionHeader from "../components/AtelierSectionHeader";
import ImpactStatCard from "../components/ImpactStatCard";
import type { AtelierImpact } from "../services/atelierMetrics";

type ActivityImpactSectionProps = {
  impact: AtelierImpact;
};

function formatHours(hours: number): string {
  if (hours === 0) return "0";
  if (Number.isInteger(hours)) return String(hours);
  return hours.toFixed(1).replace(".", ",");
}

function ActivityImpactSection({ impact }: ActivityImpactSectionProps) {
  return (
    <section
      className="atelier-section--footer"
      aria-labelledby="activity-impact-heading"
    >
      <AtelierSectionHeader
        id="activity-impact-heading"
        title="Activitatea ta"
        description="Progresul tău, în limbajul clasei."
      />

      <div className="atelier-grid-stats">
        <ImpactStatCard
          label="Lecții create"
          value={String(impact.lessonsCreated)}
          hint="Lecții pe care le-ai proiectat în atelier."
        />
        <ImpactStatCard
          label="Materiale realizate"
          value={String(impact.materialsReady)}
          hint="Resurse gata de folosit cu elevii."
        />
        <ImpactStatCard
          label="Ore pregătite"
          value={formatHours(impact.hoursPrepared)}
          hint="Timp didactic estimat pentru lecțiile tale."
        />
        <ImpactStatCard
          label="Impact educațional"
          value={impact.impactLabel}
          hint={impact.impactLine}
        />
      </div>
    </section>
  );
}

export default ActivityImpactSection;
