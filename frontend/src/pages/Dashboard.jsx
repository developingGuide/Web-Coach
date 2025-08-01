import { useState, useEffect, useContext } from "react";
import "./Dashboard.css";
import {useNavigate, useLocation} from "react-router-dom"
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
  const [previewMessages, setPreviewMessages] = useState([]);
  const [avatar, setAvatar] = useState('')
  const location = useLocation();
  const transition = location.state?.transition;

  useEffect(() => {
    const fetchPreview = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, display_name, message")
        .eq("channel", "general")
        .order("created_at", { ascending: false })
        .limit(2);

      if (!error) setPreviewMessages(data.reverse()); // oldest first
    };

    fetchPreview();

    const channel = supabase
      .channel("chat-preview-general")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: "channel=eq.general" },
        (payload) => {
          setPreviewMessages((prev) => {
            const next = [...prev, payload.new].slice(-2);
            return next;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);


  
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
    setIsLaunching(type); // keep in launching mode

    if (type === "cloud") {
      // Let the cloud appear before routing
      setTimeout(() => {
        navigate(destination);
      }, 1000);
    } else if (type === "slide-left") {
      setTimeout(() => {
        navigate(destination, {
          state: { transition: 'slide-left' }
        });
      }, 800);
    } else {
      // Slide — don’t reset isLaunching immediately!
      setTimeout(() => {
        navigate(destination, {
          state: { transition: 'slide-in' }
        });
      }, 800); // give the slide enough time to animate *before* unmount
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

  const fetchAvatar = async () => {
    const { data: userAvatar, error: avatarError } = await supabase
    .from("user_state")
    .select("avatar_url")
    .eq("user_id", userId)
    .maybeSingle();

    if (avatarError) {
        console.error(avatarError)
    }

    setAvatar(userAvatar?.avatar_url || "/noobie.png");
  }

  fetchAvatar()
    
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
    <div className={`page-slide
      ${transition === 'slide-left' ? 'slide-in-from-left' : ''}
      ${transition === 'slide' ? 'slide-in-from-right' : ''}
      ${isLaunching === 'slide' ? 'exit-to-left-active' : ''}
      ${isLaunching === 'slide-left' ? 'exit-to-right-active' : ''}
    `}>
      <div className={`devdash-root ${isLaunching === "cloud" ? "launching" : ""}`}>
        <div className="cloud-transition">
          <img src="/cloud-cover.png" className={`cloud-cover ${isLaunching === "cloud" ? "visible" : ""}`} />
        </div>
        <div className="devdash-navbar">
          <div className="nav-buttons">
            <div className="nav-icon"><i class="fa-solid fa-gear"></i></div>
            <div className="nav-icon" onClick={() => {navigate('/leaderboard')}}><i class="fa-solid fa-trophy"></i></div>
            {/* add more icons here */}
          </div>
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
              <button onClick={() => {navigate('/playground')}}>Go straight to it!</button>
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
                {previewMessages.map((msg) => (
                  <div key={msg.id} className="chat-message">
                    <span className="chat-username">{msg.display_name}:</span> {msg.message}
                  </div>
                ))}
              </div>
              <button onClick={() => {navigate('/chat')}} className="chat-button">Open Chat</button>
            </div>
          </div>
        </div>

        <div className="arrow-group arrow-left" onClick={() => handleLaunch('/challenges', 'slide-left')}>
          <div className="arrow-circle"><i className="fa-solid fa-angles-left"></i></div>
          <div className="arrow-label">Challenges</div>
        </div>
        <div className="arrow-group arrow-right" onClick={() => handleLaunch('/inbox', 'slide')}>
          <div className="arrow-circle"><i className="fa-solid fa-angles-right"></i></div>
          <div className="arrow-label">Codex</div>
        </div>
        <div className="arrow-group arrow-bottom" onClick={() => handleLaunch('/journey', 'cloud')}>
          <div className="arrow-circle"><i className="fa-solid fa-angles-down"></i></div>
          <div className="arrow-label">View Journey</div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
