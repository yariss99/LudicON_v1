/**

 * Teacher-facing verbalization of a PedagogicalDecision.

 * Must never choose the next action — only express it in educational language.

 */



import type {

  LearningCanvas,

  PedagogicalDecision,

} from "../../create-learning-experience/decision-engine";

import type { GuidedReplyParts } from "../types";



const FIELD_RO: Record<string, string> = {

  topic: "tema",

  subject: "disciplina",

  grade: "clasa",

};



function understandingFromCanvas(canvas: LearningCanvas): string {

  if (canvas.subject && canvas.topic && canvas.grade) {

    return `Înțeleg că proiectezi o lecție de ${canvas.subject} despre ${canvas.topic} pentru ${canvas.grade}.`;

  }

  if (canvas.subject && canvas.topic) {

    return `Înțeleg că proiectezi o lecție de ${canvas.subject} despre ${canvas.topic}.`;

  }

  if (canvas.topic) {

    return `Înțeleg că vrei ca elevii să exploreze „${canvas.topic}”.`;

  }

  if (canvas.subject) {

    return `Înțeleg că proiectezi o lecție de ${canvas.subject}.`;

  }

  return "Sunt alături de tine — putem modela lecția un pas gândit pe rând.";

}



function canvasUpdateLine(

  canvas: LearningCanvas,

  updatedFields: string[],

): string | null {

  if (updatedFields.length === 0) return null;

  if (updatedFields.includes("curriculum") && canvas.curriculum) {

    return `Planul lecției a fost actualizat cu curriculumul (${canvas.curriculum}).`;

  }

  if (updatedFields.includes("competencies") && canvas.competencies.length) {

    return "Planul lecției a fost actualizat cu competențele.";

  }

  const contextBits = ["topic", "subject", "grade"]

    .filter((f) => updatedFields.includes(f))

    .map((f) => FIELD_RO[f] ?? f);

  if (contextBits.length > 0) {

    return `Planul lecției a fost actualizat cu ${contextBits.join(" și ")}.`;

  }

  return "Planul lecției a fost actualizat cu ceea ce știm până acum.";

}



function questionForAction(

  decision: PedagogicalDecision,

  canvas: LearningCanvas,

): string {

  switch (decision.action) {

    case "ASK_GRADE":

      return "La ce clasă predai?";

    case "LOAD_CURRICULUM":

      return canvas.grade

        ? `Încarc curriculumul pentru ${canvas.grade}?`

        : "Încarc curriculumul potrivit?";

    case "LOAD_COMPETENCIES":

      return "Aduc competențele aliniate acestui curriculum?";

    case "ASK_OBJECTIVES":

      return canvas.topic

        ? `Ce ar trebui să poată face elevii la finalul lecției despre ${canvas.topic}?`

        : "Ce ar trebui să poată face elevii la finalul acestei lecții?";

    case "ASK_ACTIVITIES":

      return "Ce vor face elevii ca să ajungă la această înțelegere?";

    case "ASK_ASSESSMENT":

      return "Cum ai putea verifica blând dacă învățarea s-a așezat — în timpul lecției sau la final?";

    case "ASK_RESOURCES":

      return "Ce materiale sau instrumente îți imaginezi deja pentru clasă?";

    case "GENERATE_BLUEPRINT":

      return "Pregătim proiectul lecției pentru a-l verifica împreună?";

    case "NONE":

      return "Ce ai vrea să modelăm în continuare în planul lecției?";

  }

}



/** Map Decision Engine reasons to reassuring teacher language */

function teacherFacingReason(decision: PedagogicalDecision): string {

  switch (decision.action) {

    case "ASK_GRADE":

      return "Alegerea curriculumului depinde de clasă.";

    case "LOAD_CURRICULUM":

      return "Curriculumul trebuie încărcat înainte de a alege competențele.";

    case "LOAD_COMPETENCIES":

      return "Competențele leagă curriculumul de obiectivele de învățare.";

    case "ASK_OBJECTIVES":

      return "Obiectivele clare ghidează activitățile și evaluarea.";

    case "ASK_ACTIVITIES":

      return "Activitățile transformă obiectivele în ceea ce elevii vor face.";

    case "ASK_ASSESSMENT":

      return "Evaluarea arată dacă învățarea dorită s-a așezat.";

    case "ASK_RESOURCES":

      return "Resursele fac planul pregătit pentru clasă.";

    case "GENERATE_BLUEPRINT":

      return "Toate părțile esențiale ale planului lecției sunt complete.";

    case "NONE":

      return "Mai avem nevoie de câteva detalii.";

    default:

      return decision.reason;

  }

}



export function verbalizePedagogicalDecision(input: {

  decision: PedagogicalDecision;

  canvas: LearningCanvas;

  updatedFields?: string[];

}): GuidedReplyParts {

  return {

    understanding: understandingFromCanvas(input.canvas),

    canvasUpdate: canvasUpdateLine(input.canvas, input.updatedFields ?? []),

    whyNeeded: teacherFacingReason(input.decision),

    question: questionForAction(input.decision, input.canvas),

  };

}



export function formatGuidedParts(parts: GuidedReplyParts): string {

  return [parts.understanding, parts.canvasUpdate, parts.whyNeeded, parts.question]

    .filter(Boolean)

    .join("\n\n");

}


