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
  addObservation,
  getClassDashboard,
  pieHandoffForClass,
  progressTimeline,
  resolveSuggestion,
  studentLearningEngine,
  type LearnerProfile,
} from "../../engines/sli";

function StudentLearningPage() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  const bundle = useMemo(() => {
    void tick;
    return getClassDashboard();
  }, [tick]);

  const timeline = useMemo(() => {
    void tick;
    return progressTimeline();
  }, [tick]);

  const handoff = useMemo(() => {
    void tick;
    return pieHandoffForClass();
  }, [tick]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [obsNote, setObsNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const selected: LearnerProfile | null =
    bundle.profiles.find((p) => p.learnerId === selectedId) ?? null;

  const aliasName = (id: string) =>
    bundle.profiles.find((p) => p.learnerId === id)?.alias.displayName ?? id;

  const saveObs = () => {
    if (!selectedId || !obsNote.trim()) return;
    addObservation({ learnerId: selectedId, note: obsNote.trim() });
    setObsNote("");
    setMessage("Observația a fost salvată (editabilă, privată clasei).");
    refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--prima-bg)] px-4 py-8 text-[var(--prima-text)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <PrimaMark size={28} />
            <SectionHeader
              title="Înțelegerea învățării"
              description="Evidențe și perspective pentru decizii didactice — fără clasamente, fără note predictive, fără etichetare."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/reflection">
              <PrimaButton variant="ghost">Reflecție</PrimaButton>
            </Link>
            <Link to="/knowledge">
              <PrimaButton variant="secondary">Knowledge Hub</PrimaButton>
            </Link>
            <Link
              to="/blueprint/review"
              onClick={() => {
                if (!handoff) return;
                try {
                  sessionStorage.setItem(
                    "prima.sli.pie.handoff",
                    JSON.stringify(handoff),
                  );
                } catch {
                  /* ignore */
                }
              }}
            >
              <PrimaButton variant="primary">Trimite către PIE</PrimaButton>
            </Link>
          </div>
        </div>

        {message ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--prima-secondary-soft)] px-4 py-3 text-sm text-[var(--prima-secondary)]">
            {message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="saved">Fără clasamente</StatusBadge>
          <StatusBadge tone="neutral">
            {bundle.dashboard.lessonTitle ?? "Lecție"}
          </StatusBadge>
          <StatusBadge tone="attention">
            {`${bundle.dashboard.needingSupport.length} au nevoie de sprijin`}
          </StatusBadge>
          <StatusBadge tone="saved">
            {`${bundle.dashboard.readyForEnrichment.length} gata de extensie`}
          </StatusBadge>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <PrimaCard>
            <h2 className="text-lg font-semibold">Progres pe obiective</h2>
            <ul className="mt-3 space-y-3">
              {bundle.dashboard.objectives.map((obj) => (
                <li key={obj.objectiveId}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{obj.labelRo}</span>
                    <span className="text-[var(--prima-text-muted)]">
                      ~{obj.achievedApproxShare}% evidențe de reușită
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-[var(--prima-primary)]"
                      style={{ width: `${obj.achievedApproxShare}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </PrimaCard>

          <PrimaCard>
            <h2 className="text-lg font-semibold">Hartă pe competențe</h2>
            <ul className="mt-3 space-y-2">
              {bundle.dashboard.competencies.map((comp) => (
                <li
                  key={comp.competencyId}
                  className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{comp.labelRo}</span>
                    {comp.needsReinforcement ? (
                      <StatusBadge tone="attention">de consolidat</StatusBadge>
                    ) : (
                      <StatusBadge tone="saved">pe drum bun</StatusBadge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--prima-text-muted)]">
                    {comp.evidenceCount} evidențe · {comp.learnersWithEvidence}{" "}
                    elevi cu urme de învățare
                  </p>
                </li>
              ))}
            </ul>
          </PrimaCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <PrimaCard>
            <h2 className="text-lg font-semibold">Perspective de clasă</h2>
            <ul className="mt-3 space-y-3">
              {bundle.dashboard.insights.map((insight) => (
                <li
                  key={insight.id}
                  className="rounded-[var(--radius-md)] border border-[var(--prima-border)] px-3 py-2"
                >
                  <p className="text-sm font-semibold">{insight.titleRo}</p>
                  <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
                    {insight.detailRo}
                  </p>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-base font-semibold">
              Confuzii recurente
            </h3>
            <ul className="mt-2 space-y-3">
              {bundle.dashboard.misconceptions.map((m) => (
                <li
                  key={m.id}
                  className="rounded-[var(--radius-md)] bg-[var(--prima-accent-soft)]/40 px-3 py-2"
                >
                  <p className="text-sm font-semibold">{m.titleRo}</p>
                  <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
                    {m.descriptionRo} · {m.learnerCount} elevi
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--prima-text-muted)]">
                    Acțiuni sugerate
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-xs text-[var(--prima-text-muted)]">
                    {m.suggestedActions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </PrimaCard>

          <div className="space-y-4">
            <PrimaCard padding="sm">
              <h2 className="text-base font-semibold">
                Diferențiere (aprobare ta)
              </h2>
              <ul className="mt-3 space-y-2">
                {bundle.suggestions.slice(0, 5).map((s) => (
                  <li
                    key={s.id}
                    className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-2 py-2 text-sm"
                  >
                    <p className="font-semibold">{s.titleRo}</p>
                    <p className="text-xs text-[var(--prima-text-muted)]">
                      {s.rationaleRo}
                    </p>
                    <p className="mt-1 text-xs">
                      Pentru: {s.learnerIds.map(aliasName).join(", ")}
                    </p>
                    {s.status === "pending" ? (
                      <div className="mt-2 flex gap-2">
                        <PrimaButton
                          variant="primary"
                          className="!min-h-8 !px-3 !py-1 !text-xs"
                          onClick={() => {
                            resolveSuggestion(s.id, "approved");
                            setMessage("Sugestia a fost aprobată — tu decizi aplicarea.");
                            refresh();
                          }}
                        >
                          Aprobă
                        </PrimaButton>
                        <PrimaButton
                          variant="ghost"
                          className="!min-h-8 !px-3 !py-1 !text-xs"
                          onClick={() => {
                            resolveSuggestion(s.id, "dismissed");
                            refresh();
                          }}
                        >
                          Ignoră
                        </PrimaButton>
                      </div>
                    ) : (
                      <StatusBadge
                        tone={s.status === "approved" ? "saved" : "neutral"}
                      >
                        {s.status}
                      </StatusBadge>
                    )}
                  </li>
                ))}
              </ul>
            </PrimaCard>

            <PrimaCard padding="sm">
              <h2 className="text-base font-semibold">Semnale de sprijin</h2>
              <p className="mt-1 text-xs text-[var(--prima-text-muted)]">
                Sugestii didactice — niciodată etichete.
              </p>
              <ul className="mt-3 space-y-2">
                {bundle.earlySupport.map((esi) => (
                  <li
                    key={esi.id}
                    className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-2 py-2 text-sm"
                  >
                    <button
                      type="button"
                      className="font-semibold hover:text-[var(--prima-primary)]"
                      onClick={() => setSelectedId(esi.learnerId)}
                    >
                      {aliasName(esi.learnerId)} · {esi.titleRo}
                    </button>
                    <p className="text-xs text-[var(--prima-text-muted)]">
                      {esi.instructionalSuggestionRo}
                    </p>
                  </li>
                ))}
              </ul>
            </PrimaCard>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <PrimaCard>
            <h2 className="text-lg font-semibold">Profiluri de învățare</h2>
            <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
              Aliasuri — fără clasament. Selectează pentru observații.
            </p>
            <ul className="mt-3 space-y-2">
              {bundle.profiles.map((p) => (
                <li key={p.learnerId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.learnerId)}
                    className={[
                      "w-full rounded-[var(--radius-sm)] border px-3 py-2 text-left text-sm",
                      selectedId === p.learnerId
                        ? "border-[var(--prima-primary)] bg-blue-50"
                        : "border-[var(--prima-border)]",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {p.alias.displayName}
                      </span>
                      <StatusBadge
                        tone={
                          p.supportNeed === "enrichment"
                            ? "saved"
                            : p.supportNeed === "support"
                              ? "attention"
                              : "neutral"
                        }
                      >
                        {p.supportNeed}
                      </StatusBadge>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </PrimaCard>

          <PrimaCard>
            {selected ? (
              <>
                <h2 className="text-lg font-semibold">
                  {selected.alias.displayName}
                </h2>
                <StatusBadge tone="saved">Nu se evaluează persoana</StatusBadge>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-[var(--prima-text-muted)]">
                      Puncte tari
                    </p>
                    <ul className="mt-1 list-disc pl-4 text-sm">
                      {selected.strengths.length
                        ? selected.strengths.map((s) => <li key={s}>{s}</li>)
                        : (
                          <li className="text-[var(--prima-text-muted)]">—</li>
                        )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--prima-text-muted)]">
                      Nevoi de învățare
                    </p>
                    <ul className="mt-1 list-disc pl-4 text-sm">
                      {selected.needs.length
                        ? selected.needs.map((s) => <li key={s}>{s}</li>)
                        : (
                          <li className="text-[var(--prima-text-muted)]">—</li>
                        )}
                    </ul>
                  </div>
                </div>
                <label className="mt-4 block text-sm font-semibold">
                  Observație rapidă
                  <textarea
                    value={obsNote}
                    onChange={(e) => setObsNote(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm font-normal"
                    placeholder="Ex: Are nevoie de suport vizual."
                  />
                </label>
                <div className="mt-2">
                  <PrimaButton variant="secondary" onClick={saveObs}>
                    Salvează observația
                  </PrimaButton>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[var(--prima-text-muted)]">
                    Portofoliu (selectat de tine)
                  </p>
                  <ul className="mt-1 text-sm">
                    {studentLearningEngine
                      .listPortfolio(selected.learnerId)
                      .map((item) => (
                        <li key={item.id}>• {item.title}</li>
                      ))}
                    {studentLearningEngine.listPortfolio(selected.learnerId)
                      .length === 0 ? (
                      <li className="text-[var(--prima-text-muted)]">
                        Nicio lucrare selectată încă.
                      </li>
                    ) : null}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--prima-text-muted)]">
                Selectează un profil pentru a vedea evidențele și a nota
                observații.
              </p>
            )}
          </PrimaCard>
        </section>

        <PrimaCard>
          <h2 className="text-lg font-semibold">Cronologia progresului</h2>
          <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
            Fără predicții de note — doar evoluția învățării pe unitate.
          </p>
          <ol className="mt-4 space-y-3">
            {timeline.map((point) => (
              <li
                key={point.id}
                className="border-l-2 border-[var(--prima-primary)] pl-3"
              >
                <p className="text-sm font-semibold">{point.labelRo}</p>
                <p className="text-sm text-[var(--prima-text-muted)]">
                  {point.note}
                </p>
              </li>
            ))}
          </ol>
          {handoff ? (
            <div className="mt-6 rounded-[var(--radius-md)] bg-[var(--prima-primary-soft)] px-3 py-3 text-sm">
              <p className="font-semibold">Colaborare cu PIE</p>
              <p className="mt-1 text-[var(--prima-text-muted)]">
                {handoff.noteRo}
              </p>
            </div>
          ) : null}
        </PrimaCard>
      </div>
    </div>
  );
}

export default StudentLearningPage;
