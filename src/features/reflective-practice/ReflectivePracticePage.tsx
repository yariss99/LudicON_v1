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
  buildInsightsBundle,
  completeReflection,
  personalAnalytics,
  promptsForMode,
  reflectivePracticeEngine,
  startReflection,
  type ReflectionMode,
  type ReflectionRecord,
} from "../../engines/rpti";

const MODES: Array<{ id: ReflectionMode; label: string; hint: string }> = [
  { id: "quick", label: "Rapidă", hint: "2–3 minute" },
  { id: "guided", label: "Ghidată", hint: "Întrebări pedagogice" },
  { id: "evidence", label: "Pe dovezi", hint: "Ancorată în lecție" },
  { id: "comprehensive", label: "Completă", hint: "Analiză profundă" },
];

function ReflectivePracticePage() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  const reflections = useMemo(() => {
    void tick;
    return reflectivePracticeEngine.listReflections();
  }, [tick]);

  const profile = useMemo(() => {
    void tick;
    return reflectivePracticeEngine.getGrowthProfile();
  }, [tick]);

  const portfolio = useMemo(() => {
    void tick;
    return reflectivePracticeEngine.listPortfolio();
  }, [tick]);

  const milestones = useMemo(() => {
    void tick;
    return reflectivePracticeEngine.listMilestones();
  }, [tick]);

  const insightsBundle = useMemo(() => {
    void tick;
    return buildInsightsBundle();
  }, [tick]);

  const analytics = useMemo(() => {
    void tick;
    return personalAnalytics();
  }, [tick]);

  const [mode, setMode] = useState<ReflectionMode>("quick");
  const [lessonTitle, setLessonTitle] = useState("Lecția de azi");
  const [active, setActive] = useState<ReflectionRecord | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const prompts = promptsForMode(mode);

  const begin = () => {
    const record = startReflection({
      lessonProjectId: `lesson_${Date.now().toString(36)}`,
      lessonTitle: lessonTitle.trim() || "Lecție",
      mode,
    });
    setActive(record);
    setAnswers({});
    setNotes("");
    setMessage(null);
    refresh();
  };

  const finish = () => {
    if (!active) return;
    completeReflection(active.id, {
      answers: prompts.map((p) => ({
        promptId: p.id,
        value: answers[p.id] ?? "",
      })),
      strengths: Object.values(answers).filter((v) => /bine|reușit|clar/i.test(v)).slice(0, 2),
      improvements: Object.values(answers)
        .filter((v) => /schimb|dificil|depăș|nu /i.test(v))
        .slice(0, 2),
      personalNotes: notes,
      followUpActions: ["Aplică o îmbunătățire la următoarea lecție"],
    });
    setActive(null);
    setMessage("Reflecția a fost salvată privat în portofoliul tău.");
    refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--prima-bg)] px-4 py-8 text-[var(--prima-text)] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <PrimaMark size={28} />
            <SectionHeader
              title="Reflecție & perspective"
              description="Predai. Reflectezi. Îmbunătățești. Datele rămân private — niciodată pentru evaluare."
            />
          </div>
          <div className="flex gap-2">
            <Link to="/publishing">
              <PrimaButton variant="ghost">Publicări</PrimaButton>
            </Link>
            <Link to="/editor/demo">
              <PrimaButton variant="secondary">Editor</PrimaButton>
            </Link>
          </div>
        </div>

        {message ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--prima-secondary-soft)] px-4 py-3 text-sm text-[var(--prima-secondary)]">
            {message}
          </p>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <PrimaCard>
            <h2 className="text-lg font-semibold">Reflecție nouă</h2>
            <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
              Continuarea naturală a lecției — nu un formular administrativ.
            </p>

            <label className="mt-4 block text-xs font-semibold text-[var(--prima-text-muted)]">
              Titlul lecției
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm font-medium text-[var(--prima-text)]"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={[
                    "rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-semibold",
                    mode === item.id
                      ? "bg-[var(--prima-primary)] text-white"
                      : "bg-slate-100 text-[var(--prima-text-muted)]",
                  ].join(" ")}
                >
                  {item.label}
                  <span className="ml-1 opacity-80">· {item.hint}</span>
                </button>
              ))}
            </div>

            {!active ? (
              <div className="mt-5">
                <PrimaButton variant="primary" onClick={begin}>
                  Începe reflecția
                </PrimaButton>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {prompts.map((prompt) => (
                  <label key={prompt.id} className="block">
                    <span className="text-sm font-semibold">{prompt.questionRo}</span>
                    <textarea
                      value={answers[prompt.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [prompt.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="text-sm font-semibold">Note personale</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <PrimaButton variant="primary" onClick={finish}>
                    Salvează reflecția
                  </PrimaButton>
                  <PrimaButton
                    variant="ghost"
                    onClick={() => {
                      setActive(null);
                      setMessage(null);
                    }}
                  >
                    Anulează
                  </PrimaButton>
                </div>
              </div>
            )}
          </PrimaCard>

          <div className="space-y-4">
            <PrimaCard padding="sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--prima-text-muted)]">
                Profil de creștere (privat)
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {profile.reflectionCount}
              </p>
              <p className="text-sm text-[var(--prima-text-muted)]">
                reflecții · {profile.completedLessonCount} lecții
              </p>
              <StatusBadge tone="saved">Nu se folosește la evaluare</StatusBadge>
              <ul className="mt-3 space-y-1 text-sm text-[var(--prima-text-muted)]">
                <li>Diferențiere: {Math.round(profile.differentiationFrequency * 100)}%</li>
                <li>Digital: {Math.round(profile.digitalIntegrationFrequency * 100)}%</li>
                <li>Strategii notate: {profile.strategiesUsed.length}</li>
              </ul>
            </PrimaCard>

            <PrimaCard padding="sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--prima-text-muted)]">
                Analize personale
              </p>
              <p className="mt-2 text-sm">
                Frecvență reflecții: {analytics.reflectionFrequency}
              </p>
              <p className="text-sm text-[var(--prima-text-muted)]">
                Diversitate strategii: {analytics.strategyDiversity}
              </p>
              <div className="mt-3 flex gap-1">
                {analytics.monthlyReflectionCounts.map((count, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-sm bg-[var(--prima-primary-soft)]"
                    style={{ height: `${12 + count * 10}px` }}
                    title={`${count}`}
                  />
                ))}
              </div>
            </PrimaCard>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <PrimaCard>
            <h2 className="text-lg font-semibold">Perspective pedagogice</h2>
            <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
              Generate din reflecțiile tale — opționale, cu explicație.
            </p>
            <ul className="mt-4 space-y-3">
              {insightsBundle.insights.length === 0 ? (
                <li className="text-sm text-[var(--prima-text-muted)]">
                  Completează o reflecție pentru a vedea perspective.
                </li>
              ) : (
                insightsBundle.insights.map((insight) => (
                  <li
                    key={insight.id}
                    className="rounded-[var(--radius-md)] border border-[var(--prima-border)] px-3 py-2"
                  >
                    <p className="text-sm font-semibold">{insight.title}</p>
                    <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
                      {insight.observation}
                    </p>
                    <p className="mt-1 text-xs text-[var(--prima-text-muted)]">
                      {insight.pedagogicalExplanation}
                    </p>
                  </li>
                ))
              )}
            </ul>
            {insightsBundle.recommendations[0] ? (
              <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--prima-primary-soft)] px-3 py-3">
                <p className="text-sm font-semibold">
                  {insightsBundle.recommendations[0].suggestedImprovement}
                </p>
                <p className="mt-1 text-xs text-[var(--prima-text-muted)]">
                  Impact: {insightsBundle.recommendations[0].expectedImpact}
                </p>
                <div className="mt-2">
                  <Link
                    to="/blueprint/review"
                    onClick={() => {
                      const handoff =
                        reflectivePracticeEngine.applyRecommendationHandoff(
                          insightsBundle.recommendations[0]!.id,
                        );
                      if (handoff) {
                        try {
                          sessionStorage.setItem(
                            "prima.rpti.apply.handoff",
                            JSON.stringify(handoff),
                          );
                        } catch {
                          /* ignore */
                        }
                      }
                    }}
                  >
                    <PrimaButton variant="primary">
                      Aplică la o lecție viitoare
                    </PrimaButton>
                  </Link>
                </div>
              </div>
            ) : null}
          </PrimaCard>

          <PrimaCard>
            <h2 className="text-lg font-semibold">Portofoliu didactic</h2>
            <ul className="mt-3 space-y-2">
              {portfolio.length === 0 ? (
                <li className="text-sm text-[var(--prima-text-muted)]">
                  Portofoliul se completează automat din reflecții și publicații.
                </li>
              ) : (
                portfolio.slice(0, 8).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold">{entry.title}</p>
                      <p className="text-xs text-[var(--prima-text-muted)]">
                        {entry.kind} · {entry.shareDecision}
                      </p>
                    </div>
                    <StatusBadge tone="neutral">editabil</StatusBadge>
                  </li>
                ))
              )}
            </ul>
          </PrimaCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <PrimaCard>
            <h2 className="text-lg font-semibold">Reflecții recente</h2>
            <ul className="mt-3 space-y-2">
              {reflections.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className="rounded-[var(--radius-sm)] border border-[var(--prima-border)] px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{item.lessonTitle}</p>
                    <StatusBadge
                      tone={item.status === "completed" ? "saved" : "syncing"}
                    >
                      {item.status}
                    </StatusBadge>
                    <StatusBadge tone="neutral">{item.mode}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--prima-text-muted)]">
                    {new Date(item.updatedAt).toLocaleString("ro-RO")} · privat
                  </p>
                </li>
              ))}
            </ul>
          </PrimaCard>

          <PrimaCard>
            <h2 className="text-lg font-semibold">Momente de progres</h2>
            <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
              Motivație, nu competiție. Fără clasamente.
            </p>
            <ul className="mt-3 space-y-2">
              {milestones.map((m) => (
                <li
                  key={m.id}
                  className={[
                    "rounded-[var(--radius-sm)] px-3 py-2 text-sm",
                    m.achievedAt
                      ? "bg-[var(--prima-secondary-soft)]"
                      : "bg-slate-50 text-[var(--prima-text-muted)]",
                  ].join(" ")}
                >
                  <p className="font-semibold">{m.titleRo}</p>
                  <p className="text-xs">{m.descriptionRo}</p>
                  {m.achievedAt && !m.celebrated ? (
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold text-[var(--prima-primary)]"
                      onClick={() => {
                        reflectivePracticeEngine.celebrateMilestone(m.id);
                        refresh();
                      }}
                    >
                      Marchează ca sărbătorit
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </PrimaCard>
        </section>
      </div>
    </div>
  );
}

export default ReflectivePracticePage;
