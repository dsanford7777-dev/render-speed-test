// Burned-in captions, re-laid out for 16:9: same style as the Shorts (1-3 words, white with a heavy outline, the
// spoken word in yellow, a small pop), smaller and sitting in the lower third.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "./kit";
import { FPS, words, Word } from "./timeline";

type Group = { ws: Word[]; s: number; e: number };
const groupWords = (all: Word[]): Group[] => {
  const out: Group[] = [];
  let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ ws: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
  for (const w of all) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 18 || cur[0].seg !== w.seg)) flush();
    cur.push(w);
    if (/[.,?!:]$|\.\.\.$/.test(w.w)) flush();
  }
  flush();
  for (let i = 0; i < out.length - 1; i++) if (out[i + 1].s - out[i].e < 0.6) out[i].e = out[i + 1].s;
  return out;
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const groups = useMemo(() => groupWords(words()), []);
  const g = groups.find((x) => t >= x.s && t < x.e);
  if (!g) return null;
  const k = Math.min(1, (t - g.s) * FPS / 4), pop = 1 + 0.1 * (1 - k) * (1 - k);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: 858 }}>
      <div style={{ transform: `scale(${pop})`, display: "flex", flexWrap: "nowrap", justifyContent: "center", gap: "0 22px", textAlign: "center" }}>
        {g.ws.map((w, i) => {
          const live = t >= w.s && t < w.e + 0.05;
          return (
            <span key={i} style={{
              fontFamily: FONT, fontWeight: 900, fontSize: 76, lineHeight: 1.08, letterSpacing: 1, textTransform: "uppercase",
              color: live ? "#ffd84d" : "#ffffff", WebkitTextStroke: "10px #120c16", paintOrder: "stroke fill",
              textShadow: "0 7px 0 rgba(18,12,22,0.55)",
            }}>{w.w.replace(/\.\.\.$/, "").replace(/[,.:]$/, "")}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
