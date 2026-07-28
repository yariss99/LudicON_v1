import { buildPedagogicalDna } from "../engines/dna/buildPedagogicalDna";
import {
  downloadTextFile,
  exportDnaAsJson,
  exportDnaAsMarkdown,
} from "../engines/dna/exportProfile";
import { teacherProfile } from "../data/workspaceData";
import { classroomService } from "./classroomService";
import type { PedagogicalDnaProfile } from "../types/pedagogicalDna";

export class PedagogicalDnaService {
  getProfile(): PedagogicalDnaProfile {
    return buildPedagogicalDna({
      teacherFirstName: teacherProfile.firstName,
      versions: classroomService.listVersions(),
      feedback: classroomService.listFeedback(),
    });
  }

  exportMarkdown(profile?: PedagogicalDnaProfile): void {
    const dna = profile ?? this.getProfile();
    const slug = dna.teacherFirstName.toLowerCase();
    downloadTextFile(
      `prima-pedagogical-profile-${slug}.md`,
      exportDnaAsMarkdown(dna),
      "text/markdown",
    );
  }

  exportJson(profile?: PedagogicalDnaProfile): void {
    const dna = profile ?? this.getProfile();
    const slug = dna.teacherFirstName.toLowerCase();
    downloadTextFile(
      `prima-pedagogical-profile-${slug}.json`,
      exportDnaAsJson(dna),
      "application/json",
    );
  }
}

export const pedagogicalDnaService = new PedagogicalDnaService();
