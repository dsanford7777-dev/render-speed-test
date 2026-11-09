// Archive photos (US public domain: published before 1929), with a slow push and an "archive" tag.
// Only slots with a license-checked photo are listed; the rest of the photo slots were rebuilt as 3D or 2D shots.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ShotDef } from "./timeline";
import { C, T, ease } from "./kit";

type P = { file: string; tag: string; from: [number, number, number]; to: [number, number, number] };
/** [scale, x%, y%] focus at the start and end of the shot */
export const PHOTOS: Record<string, P> = {
  // Commons: "Boston 1919 molasses disaster - el train structure.jpg" (PD-1923)
  "el-girders": { file: "molasseslong/photos/el-girders.jpg", tag: "Commercial Street · January 1919", from: [1.02, 50, 50], to: [1.14, 55, 45] },
  // Commons: "BostonMolassesDisaster.jpg", Boston Globe, 15 Jan 1919 (PD; BPL "no known restrictions")
  "cleanup-crews": { file: "molasseslong/photos/site-panorama.jpg", tag: "The tank site · January 1919", from: [1.1, 40, 50], to: [1.02, 55, 50] },
};

export const Photo: React.FC<{ shot: ShotDef; t: number }> = ({ shot, t }) => {
  const p = PHOTOS[shot.g], u = ease(t / Math.max(1, shot.b - shot.a));
  const s = p.from[0] + (p.to[0] - p.from[0]) * u, x = p.from[1] + (p.to[1] - p.from[1]) * u, y = p.from[2] + (p.to[2] - p.from[2]) * u;
  return (
    <AbsoluteFill style={{ background: "#1c1712", overflow: "hidden" }}>
      <Img src={staticFile(p.file)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% ${y}%`,
        transform: `scale(${s})`, transformOrigin: `${x}% ${y}%`, filter: "sepia(0.35) contrast(1.08) brightness(0.95)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <div style={{ position: "absolute", right: 60, top: 56, background: "#f2e6c9", border: `5px solid ${C.ink}`, borderRadius: 10, padding: "6px 20px" }}>
        <T size={30}>{p.tag}</T>
      </div>
    </AbsoluteFill>
  );
};
