import type {
  CopilotQuickActionId,
  CopilotRuntimeContext,
} from "../types";

function ctxLine(ctx: CopilotRuntimeContext): string {
  return [
    ctx.projectName ? `**Project:** ${ctx.projectName}` : null,
    ctx.lessonTitle ? `**Lesson:** ${ctx.lessonTitle}` : null,
    ctx.subject ? `**Subject:** ${ctx.subject}` : null,
    ctx.grade ? `**Grade:** ${ctx.grade}` : null,
    ctx.curriculum ? `**Curriculum:** ${ctx.curriculum}` : null,
    ctx.competencies.length
      ? `**Competencies:** ${ctx.competencies.slice(0, 3).join("; ")}`
      : null,
  ]
    .filter(Boolean)
    .join("  \n");
}

const ACTION_TEMPLATES: Record<
  CopilotQuickActionId,
  (ctx: CopilotRuntimeContext, prompt: string) => string
> = {
  generate_ideas: (ctx) =>
    `# Ideas for ${ctx.lessonTitle || ctx.projectName || "this work"}\n\n${ctxLine(ctx)}\n\n| Idea | Why it works |\n| --- | --- |\n| Concrete hook | Connects to ${ctx.grade || "students"}' daily life |\n| Mini investigation | Builds discovery before practice |\n| Peer teach-back | Strengthens articulation of ${ctx.subject || "concepts"} |\n\n1. Start with a surprising question.\n2. Let students predict before revealing.\n3. Capture vocabulary on a shared board.`,
  improve_writing: (ctx, prompt) =>
    `# Improved writing\n\n${ctxLine(ctx)}\n\n**Original intent:** ${prompt}\n\n> Clearer, tighter phrasing for classroom use.\n\n\`\`\`\nLearning focus: students will explain the core idea in their own words,\nthen apply it in a short guided task aligned to ${ctx.curriculum || "the curriculum"}.\n\`\`\`\n\n- Shorter sentences\n- Active voice\n- One measurable outcome per objective`,
  differentiate: (ctx) =>
    `# Differentiated pathways\n\n${ctxLine(ctx)}\n\n### Support\n- Sentence starters and visual cues\n- Paired work with roles\n\n### Core\n- Standard practice with success criteria\n\n### Challenge\n- Open problem + explain-to-a-peer\n\n| Level | Task |\n| --- | --- |\n| Support | Guided example + 2 items |\n| Core | Independent set |\n| Challenge | Transfer task |`,
  simplify: (ctx) =>
    `# Simplified version\n\n${ctxLine(ctx)}\n\n**In plain language:**\nToday we learn one big idea in ${ctx.subject || "this subject"}.\nWe try it together, then you try it alone.\n\n- One goal\n- Two examples\n- One check for understanding`,
  expand: (ctx) =>
    `# Expanded outline\n\n${ctxLine(ctx)}\n\n1. **Hook** (3 min) — curiosity spark\n2. **Model** (8 min) — think-aloud\n3. **Guided practice** (12 min)\n4. **Independent try** (10 min)\n5. **Exit ticket** (5 min)\n\nAdd stretch: connect to ${ctx.competencies[0] || "target competency"}.`,
  create_activities: (ctx) =>
    `# Classroom activities\n\n${ctxLine(ctx)}\n\n### Activity A — Think-Pair-Share\nStudents jot a prediction, discuss, then share one insight.\n\n### Activity B — Station rotation\nThree stations: explore, practice, create.\n\n### Activity C — Mini whiteboards\nRapid formative checks on ${ctx.subject || "key ideas"}.`,
  create_assessment: (ctx) =>
    `# Formative assessment\n\n${ctxLine(ctx)}\n\n| Item | Type | Focus |\n| --- | --- | --- |\n| 1 | Multiple choice | Prior knowledge |\n| 2 | Short answer | Explain in 2 sentences |\n| 3 | Application | New situation |\n\n**Success criteria:** accurate vocabulary · clear reasoning · complete response.`,
  suggest_homework: (ctx) =>
    `# Homework suggestion\n\n${ctxLine(ctx)}\n\n**15-minute home task**\n1. Re-explain today's idea to a family member.\n2. Complete 3 practice items.\n3. Write one question you still have.\n\nKeep it light, aligned to ${ctx.grade || "the class"}, and optional challenge included.`,
  generate_reflection: (ctx) =>
    `# Reflection prompts\n\n${ctxLine(ctx)}\n\n- What clicked for you today?\n- Where did you get stuck?\n- How would you teach this to a classmate?\n\n> Exit ticket: one sentence + one emoji for confidence.`,
  generate_resources: (ctx) =>
    `# Resource shortlist\n\n${ctxLine(ctx)}\n\n1. Visual anchor (diagram / timeline)\n2. Short explanatory text at student level\n3. Manipulative or concrete example\n4. Extension reading for curious students\n\nTag for Resource Center: \`${ctx.subject || "general"}\`, \`${ctx.grade || "all"}\`.`,
  translate: (ctx, prompt) =>
    `# Translation (RO ↔ EN mock)\n\n${ctxLine(ctx)}\n\n**Source**\n${prompt || "Selected classroom text"}\n\n**EN**\nStudents will explore the main idea and practice with guided support.\n\n**RO**\nElevii vor explora ideea principală și vor exersa cu sprijin ghidat.`,
  summarize: (ctx) =>
    `# Summary\n\n${ctxLine(ctx)}\n\n**In 3 lines**\n- Focus: ${ctx.lessonTitle || ctx.documentTitle || "current document"}\n- Audience: ${ctx.grade || "class"} · ${ctx.subject || "subject"}\n- Next step: choose one activity and one check for understanding.`,
};

export function mockCopilotReply(options: {
  prompt: string;
  actionId?: CopilotQuickActionId;
  context: CopilotRuntimeContext;
}): string {
  const { prompt, actionId, context } = options;
  if (actionId && ACTION_TEMPLATES[actionId]) {
    return ACTION_TEMPLATES[actionId](context, prompt);
  }

  return `# Copilot response\n\n${ctxLine(context)}\n\n**You asked:** ${prompt}\n\nHere's a ready-to-use draft aligned to your current context:\n\n1. Clarify the learning goal in one sentence.\n2. Add a 5-minute engagement hook.\n3. Plan guided practice with one formative check.\n\n\`\`\`md\nObjective: Students can demonstrate understanding of the focus idea.\nCheck: Exit ticket — 2 sentences + 1 example.\n\`\`\`\n\n| Next move | Outcome |\n| --- | --- |\n| Insert into lesson | Builds the next section |\n| Save as note | Keeps for later refinement |`;
}

export function smartPromptsForContext(
  ctx: CopilotRuntimeContext,
): string[] {
  const base = [
    "Generate an engaging lesson introduction.",
    "Create differentiated activities.",
    "Suggest formative assessment.",
    "Improve learning objectives.",
  ];
  if (ctx.lessonTitle) {
    base.push(`Expand the discovery section for “${ctx.lessonTitle}”.`);
    base.push("Propose homework that takes under 15 minutes.");
  } else if (ctx.projectName) {
    base.push(`Outline the next lesson for ${ctx.projectName}.`);
    base.push("Suggest resources to add to this project.");
  } else {
    base.push("Help me choose what to build first in this project.");
  }
  if (ctx.selection) {
    base.unshift("Improve the current selection.");
    base.unshift("Simplify the current selection.");
  }
  return base;
}
