const API_BASE = "http://localhost:3001";

export interface SubmissionData {
  file: File;
  year: number;
  day: number;
  part1: boolean;
  part2: boolean;
  inputFile: File;
  username?: string;
  userId?: string;
}

export interface SubmissionResponse {
  success: boolean;
  message?: string;
  error?: string;
  file?: {
    name: string;
    size: number;
  };
}

export async function submitSolution(
  data: SubmissionData
): Promise<SubmissionResponse> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("year", data.year.toString());
  formData.append("day", data.day.toString());
  formData.append("part1", data.part1.toString());
  formData.append("part2", data.part2.toString());

  formData.append("input", data.inputFile);

  const trimmedUsername = data.username?.trim();
  const normalizedUserId = (data.userId ?? buildUserId(trimmedUsername)).trim();

  if (trimmedUsername) {
    formData.append("username", trimmedUsername);
  }

  if (normalizedUserId) {
    formData.append("userId", normalizedUserId);
  }

  const response = await fetch(`${API_BASE}/api/submit`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const result = await response.json();

  if (response.ok) {
    return {
      success: true,
      message: result.message || "File submitted successfully!",
      file: result.file,
    };
  } else {
    return {
      success: false,
      error: result.error || "Submission failed",
    };
  }
}

function buildUserId(username?: string): string {
  if (!username) return "";
  const slug = username
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug ? `user-${slug}` : "";
}
