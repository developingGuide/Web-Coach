// // components/Navbar.js
// import React from 'react';
// import './Navbar.css'; // We'll create this for styling

// const Navbar = ({ exp = 45, maxExp = 100 }) => {
//   const progressPercent = (exp / maxExp) * 100;

//   return (
//     <div className="navbar">
//       <img src="../public/Logo.png" alt="Logo" className="navbar-logo" />

//       <div className="exp-bar-container">
//         <div className="exp-bar">
//           <div className="exp-fill" style={{ width: `${progressPercent}%` }}></div>
//         </div>
//         <span className="exp-text">{exp} / {maxExp} EXP</span>
//       </div>

//       <div className="profile-circle">
//         <span>W</span> {/* You can replace with profile image */}
//       </div>
//     </div>
//   );
// };

// export default Navbar;


// components/Navbar.js
import './Navbar.css';

const Navbar = ({ exp = 45, maxExp = 100, level = 3 }) => {
  const progressPercent = (exp / maxExp) * 100;

  return (
    <div className="navbar">
      <img src="../public/Logo.png" alt="Logo" className="navbar-logo" />

      <div className="navbar-right">
        <div className="profile-circle large">
          <span>W</span>
        </div>

        <div className="exp-info">
          <div className="exp-label">
            <span className="level">Lv {level}</span>
          </div>
          <div className="exp-bar">
            <div className="exp-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="exp-text">{exp} / {maxExp} EXP</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
