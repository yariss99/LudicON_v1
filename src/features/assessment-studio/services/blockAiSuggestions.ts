import type { AssessmentBlock, AssessmentBlockType } from "../types";
import { assessmentBlockLabel } from "../constants";

const SNIPPETS: Record<AssessmentBlockType, () => string> = {
  short_answer: () =>
    `In 2–3 sentences, explain …\nInclude one example from class.`,
  multiple_choice: () =>
    `Which statement best shows …?\nA. …\nB. …\nC. …\nD. …\n(Correct: B)`,
  true_false: () =>
    `True or False: …\nIf false, rewrite the statement so it is true.`,
  matching: () =>
    `Match each concept with the best example.\n1. … →\n2. … →\n3. … →`,
  ordering: () =>
    `Put these steps in the correct order:\n□ …\n□ …\n□ …\n□ …`,
  fill_blank: () =>
    `Complete: When we ____, we are using the idea of ____ to ____.`,
  problem_solving: () =>
    `Situation: …\n1. What do you know?\n2. What strategy will you try?\n3. Show your work.\n4. Check: does the answer make sense?`,
  essay: () =>
    `Write a short essay that argues …\nSuccess criteria: clear claim, two pieces of evidence, concluding reflection.`,
  practical_task: () =>
    `Perform the task: …\nDocument evidence (photo / notes / recording).\nReflect: what competency did you demonstrate?`,
  observation: () =>
    `Look-fors during activity:\n☐ Explains reasoning\n☐ Uses vocabulary accurately\n☐ Collaborates respectfully\nNotes:`,
  portfolio: () =>
    `Include:\n1. Best attempt this week\n2. One revised draft\n3. Short reflection on growth toward the competency`,
  self_assessment: () =>
    `☐ I can explain the idea\n☐ I can apply it in a new context\n☐ I can teach a peer\nNext step for me:`,
  rubric: () =>
    `| Criteria | Emerging | Developing | Secure |\n| --- | --- | --- | --- |\n| Understanding | … | … | … |\n| Application | … | … | … |\n| Communication | … | … | … |`,
};

export function aiImproveAssessmentBlock(block: AssessmentBlock): string {
  const draft = SNIPPETS[block.type]();
  if (!block.content.trim()) return draft;
  return `${block.content.trim()}\n\n— Improved draft —\n${draft}`;
}

export function aiSuggestionForAssessment(type: AssessmentBlockType): string {
  return `Would you like a clearer ${assessmentBlockLabel(type).toLowerCase()} item aligned to your competencies?`;
}
