// Subscribe nudge for Paradox Town Shorts (Daniel, Nov 16 2026): no voice line, so the loop survives.
// Over the last ~2.6 s a channel card floats up, a hand cursor taps the red SUBSCRIBE button, it flips to a grey
// "SUBSCRIBED" with a ringing bell, then the card floats away and is gone before the final frames,
// which still land on the hook's camera. Kit 2 look: Montserrat 900, ink outlines, hard drop shadow.
// Usage: <SubscribeTag total={TOTAL_FRAMES} /> as the last child of a Short's root AbsoluteFill.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["900", "700"], subsets: ["latin"] });
const INK = "#120c16";
const RED = "#e0332e";

type Props = {
  total: number;          // composition length in frames
  len?: number;           // how long the tag is on screen (frames), default 78 (2.6 s at 30 fps)
  tail?: number;          // frames left clear at the very end for the loop, default 8
  top?: number;           // vertical centre, % of height (captions sit at 61%), default 45
  line?: string;          // small line under the channel name
};

const Bell: React.FC<{ ring: number }> = ({ ring }) => (
  <svg width={64} height={64} viewBox="0 0 24 24" style={{ transform: `rotate(${ring}deg)`, transformOrigin: "50% 15%" }}>
    <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v.6A6.5 6.5 0 0 1 18.5 10.5v4.2l1.8 2.3H3.7l1.8-2.3v-4.2A6.5 6.5 0 0 1 10.5 4.1v-.6A1.5 1.5 0 0 1 12 2z" fill={INK} />
    <path d="M9.5 19h5a2.5 2.5 0 0 1-5 0z" fill={INK} />
  </svg>
);

const Hand: React.FC = () => (
  <svg width={150} height={170} viewBox="0 0 30 34">
    <path d="M10 2.5a2 2 0 0 1 4 0v10.2l.6-.1a2 2 0 0 1 2.3 1.6l.1.4.5-.1a2 2 0 0 1 2.3 1.6l.1.5.4-.1a2 2 0 0 1 2.4 1.6l1.1 6.2c.6 3.6-1.5 7.4-5.6 8.1l-3.2.5c-2.4.4-4.8-.5-6.2-2.5L3.6 22.7a2.1 2.1 0 0 1 3.1-2.8L10 22.8z"
      fill="#fff" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

export const SubscribeTag: React.FC<Props> = ({ total, len = 78, tail = 8, top = 45, line = "a new paradox every day" }) => {
  const f = useCurrentFrame();
  const start = total - tail - len;
  const d = f - start;
  if (d < 0 || d >= len) return null;

  // card: float up + settle (0-12), hold, float up + fade (len-12 .. len)
  const inU = interpolate(d, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
  const outU = interpolate(d, [len - 12, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const y = (1 - inU) * 220 - outU * 160 + Math.sin(d / 9) * 6;
  const op = Math.min(1, d / 5) * (1 - outU);
  const sc = 0.82 + 0.18 * inU;

  // cursor: glides in (8-24), presses at 28, lifts, slides away with the card
  const TAP = 28;
  const cx = interpolate(d, [8, 24], [300, -40], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const cyy = interpolate(d, [8, 24], [300, -6], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const press = d >= TAP - 2 && d < TAP + 3 ? 0.86 : 1;
  const handOp = interpolate(d, [8, 12, len - 22, len - 14], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subbed = d >= TAP;
  const btnPop = d >= TAP && d < TAP + 8 ? 1 + 0.12 * Math.sin(((d - TAP) / 8) * Math.PI) : press;
  const ring = subbed && d < TAP + 22 ? 22 * Math.sin((d - TAP) * 1.3) * (1 - (d - TAP) / 22) : 0;
  const ripple = d - TAP;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: "50%", top: `${top}%`, opacity: op, transform: `translate(-50%, -50%) translateY(${y}px) scale(${sc})` }}>
        <div style={{ width: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, background: "#fffaf0", border: `10px solid ${INK}`, borderRadius: 44, padding: "28px 34px 32px", boxShadow: `0 14px 0 rgba(18,12,22,0.55)`, fontFamily }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, alignSelf: "stretch" }}>
            <div style={{ width: 120, height: 120, flex: "0 0 120px", borderRadius: 60, background: "#2f6fd0", border: `8px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 52 }}>PT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontWeight: 900, fontSize: 64, color: INK, lineHeight: 1 }}>Paradox Town</div>
              <div style={{ fontWeight: 700, fontSize: 34, color: "#6b5d63", lineHeight: 1.1 }}>{line}</div>
            </div>
          </div>
          <div style={{ position: "relative", transform: `scale(${btnPop})` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: subbed ? "#d9d4cf" : RED, color: subbed ? INK : "#fff", border: `9px solid ${INK}`, borderRadius: 999, padding: subbed ? "16px 40px 16px 30px" : "18px 64px", fontWeight: 900, fontSize: 58, letterSpacing: 2, boxShadow: `0 8px 0 rgba(18,12,22,0.45)` }}>
              {subbed ? <Bell ring={ring} /> : null}
              {subbed ? "SUBSCRIBED" : "SUBSCRIBE"}
            </div>
            {ripple >= 0 && ripple < 14 ? (
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 60 + ripple * 30, height: 60 + ripple * 30, borderRadius: "50%", border: `8px solid ${RED}`, opacity: 1 - ripple / 14, transform: "translate(-50%, -50%)" }} />
            ) : null}
            <div style={{ position: "absolute", left: "50%", top: "50%", opacity: handOp, transform: `translate(${cx}px, ${cyy}px) scale(${press})`, transformOrigin: "33% 6%" }}>
              <Hand />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
