// "Why Los Angeles Took Everyone's Clocks" (Paradox Town #7, paired Short for the 60 Hz long-form): script, timing, shots.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates at ~3.4 spoken
// words/s; scripts/align.py rewrites SEG_TIMES and WORDS from the voice, and shots, cameras and captions follow.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "An entire city once had to hand over its clocks.", show: "An entire city once had to hand over its clocks." },
  { say: "You see, the power in your wall pulses.", show: "You see, the power in your wall pulses." },
  { say: "In most of America, sixty times a second.", show: "In most of America, 60 times a second." },
  { say: "But Los Angeles ran on fifty.", show: "But Los Angeles ran on 50." },
  { say: "Nobody cared.", show: "Nobody cared." },
  { say: "Then came Hoover Dam.", show: "Then came Hoover Dam." },
  { say: "All that new power, and it came at sixty.", show: "All that new power, and it came at 60." },
  { say: "So the city switched.", show: "So the city switched." },
  { say: "Toasters didn't mind.", show: "Toasters didn't mind." },
  { say: "Light bulbs didn't mind.", show: "Light bulbs didn't mind." },
  { say: "Clocks minded.", show: "Clocks minded." },
  { say: "You see, an electric clock doesn't keep time.", show: "You see, an electric clock doesn't keep time." },
  { say: "It counts the pulses in the wall,", show: "It counts the pulses in the wall," },
  { say: "like a drummer following the band.", show: "like a drummer following the band." },
  { say: "Speed up the band,", show: "Speed up the band," },
  { say: "and the clock gains twelve minutes every hour.", show: "and the clock gains 12 minutes every hour." },
  { say: "So people carried their clocks to depots.", show: "So people carried their clocks to depots." },
  { say: "Workers rebuilt them and sent them home within days.", show: "Workers rebuilt them and sent them home within days." },
  { say: "Then the rest of Southern California did it too.", show: "Then the rest of Southern California did it too." },
  { say: "Four hundred seventy-five thousand clocks.", show: "475,000 clocks." },
  { say: "Fifty-eight thousand refrigerators.", show: "58,000 refrigerators." },
  { say: "The bill: thirty-four million dollars.", show: "The bill: $34 million." },
  { say: "A third of everything the power company made that year.", show: "A third of everything the power company made that year." },
  { say: "All because, decades earlier,", show: "All because, decades earlier," },
  { say: "someone picked fifty instead of sixty.", show: "someone picked 50 instead of 60." },
];

const WPS = 3.4, PAUSE = 0.3;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = est();
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 1.0) * FPS);

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

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night";
/** a shot spans whole segments [s0, s1] (inclusive) */
export type ShotDef = { id: number; s0: number; s1: number; light: Light; a: number; b: number };
const raw: Omit<ShotDef, "a" | "b">[] = [
  { id: 1, s0: 0, s1: 0, light: "day" },   // hook: a man hugging his wall clock, close; crane out over the whole queue; low up at him
  { id: 2, s0: 1, s1: 1, light: "day" },   // snap zoom on the wall socket, the pulse beating in it; orbit
  { id: 3, s0: 2, s1: 3, light: "day" },   // crane up the blue 60 board; whip to the red 50 board and a shrugging Angeleno
  { id: 4, s0: 4, s1: 4, light: "day" },   // his face, whistling, tilted
  { id: 5, s0: 5, s1: 6, light: "day" },   // Hoover Dam from its foot, looking up; snap to the 60 on the powerhouse
  { id: 6, s0: 7, s1: 7, light: "day" },   // the lever is thrown, the 50 board flips to 60
  { id: 7, s0: 8, s1: 9, light: "day" },   // kitchen table: toast shoots at the lens; snap to the glowing bulb
  { id: 8, s0: 10, s1: 10, light: "day" }, // the clock on the table: hands racing, it jumps at the lens
  { id: 9, s0: 11, s1: 12, light: "day" }, // post clock wired to a socket: orbit; the pulses run up the wire, a tick for each
  { id: 10, s0: 13, s1: 13, light: "day" }, // the drummer keeping time
  { id: 11, s0: 14, s1: 15, light: "day" }, // faster: the drummer flails; the clock's hands spin, +12 MIN
  { id: 12, s0: 16, s1: 16, light: "day" }, // tracking beside people walking with their clocks; then they march at the lens
  { id: 13, s0: 17, s1: 17, light: "day" }, // the depot: worker at the bench, clocks fly back out at the lens; crane out
  { id: 14, s0: 18, s1: 18, light: "day" }, // dive from high over the meadow toward the field of clocks
  { id: 15, s0: 19, s1: 19, light: "day" }, // rising orbit over the field of clocks, 475,000
  { id: 16, s0: 20, s1: 20, light: "day" }, // low wide slide along the row of refrigerators, 58,000
  { id: 17, s0: 21, s1: 22, light: "day" }, // the power company boss: bill notes fly at the lens; the cash slides away from him
  { id: 18, s0: 23, s1: 24, light: "day" }, // the old generator and its 50 board; the engineer who picked it; back to the hook frame
];
export const SHOTS: ShotDef[] = raw.map((s, i) => ({
  ...s,
  a: i === 0 ? 0 : Math.round(SEG_TIMES[s.s0][0] * FPS) - 2, // cuts land ~2 f before the line
  b: i === raw.length - 1 ? TOTAL : Math.round(SEG_TIMES[raw[i + 1].s0][0] * FPS) - 2,
}));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** crossfades (frames): hard cuts everywhere */
export const XFADE: Record<number, number> = {};
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
/** frame of a word's onset inside a segment (first match of `w`, case-insensitive), for reaction timing */
const norm = (s: string) => s.toLowerCase().replace(/[^\w.]/g, "").replace(/\.+$/, "");
export const wordAt = (seg: number, w: string, fallbackU = 0.5) => {
  const ws = words().filter((x) => x.seg === seg), k = norm(w);
  const hit = ws.find((x) => norm(x.w) === k) ?? ws.find((x) => norm(x.w).startsWith(k));
  const [a, b] = SEG_TIMES[seg];
  return Math.round((hit ? hit.s : a + (b - a) * fallbackU) * FPS);
};
