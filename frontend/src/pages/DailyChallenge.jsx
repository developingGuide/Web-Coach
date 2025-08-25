import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../components/AuthContext';
import './DailyChallenge.css';
import supabase from '../../config/supabaseClient';
import { getLevelFromExp, getExpForLevel } from "../utils/expCalculator";
import { useNavigate } from "react-router-dom";
import { fireConfetti } from '../utils/confetti';
import HtmlCodeEditor from '../components/HtmlCodeEditor';
import CssCodeEditor from '../components/CssCodeEditor';
import JsCodeEditor from '../components/JsCodeEditor';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import './Tour4.css'

const DailyChallengePage = () => {
  const {user} = useContext(AuthContext)
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
  const [taskTools, setTaskTools] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [showTaskBody, setShowTaskBody] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [usedHint, setUsedHint] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const [resultData, setResultData] = useState({
    gainedExp: 0,
    tips: [],
    expectedOutput: "",
  });

  const [toolsWidth, setToolsWidth] = useState(350); // default width
  const isResizing = useRef(false);


  const startResizing = (e) => {
    isResizing.current = true;

    const startX = e.clientX;
    const startWidth = toolsWidth;

    const onMouseMove = (e) => {
      if (!isResizing.current) return;
      const newWidth = startWidth - (e.clientX - startX);
      if (newWidth > 200 && newWidth < 600) {
        setToolsWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key.toLowerCase() === "s") {
        e.preventDefault(); // prevent browser refresh
        handleRun();        // trigger your Run function
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [htmlCode, cssCode, jsCode]);

  
  
  useEffect(() => {
    if (user) {
      fetchDailyChallenge();
    }
  }, [user]);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  const userId = user.id;
  
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

//   useEffect(() => {
//     if (user && !localStorage.getItem('seenCodingPageTour')) {
//       startCodingPageTour();
//       localStorage.setItem('seenCodingPageTour', 'true');
//     }
//   }, [user]);


//   function startCodingPageTour() {
//     const tour = new Shepherd.Tour({
//       defaultStepOptions: {
//         scrollTo: false,
//         cancelIcon: {
//           enabled: true
//         }
//       }
//     });

//     tour.addStep({
//       id: 'welcome',
//       text: 'Welcome to the coding page... where you code!',
//       buttons: [
//         { text: 'Next', action: tour.next }
//       ]
//     });

//     tour.addStep({
//       id: 'tabs',
//       text: 'By default, HTML, CSS and JavaScript are already linked together. You just have to play with the tabs.',
//       attachTo: {
//         element: '.tabButtons',
//         on: 'bottom'
//       },
//       buttons: [
//         { text: 'Back', action: tour.back },
//         { text: 'Next', action: tour.next }
//       ]
//     });

//     tour.addStep({
//       id: 'tools',
//       text: 'Here are tools to help you create projects. Sometimes, some tools may be missing depending on what concept you’re learning! Do not get too overwhelmed the them, you will learn as you go!',
//       attachTo: {
//         element: '.toolsBtn',
//         on: 'bottom'
//       },
//       buttons: [
//         { text: 'Back', action: tour.back },
//         { text: 'Next', action: tour.next }
//       ]
//     });

//     tour.addStep({
//       id: 'run',
//       text: 'You can see the result of your code with the Run button.',
//       attachTo: {
//         element: '.runBtn',
//         on: 'bottom'
//       },
//       buttons: [
//         { text: 'Back', action: tour.back },
//         { text: 'Next', action: tour.next }
//       ]
//     });

//     tour.addStep({
//       id: 'ship',
//       text: 'When you are done, click Ship! This will check your code and give you EXP based on your answer.',
//       attachTo: {
//         element: '.shipButton',
//         on: 'bottom'
//       },
//       buttons: [
//         { text: 'Back', action: tour.back },
//         { text: 'Next', action: tour.next }
//       ]
//     });

//     tour.addStep({
//       id: 'freedom',
//       text: 'Now you’re on your own! Feel free to explore. Some features may still be limited as we’re still building.',
//       buttons: [
//         { text: 'Back', action: tour.back },
//         { text: 'Next', action: tour.next }
//       ]
//     });

//     tour.addStep({
//       id: 'end',
//       text: 'As this is a beta version, do expect bugs and glitches and weird stuff out of nowhere.. If you face any do email fundevsim@gmail.com',
//       buttons: [
//         { text: 'Finish', action: tour.complete }
//       ]
//     });

//     tour.start();
//   }



  const fetchDailyChallenge = async () => {
    const today = new Date().toISOString().split("T")[0]; // "2025-08-25"

    const { data, error } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("date", today)
        .single();

    if (error) {
        console.error("No challenge found for today:", error);
        return;
    }

    setCurrentTask(data);
    setHtmlCode(data.startingHtml);
    setCssCode(data.startingCss);
    setJsCode(data.startingJs);
    setTaskTools({
        html: data.html_tools,
        css: data.css_tools,
        js: data.js_tools,
    });
  };

  function extractTagsFromBody(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const bodyElements = doc.body.getElementsByTagName("*");

    const tags = new Set();

    for (let el of bodyElements) {
      tags.add(el.tagName.toLowerCase());
    }

    return Array.from(tags);
  }


  function extractCssRules(css) {
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    const rules = {};
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2]
        .split(";")
        .map(decl => decl.trim())
        .filter(Boolean); // remove empty strings

      rules[selector] = declarations;
    }

    return rules;
  }

  function extractJsSnippets(js) {
    // You can make this smarter later (like extracting only function names)
    const cleaned = js
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("//")); // ignore comments
    return cleaned;
  }



  const handleRun = () => {
    let previewWindow = null;

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

    if (!previewWindow || previewWindow.closed) {
      previewWindow = window.open('', 'preview', 'width=800,height=600');
    }

    previewWindow.document.open();
    previewWindow.document.write(finalCode);
    previewWindow.document.close();


  };



  const checkUserCode = () => {
    if (!currentTask) return { correct: false, tips: [] };

    const strict = currentTask.strict_check;
    const expectedHtml = currentTask.html_check || "";
    const expectedCss = currentTask.css_check || "";
    const expectedJs = currentTask.js_check || "";

    let tips = [];

    if (strict) {
      // Full strict matching
      const htmlOk = htmlCode.trim() === expectedHtml.trim();
      const cssOk = cssCode.trim() === expectedCss.trim();
      const jsOk = jsCode.trim() === expectedJs.trim();

      if (!htmlOk) tips.push("HTML doesn’t match exactly.");
      if (!cssOk) tips.push("CSS doesn’t match exactly.");
      if (!jsOk) tips.push("JavaScript doesn’t match exactly.");

      return { correct: htmlOk && cssOk && jsOk, tips };
    } else {
      // Non-strict: check presence of required tags or keywords
      const requiredTags = extractTagsFromBody(expectedHtml); // get ['h1', 'p', 'a']
      const userTags = extractTagsFromBody(htmlCode);
      const missingTags = requiredTags.filter(tag => !userTags.includes(tag));

      missingTags.forEach(tag => {
        tips.push(`<${tag}> tag is missing.`);
      });

      // CSS: check for presence of selectors
      const expectedRules = extractCssRules(expectedCss);
      const userRules = extractCssRules(cssCode);

      for (const selector in expectedRules) {
        const expectedDeclarations = expectedRules[selector];
        const userDeclarations = userRules[selector] || [];

        expectedDeclarations.forEach(expectedDecl => {
          const expectedNormalized = expectedDecl.replace(/\s+/g, "").toLowerCase();
          const found = userDeclarations.some(userDecl =>
            userDecl.replace(/\s+/g, "").toLowerCase() === expectedNormalized
          );

          if (!found) {
            tips.push(`In selector "${selector}", missing or incorrect declaration: "${expectedDecl}"`);
          }
        });
      }

      // JS: check for presence of expected function/words
      const requiredSnippets = extractJsSnippets(expectedJs);
      requiredSnippets.forEach(snippet => {
        const regex = new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
        if (!regex.test(jsCode)) {
          tips.push(`Missing JS code: ${snippet}`);
        }
      });

      return { correct: tips.length === 0, tips };
    }
  };






//   const shipTask = async () => {
//     if (!currentTask?.id) return;
  
//     const { data: userState, error: stateError } = await supabase
//       .from("user_state")
//       .select("selected_project_id, inbox_history, current_task_id, completed_tasks")
//       .eq("user_id", userId)
//       .single();

//     if (stateError || !userState) {
//       console.error("Failed to fetch user state:", stateError);
//       return;
//     }

//     // Just mark it as shipped (in a new column or flag)
//     const { error: updateError } = await supabase
//       .from("user_state")
//       .update({ task_just_shipped: true })  // this triggers delayed delivery in Inbox
//       .eq("user_id", userId);

//     if (updateError) {
//       console.error("Failed to mark task as shipped:", updateError);
//       return;
//     }

//     const finishedTask = [...userState.completed_tasks, userState.current_task_id]

//     const { error: completedError } = await supabase
//       .from("user_state")
//       .update({ completed_tasks: finishedTask })  // this triggers delayed delivery in Inbox
//       .eq("user_id", userId);

//     if (updateError) {
//       console.error("Failed to mark task as shipped:", completedError);
//       return;
//     }

//     const today = new Date().toISOString().split('T')[0]; // "2025-06-05"

//     // 1. Get current log
//     const { data, error } = await supabase
//       .from('task_completion_log')
//       .select('daily_log')
//       .eq('user_id', userId)
//       .single();

//     const dailyLog = data?.daily_log || {};
//     const tasksToday = dailyLog[today] || [];

//     // 2. Add new task
//     tasksToday.push(userState.current_task_id);
//     dailyLog[today] = tasksToday;

//     // 3. Update back to Supabase
//     await supabase
//       .from('task_completion_log')
//       .upsert(
//         { user_id: userId, daily_log: dailyLog, updated_at: new Date().toISOString() },
//         { onConflict: ['user_id'] }
//       );

//     navigate("/inbox");

//   }




  const handleShip = async () => {
    if (!currentTask?.id) return;

    const confirmShip = window.confirm("Are you sure you want to ship today's challenge?");
    if (!confirmShip) return;

    // Check if already completed today
    const today = new Date().toISOString().split("T")[0];
    const { data: existingLog, error: logError } = await supabase
        .from("daily_challenge_log")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

    if (existingLog?.completed) {
        alert("You already completed today’s challenge. Come back tomorrow!");
        return;
    }

    // Step 1: Check correctness
    const { correct, tips } = checkUserCode();

    // Step 2: Award EXP
    const { data: userData, error: userError } = await supabase
        .from("user_state")
        .select("exp, level")
        .eq("user_id", userId)
        .single();

    if (userError || !userData) {
        console.error("Failed to fetch user state:", userError);
        return;
    }

    let baseExp = 0;
    let gainedExp = 0;
    if (correct) {
        const min = 30;
        const max = 70;
        
        baseExp = Math.floor(Math.random() * (max - min + 1)) + min;

        gainedExp = usedHint ? Math.floor(baseExp / 2) : baseExp;
        if (gainedExp > 0) fireConfetti();
    }

    const newExp = userData.exp + gainedExp;
    const newLevel = getLevelFromExp(newExp);
    const nextLevel = getExpForLevel(newLevel + 1);

    setUsedHint(false);
    setShowReminder(false);
    setExp(newExp);
    setLevel(newLevel);
    setNextLevelExp(nextLevel);

    await supabase
        .from("user_state")
        .update({ exp: newExp, level: newLevel })
        .eq("user_id", userId);

    // Step 3: Log the daily challenge
    if (existingLog) {
        // update attempt
        await supabase
        .from("daily_challenge_log")
        .update({
            attempts: existingLog.attempts + 1,
            completed: correct,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("date", today);
    } else {
        // insert new record
        await supabase
        .from("daily_challenge_log")
        .insert({
            user_id: userId,
            challenge_id: currentTask.id,
            date: today,
            attempts: 1,
            completed: correct,
        });
    }

    // Step 4: Fetch expected output to show in result card
    setResultData({
        gainedExp,
        tips,
        expectedOutput: currentTask.expectedOutput || "",
    });
    setShowResultCard(true);

    if (correct) {
        congrats();
    }
    };


//   function useSound(src) {
//     const soundRef = useRef(new Audio(src));

//     const play = () => {
//       const sound = soundRef.current;
//       sound.volume = 0.3
//       sound.currentTime = 0; // rewind so it can play repeatedly
//       sound.play().catch(() => {});
//     };


//     return play;
//   }
  

//   const congrats = useSound("/sfx/congrats.mp3");


  const handleBack = () => {
    const confirmLeave = window.confirm("Are you sure? Progress will be lost.");
    if (confirmLeave) {
      navigate("/dashboard");
    }
  };


  return (
    <>
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {showIntro ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            background: "#11111171",
            color: "#fff",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <button className="backBtn" onClick={() => navigate('/dashboard')}>Back</button>

          <h1 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>
            {currentTask.title}
          </h1>
          <pre style={{width: "800px", marginBottom: "25px", lineHeight:"1.5rem", textAlign:"left" }}>
            {currentTask.description}
          </pre>
          <button
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: "none",
              background: "#22c55e",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => setShowIntro(false)}
          >
            Okay!
          </button>
          <p className='danger'>Daily Challenge can ONLY by done ONCE!</p>
        </div>
      ) : (
        <div className="codingPage">
        <header className="codingHeader">
            <div className="codingHeaderTop">
            <button className="backButton" onClick={handleBack}>← Back</button>
            <div className='taskText'>
                <div className="taskTitleWithHelp">
                <h2>{currentTask.title}</h2>
                <button
                    className="helpIcon"
                    onClick={() => setShowTaskBody(true)}
                    title="Remind me what to do"
                >
                    ?
                </button>
                </div>
            </div>
            </div>

            <div className="codingButtons">

            <button 
                className='toolsBtn' 
                onClick={() => {
                    if (!showTools && usedHint === false) {
                        setShowReminder(true);
                    } 

                    else if (!showTools && usedHint === true)  {
                        setShowReminder(false);
                        setShowTools(true)
                    }
                    
                    else {
                        setShowReminder(false);
                        setShowTools(false);
                    }
                }}
            >
                {showTools ? 'Hide Tools' : 'Show Tools'}
            </button>
            <button className='runBtn' onClick={handleRun}>Run</button>
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
            {activeTab === "html" && <HtmlCodeEditor key="html" code={htmlCode} setCode={setHtmlCode} />}
            {activeTab === "css" && <CssCodeEditor key="css" code={cssCode} setCode={setCssCode} />}
            {activeTab === "js" && <JsCodeEditor key="js" code={jsCode} setCode={setJsCode} />}
            </div>

            {showTools && (
            <div className="resizableTools">
                <div className="resizer" onMouseDown={startResizing}></div>
                <div className="toolsPane" style={{ width: toolsWidth }}>
                <h3>Tools for this Project:</h3>

                {currentTask.html_tools && (
                    <div className="toolSection" id='htmlTools'>
                    <h4>HTML</h4>
                    <pre>{currentTask.html_tools}</pre>
                    </div>
                )}
                {currentTask.css_tools && (
                    <div className="toolSection" id='cssTools'>
                    <h4>CSS</h4>
                    <pre>{currentTask.css_tools}</pre>
                    </div>
                )}
                {currentTask.js_tools && (
                    <div className="toolSection" id='jsTools'>
                    <h4>JavaScript</h4>
                    <pre>{currentTask.js_tools}</pre>
                    </div>
                )}
                </div>
            </div>
            )}
        </div>
        {showReminder && (
            <div className='hintReminder'>
                <p style={{ color: "orange", fontSize: "14px", marginTop: "8px" }}>
                    ⚠ Your EXP will be halved when using hints. Are you Sure?
                </p>
                <button id='yesBtn' onClick={() => {setShowTools(!showTools); setUsedHint(true); setShowReminder(false)}}>yes..</button>
                <button id='maybeNotBtn' onClick={() => {setShowReminder(false)}}>MAYBE NOT!</button>
            </div>
        )}

        {showResultCard && (
            <div className={`resultCard ${resultData.gainedExp > 0 ? "positive" : "negative"}`}>
            <h2>{resultData.gainedExp >= 0 ? "✅ Task Shipped!" : "⚠️ Task Shipped with Mistakes"}</h2>
            <p>
                <strong>{resultData.gainedExp >= 0 ? "EXP Gained:" : "EXP Lost:"}</strong>
                {resultData.gainedExp >= 0 ? ` ${resultData.gainedExp}` : ` ${Math.abs(resultData.gainedExp)}`}
            </p>

            {resultData.expectedOutput && (
                <>
                <h3>Suggested Answer</h3>
                <pre className="expectedOutput">{resultData.expectedOutput}</pre>
                </>
            )}
            <p>See You Tomorrow!</p>
            <button onClick={() => {navigate('/dashboard')}}>
                {resultData.gainedExp >= 0 ? "Continue" : "Continue"}
            </button>
            </div>
        )}
        {showTaskBody && (
            <div className="taskBodyOverlay" onClick={() => setShowTaskBody(false)}>
            <div className="taskBodyContent" onClick={e => e.stopPropagation()}>
                <h3>Task Reminder</h3>
                <div className="taskBodyText">
                <pre>{currentTask.description}</pre>
                </div>
                <button onClick={() => setShowTaskBody(false)}>Close</button>
            </div>
            </div>
        )}
        </div>
      )}
    </div>
    </>
  );
};

export default DailyChallengePage;