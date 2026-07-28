import { createId } from "../../../utils/id";
import type { Project } from "../../../types/project";
import {
  ensureLessonForProject as ensureLessonForGame,
  seedGameFromBestSource,
  syncGameToWorkspace,
} from "../../game-builder/services/gameCoreBridge";
import { gameBuilderRepository } from "../../game-builder/services/gameBuilderRepository";
import {
  ensureLessonForProject as ensureLessonForPresentation,
  seedPresentationFromBestSource,
  syncPresentationToWorkspace,
} from "../../presentation-builder/services/presentationCoreBridge";
import { presentationBuilderRepository } from "../../presentation-builder/services/presentationBuilderRepository";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { assessmentBuilderRepository } from "../../assessment-builder/services/assessmentBuilderRepository";
import { storyBuilderRepository } from "../../story-builder/services/storyBuilderRepository";
import { resourceCenterRepository } from "../../resource-center/services/resourceCenterRepository";
import {
  emptyFilters,
  searchResources,
} from "../../resource-center/services/resourceSearch";
import type {
  AssistantContextPackage,
  AssistantIntentId,
  AssistantToolCall,
} from "../types";

export type ToolExecutionResult = {
  readonly tools: readonly AssistantToolCall[];
  readonly notes: readonly string[];
};

function tool(
  partial: Omit<AssistantToolCall, "id" | "status"> & {
    status?: AssistantToolCall["status"];
  },
): AssistantToolCall {
  return {
    id: createId("tool"),
    status: partial.status ?? "proposed",
    tool: partial.tool,
    label: partial.label,
    href: partial.href,
    payload: partial.payload,
  };
}

export function planToolsForIntent(input: {
  intent: AssistantIntentId;
  context: AssistantContextPackage;
  project?: Project;
  utterance: string;
}): ToolExecutionResult {
  const { intent, context, project } = input;
  const tools: AssistantToolCall[] = [];
  const notes: string[] = [];

  const pid = project?.id ?? context.projectId;
  const lessonId = context.lessonId;

  switch (intent) {
    case "create_worksheet":
    case "create_homework":
      tools.push(
        tool({
          tool: "navigate",
          label: "Deschide flux fișă / temă",
          href: pid
            ? `/create/experience?intent=worksheet&project=${pid}`
            : "/create/experience?intent=worksheet",
        }),
      );
      notes.push("Propun generarea unei fișe în proiectul activ.");
      break;
    case "create_game":
      if (project) {
        try {
          const lid = lessonId ?? ensureLessonForGame(project);
          const created = gameBuilderRepository.create({
            projectId: project.id,
            lessonId: lid,
            title: `Joc · ${project.title}`,
            subject: project.subject,
            grade: project.grade,
          });
          const seeded = seedGameFromBestSource(project, created);
          const artifactId = syncGameToWorkspace(seeded);
          const saved = gameBuilderRepository.save(
            { ...seeded, workspaceArtifactId: artifactId },
            { note: "assistant-create", actor: "ai" },
          );
          tools.push(
            tool({
              tool: "create_artifact",
              label: `Joc creat: ${saved.title}`,
              href: `/game-builder/${project.id}/${saved.id}`,
              status: "done",
              payload: { gameId: saved.id, lessonId: lid },
            }),
          );
          notes.push("Am creat un joc din sursele lecției (nu canvas gol).");
        } catch {
          tools.push(
            tool({
              tool: "open_builder",
              label: "Deschide Game Builder",
              href: `/game-builder/${project.id}`,
            }),
          );
        }
      } else {
        tools.push(
          tool({
            tool: "navigate",
            label: "Alege un proiect",
            href: "/projects",
          }),
        );
      }
      break;
    case "create_presentation":
      if (project) {
        try {
          const lid = lessonId ?? ensureLessonForPresentation(project);
          const created = presentationBuilderRepository.create({
            projectId: project.id,
            lessonId: lid,
            title: `Prezentare · ${project.title}`,
            subject: project.subject,
            grade: project.grade,
          });
          const seeded = seedPresentationFromBestSource(project, created);
          const artifactId = syncPresentationToWorkspace(seeded);
          const saved = presentationBuilderRepository.save(
            { ...seeded, workspaceArtifactId: artifactId },
            { note: "assistant-create", actor: "ai" },
          );
          tools.push(
            tool({
              tool: "create_artifact",
              label: `Prezentare: ${saved.title}`,
              href: `/presentation-builder/${project.id}/${saved.id}`,
              status: "done",
              payload: { presentationId: saved.id },
            }),
          );
          notes.push("Prezentare generată din conținut PRIMA.");
        } catch {
          tools.push(
            tool({
              tool: "open_builder",
              label: "Presentation Builder",
              href: `/presentation-builder/${project.id}`,
            }),
          );
        }
      }
      break;
    case "create_assessment":
      tools.push(
        tool({
          tool: "navigate",
          label: "Assessment Builder",
          href: pid ? `/assessment-builder/${pid}` : "/projects",
        }),
      );
      break;
    case "create_story":
    case "explain_with_story":
      tools.push(
        tool({
          tool: "navigate",
          label: "Story Builder",
          href: pid ? `/story-builder/${pid}` : "/projects",
        }),
      );
      break;
    case "create_lesson":
    case "prepare_tomorrow":
    case "create_revision":
      tools.push(
        tool({
          tool: "navigate",
          label: "Lesson Builder",
          href: pid
            ? lessonId
              ? `/lesson-builder/${pid}/${lessonId}`
              : `/lesson-builder/${pid}`
            : "/create/experience?intent=lesson",
        }),
      );
      break;
    case "recommend_resources": {
      const hits = searchResources(
        resourceCenterRepository.listActive(),
        emptyFilters({
          query: `${context.subject ?? ""} ${context.grade ?? ""} ${input.utterance}`,
          projectId: pid,
          semantic: true,
        }),
      ).slice(0, 5);
      for (const hit of hits) {
        tools.push(
          tool({
            tool: "search_resources",
            label: hit.resource.name,
            href: `/resource-center/${hit.resource.id}`,
            status: "done",
            payload: { score: String(hit.score) },
          }),
        );
      }
      notes.push(
        hits.length
          ? `Am găsit ${hits.length} resurse în Resource Center.`
          : "Reindexează Resource Center pentru mai multe potriviri.",
      );
      break;
    }
    case "validate_work":
      tools.push(
        tool({
          tool: "run_validation",
          label: "Rulează validarea în builderul curent",
          href: context.workflowPath,
          status: "proposed",
        }),
      );
      if (pid && lessonId) {
        const lesson = lessonBuilderRepository.getById(lessonId);
        notes.push(
          lesson?.validation
            ? `Ultima validare lecție: scor ${lesson.validation.score}`
            : "Lecția nu are încă un raport de validare.",
        );
      }
      break;
    case "improve_document":
      if (context.documentKind && pid && context.documentId) {
        const hrefMap: Record<string, string> = {
          lesson: `/lesson-builder/${pid}/${context.documentId}`,
          assessment: `/assessment-builder/${pid}/${context.documentId}`,
          story: `/story-builder/${pid}/${context.documentId}`,
          game: `/game-builder/${pid}/${context.documentId}`,
          presentation: `/presentation-builder/${pid}/${context.documentId}`,
        };
        tools.push(
          tool({
            tool: "open_builder",
            label: `Deschide ${context.documentKind}`,
            href: hrefMap[context.documentKind] ?? context.workflowPath,
          }),
        );
      }
      break;
    default:
      if (pid) {
        tools.push(
          tool({
            tool: "navigate",
            label: "Workspace proiect",
            href: `/studio/${pid}/ai`,
          }),
        );
      }
  }

  if (pid && intent !== "recommend_resources") {
    tools.push(
      tool({
        tool: "search_resources",
        label: "Resource Center (proiect)",
        href: `/resource-center?project=${pid}`,
      }),
    );
  }

  return { tools, notes };
}

export function summarizeProjectAssets(projectId: string): string {
  const lessons = lessonBuilderRepository.listByProject(projectId).length;
  const assessments =
    assessmentBuilderRepository.listByProject(projectId).length;
  const stories = storyBuilderRepository.listByProject(projectId).length;
  return `${lessons} lecții · ${assessments} evaluări · ${stories} povești`;
}
