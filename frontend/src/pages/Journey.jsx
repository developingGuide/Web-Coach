import { useNavigate } from "react-router-dom";
import "./Journey.css";
import Sidebar from "../components/Sidebar";
import supabase from "../../config/supabaseClient";
import { useEffect, useState } from "react";

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



  return (
    <div className="journey-main">
      <h1 className="journey-title">Choose Your Journey</h1>
      <div className="project-grid">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="project-card"
            onClick={() => handleSelect(proj.id)}
          >
            <img src={proj.image_url} alt={proj.name} className="project-image" />
            <div className="project-info">
              <h2>{proj.name}</h2>
              <p>{proj.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
