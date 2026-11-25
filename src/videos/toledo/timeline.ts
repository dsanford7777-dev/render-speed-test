// The Toledo War (Paradox Town Short #19): Ohio vs the Michigan Territory, 1835-36. The only wound was a penknife; Michigan lost Toledo and got the copper.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "Ohio and Michigan once went to war... and the only wound came from a penknife.", show: "Ohio and Michigan once went to war... and the only wound came from a penknife." },
  { say: "You see, in eighteen thirty-five, both of them claimed the same strip of land, with the town of Toledo on it. Everyone thought Toledo would be the next great port.", show: "You see, in 1835, both of them claimed the same strip of land, with the town of Toledo on it. Everyone thought Toledo would be the next great port." },
  { say: "Michigan wasn't even a state yet. Its governor was twenty-three, and he called out the militia. Ohio's governor called out his.", show: "Michigan wasn't even a state yet. Its governor was 23, and he called out the militia. Ohio's governor called out his." },
  { say: "The one real battle? Michigan men caught an Ohio survey crew at Phillips Corners and fired: over their heads, or at them, depending on who you ask. Nobody was hit.", show: "The one real battle? Michigan men caught an Ohio survey crew at Phillips Corners and fired: over their heads, or at them, depending on who you ask. Nobody was hit." },
  { say: "Then a Michigan deputy sheriff, Joseph Wood, went into Toledo to arrest a man named Two Stickney. Yes, Two. His brother was named One.", show: "Then a Michigan deputy sheriff, Joseph Wood, went into Toledo to arrest a man named Two Stickney. Yes, Two. His brother was named One." },
  { say: "Two Stickney pulled out a penknife and stabbed him. Wood lived. That was the only blood of the entire war.", show: "Two Stickney pulled out a penknife and stabbed him. Wood lived. That was the only blood of the entire war." },
  { say: "Washington finally stepped in. Congress told Michigan: give up Toledo, and you can be a state... and we'll throw in the Upper Peninsula.", show: "Washington finally stepped in. Congress told Michigan: give up Toledo, and you can be a state... and we'll throw in the Upper Peninsula." },
  { say: "Michigan was furious. Up there was supposed to be nothing but snow and trees. They voted no.", show: "Michigan was furious. Up there was supposed to be nothing but snow and trees. They voted no." },
  { say: "Then, broke and stuck, they met again in December, at what got called the Frostbitten Convention... and said yes.", show: "Then, broke and stuck, they met again in December, at what got called the Frostbitten Convention... and said yes." },
  { say: "A few years later, they found copper up there. For forty years, Michigan mined more copper than any state in the country.", show: "A few years later, they found copper up there. For 40 years, Michigan mined more copper than any state in the country." },
  { say: "Ohio got Toledo. Michigan got rich.", show: "Ohio got Toledo. Michigan got rich." },
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
