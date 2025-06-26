import { useState, useEffect, useContext } from "react";
import "./Dashboard.css";
import {useNavigate} from "react-router-dom"
import supabase from "../../config/supabaseClient";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import moment from "moment";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { AuthContext } from "../components/AuthContext";


const Dashboard = () => {
  // const userId = "demo_user"
  const {user} = useContext(AuthContext)
  // if (!user) {
  //   return <div>Loading...</div>; // or show a spinner, or redirect to login
  // }
  
  const navigate = useNavigate()
  const [isLaunching, setIsLaunching] = useState(false);
  const [currentMap, setCurrentMap] = useState("BeachIsland");
  const [userLvl, setUserLvl] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [tasksToday, setTasksToday] = useState({})
  
  useEffect(() => {
    if (currentTaskId) {
      fetchCurrentTask(currentTaskId);
    }
  }, [currentTaskId]);
  
  
  useEffect(() => {
    if (user?.id) {
      fetchUserState();
      fetchTasksToday();
    }
  }, [user]);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  const userId = user.id
  
  const handleLaunch = (destination, type) => {
    setIsLaunching(type); // now holds "cloud" or "slide"

    if (type === "cloud") {
      setTimeout(() => {
        navigate(destination);
        setIsLaunching(false); // optional: reset after navigation
      }, 1000); // give time for cloud fade in
    } else {
      setTimeout(() => {
        navigate(destination, {
          state: { transition: 'slide-in' }
        });
        setIsLaunching(false);
      }, 800);
    }
  };


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

  
  // Today's Commit
  
  const fetchTasksToday = async () => {
    const { data, error } = await supabase
    .from("task_completion_log")
    .select("daily_log")
    .eq("user_id", userId)
      .single();
      
      if (error || !data) {
        console.error("Failed to fetch today done tasks:", error);
        return;
      }
      
      setTasksToday(data.daily_log || {});
  };
    
  const today = new Date().toISOString().split("T")[0];
  const count = tasksToday[today]?.length || 0;
  
  
  // Github square thingies
  const heatmapData = Object.entries(tasksToday).map(([date, tasks]) => ({
    date,
    count: tasks.length,
  }));
    
  const startDate = moment().subtract(5, 'months').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // or your homepage
  };
      
    
  return (
    <div className={`page-slide ${isLaunching === 'slide' ? 'exit-to-left-active' : ''}`}>
      <div className={`devdash-root ${isLaunching === "cloud" ? "launching" : ""}`}>
        <div className="cloud-transition">
          <img src="/cloud-cover.png" className={`cloud-cover ${isLaunching === "cloud" ? "visible" : ""}`} />
        </div>
        <div className="devdash-layout">
          {/* Left Side */}
          <div className="devdash-column">
            <div className="devdash-panel">
              <div className="devdash-title">Current Task</div>
              <div className="devdash-label">Title</div>
              <div className="devdash-value">
                {currentTask ? currentTask.title : "No Task Started Yet!"}
              </div>
              <div className="devdash-label">Status</div>
              <div className="devdash-value">
                {currentTask ? "In Progress" : "Not Started!"}
              </div>
              <div>
                {currentTask ? <button onClick={() => handleLaunch('/inbox', 'slide')}>Go Inbox!</button> : ""}
              </div>
            </div>

            <div className="devdash-panel devdash-compact">
              <div className="devdash-title">Dev Stats</div>
              <div className="devdash-label">Commits Today</div>
              <div className="devdash-value">{count}</div>
              <div className="devdash-label">Daily Tracker</div>
              <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value || value.count === 0) return 'color-empty';
                  if (value.count < 2) return 'color-github-1';
                  if (value.count < 4) return 'color-github-2';
                  if (value.count < 6) return 'color-github-3';
                  return 'color-github-4';
                }}
                tooltipDataAttrs={(value) => {
                  if (!value || !value.date) return null;
                  return {
                    'data-tooltip-id': 'heatmap-tooltip',
                    'data-tooltip-content': `${moment(value.date).format('MMM D')}: ${value.count || 0} tasks`,
                  };
                }}
              />

              <ReactTooltip id="heatmap-tooltip" />
            </div>
          </div>

          {/* Center Area */}
          <div className="devdash-center">
            <div className="devdash-level-circle">
              <h1>LEVEL {userLvl}</h1>
              <p>Status: <span className="neon-glow">Live</span></p>
              <button className="logoutBtn" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="devdash-controls">
              <button onClick={() => handleLaunch('/challenges', 'cloud')}>Start Challenge</button>
              <button onClick={() => handleLaunch('/journey', 'cloud')}>View Journey</button>
            </div>
          </div>

          {/* Right Side */}
          <div className="devdash-column">
            <div className="devdash-panel">
              <div className="devdash-title">Current Map: {currentMap}</div>
              <img src={`/${currentMap}.png`} className="devdash-map" />
            </div>


            <div className="devdash-panel">
              <div className="devdash-title">Global Chat</div>
                  
              <div className="chat-preview">
                <div className="chat-message"><span className="chat-username">dev_goblin:</span> yo anyone shipping today?</div>
                <div className="chat-message"><span className="chat-username">pixelwitch:</span> still stuck on that snowglobe lol</div>
              </div>
              <button onClick={() => {navigate('/chat')}} className="chat-button">Open Chat</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
