import type { DecisionBlueprint } from "../../../engines/decision";
import type { ReviewSectionId } from "../../blueprint-review/types";
import { assetRegistry } from "./assetRegistry";
import type {
  AssetTypeId,
  GeneratedBlock,
  RegenerationScope,
} from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Deterministic draft content from approved Blueprint facts.
 * Never invents pedagogy; never starts from free prompts.
 */
export function generateAssetBlocks(input: {
  typeId: AssetTypeId;
  blueprint: DecisionBlueprint;
  scope: RegenerationScope;
  scopeTarget?: string;
  previousBlocks?: GeneratedBlock[];
}): GeneratedBlock[] {
  const def = assetRegistry.get(input.typeId);
  const ctx = input.blueprint.learningContext;
  const topic = ctx.topic ?? "the topic";
  const subject = ctx.subject ?? "the subject";
  const grade = ctx.grade ?? "the grade band";
  const objective =
    input.blueprint.objectives[0] ?? `Understand ${topic}`;
  const flow =
    input.blueprint.learningFlow[0] ?? "warm-up → explore → practise → close";
  const activity =
    input.blueprint.activities[0] ?? `Explore ${topic} with concrete materials`;
  const assessment =
    input.blueprint.assessment[0] ?? `Check understanding of ${topic}`;
  const resources =
    input.blueprint.resources[0] ?? "Classroom materials from Resources";
  const differentiation =
    input.blueprint.differentiation[0] ?? "Support and extension as needed";

  const sections = def?.sourceSections ?? ([] as ReviewSectionId[]);

  // Partial regeneration — keep other blocks when scope is narrower
  if (
    input.scope !== "entire_asset" &&
    input.previousBlocks &&
    input.previousBlocks.length > 0
  ) {
    const target = (input.scopeTarget ?? input.scope).toLowerCase();
    return input.previousBlocks.map((block) => {
      const hit =
        block.title.toLowerCase().includes(target) ||
        block.id.toLowerCase().includes(target) ||
        (input.scope === "selected_activity" &&
          /activit/i.test(block.title)) ||
        (input.scope === "selected_assessment" &&
          /assess|check|exit/i.test(block.title)) ||
        (input.scope === "selected_section" &&
          block.title.toLowerCase().includes(target));
      if (!hit) return block;
      return {
        ...block,
        id: uid("blk"),
        body: `${block.body}\n\n[Regenerated from approved Blueprint — ${input.scope}]`,
      };
    });
  }

  switch (input.typeId) {
    case "lesson_plan":
      return [
        block("Context", `${subject} · ${grade} · ${topic}`, sections),
        block("Objective", objective, ["objectives"]),
        block("Learning Flow", flow, ["learning_flow"]),
        block("Core Activity", activity, ["activities"]),
        block("Check for learning", assessment, ["assessment"]),
      ];
    case "worksheet":
      return [
        block("Header", `Practice: ${topic} (${grade})`, sections),
        block(
          "Task 1",
          `Using ideas from “${activity}”, complete the guided examples.`,
          ["activities"],
        ),
        block(
          "Task 2",
          `Show that you can: ${objective}`,
          ["objectives"],
        ),
      ];
    case "assessment":
      return [
        block("Assessment focus", assessment, ["assessment"]),
        block("Aligned objective", objective, ["objectives"]),
        block(
          "Item",
          `Demonstrate: ${objective}`,
          ["objectives", "assessment"],
        ),
      ];
    case "presentation":
      return [
        block("Slide 1 — Hook", `Today we explore ${topic}.`, ["learning_context"]),
        block("Slide 2 — Flow", flow, ["learning_flow"]),
        block("Slide 3 — Do", activity, ["activities"]),
        block("Slide 4 — Materials", resources, ["resources"]),
      ];
    case "educational_game":
      return [
        block(
          "Game brief",
          `Playful practice for “${objective}” with ${differentiation}.`,
          sections,
        ),
        block("How to play", `Teams enact: ${activity}`, ["activities"]),
      ];
    case "story":
      return [
        block(
          "Story",
          `In ${grade}, learners meet a challenge about ${topic} in ${subject}. The journey builds toward: ${objective}.`,
          sections,
        ),
      ];
    case "visual_resources":
      return [
        block("Visual set", `Visual supports for ${topic}. Materials: ${resources}.`, sections),
        block("Use in class", `Display during: ${activity}`, ["activities"]),
      ];
    case "homework":
      return [
        block(
          "Home practice",
          `At home, extend “${activity}” to reinforce: ${objective}.`,
          sections,
        ),
      ];
    case "rubric":
      return [
        block(
          "Criteria",
          `Emerging → Developing → Secure for: ${objective}`,
          ["objectives"],
        ),
        block("Evidence", `Look for behaviours linked to: ${assessment}`, ["assessment"]),
      ];
    case "observation_sheet":
      return [
        block(
          "Observe",
          `During ${activity}, note evidence of: ${objective}`,
          sections,
        ),
        block(
          "Reflect",
          input.blueprint.reflection[0] ?? "What will you notice next time?",
          ["reflection"],
        ),
      ];
    case "parent_communication":
      return [
        block(
          "Family note",
          `This week in ${subject} (${grade}) we explore ${topic}. Goal: ${objective}.`,
          sections,
        ),
      ];
    case "classroom_activities":
      return [
        block("Activity card", activity, ["activities"]),
        block("Differentiation", differentiation, ["differentiation"]),
        block("Within flow", flow, ["learning_flow"]),
      ];
    case "teacher_notes":
      return [
        block(
          "Setup",
          `Prepare ${resources}. Context: ${subject}, ${grade}, ${topic}.`,
          ["learning_context", "resources"],
        ),
        block("Differentiation", differentiation, ["differentiation"]),
        block(
          "After class",
          input.blueprint.reflection[0] ?? "Note what to adjust next time.",
          ["reflection"],
        ),
      ];
  }
}

function block(
  title: string,
  body: string,
  sourceSections: ReviewSectionId[],
): GeneratedBlock {
  return {
    id: uid("blk"),
    title,
    body,
    sourceSections,
  };
}

export function streamPreview(blocks: GeneratedBlock[]): string {
  return blocks.map((b) => `## ${b.title}\n${b.body}`).join("\n\n");
}
