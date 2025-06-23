import { useRef, useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";
import "./ChatPage.css"

const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef();
  const [currentChannel, setCurrentChannel] = useState("general");
  const channels = ["general", "help", "feedback"];

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

        console.log("avatar_url from user_state:", userState.avatar_url);
        
        if (newMsg.trim() !== "") {
            await supabase.from("messages").insert({
                user_id: user.id,
                display_name: userState.display_name,
                // avatar_url: userState.avatar_url || "noobie", (idk this man)
                message: newMsg.trim(),
                channel: currentChannel
            });
            setNewMsg("");
        }
  };
    
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


  return (
    <div className="chat-container">
      <div className="chat-header">🌍 Global Chat</div>
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
      <div className="chat-feed">
        {messages.map(msg => (
          <div key={msg.id} className="chat-message">
            <img src={`/${msg.avatar_url  || "noobie"}.png`} alt="avatar" className="chat-avatar" />
            <div>
                <div>
                <span className="chat-username">{msg.display_name}:</span> {msg.message}
                </div>
                <div className="chat-timestamp">{formatTime(msg.created_at)}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatPage