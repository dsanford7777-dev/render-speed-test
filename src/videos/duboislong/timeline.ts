// "The Town That Says Its Own Name Wrong on Purpose" (Paradox Town Explained), 1920 x 1080: Dubois, Wyoming, 1889 and today.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "There's a town in Wyoming where, if you say its name correctly, everyone knows you're not from there.", show: "There's a town in Wyoming where, if you say its name correctly, everyone knows you're not from there." },
  { say: "It's spelled D, U, B, O, I, S. A French name. Doo-bwah. But the people who live there say Doo-boys. And they say it that way on purpose.", show: "It's spelled D-U-B-O-I-S. A French name. Doo-BWAH. But the people who live there say DOO-boys. And they say it that way on purpose." },
  { say: "To find out why, we have to go back to eighteen eighty-nine. To a Welsh priest, a politician from the wrong state, and a bottle of red ink.", show: "To find out why, we have to go back to 1889. To a Welsh priest, a politician from the wrong state, and a bottle of red ink." },
  { say: "If you like weird history, subscribe. Now, let's go to Horse Creek.", show: "If you like weird history, subscribe. Now, let's go to Horse Creek." },
  { say: "In the late eighteen-eighties, the upper Wind River valley in Wyoming Territory was sagebrush, red badlands and mountains.", show: "In the late 1880s, the upper Wind River valley in Wyoming Territory was sagebrush, red badlands and mountains." },
  { say: "A handful of homesteaders had settled along Horse Creek, raising cattle and horses.", show: "A handful of homesteaders had settled along Horse Creek, raising cattle and horses." },
  { say: "The closest post office was at Fort Washakie, about sixty-five miles away. Mail came by stage, and then on horseback.", show: "The closest post office was at Fort Washakie, about 65 miles away. Mail came by stage, and then on horseback." },
  { say: "For about a year, settlers packed the mail from the fort to the cabin of a rancher named Charles Smith.", show: "For about a year, settlers packed the mail from the fort to the cabin of a rancher named Charles Smith." },
  { say: "So the settlers decided they wanted a post office of their own. And a post office needs a name.", show: "So the settlers decided they wanted a post office of their own. And a post office needs a name." },
  { say: "The rules said it had to be original. It couldn't look like the name of any other post office in the territory.", show: "The rules said it had to be original. It couldn't look like the name of any other post office in the territory." },
  { say: "The name they chose was Teebo.", show: "The name they chose was Tibo." },
  { say: "Teebo is a Shoshone word. It means stranger, or white man. And it was the Shoshone people's fond nickname for one man in particular.", show: "Tibo is a Shoshone word. It means stranger, or white man. And it was the Shoshone people's fond nickname for one man in particular." },
  { say: "The Reverend John Roberts, an Episcopal priest from Wales.", show: "The Reverend John Roberts, an Episcopal priest from Wales." },
  { say: "He arrived at Fort Washakie in eighteen eighty-three, in a winter so cold the temperature reportedly hit sixty below.", show: "He arrived at Fort Washakie in 1883, in a winter so cold the temperature reportedly hit 60 below." },
  { say: "He spent the rest of his life working among the Shoshone and the Arapaho. And he served the homesteaders on Horse Creek, too.", show: "He spent the rest of his life working among the Shoshone and the Arapaho. And he served the homesteaders on Horse Creek, too." },
  { say: "So the settlers picked Teebo. A name that honored both their priest and their Shoshone neighbors.", show: "So the settlers picked Tibo. A name that honored both their priest and their Shoshone neighbors." },
  { say: "In eighteen eighty-nine, a year before Wyoming became a state, the application went off to Washington, with Teebo written on it in black ink.", show: "In 1889, a year before Wyoming became a state, the application went off to Washington, with Tibo written on it in black ink." },
  { say: "When it came back, someone had changed it. In red ink. The new name was Doo-bwah.", show: "When it came back, someone had changed it. In red ink. The new name was Dubois." },
  { say: "The post office opened on August sixth, eighteen eighty-nine, with Charles Smith as its first postmaster.", show: "The post office opened on August 6, 1889, with Charles Smith as its first postmaster." },
  { say: "And by one local account, Smith couldn't even write. A young man named Billy Simpson may have filled out the form for him.", show: "And by one local account, Smith couldn't even write. A young man named Billy Simpson may have filled out the form for him." },
  { say: "Nobody in the valley had asked for that name. So where did it come from?", show: "Nobody in the valley had asked for that name. So where did it come from?" },
  { say: "Here's the strange part. Nobody agrees.", show: "Here's the strange part. Nobody agrees." },
  { say: "Suspect number one is Fred Doo-bwah himself. Some accounts say he sat on a postal committee in Washington, didn't like the Shoshone name, and put down his own.", show: "Suspect number one is Fred Dubois himself. Some accounts say he sat on a postal committee in Washington, didn't like the Shoshone name, and put down his own." },
  { say: "Suspect number two is Joseph Carey, Wyoming's delegate in Congress, who supposedly named it after his friend.", show: "Suspect number two is Joseph Carey, Wyoming's delegate in Congress, who supposedly named it after his friend." },
  { say: "Suspect number three is a postmaster, Hewie Youmans. One old-timer remembered him picking the name.", show: "Suspect number three is a postmaster, Hewie Youmans. One old-timer remembered him picking the name." },
  { say: "And suspect number four confessed.", show: "And suspect number four confessed." },
  { say: "In nineteen thirty-seven, Billy Simpson, by then a lawyer in Jackson, told a newspaper the name had been his idea.", show: "In 1937, Billy Simpson, by then a lawyer in Jackson, told a newspaper the name had been his idea." },
  { say: "He said he suggested it at a meeting on Horse Creek, after a family named Doo-bwah he knew in Colorado.", show: "He said he suggested it at a meeting on Horse Creek, after a family named Dubois he knew in Colorado." },
  { say: "He even remembered an excited old French trapper at that meeting, shouting: the woods! The woods!", show: "He even remembered an excited old French trapper at that meeting, shouting: the woods! The woods!" },
  { say: "Which is funny, because in French, du bwah means, of the wood.", show: "Which is funny, because in French, du bois means \"of the wood.\"" },
  { say: "Still, most of the stories point to one man.", show: "Still, most of the stories point to one man." },
  { say: "Fred Doo-bwah was born in Illinois and went to Yale. In Idaho Territory, he became a U.S. marshal, and made his name crusading against Mormon voters.", show: "Fred Dubois was born in Illinois and went to Yale. In Idaho Territory, he became a U.S. marshal, and made his name crusading against Mormon voters." },
  { say: "In eighteen eighty-six, he was elected Idaho's delegate to Congress. When Idaho became a state, he became its senator.", show: "In 1886, he was elected Idaho's delegate to Congress. When Idaho became a state, he became its senator." },
  { say: "By one account, apart from a single cattle drive, he never spent much time in Wyoming.", show: "By one account, apart from a single cattle drive, he never spent much time in Wyoming." },
  { say: "And Wyoming wasn't the only place with his name. Doo-boys, Idaho, about two hundred miles away, is named after him too.", show: "And Wyoming wasn't the only place with his name. Dubois, Idaho, about 200 miles away, is named after him too." },
  { say: "Now, here's where the spite comes in.", show: "Now, here's where the spite comes in." },
  { say: "Fred Doo-bwah said his name the French way. Doo-bwah. Historian Leo Graff wrote that he hated it when people said the end as boys.", show: "Fred Dubois said his name the French way. Doo-BWAH. Historian Leo Graff wrote that he hated it when people said the end as \"boys.\"" },
  { say: "So, the story goes, the people of Doo-boys, Wyoming, said boys. Doo-boys. Loudly. Every single time.", show: "So, the story goes, the people of Dubois, Wyoming, said \"boys.\" DOO-boys. Loudly. Every single time." },
  { say: "To this day, signs in town spell it out for visitors. And calling it Doo-bwah marks you as a tourist.", show: "To this day, signs in town spell it out for visitors. And calling it doo-BWAH marks you as a tourist." },
  { say: "Even the Arapaho have a joke about it. One of their names for the town means two boys.", show: "Even the Arapaho have a joke about it. One of their names for the town means \"two boys.\"" },
  { say: "To be fair, there's another theory. Maybe nobody was being spiteful at all. Maybe it's just how cowboys read the word. After all, Doo-boys, Idaho, says Doo-boys too.", show: "To be fair, there's another theory. Maybe nobody was being spiteful at all. Maybe it's just how cowboys read the word. After all, Dubois, Idaho, says DOO-boys too." },
  { say: "But the spite story is the one the town tells. And it stuck.", show: "But the spite story is the one the town tells. And it stuck." },
  { say: "The little post office also had an interesting new neighbor.", show: "The little post office also had an interesting new neighbor." },
  { say: "In the fall of eighteen eighty-nine, a young cowboy rode into the valley with a small herd of horses and a love of horse racing.", show: "In the fall of 1889, a young cowboy rode into the valley with a small herd of horses and a love of horse racing." },
  { say: "He and a partner, Al Hainer, started a ranch on Horse Creek. Tax records show they owed twenty-seven dollars and eleven cents on it for eighteen ninety.", show: "He and a partner, Al Hainer, started a ranch on Horse Creek. Tax records show they owed $27.11 on it for 1890." },
  { say: "His name was Robert LeRoy Parker. You know him as Butch Cassidy.", show: "His name was Robert LeRoy Parker. You know him as Butch Cassidy." },
  { say: "A few years later, he was arrested for horse theft, and sent to prison.", show: "A few years later, he was arrested for horse theft, and sent to prison." },
  { say: "You might also read that the town was almost named Neversweat. That was a different place.", show: "You might also read that the town was almost named Neversweat. That was a different place." },
  { say: "Neversweat was a tiny post office about fifteen miles away. It opened in eighteen ninety-five, and closed two years later. Local historians say it was never a choice between the two.", show: "Neversweat was a tiny post office about 15 miles away. It opened in 1895, and closed two years later. Local historians say it was never a choice between the two." },
  { say: "Doo-boys finally became an incorporated town in nineteen fourteen.", show: "Dubois finally became an incorporated town in 1914." },
  { say: "It's still small. Its ZIP code covers more ground than the whole state of Rhode Island.", show: "It's still small. Its ZIP code covers more ground than the whole state of Rhode Island." },
  { say: "And Teebo? It never made it onto a map.", show: "And Tibo? It never made it onto a map." },
  { say: "If you enjoyed this, subscribe for a new weird history story every day.", show: "If you enjoyed this, subscribe for a new weird history story every day." },
  { say: "So here's my question. If a stranger renamed your town... would you say it his way, or yours?", show: "So here's my question. If a stranger renamed your town... would you say it his way, or yours?" },
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
  { seg: 4, num: "1", title: "65 MILES FOR A LETTER" },
  { seg: 10, num: "2", title: "TIBO" },
  { seg: 17, num: "3", title: "THE RED INK" },
  { seg: 21, num: "4", title: "FOUR SUSPECTS" },
  { seg: 30, num: "5", title: "THE MAN FROM IDAHO" },
  { seg: 35, num: "6", title: "DOO-BOYS" },
  { seg: 42, num: "7", title: "THE NEIGHBOR" },
  { seg: 47, num: "8", title: "NEVERSWEAT?" },
  { seg: 49, num: "9", title: "THE NAME STUCK" },
];

// ---------------- shots ----------------
/** k: "3d" = rendered scene (story3d.ts), "2d" = motion graphic (boards.tsx). A shot starts at segment `s` (or at word
 *  `w` inside it) and runs until the next shot. g = graphic / shot key. */
export type Kind = "3d" | "2d";
type RawShot = { s: number; w: string | null; k: Kind; g: string };
const D3 = (s: number, w: string | null, g: string): RawShot => ({ s, w, k: "3d", g }), D2 = (s: number, w: string | null, g: string): RawShot => ({ s, w, k: "2d", g });
const raw: RawShot[] = [
  // cold open
  D3(0, null, "hook"), D3(0, "correctly", "tourist"), D3(0, "everyone", "stare"),
  D2(1, null, "spell"), D3(1, "people", "today"), D3(1, "purpose", "purpose"),
  D3(2, null, "valley"), D3(2, "welsh", "roberts"), D3(2, "politician", "fred"), D2(2, "red", "redink"),
  D3(3, null, "hookL"),
  // 1 65 miles for a letter
  D3(4, null, "valley2"), D3(4, "badlands", "badlands"),
  D3(5, null, "ranchers"), D3(5, "raising", "corral"),
  D2(6, null, "n65"), D3(6, "stage", "miles"), D3(6, "horseback", "mail"),
  D3(7, null, "mail2"), D3(7, "charles", "smithdoor"),
  D3(8, null, "wanted"), D3(8, "needs", "meeting"),
  D2(9, null, "rules"),
  // 2 Tibo
  D3(10, null, "write"),
  D2(11, null, "tiboword"), D3(11, "fond", "mission"),
  D3(12, null, "roberts"),
  D2(13, null, "cold"), D3(13, "winter", "chapel"),
  D3(14, null, "nick"), D3(14, "served", "visit"),
  D3(15, null, "town2"),
  D2(16, null, "statehood"), D3(16, "application", "tibo"),
  // 3 the red ink
  D3(17, null, "clerk"), D3(17, "red", "red"), D2(17, "new", "newname"),
  D2(18, null, "aug6"), D3(18, "charles", "postmaster"),
  D3(19, null, "write2"), D3(19, "billy", "simpson"),
  D3(20, null, "letter"), D3(20, "so", "who"),
  // 4 four suspects
  D2(21, null, "suspects:0"),
  D2(22, null, "suspects:1"), D3(22, "postal", "himself"),
  D2(23, null, "suspects:2"), D3(23, "supposedly", "friend"),
  D2(24, null, "suspects:3"), D3(24, "old-timer", "smithdoor"),
  D2(25, null, "suspects:4"),
  D3(26, null, "lawyer"), D2(26, "told", "news"),
  D3(27, null, "meeting"), D3(27, "family", "lawyer2"),
  D3(28, null, "trapper"),
  D2(29, null, "wood"),
  // 5 the man from Idaho
  D3(30, null, "fred"),
  D2(31, null, "fredbio"), D3(31, "crusading", "congress"),
  D2(32, null, "delegate"), D3(32, "senator", "fredL"),
  D3(33, null, "barely"),
  D3(34, null, "map"), D2(34, "dubois", "twotowns"),
  // 6 DOO-boys
  D3(35, null, "town"),
  D3(36, null, "twist"), D2(36, "graff", "graff"), D3(36, "boys", "boys"),
  D3(37, null, "town3"), D3(37, "doo-boys", "shout"), D3(37, "every", "every"),
  D3(38, null, "signL"), D3(38, "calling", "tourist"), D3(38, "tourist", "stare"),
  D2(39, null, "twoboys"),
  D2(40, null, "theory"), D3(40, "cowboys", "cowboys"),
  D3(41, null, "wink"),
  // 7 the neighbor
  D3(42, null, "butchfar"),
  D3(43, null, "butch"), D3(43, "racing", "herd"),
  D2(44, null, "tax"), D3(44, "tax", "ranch"),
  D2(45, null, "parker"), D3(45, "you", "creek"),
  D2(46, null, "prison"),
  // 8 Neversweat?
  D2(47, null, "never"),
  D3(48, null, "valley3"), D2(48, "local", "notchoice"),
  // 9 the name stuck
  D2(49, null, "n1914"), D3(49, "town", "todaywide"),
  D2(50, null, "zip"),
  D3(51, null, "chapel2"), D2(51, "never", "notibo"),
  D3(52, null, "hookR"),
  D2(53, null, "endq"),
];
export type ShotDef = RawShot & { id: number; a: number; b: number };
export const SHOTS: ShotDef[] = raw.map((r, i) => ({ ...r, id: i + 1, a: 0, b: 0 }));
SHOTS.forEach((s, i) => { s.a = i === 0 ? 0 : (s.w ? wordAt(s.s, s.w) : segAt(s.s)) - 2; }); // cuts land ~2 f before the word
SHOTS.forEach((s, i) => { s.b = i === SHOTS.length - 1 ? VOICE_END : SHOTS[i + 1].a; });
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? null;
/** chapter-start crossfade (frames) */
export const XFADE = 10;
export const CHAPTER_SHOTS = new Set(CHAPTERS.map((c) => SHOTS.find((s) => s.s >= c.seg)!.id));
