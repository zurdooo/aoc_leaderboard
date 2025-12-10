import './Header.css';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export default function Header({ username, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">AOC Leaderboard</h1>
      </div>
      <div className="header-right">
        <span className="header-username">{username}</span>
        <button className="header-btn logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
