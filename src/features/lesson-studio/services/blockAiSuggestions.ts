import type { LessonBlockType, LessonStudioBlock } from "../types";
import { blockMeta, blockTypeLabel } from "../constants";

const IMPROVE_SNIPPETS: Record<LessonBlockType, (title: string) => string> = {
  introduction: (t) =>
    `Start with a curious question about ${t.toLowerCase()}.\nInvite two predictions from the class.\nReveal today's purpose in one clear sentence.`,
  objectives: () =>
    `By the end of this lesson, students will be able to:\n• Explain the core idea in their own words\n• Apply it in a short guided task\n• Check their understanding with a peer`,
  previous_knowledge: () =>
    `Warm-up (3 min):\n• What do you already know?\n• Where have you seen this before?\nCapture 3 keywords on the board.`,
  discovery: () =>
    `Explore together:\n1. Observe an example\n2. Notice a pattern\n3. Name the concept\nTeacher think-aloud models the reasoning.`,
  practice: () =>
    `Guided (together) → paired try → independent set.\nSuccess criteria visible on the board.\nCirculate and note 2 common misconceptions.`,
  interactive_activity: () =>
    `Station rotation (12 min):\n• Explore · Practice · Create\nRoles: speaker, recorder, checker.\nShare one insight with the class.`,
  assessment: () =>
    `Exit ticket (5 min):\n1. One key idea\n2. One example\n3. One remaining question\nUse responses to plan tomorrow.`,
  homework: () =>
    `Home task (≤15 min):\nExplain today's idea to someone at home.\nComplete 3 practice items.\nBring one question back.`,
  reflection: () =>
    `What clicked today?\nWhere did you get stuck?\nHow would you teach this to a classmate?`,
  resources: () =>
    `• Visual anchor / diagram\n• Short student-level text\n• Concrete example or manipulative\n• Optional extension for curious learners`,
  notes: () =>
    `Prep: materials ready before class.\nWatch for timing on discovery.\nDifferentiation: support sentence starters; challenge transfer task.`,
};

export function aiImproveBlock(block: LessonStudioBlock): string {
  const generator = IMPROVE_SNIPPETS[block.type];
  const draft = generator(block.title || blockTypeLabel(block.type));
  if (!block.content.trim()) return draft;
  return `${block.content.trim()}\n\n— Improved draft —\n${draft}`;
}

export function aiSuggestionLabel(type: LessonBlockType): string {
  return (
    blockMeta(type)?.aiPrompt ??
    "Would you like me to improve this section?"
  );
}
