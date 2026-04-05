import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onNavigate, onClose }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="sidebar-mobile-header">
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          ×
        </button>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/" className={isActive('/')} onClick={onNavigate}>
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link to="/students" className={isActive('/students')} onClick={onNavigate}>
            👨‍🎓 Students
          </Link>
        </li>
        <li>
          <Link to="/items" className={isActive('/items')} onClick={onNavigate}>
            🏏 Equipment
          </Link>
        </li>
        <li>
          <Link to="/issue" className={isActive('/issue')} onClick={onNavigate}>
            📤 Issue Items
          </Link>
        </li>
        <li>
          <Link to="/return" className={isActive('/return')} onClick={onNavigate}>
            📥 Return Items
          </Link>
        </li>
        <li>
          <Link to="/reports" className={isActive('/reports')} onClick={onNavigate}>
            📊 Reports
          </Link>
        </li>
        <li>
          <Link to="/about" className={isActive('/about')} onClick={onNavigate}>
            ℹ️ About
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
