import "./Dashboard.css"
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* <aside className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li>To-Do</li>
          <li>Tracker</li>
          <li>Messages</li>
        </ul>
      </aside> */}
      
      <Sidebar/>

      <main className="mainScreen">
        <h1>Welcome Back, Developer 👋</h1>
        <p>Here's what you’re working on today:</p>

        <section className="tasks">
          <div className="task-card">Build landing page for client</div>
          <div className="task-card">Fix navbar bug</div>
          <div className="task-card">Update pricing section</div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
