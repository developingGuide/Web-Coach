import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import projects from "../data/tasks";
import "./Inbox.css";

export default function Inbox() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem("completedTasks")) || [];
    const current = JSON.parse(localStorage.getItem("currentTask"));

    if (!current) {
      const firstTask = projects[0].tasks[0];
      localStorage.setItem("currentTask", JSON.stringify(firstTask));
    }

    const allTasks = projects.flatMap((p) => p.tasks);
    const filtered = allTasks.filter(
      (task) => completed.includes(task.id) || task.id === current?.id
    );

    setAvailableTasks(filtered);

    // Handle delayed task unlock
    const nextIndex = allTasks.findIndex((t) => t.id === current?.id) + 1;
    const nextTask = allTasks[nextIndex];

    if (localStorage.getItem("taskJustShipped") && nextTask) {
      setTimeout(() => {
        localStorage.setItem("currentTask", JSON.stringify(nextTask));
        localStorage.removeItem("taskJustShipped");
        window.location.reload(); // refresh inbox to show new task
      }, 5000); // 5 seconds for testing
    }
  }, []);

  return (
    <div className="inbox-wrapper">
      <Sidebar />
      <div className="inbox-main">
        <div className="inbox-sidebar">
          <h2>Inbox</h2>
          {availableTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`inbox-email-preview ${selectedTask?.id === task.id ? "inbox-selected" : ""}`}
            >
              <strong>{task.subject}</strong>
              <p className="inbox-sender">{task.sender}</p>
            </div>
          ))}
        </div>

        <div className="inbox-body">
          {selectedTask ? (
            <>
              <h2>{selectedTask.subject}</h2>
              <p><strong>From:</strong> {selectedTask.sender}</p>
              <p className="inbox-content">{selectedTask.body}</p>
              <button
                className="inbox-start-task-button"
                onClick={() => {
                  localStorage.setItem("selectedTask", JSON.stringify(selectedTask));
                  window.location.href = "/playground";
                }}
              >
                Start Task
              </button>
            </>
          ) : (
            <p className="inbox-no-selection">Select an email to view</p>
          )}
        </div>
      </div>
    </div>
  );
}
