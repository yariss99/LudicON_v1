import type {
  CognitiveLoadBand,
  PieAnalysisInput,
  PieCognitiveLoadDetail,
  PieDimensionScore,
  PieRecommendation,
  PieTimeDetail,
} from "./types";

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function textBlob(input: PieAnalysisInput): string {
  return [
    ...input.competencies,
    ...input.learningObjectives,
    ...input.learningFlow,
    ...input.activities.map((a) => `${a.title} ${a.description ?? ""}`),
    ...input.assessment,
    ...input.differentiation,
    ...input.reflection,
    ...input.resources.map((r) => r.label),
  ]
    .join(" ")
    .toLowerCase();
}

function measurableObjectives(objectives: string[]): number {
  if (objectives.length === 0) return 0;
  const measurable = objectives.filter((o) =>
    /să |poate |identific|explic|aplic|compar|analiz|creez|rezolv|demonstre/i.test(
      o,
    ),
  ).length;
  return measurable / objectives.length;
}

export function scoreCurriculumAlignment(
  input: PieAnalysisInput,
): PieDimensionScore {
  let score = 40;
  const evidence: string[] = [];
  if (input.subject.trim()) {
    score += 15;
    evidence.push("Subiectul lecției este definit.");
  }
  if (input.grade.trim()) {
    score += 15;
    evidence.push("Nivelul clasei este definit.");
  }
  if (input.competencies.length > 0) {
    score += 15;
    evidence.push(`${input.competencies.length} competențe asociate.`);
  }
  if (input.learningObjectives.length > 0) {
    score += 10;
    evidence.push(`${input.learningObjectives.length} obiective formulate.`);
  }
  const meas = measurableObjectives(input.learningObjectives);
  score += Math.round(meas * 15);
  if (meas >= 0.7) evidence.push("Majoritatea obiectivelor sunt observabile.");

  return {
    dimension: "curriculum_alignment",
    score: clamp(score),
    summary:
      score >= 80
        ? "Lecția este bine ancorată curricular."
        : "Putem întări alinierea cu curriculumul.",
    evidence,
  };
}

export function scorePedagogicalCoherence(
  input: PieAnalysisInput,
): PieDimensionScore {
  let score = 35;
  const evidence: string[] = [];
  const hasObj = input.learningObjectives.length > 0;
  const hasAct = input.activities.length > 0;
  const hasAss = input.assessment.length > 0;
  const hasRes = input.resources.length > 0;

  if (hasObj && hasAct) {
    score += 20;
    evidence.push("Obiectivele sunt susținute de activități.");
  }
  if (hasAct && hasAss) {
    score += 20;
    evidence.push("Evaluarea poate urmări activitățile.");
  }
  if (hasObj && hasAss) {
    score += 15;
    evidence.push("Există legătură obiective ↔ evaluare.");
  }
  if (hasRes && hasObj) {
    score += 10;
    evidence.push("Resursele însoțesc obiectivele.");
  }

  const activityMinutes = input.activities.reduce(
    (s, a) => s + (a.durationMinutes ?? 0),
    0,
  );
  if (
    activityMinutes > 0 &&
    Math.abs(activityMinutes - input.availableMinutes) <=
      input.availableMinutes * 0.25
  ) {
    score += 10;
    evidence.push("Durata activităților este coerentă cu timpul lecției.");
  }

  return {
    dimension: "pedagogical_coherence",
    score: clamp(score),
    summary:
      score >= 75
        ? "Firul pedagogic este coerent."
        : "Unele legături între secțiuni pot fi clarificate.",
    evidence,
  };
}

export function analyzeCognitiveLoad(
  input: PieAnalysisInput,
): { detail: PieCognitiveLoadDetail; score: PieDimensionScore } {
  const objN = input.learningObjectives.length;
  const actN = input.activities.length;
  const resN = input.resources.length;
  const blob = textBlob(input);

  const intrinsic = clamp(30 + objN * 8 + actN * 6);
  const extraneous = clamp(
    (resN > 6 ? 25 : 10) +
      (actN > 7 ? 20 : 0) +
      (/și apoi|ulterior|în plus|de asemenea/i.test(blob) ? 15 : 0),
  );
  const germane = clamp(
    20 +
      (input.reflection.length > 0 ? 25 : 0) +
      (input.activities.some((a) => a.practical) ? 20 : 0) +
      (input.assessment.length > 0 ? 15 : 0),
  );

  let band: CognitiveLoadBand = "balanced";
  if (extraneous >= 45 || intrinsic + extraneous > 140) {
    band = "needs_simplification";
  } else if (intrinsic < 45 && actN <= 2 && germane < 40) {
    band = "needs_extension";
  }

  const score =
    band === "balanced" ? 88 : band === "needs_simplification" ? 62 : 70;

  return {
    detail: { band, intrinsic, extraneous, germane },
    score: {
      dimension: "cognitive_load",
      score,
      summary:
        band === "balanced"
          ? "Încărcătura cognitivă pare echilibrată."
          : band === "needs_simplification"
            ? "Lecția ar putea fi simplificată."
            : "Lecția ar putea fi extinsă cu practică ghidată.",
      evidence: [
        `Încărcare intrinsecă estimată: ${intrinsic}.`,
        `Încărcare extrinsecă estimată: ${extraneous}.`,
        `Încărcare germane estimată: ${germane}.`,
      ],
    },
  };
}

const FLOW_MARKERS: Array<{ key: string; re: RegExp }> = [
  { key: "opening", re: /captar|hook|motiv|deschider|atenț/i },
  { key: "prior", re: /reactiv|cunoștințe anter|reactivare|prior/i },
  { key: "discovery", re: /descoper|explor|investig/i },
  { key: "practice", re: /exers|practic|aplic/i },
  { key: "feedback", re: /feedback|retroacț|corect/i },
  { key: "reflection", re: /reflec|metacog|ce am învăț/i },
  { key: "closure", re: /încheier|concluz|sintet|recapitul/i },
];

export function scoreLessonFlow(input: PieAnalysisInput): PieDimensionScore {
  const blob = [
    ...input.learningFlow,
    ...input.activities.map((a) => `${a.title} ${a.description ?? ""}`),
    ...input.reflection,
  ].join(" ");

  const present = FLOW_MARKERS.filter((m) => m.re.test(blob));
  const score = clamp(25 + present.length * (75 / FLOW_MARKERS.length));
  return {
    dimension: "lesson_flow",
    score,
    summary:
      score >= 75
        ? "Fluxul lecției acoperă momentele esențiale."
        : "Fluxul lecției poate fi completat cu câteva momente-cheie.",
    evidence: present.map((p) => `Prezent: ${p.key}`),
  };
}

export function scoreEngagement(input: PieAnalysisInput): PieDimensionScore {
  const collab = input.activities.filter((a) => a.collaborative).length;
  const practical = input.activities.filter((a) => a.practical).length;
  const variety = new Set(
    input.activities.map((a) => a.phase ?? a.title.slice(0, 12)),
  ).size;
  let score = 40;
  score += Math.min(20, collab * 10);
  score += Math.min(20, practical * 10);
  score += Math.min(15, variety * 5);
  if (input.reflection.length > 0) score += 10;
  if (input.activities.length >= 3) score += 5;

  return {
    dimension: "student_engagement",
    score: clamp(score),
    summary:
      score >= 75
        ? "Lecția oferă momente de implicare variate."
        : "Putem crește interacțiunea și varietatea activităților.",
    evidence: [
      `${collab} activități colaborative.`,
      `${practical} activități practice.`,
      `${variety} tipuri de momente distincte.`,
    ],
  };
}

export function scoreDifferentiation(
  input: PieAnalysisInput,
): PieDimensionScore {
  const blob = input.differentiation.join(" ").toLowerCase();
  let score = input.differentiation.length > 0 ? 55 : 30;
  const evidence: string[] = [];
  if (/suport|remedial|ajutor|scaff/i.test(blob)) {
    score += 15;
    evidence.push("Există traseu de sprijin.");
  }
  if (/extens|avansat|îmbogăț/i.test(blob)) {
    score += 15;
    evidence.push("Există traseu de extensie.");
  }
  if (/diferen|nivel|flexibil/i.test(blob)) {
    score += 10;
    evidence.push("Diferențierea este menționată explicit.");
  }
  if (/evaluare alternativ|rubric/i.test(blob + input.assessment.join(" "))) {
    score += 10;
    evidence.push("Există alternative de evaluare.");
  }

  return {
    dimension: "differentiation",
    score: clamp(score),
    summary:
      score >= 70
        ? "Diferențierea este prezentă în proiect."
        : "Diferențierea poate fi făcută mai explicită.",
    evidence,
  };
}

export function scoreAssessment(input: PieAnalysisInput): PieDimensionScore {
  const blob = [
    ...input.assessment,
    ...(input.successCriteria ?? []),
  ]
    .join(" ")
    .toLowerCase();
  let score = input.assessment.length > 0 ? 50 : 25;
  const evidence: string[] = [];
  if (/formativ|observa|pe parcurs|exit/i.test(blob)) {
    score += 15;
    evidence.push("Evaluare formativă identificată.");
  }
  if (/sumativ|test|probă|evaluare final/i.test(blob)) {
    score += 10;
    evidence.push("Evaluare sumativă identificată.");
  }
  if (
    input.successCriteria?.length ||
    /criter|reușit|succes/i.test(blob)
  ) {
    score += 15;
    evidence.push("Criterii de succes menționate.");
  }
  if (/feedback|retroacț/i.test(blob)) {
    score += 10;
    evidence.push("Momente de feedback prevăzute.");
  }
  if (/rubric/i.test(blob) || input.resources.some((r) => /rubric/i.test(r.label))) {
    score += 10;
    evidence.push("Rubrică asociată.");
  }
  if (input.learningObjectives.length > 0 && input.assessment.length > 0) {
    score += 5;
  }

  return {
    dimension: "assessment_quality",
    score: clamp(score),
    summary:
      score >= 75
        ? "Evaluarea susține obiectivele lecției."
        : "Evaluarea poate fi aliniată mai clar la obiective.",
    evidence,
  };
}

export function scoreInclusion(input: PieAnalysisInput): PieDimensionScore {
  const blob = textBlob(input);
  let score = 60;
  const evidence: string[] = [];
  if (/instrucț|pași clari|pe scurt/i.test(blob)) {
    score += 10;
    evidence.push("Instrucțiuni clare semnalate.");
  }
  if (/vizual|auditiv|alternativ|accesibil/i.test(blob)) {
    score += 15;
    evidence.push("Reprezentări alternative menționate.");
  }
  if (input.differentiation.length > 0) {
    score += 10;
    evidence.push("Diferențierea sprijină incluziunea.");
  }
  if (input.activities.length > 6) {
    score -= 10;
    evidence.push("Multe activități — verifică volumul de lucru.");
  } else {
    score += 5;
  }

  return {
    dimension: "inclusion_accessibility",
    score: clamp(score),
    summary:
      score >= 75
        ? "Lecția pare accesibilă și incluzivă."
        : "Putem întări claritatea și accesibilitatea.",
    evidence,
  };
}

export function analyzeTime(input: PieAnalysisInput): {
  detail: PieTimeDetail;
  score: PieDimensionScore;
} {
  const activityMinutes = input.activities.reduce(
    (s, a) => s + (a.durationMinutes ?? 8),
    0,
  );
  const transitionMinutes = Math.max(0, (input.activities.length - 1) * 2);
  const assessmentMinutes = input.assessment.length > 0 ? 5 : 0;
  const reflectionMinutes = input.reflection.length > 0 ? 3 : 0;
  const estimated =
    activityMinutes + transitionMinutes + assessmentMinutes + reflectionMinutes;
  const variance = estimated - input.availableMinutes;
  const adjustments: string[] = [];
  if (variance > 5) {
    adjustments.push(
      `Redu cu circa ${variance} minute (activități sau tranziții).`,
    );
  } else if (variance < -8) {
    adjustments.push(
      `Ai circa ${Math.abs(variance)} minute libere — poți adăuga practică sau reflecție.`,
    );
  }

  const absVar = Math.abs(variance);
  const score =
    absVar <= 5 ? 95 : absVar <= 10 ? 80 : absVar <= 15 ? 65 : 45;

  return {
    detail: {
      availableMinutes: input.availableMinutes,
      estimatedLessonDuration: estimated,
      varianceMinutes: variance,
      transitionMinutes,
      assessmentMinutes,
      reflectionMinutes,
      suggestedAdjustments: adjustments,
    },
    score: {
      dimension: "time_validation",
      score,
      summary:
        absVar <= 5
          ? "Durata estimată se potrivește cu timpul disponibil."
          : "Durata estimată diferă de timpul disponibil.",
      evidence: [
        `Estimare: ${estimated} min.`,
        `Disponibil: ${input.availableMinutes} min.`,
        ...adjustments,
      ],
    },
  };
}

export function scoreResources(input: PieAnalysisInput): PieDimensionScore {
  const labels = input.resources.map((r) => r.label.trim().toLowerCase());
  const unique = new Set(labels);
  const duplicates = labels.length - unique.size;
  let score = 70;
  const evidence: string[] = [];

  if (input.resources.length === 0 && input.learningObjectives.length > 0) {
    score -= 25;
    evidence.push("Nu sunt menționate resurse pentru obiective.");
  } else if (input.resources.length > 0) {
    score += 15;
    evidence.push(`${input.resources.length} resurse asociate.`);
  }
  if (duplicates > 0) {
    score -= duplicates * 10;
    evidence.push(`${duplicates} resurse par duplicate.`);
  }
  if (input.resources.length > 8) {
    score -= 15;
    evidence.push("Prea multe resurse — risc de supraîncărcare.");
  }

  return {
    dimension: "resource_optimization",
    score: clamp(score),
    summary:
      score >= 75
        ? "Resursele par bine dozate."
        : "Resursele pot fi optimizate.",
    evidence,
  };
}

export function buildRecommendations(
  input: PieAnalysisInput,
  dimensions: PieDimensionScore[],
  cognitive: PieCognitiveLoadDetail,
  time: PieTimeDetail,
): PieRecommendation[] {
  const byId = Object.fromEntries(
    dimensions.map((d) => [d.dimension, d]),
  ) as Record<string, PieDimensionScore>;
  const recs: PieRecommendation[] = [];

  if ((byId.curriculum_alignment?.score ?? 100) < 70) {
    recs.push({
      id: "rec_curriculum_objectives",
      priority: "critical",
      dimension: "curriculum_alignment",
      title: "Completează obiective măsurabile",
      explanation:
        "Lecția are nevoie de obiective mai clare, legate de competențe.",
      pedagogicalRationale:
        "Obiectivele observabile ghidează activitățile și evaluarea.",
      affectedComponents: ["objectives", "competencies"],
      estimatedImprovement: "+10–15 la alinierea curriculară",
      learnMore:
        "Formulează obiective cu verbe observabile (identifică, explică, aplică).",
      explainable: {
        why: "Fără obiective măsurabile, este greu să verifici învățarea.",
        ifAccept: "Activitățile și evaluarea vor putea fi aliniate clar.",
        ifIgnore: "Poți continua, dar coerența pedagogică rămâne mai slabă.",
        affectedParts: "Obiective și competențe",
      },
      acceptProposal: { kind: "focus_section", section: "objectives" },
    });
  }

  if ((byId.pedagogical_coherence?.score ?? 100) < 65) {
    recs.push({
      id: "rec_coherence_assessment",
      priority: "important",
      dimension: "pedagogical_coherence",
      title: "Leagă evaluarea de obiective",
      explanation:
        "Activitățile și evaluarea nu sunt încă suficient conectate de obiective.",
      pedagogicalRationale:
        "Evaluarea trebuie să verifice exact ceea ce și-a propus lecția.",
      affectedComponents: ["objectives", "activities", "assessment"],
      estimatedImprovement: "+8–12 la coerență",
      learnMore:
        "Pentru fiecare obiectiv, notează o dovadă de învățare în evaluare.",
      explainable: {
        why: "Există decalaj între ce predai și ce verifici.",
        ifAccept: "Vei ști ce a învățat fiecare elev.",
        ifIgnore: "Riscul este o evaluare care măsoară altceva decât obiectivele.",
        affectedParts: "Obiective, activități, evaluare",
      },
    });
  }

  if (cognitive.band === "needs_simplification") {
    recs.push({
      id: "rec_cognitive_simplify",
      priority: "important",
      dimension: "cognitive_load",
      title: "Simplifică încărcătura lecției",
      explanation:
        "Prea multe informații sau tranziții pot obosi elevii.",
      pedagogicalRationale:
        "Reducerea încărcăturii extrinseci eliberează atenția pentru învățare.",
      affectedComponents: ["activities", "resources", "timing"],
      estimatedImprovement: "Flux mai calm, mai multă practică utilă",
      learnMore:
        "Păstrează 1–2 idei-nucleu și mută detaliile într-o activitate de extensie.",
      explainable: {
        why: "Estimarea încărcăturii cognitive indică supraîncărcare.",
        ifAccept: "Elevii vor avea mai mult spațiu pentru practică.",
        ifIgnore: "Unele momente pot rămâne superficiale din lipsă de timp.",
        affectedParts: "Activități, resurse, timp",
      },
    });
  }

  if (cognitive.band === "needs_extension") {
    recs.push({
      id: "rec_cognitive_extend",
      priority: "optional",
      dimension: "cognitive_load",
      title: "Adaugă practică ghidată",
      explanation: "Lecția are spațiu pentru mai multă exersare semnificativă.",
      pedagogicalRationale:
        "Practica ghidată consolidează înțelegerea înainte de autonomia elevului.",
      affectedComponents: ["activities"],
      estimatedImprovement: "+ implicare și retenție",
      learnMore: "Un exercițiu scurt în perechi poate crește învățarea activă.",
      explainable: {
        why: "Încărcătura utilă (germane) este încă redusă.",
        ifAccept: "Elevii exersează ideea centrală înainte de evaluare.",
        ifIgnore: "Lecția rămâne scurtă, dar poate rata consolidarea.",
        affectedParts: "Activități",
      },
    });
  }

  if ((byId.lesson_flow?.score ?? 100) < 70) {
    recs.push({
      id: "rec_flow_reflection",
      priority: "optional",
      dimension: "lesson_flow",
      title: "Completează momentele de flux",
      explanation:
        "Unele momente (deschidere, reflecție, încheiere) pot lipsi.",
      pedagogicalRationale:
        "Un flux complet ajută elevii să intre, să exerseze și să închidă învățarea.",
      affectedComponents: ["learning_flow", "reflection", "activities"],
      estimatedImprovement: "+10 la calitatea fluxului",
      learnMore:
        "Chiar 2–3 minute de reflecție la final cresc transferul învățării.",
      explainable: {
        why: "Nu toate momentele esențiale ale lecției sunt vizibile.",
        ifAccept: "Lecția va avea un fir mai clar pentru elevi.",
        ifIgnore: "Poți păstra structura actuală dacă timpul este foarte strâns.",
        affectedParts: "Desfășurare și reflecție",
      },
    });
  }

  if ((byId.differentiation?.score ?? 100) < 65) {
    recs.push({
      id: "rec_diff_paths",
      priority: "important",
      dimension: "differentiation",
      title: "Adaugă sprijin și extensie",
      explanation:
        "Diferențierea nu este încă explicită pentru toți elevii.",
      pedagogicalRationale:
        "Traseele de sprijin și extensie onorează ritmuri diferite de învățare.",
      affectedComponents: ["differentiation", "activities", "assessment"],
      estimatedImprovement: "+12 la diferențiere",
      learnMore:
        "O sarcină de bază + o variantă de sprijin + o provocare scurtă.",
      explainable: {
        why: "Nu apar clar trasee de sprijin sau de extensie.",
        ifAccept: "Mai mulți elevi vor putea participa cu succes.",
        ifIgnore: "Lecția rămâne unică ca nivel — utilă, dar mai puțin flexibilă.",
        affectedParts: "Diferențiere, activități, evaluare",
      },
    });
  }

  if (time.varianceMinutes > 8) {
    recs.push({
      id: "rec_time_over",
      priority: "critical",
      dimension: "time_validation",
      title: "Ajustează durata lecției",
      explanation: `Estimarea (${time.estimatedLessonDuration} min) depășește timpul disponibil (${time.availableMinutes} min).`,
      pedagogicalRationale:
        "Un plan realist protejează încheierea și evaluarea formativă.",
      affectedComponents: ["timing", "activities", "assessment"],
      estimatedImprovement: "Plan fezabil în ora de curs",
      learnMore: "Scurtează o activitate sau mută extensia ca temă opțională.",
      explainable: {
        why: "Suma duratelor + tranziții depășește ora planificată.",
        ifAccept: "Vei putea încheia lecția fără grabă.",
        ifIgnore: "Risc să sari peste reflecție sau evaluare.",
        affectedParts: "Timp, activități, evaluare",
      },
      acceptProposal: {
        kind: "adjust_timing",
        targetMinutes: input.availableMinutes,
      },
    });
  }

  if ((byId.resource_optimization?.score ?? 100) < 60) {
    recs.push({
      id: "rec_resources",
      priority: "optional",
      dimension: "resource_optimization",
      title: "Optimizează materialele",
      explanation:
        "Unele resurse lipsesc, se dublează sau sunt prea multe.",
      pedagogicalRationale:
        "Puține materiale bine alese susțin mai bine obiectivele.",
      affectedComponents: ["resources"],
      estimatedImprovement: "Mai puțină frecare la predare",
      learnMore: "Păstrează doar materialele care servesc un obiectiv clar.",
      explainable: {
        why: "Inventarul de resurse nu este încă optim.",
        ifAccept: "Pregătirea și utilizarea materialelor vor fi mai simple.",
        ifIgnore: "Poți păstra lista actuală dacă deja o stăpânești.",
        affectedParts: "Resurse / materiale",
      },
    });
  }

  if ((byId.assessment_quality?.score ?? 100) < 60) {
    recs.push({
      id: "rec_assessment_criteria",
      priority: "important",
      dimension: "assessment_quality",
      title: "Clarifică criteriile de succes",
      explanation: "Evaluarea are nevoie de criterii vizibile pentru elevi.",
      pedagogicalRationale:
        "Criteriile de succes fac învățarea transparentă și feedbackul util.",
      affectedComponents: ["assessment", "objectives"],
      estimatedImprovement: "+10 la calitatea evaluării",
      learnMore: "Scrie 2–3 indicii: „Știu că am reușit când…”.",
      explainable: {
        why: "Nu apar clar criterii de succes sau feedback.",
        ifAccept: "Elevii vor ști ce înseamnă „gata bine”.",
        ifIgnore: "Evaluarea rămâne mai greu de interpretat.",
        affectedParts: "Evaluare și obiective",
      },
    });
  }

  // Soft inspirational when overall strong
  const avg =
    dimensions.reduce((s, d) => s + d.score, 0) / Math.max(1, dimensions.length);
  if (avg >= 85 && !input.activities.some((a) => a.collaborative)) {
    recs.push({
      id: "rec_inspire_collab",
      priority: "inspirational",
      dimension: "student_engagement",
      title: "Încearcă un moment colaborativ",
      explanation:
        "Lecția este deja solidă — un scurt lucru în perechi o poate anima.",
      pedagogicalRationale:
        "Interacțiunea peere-to-peer crește elaborarea ideilor.",
      affectedComponents: ["activities"],
      estimatedImprovement: "Plus de energie la mijlocul orei",
      learnMore: "„Gândește–perechi–împărtășește” în 4 minute.",
      explainable: {
        why: "Nu apare încă un moment colaborativ explicit.",
        ifAccept: "Elevii verbalizează ideea înainte de practica individuală.",
        ifIgnore: "Nicio problemă — lecția rămâne valabilă.",
        affectedParts: "Activități",
      },
    });
  }

  const order = { critical: 0, important: 1, optional: 2, inspirational: 3 };
  return recs.sort((a, b) => order[a.priority] - order[b.priority]);
}
