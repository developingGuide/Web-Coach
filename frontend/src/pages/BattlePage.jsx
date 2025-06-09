import './BattlePage.css';
import { useState } from 'react';
import HtmlCodeEditor from '../components/HtmlCodeEditor';
import CssCodeEditor from '../components/CssCodeEditor';
import JsCodeEditor from '../components/JsCodeEditor';

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
  const [activeTab, setActiveTab] = useState("html");
  const [htmlCode, setHtmlCode] = useState("<h1>Hello</h1>");
  const [cssCode, setCssCode] = useState("h1 { color: green; }");
  const [jsCode, setJsCode] = useState("console.log('Hello');");

  const opponentHtml = "<h1>Opponent</h1>";
  const opponentCss = "h1 { color: red; }";
  const opponentJs = "console.log('Opponent');";

  const compiledCode = generatePreviewHTML(htmlCode, cssCode, jsCode);
  const opponentCompiledCode = generatePreviewHTML(opponentHtml, opponentCss, opponentJs);

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