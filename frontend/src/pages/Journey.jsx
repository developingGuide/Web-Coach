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
import Shepherd from 'shepherd.js';
import "./Tour2.css";
// import 'shepherd.js/dist/css/shepherd.css';

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
  const passedMap = location.state?.selectedMap;
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = (destination, type) => {
    setIsLaunching(type);

    if (type === "cloud") {
      setTimeout(() => {
        navigate(destination, { state: { transition: 'cloud' } });
      }, 1000);
    } else {
      navigate(destination);
    }
  };


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
      { top: "65%", left: "40%", projectId: 1, scale: 0.8 },
      { top: "68%", left: "60%", projectId: 2, scale: 1.0 },
      { top: "40%", left: "69%", projectId: 3, scale: 1.2 },
    ],
    InfernoInterface: [
      { top: "64%", left: "50.5%", projectId: 4, scale: 0.8 },
      { top: "61%", left: "71.5%", projectId: 5, scale: 1.0 },
      { top: "49%", left: "45%", projectId: 6, scale: 1.2 },
      { top: "40%", left: "62%", projectId: 7, scale: 1.4 },
    ],
    ThemePark: [
      { top: "82%", left: "29%", projectId: 8, scale: 0.8 },
      { top: "80%", left: "82%", projectId: 9, scale: 1.0 },
      { top: "68%", left: "52%", projectId: 10, scale: 1.2 },
      { top: "32%", left: "25%", projectId: 11, scale: 1.4 },
    ],
  };

  const mapInfo = {
    BeachIsland: "Learn Basic Syntax",
    InfernoInterface: "Learn How To Use and Manipulate Variables",
    ThemePark: "Learn the most common CSS"
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


  const startJourneyTour = () => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        scrollTo: false,
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-arrows neon-tour', // custom class for theme
        buttons: [
          { text: 'Next', action: Shepherd.next }
        ]
      }
    });

    // Step 1 — Intro
    tour.addStep({
      id: 'map-intro',
      text: 'This is a map, where the projects are stored! A new map will be launched every month.',
      attachTo: {
        element: '.map-container', // adjust to your map wrapper selector
        on: 'bottom'
      },
      buttons: [{ text: 'Next', action: tour.next }]
    });

    // Step 2 — Highlight X marks
    tour.addStep({
      id: 'marks-intro',
      text: 'The projects are planned by the Idealist... But they did not have the skills to build them...',
      attachTo: {
        element: '.x-on-map',
        on: 'bottom'
      },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next }
      ]
    });

    // Step 3 — Legacy story
    tour.addStep({
      id: 'legacy',
      text: 'So they left marks on the map for builders like you to not only build their projects, but to carry on their legacy.',
      attachTo: {
        element: '.x-on-map',
        on: 'top'
      },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next }
      ]
    });

    // Step 4 — Difficulty sizes
    tour.addStep({
      id: 'difficulty',
      text: 'Each X is marked with various sizes based on difficulty — smallest is the easiest, biggest is the toughest. They recommend going from smallest to biggest',
      attachTo: {
        element: '.x-on-map',
        on: 'top'
      },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next }
      ]
    });

    // Step 5 — Open smallest project
    tour.addStep({
      id: 'smallest',
      text: "Let's open up the smallest one to see what they planned...",
      attachTo: {
        element: '.x-on-map.smallest', // add a class to the smallest project mark
        on: 'top'
      },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Done', action: tour.complete }
      ]
    });

    tour.start();
  };


  function formatMapName(name) {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  
  function useSound(src) {
    const soundRef = useRef(new Audio(src));

    const play = () => {
      const sound = soundRef.current;
      sound.currentTime = 0; // rewind so it can play repeatedly
      sound.play().catch(() => {});
    };


    return play;
  }
    
  
  const playClick = useSound("/sfx/backBtn.mp3");

  // useEffect(() => {
    //   if (user && !localStorage.getItem('seenJourneyTour')) {
  //     startJourneyTour();
  //     localStorage.setItem('seenJourneyTour', 'true');
  //   }
  // }, [user]);


  useEffect(() => {
    if (user && !localStorage.getItem('seenJourneyTour')) {
      startJourneyTour();
      localStorage.setItem('seenJourneyTour', 'true');
    }
  }, [user]);

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
    if (passedMap) {
      setCurrentMap(passedMap); // This is the important part
    }
  }, [passedMap]);


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

    <div className="cloud-transition">
      <img
        src="/cloud-cover.png"
        className={`cloud-cover ${isLaunching === "cloud" ? "visible" : ""}`}
      />
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


    <button className="backBtn" onClick={() => {playClick(); handleLaunch('/dashboard', 'cloud');}}>Back</button>

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
              className={`map-item ${currentMap === mapName ? 'active' : ''}`}
              onClick={() => {
                handleMapChange(mapName);
                setIsMapPanelOpen(false);
              }}
            >
              <p>{formatMapName(mapName)}</p>

              <div className="info-container">
                <i class="fa-solid fa-circle-info"></i>
                <div className="tooltip">{mapInfo[mapName] || "No info available"}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 9999, borderRadius: '50%', backgroundColor: "#ffffff30" }}
        onClick={startJourneyTour}
      >
        <i class="fa-solid fa-question"></i>
      </button>

    </div>
    </>
  );
}
