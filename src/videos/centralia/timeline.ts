// Centralia (Paradox Town Short #18): the Pennsylvania coal town whose dump fire, set May 27, 1962, became a mine fire that still burns.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "This town has been on fire... for sixty-four years. And it's still burning.", show: "This town has been on fire... for 64 years. And it's still burning." },
  { say: "You see, Centralia, Pennsylvania, was a coal town, built right on top of old mine tunnels.", show: "You see, Centralia, Pennsylvania, was a coal town, built right on top of old mine tunnels." },
  { say: "In May of nineteen sixty-two, the town wanted its dump cleaned up before Memorial Day. So the council hired five volunteer firefighters... and they set the dump on fire.", show: "In May of 1962, the town wanted its dump cleaned up before Memorial Day. So the council hired 5 volunteer firefighters... and they set the dump on fire." },
  { say: "The problem? That dump sat in an old strip-mine pit. And most likely, the flames found a seam of coal.", show: "The problem? That dump sat in an old strip-mine pit. And most likely, the flames found a seam of coal." },
  { say: "They hosed it down. It came back. Because now it was burning underground, in the tunnels, where no hose could reach.", show: "They hosed it down. It came back. Because now it was burning underground, in the tunnels, where no hose could reach." },
  { say: "Crews dug trenches and flushed the mines for years. Nothing worked. Smoke rose from cracks in backyards. Gas crept into basements.", show: "Crews dug trenches and flushed the mines for years. Nothing worked. Smoke rose from cracks in backyards. Gas crept into basements." },
  { say: "Then, on Valentine's Day, nineteen eighty-one, a twelve-year-old boy named Todd Domboski felt the ground open under his feet.", show: "Then, on Valentine's Day, 1981, a 12-year-old boy named Todd Domboski felt the ground open under his feet." },
  { say: "He fell into a smoking sinkhole, and held onto tree roots until his cousin pulled him out. The hole was about a hundred and fifty feet deep.", show: "He fell into a smoking sinkhole, and held onto tree roots until his cousin pulled him out. The hole was about 150 feet deep." },
  { say: "After that, Congress paid forty-two million dollars to buy out the town. The state took the houses. The Postal Service even took away the ZIP code.", show: "After that, Congress paid $42 million to buy out the town. The state took the houses. The Postal Service even took away the ZIP code." },
  { say: "But a few people refused to leave. And they won the right to stay... for the rest of their lives.", show: "But a few people refused to leave. And they won the right to stay... for the rest of their lives." },
  { say: "By twenty twenty, the census counted five people.", show: "By 2020, the census counted 5 people." },
  { say: "And the fire? It could keep burning... for another two hundred and fifty years.", show: "And the fire? It could keep burning... for another 250 years." },
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
