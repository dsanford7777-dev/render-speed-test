// Timothy Dexter (Paradox Town Short #21): the man whose rivals' worst advice made him rich, Newburyport, 1790s.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "This man shipped forty-two thousand bed warmers... to the tropics. And he made money.", show: "This man shipped 42,000 bed warmers... to the tropics. And he made money." },
  { say: "You see, Timothy Dexter was a leather worker who could barely spell. After the Revolution, he bought up war money everyone thought was worthless.", show: "You see, Timothy Dexter was a leather worker who could barely spell. After the Revolution, he bought up war money everyone thought was worthless." },
  { say: "Then Massachusetts paid its notes back in full, and Dexter was suddenly rich.", show: "Then Massachusetts paid its notes back in full, and Dexter was suddenly rich." },
  { say: "Newburyport's merchants laughed at him. The story goes, they gave him the worst advice they could think of.", show: "Newburyport's merchants laughed at him. The story goes, they gave him the worst advice they could think of." },
  { say: "Ship coal to Newcastle, England's coal capital. He did... and it landed during a miners' strike. It sold at a premium.", show: "Ship coal to Newcastle, England's coal capital. He did... and it landed during a miners' strike. It sold at a premium." },
  { say: "Bed warmers to the West Indies? Dexter bragged he shipped forty-two thousand. They used them for cooking, and he cleared seventy-nine percent.", show: "Bed warmers to the West Indies? Dexter bragged he shipped 42,000. They used them for cooking, and he cleared 79%." },
  { say: "So he bought a mansion, called himself Lord Timothy Dexter, and filled the garden with about forty wooden statues. Washington. Jefferson. And himself.", show: "So he bought a mansion, called himself Lord Timothy Dexter, and filled the garden with about 40 wooden statues. Washington. Jefferson. And himself." },
  { say: "His statue's sign said: I am the first in the East, the first in the West, and the greatest philosopher in the Western world.", show: "His statue's sign said: I am the first in the East, the first in the West, and the greatest philosopher in the Western world." },
  { say: "Then he faked his own death. About three thousand people came. But his wife didn't cry enough... so the dead man came out of hiding and caned her.", show: "Then he faked his own death. About 3,000 people came. But his wife didn't cry enough... so the dead man came out of hiding and caned her." },
  { say: "He even wrote a book with no punctuation. When readers complained, he added a page of just periods and commas... and told them to salt and pepper it as they pleased.", show: "He even wrote a book with no punctuation. When readers complained, he added a page of just periods and commas... and told them to salt and pepper it as they pleased." },
  { say: "So... was he a fool, or the luckiest man who ever lived?", show: "So... was he a fool, or the luckiest man who ever lived?" },
];

const WPS = 3.4, PAUSE = 0.3;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = est();
// __END_SEG_TIMES__
/** the voice's end; the film runs on 100 frames past it into the loop shot, where the subscribe card plays */
export const VOICE_END = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 0.35) * FPS);
export const TOTAL = VOICE_END + 100;

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
