/*
When we receive a valid code submission, we will spawn a docker container and return a completed 
leaderboard entry after running the code inside the container.\
After saving the uploaded files, run them inside the Docker sandbox,
get the results (stdout, stderr, exit code, time, memory),
then use interpret those stats to build and return a LeaderboardEntry.
*/
