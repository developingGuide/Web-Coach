// ThreadMessages.jsx
import { useEffect, useRef, useState } from "react";
import supabase from "../../config/supabaseClient";

export default function ThreadMessages({ thread, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("threads_messages")
        .select("*")
        .eq("thread_id", thread.id)
        .order("created_at", { ascending: true });

      if (!error) setMessages(data || []);
    };

    fetchMessages();
  }, [thread]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    const { data, error } = await supabase.from("threads_messages").insert([
      {
        thread_id: thread.id,
        content: newMsg,
        user_id: user?.id || null, // Optional if you want to associate the message
      },
    ]);

    if (!error) {
      setNewMsg("");
      setMessages((prev) => [
        ...prev,
        { content: newMsg, user_id: user?.id || null },
      ]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>{thread.name}</h3>
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className="message">
              {msg.content}
            </div>
          ))}
        </div>
        <div className="reply-box">
          <input
            type="text"
            value={newMsg}
            placeholder="Reply to thread..."
            onChange={(e) => setNewMsg(e.target.value)}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}
