// components/Navbar.js
import React from 'react';
import './Navbar.css'; // We'll create this for styling

const Navbar = ({ exp = 45, maxExp = 100 }) => {
  const progressPercent = (exp / maxExp) * 100;

  return (
    <div className="navbar">
      <img src="/logo.png" alt="Logo" className="navbar-logo" />

      <div className="exp-bar-container">
        <div className="exp-bar">
          <div className="exp-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="exp-text">{exp} / {maxExp} EXP</span>
      </div>

      <div className="profile-circle">
        <span>W</span> {/* You can replace with profile image */}
      </div>
    </div>
  );
};

export default Navbar;
