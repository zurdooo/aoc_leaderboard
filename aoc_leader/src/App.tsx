import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import FileSubmission from './components/FileSubmission';
import Leaderboard from './components/Leaderboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
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
          <Header 
            username={username} 
            onLogout={logout}
          />
          <div className="main-content" style={{ paddingTop: '10px' }}>
            <Leaderboard onSubmitClick={() => setIsSubmitOpen(true)} />
          </div>
        </>
      )}

      {isLoginOpen && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setIsLoginOpen(false)}
        />
      )}

      {isSubmitOpen && (
        <FileSubmission
          onClose={() => setIsSubmitOpen(false)}
          username={username}
        />
      )}
    </>
  );
}

export default App;
