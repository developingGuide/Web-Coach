import Sidebar from "../components/Sidebar";
import { useState } from "react";
import projects from "../data/tasks";
import "./Inbox.css";

export default function Inbox() {
  const [selectedTask, setSelectedTask] = useState(null);
  const allTasks = projects.flatMap((p) => p.tasks);

  return (
    <div className="inbox-wrapper">
      <Sidebar />

      <div className="inbox-main">
        <div className="inbox-sidebar">
          <h2>Inbox</h2>
          {allTasks.map((task) => (
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
