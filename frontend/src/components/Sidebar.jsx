import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h2 onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>Dashboard</h2>
      <ul>
        <li>To-Do</li>
        <li>Tracker</li>
        <li onClick={() => navigate("/inbox")} style={{ cursor: "pointer" }}>
          Messages
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
