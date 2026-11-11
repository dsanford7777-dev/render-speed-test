// "The Man Who Sold the Eiffel Tower for Scrap" (Paradox Town #6): script, timing and shots.
// Everything is timed from SEGMENTS (seconds). Until the real narration exists these are estimates at ~3.7 spoken
// words/s; scripts/align.py rewrites SEG_TIMES and WORDS from the voice, and shots, cameras and captions follow.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "He sold the Eiffel Tower for scrap.", show: "He sold the Eiffel Tower for scrap." },
  { say: "It wasn't his.", show: "It wasn't his." },
  { say: "You see, Victor Lustig read that Paris could barely afford to keep the tower standing.", show: "You see, Victor Lustig read that Paris could barely afford to keep the tower standing." },
  { say: "So he printed fake government letters,", show: "So he printed fake government letters," },
  { say: "and invited scrap dealers to a luxury hotel.", show: "and invited scrap dealers to a luxury hotel." },
  { say: "Gentlemen, the tower is coming down.", show: "Gentlemen, the tower is coming down." },
  { say: "Seven thousand tons of iron.", show: "Seven thousand tons of iron." },
  { say: "Tell no one.", show: "Tell no one." },
  { say: "One dealer, André Poisson, got nervous.", show: "One dealer, André Poisson, got nervous." },
  { say: "So Lustig leaned in...", show: "So Lustig leaned in..." },
  { say: "and asked for a bribe.", show: "and asked for a bribe." },
  { say: "That settled it.", show: "That settled it." },
  { say: "Only a real official would be that corrupt.", show: "Only a real official would be that corrupt." },
  { say: "Poisson paid,", show: "Poisson paid," },
  { say: "and Lustig fled to Vienna with a suitcase full of cash.", show: "and Lustig fled to Vienna with a suitcase full of cash." },
  { say: "He checked the papers every day.", show: "He checked the papers every day." },
  { say: "Nothing.", show: "Nothing." },
  { say: "Poisson was too embarrassed to call the police.", show: "Poisson was too embarrassed to call the police." },
  { say: "So Lustig went back to Paris,", show: "So Lustig went back to Paris," },
  { say: "and tried to sell the tower again.", show: "and tried to sell the tower again." },
  { say: "That buyer did call the police.", show: "That buyer did call the police." },
  { say: "Lustig vanished to America,", show: "Lustig vanished to America," },
  { say: "where Al Capone handed him fifty thousand dollars.", show: "where Al Capone handed him fifty thousand dollars." },
  { say: "He gave back every cent...", show: "He gave back every cent..." },
  { say: "and got a reward for his honesty.", show: "and got a reward for his honesty." },
];

const WPS = 3.7, PAUSE = 0.32;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0.0, 2.04], [2.5, 3.14], [3.74, 8.04], [8.48, 10.32], [10.52, 12.88], [13.4, 15.42], [15.9, 17.4], [17.9, 18.64], [19.0, 21.26], [21.74, 23.34], [23.34, 24.42], [24.9, 25.7], [25.94, 27.9], [28.52, 29.12], [29.12, 32.26], [32.76, 34.24], [34.8, 34.98], [35.64, 37.6], [38.26, 39.74], [39.94, 41.3], [41.8, 43.3], [43.88, 45.06], [45.36, 48.04], [48.46, 50.18], [50.18, 51.62]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 1.0) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = [{"w": "He", "s": 0.0, "e": 0.16, "seg": 0}, {"w": "sold", "s": 0.16, "e": 0.4, "seg": 0}, {"w": "the", "s": 0.4, "e": 0.62, "seg": 0}, {"w": "Eiffel", "s": 0.62, "e": 0.94, "seg": 0}, {"w": "Tower", "s": 0.94, "e": 1.28, "seg": 0}, {"w": "for", "s": 1.28, "e": 1.6, "seg": 0}, {"w": "scrap.", "s": 1.6, "e": 2.04, "seg": 0}, {"w": "It", "s": 2.5, "e": 2.58, "seg": 1}, {"w": "wasn't", "s": 2.58, "e": 2.92, "seg": 1}, {"w": "his.", "s": 2.92, "e": 3.14, "seg": 1}, {"w": "You", "s": 3.74, "e": 3.82, "seg": 2}, {"w": "see,", "s": 3.82, "e": 4.02, "seg": 2}, {"w": "Victor", "s": 4.48, "e": 4.6, "seg": 2}, {"w": "Lustig", "s": 4.6, "e": 5.02, "seg": 2}, {"w": "read", "s": 5.02, "e": 5.28, "seg": 2}, {"w": "that", "s": 5.28, "e": 5.48, "seg": 2}, {"w": "Paris", "s": 5.48, "e": 5.78, "seg": 2}, {"w": "could", "s": 5.78, "e": 5.96, "seg": 2}, {"w": "barely", "s": 5.96, "e": 6.38, "seg": 2}, {"w": "afford", "s": 6.38, "e": 6.74, "seg": 2}, {"w": "to", "s": 6.74, "e": 6.94, "seg": 2}, {"w": "keep", "s": 6.94, "e": 7.1, "seg": 2}, {"w": "the", "s": 7.1, "e": 7.28, "seg": 2}, {"w": "tower", "s": 7.28, "e": 7.5, "seg": 2}, {"w": "standing.", "s": 7.5, "e": 8.04, "seg": 2}, {"w": "So", "s": 8.48, "e": 8.66, "seg": 3}, {"w": "he", "s": 8.66, "e": 8.88, "seg": 3}, {"w": "printed", "s": 8.88, "e": 9.16, "seg": 3}, {"w": "fake", "s": 9.16, "e": 9.54, "seg": 3}, {"w": "government", "s": 9.54, "e": 9.88, "seg": 3}, {"w": "letters,", "s": 9.88, "e": 10.32, "seg": 3}, {"w": "and", "s": 10.52, "e": 10.6, "seg": 4}, {"w": "invited", "s": 10.56, "e": 10.92, "seg": 4}, {"w": "scrap", "s": 10.92, "e": 11.34, "seg": 4}, {"w": "dealers", "s": 11.34, "e": 11.62, "seg": 4}, {"w": "to", "s": 11.62, "e": 11.9, "seg": 4}, {"w": "a", "s": 11.9, "e": 12.08, "seg": 4}, {"w": "luxury", "s": 12.08, "e": 12.38, "seg": 4}, {"w": "hotel.", "s": 12.38, "e": 12.88, "seg": 4}, {"w": "Gentlemen,", "s": 13.4, "e": 13.72, "seg": 5}, {"w": "the", "s": 14.02, "e": 14.16, "seg": 5}, {"w": "tower", "s": 14.16, "e": 14.46, "seg": 5}, {"w": "is", "s": 14.46, "e": 14.78, "seg": 5}, {"w": "coming", "s": 14.78, "e": 15.04, "seg": 5}, {"w": "down.", "s": 15.04, "e": 15.42, "seg": 5}, {"w": "Seven", "s": 15.9, "e": 16.08, "seg": 6}, {"w": "thousand", "s": 16.08, "e": 16.54, "seg": 6}, {"w": "tons", "s": 16.54, "e": 16.92, "seg": 6}, {"w": "of", "s": 16.92, "e": 17.12, "seg": 6}, {"w": "iron.", "s": 17.12, "e": 17.4, "seg": 6}, {"w": "Tell", "s": 17.9, "e": 18.02, "seg": 7}, {"w": "no", "s": 18.02, "e": 18.36, "seg": 7}, {"w": "one.", "s": 18.36, "e": 18.64, "seg": 7}, {"w": "One", "s": 19.0, "e": 19.18, "seg": 8}, {"w": "dealer,", "s": 19.18, "e": 19.52, "seg": 8}, {"w": "André", "s": 19.86, "e": 20.02, "seg": 8}, {"w": "Poisson,", "s": 20.02, "e": 20.44, "seg": 8}, {"w": "got", "s": 20.68, "e": 20.84, "seg": 8}, {"w": "nervous.", "s": 20.84, "e": 21.26, "seg": 8}, {"w": "So", "s": 21.74, "e": 21.92, "seg": 9}, {"w": "Lustig", "s": 21.92, "e": 22.34, "seg": 9}, {"w": "leaned", "s": 22.34, "e": 22.6, "seg": 9}, {"w": "in...", "s": 22.6, "e": 23.34, "seg": 9}, {"w": "and", "s": 23.34, "e": 23.44, "seg": 10}, {"w": "asked", "s": 23.44, "e": 23.72, "seg": 10}, {"w": "for", "s": 23.72, "e": 23.96, "seg": 10}, {"w": "a", "s": 23.96, "e": 24.08, "seg": 10}, {"w": "bribe.", "s": 24.08, "e": 24.42, "seg": 10}, {"w": "That", "s": 24.9, "e": 25.1, "seg": 11}, {"w": "settled", "s": 25.1, "e": 25.42, "seg": 11}, {"w": "it.", "s": 25.42, "e": 25.7, "seg": 11}, {"w": "Only", "s": 25.94, "e": 26.12, "seg": 12}, {"w": "a", "s": 26.12, "e": 26.32, "seg": 12}, {"w": "real", "s": 26.32, "e": 26.56, "seg": 12}, {"w": "official", "s": 26.56, "e": 26.92, "seg": 12}, {"w": "would", "s": 26.92, "e": 27.12, "seg": 12}, {"w": "be", "s": 27.12, "e": 27.28, "seg": 12}, {"w": "that", "s": 27.28, "e": 27.56, "seg": 12}, {"w": "corrupt.", "s": 27.56, "e": 27.9, "seg": 12}, {"w": "Poisson", "s": 28.52, "e": 28.78, "seg": 13}, {"w": "paid,", "s": 28.78, "e": 29.12, "seg": 13}, {"w": "and", "s": 29.12, "e": 29.52, "seg": 14}, {"w": "Lustig", "s": 29.52, "e": 29.88, "seg": 14}, {"w": "fled", "s": 29.88, "e": 30.2, "seg": 14}, {"w": "to", "s": 30.2, "e": 30.38, "seg": 14}, {"w": "Vienna", "s": 30.38, "e": 30.6, "seg": 14}, {"w": "with", "s": 30.6, "e": 30.86, "seg": 14}, {"w": "a", "s": 30.86, "e": 30.98, "seg": 14}, {"w": "suitcase", "s": 30.98, "e": 31.36, "seg": 14}, {"w": "full", "s": 31.36, "e": 31.82, "seg": 14}, {"w": "of", "s": 31.82, "e": 31.98, "seg": 14}, {"w": "cash.", "s": 31.98, "e": 32.26, "seg": 14}, {"w": "He", "s": 32.76, "e": 32.84, "seg": 15}, {"w": "checked", "s": 32.78, "e": 33.0, "seg": 15}, {"w": "the", "s": 33.0, "e": 33.2, "seg": 15}, {"w": "papers", "s": 33.2, "e": 33.44, "seg": 15}, {"w": "every", "s": 33.44, "e": 33.94, "seg": 15}, {"w": "day.", "s": 33.94, "e": 34.24, "seg": 15}, {"w": "Nothing.", "s": 34.8, "e": 34.98, "seg": 16}, {"w": "Poisson", "s": 35.64, "e": 35.78, "seg": 17}, {"w": "was", "s": 35.78, "e": 36.04, "seg": 17}, {"w": "too", "s": 36.04, "e": 36.32, "seg": 17}, {"w": "embarrassed", "s": 36.32, "e": 36.8, "seg": 17}, {"w": "to", "s": 36.8, "e": 37.04, "seg": 17}, {"w": "call", "s": 37.04, "e": 37.16, "seg": 17}, {"w": "the", "s": 37.16, "e": 37.3, "seg": 17}, {"w": "police.", "s": 37.3, "e": 37.6, "seg": 17}, {"w": "So", "s": 38.26, "e": 38.38, "seg": 18}, {"w": "Lustig", "s": 38.38, "e": 38.82, "seg": 18}, {"w": "went", "s": 38.82, "e": 39.0, "seg": 18}, {"w": "back", "s": 39.0, "e": 39.28, "seg": 18}, {"w": "to", "s": 39.28, "e": 39.46, "seg": 18}, {"w": "Paris,", "s": 39.46, "e": 39.74, "seg": 18}, {"w": "and", "s": 39.94, "e": 40.04, "seg": 19}, {"w": "tried", "s": 40.04, "e": 40.24, "seg": 19}, {"w": "to", "s": 40.24, "e": 40.4, "seg": 19}, {"w": "sell", "s": 40.4, "e": 40.58, "seg": 19}, {"w": "the", "s": 40.58, "e": 40.72, "seg": 19}, {"w": "tower", "s": 40.72, "e": 40.94, "seg": 19}, {"w": "again.", "s": 40.94, "e": 41.3, "seg": 19}, {"w": "That", "s": 41.8, "e": 41.98, "seg": 20}, {"w": "buyer", "s": 41.98, "e": 42.28, "seg": 20}, {"w": "did", "s": 42.28, "e": 42.6, "seg": 20}, {"w": "call", "s": 42.6, "e": 42.88, "seg": 20}, {"w": "the", "s": 42.88, "e": 43.02, "seg": 20}, {"w": "police.", "s": 43.02, "e": 43.3, "seg": 20}, {"w": "Lustig", "s": 43.88, "e": 44.18, "seg": 21}, {"w": "vanished", "s": 44.18, "e": 44.5, "seg": 21}, {"w": "to", "s": 44.5, "e": 44.74, "seg": 21}, {"w": "America,", "s": 44.74, "e": 45.06, "seg": 21}, {"w": "where", "s": 45.36, "e": 45.52, "seg": 22}, {"w": "Al", "s": 45.52, "e": 45.74, "seg": 22}, {"w": "Capone", "s": 45.74, "e": 46.08, "seg": 22}, {"w": "handed", "s": 46.08, "e": 46.42, "seg": 22}, {"w": "him", "s": 46.42, "e": 46.62, "seg": 22}, {"w": "fifty", "s": 46.62, "e": 46.96, "seg": 22}, {"w": "thousand", "s": 46.96, "e": 47.54, "seg": 22}, {"w": "dollars.", "s": 47.54, "e": 48.04, "seg": 22}, {"w": "He", "s": 48.46, "e": 48.6, "seg": 23}, {"w": "gave", "s": 48.6, "e": 48.76, "seg": 23}, {"w": "back", "s": 48.76, "e": 49.02, "seg": 23}, {"w": "every", "s": 49.02, "e": 49.42, "seg": 23}, {"w": "cent...", "s": 49.42, "e": 50.18, "seg": 23}, {"w": "and", "s": 50.18, "e": 50.34, "seg": 24}, {"w": "got", "s": 50.34, "e": 50.54, "seg": 24}, {"w": "a", "s": 50.54, "e": 50.68, "seg": 24}, {"w": "reward", "s": 50.68, "e": 50.96, "seg": 24}, {"w": "for", "s": 50.96, "e": 51.22, "seg": 24}, {"w": "his", "s": 51.22, "e": 51.34, "seg": 24}, {"w": "honesty.", "s": 51.34, "e": 51.62, "seg": 24}];
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
  { id: 1, s0: 0, s1: 0, light: "day" },  // hook: the tower, SOLD stamp slams on it; cut under the legs looking straight up, spinning
  { id: 2, s0: 1, s1: 1, light: "day" },  // Lustig's grin, big, tilted, the tower soft behind him
  { id: 3, s0: 2, s1: 2, light: "day" },  // he peeks over a newspaper; whip up to the tower, crane up its side; top-down from the summit
  { id: 4, s0: 3, s1: 3, light: "day" },  // corkscrew down onto the forged letter, FAKE stamp; envelopes fly at the lens
  { id: 5, s0: 4, s1: 4, light: "day" },  // the dealers march in under the hotel arch (camera backs away); crane out to the whole salon
  { id: 6, s0: 5, s1: 5, light: "day" },  // low on Lustig; the model tower topples at the lens
  { id: 7, s0: 6, s1: 7, light: "day" },  // long-lens slide across the dealers' faces; snap to Lustig going shh
  { id: 8, s0: 8, s1: 8, light: "day" },  // the three dealers; snap to Poisson sweating
  { id: 9, s0: 9, s1: 10, light: "day" },  // orbit round Lustig leaning in to Poisson; the upturned top hat shoots at the lens
  { id: 10, s0: 11, s1: 12, light: "day" }, // Poisson: nervous, then relieved; rising orbit out
  { id: 11, s0: 13, s1: 13, light: "day" }, // cash slams on the table
  { id: 12, s0: 14, s1: 14, light: "day" }, // street: tracking beside Lustig running with the suitcase; then he runs straight at the lens, tower behind
  { id: 13, s0: 15, s1: 16, light: "day" }, // Vienna quay: swoop in to Lustig behind a newspaper; snap to his eyes, paper drops, grin
  { id: 14, s0: 17, s1: 17, light: "day" }, // Poisson alone under the tower; crane up and away until he's tiny
  { id: 15, s0: 18, s1: 18, light: "day" }, // dive from high over the river down the main street toward the tower
  { id: 16, s0: 19, s1: 19, light: "day" }, // low orbit: Lustig, a new buyer, FOR SALE sign, tower above
  { id: 17, s0: 20, s1: 20, light: "day" }, // gendarmes charge down the street at the lens
  { id: 18, s0: 21, s1: 21, light: "day" }, // crash zoom to his top hat left spinning on the grass; whip away
  { id: 19, s0: 22, s1: 24, light: "day" }, // Chicago: low on Capone; cash slides over and back; reward flies at the lens; Lustig's grin; back to the hook frame
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
