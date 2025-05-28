import { useNavigate } from "react-router-dom";
import "./Journey.css";
import Sidebar from "../components/Sidebar";
import supabase from "../../config/supabaseClient";
import { useEffect, useState, useRef } from "react";

export default function Journey() {
  const userId = "demo_user"
  const navigate = useNavigate();

  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [projectTasks, setProjectTasks] = useState([])
  const [taskIds, setTaskIds] = useState([])
  const [ inboxHistory, setInboxHistory] = useState([])

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

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTaskIds();
    fetchInboxHistory();
  }, []);

  const handleSelect = async (id) => {
    const { error } = await supabase
      .from("user_state")
      .update( { selected_project_id: id } )
      .eq("user_id", userId )

      if(error){
        console.error("Error Selecting Project:", error)
      } else {

        const firstTaskId = Number(`${id}01`);

        if (!inboxHistory.includes(firstTaskId)) {
          
          const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", firstTaskId)
          .single();
          
          if (error) {
            console.error("Error fetching first task:", error);
            return
          } else {
            const updatedHistory = [...inboxHistory, firstTaskId]

            const {error2} = await supabase
              .from("user_state")
              .update({current_task: data, inbox_history: updatedHistory, task_just_shipped: false, current_task_id: firstTaskId })
              .eq("user_id", userId)

              if(error2){
                console.error("Error Updating:", error)
              }
          } 
        }
      }

    

    navigate("/inbox")
  }

  useEffect(() => {
    const centerX = window.innerWidth / 2 - 1000; // 1500 = half map width
    const centerY = window.innerHeight / 2 - 700; // 1000 = half map height
    setPosition({ x: centerX, y: centerY });
  }, []);

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



  return (
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
        {/* Put your map image directly here */}
        <img src="/BeachIsland.png" alt="Map" className="map-image" />

        <div className="journey-main">
          <div className="checkpoint" style={{ top: '20%', left: '10%' }} onClick={() => handleSelect(1)}>
            <span>🏝️ Welcome Dock</span>
          </div>
          <div className="checkpoint" style={{ top: '35%', left: '25%' }} onClick={() => handleSelect(2)}>
            <span>🏕️ HTML Hut</span>
          </div>
          <div className="checkpoint" style={{ top: '50%', left: '40%' }} onClick={() => handleSelect(3)}>
            <span>🌊 CSS Cove</span>
          </div>
          {/* Add other checkpoints here */}
        </div>
      </div>
    </div>
  );
}
