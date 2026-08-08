import { Plus } from "lucide-react";
import { Button, Label, Switch } from "@ludicon/ui";

import { StringListEditor } from "../components/StringListEditor";
import { DIFFICULTY_LABEL, newItemId, type GameBody } from "../bodies";
import type { EditorPaneProps } from "../types";
import {
  ChoiceField,
  ItemCard,
  NumberField,
  SectionFrame,
  TextAreaField,
  TextField,
} from "./fields";
import { moveItem, ReorderControls } from "./ReorderControls";

export function GameEditorPane({
  sectionId,
  body,
  onChange,
}: EditorPaneProps<GameBody>) {
  const set = <TKey extends keyof GameBody>(key: TKey, value: GameBody[TKey]) =>
    onChange({ ...body, [key]: value });

  switch (sectionId) {
    case "general":
      return (
        <SectionFrame
          title="Informații generale"
          hint="Cât durează jocul și cum se joacă."
        >
          <NumberField
            label="Durata estimată (minute)"
            value={body.estimatedMinutes}
            min={5}
            max={90}
            onChange={(next) => set("estimatedMinutes", next)}
          />
          <TextAreaField
            label="Regulile jocului"
            hint="Explicate așa cum le-ai spune clasei."
            rows={5}
            value={body.rules}
            onChange={(next) => set("rules", next)}
          />
          <StringListEditor
            label="Indicii"
            hint="Ce le poți sugera elevilor când se blochează."
            items={body.hints}
            onChange={(next) => set("hints", [...next])}
            addLabel="Adaugă un indiciu"
          />
        </SectionFrame>
      );

    case "objectives":
      return (
        <SectionFrame
          title="Obiective de învățare"
          hint="Ce exersează elevii în timp ce se joacă."
        >
          <StringListEditor
            label="Obiective"
            items={body.objectives}
            onChange={(next) => set("objectives", [...next])}
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
            addLabel="Adaugă o competență"
          />
        </SectionFrame>
      );

    case "mechanics":
      return (
        <SectionFrame
          title="Mod de joc"
          hint="Alege doar ce serveşte lecţia. Trei sau patru elemente ajung."
        >
          <ul className="flex flex-col gap-3">
            {body.mechanics.map((mechanic) => (
              <li
                key={mechanic.id}
                className="flex flex-wrap items-center gap-4 rounded-md bg-surface p-4 ring-1 ring-border"
              >
                <div className="flex min-h-11 flex-1 items-center gap-3">
                  <Switch
                    id={`mechanic-${mechanic.id}`}
                    checked={mechanic.enabled}
                    onCheckedChange={(checked) =>
                      set(
                        "mechanics",
                        body.mechanics.map((entry) =>
                          entry.id === mechanic.id
                            ? { ...entry, enabled: checked }
                            : entry,
                        ),
                      )
                    }
                  />
                  <Label htmlFor={`mechanic-${mechanic.id}`}>
                    {mechanic.label}
                  </Label>
                </div>
                {mechanic.enabled ? (
                  <NumberField
                    label="Valoare"
                    value={mechanic.value}
                    min={0}
                    max={999}
                    onChange={(next) =>
                      set(
                        "mechanics",
                        body.mechanics.map((entry) =>
                          entry.id === mechanic.id
                            ? { ...entry, value: next }
                            : entry,
                        ),
                      )
                    }
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </SectionFrame>
      );

    case "levels":
      return (
        <SectionFrame
          title="Etape"
          hint="Cum crește dificultatea de la o etapă la alta."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                set("levels", [
                  ...body.levels,
                  {
                    id: newItemId("etapa"),
                    title: `Etapa ${body.levels.length + 1}`,
                    objective: "",
                    difficulty: "medium",
                  },
                ])
              }
            >
              <Plus aria-hidden size={18} strokeWidth={1.75} />
              Adaugă o etapă
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {body.levels.map((level, index) => (
              <ItemCard
                key={level.id}
                title={level.title.trim() || `Etapa ${index + 1}`}
                meta={DIFFICULTY_LABEL[level.difficulty]}
                actions={
                  <ReorderControls
                    index={index}
                    total={body.levels.length}
                    onMove={(delta) =>
                      set("levels", moveItem(body.levels, index, delta))
                    }
                    onRemove={() =>
                      set(
                        "levels",
                        body.levels.filter((entry) => entry.id !== level.id),
                      )
                    }
                  />
                }
              >
                <div className="grid gap-4 tablet:grid-cols-2">
                  <TextField
                    label="Titlu"
                    value={level.title}
                    onChange={(next) =>
                      set(
                        "levels",
                        body.levels.map((entry) =>
                          entry.id === level.id
                            ? { ...entry, title: next }
                            : entry,
                        ),
                      )
                    }
                  />
                  <ChoiceField
                    label="Nivel"
                    value={level.difficulty}
                    options={DIFFICULTY_LABEL}
                    onChange={(next) =>
                      set(
                        "levels",
                        body.levels.map((entry) =>
                          entry.id === level.id
                            ? { ...entry, difficulty: next }
                            : entry,
                        ),
                      )
                    }
                  />
                </div>
                <TextField
                  label="Ce exersează elevii aici"
                  value={level.objective}
                  onChange={(next) =>
                    set(
                      "levels",
                      body.levels.map((entry) =>
                        entry.id === level.id
                          ? { ...entry, objective: next }
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

    case "questions":
      return (
        <SectionFrame
          title="Întrebări"
          hint="Conținutul propriu-zis al jocului."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                set("questions", [
                  ...body.questions,
                  {
                    id: newItemId("intreb"),
                    prompt: "",
                    choices: ["", ""],
                    correctIndex: 0,
                    points: 10,
                  },
                ])
              }
            >
              <Plus aria-hidden size={18} strokeWidth={1.75} />
              Adaugă o întrebare
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {body.questions.map((question, index) => (
              <ItemCard
                key={question.id}
                title={`Întrebarea ${index + 1}`}
                meta={`${question.points} puncte`}
                actions={
                  <ReorderControls
                    index={index}
                    total={body.questions.length}
                    onMove={(delta) =>
                      set("questions", moveItem(body.questions, index, delta))
                    }
                    onRemove={() =>
                      set(
                        "questions",
                        body.questions.filter(
                          (entry) => entry.id !== question.id,
                        ),
                      )
                    }
                  />
                }
              >
                <TextAreaField
                  label="Enunț"
                  rows={2}
                  value={question.prompt}
                  onChange={(next) =>
                    set(
                      "questions",
                      body.questions.map((entry) =>
                        entry.id === question.id
                          ? { ...entry, prompt: next }
                          : entry,
                      ),
                    )
                  }
                />
                <StringListEditor
                  label="Variante"
                  items={question.choices}
                  onChange={(next) =>
                    set(
                      "questions",
                      body.questions.map((entry) =>
                        entry.id === question.id
                          ? { ...entry, choices: [...next] }
                          : entry,
                      ),
                    )
                  }
                  addLabel="Adaugă o variantă"
                />
                <div className="grid gap-4 tablet:grid-cols-2">
                  <NumberField
                    label="Varianta corectă (număr)"
                    value={question.correctIndex + 1}
                    min={1}
                    max={Math.max(1, question.choices.length)}
                    onChange={(next) =>
                      set(
                        "questions",
                        body.questions.map((entry) =>
                          entry.id === question.id
                            ? { ...entry, correctIndex: Math.max(0, next - 1) }
                            : entry,
                        ),
                      )
                    }
                  />
                  <NumberField
                    label="Puncte"
                    value={question.points}
                    min={0}
                    max={100}
                    onChange={(next) =>
                      set(
                        "questions",
                        body.questions.map((entry) =>
                          entry.id === question.id
                            ? { ...entry, points: next }
                            : entry,
                        ),
                      )
                    }
                  />
                </div>
              </ItemCard>
            ))}
          </div>
        </SectionFrame>
      );

    default:
      return null;
  }
}
