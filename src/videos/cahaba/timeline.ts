// "Why a Railroad Blamed Robbers for Its Own Broken Bridge" (Paradox Town #14): the Cahaba River bridge wreck, 1896.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "The railroad offered ten thousand dollars for a gang of train wreckers... who may never have existed.", show: "The railroad offered $10,000 for a gang of train wreckers... who may never have existed." },
  { say: "You see, two days after Christmas, 1896, a passenger train rolled onto an iron bridge in Alabama, a hundred and ten feet above the Cahaba River.", show: "You see, 2 days after Christmas, 1896, a passenger train rolled onto an iron bridge in Alabama, 110 feet above the Cahaba River." },
  { say: "It was full of coal miners and their families.", show: "It was full of coal miners and their families." },
  { say: "The engineer saw something wrong. He shut off the steam, and threw the engine into reverse.", show: "The engineer saw something wrong. He shut off the steam, and threw the engine into reverse." },
  { say: "Too late. The bridge gave way, and the whole train dropped into the river.", show: "Too late. The bridge gave way, and the whole train dropped into the river." },
  { say: "The fireman jumped in mid-air, and lived, with a broken arm.", show: "The fireman jumped in mid-air, and lived, with a broken arm." },
  { say: "More than twenty people didn't.", show: "More than 20 people didn't." },
  { say: "By that night, the newspapers had their answer. Fiends. Robbers had pulled up a rail to loot the wreck.", show: "By that night, the newspapers had their answer. Fiends. Robbers had pulled up a rail to loot the wreck." },
  { say: "Three strange men had been seen at the river.", show: "3 strange men had been seen at the river." },
  { say: "So the railroad posted a reward. Ten thousand dollars.", show: "So the railroad posted a reward. $10,000." },
  { say: "But here's the thing. The people who lived by that bridge never believed it.", show: "But here's the thing. The people who lived by that bridge never believed it." },
  { say: "They said the three men were local miners, who ran to help.", show: "They said the 3 men were local miners, who ran to help." },
  { say: "And days later, a man wrote to the Birmingham paper. When a railroad doesn't want to pay for a wreck, he said, it tells reporters that train wreckers did it.", show: "And days later, a man wrote to the Birmingham paper. When a railroad doesn't want to pay for a wreck, he said, it tells reporters that train wreckers did it." },
  { say: "The bridge was four years old.", show: "The bridge was 4 years old." },
  { say: "Decades later, a historian went through the railroad's own records. She says they show construction errors in that bridge, and a company that let the robber story run.", show: "Decades later, a historian went through the railroad's own records. She says they show construction errors in that bridge, and a company that let the robber story run." },
  { say: "Because if a gang wrecked the train, the railroad might owe nothing.", show: "Because if a gang wrecked the train, the railroad might owe nothing." },
  { say: "And if the bridge failed, it owed everyone.", show: "And if the bridge failed, it owed everyone." },
  { say: "Which is a very good reason to offer ten thousand dollars.", show: "Which is a very good reason to offer $10,000." },
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
