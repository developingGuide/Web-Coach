import { useEffect, useState, useContext } from "react";
import supabase from "../../config/supabaseClient";
import { AuthContext } from "../components/AuthContext";
import "./Leaderboard.css";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const { user } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("user_state")
        .select("user_id, display_name, exp, level, avatar_url")
        .order("exp", { ascending: false }) // sort by exp
        .limit(20); // top 20

      if (error) console.error(error);
      else setPlayers(data || []);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard">
      <button className="inboxBackBtn" onClick={()=> {navigate('/dashboard')}}>Back</button>
      <h1>🏆 Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Level</th>
            <th>EXP</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr
              key={p.user_id}
              className={p.user_id === user?.id ? "highlight-row" : ""}
            >
              <td>{i + 1}</td>
              <td>
                <img src={p.avatar_url || "/noobie.png"} className="avatar" />
                {p.display_name || "Anonymous"}
              </td>
              <td>{p.level}</td>
              <td>{p.exp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
