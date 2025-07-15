import { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar = ({ exp, maxExp, level, avatar }) => {
  const [prevExp, setPrevExp] = useState(exp);
  const [leveledUp, setLeveledUp] = useState(false);

  useEffect(() => {
    if (exp === 0 && prevExp !== 0) {
      setLeveledUp(true);
      setTimeout(() => setLeveledUp(false), 1000);
    }

    setPrevExp(exp);
  }, [exp]);

  const progressPercent = (exp / maxExp) * 100;

  return (
    <div className="navbar">
      <div className="navbar-right">
        <div className="profile-circle large">
          <img src={avatar} alt="avatar"/>
        </div>

        <div className="exp-info">
          <div className="exp-label">
            <span className={`level ${leveledUp ? "level-up" : ""}`}>
              Lv {level}
            </span>
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
  );
};

export default Navbar;
