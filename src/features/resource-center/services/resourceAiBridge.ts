import type { Project } from "../../../types/project";
import { buildProjectCoreContext } from "../../project-workspace/services/projectCoreBridge";
import { createId } from "../../../utils/id";
import type {
  KnowledgeResource,
  ResourceAiActionId,
  ResourceSearchHit,
} from "../types";
import { detectDuplicates, findSimilar, searchResources, emptyFilters } from "./resourceSearch";
import { resourceCenterRepository } from "./resourceCenterRepository";

export type ResourceCorePromptPackage = {
  readonly system: string;
  readonly user: string;
  readonly action: ResourceAiActionId;
  readonly projectId?: string;
  readonly engines: readonly string[];
};

export type ResourceAiResult = {
  readonly prompt: ResourceCorePromptPackage;
  readonly message: string;
  readonly suggestions: readonly ResourceSearchHit[];
  readonly updated?: KnowledgeResource;
  readonly missingTypes?: readonly string[];
  readonly coverage?: readonly { ref: string; count: number }[];
  readonly duplicates?: readonly {
    a: KnowledgeResource;
    b: KnowledgeResource;
    score: number;
  }[];
};

export function buildResourcePromptPackage(input: {
  action: ResourceAiActionId;
  project?: Project;
  resource?: KnowledgeResource;
  query?: string;
}): ResourceCorePromptPackage {
  const core = input.project
    ? buildProjectCoreContext({
        project: input.project,
        activeTab: "resources",
        activeArtifactId: input.resource?.sourceBuilderId,
        intent: `Resource Center · ${input.action}`,
      })
    : null;

  return {
    system:
      "PRIMA Intelligent Resource Center — knowledge repository, not a file manager. Index, relate, recommend, reuse.",
    user: [
      core
        ? `Project: ${core.projectTitle} · ${core.subject} · ${core.grade}`
        : "Scope: all libraries",
      input.resource
        ? `Focus resource: ${input.resource.name} (${input.resource.assetType})`
        : null,
      input.query ? `Query: ${input.query}` : null,
      `Action: ${input.action}`,
    ]
      .filter(Boolean)
      .join("\n"),
    action: input.action,
    projectId: input.project?.id,
    engines: [
      "KnowledgeEngine",
      "ContextEngine",
      "PromptBuilder",
      "AiOrchestrator",
      "MemoryEngine",
      "ValidationEngine",
      "Runtime",
    ],
  };
}

const EXPECTED_TYPES = [
  "lesson",
  "worksheet",
  "assessment",
  "story",
  "game",
  "presentation",
] as const;

export function applyResourceAiAction(input: {
  action: ResourceAiActionId;
  resources: readonly KnowledgeResource[];
  project?: Project;
  resource?: KnowledgeResource;
  query?: string;
}): ResourceAiResult {
  const prompt = buildResourcePromptPackage(input);
  const scoped = input.project
    ? input.resources.filter((r) => r.projectId === input.project!.id)
    : input.resources;

  switch (input.action) {
    case "suggest_existing": {
      const hits = searchResources(
        scoped,
        emptyFilters({
          query:
            input.query ||
            `${input.project?.subject ?? ""} ${input.project?.grade ?? ""}`,
          semantic: true,
          naturalLanguage: true,
          projectId: input.project?.id,
        }),
      ).slice(0, 8);
      return {
        prompt,
        message: `Am găsit ${hits.length} resurse potrivite pentru reutilizare.`,
        suggestions: hits,
      };
    }
    case "recommend_similar": {
      if (!input.resource) {
        return {
          prompt,
          message: "Selectează o resursă pentru similaritate.",
          suggestions: [],
        };
      }
      const hits = findSimilar(input.resource, input.resources);
      return {
        prompt,
        message: `${hits.length} resurse similare cu „${input.resource.name}”.`,
        suggestions: hits,
      };
    }
    case "detect_missing": {
      const present = new Set(scoped.map((r) => r.assetType));
      const missing = EXPECTED_TYPES.filter((t) => !present.has(t));
      return {
        prompt,
        message:
          missing.length === 0
            ? "Proiectul are acoperire pe tipurile de bază."
            : `Lipsesc: ${missing.join(", ")}.`,
        suggestions: [],
        missingTypes: missing,
      };
    }
    case "suggest_reuse": {
      const unusedRich = scoped
        .filter((r) => r.usage.reuseCount === 0 && r.usage.openCount > 0)
        .slice(0, 6)
        .map((r) => ({
          resource: r,
          score: 0.6,
          reasons: ["deschisă, nereutilizată"] as const,
        }));
      const popular = [...scoped]
        .sort((a, b) => b.usage.reuseCount - a.usage.reuseCount)
        .slice(0, 4)
        .map((r) => ({
          resource: r,
          score: 0.75,
          reasons: ["deja reutilizată cu succes"] as const,
        }));
      return {
        prompt,
        message: "Oportunități de reuse identificate.",
        suggestions: [...popular, ...unusedRich],
      };
    }
    case "merge_similar": {
      const duplicates = detectDuplicates(scoped);
      if (duplicates[0]) {
        const { a, b } = duplicates[0];
        const updatedA = resourceCenterRepository.patch(
          a.id,
          {
            ai: {
              ...a.ai,
              duplicateOfId: b.id,
              similarityClusterId: createId("cluster"),
            },
          },
          { actor: "ai", note: "mark-duplicate" },
        );
        return {
          prompt,
          message: `Cluster similaritate: „${a.name}” ≈ „${b.name}”.`,
          suggestions: [
            { resource: updatedA, score: duplicates[0].score, reasons: ["duplicat"] },
            { resource: b, score: duplicates[0].score, reasons: ["duplicat"] },
          ],
          duplicates,
          updated: updatedA,
        };
      }
      return {
        prompt,
        message: "Nu am detectat duplicate puternice.",
        suggestions: [],
        duplicates: [],
      };
    }
    case "recommend_improvements": {
      if (!input.resource) {
        return {
          prompt,
          message: "Selectează o resursă.",
          suggestions: [],
        };
      }
      const tips: string[] = [];
      if (!input.resource.description) tips.push("Adaugă descriere");
      if (input.resource.tags.length < 2) tips.push("Adaugă tag-uri");
      if (!input.resource.competencies.length) tips.push("Mapare competențe");
      if (!input.resource.curriculumRefs.length)
        tips.push("Referințe curriculare");
      if (!input.resource.ai.summary) tips.push("Rezumat AI");
      return {
        prompt,
        message:
          tips.length > 0
            ? `Îmbunătățiri: ${tips.join(" · ")}`
            : "Metadatele arată bine.",
        suggestions: [{ resource: input.resource, score: 1, reasons: tips }],
      };
    }
    case "generate_metadata":
    case "auto_summarize":
    case "extract_keywords": {
      if (!input.resource) {
        return {
          prompt,
          message: "Selectează o resursă.",
          suggestions: [],
        };
      }
      const keywords = Array.from(
        new Set([
          ...input.resource.ai.keywords,
          ...input.resource.name.toLowerCase().split(/\s+/).filter((t) => t.length > 3),
          input.resource.subject.toLowerCase(),
          input.resource.assetType,
        ]),
      ).slice(0, 12);
      const summary =
        input.resource.ai.summary ||
        `${input.resource.assetType}: ${input.resource.name} pentru ${input.resource.grade} · ${input.resource.subject}.`;
      const updated = resourceCenterRepository.save(
        {
          ...input.resource,
          description: input.resource.description || summary,
          tags: Array.from(
            new Set([...input.resource.tags, ...keywords.slice(0, 5)]),
          ),
          ai: {
            ...input.resource.ai,
            summary,
            keywords,
            suggestedTags: keywords.slice(0, 8),
            embeddingsHint: keywords.join(" "),
            lastAiAction: input.action,
          },
        },
        { actor: "ai", note: `ai:${input.action}` },
      );
      return {
        prompt,
        message: "Metadate AI actualizate.",
        suggestions: [{ resource: updated, score: 1, reasons: ["metadata"] }],
        updated,
      };
    }
    case "identify_curriculum_coverage": {
      const map = new Map<string, number>();
      for (const r of scoped) {
        for (const ref of r.curriculumRefs) {
          map.set(ref, (map.get(ref) ?? 0) + 1);
        }
        if (!r.curriculumRefs.length) {
          map.set("(fără referință)", (map.get("(fără referință)") ?? 0) + 1);
        }
      }
      const coverage = Array.from(map.entries())
        .map(([ref, count]) => ({ ref, count }))
        .sort((a, b) => b.count - a.count);
      return {
        prompt,
        message: `Acoperire: ${coverage.length} referințe distincte.`,
        suggestions: [],
        coverage,
      };
    }
    default:
      return { prompt, message: "Acțiune necunoscută.", suggestions: [] };
  }
}
