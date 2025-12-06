import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchLeaderboard } from "../api/leaderboard";
import type { LeaderboardEntry, LeaderboardFilters } from "../api/leaderboard";

interface UseLeaderboardResult {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLeaderboard(
  filters: LeaderboardFilters
): UseLeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestFilters = useRef(filters);

  const serializedFilters = useMemo(
    () => JSON.stringify(filters ?? {}),
    [filters]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { entries: data } = await fetchLeaderboard(latestFilters.current);
      setEntries(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    latestFilters.current = filters;
  }, [filters]);

  useEffect(() => {
    load();
  }, [serializedFilters, load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return {
    entries,
    isLoading,
    error,
    refresh,
  };
}
