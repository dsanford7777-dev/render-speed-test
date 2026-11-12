// Burned-in captions for 16:9: 1-3 words at a time, bold white with a heavy outline and a small pop, in the lower
// third. Normal case, punctuation kept. Yellow marks only the punch word of each line (two on long lines): numbers
// first, then words from PUNCH, then the longest word; HL overrides per segment.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "../pigwarlong/kit";
import { FPS, words, Word, SEGMENTS } from "./timeline";

/** words that carry the stakes, in rough priority order */
const PUNCH = ["nobody", "disaster", "dark", "both", "flicker", "motor", "motors", "lamps", "lights", "clocks", "clock", "fast", "pirates", "neither", "wasn't", "island", "never", "merged", "gap", "gigawatt", "blackouts", "tokyo", "osaka", "japan", "germany", "america", "europe", "pittsburgh", "berlin", "better", "always", "split", "tesla", "westinghouse", "aeg", "niagara", "toaster", "refrigerators", "fixtures"];
/** per-segment overrides: segment index -> the words to highlight (as shown) */
const HL: Record<number, string[]> = {};
const bare = (w: string) => w.toLowerCase().replace(/[^\w$.%:]/g, "").replace(/[.:]$/, "");
const pickHL = (seg: number): Set<string> => {
  if (HL[seg]) return new Set(HL[seg].map(bare));
  const ws = SEGMENTS[seg].show.split(/\s+/).map(bare).filter(Boolean), n = ws.length > 14 ? 2 : 1, out: string[] = [];
  for (const w of ws) if (/\d/.test(w) && out.length < n && !out.includes(w)) out.push(w);
  for (const p of PUNCH) if (out.length < n && ws.includes(p) && !out.includes(p)) out.push(p);
  if (!out.length) out.push([...ws].sort((a, b) => b.length - a.length)[0]);
  return new Set(out);
};

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
  const hl = useMemo(() => SEGMENTS.map((_, i) => pickHL(i)), []);
  const g = groups.find((x) => t >= x.s && t < x.e);
  if (!g) return null;
  const k = Math.min(1, (t - g.s) * FPS / 4), pop = 1 + 0.1 * (1 - k) * (1 - k);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: 858 }}>
      <div style={{ transform: `scale(${pop})`, display: "flex", flexWrap: "nowrap", justifyContent: "center", gap: "0 22px", textAlign: "center" }}>
        {g.ws.map((w, i) => {
          const punch = hl[w.seg].has(bare(w.w));
          return (
            <span key={i} style={{
              fontFamily: FONT, fontWeight: 900, fontSize: 74, lineHeight: 1.08, letterSpacing: 0.5,
              color: punch ? "#ffd84d" : "#ffffff", WebkitTextStroke: "10px #120c16", paintOrder: "stroke fill",
              textShadow: "0 7px 0 rgba(18,12,22,0.55)",
            }}>{w.w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
