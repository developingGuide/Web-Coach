import { useState } from "react";
import supabase from "../../config/supabaseClient";

export default function ThreadCreator({ onThreadCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateThread = async () => {
    if (!title.trim()) return;

    setLoading(true);

    const { data, error } = await supabase.from("threads").insert([
      {
        title: title,
        description: desc,
        created_at: new Date().toISOString(),
        // optionally: created_by: user.id
      },
    ]);

    setLoading(false);
    setShowForm(false);
    setTitle("");
    setDesc("");

    if (error) {
      console.error("Error creating thread:", error);
    } else {
      onThreadCreated?.(); // refresh thread list
    }
  };

  return (
    <div className="thread-creator">
      <button onClick={() => setShowForm(true)} className="new-thread-button">
        + New Thread
      </button>

      {showForm && (
        <div className="thread-form">
          <input
            type="text"
            placeholder="Thread title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Optional description..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="form-actions">
            <button onClick={handleCreateThread} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
