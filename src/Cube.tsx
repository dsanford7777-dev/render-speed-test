import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame } from "remotion";
export const Cube: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <ThreeCanvas width={1080} height={1920} style={{ background: "#222" }}>
      <ambientLight intensity={1} />
      <mesh rotation={[f / 20, f / 30, 0]}><boxGeometry args={[2, 2, 2]} /><meshBasicMaterial color="red" /></mesh>
    </ThreeCanvas>
  );
};
