import { useCallback, useEffect, useState } from "react";
import { INSIGHT_LOAD_DELAY_MS } from "../constants";
import {
  dismissInsightForToday,
  resolveInitialTeachingInsight,
} from "../services";
import type { InsightState, TeachingInsight } from "../types";

export function useTeachingInsight(experienceId?: string | null) {
  const [state, setState] = useState<InsightState>("loading");
  const [insight, setInsight] = useState<TeachingInsight | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setWhyOpen(false);

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const next = resolveInitialTeachingInsight(experienceId);
      setInsight(next);
      setState(next ? "available" : "none");
    }, INSIGHT_LOAD_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [experienceId]);

  const accept = useCallback(() => {
    setWhyOpen(false);
    setState("accepted");
  }, []);

  const dismiss = useCallback(() => {
    if (insight) {
      dismissInsightForToday(insight.id);
    }
    setWhyOpen(false);
    setState("dismissed");
  }, [insight]);

  const toggleWhy = useCallback(() => {
    setWhyOpen((open) => !open);
  }, []);

  return {
    state,
    insight,
    whyOpen,
    accept,
    dismiss,
    toggleWhy,
  };
}
