import type { KnowledgeCollection, KnowledgeEdge, KnowledgeNode } from "./types";

const SCHEMA = "1.0.0";
const now = () => new Date().toISOString();

function node(
  partial: Omit<KnowledgeNode, "schemaVersion" | "createdAt" | "updatedAt" | "visibility" | "tags"> & {
    tags?: string[];
    visibility?: KnowledgeNode["visibility"];
  },
): KnowledgeNode {
  const t = now();
  return {
    schemaVersion: SCHEMA,
    createdAt: t,
    updatedAt: t,
    visibility: partial.visibility ?? "private",
    tags: partial.tags ?? [],
    ...partial,
  };
}

function edge(
  id: string,
  kind: KnowledgeEdge["kind"],
  fromId: string,
  toId: string,
  label?: string,
): KnowledgeEdge {
  return {
    id,
    kind,
    fromId,
    toId,
    label,
    status: "active",
    createdAt: now(),
  };
}

/** Seed graph: Clasa a III-a → Matematică → Fracții … */
export function createSeedKnowledge(): {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  collections: KnowledgeCollection[];
} {
  const grade = node({
    id: "kn_grade_iii",
    kind: "grade",
    title: "Clasa a III-a",
    summary: "Nivel primar",
    grade: "Clasa a III-a",
  });
  const subject = node({
    id: "kn_subject_math",
    kind: "subject",
    title: "Matematică",
    summary: "Disciplină",
    subject: "Matematică",
    grade: "Clasa a III-a",
  });
  const topic = node({
    id: "kn_topic_fractions",
    kind: "topic",
    title: "Fracții",
    summary: "Tema Fracții ordinare",
    subject: "Matematică",
    grade: "Clasa a III-a",
    tags: ["fracții", "numere"],
  });
  const competency = node({
    id: "kn_comp_fractions",
    kind: "competency",
    title: "Operarea cu fracții ordinare",
    summary: "Competență specifică",
    subject: "Matematică",
    grade: "Clasa a III-a",
    tags: ["competență"],
  });
  const objective = node({
    id: "kn_obj_equiv",
    kind: "objective",
    title: "Elevul să identifice fracții echivalente",
    summary: "Obiectiv observabil",
    subject: "Matematică",
    grade: "Clasa a III-a",
    bloomLevel: "understand",
    tags: ["obiectiv"],
  });
  const strategy = node({
    id: "kn_strat_coop",
    kind: "teaching_strategy",
    title: "Învățare cooperativă",
    summary: "Lucru în perechi / grupuri mici",
    strategy: "cooperative",
    tags: ["cooperativ", "grup"],
  });
  const activity = node({
    id: "kn_act_pairs",
    kind: "learning_activity",
    title: "Explorare în perechi — fracții echivalente",
    summary: "Activitate cooperativă cu reprezentări vizuale",
    subject: "Matematică",
    grade: "Clasa a III-a",
    strategy: "cooperative",
    estimatedMinutes: 12,
    bloomLevel: "apply",
    tags: ["cooperativ", "fracții", "perechi"],
    competencyIds: ["kn_comp_fractions"],
    objectiveIds: ["kn_obj_equiv"],
  });
  const activity2 = node({
    id: "kn_act_grade2_coop",
    kind: "learning_activity",
    title: "Joc cooperativ — adunări",
    summary: "Activitate cooperativă pentru clasa a II-a",
    subject: "Matematică",
    grade: "Clasa a II-a",
    strategy: "cooperative",
    estimatedMinutes: 10,
    tags: ["cooperativ", "joc"],
  });
  const resource = node({
    id: "kn_res_worksheet",
    kind: "pedagogical_object",
    title: "Fișă — Fracții echivalente",
    summary: "Fișă de lucru reutilizabilă",
    subject: "Matematică",
    grade: "Clasa a III-a",
    tags: ["fișă", "fracții"],
    objectId: "upe_demo_worksheet",
  });
  const assessment = node({
    id: "kn_assess_exit",
    kind: "assessment_method",
    title: "Exit ticket — fracții",
    summary: "Verificare formativă rapidă",
    subject: "Matematică",
    grade: "Clasa a III-a",
    tags: ["formativ"],
  });
  const reflection = node({
    id: "kn_refl_sample",
    kind: "reflection_note",
    title: "Reflecție — timpul la exersare",
    summary: "Durata a fost depășită; perechile au crescut implicarea",
    subject: "Matematică",
    grade: "Clasa a III-a",
    tags: ["reflecție", "timp", "cooperativ"],
  });
  const lesson = node({
    id: "kn_lesson_fractions",
    kind: "lesson_design",
    title: "Lecție — Fracții echivalente",
    summary: "Proiect de lecție îmbunătățit după reflecție",
    subject: "Matematică",
    grade: "Clasa a III-a",
    tags: ["lecție", "fracții"],
    lessonProjectId: "lesson_fractions_v2",
    strategy: "cooperative",
    estimatedMinutes: 45,
  });
  const template = node({
    id: "kn_tpl_coop_math",
    kind: "template",
    title: "Șablon — lecție cooperativă la Matematică",
    summary: "Deschidere → explorare în perechi → practică → exit ticket",
    subject: "Matematică",
    tags: ["șablon", "cooperativ"],
    strategy: "cooperative",
  });
  const curriculum = node({
    id: "kn_curr_math_iii",
    kind: "curriculum_ref",
    title: "Curriculum Matematică · Clasa a III-a",
    summary: "Referință curriculară oficială (index)",
    subject: "Matematică",
    grade: "Clasa a III-a",
    tags: ["curriculum"],
  });
  const note = node({
    id: "kn_note_visual",
    kind: "professional_note",
    title: "Observație: reprezentările vizuale ajută",
    summary: "Elevii înțeleg mai bine echivalența cu cercuri împărțite",
    tags: ["notă", "vizual"],
  });
  const media = node({
    id: "kn_media_circles",
    kind: "media",
    title: "Ilustrație cercuri-fracții",
    summary: "Imagine pentru activitatea de explorare",
    tags: ["imagine", "fracții", "vizual"],
  });
  const diff = node({
    id: "kn_diff_support",
    kind: "differentiation_strategy",
    title: "Traseu de sprijin cu indicii",
    summary: "Diferențiere pentru elevii care au nevoie de scaffolding",
    tags: ["diferențiere", "sprijin"],
  });
  const pattern = node({
    id: "kn_pattern_opening",
    kind: "pattern",
    title: "Deschidere eficientă (2–3 min)",
    summary: "Hook vizual + întrebare scurtă înainte de explorare",
    tags: ["pattern", "deschidere"],
  });

  const nodes = [
    grade,
    subject,
    topic,
    competency,
    objective,
    strategy,
    activity,
    activity2,
    resource,
    assessment,
    reflection,
    lesson,
    template,
    curriculum,
    note,
    media,
    diff,
    pattern,
  ];

  const edges: KnowledgeEdge[] = [
    edge("e1", "part_of", subject.id, grade.id),
    edge("e2", "part_of", topic.id, subject.id),
    edge("e3", "part_of", competency.id, topic.id),
    edge("e4", "supports", objective.id, competency.id),
    edge("e5", "supports", activity.id, objective.id),
    edge("e6", "uses", activity.id, strategy.id),
    edge("e7", "uses", activity.id, media.id),
    edge("e8", "uses", lesson.id, activity.id),
    edge("e9", "uses", lesson.id, resource.id),
    edge("e10", "assesses", assessment.id, objective.id),
    edge("e11", "uses", lesson.id, assessment.id),
    edge("e12", "related_reflection", reflection.id, lesson.id),
    edge("e13", "improves", lesson.id, reflection.id, "lecție îmbunătățită"),
    edge("e14", "part_of", topic.id, curriculum.id),
    edge("e15", "uses", lesson.id, diff.id),
    edge("e16", "similar_to", activity.id, activity2.id),
    edge("e17", "derived_from", template.id, pattern.id),
    edge("e18", "tagged", note.id, topic.id),
  ];

  const collections: KnowledgeCollection[] = [
    {
      id: "col_fractions",
      title: "Fracții",
      description: "Lecții, activități și resurse despre fracții",
      nodeIds: [topic.id, lesson.id, activity.id, resource.id, assessment.id],
      autoSuggest: true,
      visibility: "private",
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "col_coop",
      title: "Strategii favorite — cooperativ",
      description: "Activități de învățare cooperativă",
      nodeIds: [strategy.id, activity.id, activity2.id, template.id],
      autoSuggest: true,
      visibility: "private",
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "col_inspection",
      title: "Lecții pentru inspecție",
      description: "Colecție dinamică pentru evidențe",
      nodeIds: [lesson.id, assessment.id, reflection.id],
      autoSuggest: false,
      visibility: "private",
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  return { nodes, edges, collections };
}
