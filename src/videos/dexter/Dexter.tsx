// "The Man Whose Worst Ideas Made Him Rich" (Paradox Town Short #21): Timothy Dexter, Newburyport, 1790s. One persistent 3D
// canvas posed per frame (View3D), name tags and stamps, captions on top. Narration is muxed in later (public/centralia/voice.mp3).
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { View3D, useKit } from "./View3D";
import { shotAt, ITEMS } from "./story";
import { TOTAL } from "./timeline";
import { Captions } from "./Captions";
import { SubscribeTag } from "../shared/SubscribeTag";

export const DEXTER_FRAMES = TOTAL;
const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });
const INK = "#120c16";

const Overlays: React.FC = () => {
  const f = useCurrentFrame();
  const all = useMemo(ITEMS, []);
  return (
    <AbsoluteFill>
      {all.filter((i) => f >= i.f0 && f < i.f1).map((i) => {
        const d = f - i.f0, u = Math.min(1, d / 4), n = i.text.length;
        // fit every label inside the 1080 px width (stamps carry a border and padding, calls a thick outline)
        const fit = i.kind === "stamp" ? Math.min(i.size ?? 160, 820 / (n * 0.7)) : i.kind === "pill" ? Math.min(i.size ?? 66, 840 / (n * 0.68)) : Math.min(i.size ?? 130, 960 / (n * 0.7));
        const sc = i.kind === "stamp" ? 2.3 - 1.3 * u + (d >= 4 && d < 8 ? 0.06 * Math.sin((d - 4) * 1.6) : 0) : 0.3 + 0.7 * u + 0.14 * Math.sin(Math.min(1, d / 9) * Math.PI);
        const base: React.CSSProperties = {
          position: "absolute", left: "50%", top: `${i.y}%`, transform: `translate(-50%, -50%) rotate(${i.rot ?? 0}deg) scale(${sc})`,
          fontFamily, fontWeight: 900, textAlign: "center", whiteSpace: "nowrap", opacity: i.kind === "stamp" ? Math.min(1, 0.4 + 0.6 * u) : 1,
        };
        if (i.kind === "stamp") return (
          <div key={i.key} style={{ ...base, fontSize: fit, lineHeight: 1, color: i.fg, background: i.bg, padding: "18px 46px 22px", border: `14px solid ${INK}`, borderRadius: 26, letterSpacing: 4, boxShadow: `0 12px 0 rgba(18,12,22,0.55)` }}>{i.text}</div>
        );
        if (i.kind === "pill") return (
          <div key={i.key} style={{ ...base, background: "#ffffff", border: `10px solid ${INK}`, borderRadius: 60, padding: "14px 44px 16px", boxShadow: `0 10px 0 rgba(18,12,22,0.55)` }}>
            <div style={{ fontSize: fit, lineHeight: 1.05, color: INK, letterSpacing: 1 }}>{i.text}</div>
            {i.sub ? <div style={{ fontSize: 40, lineHeight: 1.1, color: "#e0332e", textTransform: "uppercase", letterSpacing: 3 }}>{i.sub}</div> : null}
          </div>
        );
        return (
          <div key={i.key} style={{ ...base, fontSize: fit, lineHeight: 1, color: i.fg ?? "#ffffff", WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", textShadow: `0 10px 0 rgba(18,12,22,0.55)`, letterSpacing: 2 }}>{i.text}</div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Dexter: React.FC = () => {
  const f = useCurrentFrame(), kit = useKit();
  const voice = (getInputProps() as { voice?: boolean }).voice;
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#1a1416" }}>
      <View3D kit={kit} shot={shotAt(f)} f={f} visible />
      <Overlays />
      <Captions />
      <SubscribeTag total={TOTAL} />
      {voice ? <Audio src={staticFile("dexter/voice.mp3")} /> : null}
    </AbsoluteFill>
  );
};
