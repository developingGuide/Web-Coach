import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import "./Journey.css";
import Navbar from "../components/Navbar";
import supabase from "../../config/supabaseClient";
import { useEffect, useState, useRef } from "react";
import { getLevelFromExp, getExpForLevel } from "../utils/expCalculator";
import CloudLayer from "../components/CloudLayer";
import { AuthContext } from "../components/AuthContext";
import ScrollOverlay from "../components/ScrollOverlay";
import EffectsOverlay from "../components/EffectsOverlay";

export default function Journey() {
  // const userId = "demo_user"
  const {user} = useContext(AuthContext)
  if (!user) {
    return <div>Loading...</div>; // or show a spinner, or redirect to login
  }
  const userId = user.id
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [projectTasks, setProjectTasks] = useState([])
  const [taskIds, setTaskIds] = useState([])
  const [ inboxHistory, setInboxHistory] = useState([])
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMapPanelOpen, setIsMapPanelOpen] = useState(false);


  const fetchProjects = async () => {
    const {error, data} = await supabase
      .from("projects")
      .select("*")
      .order("id", {ascending: true});

      if (error) {
        console.error("Error reading projects: ", error.message);
        return
      }
      
      setProjects(data)
  };

  const fetchTasks = async () => {
    const {error, data} = await supabase
      .from("tasks")
      .select("*")
      .order("id", {ascending: true});

      if (error) {
        console.error("Error reading tasks: ", error.message);
        return
      }
      
      setTasks(data)
  };

  const fetchTaskIds = async () => {
    const {data, error } = await supabase
        .from("tasks")
        .select("id")

      if (error) {
        console.error("Error fetching tasks id's:", error);
        return
      }

      setTaskIds(data?.map(task => task.id) || [])
  }

  const fetchInboxHistory = async () => {
    const { data, error } = await supabase
        .from("user_state")
        .select("inbox_history")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching inbox_history:", error);
        return
      }

      setInboxHistory(data?.inbox_history || []);
  }

  const handleSelect = async (id) => {
    const { error } = await supabase
      .from("user_state")
      .update({ selected_project_id: id })
      .eq("user_id", userId);

    if (error) {
      console.error("Error Selecting Project:", error);
    } else {
      const firstTaskId = Number(`${id}01`);

      if (!inboxHistory.includes(firstTaskId)) {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", firstTaskId)
          .single();

        if (taskError) {
          console.error("Error fetching first task:", taskError);
          return;
        }

        const updatedHistory = [...inboxHistory, firstTaskId];
        const { error: updateError } = await supabase
          .from("user_state")
          .update({
            current_task: taskData,
            inbox_history: updatedHistory,
            task_just_shipped: false,
            current_task_id: firstTaskId,
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error Updating:", updateError);
        }
      }

      setShowIpad(true)
      navigate('/inbox')
    }
  };

  const handleOverlayOpen = async (id) => {
    const { data: projectData, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
    } else {
      setSelectedProject(projectData);
    }
  };


  const mapRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const handleDrag = (clientX, clientY) => {
    const newX = clientX - offset.x;
    const newY = clientY - offset.y;

    // Define the limits
    const mapWidth = 2000; // your map width
    const mapHeight = 1300; // your map height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const minX = -(mapWidth - viewportWidth);
    const minY = -(mapHeight - viewportHeight);

    setPosition({
      x: clamp(newX, minX, 0),
      y: clamp(newY, minY, 0),
    });
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      handleDrag(e.clientX, e.clientY);
    }
  };
  
  const handleMouseUp = () => setDragging(false);
  const [userExp, setUserExp] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [nextLevelExp, setNextLevelExp] = useState(100);
  const [currentLevelExp, setCurrentLevelExp] = useState(0);
  const [showIpad, setShowIpad] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMap, setCurrentMap] = useState("BeachIsland"); // or a key from your project list
  
  const checkpointLayouts = {
    BeachIsland: [
      { top: "70%", left: "40%", projectId: 1, scale: 0.8 },
      { top: "68%", left: "60%", projectId: 2, scale: 1.0 },
      { top: "50%", left: "38%", projectId: 3, scale: 1.2 },
    ],
    InfernoInterface: [
      { top: "65%", left: "31%", projectId: 4, scale: 0.8 },
      { top: "72%", left: "68%", projectId: 5, scale: 1.0 },
      { top: "43%", left: "26%", projectId: 6, scale: 1.2 },
    ]
  };

  const mapNames = Object.keys(checkpointLayouts); // ["BeachIsland", "JungleMountain"]
  const checkpoints = checkpointLayouts[currentMap];
  
  const handleMapChange = async (newMapName) => {
    setIsTransitioning(true);

    // Save new map in user_state
    await supabase
      .from("user_state")
      .update({ current_map: newMapName })
      .eq("user_id", userId);

    setTimeout(() => {
      setCurrentMap(newMapName);
      setIsTransitioning(false);
    }, 2000);
  };

  function formatMapName(name) {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTaskIds();
    fetchInboxHistory();

    const centerX = window.innerWidth / 2 - 1000; // 1500 = half map width
    const centerY = window.innerHeight / 2 - 700; // 1000 = half map height
    setPosition({ x: centerX, y: centerY });

    const fetchExp = async () => {
      const { data, error } = await supabase
      .from("user_state")
      .select("exp")
      .eq("user_id", userId)
      .single();

      if (data) {
          const exp = data.exp;
          const level = getLevelFromExp(exp);
          const baseExp = getExpForLevel(level);
          const nextExp = getExpForLevel(level + 1);

          setUserExp(exp);
          setUserLevel(level);
          setCurrentLevelExp(exp - baseExp);
          setNextLevelExp(nextExp - baseExp);
      }
    };

    fetchExp();

    const interval = setInterval(fetchExp, 5000); // re-check every 5 seconds
    return () => clearInterval(interval);
  }, []);


  const [isCoverVisible, setIsCoverVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCoverVisible(false);
    }, 1000); // 1 second

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const step = 30; // how many pixels to move per keypress

    const handleKeyDown = (e) => {
      if (["w", "a", "s", "d"].includes(e.key.toLowerCase())) {
        e.preventDefault(); // avoid default scrolling

        setPosition((prev) => {
          const newX = e.key === "a" ? prev.x + step : e.key === "d" ? prev.x - step : prev.x;
          const newY = e.key === "w" ? prev.y + step : e.key === "s" ? prev.y - step : prev.y;

          const mapWidth = 2000;
          const mapHeight = 1300;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          const minX = -(mapWidth - viewportWidth);
          const minY = -(mapHeight - viewportHeight);

          const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

          return {
            x: clamp(newX, minX, 0),
            y: clamp(newY, minY, 0),
          };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyCombo = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMapPanelOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyCombo);
    return () => window.removeEventListener('keydown', handleKeyCombo);
  }, []);


  return (
    <>
    <div className="cloud-transition">
      <img src="/cloud-cover.png" className={`cloud-cover ${isTransitioning ? "visible" : ""}`} />
    </div>

    {selectedProject && !showIpad && (
      <ScrollOverlay
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onAccept={() => {
          setTimeout(() => {
            setIsTransitioning(true);

            setTimeout(() => {
              handleSelect(selectedProject.id);
            }, 1000); // Give the cloud 1 second to appear
          }, 1600); // Match the scan delay

          setSelectedProject(null);
        }}
        projectImg={selectedProject.image_url}
      />
    )}

    {isCoverVisible && <div className="cloud-cover-opening"></div>}


    <button className="backBtn" onClick={() => {navigate('/dashboard')}}>Back</button>

    <div
      className="map-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        setDragging(true);
        setOffset({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      }}
      onTouchMove={(e) => {
        e.preventDefault()
        
        if (dragging) {
          const touch = e.touches[0];
          handleDrag(touch.clientX, touch.clientY);
        }
      }}
      onTouchEnd={handleMouseUp}
      >
      <div
        className="map-content"
        ref={mapRef}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        >

        {/* <CloudLayer/> */}

        {/* Put your map image directly here */}
        <img src={`/${currentMap}.png`} alt="Map" className="map-image" />

        <div className="journey-main">
          {checkpointLayouts[currentMap]?.map(({ top, left, projectId, scale = 1 }) => {
            // Get all tasks belonging to this project
            const projectTaskIds = tasks
              .filter((task) => task.project_id === projectId)
              .map((task) => task.id);

            // Is every task in inboxHistory?
            const isComplete = projectTaskIds.every((id) => inboxHistory.includes(id));

            return (
              <div
                key={projectId}
                className="checkpoint"
                style={{ top, left }}
                onClick={() => handleOverlayOpen(projectId)}
              >
                <span
                  className="x-on-map"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    display: "inline-block",
                  }}
                >
                  <img
                    src={isComplete ? "/green-tick.png" : "/red-x.png"}
                    alt={isComplete ? "Completed" : "Not completed"}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* <div className="dot-navigation">
        {mapNames.map((mapName) => (
          <button
            key={mapName}
            onClick={() => handleMapChange(`${mapName}`)}
            className={`dot ${currentMap === mapName ? "active" : ""}`}
            title={mapName}
          />
        ))}
      </div> */}


      {/* 🔘 Map toggle button */}
      <div className="map-toggle-button" onClick={() => setIsMapPanelOpen(!isMapPanelOpen)}>
        <i class="fa-regular fa-map"></i>
      </div>

      {/* 🗺 Map panel that slides in */}
      <div className={`map-list-panel ${isMapPanelOpen ? 'open' : ''}`}>
        <div className="map-list-header">
          <h2>Choose a Map</h2>
          <button onClick={() => setIsMapPanelOpen(false)}>✕</button>
        </div>
        <ul>
          {mapNames.map((mapName) => (
            <li
              key={mapName}
              className={currentMap === mapName ? 'active' : ''}
              onClick={() => {
                handleMapChange(mapName);
                setIsMapPanelOpen(false);
              }}
            >
              <p>{formatMapName(mapName)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
}
