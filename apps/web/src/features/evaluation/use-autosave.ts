import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";
import { nowTimestamp } from "@ludicon/domain";
import { touch, type EvaluationProject } from "@ludicon/evaluation";

import { repositories } from "../../lib/data";
import { evaluationProjectQueries } from "../../lib/evaluation-queries";

/**
 * Autosave: one debounced `put`, never a `transact`.
 *
 * This is a correctness constraint, not a preference.
 * `LocalStorageProvider.transact` snapshots the entire `ludicon.*` keyspace
 * before running its work so it can restore on failure — which is the right
 * thing for a multi-record write and completely wrong here. A paper is a single
 * record; saving it inside a transaction would copy every project, every
 * document and every version in storage on each save. Debounced at 700ms and
 * typing steadily, that is several megabytes of copying a second for a write
 * that touches one key. The reasoning was checked against
 * `LocalStorageProvider.transact` and it holds: the snapshot loop is over
 * `localStorage.length`, not over the collection being written.
 *
 * 700ms is the house value: CH-LESSON-001 puts autosave between 600 and 800ms
 * and `legacy/builder/useBuilder.ts` set the precedent at 700.
 *
 * The timer is keyed on the document's identity. Every command produces a new
 * document object, so every edit restarts the countdown and a quiet moment
 * commits — including a quiet moment that arrives because the teacher pressed
 * undo, which is an edit like any other and must reach disk.
 *
 * `touch` stamps `updatedAt` HERE and nowhere else. Commands are deliberately
 * time-free so that a command and its inverse are exact opposites; the clock
 * enters once, at the persistence boundary, exactly as that package's
 * `model/project.ts` argues.
 *
 * Two ways this could lose an edit, both closed below:
 *
 *  - THE DEBOUNCE WINDOW. The cleanup cleared the pending timer on unmount, so
 *    typing a word and immediately clicking "Înapoi la proiecte" threw the word
 *    away — silently, with the indicator still reading "Salvat". The unmount
 *    effect flushes instead of cancelling.
 *  - A FAILED WRITE. The old comment said "the next keystroke retries", which is
 *    true and useless: the write most likely to fail is the last one, after
 *    which there are no more keystrokes. A failure now re-arms the timer with a
 *    backoff, and `persisted` is still only advanced on success, so the retry
 *    always sends the newest document rather than the one that failed.
 */

const AUTOSAVE_DELAY_MS = 700;

/**
 * Backoff for a failed write, capped.
 *
 * Storage failures are quota or a locked profile — conditions that clear on a
 * human timescale or not at all. Retrying every 700ms would spin; giving up
 * would lose the edit. Five seconds is slow enough to be free and fast enough
 * that a teacher who closes a stray tab gets their work saved.
 */
const RETRY_DELAY_MS = 5_000;

export type SaveState = "idle" | "saving" | "saved" | "failed";

export function useAutosave(document: EvaluationProject): SaveState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SaveState>("idle");

  /**
   * What is already on disk.
   *
   * Seeded with the document the route loaded, so opening a paper and touching
   * nothing writes nothing — otherwise every visit would bump `updatedAt` and
   * reorder the teacher's own library.
   */
  const persisted = useRef<EvaluationProject>(document);

  /**
   * The newest document, readable from the unmount effect.
   *
   * The flush effect must not depend on `document`, or it would run its cleanup
   * on every edit and flush constantly — which is the debounce gone. A ref is
   * how an effect that runs once reads a value that changes.
   */
  const latest = useRef<EvaluationProject>(document);
  latest.current = document;

  /** Counts failures, purely to re-run the effect after a backoff. */
  const [attempt, setAttempt] = useState(0);

  const persist = useCallback(
    async (next: EvaluationProject): Promise<boolean> => {
      try {
        const saved = await repositories.evaluationProjects.save(
          touch(next, nowTimestamp()),
        );
        persisted.current = next;
        refreshCache(queryClient, saved);
        return true;
      } catch {
        return false;
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (document === persisted.current) return;

    const timer = window.setTimeout(
      () => {
        setState("saving");
        void persist(document).then((ok) => {
          setState(ok ? "saved" : "failed");
          // Re-arms this effect. Deliberately no toast: a failed write here is
          // recoverable, and a toast per keystroke during a storage hiccup is
          // its own failure.
          if (!ok) setAttempt((count) => count + 1);
        });
      },
      attempt === 0 ? AUTOSAVE_DELAY_MS : RETRY_DELAY_MS,
    );

    return () => window.clearTimeout(timer);
  }, [document, attempt, persist]);

  /**
   * The last write, on the way out.
   *
   * Runs on unmount only — an empty dependency list, reading `latest` — so it
   * fires exactly once, when the builder is being torn down and the debounced
   * timer is about to be cancelled. With the local provider the write reaches
   * storage synchronously inside the promise body, so it lands before the page
   * goes; over HTTP it would not, which is one more reason writes cannot cross
   * that seam yet (see `HttpProvider.put`).
   */
  useEffect(
    () => () => {
      if (latest.current !== persisted.current) void persist(latest.current);
    },
    [persist],
  );

  return state;
}

/**
 * The detail entry is written by hand; the lists are invalidated.
 *
 * `lists()` and not `list()`: there are two list entries — the active one the
 * rail and desk share, and the "everything, archive included" one the projects
 * page uses — and the narrower key is a prefix of neither. Invalidating it left
 * a freshly renamed paper showing its old title in the list the teacher was
 * about to navigate back to.
 *
 * The detail is set rather than invalidated because it is already correct: this
 * tab wrote it. Invalidating would re-read and re-parse the whole document from
 * storage to arrive at the value in hand.
 */
function refreshCache(
  queryClient: QueryClient,
  saved: EvaluationProject,
): void {
  queryClient.setQueryData(
    evaluationProjectQueries.detail(saved.id).queryKey,
    saved,
  );
  void queryClient.invalidateQueries({
    queryKey: queryKeys.evaluationProjects.lists(),
  });
}
