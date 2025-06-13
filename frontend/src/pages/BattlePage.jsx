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

  const [activeTab, setActiveTab] = useState("html");
  const [htmlCode, setHtmlCode] = useState("<h1>Start</h1>");
  const [cssCode, setCssCode] = useState("h1 { color: green; }");
  const [jsCode, setJsCode] = useState("");

  const {user} = useContext(AuthContext)
  const user_id = user?.id; // safe fallback

  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    if (user) {
      setUserReady(true);
    }
  }, [user]);

  // Place this return AFTER all hooks
  if (!userReady) {
    return <div>Loading...</div>;
  }
  // if (!user) {
  //   return <div>Loading...</div>; // or show a spinner, or redirect to login
  // }
  // const user_id = user.id


  const compiledCode = generatePreviewHTML(htmlCode, cssCode, jsCode);
  const opponentCompiledCode = generatePreviewHTML(opponentHtml, opponentCss, opponentJs);

  useEffect(() => {
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
        {activeTab === "html" && <HtmlCodeEditor code={htmlCode} setCode={setHtmlCode} />}
        {activeTab === "css" && <CssCodeEditor code={cssCode} setCode={setCssCode} />}
        {activeTab === "js" && <JsCodeEditor code={jsCode} setCode={setJsCode} />}
      </div>
    </div>
  );
}

export default BattlePage