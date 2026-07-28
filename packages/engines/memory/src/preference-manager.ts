import type { LongTermMemoryManager } from './long-term-memory-manager.js';
import type { MemoryRegistry } from './memory-registry.js';
import type {
  MemoryItem,
  MemorySource,
  PedagogicalPreferencesPayload,
  StableProfileField,
  TeacherProfilePayload,
} from './types.js';
import { STABLE_PROFILE_FIELDS } from './types.js';

const PROFILE_TITLE = 'Teacher Profile';
const PED_TITLE = 'Pedagogical Preferences';

/**
 * PreferenceManager — teacher profile + pedagogical preferences.
 * Never ask for information already known.
 */
export class PreferenceManager {
  constructor(
    private readonly registry: MemoryRegistry,
    private readonly longTerm: LongTermMemoryManager,
  ) {}

  getTeacherProfile(teacherId: string): MemoryItem<TeacherProfilePayload> | undefined {
    return this.registry
      .list({
        teacherId,
        domain: 'teacher_profile',
        tier: 'long_term',
        status: 'active',
      })[0] as MemoryItem<TeacherProfilePayload> | undefined;
  }

  getPedagogicalPreferences(
    teacherId: string,
  ): MemoryItem<PedagogicalPreferencesPayload> | undefined {
    return this.registry
      .list({
        teacherId,
        domain: 'pedagogical_preferences',
        tier: 'long_term',
        status: 'active',
      })[0] as MemoryItem<PedagogicalPreferencesPayload> | undefined;
  }

  knownStableFields(teacherId: string): StableProfileField[] {
    const profile = this.getTeacherProfile(teacherId);
    if (!profile) return [];
    const payload = profile.payload;
    return STABLE_PROFILE_FIELDS.filter((field) => {
      const value = payload[field];
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  }

  /** True when PRIMA must not re-ask for this stable field */
  isKnown(teacherId: string, field: StableProfileField): boolean {
    return this.knownStableFields(teacherId).includes(field);
  }

  upsertTeacherProfile(
    teacherId: string,
    payload: TeacherProfilePayload,
    source: MemorySource,
    confidence = source.kind === 'teacher_explicit' ||
      source.kind === 'teacher_correction'
      ? 1
      : 0.55,
  ): MemoryItem<TeacherProfilePayload> | { error: string } {
    const existing = this.getTeacherProfile(teacherId);
    if (existing) {
      const isCorrection = source.kind === 'teacher_correction';
      const result = isCorrection
        ? this.registry.correct(existing.id, payload as Record<string, unknown>, source)
        : this.registry.update(existing.id, {
            payload: payload as Record<string, unknown>,
            source,
            confidence,
          });
      return result as MemoryItem<TeacherProfilePayload> | { error: string };
    }
    return this.longTerm.store({
      teacherId,
      domain: 'teacher_profile',
      title: PROFILE_TITLE,
      payload: payload as Record<string, unknown>,
      source,
      confidence,
      canonicalKey: `profile::${teacherId}`,
    }) as MemoryItem<TeacherProfilePayload> | { error: string };
  }

  upsertPedagogicalPreferences(
    teacherId: string,
    payload: PedagogicalPreferencesPayload,
    source: MemorySource,
    confidence = 1,
  ): MemoryItem<PedagogicalPreferencesPayload> | { error: string } {
    const existing = this.getPedagogicalPreferences(teacherId);
    if (existing) {
      const result =
        source.kind === 'teacher_correction'
          ? this.registry.correct(
              existing.id,
              payload as Record<string, unknown>,
              source,
            )
          : this.registry.update(existing.id, {
              payload: payload as Record<string, unknown>,
              source,
              confidence,
            });
      return result as
        | MemoryItem<PedagogicalPreferencesPayload>
        | { error: string };
    }
    return this.longTerm.store({
      teacherId,
      domain: 'pedagogical_preferences',
      title: PED_TITLE,
      payload: payload as Record<string, unknown>,
      source,
      confidence,
      canonicalKey: `pedprefs::${teacherId}`,
    }) as MemoryItem<PedagogicalPreferencesPayload> | { error: string };
  }

  upsertClassProfile(
    teacherId: string,
    payload: {
      classId: string;
      grade: string;
      className: string;
      numberOfStudents?: number;
      learningPace?: string;
      strengths?: string[];
      challenges?: string[];
      specialNotes?: string;
      differentiationNeeds?: string[];
    },
    source: MemorySource,
  ): MemoryItem | { error: string } {
    const existing = this.registry
      .list({
        teacherId,
        domain: 'class_profiles',
        status: 'active',
      })
      .find((i) => (i.payload as { classId?: string }).classId === payload.classId);

    if (existing) {
      return this.registry.update(existing.id, {
        title: `${payload.className} (${payload.grade})`,
        payload: payload as unknown as Record<string, unknown>,
        source,
        confidence: 1,
      });
    }

    return this.longTerm.store({
      teacherId,
      domain: 'class_profiles',
      title: `${payload.className} (${payload.grade})`,
      payload: payload as unknown as Record<string, unknown>,
      source,
      confidence: 1,
      canonicalKey: `class::${teacherId}::${payload.classId}`,
    });
  }

  getClassProfile(teacherId: string, classId: string): MemoryItem | undefined {
    return this.registry
      .list({
        teacherId,
        domain: 'class_profiles',
        status: 'active',
      })
      .find((i) => (i.payload as { classId?: string }).classId === classId);
  }
}
