// components/LoadingOverlay.js
import "./LoadingOverlay.css";

const LoadingOverlay = ({ message }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <p>{message || "Loading..."}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
