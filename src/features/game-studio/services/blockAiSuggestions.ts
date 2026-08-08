import type { GameBlock, GameBlockType } from "../types";
import { gameBlockLabel } from "../constants";

const SNIPPETS: Record<GameBlockType, () => string> = {
  introduction: () =>
    `Welcome, explorers!\nToday's objective: …\nYou will win by showing you can…`,
  mission: () =>
    `Mission brief:\n1. …\n2. …\nSuccess looks like: …`,
  question: () =>
    `Challenge:\n…\nHint (optional): …\nEvidence of learning: …`,
  feedback: () =>
    `If correct: celebrate + unlock next stage.\nIf incorrect: gentle hint + one more try.`,
  reward: () =>
    `Reward: badge / coins / unlock.\nMessage: You demonstrated…`,
  final_challenge: () =>
    `Boss challenge:\nCombine two ideas from earlier.\nWin condition: …`,
};

export function aiImproveGameBlock(block: GameBlock): string {
  const draft = SNIPPETS[block.type]();
  if (!block.content.trim()) return draft;
  return `${block.content.trim()}\n\n— Improved draft —\n${draft}`;
}

export function aiSuggestionForGameBlock(type: GameBlockType): string {
  return `Would you like a clearer ${gameBlockLabel(type).toLowerCase()} for this learning game?`;
}
