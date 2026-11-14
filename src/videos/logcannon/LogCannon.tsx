// "How One Log Made 100 Soldiers Surrender" (Paradox Town #8): Rugeley's Mill, 1780. Kit 2 look: one persistent 3D
// canvas posed per frame (View3D), name tags and stamps, the view through a gap in the barn wall, captions on top.
// Narration audio is muxed in later (public/logcannon/voice.mp3).
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { View3D, useKit } from "./View3D";
import { shotAt, slitAt, ITEMS } from "./story";
import { TOTAL } from "./timeline";
import { Captions } from "./Captions";

export const LOGCANNON_FRAMES = TOTAL;
const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });
const INK = "#120c16";

const Overlays: React.FC = () => {
  const f = useCurrentFrame();
  const all = useMemo(ITEMS, []);
  return (
    <AbsoluteFill>
      {all.filter((i) => f >= i.f0 && f < i.f1).map((i) => {
        const d = f - i.f0, u = Math.min(1, d / 4);
        // stamps slam down from oversize; pills and callouts pop up with a little overshoot
        const sc = i.kind === "stamp" ? 2.3 - 1.3 * u + (d >= 4 && d < 8 ? 0.06 * Math.sin((d - 4) * 1.6) : 0) : 0.3 + 0.7 * u + 0.14 * Math.sin(Math.min(1, d / 9) * Math.PI);
        const base: React.CSSProperties = {
          position: "absolute", left: "50%", top: `${i.y}%`, transform: `translate(-50%, -50%) rotate(${i.rot ?? 0}deg) scale(${sc})`,
          fontFamily, fontWeight: 900, textAlign: "center", whiteSpace: "nowrap", opacity: i.kind === "stamp" ? Math.min(1, 0.4 + 0.6 * u) : 1,
        };
        if (i.kind === "stamp") return (
          <div key={i.key} style={{ ...base, fontSize: i.size ?? 160, lineHeight: 1, color: i.fg, background: i.bg, padding: "18px 46px 22px", border: `14px solid ${INK}`, borderRadius: 26, letterSpacing: 4, boxShadow: `0 12px 0 rgba(18,12,22,0.55)` }}>{i.text}</div>
        );
        if (i.kind === "pill") return (
          <div key={i.key} style={{ ...base, background: "#ffffff", border: `10px solid ${INK}`, borderRadius: 60, padding: "14px 44px 16px", boxShadow: `0 10px 0 rgba(18,12,22,0.55)` }}>
            <div style={{ fontSize: i.size ?? 66, lineHeight: 1.05, color: INK, letterSpacing: 1 }}>{i.text}</div>
            {i.sub ? <div style={{ fontSize: 40, lineHeight: 1.1, color: "#e0332e", textTransform: "uppercase", letterSpacing: 3 }}>{i.sub}</div> : null}
          </div>
        );
        return (
          <div key={i.key} style={{ ...base, fontSize: i.size ?? 130, lineHeight: 1, color: i.fg ?? "#ffffff", WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", textShadow: `0 10px 0 rgba(18,12,22,0.55)`, letterSpacing: 2 }}>{i.text}</div>
        );
      })}
    </AbsoluteFill>
  );
};

/** looking out through a gap between two logs: everything but the gap is the dark inside of the wall */
const Slit: React.FC = () => {
  const f = useCurrentFrame(), sl = slitAt(f);
  if (!sl) return null;
  const H = 1920, top = (sl.y - sl.h / 2) * H, h = sl.h * H;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 60, right: 60, top, height: h, borderRadius: 34, boxShadow: "0 0 0 3000px #120b08, inset 0 0 0 10px #2c1b10, inset 0 0 60px 20px rgba(18,11,8,0.75)" }} />
      {[top - 150, top - 420, top + h + 150, top + h + 520, top + h + 900].map((y, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 14, background: "#070403", opacity: 0.9 }} />)}
    </AbsoluteFill>
  );
};

export const LogCannon: React.FC = () => {
  const f = useCurrentFrame(), kit = useKit();
  const voice = (getInputProps() as { voice?: boolean }).voice;
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <View3D kit={kit} shot={shotAt(f)} f={f} visible />
      <Slit />
      <Overlays />
      <Captions />
      {voice ? <Audio src={staticFile("logcannon/voice.mp3")} /> : null}
    </AbsoluteFill>
  );
};
