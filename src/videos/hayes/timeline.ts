// Frank Hayes (Paradox Town Short #17): the stable hand who won his first race at Belmont Park, June 4, 1923, and was found dead after the finish.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "This jockey won his very first race... and never got off the horse alive.", show: "This jockey won his very first race... and never got off the horse alive." },
  { say: "You see, in nineteen twenty-three, Frank Hayes wasn't really a jockey. He worked in a racing stable. He trained horses, cleaned out stalls, and dreamed of riding one in a real race.", show: "You see, in 1923, Frank Hayes wasn't really a jockey. He worked in a racing stable. He trained horses, cleaned out stalls, and dreamed of riding one in a real race." },
  { say: "Then his boss's mare, Sweet Kiss, needed a rider for a steeplechase at Belmont Park, in New York. Two miles, with fences to jump. And she was a long shot.", show: "Then his boss's mare, Sweet Kiss, needed a rider for a steeplechase at Belmont Park, in New York. 2 miles, with fences to jump. And she was a long shot." },
  { say: "One problem. Sweet Kiss had to carry a hundred and thirty pounds, rider included. Frank was more than ten pounds too heavy.", show: "One problem. Sweet Kiss had to carry 130 pounds, rider included. Frank was more than 10 pounds too heavy." },
  { say: "So he starved himself. He ran for hours. He went without water. And he made the weight.", show: "So he starved himself. He ran for hours. He went without water. And he made the weight." },
  { say: "The race started... and near the end, the long shot took the lead.", show: "The race started... and near the end, the long shot took the lead." },
  { say: "After the last jump, people saw Frank sway in the saddle. He tipped to one side... then straightened up.", show: "After the last jump, people saw Frank sway in the saddle. He tipped to one side... then straightened up." },
  { say: "Sweet Kiss crossed the finish line first. His first race. His first win.", show: "Sweet Kiss crossed the finish line first. His first race. His first win." },
  { say: "Then, near the judges' stand, Frank slid out of the saddle... and hit the ground.", show: "Then, near the judges' stand, Frank slid out of the saddle... and hit the ground." },
  { say: "The track doctor ran over. Frank Hayes was dead. His heart had given out, and they blamed all that weight he'd lost.", show: "The track doctor ran over. Frank Hayes was dead. His heart had given out, and they blamed all that weight he'd lost." },
  { say: "And here's the strange part. Nobody knows exactly when his heart stopped. Before the finish line... or after it.", show: "And here's the strange part. Nobody knows exactly when his heart stopped. Before the finish line... or after it." },
  { say: "But the win still counted.", show: "But the win still counted." },
  { say: "Three days later, they buried him... in the racing silks he won in.", show: "3 days later, they buried him... in the racing silks he won in." },
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
