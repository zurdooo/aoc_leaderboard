import type { FormEvent } from "react";
import "./styles/Leaderboard.css";

export interface LeaderboardFilterFormState {
  year: string;
  day: string;
  language: string;
  username: string;
}

interface LeaderboardFiltersProps {
  filters: LeaderboardFilterFormState;
  onChange: (next: LeaderboardFilterFormState) => void;
  onReset: () => void;
  onRefresh: () => void;
}

const numberInputProps = {
  min: 2015,
  max: 2100,
};

// TODO: Instead of matching name exactly, allow partial matches

export default function LeaderboardFilters({
  filters,
  onChange,
  onReset,
  onRefresh,
}: LeaderboardFiltersProps) {
  const update = (key: keyof LeaderboardFilterFormState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = (event: FormEvent) => {
    event.preventDefault();
    onReset();
  };

  return (
    <form className="leaderboard-filters" onSubmit={handleReset}>
      <div className="filter-grid inline-action">
        <label className="filter-field">
          <span>Year</span>
          <input
            type="number"
            placeholder="All"
            inputMode="numeric"
            value={filters.year}
            onChange={(e) => update("year", e.target.value)}
            {...numberInputProps}
          />
        </label>
        <label className="filter-field">
          <span>Day</span>
          <input
            type="number"
            placeholder="All"
            min={1}
            max={25}
            value={filters.day}
            onChange={(e) => update("day", e.target.value)}
          />
        </label>
        <label className="filter-field">
          <span>Language</span>
          <select
            value={filters.language}
            onChange={(e) => update("language", e.target.value)}
          >
            <option value="">All languages</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        </label>
        <label className="filter-field">
          <span>User</span>
          <input
            type="text"
            placeholder="Anyone"
            value={filters.username}
            onChange={(e) => update("username", e.target.value)}
          />
        </label>
        <div className="filter-actions">
          <button type="button" className="btn secondary" onClick={onRefresh}>
            Refresh
          </button>
          <button type="submit" className="btn secondary">
            Clear filters
          </button>
        </div>
      </div>
    </form>
  );
}
