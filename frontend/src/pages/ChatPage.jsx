import { useRef, useEffect, useState, useContext } from "react";
import supabase from "../../config/supabaseClient";
import "./ChatPage.css"
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Threads from "../components/Threads";
import { AuthContext } from "../components/AuthContext";

const ChatPage = () => {
  const {user} = useContext(AuthContext)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef();
  const [currentChannel, setCurrentChannel] = useState("general");
  const channels = ["general", "help", "feedback", "threads"];
  const [showIframe, setShowIframe] = useState(false);
  const [userPlan, setUserPlan] = useState('');
  const [glitch, setGlitch] = useState(true);

  const navigate = useNavigate()

  function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }


  const fetchMessages = async () => {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel", currentChannel)
        .order("created_at", { ascending: true })
        .limit(100);

    if (!error) setMessages(data);
  };


  const sendMessage = async () => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: userState, error: userError } = await supabase
        .from("user_state")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
        
        if (userError || !userState) {
            console.error("Failed to fetch display name");
            return;
        }
        
        if (newMsg.trim() !== "") {
            await supabase.from("messages").insert({
                user_id: user.id,
                display_name: userState.display_name,
                avatar_url: userState.avatar_url || "/noobie.png",
                message: newMsg.trim(),
                channel: currentChannel
              });
            setNewMsg("");
        }
  };

  const CodeBlock = ({ language, value }) => {
    const iframeRef = useRef();
    const [output, setOutput] = useState("");
    const [showIframe, setShowIframe] = useState(false);
    const [src, setSrc] = useState(""); // ← ensures iframe updates fully
    
    const runCode = () => {
      setShowIframe(true);
      let html = "";

      if (language === "js") {
        html = `
        <script>
        const log = (...args) => parent.postMessage({ type: 'code-output', output: args.join(' ') }, '*');
        console.log = log;
        try {
          ${value}
          } catch (e) {
            log("⚠️ " + e.message);
            }
            <\/script>
            `;
            setOutput(""); // reset output
          } else if (language === "html") {
            html = value;
          } else if (language === "css") {
            html = `<style>\${value}</style><div>CSS applied. Try styling this text!</div>`;
      } else {
        setOutput("⚠️ Unsupported language");
        setShowIframe(false);
        return;
      }
      
      const blob = new Blob([html], { type: "text/html" });
      setSrc(URL.createObjectURL(blob)); // ← trigger iframe to reload
    };
    
    useEffect(() => {
      const handleMsg = (e) => {
        if (e.data.type === "code-output") {
          setOutput(e.data.output);
        }
      };
      window.addEventListener("message", handleMsg);
      return () => window.removeEventListener("message", handleMsg);
    }, []);
    
    return (
      <div className="chat-code-block">
        <pre><code>{value}</code></pre>
        <button onClick={runCode}>Run</button>

        {language === "js" && output && (
          <div className="code-output">👉 {output}</div>
        )}

        {showIframe && (
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts"
            src={src}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              height: "150px",
              border: "1px solid #333",
              borderRadius: "6px",
              background: "#fff"
            }}
            title="code-preview"
          />
        )}
      </div>
    );
  };


  const insertCodeBlock = (lang) => {
    const block = `\`\`\`${lang}\n\n\`\`\``;
    setNewMsg((prev) => prev + (prev ? "\n" : "") + block);

    // Refocus textarea and move cursor inside code block
    setTimeout(() => {
      const textarea = document.querySelector(".chat-textarea");
      if (textarea) {
        textarea.focus();
        const cursorPos = textarea.value.indexOf("\n\n") + 1;
        textarea.selectionStart = textarea.selectionEnd = cursorPos;
      }
    }, 0);
  };

  const fetchUserPlan = async () => {
    const { data, error } = await supabase
      .from('user_state')
      .select('plan')
      .eq('user_id', user.id)
      .single();
        
    if (!error && data) {
      setUserPlan(data.plan);
    } else{
      console.error(error)
    }
    
    
    return data?.plan || 'starter';
  };

  useEffect(() => {
    const timer = setTimeout(() => setGlitch(false), 600); // Remove after animation
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserPlan();
    }
  }, [user]);

    
  useEffect(() => {
      fetchMessages();

      const subscription = supabase
          .channel(`public:messages:${currentChannel}`) // unique name per channel
          .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel=eq.${currentChannel}`,
          }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
          })
          .subscribe();

      return () => supabase.removeChannel(subscription);
  }, [currentChannel]);

  
  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
      const textarea = document.querySelector(".chat-textarea");
      if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
      }
  }, [newMsg]);



  return (
    <div className={`chat-container ${glitch ? "glitch-in" : ""}`}>
      {userPlan === 'starter' && (
        <div className="locked-overlay">
          <button className="backBtn" onClick={() => navigate('/dashboard')}>Back</button>
          <div className="locked-message">
            🔒 This feature is for Pro users only
          </div>
        </div>
      )}
      <button className="backBtn" onClick={() => navigate('/dashboard')}>Back</button>

      <div className="chat-header">
        {currentChannel === "threads" ? "🧵 Threads" : "🌍 Global Chat"}
      </div>

      <div className="chat-tabs">
        {channels.map((ch) => (
          <button
            key={ch}
            onClick={() => setCurrentChannel(ch)}
            className={currentChannel === ch ? "active-tab" : ""}
          >
            #{ch}
          </button>
        ))}
      </div>

      {/* Render threads or chat based on channel */}
      {currentChannel === "threads" ? (
        <Threads/>
      ) : (
        <>
          <div className="chat-feed">
            {messages.map((msg) => (
              <div key={msg.id} className="chat-message">
                <img src={msg.avatar_url || "/noobie.png"} alt="avatar" className="chat-avatar" />
                <div>
                  <div>
                    <span className="chat-username">{msg.display_name}:</span>
                    <ReactMarkdown
                      children={msg.message}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const language = className?.replace("language-", "") || "js";
                          const code = String(children).trim();
                          if (inline) return <code {...props}>{children}</code>;
                          return <CodeBlock language={language} value={code} />;
                        },
                      }}
                    />
                  </div>
                  <div className="chat-timestamp">{formatTime(msg.created_at)}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          <div className="chat-input-row">
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="chat-textarea"
            />
            <div className="code-helper">
              <select
                onChange={(e) => insertCodeBlock(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Pasting code?</option>
                <option value="js">JavaScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage