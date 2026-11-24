// "The Town That Set Itself on Fire" (Paradox Town Explained, long-form #12), 1920 x 1080: Centralia, Pennsylvania, 1962 to today.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "There's a town in Pennsylvania where the ground can be warm in the middle of winter... where smoke comes up out of the road... and where the air can smell like rotten eggs.", show: "There's a town in Pennsylvania where the ground can be warm in the middle of winter... where smoke comes up out of the road... and where the air can smell like rotten eggs." },
  { say: "That's because there's a fire under it. It's been burning since nineteen sixty-two.", show: "That's because there's a fire under it. It's been burning since 1962." },
  { say: "Almost everyone who lived there is gone. The houses are gone. Even the ZIP code is gone.", show: "Almost everyone who lived there is gone. The houses are gone. Even the ZIP code is gone." },
  { say: "And the strangest part? The fire most likely started because the town was cleaning up for a holiday.", show: "And the strangest part? The fire most likely started because the town was cleaning up for a holiday." },
  { say: "This is the story of Centralia. If you like weird history, subscribe.", show: "This is the story of Centralia. If you like weird history, subscribe." },
  { say: "Centralia sat in the hard coal country of eastern Pennsylvania. For a hundred years, miners dug anthracite out of the ground underneath it. The hardest, hottest burning coal there is.", show: "Centralia sat in the hard coal country of eastern Pennsylvania. For a hundred years, miners dug anthracite out of the ground underneath it. The hardest, hottest burning coal there is." },
  { say: "By the early nineteen sixties, most of the mines had closed. But the tunnels were still down there. Miles of them, running under the streets, the churches, and the houses.", show: "By the early 1960s, most of the mines had closed. But the tunnels were still down there. Miles of them, running under the streets, the churches, and the houses." },
  { say: "About eleven hundred people still lived on top of them.", show: "About 1,100 people still lived on top of them." },
  { say: "In May of nineteen sixty-two, the borough council had a problem. Its new dump, in an old strip-mine pit next to the Odd Fellows Cemetery, was a mess. And Memorial Day was coming.", show: "In May of 1962, the borough council had a problem. Its new dump, in an old strip-mine pit next to the Odd Fellows Cemetery, was a mess. And Memorial Day was coming." },
  { say: "So the council hired the volunteer firemen to clean it up. The way it had been done before... by setting it on fire.", show: "So the council hired the volunteer firemen to clean it up. The way it had been done before... by setting it on fire." },
  { say: "On May twenty-seventh, they lit the rubbish, let it burn for a while, and then hosed it out.", show: "On May 27th, they lit the rubbish, let it burn for a while, and then hosed it out." },
  { say: "A few days later, smoke was coming out of the pit again. They put it out again. And it came back again.", show: "A few days later, smoke was coming out of the pit again. They put it out again. And it came back again." },
  { say: "What nobody had sealed off was an opening in the wall of that pit. An opening that led down into the old mine tunnels.", show: "What nobody had sealed off was an opening in the wall of that pit. An opening that led down into the old mine tunnels." },
  { say: "That's the most accepted version. Some people in Centralia always said the fire came from somewhere else, like an old mine fire from the nineteen thirties that never really went out. People still argue about it.", show: "That's the most accepted version. Some people in Centralia always said the fire came from somewhere else, like an old mine fire from the 1930s that never really went out. People still argue about it." },
  { say: "But either way, by August, inspectors found deadly carbon monoxide in the mines around town. The next day, every one of them was shut down.", show: "But either way, by August, inspectors found deadly carbon monoxide in the mines around town. The next day, every one of them was shut down." },
  { say: "Here's the thing about a fire in a coal mine. You can't see it. You can't reach it. It creeps through the tunnels, eating coal, pulling in air through every crack it can find.", show: "Here's the thing about a fire in a coal mine. You can't see it. You can't reach it. It creeps through the tunnels, eating coal, pulling in air through every crack it can find." },
  { say: "Crews started digging that same year, trying to get ahead of the fire and dig the burning coal out. At the end of October, the money ran out. The fire didn't.", show: "Crews started digging that same year, trying to get ahead of the fire and dig the burning coal out. At the end of October, the money ran out. The fire didn't." },
  { say: "They tried flushing the mines, pumping crushed rock and water down boreholes to wall the fire off. They dug trenches. They tried again, and again.", show: "They tried flushing the mines, pumping crushed rock and water down boreholes to wall the fire off. They dug trenches. They tried again, and again." },
  { say: "From nineteen sixty-two to nineteen seventy-eight, the state and federal governments spent three point three million dollars fighting it. In the state's own words, with limited results.", show: "From 1962 to 1978, the state and federal governments spent $3.3 million fighting it. In the state's own words, with limited results." },
  { say: "And the whole time, people just kept living there.", show: "And the whole time, people just kept living there." },
  { say: "Some of it was almost funny. People said the ground got so warm, they could grow tomatoes in winter.", show: "Some of it was almost funny. People said the ground got so warm, they could grow tomatoes in winter." },
  { say: "Then, in nineteen seventy-nine, the mayor, John Coddington, who also ran the gas station, dipped a stick into one of his underground fuel tanks. It came up hot.", show: "Then, in 1979, the mayor, John Coddington, who also ran the gas station, dipped a stick into one of his underground fuel tanks. It came up hot." },
  { say: "He lowered a thermometer down on a string. The gasoline was a hundred and seventy-two degrees.", show: "He lowered a thermometer down on a string. The gasoline was 172 degrees." },
  { say: "The station was shut and the tanks were emptied. It became the first building in Centralia torn down because of the fire.", show: "The station was shut and the tanks were emptied. It became the first building in Centralia torn down because of the fire." },
  { say: "By now, families had gas monitors in their homes. People got headaches and felt dizzy. Smoke came up out of the lawns. And gas crept into basements.", show: "By now, families had gas monitors in their homes. People got headaches and felt dizzy. Smoke came up out of the lawns. And gas crept into basements." },
  { say: "But the town couldn't agree on how bad it really was. Some people wanted out. Others thought it was being blown out of proportion.", show: "But the town couldn't agree on how bad it really was. Some people wanted out. Others thought it was being blown out of proportion." },
  { say: "That changed on Valentine's Day, nineteen eighty-one.", show: "That changed on Valentine's Day, 1981." },
  { say: "Twelve-year-old Todd Domboski was in his grandmother's back yard when he saw steam rising from the ground. He walked over to look.", show: "12-year-old Todd Domboski was in his grandmother's back yard when he saw steam rising from the ground. He walked over to look." },
  { say: "And the ground gave way under his feet.", show: "And the ground gave way under his feet." },
  { say: "Todd dropped into a hole full of hot steam. He grabbed the roots of a tree and held on, yelling for help.", show: "Todd dropped into a hole full of hot steam. He grabbed the roots of a tree and held on, yelling for help." },
  { say: "His cousin Eric heard him. The steam was so thick he could barely see him. But he spotted Todd's red cap, reached down, and pulled him out, covered in mud.", show: "His cousin Eric heard him. The steam was so thick he could barely see him. But he spotted Todd's red cap, reached down, and pulled him out, covered in mud." },
  { say: "When the hole was measured, it was about a hundred and fifty feet deep. And the air in it had enough carbon monoxide to kill.", show: "When the hole was measured, it was about 150 feet deep. And the air in it had enough carbon monoxide to kill." },
  { say: "A boy had almost died in his own family's yard. Now the whole country was watching.", show: "A boy had almost died in his own family's yard. Now the whole country was watching." },
  { say: "A federal study worked out what it would take to actually put the fire out: dig it all up. The price was six hundred and sixty-three million dollars, with no promise it would work.", show: "A federal study worked out what it would take to actually put the fire out: dig it all up. The price was $663 million, with no promise it would work." },
  { say: "Moving everyone away would cost far less.", show: "Moving everyone away would cost far less." },
  { say: "In August of nineteen eighty-three, Centralia's property owners voted. Stay, or go. Leaving won, by almost two to one.", show: "In August of 1983, Centralia's property owners voted. Stay, or go. Leaving won, by almost 2 to 1." },
  { say: "Congress put up forty-two million dollars. Families sold, packed up, and left. And one by one, the houses came down.", show: "Congress put up $42 million. Families sold, packed up, and left. And one by one, the houses came down." },
  { say: "By the end of the eighties, more than a thousand people had moved away, and about five hundred buildings were gone.", show: "By the end of the '80s, more than 1,000 people had moved away, and about 500 buildings were gone." },
  { say: "But not everyone left. Dozens of people refused to sell. This was home. Some even believed the state really wanted the coal under the town. Officials always denied that.", show: "But not everyone left. Dozens of people refused to sell. This was home. Some even believed the state really wanted the coal under the town. Officials always denied that." },
  { say: "In nineteen ninety-two, Pennsylvania used eminent domain to take every property left in Centralia. On paper, the people still living there didn't own their own houses anymore.", show: "In 1992, Pennsylvania used eminent domain to take every property left in Centralia. On paper, the people still living there didn't own their own houses anymore." },
  { say: "The main highway into town, Route sixty-one, had buckled and cracked from the heat. In nineteen ninety-three, it was closed and moved.", show: "The main highway into town, Route 61, had buckled and cracked from the heat. In 1993, it was closed and moved." },
  { say: "In two thousand two, the Postal Service took away Centralia's ZIP code.", show: "In 2002, the Postal Service took away Centralia's ZIP code." },
  { say: "The holdouts went to court. And they kept fighting for twenty years.", show: "The holdouts went to court. And they kept fighting for 20 years." },
  { say: "In twenty thirteen, they won a settlement. The last residents could stay in their homes for the rest of their lives, and they were paid three hundred forty-nine thousand, five hundred dollars between them. When they're gone, the state gets the land.", show: "In 2013, they won a settlement. The last residents could stay in their homes for the rest of their lives, and they were paid $349,500 between them. When they're gone, the state gets the land." },
  { say: "Meanwhile, that closed stretch of Route sixty-one became something nobody planned. A tourist attraction.", show: "Meanwhile, that closed stretch of Route 61 became something nobody planned. A tourist attraction." },
  { say: "People came from all over to spray-paint the cracked, steaming road. It became known as the Graffiti Highway.", show: "People came from all over to spray-paint the cracked, steaming road. It became known as the Graffiti Highway." },
  { say: "Then, in twenty twenty, as crowds kept coming, the owner had it buried under about four hundred truckloads of dirt.", show: "Then, in 2020, as crowds kept coming, the owner had it buried under about 400 truckloads of dirt." },
  { say: "In the twenty twenty census, Centralia had five people.", show: "In the 2020 census, Centralia had 5 people." },
  { say: "The streets are still there, running through the woods with nothing on them. A church still stands on the hill.", show: "The streets are still there, running through the woods with nothing on them. A church still stands on the hill." },
  { say: "And under it all, the fire is still burning. At the rate it's going, it could burn for another two hundred and fifty years.", show: "And under it all, the fire is still burning. At the rate it's going, it could burn for another 250 years." },
  { say: "Fighting the fire and moving the town cost almost forty-nine million dollars in all.", show: "Fighting the fire and moving the town cost almost $49 million in all." },
  { say: "All because, one spring, a town wanted its dump cleaned up before Memorial Day.", show: "All because, one spring, a town wanted its dump cleaned up before Memorial Day." },
  { say: "If you liked this one, subscribe. And tell me in the comments: would you have taken the buyout, or stayed?", show: "If you liked this one, subscribe. And tell me in the comments: would you have taken the buyout, or stayed?" },
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
  { seg: 5, num: "1", title: "A COAL TOWN" },
  { seg: 8, num: "2", title: "THE DUMP" },
  { seg: 15, num: "3", title: "A FIRE YOU CAN'T REACH" },
  { seg: 20, num: "4", title: "THE WARNING SIGNS" },
  { seg: 26, num: "5", title: "THE HOLE" },
  { seg: 32, num: "6", title: "STAY OR GO" },
  { seg: 37, num: "7", title: "THE HOLDOUTS" },
  { seg: 43, num: "8", title: "THE GRAFFITI HIGHWAY" },
  { seg: 46, num: "9", title: "CENTRALIA TODAY" },
];

// ---------------- shots ----------------
/** k: "3d" = rendered scene (story3d.ts), "2d" = motion graphic (boards.tsx). A shot starts at segment `s` (or at word
 *  `w` inside it) and runs until the next shot. g = graphic / shot key. */
export type Kind = "3d" | "2d";
type RawShot = { s: number; w: string | null; k: Kind; g: string };
const D3 = (s: number, w: string | null, g: string): RawShot => ({ s, w, k: "3d", g }), D2 = (s: number, w: string | null, g: string): RawShot => ({ s, w, k: "2d", g });
const raw: RawShot[] = [
  D3(0, null, "hook"),
];
export type ShotDef = RawShot & { id: number; a: number; b: number };
export const SHOTS: ShotDef[] = raw.map((r, i) => ({ ...r, id: i + 1, a: 0, b: 0 }));
SHOTS.forEach((s, i) => { s.a = i === 0 ? 0 : (s.w ? wordAt(s.s, s.w) : segAt(s.s)) - 2; }); // cuts land ~2 f before the word
SHOTS.forEach((s, i) => { s.b = i === SHOTS.length - 1 ? VOICE_END : SHOTS[i + 1].a; });
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? null;
/** chapter-start crossfade (frames) */
export const XFADE = 10;
export const CHAPTER_SHOTS = new Set(CHAPTERS.map((c) => SHOTS.find((s) => s.s >= c.seg)!.id));
