import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ErrorCard from "./components/ErrorCard";

function App() {
  const [count, setCount] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const API = (import.meta as ImportMeta).env?.VITE_API_BASE || "http://localhost:3001";

  // Check for existing session on mount
  useState(() => {
    const checkSession = async () => {
      try {
        const resp = await fetch(`${API}/api/me`, {
          credentials: "include", // Send cookies with request
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.authenticated) {
            setAuthed(true);
            setUsername(data.user?.username || "");
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };
    checkSession();
  });

  const openLogin = () => {
    setIsLoginOpen(true);
    setError(null);
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
    setUsername("");
    setPassword("");
    setError(null);
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    try {
      const resp = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for setting cookies
        body: JSON.stringify({ username, password }),
      });
      if (!resp.ok) {
        const body: { error?: string } = await resp.json().catch(() => ({} as { error?: string }));
        setError(body?.error || `Login failed (${resp.status})`);
        return;
      }
      // Login successful
      setAuthed(true);
      closeLogin();
    } catch (err) {
      console.error(err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("My Computer is not able to come to the phone right now.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      {!authed && (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <button className="btn" onClick={openLogin}>Login</button>
        </div>
      )}

      {authed && (
      <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      </>
      )}

      {isLoginOpen && (
        <div className="modal-overlay" onClick={closeLogin}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Login</h2>
              <button className="close" onClick={closeLogin} aria-label="Close">×</button>
            </div>
            <form onSubmit={submitLogin} className="modal-body">
              {error && <ErrorCard message={error} onClose={() => setError(null)} />}
              <label className="field">
                <span>Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  autoFocus
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="secret"
                />
              </label>
              <div className="actions">
                <button type="button" className="secondary" onClick={closeLogin}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
