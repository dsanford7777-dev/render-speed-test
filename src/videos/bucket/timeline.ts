// War of the Bucket (Paradox Town Short #20): Bologna vs Modena, 1325. The bucket was the prize, not the cause.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;
/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "This bucket is a trophy from a real medieval war... and the war wasn't even about the bucket.", show: "This bucket is a trophy from a real medieval war... and the war wasn't even about the bucket." },
  { say: "You see, in thirteen twenty-five, Bologna and Modena, two Italian cities about twenty-five miles apart, already hated each other. One side backed the Pope. The other backed the Emperor.", show: "You see, in 1325, Bologna and Modena, two Italian cities about 25 miles apart, already hated each other. One side backed the Pope. The other backed the Emperor." },
  { say: "That September, traitors inside Bologna's fortress at Monteveglio handed it over to Modena.", show: "That September, traitors inside Bologna's fortress at Monteveglio handed it over to Modena." },
  { say: "Bologna was furious. It raised an army of more than thirty thousand men. Modena had about seven thousand.", show: "Bologna was furious. It raised an army of more than 30,000 men. Modena had about 7,000." },
  { say: "And the Pope had already declared Modena's leader, Passerino Bonacolsi, a rebel. Anyone who harmed him was promised forgiveness for their sins.", show: "And the Pope had already declared Modena's leader, Passerino Bonacolsi, a rebel. Anyone who harmed him was promised forgiveness for their sins." },
  { say: "The armies met at Zappolino, near sunset. Bonacolsi had faked a river crossing the night before, and now he sent his horsemen around behind the Bolognese lines.", show: "The armies met at Zappolino, near sunset. Bonacolsi had faked a river crossing the night before, and now he sent his horsemen around behind the Bolognese lines." },
  { say: "In about two hours, the giant army ran. Around two thousand men were killed or wounded.", show: "In about two hours, the giant army ran. Around 2,000 men were killed or wounded." },
  { say: "Modena chased them all the way to Bologna's walls... and instead of attacking the city, they held a race outside its gates. Just to rub it in.", show: "Modena chased them all the way to Bologna's walls... and instead of attacking the city, they held a race outside its gates. Just to rub it in." },
  { say: "On the way home, they grabbed a wooden bucket from a well outside the city gate. That was the prize.", show: "On the way home, they grabbed a wooden bucket from a well outside the city gate. That was the prize." },
  { say: "By January, Bologna had its fortress back. Modena kept the bucket.", show: "By January, Bologna had its fortress back. Modena kept the bucket." },
  { say: "Three hundred years later, a poet wrote a comic epic where the whole war starts over the bucket... and that's the version everyone remembers.", show: "Three hundred years later, a poet wrote a comic epic where the whole war starts over the bucket... and that's the version everyone remembers." },
  { say: "And the bucket? It's still in Modena.", show: "And the bucket? It's still in Modena." },
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
