import { useState } from "react";
import "./Dashboard.css";
import {useNavigate} from "react-router-dom"

const Dashboard = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const navigate = useNavigate()

  const handleLaunch = () => {
    setIsLaunching(true);

    setTimeout(() => {
      // After animation finishes (~1.8s), navigate or trigger next action
      // For now just log or replace with routing logic
      navigate("/journey")
    }, 1800);
  }

  return (
    <div className={`devdash-root ${isLaunching ? "launching" : ""}`}>
      <div className="dash-clouds" />
      <div className="devdash-layout">

        {/* Left Side */}
        <div className="devdash-column">
          <div className="devdash-panel">
            <div className="devdash-title">Current Task</div>
            <div className="devdash-label">Title</div>
            <div className="devdash-value">Fix broken nav layout</div>
            <div className="devdash-label">Status</div>
            <div className="devdash-value">In Progress</div>
          </div>

          <div className="devdash-panel">
            <div className="devdash-title">Inbox</div>
            <div className="devdash-label">New Messages</div>
            <div className="devdash-value">2</div>
            <button>Open Inbox</button>
          </div>
        </div>

        {/* Center Area */}
        <div className="devdash-center">
          <div className="devdash-level-circle">
            <h1>LEVEL 3</h1>
            <p>Frontend Apprentice</p>
          </div>

          <div className="devdash-controls">
            <button>Start Task</button>
            <button onClick={handleLaunch}>View Journey</button>
          </div>
        </div>

        {/* Right Side */}
        <div className="devdash-column">
          <div className="devdash-panel">
            <div className="devdash-title">Current Zone</div>
            <img src="/images/map-placeholder.png" className="devdash-map" />
            <div className="devdash-value">HTML Hut</div>
            <div className="devdash-progress-bar">
              <div className="devdash-progress-fill" style={{ width: "45%" }} />
              <span className="devdash-progress-percent">45%</span>
            </div>
          </div>

          <div className="devdash-panel devdash-compact">
            <div className="devdash-title">Dev Stats</div>
            <div className="devdash-label">Commits Today</div>
            <div className="devdash-value">4</div>
            <div className="devdash-label">Time Focused</div>
            <div className="devdash-value">1h 35m</div>
          </div>

          <div className="devdash-panel devdash-compact">
            <div className="devdash-title">Status</div>
            <div className="devdash-value">Logged In</div>
            <div className="devdash-value neon-glow">[LIVE]</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
