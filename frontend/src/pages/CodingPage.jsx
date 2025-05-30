import { useEffect, useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import './CodingPage.css';
import supabase from '../../config/supabaseClient';
import { getLevelFromExp, getExpForLevel } from "../utils/expCalculator";
import { useNavigate } from "react-router-dom";
import HtmlCodeEditor from '../components/HtmlCodeEditor';
import CssCodeEditor from '../components/CssCodeEditor';
import JsCodeEditor from '../components/JsCodeEditor';

const CodingPage = () => {
  const userId = "demo_user";
  const [showTools, setShowTools] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [code, setCode] = useState("");
  const [exp, setExp] = useState(0);
  const [level, setLevel] = useState(1);
  const [ nextLevelExp,setNextLevelExp] = useState(0)
  const navigate = useNavigate()
  const [htmlCode, setHtmlCode] = useState("<h1>Hello</h1>");
  const [cssCode, setCssCode] = useState("body { background: #111; }");
  const [jsCode, setJsCode] = useState("console.log('Hello');");
  const [activeTab, setActiveTab] = useState("html");

  const defaultTemplate = `<!-- Stylesheet and JavaScript are linked automatically -->

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>

</body>
</html>
`;

  const [taskTools, setTaskTools] = useState(false);


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
    setTaskTools((taskData.tools || "").split(",").map(t => t.trim()));
    setHtmlCode(taskData.startingHtml || defaultTemplate);
    setCssCode(taskData.startingCss || "body { background: white; }");
    setJsCode(taskData.startingJs || "console.log('Hello');");

  };

  useEffect(() => {
    fetchCurrentTask();
  }, []);

  const handleRun = () => {
    const finalCode = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
        <script>${jsCode}<\/script>
      </body>
      </html>
    `;

    const previewWindow = window.open('', 'Preview', 'width=800,height=600');
    if (!previewWindow) {
      alert("Popup blocked! Please allow popups to preview your code.");
      return;
    }
    previewWindow.document.open();
    previewWindow.document.write(finalCode);
    previewWindow.document.close();
  };


  const checkUserCode = () => {
    const lowerCode = htmlCode.toLowerCase();

    const hasNav = lowerCode.includes('<nav');
    const hasUL = lowerCode.includes('<ul');
    const hasHome = lowerCode.includes('>home<');
    const hasAbout = lowerCode.includes('>about<');

    let tips = [];
    if (!hasNav) tips.push("Try adding a <nav> tag.");
    if (!hasUL) tips.push("Did you use an unordered list (<ul>)?");
    if (!hasHome) tips.push("Missing a link to 'Home'.");
    if (!hasAbout) tips.push("Missing a link to 'About'.");

    if (tips.length > 0) {
      alert("Hmm... not quite there yet.\n\nSuggestions:\n" + tips.join('\n'));
      return false;
    }

    return true;
  };


  const shipTask = async () => {
    if (!currentTask?.id) return;
  
    const { data: userState, error: stateError } = await supabase
      .from("user_state")
      .select("selected_project_id, inbox_history, current_task_id, completed_tasks")
      .eq("user_id", userId)
      .single();

    if (stateError || !userState) {
      console.error("Failed to fetch user state:", stateError);
      return;
    }

    // Just mark it as shipped (in a new column or flag)
    const { error: updateError } = await supabase
      .from("user_state")
      .update({ task_just_shipped: true })  // this triggers delayed delivery in Inbox
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to mark task as shipped:", updateError);
      return;
    }

    const finishedTask = [...userState.completed_tasks, userState.current_task_id]

    const { error: completedError } = await supabase
      .from("user_state")
      .update({ completed_tasks: finishedTask })  // this triggers delayed delivery in Inbox
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to mark task as shipped:", completedError);
      return;
    }

    alert("Task shipped! Next task will be delivered in 30 minutes!...");

    window.location.href = "/journey";
  }

  const handleShip = async () => {
    const isCorrect = checkUserCode(); // your current correctness check function

    if (!isCorrect) {
      const confirmShip = window.confirm("Are you sure you want to ship? Mistakes will lose you exp!");
      if (!confirmShip) return;
    }

    const { data, error } = await supabase
      .from("user_state")
      .select("exp")
      .eq("user_id", userId)
      .single();

    if (!data || error) {
      console.error("Failed to fetch exp:", error);
      return;
    }

    const gainedExp = 30;
    const newExp = data.exp + gainedExp;
    const newLevel = getLevelFromExp(newExp);
    const nextLevel = getExpForLevel(newLevel + 1);

    // Update local state correctly
    setExp(newExp);
    setLevel(newLevel);
    setNextLevelExp(nextLevel);

    const { error2 } = await supabase
      .from("user_state")
      .update({ exp: newExp, level: newLevel })
      .eq("user_id", userId);

    // Proceed with shipping regardless of correctness
    shipTask(); // your existing shipping logic
  };


  const handleBack = () => {
    const confirmLeave = window.confirm("Are you sure? Progress will be lost.");
    if (confirmLeave) {
      navigate("/journey");
    }
  };


  return (
    <div className="codingPage">
      <header className="codingHeader">
        <div className="codingHeaderTop">
          <button className="backButton" onClick={handleBack}>← Back</button>
          <div className='taskText'>
            <h2>{currentTask.title}</h2>
            <p className="taskDescription">{currentTask.description}</p>
          </div>
        </div>

        <div className="codingButtons">

          <button onClick={() => setShowTools(!showTools)}>
            {showTools ? 'Hide Tools' : 'Show Tools'}
          </button>
          <button onClick={handleRun}>Run</button>
          <button className="shipButton" onClick={handleShip}>Ship</button>
        </div>
      </header>

      <div className="tabButtons">
        <button className={activeTab === "html" ? "active" : ""} onClick={() => setActiveTab("html")}>HTML</button>
        <button className={activeTab === "css" ? "active" : ""} onClick={() => setActiveTab("css")}>CSS</button>
        <button className={activeTab === "js" ? "active" : ""} onClick={() => setActiveTab("js")}>JavaScript</button>
      </div>
      <div className="codingBody">
        <div className="editorWrapper">
          {activeTab === "html" && <HtmlCodeEditor code={htmlCode} setCode={setHtmlCode} />}
          {activeTab === "css" && <CssCodeEditor code={cssCode} setCode={setCssCode} />}
          {activeTab === "js" && <JsCodeEditor code={jsCode} setCode={setJsCode} />}
        </div>


        {showTools && (
          <div className="toolsPane">
            <h3>Tools for this Task:</h3>
            <ul>
              {taskTools?.map((tool, index) => (
                <li key={index}>{tool}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingPage;
