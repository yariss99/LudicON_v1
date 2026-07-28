import { SCENE_TYPES } from "../constants";
import { useStoryBuilder } from "../hooks/useStoryBuilder";

export function StoryPreview() {
  const { story, previewSceneId, setPreviewSceneId } = useStoryBuilder();
  const scenes = [...story.scenes].sort((a, b) => a.order - b.order);
  const scene =
    scenes.find((s) => s.id === previewSceneId) ?? scenes[0] ?? null;

  if (!scene) {
    return (
      <div className="sb-empty">
        Nu există scene de previzualizat. Generează povestea mai întâi.
      </div>
    );
  }

  return (
    <section>
      <h2 className="sb-section-title">Previzualizare</h2>
      <p className="sb-lead">
        Citește scena și urmează alegerile — ca un elev.
      </p>
      <div className="sb-preview">
        <div className="sb-chip">
          {SCENE_TYPES.find((t) => t.id === scene.type)?.label}
        </div>
        <h3>{scene.title}</h3>
        <p>{scene.narration}</p>
        {scene.dialogue ? <blockquote>{scene.dialogue}</blockquote> : null}
        {scene.challenge ? (
          <p>
            <strong>Provocare:</strong> {scene.challenge}
          </p>
        ) : null}
        {scene.activity ? (
          <p>
            <strong>Activitate:</strong> {scene.activity}
          </p>
        ) : null}
        {scene.reflectionPrompt ? (
          <p>
            <strong>Reflecție:</strong> {scene.reflectionPrompt}
          </p>
        ) : null}
        <div className="sb-actions" style={{ marginTop: "1rem" }}>
          {scene.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={() => {
                if (c.targetSceneId) setPreviewSceneId(c.targetSceneId);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="sb-actions" style={{ marginTop: "0.85rem" }}>
        {scenes.map((s) => (
          <button
            key={s.id}
            type="button"
            className={[
              "sb-btn",
              s.id === scene.id ? "sb-btn-primary" : "",
            ].join(" ")}
            onClick={() => setPreviewSceneId(s.id)}
          >
            {s.title}
          </button>
        ))}
      </div>
    </section>
  );
}
