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
export const SEG_TIMES: [number, number][] = [[0.0, 2.6], [3.42, 5.44], [5.94, 9.14], [9.6, 11.5], [11.86, 13.64], [14.02, 15.66], [15.96, 19.38], [19.72, 21.5], [22.08, 23.44], [23.94, 24.94], [24.94, 27.54], [28.22, 29.54], [30.0, 34.24], [34.64, 36.02], [36.56, 39.9], [40.22, 42.28], [42.62, 45.72]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 0.9) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = [{"w": "Everyone", "s": 0.0, "e": 0.32, "seg": 0}, {"w": "thinks", "s": 0.32, "e": 0.6, "seg": 0}, {"w": "daylight", "s": 0.6, "e": 0.96, "seg": 0}, {"w": "saving", "s": 0.96, "e": 1.34, "seg": 0}, {"w": "time", "s": 1.34, "e": 1.66, "seg": 0}, {"w": "was", "s": 1.66, "e": 1.82, "seg": 0}, {"w": "made", "s": 1.82, "e": 1.98, "seg": 0}, {"w": "for", "s": 1.98, "e": 2.22, "seg": 0}, {"w": "farmers.", "s": 2.22, "e": 2.6, "seg": 0}, {"w": "Farmers", "s": 3.42, "e": 3.5, "seg": 1}, {"w": "hated", "s": 3.42, "e": 3.66, "seg": 1}, {"w": "it", "s": 3.66, "e": 3.86, "seg": 1}, {"w": "so", "s": 3.86, "e": 4.18, "seg": 1}, {"w": "much,", "s": 4.18, "e": 4.52, "seg": 1}, {"w": "they", "s": 4.62, "e": 4.78, "seg": 1}, {"w": "got", "s": 4.78, "e": 4.92, "seg": 1}, {"w": "it", "s": 4.92, "e": 5.08, "seg": 1}, {"w": "banned.", "s": 5.08, "e": 5.44, "seg": 1}, {"w": "You", "s": 5.94, "e": 6.04, "seg": 2}, {"w": "see,", "s": 6.04, "e": 6.2, "seg": 2}, {"w": "it", "s": 6.4, "e": 6.54, "seg": 2}, {"w": "started", "s": 6.54, "e": 6.8, "seg": 2}, {"w": "in", "s": 6.8, "e": 7.08, "seg": 2}, {"w": "1916,", "s": 7.08, "e": 7.94, "seg": 2}, {"w": "in", "s": 8.22, "e": 8.32, "seg": 2}, {"w": "wartime", "s": 8.32, "e": 8.66, "seg": 2}, {"w": "Germany.", "s": 8.66, "e": 9.14, "seg": 2}, {"w": "Moving", "s": 9.6, "e": 9.78, "seg": 3}, {"w": "the", "s": 9.78, "e": 10.04, "seg": 3}, {"w": "clocks", "s": 10.04, "e": 10.22, "seg": 3}, {"w": "saved", "s": 10.22, "e": 10.6, "seg": 3}, {"w": "coal", "s": 10.6, "e": 10.92, "seg": 3}, {"w": "for", "s": 10.92, "e": 11.14, "seg": 3}, {"w": "the", "s": 11.14, "e": 11.26, "seg": 3}, {"w": "war.", "s": 11.26, "e": 11.5, "seg": 3}, {"w": "America", "s": 11.86, "e": 12.2, "seg": 4}, {"w": "copied", "s": 12.2, "e": 12.56, "seg": 4}, {"w": "it", "s": 12.56, "e": 12.76, "seg": 4}, {"w": "in", "s": 12.76, "e": 12.88, "seg": 4}, {"w": "1918.", "s": 12.88, "e": 13.64, "seg": 4}, {"w": "But", "s": 14.02, "e": 14.26, "seg": 5}, {"w": "cows", "s": 14.26, "e": 14.66, "seg": 5}, {"w": "don't", "s": 14.66, "e": 15.02, "seg": 5}, {"w": "read", "s": 15.02, "e": 15.24, "seg": 5}, {"w": "clocks.", "s": 15.24, "e": 15.66, "seg": 5}, {"w": "The", "s": 15.96, "e": 16.1, "seg": 6}, {"w": "dew", "s": 16.1, "e": 16.36, "seg": 6}, {"w": "still", "s": 16.36, "e": 16.68, "seg": 6}, {"w": "sat", "s": 16.68, "e": 16.92, "seg": 6}, {"w": "on", "s": 16.92, "e": 17.1, "seg": 6}, {"w": "the", "s": 17.1, "e": 17.22, "seg": 6}, {"w": "hay,", "s": 17.22, "e": 17.42, "seg": 6}, {"w": "and", "s": 17.64, "e": 17.72, "seg": 6}, {"w": "the", "s": 17.7, "e": 17.78, "seg": 6}, {"w": "milk", "s": 17.76, "e": 17.96, "seg": 6}, {"w": "train", "s": 17.96, "e": 18.22, "seg": 6}, {"w": "now", "s": 18.22, "e": 18.44, "seg": 6}, {"w": "came", "s": 18.44, "e": 18.64, "seg": 6}, {"w": "an", "s": 18.64, "e": 18.82, "seg": 6}, {"w": "hour", "s": 18.82, "e": 18.98, "seg": 6}, {"w": "early.", "s": 18.98, "e": 19.38, "seg": 6}, {"w": "So", "s": 19.72, "e": 19.88, "seg": 7}, {"w": "farmers", "s": 19.88, "e": 20.18, "seg": 7}, {"w": "pushed", "s": 20.18, "e": 20.56, "seg": 7}, {"w": "Congress", "s": 20.56, "e": 20.82, "seg": 7}, {"w": "to", "s": 20.82, "e": 21.14, "seg": 7}, {"w": "kill", "s": 21.14, "e": 21.32, "seg": 7}, {"w": "it.", "s": 21.32, "e": 21.5, "seg": 7}, {"w": "President", "s": 22.08, "e": 22.16, "seg": 8}, {"w": "Wilson", "s": 22.08, "e": 22.48, "seg": 8}, {"w": "vetoed", "s": 22.48, "e": 22.9, "seg": 8}, {"w": "the", "s": 22.9, "e": 23.14, "seg": 8}, {"w": "repeal.", "s": 23.14, "e": 23.44, "seg": 8}, {"w": "Congress", "s": 23.94, "e": 24.16, "seg": 9}, {"w": "overrode", "s": 24.16, "e": 24.58, "seg": 9}, {"w": "him", "s": 24.58, "e": 24.7, "seg": 9}, {"w": "anyway.", "s": 24.7, "e": 24.94, "seg": 9}, {"w": "So", "s": 24.94, "e": 25.58, "seg": 10}, {"w": "who", "s": 25.58, "e": 25.96, "seg": 10}, {"w": "brought", "s": 25.96, "e": 26.14, "seg": 10}, {"w": "it", "s": 26.14, "e": 26.3, "seg": 10}, {"w": "back,", "s": 26.3, "e": 26.6, "seg": 10}, {"w": "and", "s": 26.88, "e": 27.0, "seg": 10}, {"w": "made", "s": 27.0, "e": 27.14, "seg": 10}, {"w": "it", "s": 27.14, "e": 27.28, "seg": 10}, {"w": "longer?", "s": 27.28, "e": 27.54, "seg": 10}, {"w": "Shops,", "s": 28.22, "e": 28.42, "seg": 11}, {"w": "golf,", "s": 28.74, "e": 28.84, "seg": 11}, {"w": "and", "s": 29.16, "e": 29.28, "seg": 11}, {"w": "barbecue.", "s": 29.28, "e": 29.54, "seg": 11}, {"w": "The", "s": 30.0, "e": 30.08, "seg": 12}, {"w": "golf", "s": 30.08, "e": 30.32, "seg": 12}, {"w": "industry", "s": 30.32, "e": 30.64, "seg": 12}, {"w": "told", "s": 30.64, "e": 30.94, "seg": 12}, {"w": "Congress", "s": 30.94, "e": 31.26, "seg": 12}, {"w": "one", "s": 31.26, "e": 31.62, "seg": 12}, {"w": "extra", "s": 31.62, "e": 31.9, "seg": 12}, {"w": "month", "s": 31.9, "e": 32.16, "seg": 12}, {"w": "was", "s": 32.16, "e": 32.36, "seg": 12}, {"w": "worth", "s": 32.36, "e": 32.58, "seg": 12}, {"w": "$200", "s": 32.58, "e": 33.26, "seg": 12}, {"w": "million.", "s": 33.26, "e": 33.68, "seg": 12}, {"w": "And", "s": 34.64, "e": 34.72, "seg": 13}, {"w": "candy", "s": 34.72, "e": 35.0, "seg": 13}, {"w": "makers", "s": 35.0, "e": 35.3, "seg": 13}, {"w": "wanted", "s": 35.3, "e": 35.62, "seg": 13}, {"w": "Halloween.", "s": 35.62, "e": 36.02, "seg": 13}, {"w": "Lobbyists", "s": 36.56, "e": 36.92, "seg": 14}, {"w": "reportedly", "s": 36.92, "e": 37.42, "seg": 14}, {"w": "left", "s": 37.42, "e": 37.68, "seg": 14}, {"w": "a", "s": 37.68, "e": 37.86, "seg": 14}, {"w": "candy", "s": 37.86, "e": 38.18, "seg": 14}, {"w": "pumpkin", "s": 38.18, "e": 38.6, "seg": 14}, {"w": "on", "s": 38.6, "e": 38.82, "seg": 14}, {"w": "every", "s": 38.82, "e": 39.2, "seg": 14}, {"w": "senator's", "s": 39.2, "e": 39.7, "seg": 14}, {"w": "seat.", "s": 39.7, "e": 39.9, "seg": 14}, {"w": "In", "s": 40.22, "e": 40.32, "seg": 15}, {"w": "2005,", "s": 40.66, "e": 41.06, "seg": 15}, {"w": "they", "s": 41.3, "e": 41.42, "seg": 15}, {"w": "finally", "s": 41.42, "e": 41.76, "seg": 15}, {"w": "got", "s": 41.76, "e": 42.08, "seg": 15}, {"w": "it.", "s": 42.08, "e": 42.28, "seg": 15}, {"w": "So", "s": 42.62, "e": 42.78, "seg": 16}, {"w": "next", "s": 42.78, "e": 43.04, "seg": 16}, {"w": "time", "s": 43.04, "e": 43.3, "seg": 16}, {"w": "you", "s": 43.3, "e": 43.52, "seg": 16}, {"w": "lose", "s": 43.52, "e": 43.7, "seg": 16}, {"w": "an", "s": 43.7, "e": 43.84, "seg": 16}, {"w": "hour", "s": 43.84, "e": 44.0, "seg": 16}, {"w": "of", "s": 44.0, "e": 44.16, "seg": 16}, {"w": "sleep...", "s": 44.16, "e": 45.02, "seg": 16}, {"w": "thank", "s": 45.02, "e": 45.1, "seg": 16}, {"w": "a", "s": 45.04, "e": 45.22, "seg": 16}, {"w": "candy", "s": 45.22, "e": 45.44, "seg": 16}, {"w": "pumpkin.", "s": 45.44, "e": 45.72, "seg": 16}];
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
