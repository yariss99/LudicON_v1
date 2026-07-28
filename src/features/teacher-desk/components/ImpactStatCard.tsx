type ImpactStatCardProps = {
  label: string;
  value: string;
  hint: string;
};

function ImpactStatCard({ label, value, hint }: ImpactStatCardProps) {
  return (
    <article className="atelier-card atelier-card--static atelier-stat-card">
      <p className="atelier-label">{label}</p>
      <p className="atelier-metric atelier-card-gap-sm">{value}</p>
      <p className="atelier-caption atelier-line-clamp-2 mt-auto pt-4">
        {hint}
      </p>
    </article>
  );
}

export default ImpactStatCard;
