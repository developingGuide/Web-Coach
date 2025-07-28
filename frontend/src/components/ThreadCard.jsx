import { useContext, useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";
import { AuthContext } from "./AuthContext";

export default function ThreadCard({ thread, onClick }) {
  const {user} = useContext(AuthContext)
  const [avatarUrl, setAvatarUrl] = useState('/noobie.png')
  const [displayName, setDisplayName] = useState('Test')

  useEffect(() => {
    if (user) {
      fetchThreadUserInfo();
    }
  }, [user]);

  const fetchThreadUserInfo = async () => {
    const { data, error } = await supabase
      .from("user_state")
      .select("avatar_url, display_name")
      .eq("user_id", thread.created_by)
      .maybeSingle();

    if (data) {
      setAvatarUrl(data.avatar_url || "/noobie.png");
      setDisplayName(data.display_name || "");
    }
  };

  
  
  return (
    <div className="thread-card" onClick={() => onClick(thread)}>
      <div className="thread-header">
        <img
          src={avatarUrl}
          alt="avatar"
          className="user-avatar"
        />
        <div className="meta">
          <div className="username">{displayName || "Anonymous"}</div>
          <div className="timestamp">1h • Discussion</div>
        </div>
      </div>

      <h3 className="thread-title">{thread.title}</h3>
      <p className="thread-desc">{thread.description}</p>

      <div className="thread-footer">
        <div className="stats">
          <span>💬 12</span>
          <span>❤️ 23</span>
        </div>
        <div className="new-comment">New comment 10m ago</div>
      </div>
    </div>
  );
}
