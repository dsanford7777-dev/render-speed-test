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
export const SEG_TIMES: [number, number][] = [[0, 3.94], [4.29, 7.62], [7.77, 10.2], [10.55, 14.79], [15.14, 16.65], [17.0, 19.73], [20.08, 21.6], [21.95, 24.98], [25.33, 28.66], [29.01, 32.65], [33.0, 35.72], [36.07, 38.2], [38.55, 40.06], [40.41, 43.44], [43.79, 45.31], [45.66, 48.08], [48.43, 49.95]];
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
