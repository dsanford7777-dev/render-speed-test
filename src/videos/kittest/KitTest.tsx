// Kit 2 look test: 17 seconds, six shots, one per new capability. Vertical (Shorts) and wide (long-form) from the same shots.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { View3D, useKit } from "./View3D";
import { shotAt, LABELS, TOTAL } from "./story";
import { FONT } from "../pigwarlong/kit";

export const KIT_FRAMES = TOTAL;
const Test: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const f = useCurrentFrame(), kit = useKit();
  if (!kit) return null;
  const s = shotAt(f), t = f - s.a, pop = Math.min(1, 0.6 + t * 0.1);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <View3D kit={kit} shot={s} f={f} visible w={w} h={h} />
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.8, textAlign: "center", transform: `scale(${pop})` }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: h > w ? 92 : 80, color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill" }}>{LABELS[s.id - 1]}</span>
      </div>
    </AbsoluteFill>
  );
};
export const KitTest: React.FC = () => <Test w={1080} h={1920} />;
export const KitTestWide: React.FC = () => <Test w={1920} h={1080} />;
