/*
When we receive a valid code submission, we will spawn a docker container and return a completed 
leaderboard entry after running the code inside the container.\
After saving the uploaded files, run them inside the Docker sandbox,
get the results (stdout, stderr, exit code, time, memory),
then use interpret those stats to build and return a LeaderboardEntry.
*/

import { LeaderboardEntry } from "./types/leaderboard";

var Docker = require("../lib/docker");

/// Runs the submission code inside a Docker container, captures stats and creates a LeaderboardEntry in the db
/// If successful we should have the user update their view of the leaderboard
function runSubmission(
  solutionBuffer: Buffer,
  entry: LeaderboardEntry
): LeaderboardEntry {
  // TODO: spawn the Docker container, run solutionBuffer, collect stdout/stderr/exit/time/memory
  // and update the provided `entry` with the collected stats before returning.
  // For now return the provided entry to satisfy the return type.
  return entry;
}

export { runSubmission };
