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
    { key: "sold", kind: "stamp", text: "SOLD", f0: m.sold, f1: A(2), y: 14, rot: -9, bg: "#e0332e", fg: "#ffffff", size: 190 },
    { key: "lustig", kind: "pill", text: "VICTOR LUSTIG", sub: "con man", f0: m.victor, f1: m.paris - 4, y: 15 },
    { key: "cost", kind: "call", text: "TOO EXPENSIVE!", f0: m.afford, f1: m.standing - 2, y: 20, fg: "#ffd84d", size: 104 },
    { key: "tons", kind: "call", text: "7,000 TONS", f0: m.thousand, f1: m.tell - 2, y: 19, fg: "#ffd84d", size: 132 },
    { key: "secret", kind: "stamp", text: "TOP SECRET", f0: m.no, f1: A(8), y: 20, rot: 7, bg: "#e0332e", fg: "#ffffff", size: 120 },
    { key: "poisson", kind: "pill", text: "ANDRÉ POISSON", sub: "scrap dealer", f0: m.andre, f1: A(9), y: 15 },
    { key: "bribe", kind: "call", text: "BRIBE?", f0: m.bribe, f1: A(10), y: 18, fg: "#ffd84d", size: 170 },
    { key: "real", kind: "stamp", text: "CORRUPT = REAL", f0: m.corrupt, f1: A(11), y: 17, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 92 },
    { key: "vienna", kind: "pill", text: "VIENNA", f0: A(13) + 6, f1: m.nothing - 2, y: 13 },
    { key: "capone", kind: "pill", text: "AL CAPONE", sub: "Chicago", f0: m.capone - 2, f1: m.handed - 2, y: 15 },
    { key: "fifty", kind: "call", text: "$50,000", f0: m.fifty, f1: m.got - 2, y: 10, fg: "#7fe08f", size: 170 },
    { key: "reward", kind: "call", text: "REWARD!", f0: m.reward + 5, f1: m.honesty - 3, y: 18, fg: "#ffd84d", size: 150 },
  ].filter((i) => i.f1 > i.f0 && i.f0 < LOOP_F() && i.f0 >= 0 && i.f1 <= B(19)) as Item[];
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
          <div key={i.key} style={{ ...base, fontSize: i.size ?? 130, lineHeight: 1, color: i.fg ?? "#ffffff", WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", textShadow: `0 10px 0 rgba(18,12,22,0.55)`, letterSpacing: 2 }}>{i.text}</div>
        );
      })}
    </AbsoluteFill>
  );
};
