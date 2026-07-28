import type {
  ImprovementRecommendation,
  PedagogicalInsight,
  ReflectionRecord,
} from "./types";

function answerBlob(records: ReflectionRecord[]): string {
  return records
    .flatMap((r) => [
      ...r.answers.map((a) => a.value),
      ...r.strengths,
      ...r.improvements,
      r.personalNotes,
    ])
    .join(" ")
    .toLowerCase();
}

/**
 * Derive pedagogical insights from reflection history (evidence-based, not evaluative).
 */
export function deriveInsights(
  records: ReflectionRecord[],
): PedagogicalInsight[] {
  const completed = records.filter((r) => r.status === "completed");
  if (completed.length === 0) return [];

  const blob = answerBlob(completed);
  const insights: PedagogicalInsight[] = [];

  const timingHits = completed.filter((r) =>
    r.answers.some(
      (a) =>
        a.promptId === "timing" &&
        /nu|depăș|prea lung|scurt|nereal/i.test(a.value),
    ),
  ).length;
  if (timingHits >= 1 || /timp|durat|depăș/i.test(blob)) {
    insights.push({
      id: "ins_timing",
      kind: "timing",
      title: "Durata lecțiilor merită ajustată",
      observation:
        "În reflecții apare des că timpul planificat nu s-a potrivit cu realitatea clasei.",
      pedagogicalExplanation:
        "Ajustarea duratelor protejează încheierea, reflecția elevilor și evaluarea formativă.",
      evidenceCount: Math.max(timingHits, 1),
      confidence: timingHits >= 2 ? "high" : "medium",
    });
  }

  if (/grup|perechi|colabor|echip/i.test(blob)) {
    insights.push({
      id: "ins_collab",
      kind: "engagement",
      title: "Activitățile colaborative susțin implicarea",
      observation:
        "Menționezi momente de lucru împreună ca puncte de energie în lecție.",
      pedagogicalExplanation:
        "Interacțiunea peere-to-peer crește elaborarea ideilor și timpul de vorbire al elevilor.",
      evidenceCount: completed.length,
      confidence: "medium",
    });
  }

  if (/dificil|greu|nu au reușit|blocaj|multi-pas|pași/i.test(blob)) {
    insights.push({
      id: "ins_difficulty",
      kind: "assessment",
      title: "Apar dificultăți la sarcini complexe",
      observation:
        "Elevii întâmpină obstacole la probleme în mai mulți pași sau la itemi dificili.",
      pedagogicalExplanation:
        "Scaffolding-ul și modelarea pașilor reduc încărcătura cognitivă extrinsecă.",
      evidenceCount: 1,
      confidence: "medium",
    });
  }

  if (/diferenț|sprijin|extens|nivel/i.test(blob)) {
    insights.push({
      id: "ins_diff",
      kind: "differentiation",
      title: "Diferențierea sprijină participarea",
      observation:
        "Reflecțiile leagă traseele de sprijin/extensie de o participare mai bună.",
      pedagogicalExplanation:
        "Oferirea de căi multiple onorează ritmuri diferite fără a dilua obiectivul comun.",
      evidenceCount: 1,
      confidence: "medium",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "ins_habit",
      kind: "habit",
      title: "Reflexia ta construiește claritate",
      observation:
        "Ai început să documentezi practica — acesta este primul pas al creșterii profesionale.",
      pedagogicalExplanation:
        "Obiceiul de a reflecta transformă experiența în învățare profesională durabilă.",
      evidenceCount: completed.length,
      confidence: "low",
    });
  }

  return insights;
}

export function recommendationsFromInsights(
  insights: PedagogicalInsight[],
): ImprovementRecommendation[] {
  return insights.map((insight) => {
    const base: ImprovementRecommendation = {
      id: `rec_${insight.id}`,
      insightId: insight.id,
      observation: insight.observation,
      pedagogicalExplanation: insight.pedagogicalExplanation,
      suggestedImprovement: defaultSuggestion(insight.kind),
      expectedImpact: defaultImpact(insight.kind),
      relatedResourceHints: defaultHints(insight.kind),
      applyToFutureLesson: {
        focusSection: sectionFor(insight.kind),
        note: defaultSuggestion(insight.kind),
      },
    };
    return base;
  });
}

function defaultSuggestion(kind: PedagogicalInsight["kind"]): string {
  switch (kind) {
    case "timing":
      return "Redu o activitate cu 5 minute sau mută extensia ca opțiune.";
    case "engagement":
      return "Păstrează un moment colaborativ scurt la mijlocul orei.";
    case "assessment":
      return "Adaugă un pas modelat înainte de sarcina complexă.";
    case "differentiation":
      return "Pregătește explicit un traseu de sprijin și unul de extensie.";
    case "resources":
      return "Păstrează doar resursele care servesc un obiectiv clar.";
    case "strategy":
      return "Repetă strategia care a funcționat și notează de ce.";
    case "objectives":
      return "Reformulează un obiectiv ca dovadă observabilă.";
    default:
      return "Alege un singur lucru de îmbunătățit la următoarea lecție.";
  }
}

function defaultImpact(kind: PedagogicalInsight["kind"]): string {
  switch (kind) {
    case "timing":
      return "Încheiere mai calmă și timp pentru reflecție";
    case "engagement":
      return "Mai multă participare activă";
    case "assessment":
      return "Mai mulți elevi ajung la succes pe sarcina-nucleu";
    default:
      return "Progres vizibil la următoarea lecție similară";
  }
}

function defaultHints(kind: PedagogicalInsight["kind"]): string[] {
  switch (kind) {
    case "timing":
      return ["Cronometru pe activități", "Varianta scurtă a fișei"];
    case "engagement":
      return ["Gândește–perechi–împărtășește"];
    case "differentiation":
      return ["Fișă remedială", "Provocare de extensie"];
    default:
      return ["Note în proiectul lecției"];
  }
}

function sectionFor(kind: PedagogicalInsight["kind"]): string {
  switch (kind) {
    case "timing":
      return "activities";
    case "assessment":
      return "assessment";
    case "differentiation":
      return "differentiation";
    case "objectives":
      return "objectives";
    case "resources":
      return "resources";
    default:
      return "learning_flow";
  }
}
