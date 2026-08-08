import { ASSET_KIND_LABEL, type AssetKind } from "@ludicon/domain";
import type { LucideIcon } from "lucide-react";
import { z } from "zod";

import { QUICK_ACTIONS } from "../../lib/navigation";

/**
 * What the teacher can start here.
 *
 * The slugs are exactly the `intent` values the create menu offers, so a
 * deep link like `?kind=worksheet` and a click in the menu describe the same
 * thing. The enum is the boundary: a hand-edited URL that names something
 * else is refused here rather than halfway through the flow.
 */
export const MaterialKind = z.enum([
  "lesson",
  "worksheet",
  "assessment",
  "story",
  "presentation",
  "game",
]);
export type MaterialKind = z.infer<typeof MaterialKind>;

/**
 * The flow's own copy for one kind of material.
 *
 * Deliberately does NOT restate the menu's label, description or opening
 * words — those have one home, in `lib/navigation`, and are read from there
 * below. This record only holds what the menu has no reason to know: which
 * domain asset the choice maps to, and how the next step asks its question.
 */
interface KindPresentation {
  assetKind: AssetKind;
  /** Step 2's heading, phrased for this kind. */
  question: string;
  /** The visible label above the field. Never a placeholder. */
  fieldLabel: string;
  placeholder: string;
}

const PRESENTATION: Readonly<Record<MaterialKind, KindPresentation>> =
  Object.freeze({
    lesson: {
      assetKind: "lesson_plan",
      question: "Despre ce este lecția?",
      fieldLabel: "Ideea lecției",
      placeholder:
        "De exemplu: vreau să predau fracțiile la clasa a IV-a, pornind de la împărțirea unei pizza.",
    },
    worksheet: {
      assetKind: "worksheet",
      question: "Despre ce este fișa?",
      fieldLabel: "Ideea fișei",
      placeholder:
        "De exemplu: exerciții de adunare cu trecere peste ordin, pentru clasa a II-a.",
    },
    assessment: {
      assetKind: "assessment",
      question: "Ce vrei să afli despre elevi?",
      fieldLabel: "Ideea evaluării",
      placeholder:
        "De exemplu: vreau să văd dacă elevii au înțeles înmulțirea, la finalul unității.",
    },
    story: {
      assetKind: "story",
      question: "Despre ce este povestea?",
      fieldLabel: "Ideea poveștii",
      placeholder:
        "De exemplu: o poveste despre un bob de fasole care crește, pentru clasa pregătitoare.",
    },
    presentation: {
      assetKind: "presentation",
      question: "Despre ce este prezentarea?",
      fieldLabel: "Ideea prezentării",
      placeholder:
        "De exemplu: circuitul apei în natură, cu imagini și trei momente de discuție.",
    },
    game: {
      assetKind: "game",
      question: "Ce vrei să exerseze elevii prin joc?",
      fieldLabel: "Ideea jocului",
      placeholder:
        "De exemplu: un joc pe echipe pentru recunoașterea părților de vorbire, la clasa a IV-a.",
    },
  });

/** Everything one card needs to say, in one object. */
export interface MaterialKindOption extends KindPresentation {
  kind: MaterialKind;
  label: string;
  description: string;
  /** Opening words placed in the field, for the teacher to finish. */
  seed: string;
  icon: LucideIcon;
}

/**
 * One card per entry in the create menu, in the menu's own order.
 *
 * Built from `QUICK_ACTIONS` rather than restated, so the menu and this
 * screen can never disagree about what exists or what it is called. An entry
 * whose slug this flow has no copy for is skipped instead of rendered blank.
 */
export const MATERIAL_KINDS: readonly MaterialKindOption[] =
  QUICK_ACTIONS.flatMap((action) => {
    const parsed = MaterialKind.safeParse(action.intent);
    if (!parsed.success) return [];

    return [
      {
        ...PRESENTATION[parsed.data],
        kind: parsed.data,
        label: action.label,
        description: action.description,
        seed: action.seed,
        icon: action.icon,
      },
    ];
  });

const BY_KIND: ReadonlyMap<MaterialKind, MaterialKindOption> = new Map(
  MATERIAL_KINDS.map((option) => [option.kind, option] as const),
);

/** The teacher-facing name of a kind. Falls back to the domain's own label. */
export function kindLabel(kind: MaterialKind): string {
  return (
    BY_KIND.get(kind)?.label ?? ASSET_KIND_LABEL[PRESENTATION[kind].assetKind]
  );
}

/** Opening words for a kind, or nothing if the menu no longer offers it. */
export function kindSeed(kind: MaterialKind): string {
  return BY_KIND.get(kind)?.seed ?? "";
}

export function kindQuestion(kind: MaterialKind): string {
  return PRESENTATION[kind].question;
}

export function kindFieldLabel(kind: MaterialKind): string {
  return PRESENTATION[kind].fieldLabel;
}

export function kindPlaceholder(kind: MaterialKind): string {
  return PRESENTATION[kind].placeholder;
}

export function kindIcon(kind: MaterialKind): LucideIcon | undefined {
  return BY_KIND.get(kind)?.icon;
}

export function assetKindFor(kind: MaterialKind): AssetKind {
  return PRESENTATION[kind].assetKind;
}

/**
 * The opening phrases, without their trailing space.
 *
 * Every seed ends in one, and a textarea's value is compared after trimming
 * almost everywhere it is read. Storing the trimmed form is what stops
 * "Vreau o fișă de lucru despre" from looking like an answer.
 */
const SEEDS: readonly string[] = MATERIAL_KINDS.map((option) =>
  option.seed.trim().toLocaleLowerCase("ro-RO"),
);

/**
 * True when the text is still only an opening phrase.
 *
 * Used to decide whether changing the chosen material may re-seed the field.
 * Comparing against the known phrases — rather than tracking whether the
 * field was touched — is what guarantees a teacher's own sentence is never
 * overwritten, no matter which way they arrived at it.
 */
export function isUntouchedSeed(text: string): boolean {
  const trimmed = text.trim().toLocaleLowerCase("ro-RO");
  return trimmed.length === 0 || SEEDS.includes(trimmed);
}

/** Removes a leading opening phrase, so a title reads as the topic alone. */
export function withoutSeed(text: string): string {
  const lower = text.toLocaleLowerCase("ro-RO");
  const seed = SEEDS.find((candidate) => lower.startsWith(candidate));
  return seed ? text.slice(seed.length) : text;
}

/** Recognises which card a deep-linked opening phrase came from. */
export function kindFromSeed(
  intent: string | undefined,
): MaterialKind | undefined {
  if (!intent) return undefined;
  const lower = intent.toLocaleLowerCase("ro-RO");
  return MATERIAL_KINDS.find((option) =>
    lower.startsWith(option.seed.trim().toLocaleLowerCase("ro-RO")),
  )?.kind;
}
