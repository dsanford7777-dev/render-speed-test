// "The Town Where You're Not Allowed to Die" (Paradox Town Explained, long-form #7): script, timing and shots.
// 1920 x 1080, 30 fps. SEG_TIMES and WORDS are rewritten by the Align to voice workflow (scripts/align.py) from
// public/frozenlong/voice.mp3. Facts and sources: claude/longyearbyen.md in the Claude project.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "In 1998, a team of scientists stood in a graveyard at the top of the world, and started to dig.", show: "In 1998, a team of scientists stood in a graveyard at the top of the world, and started to dig." },
  { say: "Under their feet were seven young coal miners. They had been dead for eighty years.", show: "Under their feet were 7 young coal miners. They had been dead for 80 years." },
  { say: "And the scientists were hoping that something inside those bodies was still alive.", show: "And the scientists were hoping that something inside those bodies was still alive." },
  { say: "The virus that killed them. The 1918 flu. The deadliest pandemic in modern history.", show: "The virus that killed them. The 1918 flu. The deadliest pandemic in modern history." },
  { say: "Nobody on Earth had a sample of it. And this graveyard sat in ground that never thaws.", show: "Nobody on Earth had a sample of it. And this graveyard sat in ground that never thaws." },
  { say: "If the virus had survived anywhere, it should be here.", show: "If the virus had survived anywhere, it should be here." },
  { say: "This is the story of that dig, of why it failed, and of the man who found the virus anyway, with a pair of garden shears.", show: "This is the story of that dig, of why it failed, and of the man who found the virus anyway, with a pair of garden shears." },
  { say: "It's also the story of the town those miners are buried in. A town that, today, won't let anyone be buried at all.", show: "It's also the story of the town those miners are buried in. A town that, today, won't let anyone be buried at all." },
  { say: "If you like history that sounds made up but isn't, subscribe.", show: "If you like history that sounds made up but isn't, subscribe." },
  { say: "The town is Longyearbyen, on the Arctic islands of Svalbard. It sits about thirteen hundred kilometers from the North Pole.", show: "The town is Longyearbyen, on the Arctic islands of Svalbard. It sits about 1,300 kilometers from the North Pole." },
  { say: "It was named after a man from Boston. John Munro Longyear visited the islands as a tourist in 1901, and he saw coal.", show: "It was named after a man from Boston. John Munro Longyear visited the islands as a tourist in 1901, and he saw coal." },
  { say: "In 1906 his Arctic Coal Company started digging, built docks and houses, and called the place Longyear City.", show: "In 1906 his Arctic Coal Company started digging, built docks and houses, and called the place Longyear City." },
  { say: "It wasn't a town people moved to for life. It was a mine with beds. Young men came up from mainland Norway for the season, dug coal in the dark, and went home.", show: "It wasn't a town people moved to for life. It was a mine with beds. Young men came up from mainland Norway for the season, dug coal in the dark, and went home." },
  { say: "In 1916 a Norwegian company, Store Norske, bought the whole thing.", show: "In 1916 a Norwegian company, Store Norske, bought the whole thing." },
  { say: "Two years later, the flu arrived.", show: "Two years later, the flu arrived." },
  { say: "It came on the ships, in the spring and summer of 1918.", show: "It came on the ships, in the spring and summer of 1918." },
  { say: "By July, more than half the miners were reporting sick. On one day in late July, only twenty of the two hundred men in Longyear City could work.", show: "By July, more than half the miners were reporting sick. On one day in late July, only 20 of the 200 men in Longyear City could work." },
  { say: "Shifts were cancelled. Some mines stopped for days at a time.", show: "Shifts were cancelled. Some mines stopped for days at a time." },
  { say: "And here's a strange detail the company recorded. The carpenters, who worked outside, mostly didn't get sick. Nobody could explain it. Today we would: fresh air and distance.", show: "And here's a strange detail the company recorded. The carpenters, who worked outside, mostly didn't get sick. Nobody could explain it. Today we would: fresh air and distance." },
  { say: "On the eighth of August, the first miner died. He was twenty.", show: "On the eighth of August, the first miner died. He was 20." },
  { say: "Three more followed in the next two weeks. Their bodies were shipped home to be buried in their own villages.", show: "Three more followed in the next two weeks. Their bodies were shipped home to be buried in their own villages." },
  { say: "By the end of August, it seemed to be over.", show: "By the end of August, it seemed to be over." },
  { say: "On September 24th, the steamship Forsete arrived from Tromsø.", show: "On September 24th, the steamship Forsete arrived from Tromsø." },
  { say: "Almost everyone on board was infected. The sickest were carried straight to the hospital.", show: "Almost everyone on board was infected. The sickest were carried straight to the hospital." },
  { say: "In the first week of October, seven of those men died. They were nineteen to twenty-eight years old.", show: "In the first week of October, 7 of those men died. They were 19 to 28 years old." },
  { say: "This time, nobody shipped them home. The town burned their clothes and their bedding, and buried them at once, in a brand-new cemetery on the hillside.", show: "This time, nobody shipped them home. The town burned their clothes and their bedding, and buried them at once, in a brand-new cemetery on the hillside." },
  { say: "But it was late autumn, and the ground was frozen solid. So to make room for seven coffins, they used dynamite.", show: "But it was late autumn, and the ground was frozen solid. So to make room for 7 coffins, they used dynamite." },
  { say: "Seven wooden crosses, all dated 1918, still stand in the top row.", show: "7 wooden crosses, all dated 1918, still stand in the top row." },
  { say: "And for the next eighty years, those seven men were left alone.", show: "And for the next 80 years, those 7 men were left alone." },
  { say: "The 1918 flu killed tens of millions of people around the world.", show: "The 1918 flu killed tens of millions of people around the world." },
  { say: "And when it was over, nobody had a sample of it. Not one.", show: "And when it was over, nobody had a sample of it. Not one." },
  { say: "That's because in 1918, nobody knew what caused the flu. The flu virus wasn't even isolated until 1933.", show: "That's because in 1918, nobody knew what caused the flu. The flu virus wasn't even isolated until 1933." },
  { say: "So the killer had come and gone, and left nothing behind but its victims.", show: "So the killer had come and gone, and left nothing behind but its victims." },
  { say: "Scientists wanted it back badly. Not to use it. To understand it. What made this one flu so much deadlier than the others? And could it happen again?", show: "Scientists wanted it back badly. Not to use it. To understand it. What made this one flu so much deadlier than the others? And could it happen again?" },
  { say: "The best hope was cold. Somewhere frozen, where the bodies of victims might have been kept like meat in a freezer.", show: "The best hope was cold. Somewhere frozen, where the bodies of victims might have been kept like meat in a freezer." },
  { say: "In 1951, a young graduate student named Johan Hultin flew to a village in Alaska called Brevig Mission. In November 1918, the flu had killed seventy-two of its eighty people in five days.", show: "In 1951, a young graduate student named Johan Hultin flew to a village in Alaska called Brevig Mission. In November 1918, the flu had killed 72 of its 80 people in five days." },
  { say: "He dug into their frozen mass grave, took lung tissue, and carried it back to his lab in Iowa.", show: "He dug into their frozen mass grave, took lung tissue, and carried it back to his lab in Iowa." },
  { say: "He tried everything to grow the virus. Nothing grew.", show: "He tried everything to grow the virus. Nothing grew." },
  { say: "That same year, the U.S. Army reportedly ran its own search. The results were classified. They were negative too.", show: "That same year, the U.S. Army reportedly ran its own search. The results were classified. They were negative too." },
  { say: "For decades, the trail went cold.", show: "For decades, the trail went cold." },
  { say: "Then, in the 1990s, a young Canadian medical geographer named Kirsty Duncan started asking the same question.", show: "Then, in the 1990s, a young Canadian medical geographer named Kirsty Duncan started asking the same question." },
  { say: "Duncan spent years in archives looking for the right victims. They had to have died of the 1918 flu, they had to be buried somewhere frozen, and there had to be records saying exactly who they were.", show: "Duncan spent years in archives looking for the right victims. They had to have died of the 1918 flu, they had to be buried somewhere frozen, and there had to be records saying exactly who they were." },
  { say: "She found Longyearbyen. A mining company engineer's diary recorded the young miners who died that October and were buried together.", show: "She found Longyearbyen. A mining company engineer's diary recorded the young miners who died that October and were buried together." },
  { say: "It was close to perfect. Known names, known dates, and a graveyard in permafrost.", show: "It was close to perfect. Known names, known dates, and a graveyard in permafrost." },
  { say: "It took her five years to put the expedition together. Permission from the Norwegian authorities. Permission from the miners' families. A team of scientists from Canada, Britain, the United States and Norway.", show: "It took her 5 years to put the expedition together. Permission from the Norwegian authorities. Permission from the miners' families. A team of scientists from Canada, Britain, the United States and Norway." },
  { say: "And a lot of nervous people asking what would happen if they actually found the virus alive.", show: "And a lot of nervous people asking what would happen if they actually found the virus alive." },
  { say: "So everything was planned as if they might. Protective suits. Strict containment. Ground radar to find the coffins before a single shovel went in.", show: "So everything was planned as if they might. Protective suits. Strict containment. Ground radar to find the coffins before a single shovel went in." },
  { say: "The radar found them. Seven coffins, right by the seven crosses.", show: "The radar found them. 7 coffins, right by the 7 crosses." },
  { say: "The hope was that the miners had been buried about six feet down, deep inside the permafrost, where the ground stays frozen all year.", show: "The hope was that the miners had been buried about 6 feet down, deep inside the permafrost, where the ground stays frozen all year." },
  { say: "They dug for a week.", show: "They dug for a week." },
  { say: "And less than one meter down, they hit the coffins.", show: "And less than 1 meter down, they hit the coffins." },
  { say: "That was the first bad sign. The frozen ground at that spot didn't start until about one point two meters.", show: "That was the first bad sign. The frozen ground at that spot didn't start until about 1.2 meters." },
  { say: "The coffins were above it.", show: "The coffins were above it." },
  { say: "In the Arctic, the top layer of ground isn't permanent. It thaws every summer and freezes again every winter. And for eighty summers, those seven coffins had been sitting in it.", show: "In the Arctic, the top layer of ground isn't permanent. It thaws every summer and freezes again every winter. And for 80 summers, those 7 coffins had been sitting in it." },
  { say: "Thaw. Freeze. Thaw. Freeze.", show: "Thaw. Freeze. Thaw. Freeze." },
  { say: "The team still took samples from six of the seven bodies. But the bodies were not preserved the way they had hoped.", show: "The team still took samples from 6 of the 7 bodies. But the bodies were not preserved the way they had hoped." },
  { say: "One of the virologists put it simply. Either the coffins had risen over time, or they were never buried as deep as everyone assumed. Either way, they were not in the permafrost, and the virus could not have survived.", show: "One of the virologists put it simply. Either the coffins had risen over time, or they were never buried as deep as everyone assumed. Either way, they were not in the permafrost, and the virus could not have survived." },
  { say: "Five years of work. And the freezer had been switched off, every summer, the whole time.", show: "Five years of work. And the freezer had been switched off, every summer, the whole time." },
  { say: "Here's the part that stings.", show: "Here's the part that stings." },
  { say: "In 1997, a year before the dig, a paper appeared in the journal Science. A government pathologist named Jeffery Taubenberger had pulled pieces of the 1918 virus out of tissue saved from soldiers who died in the pandemic. But the samples were tiny. He needed more.", show: "In 1997, a year before the dig, a paper appeared in the journal Science. A government pathologist named Jeffery Taubenberger had pulled pieces of the 1918 virus out of tissue saved from soldiers who died in the pandemic. But the samples were tiny. He needed more." },
  { say: "A seventy-two-year-old retired doctor in San Francisco read that paper. Johan Hultin. The same man who had failed in Alaska forty-six years earlier.", show: "A 72-year-old retired doctor in San Francisco read that paper. Johan Hultin. The same man who had failed in Alaska 46 years earlier." },
  { say: "He bought a plane ticket. He put a few tools in a duffel bag, including his wife's garden shears. And he flew back to Brevig Mission.", show: "He bought a plane ticket. He put a few tools in a duffel bag, including his wife's garden shears. And he flew back to Brevig Mission." },
  { say: "With permission from the village, he reopened the mass grave.", show: "With permission from the village, he reopened the mass grave." },
  { say: "And this time he found her. A woman of about thirty. Hultin called her Lucy.", show: "And this time he found her. A woman of about 30. Hultin called her Lucy." },
  { say: "Her body had been protected well enough that her lungs were still preserved.", show: "Her body had been protected well enough that her lungs were still preserved." },
  { say: "He mailed the tissue to Taubenberger. Within days, the lab found the flu inside.", show: "He mailed the tissue to Taubenberger. Within days, the lab found the flu inside." },
  { say: "Her lungs gave the lab what it needed to read the 1918 virus, piece by piece. And in 2005, scientists used that code to rebuild it in a secure lab, and finally see what had made it so deadly.", show: "Her lungs gave the lab what it needed to read the 1918 virus, piece by piece. And in 2005, scientists used that code to rebuild it in a secure lab, and finally see what had made it so deadly." },
  { say: "So the virus did come out of the ice. Just not in Longyearbyen.", show: "So the virus did come out of the ice. Just not in Longyearbyen." },
  { say: "And Longyearbyen's graveyard?", show: "And Longyearbyen's graveyard?" },
  { say: "It kept taking normal burials until 1950. Then it stopped.", show: "It kept taking normal burials until 1950. Then it stopped." },
  { say: "The reason usually given is the cold: bodies in that ground decay very slowly, and the freezing and thawing can push what's buried back toward the surface.", show: "The reason usually given is the cold: bodies in that ground decay very slowly, and the freezing and thawing can push what's buried back toward the surface." },
  { say: "So since 1950, the town hasn't buried a coffin. Ashes in an urn can go in the ground, with permission. Anything else goes to the mainland.", show: "So since 1950, the town hasn't buried a coffin. Ashes in an urn can go in the ground, with permission. Anything else goes to the mainland." },
  { say: "And the rest of life works the same way. The hospital has no delivery room, so babies are born on the mainland. Anyone with a serious illness that can't be treated there is flown south to Tromsø.", show: "And the rest of life works the same way. The hospital has no delivery room, so babies are born on the mainland. Anyone with a serious illness that can't be treated there is flown south to Tromsø." },
  { say: "That's where the famous line comes from. The town where it's illegal to die.", show: "That's where the famous line comes from. The town where it's illegal to die." },
  { say: "It isn't. Nobody gets arrested for dying in Longyearbyen.", show: "It isn't. Nobody gets arrested for dying in Longyearbyen." },
  { say: "It's just a town that was never built for a whole life. It was built for coal. And in a way, it still works like that.", show: "It's just a town that was never built for a whole life. It was built for coal. And in a way, it still works like that." },
  { say: "If you like stories like this one, subscribe. There's a new one every day on the Shorts channel too.", show: "If you like stories like this one, subscribe. There's a new one every day on the Shorts channel too." },
  { say: "So here's the strange part.", show: "So here's the strange part." },
  { say: "Longyearbyen became famous as the place where the dead stay frozen.", show: "Longyearbyen became famous as the place where the dead stay frozen." },
  { say: "But when scientists finally dug up its most famous dead, they weren't frozen at all.", show: "But when scientists finally dug up its most famous dead, they weren't frozen at all." },
  { say: "The virus everyone hoped was waiting in that ice had been gone for decades.", show: "The virus everyone hoped was waiting in that ice had been gone for decades." },
  { say: "And the one that was found came from a different grave, on a different continent, dug by a man with a pair of garden shears, who just refused to stop looking.", show: "And the one that was found came from a different grave, on a different continent, dug by a man with a pair of garden shears, who just refused to stop looking." },
  { say: "So what do you think? Should anyone have tried to bring that virus back at all?", show: "So what do you think? Should anyone have tried to bring that virus back at all?" },
];

/** [start, end] seconds per segment; replaced by scripts/align.py */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0, 5.76], [6.16, 11.15], [11.55, 16.46], [16.86, 21.85], [22.25, 27.43], [27.83, 30.93], [31.33, 38.78], [39.18, 46.17], [46.57, 50.13], [50.53, 58.1], [58.5, 65.63], [66.03, 72.63], [73.03, 82.95], [83.35, 87.23], [87.63, 89.37], [89.77, 92.93], [93.33, 102.27], [102.67, 106.23], [106.63, 117.52], [117.92, 121.47], [121.87, 128.54], [128.94, 131.33], [131.73, 135.29], [135.69, 141.06], [141.46, 147.55], [147.95, 157.34], [157.74, 164.54], [164.94, 168.76], [169.16, 172.84], [173.24, 176.99], [177.39, 180.69], [181.09, 187.37], [187.77, 192.11], [192.51, 201.77], [202.17, 209.17], [209.57, 221.29], [221.69, 227.39], [227.79, 230.76], [231.16, 238.09], [238.49, 240.23], [240.63, 247.3], [247.7, 260.15], [260.55, 268.64], [269.04, 273.9], [274.3, 287.39], [287.79, 293.36], [293.76, 302.82], [303.22, 306.98], [307.38, 315.6], [316.0, 316.9], [317.3, 320.21], [320.61, 327.08], [327.48, 328.77], [329.17, 340.25], [340.65, 342.0], [342.4, 349.46], [349.86, 363.47], [363.87, 369.18], [369.58, 370.99], [371.39, 388.05], [388.45, 397.65], [398.05, 406.28], [406.68, 410.23], [410.63, 415.16], [415.56, 420.09], [420.49, 425.28], [425.68, 437.67], [438.07, 441.76], [442.16, 443.64], [444.04, 447.4], [447.8, 457.45], [457.85, 466.4], [466.8, 479.05], [479.45, 483.98], [484.38, 487.68], [488.08, 495.33], [495.73, 501.82], [502.22, 503.57], [503.97, 507.92], [508.32, 513.36], [513.76, 518.23], [518.63, 528.48], [528.88, 533.6]];
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
  { seg: 9, num: "1", title: "A town named after an American" },
  { seg: 14, num: "2", title: "The summer the mines went quiet" },
  { seg: 22, num: "3", title: "The last ship" },
  { seg: 29, num: "4", title: "A virus nobody kept" },
  { seg: 40, num: "5", title: "The geographer" },
  { seg: 47, num: "6", title: "The dig" },
  { seg: 58, num: "7", title: "Meanwhile, in Alaska" },
  { seg: 68, num: "8", title: "The rule" },
  { seg: 77, num: "END", title: "The strange part" },
];
