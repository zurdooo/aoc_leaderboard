import type { LeaderboardEntry } from "../api/leaderboard";
import "./Leaderboard.css";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

const formatDuration = (ms: number) => {
  if (!Number.isFinite(ms) || ms < 0) return "-";
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function LeaderboardTable({
  entries,
  isLoading,
  error,
}: LeaderboardTableProps) {
  const renderState = (message: string, variant: "error" | "info" = "info") => (
    <div className={`leaderboard-state ${variant}`}>
      <p className={`state-text ${variant === "error" ? "error" : ""}`}>
        {message}
      </p>
    </div>
  );

  if (error) {
    return <div className="leaderboard-table-container">{renderState(error, "error")}</div>;
  }

  if (isLoading) {
    return (
      <div className="leaderboard-table-container">
        {renderState("Loading leaderboard…")}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="leaderboard-table-container">
        {renderState("No submissions match the selected filters.")}
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return (
    <div className="leaderboard-table-container">
      <div className="table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Year/Day</th>
              <th>Language</th>
              <th>Parts</th>
              <th>Exec Time</th>
              <th>Memory</th>
              <th>Lines</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={`${entry.userId}-${entry.day}-${entry.submittedAt}`}>
                <td>{entry.rank}</td>
                <td>
                  <div className="user-cell">
                    <span className="username">{entry.username}</span>
                    <span className="user-id">{entry.userId}</span>
                  </div>
                </td>
                <td>
                  <div className="meta-cell">
                    <span>{entry.year ?? "All"}</span>
                    <span>Day {entry.day}</span>
                  </div>
                </td>
                <td>{entry.language}</td>
                <td>
                  <span className={entry.part1Completed ? "pill success" : "pill"}>
                    P1
                  </span>
                  <span className={entry.part2Completed ? "pill success" : "pill"}>
                    P2
                  </span>
                </td>
                <td>{formatDuration(entry.executionTimeMs)}</td>
                <td>{entry.memoryUsageKb ? `${entry.memoryUsageKb} kb` : "-"}</td>
                <td>{entry.linesOfRelevantCode || "-"}</td>
                <td>{formatDate(entry.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
