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
export const SEG_TIMES: [number, number][] = [[0.0, 2.66], [3.24, 5.24], [5.72, 7.76], [8.12, 9.62], [10.14, 10.64], [11.16, 12.32], [12.66, 14.86], [15.32, 16.3], [16.9, 17.62], [18.08, 18.82], [19.44, 20.2], [20.64, 22.86], [23.08, 24.56], [24.74, 25.98], [26.36, 27.12], [27.32, 29.32], [29.8, 31.48], [31.9, 34.0], [34.54, 36.34], [36.88, 39.08], [39.46, 40.86], [41.16, 43.42], [43.7, 46.06], [46.4, 47.78], [48.1, 49.68]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 1.0) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = [{"w": "An", "s": 0.0, "e": 0.18, "seg": 0}, {"w": "entire", "s": 0.18, "e": 0.6, "seg": 0}, {"w": "city", "s": 0.6, "e": 1.02, "seg": 0}, {"w": "once", "s": 1.02, "e": 1.32, "seg": 0}, {"w": "had", "s": 1.32, "e": 1.5, "seg": 0}, {"w": "to", "s": 1.5, "e": 1.64, "seg": 0}, {"w": "hand", "s": 1.64, "e": 1.84, "seg": 0}, {"w": "over", "s": 1.84, "e": 2.08, "seg": 0}, {"w": "its", "s": 2.08, "e": 2.28, "seg": 0}, {"w": "clocks.", "s": 2.28, "e": 2.66, "seg": 0}, {"w": "You", "s": 3.24, "e": 3.32, "seg": 1}, {"w": "see,", "s": 3.32, "e": 3.46, "seg": 1}, {"w": "the", "s": 3.76, "e": 3.88, "seg": 1}, {"w": "power", "s": 3.88, "e": 4.16, "seg": 1}, {"w": "in", "s": 4.16, "e": 4.34, "seg": 1}, {"w": "your", "s": 4.34, "e": 4.48, "seg": 1}, {"w": "wall", "s": 4.48, "e": 4.74, "seg": 1}, {"w": "pulses.", "s": 4.74, "e": 5.24, "seg": 1}, {"w": "In", "s": 5.72, "e": 5.84, "seg": 2}, {"w": "most", "s": 5.84, "e": 6.0, "seg": 2}, {"w": "of", "s": 6.0, "e": 6.16, "seg": 2}, {"w": "America,", "s": 6.16, "e": 6.42, "seg": 2}, {"w": "60", "s": 6.76, "e": 6.92, "seg": 2}, {"w": "times", "s": 6.92, "e": 7.32, "seg": 2}, {"w": "a", "s": 7.32, "e": 7.48, "seg": 2}, {"w": "second.", "s": 7.48, "e": 7.76, "seg": 2}, {"w": "But", "s": 8.12, "e": 8.3, "seg": 3}, {"w": "Los", "s": 8.3, "e": 8.42, "seg": 3}, {"w": "Angeles", "s": 8.42, "e": 8.86, "seg": 3}, {"w": "ran", "s": 8.86, "e": 9.16, "seg": 3}, {"w": "on", "s": 9.16, "e": 9.38, "seg": 3}, {"w": "50.", "s": 9.38, "e": 9.62, "seg": 3}, {"w": "Nobody", "s": 10.14, "e": 10.34, "seg": 4}, {"w": "cared.", "s": 10.34, "e": 10.64, "seg": 4}, {"w": "Then", "s": 11.16, "e": 11.36, "seg": 5}, {"w": "came", "s": 11.36, "e": 11.7, "seg": 5}, {"w": "Hoover", "s": 11.7, "e": 12.04, "seg": 5}, {"w": "Dam.", "s": 12.04, "e": 12.32, "seg": 5}, {"w": "All", "s": 12.66, "e": 12.94, "seg": 6}, {"w": "that", "s": 12.94, "e": 13.12, "seg": 6}, {"w": "new", "s": 13.12, "e": 13.32, "seg": 6}, {"w": "power,", "s": 13.32, "e": 13.66, "seg": 6}, {"w": "and", "s": 13.86, "e": 13.94, "seg": 6}, {"w": "it", "s": 13.9, "e": 14.02, "seg": 6}, {"w": "came", "s": 14.02, "e": 14.26, "seg": 6}, {"w": "at", "s": 14.26, "e": 14.52, "seg": 6}, {"w": "60.", "s": 14.52, "e": 14.86, "seg": 6}, {"w": "So", "s": 15.32, "e": 15.58, "seg": 7}, {"w": "the", "s": 15.58, "e": 15.84, "seg": 7}, {"w": "city", "s": 15.84, "e": 16.0, "seg": 7}, {"w": "switched.", "s": 16.0, "e": 16.3, "seg": 7}, {"w": "Toasters", "s": 16.9, "e": 17.14, "seg": 8}, {"w": "didn't", "s": 17.14, "e": 17.42, "seg": 8}, {"w": "mind.", "s": 17.42, "e": 17.62, "seg": 8}, {"w": "Light", "s": 18.08, "e": 18.16, "seg": 9}, {"w": "bulbs", "s": 18.12, "e": 18.26, "seg": 9}, {"w": "didn't", "s": 18.26, "e": 18.58, "seg": 9}, {"w": "mind.", "s": 18.58, "e": 18.82, "seg": 9}, {"w": "Clocks", "s": 19.44, "e": 19.66, "seg": 10}, {"w": "minded.", "s": 19.66, "e": 20.2, "seg": 10}, {"w": "You", "s": 20.64, "e": 20.72, "seg": 11}, {"w": "see,", "s": 20.7, "e": 20.88, "seg": 11}, {"w": "an", "s": 21.12, "e": 21.2, "seg": 11}, {"w": "electric", "s": 21.2, "e": 21.54, "seg": 11}, {"w": "clock", "s": 21.54, "e": 21.84, "seg": 11}, {"w": "doesn't", "s": 21.84, "e": 22.22, "seg": 11}, {"w": "keep", "s": 22.22, "e": 22.46, "seg": 11}, {"w": "time.", "s": 22.46, "e": 22.86, "seg": 11}, {"w": "It", "s": 23.08, "e": 23.24, "seg": 12}, {"w": "counts", "s": 23.24, "e": 23.52, "seg": 12}, {"w": "the", "s": 23.52, "e": 23.74, "seg": 12}, {"w": "pulses", "s": 23.74, "e": 24.0, "seg": 12}, {"w": "in", "s": 24.0, "e": 24.18, "seg": 12}, {"w": "the", "s": 24.18, "e": 24.3, "seg": 12}, {"w": "wall,", "s": 24.3, "e": 24.56, "seg": 12}, {"w": "like", "s": 24.74, "e": 24.82, "seg": 13}, {"w": "a", "s": 24.82, "e": 24.98, "seg": 13}, {"w": "drummer", "s": 24.98, "e": 25.18, "seg": 13}, {"w": "following", "s": 25.18, "e": 25.48, "seg": 13}, {"w": "the", "s": 25.48, "e": 25.72, "seg": 13}, {"w": "band.", "s": 25.72, "e": 25.98, "seg": 13}, {"w": "Speed", "s": 26.36, "e": 26.58, "seg": 14}, {"w": "up", "s": 26.58, "e": 26.7, "seg": 14}, {"w": "the", "s": 26.7, "e": 26.94, "seg": 14}, {"w": "band,", "s": 26.94, "e": 27.12, "seg": 14}, {"w": "and", "s": 27.32, "e": 27.4, "seg": 15}, {"w": "the", "s": 27.4, "e": 27.52, "seg": 15}, {"w": "clock", "s": 27.52, "e": 27.7, "seg": 15}, {"w": "gains", "s": 27.7, "e": 27.96, "seg": 15}, {"w": "12", "s": 27.96, "e": 28.3, "seg": 15}, {"w": "minutes", "s": 28.3, "e": 28.62, "seg": 15}, {"w": "every", "s": 28.62, "e": 29.0, "seg": 15}, {"w": "hour.", "s": 29.0, "e": 29.32, "seg": 15}, {"w": "So", "s": 29.8, "e": 29.92, "seg": 16}, {"w": "people", "s": 29.92, "e": 30.24, "seg": 16}, {"w": "carried", "s": 30.24, "e": 30.54, "seg": 16}, {"w": "their", "s": 30.54, "e": 30.74, "seg": 16}, {"w": "clocks", "s": 30.74, "e": 30.94, "seg": 16}, {"w": "to", "s": 30.94, "e": 31.14, "seg": 16}, {"w": "depots.", "s": 31.14, "e": 31.48, "seg": 16}, {"w": "Workers", "s": 31.9, "e": 32.08, "seg": 17}, {"w": "rebuilt", "s": 32.08, "e": 32.48, "seg": 17}, {"w": "them", "s": 32.48, "e": 32.72, "seg": 17}, {"w": "and", "s": 32.72, "e": 32.9, "seg": 17}, {"w": "sent", "s": 32.9, "e": 33.06, "seg": 17}, {"w": "them", "s": 33.06, "e": 33.24, "seg": 17}, {"w": "home", "s": 33.24, "e": 33.36, "seg": 17}, {"w": "within", "s": 33.36, "e": 33.64, "seg": 17}, {"w": "days.", "s": 33.64, "e": 34.0, "seg": 17}, {"w": "Then", "s": 34.54, "e": 34.68, "seg": 18}, {"w": "the", "s": 34.68, "e": 34.88, "seg": 18}, {"w": "rest", "s": 34.88, "e": 35.02, "seg": 18}, {"w": "of", "s": 35.02, "e": 35.2, "seg": 18}, {"w": "Southern", "s": 35.2, "e": 35.42, "seg": 18}, {"w": "California", "s": 35.42, "e": 35.8, "seg": 18}, {"w": "did", "s": 35.8, "e": 36.0, "seg": 18}, {"w": "it", "s": 36.0, "e": 36.14, "seg": 18}, {"w": "too.", "s": 36.14, "e": 36.34, "seg": 18}, {"w": "475,000", "s": 36.88, "e": 38.64, "seg": 19}, {"w": "clocks.", "s": 38.64, "e": 39.08, "seg": 19}, {"w": "58,000", "s": 39.46, "e": 40.2, "seg": 20}, {"w": "refrigerators.", "s": 40.2, "e": 40.86, "seg": 20}, {"w": "The", "s": 41.16, "e": 41.3, "seg": 21}, {"w": "bill:", "s": 41.3, "e": 41.52, "seg": 21}, {"w": "$34", "s": 41.94, "e": 42.48, "seg": 21}, {"w": "million.", "s": 42.48, "e": 42.92, "seg": 21}, {"w": "A", "s": 43.7, "e": 43.86, "seg": 22}, {"w": "third", "s": 43.86, "e": 44.14, "seg": 22}, {"w": "of", "s": 44.14, "e": 44.32, "seg": 22}, {"w": "everything", "s": 44.32, "e": 44.72, "seg": 22}, {"w": "the", "s": 44.72, "e": 44.92, "seg": 22}, {"w": "power", "s": 44.92, "e": 45.1, "seg": 22}, {"w": "company", "s": 45.1, "e": 45.32, "seg": 22}, {"w": "made", "s": 45.32, "e": 45.64, "seg": 22}, {"w": "that", "s": 45.64, "e": 45.84, "seg": 22}, {"w": "year.", "s": 45.84, "e": 46.06, "seg": 22}, {"w": "All", "s": 46.4, "e": 46.56, "seg": 23}, {"w": "because,", "s": 46.56, "e": 46.9, "seg": 23}, {"w": "decades", "s": 47.12, "e": 47.26, "seg": 23}, {"w": "earlier,", "s": 47.26, "e": 47.78, "seg": 23}, {"w": "someone", "s": 48.1, "e": 48.24, "seg": 24}, {"w": "picked", "s": 48.24, "e": 48.46, "seg": 24}, {"w": "50", "s": 48.46, "e": 48.88, "seg": 24}, {"w": "instead", "s": 48.88, "e": 49.34, "seg": 24}, {"w": "of", "s": 49.34, "e": 49.5, "seg": 24}, {"w": "60.", "s": 49.5, "e": 49.68, "seg": 24}];
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
