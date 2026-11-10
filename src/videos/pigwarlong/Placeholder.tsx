// Draft stand-ins for shots that aren't built yet: 3D scenes (build step 3) and archive photos (step 4).
// Each moves (slow push) so the draft's pacing reads like the final cut; the label says what will be there.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, T, ease, lerp } from "./kit";
import { ShotDef } from "./timeline";

export const Placeholder: React.FC<{ shot: ShotDef; t: number }> = ({ shot, t }) => {
  const d = shot.b - shot.a, u = ease(t / Math.max(1, d)), photo = shot.k === "photo";
  const bg = photo
    ? "radial-gradient(ellipse at 50% 45%, #b89a72 0%, #7a5f42 70%, #3e2f22 100%)"
    : "radial-gradient(ellipse at 50% 40%, #4a5a70 0%, #263040 75%, #151a24 100%)";
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(1.0, 1.12, u)}) translateX(${lerp(-20, 20, u)}px)` }}>
        <svg width={1920} height={1080} style={{ position: "absolute", opacity: photo ? 0.25 : 0.18 }}>
          {photo
            ? Array.from({ length: 40 }, (_, i) => <path key={i} d={`M0 ${i * 28} L1920 ${i * 28 + 60}`} stroke="#2a1d12" strokeWidth={2} />)
            : Array.from({ length: 25 }, (_, i) => <g key={i}><path d={`M${i * 80} 0 L${i * 80} 1080`} stroke="#9fc3d9" strokeWidth={1.5} /><path d={`M0 ${i * 45} L1920 ${i * 45}`} stroke="#9fc3d9" strokeWidth={1.5} /></g>)}
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 180, background: photo ? "#f2e6c9" : C.yellow, border: `5px solid ${C.ink}`, borderRadius: 10, padding: "8px 22px" }}>
        <T size={36}>{photo ? "Archive photo" : "3D shot"} · #{shot.id}</T>
      </div>
      <div style={{ position: "absolute", left: 120, top: 260, width: 1680 }}>
        <T size={60} col="#f6efdc" up={false} style={{ whiteSpace: "normal", textShadow: "0 4px 0 rgba(0,0,0,0.5)" }}>{shot.n ?? shot.g}</T>
      </div>
    </AbsoluteFill>
  );
};
