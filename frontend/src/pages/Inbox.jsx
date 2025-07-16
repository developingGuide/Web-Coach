import { useEffect, useState, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import './Inbox.css';
import supabase from '../../config/supabaseClient';
import { AuthContext } from '../components/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { fireConfetti } from '../utils/confetti';

const Inbox = () => {
  const {user} = useContext(AuthContext)
  // if (!user) {
  //   return <div>Loading...</div>;
  // }
  // const userId = user.id
  const [inboxItems, setInboxItems] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [showProjectDonePopup, setShowProjectDonePopup] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate()

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/dashboard', { state: { transition: 'slide-left' } });
    }, 800);
  };

  const handleTaskClick = async (task) => {
    setSelectedTask(task);

    const { error } = await supabase
      .from("user_state")
      .update({ current_task_id: task.id })
      .eq("user_id", user.id);

    if (error) console.error("Failed to update selected task:", error);
  };

  const handleStartTask = () => {
    if (selectedTask) {
      navigate("/playground");
    }
  };


  const location = useLocation();
  const transition = location.state?.transition


  useEffect(() => {
    if (!user) return;

    const fetchInbox = async () => {
      const { data: userState, error: userError } = await supabase
        .from("user_state")
        .select("selected_project_id, inbox_history, current_task_id, task_just_shipped")
        .eq("user_id", user.id)
        .single();

      if (userError || !userState) {
        console.error("Failed to fetch user state:", userError);
        return;
      }

      setSelectedProjectId(userState.selected_project_id);

      const { data: allTasksData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", userState.selected_project_id)
        .order("id", { ascending: true });

      if (taskError) {
        console.error("Error fetching tasks:", taskError);
        return;
      }

      setAllTasks(allTasksData);

      const deliveredTasks = userState.inbox_history
        ?.map(id => allTasksData.find(task => task.id === id))
        .filter(Boolean) || [];

      setInboxItems(deliveredTasks);

      // 🔒 Only attempt delivery if just shipped, and there IS a next task
      if (userState.task_just_shipped) {
        const currentIndex = allTasksData.findIndex(task => task.id === userState.current_task_id);
        const nextTask = allTasksData[currentIndex + 1];

        if (!nextTask) {
          await supabase
            .from("user_state")
            .update({ task_just_shipped: false })
            .eq("user_id", user.id);

          fireConfetti()
          // 👇 Show popup
          setShowProjectDonePopup(true);
          return;
        }


        // 🚫 Don't add nextTask if it's already in inbox_history
        const alreadyInInbox = userState.inbox_history.includes(nextTask.id);
        if (alreadyInInbox) {
          await supabase
            .from("user_state")
            .update({ task_just_shipped: false }) // just reset flag
            .eq("user_id", user.id);
          return;
        }

        setTimeout(async () => {
          const updatedInbox = [...userState.inbox_history, nextTask.id];

          const { error: updateError } = await supabase
            .from("user_state")
            .update({
              inbox_history: updatedInbox,
              current_task_id: nextTask.id,
              task_just_shipped: false,
            })
            .eq("user_id", user.id);

          if (updateError) {
            console.error("Failed to update inbox after delay:", updateError);
          } else {
            fetchInbox(); // refresh inbox UI
          }
        }, 5000);
      }

    };

    fetchInbox();
  }, [user]);


  if (!user) {
    return <div>Loading...</div>;
  }


  return (
    <div className={`page-slide
      ${transition === 'slide-in' ? 'slide-in-from-right' : ''}
      ${transition === 'slide-left' ? 'slide-in-from-left' : ''}
      ${isExiting ? 'exit-to-right-active' : ''}
    `}>
      <div className="inbox-background">
        <button className="inboxBackBtn" onClick={handleBack}>Back</button>
        <div className="inbox-main">
          <div className="inbox-sidebar">
            <h2>The HUD</h2>
            {inboxItems.length === 0 ? (
              <p className="inbox-no-selection">No tasks yet. Try selecting a journey!</p>
            ) : (
              inboxItems.map((task, index) => (
                <div
                  key={task.id}
                  className={`inbox-email-preview ${selectedTask?.id === task.id ? 'inbox-selected' : ''}`}
                  onClick={() => handleTaskClick(task)}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <h3>{task.subject}</h3>
                  <p className="inbox-sender"><strong>Completing For:</strong> {task.sender}</p>
                  <textarea readOnly disabled className='inbox-preview-text' value={task.body}></textarea>
                </div>
              ))
            )}
          </div>

          <div className="inbox-body">
            {selectedTask ? (
              <div className='inbox-task-content'>
                <h2>{selectedTask.subject}</h2>
                <p className="inbox-sender"><strong>From:</strong> {selectedTask.sender}</p>
                <div style={{ whiteSpace: 'pre-line' }} className="inbox-content">{selectedTask.body}</div>
                <button className="inbox-start-task-button" onClick={handleStartTask}>
                  Start Task
                </button>
              </div>
            ) : (
              <p className="inbox-no-selection">Select a task to view details</p>
            )}
          </div>
        </div>
        {showProjectDonePopup && (
          <div className="project-popup-overlay">
            <div className="project-popup">
              <h2>🎉 Project Done!</h2>
              <p>You’ve completed all tasks for this project.</p>
              <button onClick={() => setShowProjectDonePopup(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
