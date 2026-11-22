// "How One Oil Rig Drained an Entire Lake" (Paradox Town Explained, long-form #10): Lake Peigneur, Louisiana, November 20, 1980.
// Everything is timed from SEGMENTS (seconds); scripts/align.py rewrites SEG_TIMES and WORDS from the voice.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "Just after dawn, an oil rig on a quiet Louisiana lake began to lean.", show: "Just after dawn, an oil rig on a quiet Louisiana lake began to lean." },
  { say: "The crew got off. Then the whole rig, as tall as a fifteen-story building, rolled over and disappeared... into water ten feet deep.", show: "The crew got off. Then the whole rig, as tall as a 15-story building, rolled over and disappeared... into water 10 feet deep." },
  { say: "By late morning, the entire lake was gone.", show: "By late morning, the entire lake was gone." },
  { say: "This is the story of the day a lake went down the drain. And the strangest part isn't how it happened. It's who it happened to... and who walked away.", show: "This is the story of the day a lake went down the drain. And the strangest part isn't how it happened. It's who it happened to... and who walked away." },
  { say: "If you like weird history, subscribe.", show: "If you like weird history, subscribe." },
  { say: "To understand what happened, you have to know what was under this lake.", show: "To understand what happened, you have to know what was under this lake." },
  { say: "Lake Pen-yur sits near the Gulf coast of Louisiana, about ten miles west of New Iberia. In nineteen eighty it was shallow, ten feet or so, and fresh. People fished it, and a canal connected it to the Gulf of Mexico.", show: "Lake Peigneur sits near the Gulf coast of Louisiana, about 10 miles west of New Iberia. In 1980 it was shallow, 10 feet or so, and fresh. People fished it, and a canal connected it to the Gulf of Mexico." },
  { say: "Next to the lake rose a hill called Jefferson Island. It isn't really an island. It's the top of a salt dome, a mountain of salt pushed up from deep underground.", show: "Next to the lake rose a hill called Jefferson Island. It isn't really an island. It's the top of a salt dome, a mountain of salt pushed up from deep underground." },
  { say: "In eighteen sixty-nine, the actor Joseph Jefferson, famous for playing Rip Van Winkle, bought the island as a hunting and fishing spot, and built a house there. By nineteen eighty, the grounds around it were a famous garden, full of giant live oaks.", show: "In 1869, the actor Joseph Jefferson, famous for playing Rip Van Winkle, bought the island as a hunting and fishing spot, and built a house there. By 1980, the grounds around it were a famous garden, full of giant live oaks." },
  { say: "And underneath all of it, for decades, men had been mining the salt.", show: "And underneath all of it, for decades, men had been mining the salt." },
  { say: "The Diamond Crystal salt mine ran deep below the island and out under the lake. It had three levels, the deepest around fifteen hundred feet down. The rooms were enormous, carved out over decades, held up by giant pillars of salt.", show: "The Diamond Crystal salt mine ran deep below the island and out under the lake. It had three levels, the deepest around 1,500 feet down. The rooms were enormous, carved out over decades, held up by giant pillars of salt." },
  { say: "On the morning of November twentieth, about fifty men were working down there.", show: "On the morning of November 20, about 50 men were working down there." },
  { say: "Up on the lake, there was another company. Texaco had hired a contractor, Wilson Brothers, to drill an exploratory oil well from a rig standing in the shallow water.", show: "Up on the lake, there was another company. Texaco had hired a contractor, Wilson Brothers, to drill an exploratory oil well from a rig standing in the shallow water." },
  { say: "Two industries, one lake. One digging under it, the other drilling through it.", show: "Two industries, one lake. One digging under it, the other drilling through it." },
  { say: "The drill had been going for about a day and a half. Then, early on November twentieth, at about twelve hundred and thirty feet down, it got stuck.", show: "The drill had been going for about a day and a half. Then, early on November 20, at about 1,230 feet down, it got stuck." },
  { say: "The crew worked for a couple of hours to free it. Then they heard loud pops under the platform. And the rig began to tilt.", show: "The crew worked for a couple of hours to free it. Then they heard loud pops under the platform. And the rig began to tilt." },
  { say: "Seven men were on it. They got off, fast.", show: "7 men were on it. They got off, fast." },
  { say: "And then they watched the whole rig, worth around five million dollars, tip over and sink... into a lake they knew was ten feet deep.", show: "And then they watched the whole rig, worth around $5 million, tip over and sink... into a lake they knew was 10 feet deep." },
  { say: "Ten feet of water can't swallow a drilling rig. Unless there's no bottom anymore.", show: "Ten feet of water can't swallow a drilling rig. Unless there's no bottom anymore." },
  { say: "Here's what most people think happened. The drill had gone through the roof of the salt mine.", show: "Here's what most people think happened. The drill had gone through the roof of the salt mine." },
  { say: "And fresh water does something to salt. It dissolves it.", show: "And fresh water does something to salt. It dissolves it." },
  { say: "So the hole didn't stay small. The water rushing down ate the salt around it, and the hole got bigger. And bigger.", show: "So the hole didn't stay small. The water rushing down ate the salt around it, and the hole got bigger. And bigger." },
  { say: "Out on the lake that morning, a fisherman named Leonce Viator Junior was out with his nephew at his favorite fishing spot. He later said he looked around and thought, something is wrong.", show: "Out on the lake that morning, a fisherman named Leonce Viator Junior was out with his nephew at his favorite fishing spot. He later said he looked around and thought, something is wrong." },
  { say: "The water was moving. Toward one spot.", show: "The water was moving. Toward one spot." },
  { say: "They pointed their little boat at the shore and got out.", show: "They pointed their little boat at the shore and got out." },
  { say: "Fifteen hundred feet below them, the miners were already in trouble.", show: "1,500 feet below them, the miners were already in trouble." },
  { say: "Water was coming into the mine. And in a salt mine, water is the one thing you can never let in.", show: "Water was coming into the mine. And in a salt mine, water is the one thing you can never let in." },
  { say: "The alarm went out. Men ran for the shaft. But there was one elevator out, and it carried eight people at a time.", show: "The alarm went out. Men ran for the shaft. But there was one elevator out, and it carried 8 people at a time." },
  { say: "A maintenance foreman named Randy LaSalle drove around the far corners of the mine, warning men who hadn't heard the alarm.", show: "A maintenance foreman named Randy LaSalle drove around the far corners of the mine, warning men who hadn't heard the alarm." },
  { say: "Some of the crew had to get past water on the lower level, in carts and vehicles, to reach the elevator.", show: "Some of the crew had to get past water on the lower level, in carts and vehicles, to reach the elevator." },
  { say: "They went up, eight at a time. And every single man made it out.", show: "They went up, 8 at a time. And every single man made it out." },
  { say: "The company later gave six of them awards for getting others out first.", show: "The company later gave 6 of them awards for getting others out first." },
  { say: "Up top, it was turning into something nobody had ever seen.", show: "Up top, it was turning into something nobody had ever seen." },
  { say: "The lake became a whirlpool, a quarter of a mile wide.", show: "The lake became a whirlpool, a quarter of a mile wide." },
  { say: "It pulled in barges. Eleven of them. It pulled in a tugboat. It pulled in another drilling platform, trees, trucks, a parking lot, and about sixty-five acres of Jefferson Island.", show: "It pulled in barges. 11 of them. It pulled in a tugboat. It pulled in another drilling platform, trees, trucks, a parking lot, and about 65 acres of Jefferson Island." },
  { say: "Air trapped in the mine was forced back out, and blew geysers up through the mine shafts, hundreds of feet high.", show: "Air trapped in the mine was forced back out, and blew geysers up through the mine shafts, hundreds of feet high." },
  { say: "And in about three hours, the lake was gone. Where it had been was a crater of mud.", show: "And in about 3 hours, the lake was gone. Where it had been was a crater of mud." },
  { say: "But the story isn't over. Because the lake had a drain at the other end too.", show: "But the story isn't over. Because the lake had a drain at the other end too." },
  { say: "The Del-come Canal connected Lake Pen-yur to the Gulf of Mexico. Normally the lake's water ran out down the canal, toward the sea.", show: "The Delcambre Canal connected Lake Peigneur to the Gulf of Mexico. Normally the lake's water ran out down the canal, toward the sea." },
  { say: "Now there was a hole where the lake used to be. So the canal turned around.", show: "Now there was a hole where the lake used to be. So the canal turned around." },
  { say: "Salt water from the Gulf started running backwards, into the crater.", show: "Salt water from the Gulf started running backwards, into the crater." },
  { say: "Where it poured over the edge, it made a waterfall about a hundred and fifty feet tall. For a few days, the tallest waterfall in Louisiana.", show: "Where it poured over the edge, it made a waterfall about 150 feet tall. For a few days, the tallest waterfall in Louisiana." },
  { say: "It took about two days to fill the hole back up.", show: "It took about 2 days to fill the hole back up." },
  { say: "And then the strangest thing of all happened.", show: "And then the strangest thing of all happened." },
  { say: "Nine of the eleven barges that had been sucked down... popped back up to the surface. Like corks.", show: "9 of the 11 barges that had been sucked down... popped back up to the surface. Like corks." },
  { say: "The rig and the tugboat never came back.", show: "The rig and the tugboat never came back." },
  { say: "So who was to blame?", show: "So who was to blame?" },
  { say: "Texaco said the salt company had kept its mine a secret. The salt company said Texaco's crew had drilled in the wrong place.", show: "Texaco said the salt company had kept its mine a secret. The salt company said Texaco's crew had drilled in the wrong place." },
  { say: "Federal mine investigators studied it for months. In nineteen eighty-one, their report said it would be extremely difficult to determine the precise cause.", show: "Federal mine investigators studied it for months. In 1981, their report said it would be extremely difficult to determine the precise cause." },
  { say: "In other words, officially, nobody knows.", show: "In other words, officially, nobody knows." },
  { say: "But in nineteen eighty-three, Texaco and Wilson Brothers paid the salt company thirty-two million dollars. The gardens on the island got twelve point eight million more.", show: "But in 1983, Texaco and Wilson Brothers paid the salt company $32 million. The gardens on the island got $12.8 million more." },
  { say: "The salt mine closed for good in nineteen eighty-six.", show: "The salt mine closed for good in 1986." },
  { say: "And the lake? It came back. Just not the same lake.", show: "And the lake? It came back. Just not the same lake." },
  { say: "Before, it was ten feet deep and fresh. Now, it's salt water, and about two hundred feet deep in places. The deepest lake in Louisiana.", show: "Before, it was 10 feet deep and fresh. Now, it's salt water, and about 200 feet deep in places. The deepest lake in Louisiana." },
  { say: "The freshwater life it had was gone. A whole new kind of lake had moved in.", show: "The freshwater life it had was gone. A whole new kind of lake had moved in." },
  { say: "The salt dome is still down there. Since the nineties, it's been used to store natural gas.", show: "The salt dome is still down there. Since the nineties, it's been used to store natural gas." },
  { say: "And if you go there today, there's something sticking out of the water. A brick chimney, from a house the lake swallowed that day.", show: "And if you go there today, there's something sticking out of the water. A brick chimney, from a house the lake swallowed that day." },
  { say: "Not one person died. Every miner, seven drillers, a fisherman and his nephew. All of them walked away.", show: "Not one person died. Every miner, 7 drillers, a fisherman and his nephew. All of them walked away." },
  { say: "The only confirmed losses were three dogs... and a lake.", show: "The only confirmed losses were 3 dogs... and a lake." },
  { say: "If you like weird history, subscribe.", show: "If you like weird history, subscribe." },
  { say: "So here's my question. Texaco said the salt company hid its mine. The salt company said Texaco drilled in the wrong place. Who do you think was to blame?", show: "So here's my question. Texaco said the salt company hid its mine. The salt company said Texaco drilled in the wrong place. Who do you think was to blame?" },
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
