import type { ValidationIssue } from "@ludicon/domain";
import type { ExerciseBlock } from "../model/blocks.js";
import { illegalFreeBlocks } from "../model/free-placement.js";
import type { EvaluationProject } from "../model/project.js";
import {
  danglingIds,
  exerciseBlocks,
  isEmptyDocument,
} from "../model/queries.js";
import { columnsMatchLayout } from "../model/section.js";
import type { ExerciseRegistry } from "../exercises/registry.js";
import { EVALUATION_ISSUE_CODE } from "./codes.js";

/**
 * Everything that is wrong with a paper, in the shape the rest of the product
 * already speaks.
 *
 * `ValidationIssue` and `IssueSeverity` come from `@ludicon/domain` rather than
 * being redefined here. That package exists precisely because the pre-refactor
 * tree had nine parallel `*ValidationIssue` families, and adding a tenth for
 * evaluations would be the same mistake with a new name — the teacher sees one
 * list of problems across their whole workspace, so the problems have to be one
 * type.
 *
 * The registry is a PARAMETER, not an import. An exercise's config is opaque to
 * the document model, so only the registry can say whether it is valid, and
 * passing it in is what keeps this function pure: same document, same registry,
 * same issues, every time. A module-level singleton would have made the result
 * depend on import order.
 *
 * Messages are Romanian and teacher-facing (UX-001: no architecture jargon, no
 * blame, always a next step). This is not UI — it returns data — but the data
 * is read aloud by the interface unchanged, so it is written for a person.
 */

const issue = (
  code: string,
  severity: ValidationIssue["severity"],
  message: string,
  path?: string,
  remedy?: string,
): ValidationIssue => ({ code, severity, message, path, remedy });

const metaIssues = (document: EvaluationProject): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (document.meta.title.trim() === "") {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.titleMissing,
        "blocking",
        "Lucrarea nu are încă un titlu.",
        "meta/title",
        "Scrie un titlu în bara de sus — elevii îl vor vedea pe prima pagină.",
      ),
    );
  }

  if (document.meta.discipline === null) {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.disciplineMissing,
        "error",
        "Nu ai ales disciplina.",
        "meta/discipline",
        "Alege disciplina din detaliile lucrării, ca să o regăsești ușor în bibliotecă.",
      ),
    );
  }

  if (document.meta.grade === null) {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.gradeMissing,
        "error",
        "Nu ai ales clasa.",
        "meta/grade",
        "Alege clasa din detaliile lucrării.",
      ),
    );
  }

  return issues;
};

const exerciseIssues = (
  document: EvaluationProject,
  registry: ExerciseRegistry,
  block: ExerciseBlock,
): ValidationIssue[] => {
  const path = `blocks/${block.id}`;
  const definition = registry.get(block.exerciseType);

  if (!definition) {
    return [
      issue(
        EVALUATION_ISSUE_CODE.exerciseUnknownType,
        "blocking",
        `Exercițiul „${block.exerciseType}” nu mai este disponibil.`,
        path,
        "Înlocuiește-l cu un exercițiu din listă sau șterge-l din lucrare.",
      ),
    ];
  }

  const issues: ValidationIssue[] = [];
  const config = definition.configSchema.safeParse(block.config);

  if (!config.success) {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.exerciseConfigInvalid,
        "blocking",
        `Exercițiul „${definition.labels.name}” nu este completat corect.`,
        path,
        "Deschide exercițiul și completează câmpurile lipsă.",
      ),
    );
  } else {
    /**
     * The definition's own pedagogical checks run only on a config that
     * parsed. Handing `validate` a config that failed its schema would have it
     * reading fields that are not there, and the resulting error would name a
     * property rather than a problem the teacher recognises.
     */
    issues.push(
      ...definition
        .validate(config.data)
        .map((found) => ({ ...found, path: found.path ?? path })),
    );
  }

  const answer = document.answerKey[block.id];

  if (!answer) {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.answerMissing,
        "blocking",
        `Exercițiul „${definition.labels.name}” nu are răspuns în barem.`,
        path,
        "Completează răspunsul corect, ca baremul să poată fi tipărit odată cu lucrarea.",
      ),
    );
    return issues;
  }

  if (answer.exerciseType !== block.exerciseType) {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.answerTypeMismatch,
        "error",
        "Răspunsul din barem nu se potrivește cu tipul exercițiului.",
        path,
        "Reintrodu răspunsul pentru acest exercițiu.",
      ),
    );
  } else {
    const parsed = definition.answerSchema.safeParse(answer.answer);

    if (!parsed.success) {
      issues.push(
        issue(
          EVALUATION_ISSUE_CODE.answerInvalid,
          "error",
          `Răspunsul din barem pentru „${definition.labels.name}” nu este valid.`,
          path,
          "Deschide baremul și verifică răspunsul.",
        ),
      );
    } else if (config.success) {
      /**
       * The cross-check, and the only place in the product that can make it.
       *
       * `validate` sees the config alone and `answerSchema` sees the answer
       * alone, so neither can catch a barem naming option four of a question
       * that now has three, or two spellings for a three-blank sentence. Both
       * parse cleanly and both print — the paper looks right, the marking sheet
       * looks right, and a class is marked against a position that does not
       * exist. Only a function holding both halves sees it, and the halves are
       * stored apart on purpose: the block travels between pages, the answer
       * stays keyed by id in `document.answerKey`.
       *
       * Guarded on BOTH parses, and the guards are not interchangeable. A
       * config that failed its schema would have `validateAnswer` reading
       * fields that are not there — the same argument `validate` above is
       * guarded by — and the resulting issue would name a property rather than
       * a problem the teacher recognises. There is already a `blocking` issue
       * for each failed parse, so nothing goes unreported by waiting.
       *
       * Optional-called rather than required on the interface: a type with
       * nothing to cross-check — one whose answer is free text — writes
       * nothing, and adding the member did not invalidate the definitions that
       * predate it. `path` is filled in only where the definition left it
       * empty, so an issue that can point at a finer place than the block keeps
       * its own aim.
       */
      issues.push(
        ...(definition.validateAnswer?.(config.data, parsed.data) ?? []).map(
          (found) => ({ ...found, path: found.path ?? path }),
        ),
      );
    }
  }

  if (answer.points !== block.points) {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.answerPointsMismatch,
        "warning",
        "Punctajul de pe lucrare nu este același cu cel din barem.",
        path,
        `Lucrarea arată ${block.points}, baremul ${answer.points}. Alege una dintre valori.`,
      ),
    );
  }

  return issues;
};

const answerKeyIssues = (document: EvaluationProject): ValidationIssue[] => {
  const known = new Set<string>(
    exerciseBlocks(document).map((block) => block.id),
  );

  return Object.keys(document.answerKey)
    .filter((blockId) => !known.has(blockId))
    .map((blockId) =>
      issue(
        EVALUATION_ISSUE_CODE.answerOrphan,
        "warning",
        "În barem a rămas un răspuns pentru un exercițiu care nu mai există.",
        `answerKey/${blockId}`,
        "Șterge răspunsul rămas, ca baremul să corespundă lucrării.",
      ),
    );
};

const structureIssues = (document: EvaluationProject): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const dangling = danglingIds(document);
  const total =
    dangling.pages.length + dangling.sections.length + dangling.blocks.length;

  if (total > 0) {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.danglingReference,
        "error",
        "Lucrarea conține referințe către elemente care lipsesc.",
        "structure",
        "Redeschide lucrarea. Dacă problema persistă, restaurează o versiune anterioară.",
      ),
    );
  }

  for (const section of Object.values(document.sections)) {
    if (!columnsMatchLayout(section)) {
      issues.push(
        issue(
          EVALUATION_ISSUE_CODE.layoutMismatch,
          "error",
          "O secțiune are un aranjament care nu se potrivește cu coloanele ei.",
          `sections/${section.id}`,
          "Alege din nou aranjamentul secțiunii.",
        ),
      );
    }
  }

  for (const offender of illegalFreeBlocks(document)) {
    issues.push(
      issue(
        EVALUATION_ISSUE_CODE.freeBlockNotAllowed,
        "error",
        "Un element așezat liber se află pe o pagină care nu permite asta.",
        `blocks/${offender.blockId}`,
        "Mută-l pe copertă sau transformă-l într-un element obișnuit.",
      ),
    );
  }

  return issues;
};

export const validateProject = (
  document: EvaluationProject,
  registry: ExerciseRegistry,
): ValidationIssue[] => {
  /**
   * The empty check returns ALONE. Every other issue on a blank document —
   * no title, no discipline, no questions — is a consequence of it being blank,
   * and handing a teacher who has just created a paper a list of five failures
   * is the product telling them off for starting.
   */
  if (isEmptyDocument(document)) {
    return [
      issue(
        EVALUATION_ISSUE_CODE.documentEmpty,
        "blocking",
        "Lucrarea este încă goală.",
        "document",
        "Adaugă primul exercițiu sau un text de început.",
      ),
    ];
  }

  return [
    ...metaIssues(document),
    ...exerciseBlocks(document).flatMap((block) =>
      exerciseIssues(document, registry, block),
    ),
    ...answerKeyIssues(document),
    ...structureIssues(document),
  ];
};

/**
 * Whether the paper may be printed and handed out.
 *
 * Not called `hasBlockingIssues`: `@ludicon/domain` already exports that name
 * for a `ValidationReport`, and two functions with one name that take different
 * arguments is exactly the confusion the shared domain package was created to
 * end. The name here also says what the answer is FOR, which is the question a
 * caller is actually asking.
 */
export const blocksPrinting = (issues: readonly ValidationIssue[]): boolean =>
  issues.some((found) => found.severity === "blocking");
