import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  DESTINATION_LABELS_RO,
  FORMAT_LABELS,
  listPublications,
  reproducePublication,
  type PublicationRecord,
} from "../../engines/pde";
import { PrimaButton, PrimaCard, PrimaMark, SectionHeader, StatusBadge } from "../../design-system";

function PublishingDashboardPage() {
  const [tick, setTick] = useState(0);
  const publications = useMemo(() => {
    void tick;
    return listPublications();
  }, [tick]);

  const refresh = () => setTick((n) => n + 1);

  const onReproduce = (publicationId: string) => {
    reproducePublication(publicationId, {
      id: "teacher_local",
      name: "Profesor",
    });
    refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--prima-bg)] px-4 py-8 text-[var(--prima-text)] sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <PrimaMark size={28} />
            <div>
              <SectionHeader
                title="Publicări"
                description="Livrează experiențe de învățare — nu fișiere. Fiecare publicare rămâne legată de materialul pedagogic."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/editor/demo">
              <PrimaButton variant="primary">Deschide editorul</PrimaButton>
            </Link>
            <PrimaButton variant="secondary" onClick={refresh}>
              Actualizează
            </PrimaButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Recente"
            value={String(publications.filter((p) => p.status === "published").length)}
          />
          <Stat
            label="În așteptare"
            value={String(publications.filter((p) => p.status === "pending").length)}
          />
          <Stat label="În istoric" value={String(publications.length)} />
        </div>

        {publications.length === 0 ? (
          <PrimaCard>
            <p className="text-sm text-[var(--prima-text-muted)]">
              Încă nu ai publicații. Deschide un material în editor, previzualizează-l,
              apoi publică din panoul Export.
            </p>
          </PrimaCard>
        ) : (
          <ul className="space-y-3">
            {publications.map((pub) => (
              <PublicationRow
                key={pub.publicationId}
                publication={pub}
                onReproduce={() => onReproduce(pub.publicationId)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <PrimaCard padding="sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--prima-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </PrimaCard>
  );
}

function PublicationRow({
  publication,
  onReproduce,
}: {
  publication: PublicationRecord;
  onReproduce: () => void;
}) {
  return (
    <li>
      <PrimaCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">
                {publication.objectTitle}
              </h2>
              <StatusBadge
                tone={publication.status === "published" ? "saved" : "neutral"}
              >
                {publication.status}
              </StatusBadge>
              {publication.readiness.ok ? (
                <StatusBadge tone="saved">Gata de livrare</StatusBadge>
              ) : (
                <StatusBadge tone="attention">Verificări</StatusBadge>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
              {DESTINATION_LABELS_RO[publication.destination] ??
                publication.destination}
              {" · "}
              {FORMAT_LABELS[publication.format] ?? publication.format}
              {" · "}
              {new Date(publication.createdAt).toLocaleString("ro-RO")}
            </p>
            <p className="mt-1 text-xs text-[var(--prima-text-muted)]">
              Obiect {publication.objectId} @ {publication.objectVersionId}
              {publication.reproducedFromPublicationId
                ? ` · reprodus din ${publication.reproducedFromPublicationId}`
                : ""}
            </p>
            {publication.artifacts.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-[var(--prima-text-muted)]">
                {publication.artifacts.slice(0, 3).map((a) => (
                  <li key={a.id}>
                    {a.label}: <span className="font-mono">{a.locator}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <PrimaButton variant="secondary" onClick={onReproduce}>
            Reproduce
          </PrimaButton>
        </div>
      </PrimaCard>
    </li>
  );
}

export default PublishingDashboardPage;
