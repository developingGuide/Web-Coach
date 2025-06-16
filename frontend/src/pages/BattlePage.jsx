import './BattlePage.css';
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
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
  const { match_id } = useParams();
  const [channel, setChannel] = useState(null);
  const [opponentHtml, setOpponentHtml] = useState("");
  const [opponentCss, setOpponentCss] = useState("");
  const [opponentJs, setOpponentJs] = useState("");
  const [timeLeft, setTimeLeft] = useState(10); // 5 minutes in seconds
  const [matchOver, setMatchOver] = useState(false);

  const [activeTab, setActiveTab] = useState("html");
  const [htmlCode, setHtmlCode] = useState("<h1>Start</h1>");
  const [cssCode, setCssCode] = useState("h1 { color: green; }");
  const [jsCode, setJsCode] = useState("");

  const {user} = useContext(AuthContext)
  const user_id = user?.id; // safe fallback
  
  const compiledCode = generatePreviewHTML(htmlCode, cssCode, jsCode);
  const opponentCompiledCode = generatePreviewHTML(opponentHtml, opponentCss, opponentJs);

  function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

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



  return (
    <div className="battleContainer">
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
        {activeTab === "html" && <HtmlCodeEditor code={htmlCode} setCode={setHtmlCode} matchOver={matchOver} />}
        {activeTab === "css" && <CssCodeEditor code={cssCode} setCode={setCssCode} matchOver={matchOver} />}
        {activeTab === "js" && <JsCodeEditor code={jsCode} setCode={setJsCode} matchOver={matchOver} />}
      </div>

      <div className="matchTimer">
        {matchOver ? "Time's up!" : `Time Left: ${formatTime(timeLeft)}`}
      </div>

      {matchOver && (
        <div className="checkingStatus">
          ⏳ Checking submissions...
        </div>
      )}
    </div>
  );
}

export default BattlePage