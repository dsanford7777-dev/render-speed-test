// On-screen captions: 1-3 words at a time, bold white with a heavy black outline, the word being spoken in yellow,
// a small pop when a new group appears. Groups break on punctuation and never exceed 3 words / ~16 characters.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { FPS, words, Word } from "./timeline";

const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });

/** segments whose words are already on screen as a callout (475,000 clocks; 58,000 refrigerators) */
const NO_CAPTION = new Set([19, 20]);
type Group = { ws: Word[]; s: number; e: number };
const groupWords = (all: Word[]): Group[] => {
  const out: Group[] = [];
  let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ ws: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
  for (const w of all) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 16 || cur[0].seg !== w.seg)) flush();
    cur.push(w);
    if (/[.,?!:]$|\.\.\.$/.test(w.w)) flush();
  }
  flush();
  // each group stays up until the next one starts (no flicker in short gaps)
  for (let i = 0; i < out.length - 1; i++) if (out[i + 1].s - out[i].e < 0.6) out[i].e = out[i + 1].s;
  return out;
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  // the big number callouts say the same words: no caption under them
  const groups = useMemo(() => groupWords(words().filter((w) => !NO_CAPTION.has(w.seg))), []);
  const g = groups.find((x) => t >= x.s && t < x.e);
  if (!g) return null;
  const k = Math.min(1, (t - g.s) * FPS / 4), pop = 1 + 0.12 * (1 - k) * (1 - k);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: "61%" }}>
      <div style={{ transform: `scale(${pop})`, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 26px", maxWidth: 940, textAlign: "center" }}>
        {g.ws.map((w, i) => {
          const live = t >= w.s && t < w.e + 0.05;
          return (
            <span key={i} style={{
              fontFamily, fontWeight: 900, fontSize: 96, lineHeight: 1.08, letterSpacing: 1, textTransform: "uppercase",
              color: live ? "#ffd84d" : "#ffffff", WebkitTextStroke: "14px #120c16", paintOrder: "stroke fill",
              textShadow: "0 8px 0 rgba(18,12,22,0.55)",
            }}>{w.w.replace(/\.\.\.$/, "").replace(/[,.:]$/, "")}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
