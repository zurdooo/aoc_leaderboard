import { useState, useRef } from "react";
import "./FileSubmission.css";
import { submitSolution } from "../api/submissions";

interface FileSubmissionProps {
  onClose: () => void;
}

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export default function FileSubmission({ onClose }: FileSubmissionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [day, setDay] = useState<number>(1);
  const [part1, setPart1] = useState<boolean>(false);
  const [part2, setPart2] = useState<boolean>(false);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Dropped file:", file.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setInputFile(null);
    setStatus("idle");
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setMessage("Solution file is required.");
      setStatus("error");
      return;
    }

    if (!inputFile) {
      setMessage("Input file is required.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const result = await submitSolution({
        file: selectedFile,
        year,
        day,
        part1,
        part2,
        inputFile,
      });

      if (result.success) {
        setStatus("success");
        setMessage(result.message || "File submitted successfully!");
        console.log("Submission successful:", selectedFile.name);
      } else {
        setStatus("error");
        setMessage(result.error || "Submission failed");
        console.error("Submission failed:", result.error);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Error or my computer is cooked right now");
      console.error("Submission error:", err);
    }
  };

  const handleReset = () => {
    handleClear();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="file-submission" onClick={(e) => e.stopPropagation()}>
        <div className="file-submission-header">
          <h3>Submit Your Solution</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>
        <div className="file-naming-hint">
          <span>Intended Format :</span>
          <span>
            Solution: <code>day_x.py</code>
          </span>
          <span>
            Input: <code>day_x_input.txt</code>
          </span>
        </div>

        {status === "success" ? (
          <div className="submission-feedback success">
            <p className="feedback-message">{message}</p>
            <p className="feedback-filename">File: {selectedFile?.name}</p>
            <div className="file-actions">
              <button className="btn secondary" onClick={onClose}>
                Close
              </button>
              <button className="btn primary" onClick={handleReset}>
                Submit Another
              </button>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="submission-feedback error">
            <p className="feedback-message">{message}</p>
            <div className="file-actions">
              <button className="btn secondary" onClick={onClose}>
                Close
              </button>
              <button className="btn primary" onClick={handleSubmit}>
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Year, Day and Part Selection */}
            <div className="selection-row">
              <label className="field">
                <span>Year</span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  disabled={status === "submitting"}
                >
                  {Array.from({ length: 11 }, (_, i) => 2015 + i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Day</span>
                <select
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  disabled={status === "submitting"}
                >
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </label>
              <div className="field">
                <span>Parts Completed</span>
                <div className="part-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={part1}
                      onChange={(e) => setPart1(e.target.checked)}
                      disabled={status === "submitting"}
                    />
                    <span>Part 1</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={part2}
                      onChange={(e) => setPart2(e.target.checked)}
                      disabled={status === "submitting"}
                    />
                    <span>Part 2</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Solution File Upload */}
            <label className="section-label">Solution File</label>
            <div
              className={`drop-zone ${selectedFile ? "has-file" : ""} ${
                status === "submitting" ? "submitting" : ""
              }`}
              onClick={status !== "submitting" ? handleClick : undefined}
              onDrop={status !== "submitting" ? handleDrop : undefined}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".py,.cpp,.c"
                hidden
              />

              {status === "submitting" ? (
                <div className="submitting-indicator">
                  <span className="spinner"></span>
                  <p>Submitting...</p>
                </div>
              ) : selectedFile ? (
                <div className="file-info">
                  <span className="file-name">{selectedFile.name}</span>
                </div>
              ) : (
                <div className="drop-prompt">
                  <p>Click or drag a file to upload</p>
                  <span className="hint">Supported: .py, .cpp, .c</span>
                </div>
              )}
            </div>

            {/* Input File Upload */}
            <label className="section-label">Input File</label>
            <div
              className={`drop-zone input-zone ${inputFile ? "has-file" : ""}`}
              onClick={
                status !== "submitting"
                  ? () => inputFileRef.current?.click()
                  : undefined
              }
            >
              <input
                type="file"
                ref={inputFileRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInputFile(file);
                    console.log("Input file selected:", file.name);
                  }
                }}
                accept=".txt"
                hidden
              />

              {inputFile ? (
                <div className="file-info">
                  <span className="file-name">{inputFile.name}</span>
                  <button
                    className="clear-input-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputFile(null);
                      if (inputFileRef.current) inputFileRef.current.value = "";
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="drop-prompt">
                  <p>Click to upload input file</p>
                  <span className="hint">Supported: .txt</span>
                </div>
              )}
            </div>

            {selectedFile && status !== "submitting" && (
              <div className="file-actions">
                <button className="btn secondary" onClick={handleClear}>
                  Clear
                </button>
                <button
                  className="btn primary"
                  onClick={handleSubmit}
                  disabled={!inputFile}
                >
                  Submit
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
