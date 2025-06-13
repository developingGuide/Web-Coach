import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Challenge.css';

const challenges = [
  { id: 'c1', type: '1v1', title: 'Speed CSS Battle', difficulty: 'Medium' },
  { id: 'c2', type: '2v2', title: 'Team Flexbox Showdown', difficulty: 'Hard' },
  { id: 'c3', type: 'Minigame', title: 'DOM Ninja', difficulty: 'Easy' },
  { id: 'c4', type: 'Monthly Championship', title: 'June Arena', difficulty: 'Expert' }
];

export default function ChallengeMap() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleEnter = () => {
    if (selected) navigate(`/queue?challenge_id=${selected.id}`);
  };

  const [isCoverVisible, setIsCoverVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCoverVisible(false);
    }, 1000); // 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
    {isCoverVisible && <div className="cloud-cover-opening"></div>}

    <button className="backBtn" onClick={() => {navigate('/dashboard')}}>Back</button>
    <div className="challenge-container">
      <div className={`grid ${selected ? 'compressed' : ''}`}>
        {challenges.map(ch => (
          <div 
            key={ch.id} 
            className={`challenge-box ${selected?.id === ch.id ? 'active' : ''}`} 
            onClick={() => setSelected(ch)}>
            
            <img src="https://placehold.co/600x1000" alt="challenge" />

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

    </>
  );
} 