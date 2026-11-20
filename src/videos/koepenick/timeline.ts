// "He Bought a Used Uniform and Took Over a Town" (Paradox Town #15): the Captain of Koepenick, 1906.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "He bought ten soldiers a beer... then used them to arrest a mayor.", show: "He bought 10 soldiers a beer... then used them to arrest a mayor." },
  { say: "You see, he wasn't an officer. He was a fifty-seven-year-old shoemaker, just out of prison, and he'd bought that captain's uniform piece by piece, from junk shops.", show: "You see, he wasn't an officer. He was a 57-year-old shoemaker, just out of prison, and he'd bought that captain's uniform piece by piece, from junk shops." },
  { say: "It didn't even fit right. Nobody checked.", show: "It didn't even fit right. Nobody checked." },
  { say: "He stopped four guardsmen on their way back from the army swimming baths. By order of the Kaiser, you're with me. They saluted.", show: "He stopped 4 guardsmen on their way back from the army swimming baths. \"By order of the Kaiser, you're with me.\" They saluted." },
  { say: "Six more joined from the shooting range. Beer, sausages, and one mark each.", show: "6 more joined from the shooting range. Beer, sausages, and 1 mark each." },
  { say: "Then he took them by train to a town hall outside Berlin.", show: "Then he took them by train to a town hall outside Berlin." },
  { say: "The mayor asked one question. Where is your warrant? He pointed at the bayonets. These are my warrant.", show: "The mayor asked one question. \"Where is your warrant?\" He pointed at the bayonets. \"These are my warrant.\"" },
  { say: "He had the mayor hauled off to Berlin under guard, and the treasurer count out the town's cash.", show: "He had the mayor hauled off to Berlin under guard, and the treasurer count out the town's cash." },
  { say: "Then he signed a receipt... with the name of his old prison warden.", show: "Then he signed a receipt... with the name of his old prison warden." },
  { say: "He walked off with more than three and a half thousand marks, and bought himself a new suit.", show: "He walked off with more than 3,500 marks, and bought himself a new suit." },
  { say: "You see, back then a uniform worked like a master key. And nobody asks a key for ID.", show: "You see, back then a uniform worked like a master key. And nobody asks a key for ID." },
  { say: "Ten days later he was caught, and the whole world laughed. In the end, even the Kaiser let him go.", show: "10 days later he was caught, and the whole world laughed. In the end, even the Kaiser let him go." },
  { say: "He'd later swear he only did it to get a passport. Small problem. That town hall couldn't issue passports.", show: "He'd later swear he only did it to get a passport. Small problem. That town hall couldn't issue passports." },
  { say: "Four years later, he finally got one... from Luxembourg.", show: "4 years later, he finally got one... from Luxembourg." },
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
