import type { BlueprintHistory } from './blueprint-history.js';
import { uid } from './ids.js';
import type { PreferenceManager } from './preference-manager.js';
import type { ResourceHistory } from './resource-history.js';
import type { MemoryRegistry } from './memory-registry.js';
import type {
  ExperienceRetrievalRequest,
  ExperienceRetrievalResult,
  MemoryItem,
  PersonalizationSuggestion,
  ClassProfilePayload,
  CustomTemplatePayload,
} from './types.js';

/**
 * Retrieval pipeline for starting a new Learning Experience.
 * Suggestions are optional — teacher always decides.
 */
export class RetrievalPipeline {
  constructor(
    private readonly registry: MemoryRegistry,
    private readonly preferences: PreferenceManager,
    private readonly blueprints: BlueprintHistory,
    private readonly resources: ResourceHistory,
  ) {}

  retrieve(request: ExperienceRetrievalRequest): ExperienceRetrievalResult {
    const limit = request.limit ?? 5;
    const classProfile = request.classId
      ? (this.preferences.getClassProfile(
          request.teacherId,
          request.classId,
        ) as MemoryItem<ClassProfilePayload> | undefined)
      : this.registry
          .list({
            teacherId: request.teacherId,
            domain: 'class_profiles',
            status: 'active',
          })
          .find((c) => {
            const p = c.payload as ClassProfilePayload;
            return request.grade
              ? p.grade.toLowerCase().includes(request.grade.toLowerCase())
              : true;
          }) as MemoryItem<ClassProfilePayload> | undefined;

    const teachingPreferences = this.registry.list({
      teacherId: request.teacherId,
      domain: 'teaching_preferences',
      status: 'active',
    });

    const ped = this.preferences.getPedagogicalPreferences(request.teacherId);
    const pedagogicalPreferences = ped ? [ped] : [];

    const similarBlueprints = this.blueprints.findSimilar(
      request.teacherId,
      {
        subject: request.subject,
        grade: request.grade,
        topic: request.topic,
      },
      limit,
    );

    const frequentlyUsedResources = this.resources
      .frequentlyUsed(request.teacherId, limit)
      .filter((r) => {
        if (!request.subject && !request.grade && !request.topic) return true;
        const p = r.payload;
        const blob = `${p.subject ?? ''} ${p.grade ?? ''} ${p.topic ?? ''} ${p.title}`.toLowerCase();
        return (
          (!request.subject || blob.includes(request.subject.toLowerCase())) ||
          (!request.grade || blob.includes(request.grade.toLowerCase())) ||
          (!request.topic || blob.includes(request.topic.toLowerCase()))
        );
      });

    const personalTemplates = this.registry.list({
      teacherId: request.teacherId,
      domain: 'custom_templates',
      status: 'active',
    }) as MemoryItem<CustomTemplatePayload>[];

    const knownStableFields = this.preferences.knownStableFields(
      request.teacherId,
    );

    const suggestions = this.buildSuggestions({
      classProfile,
      pedagogicalPreferences,
      similarBlueprints,
      request,
    });

    // Mark retrieved items as used (personalization reinforcement)
    for (const item of [
      classProfile,
      ...similarBlueprints.slice(0, 2),
      ...frequentlyUsedResources.slice(0, 2),
    ]) {
      if (item) this.registry.recordUse(item.id);
    }

    return {
      classProfile,
      teachingPreferences,
      pedagogicalPreferences,
      similarBlueprints,
      frequentlyUsedResources,
      personalTemplates,
      knownStableFields,
      suggestions,
    };
  }

  private buildSuggestions(input: {
    classProfile?: MemoryItem<ClassProfilePayload>;
    pedagogicalPreferences: MemoryItem[];
    similarBlueprints: MemoryItem[];
    request: ExperienceRetrievalRequest;
  }): PersonalizationSuggestion[] {
    const suggestions: PersonalizationSuggestion[] = [];

    const ped = input.pedagogicalPreferences[0];
    if (ped) {
      const prefs = ped.payload as {
        instructionalModels?: string[];
        assessmentPreferences?: string[];
      };
      if (prefs.instructionalModels?.[0] && input.request.grade) {
        suggestions.push({
          id: uid('sug'),
          message: `Last time you used ${prefs.instructionalModels[0]} with ${input.request.grade}.`,
          basedOnItemIds: [ped.id],
          optional: true,
          teacherDecides: true,
        });
      }
      if (prefs.assessmentPreferences?.[0]) {
        suggestions.push({
          id: uid('sug'),
          message: `You usually prefer ${prefs.assessmentPreferences[0]}.`,
          basedOnItemIds: [ped.id],
          optional: true,
          teacherDecides: true,
        });
      }
    }

    const classProfile = input.classProfile;
    if (classProfile?.payload.strengths?.length) {
      suggestions.push({
        id: uid('sug'),
        message: `This class responds well to ${classProfile.payload.strengths[0]}.`,
        basedOnItemIds: [classProfile.id],
        optional: true,
        teacherDecides: true,
      });
    }

    if (input.similarBlueprints[0]) {
      suggestions.push({
        id: uid('sug'),
        message: `You have a similar Blueprint: “${input.similarBlueprints[0].title}”.`,
        basedOnItemIds: [input.similarBlueprints[0].id],
        optional: true,
        teacherDecides: true,
      });
    }

    return suggestions;
  }
}
