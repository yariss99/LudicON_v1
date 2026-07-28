type AtelierSectionHeaderProps = {
  id: string;
  title: string;
  description?: string;
};

function AtelierSectionHeader({
  id,
  title,
  description,
}: AtelierSectionHeaderProps) {
  return (
    <header className="atelier-section-header">
      <h2 id={id} className="atelier-section-title">
        {title}
      </h2>
      {description ? (
        <p className="atelier-section-caption">{description}</p>
      ) : null}
    </header>
  );
}

export default AtelierSectionHeader;
