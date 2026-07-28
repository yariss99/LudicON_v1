type SectionHeaderProps = {
  id: string;
  title: string;
  description?: string;
  /** Emphasize mentor / primary sections */
  emphasis?: boolean;
};

function SectionHeader({
  id,
  title,
  description,
  emphasis = false,
}: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2
        id={id}
        className={
          emphasis
            ? "text-sm font-semibold uppercase tracking-[0.16em] text-sky-800"
            : "text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
        }
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default SectionHeader;
