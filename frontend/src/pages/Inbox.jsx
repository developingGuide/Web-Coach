// import { useEffect, useState } from 'react';
// import Sidebar from '../components/Sidebar';
// import projects from '../data/tasks';
// import './Inbox.css';
// import supabase from '../../config/supabaseClient';

// const Inbox = () => {
//   const userId = "demo_user"
//   const [inboxItems, setInboxItems] = useState([]);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [selectedProject, setSelectedProject] = useState(null);

//   useEffect(() => {
//     let deliveredNext = false; // 🛡️ prevent double delivery

//     const fetchInbox = async () => {
//       const { data: userState, error } = await supabase
//         .from("user_state")
//         .select("selected_project_id, inbox_history, task_just_shipped, current_task_id")
//         .eq("user_id", userId)
//         .single();

//       if (error || !userState) {
//         console.error("Failed to fetch user state:", error);
//         return;
//       }

//       const selectedProjectId = userState.selected_project_id;
//       setSelectedProject(selectedProjectId);

//       const project = projects.find(p => p.id === selectedProjectId);
//       if (!project) return;

//       const inboxHistory = userState.inbox_history || [];
//       const deliveredTasks = inboxHistory
//         .map(taskId => project.tasks.find(t => t.id === taskId))
//         .filter(Boolean);

//       setInboxItems(deliveredTasks);

//       if (userState.task_just_shipped && !deliveredNext) {
//         const currentIndex = project.tasks.findIndex(t => t.id === userState.current_task_id);
//         const nextTask = project.tasks[currentIndex + 1];

//         if (nextTask && !inboxHistory.includes(nextTask.id)) {
//           setTimeout(async () => {
//             if (deliveredNext) return;
//             deliveredNext = true;

//             const updatedInbox = [...inboxHistory, nextTask.id];

//             const { error: updateError } = await supabase
//               .from("user_state")
//               .update({
//                 inbox_history: updatedInbox,
//                 current_task_id: nextTask.id,
//                 task_just_shipped: false,
//               })
//               .eq("user_id", userId);

//             if (!updateError) {
//               fetchInbox(); // ✅ reload from scratch
//             }
//           }, 5000);

//         } else {
//           await supabase
//             .from("user_state")
//             .update({ task_just_shipped: false })
//             .eq("user_id", userId);
//         }
//       }
//     };

//     fetchInbox();
//   }, [projects, userId]);





//   const handleTaskClick = async (task) => {
//     setSelectedTask(task);

//     const { error } = await supabase
//       .from("user_state")
//       .update({ current_task_id: task.id })
//       .eq("user_id", userId);

//     if (error) {
//       console.error("Failed to update selected task:", error);
//     }
//   };


//   const handleStartTask = () => {
//     if (selectedTask) {
//       window.location.href = "/playground";
//     }
//   };

//   return (
//     <div className="inbox-wrapper">
//       <Sidebar />

//       <div className="inbox-main">
//         <div className="inbox-sidebar">
//           <h2>Inbox</h2>
//           {inboxItems.length === 0 ? (
//             <p className="inbox-no-selection">No tasks yet. Try selecting a journey!</p>
//           ) : (
//             inboxItems.map((task) => (
//               <div
//                 key={task.id}
//                 className={`inbox-email-preview ${selectedTask?.id === task.id ? 'inbox-selected' : ''}`}
//                 onClick={() => handleTaskClick(task)}
//               >
//                 <h3>{task.subject}</h3>
//                 <p className="inbox-sender"><strong>From:</strong> {task.sender}</p>
//                 <p>{task.description}</p>
//               </div>
//             ))
//           )}
//         </div>

//         <div className="inbox-body">
//           {selectedTask ? (
//             <>
//               <h2>{selectedTask.subject}</h2>
//               <p className="inbox-sender"><strong>From:</strong> {selectedTask.sender}</p>
//               <div className="inbox-content">{selectedTask.description}</div>
//               <button className="inbox-start-task-button" onClick={handleStartTask}>
//                 Start Task
//               </button>
//             </>
//           ) : (
//             <p className="inbox-no-selection">Select a task to view details</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Inbox;


import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Inbox.css';
import supabase from '../../config/supabaseClient';

const Inbox = () => {
  const userId = "demo_user";
  const [inboxItems, setInboxItems] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [allTasks, setAllTasks] = useState([]);

  

  useEffect(() => {
    const fetchInbox = async () => {
      const { data: userState, error: userError } = await supabase
        .from("user_state")
        .select("selected_project_id, inbox_history, current_task_id, task_just_shipped")
        .eq("user_id", userId)
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
          // No task to deliver, just reset flag
          await supabase
            .from("user_state")
            .update({ task_just_shipped: false })
            .eq("user_id", userId);
          return;
        }

        setTimeout(async () => {
          const updatedInbox = [...userState.inbox_history, nextTask.id];

          const { error: updateError } = await supabase
            .from("user_state")
            .update({
              inbox_history: updatedInbox,
              current_task_id: nextTask.id,
              task_just_shipped: false, // ✅ Reset the flag after delivering
            })
            .eq("user_id", userId);

          if (updateError) {
            console.error("Failed to update inbox after delay:", updateError);
          } else {
            // ✅ Refresh inbox
            fetchInbox();
          }
        }, 5000);
      }
    };

    fetchInbox();
  }, []);





  const handleTaskClick = async (task) => {
    setSelectedTask(task);

    const { error } = await supabase
      .from("user_state")
      .update({ current_task_id: task.id })
      .eq("user_id", userId);

    if (error) console.error("Failed to update selected task:", error);
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
