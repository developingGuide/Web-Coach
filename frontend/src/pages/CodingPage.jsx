// import { useEffect, useState } from 'react';
// import CodeEditor from '../components/CodeEditor';
// import './CodingPage.css'
// import projects from '../data/tasks';
// import supabase from '../../config/supabaseClient';
// import { useNavigate } from 'react-router-dom';

// const CodingPage = () => {
//   const userId = "demo_user"
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [currentTaskId, setCurrentTaskId] = useState()
//   const [currentTask, setCurrentTask] = useState({})
//   const [tasks, setTasks] = useState([])
//   const [inboxHistory, setInboxHistory] = useState([])

  
//   const defaultTemplate = `<!DOCTYPE html>
//   <html lang="en">
//   <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <style>
  
//   </style>
//   </head>
//   <body>
  
  
//   <script>
  
//   </script>
//   </body>
//   </html>`;
  
//   const [code, setCode] = useState(defaultTemplate);

//   const fetchTasks = async () => {
//     const {error, data} = await supabase
//       .from("tasks")
//       .select("*")
//       .order("id", {ascending: true});

//       if (error) {
//         console.error("Error reading tasks: ", error.message);
//         return
//       }
      
//       setTasks(data)
//   };

//   useEffect(() => {
//     const fetchCurrentTask = async () => {
//       const { data, error } = await supabase
//         .from("user_state")
//         .select("selected_project_id, current_task_id")
//         .eq("user_id", userId)
//         .single();

//       if (error || !data) {
//         console.error("Failed to fetch current task:", error);
//         return;
//       }

//       const project = projects.find(p => p.id === data.selected_project_id);
//       const task = project?.tasks.find(t => t.id === data.current_task_id);

//       if (task) {
//         setCurrentTask(task); // Make sure this updates your UI
//       }
//     };

//     fetchCurrentTask();
//   }, []);

//   const fetchInboxHistory = async () => {
//     const { data, error } = await supabase
//         .from("user_state")
//         .select("inbox_history")
//         .eq("user_id", userId)
//         .single();

//       if (error) {
//         console.error("Error fetching inbox_history:", error);
//         return
//       }

//       setInboxHistory(data?.inbox_history || []);
//   }

//   useEffect(() => {
//     fetchTasks();
//     fetchInboxHistory();
//   }, []);


//   const handleRun = () => {
//     const previewWindow = window.open('', 'Preview', 'width=800,height=600');
//     previewWindow.document.open();
//     previewWindow.document.write(code);
//     previewWindow.document.close();
//   };


//   const handleShip = async () => {
//     if (!currentTask?.id) return;

//     const { error } = await supabase
//       .from("user_state")
//       .update({
//         task_just_shipped: true,
//         // `current_task_id` will be updated later in the Inbox
//       })
//       .eq("user_id", userId);

//     if (error) {
//       console.error("Error updating user state:", error);
//       return;
//     }

//     alert("Task marked as complete!");
//     window.location.href = "/inbox";
//   };




  
  

//   return (
//     <div className="codingPage">
//       <header className="codingHeader">
//         <h2>{currentTask.title}</h2>
//         <p className="taskDescription">{currentTask.description}</p>
//         <div className="codingButtons">
//           <button onClick={handleRun}>Run</button>
//           <button onClick={() => setShowAnswer(!showAnswer)}>
//             {showAnswer ? 'Hide Answer' : 'Check Answer'}
//           </button>
//           <button className="shipButton" onClick={handleShip}>Ship</button>
//         </div>
//       </header>

//       <div className="codingBody">
//         <div className="editorWrapper">
//           <CodeEditor code={currentTask.startingCode} setCode={setCode} />
//         </div>

//         {showAnswer && (
//           <div className="answerPane">
//             <h3>Expected Output:</h3>
//             <pre>{currentTask.expectedOutput}</pre>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default CodingPage;


import { useEffect, useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import './CodingPage.css';
import supabase from '../../config/supabaseClient';

const CodingPage = () => {
  const userId = "demo_user";
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [code, setCode] = useState("");

  const defaultTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>

  </style>
</head>
<body>


<script>

</script>
</body>
</html>`;

  const fetchCurrentTask = async () => {
    const { data: userState, error: stateError } = await supabase
      .from("user_state")
      .select("selected_project_id, current_task_id")
      .eq("user_id", userId)
      .single();

    if (stateError || !userState) {
      console.error("Failed to fetch user state:", stateError);
      return;
    }

    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", userState.current_task_id)
      .single();

    if (taskError || !taskData) {
      console.error("Failed to fetch current task data:", taskError);
      return;
    }

    setCurrentTask(taskData);
    setCode(taskData.startingCode || defaultTemplate);
  };

  useEffect(() => {
    fetchCurrentTask();
  }, []);

  const handleRun = () => {
    const previewWindow = window.open('', 'Preview', 'width=800,height=600');
    previewWindow.document.open();
    previewWindow.document.write(code);
    previewWindow.document.close();
  };

  const handleShip = async () => {
    if (!currentTask?.id) return;

    const { data: userState, error: stateError } = await supabase
      .from("user_state")
      .select("selected_project_id, inbox_history, current_task_id")
      .eq("user_id", userId)
      .single();

    if (stateError || !userState) {
      console.error("Failed to fetch user state:", stateError);
      return;
    }

    const { data: taskList, error: taskError } = await supabase
      .from("tasks")
      .select("id")
      .eq("project_id", userState.selected_project_id)
      .order("id", { ascending: true });

    if (taskError) {
      console.error("Failed to fetch task list:", taskError);
      return;
    }

    const currentIndex = taskList.findIndex(t => t.id === userState.current_task_id);
    const nextTask = taskList[currentIndex + 1];

    if (!nextTask) {
      alert("No more tasks in this project!");
      return;
    }

    // Delay delivery by 5 seconds
    setTimeout(async () => {
      const updatedInbox = [...userState.inbox_history, nextTask.id];

      const { error: updateError } = await supabase
        .from("user_state")
        .update({
          inbox_history: updatedInbox,
          current_task_id: nextTask.id,
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Failed to update inbox:", updateError);
        return;
      }

      alert("Task shipped! Next task delivered.");
      window.location.href = "/inbox";
    }, 5000);
  };




  return (
    <div className="codingPage">
      <header className="codingHeader">
        <h2>{currentTask.title}</h2>
        <p className="taskDescription">{currentTask.description}</p>
        <div className="codingButtons">
          <button onClick={handleRun}>Run</button>
          <button onClick={() => setShowAnswer(!showAnswer)}>
            {showAnswer ? 'Hide Answer' : 'Check Answer'}
          </button>
          <button className="shipButton" onClick={handleShip}>Ship</button>
        </div>
      </header>

      <div className="codingBody">
        <div className="editorWrapper">
          <CodeEditor code={code} setCode={setCode} />
        </div>

        {showAnswer && (
          <div className="answerPane">
            <h3>Expected Output:</h3>
            <pre>{currentTask.expectedOutput}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingPage;
