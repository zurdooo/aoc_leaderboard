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

interface LeaderboardProps {
  onSubmitClick: () => void;
}

export default function Leaderboard({ onSubmitClick }: LeaderboardProps) {
  const [form, setForm] = useState<LeaderboardFilterFormState>(DEFAULT_FORM);

  const filters = useMemo(() => toQueryFilters(form), [form]);
  const { entries, error, isLoading, refresh } = useLeaderboard(filters);

  return (
    <section className="leaderboard">
      <div className="leaderboard-panel leaderboard-card">
        <div className="leaderboard-panel-header">
          <h2>Global Leaderboard</h2>
          <button className="btn primary submit-btn" onClick={onSubmitClick}>
            Submit Solution
          </button>
        </div>
        <LeaderboardFilters
          filters={form}
          onChange={setForm}
          onReset={() => setForm(DEFAULT_FORM)}
          onRefresh={refresh}
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
