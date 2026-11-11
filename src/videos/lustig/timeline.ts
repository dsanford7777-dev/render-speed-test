// "The Man Who Sold the Eiffel Tower for Scrap" (Paradox Town #6): script, timing and shots.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates at ~3.7 spoken
// words/s; scripts/align.py rewrites SEG_TIMES and WORDS from the voice, and shots, cameras and captions follow.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "He sold the Eiffel Tower for scrap.", show: "He sold the Eiffel Tower for scrap." },
  { say: "It wasn't his.", show: "It wasn't his." },
  { say: "You see, Victor Lustig read that Paris could barely afford to keep the tower standing.", show: "You see, Victor Lustig read that Paris could barely afford to keep the tower standing." },
  { say: "So he printed fake government letters,", show: "So he printed fake government letters," },
  { say: "and invited scrap dealers to a luxury hotel.", show: "and invited scrap dealers to a luxury hotel." },
  { say: "Gentlemen, the tower is coming down.", show: "Gentlemen, the tower is coming down." },
  { say: "Seven thousand tons of iron.", show: "Seven thousand tons of iron." },
  { say: "Tell no one.", show: "Tell no one." },
  { say: "One dealer, André Poisson, got nervous.", show: "One dealer, André Poisson, got nervous." },
  { say: "So Lustig leaned in...", show: "So Lustig leaned in..." },
  { say: "and asked for a bribe.", show: "and asked for a bribe." },
  { say: "That settled it.", show: "That settled it." },
  { say: "Only a real official would be that corrupt.", show: "Only a real official would be that corrupt." },
  { say: "Poisson paid,", show: "Poisson paid," },
  { say: "and Lustig fled to Vienna with a suitcase full of cash.", show: "and Lustig fled to Vienna with a suitcase full of cash." },
  { say: "He checked the papers every day.", show: "He checked the papers every day." },
  { say: "Nothing.", show: "Nothing." },
  { say: "Poisson was too embarrassed to call the police.", show: "Poisson was too embarrassed to call the police." },
  { say: "So Lustig went back to Paris,", show: "So Lustig went back to Paris," },
  { say: "and tried to sell the tower again.", show: "and tried to sell the tower again." },
  { say: "That buyer did call the police.", show: "That buyer did call the police." },
  { say: "Lustig vanished to America,", show: "Lustig vanished to America," },
  { say: "where Al Capone handed him fifty thousand dollars.", show: "where Al Capone handed him fifty thousand dollars." },
  { say: "He gave back every cent...", show: "He gave back every cent..." },
  { say: "and got a reward for his honesty.", show: "and got a reward for his honesty." },
];

const WPS = 3.7, PAUSE = 0.32;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0, 2.41], [2.71, 3.75], [4.05, 9.22], [9.52, 11.59], [11.89, 14.65], [14.95, 17.02], [17.32, 19.04], [19.34, 20.38], [20.68, 22.74], [23.04, 24.42], [24.72, 26.45], [26.75, 27.78], [28.08, 30.84], [31.14, 31.83], [32.13, 35.92], [36.22, 38.29], [38.59, 38.94], [39.24, 42.0], [42.3, 44.37], [44.67, 47.08], [47.38, 49.45], [49.75, 51.13], [51.43, 54.19], [54.49, 56.21], [56.51, 58.92]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 1.0) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = null;
// __END_WORDS__
export const words = (): Word[] => {
  if (WORDS) return WORDS;
  const out: Word[] = [];
  SEGMENTS.forEach((sg, i) => {
    const [a, b] = SEG_TIMES[i], ws = sg.show.split(/\s+/).filter(Boolean);
    const wt = ws.map((w) => 1.2 + w.replace(/[^\w]/g, "").length * (/^\d/.test(w) ? 0.9 : 0.35) + (/[.,?!:]$/.test(w) ? 0.8 : 0));
    const sum = wt.reduce((x, y) => x + y, 0);
    let t = a;
    ws.forEach((w, k) => { const d = ((b - a) * wt[k]) / sum; out.push({ w, s: t, e: t + d, seg: i }); t += d; });
  });
  return out;
};

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night";
/** a shot spans whole segments [s0, s1] (inclusive) */
export type ShotDef = { id: number; s0: number; s1: number; light: Light; a: number; b: number };
const raw: Omit<ShotDef, "a" | "b">[] = [
  { id: 1, s0: 0, s1: 0, light: "day" },  // hook: the tower, SOLD stamp slams on it; cut under the legs looking straight up, spinning
  { id: 2, s0: 1, s1: 1, light: "day" },  // Lustig's grin, big, tilted, the tower soft behind him
  { id: 3, s0: 2, s1: 2, light: "day" },  // he peeks over a newspaper; whip up to the tower, crane up its side; top-down from the summit
  { id: 4, s0: 3, s1: 3, light: "day" },  // corkscrew down onto the forged letter, FAKE stamp; envelopes fly at the lens
  { id: 5, s0: 4, s1: 4, light: "day" },  // the dealers march in under the hotel arch (camera backs away); crane out to the whole salon
  { id: 6, s0: 5, s1: 5, light: "day" },  // low on Lustig; the model tower topples at the lens
  { id: 7, s0: 6, s1: 7, light: "day" },  // long-lens slide across the dealers' faces; snap to Lustig going shh
  { id: 8, s0: 8, s1: 8, light: "day" },  // the three dealers; snap to Poisson sweating
  { id: 9, s0: 9, s1: 10, light: "day" },  // orbit round Lustig leaning in to Poisson; the upturned top hat shoots at the lens
  { id: 10, s0: 11, s1: 12, light: "day" }, // Poisson: nervous, then relieved; rising orbit out
  { id: 11, s0: 13, s1: 13, light: "day" }, // cash slams on the table
  { id: 12, s0: 14, s1: 14, light: "day" }, // street: tracking beside Lustig running with the suitcase; then he runs straight at the lens, tower behind
  { id: 13, s0: 15, s1: 16, light: "day" }, // Vienna quay: swoop in to Lustig behind a newspaper; snap to his eyes, paper drops, grin
  { id: 14, s0: 17, s1: 17, light: "day" }, // Poisson alone under the tower; crane up and away until he's tiny
  { id: 15, s0: 18, s1: 18, light: "day" }, // dive from high over the river down the main street toward the tower
  { id: 16, s0: 19, s1: 19, light: "day" }, // low orbit: Lustig, a new buyer, FOR SALE sign, tower above
  { id: 17, s0: 20, s1: 20, light: "day" }, // gendarmes charge down the street at the lens
  { id: 18, s0: 21, s1: 21, light: "day" }, // crash zoom to his top hat left spinning on the grass; whip away
  { id: 19, s0: 22, s1: 24, light: "day" }, // Chicago: low on Capone; cash slides over and back; reward flies at the lens; Lustig's grin; back to the hook frame
];
export const SHOTS: ShotDef[] = raw.map((s, i) => ({
  ...s,
  a: i === 0 ? 0 : Math.round(SEG_TIMES[s.s0][0] * FPS) - 2, // cuts land ~2 f before the line
  b: i === raw.length - 1 ? TOTAL : Math.round(SEG_TIMES[raw[i + 1].s0][0] * FPS) - 2,
}));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** crossfades (frames): hard cuts everywhere */
export const XFADE: Record<number, number> = {};
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
/** frame of a word's onset inside a segment (first match of `w`, case-insensitive), for reaction timing */
const norm = (s: string) => s.toLowerCase().replace(/[^\w.]/g, "").replace(/\.+$/, "");
export const wordAt = (seg: number, w: string, fallbackU = 0.5) => {
  const ws = words().filter((x) => x.seg === seg), k = norm(w);
  const hit = ws.find((x) => norm(x.w) === k) ?? ws.find((x) => norm(x.w).startsWith(k));
  const [a, b] = SEG_TIMES[seg];
  return Math.round((hit ? hit.s : a + (b - a) * fallbackU) * FPS);
};
