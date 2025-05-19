import { useNavigate } from "react-router-dom";
import "./Journey.css";
import projects from "../data/tasks";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../supabaseClient"

export default function Journey() {
  const navigate = useNavigate();

  const handleSelect = (id) => {
    localStorage.setItem('selectedProjectId', id);

    // Check if this project already has inbox history
    const historyKey = `inboxHistory_${id}`;
    const inboxHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

    // If no task was shipped yet, add the first one
    const selectedProject = projects.find((proj) => proj.id === id);
    if (inboxHistory.length === 0 && selectedProject?.tasks.length > 0) {
      const firstTask = selectedProject.tasks[0];
      localStorage.setItem(historyKey, JSON.stringify([firstTask.id]));
      localStorage.setItem('currentTask', JSON.stringify(firstTask));
    }

    localStorage.setItem("taskJustShipped", "true");
    window.location.href = '/inbox';
  };




  return (
    <div className="journey-wrapper">
      <Sidebar />

      <div className="journey-main">
        <h1 className="journey-title">Choose Your Journey</h1>
        <div className="project-grid">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="project-card"
              onClick={() => handleSelect(proj.id)}
            >
              <img src={proj.image} alt={proj.name} className="project-image" />
              <div className="project-info">
                <h2>{proj.name}</h2>
                <p>{proj.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
