// Stamps, name tags and number callouts drawn over the picture (upper third, clear of the captions at 61 %).
// Each one slams or pops in on its word and leaves on the next cut.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { A, B, M, LOOP_F } from "./story";

const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin", "latin-ext"] });
const INK = "#120c16";
type Kind = "stamp" | "pill" | "call";
type Item = { key: string; kind: Kind; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };

const items = (): Item[] => {
  const m = M();
  return [
    { key: "sixty", kind: "call", text: "60 × A SECOND", f0: m.sixty, f1: m.los - 4, y: 12, fg: "#8fb8ff", size: 104 },
    { key: "la", kind: "pill", text: "LOS ANGELES", sub: "ran on 50", f0: m.los + 2, f1: m.fifty - 2, y: 14 },
    { key: "shrug", kind: "call", text: "SO WHAT?", f0: m.cared, f1: A(5), y: 16, fg: "#ffffff", size: 130 },
    { key: "hoover", kind: "pill", text: "HOOVER DAM", sub: "makes 60", f0: m.hoover, f1: m.dam60 - 3, y: 13 },
    { key: "switch", kind: "stamp", text: "SWITCHED", f0: m.switched + 2, f1: A(7), y: 16, rot: -6, bg: "#2f5fb5", fg: "#ffffff", size: 120 },
    { key: "fine1", kind: "stamp", text: "FINE", f0: m.toastMind + 9, f1: m.light - 2, y: 18, rot: 6, bg: "#2f9a57", fg: "#ffffff", size: 150 },
    { key: "fine2", kind: "stamp", text: "FINE", f0: m.bulbMind, f1: A(8), y: 18, rot: -6, bg: "#2f9a57", fg: "#ffffff", size: 150 },
    { key: "notfine", kind: "stamp", text: "NOT FINE", f0: m.minded, f1: A(9), y: 17, rot: 5, bg: "#e0332e", fg: "#ffffff", size: 130 },
    { key: "counts", kind: "call", text: "1 PULSE = 1 TICK", f0: m.counts, f1: A(10), y: 13, fg: "#ffd84d", size: 92 },
    { key: "drummer", kind: "pill", text: "THE CLOCK", sub: "follows the beat", f0: m.drummer, f1: m.following - 2, y: 13 },
    { key: "faster", kind: "call", text: "50 → 60", f0: m.speed, f1: m.theClock - 2, y: 14, fg: "#ffd84d", size: 150 },
    { key: "twelve", kind: "call", text: "+12 MIN / HOUR", f0: m.twelve, f1: A(12), y: 12, fg: "#ff6b5e", size: 104 },
    { key: "depot", kind: "pill", text: "CLOCK DEPOT", sub: "this way", f0: m.depots, f1: A(13), y: 13 },
    { key: "days", kind: "call", text: "HOME IN DAYS", f0: m.within, f1: A(14), y: 12, fg: "#7fe08f", size: 104 },
    { key: "socal", kind: "pill", text: "SOUTHERN CALIFORNIA", sub: "the rest of it", f0: m.rest, f1: A(15), y: 13 },
    { key: "n475", kind: "call", text: "475,000", sub: "clocks", f0: m.n475, f1: A(16), y: 11, fg: "#ffd84d", size: 170 },
    { key: "n58", kind: "call", text: "58,000", sub: "refrigerators", f0: m.n58, f1: A(17), y: 11, fg: "#ffd84d", size: 170 },
    { key: "n34", kind: "call", text: "$34 MILLION", f0: m.n34, f1: m.third - 2, y: 11, fg: "#7fe08f", size: 126 },
    { key: "third", kind: "stamp", text: "1/3 OF A YEAR", f0: m.third + 4, f1: m.made - 2, y: 16, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 104 },
    { key: "who", kind: "pill", text: "DECADES EARLIER", sub: "somebody chose", f0: m.decades, f1: m.someone - 2, y: 13 },
  ].filter((i) => i.f1 > i.f0 && i.f0 < LOOP_F() && i.f0 >= 0 && i.f1 <= B(18)) as Item[];
};

export const Overlays: React.FC = () => {
  const f = useCurrentFrame();
  const all = useMemo(items, []);
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
            <div style={{ fontSize: 66, lineHeight: 1.05, color: INK, letterSpacing: 1 }}>{i.text}</div>
            {i.sub ? <div style={{ fontSize: 40, lineHeight: 1.1, color: "#e0332e", textTransform: "uppercase", letterSpacing: 3 }}>{i.sub}</div> : null}
          </div>
        );
        return (
          <div key={i.key} style={{ ...base, fontSize: i.size ?? 130, lineHeight: 1, color: i.fg ?? "#ffffff", WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", textShadow: `0 10px 0 rgba(18,12,22,0.55)`, letterSpacing: 2 }}>{i.text}{i.sub ? <div style={{ fontSize: (i.size ?? 130) * 0.5, marginTop: 6, color: "#ffffff", textTransform: "uppercase" }}>{i.sub}</div> : null}</div>
        );
      })}
    </AbsoluteFill>
  );
};
