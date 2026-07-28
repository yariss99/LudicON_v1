import { newId, nowIso } from './ids.js';
import type { ValidationAuditEntry } from './types.js';

export class ValidationAuditService {
  private readonly entries: ValidationAuditEntry[] = [];

  constructor(private readonly clock: () => Date = () => new Date()) {}

  record(
    entry: Omit<ValidationAuditEntry, 'entryId' | 'timestamp'> & {
      entryId?: string;
      timestamp?: string;
    },
  ): ValidationAuditEntry {
    const full: ValidationAuditEntry = {
      entryId: entry.entryId ?? newId('vaud'),
      timestamp: entry.timestamp ?? nowIso(this.clock),
      workflowId: entry.workflowId,
      teacherId: entry.teacherId,
      artifactId: entry.artifactId,
      artifactVersion: entry.artifactVersion,
      validatorId: entry.validatorId,
      result: entry.result,
      severity: entry.severity,
      message: entry.message,
      reportId: entry.reportId,
    };
    this.entries.push(full);
    return full;
  }

  list(): readonly ValidationAuditEntry[] {
    return Object.freeze([...this.entries]);
  }

  forArtifact(artifactId: string): readonly ValidationAuditEntry[] {
    return Object.freeze(
      this.entries.filter((e) => e.artifactId === artifactId),
    );
  }

  forWorkflow(workflowId: string): readonly ValidationAuditEntry[] {
    return Object.freeze(
      this.entries.filter((e) => e.workflowId === workflowId),
    );
  }
}
