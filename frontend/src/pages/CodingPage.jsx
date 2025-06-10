import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import CodeEditor from '../components/CodeEditor';
import './CodingPage.css';
import supabase from '../../config/supabaseClient';
import { getLevelFromExp, getExpForLevel } from "../utils/expCalculator";
import { useNavigate } from "react-router-dom";
import HtmlCodeEditor from '../components/HtmlCodeEditor';
import CssCodeEditor from '../components/CssCodeEditor';
import JsCodeEditor from '../components/JsCodeEditor';

const CodingPage = () => {
  const {user} = useContext(AuthContext)
  if (!user) {
    return <div>Loading...</div>; // or show a spinner, or redirect to login
  }
  const userId = user.id
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
      // alert("Hmm... not quite there yet.\n\nSuggestions:\n" + tips.join('\n'));
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

    const today = new Date().toISOString().split('T')[0]; // "2025-06-05"

    // 1. Get current log
    const { data, error } = await supabase
      .from('task_completion_log')
      .select('daily_log')
      .eq('user_id', userId)
      .single();

    const dailyLog = data?.daily_log || {};
    const tasksToday = dailyLog[today] || [];

    // 2. Add new task
    tasksToday.push(userState.current_task_id);
    dailyLog[today] = tasksToday;

    console.log("Updated daily log:", dailyLog);

    // 3. Update back to Supabase
    await supabase
      .from('task_completion_log')
      .update({ daily_log: dailyLog, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    navigate("/journey");

  }


  const [showResultCard, setShowResultCard] = useState(false);
  const [resultData, setResultData] = useState({
    gainedExp: 0,
    tips: [],
    expectedOutput: "",
  });


  const handleShip = async () => {
    const confirmShip = window.confirm("Are you sure you want to ship? Mistakes will lose you exp!");
    if (!confirmShip) return;

    const isCorrect = checkUserCode();
    const { data, error } = await supabase
      .from("user_state")
      .select("exp")
      .eq("user_id", userId)
      .single();

    if (!data || error) {
      console.error("Failed to fetch exp:", error);
      return;
    }

    let tips = [];
    const lowerCode = htmlCode.toLowerCase();
    if (!lowerCode.includes('<nav')) tips.push("Try adding a <nav> tag.");
    if (!lowerCode.includes('<ul')) tips.push("Did you use an unordered list (<ul>)?");
    if (!lowerCode.includes('>home<')) tips.push("Missing a link to 'Home'.");
    if (!lowerCode.includes('>about<')) tips.push("Missing a link to 'About'.");

    let gainedExp = 0;
    if (!isCorrect) {
      const min = -30;
      const max = -10;
      gainedExp = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      const min = 20;
      const max = 50;
      gainedExp = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const newExp = data.exp + gainedExp;
    const newLevel = getLevelFromExp(newExp);
    const nextLevel = getExpForLevel(newLevel + 1);

    setExp(newExp);
    setLevel(newLevel);
    setNextLevelExp(nextLevel);

    await supabase
      .from("user_state")
      .update({ exp: newExp, level: newLevel })
      .eq("user_id", userId);

    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("expectedOutput")
      .eq("id", currentTask.id)
      .single();

    if (taskError) {
      console.error("Failed to fetch expected output:", taskError);
      return;
    }

    // Show result card
    setResultData({
      gainedExp,
      tips,
      expectedOutput: taskData?.expectedOutput || "",
    });
    setShowResultCard(true);
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
      {showResultCard && (
        <div className={`resultCard ${resultData.gainedExp >= 0 ? "positive" : "negative"}`}>
          <h2>{resultData.gainedExp >= 0 ? "✅ Task Shipped!" : "⚠️ Task Shipped with Mistakes"}</h2>
          <p>
            <strong>{resultData.gainedExp >= 0 ? "EXP Gained:" : "EXP Lost:"}</strong>
            {resultData.gainedExp >= 0 ? ` ${resultData.gainedExp}` : ` ${Math.abs(resultData.gainedExp)}`}
          </p>


          {resultData.tips.length > 0 && (
            <>
              <h3>Improvements</h3>
              <ul>
                {resultData.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </>
          )}

          {resultData.expectedOutput && (
            <>
              <h3>Suggested Answer</h3>
              <pre className="expectedOutput">{resultData.expectedOutput}</pre>
            </>
          )}

          <button onClick={shipTask}>
            {resultData.gainedExp >= 0 ? "Continue" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CodingPage;
