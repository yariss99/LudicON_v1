import type { KnowledgeRegistry } from './knowledge-registry.js';
import type { KnowledgeGraph } from './knowledge-graph.js';
import type { SemanticSearch } from './semantic-search.js';
import type {
  KnowledgeSearchHit,
  RecommendationRequest,
  RecommendationResult,
} from './types.js';

/**
 * RecommendationService — explainable pedagogical suggestions from the graph.
 * Never generates classroom content; only returns knowledge entities.
 */
export class RecommendationService {
  constructor(
    private readonly registry: KnowledgeRegistry,
    private readonly graph: KnowledgeGraph,
    private readonly search: SemanticSearch,
  ) {}

  recommend(request: RecommendationRequest): RecommendationResult {
    const limit = request.limit ?? 5;
    const anchorId = request.competencyId ?? request.objectiveId;
    const anchor = anchorId ? this.registry.get(anchorId) : undefined;

    const contextText = [
      request.topic,
      request.subject,
      request.grade,
      anchor?.title,
    ]
      .filter(Boolean)
      .join(' ');

    const activities = this.pick(
      'learning_activities',
      request,
      contextText,
      anchorId,
      'recommends',
      limit,
    );
    const methods = this.pick(
      'pedagogical_methods',
      request,
      contextText,
      anchorId,
      'uses',
      limit,
    );
    const resources = this.pick(
      'educational_resources',
      request,
      contextText,
      anchorId,
      'enriches',
      limit,
    );
    const assessments = this.mergeHits(
      this.pick(
        'assessment_strategies',
        request,
        contextText,
        anchorId,
        'evaluates',
        limit,
        'both',
      ),
      this.pick(
        'assessment_instruments',
        request,
        contextText,
        anchorId,
        'evaluates',
        limit,
        'both',
      ),
      limit,
    );
    const tools = this.pick(
      'digital_tools',
      request,
      contextText,
      anchorId,
      'supports',
      limit,
    );
    const differentiation = this.pick(
      'differentiation_strategies',
      request,
      contextText,
      anchorId,
      'supports',
      limit,
    );

    const all = [
      ...activities,
      ...methods,
      ...resources,
      ...assessments,
      ...tools,
      ...differentiation,
    ];
    const confidenceScore =
      all.length === 0
        ? 0
        : Math.min(
            1,
            all.reduce((s, h) => s + h.score, 0) / (all.length * 12),
          );

    const explanation = [
      anchor
        ? `Recommendations anchored on “${anchor.title}” (${anchor.category}).`
        : 'Recommendations from curriculum context search.',
      request.grade || request.subject
        ? `Filtered for ${[request.subject, request.grade].filter(Boolean).join(' · ')}.`
        : null,
      `Returned ${all.length} knowledge entities with confidence ${confidenceScore.toFixed(2)}.`,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      recommendedActivities: activities,
      recommendedMethods: methods,
      suggestedResources: resources,
      alternativeAssessments: assessments,
      digitalToolSuggestions: tools,
      differentiationOptions: differentiation,
      confidenceScore: Number(confidenceScore.toFixed(2)),
      explanation,
    };
  }

  private pick(
    category: KnowledgeSearchHit['entity']['category'],
    request: RecommendationRequest,
    contextText: string,
    anchorId: string | undefined,
    relationHint: 'recommends' | 'uses' | 'enriches' | 'evaluates' | 'supports',
    limit: number,
    direction: 'out' | 'in' | 'both' = 'both',
  ): KnowledgeSearchHit[] {
    const fromGraph: KnowledgeSearchHit[] = [];
    if (anchorId) {
      const typed = this.graph.traverse(anchorId, {
        direction,
        relationType: relationHint,
        maxDepth: 3,
      });
      const neighborhood = this.graph.traverse(anchorId, {
        direction: 'both',
        maxDepth: 3,
      });
      for (const traversal of [typed, neighborhood]) {
        if ('error' in traversal) continue;
        for (const node of traversal.nodes) {
          if (node.id === anchorId) continue;
          if (node.category !== category) continue;
          fromGraph.push({
            entity: node,
            score: traversal === typed ? 14 : 11,
            explanation:
              traversal === typed
                ? `Graph ${relationHint} from anchor ${anchorId}`
                : `Graph neighborhood of anchor ${anchorId}`,
          });
        }
      }
    }

    const fromSearch = this.search.search({
      text: contextText,
      mode: 'recommendation',
      category,
      grade: request.grade,
      subject: request.subject,
      limit,
    });

    return this.mergeHits(fromGraph, fromSearch, limit);
  }

  private mergeHits(
    a: KnowledgeSearchHit[],
    b: KnowledgeSearchHit[],
    limit: number,
  ): KnowledgeSearchHit[] {
    const merged = new Map<string, KnowledgeSearchHit>();
    for (const hit of [...a, ...b]) {
      const prev = merged.get(hit.entity.id);
      if (!prev || hit.score > prev.score) merged.set(hit.entity.id, hit);
    }
    return [...merged.values()]
      .sort((x, y) => y.score - x.score)
      .slice(0, limit);
  }
}
