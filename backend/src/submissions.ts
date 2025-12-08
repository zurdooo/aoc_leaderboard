import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { runSubmission } from "./dockerRunner";
import { insertLeaderboardEntry } from "./db";
import { exec } from "child_process";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB limit
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const solutionExtensions = [".py", ".c", ".cpp"];
    const inputExtensions = [".txt"];
    const ext = "." + file.originalname.split(".").pop()?.toLowerCase();

    if (file.fieldname === "file" && solutionExtensions.includes(ext)) {
      cb(null, true);
    } else if (file.fieldname === "input" && inputExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Define upload fields for solution and input files
export const submitUpload = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "input", maxCount: 1 },
]);

// File submission handler, gets called from the route
export const handleSubmission = async (req: Request, res: Response) => {
  try {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const solutionFile = files?.file?.[0];
    const inputFile = files?.input?.[0];

    if (!solutionFile) {
      res.status(400).json({ error: "No solution file uploaded" });
      return;
    }

    if (!inputFile) {
      res.status(400).json({ error: "No input file uploaded" });
      return;
    }

    const { originalname, size, mimetype } = solutionFile;
    const day = Number(req.body.day);
    const year = Number(req.body.year);
    const part1 = req.body.part1 === "true";
    const part2 = req.body.part2 === "true";

    if (!Number.isFinite(day) || day < 1 || day > 25) {
      res.status(400).json({ error: "Invalid day; must be between 1 and 25" });
      return;
    }

    if (!Number.isFinite(year) || year < 2015 || year > 2100) {
      res.status(400).json({ error: "Invalid year" });
      return;
    }

    // Build parts string for message
    const parts = [];
    if (part1) parts.push("Part 1");
    if (part2) parts.push("Part 2");
    const partsStr = parts.length > 0 ? parts.join(" & ") : "No parts selected";

    // Log the submission info
    console.log("Submission received:", {
      day,
      part1,
      part2,
      solution: {
        name: originalname,
        size: `${(size / 1024).toFixed(2)} KB`,
        type: mimetype,
      },
      input: inputFile
        ? {
            name: inputFile.originalname,
            size: `${(inputFile.size / 1024).toFixed(2)} KB`,
          }
        : null,
    });

    // Build the leaderboard entry as it stands before execution
    const initialEntry = {
      rank: -1, // to be updated after insertion
      userId: req.body.userId || "anonymous",
      username: req.body.username || "anonymous",
      year,
      day: day,
      part1Completed: part1,
      part2Completed: part2,
      language: detectLanguageFromFilename(originalname),
      executionTimeMs: -1,
      memoryUsageKb: -1,
      linesOfRelevantCode: -1,
      submittedAt: new Date(),
    };

    // Send submission for processing
    const execResult = await runSubmission(
      solutionFile.buffer,
      initialEntry,
      inputFile.buffer
    );
    await insertLeaderboardEntry(execResult);

    res.json({
      success: true,
      message: `Day ${day} (${partsStr}) submitted successfully!`,
      file: {
        name: originalname,
        size: size,
        type: mimetype,
      },
      stats: {
        executionTimeMs: execResult.executionTimeMs,
        memoryUsageKb: execResult.memoryUsageKb,
        linesOfRelevantCode: execResult.linesOfRelevantCode,
        language: execResult.language,
        submittedAt: execResult.submittedAt,
      },
    });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: "Failed to process submission" });
  }
};

function detectLanguageFromFilename(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".cpp") || lower.endsWith(".cc") || lower.endsWith(".cxx")) return "cpp";
  if (lower.endsWith(".c")) return "c";
  return "python";
}
