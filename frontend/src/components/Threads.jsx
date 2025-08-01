import { useState, useEffect, useRef, useContext } from "react";
import supabase from "../../config/supabaseClient";
import ThreadCard from "./ThreadCard";
import "./Threads.css";
import { AuthContext } from "./AuthContext";
import ReactMarkdown from "react-markdown";

export default function Threads() {
  const {user} = useContext(AuthContext)
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/noobie.png");
  const [displayName, setDisplayName] = useState('')
  const messagesEndRef = useRef(null);
  const textareaRef = useRef();
  const descRef = useRef(null);


  // Fetch threads
  useEffect(() => {
    const fetchThreads = async () => {
      const { data, error } = await supabase
        .from("threads")
        .select("*, user_state:created_by(display_name, avatar_url)")
        .order("created_at", { ascending: false });
      if (!error) setThreads(data);
      else{
        console.error(error)
      }
    };
    fetchThreads();
  }, []);

  // Fetch messages when thread selected
  useEffect(() => {
    if (!selectedThread) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("threads_messages")
        .select("*, user_state:user_id(display_name, avatar_url)")
        .eq("thread_id", selectedThread.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error)
      }
      setMessages(data || []);
    };
    fetchMessages();
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    const { data, error } = await supabase
      .from("user_state")
      .select("avatar_url, display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setAvatarUrl(data.avatar_url || "/noobie.png");
      setDisplayName(data.display_name || "");
    }
  };

  // Create thread
  const handleCreateThread = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("threads").insert([
      {
        title,
        description: desc,
        created_by: user?.id,
        created_at: new Date().toISOString(),
      },
    ]);
    setLoading(false);
    if (!error) {
      setTitle("");
      setDesc("");
      setShowCreator(false);
      const { data } = await supabase
        .from("threads")
        .select("*, user_state:created_by(display_name, avatar_url)")
        .order("created_at", { ascending: false });
      setThreads(data);
    } else {
      console.error(error)
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMsg.trim()) return;
    const { error } = await supabase.from("threads_messages").insert([
      { thread_id: selectedThread.id, content: newMsg, user_id: user.id },
    ]);
    if (!error) {
      setMessages((prev) => [...prev, { content: newMsg }]);
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

  const insertCodeBlockThread = (lang) => {
    const block = `\`\`\`${lang}\n\n\`\`\``;
    setDesc((prev) => prev + (prev ? "\n" : "") + block);

    // Refocus textarea and move cursor inside code block
    setTimeout(() => {
      const textarea = document.querySelector(".new-thread-text");
      if (textarea) {
        textarea.focus();
        const cursorPos = textarea.value.indexOf("\n\n") + 1;
        textarea.selectionStart = textarea.selectionEnd = cursorPos;
      }
    }, 0);
  };


  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  };

  const handleDescChange = (e) => {
    setDesc(e.target.value);
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  };


  return (
    <div className="community-container">
      {/* Thread List */}
      <div className="thread-list">
        {threads.map((t) => (
          <ThreadCard key={t.id} thread={t} onClick={setSelectedThread} />
        ))}
      </div>

      <button className="new-thread-button" onClick={() => setShowCreator(true)}>
        + New Thread
      </button>

      {/* Popup: Create Thread */}
      {showCreator && (
        <div className="modal-overlay" onClick={() => setShowCreator(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Thread</h3>
            <input
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="new-thread-boxes"
            />
            <textarea
              placeholder="Description..."
              value={desc}
              onChange={handleDescChange}
              className="new-thread-text new-thread-boxes"
            />

            <div className="code-helper">
              <select onChange={(e) => insertCodeBlockThread(e.target.value)} defaultValue="">
                <option value="" disabled>Pasting code?</option>
                <option value="js">JavaScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>


            <div className="form-actions">
              <button onClick={handleCreateThread} disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </button>
              <button onClick={() => setShowCreator(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup: Thread Messages */}
      {selectedThread && (
        <div className="modal-overlay" onClick={() => setSelectedThread(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedThread(null)}>×</button>
            {/* User info header */}
            <div className="popup-header">
              <img
                src={selectedThread.user_state?.avatar_url || "/noobie.png"}
                alt="avatar"
                className="popup-avatar"
              />
              <div className="popup-meta">
                <div className="popup-username">{selectedThread.user_state?.display_name || "Anonymous"}</div>
                <div className="popup-timestamp">
                  {new Date(selectedThread.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <h3 className="popup-title">{selectedThread.title}</h3>
            <p className="popup-desc">{selectedThread.description}</p>

            <div className="messages">
              {messages.map((m, i) => (
                <div key={i} className="message-row">
                  <img
                    src={m.user_state?.avatar_url || "/noobie.png"}
                    alt="avatar"
                    className="message-avatar"
                  />
                  <div className="message-bubble">
                    <div className="message-username">{m.user_state?.display_name || "Anonymous"}</div>
                    <ReactMarkdown
                      children={m.content}
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
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="reply-box">
              <textarea
                ref={textareaRef}
                value={newMsg}
                placeholder="Reply..."
                onChange={handleInputChange}
                className="reply-textarea"
              />
              <div className="code-helper">
                <select onChange={(e) => insertCodeBlock(e.target.value)} defaultValue="">
                  <option value="" disabled>Pasting code?</option>
                  <option value="js">JavaScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
              </div>
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
