import './ScrollOverlay.css'
import { useState } from "react";

export default function ScrollOverlay({ project, onClose, onAccept, projectImg }) {
  const [scanActive, setScanActive] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const handleBuildClick = () => {
    setScanActive(true);

    setTimeout(() => {
        setScanComplete(true); // Show message after scan
    }, 1600); // Match scanbeam duration

    setTimeout(() => {
        onAccept(); // Trigger navigation (e.g. to inbox)
    }, 3000); // 1.4s later gives enough time for popup
  };


  return (
    <>
    <div className="scroll-overlay" onClick={onClose}>
      <div className="scroll-container" onClick={(e) => e.stopPropagation()}>
        {scanComplete && (
            <div className="scan-popup">
                <p>Scan Completed! Heading To Base...</p>
            </div>
        )}

        <div className="scrollItems">
          <img src={projectImg} alt="scroll" className="scroll-bg" />
          <h2>{project.name}</h2>
          <p>{project.description}</p>
          <p className="scroll-note">Originally dreamt by {project.idealist}.</p>
          <p className="difficulty-tag">
            Difficulty: <span className={`difficulty ${project.difficulty?.toLowerCase()}`}>{project.difficulty}</span>
          </p>
          <button className="build-btn" onClick={handleBuildClick}>
            Let’s Build!
          </button>
        </div>

        <div className={`scanbeam ${scanActive ? "active" : ""}`} />


      </div>
    </div>
    </>
  );
}
