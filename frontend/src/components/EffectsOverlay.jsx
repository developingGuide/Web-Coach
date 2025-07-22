import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSnowPreset } from "@tsparticles/preset-snow";
import { loadFirePreset } from "@tsparticles/preset-fire";
import { loadLinksPreset } from "@tsparticles/preset-links";

const EffectsOverlay = ({ currentMap }) => {
  const particlesInit = useCallback(async (engine) => {
    await loadSnowPreset(engine);
    await loadFirePreset(engine);
    await loadLinksPreset(engine); // optional, for cool node-style effects
  }, []);

  let preset = null;

  if (currentMap === "BeachIsland") {
    preset = "snow";
  } else if (currentMap === "InfernoInterface") {
    preset = "fire";
  } else if (currentMap === "NebulaZone") {
    preset = "links"; // optional spacey effect
  }

  if (!preset) return null;

  return (
    <Particles
      init={particlesInit}
      options={{ preset }}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 1000,
        pointerEvents: "none", // so users can still click buttons
      }}
    />
  );
};

export default EffectsOverlay;