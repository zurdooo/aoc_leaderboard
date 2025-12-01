const API_BASE = "http://localhost:3001";

export interface SubmissionData {
  file: File;
  day: number;
  part1: boolean;
  part2: boolean;
  inputFile?: File | null;
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
  formData.append("day", data.day.toString());
  formData.append("part1", data.part1.toString());
  formData.append("part2", data.part2.toString());

  if (data.inputFile) {
    formData.append("input", data.inputFile);
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
