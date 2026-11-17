// "The Smell That Fixed London in 18 Days" (Paradox Town #12): the Great Stink, London, summer 1858.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "They soaked the curtains in bleach, because the most powerful men in the country couldn't breathe in their own building.", show: "They soaked the curtains in bleach, because the most powerful men in the country couldn't breathe in their own building." },
  { say: "You see, right outside their windows ran a river, and nearly three million people were flushing their toilets straight into it.", show: "You see, right outside their windows ran a river, and nearly 3 million people were flushing their toilets straight into it." },
  { say: "A famous scientist warned them. Newspapers begged them. And for years, they gave the same answer. Too expensive.", show: "A famous scientist warned them. Newspapers begged them. And for years, they gave the same answer. Too expensive." },
  { say: "Then came a brutally hot summer. The river dropped, the sun cooked what was left, and the smell climbed the walls.", show: "Then came a brutally hot summer. The river dropped, the sun cooked what was left, and the smell climbed the walls." },
  { say: "Anyone who could afford to left the city.", show: "Anyone who could afford to left the city." },
  { say: "So a clerk asks, \"Should we fix the river?\" \"No. Soak the curtains.\"", show: "So a clerk asks, \"Should we fix the river?\" \"No. Soak the curtains.\"" },
  { say: "Curtains. That was the plan.", show: "Curtains. That was the plan." },
  { say: "It didn't help. Men gave speeches through handkerchiefs.", show: "It didn't help. Men gave speeches through handkerchiefs." },
  { say: "One meeting ended with the man in charge of the country's money running for the door, papers in one hand, nose in the other.", show: "One meeting ended with the man in charge of the country's money running for the door, papers in one hand, nose in the other." },
  { say: "They even talked about moving the whole government to another town.", show: "They even talked about moving the whole government to another town." },
  { say: "But here's the thing. The poor had been breathing that river for decades, and drinking it. Nobody rushed for them.", show: "But here's the thing. The poor had been breathing that river for decades, and drinking it. Nobody rushed for them." },
  { say: "This time, it was their own noses.", show: "This time, it was their own noses." },
  { say: "So the same men who had argued for years wrote a law, voted on it, and paid for brand new sewers under the entire city.", show: "So the same men who had argued for years wrote a law, voted on it, and paid for brand new sewers under the entire city." },
  { say: "It took them eighteen days.", show: "It took them 18 days." },
  { say: "And those sewers? The city still flushes into them today.", show: "And those sewers? The city still flushes into them today." },
];

const WPS = 3.4, PAUSE = 0.3;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = est();
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
/** frame of a word's onset inside a segment (first match of `w`, case-insensitive), for cuts and reaction timing */
const norm = (s: string) => s.toLowerCase().replace(/[^\w.]/g, "").replace(/\.+$/, "");
export const wordAt = (seg: number, w: string, fallbackU = 0.5) => {
  const ws = words().filter((x) => x.seg === seg), k = norm(w);
  const hit = ws.find((x) => norm(x.w) === k) ?? ws.find((x) => norm(x.w).startsWith(k));
  const [a, b] = SEG_TIMES[seg];
  return Math.round((hit ? hit.s : a + (b - a) * fallbackU) * FPS);
};
