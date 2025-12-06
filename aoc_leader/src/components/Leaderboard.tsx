import { useMemo, useState } from "react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import type { LeaderboardFilters as QueryFilters } from "../api/leaderboard";
import LeaderboardFilters from "./LeaderboardFilters";
import type { LeaderboardFilterFormState } from "./LeaderboardFilters";
import LeaderboardTable from "./LeaderboardTable";
import "./Leaderboard.css";

const DEFAULT_FORM: LeaderboardFilterFormState = {
  year: "",
  day: "",
  language: "",
  username: "",
};

const toQueryFilters = (
  form: LeaderboardFilterFormState
): QueryFilters => ({
  year: form.year ? Number(form.year) : undefined,
  day: form.day ? Number(form.day) : undefined,
  language: form.language.trim() || undefined,
  username: form.username.trim() || undefined,
});

export default function Leaderboard() {
  const [form, setForm] = useState<LeaderboardFilterFormState>(DEFAULT_FORM);

  const filters = useMemo(() => toQueryFilters(form), [form]);
  const { entries, error, isLoading, refresh } = useLeaderboard(filters);

  return (
    <section className="leaderboard">
      <div className="leaderboard-header">
        <div>
          <h2>Global Leaderboard</h2>
          <p className="leaderboard-subtitle">
            Sorted by most recent submission. Use filters to narrow down by
            year, day, language, or user.
          </p>
        </div>
        <button className="btn secondary" onClick={refresh}>
          Refresh
        </button>
      </div>

      <div className="leaderboard-panel leaderboard-card">
        <LeaderboardFilters
          filters={form}
          onChange={setForm}
          onReset={() => setForm(DEFAULT_FORM)}
        />
        <LeaderboardTable
          entries={entries}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </section>
  );
}
