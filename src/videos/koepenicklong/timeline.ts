// "How One Used Uniform Fooled an Entire Empire" (Paradox Town Explained, long-form #9): the Captain of Koepenick, 1906.
// 1920 x 1080, 30 fps. SEG_TIMES and WORDS are rewritten by the Align to voice workflow (scripts/align.py) from
// public/koepenicklong/voice.mp3. Facts and sources: claude/koepenick.md in the Claude project.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "These are my warrant.", show: "\"These are my warrant.\"" },
  { say: "That's what a captain of the Prussian Guards told the mayor of Köpenick, as he pointed at ten loaded rifles with bayonets fixed.", show: "That's what a captain of the Prussian Guards told the mayor of Köpenick, as he pointed at 10 loaded rifles with bayonets fixed." },
  { say: "Within the hour, the mayor was under arrest, the town's cash was in two mail sacks, and the captain had signed a receipt for it.", show: "Within the hour, the mayor was under arrest, the town's cash was in 2 mail sacks, and the captain had signed a receipt for it." },
  { say: "There was just one problem. He wasn't a captain.", show: "There was just one problem. He wasn't a captain." },
  { say: "He was a fifty-seven-year-old shoemaker who had spent most of his adult life in prison, wearing a uniform he'd bought from junk shops.", show: "He was a 57-year-old shoemaker who had spent most of his adult life in prison, wearing a uniform he'd bought from junk shops." },
  { say: "And within days, the whole world was laughing. Not at him. At the army that obeyed him.", show: "And within days, the whole world was laughing. Not at him. At the army that obeyed him." },
  { say: "This is the true story of the Captain of Köpenick.", show: "This is the true story of the Captain of Köpenick." },
  { say: "If you like history that sounds made up but isn't, subscribe.", show: "If you like history that sounds made up but isn't, subscribe." },
  { say: "His name was Wilhelm Voigt. He was born in 1849, in Tilsit, in East Prussia, the son of a shoemaker.", show: "His name was Wilhelm Voigt. He was born in 1849, in Tilsit, in East Prussia, the son of a shoemaker." },
  { say: "At fourteen, he was jailed for theft. It was the first of many sentences.", show: "At 14, he was jailed for theft. It was the first of many sentences." },
  { say: "By the time he was fifty-seven, he had spent around twenty-nine years behind bars. The last stretch, about fifteen years, was for trying to break into a court's cash box.", show: "By the time he was 57, he had spent around 29 years behind bars. The last stretch, about 15 years, was for trying to break into a court's cash box." },
  { say: "He walked out in February 1906, and for a while, he did everything right.", show: "He walked out in February 1906, and for a while, he did everything right." },
  { say: "A prison chaplain found him a job with a court shoemaker in Wismar, on the Baltic coast. His employer liked him.", show: "A prison chaplain found him a job with a court shoemaker in Wismar, on the Baltic coast. His employer liked him." },
  { say: "But in Prussia, the police could decide where a former convict was allowed to live.", show: "But in Prussia, the police could decide where a former convict was allowed to live." },
  { say: "Within three months, he was ordered out of Wismar.", show: "Within 3 months, he was ordered out of Wismar." },
  { say: "He moved in with his sister near Berlin, and found work in a shoe factory. Then, in August, the police banned him from Berlin too.", show: "He moved in with his sister near Berlin, and found work in a shoe factory. Then, in August, the police banned him from Berlin too." },
  { say: "Here was the trap. Without a registered address, no one would hire him. And without a job, he couldn't register an address.", show: "Here was the trap. Without a registered address, no one would hire him. And without a job, he couldn't register an address." },
  { say: "So he stayed in Berlin anyway, with no papers, and started planning.", show: "So he stayed in Berlin anyway, with no papers, and started planning." },
  { say: "Voigt had noticed something about Berlin. It was a city full of soldiers, and a uniform opened every door.", show: "Voigt had noticed something about Berlin. It was a city full of soldiers, and a uniform opened every door." },
  { say: "So he went shopping.", show: "So he went shopping." },
  { say: "Piece by piece, from second-hand dealers in Berlin and Potsdam, he put together the uniform of a captain in the First Foot Guards, one of the proudest regiments in the army.", show: "Piece by piece, from second-hand dealers in Berlin and Potsdam, he put together the uniform of a captain in the 1st Foot Guards, one of the proudest regiments in the army." },
  { say: "It wasn't a perfect fit, and it wasn't quite right. Instead of a helmet, he went with an officer's cap, because it was easier to hide.", show: "It wasn't a perfect fit, and it wasn't quite right. Instead of a helmet, he went with an officer's cap, because it was easier to hide." },
  { say: "He wrapped it all in newspaper, and left it in a station's baggage room.", show: "He wrapped it all in newspaper, and left it in a station's baggage room." },
  { say: "On the evening of October fifteenth, he collected the bundle.", show: "On the evening of October 15, he collected the bundle." },
  { say: "The next morning, October sixteenth, 1906, he took a train out to Köpenick, a small town on the river Spree, just southeast of Berlin, and looked over its town hall.", show: "The next morning, October 16, 1906, he took a train out to Köpenick, a small town on the river Spree, just southeast of Berlin, and looked over its town hall." },
  { say: "Then he went back into the city, put on the uniform, and waited.", show: "Then he went back into the city, put on the uniform, and waited." },
  { say: "Around noon, a sergeant and four guardsmen came marching back from the army's swimming baths at Plötzensee.", show: "Around noon, a sergeant and 4 guardsmen came marching back from the army's swimming baths at Plötzensee." },
  { say: "Voigt stopped them. By order of the Kaiser, he said, they were now under his command.", show: "Voigt stopped them. By order of the Kaiser, he said, they were now under his command." },
  { say: "He sent the sergeant off to report. The four men fell in.", show: "He sent the sergeant off to report. The four men fell in." },
  { say: "Then six more soldiers came by, on their way back from the shooting range. He took them too.", show: "Then 6 more soldiers came by, on their way back from the shooting range. He took them too." },
  { say: "Ten armed men. Not one of them asked who he was.", show: "10 armed men. Not one of them asked who he was." },
  { say: "They hadn't eaten, so on the way, the captain treated them to beer, sausages and cigars, and gave every man one mark.", show: "They hadn't eaten, so on the way, the captain treated them to beer, sausages and cigars, and gave every man 1 mark." },
  { say: "Then they all got on a train.", show: "Then they all got on a train." },
  { say: "At two forty-six in the afternoon, they reached Köpenick.", show: "At 2:46 in the afternoon, they reached Köpenick." },
  { say: "Voigt marched his squad to the town hall, posted guards on every exit, and had the gates shut. The local police were told to keep the square clear.", show: "Voigt marched his squad to the town hall, posted guards on every exit, and had the gates shut. The local police were told to keep the square clear." },
  { say: "He had the post office stop all calls and telegrams to Berlin for an hour.", show: "He had the post office stop all calls and telegrams to Berlin for an hour." },
  { say: "Then he went upstairs, to the mayor, Doctor Georg Langerhans.", show: "Then he went upstairs, to the mayor, Doctor Georg Langerhans." },
  { say: "He announced that he had orders to take over the town's administration, and its treasury.", show: "He announced that he had orders to take over the town's administration, and its treasury." },
  { say: "The mayor asked for his warrant.", show: "The mayor asked for his warrant." },
  { say: "Voigt pointed at the bayonets.", show: "Voigt pointed at the bayonets." },
  { say: "That was enough.", show: "That was enough." },
  { say: "The mayor was placed under arrest. His wife was allowed to go with him.", show: "The mayor was placed under arrest. His wife was allowed to go with him." },
  { say: "Then the captain sent for the treasurer, a man named von Wiltberg, and told him to close the books.", show: "Then the captain sent for the treasurer, a man named von Wiltberg, and told him to close the books." },
  { say: "The treasurer counted out the cash. A little over four thousand marks.", show: "The treasurer counted out the cash. A little over 4,000 marks." },
  { say: "Voigt took about three and a half thousand of it, in two mail sacks.", show: "Voigt took about 3,500 of it, in 2 mail sacks." },
  { say: "And because this was Prussia, the treasurer asked for a receipt.", show: "And because this was Prussia, the treasurer asked for a receipt." },
  { say: "The captain signed it. Von Malzahn, Captain, First Guards Regiment.", show: "The captain signed it. Von Malzahn, Captain, 1st Guards Regiment." },
  { say: "Von Malzahn was the name of the director of his last prison.", show: "Von Malzahn was the name of the director of his last prison." },
  { say: "He sent the mayor and the treasurer off to Berlin under guard, to be questioned at the Neue Wache, the royal guardhouse.", show: "He sent the mayor and the treasurer off to Berlin under guard, to be questioned at the Neue Wache, the royal guardhouse." },
  { say: "He told the rest of his soldiers to hold the town hall for another half hour, then go back to Berlin and report.", show: "He told the rest of his soldiers to hold the town hall for another half hour, then go back to Berlin and report." },
  { say: "And then the captain simply walked away.", show: "And then the captain simply walked away." },
  { say: "Back in Berlin, he bought himself a new suit, a coat, a hat and shoes. He signed for those as von Malzahn too.", show: "Back in Berlin, he bought himself a new suit, a coat, a hat and shoes. He signed for those as von Malzahn too." },
  { say: "By the time anyone in Köpenick thought to telegraph Berlin, the mayor had been delivered to the guardhouse, and the captain was gone.", show: "By the time anyone in Köpenick thought to telegraph Berlin, the mayor had been delivered to the guardhouse, and the captain was gone." },
  { say: "One man had noticed something, though. The owner of the restaurant at Köpenick station.", show: "One man had noticed something, though. The owner of the restaurant at Köpenick station." },
  { say: "He said a captain had come in early that morning, taken off his hat indoors, and wished him a good morning. And the uniform was worn wrong.", show: "He said a captain had come in early that morning, taken off his hat indoors, and wished him a good morning. And the uniform was worn wrong." },
  { say: "Small things. Nobody else had noticed.", show: "Small things. Nobody else had noticed." },
  { say: "Then the newspapers got the story.", show: "Then the newspapers got the story." },
  { say: "The police offered two thousand marks for the fake captain. Köpenick added another thousand.", show: "The police offered 2,000 marks for the fake captain. Köpenick added another 1,000." },
  { say: "Across Germany, innocent men were picked up. One schoolteacher, hundreds of miles away, was arrested because someone thought his handwriting looked like the captain's.", show: "Across Germany, innocent men were picked up. One schoolteacher, hundreds of miles away, was arrested because someone thought his handwriting looked like the captain's." },
  { say: "Voigt lasted ten days.", show: "Voigt lasted 10 days." },
  { say: "On October twenty-sixth, police found him at his lodgings in Berlin, eating breakfast. An old acquaintance had pointed them to him, for the reward.", show: "On October 26, police found him at his lodgings in Berlin, eating breakfast. An old acquaintance had pointed them to him, for the reward." },
  { say: "He had spent about seven hundred and seventy marks.", show: "He had spent about 770 marks." },
  { say: "On December first, a Berlin court found him guilty, and gave him four years.", show: "On December 1, a Berlin court found him guilty, and gave him 4 years." },
  { say: "The judges even noted that after his last sentence, he had really tried to earn an honest living.", show: "The judges even noted that after his last sentence, he had really tried to earn an honest living." },
  { say: "But by then, the case had gone around the world.", show: "But by then, the case had gone around the world." },
  { say: "Newspapers everywhere loved it. The proudest army in Europe, taken in by one second-hand uniform.", show: "Newspapers everywhere loved it. The proudest army in Europe, taken in by one second-hand uniform." },
  { say: "Letters asking for mercy arrived from abroad. One came from the mayor of San Francisco.", show: "Letters asking for mercy arrived from abroad. One came from the mayor of San Francisco." },
  { say: "And the Kaiser himself, it's said, laughed.", show: "And the Kaiser himself, it's said, laughed." },
  { say: "In August 1908, after about twenty months, Wilhelm the Second pardoned him.", show: "In August 1908, after about 20 months, Wilhelm the Second pardoned him." },
  { say: "Voigt walked out of prison a celebrity.", show: "Voigt walked out of prison a celebrity." },
  { say: "On the day of his release, he recorded a gramophone record. Days later, a Berlin waxworks unveiled a figure of him.", show: "On the day of his release, he recorded a gramophone record. Days later, a Berlin waxworks unveiled a figure of him." },
  { say: "He sold signed postcards of himself in the uniform. He told his story on stage, in Germany, in Vienna, in Budapest and in London.", show: "He sold signed postcards of himself in the uniform. He told his story on stage, in Germany, in Vienna, in Budapest and in London." },
  { say: "He even got to New York, by way of Canada, after the United States refused him a visa.", show: "He even got to New York, by way of Canada, after the United States refused him a visa." },
  { say: "The police kept banning his appearances. He kept appearing.", show: "The police kept banning his appearances. He kept appearing." },
  { say: "In 1909, he published his memoirs. And in them, he gave his reason for the whole thing.", show: "In 1909, he published his memoirs. And in them, he gave his reason for the whole thing." },
  { say: "He said he had never wanted the money. He only wanted a passport, so he could leave Germany and start again.", show: "He said he had never wanted the money. He only wanted a passport, so he could leave Germany and start again." },
  { say: "There was one problem with that story.", show: "There was one problem with that story." },
  { say: "Köpenick's town hall couldn't issue passports. In that district, they came from a different office entirely.", show: "Köpenick's town hall couldn't issue passports. In that district, they came from a different office entirely." },
  { say: "Some historians think he was after the money all along.", show: "Some historians think he was after the money all along." },
  { say: "Either way, Voigt did get his passport in the end.", show: "Either way, Voigt did get his passport in the end." },
  { say: "In 1909, he settled in Luxembourg. And in May 1910, the man Prussia wouldn't give papers to received a passport from Luxembourg.", show: "In 1909, he settled in Luxembourg. And in May 1910, the man Prussia wouldn't give papers to received a passport from Luxembourg." },
  { say: "He worked there as a shoemaker and a waiter. He died in 1922, poor, his savings wiped out by inflation.", show: "He worked there as a shoemaker and a waiter. He died in 1922, poor, his savings wiped out by inflation." },
  { say: "But he left something behind. Germans still call a stunt like his a Köpenickiade.", show: "But he left something behind. Germans still call a stunt like his a Köpenickiade." },
  { say: "And outside Köpenick's town hall today, there's a bronze statue of him, in the uniform.", show: "And outside Köpenick's town hall today, there's a bronze statue of him, in the uniform." },
  { say: "If you like stories like this one, subscribe. There's a new one every day on the Shorts channel too.", show: "If you like stories like this one, subscribe. There's a new one every day on the Shorts channel too." },
  { say: "So tell me. Would the uniform have fooled you?", show: "So tell me. Would the uniform have fooled you?" },
];

const WPS = 3.4, PAUSE = 0.35;
const spoken = (s: string) => s.split(/[\s-]+/).filter(Boolean).length;
const est = (): [number, number][] => { let t = 0; return SEGMENTS.map((s) => { const a = t, b = a + spoken(s.say) / WPS; t = b + PAUSE; return [Math.round(a * 100) / 100, Math.round(b * 100) / 100]; }); };

/** [start, end] seconds per segment; replaced by scripts/align.py */
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
