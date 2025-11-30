import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    // TODO: Replace with backend call to verify credentials
    console.log("Login submitted", { username, password: "[redacted]" });
    // For now, just close the modal to simulate success
    closeLogin();
  };

  return (
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
        <button className="btn" onClick={openLogin} style={{ marginLeft: 12 }}>
          Login
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {isLoginOpen && (
        <div className="modal-overlay" onClick={closeLogin}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Login</h2>
              <button className="close" onClick={closeLogin} aria-label="Close">×</button>
            </div>
            <form onSubmit={submitLogin} className="modal-body">
              {error && <div className="error">{error}</div>}
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
