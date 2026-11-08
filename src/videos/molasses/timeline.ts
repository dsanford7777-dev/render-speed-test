// "They Painted It Brown" (Boston Molasses Flood, 1919): script, timing and shots.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates; scripts/align.py
// rewrites SEG_TIMES and WORDS from the voice, and the shots, cameras and captions follow automatically.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "In nineteen nineteen, a wave of syrup killed twenty-one people in Boston.", show: "In 1919, a wave of syrup killed 21 people in Boston." },
  { say: "You see, by the harbor stood a tank five stories tall,", show: "You see, by the harbor stood a tank five stories tall," },
  { say: "filled with over two million gallons of molasses.", show: "filled with over 2 million gallons of molasses." },
  { say: "It was built in a rush, by a man who wasn't even an engineer.", show: "It was built in a rush, by a man who wasn't even an engineer." },
  { say: "He was the company's treasurer.", show: "He was the company's treasurer." },
  { say: "He never filled it with water to test it.", show: "He never filled it with water to test it." },
  { say: "On January fifteenth, it burst.", show: "On January 15th, it burst." },
  { say: "A wave of molasses up to twenty-five feet high", show: "A wave of molasses up to 25 feet high" },
  { say: "tore through the streets at about thirty-five miles an hour.", show: "tore through the streets at about 35 miles an hour." },
  { say: "It knocked a firehouse off its foundation, and twisted the elevated railway.", show: "It knocked a firehouse off its foundation, and twisted the elevated railway." },
  { say: "Then, in the January cold, it thickened like glue.", show: "Then, in the January cold, it thickened like glue." },
  { say: "Many of the victims simply got stuck.", show: "Many of the victims simply got stuck." },
  { say: "But here's the strangest part.", show: "But here's the strangest part." },
  { say: "The tank had leaked from the day it was filled.", show: "The tank had leaked from the day it was filled." },
  { say: "Neighbors scooped up the drips.", show: "Neighbors scooped up the drips." },
  { say: "So how did the company fix the leaks?", show: "So how did the company fix the leaks?" },
  { say: "They painted the tank brown.", show: "They painted the tank brown." },
];

/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0.0, 4.6], [5.16, 8.5], [8.88, 11.5], [12.14, 15.26], [15.76, 17.0], [17.6, 19.48], [19.84, 21.84], [22.58, 25.34], [25.34, 28.24], [28.78, 32.42], [33.08, 36.36], [36.94, 38.72], [39.26, 40.62], [41.08, 43.3], [43.86, 45.3], [45.9, 47.44], [48.04, 49.6]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 1.0) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = [{"w": "In", "s": 0.0, "e": 0.18, "seg": 0}, {"w": "1919,", "s": 0.18, "e": 1.14, "seg": 0}, {"w": "a", "s": 1.56, "e": 1.64, "seg": 0}, {"w": "wave", "s": 1.58, "e": 1.92, "seg": 0}, {"w": "of", "s": 1.92, "e": 2.12, "seg": 0}, {"w": "syrup", "s": 2.12, "e": 2.58, "seg": 0}, {"w": "killed", "s": 2.58, "e": 2.9, "seg": 0}, {"w": "21", "s": 2.9, "e": 3.6, "seg": 0}, {"w": "people", "s": 3.6, "e": 3.94, "seg": 0}, {"w": "in", "s": 3.94, "e": 4.2, "seg": 0}, {"w": "Boston.", "s": 4.2, "e": 4.6, "seg": 0}, {"w": "You", "s": 5.16, "e": 5.24, "seg": 1}, {"w": "see,", "s": 5.16, "e": 5.34, "seg": 1}, {"w": "by", "s": 5.82, "e": 5.9, "seg": 1}, {"w": "the", "s": 5.84, "e": 6.0, "seg": 1}, {"w": "harbor", "s": 6.0, "e": 6.32, "seg": 1}, {"w": "stood", "s": 6.32, "e": 6.62, "seg": 1}, {"w": "a", "s": 6.62, "e": 6.82, "seg": 1}, {"w": "tank", "s": 6.82, "e": 7.08, "seg": 1}, {"w": "five", "s": 7.08, "e": 7.58, "seg": 1}, {"w": "stories", "s": 7.58, "e": 8.02, "seg": 1}, {"w": "tall,", "s": 8.02, "e": 8.5, "seg": 1}, {"w": "filled", "s": 8.88, "e": 9.0, "seg": 2}, {"w": "with", "s": 9.0, "e": 9.22, "seg": 2}, {"w": "over", "s": 9.22, "e": 9.42, "seg": 2}, {"w": "2", "s": 9.42, "e": 9.78, "seg": 2}, {"w": "million", "s": 9.78, "e": 10.32, "seg": 2}, {"w": "gallons", "s": 10.32, "e": 10.78, "seg": 2}, {"w": "of", "s": 10.78, "e": 11.06, "seg": 2}, {"w": "molasses.", "s": 11.06, "e": 11.5, "seg": 2}, {"w": "It", "s": 12.14, "e": 12.28, "seg": 3}, {"w": "was", "s": 12.28, "e": 12.4, "seg": 3}, {"w": "built", "s": 12.4, "e": 12.6, "seg": 3}, {"w": "in", "s": 12.6, "e": 12.76, "seg": 3}, {"w": "a", "s": 12.76, "e": 12.9, "seg": 3}, {"w": "rush,", "s": 12.9, "e": 13.22, "seg": 3}, {"w": "by", "s": 13.3, "e": 13.58, "seg": 3}, {"w": "a", "s": 13.58, "e": 13.68, "seg": 3}, {"w": "man", "s": 13.68, "e": 13.82, "seg": 3}, {"w": "who", "s": 13.82, "e": 14.04, "seg": 3}, {"w": "wasn't", "s": 14.04, "e": 14.48, "seg": 3}, {"w": "even", "s": 14.48, "e": 14.68, "seg": 3}, {"w": "an", "s": 14.68, "e": 14.82, "seg": 3}, {"w": "engineer.", "s": 14.82, "e": 15.26, "seg": 3}, {"w": "He", "s": 15.76, "e": 15.86, "seg": 4}, {"w": "was", "s": 15.86, "e": 15.96, "seg": 4}, {"w": "the", "s": 15.96, "e": 16.1, "seg": 4}, {"w": "company's", "s": 16.1, "e": 16.6, "seg": 4}, {"w": "treasurer.", "s": 16.6, "e": 17.0, "seg": 4}, {"w": "He", "s": 17.6, "e": 17.68, "seg": 5}, {"w": "never", "s": 17.62, "e": 17.9, "seg": 5}, {"w": "filled", "s": 17.9, "e": 18.18, "seg": 5}, {"w": "it", "s": 18.18, "e": 18.34, "seg": 5}, {"w": "with", "s": 18.34, "e": 18.48, "seg": 5}, {"w": "water", "s": 18.48, "e": 18.74, "seg": 5}, {"w": "to", "s": 18.74, "e": 18.96, "seg": 5}, {"w": "test", "s": 18.96, "e": 19.22, "seg": 5}, {"w": "it.", "s": 19.22, "e": 19.48, "seg": 5}, {"w": "On", "s": 19.84, "e": 19.94, "seg": 6}, {"w": "January", "s": 19.94, "e": 20.24, "seg": 6}, {"w": "15th,", "s": 20.24, "e": 21.34, "seg": 6}, {"w": "it", "s": 21.34, "e": 21.46, "seg": 6}, {"w": "burst.", "s": 21.46, "e": 21.84, "seg": 6}, {"w": "A", "s": 22.58, "e": 22.68, "seg": 7}, {"w": "wave", "s": 22.68, "e": 22.94, "seg": 7}, {"w": "of", "s": 22.94, "e": 23.14, "seg": 7}, {"w": "molasses", "s": 23.14, "e": 23.66, "seg": 7}, {"w": "up", "s": 23.66, "e": 23.9, "seg": 7}, {"w": "to", "s": 23.9, "e": 24.06, "seg": 7}, {"w": "25", "s": 24.06, "e": 24.8, "seg": 7}, {"w": "feet", "s": 24.8, "e": 25.0, "seg": 7}, {"w": "high", "s": 25.0, "e": 25.34, "seg": 7}, {"w": "tore", "s": 25.34, "e": 25.72, "seg": 8}, {"w": "through", "s": 25.72, "e": 25.98, "seg": 8}, {"w": "the", "s": 25.98, "e": 26.14, "seg": 8}, {"w": "streets", "s": 26.14, "e": 26.44, "seg": 8}, {"w": "at", "s": 26.44, "e": 26.64, "seg": 8}, {"w": "about", "s": 26.64, "e": 26.82, "seg": 8}, {"w": "35", "s": 26.82, "e": 27.52, "seg": 8}, {"w": "miles", "s": 27.52, "e": 27.74, "seg": 8}, {"w": "an", "s": 27.74, "e": 27.96, "seg": 8}, {"w": "hour.", "s": 27.96, "e": 28.24, "seg": 8}, {"w": "It", "s": 28.78, "e": 28.86, "seg": 9}, {"w": "knocked", "s": 28.8, "e": 29.0, "seg": 9}, {"w": "a", "s": 29.0, "e": 29.18, "seg": 9}, {"w": "firehouse", "s": 29.18, "e": 29.72, "seg": 9}, {"w": "off", "s": 29.72, "e": 29.9, "seg": 9}, {"w": "its", "s": 29.9, "e": 30.08, "seg": 9}, {"w": "foundation,", "s": 30.08, "e": 30.52, "seg": 9}, {"w": "and", "s": 30.94, "e": 31.02, "seg": 9}, {"w": "twisted", "s": 31.0, "e": 31.36, "seg": 9}, {"w": "the", "s": 31.36, "e": 31.62, "seg": 9}, {"w": "elevated", "s": 31.62, "e": 32.0, "seg": 9}, {"w": "railway.", "s": 32.0, "e": 32.42, "seg": 9}, {"w": "Then,", "s": 33.08, "e": 33.28, "seg": 10}, {"w": "in", "s": 33.46, "e": 33.66, "seg": 10}, {"w": "the", "s": 33.66, "e": 33.78, "seg": 10}, {"w": "January", "s": 33.78, "e": 34.24, "seg": 10}, {"w": "cold,", "s": 34.24, "e": 34.68, "seg": 10}, {"w": "it", "s": 35.12, "e": 35.22, "seg": 10}, {"w": "thickened", "s": 35.22, "e": 35.74, "seg": 10}, {"w": "like", "s": 35.74, "e": 35.94, "seg": 10}, {"w": "glue.", "s": 35.94, "e": 36.36, "seg": 10}, {"w": "Many", "s": 36.94, "e": 37.1, "seg": 11}, {"w": "of", "s": 37.1, "e": 37.22, "seg": 11}, {"w": "the", "s": 37.22, "e": 37.36, "seg": 11}, {"w": "victims", "s": 37.36, "e": 37.64, "seg": 11}, {"w": "simply", "s": 37.64, "e": 38.06, "seg": 11}, {"w": "got", "s": 38.06, "e": 38.28, "seg": 11}, {"w": "stuck.", "s": 38.28, "e": 38.72, "seg": 11}, {"w": "But", "s": 39.26, "e": 39.36, "seg": 12}, {"w": "here's", "s": 39.36, "e": 39.62, "seg": 12}, {"w": "the", "s": 39.62, "e": 39.78, "seg": 12}, {"w": "strangest", "s": 39.78, "e": 40.36, "seg": 12}, {"w": "part.", "s": 40.36, "e": 40.62, "seg": 12}, {"w": "The", "s": 41.08, "e": 41.22, "seg": 13}, {"w": "tank", "s": 41.22, "e": 41.46, "seg": 13}, {"w": "had", "s": 41.46, "e": 41.66, "seg": 13}, {"w": "leaked", "s": 41.66, "e": 41.96, "seg": 13}, {"w": "from", "s": 41.96, "e": 42.22, "seg": 13}, {"w": "the", "s": 42.22, "e": 42.38, "seg": 13}, {"w": "day", "s": 42.38, "e": 42.58, "seg": 13}, {"w": "it", "s": 42.58, "e": 42.7, "seg": 13}, {"w": "was", "s": 42.7, "e": 42.84, "seg": 13}, {"w": "filled.", "s": 42.84, "e": 43.3, "seg": 13}, {"w": "Neighbors", "s": 43.86, "e": 44.16, "seg": 14}, {"w": "scooped", "s": 44.16, "e": 44.64, "seg": 14}, {"w": "up", "s": 44.64, "e": 44.72, "seg": 14}, {"w": "the", "s": 44.72, "e": 44.88, "seg": 14}, {"w": "drips.", "s": 44.88, "e": 45.3, "seg": 14}, {"w": "So", "s": 45.9, "e": 46.06, "seg": 15}, {"w": "how", "s": 46.06, "e": 46.22, "seg": 15}, {"w": "did", "s": 46.22, "e": 46.32, "seg": 15}, {"w": "the", "s": 46.32, "e": 46.46, "seg": 15}, {"w": "company", "s": 46.46, "e": 46.66, "seg": 15}, {"w": "fix", "s": 46.66, "e": 47.0, "seg": 15}, {"w": "the", "s": 47.0, "e": 47.22, "seg": 15}, {"w": "leaks?", "s": 47.22, "e": 47.44, "seg": 15}, {"w": "They", "s": 48.04, "e": 48.24, "seg": 16}, {"w": "painted", "s": 48.24, "e": 48.58, "seg": 16}, {"w": "the", "s": 48.58, "e": 48.84, "seg": 16}, {"w": "tank", "s": 48.84, "e": 49.16, "seg": 16}, {"w": "brown.", "s": 49.16, "e": 49.6, "seg": 16}];
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
export type Light = "day" | "golden";
/** a shot spans whole segments [s0, s1] (inclusive). Golden = before the flood (1915-18), day = January 15, 1919 */
export type ShotDef = { id: number; s0: number; s1: number; light: Light; a: number; b: number };
const raw: Omit<ShotDef, "a" | "b">[] = [
  { id: 1, s0: 0, s1: 0, light: "day" },      // hook: the brown wave towers over the street, people run
  { id: 2, s0: 1, s1: 1, light: "golden" },   // "You see": the tank by the harbor, people tiny at its foot
  { id: 3, s0: 2, s1: 2, light: "golden" },   // OVER 2,000,000 GALLONS board at the tank
  { id: 4, s0: 3, s1: 3, light: "golden" },   // the treasurer squints at the plan, hung upside down
  { id: 5, s0: 4, s1: 4, light: "golden" },   // TREASURER sign over his desk of coins
  { id: 6, s0: 5, s1: 5, light: "golden" },   // the hose by the tank, a red X pops on "never"
  { id: 7, s0: 6, s1: 6, light: "day" },      // JANUARY 15 1919 calendar -> the crack opens on "burst"
  { id: 8, s0: 7, s1: 7, light: "day" },      // the wave against the 25 FT pole
  { id: 9, s0: 8, s1: 8, light: "day" },      // low: the wave rushes at the lens past the 35 MPH sign
  { id: 10, s0: 9, s1: 9, light: "day" },     // the firehouse slides off its base -> the El span twists
  { id: 11, s0: 10, s1: 10, light: "day" },   // the street under a glossy sheet of molasses
  { id: 12, s0: 11, s1: 11, light: "day" },   // a cart and a hat stuck fast
  { id: 13, s0: 12, s1: 12, light: "golden" }, // back before: the tank whole
  { id: 14, s0: 13, s1: 13, light: "golden" }, // close: leaks running down the seams
  { id: 15, s0: 14, s1: 14, light: "golden" }, // kids with tin cups under the drips
  { id: 16, s0: 15, s1: 15, light: "golden" }, // the treasurer shrugs at the streaks
  { id: 17, s0: 16, s1: 16, light: "golden" }, // a painter covers the tank in brown; the streaks vanish
];
export const SHOTS: ShotDef[] = raw.map((s, i) => ({
  ...s,
  a: i === 0 ? 0 : Math.round(SEG_TIMES[s.s0][0] * FPS) - 2, // cuts land ~2 f before the line
  b: i === raw.length - 1 ? TOTAL : Math.round(SEG_TIMES[raw[i + 1].s0][0] * FPS) - 2,
}));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** crossfades (frames) where time changes (into and out of the flashbacks) */
export const XFADE: Record<number, number> = { 2: 8, 7: 8, 13: 10 };
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
/** frame of a word's onset inside a segment (first match of `w`, case-insensitive) */
const norm = (s: string) => s.toLowerCase().replace(/[^\w.]/g, "").replace(/\.+$/, "");
export const wordAt = (seg: number, w: string, fallbackU = 0.5) => {
  const ws = words().filter((x) => x.seg === seg), k = norm(w);
  const hit = ws.find((x) => norm(x.w) === k) ?? ws.find((x) => norm(x.w).startsWith(k));
  const [a, b] = SEG_TIMES[seg];
  return Math.round((hit ? hit.s : a + (b - a) * fallbackU) * FPS);
};
