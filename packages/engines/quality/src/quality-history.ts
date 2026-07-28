import type { QualityReport } from './types.js';

/**
 * QualityHistory — versioned quality reports.
 */
export class QualityHistory {
  private readonly bySubject = new Map<string, QualityReport[]>();

  private key(subjectType: string, subjectId: string): string {
    return `${subjectType}::${subjectId}`;
  }

  append(report: QualityReport): void {
    const key = this.key(report.subjectType, report.subjectId);
    const list = this.bySubject.get(key) ?? [];
    list.unshift(structuredClone(report));
    this.bySubject.set(key, list);
  }

  latest(subjectType: string, subjectId: string): QualityReport | undefined {
    const list = this.bySubject.get(this.key(subjectType, subjectId));
    return list?.[0] ? structuredClone(list[0]) : undefined;
  }

  list(subjectType: string, subjectId: string): QualityReport[] {
    return (this.bySubject.get(this.key(subjectType, subjectId)) ?? []).map(
      (r) => structuredClone(r),
    );
  }

  forTeacher(teacherId: string): QualityReport[] {
    const all: QualityReport[] = [];
    for (const list of this.bySubject.values()) {
      for (const report of list) {
        if (report.teacherId === teacherId) all.push(structuredClone(report));
      }
    }
    return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  nextVersion(subjectType: string, subjectId: string): number {
    const latest = this.latest(subjectType, subjectId);
    return (latest?.version ?? 0) + 1;
  }
}
