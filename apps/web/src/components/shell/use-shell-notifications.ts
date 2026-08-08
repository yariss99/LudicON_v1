import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EvaluationProject } from "@ludicon/evaluation";

import { evaluationProjectQueries } from "../../lib/evaluation-queries";
import { paperTitle } from "../../routes/_studio/-shared/paper-presentation";

const SEEN_KEY = "prima.shell.notifications-seen";
const MAX_ITEMS = 6;

/**
 * What the teacher is told about.
 *
 * Every entry is derived from the teacher's own papers — this is not a separate
 * feed that has to be invented, kept in sync and eventually apologised for.
 *
 * It used to say the same thing about `Project.state`, and the five messages it
 * kept were one per phase of the lesson-planning loop: "Designul a fost
 * aprobat", "Lecția a fost publicată". None of those events can happen any more,
 * so the honest replacement is the one distinction a paper actually carries —
 * whether it has been touched since it was made. Two messages, both readable
 * straight off the record, and neither of them a status the product had to
 * decide on the teacher's behalf.
 */
export interface ShellNotification {
  id: string;
  /** The evaluation this is about. */
  subject: string;
  /** What changed, phrased as something that happened, not as a status code. */
  message: string;
  /** ISO-8601 instant of the change. */
  at: string;
  unread: boolean;
}

function readSeen(): string {
  try {
    return globalThis.localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    // Storage can be unavailable; everything simply reads as new.
    return "";
  }
}

const RELATIVE_TIME = new Intl.RelativeTimeFormat("ro", { numeric: "auto" });

/** "acum 2 ore", "ieri" — locale-aware, never a raw timestamp in the list. */
export function formatRelativeTime(iso: string): string {
  const instant = new Date(iso).getTime();
  if (Number.isNaN(instant)) return "";

  const minutes = Math.round((instant - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return RELATIVE_TIME.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return RELATIVE_TIME.format(hours, "hour");

  return RELATIVE_TIME.format(Math.round(hours / 24), "day");
}

function toNotification(
  paper: EvaluationProject,
  seenAt: string,
): ShellNotification {
  return {
    id: paper.id,
    subject: paperTitle(paper),
    message:
      paper.updatedAt === paper.createdAt
        ? "Proiect nou, gata de completat"
        : "Ai lucrat la această evaluare",
    at: paper.updatedAt,
    unread: paper.updatedAt > seenAt,
  };
}

export interface ShellNotificationsState {
  items: readonly ShellNotification[];
  unreadCount: number;
  isPending: boolean;
  markAllSeen: () => void;
}

export function useShellNotifications(): ShellNotificationsState {
  const papers = useQuery(evaluationProjectQueries.active());
  const [seenAt, setSeenAt] = useState<string>(readSeen);

  const items = useMemo(
    () =>
      (papers.data ?? [])
        .slice(0, MAX_ITEMS)
        .map((paper) => toNotification(paper, seenAt)),
    [papers.data, seenAt],
  );

  const markAllSeen = useCallback(() => {
    const newest = items[0]?.at ?? new Date().toISOString();
    setSeenAt((current) => (newest > current ? newest : current));
    try {
      globalThis.localStorage.setItem(SEEN_KEY, newest);
    } catch {
      // See readSeen — losing the marker is acceptable, throwing is not.
    }
  }, [items]);

  return {
    items,
    unreadCount: items.filter((item) => item.unread).length,
    isPending: papers.isPending,
    markAllSeen,
  };
}
