import { useContext, useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";
import { AuthContext } from "./AuthContext";

export default function ThreadCard({ thread, onClick }) {
  const {user} = useContext(AuthContext)
  const [avatarUrl, setAvatarUrl] = useState('/noobie.png')
  const [displayName, setDisplayName] = useState('Test')
  const [likeCount, setLikeCount] = useState(thread.likes || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchThreadUserInfo();
    fetchCommentCount();
  }, []);

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


  const fetchCommentCount = async () => {
    const { count } = await supabase
      .from("threads_messages")
      .select("*", { count: "exact", head: true })
      .eq("thread_id", thread.id);

    setCommentCount(count || 0);
  };


  const handleLike = async (e) => {
    e.stopPropagation(); // prevent opening thread
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));

    const { error } = await supabase
      .from("threads")
      .update({ likes: likeCount + (newLiked ? 1 : -1) })
      .eq("id", thread.id);

    if (error) console.error(error);
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
          <span className="commentBtn"><i class="fa-solid fa-comment"></i> {commentCount}</span>
          <span
            style={{ cursor: "pointer", color: liked ? "red" : "inherit" }}
            onClick={handleLike}
            className="likeBtn"
          >
            <i class="fa-solid fa-heart"></i> {likeCount}
          </span>
        </div>
      </div>
    </div>
  );
}
