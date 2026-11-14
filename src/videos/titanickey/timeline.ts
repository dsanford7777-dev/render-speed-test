// "The Man Who Walked Off the Titanic With the Key" (Paradox Town #9): David Blair, Southampton, April 1912.
// Everything is timed from SEGMENTS (seconds). scripts/align.py rewrites SEG_TIMES and WORDS from the voice, and shots,
// cameras and captions follow.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "This key sank the Titanic.", show: "This key sank the Titanic." },
  { say: "At least, that's the story.", show: "At least, that's the story." },
  { say: "You see, days before the voyage, Second Officer David Blair was bumped off the ship.", show: "You see, days before the voyage, Second Officer David Blair was bumped off the ship." },
  { say: "And he walked off with a key in his pocket.", show: "And he walked off with a key in his pocket." },
  { say: "The key, everyone says, to the lookouts' binoculars.", show: "The key, everyone says, to the lookouts' binoculars." },
  { say: "So that night, the men in the crow's nest watched for ice with nothing but their eyes.", show: "So that night, the men in the crow's nest watched for ice with nothing but their eyes." },
  { say: "Asked how much sooner binoculars would have shown the iceberg, lookout Fred Fleet said:", show: "Asked how much sooner binoculars would have shown the iceberg, lookout Fred Fleet said:" },
  { say: "\"Enough to get out of the way.\"", show: "“Enough to get out of the way.”" },
  { say: "But look at the tag on that key.", show: "But look at the tag on that key." },
  { say: "It says: crow's nest telephone.", show: "It says: CROW'S NEST TELEPHONE." },
  { say: "And the binoculars?", show: "And the binoculars?" },
  { say: "A lookout testified he locked them away in Blair's cabin, before the voyage.", show: "A lookout testified he locked them away in Blair's cabin, before the voyage." },
  { say: "When the lookouts asked for them at sea, they were told: there are none.", show: "When the lookouts asked for them at sea, they were told: there are none." },
  { say: "The key sold for ninety thousand pounds.", show: "The key sold for £90,000." },
  { say: "Nobody can agree what it opened.", show: "Nobody can agree what it opened." },
];

const WPS = 3.4, PAUSE = 0.3;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0.0, 1.9], [2.48, 3.94], [4.54, 9.28], [9.8, 11.84], [12.22, 15.68], [15.86, 20.04], [20.72, 24.9], [25.34, 26.38], [26.38, 28.64], [29.18, 31.1], [31.6, 32.46], [32.8, 36.82], [37.46, 40.6], [41.1, 43.62], [44.38, 45.68]];
// __END_SEG_TIMES__
export const TOTAL = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 0.9) * FPS);

/** caption words with times (seconds). Estimated: each segment's span shared by word length; align.py swaps in real ones */
export type Word = { w: string; s: number; e: number; seg: number };
// __WORDS__
export const WORDS: Word[] | null = [{"w": "This", "s": 0.0, "e": 0.32, "seg": 0}, {"w": "key", "s": 0.32, "e": 0.64, "seg": 0}, {"w": "sank", "s": 0.64, "e": 1.18, "seg": 0}, {"w": "the", "s": 1.18, "e": 1.4, "seg": 0}, {"w": "Titanic.", "s": 1.4, "e": 1.9, "seg": 0}, {"w": "At", "s": 2.48, "e": 2.56, "seg": 1}, {"w": "least,", "s": 2.54, "e": 2.76, "seg": 1}, {"w": "that's", "s": 3.22, "e": 3.42, "seg": 1}, {"w": "the", "s": 3.42, "e": 3.56, "seg": 1}, {"w": "story.", "s": 3.56, "e": 3.94, "seg": 1}, {"w": "You", "s": 4.54, "e": 4.62, "seg": 2}, {"w": "see,", "s": 4.56, "e": 4.76, "seg": 2}, {"w": "days", "s": 5.12, "e": 5.24, "seg": 2}, {"w": "before", "s": 5.24, "e": 5.62, "seg": 2}, {"w": "the", "s": 5.62, "e": 5.78, "seg": 2}, {"w": "voyage,", "s": 5.78, "e": 6.18, "seg": 2}, {"w": "Second", "s": 6.54, "e": 6.72, "seg": 2}, {"w": "Officer", "s": 6.72, "e": 7.1, "seg": 2}, {"w": "David", "s": 7.1, "e": 7.58, "seg": 2}, {"w": "Blair", "s": 7.58, "e": 7.94, "seg": 2}, {"w": "was", "s": 7.94, "e": 8.24, "seg": 2}, {"w": "bumped", "s": 8.24, "e": 8.58, "seg": 2}, {"w": "off", "s": 8.58, "e": 8.82, "seg": 2}, {"w": "the", "s": 8.82, "e": 9.0, "seg": 2}, {"w": "ship.", "s": 9.0, "e": 9.28, "seg": 2}, {"w": "And", "s": 9.8, "e": 9.88, "seg": 3}, {"w": "he", "s": 9.86, "e": 9.98, "seg": 3}, {"w": "walked", "s": 9.98, "e": 10.22, "seg": 3}, {"w": "off", "s": 10.22, "e": 10.56, "seg": 3}, {"w": "with", "s": 10.56, "e": 10.78, "seg": 3}, {"w": "a", "s": 10.78, "e": 10.92, "seg": 3}, {"w": "key", "s": 10.92, "e": 11.16, "seg": 3}, {"w": "in", "s": 11.16, "e": 11.34, "seg": 3}, {"w": "his", "s": 11.34, "e": 11.48, "seg": 3}, {"w": "pocket.", "s": 11.48, "e": 11.84, "seg": 3}, {"w": "The", "s": 12.22, "e": 12.3, "seg": 4}, {"w": "key,", "s": 12.28, "e": 12.6, "seg": 4}, {"w": "everyone", "s": 12.9, "e": 13.14, "seg": 4}, {"w": "says,", "s": 13.14, "e": 13.58, "seg": 4}, {"w": "to", "s": 14.0, "e": 14.12, "seg": 4}, {"w": "the", "s": 14.12, "e": 14.3, "seg": 4}, {"w": "lookouts'", "s": 14.3, "e": 14.68, "seg": 4}, {"w": "binoculars.", "s": 14.84, "e": 15.68, "seg": 4}, {"w": "So", "s": 15.86, "e": 15.94, "seg": 5}, {"w": "that", "s": 15.9, "e": 16.08, "seg": 5}, {"w": "night,", "s": 16.08, "e": 16.36, "seg": 5}, {"w": "the", "s": 16.62, "e": 16.72, "seg": 5}, {"w": "men", "s": 16.72, "e": 16.86, "seg": 5}, {"w": "in", "s": 16.86, "e": 17.0, "seg": 5}, {"w": "the", "s": 17.0, "e": 17.2, "seg": 5}, {"w": "crow's", "s": 17.2, "e": 17.48, "seg": 5}, {"w": "nest", "s": 17.48, "e": 17.66, "seg": 5}, {"w": "watched", "s": 17.66, "e": 18.0, "seg": 5}, {"w": "for", "s": 18.0, "e": 18.28, "seg": 5}, {"w": "ice", "s": 18.28, "e": 18.52, "seg": 5}, {"w": "with", "s": 18.52, "e": 18.78, "seg": 5}, {"w": "nothing", "s": 18.78, "e": 19.16, "seg": 5}, {"w": "but", "s": 19.16, "e": 19.44, "seg": 5}, {"w": "their", "s": 19.44, "e": 19.62, "seg": 5}, {"w": "eyes.", "s": 19.62, "e": 20.04, "seg": 5}, {"w": "Asked", "s": 20.72, "e": 20.82, "seg": 6}, {"w": "how", "s": 20.82, "e": 21.08, "seg": 6}, {"w": "much", "s": 21.08, "e": 21.22, "seg": 6}, {"w": "sooner", "s": 21.22, "e": 21.46, "seg": 6}, {"w": "binoculars", "s": 21.46, "e": 22.22, "seg": 6}, {"w": "would", "s": 22.22, "e": 22.3, "seg": 6}, {"w": "have", "s": 22.3, "e": 22.42, "seg": 6}, {"w": "shown", "s": 22.42, "e": 22.6, "seg": 6}, {"w": "the", "s": 22.6, "e": 22.74, "seg": 6}, {"w": "iceberg,", "s": 22.74, "e": 23.14, "seg": 6}, {"w": "lookout", "s": 23.6, "e": 23.74, "seg": 6}, {"w": "Fred", "s": 23.74, "e": 24.22, "seg": 6}, {"w": "Fleet", "s": 24.22, "e": 24.52, "seg": 6}, {"w": "said:", "s": 24.52, "e": 24.9, "seg": 6}, {"w": "“Enough", "s": 25.34, "e": 25.5, "seg": 7}, {"w": "to", "s": 25.5, "e": 25.68, "seg": 7}, {"w": "get", "s": 25.68, "e": 25.78, "seg": 7}, {"w": "out", "s": 25.78, "e": 25.94, "seg": 7}, {"w": "of", "s": 25.94, "e": 26.02, "seg": 7}, {"w": "the", "s": 26.02, "e": 26.12, "seg": 7}, {"w": "way.”", "s": 26.12, "e": 26.38, "seg": 7}, {"w": "But", "s": 26.38, "e": 27.08, "seg": 8}, {"w": "look", "s": 27.08, "e": 27.3, "seg": 8}, {"w": "at", "s": 27.3, "e": 27.42, "seg": 8}, {"w": "the", "s": 27.42, "e": 27.56, "seg": 8}, {"w": "tag", "s": 27.56, "e": 27.88, "seg": 8}, {"w": "on", "s": 27.88, "e": 28.08, "seg": 8}, {"w": "that", "s": 28.08, "e": 28.3, "seg": 8}, {"w": "key.", "s": 28.3, "e": 28.64, "seg": 8}, {"w": "It", "s": 29.18, "e": 29.26, "seg": 9}, {"w": "says:", "s": 29.2, "e": 29.44, "seg": 9}, {"w": "CROW'S", "s": 29.44, "e": 30.2, "seg": 9}, {"w": "NEST", "s": 30.2, "e": 30.38, "seg": 9}, {"w": "TELEPHONE.", "s": 30.38, "e": 31.1, "seg": 9}, {"w": "And", "s": 31.6, "e": 31.68, "seg": 10}, {"w": "the", "s": 31.68, "e": 31.78, "seg": 10}, {"w": "binoculars?", "s": 31.78, "e": 32.46, "seg": 10}, {"w": "A", "s": 32.8, "e": 32.98, "seg": 11}, {"w": "lookout", "s": 32.98, "e": 33.22, "seg": 11}, {"w": "testified", "s": 33.22, "e": 33.78, "seg": 11}, {"w": "he", "s": 33.78, "e": 34.02, "seg": 11}, {"w": "locked", "s": 34.02, "e": 34.28, "seg": 11}, {"w": "them", "s": 34.28, "e": 34.48, "seg": 11}, {"w": "away", "s": 34.48, "e": 34.72, "seg": 11}, {"w": "in", "s": 34.72, "e": 34.96, "seg": 11}, {"w": "Blair's", "s": 34.96, "e": 35.34, "seg": 11}, {"w": "cabin,", "s": 35.34, "e": 35.64, "seg": 11}, {"w": "before", "s": 36.26, "e": 36.34, "seg": 11}, {"w": "the", "s": 36.26, "e": 36.48, "seg": 11}, {"w": "voyage.", "s": 36.48, "e": 36.82, "seg": 11}, {"w": "When", "s": 37.46, "e": 37.56, "seg": 12}, {"w": "the", "s": 37.56, "e": 37.68, "seg": 12}, {"w": "lookouts", "s": 37.68, "e": 37.96, "seg": 12}, {"w": "asked", "s": 37.96, "e": 38.2, "seg": 12}, {"w": "for", "s": 38.2, "e": 38.36, "seg": 12}, {"w": "them", "s": 38.36, "e": 38.48, "seg": 12}, {"w": "at", "s": 38.48, "e": 38.62, "seg": 12}, {"w": "sea,", "s": 38.62, "e": 38.92, "seg": 12}, {"w": "they", "s": 39.18, "e": 39.26, "seg": 12}, {"w": "were", "s": 39.26, "e": 39.36, "seg": 12}, {"w": "told:", "s": 39.36, "e": 39.6, "seg": 12}, {"w": "there", "s": 39.98, "e": 40.16, "seg": 12}, {"w": "are", "s": 40.16, "e": 40.36, "seg": 12}, {"w": "none.", "s": 40.36, "e": 40.6, "seg": 12}, {"w": "The", "s": 41.1, "e": 41.26, "seg": 13}, {"w": "key", "s": 41.26, "e": 41.46, "seg": 13}, {"w": "sold", "s": 41.46, "e": 41.8, "seg": 13}, {"w": "for", "s": 41.8, "e": 42.06, "seg": 13}, {"w": "£90,000.", "s": 42.06, "e": 43.62, "seg": 13}, {"w": "Nobody", "s": 44.38, "e": 44.54, "seg": 14}, {"w": "can", "s": 44.54, "e": 44.84, "seg": 14}, {"w": "agree", "s": 44.84, "e": 45.08, "seg": 14}, {"w": "what", "s": 45.08, "e": 45.28, "seg": 14}, {"w": "it", "s": 45.28, "e": 45.38, "seg": 14}, {"w": "opened.", "s": 45.38, "e": 45.68, "seg": 14}];
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
