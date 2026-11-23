// "The Stable Hand Who Won His First Race and Never Got Off the Horse" (Paradox Town Explained, long-form #11), 1920 x 1080: Frank Hayes, Belmont Park, June 4, 1923.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "A horse named Sweet Kiss won a steeplechase in New York... and her rider never got off her alive.", show: "A horse named Sweet Kiss won a steeplechase in New York... and her rider never got off her alive." },
  { say: "His name was Frank Hayes. It was the first race he ever won. And by the time anyone reached him, he was dead.", show: "His name was Frank Hayes. It was the first race he ever won. And by the time anyone reached him, he was dead." },
  { say: "For a hundred years, people have told this story one way. A dead man rode a horse across the finish line.", show: "For 100 years, people have told this story one way. A dead man rode a horse across the finish line." },
  { say: "But the newspapers from that week tell it a little differently. And the real version is stranger.", show: "But the newspapers from that week tell it a little differently. And the real version is stranger." },
  { say: "If you like weird history, subscribe.", show: "If you like weird history, subscribe." },
  { say: "Frank Hayes wasn't a jockey. Not really.", show: "Frank Hayes wasn't a jockey. Not really." },
  { say: "He worked with horses for a living. He trained them, fed them, mucked out their stalls, and walked them cool after somebody else rode them to a win.", show: "He worked with horses for a living. He trained them, fed them, mucked out their stalls, and walked them cool after somebody else rode them to a win." },
  { say: "His mother later told a newspaper he'd loved horses since he was a child.", show: "His mother later told a newspaper he'd loved horses since he was a child." },
  { say: "What he wanted was to ride one in a real race.", show: "What he wanted was to ride one in a real race." },
  { say: "His chance came from the family he worked for, the Fraylings. They had a mare called Sweet Kiss, entered in the name of Miss A. M. Frayling.", show: "His chance came from the family he worked for, the Fraylings. They had a mare called Sweet Kiss, entered in the name of Miss A. M. Frayling." },
  { say: "And they agreed to let Frank ride her.", show: "And they agreed to let Frank ride her." },
  { say: "The race was a steeplechase. That's a horse race with fences in the way.", show: "The race was a steeplechase. That's a horse race with fences in the way." },
  { say: "This one was about two miles long, with twelve jumps, at Belmont Park, just outside New York City. The date was June fourth, nineteen twenty-three.", show: "This one was about 2 miles long, with 12 jumps, at Belmont Park, just outside New York City. The date was June 4, 1923." },
  { say: "It's one of the most dangerous rides in racing. A horse running flat out has to lift off, clear the fence, and land... again and again. And the rider has to stay on through every landing.", show: "It's one of the most dangerous rides in racing. A horse running flat out has to lift off, clear the fence, and land... again and again. And the rider has to stay on through every landing." },
  { say: "Sweet Kiss was not the favorite. The favorite was a horse called Gimme.", show: "Sweet Kiss was not the favorite. The favorite was a horse called Gimme." },
  { say: "Sweet Kiss was a long shot. Accounts since then put her odds anywhere from five to one... to twenty to one.", show: "Sweet Kiss was a long shot. Accounts since then put her odds anywhere from 5 to 1... to 20 to 1." },
  { say: "But first, Frank had a problem. His weight.", show: "But first, Frank had a problem. His weight." },
  { say: "In horse racing, every horse carries an assigned weight. The rider, the saddle, everything. If the rider is too light, they add lead. If the rider is too heavy... the rider has to lose it.", show: "In horse racing, every horse carries an assigned weight. The rider, the saddle, everything. If the rider is too light, they add lead. If the rider is too heavy... the rider has to lose it." },
  { say: "Sweet Kiss was set to carry a hundred and thirty pounds. Frank was more than ten pounds over.", show: "Sweet Kiss was set to carry 130 pounds. Frank was more than 10 pounds over." },
  { say: "So he did what riders did back then. He stopped eating. He jogged for hours. A Buffalo paper reported he went without water.", show: "So he did what riders did back then. He stopped eating. He jogged for hours. A Buffalo paper reported he went without water." },
  { say: "One account says he sweated it off in a hot box too. A cabinet that cooks the water right out of you.", show: "One account says he sweated it off in a hot box too. A cabinet that cooks the water right out of you." },
  { say: "He lost more than ten pounds in about a day.", show: "He lost more than 10 pounds in about a day." },
  { say: "And on race day, he made the weight.", show: "And on race day, he made the weight." },
  { say: "The flag dropped, and the field went off over the fences.", show: "The flag dropped, and the field went off over the fences." },
  { say: "Fence after fence, Sweet Kiss stayed on her feet, and Frank stayed on her back.", show: "Fence after fence, Sweet Kiss stayed on her feet, and Frank stayed on her back." },
  { say: "Then, near the end, the long shot pulled ahead.", show: "Then, near the end, the long shot pulled ahead." },
  { say: "And that's when people saw something wrong.", show: "And that's when people saw something wrong." },
  { say: "A Buffalo newspaper reported it the next day. As Sweet Kiss cleared the last fence and straightened out for the run to the wire, Frank was seen swaying in the saddle.", show: "A Buffalo newspaper reported it the next day. As Sweet Kiss cleared the last fence and straightened out for the run to the wire, Frank was seen swaying in the saddle." },
  { say: "He dipped to one side... then recovered.", show: "He dipped to one side... then recovered." },
  { say: "Sweet Kiss crossed the finish line first. An easy win, the paper said.", show: "Sweet Kiss crossed the finish line first. An easy win, the paper said." },
  { say: "Frank Hayes, the stable hand, had just won his first race.", show: "Frank Hayes, the stable hand, had just won his first race." },
  { say: "Past the finish, Sweet Kiss slowed down, and Frank rode on toward the judges' stand.", show: "Past the finish, Sweet Kiss slowed down, and Frank rode on toward the judges' stand." },
  { say: "Attendants started hurrying toward him.", show: "Attendants started hurrying toward him." },
  { say: "Before they reached him, he toppled out of the saddle, onto the track.", show: "Before they reached him, he toppled out of the saddle, onto the track." },
  { say: "The track's doctor examined him. Frank Hayes was dead.", show: "The track's doctor examined him. Frank Hayes was dead." },
  { say: "The papers said it was his heart. Heart failure, brought on by all that weight he'd lost.", show: "The papers said it was his heart. Heart failure, brought on by all that weight he'd lost." },
  { say: "The next morning, the New York Times ran the headline: Jockey dies as he wins his first race.", show: "The next morning, the New York Times ran the headline: Jockey dies as he wins his first race." },
  { say: "Then the story started to grow.", show: "Then the story started to grow." },
  { say: "Over the years, it turned into something bigger. A dead man won a horse race. His heart stopped halfway round, and his body stayed in the saddle all the way to the finish.", show: "Over the years, it turned into something bigger. A dead man won a horse race. His heart stopped halfway round, and his body stayed in the saddle all the way to the finish." },
  { say: "Maybe. But the reports from that week don't say that. They say he swayed after the last jump, recovered, finished, and fell after the line.", show: "Maybe. But the reports from that week don't say that. They say he swayed after the last jump, recovered, finished, and fell after the line." },
  { say: "Nobody can say exactly when his heart stopped. Before the finish... or after it.", show: "Nobody can say exactly when his heart stopped. Before the finish... or after it." },
  { say: "Other details drifted too. Most accounts today say he was twenty-two. A paper at the time said thirty-five.", show: "Other details drifted too. Most accounts today say he was 22. A paper at the time said 35." },
  { say: "And there's a famous photo, shared all over the internet, of a jockey slumped on a racehorse. It isn't him. It's a race in Australia, ten years later. No photo of Frank riding Sweet Kiss has ever turned up.", show: "And there's a famous photo, shared all over the internet, of a jockey slumped on a racehorse. It isn't him. It's a race in Australia, ten years later. No photo of Frank riding Sweet Kiss has ever turned up." },
  { say: "There's even a legend that Sweet Kiss never raced again, and that people called her the Sweet Kiss of Death. We couldn't find proof of either.", show: "There's even a legend that Sweet Kiss never raced again, and that people called her the Sweet Kiss of Death. We couldn't find proof of either." },
  { say: "What isn't a legend is the result. Sweet Kiss won, Frank Hayes was her rider, and the win stood.", show: "What isn't a legend is the result. Sweet Kiss won, Frank Hayes was her rider, and the win stood." },
  { say: "Three days later, he was buried at Holy Cross Cemetery in Brooklyn... in the racing silks he'd won in.", show: "3 days later, he was buried at Holy Cross Cemetery in Brooklyn... in the racing silks he'd won in." },
  { say: "He spent years walking other people's winners back to the barn. He got to ride exactly one of his own.", show: "He spent years walking other people's winners back to the barn. He got to ride exactly one of his own." },
  { say: "So what do you think? Did Frank Hayes win that race alive... or did a dead man cross the line?", show: "So what do you think? Did Frank Hayes win that race alive... or did a dead man cross the line?" },
  { say: "Tell me in the comments. And if you want more weird history, subscribe.", show: "Tell me in the comments. And if you want more weird history, subscribe." },
];

const WPS = 3.4, PAUSE = 0.3;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };
/** [start, end] seconds per segment; replaced by scripts/align.py once the voice exists */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = est();
// __END_SEG_TIMES__


/** seconds of end card after the last line (room for YouTube end-screen elements) */
export const TAIL = 8;
export const VOICE_END = Math.ceil((SEG_TIMES[SEG_TIMES.length - 1][1] + 0.6) * FPS);
export const TOTAL = VOICE_END + TAIL * FPS;

/** caption words with times (seconds) */
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
let _W: Word[] | null = null;
const allWords = () => (_W ??= words());

/** frame of a word's onset inside a segment (first match of `w` in the caption text, case-insensitive) */
const norm = (s: string) => s.toLowerCase().replace(/[^\w.]/g, "").replace(/\.+$/, "");
export const wordAt = (seg: number, w: string, fallbackU = 0.5) => {
  const ws = allWords().filter((x) => x.seg === seg), k = norm(w);
  const hit = ws.find((x) => norm(x.w) === k) ?? ws.find((x) => norm(x.w).startsWith(k));
  const [a, b] = SEG_TIMES[seg];
  return Math.round((hit ? hit.s : a + (b - a) * fallbackU) * FPS);
};
export const segAt = (seg: number) => Math.round(SEG_TIMES[seg][0] * FPS);

export const CHAPTERS: { seg: number; num: string; title: string }[] = [
  { seg: 5, num: "1", title: "THE STABLE HAND" },
  { seg: 11, num: "2", title: "WHAT A STEEPLECHASE IS" },
  { seg: 16, num: "3", title: "MAKING THE WEIGHT" },
  { seg: 23, num: "4", title: "THE RACE" },
  { seg: 31, num: "5", title: "PAST THE POST" },
  { seg: 37, num: "6", title: "THE LEGEND" },
  { seg: 44, num: "7", title: "THE WIN COUNTED" },
];
