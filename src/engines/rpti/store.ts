import type {
  AchievementMilestone,
  GrowthProfile,
  PortfolioEntry,
  ReflectionRecord,
} from "./types";

const KEY = {
  reflections: "prima.rpti.reflections",
  profile: "prima.rpti.growth",
  portfolio: "prima.rpti.portfolio",
  milestones: "prima.rpti.milestones",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

let memoryReflections: ReflectionRecord[] = [];
let memoryPortfolio: PortfolioEntry[] = [];
let memoryProfile: GrowthProfile | null = null;
let memoryMilestones: AchievementMilestone[] = [];

export const rptiStore = {
  listReflections(): ReflectionRecord[] {
    const disk = readJson<ReflectionRecord[]>(KEY.reflections, memoryReflections);
    memoryReflections = disk;
    return [...disk].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  getReflection(id: string): ReflectionRecord | undefined {
    return this.listReflections().find((r) => r.id === id);
  },

  saveReflection(record: ReflectionRecord): void {
    const all = this.listReflections().filter((r) => r.id !== record.id);
    all.unshift(record);
    memoryReflections = all.slice(0, 200);
    writeJson(KEY.reflections, memoryReflections);
  },

  getProfile(teacherId: string): GrowthProfile {
    const disk = readJson<GrowthProfile | null>(KEY.profile, memoryProfile);
    if (disk && disk.teacherId === teacherId) {
      memoryProfile = disk;
      return disk;
    }
    const fresh: GrowthProfile = {
      teacherId,
      updatedAt: new Date().toISOString(),
      strategiesUsed: [],
      assessmentMethods: [],
      differentiationFrequency: 0,
      digitalIntegrationFrequency: 0,
      reflectionCount: 0,
      completedLessonCount: 0,
      professionalGoals: [],
      evaluationForbidden: true,
    };
    memoryProfile = fresh;
    writeJson(KEY.profile, fresh);
    return fresh;
  },

  saveProfile(profile: GrowthProfile): void {
    memoryProfile = { ...profile, evaluationForbidden: true };
    writeJson(KEY.profile, memoryProfile);
  },

  listPortfolio(): PortfolioEntry[] {
    const disk = readJson<PortfolioEntry[]>(KEY.portfolio, memoryPortfolio);
    memoryPortfolio = disk;
    return [...disk].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  savePortfolioEntry(entry: PortfolioEntry): void {
    const all = this.listPortfolio().filter((e) => e.id !== entry.id);
    all.unshift(entry);
    memoryPortfolio = all.slice(0, 300);
    writeJson(KEY.portfolio, memoryPortfolio);
  },

  listMilestones(): AchievementMilestone[] {
    const disk = readJson<AchievementMilestone[]>(
      KEY.milestones,
      memoryMilestones,
    );
    memoryMilestones = disk;
    return [...disk];
  },

  saveMilestones(milestones: AchievementMilestone[]): void {
    memoryMilestones = milestones;
    writeJson(KEY.milestones, milestones);
  },

  clear(): void {
    memoryReflections = [];
    memoryPortfolio = [];
    memoryProfile = null;
    memoryMilestones = [];
    if (typeof localStorage === "undefined") return;
    Object.values(KEY).forEach((k) => localStorage.removeItem(k));
  },
};
