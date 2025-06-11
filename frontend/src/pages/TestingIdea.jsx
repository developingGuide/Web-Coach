import { useState, useEffect } from 'react';

const mapWidth = 600;
const mapHeight = 400;
const step = 20; // Movement step in pixels

const checkpoints = [
  { id: 1, x: 100, y: 100 },
  { id: 2, x: 400, y: 300 },
];

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export default function TestingIdea() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [nearCheckpoint, setNearCheckpoint] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        if (e.key === 'ArrowUp') newY = Math.max(0, prev.y - step);
        if (e.key === 'ArrowDown') newY = Math.min(mapHeight - step, prev.y + step);
        if (e.key === 'ArrowLeft') newX = Math.max(0, prev.x - step);
        if (e.key === 'ArrowRight') newX = Math.min(mapWidth - step, prev.x + step);
        return { x: newX, y: newY };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const nearby = checkpoints.find(
      (cp) => distance(cp, position) < step * 1.5 // proximity threshold
    );
    setNearCheckpoint(nearby || null);
  }, [position]);

  return (
    <div
      style={{
        width: mapWidth,
        height: mapHeight,
        border: '2px solid #333',
        margin: '20px auto',
        position: 'relative',
        background: '#eef',
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          backgroundColor: 'blue',
          position: 'absolute',
          left: position.x,
          top: position.y,
          borderRadius: '50%',
        }}
      />

      {checkpoints.map((cp) => (
        <div
          key={cp.id}
          style={{
            width: 20,
            height: 20,
            backgroundColor: 'green',
            position: 'absolute',
            left: cp.x,
            top: cp.y,
            borderRadius: '50%',
          }}
        />
      ))}

      {nearCheckpoint && (
        <div
          style={{
            position: 'absolute',
            left: nearCheckpoint.x + 25,
            top: nearCheckpoint.y - 10,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          <strong>Project Preview</strong>
          <p>This is project #{nearCheckpoint.id}</p>
        </div>
      )}
    </div>
  );
}
