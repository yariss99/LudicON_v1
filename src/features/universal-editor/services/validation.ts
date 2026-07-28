import type { PieAnalysisReport } from "../../../engines/pie";
import type { UpeDocument, UpeValidationIssue } from "../types";

export function validateUpeDocument(
  document: UpeDocument,
  pie?: PieAnalysisReport | null,
): UpeValidationIssue[] {
  const issues: UpeValidationIssue[] = [];

  if (!document.title.trim()) {
    issues.push({
      id: "upe_title",
      severity: "error",
      title: "Lipsește titlul materialului",
      explanation: "Fără titlu, materialul este greu de regăsit în bibliotecă.",
      suggestedFix: "Adaugă un titlu scurt și clar.",
      estimatedImpact: "Organizare și export mai clare",
      source: "upe",
    });
  }

  if (document.learningObjectives.length === 0) {
    issues.push({
      id: "upe_objectives",
      severity: "warning",
      title: "Nu sunt legate obiective",
      explanation:
        "Materialul nu este încă conectat de obiectivele proiectului lecției.",
      suggestedFix: "Leagă cel puțin un obiectiv din panoul pedagogic.",
      estimatedImpact: "Aliniere curriculară mai bună",
      source: "upe",
    });
  }

  const hasExercise = document.blocks.some(
    (b) =>
      b.type === "exercise" ||
      b.type === "open_question" ||
      b.type === "multiple_choice",
  );
  if (document.objectType === "worksheet" && !hasExercise) {
    issues.push({
      id: "upe_exercise",
      severity: "warning",
      title: "Fișa nu conține încă un exercițiu",
      explanation: "O fișă de lucru are de obicei cel puțin o sarcină de practică.",
      suggestedFix: "Adaugă un bloc de tip Exercițiu pe canvas.",
      estimatedImpact: "Practică mai clară pentru elevi",
      source: "upe",
    });
  }

  const imagesWithoutAlt = document.blocks.filter(
    (b) =>
      b.type === "image" &&
      (!b.content.alt || !String(b.content.alt).trim()),
  );
  for (const block of imagesWithoutAlt) {
    issues.push({
      id: `upe_alt_${block.id}`,
      severity: "warning",
      title: "Imagine fără text alternativ",
      explanation: "Elevii care folosesc cititoare de ecran au nevoie de descriere.",
      suggestedFix: "Completează textul alternativ în proprietăți.",
      estimatedImpact: "Accesibilitate îmbunătățită",
      blockId: block.id,
      source: "upe",
    });
  }

  if (pie) {
    for (const rec of pie.recommendations.slice(0, 5)) {
      if (rec.priority === "critical" || rec.priority === "important") {
        issues.push({
          id: `pie_${rec.id}`,
          severity: rec.priority === "critical" ? "error" : "warning",
          title: rec.title,
          explanation: rec.explanation,
          suggestedFix: rec.learnMore,
          estimatedImpact: rec.estimatedImprovement,
          source: "pie",
        });
      }
    }
  }

  return issues;
}
