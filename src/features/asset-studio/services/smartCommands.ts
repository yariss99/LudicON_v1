import type { SmartCommandProposal, StudioNode } from "../types";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Smart command proposals — AI suggests; teacher must approve.
 * Deterministic pedagogical rewrites (not free-form generation).
 */
export function proposeSmartCommand(
  command: string,
  node: StudioNode,
): SmartCommandProposal {
  const lower = command.toLowerCase();
  let proposedBody = node.body;
  let summary = "Suggested refinement";

  if (/differentiat|support|extension|sen/i.test(lower)) {
    summary = "Differentiate this activity";
    proposedBody = `${node.body}\n\nDifferentiation: Support with concrete examples; extend with an open challenge for early finishers.`;
  } else if (/collaborat|pair|group|together/i.test(lower)) {
    summary = "Make this collaborative";
    proposedBody = node.body.match(/^in pairs/i)
      ? node.body
      : `In pairs, ${node.body.replace(/^students\s+/i, "students ")}`;
  } else if (/simplify|grade\s*ii|easier|younger/i.test(lower)) {
    summary = "Simplify for Grade II";
    proposedBody = `${node.body}\n\nSimplified language: shorter steps, clearer verbs, one example first.`;
  } else if (/challenge|harder|increase|extend/i.test(lower)) {
    summary = "Increase challenge";
    proposedBody = `${node.body}\n\nChallenge: Ask learners to explain their reasoning and create one new example.`;
  } else {
    summary = "Refine section from teacher command";
    proposedBody = `${node.body}\n\n[Teacher direction] ${command.trim()}`;
  }

  return {
    id: uid("cmd"),
    command: command.trim(),
    nodeId: node.id,
    summary,
    proposedBody,
    status: "pending",
  };
}
