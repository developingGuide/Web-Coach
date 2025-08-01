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
  const [timeLeft, setTimeLeft] = useState(1800); // 5 minutes in seconds, 300
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

  function htmlStructuresMatch(userHtml, expectedHtml) {
    const parser = new DOMParser();

    const userDoc = parser.parseFromString(userHtml, 'text/html');
    const expectedDoc = parser.parseFromString(expectedHtml, 'text/html');

    const clean = (html) => html.replace(/[\s\n]+/g, '').toLowerCase();

    return clean(userDoc.body.innerHTML).includes(clean(expectedDoc.body.innerHTML));
  }

  function cssMatches(userCss, expectedCss) {
    return userCss.replace(/\s+/g, '').toLowerCase()
      .includes(expectedCss.replace(/\s+/g, '').toLowerCase());
  }



  const gradeAndCompare = (subs, challengeData) => {
    const { html_check, css_check, js_check, expected_output } = challengeData;

    const grade = (submission) => {
      let score = 0;
      console.log("▶️ Grading submission for:", submission.user_id);

      try {
        if (html_check) {
          const htmlPass = htmlStructuresMatch(submission.html, html_check);
          console.log("HTML Check:", htmlPass);
          if (htmlPass) score++;
        }

        if (css_check) {
          const cssPass = cssMatches(submission.css, css_check);
          console.log("CSS Check:", cssPass);
          if (cssPass) score++;
        }

        if (js_check) {
          const jsPass = submission.js.includes(js_check);
          console.log("JS Check:", jsPass);
          if (jsPass) score++;
        }

        console.log("🧪 Comparing HTML:");
        console.log("Submission:", submission.html);
        console.log("Expected:", html_check);

        console.log("🧪 Comparing CSS:");
        console.log("Submission:", submission.css);
        console.log("Expected:", css_check);

      } catch (e) {
        console.error("❌ Error grading submission:", e);
      }

      console.log("✅ Final score:", score);
      return score;
    };


    const results = subs.map(sub => ({
      user_id: sub.user_id,
      score: grade(sub)
    }));

    // pick winner
    const [userA, userB] = results;
    if (userA.score > userB.score) {
      setBattleResult(userA.user_id === user_id ? "win" : "lose");
    } else if (userB.score > userA.score) {
      setBattleResult(userB.user_id === user_id ? "win" : "lose");
    } else {
      setBattleResult("tie");
    }
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
        .select('challenge_id')
        .eq('id', match_id)
        .single();

      if (matchErr || !matchData) {
        console.error("Match fetch error:", matchErr?.message);
        return;
      }

      // Use challenge_id to get title & description
      const { data: battleData, error: battleErr } = await supabase
        .from('battles')
        .select('title, description')
        .eq('challenge_id', matchData.challenge_id)
        .single();

      if (battleErr || !battleData) {
        console.error("Battle fetch error:", battleErr?.message);
        return;
      }

      setBattleInfo({
        title: battleData.title || "Untitled Battle",
        description: battleData.description || "",
      });
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
        .select('challenge_id')
        .eq('id', match_id)
        .single();

      if (matchErr || !matchData) {
        console.error("Match fetch error:", matchErr?.message);
        return;
      }

      const challengeId = matchData.challenge_id;

      // 2. Get challenge test/check info
      const { data: challengeData, error: challengeErr } = await supabase
        .from('battles')
        .select('html_check, css_check, js_check, expected_output, title, description')
        .eq('challenge_id', challengeId)
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
      gradeAndCompare(subs, challengeData);
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