import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import projects from '../data/tasks';
import './Inbox.css';

const Inbox = () => {
  const [inboxItems, setInboxItems] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const selectedProjectId = parseInt(localStorage.getItem('selectedProjectId'));
    setSelectedProject(selectedProjectId);
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;

    const historyKey = `inboxHistory_${selectedProjectId}`;
    const inboxHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

    const deliveredTasks = inboxHistory.map(taskId =>
      project.tasks.find(t => t.id === taskId)
    ).filter(Boolean);

    if (localStorage.getItem("taskJustShipped") === "true") {
      const currentTask = JSON.parse(localStorage.getItem("currentTask"));
      const currentIndex = project.tasks.findIndex(t => t.id === currentTask.id);
      const nextTask = project.tasks[currentIndex + 1];

      if (nextTask && !inboxHistory.includes(nextTask.id)) {
        setTimeout(() => {
          const updatedInbox = [...inboxHistory, nextTask.id];
          localStorage.setItem(historyKey, JSON.stringify(updatedInbox));
          setInboxItems([...deliveredTasks, nextTask]);
          localStorage.setItem("taskJustShipped", "false");
        }, 5000);
      } else {
        localStorage.setItem("taskJustShipped", "false");
      }
    }

    setInboxItems(deliveredTasks);
  }, []);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    localStorage.setItem("selectedTask", JSON.stringify(task));
  };

  const handleStartTask = () => {
    if (selectedTask) {
      window.location.href = "/playground";
    }
  };

  return (
    <div className="inbox-wrapper">
      <Sidebar />

      <div className="inbox-main">
        <div className="inbox-sidebar">
          <h2>Inbox</h2>
          {inboxItems.length === 0 ? (
            <p className="inbox-no-selection">No tasks yet. Try selecting a journey!</p>
          ) : (
            inboxItems.map((task) => (
              <div
                key={task.id}
                className={`inbox-email-preview ${selectedTask?.id === task.id ? 'inbox-selected' : ''}`}
                onClick={() => handleTaskClick(task)}
              >
                <h3>{task.subject}</h3>
                <p className="inbox-sender"><strong>From:</strong> {task.sender}</p>
                <p>{task.description}</p>
              </div>
            ))
          )}
        </div>

        <div className="inbox-body">
          {selectedTask ? (
            <>
              <h2>{selectedTask.subject}</h2>
              <p className="inbox-sender"><strong>From:</strong> {selectedTask.sender}</p>
              <div className="inbox-content">{selectedTask.description}</div>
              <button className="inbox-start-task-button" onClick={handleStartTask}>
                Start Task
              </button>
            </>
          ) : (
            <p className="inbox-no-selection">Select a task to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
