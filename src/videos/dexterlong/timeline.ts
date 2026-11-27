// "The Man Whose Worst Ideas Made Him Rich?" (Paradox Town Explained), 1920 x 1080: Timothy Dexter of Newburyport, 1747-1806.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "In the seventeen-nineties, a man in Massachusetts shipped bed warmers to the tropics... coal to the coal capital of England... and Bibles to the West Indies.", show: "In the 1790s, a man in Massachusetts shipped bed warmers to the tropics... coal to the coal capital of England... and Bibles to the West Indies." },
  { say: "People say those ideas came from his enemies, trying to ruin him. And every one of them, he says, made him richer.", show: "People say those ideas came from his enemies, trying to ruin him. And every one of them, he says, made him richer." },
  { say: "His name was Timothy Dexter. He might be the luckiest fool in American history... or the smartest.", show: "His name was Timothy Dexter. He might be the luckiest fool in American history... or the smartest." },
  { say: "If you like weird history, subscribe. Now, let's find out.", show: "If you like weird history, subscribe. Now, let's find out." },
  { say: "Timothy Dexter was born in Malden, Massachusetts, in seventeen forty-seven, to a poor family.", show: "Timothy Dexter was born in Malden, Massachusetts, in 1747, to a poor family." },
  { say: "At eight, he left school to work on a farm. At sixteen, he was apprenticed to a tanner, a leather worker.", show: "At 8, he left school to work on a farm. At 16, he was apprenticed to a tanner, a leather worker." },
  { say: "In seventeen sixty-nine, he moved to Newburyport, a busy port at the mouth of the Merrimack River, full of ship owners and old money.", show: "In 1769, he moved to Newburyport, a busy port at the mouth of the Merrimack River, full of ship owners and old money." },
  { say: "The next year, he married Elizabeth Frothingham, a widow with money of her own.", show: "The next year, he married Elizabeth Frothingham, a widow with money of her own." },
  { say: "He sold hides, gloves and moose-hide trousers out of their basement. She ran a little shop of her own.", show: "He sold hides, gloves and moose-hide trousers out of their basement. She ran a little shop of her own." },
  { say: "During the Revolution, Congress paid its bills with paper money called Continentals.", show: "During the Revolution, Congress paid its bills with paper money called Continentals." },
  { say: "So much of it was printed that by the end of the war, it was almost worthless. Not worth a Continental, people said.", show: "So much of it was printed that by the end of the war, it was almost worthless. Not worth a Continental, people said." },
  { say: "Dexter bought it anyway. Stacks of it, along with the state's war notes, for pennies on the dollar.", show: "Dexter bought it anyway. Stacks of it, along with the state's war notes, for pennies on the dollar." },
  { say: "Then the new country sorted out its debts. The federal government paid back the old Continentals at about one cent on the dollar.", show: "Then the new country sorted out its debts. The federal government paid back the old Continentals at about one cent on the dollar." },
  { say: "But Massachusetts paid back its own notes in full. And the leather worker nobody took seriously was suddenly one of the richest men in town.", show: "But Massachusetts paid back its own notes in full. And the leather worker nobody took seriously was suddenly one of the richest men in town." },
  { say: "Newburyport's old families were not impressed. To them, he was a fool who got lucky.", show: "Newburyport's old families were not impressed. To them, he was a fool who got lucky." },
  { say: "And this is where the legend begins. The story goes that the town's merchants started handing him advice. The worst advice they could think of, hoping he would lose it all.", show: "And this is where the legend begins. The story goes that the town's merchants started handing him advice. The worst advice they could think of, hoping he would lose it all." },
  { say: "Ship coal to Newcastle, they told him. Newcastle, in England, was the coal capital of the world.", show: "Ship coal to Newcastle, they told him. Newcastle, in England, was the coal capital of the world." },
  { say: "Carrying coals to Newcastle was already a saying for the most pointless thing a person could do.", show: "Carrying coals to Newcastle was already a saying for the most pointless thing a person could do." },
  { say: "According to the legend, Dexter did it anyway. And his ships arrived in the middle of a miners' strike. The town was out of coal, and his sold at a premium.", show: "According to the legend, Dexter did it anyway. And his ships arrived in the middle of a miners' strike. The town was out of coal, and his sold at a premium." },
  { say: "Then there were the mittens. Wool mittens, shipped to the tropics. In one telling, traders bought every pair, and sent them on to Siberia.", show: "Then there were the mittens. Wool mittens, shipped to the tropics. In one telling, traders bought every pair, and sent them on to Siberia." },
  { say: "But here's the strange part. Dexter told his own version of how he got rich, in his own book. And he doesn't mention coal or mittens at all.", show: "But here's the strange part. Dexter told his own version of how he got rich, in his own book. And he doesn't mention coal or mittens at all." },
  { say: "What he does write about is bed warmers. He said he dreamed three nights in a row that warming pans would sell in the West Indies.", show: "What he does write about is bed warmers. He said he dreamed three nights in a row that warming pans would sell in the West Indies." },
  { say: "So he bought forty-two thousand of them, put them on nine ships, and sent them to islands where it never gets cold.", show: "So he bought 42,000 of them, put them on 9 ships, and sent them to islands where it never gets cold." },
  { say: "He wrote that people there used them for cooking. And he claimed he cleared seventy-nine percent. Later tellers say the pans ended up as ladles in the sugar works.", show: "He wrote that people there used them for cooking. And he claimed he cleared 79%. Later tellers say the pans ended up as ladles in the sugar works." },
  { say: "He also wrote about Bibles. Twenty-one thousand of them, he said, bought at under half price, shipped to the West Indies on twenty-one vessels, for a profit of a hundred percent.", show: "He also wrote about Bibles. 21,000 of them, he said, bought at under half price, shipped to the West Indies on 21 vessels, for a profit of 100%." },
  { say: "And whalebone. Three hundred and forty tons of it.", show: "And whalebone. 340 tons of it." },
  { say: "Did it all happen like that? We only have his word for it. And Dexter's word was... generous.", show: "Did it all happen like that? We only have his word for it. And Dexter's word was... generous." },
  { say: "Whatever the truth, he was rich now, and he wanted everyone to know it.", show: "Whatever the truth, he was rich now, and he wanted everyone to know it." },
  { say: "He bought a grand mansion on High Street, put minarets on the roof and a golden eagle on top, and started calling himself Lord Timothy Dexter.", show: "He bought a grand mansion on High Street, put minarets on the roof and a golden eagle on top, and started calling himself Lord Timothy Dexter." },
  { say: "Then he hired a young ship carver, Joseph Wilson, to fill the grounds with about forty wooden statues on tall columns.", show: "Then he hired a young ship carver, Joseph Wilson, to fill the grounds with about 40 wooden statues on tall columns." },
  { say: "On a great arch over the entrance stood George Washington, with John Adams and Thomas Jefferson beside him.", show: "On a great arch over the entrance stood George Washington, with John Adams and Thomas Jefferson beside him." },
  { say: "Around them, Napoleon, William Pitt, Benjamin Franklin, lions, and goddesses. And two statues of Lord Dexter himself.", show: "Around them, Napoleon, William Pitt, Benjamin Franklin, lions, and goddesses. And two statues of Lord Dexter himself." },
  { say: "One of them held a sign: I am the first in the East, the first in the West, and the greatest philosopher in the Western world.", show: "One of them held a sign: I am the first in the East, the first in the West, and the greatest philosopher in the Western world." },
  { say: "He even had his own poet, a fish seller named Jonathan Plummer, who wrote verses about how great Lord Dexter was.", show: "He even had his own poet, a fish seller named Jonathan Plummer, who wrote verses about how great Lord Dexter was." },
  { say: "But one question bothered him. When he died, who would actually miss him?", show: "But one question bothered him. When he died, who would actually miss him?" },
  { say: "So, the story goes, he faked his own death. He already had a fine mahogany coffin made.", show: "So, the story goes, he faked his own death. He already had a fine mahogany coffin made." },
  { say: "The town was told that Lord Dexter was dead, and about three thousand people came to the wake.", show: "The town was told that Lord Dexter was dead, and about 3,000 people came to the wake." },
  { say: "Dexter watched from hiding. The crowd mourned. His wife did not cry.", show: "Dexter watched from hiding. The crowd mourned. His wife did not cry." },
  { say: "So the dead man came out of hiding, and caned her for not weeping. That's how the earliest accounts tell it, written down years later.", show: "So the dead man came out of hiding, and caned her for not weeping. That's how the earliest accounts tell it, written down years later." },
  { say: "He used to tell visitors the woman in his house wasn't his wife at all. She was her ghost.", show: "He used to tell visitors the woman in his house wasn't his wife at all. She was her ghost." },
  { say: "In eighteen-oh-two, he wrote a book. He called it A Pickle for the Knowing Ones.", show: "In 1802, he wrote a book. He called it A Pickle for the Knowing Ones." },
  { say: "Almost nine thousand words, with spelling all his own, and no punctuation at all. Readers complained.", show: "Almost 9,000 words, with spelling all his own, and no punctuation at all. Readers complained." },
  { say: "So for the next edition, he added a whole page of nothing but punctuation marks, and told his readers they could salt and pepper it as they pleased.", show: "So for the next edition, he added a whole page of nothing but punctuation marks, and told his readers they could salt and pepper it as they pleased." },
  { say: "Timothy Dexter died in Newburyport in October, eighteen-oh-six. He was fifty-nine.", show: "Timothy Dexter died in Newburyport in October, 1806. He was 59." },
  { say: "Nine years later, the Great September Gale knocked most of his statues down. They were sold off for a few dollars, and some were burned as firewood.", show: "Nine years later, the Great September Gale knocked most of his statues down. They were sold off for a few dollars, and some were burned as firewood." },
  { say: "One of the few that survived, William Pitt, is in the Museum of Old Newbury today. And his house still stands on High Street.", show: "One of the few that survived, William Pitt, is in the Museum of Old Newbury today. And his house still stands on High Street." },
  { say: "One of his first biographers insisted Dexter was no fool at all. That everything he tried worked well, and not by luck.", show: "One of his first biographers insisted Dexter was no fool at all. That everything he tried worked well, and not by luck." },
  { say: "Others called him the luckiest man who ever lived. If you like stories like this one, subscribe.", show: "Others called him the luckiest man who ever lived. If you like stories like this one, subscribe." },
  { say: "So what do you think? Was Timothy Dexter a fool who got lucky... or a genius who let everyone think he was a fool?", show: "So what do you think? Was Timothy Dexter a fool who got lucky... or a genius who let everyone think he was a fool?" },
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
  D2(48, null, "court1973"), D3(48, "fighting", "river"),
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
