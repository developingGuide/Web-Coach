// ThreadList.jsx
import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";
import "./ThreadList.css";

export default function ThreadList({ onSelectThread }) {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchThreads = async () => {
      const { data, error } = await supabase
        .from("threads")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setThreads(data);
    };

    fetchThreads();
  }, []);

  return (
    <div className="thread-list">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className="thread-card"
          onClick={() => onSelectThread(thread)}
        >
          <div className="thread-header">
            <img
              src={`/avatars/${thread.avatar_url || "default"}.png`}
              alt="avatar"
              className="user-avatar"
            />
            <div className="meta">
              <div className="username">{thread.username || "Anonymous"}</div>
              <div className="timestamp">1h • Discussion</div>
            </div>
          </div>

          <h3 className="thread-title">{thread.name}</h3>
          <p className="thread-desc">{thread.description}</p>

          <div className="thread-footer">
            <div className="stats">
              <span>💬 12</span>
              <span>❤️ 23</span>
            </div>
            <div className="avatars">
              {/* Replace with real avatars */}
              <img src="/avatars/dev1.png" alt="dev" />
              <img src="/avatars/dev2.png" alt="dev" />
              <img src="/avatars/dev3.png" alt="dev" />
            </div>
            <div className="new-comment">New comment 10m ago</div>
          </div>
        </div>
      ))}
    </div>
  );
}
