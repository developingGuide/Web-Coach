import { useState } from "react";
import ThreadCreator from "./ThreadCreator";
import ThreadList from "./ThreadList";
import ThreadMessages from "./ThreadMessages";

export default function Threads() {
  const [selectedThread, setSelectedThread] = useState(null);

  return (
    <div className="community-container">
      <div className="left-panel">
        <ThreadCreator onThreadCreated={() => setSelectedThread(null)} />
        <ThreadList onSelectThread={setSelectedThread} />
      </div>

      <div className="right-panel">
        {selectedThread ? (
          <ThreadMessages thread={selectedThread} onClose={() => setSelectedThread(null)} />
        ) : (
          <p>Select a thread to view messages</p>
        )}
      </div>
    </div>
  );
}