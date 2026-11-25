// "The War Michigan Lost and Won Anyway" (Paradox Town Explained), 1920 x 1080: the Toledo War, 1835-36, and the copper after.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "In eighteen thirty-five, Ohio and Michigan raised armies and marched them at each other... over one little town.", show: "In 1835, Ohio and Michigan raised armies and marched them at each other... over one little town." },
  { say: "There were drums. There were rifles. There was a battle, sort of.", show: "There were drums. There were rifles. There was a battle, sort of." },
  { say: "And when it was all over, the only blood spilled in the entire war came from a penknife... held by a man named Two.", show: "And when it was all over, the only blood spilled in the entire war came from a penknife... held by a man named Two." },
  { say: "The strangest part? The side that lost the war ended up rich.", show: "The strangest part? The side that lost the war ended up rich." },
  { say: "This is the story of the Toledo War. If you like weird history, subscribe.", show: "This is the story of the Toledo War. If you like weird history, subscribe." },
  { say: "It all started with a bad map.", show: "It all started with a bad map." },
  { say: "In seventeen eighty-seven, Congress drew a line for the future states of the Northwest. It ran due east from the southern tip of Lake Michigan.", show: "In 1787, Congress drew a line for the future states of the Northwest. It ran due east from the southern tip of Lake Michigan." },
  { say: "The problem was, nobody knew exactly where that tip was. The best map of the day, the Mitchell Map, put it too far north.", show: "The problem was, nobody knew exactly where that tip was. The best map of the day, the Mitchell Map, put it too far north." },
  { say: "So when Ohio wrote its constitution in eighteen-oh-two, it hedged. If the line came out too far south, Ohio's border would bend up to the north cape of Maumee Bay... the mouth of the Maumee River.", show: "So when Ohio wrote its constitution in 1802, it hedged. If the line came out too far south, Ohio's border would bend up to the north cape of Maumee Bay... the mouth of the Maumee River." },
  { say: "Then the surveyors went out. And the tip of Lake Michigan was further south than anyone thought.", show: "Then the surveyors went out. And the tip of Lake Michigan was further south than anyone thought." },
  { say: "Two different surveys drew two different lines. Ohio liked the northern one. Michigan liked the southern one.", show: "Two different surveys drew two different lines. Ohio liked the northern one. Michigan liked the southern one." },
  { say: "Between them sat a strip of land of about four hundred and sixty-eight square miles. And near the mouth of the river sat a town that would soon be called Toledo.", show: "Between them sat a strip of land of about 468 square miles. And near the mouth of the river sat a town that would soon be called Toledo." },
  { say: "Why fight over a swampy strip of land? Because of canals.", show: "Why fight over a swampy strip of land? Because of canals." },
  { say: "In eighteen twenty-five, the Erie Canal opened, linking the Great Lakes to New York. Ohio was planning its own canal to reach Lake Erie at the Maumee.", show: "In 1825, the Erie Canal opened, linking the Great Lakes to New York. Ohio was planning its own canal to reach Lake Erie at the Maumee." },
  { say: "Whoever held the mouth of that river might hold the next great port of the West. Toledo was the prize.", show: "Whoever held the mouth of that river might hold the next great port of the West. Toledo was the prize." },
  { say: "For years, it was all letters and lawyers. Then, in eighteen thirty-five, Michigan wanted to become a state.", show: "For years, it was all letters and lawyers. Then, in 1835, Michigan wanted to become a state." },
  { say: "Michigan's acting governor was Stevens T. Mason. He'd taken the job at twenty-two. People called him the Boy Governor.", show: "Michigan's acting governor was Stevens T. Mason. He'd taken the job at 22. People called him the Boy Governor." },
  { say: "Ohio's governor was Robert Lucas, a former militia general more than twice his age.", show: "Ohio's governor was Robert Lucas, a former militia general more than twice his age." },
  { say: "In February, Ohio passed a law taking over the strip and setting up local government there.", show: "In February, Ohio passed a law taking over the strip and setting up local government there." },
  { say: "Six days later, Michigan passed the Pains and Penalties Act. Any Ohio official caught governing the strip could be fined up to a thousand dollars, or locked up for five years of hard labor.", show: "Six days later, Michigan passed the Pains and Penalties Act. Any Ohio official caught governing the strip could be fined up to $1,000, or locked up for 5 years of hard labor." },
  { say: "Lucas called out about six hundred militia. Mason called out around a thousand.", show: "Lucas called out about 600 militia. Mason called out around 1,000." },
  { say: "The one real battle came in April. An Ohio survey crew was re-marking Ohio's line through the woods at a place called Phillips Corners.", show: "The one real battle came in April. An Ohio survey crew was re-marking Ohio's line through the woods at a place called Phillips Corners." },
  { say: "A party of Michigan men caught up with them and fired. Over their heads, or at them, depending on whose story you believe.", show: "A party of Michigan men caught up with them and fired. Over their heads, or at them, depending on whose story you believe." },
  { say: "Nobody was hit. Nine surveyors were arrested. The rest ran back to Ohio and reported an armed force of several hundred men.", show: "Nobody was hit. Nine surveyors were arrested. The rest ran back to Ohio and reported an armed force of several hundred men." },
  { say: "Then came the Stickneys.", show: "Then came the Stickneys." },
  { say: "Major Benjamin Stickney lived in Toledo, and he was firmly on Ohio's side. He named his sons One and Two.", show: "Major Benjamin Stickney lived in Toledo, and he was firmly on Ohio's side. He named his sons One and Two." },
  { say: "In July, a Michigan deputy sheriff named Joseph Wood came to Toledo to make an arrest. Two Stickney pulled out a penknife and stabbed him.", show: "In July, a Michigan deputy sheriff named Joseph Wood came to Toledo to make an arrest. Two Stickney pulled out a penknife and stabbed him." },
  { say: "The wound wasn't serious. Wood recovered. Two ran off into Ohio, and Ohio refused to hand him over.", show: "The wound wasn't serious. Wood recovered. Two ran off into Ohio, and Ohio refused to hand him over." },
  { say: "That was it. The only blood of the Toledo War. Local histories record one other casualty: a horse.", show: "That was it. The only blood of the Toledo War. Local histories record one other casualty: a horse." },
  { say: "That summer, Ohio carved a new county out of the strip and named it Lucas County... after the governor.", show: "That summer, Ohio carved a new county out of the strip and named it Lucas County... after the governor." },
  { say: "In September, Ohio tried to prove the town was theirs. The new county's court rode into Toledo in the middle of the night and held a session by candlelight.", show: "In September, Ohio tried to prove the town was theirs. The new county's court rode into Toledo in the middle of the night and held a session by candlelight." },
  { say: "Then someone shouted that the Michigan militia was coming. The judges ran for it. The Michigan militia was not coming.", show: "Then someone shouted that the Michigan militia was coming. The judges ran for it. The Michigan militia was not coming." },
  { say: "By then, President Andrew Jackson had had enough of the Boy Governor. Ohio had a lot of electoral votes, and Jackson's party needed them. He removed Mason from office.", show: "By then, President Andrew Jackson had had enough of the Boy Governor. Ohio had a lot of electoral votes, and Jackson's party needed them. He removed Mason from office." },
  { say: "Michigan's voters didn't care. That fall, they elected Mason governor of the state they were trying to become.", show: "Michigan's voters didn't care. That fall, they elected Mason governor of the state they were trying to become." },
  { say: "In the summer of eighteen thirty-six, Congress made its offer. Michigan could become a state... if it gave Toledo to Ohio.", show: "In the summer of 1836, Congress made its offer. Michigan could become a state... if it gave Toledo to Ohio." },
  { say: "In exchange, Michigan would get the western part of the Upper Peninsula.", show: "In exchange, Michigan would get the western part of the Upper Peninsula." },
  { say: "Michigan was insulted. The Upper Peninsula was supposed to be a frozen wilderness. Rocks, snow, and trees. Nobody wanted it.", show: "Michigan was insulted. The Upper Peninsula was supposed to be a frozen wilderness. Rocks, snow, and trees. Nobody wanted it." },
  { say: "In September, a convention met in Ann Arbor to vote on the deal. They said no.", show: "In September, a convention met in Ann Arbor to vote on the deal. They said no." },
  { say: "But Michigan was stuck. There was money on the table. The federal government had a surplus, and it was about to share it out among the states. Territories didn't get any.", show: "But Michigan was stuck. There was money on the table. The federal government had a surplus, and it was about to share it out among the states. Territories didn't get any." },
  { say: "So in December, a second convention met in Ann Arbor, on a day so cold it became known as the Frostbitten Convention.", show: "So in December, a second convention met in Ann Arbor, on a day so cold it became known as the Frostbitten Convention." },
  { say: "On December fourteenth, eighteen thirty-six, they said yes.", show: "On December 14th, 1836, they said yes." },
  { say: "A few weeks later, on January twenty-sixth, eighteen thirty-seven, Michigan became the twenty-sixth state. Without Toledo.", show: "A few weeks later, on January 26th, 1837, Michigan became the 26th state. Without Toledo." },
  { say: "And then Michigan looked north.", show: "And then Michigan looked north." },
  { say: "In eighteen forty-one, the state geologist, Douglass Houghton, reported copper in the Upper Peninsula. A couple of years later, the rush was on.", show: "In 1841, the state geologist, Douglass Houghton, reported copper in the Upper Peninsula. A couple of years later, the rush was on." },
  { say: "Prospectors poured into the woods. Mines opened along the shore of Lake Superior.", show: "Prospectors poured into the woods. Mines opened along the shore of Lake Superior." },
  { say: "From eighteen forty-seven to eighteen eighty-seven, Michigan mined more copper than any other state in the country. Forty years on top.", show: "From 1847 to 1887, Michigan mined more copper than any other state in the country. 40 years on top." },
  { say: "And there was iron, too. The frozen wilderness Michigan didn't want turned out to be one of the richest pieces of ground in America.", show: "And there was iron, too. The frozen wilderness Michigan didn't want turned out to be one of the richest pieces of ground in America." },
  { say: "Toledo did fine too. The canals came, and the town became a busy port on Lake Erie. Ohio got exactly what it wanted.", show: "Toledo did fine too. The canals came, and the town became a busy port on Lake Erie. Ohio got exactly what it wanted." },
  { say: "But the argument never quite ended. In nineteen seventy-three, Michigan and Ohio were back in front of the Supreme Court, fighting over the line out in Lake Erie. Ohio won that one too.", show: "But the argument never quite ended. In 1973, Michigan and Ohio were back in front of the Supreme Court, fighting over the line out in Lake Erie. Ohio won that one too." },
  { say: "And every November, the two states still go to war... on a football field.", show: "And every November, the two states still go to war... on a football field." },
  { say: "So, who really won the Toledo War? Ohio, which got its port? Or Michigan, which lost the war and got rich? Tell me in the comments. And if you like weird history, subscribe.", show: "So, who really won the Toledo War? Ohio, which got its port? Or Michigan, which lost the war and got rich? Tell me in the comments. And if you like weird history, subscribe." },
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
  { seg: 5, num: "1", title: "A BAD MAP" },
  { seg: 12, num: "2", title: "THE PRIZE" },
  { seg: 15, num: "3", title: "THE BOY GOVERNOR" },
  { seg: 21, num: "4", title: "THE ONE REAL BATTLE" },
  { seg: 24, num: "5", title: "ONE AND TWO" },
  { seg: 29, num: "6", title: "THE MIDNIGHT COURT" },
  { seg: 34, num: "7", title: "THE DEAL" },
  { seg: 42, num: "8", title: "THE FROZEN WASTELAND" },
  { seg: 47, num: "9", title: "WHO WON?" },
];

// ---------------- shots ----------------
/** k: "3d" = rendered scene (story3d.ts), "2d" = motion graphic (boards.tsx). A shot starts at segment `s` (or at word
 *  `w` inside it) and runs until the next shot. g = graphic / shot key. */
export type Kind = "3d" | "2d";
type RawShot = { s: number; w: string | null; k: Kind; g: string };
const D3 = (s: number, w: string | null, g: string): RawShot => ({ s, w, k: "3d", g }), D2 = (s: number, w: string | null, g: string): RawShot => ({ s, w, k: "2d", g });
const raw: RawShot[] = [
  // cold open
  D3(0, null, "hook"), D3(0, "marched", "mimarch"), D3(0, "over", "toledo"),
  D3(1, null, "mimarch2"), D3(1, "battle", "fire"),
  D3(2, null, "stab"), D3(2, "held", "knife"),
  D2(3, null, "strangest"), D3(3, "ended", "rich"),
  D2(4, null, "title"),
  // 1 a bad map
  D2(5, null, "lines:0"),
  D2(6, null, "lines:1"),
  D2(7, null, "lines:2"),
  D2(8, null, "lines:3"),
  D3(9, null, "survey"), D2(9, "tip", "lines:4"),
  D2(10, null, "lines:5"),
  D2(11, null, "lines:6"), D3(11, "near", "toledo2"),
  // 2 the prize
  D3(12, null, "river"), D2(12, "because", "canals"),
  D2(13, null, "lines:7"),
  D3(14, null, "port"), D3(14, "toledo", "toledo3"),
  // 3 the boy governor
  D3(15, null, "strip"), D2(15, "then", "statehood"),
  D3(16, null, "mason"), D3(16, "22", "boy"), D2(16, "people", "boygov"),
  D3(17, null, "lucas"),
  D2(18, null, "feb"),
  D2(19, null, "pains"),
  D3(20, null, "lucas2"), D3(20, "mason", "mimarch"), D2(20, "1,000", "armies"),
  // 4 the one real battle
  D3(21, null, "survey2"), D2(21, "phillips", "phillips"),
  D3(22, null, "ambush"), D3(22, "fired", "fire"), D3(22, "over", "duck"),
  D3(23, null, "nobody"), D2(23, "nine", "nine"), D3(23, "reported", "mimarch3"),
  // 5 one and two
  D3(24, null, "tavern0"),
  D2(25, null, "sons"), D3(25, "named", "one"),
  D3(26, null, "wood"), D3(26, "two", "tavern"), D3(26, "penknife", "stab"),
  D3(27, null, "lived"), D3(27, "two", "tworun"),
  D2(28, null, "onlyblood"),
  // 6 the midnight court
  D2(29, null, "lucascounty"), D3(29, "after", "ohio"),
  D2(30, null, "sept"), D3(30, "held", "court"),
  D3(31, null, "court2"), D2(31, "not", "notcoming"),
  D2(32, null, "jackson"), D3(32, "removed", "masonsad"),
  D3(33, null, "boy2"),
  // 7 the deal
  D3(34, null, "congress"), D3(34, "michigan", "deal"),
  D3(35, null, "up"),
  D3(36, null, "furious"), D3(36, "upper", "snow"),
  D2(37, null, "annarbor"), D3(37, "they", "no"),
  D3(38, null, "broke"), D2(38, "federal", "surplus"),
  D3(39, null, "frost"),
  D3(40, null, "yes2"),
  D2(41, null, "statehood2"),
  // 8 the frozen wasteland
  D3(42, null, "snow2"),
  D2(43, null, "houghton"), D3(43, "couple", "copper"),
  D3(44, null, "prospect"), D3(44, "mines", "mine"),
  D2(45, null, "n40"), D3(45, "40", "mine2"),
  D3(46, null, "north"),
  // 9 who won?
  D3(47, null, "port2"), D3(47, "ohio", "ohio"),
  D2(48, null, "court1973"),
  D3(49, null, "hook2"),
  D3(50, null, "endhook"), D2(50, "tell", "question"),
];
export type ShotDef = RawShot & { id: number; a: number; b: number };
export const SHOTS: ShotDef[] = raw.map((r, i) => ({ ...r, id: i + 1, a: 0, b: 0 }));
SHOTS.forEach((s, i) => { s.a = i === 0 ? 0 : (s.w ? wordAt(s.s, s.w) : segAt(s.s)) - 2; }); // cuts land ~2 f before the word
SHOTS.forEach((s, i) => { s.b = i === SHOTS.length - 1 ? VOICE_END : SHOTS[i + 1].a; });
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? null;
/** chapter-start crossfade (frames) */
export const XFADE = 10;
export const CHAPTER_SHOTS = new Set(CHAPTERS.map((c) => SHOTS.find((s) => s.s >= c.seg)!.id));
