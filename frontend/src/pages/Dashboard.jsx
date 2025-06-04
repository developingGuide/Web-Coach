import { useState, useEffect } from "react";
import "./Dashboard.css";
import {useNavigate} from "react-router-dom"
import supabase from "../../config/supabaseClient";

const Dashboard = () => {
  const userId = "demo_user"
  const [isLaunching, setIsLaunching] = useState(false);
  const navigate = useNavigate()
  const [currentMap, setCurrentMap] = useState(null);
  const [userLvl, setUserLvl] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);


  const handleLaunch = (destination) => {
    setIsLaunching(true);

    setTimeout(() => {
      setIsLaunching(false);
      navigate(`${destination}`)
    }, 2000);
  }

  const fetchUserState = async () => {
    const { data: userState, error: stateError } = await supabase
        .from("user_state")
        .select("*")
        .eq("user_id", userId)
        .single();
  
      if (stateError || !userState) {
        console.error("Failed to fetch user state:", stateError);
        return;
      }

      setCurrentMap(userState.current_map)
      setUserLvl(userState.level)
      setCurrentTaskId(userState.current_task_id)
  }

  useEffect(() => {
      fetchUserState();
    }, []);


  const fetchCurrentTask = async (taskId) => {
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      console.error("Failed to fetch task:", taskError);
      return;
    }

    setCurrentTask(task);
  };

  useEffect(() => {
    fetchUserState();
  }, []);

  useEffect(() => {
    if (currentTaskId) {
      fetchCurrentTask(currentTaskId);
    }
  }, [currentTaskId]);


  
  return (
    <div className={`devdash-root ${isLaunching ? "launching" : ""}`}>
      <div className="cloud-transition">
        <img src="/cloud-cover.png" className={`cloud-cover ${isLaunching ? "visible" : ""}`} />
      </div>
      <div className="devdash-layout">

        {/* Left Side */}
        <div className="devdash-column">
          <div className="devdash-panel">
            <div className="devdash-title">Current Task</div>
            <div className="devdash-label">Title</div>
            <div className="devdash-value">
              {currentTask ? currentTask.title : "Loading..."}
            </div>
            <div className="devdash-label">Status</div>
            <div className="devdash-value">In Progress</div>
          </div>

          <div className="devdash-panel">
            <div className="devdash-title">Inbox</div>
            <div className="devdash-label">New Messages</div>
            <div className="devdash-value">2</div>
            <button onClick={() => {navigate('/inbox')}}>Open Inbox</button>
          </div>
        </div>

        {/* Center Area */}
        <div className="devdash-center">
          <div className="devdash-level-circle">
            <h1>LEVEL {userLvl}</h1>
            <p>Frontend Apprentice</p>
          </div>

          <div className="devdash-controls">
            <button>Start Task</button>
            <button onClick={() => handleLaunch('/journey')}>View Journey</button>
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
