import { QueryClient } from "@tanstack/react-query";
import { DataIntegrityError } from "@ludicon/data-access";

/**
 * Query defaults.
 *
 * The library ships `staleTime: 0`, which makes every mount refetch. For an
 * authoring tool where the teacher is the only writer, that is pure noise —
 * a short stale window is both calmer and cheaper.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        // Refetching on focus makes an authoring surface feel twitchy and can
        // yank content out from under someone mid-edit.
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // A schema mismatch will fail identically every time; retrying it
          // just delays surfacing a real bug.
          if (error instanceof DataIntegrityError) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
