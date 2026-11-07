// "The Salt Bucket Behind America's Thermometer": script, timing and shots.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates at ~3.7 spoken
// words/s; scripts/align.py rewrites SEG_TIMES from the ElevenLabs word timestamps, and the shots, cameras and
// captions follow automatically (camera keys are fractions of their shot).
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "America's thermometers were set with a bucket of salty ice... and a man's armpit.", show: "America's thermometers were set with a bucket of salty ice... and a man's armpit." },
  { say: "Seventeen twenty-four. Daniel Fahrenheit, a glassblower,", show: "1724. Daniel Fahrenheit, a glassblower," },
  { say: "wants thermometers that finally agree with each other. So he needs fixed points.", show: "wants thermometers that finally agree with each other. So he needs fixed points." },
  { say: "First: the coldest thing he can make on demand. Ice, water, and a salt called ammonium chloride.", show: "First: the coldest thing he can make on demand. Ice, water, and a salt called ammonium chloride." },
  { say: "That bucket becomes zero.", show: "That bucket becomes zero." },
  { say: "Second: plain ice water. Third: a healthy person, thermometer tucked under the arm.", show: "Second: plain ice water. Third: a healthy person, thermometer tucked under the arm." },
  { say: "He borrows an astronomer's scale, multiplies by four, then nudges the numbers. Ice water lands on thirty-two. The body lands on ninety-six.", show: "He borrows an astronomer's scale, multiplies by four, then nudges the numbers. Ice water lands on 32. The body lands on 96." },
  { say: "Why such strange numbers?", show: "Why such strange numbers?" },
  { say: "You see, Fahrenheit made glass tubes, not math. From thirty-two to ninety-six is exactly sixty-four steps. And sixty-four you can mark by cutting a line in half... and in half... six times. No ruler needed. His scale was built to be easy to draw.", show: "You see, Fahrenheit made glass tubes, not math. From 32 to 96 is exactly 64 steps. And 64 you can mark by cutting a line in half... and in half... six times. No ruler needed. His scale was built to be easy to draw." },
  { say: "Britain used it, so the American colonies did too.", show: "Britain used it, so the American colonies did too." },
  { say: "Then the world went metric. Britain started switching in the nineteen-sixties. In nineteen seventy-five, Congress passed the Metric Conversion Act... but made it voluntary. Americans simply didn't.", show: "Then the world went metric. Britain started switching in the 1960s. In 1975, Congress passed the Metric Conversion Act... but made it voluntary. Americans simply didn't." },
  { say: "And the twist? Scientists later re-anchored the scale to boiling water at two-twelve. Everything shifted a little, and normal body temperature moved from ninety-six... to ninety-eight point six.", show: "And the twist? Scientists later re-anchored the scale to boiling water at 212. Everything shifted a little, and \"normal\" body temperature moved from 96... to 98.6." },
  { say: "Your body never changed. The ruler did.", show: "Your body never changed. The ruler did." },
];

const WPS = 3.7, PAUSE = 0.32;
const spoken = (s: string) => s.split(/\s+/).filter(Boolean).length;
const pauses = (s: string) => (s.match(/\.\.\.|[.?!:]\s|[.?!]$/g) ?? []).length;
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = (() => {
  let t = 0.15;
  return SEGMENTS.map((s) => { const d = spoken(s.say) / WPS + pauses(s.say) * PAUSE; const r: [number, number] = [t, t + d]; t += d; return r; });
})();
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 0.9) * FPS);

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
export type SetId = "shop" | "street" | "harbor" | "square";
/** a shot spans whole segments [s0, s1] (inclusive) */
export type ShotDef = { id: number; s0: number; s1: number; light: Light; set: SetId; a: number; b: number };
const raw: Omit<ShotDef, "a" | "b">[] = [
  { id: 1, s0: 0, s1: 0, light: "day", set: "shop" },      // hook: bucket + the man with the thermometer under his arm
  { id: 2, s0: 1, s1: 1, light: "day", set: "street" },    // 1724 street, glide to the glassblower's sign
  { id: 3, s0: 2, s1: 2, light: "day", set: "shop" },      // shelf of disagreeing thermometers
  { id: 4, s0: 3, s1: 3, light: "day", set: "shop" },      // salt into the bucket, frost on the glass
  { id: 5, s0: 4, s1: 4, light: "day", set: "shop" },      // the "0"
  { id: 6, s0: 5, s1: 5, light: "day", set: "shop" },      // barrel (32) -> assistant (96)
  { id: 7, s0: 6, s1: 6, light: "day", set: "shop" },      // the scale board: 32 and 96 marked
  { id: 8, s0: 7, s1: 7, light: "day", set: "shop" },      // Fahrenheit shrugs at the lens
  { id: 9, s0: 8, s1: 8, light: "night", set: "shop" },    // "You see": candlelit bench, a line halved six times
  { id: 10, s0: 9, s1: 9, light: "golden", set: "harbor" }, // the ship between two harbours
  { id: 11, s0: 10, s1: 10, light: "golden", set: "square" }, // 1975: GO METRIC! banner, everyone walks past
  { id: 12, s0: 11, s1: 11, light: "night", set: "shop" },  // kettle at 212, 96 rolls to 98.6
  { id: 13, s0: 12, s1: 12, light: "night", set: "shop" },  // deadpan assistant
];
export const SHOTS: ShotDef[] = raw.map((s, i) => ({
  ...s,
  a: i === 0 ? 0 : Math.round(SEG_TIMES[s.s0][0] * FPS) - 2, // cuts land ~2 f before the line (reference)
  b: i === raw.length - 1 ? TOTAL : Math.round(SEG_TIMES[raw[i + 1].s0][0] * FPS) - 2,
}));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** crossfades (frames) where place or time of day changes */
export const XFADE: Record<number, number> = { 2: 6, 3: 6, 10: 8, 11: 8, 12: 8 };
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
