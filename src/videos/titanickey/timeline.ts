// "The Man Who Walked Off the Titanic With the Key" (Paradox Town #9): David Blair, Southampton, April 1912.
// Everything is timed from SEGMENTS (seconds). scripts/align.py rewrites SEG_TIMES and WORDS from the voice, and shots,
// cameras and captions follow.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "This key sank the Titanic.", show: "This key sank the Titanic." },
  { say: "At least, that's the story.", show: "At least, that's the story." },
  { say: "You see, days before the voyage, Second Officer David Blair was bumped off the ship.", show: "You see, days before the voyage, Second Officer David Blair was bumped off the ship." },
  { say: "And he walked off with a key in his pocket.", show: "And he walked off with a key in his pocket." },
  { say: "The key, everyone says, to the lookouts' binoculars.", show: "The key, everyone says, to the lookouts' binoculars." },
  { say: "So that night, the men in the crow's nest watched for ice with nothing but their eyes.", show: "So that night, the men in the crow's nest watched for ice with nothing but their eyes." },
  { say: "Asked how much sooner binoculars would have shown the iceberg, lookout Fred Fleet said:", show: "Asked how much sooner binoculars would have shown the iceberg, lookout Fred Fleet said:" },
  { say: "\"Enough to get out of the way.\"", show: "“Enough to get out of the way.”" },
  { say: "But look at the tag on that key.", show: "But look at the tag on that key." },
  { say: "It says: crow's nest telephone.", show: "It says: CROW'S NEST TELEPHONE." },
  { say: "And the binoculars?", show: "And the binoculars?" },
  { say: "A lookout testified he locked them away in Blair's cabin, before the voyage.", show: "A lookout testified he locked them away in Blair's cabin, before the voyage." },
  { say: "When the lookouts asked for them at sea, they were told: there are none.", show: "When the lookouts asked for them at sea, they were told: there are none." },
  { say: "The key sold for ninety thousand pounds.", show: "The key sold for £90,000." },
  { say: "Nobody can agree what it opened.", show: "Nobody can agree what it opened." },
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
