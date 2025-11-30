import { useState } from 'react';
import './App.css';
import UserHeader from './components/UserHeader';
import LoginModal from './components/LoginModal';
import { useAuth } from './hooks/useAuth';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, username, isLoading, login, logout } = useAuth();

  const handleLogin = async (credentials: { username: string; password: string }) => {
    const result = await login(credentials);
    if (result.success) {
      setIsLoginOpen(false);
    }
    return result;
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      {!isAuthenticated && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <button className="btn" onClick={() => setIsLoginOpen(true)}>
            Login
          </button>
        </div>
      )}

      {isAuthenticated && (
        <>
          <UserHeader username={username} onLogout={logout} />
          <div className="main-content">
            <h1>AOC Leaderboard</h1>
            <p>Welcome, {username}!</p>
            {/* TODO: Add leaderboard content here */}
          </div>
        </>
      )}

      {isLoginOpen && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setIsLoginOpen(false)}
        />
      )}
    </>
  );
}

export default App;
