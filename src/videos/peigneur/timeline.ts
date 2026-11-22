// "The Oil Rig That Pulled the Plug on a Lake" (Paradox Town #16): Lake Peigneur, Louisiana, November 20, 1980.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "This oil rig pulled the plug on an entire lake.", show: "This oil rig pulled the plug on an entire lake." },
  { say: "You see, in nineteen eighty, Lake Pen-yur in Louisiana was about ten feet deep. Fishermen, a garden on an island, and a rig drilling for oil.", show: "You see, in 1980, Lake Peigneur in Louisiana was about 10 feet deep. Fishermen, a garden on an island, and a rig drilling for oil." },
  { say: "What the drillers didn't know... right under the lake was a salt mine, with about fifty men working inside.", show: "What the drillers didn't know... right under the lake was a salt mine, with about 50 men working inside." },
  { say: "That morning, the drill jammed. Then came loud pops from under the rig, and it started to tilt.", show: "That morning, the drill jammed. Then came loud pops from under the rig, and it started to tilt." },
  { say: "The crew got off. Then the whole rig flipped over and vanished... into water ten feet deep.", show: "The crew got off. Then the whole rig flipped over and vanished... into water 10 feet deep." },
  { say: "They'd drilled straight into the mine. And the lake was pouring in.", show: "They'd drilled straight into the mine. And the lake was pouring in." },
  { say: "Down below, the miners saw the water coming. One elevator. Eight men at a time.", show: "Down below, the miners saw the water coming. 1 elevator. 8 men at a time." },
  { say: "Up top, the lake became a whirlpool. It swallowed a tugboat, eleven barges, trees, and sixty-five acres of the island.", show: "Up top, the lake became a whirlpool. It swallowed a tugboat, 11 barges, trees, and 65 acres of the island." },
  { say: "In about three hours, the lake was gone.", show: "In about 3 hours, the lake was gone." },
  { say: "Then the canal to the Gulf started running backwards, and for a few days, Louisiana's tallest waterfall poured into the hole.", show: "Then the canal to the Gulf started running backwards, and for a few days, Louisiana's tallest waterfall poured into the hole." },
  { say: "Days later, nine of the barges popped back up... like corks.", show: "Days later, 9 of the barges popped back up... like corks." },
  { say: "And here's the crazy part. Not one person died. Every miner got out.", show: "And here's the crazy part. Not one person died. Every miner got out." },
  { say: "But the lake that came back was salt water, and two hundred feet deep.", show: "But the lake that came back was salt water, and 200 feet deep." },
  { say: "Officially, nobody ever proved whose fault it was. Texaco and its driller paid the salt company thirty-two million dollars anyway.", show: "Officially, nobody ever proved whose fault it was. Texaco and its driller paid the salt company $32 million anyway." },
];

const WPS = 3.4, PAUSE = 0.3;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = est();
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
/** frame of a word's onset inside a segment (first match of `w`, case-insensitive), for cuts and reaction timing */
const norm = (s: string) => s.toLowerCase().replace(/[^\w.]/g, "").replace(/\.+$/, "");
export const wordAt = (seg: number, w: string, fallbackU = 0.5) => {
  const ws = words().filter((x) => x.seg === seg), k = norm(w);
  const hit = ws.find((x) => norm(x.w) === k) ?? ws.find((x) => norm(x.w).startsWith(k));
  const [a, b] = SEG_TIMES[seg];
  return Math.round((hit ? hit.s : a + (b - a) * fallbackU) * FPS);
};
