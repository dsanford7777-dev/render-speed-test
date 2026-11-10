// "The Pig War" (Paradox Town #4): script, timing and shots.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates at ~3.7 spoken
// words/s; scripts/align.py rewrites SEG_TIMES and WORDS from the voice, and shots, cameras and captions follow.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "In eighteen fifty-nine, America and Britain nearly went to war over one pig.", show: "In 1859, America and Britain nearly went to war over one pig." },
  { say: "On an island both countries claimed,", show: "On an island both countries claimed," },
  { say: "an American farmer shot a British pig for eating his potatoes.", show: "an American farmer shot a British pig for eating his potatoes." },
  { say: "Britain threatened to arrest him.", show: "Britain threatened to arrest him." },
  { say: "So America sent soldiers.", show: "So America sent soldiers." },
  { say: "Britain sent warships.", show: "Britain sent warships." },
  { say: "Within two months, four hundred sixty-one American soldiers and fourteen cannons", show: "Within 2 months, 461 American soldiers and 14 cannons" },
  { say: "faced more than two thousand British troops.", show: "faced more than 2,000 British troops." },
  { say: "The British governor ordered troops ashore.", show: "The British governor ordered troops ashore." },
  { say: "But the admiral refused.", show: "But the admiral refused." },
  { say: "He would not start a war between two great nations over a pig.", show: "He would not start a war between two great nations over a pig." },
  { say: "So both armies just stayed, sharing the island, for twelve years.", show: "So both armies just stayed, sharing the island, for 12 years." },
  { say: "Finally they asked the German emperor to decide.", show: "Finally they asked the German emperor to decide." },
  { say: "In eighteen seventy-two, he gave the island to America.", show: "In 1872, he gave the island to America." },
  { say: "The only casualty of the entire war?", show: "The only casualty of the entire war?" },
  { say: "The pig.", show: "The pig." },
];

const WPS = 3.7, PAUSE = 0.32;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0.0, 4.92], [5.46, 7.12], [7.46, 10.64], [11.28, 12.7], [13.08, 14.76], [15.3, 16.42], [17.02, 21.58], [21.58, 24.12], [24.12, 26.4], [26.86, 28.0], [28.5, 32.02], [32.62, 36.72], [37.38, 39.7], [40.08, 42.66], [43.12, 44.82], [45.26, 45.66]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 1.0) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = [{"w": "In", "s": 0.0, "e": 0.12, "seg": 0}, {"w": "1859,", "s": 0.12, "e": 1.2, "seg": 0}, {"w": "America", "s": 1.6, "e": 1.8, "seg": 0}, {"w": "and", "s": 1.8, "e": 2.12, "seg": 0}, {"w": "Britain", "s": 2.12, "e": 2.38, "seg": 0}, {"w": "nearly", "s": 2.38, "e": 2.78, "seg": 0}, {"w": "went", "s": 2.78, "e": 3.06, "seg": 0}, {"w": "to", "s": 3.06, "e": 3.24, "seg": 0}, {"w": "war", "s": 3.24, "e": 3.66, "seg": 0}, {"w": "over", "s": 3.66, "e": 4.02, "seg": 0}, {"w": "one", "s": 4.02, "e": 4.46, "seg": 0}, {"w": "pig.", "s": 4.46, "e": 4.92, "seg": 0}, {"w": "On", "s": 5.46, "e": 5.54, "seg": 1}, {"w": "an", "s": 5.52, "e": 5.68, "seg": 1}, {"w": "island", "s": 5.68, "e": 5.98, "seg": 1}, {"w": "both", "s": 5.98, "e": 6.32, "seg": 1}, {"w": "countries", "s": 6.32, "e": 6.68, "seg": 1}, {"w": "claimed,", "s": 6.68, "e": 7.12, "seg": 1}, {"w": "an", "s": 7.46, "e": 7.56, "seg": 2}, {"w": "American", "s": 7.56, "e": 7.92, "seg": 2}, {"w": "farmer", "s": 7.92, "e": 8.32, "seg": 2}, {"w": "shot", "s": 8.32, "e": 8.68, "seg": 2}, {"w": "a", "s": 8.68, "e": 8.94, "seg": 2}, {"w": "British", "s": 8.94, "e": 9.18, "seg": 2}, {"w": "pig", "s": 9.18, "e": 9.5, "seg": 2}, {"w": "for", "s": 9.5, "e": 9.74, "seg": 2}, {"w": "eating", "s": 9.74, "e": 9.96, "seg": 2}, {"w": "his", "s": 9.96, "e": 10.16, "seg": 2}, {"w": "potatoes.", "s": 10.16, "e": 10.64, "seg": 2}, {"w": "Britain", "s": 11.28, "e": 11.46, "seg": 3}, {"w": "threatened", "s": 11.46, "e": 11.82, "seg": 3}, {"w": "to", "s": 11.82, "e": 12.08, "seg": 3}, {"w": "arrest", "s": 12.08, "e": 12.42, "seg": 3}, {"w": "him.", "s": 12.42, "e": 12.7, "seg": 3}, {"w": "So", "s": 13.08, "e": 13.26, "seg": 4}, {"w": "America", "s": 13.26, "e": 13.84, "seg": 4}, {"w": "sent", "s": 13.84, "e": 14.24, "seg": 4}, {"w": "soldiers.", "s": 14.24, "e": 14.76, "seg": 4}, {"w": "Britain", "s": 15.3, "e": 15.5, "seg": 5}, {"w": "sent", "s": 15.5, "e": 15.88, "seg": 5}, {"w": "warships.", "s": 15.88, "e": 16.42, "seg": 5}, {"w": "Within", "s": 17.02, "e": 17.18, "seg": 6}, {"w": "2", "s": 17.18, "e": 17.54, "seg": 6}, {"w": "months,", "s": 17.54, "e": 17.92, "seg": 6}, {"w": "461", "s": 18.14, "e": 19.34, "seg": 6}, {"w": "American", "s": 19.34, "e": 19.68, "seg": 6}, {"w": "soldiers", "s": 19.68, "e": 20.14, "seg": 6}, {"w": "and", "s": 20.14, "e": 20.48, "seg": 6}, {"w": "14", "s": 20.48, "e": 21.04, "seg": 6}, {"w": "cannons", "s": 21.04, "e": 21.58, "seg": 6}, {"w": "faced", "s": 21.58, "e": 22.06, "seg": 7}, {"w": "more", "s": 22.06, "e": 22.3, "seg": 7}, {"w": "than", "s": 22.3, "e": 22.52, "seg": 7}, {"w": "2,000", "s": 22.52, "e": 23.34, "seg": 7}, {"w": "British", "s": 23.34, "e": 23.76, "seg": 7}, {"w": "troops.", "s": 23.76, "e": 24.12, "seg": 7}, {"w": "The", "s": 24.12, "e": 24.68, "seg": 8}, {"w": "British", "s": 24.68, "e": 24.92, "seg": 8}, {"w": "governor", "s": 24.92, "e": 25.26, "seg": 8}, {"w": "ordered", "s": 25.26, "e": 25.62, "seg": 8}, {"w": "troops", "s": 25.62, "e": 26.02, "seg": 8}, {"w": "ashore.", "s": 26.02, "e": 26.4, "seg": 8}, {"w": "But", "s": 26.86, "e": 26.94, "seg": 9}, {"w": "the", "s": 26.9, "e": 27.02, "seg": 9}, {"w": "admiral", "s": 27.02, "e": 27.46, "seg": 9}, {"w": "refused.", "s": 27.46, "e": 28.0, "seg": 9}, {"w": "He", "s": 28.5, "e": 28.6, "seg": 10}, {"w": "would", "s": 28.6, "e": 28.74, "seg": 10}, {"w": "not", "s": 28.74, "e": 29.02, "seg": 10}, {"w": "start", "s": 29.02, "e": 29.32, "seg": 10}, {"w": "a", "s": 29.32, "e": 29.48, "seg": 10}, {"w": "war", "s": 29.48, "e": 29.66, "seg": 10}, {"w": "between", "s": 29.66, "e": 29.98, "seg": 10}, {"w": "two", "s": 29.98, "e": 30.32, "seg": 10}, {"w": "great", "s": 30.32, "e": 30.74, "seg": 10}, {"w": "nations", "s": 30.74, "e": 31.16, "seg": 10}, {"w": "over", "s": 31.16, "e": 31.54, "seg": 10}, {"w": "a", "s": 31.54, "e": 31.82, "seg": 10}, {"w": "pig.", "s": 31.82, "e": 32.02, "seg": 10}, {"w": "So", "s": 32.62, "e": 32.78, "seg": 11}, {"w": "both", "s": 32.78, "e": 33.18, "seg": 11}, {"w": "armies", "s": 33.18, "e": 33.44, "seg": 11}, {"w": "just", "s": 33.44, "e": 33.74, "seg": 11}, {"w": "stayed,", "s": 33.74, "e": 34.14, "seg": 11}, {"w": "sharing", "s": 34.48, "e": 34.82, "seg": 11}, {"w": "the", "s": 34.82, "e": 35.02, "seg": 11}, {"w": "island,", "s": 35.02, "e": 35.28, "seg": 11}, {"w": "for", "s": 35.5, "e": 35.72, "seg": 11}, {"w": "12", "s": 35.72, "e": 36.16, "seg": 11}, {"w": "years.", "s": 36.16, "e": 36.72, "seg": 11}, {"w": "Finally", "s": 37.38, "e": 37.6, "seg": 12}, {"w": "they", "s": 37.6, "e": 37.92, "seg": 12}, {"w": "asked", "s": 37.92, "e": 38.18, "seg": 12}, {"w": "the", "s": 38.18, "e": 38.36, "seg": 12}, {"w": "German", "s": 38.36, "e": 38.68, "seg": 12}, {"w": "emperor", "s": 38.68, "e": 39.04, "seg": 12}, {"w": "to", "s": 39.04, "e": 39.34, "seg": 12}, {"w": "decide.", "s": 39.34, "e": 39.7, "seg": 12}, {"w": "In", "s": 40.08, "e": 40.2, "seg": 13}, {"w": "1872,", "s": 40.2, "e": 41.16, "seg": 13}, {"w": "he", "s": 41.34, "e": 41.52, "seg": 13}, {"w": "gave", "s": 41.52, "e": 41.7, "seg": 13}, {"w": "the", "s": 41.7, "e": 41.86, "seg": 13}, {"w": "island", "s": 41.86, "e": 42.08, "seg": 13}, {"w": "to", "s": 42.08, "e": 42.28, "seg": 13}, {"w": "America.", "s": 42.28, "e": 42.66, "seg": 13}, {"w": "The", "s": 43.12, "e": 43.22, "seg": 14}, {"w": "only", "s": 43.22, "e": 43.42, "seg": 14}, {"w": "casualty", "s": 43.42, "e": 43.82, "seg": 14}, {"w": "of", "s": 43.82, "e": 44.1, "seg": 14}, {"w": "the", "s": 44.1, "e": 44.18, "seg": 14}, {"w": "entire", "s": 44.18, "e": 44.5, "seg": 14}, {"w": "war?", "s": 44.5, "e": 44.82, "seg": 14}, {"w": "The", "s": 45.26, "e": 45.46, "seg": 15}, {"w": "pig.", "s": 45.46, "e": 45.66, "seg": 15}];
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
  { id: 1, s0: 0, s1: 0, light: "day" },      // hook: the pig between two armies, a warship behind; punch in on "pig"
  { id: 2, s0: 1, s1: 1, light: "day" },      // the island: two flags on one hill, glide between them
  { id: 3, s0: 2, s1: 2, light: "day" },      // pig in the potato patch, the farmer with his rifle; BANG on "shot"
  { id: 4, s0: 3, s1: 3, light: "day" },      // British officer with an ARREST ORDER board, nervous farmer
  { id: 5, s0: 4, s1: 4, light: "day" },      // US soldiers march past with the flag
  { id: 6, s0: 5, s1: 5, light: "day" },      // low over the water: a British warship sails in
  { id: 7, s0: 6, s1: 6, light: "day" },      // the "461" board pops up beside the US line and cannons
  { id: 8, s0: 7, s1: 7, light: "day" },      // the "2,140" board pops up beside the redcoats
  { id: 9, s0: 8, s1: 8, light: "golden" },   // the governor points at the island, the ship behind him
  { id: 10, s0: 9, s1: 9, light: "golden" },  // the admiral shakes his head; "NO" board
  { id: 11, s0: 10, s1: 10, light: "golden" }, // the pig with a "WAR? OVER A PIG?" board
  { id: 12, s0: 11, s1: 11, light: "day" },   // two camps on one meadow; the year counter runs 1860 -> 1871
  { id: 13, s0: 12, s1: 12, light: "day" },   // the Kaiser in the hall under the ARBITRATION board
  { id: 14, s0: 13, s1: 13, light: "day" },   // the flag on the hill: Britain's comes down, America's goes up on "America"
  { id: 15, s0: 14, s1: 14, light: "day" }, // crane over the empty field toward a little grave
  { id: 16, s0: 15, s1: 15, light: "day" }, // "The pig.": the grave, punch in
];
export const SHOTS: ShotDef[] = raw.map((s, i) => ({
  ...s,
  a: i === 0 ? 0 : Math.round(SEG_TIMES[s.s0][0] * FPS) - 2, // cuts land ~2 f before the line
  b: i === raw.length - 1 ? TOTAL : Math.round(SEG_TIMES[raw[i + 1].s0][0] * FPS) - 2,
}));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** crossfades (frames): hard cuts everywhere except the time jump into the long wait and the ending */
export const XFADE: Record<number, number> = { 12: 6, 15: 8 };
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
