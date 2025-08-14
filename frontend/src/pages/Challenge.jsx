import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../components/AuthContext";
import supabase from '../../config/supabaseClient';
import './Challenge.css';

const challenges = [
  { id: 'c1', type: '1v1', title: 'Speed CSS Battle', difficulty: 'Medium', img: "/1v1.png" },
  { id: 'c2', type: '2v2', title: 'Team Flexbox Showdown', difficulty: 'Hard' },
  { id: 'c3', type: 'Minigame', title: 'DOM Ninja', difficulty: 'Easy' },
  { id: 'c4', type: 'Monthly Championship', title: 'June Arena', difficulty: 'Expert' }
];

export default function ChallengeMap() {
  const {user} = useContext(AuthContext)
  const [selected, setSelected] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [userPlan, setUserPlan] = useState('');
  const navigate = useNavigate();

  const handleEnter = () => {
    if (selected) navigate(`/queue?challenge_id=${selected.id}`);
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/dashboard', { state: { transition: 'slide' } });
    }, 800);
  };

  const location = useLocation();
  const transition = location.state?.transition;

  const fetchUserPlan = async () => {
    const { data, error } = await supabase
      .from('user_state')
      .select('plan')
      .eq('user_id', user.id)
      .single();
        
    if (!error && data) {
      setUserPlan(data.plan);
    } else{
      console.error(error)
    }
    
    
    return data?.plan || 'starter';
  };


  function useSound(src) {
    const soundRef = useRef(new Audio(src));

    const play = () => {
      const sound = soundRef.current;
      sound.currentTime = 0; // rewind so it can play repeatedly
      sound.play().catch(() => {});
    };


    return play;
  }
    
  
  const playClick = useSound("/sfx/backBtn.mp3");


  useEffect(() => {
    if (user) {
      fetchUserPlan();
    }
  }, [user]);

  return (
    <>
    <div className={`page-slide ${transition === 'slide-left' ? 'inbox-page-slide-in' : ''} ${isExiting ? 'exit-to-left-active' : ''}`}>
      {userPlan === 'starter' && (
        <div className="locked-overlay">
          <button className="backBtn" onClick={() => {playClick(); handleBack()}}>Back</button>
          <div className="locked-message">
            🔒 This feature is for Pro users only
          </div>
        </div>
      )}
      <button className="backBtn" onClick={handleBack}>Back</button>
      <div className="challenge-container">
        <div className={`grid ${selected ? 'compressed' : ''}`}>
          {challenges.map(ch => (
            <div 
              key={ch.id} 
              className={`challenge-box ${selected?.id === ch.id ? 'active' : ''}`} 
              onClick={() => setSelected(ch)}>
              
              <img src={ch.img} alt="challenge" />

              <div className="challengeDesc">
                <h3>{ch.title}</h3>
                <p>{ch.type}</p>
              </div>
            </div>
          ))}
        </div>
        {selected && (
          <div className="challenge-preview-panel">
            <button className="close" onClick={() => setSelected(null)}>X</button>
            <h2>{selected.title}</h2>
            <p>Type: {selected.type}</p>
            <p>Difficulty: {selected.difficulty}</p>
            <button className="enter-btn" onClick={handleEnter}>Enter!</button>
          </div>
        )}
      </div>
    </div>

    </>
  );
} 