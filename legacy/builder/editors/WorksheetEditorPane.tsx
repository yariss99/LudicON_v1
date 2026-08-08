import { Plus } from "lucide-react";
import { Button } from "@ludicon/ui";

import { StringListEditor } from "../components/StringListEditor";
import {
  newItemId,
  type WorksheetBody,
  type WorksheetExercise,
} from "../bodies";
import type { EditorPaneProps } from "../types";
import { ItemCard, NumberField, SectionFrame, TextAreaField } from "./fields";
import { moveItem, ReorderControls } from "./ReorderControls";

const blankExercise = (): WorksheetExercise => ({
  id: newItemId("ex"),
  prompt: "",
  lines: 3,
  hint: "",
  answer: "",
});

/**
 * The worksheet's editing surface.
 *
 * One exercise is one card: what the pupil is asked, how much room they get to
 * answer, and — kept apart from both — the note the teacher wants for
 * themselves. Nothing here carries points or a mark; a fișă is practice.
 */
export function WorksheetEditorPane({
  sectionId,
  body,
  onChange,
}: EditorPaneProps<WorksheetBody>) {
  const set = <TKey extends keyof WorksheetBody>(
    key: TKey,
    value: WorksheetBody[TKey],
  ) => onChange({ ...body, [key]: value });

  const setExercise = (id: string, next: WorksheetExercise) =>
    set(
      "exercises",
      body.exercises.map((exercise) => (exercise.id === id ? next : exercise)),
    );

  switch (sectionId) {
    case "general":
      return (
        <SectionFrame
          title="Informații generale"
          hint="Cât durează și ce le spui elevilor la început."
        >
          <NumberField
            label="Durata (minute)"
            value={body.estimatedMinutes}
            min={5}
            max={120}
            onChange={(next) => set("estimatedMinutes", next)}
          />
          <TextAreaField
            label="Instrucțiuni pentru elevi"
            hint="Primul lucru pe care îl citesc. Scurt și la persoana a doua."
            rows={3}
            value={body.instructions}
            onChange={(next) => set("instructions", next)}
          />
          <StringListEditor
            label="De ce au nevoie"
            hint="Creioane colorate, riglă, caiet — ce trebuie să fie pe bancă."
            items={body.materials}
            addLabel="Adaugă"
            onChange={(next) => set("materials", [...next])}
          />
        </SectionFrame>
      );

    case "objectives":
      return (
        <SectionFrame
          title="Obiective de învățare"
          hint="Ce exersează elevii prin această fișă."
        >
          <StringListEditor
            label="Obiective"
            items={body.objectives}
            addLabel="Adaugă un obiectiv"
            onChange={(next) => set("objectives", [...next])}
          />
        </SectionFrame>
      );

    case "competencies":
      return (
        <SectionFrame title="Competențe" hint="Legătura cu programa clasei.">
          <StringListEditor
            label="Competențe"
            items={body.competencies}
            addLabel="Adaugă o competență"
            onChange={(next) => set("competencies", [...next])}
          />
        </SectionFrame>
      );

    case "exercises":
      return (
        <SectionFrame
          title="Exerciții"
          hint="Cerințele, în ordinea în care le rezolvă elevii."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                set("exercises", [...body.exercises, blankExercise()])
              }
            >
              <Plus aria-hidden size={18} strokeWidth={1.75} />
              Adaugă un exercițiu
            </Button>
          }
        >
          {body.exercises.length === 0 ? (
            <p className="text-muted-foreground">
              Începe cu primul exercițiu. Le poți rearanja oricând.
            </p>
          ) : (
            body.exercises.map((exercise, index) => (
              <ItemCard
                key={exercise.id}
                title={`Exercițiul ${index + 1}`}
                actions={
                  <ReorderControls
                    index={index}
                    total={body.exercises.length}
                    onMove={(delta) =>
                      set("exercises", moveItem(body.exercises, index, delta))
                    }
                    onRemove={() =>
                      set(
                        "exercises",
                        body.exercises.filter(
                          (item) => item.id !== exercise.id,
                        ),
                      )
                    }
                  />
                }
              >
                <TextAreaField
                  label="Cerința"
                  rows={2}
                  value={exercise.prompt}
                  onChange={(next) =>
                    setExercise(exercise.id, { ...exercise, prompt: next })
                  }
                />
                <NumberField
                  label="Rânduri pentru răspuns"
                  hint="Spațiul lăsat pe foaie. Zero pentru un exercițiu oral."
                  value={exercise.lines}
                  min={0}
                  max={20}
                  onChange={(next) =>
                    setExercise(exercise.id, { ...exercise, lines: next })
                  }
                />
                <TextAreaField
                  label="Indiciu pentru elevi"
                  rows={2}
                  value={exercise.hint}
                  onChange={(next) =>
                    setExercise(exercise.id, { ...exercise, hint: next })
                  }
                />
                <TextAreaField
                  label="Rezolvarea, pentru tine"
                  hint="Rămâne la tine. Nu apare pe fișa elevului."
                  rows={2}
                  value={exercise.answer}
                  onChange={(next) =>
                    setExercise(exercise.id, { ...exercise, answer: next })
                  }
                />
              </ItemCard>
            ))
          )}
        </SectionFrame>
      );

    case "differentiation":
      return (
        <SectionFrame
          title="Sprijin și extindere"
          hint="Ce faci cu elevul care termină primul și cu cel care se blochează."
        >
          <TextAreaField
            label="Cum ajustezi"
            rows={5}
            value={body.differentiation}
            onChange={(next) => set("differentiation", next)}
          />
          <TextAreaField
            label="Notițele tale"
            hint="Rămân la tine, oriunde ai deschide fișa."
            rows={4}
            value={body.teacherNotes}
            onChange={(next) => set("teacherNotes", next)}
          />
        </SectionFrame>
      );

    default:
      return null;
  }
}
