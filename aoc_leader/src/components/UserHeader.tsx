import React from 'react';
import './styles/UserHeader.css';

interface UserHeaderProps {
  username: string;
  onLogout: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ username, onLogout }) => {
  return (
    <div className="user-header">
      <span className="username">{username || 'User'}</span>
      <button className="logout-btn" onClick={onLogout} title="Logout">
        ✕
      </button>
    </div>
  );
};

export default UserHeader;
