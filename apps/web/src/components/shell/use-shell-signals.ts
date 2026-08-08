import { useQuery } from "@tanstack/react-query";
import type { EvaluationProject } from "@ludicon/evaluation";

import { evaluationProjectQueries } from "../../lib/evaluation-queries";
import type { NavSignal } from "../../lib/navigation";

/** Three fits the rail without pushing the footer off a laptop screen. */
const RECENT_LIMIT = 3;

/**
 * What the shell knows about the teacher's own work.
 *
 * The rail used to be blind: every link looked identical whether the teacher
 * had forty evaluations or none. Everything here is read through the same
 * `queryOptions` the pages use, so a rail number and a page number can never
 * disagree — and there is nothing to invent when the workspace is empty,
 * because an absent count renders as no chip at all.
 *
 * ONE query, and that is now the whole file. It is literally
 * `evaluationProjectQueries.active()`, the value the desk and the notification
 * feed also pass to `useQuery`. Sharing the options object rather than retyping
 * the key beside a matching fetcher is the whole reason that layer exists; this
 * file used to hold the second copy.
 *
 * There was a second query here, reading `resources` inline for the library's
 * chip. It is gone with the library. It fetched a collection no code path in
 * this app writes, so the chip it fed was a permanent zero — a number the rail
 * paid a request for on every mount in order to say nothing. The alternative
 * considered was moving it behind the `queryOptions` layer like the papers
 * query; that would have made a fetcher with nothing to fetch look deliberate,
 * which is the opposite of what was needed.
 */
export interface ShellSignals {
  /** Live counts by signal name. A missing entry means "nothing to say". */
  counts: Readonly<Partial<Record<NavSignal, number>>>;
  /** Most recently touched papers, newest first. */
  recent: readonly EvaluationProject[];
}

export function useShellSignals(unreadCount: number): ShellSignals {
  const papers = useQuery(evaluationProjectQueries.active());

  const paperList = papers.data ?? [];

  return {
    counts: {
      projects: paperList.length,
      unread: unreadCount,
    },
    recent: paperList.slice(0, RECENT_LIMIT),
  };
}
