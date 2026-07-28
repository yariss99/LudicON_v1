import { BLOCK_LABELS, INSERTABLE_BLOCKS, LEFT_TABS } from "../constants";
import type { UpeDocument, UpeLeftTab, UpeSearchHit } from "../types";

type UpeLeftSidebarProps = {
  tab: UpeLeftTab;
  onTab: (tab: UpeLeftTab) => void;
  document: UpeDocument;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  searchHits: UpeSearchHit[];
  onInsert: (type: (typeof INSERTABLE_BLOCKS)[number]["type"]) => void;
};

function UpeLeftSidebar({
  tab,
  onTab,
  document,
  selectedBlockId,
  onSelectBlock,
  searchQuery,
  onSearch,
  searchHits,
  onInsert,
}: UpeLeftSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Caută în material…"
        className="w-full rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm"
      />

      <div className="flex flex-wrap gap-1">
        {LEFT_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTab(item.id)}
            className={[
              "rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] font-semibold",
              tab === item.id
                ? "bg-[var(--prima-primary)] text-white"
                : "bg-slate-100 text-[var(--prima-text-muted)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {searchQuery.trim() ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--prima-text-muted)]">
            Rezultate
          </p>
          {searchHits.length === 0 ? (
            <p className="text-sm text-[var(--prima-text-muted)]">
              Niciun rezultat.
            </p>
          ) : (
            searchHits.map((hit) => (
              <button
                key={hit.id}
                type="button"
                onClick={() => hit.blockId && onSelectBlock(hit.blockId)}
                className="block w-full rounded-[var(--radius-md)] border border-[var(--prima-border)] bg-white px-3 py-2 text-left"
              >
                <span className="text-xs font-semibold text-[var(--prima-primary)]">
                  {hit.title}
                </span>
                <p className="mt-0.5 line-clamp-2 text-xs text-[var(--prima-text-muted)]">
                  {hit.excerpt}
                </p>
              </button>
            ))
          )}
        </div>
      ) : null}

      {tab === "structure" && !searchQuery.trim() ? (
        <ul className="space-y-1">
          {document.blocks.map((block) => (
            <li key={block.id}>
              <button
                type="button"
                onClick={() => onSelectBlock(block.id)}
                className={[
                  "w-full rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-sm",
                  selectedBlockId === block.id
                    ? "bg-blue-50 font-semibold text-[var(--prima-primary)]"
                    : "text-[var(--prima-text)] hover:bg-slate-50",
                  block.visibility === "hidden" ? "opacity-50" : "",
                ].join(" ")}
              >
                {BLOCK_LABELS[block.type] ?? block.type}
                {block.locked ? " · 🔒" : ""}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "templates" || tab === "objects" ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--prima-text-muted)]">
            Adaugă bloc
          </p>
          <div className="flex flex-col gap-1">
            {INSERTABLE_BLOCKS.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => onInsert(item.type)}
                className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] bg-white px-2 py-1.5 text-left text-sm hover:border-[var(--prima-primary)]"
              >
                + {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "library" || tab === "media" ? (
        <p className="text-sm text-[var(--prima-text-muted)]">
          Biblioteca și media se conectează aici în sprinturile următoare.
        </p>
      ) : null}
    </div>
  );
}

export default UpeLeftSidebar;
