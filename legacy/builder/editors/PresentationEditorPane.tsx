import { Plus } from "lucide-react";
import { Button } from "@ludicon/ui";

import { StringListEditor } from "../components/StringListEditor";
import {
  SLIDE_TYPE_LABEL,
  newItemId,
  type PresentationBody,
  type PresentationSlide,
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

export function PresentationEditorPane({
  sectionId,
  body,
  onChange,
}: EditorPaneProps<PresentationBody>) {
  const set = <TKey extends keyof PresentationBody>(
    key: TKey,
    value: PresentationBody[TKey],
  ) => onChange({ ...body, [key]: value });

  const setSlide = (id: string, next: PresentationSlide) =>
    set(
      "slides",
      body.slides.map((entry) => (entry.id === id ? next : entry)),
    );

  switch (sectionId) {
    case "objectives":
      return (
        <SectionFrame
          title="Obiective de învățare"
          hint="Ce urmăresc elevii pe parcursul prezentării."
        >
          <StringListEditor
            label="Obiective"
            items={body.objectives}
            onChange={(next) => set("objectives", [...next])}
            addLabel="Adaugă un obiectiv"
          />
          <TextAreaField
            label="Notițele tale"
            rows={3}
            value={body.teacherNotes}
            onChange={(next) => set("teacherNotes", next)}
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

    case "slides":
      return (
        <SectionFrame
          title="Diapozitive"
          hint="Fluxul orei, un ecran pe rând. Textul de pe ecran susține ce spui — nu îl repetă."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                set("slides", [
                  ...body.slides,
                  {
                    id: newItemId("slide"),
                    type: "content",
                    title: `Ecranul ${body.slides.length + 1}`,
                    body: "",
                    bullets: [],
                    speakerNotes: "",
                    estimatedSeconds: 45,
                  },
                ])
              }
            >
              <Plus aria-hidden size={18} strokeWidth={1.75} />
              Adaugă un diapozitiv
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {body.slides.map((entry, index) => (
              <ItemCard
                key={entry.id}
                title={entry.title.trim() || `Ecranul ${index + 1}`}
                meta={`${SLIDE_TYPE_LABEL[entry.type]} · ${entry.estimatedSeconds}s`}
                actions={
                  <ReorderControls
                    index={index}
                    total={body.slides.length}
                    onMove={(delta) =>
                      set("slides", moveItem(body.slides, index, delta))
                    }
                    onRemove={() =>
                      set(
                        "slides",
                        body.slides.filter((slide) => slide.id !== entry.id),
                      )
                    }
                  />
                }
              >
                <div className="grid gap-4 tablet:grid-cols-2">
                  <TextField
                    label="Titlu"
                    value={entry.title}
                    onChange={(next) =>
                      setSlide(entry.id, { ...entry, title: next })
                    }
                  />
                  <ChoiceField
                    label="Rolul ecranului"
                    value={entry.type}
                    options={SLIDE_TYPE_LABEL}
                    onChange={(next) =>
                      setSlide(entry.id, { ...entry, type: next })
                    }
                  />
                </div>
                <TextAreaField
                  label="Text pe ecran"
                  rows={3}
                  value={entry.body}
                  onChange={(next) =>
                    setSlide(entry.id, { ...entry, body: next })
                  }
                />
                <StringListEditor
                  label="Puncte cheie"
                  items={entry.bullets}
                  onChange={(next) =>
                    setSlide(entry.id, { ...entry, bullets: [...next] })
                  }
                  addLabel="Adaugă un punct"
                />
                <TextAreaField
                  label="Notele tale"
                  hint="Ce spui tu. Elevii nu văd acest text."
                  rows={2}
                  value={entry.speakerNotes}
                  onChange={(next) =>
                    setSlide(entry.id, { ...entry, speakerNotes: next })
                  }
                />
                <NumberField
                  label="Timp estimat (secunde)"
                  value={entry.estimatedSeconds}
                  min={5}
                  max={600}
                  onChange={(next) =>
                    setSlide(entry.id, { ...entry, estimatedSeconds: next })
                  }
                />
              </ItemCard>
            ))}
          </div>
        </SectionFrame>
      );

    default:
      return null;
  }
}
