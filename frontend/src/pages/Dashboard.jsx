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
  if (!user) {
    return <div>Loading...</div>; // or show a spinner, or redirect to login
  }
  const userId = user.id
  const [isLaunching, setIsLaunching] = useState(false);
  const navigate = useNavigate()
  const [currentMap, setCurrentMap] = useState("No map selected!");
  const [userLvl, setUserLvl] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [tasksToday, setTasksToday] = useState({})

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
    
    useEffect(() => {
      if (currentTaskId) {
        fetchCurrentTask(currentTaskId);
      }
    }, [currentTaskId]);
    
    
    useEffect(() => {
      fetchUserState();
      fetchTasksToday();
    }, []);
    
    
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
            <button onClick={() => {navigate('/playground')}}>Go Straight In!</button>
          </div>

          <div className="devdash-panel devdash-compact">
            <div className="devdash-title">Dev Stats</div>
            <div className="devdash-label">Commits Today</div>
            <div className="devdash-value">{count}</div>
            <div className="devdash-label">Daily Tracker</div>
            {/* <div className="devdash-value">(Inser github square thingie)</div> */}
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              // startDate={new Date('2025-06-01')}
              // endDate={new Date('2025-12-01')}
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
          </div>

          <div className="devdash-controls">
            <button>Start Challenge</button>
            <button onClick={() => handleLaunch('/journey')}>View Journey</button>
          </div>
        </div>

        {/* Right Side */}
        <div className="devdash-column">
          <div className="devdash-panel">
            <div className="devdash-title">Current Map: {currentMap}</div>
            <img src={`/${currentMap}.png`} className="devdash-map" />
            <div className="devdash-value">Progress:</div>
            <div className="devdash-progress-bar">
              <div className="devdash-progress-fill" style={{ width: "45%" }} />
              <span className="devdash-progress-percent">45%</span>
            </div>
          </div>


          <div className="devdash-panel">
            <div className="comingSoon">
              <h1>COMING SOON!</h1>
            </div>
            <div className="devdash-title">Global Chat</div>
            
            <div className="chat-preview">
              <div className="chat-message"><span className="chat-username">dev_goblin:</span> yo anyone shipping today?</div>
              <div className="chat-message"><span className="chat-username">pixelwitch:</span> still stuck on that snowglobe lol</div>
            </div>
            
            <button disabled className="chat-button">Open Chat</button>
          </div>

          {/* <div className="devdash-panel devdash-compact">
            <div className="devdash-title">Status</div>
            <div className="devdash-value">Logged In</div>
            <div className="devdash-value neon-glow">[LIVE]</div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
