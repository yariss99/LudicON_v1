import { FloatingSuggestion, PrimaButton, SectionHeader } from "../../../design-system";
import { RIGHT_TABS } from "../constants";
import type { UpeEditorBlock, UpeRightTab } from "../types";

type Suggestion = {
  id: string;
  title: string;
  explanation: string;
  rationale: string;
};

type UpeRightSidebarProps = {
  tab: UpeRightTab;
  onTab: (tab: UpeRightTab) => void;
  selectedBlock: UpeEditorBlock | null;
  objectives: string[];
  competencies: string[];
  suggestions: Suggestion[];
  onMove: (dir: "up" | "down") => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onHide: () => void;
  onDelete: () => void;
};

function UpeRightSidebar({
  tab,
  onTab,
  selectedBlock,
  objectives,
  competencies,
  suggestions,
  onMove,
  onDuplicate,
  onToggleLock,
  onHide,
  onDelete,
}: UpeRightSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex flex-wrap gap-1">
        {RIGHT_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTab(item.id)}
            className={[
              "rounded-[var(--radius-full)] px-2 py-1 text-[11px] font-semibold",
              tab === item.id
                ? "bg-[var(--prima-primary)] text-white"
                : "bg-white text-[var(--prima-text-muted)] ring-1 ring-[var(--prima-border)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {(tab === "properties" || tab === "design") && (
        <div className="space-y-3">
          <SectionHeader
            title="Bloc selectat"
            description={
              selectedBlock
                ? "Editează și organizează fără a părăsi canvasul."
                : "Selectează un bloc pe canvas."
            }
          />
          {selectedBlock ? (
            <>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-[var(--prima-text-muted)]">Tip</dt>
                  <dd className="font-medium">{selectedBlock.type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--prima-text-muted)]">
                    Vizibilitate
                  </dt>
                  <dd className="font-medium">{selectedBlock.visibility}</dd>
                </div>
                {selectedBlock.pedagogicalPurpose ? (
                  <div>
                    <dt className="text-xs text-[var(--prima-text-muted)]">
                      Rol pedagogic
                    </dt>
                    <dd className="font-medium">
                      {selectedBlock.pedagogicalPurpose}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div className="flex flex-wrap gap-2">
                <PrimaButton variant="secondary" onClick={() => onMove("up")}>
                  Sus
                </PrimaButton>
                <PrimaButton variant="secondary" onClick={() => onMove("down")}>
                  Jos
                </PrimaButton>
                <PrimaButton variant="ghost" onClick={onDuplicate}>
                  Duplică
                </PrimaButton>
                <PrimaButton variant="ghost" onClick={onToggleLock}>
                  {selectedBlock.locked ? "Deblochează" : "Blochează"}
                </PrimaButton>
                <PrimaButton variant="ghost" onClick={onHide}>
                  Ascunde
                </PrimaButton>
                <PrimaButton variant="danger" onClick={onDelete}>
                  Șterge
                </PrimaButton>
              </div>
            </>
          ) : null}
        </div>
      )}

      {(tab === "pedagogy" || tab === "alignment") && (
        <div className="space-y-3">
          <SectionHeader
            title="Aliniere pedagogică"
            description="Conținutul rămâne legat de proiectul lecției."
          />
          <div>
            <p className="text-xs font-semibold text-[var(--prima-text-muted)]">
              Obiective
            </p>
            <ul className="mt-1 space-y-1 text-sm">
              {objectives.map((o) => (
                <li key={o}>• {o}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--prima-text-muted)]">
              Competențe
            </p>
            <ul className="mt-1 space-y-1 text-sm">
              {competencies.map((c) => (
                <li key={c}>• {c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "accessibility" && (
        <p className="text-sm text-[var(--prima-text-muted)]">
          Verifică contrastul, textele alternative și instrucțiunile clare.
          Problemele apar în panoul de validare.
        </p>
      )}

      {tab === "recommendations" && (
        <div className="space-y-3">
          <SectionHeader
            title="Recomandări PRIMA"
            description="Opționale — tu decidei ce aplici."
          />
          {suggestions.length === 0 ? (
            <p className="text-sm text-[var(--prima-text-muted)]">
              Momentan nu sunt recomandări critice.
            </p>
          ) : (
            suggestions.map((s) => (
              <FloatingSuggestion
                key={s.id}
                message={`${s.title} — ${s.explanation}`}
                acceptLabel="Aplică"
                dismissLabel="Ignoră"
                onAccept={() => undefined}
                onDismiss={() => undefined}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default UpeRightSidebar;
