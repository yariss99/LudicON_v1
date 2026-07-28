import {
  publish,
  type PublishResult,
  type PdePreviewKind,
} from "../../../engines/pde";
import type { UpeDocument, UpePreviewMode } from "../../universal-editor/types";
import { analyzeUpeDocument } from "../../universal-editor/services/pieBridge";

function mapPreview(mode: UpePreviewMode): PdePreviewKind {
  switch (mode) {
    case "printable":
      return "print";
    case "presentation":
      return "presentation";
    case "interactive":
      return "interactive";
    case "accessibility":
      return "accessibility";
    case "mobile":
      return "mobile";
    default:
      return "student";
  }
}

function documentBody(document: UpeDocument): string {
  return document.blocks
    .filter((b) => b.visibility !== "hidden" && b.visibility !== "teacher")
    .map((b) => `## ${b.type}\n${String(b.content.text ?? "")}`)
    .join("\n\n");
}

export function publishUpeDocument(input: {
  document: UpeDocument;
  profileId: string;
  previewMode: UpePreviewMode;
  previewCompleted: boolean;
  autosaveIdle: boolean;
}): PublishResult {
  const pie = analyzeUpeDocument(input.document);
  const missingAlt = input.document.blocks.some(
    (b) =>
      b.type === "image" &&
      (!b.content.alt || !String(b.content.alt).trim()),
  );

  return publish(
    {
      objectId: input.document.id,
      objectVersionId: `${input.document.versionLabel}_${input.document.updatedAt}`,
      objectTitle: input.document.title,
      lessonProjectId: input.document.lessonProjectId ?? undefined,
      destination: "print",
      channel: "printable_worksheet",
      format: "pdf",
      profileId: input.profileId,
      previewKind: mapPreview(input.previewMode),
      previewCompleted: input.previewCompleted,
      authorId: "teacher_local",
      authorName: "Profesor",
      pieOverall: pie.scorecard.overall,
      hasObjectives: input.document.learningObjectives.length > 0,
      hasAssessment: input.document.blocks.some(
        (b) =>
          b.type === "success_criteria" ||
          b.type === "open_question" ||
          b.type === "multiple_choice",
      ),
      hasBrokenReferences: false,
      hasUnsavedChanges: !input.autosaveIdle,
      missingAltText: missingAlt,
      estimatedMinutes: pie.scorecard.estimatedTeachingMinutes,
      availableMinutes: 45,
    },
    documentBody(input.document),
  );
}
