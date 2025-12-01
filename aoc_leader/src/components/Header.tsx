import './Header.css';

interface HeaderProps {
  username: string;
  onLogout: () => void;
  onSubmitClick: () => void;
}

export default function Header({ username, onLogout, onSubmitClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">AOC Leaderboard</h1>
      </div>
      <div className="header-right">
        <span className="header-username">{username}</span>
        <button className="header-btn submit-btn" onClick={onSubmitClick}>
        Submit
        </button>
        <button className="header-btn logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
