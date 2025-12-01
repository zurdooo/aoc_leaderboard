/*
When we receive a valid code submission, we will spawn a docker container and return a completed 
leaderboard entry after running the code inside the container.
After saving the uploaded files, run them inside the Docker sandbox,
get the results (stdout, stderr, exit code, time, memory),
then use interpret those stats to build and return a LeaderboardEntry.
*/

import { LeaderboardEntry } from "./types/leaderboard";
import Docker from "dockerode";
import { Readable, PassThrough } from "stream";

const docker = new Docker();

// Container config by language
const LANGUAGE_CONFIG: Record<string, { image: string; cmd: (filename: string) => string[] }> = {
  python: {
    image: "python:3.11-slim",
    cmd: (filename) => ["python", filename],
  },
  c: {
    image: "gcc:latest",
    cmd: (filename) => ["sh", "-c", `gcc -o /tmp/solution ${filename} && /tmp/solution`],
  },
  cpp: {
    image: "gcc:latest",
    cmd: (filename) => ["sh", "-c", `g++ -o /tmp/solution ${filename} && /tmp/solution`],
  },
};

// Timeout for container execution (30 seconds)
const EXECUTION_TIMEOUT_MS = 30000;
// Memory limit for container (256MB)
const MEMORY_LIMIT = 256 * 1024 * 1024;

interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsageKb: number;
}

/**
 * Detect language from file extension or mimetype
 */
function detectLanguage(filename: string, mimetype: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  
  if (ext === "py" || mimetype.includes("python")) return "python";
  if (ext === "c") return "c";
  if (ext === "cpp" || ext === "cc" || ext === "cxx") return "cpp";
  
  // Default to python if unknown
  return "python";
}

/**
 * Collect stream output into a string
 */
function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}

/**
 * Runs code inside a Docker container and captures execution stats
 */
async function executeInContainer(
  code: Buffer,
  language: string,
  inputBuffer?: Buffer
): Promise<ExecutionResult> {
  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const filename = `/tmp/solution.${language === "python" ? "py" : language}`;

  // Ensure image is available
  try {
    await docker.getImage(config.image).inspect();
  } catch {
    console.log(`Pulling image ${config.image}...`);
    await new Promise<void>((resolve, reject) => {
      docker.pull(config.image, (err: Error | null, stream: Readable) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // Create container
  const container = await docker.createContainer({
    Image: config.image,
    Cmd: config.cmd(filename),
    WorkingDir: "/tmp",
    HostConfig: {
      Memory: MEMORY_LIMIT,
      MemorySwap: MEMORY_LIMIT, // Disable swap
      NetworkMode: "none", // No network access for security
      AutoRemove: false, // We'll remove manually after getting stats
      PidsLimit: 100, // Limit processes
    },
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: !!inputBuffer,
    OpenStdin: !!inputBuffer,
    StdinOnce: true,
    Tty: false,
  });

  try {
    // Copy solution code to container
    const tarStream = createTarStream(filename.replace("/tmp/", ""), code);
    await container.putArchive(tarStream, { path: "/tmp" });

    // If there's input, copy it too
    if (inputBuffer) {
      const inputTar = createTarStream("input.txt", inputBuffer);
      await container.putArchive(inputTar, { path: "/tmp" });
    }

    // Attach to container streams
    const attachOptions = {
      stream: true,
      stdout: true,
      stderr: true,
      stdin: !!inputBuffer,
    };
    
    const stream = await container.attach(attachOptions);
    
    // Start timing
    const startTime = Date.now();
    
    // Start container
    await container.start();

    // If we have input, write it to stdin
    if (inputBuffer && stream.writable) {
      stream.write(inputBuffer);
      stream.end();
    }

    // Collect output with demuxing (Docker multiplexes stdout/stderr)
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          await container.kill();
        } catch {
          // Container may have already exited
        }
        reject(new Error("Execution timeout"));
      }, EXECUTION_TIMEOUT_MS);

      // Demux the stream - use PassThrough streams for proper typing
      const stdoutStream = new PassThrough();
      const stderrStream = new PassThrough();
      
      stdoutStream.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
      stderrStream.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

      docker.modem.demuxStream(stream, stdoutStream, stderrStream);

      stream.on("end", () => {
        clearTimeout(timeout);
        resolve();
      });
      stream.on("error", (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Wait for container to finish
    const waitResult = await container.wait();
    const endTime = Date.now();

    // Get container stats for memory usage
    let memoryUsageKb = 0;
    try {
      const stats = await container.stats({ stream: false });
      if (stats.memory_stats?.max_usage) {
        memoryUsageKb = Math.round(stats.memory_stats.max_usage / 1024);
      }
    } catch {
      // Stats may not be available if container exited too quickly
    }

    return {
      stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
      stderr: Buffer.concat(stderrChunks).toString("utf-8"),
      exitCode: waitResult.StatusCode,
      executionTimeMs: endTime - startTime,
      memoryUsageKb,
    };
  } finally {
    // Clean up container
    try {
      await container.remove({ force: true });
    } catch {
      // Container may have already been removed
    }
  }
}

/**
 * Create a simple tar archive with a single file
 * Docker requires tar format for putArchive
 */
function createTarStream(filename: string, content: Buffer): Readable {
  // Simple tar format implementation
  const header = Buffer.alloc(512);
  
  // File name (100 bytes)
  header.write(filename, 0, 100, "utf-8");
  
  // File mode (8 bytes) - 0644
  header.write("0000644\0", 100, 8, "utf-8");
  
  // UID (8 bytes)
  header.write("0000000\0", 108, 8, "utf-8");
  
  // GID (8 bytes)
  header.write("0000000\0", 116, 8, "utf-8");
  
  // File size in octal (12 bytes)
  const sizeOctal = content.length.toString(8).padStart(11, "0") + "\0";
  header.write(sizeOctal, 124, 12, "utf-8");
  
  // Modification time (12 bytes)
  const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, "0") + "\0";
  header.write(mtime, 136, 12, "utf-8");
  
  // Checksum placeholder (8 spaces)
  header.write("        ", 148, 8, "utf-8");
  
  // Type flag - '0' for regular file
  header.write("0", 156, 1, "utf-8");
  
  // Calculate checksum
  let checksum = 0;
  for (let i = 0; i < 512; i++) {
    checksum += header[i];
  }
  header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148, 8, "utf-8");
  
  // Pad content to 512-byte boundary
  const padding = 512 - (content.length % 512);
  const paddedContent = Buffer.concat([
    content,
    padding < 512 ? Buffer.alloc(padding) : Buffer.alloc(0),
  ]);
  
  // End of archive (two 512-byte zero blocks)
  const endBlock = Buffer.alloc(1024);
  
  const tarBuffer = Buffer.concat([header, paddedContent, endBlock]);
  
  return Readable.from(tarBuffer);
}

/**
 * Count non-empty, non-comment lines of code
 */
function countLinesOfCode(code: Buffer, language: string): number {
  const lines = code.toString("utf-8").split("\n");
  let count = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;

    // Handle block comments for C/C++
    if (language === "c" || language === "cpp") {
      if (inBlockComment) {
        if (trimmed.includes("*/")) {
          inBlockComment = false;
        }
        continue;
      }
      if (trimmed.startsWith("/*")) {
        if (!trimmed.includes("*/")) {
          inBlockComment = true;
        }
        continue;
      }
      if (trimmed.startsWith("//")) continue;
    }

    // Handle Python comments
    if (language === "python") {
      if (trimmed.startsWith("#")) continue;
      // Simple docstring detection (not perfect but good enough)
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        // Single line docstring
        if (trimmed.length > 3 && (trimmed.endsWith('"""') || trimmed.endsWith("'''"))) {
          continue;
        }
        inBlockComment = !inBlockComment;
        continue;
      }
      if (inBlockComment) continue;
    }

    count++;
  }

  return count;
}

/**
 * Runs the submission code inside a Docker container, captures stats and creates a LeaderboardEntry
 */
async function runSubmission(
  solutionBuffer: Buffer,
  entry: LeaderboardEntry,
  inputBuffer?: Buffer
): Promise<LeaderboardEntry> {
  // Detect language from the entry or filename
  const language = detectLanguage(entry.language, entry.language);
  
  try {
    const result = await executeInContainer(solutionBuffer, language, inputBuffer);
    
    // Log execution result
    console.log("Execution result:", {
      exitCode: result.exitCode,
      executionTimeMs: result.executionTimeMs,
      memoryUsageKb: result.memoryUsageKb,
      stdoutLength: result.stdout.length,
      stderrLength: result.stderr.length,
    });

    if (result.stderr) {
      console.log("stderr:", result.stderr.substring(0, 500));
    }

    // Update entry with execution stats
    return {
      ...entry,
      language,
      executionTimeMs: result.executionTimeMs,
      memoryUsageKb: result.memoryUsageKb,
      linesOfRelevantCode: countLinesOfCode(solutionBuffer, language),
    };
  } catch (error) {
    console.error("Docker execution error:", error);
    
    // Return entry with error indicators
    return {
      ...entry,
      language,
      executionTimeMs: -1, // Indicates error
      memoryUsageKb: -1,
      linesOfRelevantCode: countLinesOfCode(solutionBuffer, language),
    };
  }
}

export { runSubmission, ExecutionResult };
