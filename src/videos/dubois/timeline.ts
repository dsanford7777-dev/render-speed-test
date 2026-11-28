// Dubois, Wyoming (Paradox Town Short #22): the town that says its own name wrong on purpose, Horse Creek, 1889.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "This town says its own name wrong... on purpose.", show: "This town says its own name wrong... on purpose." },
  { say: "You see, in eighteen eighty-nine, a few ranchers on Horse Creek, Wyoming, wanted a post office. The nearest one was sixty-five miles away, and the mail came in on horseback.", show: "You see, in 1889, a few ranchers on Horse Creek, Wyoming, wanted a post office. The nearest one was 65 miles away, and the mail came in on horseback." },
  { say: "So they sent Washington the name they'd picked: Teebo.", show: "So they sent Washington the name they'd picked: Tibo." },
  { say: "It's a Shoshone word for stranger. The Shoshone used it as a fond nickname for their missionary, a Welsh priest named John Roberts.", show: "It's a Shoshone word for stranger. The Shoshone used it as a fond nickname for their missionary, a Welsh priest named John Roberts." },
  { say: "But the application came back... changed, in red ink. Their town would be called Doo-bwah.", show: "But the application came back... changed, in red ink. Their town would be called Dubois." },
  { say: "Named after Fred Doo-bwah. He was Idaho's man in Congress. Not Wyoming's. Idaho's. He'd barely spent any time in Wyoming.", show: "Named after Fred Dubois. He was Idaho's man in Congress. Not Wyoming's. Idaho's. He'd barely spent any time in Wyoming." },
  { say: "Who swapped the names? Nobody agrees. Some say his friend, Wyoming's man in Congress, picked it. Some say Doo-bwah wrote down his own name himself.", show: "Who swapped the names? Nobody agrees. Some say his friend, Wyoming's man in Congress, picked it. Some say Dubois wrote down his own name himself." },
  { say: "And here's the twist. Doo-bwah said his name the French way: doo-BWAH. And he reportedly hated it when people said \"boys.\"", show: "And here's the twist. Dubois said his name the French way: doo-BWAH. And he reportedly hated it when people said \"boys.\"" },
  { say: "So, the story goes, the town said \"boys.\" DOO-boys. On purpose. Every single time.", show: "So, the story goes, the town said \"boys.\" DOO-boys. On purpose. Every single time." },
  { say: "More than a hundred and thirty years later, they still do. Say doo-BWAH in Doo-boys today, and everybody knows you're not from there.", show: "More than 130 years later, they still do. Say doo-BWAH in Dubois today, and everybody knows you're not from there." },
  { say: "Oh, and that first winter? Butch Cassidy moved in on the same creek.", show: "Oh, and that first winter? Butch Cassidy moved in on the same creek." },
  { say: "So... if a stranger renamed your town, would you say it his way?", show: "So... if a stranger renamed your town, would you say it his way?" },
];

const WPS = 3.4, PAUSE = 0.3;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = est();
// __END_SEG_TIMES__
/** the voice's end; the film runs on 100 frames past it into the loop shot, where the subscribe card plays */
export const VOICE_END = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 0.35) * FPS);
export const TOTAL = VOICE_END + 100;

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
