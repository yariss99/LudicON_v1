type AtelierHeroProps = {
  greeting: string;
  teacherName: string;
};

function AtelierHero({ greeting, teacherName }: AtelierHeroProps) {
  const name = teacherName.trim() || "profesorule";

  return (
    <header className="max-w-lg">
      <p className="atelier-eyebrow">Atelierul Profesorului</p>
      <h1 className="atelier-hero-title">
        {greeting}, {name}.
      </h1>
      <p className="atelier-hero-subtitle">Ce dorești să creezi astăzi?</p>
    </header>
  );
}

export default AtelierHero;
