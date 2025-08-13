// import { useEffect, useState } from "react";
// import "./Navbar.css";
// import { useNavigate } from "react-router-dom";

// const Navbar = ({ exp, maxExp, level, avatar }) => {
//   const [prevExp, setPrevExp] = useState(exp);
//   const [leveledUp, setLeveledUp] = useState(false);
//   const navigate = useNavigate()

//   useEffect(() => {
//     if (exp === 0 && prevExp !== 0) {
//       setLeveledUp(true);
//       setTimeout(() => setLeveledUp(false), 1000);
//     }

//     setPrevExp(exp);
//   }, [exp]);

//   const progressPercent = (exp / maxExp) * 100;

//   return (
//     <div className="navbar">
//       <div className="navbar-right">
//         <div onClick={() => navigate('/profile')} className="profile-circle large">
//           <img src={avatar} alt="avatar"/>
//         </div>

//         <div className="exp-info">
//           <div className="exp-label">
//             <span className={`level ${leveledUp ? "level-up" : ""}`}>
//               Lv {level}
//             </span>
//           </div>

//           <div className="exp-bar-wrapper">
//             <div className="exp-bar">
//               <div
//                 className="exp-fill"
//                 style={{ width: `${progressPercent}%` }}
//               ></div>
//             </div>
//           </div>

//           <span className="exp-text">
//             {exp} / {maxExp} EXP
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;


import { useEffect, useState } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { fireConfetti } from "../utils/confetti"; // your existing confetti util

const Navbar = ({ exp, maxExp, level, avatar }) => {
  const [prevLevel, setPrevLevel] = useState(level);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (level > prevLevel) {
      fireConfetti();
      setShowLevelUpPopup(true);
      setTimeout(() => setShowLevelUpPopup(false), 5000);
    }
    setPrevLevel(level);
  }, [level]);

  const progressPercent = (exp / maxExp) * 100;

  return (
    <>
      <div className="navbar">
        <div className="navbar-right">
          <div onClick={() => navigate('/profile')} className="profile-circle large">
            <img src={avatar} alt="avatar" />
          </div>

          <div className="exp-info">
            <div className="exp-label">
              <span className="level">Lv {level}</span>
            </div>

            <div className="exp-bar-wrapper">
              <div className="exp-bar">
                <div
                  className="exp-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <span className="exp-text">
              {exp} / {maxExp} EXP
            </span>
          </div>
        </div>
      </div>

      {showLevelUpPopup && (
        <div className="levelup-overlay" onClick={() => setShowLevelUpPopup(false)}>
          <div className="levelup-popup">
            <h1>✨ Level Up! ✨</h1>
            <p>Lvl {prevLevel} ➡ Lvl {level}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
