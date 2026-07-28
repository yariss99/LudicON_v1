import type {
  GeneratedLessonContent,
  LessonDraft,
  LessonStyleId,
} from "../types/lesson";
import { getLessonStyleLabel } from "../features/lessons/constants";

function styleIntro(style: LessonStyleId, title: string): string {
  switch (style) {
    case "traditional":
      return `Lecție tradițională pentru „${title}”, cu explicație clară și consolidare ghidată.`;
    case "modern":
      return `Lecție modernă pentru „${title}”, cu interacțiune activă și suport digital.`;
    case "inquiry":
      return `Lecție inquiry-based pentru „${title}”, construită în jurul întrebărilor elevilor.`;
    case "steam":
      return `Lecție STEAM pentru „${title}”, care integrează investigație, creativitate și aplicare.`;
    case "gamified":
      return `Lecție gamificată pentru „${title}”, cu provocări scurte și feedback imediat.`;
    case "inclusive":
      return `Lecție incluzivă pentru „${title}”, cu diferențiere și multiple căi de participare.`;
  }
}

/**
 * Mock generator — replace with AI pipeline later.
 * Produces a structured lesson outline from wizard draft data.
 */
export function generateMockLessonContent(
  draft: LessonDraft,
): GeneratedLessonContent {
  if (!draft.style) {
    throw new Error("STYLE_REQUIRED");
  }

  const { general, curriculum, teaching, style } = draft;
  const styleLabel = getLessonStyleLabel(style);
  const duration = general.duration || 45;
  const warmUp = Math.max(5, Math.round(duration * 0.15));
  const core = Math.max(15, Math.round(duration * 0.55));
  const practice = Math.max(8, Math.round(duration * 0.2));
  const closure = Math.max(5, duration - warmUp - core - practice);

  const objectiveLine =
    curriculum.learningObjectives[0] ??
    "Elevii vor înțelege și aplica ideea centrală a lecției.";

  const methodLine =
    teaching.teachingMethods.slice(0, 2).join(", ") || "explicație și practică";

  return {
    summary: `${styleIntro(style, general.title)} Obiectiv principal: ${objectiveLine}`,
    sections: [
      {
        id: "warmup",
        title: "Activare",
        durationMinutes: warmUp,
        content: `Pornește cu o întrebare scurtă legată de ${general.subject} (${general.grade}). Stil: ${styleLabel}.`,
      },
      {
        id: "core",
        title: "Predare / Explorare",
        durationMinutes: core,
        content: `Folosește ${methodLine}. Competențe vizate: ${
          curriculum.specificCompetencies.slice(0, 2).join("; ") ||
          "aplicarea noțiunilor esențiale"
        }.`,
      },
      {
        id: "practice",
        title: "Practică ghidată",
        durationMinutes: practice,
        content: `Elevii lucrează ${
          teaching.classroomOrganization || "în grupuri mici"
        } folosind ${
          teaching.teachingResources[0] ?? "fișa de lucru"
        } și ${teaching.teachingMaterials[0] ?? "materialele disponibile"}.`,
      },
      {
        id: "closure",
        title: "Încheiere & reflecție",
        durationMinutes: closure,
        content:
          "Rezumați ideea-cheie. Elevii notează un lucru învățat și o întrebare rămasă.",
      },
    ],
    assessmentIdeas: [
      "Verificare orală scurtă pe obiectivul principal",
      "Observare pe parcursul practicii ghidate",
      curriculum.learningObjectives[1]
        ? `Sarcină scurtă: ${curriculum.learningObjectives[1]}`
        : "Exit ticket: 1 idee + 1 exemplu",
    ],
    homework:
      "Extinde ideea lecției într-un exemplu din viața reală sau completează o sarcină scurtă de consolidare.",
  };
}
