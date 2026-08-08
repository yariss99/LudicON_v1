import { assessmentConfig } from "./config/assessment";
import { gameConfig } from "./config/game";
import { lessonConfig } from "./config/lesson";
import { presentationConfig } from "./config/presentation";
import { storyConfig } from "./config/story";
import { worksheetConfig } from "./config/worksheet";
import { createBuilder, type BuilderDefinition } from "./createBuilder";
import type { BuilderKind } from "./types";

/**
 * The whole builder surface, in one table.
 *
 * Adding a sixth asset kind is one config file and one line here — not a
 * sixteen-file directory. The five entries below replace
 * `features/{lesson,assessment,story,game,presentation}-builder/`.
 */
export const BUILDERS: Readonly<Record<BuilderKind, BuilderDefinition>> =
  Object.freeze({
    lesson_plan: createBuilder(lessonConfig),
    worksheet: createBuilder(worksheetConfig),
    assessment: createBuilder(assessmentConfig),
    story: createBuilder(storyConfig),
    game: createBuilder(gameConfig),
    presentation: createBuilder(presentationConfig),
  });

export { BUILDER_KINDS, isBuilderKind } from "./types";
export type { BuilderKind } from "./types";
