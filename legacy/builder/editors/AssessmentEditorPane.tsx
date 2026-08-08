import { Plus } from "lucide-react";
import { Button } from "@ludicon/ui";

import { StringListEditor } from "../components/StringListEditor";
import {
  DIFFICULTY_LABEL,
  QUESTION_TYPE_LABEL,
  newItemId,
  type AssessmentBody,
  type AssessmentQuestion,
  type QuestionGroup,
} from "../bodies";
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

export function AssessmentEditorPane({
  sectionId,
  body,
  onChange,
}: EditorPaneProps<AssessmentBody>) {
  const set = <TKey extends keyof AssessmentBody>(
    key: TKey,
    value: AssessmentBody[TKey],
  ) => onChange({ ...body, [key]: value });

  const setGroup = (groupId: string, next: QuestionGroup) =>
    set(
      "groups",
      body.groups.map((group) => (group.id === groupId ? next : group)),
    );

  switch (sectionId) {
    case "general":
      return (
        <SectionFrame
          title="Informații generale"
          hint="Cât durează evaluarea și ce prag consideri reușit."
        >
          <NumberField
            label="Durata (minute)"
            value={body.durationMinutes}
            min={5}
            max={180}
            onChange={(next) => set("durationMinutes", next)}
          />
          <NumberField
            label="Prag de reușită (%)"
            hint="Doar orientativ. Nu apare niciodată elevilor ca notă."
            value={body.passingScore}
            min={0}
            max={100}
            onChange={(next) => set("passingScore", next)}
          />
        </SectionFrame>
      );

    case "objectives":
      return (
        <SectionFrame
          title="Obiective de învățare"
          hint="Ce verifică această evaluare."
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

    case "criteria":
      return (
        <SectionFrame
          title="Criterii de succes"
          hint="Scrie-le în cuvintele elevilor, la persoana întâi."
        >
          <StringListEditor
            label="Criterii"
            items={body.criteria}
            onChange={(next) => set("criteria", [...next])}
            placeholder="ex. Explic pașii pe care i-am urmat."
            addLabel="Adaugă un criteriu"
          />
        </SectionFrame>
      );

    case "questions":
      return (
        <SectionFrame
          title="Itemi"
          hint="Grupele împart evaluarea în părți cu aceeași instrucțiune."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                set("groups", [
                  ...body.groups,
                  {
                    id: newItemId("grup"),
                    title: `Partea ${body.groups.length + 1}`,
                    instructions: "",
                    questions: [],
                  },
                ])
              }
            >
              <Plus aria-hidden size={18} strokeWidth={1.75} />
              Adaugă o grupă
            </Button>
          }
        >
          <div className="flex flex-col gap-5">
            {body.groups.map((group, groupIndex) => (
              <ItemCard
                key={group.id}
                title={group.title}
                meta={`${group.questions.length} itemi`}
                actions={
                  <ReorderControls
                    index={groupIndex}
                    total={body.groups.length}
                    onMove={(delta) =>
                      set("groups", moveItem(body.groups, groupIndex, delta))
                    }
                    onRemove={() =>
                      set(
                        "groups",
                        body.groups.filter((entry) => entry.id !== group.id),
                      )
                    }
                  />
                }
              >
                <TextField
                  label="Titlul grupei"
                  value={group.title}
                  onChange={(next) =>
                    setGroup(group.id, { ...group, title: next })
                  }
                />
                <TextAreaField
                  label="Instrucțiuni pentru elevi"
                  rows={2}
                  value={group.instructions}
                  onChange={(next) =>
                    setGroup(group.id, { ...group, instructions: next })
                  }
                />

                <div className="flex flex-col gap-3">
                  {group.questions.map((question, index) => (
                    <QuestionEditor
                      key={question.id}
                      question={question}
                      index={index}
                      total={group.questions.length}
                      onChange={(next) =>
                        setGroup(group.id, {
                          ...group,
                          questions: group.questions.map((entry) =>
                            entry.id === question.id ? next : entry,
                          ),
                        })
                      }
                      onMove={(delta) =>
                        setGroup(group.id, {
                          ...group,
                          questions: moveItem(group.questions, index, delta),
                        })
                      }
                      onRemove={() =>
                        setGroup(group.id, {
                          ...group,
                          questions: group.questions.filter(
                            (entry) => entry.id !== question.id,
                          ),
                        })
                      }
                    />
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() =>
                    setGroup(group.id, {
                      ...group,
                      questions: [
                        ...group.questions,
                        {
                          id: newItemId("item"),
                          type: "single_choice",
                          prompt: "",
                          choices: [],
                          answerKey: "",
                          points: 1,
                          difficulty: "medium",
                        },
                      ],
                    })
                  }
                >
                  <Plus aria-hidden size={18} strokeWidth={1.75} />
                  Adaugă un item
                </Button>
              </ItemCard>
            ))}
          </div>
        </SectionFrame>
      );

    default:
      return null;
  }
}

function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  question: AssessmentQuestion;
  index: number;
  total: number;
  onChange: (next: AssessmentQuestion) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <ItemCard
      title={`Itemul ${index + 1}`}
      meta={QUESTION_TYPE_LABEL[question.type]}
      actions={
        <ReorderControls
          index={index}
          total={total}
          onMove={onMove}
          onRemove={onRemove}
        />
      }
    >
      <TextAreaField
        label="Enunț"
        rows={2}
        value={question.prompt}
        onChange={(next) => onChange({ ...question, prompt: next })}
      />
      <div className="grid gap-4 tablet:grid-cols-2">
        <ChoiceField
          label="Tip"
          value={question.type}
          options={QUESTION_TYPE_LABEL}
          onChange={(next) => onChange({ ...question, type: next })}
        />
        <ChoiceField
          label="Nivel"
          value={question.difficulty}
          options={DIFFICULTY_LABEL}
          onChange={(next) => onChange({ ...question, difficulty: next })}
        />
      </div>
      <StringListEditor
        label="Variante de răspuns"
        hint="Lasă gol pentru itemii cu răspuns liber."
        items={question.choices}
        onChange={(next) => onChange({ ...question, choices: [...next] })}
        addLabel="Adaugă o variantă"
      />
      <div className="grid gap-4 tablet:grid-cols-2">
        <TextField
          label="Răspuns așteptat"
          value={question.answerKey}
          onChange={(next) => onChange({ ...question, answerKey: next })}
        />
        <NumberField
          label="Puncte"
          value={question.points}
          min={0}
          max={100}
          onChange={(next) => onChange({ ...question, points: next })}
        />
      </div>
    </ItemCard>
  );
}
