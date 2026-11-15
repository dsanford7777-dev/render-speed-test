// "The Rat Bomb That Won by Getting Caught" (Paradox Town #10): the SOE's explosive rats, WWII.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "They stuffed dead rats with explosives.", show: "They stuffed dead rats with explosives." },
  { say: "You see, in World War Two, Britain's secret saboteurs wanted to blow up German boilers.", show: "You see, in World War 2, Britain's secret saboteurs wanted to blow up German boilers." },
  { say: "And they noticed something.", show: "And they noticed something." },
  { say: "When a stoker finds a dead rat in the coal... he throws it in the fire.", show: "When a stoker finds a dead rat in the coal... he throws it in the fire." },
  { say: "So an officer went to a London supplier and bought about a hundred dead rats.", show: "So an officer went to a London supplier and bought about 100 dead rats." },
  { say: "\"They're for a laboratory experiment,\" he said.", show: "\"They're for a laboratory experiment,\" he said." },
  { say: "They filled each one with plastic explosive, sewed it shut, and fitted a fuse.", show: "They filled each one with plastic explosive, sewed it shut, and fitted a fuse." },
  { say: "Leave it on the coal pile. The stoker shovels it in. Boom.", show: "Leave it on the coal pile. The stoker shovels it in. Boom." },
  { say: "But the very first shipment was caught by the Germans.", show: "But the very first shipment was caught by the Germans." },
  { say: "Every rat. Seized. Before a single one was used.", show: "Every rat. Seized. Before a single one was used." },
  { say: "You see, that's when the trick really started working.", show: "You see, that's when the trick really started working." },
  { say: "The Germans put the rats on display at their military schools... and went hunting for more.", show: "The Germans put the rats on display at their military schools... and went hunting for more." },
  { say: "They believed hundreds were already out there.", show: "They believed hundreds were already out there." },
  { say: "And Britain's own files called it a bigger success than if the rats had actually been used.", show: "And Britain's own files called it a bigger success than if the rats had actually been used." },
];

const WPS = 3.4, PAUSE = 0.3;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0.0, 2.1], [2.78, 7.42], [7.78, 8.66], [9.06, 12.58], [13.0, 16.7], [17.16, 19.0], [19.4, 23.18], [23.66, 26.48], [27.0, 29.46], [30.0, 33.38], [33.84, 36.26], [36.66, 40.78], [41.16, 43.2], [43.5, 47.76]];
void est;
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
