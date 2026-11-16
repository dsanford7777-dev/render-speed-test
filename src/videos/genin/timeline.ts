// "Why a Hat Maker Paid $225 for One Concert Ticket" (Paradox Town #11): John Genin and the Jenny Lind ticket auction, 1850.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "A hat maker paid two hundred and twenty-five dollars for one concert ticket.", show: "A hat maker paid $225 for one concert ticket." },
  { say: "The next one sold for twenty-five.", show: "The next one sold for $25." },
  { say: "You see, in 1850, P. T. Barnum brought a Swedish singer named Jenny Lind to New York.", show: "You see, in 1850, P. T. Barnum brought a Swedish singer named Jenny Lind to New York." },
  { say: "Demand was so wild, he auctioned off the first tickets.", show: "Demand was so wild, he auctioned off the first tickets." },
  { say: "And the winner was John Genin... the hatter next door to Barnum's museum.", show: "And the winner was John Genin... the hatter next door to Barnum's museum." },
  { say: "The newspaper said his seat was by no means the best one.", show: "The newspaper said his seat was by no means the best one." },
  { say: "He clearly knew more about hats than music.", show: "He clearly knew more about hats than music." },
  { say: "But Genin wasn't buying a seat. He was buying a headline.", show: "But Genin wasn't buying a seat. He was buying a headline." },
  { say: "Every important newspaper in the country printed his name.", show: "Every important newspaper in the country printed his name." },
  { say: "Across America, people took off their hats... to check if they were wearing a Genin.", show: "Across America, people took off their hats... to check if they were wearing a Genin." },
  { say: "Barnum later wrote that the ticket laid the foundation of his fortune.", show: "Barnum later wrote that the ticket laid the foundation of his fortune." },
  { say: "And a year later, he did it again.", show: "And a year later, he did it again." },
  { say: "A Hungarian hero sailed into New York, and Genin met his ship... with a pile of hats nobody wanted.", show: "A Hungarian hero sailed into New York, and Genin met his ship... with a pile of hats nobody wanted." },
  { say: "They wore them in a parade up Broadway.", show: "They wore them in a parade up Broadway." },
  { say: "And right after the parade, Genin sold the rest.", show: "And right after the parade, Genin sold the rest." },
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
