import { MarkdownContent } from "./MarkdownContent";
import { useAiCopilot } from "../hooks/useAiCopilot";

export function ResponseCard({ content }: { content: string }) {
  const { applyResponse } = useAiCopilot();

  return (
    <article className="ac-card">
      <div className="ac-card-body">
        <MarkdownContent source={content} />
      </div>
      <div className="ac-card-actions">
        <button
          type="button"
          className="ac-btn ac-btn-primary"
          onClick={() => applyResponse(content, "insert")}
        >
          Insert
        </button>
        <button
          type="button"
          className="ac-btn"
          onClick={() => applyResponse(content, "copy")}
        >
          Copy
        </button>
        <button
          type="button"
          className="ac-btn"
          onClick={() => applyResponse(content, "replace")}
        >
          Replace
        </button>
        <button
          type="button"
          className="ac-btn"
          onClick={() => applyResponse(content, "append")}
        >
          Append
        </button>
        <button
          type="button"
          className="ac-btn"
          onClick={() => applyResponse(content, "save_note")}
        >
          Save as Note
        </button>
      </div>
    </article>
  );
}
