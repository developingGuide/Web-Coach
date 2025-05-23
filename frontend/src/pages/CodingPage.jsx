import { useEffect, useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import './CodingPage.css'
import projects from '../data/tasks';
import supabase from '../../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

const CodingPage = () => {
  const userId = "demo_user"
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState()
  const [currentTask, setCurrentTask] = useState({})
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [inboxHistory, setInboxHistory] = useState([])

  
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
  
  const [code, setCode] = useState(defaultTemplate);

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

  useEffect(() => {
    const fetchCurrentTask = async () => {
      const { data, error } = await supabase
        .from("user_state")
        .select("selected_project_id, current_task_id")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        console.error("Failed to fetch current task:", error);
        return;
      }

      const project = projects.find(p => p.id === data.selected_project_id);
      const task = project?.tasks.find(t => t.id === data.current_task_id);

      if (task) {
        setCurrentTask(task); // Make sure this updates your UI
      }
    };

    fetchCurrentTask();
  }, []);


  const fetchCompletedTasks = async () => {
    const { error, data } = await supabase
      .from("user_state")
      .select("completed_tasks")
      .eq("user_id", userId)
      .single(); // THIS is important

    if (error) {
      console.error("Error fetching completed tasks: ", error.message);
      return;
    }

    setCompletedTasks(data?.completed_tasks || []);
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
    fetchCompletedTasks();
    fetchTasks();
    fetchInboxHistory();
  }, []);


  const handleRun = () => {
    const previewWindow = window.open('', 'Preview', 'width=800,height=600');
    previewWindow.document.open();
    previewWindow.document.write(code);
    previewWindow.document.close();
  };

  
  // const handleShip = () => {

  //   if (!completed.includes(current.id)) {
  //     completed.push(current.id);
  //     localStorage.setItem("completedTasks", JSON.stringify(completed));
  //   }

  //   // Schedule delivery of next task in 30 mins (5s for testing)
  //   setTimeout(() => {
  //     const projectId = parseInt(localStorage.getItem("selectedProjectId"));
  //     const project = projects.find(p => p.id === projectId);
  //     const taskIndex = project.tasks.findIndex(t => t.id === current.id);
  //     const nextTask = project.tasks[taskIndex + 1];
  //     if (nextTask) {
  //       localStorage.setItem("currentTask", JSON.stringify(nextTask));
  //       const inboxHistory = JSON.parse(localStorage.getItem("inboxHistory")) || [];
  //       inboxHistory.push(nextTask.id);
  //       localStorage.setItem("inboxHistory", JSON.stringify(inboxHistory));
  //     }
  //   }, 5000); // for testing

  //   window.location.href = "/inbox";
  // };


  const handleShip = async () => {
    if (!currentTask?.id) return;

    const newCompletedTask = [...completedTasks, currentTask.id];

    const { error } = await supabase
      .from("user_state")
      .update({
        completed_tasks: newCompletedTask,
        task_just_shipped: true,
        // `current_task_id` will be updated later in the Inbox
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating user state:", error);
      return;
    }

    alert("Task marked as complete!");
    window.location.href = "/inbox";
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
          <CodeEditor code={currentTask.startingCode} setCode={setCode} />
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
