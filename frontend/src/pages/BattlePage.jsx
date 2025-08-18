import './BattlePage.css';
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HtmlCodeEditor from '../components/HtmlCodeEditor';
import CssCodeEditor from '../components/CssCodeEditor';
import JsCodeEditor from '../components/JsCodeEditor';
import supabase from '../../config/supabaseClient';
import { AuthContext } from '../components/AuthContext';

function generatePreviewHTML(html, css, js) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>${css}</style>
    </head>
    <body>
      ${html}
      <script>${js}<\/script>
    </body>
    </html>
  `;


}
const BattlePage = () => {
  const navigate = useNavigate()
  const { match_id } = useParams();
  const [channel, setChannel] = useState(null);
  const [opponentHtml, setOpponentHtml] = useState("");
  const [opponentCss, setOpponentCss] = useState("");
  const [opponentJs, setOpponentJs] = useState("");
  const [timeLeft, setTimeLeft] = useState(35); // 5 minutes in seconds, 300
  const [matchOver, setMatchOver] = useState(false);
  const [opponentRageQuit, setOpponentRageQuit] = useState(false);
  const [battleInfo, setBattleInfo] = useState({ title: "", description: "" });
  const [battleResult, setBattleResult] = useState(null); // "win", "lose", "tie"
  const [count, setCount] = useState(10); // starting from 10


  const [activeTab, setActiveTab] = useState("html");
  const [htmlCode, setHtmlCode] = useState("<h1>Start</h1>");
  const [cssCode, setCssCode] = useState("h1 { color: green; }");
  const [jsCode, setJsCode] = useState("");

  const [showObjective, setShowObjective] = useState(true);
  const [matchStarted, setMatchStarted] = useState(false);
  const [showMatchStart, setShowMatchStart] = useState(false);

  const {user} = useContext(AuthContext)
  const user_id = user?.id; // safe fallback
  
  const compiledCode = generatePreviewHTML(htmlCode, cssCode, jsCode);
  const opponentCompiledCode = generatePreviewHTML(opponentHtml, opponentCss, opponentJs);

  function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function htmlScore(userHtml, expectedHtml) {
    const parser = new DOMParser();
    const userDoc = parser.parseFromString(userHtml, 'text/html');
    const expectedDoc = parser.parseFromString(expectedHtml, 'text/html');

    const userTags = Array.from(userDoc.body.querySelectorAll('*')).map(t => t.tagName.toLowerCase());
    const expectedTags = Array.from(expectedDoc.body.querySelectorAll('*')).map(t => t.tagName.toLowerCase());

    const total = expectedTags.length;
    const matched = expectedTags.filter(tag => userTags.includes(tag)).length;

    return total ? matched / total : 1; // fraction between 0 and 1
  }

  function cssScore(userCss, expectedCss) {
    const selectorRegex = /([^{]+)\s*\{/g;
    const requiredSelectors = [];
    let match;
    while ((match = selectorRegex.exec(expectedCss)) !== null) {
      requiredSelectors.push(match[1].trim());
    }

    const matched = requiredSelectors.filter(sel => {
      const regex = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      return regex.test(userCss);
    });

    return requiredSelectors.length ? matched.length / requiredSelectors.length : 1;
  }

  function jsScore(userJs, expectedJs) {
    const requiredSnippets = expectedJs
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'));

    const matched = requiredSnippets.filter(snippet => {
      const regex = new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return regex.test(userJs);
    });

    return requiredSnippets.length ? matched.length / requiredSnippets.length : 1;
  }



  function gradeSubmission(submission, challengeData) {
    const { html_check, css_check, js_check } = challengeData;

    let score = 0;
    let totalSections = 0;

    if (html_check) {
      score += htmlScore(submission.html, html_check);
      totalSections++;
    }

    if (css_check) {
      score += cssScore(submission.css, css_check);
      totalSections++;
    }

    if (js_check) {
      score += jsScore(submission.js, js_check);
      totalSections++;
    }

    return totalSections ? score / totalSections : 0; // normalized 0-1
  }

  // Grade all submissions
  const gradeAndCompare = (subs, challengeData) => {
    return subs.map(sub => ({
      user_id: sub.user_id,
      score: gradeSubmission(sub, challengeData)
    }));
  };


  const handleRageQuit = () => {
    if (!channel) return;

    channel.send({
      type: "broadcast",
      event: "rage-quit",
      payload: {
        sender_id: user_id,
      },
    });

    setMatchOver(true); // end the match immediately for this user
    navigate('/challenges')
  };


  useEffect(() => {
    const fetchBattleInfo = async () => {
      // Get match to find challenge_id
      const { data: matchData, error: matchErr } = await supabase
        .from('matches')
        .select('battle_id')
        .eq('id', match_id)
        .single();

      if (matchErr || !matchData) {
        console.error("Match fetch error:", matchErr?.message);
        return;
      }

      // Use challenge_id to get title & description
      const { data: battleData, error: battleErr } = await supabase
        .from('battles')
        .select('title, description, starting_html, starting_css, starting_js')
        .eq('id', matchData.battle_id)
        .single();

      if (battleErr || !battleData) {
        console.error("Battle fetch error:", battleErr?.message);
        return;
      }

      setBattleInfo({
        title: battleData.title || "Untitled Battle",
        description: battleData.description || "",
      });

      // Set starting code (only if you haven't started coding yet)
      setHtmlCode(battleData.starting_html || "<!-- Start coding here -->");
      setCssCode(battleData.starting_css || "/* Start coding here */");
      setJsCode(battleData.starting_js || "// Start coding here");
    };

    fetchBattleInfo();
  }, [match_id]);




  useEffect(() => {
    if (!user) return;

    const chan = supabase.channel(`match-${match_id}`);

    chan
      .on("broadcast", { event: "code-update" }, (payload) => {
        const { html, css, js, sender_id } = payload.payload;
        if (sender_id !== user_id) {
          setOpponentHtml(html);
          setOpponentCss(css);
          setOpponentJs(js);
        }
      })
      .subscribe();

    setChannel(chan);

    chan
      .on("broadcast", { event: "rage-quit" }, (payload) => {
        const { sender_id } = payload.payload;
        if (sender_id !== user_id) {
          // alert("😱 Your opponent rage quit!");
          setOpponentRageQuit(true);
          setMatchOver(true);
        }
      })


    return () => {
      supabase.removeChannel(chan);
    };
  }, [match_id]);

  // Broadcast changes
  useEffect(() => {
    if (!channel) return;

    const payload = {
      sender_id: user_id,
      html: htmlCode,
      css: cssCode,
      js: jsCode,
    };

    channel.send({
      type: "broadcast",
      event: "code-update",
      payload,
    });
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    if (!channel) return;
    const timeout = setTimeout(() => {
      channel.send({
        type: "broadcast",
        event: "code-update",
        payload: {
          sender_id: user_id,
          html: htmlCode,
          css: cssCode,
          js: jsCode,
        },
      });
    }, 500); // 500ms after user stops typing

    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setMatchOver(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);


  useEffect(() => {
    const sendFinalCode = async () => {
      const { error } = await supabase.from('match_submissions').insert([
        {
          match_id,
          user_id,
          html: htmlCode,
          css: cssCode,
          js: jsCode,
        },
      ]);

      if (error) {
        console.error("Error submitting code:", error.message);
      } else {
        console.log("Code submitted!");
      }
    };

    if (matchOver) {
      sendFinalCode();
    }
  }, [matchOver]);

  useEffect(() => {
    const checkSubmissions = async () => {
      const MAX_RETRIES = 10;
      let retries = 0;
      let subs = [];

      // 1. Get match details (to find challenge_id)
      const { data: matchData, error: matchErr } = await supabase
        .from('matches') // or your match table
        .select('battle_id')
        .eq('id', match_id)
        .single();

      if (matchErr || !matchData) {
        console.error("Match fetch error:", matchErr?.message);
        return;
      }

      // 2. Get challenge test/check info
      const { data: challengeData, error: challengeErr } = await supabase
        .from('battles')
        .select('html_check, css_check, js_check, expected_output, title, description')
        .eq('id', matchData.battle_id)
        .single();

      if (challengeErr || !challengeData) {
        console.error("Challenge fetch error:", challengeErr?.message);
        return;
      }

      // 3. Get both players' submissions
      while (retries < MAX_RETRIES) {
        const { data, error } = await supabase
          .from('match_submissions')
          .select('*')
          .eq('match_id', match_id);

        if (error) {
          console.error("Submission fetch error:", error.message);
          return;
        }

        if (data.length === 2) {
          subs = data;
          break;
        }

        retries++;
        await new Promise((res) => setTimeout(res, 1000)); // wait 1 sec
      }

      if (subs.length !== 2) {
        console.error("Still missing a submission after retries");
        return;
      }

      // now you can compare both
      const scores = gradeAndCompare(subs, challengeData);

      const meScore = scores.find(s => s.user_id === user_id)?.score || 0;
      const opponentScore = scores.find(s => s.user_id !== user_id)?.score || 0;

      if (meScore > opponentScore) setBattleResult("win");
      else if (meScore < opponentScore) setBattleResult("lose");
      else setBattleResult("tie");
    };

    if (matchOver) {
      checkSubmissions();
    }
  }, [matchOver]);


  useEffect(() => {
    if (count <= 0) {
      return;
    }

    const timer = setTimeout(() => setCount(c => c - 1), 1000);

    return () => clearTimeout(timer);
  }, [count]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowObjective(false);
      setShowMatchStart(true);

      setTimeout(() => {
        setShowMatchStart(false);
        setMatchStarted(true); // now allow coding & start timer
      }, 1000);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);



  return (
    <>
    {showObjective && (
      <div className="objectiveOverlay">
        <div className="objectiveCard">
          <h2>Battle Objective</h2>
          <h3>{battleInfo.title}</h3>
          <p>{battleInfo.description}</p>
          <p className='matchStartText'>Match will start in {count} seconds...</p>
        </div>
      </div>
    )}

    {showMatchStart && (
      <div className="matchStartPopup">
        <h1>🔥 Match Start! 🔥</h1>
      </div>
    )}


    <div className="battleContainer">
      <div className="battleHeader">
        <h1>{battleInfo.title}</h1>
        <p>{battleInfo.description}</p>
      </div>
      <div className="outputRow">
        <div className="outputBox">
          <h3>You</h3>
          <iframe className="codePreview" srcDoc={compiledCode} />
        </div>
        <div className="outputBox">
          <h3>Opponent</h3>
          <iframe className="codePreview" srcDoc={opponentCompiledCode} />
        </div>
      </div>

      <div className="tabButtons">
        <button className={activeTab === "html" ? "active" : ""} onClick={() => setActiveTab("html")}>HTML</button>
        <button className={activeTab === "css" ? "active" : ""} onClick={() => setActiveTab("css")}>CSS</button>
        <button className={activeTab === "js" ? "active" : ""} onClick={() => setActiveTab("js")}>JavaScript</button>
      </div>

      <div className="editorWrapper">
        {activeTab === "html" && <HtmlCodeEditor code={htmlCode} setCode={setHtmlCode} matchOver={matchOver || !matchStarted} />}
        {activeTab === "css" && <CssCodeEditor code={cssCode} setCode={setCssCode} matchOver={matchOver || !matchStarted} />}
        {activeTab === "js" && <JsCodeEditor code={jsCode} setCode={setJsCode} matchOver={matchOver || !matchStarted} />}
      </div>

      <div className="matchTimer">
        {matchOver ? "Time's up!" : `Time Left: ${formatTime(timeLeft)}`}
      </div>

      {!matchOver && channel && (
        <button className="rageQuitButton" onClick={handleRageQuit}>
          Rage Quit 💥
        </button>
      )}


      {matchOver && (
        <div className="checkingStatus">
          ⏳ Checking submissions...
        </div>
      )}

      {battleResult && (
        <div className="battleResultCard">
          <h2>
            {battleResult === "win" && "🏆 You Won!"}
            {battleResult === "lose" && "😞 You Lost.."}
            {battleResult === "tie" && "🤝 It's a Tie!"}
          </h2>
          <button onClick={() => navigate('/challenges')}>Back to Challenges</button>
        </div>
      )}



      {opponentRageQuit && (
        <div className="rageQuitPopup">
          <h2>Your opponent has rage quit 💥</h2>
          <p>You survived. Nice.</p>
          <button onClick={() => navigate('/challenges')}>Back to Challenges</button>
        </div>
      )}

    </div>
    </>
  );
}

export default BattlePage