import "./Dashboard.css";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const task = JSON.parse(localStorage.getItem("currentTask"));
    setCurrentTask(task);
  }, []);

  const goToCodingPage = () => {
    if (currentTask) {
      // Resave task just in case
      localStorage.setItem("selectedTask", JSON.stringify(currentTask));
      navigate("/playground");
    }
  };

  return (
    <main className="mainScreen">
      <h1>Welcome Back, Developer 👋</h1>
      <p>Here's what you’re working on today:</p>

      <section className="tasks">
        {currentTask ? (
          <div className="task-card clickable" onClick={goToCodingPage}>
            {currentTask.title}
          </div>
        ) : (
          <p>No task started yet. Check your messages to begin!</p>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
