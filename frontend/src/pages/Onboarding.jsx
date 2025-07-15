import { useState, useContext } from "react";
import { AuthContext } from "../components/AuthContext";
import supabase from "../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

const presetAvatars = [
  "/avatar1.png",
  "/avatar2.png",
  "/avatar3.png",
  "/avatar4.png",
];

export default function OnboardingPage() {
  const { user } = useContext(AuthContext);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [customAvatarFile, setCustomAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleAvatarSelect = (url) => {
    setSelectedAvatar(url);
    setCustomAvatarFile(null); // reset custom if selecting preset
  };

  const handleCustomUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const filePath = `avatars/${user.id}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setSelectedAvatar(publicUrl);
      setCustomAvatarFile(file);
    }
  };

  const handleSave = async () => {
    if (!selectedAvatar) return;

    setSaving(true);
    const { error } = await supabase
      .from("user_state")
      .update({ avatar_url: selectedAvatar, exp: 100 }) // give gift too!
      .eq("user_id", user.id);

    setSaving(false);
    if (!error) {
      navigate("/dashboard");
    } else {
      console.error("Failed to update avatar:", error.message);
    }
  };

  return (
    <div className="welcome-card">
      <h1>Welcome, {user?.user_metadata?.display_name}!</h1>
      <p>You're officially in. Choose your avatar and claim your first reward:</p>

      <div className="gift-box">🎁 +100 XP Boost!</div>

      <h3>Pick Your Avatar</h3>
      <div className="avatar-grid">
        {presetAvatars.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Avatar ${idx + 1}`}
            className={`avatar-img ${selectedAvatar === url ? "selected" : ""}`}
            onClick={() => handleAvatarSelect(url)}
          />
        ))}
      </div>

      <div className="upload-section">
        <label htmlFor="custom-avatar">or upload your own:</label>
        <input type="file" accept="image/*" onChange={handleCustomUpload} />
      </div>

      <button
        className="save-btn"
        onClick={handleSave}
        disabled={saving || !selectedAvatar}
      >
        {saving ? "Saving..." : "Let's Begin!"}
      </button>
    </div>
  );
}
