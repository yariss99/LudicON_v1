import { useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import FloatingSuggestion from "./FloatingSuggestion";
import LoadingBlock from "./LoadingBlock";
import PrimaButton from "./PrimaButton";
import PrimaCard from "./PrimaCard";
import PrimaMark from "./PrimaMark";
import SectionHeader from "./SectionHeader";
import StatusBadge from "./StatusBadge";
import TeachingShell from "./TeachingShell";

/**
 * Living DESIGN-001 showcase — visual QA for the component library.
 */
function DesignSystemShowcasePage() {
  const [suggestion, setSuggestion] = useState(true);

  return (
    <TeachingShell
      header={
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <PrimaMark size={28} />
            <div>
              <p className="text-sm font-semibold text-[var(--prima-text)]">
                Design System
              </p>
              <p className="text-[11px] text-[var(--prima-text-muted)]">
                DESIGN-001 · Biroul de predare
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="text-sm font-semibold text-[var(--prima-text-muted)] no-underline hover:text-[var(--prima-text)]"
          >
            Înapoi la birou
          </Link>
        </div>
      }
      prima={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--prima-text-muted)]">
            Observație
          </p>
          <p className="text-sm leading-relaxed text-[var(--prima-text)]">
            Lucrezi la Design System. Păstrez panoul deschis — ca în lecție —
            fără să întrerup.
          </p>
          {suggestion ? (
            <FloatingSuggestion
              message="Ai putea folosi aceste componente în Proiectul lecției, ca totul să se simtă din același birou."
              onAccept={() => setSuggestion(false)}
              onDismiss={() => setSuggestion(false)}
            />
          ) : null}
          <PrimaCard padding="sm">
            <p className="text-xs font-semibold text-[var(--prima-text-muted)]">
              Insight
            </p>
            <p className="mt-1 text-sm text-[var(--prima-text)]">
              Un singur model de interacțiune pentru fiecare material.
            </p>
          </PrimaCard>
        </>
      }
    >
      <SectionHeader
        title="Biblioteca de componente"
        description="Tot ce construim de acum înainte pornește de aici — calm, clar, profesional."
      />

      <div className="space-y-8">
        <PrimaCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--prima-text-muted)]">
            Identitate
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <PrimaMark size={20} />
            <PrimaMark size={28} />
            <PrimaMark size={36} />
            <PrimaMark size={48} />
          </div>
        </PrimaCard>

        <PrimaCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--prima-text-muted)]">
            Butoane
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaButton variant="primary">Creează materialele</PrimaButton>
            <PrimaButton variant="secondary">Salvează</PrimaButton>
            <PrimaButton variant="ghost">Mai târziu</PrimaButton>
            <PrimaButton variant="danger">Șterge</PrimaButton>
          </div>
        </PrimaCard>

        <PrimaCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--prima-text-muted)]">
            Stări
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge tone="saved">✓ Salvat automat</StatusBadge>
            <StatusBadge tone="syncing">Se salvează...</StatusBadge>
            <StatusBadge tone="attention">De revăzut</StatusBadge>
            <StatusBadge tone="neutral">În lucru</StatusBadge>
          </div>
        </PrimaCard>

        <div className="grid gap-4 md:grid-cols-2">
          <PrimaCard interactive>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--prima-text-muted)]">
              Empty state
            </p>
            <div className="mt-3">
              <EmptyState onAction={() => undefined} />
            </div>
          </PrimaCard>
          <PrimaCard>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--prima-text-muted)]">
              Loading
            </p>
            <div className="mt-3">
              <LoadingBlock rows={3} />
            </div>
          </PrimaCard>
        </div>

        <PrimaCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--prima-text-muted)]">
            Culori
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Primary", "var(--prima-primary)"],
              ["Secondary", "var(--prima-secondary)"],
              ["Accent", "var(--prima-accent)"],
              ["Background", "var(--prima-bg)"],
            ].map(([label, color]) => (
              <div key={label} className="space-y-2">
                <div
                  className="h-14 rounded-[var(--radius-md)] ring-1 ring-[var(--prima-border)]"
                  style={{ background: color }}
                />
                <p className="text-xs font-medium text-[var(--prima-text-muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </PrimaCard>
      </div>
    </TeachingShell>
  );
}

export default DesignSystemShowcasePage;
