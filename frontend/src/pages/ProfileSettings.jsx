import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import supabase from "../../config/supabaseClient";
import './ProfileSettings.css'

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/noobie.png");

  useEffect(() => {
    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    const { data, error } = await supabase
      .from("user_state")
      .select("avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) setAvatarUrl(data.avatar_url || "/noobie.png");
    setDisplayName(user.user_metadata.full_name || "");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload failed");
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setAvatarUrl(publicUrl.publicUrl);

    await supabase.from("user_state")
      .update({ avatar_url: publicUrl.publicUrl })
      .eq("user_id", user.id);
  };

  const handleNameChange = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName },
    });

    if (!error) alert("Display name updated!");
  };

  const handlePasswordChange = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) alert("Password updated!");
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("This will permanently delete your account. Proceed?");
    if (!confirm) return;

    await supabase.rpc("delete_user", { user_id: user.id });
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-settings-page">
      <h2>Profile Settings</h2>

      <div className="profile-block">
        <img src={avatarUrl} alt="Avatar" className="avatar" />
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>

      <div className="profile-block">
        <label>Display Name</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <button className="changeNameBtn" onClick={handleNameChange}>Update Name</button>
      </div>

      <div className="profile-block">
        <label>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button className="changePwBtn" onClick={handlePasswordChange}>Change Password</button>
      </div>

      <div className="profile-block danger-zone">
        <button onClick={handleDeleteAccount} className="danger">Unsubscribe / Delete Account</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate(-1)}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default ProfileSettings;
