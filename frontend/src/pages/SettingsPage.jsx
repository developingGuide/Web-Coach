// src/pages/SettingsPage.jsx
import { useAudio } from "../components/AudioContext";
import "./SettingsPage.css"; // 👈 import CSS file;
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { musicVolume, setMusicVolume, sfxVolume, setSfxVolume } = useAudio();

	const navigate = useNavigate()

  return (
    <div className="settings-container">
			<button className="inboxBackBtn" onClick={()=> {navigate('/dashboard')}}>Back</button>
      <h2 className="settings-title">Settings</h2>

      <div className="settings-section">
        <label className="settings-label">
          Music Volume
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="settings-slider"
          />
        </label>
      </div>

      <div className="settings-section">
        <label className="settings-label">
          SFX Volume
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sfxVolume}
            onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
            className="settings-slider"
          />
        </label>
      </div>
    </div>
  );
}
