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
    const lowerCode = code.toLowerCase();

    const hasNav = lowerCode.includes('<nav');
    const hasUL = lowerCode.includes('<ul');
    const hasHome = lowerCode.includes('>home<');
    const hasAbout = lowerCode.includes('>about<');

    if (hasNav && hasUL && hasHome && hasAbout) {
      alert("✅ Task shipped successfully! New task will arrive in 30 minutes.");

      // Save progress (optional)
      localStorage.setItem('taskShipped', Date.now());

      // Schedule next task (in real app, you'd use backend/timer/cron)
      setTimeout(() => {
        loadNextTask();
      }, 30 * 60 * 1000); // 30 minutes
    } else {
      let tips = [];
      if (!hasNav) tips.push("Try adding a <nav> tag.");
      if (!hasUL) tips.push("Did you use an unordered list (<ul>)?");
      if (!hasHome) tips.push("Missing a link to 'Home'.");
      if (!hasAbout) tips.push("Missing a link to 'About'.");

      alert("Hmm... not quite there yet.\n\nSuggestions:\n" + tips.join('\n'));
    }
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
