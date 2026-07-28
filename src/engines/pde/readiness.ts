import { getPublicationProfile } from "./profiles";
import type {
  PublishRequest,
  ReadinessCategoryId,
  ReadinessFinding,
  ReadinessReport,
} from "./types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Smart publishing gate — blocking findings prevent publish.
 */
export function evaluatePublicationReadiness(
  request: PublishRequest,
): ReadinessReport {
  const findings: ReadinessFinding[] = [];
  const profile = request.profileId
    ? getPublicationProfile(request.profileId)
    : undefined;

  if (!request.previewCompleted) {
    findings.push({
      id: "pde_preview",
      category: "publication_readiness",
      severity: "blocking",
      title: "Previzualizarea este obligatorie",
      explanation:
        "Înainte de publicare, verifică cum arată materialul pentru elevi sau la print.",
      recommendation: "Deschide o previzualizare, apoi publică.",
    });
  }

  if (request.hasUnsavedChanges) {
    findings.push({
      id: "pde_unsaved",
      category: "technical_integrity",
      severity: "blocking",
      title: "Există modificări nesalvate",
      explanation:
        "Publicarea trebuie să folosească o versiune stabilă a materialului.",
      recommendation: "Așteaptă salvarea automată, apoi încearcă din nou.",
    });
  }

  if (request.hasBrokenReferences) {
    findings.push({
      id: "pde_refs",
      category: "technical_integrity",
      severity: "blocking",
      title: "Referințe incomplete",
      explanation: "Unele blocuri sau resurse pointează către elemente lipsă.",
      recommendation: "Repară referințele din editor înainte de publicare.",
    });
  }

  const requireObjectives =
    profile?.requireObjectives ?? request.destination !== "teacher_archive";
  if (requireObjectives && request.hasObjectives === false) {
    findings.push({
      id: "pde_objectives",
      category: "curriculum_alignment",
      severity: "blocking",
      title: "Lipsește legătura cu obiectivele",
      explanation:
        "Materialul publicat ar trebui să rămână conectat de obiectivele lecției.",
      recommendation: "Leagă cel puțin un obiectiv în editor.",
    });
  }

  const requireAssessment = profile?.requireAssessment ?? false;
  if (requireAssessment && request.hasAssessment === false) {
    findings.push({
      id: "pde_assessment",
      category: "completeness",
      severity: "blocking",
      title: "Evaluarea este incompletă pentru acest profil",
      explanation: `Profilul „${profile?.nameRo ?? "ales"}” cere dovezi de evaluare.`,
      recommendation: "Completează evaluarea sau alege alt profil de publicare.",
    });
  }

  if (!request.objectTitle?.trim()) {
    findings.push({
      id: "pde_title",
      category: "completeness",
      severity: "blocking",
      title: "Titlul materialului lipsește",
      explanation: "Fără titlu, publicarea nu poate fi organizată în arhivă.",
      recommendation: "Adaugă un titlu clar.",
    });
  }

  const requireAlt =
    request.accessibility?.requireAltText ??
    profile?.accessibility.requireAltText ??
    false;
  if (requireAlt && request.missingAltText) {
    findings.push({
      id: "pde_alt",
      category: "accessibility",
      severity: "blocking",
      title: "Text alternativ lipsă",
      explanation:
        "Imaginile fără descriere nu sunt accesibile pentru toți elevii.",
      recommendation: "Completează textele alternative sau dezactivează cerința.",
    });
  } else if (request.missingAltText) {
    findings.push({
      id: "pde_alt_warn",
      category: "accessibility",
      severity: "warning",
      title: "Verifică accesibilitatea imaginilor",
      explanation: "Unele imagini ar putea să nu aibă text alternativ.",
      recommendation: "Adaugă descrieri scurte pentru fiecare imagine.",
    });
  }

  if (
    request.estimatedMinutes != null &&
    request.availableMinutes != null &&
    request.estimatedMinutes > request.availableMinutes + 5
  ) {
    findings.push({
      id: "pde_time",
      category: "pedagogical_quality",
      severity: "warning",
      title: "Durata estimată depășește timpul lecției",
      explanation: `Estimare ${request.estimatedMinutes} min vs. ${request.availableMinutes} min disponibile.`,
      recommendation: "Ajustează activitățile sau publică varianta scurtată.",
    });
  }

  if (request.pieOverall != null && request.pieOverall < 55) {
    findings.push({
      id: "pde_pie",
      category: "pedagogical_quality",
      severity: "warning",
      title: "Calitatea pedagogică poate fi îmbunătățită",
      explanation:
        "PRIMA a detectat câteva zone fragile. Poți publica în continuare.",
      recommendation: "Citește recomandările PRIMA din editor.",
    });
  }

  if (request.format === "scorm" || request.format === "ims_cc") {
    findings.push({
      id: "pde_pkg_future",
      category: "technical_integrity",
      severity: "warning",
      title: "Pachetul LMS este în varianta pregătitoare",
      explanation:
        "Exportul SCORM / IMS CC este disponibil ca structură JSON de tranziție.",
      recommendation: "Folosește HTML sau PDF pentru livrarea de zi cu zi.",
    });
  }

  const categories = scoreCategories(findings, request.pieOverall);
  const blocking = findings.some((f) => f.severity === "blocking");

  return {
    ok: !blocking,
    checkedAt: new Date().toISOString(),
    categories,
    findings,
    pieOverall: request.pieOverall,
  };
}

function scoreCategories(
  findings: ReadinessFinding[],
  pieOverall?: number,
): Record<ReadinessCategoryId, number> {
  const base: Record<ReadinessCategoryId, number> = {
    pedagogical_quality: pieOverall ?? 80,
    technical_integrity: 90,
    accessibility: 85,
    curriculum_alignment: 85,
    completeness: 85,
    publication_readiness: 90,
  };

  for (const finding of findings) {
    const penalty = finding.severity === "blocking" ? 40 : finding.severity === "warning" ? 15 : 5;
    base[finding.category] = clamp(base[finding.category] - penalty);
  }

  base.publication_readiness = clamp(
    (base.technical_integrity +
      base.completeness +
      base.accessibility +
      base.curriculum_alignment) /
      4,
  );

  return base;
}
