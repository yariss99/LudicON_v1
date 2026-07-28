import { DESK_SPACES, type DeskSpaceId } from "../constants";

type SpacesRailProps = {
  activeSpace: DeskSpaceId;
  onSelect: (space: DeskSpaceId) => void;
  favoriteCount: number;
  projectCount: number;
  archiveCount: number;
};

function SpacesRail({
  activeSpace,
  onSelect,
  favoriteCount,
  projectCount,
  archiveCount,
}: SpacesRailProps) {
  const counts: Partial<Record<DeskSpaceId, number>> = {
    projects: projectCount,
    favorites: favoriteCount,
    archive: archiveCount,
  };

  return (
    <aside className="desk-enter rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-sm lg:sticky lg:top-6 lg:min-h-[calc(100vh-120px)]">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Spaces
      </p>

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Spaces">
        {DESK_SPACES.map((space) => {
          const Icon = space.icon;
          const active = activeSpace === space.id;
          const count = counts[space.id];

          return (
            <button
              key={space.id}
              type="button"
              onClick={() => onSelect(space.id)}
              className={[
                "flex min-w-[140px] items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-all lg:min-w-0",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              <span className="flex-1 truncate">{space.label}</span>
              {typeof count === "number" ? (
                <span
                  className={[
                    "rounded-full px-1.5 py-0.5 text-[11px]",
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <p className="mt-6 hidden px-2 text-xs leading-relaxed text-slate-400 lg:block">
        Quick access only. Your work comes to you — no deep menus.
      </p>
    </aside>
  );
}

export default SpacesRail;
