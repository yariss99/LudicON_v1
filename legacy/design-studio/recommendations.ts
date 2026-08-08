import {
  blocksForSection,
  totalPlannedMinutes,
  type LessonPlan,
} from "@ludicon/domain";

import { makeBlock, sectionCompletion } from "./lesson-analysis";

/**
 * One thing PRIMA noticed, and the exact edit it would make.
 *
 * `apply` is a pure patch rather than a description of one, so `Aplică` can
 * never disagree with the sentence above it. A suggestion with no mechanical
 * patch is not offered at all — a button that says "Aplică" and applies
 * nothing would teach the teacher to stop trusting the panel.
 */
export type Recommendation = {
  id: string;
  title: string;
  message: string;
  /** What the teacher is told after the patch lands. */
  confirmation: string;
  apply: (plan: LessonPlan) => LessonPlan;
};

const addBlocks = (
  plan: LessonPlan,
  additions: readonly ReturnType<typeof makeBlock>[],
): LessonPlan => ({ ...plan, blocks: [...plan.blocks, ...additions] });

/**
 * Everything PRIMA could say, in the order it matters pedagogically.
 *
 * The caller takes the first three. CH02 Law 8 caps tips at three and asks the
 * assistant to stay beside the work rather than in front of it, so the list is
 * ordered by what unblocks the lesson soonest, not by what is easiest to fix.
 */
function allRecommendations(plan: LessonPlan): Recommendation[] {
  const candidates: Recommendation[] = [];

  if (sectionCompletion(plan, "objectives") === "empty") {
    candidates.push({
      id: "objectives-seed",
      title: "Începe de la ce vor învăța copiii",
      message:
        "Un obiectiv de învățare scris la început ține restul lecției aliniat. Pot adăuga primul, ca punct de plecare.",
      confirmation:
        "Am adăugat un obiectiv de învățare — scrie-l în cuvintele tale.",
      apply: (current) =>
        addBlocks(current, [
          makeBlock(current, "objectives", "Obiectiv de învățare", {
            purpose: "Ce vor ști sau vor putea face elevii la final.",
          }),
        ]),
    });
  }

  if (sectionCompletion(plan, "sequence") === "empty") {
    candidates.push({
      id: "sequence-seed",
      title: "Așază lecția pe trei momente",
      message:
        "Deschidere, explorare, consolidare — o structură simplă pe care o poți rearanja oricând.",
      confirmation: "Am așezat trei momente în secvența de învățare.",
      apply: (current) =>
        addBlocks(current, [
          makeBlock(current, "sequence", "Deschidere", {
            purpose: "Trezește interesul și leagă de ce știu deja copiii.",
            estimatedMinutes: 10,
          }),
          makeBlock(current, "sequence", "Explorare", {
            purpose: "Momentul în care copiii lucrează cu ideea nouă.",
            estimatedMinutes: 25,
          }),
          makeBlock(current, "sequence", "Consolidare", {
            purpose: "Strânge ce s-a înțeles și lasă o urmă vizibilă.",
            estimatedMinutes: 10,
          }),
        ]),
    });
  }

  if (sectionCompletion(plan, "assessment") === "empty") {
    candidates.push({
      id: "assessment-seed",
      title: "Cum vei ști că au învățat?",
      message:
        "Un moment scurt de observare la final îți arată unde stă clasa, fără să fie o notă.",
      confirmation: "Am adăugat un moment de evaluare la final.",
      apply: (current) =>
        addBlocks(current, [
          makeBlock(current, "assessment", "Observare la final", {
            purpose: "Dovezi de învățare strânse în ultimele minute.",
            estimatedMinutes: 5,
          }),
        ]),
    });
  }

  if (sectionCompletion(plan, "resources") === "empty") {
    candidates.push({
      id: "resources-seed",
      title: "Ce ai nevoie la clasă",
      message:
        "O listă scurtă de resurse acum îți scutește căutarea de dimineață.",
      confirmation: "Am pregătit locul pentru resursele lecției.",
      apply: (current) =>
        addBlocks(current, [
          makeBlock(current, "resources", "Resurse necesare", {
            purpose: "Materialele fără de care lecția nu poate începe.",
          }),
        ]),
    });
  }

  if (sectionCompletion(plan, "general") === "empty") {
    candidates.push({
      id: "general-seed",
      title: "Câteva informații despre context",
      message:
        "Clasa, disciplina și ce s-a lucrat înainte ajută la tot ce urmează.",
      confirmation: "Am adăugat un loc pentru informațiile generale.",
      apply: (current) =>
        addBlocks(current, [
          makeBlock(current, "general", "Contextul lecției", {
            purpose: "Unde se așază lecția în parcursul clasei.",
          }),
        ]),
    });
  }

  const planned = totalPlannedMinutes(plan);
  const sequence = blocksForSection(plan, "sequence");
  if (sequence.length > 0 && planned !== plan.durationMinutes) {
    const difference = plan.durationMinutes - planned;
    candidates.push({
      id: "time-balance",
      title:
        difference > 0
          ? "Mai ai timp neplanificat"
          : "Momentele depășesc durata lecției",
      message:
        difference > 0
          ? `Momentele însumează ${planned} din ${plan.durationMinutes} de minute. Pot împărți diferența între ele.`
          : `Momentele însumează ${planned} de minute, mai mult decât cele ${plan.durationMinutes} planificate. Pot ajusta proporțional.`,
      confirmation: "Am reașezat minutele între momentele lecției.",
      apply: (current) => {
        const steps = blocksForSection(current, "sequence");
        if (steps.length === 0) return current;

        const each = Math.floor(current.durationMinutes / steps.length);
        const remainder = current.durationMinutes - each * steps.length;
        const minutes = new Map(
          steps.map((block, index) => [
            block.id,
            index === steps.length - 1 ? each + remainder : each,
          ]),
        );

        return {
          ...current,
          blocks: current.blocks.map((block) => {
            const value = minutes.get(block.id);
            return value === undefined
              ? block
              : { ...block, estimatedMinutes: value };
          }),
        };
      },
    });
  }

  return candidates;
}

/** At most three, and never one the teacher has already set aside. */
export function recommendationsFor(
  plan: LessonPlan,
  dismissed: ReadonlySet<string>,
): Recommendation[] {
  return allRecommendations(plan)
    .filter((item) => !dismissed.has(item.id))
    .slice(0, 3);
}
