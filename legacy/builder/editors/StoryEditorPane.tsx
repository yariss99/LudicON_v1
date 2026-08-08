import { Plus } from "lucide-react";
import { Button } from "@ludicon/ui";

import { StringListEditor } from "../components/StringListEditor";
import {
  READING_LEVEL_LABEL,
  SCENE_TYPE_LABEL,
  newItemId,
  type StoryBody,
} from "../bodies";
import type { EditorPaneProps } from "../types";
import {
  ChoiceField,
  ItemCard,
  SectionFrame,
  TextAreaField,
  TextField,
} from "./fields";
import { moveItem, ReorderControls } from "./ReorderControls";

export function StoryEditorPane({
  sectionId,
  body,
  onChange,
}: EditorPaneProps<StoryBody>) {
  const set = <TKey extends keyof StoryBody>(
    key: TKey,
    value: StoryBody[TKey],
  ) => onChange({ ...body, [key]: value });

  switch (sectionId) {
    case "general":
      return (
        <SectionFrame
          title="Informații generale"
          hint="Unde se petrece povestea și pentru ce nivel de lectură."
        >
          <ChoiceField
            label="Nivel de lectură"
            value={body.readingLevel}
            options={READING_LEVEL_LABEL}
            onChange={(next) => set("readingLevel", next)}
          />
          <TextAreaField
            label="Cadrul poveștii"
            rows={3}
            value={body.setting}
            onChange={(next) => set("setting", next)}
            placeholder="ex. Un sat de munte, toamna târziu"
          />
          <TextAreaField
            label="Firul narativ"
            hint="În două-trei propoziții: ce se întâmplă și de ce contează."
            rows={3}
            value={body.storyArc}
            onChange={(next) => set("storyArc", next)}
          />
          <StringListEditor
            label="Cuvinte noi"
            hint="Vocabularul pe care vrei să-l reții după lectură."
            items={body.vocabulary}
            onChange={(next) => set("vocabulary", [...next])}
            addLabel="Adaugă un cuvânt"
          />
        </SectionFrame>
      );

    case "objectives":
      return (
        <SectionFrame
          title="Obiective de învățare"
          hint="Ce înțeleg elevii prin această poveste."
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

    case "characters":
      return (
        <SectionFrame
          title="Personaje"
          hint="Cine duce povestea mai departe."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                set("characters", [
                  ...body.characters,
                  { id: newItemId("pers"), name: "", role: "", traits: "" },
                ])
              }
            >
              <Plus aria-hidden size={18} strokeWidth={1.75} />
              Adaugă un personaj
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {body.characters.map((character, index) => (
              <ItemCard
                key={character.id}
                title={character.name.trim() || `Personajul ${index + 1}`}
                meta={character.role}
                actions={
                  <ReorderControls
                    index={index}
                    total={body.characters.length}
                    onMove={(delta) =>
                      set("characters", moveItem(body.characters, index, delta))
                    }
                    onRemove={() =>
                      set(
                        "characters",
                        body.characters.filter(
                          (entry) => entry.id !== character.id,
                        ),
                      )
                    }
                  />
                }
              >
                <div className="grid gap-4 tablet:grid-cols-2">
                  <TextField
                    label="Nume"
                    value={character.name}
                    onChange={(next) =>
                      set(
                        "characters",
                        body.characters.map((entry) =>
                          entry.id === character.id
                            ? { ...entry, name: next }
                            : entry,
                        ),
                      )
                    }
                  />
                  <TextField
                    label="Rol în poveste"
                    value={character.role}
                    onChange={(next) =>
                      set(
                        "characters",
                        body.characters.map((entry) =>
                          entry.id === character.id
                            ? { ...entry, role: next }
                            : entry,
                        ),
                      )
                    }
                  />
                </div>
                <TextAreaField
                  label="Trăsături"
                  rows={2}
                  value={character.traits}
                  onChange={(next) =>
                    set(
                      "characters",
                      body.characters.map((entry) =>
                        entry.id === character.id
                          ? { ...entry, traits: next }
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

    case "scenes":
      return (
        <SectionFrame
          title="Scene"
          hint="Firul narativ, de la introducere la final."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                set("scenes", [
                  ...body.scenes,
                  {
                    id: newItemId("scena"),
                    type: "development",
                    title: `Scena ${body.scenes.length + 1}`,
                    narration: "",
                    reflectionPrompt: "",
                  },
                ])
              }
            >
              <Plus aria-hidden size={18} strokeWidth={1.75} />
              Adaugă o scenă
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {body.scenes.map((scene, index) => (
              <ItemCard
                key={scene.id}
                title={scene.title.trim() || `Scena ${index + 1}`}
                meta={SCENE_TYPE_LABEL[scene.type]}
                actions={
                  <ReorderControls
                    index={index}
                    total={body.scenes.length}
                    onMove={(delta) =>
                      set("scenes", moveItem(body.scenes, index, delta))
                    }
                    onRemove={() =>
                      set(
                        "scenes",
                        body.scenes.filter((entry) => entry.id !== scene.id),
                      )
                    }
                  />
                }
              >
                <div className="grid gap-4 tablet:grid-cols-2">
                  <TextField
                    label="Titlul scenei"
                    value={scene.title}
                    onChange={(next) =>
                      set(
                        "scenes",
                        body.scenes.map((entry) =>
                          entry.id === scene.id
                            ? { ...entry, title: next }
                            : entry,
                        ),
                      )
                    }
                  />
                  <ChoiceField
                    label="Rolul scenei"
                    value={scene.type}
                    options={SCENE_TYPE_LABEL}
                    onChange={(next) =>
                      set(
                        "scenes",
                        body.scenes.map((entry) =>
                          entry.id === scene.id
                            ? { ...entry, type: next }
                            : entry,
                        ),
                      )
                    }
                  />
                </div>
                <TextAreaField
                  label="Text"
                  rows={4}
                  value={scene.narration}
                  onChange={(next) =>
                    set(
                      "scenes",
                      body.scenes.map((entry) =>
                        entry.id === scene.id
                          ? { ...entry, narration: next }
                          : entry,
                      ),
                    )
                  }
                />
                <TextField
                  label="Întrebare pentru clasă"
                  hint="Opțional. Ce întrebi după această scenă."
                  value={scene.reflectionPrompt}
                  onChange={(next) =>
                    set(
                      "scenes",
                      body.scenes.map((entry) =>
                        entry.id === scene.id
                          ? { ...entry, reflectionPrompt: next }
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

    case "reflection":
      return (
        <SectionFrame
          title="Reflecție"
          hint="Ce discutați după ce se termină povestea."
        >
          <StringListEditor
            label="Activități după lectură"
            items={body.activities}
            onChange={(next) => set("activities", [...next])}
            addLabel="Adaugă o activitate"
          />
          <TextAreaField
            label="Discuția de final"
            rows={5}
            value={body.reflection}
            onChange={(next) => set("reflection", next)}
          />
          <TextAreaField
            label="Notițele tale"
            rows={3}
            value={body.teacherNotes}
            onChange={(next) => set("teacherNotes", next)}
          />
        </SectionFrame>
      );

    default:
      return null;
  }
}
