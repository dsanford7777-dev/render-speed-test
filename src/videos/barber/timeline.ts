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
