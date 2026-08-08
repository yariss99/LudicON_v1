import type { WorksheetBlock, WorksheetBlockType } from "../types";
import { worksheetBlockLabel } from "../constants";

const SNIPPETS: Record<WorksheetBlockType, () => string> = {
  exercises: () =>
    `1. Complete the example.\n2. Try two similar items independently.\n3. Circle the step that felt hardest.`,
  problems: () =>
    `Problem A — Apply the idea in a new situation.\nProblem B — Explain your reasoning in 2 sentences.\nChallenge — Invent a similar problem for a classmate.`,
  tables: () =>
    `| Example | My attempt | Check |\n| --- | --- | --- |\n| 1 |  |  |\n| 2 |  |  |\n| 3 |  |  |`,
  images: () =>
    `Look carefully at the image.\n1. What do you notice?\n2. What do you wonder?\n3. Write one sentence connecting it to today's idea.`,
  matching: () =>
    `Match each item on the left with the best partner on the right.\nA · …\nB · …\nC · …`,
  crosswords: () =>
    `Across\n1. …\n3. …\n\nDown\n2. …\n4. …`,
  mazes: () =>
    `Start → choose the correct path at each junction.\nWrong turns lead to a hint, then try again.\nFinish by stating the key idea in one line.`,
  qr_activities: () =>
    `Station 1 (QR) — quick check\nStation 2 (QR) — short practice\nStation 3 (QR) — create & share`,
  reflection: () =>
    `What clicked for you?\nWhere did you get stuck?\nWhat will you try differently next time?`,
  self_assessment: () =>
    `☐ I can explain the idea\n☐ I can complete a basic item\n☐ I can help a peer\nConfidence today: 1  2  3  4  5`,
  creative_tasks: () =>
    `Create a mini poster / comic / explanation that teaches today's idea to a younger student.\nInclude one example and one tip.`,
};

export function aiImproveWorksheetBlock(block: WorksheetBlock): string {
  const draft = SNIPPETS[block.type]();
  if (!block.content.trim()) return draft;
  return `${block.content.trim()}\n\n— Improved draft —\n${draft}`;
}

export function aiSuggestionForWorksheet(
  type: WorksheetBlockType,
): string {
  return (
    `Would you like me to improve this ${worksheetBlockLabel(type).toLowerCase()} block?`
  );
}
