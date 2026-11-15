// "What If You Were Stuck in 1850 With Only Your Phone?" (Paradox Town Explained, long-form #6, "What If" #3): script,
// timing and shots. 1920 x 1080, 30 fps. SEG_TIMES and WORDS are rewritten by the Align to voice workflow
// (scripts/align.py) from public/phoneif/voice.mp3. The "you" storyline is invented; every fact in it is from the
// record (see claude/longform-phone1850.md in the Claude project for the checked facts).
// STATUS (Nov 15): skeleton only. Every shot is a placeholder ("todo"); the 1850 world and the boards are next.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "It's September first, 1850. You're standing on a wharf in New York City, packed in with tens of thousands of strangers.", show: "It's September 1, 1850. You're standing on a wharf in New York City, packed in with tens of thousands of strangers." },
  { say: "Everyone is pushing toward the water. A steamship is pulling in, and the crowd is screaming one name.", show: "Everyone is pushing toward the water. A steamship is pulling in, and the crowd is screaming one name." },
  { say: "Jenny Lind.", show: "Jenny Lind." },
  { say: "And in your pocket... is your phone.", show: "And in your pocket... is your phone." },
  { say: "You pull it out. Eighty percent battery. No bars. And a clock that still thinks it's 2026.", show: "You pull it out. 80 percent battery. No bars. And a clock that still thinks it's 2026." },
  { say: "Here's the deal. Real history only. No magic, no internet, no lucky guesses. Just you, one phone, and whatever 1850 can give you.", show: "Here's the deal. Real history only. No magic, no internet, no lucky guesses. Just you, one phone, and whatever 1850 can give you." },
  { say: "You get five attempts to make the most powerful machine on Earth matter.", show: "You get 5 attempts to make the most powerful machine on Earth matter." },
  { say: "Let's see how far you get.", show: "Let's see how far you get." },
  { say: "First, why is everyone here?", show: "First, why is everyone here?" },
  { say: "Jenny Lind is a Swedish opera singer. A year ago, almost nobody in America knew her name.", show: "Jenny Lind is a Swedish opera singer. A year ago, almost nobody in America knew her name." },
  { say: "Then a showman named P. T. Barnum signed her up for a tour, and spent months feeding the newspapers stories about her.", show: "Then a showman named P. T. Barnum signed her up for a tour, and spent months feeding the newspapers stories about her." },
  { say: "It worked. The papers counted thirty or forty thousand people on the piers today, to greet a singer most of them had never heard.", show: "It worked. The papers counted 30 or 40 thousand people on the piers today, to greet a singer most of them had never heard." },
  { say: "And right now, you're the only person in that crowd who could record her.", show: "And right now, you're the only person in that crowd who could record her." },
  { say: "Your first instinct is the obvious one. Call for help.", show: "Your first instinct is the obvious one. Call for help." },
  { say: "You dial. Nothing. Not a weak signal. No signal. There are no towers to find, and there won't be for more than a hundred years.", show: "You dial. Nothing. Not a weak signal. No signal. There are no towers to find, and there won't be for more than a hundred years." },
  { say: "You open the map. Your little blue dot spins and spins. It's looking for satellites, and the first GPS satellite won't go up until 1978.", show: "You open the map. Your little blue dot spins and spins. It's looking for satellites, and the first GPS satellite won't go up until 1978." },
  { say: "So how does anyone send a message fast in 1850?", show: "So how does anyone send a message fast in 1850?" },
  { say: "The telegraph. By now there are about twelve thousand miles of wire across the country, and operators tapping out Morse code, one letter at a time.", show: "The telegraph. By now there are about 12,000 miles of wire across the country, and operators tapping out Morse code, one letter at a time." },
  { say: "You could send a message to New Orleans by tonight.", show: "You could send a message to New Orleans by tonight." },
  { say: "But there's no one to send it to. Everyone you know... hasn't been born yet.", show: "But there's no one to send it to. Everyone you know... hasn't been born yet." },
  { say: "Your phone isn't broken. It's a radio with nobody on the other end.", show: "Your phone isn't broken. It's a radio with nobody on the other end." },
  { say: "Fine. If you can't call anyone, you can still do something nobody else alive can do.", show: "Fine. If you can't call anyone, you can still do something nobody else alive can do." },
  { say: "You hold up your phone, and you film Jenny Lind stepping off the ship. In color. With sound.", show: "You hold up your phone, and you film Jenny Lind stepping off the ship. In color. With sound." },
  { say: "Here's how special that is. The best picture technology in 1850 is the daguerreotype: one image, on a polished silver plate, no color, and the person in it has to hold still.", show: "Here's how special that is. The best picture technology in 1850 is the daguerreotype: one image, on a polished silver plate, no color, and the person in it has to hold still." },
  { say: "Pictures of busy streets are rare. Almost every photograph in America is a portrait.", show: "Pictures of busy streets are rare. Almost every photograph in America is a portrait." },
  { say: "You're holding the only moving, color picture of 1850.", show: "You're holding the only moving, color picture of 1850." },
  { say: "So who do you show it to?", show: "So who do you show it to?" },
  { say: "The obvious man is standing right here on the dock. P. T. Barnum. He owns the American Museum on Broadway, the most famous show in the city.", show: "The obvious man is standing right here on the dock. P. T. Barnum. He owns the American Museum on Broadway, the most famous show in the city." },
  { say: "He would love this.", show: "He would love this." },
  { say: "There's just one problem. Barnum is famous for fakes. Eight years ago, he packed his museum with crowds to see a \"mermaid\". It was the top half of a monkey, sewn onto a fish.", show: "There's just one problem. Barnum is famous for fakes. Eight years ago, he packed his museum with crowds to see a \"mermaid\". It was the top half of a monkey, sewn onto a fish." },
  { say: "New York's greatest showman is also New York's greatest humbug.", show: "New York's greatest showman is also New York's greatest humbug." },
  { say: "Put your phone in his museum, and everyone will assume it's his next trick.", show: "Put your phone in his museum, and everyone will assume it's his next trick." },
  { say: "And while you were filming, your battery dropped to forty percent.", show: "And while you were filming, your battery dropped to 40 percent." },
  { say: "Now you've got a real problem. When that battery dies, the phone dies with it.", show: "Now you've got a real problem. When that battery dies, the phone dies with it." },
  { say: "There are no outlets. Not one, anywhere. The first power station in New York won't open until 1882.", show: "There are no outlets. Not one, anywhere. The first power station in New York won't open until 1882." },
  { say: "But electricity does exist in 1850. You just have to know where to look.", show: "But electricity does exist in 1850. You just have to know where to look." },
  { say: "Every telegraph office runs on batteries. Glass jars of zinc, platinum and acid, lined up in rows. American lines in this era favored a design called the Grove cell, about 1.9 volts per jar.", show: "Every telegraph office runs on batteries. Glass jars of zinc, platinum and acid, lined up in rows. American lines in this era favored a design called the Grove cell, about 1.9 volts per jar." },
  { say: "Your charging cable expects about five volts.", show: "Your charging cable expects about 5 volts." },
  { say: "Three jars in a row would get you close. A little over, in fact.", show: "3 jars in a row would get you close. A little over, in fact." },
  { say: "So, in theory, you could cut your cable, strip the wires, and borrow a telegraph battery.", show: "So, in theory, you could cut your cable, strip the wires, and borrow a telegraph battery." },
  { say: "In practice, it's a gamble. Too little, and nothing happens. Too much, and you could fry the only phone on the planet. And those jars give off poisonous fumes.", show: "In practice, it's a gamble. Too little, and nothing happens. Too much, and you could fry the only phone on the planet. And those jars give off poisonous fumes." },
  { say: "You don't risk it.", show: "You don't risk it." },
  { say: "You turn the brightness all the way down, and you switch on airplane mode.", show: "You turn the brightness all the way down, and you switch on airplane mode." },
  { say: "Every percent is now precious.", show: "Every percent is now precious." },
  { say: "New idea. If the phone can't last, maybe someone can build another one.", show: "New idea. If the phone can't last, maybe someone can build another one." },
  { say: "You find the smartest man in America on the subject of electricity. Joseph Henry.", show: "You find the smartest man in America on the subject of electricity. Joseph Henry." },
  { say: "He built the strongest electromagnets of his day. His work on the relay helped make long-distance telegraphs possible. And since 1846, he's run the brand-new Smithsonian Institution.", show: "He built the strongest electromagnets of his day. His work on the relay helped make long-distance telegraphs possible. And since 1846, he's run the brand-new Smithsonian Institution." },
  { say: "If anyone in 1850 can understand your phone, it's him.", show: "If anyone in 1850 can understand your phone, it's him." },
  { say: "And he would understand the first part. It runs on electricity, stored in a battery. That's not magic to him.", show: "And he would understand the first part. It runs on electricity, stored in a battery. That's not magic to him." },
  { say: "But then you open it up.", show: "But then you open it up." },
  { say: "Inside is a chip with billions of switches called transistors. The first transistor won't be built until 1947.", show: "Inside is a chip with billions of switches called transistors. The first transistor won't be built until 1947." },
  { say: "And the ones in your phone are so small that no microscope in 1850 could even see them. They're smaller than a wavelength of light.", show: "And the ones in your phone are so small that no microscope in 1850 could even see them. They're smaller than a wavelength of light." },
  { say: "Henry can't copy what he can't see.", show: "Henry can't copy what he can't see." },
  { say: "Your phone isn't an invention he could improve. It's the end of a hundred and fifty years of inventions that haven't happened yet.", show: "Your phone isn't an invention he could improve. It's the end of 150 years of inventions that haven't happened yet." },
  { say: "So you stop thinking about the phone, and start thinking about what's in your head.", show: "So you stop thinking about the phone, and start thinking about what's in your head." },
  { say: "And there's one thing in there that could save thousands of lives.", show: "And there's one thing in there that could save thousands of lives." },
  { say: "Last summer, cholera killed more than five thousand New Yorkers. It's going to come back. In 1854, it will kill another two and a half thousand.", show: "Last summer, cholera killed more than 5,000 New Yorkers. It's going to come back. In 1854, it will kill another 2,500." },
  { say: "You know what doctors here don't. Cholera spreads through dirty water. Boil it. Keep sewage out of it. Wash your hands.", show: "You know what doctors here don't. Cholera spreads through dirty water. Boil it. Keep sewage out of it. Wash your hands." },
  { say: "Most doctors in 1850 blame bad air. Smells. Fog. Something rising from the filth.", show: "Most doctors in 1850 blame bad air. Smells. Fog. Something rising from the filth." },
  { say: "You try to tell them.", show: "You try to tell them." },
  { say: "And you already know how this goes, because it's already happening to somebody else.", show: "And you already know how this goes, because it's already happening to somebody else." },
  { say: "Three years ago, in Vienna, a doctor named Ignaz Semmelweis made the doctors on his ward wash their hands in chlorinated lime. Deaths on that ward fell from about one in five, to about one in fifty.", show: "Three years ago, in Vienna, a doctor named Ignaz Semmelweis made the doctors on his ward wash their hands in chlorinated lime. Deaths on that ward fell from about 1 in 5, to about 1 in 50." },
  { say: "He was ridiculed. And his hospital stopped doing it.", show: "He was ridiculed. And his hospital stopped doing it." },
  { say: "You search your phone for anything that could prove you're right. A diagram. A study. A photo of a germ.", show: "You search your phone for anything that could prove you're right. A diagram. A study. A photo of a germ." },
  { say: "But everything you'd need is on the internet.", show: "But everything you'd need is on the internet." },
  { say: "And there is no internet.", show: "And there is no internet." },
  { say: "So what should you have done?", show: "So what should you have done?" },
  { say: "First, stop trying to explain the phone. Nobody can check it, so nobody will believe it.", show: "First, stop trying to explain the phone. Nobody can check it, so nobody will believe it." },
  { say: "Second, give people something they can test themselves.", show: "Second, give people something they can test themselves." },
  { say: "That's how the case against dirty water was first made. In 1854, in London, a doctor named John Snow didn't argue about bad air. He made a map. He marked every death, and they clustered around one water pump on Broad Street.", show: "That's how the case against dirty water was first made. In 1854, in London, a doctor named John Snow didn't argue about bad air. He made a map. He marked every death, and they clustered around one water pump on Broad Street." },
  { say: "He didn't need anyone to believe him. He needed them to look.", show: "He didn't need anyone to believe him. He needed them to look." },
  { say: "So with one phone and one battery, the smartest move is to use it as a notebook with a light. Keep records. Count cases. Draw the map before anyone else does.", show: "So with one phone and one battery, the smartest move is to use it as a notebook with a light. Keep records. Count cases. Draw the map before anyone else does." },
  { say: "Your phone was never going to change 1850.", show: "Your phone was never going to change 1850." },
  { say: "What you know might. If you can make people see it.", show: "What you know might. If you can make people see it." },
  { say: "Two days later, your screen flickers.", show: "2 days later, your screen flickers." },
  { say: "One percent.", show: "1 percent." },
  { say: "You take one last video. The wharf. The ships. The crowd.", show: "You take one last video. The wharf. The ships. The crowd." },
  { say: "Then the screen goes black.", show: "Then the screen goes black." },
  { say: "And the most advanced machine on Earth is a piece of glass in your hand.", show: "And the most advanced machine on Earth is a piece of glass in your hand." },
  { say: "Here's the strange part. The phone was never the powerful bit. The internet was. And in 1850, the internet is twelve thousand miles of wire, and a man tapping out one letter at a time.", show: "Here's the strange part. The phone was never the powerful bit. The internet was. And in 1850, the internet is 12,000 miles of wire, and a man tapping out one letter at a time." },
  { say: "So what would you have used it for?", show: "So what would you have used it for?" },
];

/** [start, end] seconds per segment; replaced by scripts/align.py */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = SEGMENTS.map((_, i) => [i * 3.2, i * 3.2 + 2.9]);
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
  { seg: 8, num: "1850", title: "Who's on the ship" },
  { seg: 13, num: "Attempt 1", title: "Call someone" },
  { seg: 21, num: "Attempt 2", title: "Show it off" },
  { seg: 33, num: "Attempt 3", title: "Charge it" },
  { seg: 44, num: "Attempt 4", title: "Get it copied" },
  { seg: 54, num: "Attempt 5", title: "Save lives" },
  { seg: 66, num: "End", title: "What would have worked" },
];

// ---------------- shots ----------------
/** k: "3d" = rendered scene (story3d.ts), "2d" = motion graphic (boards.tsx; maps are keyed "map:<name>").
 *  A shot starts at segment `s` (or at word `w` inside it) and runs until the next shot. g = graphic / shot key. */
export type Kind = "3d" | "2d";
type RawShot = { s: number; w: string | null; k: Kind; g: string };
const raw: RawShot[] = [
  { s: 0, w: null, k: "2d", g: "todo" },
  { s: 1, w: null, k: "2d", g: "todo" },
  { s: 2, w: null, k: "2d", g: "todo" },
  { s: 3, w: null, k: "2d", g: "todo" },
  { s: 4, w: null, k: "2d", g: "todo" },
  { s: 5, w: null, k: "2d", g: "todo" },
  { s: 6, w: null, k: "2d", g: "todo" },
  { s: 7, w: null, k: "2d", g: "todo" },
  { s: 8, w: null, k: "2d", g: "todo" },
  { s: 9, w: null, k: "2d", g: "todo" },
  { s: 10, w: null, k: "2d", g: "todo" },
  { s: 11, w: null, k: "2d", g: "todo" },
  { s: 12, w: null, k: "2d", g: "todo" },
  { s: 13, w: null, k: "2d", g: "todo" },
  { s: 14, w: null, k: "2d", g: "todo" },
  { s: 15, w: null, k: "2d", g: "todo" },
  { s: 16, w: null, k: "2d", g: "todo" },
  { s: 17, w: null, k: "2d", g: "todo" },
  { s: 18, w: null, k: "2d", g: "todo" },
  { s: 19, w: null, k: "2d", g: "todo" },
  { s: 20, w: null, k: "2d", g: "todo" },
  { s: 21, w: null, k: "2d", g: "todo" },
  { s: 22, w: null, k: "2d", g: "todo" },
  { s: 23, w: null, k: "2d", g: "todo" },
  { s: 24, w: null, k: "2d", g: "todo" },
  { s: 25, w: null, k: "2d", g: "todo" },
  { s: 26, w: null, k: "2d", g: "todo" },
  { s: 27, w: null, k: "2d", g: "todo" },
  { s: 28, w: null, k: "2d", g: "todo" },
  { s: 29, w: null, k: "2d", g: "todo" },
  { s: 30, w: null, k: "2d", g: "todo" },
  { s: 31, w: null, k: "2d", g: "todo" },
  { s: 32, w: null, k: "2d", g: "todo" },
  { s: 33, w: null, k: "2d", g: "todo" },
  { s: 34, w: null, k: "2d", g: "todo" },
  { s: 35, w: null, k: "2d", g: "todo" },
  { s: 36, w: null, k: "2d", g: "todo" },
  { s: 37, w: null, k: "2d", g: "todo" },
  { s: 38, w: null, k: "2d", g: "todo" },
  { s: 39, w: null, k: "2d", g: "todo" },
  { s: 40, w: null, k: "2d", g: "todo" },
  { s: 41, w: null, k: "2d", g: "todo" },
  { s: 42, w: null, k: "2d", g: "todo" },
  { s: 43, w: null, k: "2d", g: "todo" },
  { s: 44, w: null, k: "2d", g: "todo" },
  { s: 45, w: null, k: "2d", g: "todo" },
  { s: 46, w: null, k: "2d", g: "todo" },
  { s: 47, w: null, k: "2d", g: "todo" },
  { s: 48, w: null, k: "2d", g: "todo" },
  { s: 49, w: null, k: "2d", g: "todo" },
  { s: 50, w: null, k: "2d", g: "todo" },
  { s: 51, w: null, k: "2d", g: "todo" },
  { s: 52, w: null, k: "2d", g: "todo" },
  { s: 53, w: null, k: "2d", g: "todo" },
  { s: 54, w: null, k: "2d", g: "todo" },
  { s: 55, w: null, k: "2d", g: "todo" },
  { s: 56, w: null, k: "2d", g: "todo" },
  { s: 57, w: null, k: "2d", g: "todo" },
  { s: 58, w: null, k: "2d", g: "todo" },
  { s: 59, w: null, k: "2d", g: "todo" },
  { s: 60, w: null, k: "2d", g: "todo" },
  { s: 61, w: null, k: "2d", g: "todo" },
  { s: 62, w: null, k: "2d", g: "todo" },
  { s: 63, w: null, k: "2d", g: "todo" },
  { s: 64, w: null, k: "2d", g: "todo" },
  { s: 65, w: null, k: "2d", g: "todo" },
  { s: 66, w: null, k: "2d", g: "todo" },
  { s: 67, w: null, k: "2d", g: "todo" },
  { s: 68, w: null, k: "2d", g: "todo" },
  { s: 69, w: null, k: "2d", g: "todo" },
  { s: 70, w: null, k: "2d", g: "todo" },
  { s: 71, w: null, k: "2d", g: "todo" },
  { s: 72, w: null, k: "2d", g: "todo" },
  { s: 73, w: null, k: "2d", g: "todo" },
  { s: 74, w: null, k: "2d", g: "todo" },
  { s: 75, w: null, k: "2d", g: "todo" },
  { s: 76, w: null, k: "2d", g: "todo" },
  { s: 77, w: null, k: "2d", g: "todo" },
  { s: 78, w: null, k: "2d", g: "todo" },
  { s: 79, w: null, k: "2d", g: "todo" },
  { s: 80, w: null, k: "2d", g: "todo" },
];
export type ShotDef = RawShot & { id: number; a: number; b: number };
export const SHOTS: ShotDef[] = raw.map((r, i) => ({ ...r, id: i + 1, a: 0, b: 0 }));
SHOTS.forEach((s, i) => { s.a = i === 0 ? 0 : (s.w ? wordAt(s.s, s.w) : segAt(s.s)) - 2; }); // cuts land ~2 f before the word
SHOTS.forEach((s, i) => { s.b = i === SHOTS.length - 1 ? VOICE_END : SHOTS[i + 1].a; });
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? null;
/** chapter-start crossfade (frames) */
export const XFADE = 10;
export const CHAPTER_SHOTS = new Set(CHAPTERS.map((c) => SHOTS.find((s) => s.s >= c.seg)!.id));
