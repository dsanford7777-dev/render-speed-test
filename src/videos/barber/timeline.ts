// "Why Barber Poles Are Red and White" (Paradox Town #5): script, timing and shots.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates at ~3.7 spoken
// words/s; scripts/align.py rewrites SEG_TIMES and WORDS from the voice, and shots, cameras and captions follow.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "That spinning barber pole?", show: "That spinning barber pole?" },
  { say: "It started as an ad for blood.", show: "It started as an ad for blood." },
  { say: "For centuries, your barber was also your surgeon.", show: "For centuries, your barber was also your surgeon." },
  { say: "He'd cut your hair, pull your teeth, and drain your blood.", show: "He'd cut your hair, pull your teeth, and drain your blood." },
  { say: "You squeezed a wooden staff so your veins popped out.", show: "You squeezed a wooden staff so your veins popped out." },
  { say: "Then he cut one open.", show: "Then he cut one open." },
  { say: "The blood ran into a brass bowl.", show: "The blood ran into a brass bowl." },
  { say: "Barbers even put those bowls in their windows, as ads...", show: "Barbers even put those bowls in their windows, as ads..." },
  { say: "until London banned it.", show: "until London banned it." },
  { say: "Outside, they hung the washed bandages on the staff to dry.", show: "Outside, they hung the washed bandages on the staff to dry." },
  { say: "Still stained red, they twisted in the wind into a spiral.", show: "Still stained red, they twisted in the wind into a spiral." },
  { say: "The staff became the pole.", show: "The staff became the pole." },
  { say: "The bandages became the stripes.", show: "The bandages became the stripes." },
  { say: "And the ball on top?", show: "And the ball on top?" },
  { say: "That's the bowl.", show: "That's the bowl." },
  { say: "The blue stripe?", show: "The blue stripe?" },
  { say: "America most likely added it just to match the flag.", show: "America most likely added it just to match the flag." },
];

const WPS = 3.7, PAUSE = 0.32;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0.0, 1.3], [1.74, 3.56], [4.22, 7.18], [7.74, 10.76], [11.28, 14.08], [14.48, 15.66], [16.08, 17.9], [18.54, 22.1], [22.1, 23.2], [23.52, 26.84], [27.3, 30.66], [31.22, 32.56], [33.06, 34.52], [35.1, 35.92], [36.4, 36.96], [37.44, 38.02], [38.5, 40.98]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 1.0) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = [{"w": "That", "s": 0.0, "e": 0.22, "seg": 0}, {"w": "spinning", "s": 0.22, "e": 0.66, "seg": 0}, {"w": "barber", "s": 0.66, "e": 1.02, "seg": 0}, {"w": "pole?", "s": 1.02, "e": 1.3, "seg": 0}, {"w": "It", "s": 1.74, "e": 1.84, "seg": 1}, {"w": "started", "s": 1.84, "e": 2.18, "seg": 1}, {"w": "as", "s": 2.18, "e": 2.48, "seg": 1}, {"w": "an", "s": 2.48, "e": 2.64, "seg": 1}, {"w": "ad", "s": 2.64, "e": 2.82, "seg": 1}, {"w": "for", "s": 2.82, "e": 3.14, "seg": 1}, {"w": "blood.", "s": 3.14, "e": 3.56, "seg": 1}, {"w": "For", "s": 4.22, "e": 4.3, "seg": 2}, {"w": "centuries,", "s": 4.24, "e": 4.84, "seg": 2}, {"w": "your", "s": 5.18, "e": 5.28, "seg": 2}, {"w": "barber", "s": 5.28, "e": 5.8, "seg": 2}, {"w": "was", "s": 5.8, "e": 6.06, "seg": 2}, {"w": "also", "s": 6.06, "e": 6.52, "seg": 2}, {"w": "your", "s": 6.52, "e": 6.74, "seg": 2}, {"w": "surgeon.", "s": 6.74, "e": 7.18, "seg": 2}, {"w": "He'd", "s": 7.74, "e": 7.86, "seg": 3}, {"w": "cut", "s": 7.86, "e": 7.98, "seg": 3}, {"w": "your", "s": 7.98, "e": 8.16, "seg": 3}, {"w": "hair,", "s": 8.16, "e": 8.42, "seg": 3}, {"w": "pull", "s": 8.68, "e": 8.84, "seg": 3}, {"w": "your", "s": 8.84, "e": 9.04, "seg": 3}, {"w": "teeth,", "s": 9.04, "e": 9.38, "seg": 3}, {"w": "and", "s": 9.66, "e": 9.96, "seg": 3}, {"w": "drain", "s": 9.96, "e": 10.24, "seg": 3}, {"w": "your", "s": 10.24, "e": 10.44, "seg": 3}, {"w": "blood.", "s": 10.44, "e": 10.76, "seg": 3}, {"w": "You", "s": 11.28, "e": 11.38, "seg": 4}, {"w": "squeezed", "s": 11.38, "e": 11.72, "seg": 4}, {"w": "a", "s": 11.72, "e": 11.96, "seg": 4}, {"w": "wooden", "s": 11.96, "e": 12.22, "seg": 4}, {"w": "staff", "s": 12.22, "e": 12.66, "seg": 4}, {"w": "so", "s": 12.66, "e": 12.92, "seg": 4}, {"w": "your", "s": 12.92, "e": 13.08, "seg": 4}, {"w": "veins", "s": 13.08, "e": 13.42, "seg": 4}, {"w": "popped", "s": 13.42, "e": 13.74, "seg": 4}, {"w": "out.", "s": 13.74, "e": 14.08, "seg": 4}, {"w": "Then", "s": 14.48, "e": 14.7, "seg": 5}, {"w": "he", "s": 14.7, "e": 14.98, "seg": 5}, {"w": "cut", "s": 14.98, "e": 15.16, "seg": 5}, {"w": "one", "s": 15.16, "e": 15.34, "seg": 5}, {"w": "open.", "s": 15.34, "e": 15.66, "seg": 5}, {"w": "The", "s": 16.08, "e": 16.16, "seg": 6}, {"w": "blood", "s": 16.16, "e": 16.52, "seg": 6}, {"w": "ran", "s": 16.52, "e": 16.82, "seg": 6}, {"w": "into", "s": 16.82, "e": 17.08, "seg": 6}, {"w": "a", "s": 17.08, "e": 17.26, "seg": 6}, {"w": "brass", "s": 17.26, "e": 17.52, "seg": 6}, {"w": "bowl.", "s": 17.52, "e": 17.9, "seg": 6}, {"w": "Barbers", "s": 18.54, "e": 18.7, "seg": 7}, {"w": "even", "s": 18.7, "e": 18.9, "seg": 7}, {"w": "put", "s": 18.9, "e": 19.12, "seg": 7}, {"w": "those", "s": 19.12, "e": 19.38, "seg": 7}, {"w": "bowls", "s": 19.38, "e": 19.6, "seg": 7}, {"w": "in", "s": 19.6, "e": 19.82, "seg": 7}, {"w": "their", "s": 19.82, "e": 19.94, "seg": 7}, {"w": "windows,", "s": 19.94, "e": 20.38, "seg": 7}, {"w": "as", "s": 20.74, "e": 20.94, "seg": 7}, {"w": "ads...", "s": 20.94, "e": 22.1, "seg": 7}, {"w": "until", "s": 22.1, "e": 22.18, "seg": 8}, {"w": "London", "s": 22.1, "e": 22.48, "seg": 8}, {"w": "banned", "s": 22.48, "e": 22.8, "seg": 8}, {"w": "it.", "s": 22.8, "e": 23.2, "seg": 8}, {"w": "Outside,", "s": 23.52, "e": 23.94, "seg": 9}, {"w": "they", "s": 24.24, "e": 24.38, "seg": 9}, {"w": "hung", "s": 24.38, "e": 24.6, "seg": 9}, {"w": "the", "s": 24.6, "e": 24.8, "seg": 9}, {"w": "washed", "s": 24.8, "e": 25.1, "seg": 9}, {"w": "bandages", "s": 25.1, "e": 25.6, "seg": 9}, {"w": "on", "s": 25.6, "e": 25.82, "seg": 9}, {"w": "the", "s": 25.82, "e": 25.96, "seg": 9}, {"w": "staff", "s": 25.96, "e": 26.28, "seg": 9}, {"w": "to", "s": 26.28, "e": 26.5, "seg": 9}, {"w": "dry.", "s": 26.5, "e": 26.84, "seg": 9}, {"w": "Still", "s": 27.3, "e": 27.62, "seg": 10}, {"w": "stained", "s": 27.62, "e": 27.96, "seg": 10}, {"w": "red,", "s": 27.96, "e": 28.28, "seg": 10}, {"w": "they", "s": 28.6, "e": 28.7, "seg": 10}, {"w": "twisted", "s": 28.7, "e": 29.14, "seg": 10}, {"w": "in", "s": 29.14, "e": 29.36, "seg": 10}, {"w": "the", "s": 29.36, "e": 29.5, "seg": 10}, {"w": "wind", "s": 29.5, "e": 29.72, "seg": 10}, {"w": "into", "s": 29.72, "e": 30.02, "seg": 10}, {"w": "a", "s": 30.02, "e": 30.18, "seg": 10}, {"w": "spiral.", "s": 30.18, "e": 30.66, "seg": 10}, {"w": "The", "s": 31.22, "e": 31.3, "seg": 11}, {"w": "staff", "s": 31.24, "e": 31.64, "seg": 11}, {"w": "became", "s": 31.64, "e": 32.04, "seg": 11}, {"w": "the", "s": 32.04, "e": 32.26, "seg": 11}, {"w": "pole.", "s": 32.26, "e": 32.56, "seg": 11}, {"w": "The", "s": 33.06, "e": 33.14, "seg": 12}, {"w": "bandages", "s": 33.1, "e": 33.6, "seg": 12}, {"w": "became", "s": 33.6, "e": 34.02, "seg": 12}, {"w": "the", "s": 34.02, "e": 34.18, "seg": 12}, {"w": "stripes.", "s": 34.18, "e": 34.52, "seg": 12}, {"w": "And", "s": 35.1, "e": 35.18, "seg": 13}, {"w": "the", "s": 35.18, "e": 35.28, "seg": 13}, {"w": "ball", "s": 35.28, "e": 35.44, "seg": 13}, {"w": "on", "s": 35.44, "e": 35.66, "seg": 13}, {"w": "top?", "s": 35.66, "e": 35.92, "seg": 13}, {"w": "That's", "s": 36.4, "e": 36.6, "seg": 14}, {"w": "the", "s": 36.6, "e": 36.72, "seg": 14}, {"w": "bowl.", "s": 36.72, "e": 36.96, "seg": 14}, {"w": "The", "s": 37.44, "e": 37.54, "seg": 15}, {"w": "blue", "s": 37.54, "e": 37.7, "seg": 15}, {"w": "stripe?", "s": 37.7, "e": 38.02, "seg": 15}, {"w": "America", "s": 38.5, "e": 38.82, "seg": 16}, {"w": "most", "s": 38.82, "e": 39.1, "seg": 16}, {"w": "likely", "s": 39.1, "e": 39.44, "seg": 16}, {"w": "added", "s": 39.44, "e": 39.72, "seg": 16}, {"w": "it", "s": 39.72, "e": 39.96, "seg": 16}, {"w": "just", "s": 39.96, "e": 40.14, "seg": 16}, {"w": "to", "s": 40.14, "e": 40.32, "seg": 16}, {"w": "match", "s": 40.32, "e": 40.5, "seg": 16}, {"w": "the", "s": 40.5, "e": 40.72, "seg": 16}, {"w": "flag.", "s": 40.72, "e": 40.98, "seg": 16}];
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
  { id: 1, s0: 0, s1: 1, light: "day" },    // hook: the spinning red, white and blue pole on the street; punch in + shake on "blood"
  { id: 2, s0: 2, s1: 2, light: "day" },    // the barber in his shop; BARBER = SURGEON board on "surgeon"
  { id: 3, s0: 3, s1: 3, light: "day" },    // customer in the chair; HAIR / TEETH / BLOOD icons light up word by word
  { id: 4, s0: 4, s1: 4, light: "day" },    // close: the customer squeezes the wooden staff
  { id: 5, s0: 5, s1: 6, light: "day" },    // the brass bowl on the table: drops on "cut", it fills on "ran"
  { id: 6, s0: 7, s1: 8, light: "day" },    // street: bowls of blood in the shop window, a passer-by recoils; BANNED stamp
  { id: 7, s0: 9, s1: 9, light: "day" },    // the staff outside, bowl on top, washed bandages hanging to dry
  { id: 8, s0: 10, s1: 10, light: "day" },  // the bandages twist round the staff into a spiral
  { id: 9, s0: 11, s1: 11, light: "day" },  // dissolve: the staff becomes the red and white pole
  { id: 10, s0: 12, s1: 12, light: "day" }, // close on the stripes
  { id: 11, s0: 13, s1: 14, light: "day" }, // up to the ball on top; on "bowl" it turns back into the bowl
  { id: 12, s0: 15, s1: 16, light: "day" }, // the blue stripe arrives, the flag beside it; ends on the hook framing (loop)
];
export const SHOTS: ShotDef[] = raw.map((s, i) => ({
  ...s,
  a: i === 0 ? 0 : Math.round(SEG_TIMES[s.s0][0] * FPS) - 2, // cuts land ~2 f before the line
  b: i === raw.length - 1 ? TOTAL : Math.round(SEG_TIMES[raw[i + 1].s0][0] * FPS) - 2,
}));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** crossfades (frames): hard cuts everywhere except the staff turning into the pole */
export const XFADE: Record<number, number> = { 9: 10 };
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
