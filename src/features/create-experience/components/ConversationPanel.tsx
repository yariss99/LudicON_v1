import type { ConversationMessage } from "../types";
import { EMPTY_HEADLINE } from "../constants";
import ConversationInput from "./ConversationInput";
import MessageBubble from "./MessageBubble";
import ThinkingIndicator from "./ThinkingIndicator";

type ConversationPanelProps = {
  messages: ConversationMessage[];
  started: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onBegin: () => void;
  streaming: { active: boolean; label: string };
  error: string | null;
  onRetry: () => void;
};

function ConversationPanel({
  messages,
  started,
  input,
  onInputChange,
  onSend,
  onBegin,
  streaming,
  error,
  onRetry,
}: ConversationPanelProps) {
  return (
    <div className="flex h-full min-h-[480px] flex-col rounded-3xl bg-[#F8F9FB] ring-1 ring-slate-200/60">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
        {!started ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center">
            <div className="relative mb-6 h-28 w-44" aria-hidden>
              <div className="absolute inset-x-4 top-2 h-20 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/80" />
              <div className="absolute inset-x-10 top-8 h-12 rounded-2xl bg-slate-50 ring-1 ring-slate-100" />
              <div className="absolute left-1/2 top-12 h-2 w-20 -translate-x-1/2 rounded-full bg-sky-200" />
            </div>
            <h2 className="max-w-sm text-2xl font-semibold tracking-tight text-slate-900">
              {EMPTY_HEADLINE}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              No forms. One calm conversation that builds your Instructional
              Blueprint.
            </p>
            <button
              type="button"
              onClick={onBegin}
              className="mt-8 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              Start conversation
            </button>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {streaming.active ? (
              <ThinkingIndicator label={streaming.label} />
            ) : null}
          </>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="mx-4 mb-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100 sm:mx-6"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-semibold underline-offset-2 hover:underline"
          >
            Continue conversation
          </button>
        </div>
      ) : null}

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <ConversationInput
          value={input}
          onChange={onInputChange}
          onSubmit={onSend}
          disabled={streaming.active}
        />
      </div>
    </div>
  );
}

export default ConversationPanel;
