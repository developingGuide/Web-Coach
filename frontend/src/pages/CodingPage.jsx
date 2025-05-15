import { useEffect, useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import './CodingPage.css'
import projects from '../data/tasks';

const CodingPage = () => {
  const [clientTask, setClientTask] = useState('');
  const [taskTitle, setTaskTitle] = useState('Build a NavBar');
  const [showAnswer, setShowAnswer] = useState(false);
  const [expectedOutput, setExpectedOutput] = useState('');
  
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


  useEffect(() => {
    const savedTask = localStorage.getItem('selectedTask');
    
    if (savedTask) {
        const task = JSON.parse(savedTask);
        setTaskTitle(task.title || 'Untitled Task');
        setClientTask(task.body || task.description || '');
        setCode(task.startingCode || defaultTemplate);
        setExpectedOutput(task.expectedOutput || '');
    } else {
      // fallback to first task if nothing is selected
      const fallbackTask = projects[0].tasks[0];
      setTaskTitle(fallbackTask.title);
      setClientTask(fallbackTask.description);
      setCode(fallbackTask.startingCode || defaultTemplate);
      setExpectedOutput(fallbackTask.expectedOutput);
    }
  }, []);



  const handleRun = () => {
    const previewWindow = window.open('', 'Preview', 'width=800,height=600');
    previewWindow.document.open();
    previewWindow.document.write(code);
    previewWindow.document.close();
  };

  
  const handleShip = () => {
    alert("Task marked as complete!");

    const current = JSON.parse(localStorage.getItem("selectedTask"));
    const completed = JSON.parse(localStorage.getItem("completedTasks")) || [];

    if (!completed.includes(current.id)) {
      completed.push(current.id);
      localStorage.setItem("completedTasks", JSON.stringify(completed));
    }

    localStorage.setItem("currentTask", JSON.stringify(current));
    localStorage.setItem("taskJustShipped", true);

    // Schedule delivery of next task in 30 mins (5s for testing)
    setTimeout(() => {
      const projectId = parseInt(localStorage.getItem("selectedProjectId"));
      const project = projects.find(p => p.id === projectId);
      const taskIndex = project.tasks.findIndex(t => t.id === current.id);
      const nextTask = project.tasks[taskIndex + 1];
      if (nextTask) {
        localStorage.setItem("currentTask", JSON.stringify(nextTask));
        const inboxHistory = JSON.parse(localStorage.getItem("inboxHistory")) || [];
        inboxHistory.push(nextTask.id);
        localStorage.setItem("inboxHistory", JSON.stringify(inboxHistory));
      }
    }, 5000); // for testing

    window.location.href = "/inbox";
  };
  
  

  return (
    <div className="codingPage">
      <header className="codingHeader">
        <h2>{taskTitle}</h2>
        <p className="taskDescription">{clientTask}</p>
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
            <pre>{expectedOutput}</pre>
          </div>
        )}

      </div>
    </div>
  );
};

export default CodingPage;
