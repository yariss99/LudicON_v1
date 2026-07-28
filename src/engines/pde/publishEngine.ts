import { getPublicationProfile } from "./profiles";
import {
  evaluatePublicationReadiness as evaluateReadiness,
} from "./readiness";
import { renderPublicationPackage } from "./render";
import { publicationStore } from "./store";
import type {
  DeliveryArtifact,
  PublicationRecord,
  PublishRequest,
  PublishResult,
} from "./types";

export const PDE_SCHEMA_VERSION = "1.0.0";

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function buildArtifacts(
  request: PublishRequest,
  publicationId: string,
  filename: string,
): DeliveryArtifact[] {
  const artifacts: DeliveryArtifact[] = [
    {
      id: uid("art"),
      kind: "package",
      label: `Pachet ${request.format.toUpperCase()}`,
      locator: `pde://publication/${publicationId}/${filename}`,
    },
  ];

  if (
    request.destination === "digital_classroom" ||
    request.destination === "student_device" ||
    request.destination === "learning_platform"
  ) {
    artifacts.push({
      id: uid("art"),
      kind: "link",
      label: "Link securizat lecție",
      locator: `https://prima.local/d/${publicationId}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    });
    artifacts.push({
      id: uid("art"),
      kind: "qr",
      label: "Cod QR",
      locator: `https://prima.local/qr/${publicationId}`,
    });
    artifacts.push({
      id: uid("art"),
      kind: "access_code",
      label: "Cod elev",
      locator: publicationId.slice(-6).toUpperCase(),
    });
  }

  if (request.channel === "interactive_lesson") {
    artifacts.push({
      id: uid("art"),
      kind: "embed",
      label: "Incorporare interactivă",
      locator: `https://prima.local/embed/${publicationId}`,
    });
  }

  return artifacts;
}

/**
 * Publish a pedagogical object version to a destination.
 * Requires previewCompleted and passing readiness (PDE-I03 / PDE-I04).
 */
export function publish(
  request: PublishRequest,
  bodyMarkdown = "",
): PublishResult {
  const profile = request.profileId
    ? getPublicationProfile(request.profileId)
    : undefined;

  const normalized: PublishRequest = {
    ...request,
    destination: profile?.destination ?? request.destination,
    channel: profile?.channel ?? request.channel,
    format: profile?.format ?? request.format,
    accessibility: {
      ...profile?.accessibility,
      ...request.accessibility,
    },
  };

  const readiness = evaluateReadiness(normalized);
  if (!readiness.ok) {
    return {
      ok: false,
      readiness,
      reason: "Publicarea este blocată până rezolvi verificările esențiale.",
    };
  }

  const publicationId = uid("pub");
  const rendered = renderPublicationPackage(normalized, bodyMarkdown);
  const record: PublicationRecord = {
    publicationId,
    schemaVersion: PDE_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    status: "published",
    destination: normalized.destination,
    channel: normalized.channel,
    format: normalized.format,
    objectId: normalized.objectId,
    objectVersionId: normalized.objectVersionId,
    objectTitle: normalized.objectTitle,
    lessonProjectId: normalized.lessonProjectId,
    authorId: normalized.authorId,
    authorName: normalized.authorName,
    profileId: normalized.profileId,
    previewKind: normalized.previewKind,
    readiness,
    artifacts: buildArtifacts(normalized, publicationId, rendered.filename),
    accessibility: normalized.accessibility ?? {},
  };

  publicationStore.save(record);
  return { ok: true, publication: record };
}

/** Reproduce a previous publication from its recorded object version identity. */
export function reproducePublication(
  publicationId: string,
  author: { id: string; name: string },
  bodyMarkdown = "",
): PublishResult {
  const previous = publicationStore.get(publicationId);
  if (!previous) {
    return {
      ok: false,
      readiness: {
        ok: false,
        checkedAt: new Date().toISOString(),
        categories: {
          pedagogical_quality: 0,
          technical_integrity: 0,
          accessibility: 0,
          curriculum_alignment: 0,
          completeness: 0,
          publication_readiness: 0,
        },
        findings: [
          {
            id: "pde_missing_pub",
            category: "technical_integrity",
            severity: "blocking",
            title: "Publicarea nu a fost găsită",
            explanation: "Nu putem reproduce o publicare inexistentă.",
            recommendation: "Alege o publicare din istoric.",
          },
        ],
      },
      reason: "Publicarea nu a fost găsită.",
    };
  }

  const result = publish(
    {
      objectId: previous.objectId,
      objectVersionId: previous.objectVersionId,
      objectTitle: previous.objectTitle,
      lessonProjectId: previous.lessonProjectId,
      destination: previous.destination,
      channel: previous.channel,
      format: previous.format,
      profileId: previous.profileId,
      previewKind: previous.previewKind,
      previewCompleted: true,
      authorId: author.id,
      authorName: author.name,
      accessibility: previous.accessibility,
      hasObjectives: true,
      hasAssessment: true,
      hasBrokenReferences: false,
      hasUnsavedChanges: false,
    },
    bodyMarkdown,
  );

  if (result.ok) {
    const reproduced: PublicationRecord = {
      ...result.publication,
      reproducedFromPublicationId: previous.publicationId,
    };
    publicationStore.save(reproduced);
    return { ok: true, publication: reproduced };
  }
  return result;
}

export function listPublications(): PublicationRecord[] {
  return publicationStore.list();
}

export function getPublication(
  publicationId: string,
): PublicationRecord | undefined {
  return publicationStore.get(publicationId);
}

export const publishingDeliveryEngine = {
  publish,
  reproducePublication,
  listPublications,
  getPublication,
  evaluatePublicationReadiness: evaluateReadiness,
};
