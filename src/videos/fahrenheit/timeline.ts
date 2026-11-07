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
export const SEG_TIMES: [number, number][] = [[0.0, 4.44], [4.88, 7.56], [7.74, 11.38], [11.82, 16.58], [16.9, 18.06], [18.46, 22.66], [22.92, 29.88], [30.22, 31.32], [31.7, 44.6], [44.96, 47.02], [47.36, 56.42], [56.62, 65.18], [65.46, 67.4]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 0.9) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = [{"w": "America's", "s": 0.0, "e": 0.5, "seg": 0}, {"w": "thermometers", "s": 0.5, "e": 0.94, "seg": 0}, {"w": "were", "s": 0.94, "e": 1.22, "seg": 0}, {"w": "set", "s": 1.22, "e": 1.42, "seg": 0}, {"w": "with", "s": 1.42, "e": 1.58, "seg": 0}, {"w": "a", "s": 1.58, "e": 1.7, "seg": 0}, {"w": "bucket", "s": 1.7, "e": 1.88, "seg": 0}, {"w": "of", "s": 1.88, "e": 2.08, "seg": 0}, {"w": "salty", "s": 2.08, "e": 2.4, "seg": 0}, {"w": "ice...", "s": 2.4, "e": 3.6, "seg": 0}, {"w": "and", "s": 3.6, "e": 3.68, "seg": 0}, {"w": "a", "s": 3.6, "e": 3.7, "seg": 0}, {"w": "man's", "s": 3.7, "e": 4.0, "seg": 0}, {"w": "armpit.", "s": 4.0, "e": 4.44, "seg": 0}, {"w": "1724.", "s": 4.88, "e": 5.74, "seg": 1}, {"w": "Daniel", "s": 6.1, "e": 6.34, "seg": 1}, {"w": "Fahrenheit,", "s": 6.34, "e": 6.7, "seg": 1}, {"w": "a", "s": 7.02, "e": 7.1, "seg": 1}, {"w": "glassblower,", "s": 7.08, "e": 7.56, "seg": 1}, {"w": "wants", "s": 7.74, "e": 7.9, "seg": 2}, {"w": "thermometers", "s": 7.9, "e": 8.3, "seg": 2}, {"w": "that", "s": 8.3, "e": 8.54, "seg": 2}, {"w": "finally", "s": 8.54, "e": 8.9, "seg": 2}, {"w": "agree", "s": 8.9, "e": 9.34, "seg": 2}, {"w": "with", "s": 9.34, "e": 9.5, "seg": 2}, {"w": "each", "s": 9.5, "e": 9.66, "seg": 2}, {"w": "other.", "s": 9.66, "e": 9.86, "seg": 2}, {"w": "So", "s": 10.12, "e": 10.28, "seg": 2}, {"w": "he", "s": 10.42, "e": 10.58, "seg": 2}, {"w": "needs", "s": 10.58, "e": 10.74, "seg": 2}, {"w": "fixed", "s": 10.74, "e": 11.02, "seg": 2}, {"w": "points.", "s": 11.02, "e": 11.38, "seg": 2}, {"w": "First:", "s": 11.82, "e": 11.96, "seg": 3}, {"w": "the", "s": 12.24, "e": 12.36, "seg": 3}, {"w": "coldest", "s": 12.36, "e": 12.76, "seg": 3}, {"w": "thing", "s": 12.76, "e": 12.9, "seg": 3}, {"w": "he", "s": 12.9, "e": 13.06, "seg": 3}, {"w": "can", "s": 13.06, "e": 13.16, "seg": 3}, {"w": "make", "s": 13.16, "e": 13.34, "seg": 3}, {"w": "on", "s": 13.34, "e": 13.56, "seg": 3}, {"w": "demand.", "s": 13.56, "e": 13.88, "seg": 3}, {"w": "Ice,", "s": 14.3, "e": 14.4, "seg": 3}, {"w": "water,", "s": 14.74, "e": 14.88, "seg": 3}, {"w": "and", "s": 15.12, "e": 15.2, "seg": 3}, {"w": "a", "s": 15.2, "e": 15.28, "seg": 3}, {"w": "salt", "s": 15.28, "e": 15.52, "seg": 3}, {"w": "called", "s": 15.52, "e": 15.76, "seg": 3}, {"w": "ammonium", "s": 15.76, "e": 16.22, "seg": 3}, {"w": "chloride.", "s": 16.22, "e": 16.58, "seg": 3}, {"w": "That", "s": 16.9, "e": 17.1, "seg": 4}, {"w": "bucket", "s": 17.1, "e": 17.36, "seg": 4}, {"w": "becomes", "s": 17.36, "e": 17.72, "seg": 4}, {"w": "zero.", "s": 17.72, "e": 18.06, "seg": 4}, {"w": "Second:", "s": 18.46, "e": 18.72, "seg": 5}, {"w": "plain", "s": 19.16, "e": 19.28, "seg": 5}, {"w": "ice", "s": 19.28, "e": 19.54, "seg": 5}, {"w": "water.", "s": 19.54, "e": 19.84, "seg": 5}, {"w": "Third:", "s": 20.2, "e": 20.36, "seg": 5}, {"w": "a", "s": 20.64, "e": 20.74, "seg": 5}, {"w": "healthy", "s": 20.74, "e": 20.94, "seg": 5}, {"w": "person,", "s": 20.94, "e": 21.28, "seg": 5}, {"w": "thermometer", "s": 21.52, "e": 21.86, "seg": 5}, {"w": "tucked", "s": 21.86, "e": 22.1, "seg": 5}, {"w": "under", "s": 22.1, "e": 22.32, "seg": 5}, {"w": "the", "s": 22.32, "e": 22.46, "seg": 5}, {"w": "arm.", "s": 22.46, "e": 22.66, "seg": 5}, {"w": "He", "s": 22.92, "e": 23.0, "seg": 6}, {"w": "borrows", "s": 23.0, "e": 23.34, "seg": 6}, {"w": "an", "s": 23.34, "e": 23.42, "seg": 6}, {"w": "astronomer's", "s": 23.42, "e": 23.94, "seg": 6}, {"w": "scale,", "s": 23.94, "e": 24.22, "seg": 6}, {"w": "multiplies", "s": 24.5, "e": 24.84, "seg": 6}, {"w": "by", "s": 24.84, "e": 25.0, "seg": 6}, {"w": "four,", "s": 25.0, "e": 25.3, "seg": 6}, {"w": "then", "s": 25.3, "e": 25.58, "seg": 6}, {"w": "nudges", "s": 25.58, "e": 26.0, "seg": 6}, {"w": "the", "s": 26.0, "e": 26.14, "seg": 6}, {"w": "numbers.", "s": 26.14, "e": 26.44, "seg": 6}, {"w": "Ice", "s": 26.84, "e": 26.92, "seg": 6}, {"w": "water", "s": 26.88, "e": 27.14, "seg": 6}, {"w": "lands", "s": 27.14, "e": 27.4, "seg": 6}, {"w": "on", "s": 27.4, "e": 27.6, "seg": 6}, {"w": "32.", "s": 27.6, "e": 28.18, "seg": 6}, {"w": "The", "s": 28.36, "e": 28.54, "seg": 6}, {"w": "body", "s": 28.54, "e": 28.8, "seg": 6}, {"w": "lands", "s": 28.8, "e": 29.12, "seg": 6}, {"w": "on", "s": 29.12, "e": 29.32, "seg": 6}, {"w": "96.", "s": 29.32, "e": 29.88, "seg": 6}, {"w": "Why", "s": 30.22, "e": 30.42, "seg": 7}, {"w": "such", "s": 30.42, "e": 30.6, "seg": 7}, {"w": "strange", "s": 30.6, "e": 30.96, "seg": 7}, {"w": "numbers?", "s": 30.96, "e": 31.32, "seg": 7}, {"w": "You", "s": 31.7, "e": 31.78, "seg": 8}, {"w": "see,", "s": 31.78, "e": 31.94, "seg": 8}, {"w": "Fahrenheit", "s": 32.2, "e": 32.36, "seg": 8}, {"w": "made", "s": 32.36, "e": 32.68, "seg": 8}, {"w": "glass", "s": 32.68, "e": 32.96, "seg": 8}, {"w": "tubes,", "s": 32.96, "e": 33.42, "seg": 8}, {"w": "not", "s": 33.7, "e": 33.78, "seg": 8}, {"w": "math.", "s": 33.74, "e": 34.12, "seg": 8}, {"w": "From", "s": 34.4, "e": 34.5, "seg": 8}, {"w": "32", "s": 34.5, "e": 35.0, "seg": 8}, {"w": "to", "s": 35.0, "e": 35.14, "seg": 8}, {"w": "96", "s": 35.14, "e": 35.68, "seg": 8}, {"w": "is", "s": 35.68, "e": 35.92, "seg": 8}, {"w": "exactly", "s": 35.92, "e": 36.4, "seg": 8}, {"w": "64", "s": 36.4, "e": 37.0, "seg": 8}, {"w": "steps.", "s": 37.0, "e": 37.34, "seg": 8}, {"w": "And", "s": 37.64, "e": 37.74, "seg": 8}, {"w": "64", "s": 37.74, "e": 38.26, "seg": 8}, {"w": "you", "s": 38.26, "e": 38.44, "seg": 8}, {"w": "can", "s": 38.44, "e": 38.58, "seg": 8}, {"w": "mark", "s": 38.58, "e": 38.74, "seg": 8}, {"w": "by", "s": 38.74, "e": 38.92, "seg": 8}, {"w": "cutting", "s": 38.92, "e": 39.1, "seg": 8}, {"w": "a", "s": 39.1, "e": 39.22, "seg": 8}, {"w": "line", "s": 39.22, "e": 39.36, "seg": 8}, {"w": "in", "s": 39.36, "e": 39.5, "seg": 8}, {"w": "half...", "s": 39.5, "e": 39.78, "seg": 8}, {"w": "and", "s": 40.08, "e": 40.24, "seg": 8}, {"w": "in", "s": 40.24, "e": 40.36, "seg": 8}, {"w": "half...", "s": 40.36, "e": 40.62, "seg": 8}, {"w": "six", "s": 40.96, "e": 41.14, "seg": 8}, {"w": "times.", "s": 41.14, "e": 41.52, "seg": 8}, {"w": "No", "s": 41.82, "e": 42.04, "seg": 8}, {"w": "ruler", "s": 42.04, "e": 42.26, "seg": 8}, {"w": "needed.", "s": 42.26, "e": 42.5, "seg": 8}, {"w": "His", "s": 42.8, "e": 42.94, "seg": 8}, {"w": "scale", "s": 42.94, "e": 43.22, "seg": 8}, {"w": "was", "s": 43.22, "e": 43.42, "seg": 8}, {"w": "built", "s": 43.42, "e": 43.68, "seg": 8}, {"w": "to", "s": 43.68, "e": 43.9, "seg": 8}, {"w": "be", "s": 43.9, "e": 44.0, "seg": 8}, {"w": "easy", "s": 44.0, "e": 44.22, "seg": 8}, {"w": "to", "s": 44.22, "e": 44.36, "seg": 8}, {"w": "draw.", "s": 44.36, "e": 44.6, "seg": 8}, {"w": "Britain", "s": 44.96, "e": 45.1, "seg": 9}, {"w": "used", "s": 45.1, "e": 45.36, "seg": 9}, {"w": "it,", "s": 45.36, "e": 45.52, "seg": 9}, {"w": "so", "s": 45.6, "e": 45.8, "seg": 9}, {"w": "the", "s": 45.8, "e": 45.92, "seg": 9}, {"w": "American", "s": 45.92, "e": 46.2, "seg": 9}, {"w": "colonies", "s": 46.2, "e": 46.56, "seg": 9}, {"w": "did", "s": 46.56, "e": 46.8, "seg": 9}, {"w": "too.", "s": 46.8, "e": 47.02, "seg": 9}, {"w": "Then", "s": 47.36, "e": 47.54, "seg": 10}, {"w": "the", "s": 47.54, "e": 47.72, "seg": 10}, {"w": "world", "s": 47.72, "e": 47.9, "seg": 10}, {"w": "went", "s": 47.9, "e": 48.16, "seg": 10}, {"w": "metric.", "s": 48.16, "e": 48.5, "seg": 10}, {"w": "Britain", "s": 48.82, "e": 49.0, "seg": 10}, {"w": "started", "s": 49.0, "e": 49.28, "seg": 10}, {"w": "switching", "s": 49.28, "e": 49.58, "seg": 10}, {"w": "in", "s": 49.58, "e": 49.78, "seg": 10}, {"w": "the", "s": 49.78, "e": 49.88, "seg": 10}, {"w": "1960s.", "s": 49.88, "e": 50.44, "seg": 10}, {"w": "In", "s": 50.82, "e": 50.92, "seg": 10}, {"w": "1975,", "s": 50.92, "e": 51.8, "seg": 10}, {"w": "Congress", "s": 52.04, "e": 52.16, "seg": 10}, {"w": "passed", "s": 52.16, "e": 52.5, "seg": 10}, {"w": "the", "s": 52.5, "e": 52.74, "seg": 10}, {"w": "Metric", "s": 52.74, "e": 53.04, "seg": 10}, {"w": "Conversion", "s": 53.04, "e": 53.36, "seg": 10}, {"w": "Act...", "s": 53.36, "e": 53.68, "seg": 10}, {"w": "but", "s": 53.86, "e": 54.08, "seg": 10}, {"w": "made", "s": 54.08, "e": 54.28, "seg": 10}, {"w": "it", "s": 54.28, "e": 54.4, "seg": 10}, {"w": "voluntary.", "s": 54.4, "e": 54.8, "seg": 10}, {"w": "Americans", "s": 55.26, "e": 55.52, "seg": 10}, {"w": "simply", "s": 55.52, "e": 55.88, "seg": 10}, {"w": "didn't.", "s": 55.88, "e": 56.42, "seg": 10}, {"w": "And", "s": 56.62, "e": 56.7, "seg": 11}, {"w": "the", "s": 56.66, "e": 56.76, "seg": 11}, {"w": "twist?", "s": 56.76, "e": 56.98, "seg": 11}, {"w": "Scientists", "s": 57.42, "e": 57.66, "seg": 11}, {"w": "later", "s": 57.66, "e": 57.96, "seg": 11}, {"w": "re-anchored", "s": 57.96, "e": 58.58, "seg": 11}, {"w": "the", "s": 58.58, "e": 58.72, "seg": 11}, {"w": "scale", "s": 58.72, "e": 58.92, "seg": 11}, {"w": "to", "s": 58.92, "e": 59.12, "seg": 11}, {"w": "boiling", "s": 59.12, "e": 59.34, "seg": 11}, {"w": "water", "s": 59.34, "e": 59.66, "seg": 11}, {"w": "at", "s": 59.66, "e": 59.86, "seg": 11}, {"w": "212.", "s": 59.86, "e": 60.46, "seg": 11}, {"w": "Everything", "s": 60.76, "e": 61.04, "seg": 11}, {"w": "shifted", "s": 61.04, "e": 61.42, "seg": 11}, {"w": "a", "s": 61.42, "e": 61.62, "seg": 11}, {"w": "little,", "s": 61.62, "e": 61.74, "seg": 11}, {"w": "and", "s": 61.94, "e": 62.04, "seg": 11}, {"w": "\"normal\"", "s": 62.04, "e": 62.24, "seg": 11}, {"w": "body", "s": 62.24, "e": 62.52, "seg": 11}, {"w": "temperature", "s": 62.52, "e": 62.82, "seg": 11}, {"w": "moved", "s": 62.82, "e": 63.08, "seg": 11}, {"w": "from", "s": 63.08, "e": 63.28, "seg": 11}, {"w": "96...", "s": 63.28, "e": 63.82, "seg": 11}, {"w": "to", "s": 63.82, "e": 64.16, "seg": 11}, {"w": "98.6.", "s": 64.16, "e": 65.18, "seg": 11}, {"w": "Your", "s": 65.46, "e": 65.58, "seg": 12}, {"w": "body", "s": 65.58, "e": 65.84, "seg": 12}, {"w": "never", "s": 65.84, "e": 66.02, "seg": 12}, {"w": "changed.", "s": 66.02, "e": 66.44, "seg": 12}, {"w": "The", "s": 66.72, "e": 66.86, "seg": 12}, {"w": "ruler", "s": 66.86, "e": 67.1, "seg": 12}, {"w": "did.", "s": 67.1, "e": 67.4, "seg": 12}];
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
