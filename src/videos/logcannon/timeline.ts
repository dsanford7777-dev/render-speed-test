// "How One Log Made 100 Soldiers Surrender" (Paradox Town #8): Rugeley's Mill, South Carolina, December 4, 1780.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates at ~3.4 spoken
// words/s; scripts/align.py rewrites SEG_TIMES and WORDS from the voice, and shots, cameras and captions follow.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "He captured a fort with a log.", show: "He captured a fort with a log." },
  { say: "You see, more than a hundred loyalist soldiers were holed up inside a barn built like a fortress.", show: "You see, more than a hundred loyalist soldiers were holed up inside a barn built like a fortress." },
  { say: "Thick log walls. A ditch. Sharpened stakes.", show: "Thick log walls. A ditch. Sharpened stakes." },
  { say: "Outside stood William Washington, George Washington's cousin, with eighty men... and no cannon.", show: "Outside stood William Washington, George Washington's cousin, with 80 men... and no cannon." },
  { say: "Muskets were useless against those walls.", show: "Muskets were useless against those walls." },
  { say: "So Washington pointed at a pine tree.", show: "So Washington pointed at a pine tree." },
  { say: "His men cut it down, blackened one end, and set it on wheels.", show: "His men cut it down, blackened one end, and set it on wheels." },
  { say: "Then they rolled it out like the real thing, and aimed it at the barn.", show: "Then they rolled it out like the real thing, and aimed it at the barn." },
  { say: "Surrender, he said, or be blown to bits.", show: "Surrender, he said, or be blown to bits." },
  { say: "You see, from inside a dark barn, a black circle on wheels looks exactly like a cannon.", show: "You see, from inside a dark barn, a black circle on wheels looks exactly like a cannon." },
  { say: "And nobody wants to be the one who checks.", show: "And nobody wants to be the one who checks." },
  { say: "The door opened. More than a hundred men walked out.", show: "The door opened. More than a hundred men walked out." },
  { say: "Not one shot fired.", show: "Not one shot fired." },
  { say: "When the British general heard, he wrote one line about their colonel:", show: "When the British general heard, he wrote one line about their colonel:" },
  { say: "Rugeley will not be made a brigadier.", show: "Rugeley will not be made a brigadier." },
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
