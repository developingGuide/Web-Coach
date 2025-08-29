// src/contexts/AudioContext.js
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import supabase from "../../config/supabaseClient";

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [sfxVolume, setSfxVolume] = useState(0.5);

  const musicRef = useRef(null); // background music
  const sfxRefs = useRef([]);    // list of active sfx

  // Register the background music <audio>
  const registerMusic = (ref) => {
    musicRef.current = ref;
    if (ref) ref.volume = musicVolume;
  };

  // Load saved volumes when user logs in
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("user_state")
        .select("music_volume, sfx_volume")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setMusicVolume(data.music_volume ?? 0.2);
        setSfxVolume(data.sfx_volume ?? 0.5);
      } else if (error) {
        console.error(error)
      }
    };

    loadSettings();
  }, [user]);

  // 🔥 Whenever musicVolume changes, update audio element
  useEffect(() => {
    if (!user) return;
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }

    const updateDb = async () => {
      const { error } = await supabase
        .from("user_state")
        .update({ music_volume: musicVolume })
        .eq("user_id", user.id);

      if (error) {
        console.error(error)
      }
    };
    updateDb();
  }, [musicVolume]);

  // 🔥 Whenever sfxVolume changes, update all currently playing SFX
  useEffect(() => {
    if (!user) return;

    sfxRefs.current.forEach((sfx) => {
      sfx.volume = sfxVolume;
    });

    const updateDb = async () => {
      const { error } = await supabase
        .from("user_state")
        .update({ sfx_volume: sfxVolume })
        .eq("user_id", user.id);
      if (error) {
        console.error(error)
      }
    };
    updateDb();
  }, [sfxVolume]);

  // Play SFX helper
  const playSfx = (src) => {
    const audio = new Audio(src);
    audio.volume = sfxVolume;
    audio.play().catch(() => {});
    sfxRefs.current.push(audio);

    // Remove from list when finished
    audio.onended = () => {
      sfxRefs.current = sfxRefs.current.filter((a) => a !== audio);
    };
  };

  return (
    <AudioContext.Provider
      value={{
        musicVolume,
        setMusicVolume,
        sfxVolume,
        setSfxVolume,
        registerMusic,
        playSfx,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
