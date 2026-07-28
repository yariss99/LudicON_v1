import {
  CONTINUE_LABEL,
  PRIMARY_QUESTION,
  PRIMARY_QUESTION_HINT,
  WRITING_PLACEHOLDER,
} from "../constants";
import type { ConversationMessage } from "../types";
import GuidedPedagogicalReply from "./GuidedPedagogicalReply";
import SecondaryStartOptions, {
  type SecondaryOptionId,
} from "./SecondaryStartOptions";
import ThinkingIndicator from "./ThinkingIndicator";

type FirstConversationProps = {
  input: string;
  onInputChange: (value: string) => void;
  onContinue: () => void;
  onSecondarySelect: (id: SecondaryOptionId) => void;
  streaming: { active: boolean; label: string };
  error: string | null;
  onRetry: () => void;
  latestPrimaMessage: ConversationMessage | null;
  conversationStarted: boolean;
  canOpenReview: boolean;
  onOpenReview: () => void;
};

function FirstConversation({
  input,
  onInputChange,
  onContinue,
  onSecondarySelect,
  streaming,
  error,
  onRetry,
  latestPrimaMessage,
  conversationStarted,
  canOpenReview,
  onOpenReview,
}: FirstConversationProps) {
  const guided = latestPrimaMessage?.guided;
  const headline = conversationStarted
    ? "Continuăm să modelăm lecția"
    : PRIMARY_QUESTION;
  const hint = conversationStarted
    ? "Răspunde la următorul pas de mai jos — un gând clar e de ajuns."
    : PRIMARY_QUESTION_HINT;

  return (
    <div className="flex min-h-[560px] flex-col">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {conversationStarted
            ? "Spune-mi despre lecția ta"
            : "Prima conversație"}
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl sm:leading-tight">
          {headline}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-500">
          {hint}
        </p>

        {guided && !streaming.active ? (
          <div className="mt-8">
            <GuidedPedagogicalReply guided={guided} />
          </div>
        ) : null}

        <label className="sr-only" htmlFor="first-conversation-writing">
          {headline}
        </label>
        <textarea
          id="first-conversation-writing"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          disabled={streaming.active}
          rows={conversationStarted ? 6 : 8}
          placeholder={
            conversationStarted
              ? "Adaugă următorul gând despre lecție…"
              : WRITING_PLACEHOLDER
          }
          className="mt-10 w-full resize-none rounded-3xl border-0 bg-white px-6 py-6 text-lg leading-relaxed text-slate-800 shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 placeholder:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-60"
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onContinue}
            disabled={streaming.active || !input.trim()}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-8 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
          >
            {CONTINUE_LABEL}
          </button>
          {canOpenReview ? (
            <button
              type="button"
              onClick={onOpenReview}
              className="inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              Deschide proiectul lecției
            </button>
          ) : null}
        </div>

        {streaming.active ? (
          <div className="mt-8">
            <ThinkingIndicator label={streaming.label} />
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-700 ring-1 ring-slate-200/80"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-semibold text-slate-900 underline-offset-2 hover:underline"
            >
              Încearcă din nou
            </button>
          </div>
        ) : null}

        {!conversationStarted ? (
          <div className="mt-12">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Sau începe altfel
            </p>
            <SecondaryStartOptions onSelect={onSecondarySelect} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FirstConversation;
