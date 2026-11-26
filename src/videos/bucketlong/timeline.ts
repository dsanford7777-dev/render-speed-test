// "The War of the Bucket" (Paradox Town Explained), 1920 x 1080: Bologna vs Modena, 1325, and how a stolen bucket became the story.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "Around two thousand men were killed or wounded in a single evening... and the winners went home carrying a bucket.", show: "Around 2,000 men were killed or wounded in a single evening... and the winners went home carrying a bucket." },
  { say: "A plain wooden bucket, taken from a well.", show: "A plain wooden bucket, taken from a well." },
  { say: "For four hundred years, people have said the whole war started because somebody stole it.", show: "For 400 years, people have said the whole war started because somebody stole it." },
  { say: "It didn't. The real story is stranger.", show: "It didn't. The real story is stranger." },
  { say: "If you like weird history, subscribe.", show: "If you like weird history, subscribe." },
  { say: "Northern Italy, thirteen twenty-five. Bologna and Modena sit about twenty-five miles apart, on the same old Roman road.", show: "Northern Italy, 1325. Bologna and Modena sit about 25 miles apart, on the same old Roman road." },
  { say: "Bologna is big and rich, with one of the oldest universities in Europe. Modena is smaller.", show: "Bologna is big and rich, with one of the oldest universities in Europe. Modena is smaller." },
  { say: "And for more than a century, Italy has been split in two.", show: "And for more than a century, Italy has been split in two." },
  { say: "On one side, the Guelphs, who back the Pope. On the other, the Ghibellines, who back the Holy Roman Emperor.", show: "On one side, the Guelphs, who back the Pope. On the other, the Ghibellines, who back the Holy Roman Emperor." },
  { say: "Bologna is Guelph. Modena is Ghibelline.", show: "Bologna is Guelph. Modena is Ghibelline." },
  { say: "Cities pick sides. Families pick sides. And the border between these two cities is lined with castles that keep changing hands.", show: "Cities pick sides. Families pick sides. And the border between these two cities is lined with castles that keep changing hands." },
  { say: "Back in twelve ninety-six, Bologna took two of Modena's border towns, Bazzano and Savigno, and the Pope backed Bologna's claim.", show: "Back in 1296, Bologna took two of Modena's border towns, Bazzano and Savigno, and the Pope backed Bologna's claim." },
  { say: "By thirteen twenty-five, Modena is run by a man from Mantua: Passerino Bonacolsi.", show: "By 1325, Modena is run by a man from Mantua: Passerino Bonacolsi." },
  { say: "He rules Mantua, and Modena too, and he's firmly on the Emperor's side.", show: "He rules Mantua, and Modena too, and he's firmly on the Emperor's side." },
  { say: "So Pope John the Twenty-Second declares him a rebel. And he goes further.", show: "So Pope John XXII declares him a rebel. And he goes further." },
  { say: "Anyone who harms Bonacolsi, or anything he owns, is offered an indulgence: forgiveness for their sins.", show: "Anyone who harms Bonacolsi, or anything he owns, is offered an indulgence: forgiveness for their sins." },
  { say: "That summer, it all boils over.", show: "That summer, it all boils over." },
  { say: "In July, Bolognese troops raid Modenese fields.", show: "In July, Bolognese troops raid Modenese fields." },
  { say: "In August, a Bolognese force spends two weeks wrecking Modenese land.", show: "In August, a Bolognese force spends two weeks wrecking Modenese land." },
  { say: "Then, at the end of September, something happens that Bologna can't ignore.", show: "Then, at the end of September, something happens that Bologna can't ignore." },
  { say: "Monteveglio is one of Bologna's fortresses, on a hilltop near the border.", show: "Monteveglio is one of Bologna's fortresses, on a hilltop near the border." },
  { say: "Men inside it betray it. The fortress is handed to Modena.", show: "Men inside it betray it. The fortress is handed to Modena." },
  { say: "So Bologna goes to war. Not over a bucket. Over a castle.", show: "So Bologna goes to war. Not over a bucket. Over a castle." },
  { say: "Bologna raises an enormous army: its own militia, allies from Florence and Romagna, and a hired commander, Malatesta, the lord of Rimini.", show: "Bologna raises an enormous army: its own militia, allies from Florence and Romagna, and a hired commander, Malatesta, the lord of Rimini." },
  { say: "The numbers vary from source to source, but the usual figure is around thirty thousand men on foot, and a couple of thousand on horseback.", show: "The numbers vary from source to source, but the usual figure is around 30,000 men on foot, and a couple of thousand on horseback." },
  { say: "Many of those foot soldiers are townsmen, armed with whatever they have.", show: "Many of those foot soldiers are townsmen, armed with whatever they have." },
  { say: "Modena's side has maybe seven thousand.", show: "Modena's side has maybe 7,000." },
  { say: "But they aren't all shopkeepers. Azzone Visconti of Milan brings professional German soldiers. Mantua and Ferrara send men too.", show: "But they aren't all shopkeepers. Azzone Visconti of Milan brings professional German soldiers. Mantua and Ferrara send men too." },
  { say: "The Bolognese march out and besiege Monteveglio. The Modenese come to break the siege.", show: "The Bolognese march out and besiege Monteveglio. The Modenese come to break the siege." },
  { say: "Bonacolsi knows he can't win a fair fight against those numbers. So he cheats.", show: "Bonacolsi knows he can't win a fair fight against those numbers. So he cheats." },
  { say: "The night before the battle, he marches men south to Marano, crosses the Panaro River, and picks a small fight with a Bolognese advance guard.", show: "The night before the battle, he marches men south to Marano, crosses the Panaro River, and picks a small fight with a Bolognese advance guard." },
  { say: "It works. The Bolognese think the real attack is coming from there, and they send men off to meet it.", show: "It works. The Bolognese think the real attack is coming from there, and they send men off to meet it." },
  { say: "When they realize they've been fooled, they start calling them back.", show: "When they realize they've been fooled, they start calling them back." },
  { say: "And that's exactly the moment Bonacolsi has been waiting for.", show: "And that's exactly the moment Bonacolsi has been waiting for." },
  { say: "November fifteenth, thirteen twenty-five, near sunset.", show: "November 15, 1325, near sunset." },
  { say: "The Bolognese are spread out on a slope below the castle of Zappolino, and some of their men are still on the way back.", show: "The Bolognese are spread out on a slope below the castle of Zappolino, and some of their men are still on the way back." },
  { say: "Bonacolsi attacks while they're still sorting themselves out. The fighting is heavy.", show: "Bonacolsi attacks while they're still sorting themselves out. The fighting is heavy." },
  { say: "Then he sends his horsemen around the side, to hit the Bolognese from behind.", show: "Then he sends his horsemen around the side, to hit the Bolognese from behind." },
  { say: "Within a couple of hours, it's over. The giant army breaks and runs.", show: "Within a couple of hours, it's over. The giant army breaks and runs." },
  { say: "By nightfall, around two thousand men have been killed or wounded. Most of them are Bolognese.", show: "By nightfall, around 2,000 men have been killed or wounded. Most of them are Bolognese." },
  { say: "One Bolognese chronicler, Matteo Griffoni, counts more than a thousand of his own city's dead.", show: "One Bolognese chronicler, Matteo Griffoni, counts more than a thousand of his own city's dead." },
  { say: "Modena chases them all the way back to Bologna.", show: "Modena chases them all the way back to Bologna." },
  { say: "On the way, they wreck the castles of Crespellano, Zola, Anzola, Castelfranco and Piumazzo, and break the weir on the Reno River near Casalecchio.", show: "On the way, they wreck the castles of Crespellano, Zola, Anzola, Castelfranco and Piumazzo, and break the weir on the Reno River near Casalecchio." },
  { say: "But when they reach the walls, they don't attack the city.", show: "But when they reach the walls, they don't attack the city." },
  { say: "Instead, they hold a palio, a race, right outside the gates.", show: "Instead, they hold a palio, a race, right outside the gates." },
  { say: "The inscription for it called it the eternal shame of Bologna.", show: "The inscription for it called it the eternal shame of Bologna." },
  { say: "Twenty-six Bolognese nobles are taken back to Modena as prisoners.", show: "26 Bolognese nobles are taken back to Modena as prisoners." },
  { say: "And just outside one of the city gates, the Porta San Felice, there's a well, with a wooden bucket.", show: "And just outside one of the city gates, the Porta San Felice, there's a well, with a wooden bucket." },
  { say: "They take it.", show: "They take it." },
  { say: "And then... the war just stops.", show: "And then... the war just stops." },
  { say: "By January, the two cities make peace. Monteveglio and the other castles go back to Bologna.", show: "By January, the two cities make peace. Monteveglio and the other castles go back to Bologna." },
  { say: "The prisoners go home after eleven weeks.", show: "The prisoners go home after 11 weeks." },
  { say: "On paper, everything is right back where it started.", show: "On paper, everything is right back where it started." },
  { say: "So what did Modena actually win? A victory. And a bucket.", show: "So what did Modena actually win? A victory. And a bucket." },
  { say: "Modena hangs the bucket in the Ghirlandina, the cathedral's bell tower, in the room where the city keeps its treasures and its records.", show: "Modena hangs the bucket in the Ghirlandina, the cathedral's bell tower, in the room where the city keeps its treasures and its records." },
  { say: "Then, almost three hundred years later, a poet from Modena, Alessandro Tassoni, writes a comic epic called The Stolen Bucket.", show: "Then, almost 300 years later, a poet from Modena, Alessandro Tassoni, writes a comic epic called The Stolen Bucket." },
  { say: "In his version, stealing the bucket sets off the war, and even the gods of Olympus take sides.", show: "In his version, stealing the bucket sets off the war, and even the gods of Olympus take sides." },
  { say: "It's a joke. But it's a very popular joke.", show: "It's a joke. But it's a very popular joke." },
  { say: "It's printed in sixteen twenty-two, translated, and turned into an opera by Antonio Salieri in seventeen seventy-two.", show: "It's printed in 1622, translated, and turned into an opera by Antonio Salieri in 1772." },
  { say: "And slowly, the joke becomes the history everybody knows: two cities went to war over a stolen bucket.", show: "And slowly, the joke becomes the history everybody knows: two cities went to war over a stolen bucket." },
  { say: "If you want more history that everybody gets slightly wrong, subscribe.", show: "If you want more history that everybody gets slightly wrong, subscribe." },
  { say: "Today, the original bucket sits in Modena's town hall, in a small room called the Camerino dei Confirmati.", show: "Today, the original bucket sits in Modena's town hall, in a small room called the Camerino dei Confirmati." },
  { say: "A copy hangs on a chain in the bell tower, where the original hung for centuries.", show: "A copy hangs on a chain in the bell tower, where the original hung for centuries." },
  { say: "Seven hundred years later, it's still in Modena.", show: "Seven hundred years later, it's still in Modena." },
  { say: "So if you were Bologna... would you still want your bucket back?", show: "So if you were Bologna... would you still want your bucket back?" },
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
  { seg: 5, num: "1", title: "TWO CITIES" },
  { seg: 12, num: "2", title: "THE REBEL" },
  { seg: 16, num: "3", title: "A CASTLE, NOT A BUCKET" },
  { seg: 23, num: "4", title: "30,000 VS 7,000" },
  { seg: 29, num: "5", title: "THE TRICK" },
  { seg: 34, num: "6", title: "ZAPPOLINO" },
  { seg: 41, num: "7", title: "THE RACE AND THE BUCKET" },
  { seg: 49, num: "8", title: "THE PEACE" },
  { seg: 54, num: "9", title: "HOW A JOKE BECAME HISTORY" },
  { seg: 60, num: "10", title: "WHERE IT IS TODAY" },
];

// ---------------- shots ----------------
/** k: "3d" = rendered scene (story3d.ts), "2d" = motion graphic (boards.tsx). A shot starts at segment `s` (or at word
 *  `w` inside it) and runs until the next shot. g = graphic / shot key. */
export type Kind = "3d" | "2d";
type RawShot = { s: number; w: string | null; k: Kind; g: string };
const D3 = (s: number, w: string | null, g: string): RawShot => ({ s, w, k: "3d", g }), D2 = (s: number, w: string | null, g: string): RawShot => ({ s, w, k: "2d", g });
const raw: RawShot[] = [
  // cold open
  D3(0, null, "toll"), D3(0, "and", "prize"),
  D3(1, null, "well"), D3(1, "taken", "grab"),
  D3(2, null, "poet"), D3(2, "stole", "version"),
  D2(3, null, "title"),
  D3(4, null, "hook"),
  // 1 two cities
  D2(5, null, "region:0"), D2(5, "same", "region:1"),
  D3(6, null, "walls"), D3(6, "modena", "modena"),
  D2(7, null, "split"),
  D3(8, null, "pope"), D3(8, "other", "emperor"),
  D2(9, null, "sides"),
  D3(10, null, "hate1"), D3(10, "families", "hate2"), D2(10, "border", "local:0"),
  D2(11, null, "local:1"),
  // 2 the rebel
  D3(12, null, "bona"), D2(13, null, "region:2"), D3(13, "emperors", "emperor"),
  D3(14, null, "decree"), D3(14, "rebel", "rebel"),
  D2(15, null, "indulge"), D3(15, "forgiveness", "forgive"),
  // 3 a castle, not a bucket
  D3(16, null, "furious"),
  D3(17, null, "trample"), D2(17, "july", "raids"),
  D3(18, null, "trample2"),
  D3(19, null, "night"),
  D2(20, null, "local:2"),
  D3(21, null, "traitors"), D3(21, "handed", "handed"),
  D2(22, null, "notbucket"), D3(22, "castle", "castleM"),
  // 4 30,000 vs 7,000
  D3(23, null, "ranks"), D2(23, "militia", "bolo"),
  D3(24, null, "army"), D2(24, "30,000", "n30"),
  D3(25, null, "ranks2"),
  D3(26, null, "few"), D2(26, "7,000", "n7"),
  D2(27, null, "allies"), D3(27, "mantua", "modmarch"),
  D3(28, null, "siege"), D3(28, "modenese", "modmarch2"),
  // 5 the trick
  D3(29, null, "sunset"), D2(29, "cheats", "cheats"),
  D2(30, null, "local:3"), D3(30, "crosses", "feint"),
  D3(31, null, "detach"),
  D2(32, null, "fooled"),
  D3(33, null, "rebel"),
  // 6 zappolino
  D3(34, null, "zappo"),
  D2(35, null, "local:4"), D3(35, "some", "army2"),
  D3(36, null, "battle"), D3(36, "fighting", "clash"),
  D3(37, null, "ride"), D3(37, "behind", "behind"),
  D3(38, null, "flee"), D3(38, "breaks", "ran"),
  D3(39, null, "toll"), D2(39, "2,000", "n2000"),
  D2(40, null, "griffoni"),
  // 7 the race and the bucket
  D2(41, null, "local:5"), D3(41, "bologna", "chase"),
  D2(42, null, "local:6"),
  D3(43, null, "outside"),
  D3(44, null, "race"),
  D3(45, null, "rub"), D2(45, "eternal", "shame"),
  D2(46, null, "n26"),
  D3(47, null, "wellwide"), D3(47, "bucket", "well"),
  D3(48, null, "grab"),
  // 8 the peace
  D2(49, null, "stops"),
  D3(50, null, "jan"), D2(50, "monteveglio", "peace"),
  D2(52, null, "paper"),
  D3(53, null, "prize"), D2(53, "victory", "won"),
  // 9 how a joke became history
  D3(54, null, "kept"), D3(54, "room", "still"),
  D3(55, null, "poet"), D3(55, "comic", "book"),
  D2(56, null, "gods"),
  D3(57, null, "starts"),
  D2(58, null, "salieri"),
  D3(59, null, "version"), D2(59, "two", "legend"),
  // 10 where it is today
  D3(60, null, "hook"),
  D2(61, null, "today"),
  D3(62, null, "kept"),
  D3(63, null, "still"),
  D2(64, null, "question"),
];
export type ShotDef = RawShot & { id: number; a: number; b: number };
export const SHOTS: ShotDef[] = raw.map((r, i) => ({ ...r, id: i + 1, a: 0, b: 0 }));
SHOTS.forEach((s, i) => { s.a = i === 0 ? 0 : (s.w ? wordAt(s.s, s.w) : segAt(s.s)) - 2; }); // cuts land ~2 f before the word
SHOTS.forEach((s, i) => { s.b = i === SHOTS.length - 1 ? VOICE_END : SHOTS[i + 1].a; });
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? null;
/** chapter-start crossfade (frames) */
export const XFADE = 10;
export const CHAPTER_SHOTS = new Set(CHAPTERS.map((c) => SHOTS.find((s) => s.s >= c.seg)!.id));
