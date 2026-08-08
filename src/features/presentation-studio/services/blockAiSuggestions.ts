import type { PresentationBlock, PresentationBlockType } from "../types";
import { presentationBlockLabel } from "../constants";

const SNIPPETS: Record<PresentationBlockType, () => string> = {
  title: () => `Today we will…\nBy the end, you will be able to…`,
  text: () =>
    `• Key idea 1\n• Key idea 2\n• Key idea 3\n\nOne sentence summary:`,
  image: () =>
    `Visual: …\nCaption: What do you notice? What do you wonder?`,
  gallery: () =>
    `1. Example A — …\n2. Example B — …\n3. Example C — …\nDiscuss: which fits best?`,
  table: () =>
    `| Idea | Example | Why it matters |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |`,
  diagram: () =>
    `Center: main concept\n→ Branch 1\n→ Branch 2\n→ Branch 3\nArrow back: how they connect`,
  timeline: () =>
    `1. Start — …\n2. Next — …\n3. Then — …\n4. Now — …`,
  video: () =>
    `Watch for: …\nPause at: …\nDiscuss after: …`,
  qr_code: () =>
    `Scan to open: …\nTask: complete the mini-check and return ready to share one insight.`,
  interactive_question: () =>
    `Question: …\nThink 20s → Pair → Share\nLook-for: evidence in your answer`,
  brainstorm: () =>
    `Prompt: How many ways can we…?\nRules: every idea counts · build on others · capture on the board`,
  reflection: () =>
    `What clicked?\nWhere am I still unsure?\nWhat will I try next?`,
  activity: () =>
    `In pairs (8 min):\n1. …\n2. …\nShare one sentence with the class.`,
};

export function aiImprovePresentationBlock(block: PresentationBlock): string {
  const draft = SNIPPETS[block.type]();
  if (!block.content.trim()) return draft;
  return `${block.content.trim()}\n\n— Improved draft —\n${draft}`;
}

export type PresentationAiAction =
  | "simplify"
  | "layout"
  | "illustration"
  | "summary";

export function aiSuggestionForPresentation(
  type: PresentationBlockType,
): { action: PresentationAiAction; label: string; prompt: string } {
  const map: Record<
    PresentationBlockType,
    { action: PresentationAiAction; label: string; prompt: string }
  > = {
    title: {
      action: "simplify",
      label: "Simplify slide",
      prompt: "Would you like a clearer, simpler title slide?",
    },
    text: {
      action: "simplify",
      label: "Simplify slide",
      prompt: "Would you like me to simplify this slide?",
    },
    image: {
      action: "illustration",
      label: "Suggest illustration",
      prompt: "Would you like me to suggest an illustration?",
    },
    gallery: {
      action: "layout",
      label: "Improve layout",
      prompt: "Would you like a better gallery layout?",
    },
    table: {
      action: "layout",
      label: "Improve layout",
      prompt: "Would you like me to improve this table layout?",
    },
    diagram: {
      action: "summary",
      label: "Visual summary",
      prompt: "Would you like a clearer visual summary?",
    },
    timeline: {
      action: "layout",
      label: "Improve layout",
      prompt: "Would you like a clearer timeline layout?",
    },
    video: {
      action: "simplify",
      label: "Simplify slide",
      prompt: "Would you like clearer framing for this video?",
    },
    qr_code: {
      action: "simplify",
      label: "Simplify slide",
      prompt: "Would you like a clearer QR activity prompt?",
    },
    interactive_question: {
      action: "simplify",
      label: "Simplify slide",
      prompt: "Would you like a stronger class question?",
    },
    brainstorm: {
      action: "simplify",
      label: "Simplify slide",
      prompt: "Would you like a clearer brainstorm prompt?",
    },
    reflection: {
      action: "simplify",
      label: "Simplify slide",
      prompt: "Would you like a clearer reflection prompt?",
    },
    activity: {
      action: "summary",
      label: "Visual summary",
      prompt: "Would you like a clearer activity summary?",
    },
  };
  return (
    map[type] ?? {
      action: "simplify",
      label: "Simplify slide",
      prompt: `Would you like to improve this ${presentationBlockLabel(type).toLowerCase()} slide?`,
    }
  );
}
