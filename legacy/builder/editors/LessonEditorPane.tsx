import { Label, Textarea } from "@ludicon/ui";

import { StringListEditor } from "../components/StringListEditor";
import type { LessonBody } from "../bodies";
import type { EditorPaneProps } from "../types";
import { ItemCard, NumberField, SectionFrame, TextAreaField } from "./fields";
import { moveItem, ReorderControls } from "./ReorderControls";

/** The only genuinely per-type surface for a lesson design. */
export function LessonEditorPane({
  sectionId,
  body,
  onChange,
}: EditorPaneProps<LessonBody>) {
  const set = <TKey extends keyof LessonBody>(
    key: TKey,
    value: LessonBody[TKey],
  ) => onChange({ ...body, [key]: value });

  switch (sectionId) {
    case "general":
      return (
        <SectionFrame
          title="Informații generale"
          hint="Cât durează ora și de la ce pornesc elevii."
        >
          <NumberField
            label="Durata orei (minute)"
            value={body.durationMinutes}
            onChange={(next) => set("durationMinutes", next)}
            min={10}
            max={180}
          />
          <StringListEditor
            label="Cunoștințe anterioare"
            hint="Ce trebuie să știe elevii înainte de această oră."
            items={body.prerequisites}
            onChange={(next) => set("prerequisites", [...next])}
            placeholder="ex. Adunarea numerelor până la 100"
          />
        </SectionFrame>
      );

    case "objectives":
      return (
        <SectionFrame
          title="Obiective de învățare"
          hint="Ce vor putea face elevii la finalul orei. Formulează-le observabil."
        >
          <StringListEditor
            label="Obiective"
            items={body.objectives}
            onChange={(next) => set("objectives", [...next])}
            placeholder="ex. Elevii identifică fracții echivalente"
            addLabel="Adaugă un obiectiv"
          />
        </SectionFrame>
      );

    case "competencies":
      return (
        <SectionFrame title="Competențe" hint="Legătura cu programa clasei.">
          <StringListEditor
            label="Competențe vizate"
            items={body.competencies}
            onChange={(next) => set("competencies", [...next])}
            placeholder="ex. 2.3 Utilizarea fracțiilor în contexte familiare"
            addLabel="Adaugă o competență"
          />
        </SectionFrame>
      );

    case "phases":
      return (
        <SectionFrame
          title="Secvența de învățare"
          hint={`Etapele orei. Total planificat: ${totalMinutes(body)} minute.`}
        >
          <div className="flex flex-col gap-4">
            {body.phases.map((phase, index) => (
              <ItemCard
                key={phase.id}
                title={phase.title}
                meta={`${phase.durationMinutes} min`}
                actions={
                  <ReorderControls
                    index={index}
                    total={body.phases.length}
                    onMove={(delta) =>
                      set("phases", moveItem(body.phases, index, delta))
                    }
                  />
                }
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`phase-${phase.id}`}>
                    Ce se întâmplă în această etapă
                  </Label>
                  <Textarea
                    id={`phase-${phase.id}`}
                    rows={3}
                    value={phase.content}
                    onChange={(event) =>
                      set(
                        "phases",
                        body.phases.map((entry) =>
                          entry.id === phase.id
                            ? { ...entry, content: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </div>
                <NumberField
                  label="Minute"
                  value={phase.durationMinutes}
                  min={0}
                  max={120}
                  onChange={(next) =>
                    set(
                      "phases",
                      body.phases.map((entry) =>
                        entry.id === phase.id
                          ? { ...entry, durationMinutes: next }
                          : entry,
                      ),
                    )
                  }
                />
              </ItemCard>
            ))}
          </div>
        </SectionFrame>
      );

    case "resources":
      return (
        <SectionFrame title="Resurse" hint="Ce ai nevoie la clasă.">
          <StringListEditor
            label="Resurse"
            items={body.resources}
            onChange={(next) => set("resources", [...next])}
            placeholder="ex. Fișe tipărite, carton colorat"
            addLabel="Adaugă o resursă"
          />
        </SectionFrame>
      );

    case "differentiation":
      return (
        <SectionFrame
          title="Diferențiere"
          hint="Cum ajungi la elevii cu ritmuri diferite."
        >
          <TextAreaField
            label="Variante pentru clasă"
            value={body.differentiation}
            rows={6}
            onChange={(next) => set("differentiation", next)}
            placeholder="Variantă accesibilă… / Variantă de aprofundare…"
          />
        </SectionFrame>
      );

    case "assessment":
      return (
        <SectionFrame
          title="Evaluare"
          hint="Cum vezi dacă obiectivele au fost atinse."
        >
          <TextAreaField
            label="Dovezi de învățare"
            value={body.assessment}
            rows={5}
            onChange={(next) => set("assessment", next)}
          />
          <TextAreaField
            label="Temă"
            hint="Opțional. O sarcină scurtă de consolidare."
            value={body.homework}
            rows={3}
            onChange={(next) => set("homework", next)}
          />
        </SectionFrame>
      );

    case "reflection":
      return (
        <SectionFrame title="Reflecție" hint="Ce reții pentru data viitoare.">
          <TextAreaField
            label="Notițele tale"
            value={body.reflection}
            rows={6}
            onChange={(next) => set("reflection", next)}
          />
          <TextAreaField
            label="Observații pentru colegi"
            hint="Vizibile doar dacă alegi să împarți lecția."
            value={body.teacherNotes}
            rows={3}
            onChange={(next) => set("teacherNotes", next)}
          />
        </SectionFrame>
      );

    default:
      return null;
  }
}

const totalMinutes = (body: LessonBody): number =>
  body.phases.reduce((total, phase) => total + phase.durationMinutes, 0);
