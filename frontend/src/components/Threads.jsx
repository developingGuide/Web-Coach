import { useState, useEffect, useRef, useContext } from "react";
import supabase from "../../config/supabaseClient";
import ThreadCard from "./ThreadCard";
import "./Threads.css";
import { AuthContext } from "./AuthContext";

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
            />
            <textarea
              placeholder="Description..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
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
                    <div className="message-text">{m.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="reply-box">
              <input
                value={newMsg}
                placeholder="Reply..."
                onChange={(e) => setNewMsg(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
