// "Thank a Candy Pumpkin" (daylight saving time): script, timing and shots.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates at ~3.7 spoken
// words/s; scripts/align.py rewrites SEG_TIMES from the ElevenLabs word timestamps, and the shots, cameras and
// captions follow automatically (camera keys are fractions of their shot).
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "Everyone thinks daylight saving time was made for farmers.", show: "Everyone thinks daylight saving time was made for farmers." },
  { say: "Farmers hated it so much, they got it banned.", show: "Farmers hated it so much, they got it banned." },
  { say: "You see, it started in nineteen sixteen, in wartime Germany.", show: "You see, it started in 1916, in wartime Germany." },
  { say: "Moving the clocks saved coal for the war.", show: "Moving the clocks saved coal for the war." },
  { say: "America copied it in nineteen eighteen.", show: "America copied it in 1918." },
  { say: "But cows don't read clocks.", show: "But cows don't read clocks." },
  { say: "The dew still sat on the hay, and the milk train now came an hour early.", show: "The dew still sat on the hay, and the milk train now came an hour early." },
  { say: "So farmers pushed Congress to kill it.", show: "So farmers pushed Congress to kill it." },
  { say: "President Wilson vetoed the repeal.", show: "President Wilson vetoed the repeal." },
  { say: "Congress overrode him anyway.", show: "Congress overrode him anyway." },
  { say: "So who brought it back, and made it longer?", show: "So who brought it back, and made it longer?" },
  { say: "Shops, golf, and barbecue.", show: "Shops, golf, and barbecue." },
  { say: "The golf industry told Congress one extra month was worth two hundred million dollars.", show: "The golf industry told Congress one extra month was worth $200 million." },
  { say: "And candy makers wanted Halloween.", show: "And candy makers wanted Halloween." },
  { say: "Lobbyists reportedly left a candy pumpkin on every senator's seat.", show: "Lobbyists reportedly left a candy pumpkin on every senator's seat." },
  { say: "In two thousand five, they finally got it.", show: "In 2005, they finally got it." },
  { say: "So next time you lose an hour of sleep... thank a candy pumpkin.", show: "So next time you lose an hour of sleep... thank a candy pumpkin." },
];

const WPS = 3.7, PAUSE = 0.32;
const spoken = (s: string) => s.split(/\s+/).filter(Boolean).length;
const pauses = (s: string) => (s.match(/\.\.\.|[.?!:]\s|[.?!]$/g) ?? []).length;
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0.0, 2.62], [3.42, 5.44], [5.94, 9.14], [9.6, 11.5], [11.86, 13.62], [14.02, 15.66], [15.96, 19.38], [19.72, 21.5], [22.08, 23.44], [23.94, 24.94], [24.94, 27.54], [28.22, 29.56], [30.0, 34.24], [34.64, 36.02], [36.56, 39.9], [40.22, 42.28], [42.62, 45.72]];
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

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night";
export type SetId = "farm" | "shop" | "street" | "chamber";
/** a shot spans whole segments [s0, s1] (inclusive) */
export type ShotDef = { id: number; s0: number; s1: number; light: Light; set: SetId; a: number; b: number };
const raw: Omit<ShotDef, "a" | "b">[] = [
  { id: 1, s0: 0, s1: 0, light: "day", set: "farm" },        // hook: angry farmer + pitchfork glaring at the farm clock
  { id: 2, s0: 1, s1: 1, light: "day", set: "farm" },        // wider: the clock gets a BANNED stamp on "banned"
  { id: 3, s0: 2, s1: 2, light: "night", set: "shop" },      // "You see": 1916, wartime workshop, coal by the stove
  { id: 4, s0: 3, s1: 3, light: "night", set: "shop" },      // the wall clock jumps an hour, coal pile
  { id: 5, s0: 4, s1: 4, light: "golden", set: "street" },   // 1918: SAVE DAYLIGHT banner, people walk under it
  { id: 6, s0: 5, s1: 5, light: "day", set: "farm" },        // the cow stares at the clock
  { id: 7, s0: 6, s1: 6, light: "day", set: "farm" },        // dew on the hay -> MILK TRAIN 7:00 becomes 6:00
  { id: 8, s0: 7, s1: 7, light: "day", set: "chamber" },     // farmers with pitchforks storm Congress
  { id: 9, s0: 8, s1: 8, light: "day", set: "chamber" },     // the repeal paper gets VETOED
  { id: 10, s0: 9, s1: 9, light: "day", set: "chamber" },    // board flips to REPEALED! 1919, senators cheer
  { id: 11, s0: 10, s1: 10, light: "golden", set: "street" }, // helper shrugs at the street clock
  { id: 12, s0: 11, s1: 11, light: "golden", set: "street" }, // shops, golf, barbecue stalls, one per word
  { id: 13, s0: 12, s1: 12, light: "golden", set: "street" }, // golf green + $200,000,000 sign
  { id: 14, s0: 13, s1: 13, light: "golden", set: "street" }, // Halloween street: jack-o'-lanterns, kids
  { id: 15, s0: 14, s1: 14, light: "day", set: "chamber" },  // a candy pumpkin on every seat
  { id: 16, s0: 15, s1: 15, light: "golden", set: "street" }, // 2005: kids trick-or-treat in daylight
  { id: 17, s0: 16, s1: 16, light: "night", set: "street" }, // sleepy helper holds up a candy pumpkin
];
export const SHOTS: ShotDef[] = raw.map((s, i) => ({
  ...s,
  a: i === 0 ? 0 : Math.round(SEG_TIMES[s.s0][0] * FPS) - 2, // cuts land ~2 f before the line (reference)
  b: i === raw.length - 1 ? TOTAL : Math.round(SEG_TIMES[raw[i + 1].s0][0] * FPS) - 2,
}));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** crossfades (frames) where place or time of day changes */
export const XFADE: Record<number, number> = { 3: 8, 5: 8, 6: 6, 8: 6, 11: 6, 15: 6, 16: 6, 17: 8 };
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
