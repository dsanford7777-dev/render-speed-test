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
