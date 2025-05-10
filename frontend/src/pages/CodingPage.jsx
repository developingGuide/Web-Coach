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
    const currentTask = projects[0].tasks[0];
    setTaskTitle(currentTask.title);
    setClientTask(currentTask.description);
    setCode(currentTask.startingCode || defaultTemplate);
    setExpectedOutput(currentTask.expectedOutput);
  }, []);


  const handleRun = () => {
    const previewWindow = window.open('', 'Preview', 'width=800,height=600');
    previewWindow.document.open();
    previewWindow.document.write(code);
    previewWindow.document.close();
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
          <button className="shipButton">Ship</button>
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
