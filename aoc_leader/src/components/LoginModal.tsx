import { useState } from 'react';
import ErrorCard from './ErrorCard';
import './styles/LoginModal.css';

interface LoginModalProps {
  onLogin: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    const result = await onLogin({ username, password });
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    // If successful, parent will close the modal
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Login</h2>
          <button className="close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
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
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
