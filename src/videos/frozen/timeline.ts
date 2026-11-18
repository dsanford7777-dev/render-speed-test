// "They Opened Frozen Graves to Find the 1918 Flu" (Paradox Town #13): Longyearbyen, the 1998 dig, and Hultin in Alaska.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "They dug up seven dead miners, because the deadliest virus in history might still be alive inside them.", show: "They dug up 7 dead miners, because the deadliest virus in history might still be alive inside them." },
  { say: "You see, in 1918, a ship sailed into a tiny coal town near the North Pole, and nearly everyone on board was sick.", show: "You see, in 1918, a ship sailed into a tiny coal town near the North Pole, and nearly everyone on board was sick." },
  { say: "Within a week, seven young men were dead. The oldest was twenty-eight.", show: "Within a week, 7 young men were dead. The oldest was 28." },
  { say: "The ground was frozen so hard, the town had to blast their graves open with dynamite.", show: "The ground was frozen so hard, the town had to blast their graves open with dynamite." },
  { say: "That flu went on to kill tens of millions of people. And nobody had kept a sample of it.", show: "That flu went on to kill tens of millions of people. And nobody had kept a sample of it." },
  { say: "So eighty years later, scientists from four countries flew in. Ground radar. Protective suits.", show: "So 80 years later, scientists from 4 countries flew in. Ground radar. Protective suits." },
  { say: "The idea was simple. The miners were buried deep, in ground that never thaws. The virus should be frozen solid.", show: "The idea was simple. The miners were buried deep, in ground that never thaws. The virus should be frozen solid." },
  { say: "They dug for a week. And less than one meter down, they hit the coffins.", show: "They dug for a week. And less than 1 meter down, they hit the coffins." },
  { say: "Too shallow. Above the frozen layer. For eighty summers, those graves had thawed, and frozen, and thawed again.", show: "Too shallow. Above the frozen layer. For 80 summers, those graves had thawed, and frozen, and thawed again." },
  { say: "The virus was gone.", show: "The virus was gone." },
  { say: "But here's the thing. A year earlier, a seventy-two-year-old retired doctor flew to a village in Alaska, with his wife's garden shears in a duffel bag.", show: "But here's the thing. A year earlier, a 72-year-old retired doctor flew to a village in Alaska, with his wife's garden shears in a duffel bag." },
  { say: "He dug into a frozen mass grave, and found a woman whose lungs had been preserved.", show: "He dug into a frozen mass grave, and found a woman whose lungs had been preserved." },
  { say: "He mailed them to a lab. And inside them, scientists found the whole 1918 flu.", show: "He mailed them to a lab. And inside them, scientists found the whole 1918 flu." },
  { say: "And that Arctic town? It hasn't buried a coffin since 1950.", show: "And that Arctic town? It hasn't buried a coffin since 1950." },
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
