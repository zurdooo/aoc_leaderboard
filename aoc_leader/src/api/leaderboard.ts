const API_BASE =
  (import.meta as ImportMeta).env?.VITE_API_BASE ?? "http://localhost:3001";

const SAMPLE_ENTRIES: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "demo-user-1",
    username: "DemoUser",
    year: 2024,
    day: 5,
    part1Completed: true,
    part2Completed: true,
    language: "python",
    executionTimeMs: 742,
    memoryUsageKb: 12800,
    linesOfRelevantCode: 64,
    submittedAt: new Date("2024-12-05T14:32:00Z").toISOString(),
  },
];

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  year?: number;
  day: number;
  part1Completed: boolean;
  part2Completed: boolean;
  language: string;
  executionTimeMs: number;
  memoryUsageKb: number;
  linesOfRelevantCode: number;
  submittedAt: string;
}

export interface LeaderboardFilters {
  year?: number;
  day?: number;
  language?: string;
  username?: string;
  limit?: number;
  cursor?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  nextCursor?: string;
}

const filterSampleEntries = (filters: LeaderboardFilters = {}) =>
  SAMPLE_ENTRIES.filter((entry) => {
    if (filters.year && entry.year !== filters.year) return false;
    if (filters.day && entry.day !== filters.day) return false;
    if (
      filters.language &&
      entry.language.toLowerCase() !== filters.language.toLowerCase()
    ) {
      return false;
    }
    if (
      filters.username &&
      entry.username.toLowerCase() !== filters.username.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

const buildQuery = (filters: LeaderboardFilters) => {
  const params = new URLSearchParams();
  if (filters.year) params.set("year", filters.year.toString());
  if (filters.day) params.set("day", filters.day.toString());
  if (filters.language) params.set("language", filters.language);
  if (filters.username) params.set("username", filters.username);
  if (filters.limit) params.set("limit", filters.limit.toString());
  if (filters.cursor) params.set("cursor", filters.cursor);
  return params;
};

export async function fetchLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardResponse> {
  const params = buildQuery(filters);
  const queryString = params.toString();
  const url = `${API_BASE}/api/leaderboard${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 404) {
        return { entries: filterSampleEntries(filters) };
      }
      const message =
        payload?.error || `Failed to fetch leaderboard (${response.status})`;
      throw new Error(message);
    }

    if (Array.isArray(payload)) {
      return { entries: payload };
    }

    if (payload?.entries && Array.isArray(payload.entries)) {
      return {
        entries: payload.entries,
        nextCursor: payload.nextCursor,
      };
    }

    return {
      entries: [],
    };
  } catch (error) {
    console.warn("Falling back to sample leaderboard data", error);
    return { entries: filterSampleEntries(filters) };
  }
}
