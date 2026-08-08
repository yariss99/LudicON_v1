import type { StoryBlock, StoryBlockType } from "../types";
import { storyBlockLabel } from "../constants";

const SNIPPETS: Record<StoryBlockType, () => string> = {
  scene: () =>
    `The light shifts. Our heroes arrive at…\nGoal for this scene: …`,
  character: () =>
    `Name: …\nRole: guide / challenger / ally\nMotivation: help learners discover…`,
  dialogue: () =>
    `Guide: "What do you notice?"\nLearner: "I think…"\nGuide: "Try one more step."`,
  mission: () =>
    `Mission: reach … before …\nSuccess looks like: …`,
  challenge: () =>
    `Obstacle: …\nHow it connects to the objective: …`,
  learning_task: () =>
    `Task: …\nShow your thinking in 2–3 sentences.`,
  hint: () =>
    `Hint: look for the pattern in …\n(Still leave the final step to the learner.)`,
  reward: () =>
    `You unlocked …!\nMessage: You demonstrated…`,
  reflection: () =>
    `What clicked?\nWhere did the story help you understand the idea?`,
  alternative_ending: () =>
    `If the challenge felt hard: …\nIf it felt easy: try the stretch path…`,
};

export function aiImproveStoryBlock(block: StoryBlock): string {
  const draft = SNIPPETS[block.type]();
  if (!block.content.trim()) return draft;
  return `${block.content.trim()}\n\n— Improved draft —\n${draft}`;
}

export function aiSuggestionForStoryBlock(type: StoryBlockType): string {
  const map: Partial<Record<StoryBlockType, string>> = {
    scene: "Would you like me to improve the narrative flow of this scene?",
    dialogue: "Would you like me to convert this into clearer dialogue?",
    alternative_ending: "Would you like a stronger alternative ending?",
    learning_task: "Would you like vocabulary adapted for your grade?",
    challenge: "Would you like more suspense in this challenge?",
  };
  return (
    map[type] ??
    `Would you like to improve this ${storyBlockLabel(type).toLowerCase()}?`
  );
}
