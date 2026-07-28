import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PrimaButton,
  PrimaCard,
  PrimaMark,
  SectionHeader,
  StatusBadge,
} from "../../design-system";
import {
  graphPathFrom,
  knowledgeHubEngine,
  pendingLinkSuggestions,
  recommend,
  resolveLinkSuggestion,
  search,
  timeline,
  upsertProfessionalNote,
  type KnowledgeSearchHit,
} from "../../engines/khpm";

const KIND_RO: Record<string, string> = {
  lesson_design: "Lecție",
  learning_activity: "Activitate",
  pedagogical_object: "Material",
  teaching_strategy: "Strategie",
  assessment_method: "Evaluare",
  template: "Șablon",
  reflection_note: "Reflecție",
  curriculum_ref: "Curriculum",
  professional_note: "Notă",
  media: "Media",
  topic: "Temă",
  pattern: "Pattern",
  collection: "Colecție",
  differentiation_strategy: "Diferențiere",
};

function KnowledgeHubPage() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  const [query, setQuery] = useState(
    "activități cooperative pentru Matematică clasa a II-a",
  );
  const [hits, setHits] = useState<KnowledgeSearchHit[]>([]);
  const [selectedId, setSelectedId] = useState("kn_topic_fractions");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const collections = useMemo(() => {
    void tick;
    return knowledgeHubEngine.listCollections();
  }, [tick]);

  const recommendations = useMemo(() => {
    void tick;
    return recommend({
      subject: "Matematică",
      grade: "Clasa a III-a",
      topicText: "fracții",
      strategy: "cooperative",
    });
  }, [tick]);

  const patterns = useMemo(() => {
    void tick;
    return knowledgeHubEngine.patterns();
  }, [tick]);

  const pending = useMemo(() => {
    void tick;
    return pendingLinkSuggestions();
  }, [tick]);

  const timelinePoints = useMemo(() => {
    void tick;
    return timeline();
  }, [tick]);

  const path = useMemo(() => {
    void tick;
    return graphPathFrom(selectedId, 4);
  }, [tick, selectedId]);

  const selected = useMemo(() => {
    void tick;
    return knowledgeHubEngine.getNode(selectedId);
  }, [tick, selectedId]);

  const runSearch = () => {
    setHits(search(query));
    setMessage(null);
  };

  const saveNote = () => {
    if (!noteTitle.trim()) return;
    upsertProfessionalNote({
      title: noteTitle.trim(),
      summary: noteBody.trim() || noteTitle.trim(),
      tags: ["notă", "personal"],
    });
    setNoteTitle("");
    setNoteBody("");
    setMessage("Nota a fost adăugată în hub — privată implicit.");
    refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--prima-bg)] px-4 py-8 text-[var(--prima-text)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <PrimaMark size={28} />
            <SectionHeader
              title="Knowledge Hub"
              description="Descoperă cunoaștere pedagogică — nu fișiere. Privată implicit. Conexiunile se aprobă de tine."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/reflection">
              <PrimaButton variant="ghost">Reflecții</PrimaButton>
            </Link>
            <Link to="/library">
              <PrimaButton variant="secondary">Bibliotecă</PrimaButton>
            </Link>
            <Link to="/editor/demo">
              <PrimaButton variant="primary">Editor</PrimaButton>
            </Link>
          </div>
        </div>

        {message ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--prima-secondary-soft)] px-4 py-3 text-sm text-[var(--prima-secondary)]">
            {message}
          </p>
        ) : null}

        <PrimaCard>
          <h2 className="text-lg font-semibold">Căutare inteligentă</h2>
          <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
            Limbaj natural sau filtre — ex. activități cooperative, clasa a II-a,
            Matematică.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm"
            />
            <PrimaButton variant="primary" onClick={runSearch}>
              Caută
            </PrimaButton>
          </div>
          {hits.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {hits.map((hit) => (
                <li key={hit.nodeId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(hit.nodeId)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--prima-border)] px-3 py-2 text-left hover:border-[var(--prima-primary)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{hit.title}</span>
                      <StatusBadge tone="neutral">
                        {KIND_RO[hit.kind] ?? hit.kind}
                      </StatusBadge>
                      <span className="text-xs text-[var(--prima-text-muted)]">
                        scor {hit.score}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--prima-text-muted)]">
                      {hit.excerpt}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </PrimaCard>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <PrimaCard>
            <h2 className="text-lg font-semibold">Graf de cunoaștere</h2>
            <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
              Navighezi idei, nu foldere.
            </p>
            {selected ? (
              <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--prima-panel)] px-3 py-3">
                <p className="text-sm font-semibold">{selected.title}</p>
                <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
                  {selected.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <StatusBadge tone="saved">{selected.visibility}</StatusBadge>
                  {selected.subject ? (
                    <StatusBadge tone="neutral">{selected.subject}</StatusBadge>
                  ) : null}
                  {selected.grade ? (
                    <StatusBadge tone="neutral">{selected.grade}</StatusBadge>
                  ) : null}
                </div>
              </div>
            ) : null}
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--prima-text-muted)]">
              Parcurs conectat
            </p>
            <ol className="mt-2 space-y-1">
              {path.labels.map((label) => (
                <li key={label} className="text-sm">
                  → {label}
                </li>
              ))}
            </ol>
          </PrimaCard>

          <div className="space-y-4">
            <PrimaCard padding="sm">
              <h2 className="text-base font-semibold">Recomandări</h2>
              <ul className="mt-3 space-y-2">
                {recommendations.slice(0, 5).map((rec) => (
                  <li key={rec.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(rec.nodeId)}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-2 py-2 text-left text-sm"
                    >
                      <span className="font-semibold">{rec.title}</span>
                      <p className="text-xs text-[var(--prima-text-muted)]">
                        {rec.reason}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </PrimaCard>

            <PrimaCard padding="sm">
              <h2 className="text-base font-semibold">Legături sugerate</h2>
              <p className="mt-1 text-xs text-[var(--prima-text-muted)]">
                Aprobă sau respinge — nimic nu se aplică automat.
              </p>
              <ul className="mt-3 space-y-2">
                {pending.slice(0, 4).map((edge) => (
                  <li
                    key={edge.id}
                    className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-2 py-2 text-sm"
                  >
                    <p className="text-xs text-[var(--prima-text-muted)]">
                      {edge.label}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <PrimaButton
                        variant="primary"
                        className="!min-h-8 !px-3 !py-1 !text-xs"
                        onClick={() => {
                          resolveLinkSuggestion(edge.id, "approved");
                          refresh();
                        }}
                      >
                        Aprobă
                      </PrimaButton>
                      <PrimaButton
                        variant="ghost"
                        className="!min-h-8 !px-3 !py-1 !text-xs"
                        onClick={() => {
                          resolveLinkSuggestion(edge.id, "rejected");
                          refresh();
                        }}
                      >
                        Respinge
                      </PrimaButton>
                    </div>
                  </li>
                ))}
                {pending.length === 0 ? (
                  <li className="text-sm text-[var(--prima-text-muted)]">
                    Nu sunt legături în așteptare.
                  </li>
                ) : null}
              </ul>
            </PrimaCard>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <PrimaCard>
            <h2 className="text-base font-semibold">Colecții</h2>
            <ul className="mt-3 space-y-2">
              {collections.map((col) => (
                <li
                  key={col.id}
                  className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2"
                >
                  <p className="text-sm font-semibold">{col.title}</p>
                  <p className="text-xs text-[var(--prima-text-muted)]">
                    {col.nodeIds.length} elemente · {col.visibility}
                    {col.autoSuggest ? " · auto-sugestii" : ""}
                  </p>
                </li>
              ))}
            </ul>
          </PrimaCard>

          <PrimaCard>
            <h2 className="text-base font-semibold">Pattern-uri pedagogice</h2>
            <ul className="mt-3 space-y-2">
              {patterns.map((p) => (
                <li
                  key={p.id}
                  className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm"
                >
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-[var(--prima-text-muted)]">
                    {p.description}
                  </p>
                  <p className="mt-1 text-xs">
                    {p.structureHints.join(" → ")}
                  </p>
                </li>
              ))}
            </ul>
          </PrimaCard>

          <PrimaCard>
            <h2 className="text-base font-semibold">Cronologie</h2>
            <ul className="mt-3 space-y-2">
              {timelinePoints.slice(0, 6).map((point) => (
                <li key={point.id} className="text-sm">
                  <button
                    type="button"
                    className="text-left hover:text-[var(--prima-primary)]"
                    onClick={() =>
                      point.relatedNodeIds[0] &&
                      setSelectedId(point.relatedNodeIds[0])
                    }
                  >
                    {point.labelRo}
                  </button>
                </li>
              ))}
            </ul>
          </PrimaCard>
        </section>

        <PrimaCard>
          <h2 className="text-lg font-semibold">Notă profesională</h2>
          <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
            Observații, idei, experimente — căutabile și conectabile.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Titlu"
              className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm"
            />
            <input
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Rezumat"
              className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-3">
            <PrimaButton variant="secondary" onClick={saveNote}>
              Salvează nota
            </PrimaButton>
          </div>
        </PrimaCard>
      </div>
    </div>
  );
}

export default KnowledgeHubPage;
