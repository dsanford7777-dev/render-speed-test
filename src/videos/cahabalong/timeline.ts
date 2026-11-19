// "The Train Wreck a Railroad Blamed on Robbers Nobody Could Find" (Paradox Town Explained, long-form #8): script, timing and shots.
// 1920 x 1080, 30 fps. SEG_TIMES and WORDS are rewritten by the Align to voice workflow (scripts/align.py) from
// public/cahabalong/voice.mp3. Facts and sources: claude/cahaba.md in the Claude project.
export const FPS = 30;

/** one narration line per segment: `say` is what the voice reads, `show` is the caption text (numbers as digits) */
export type Segment = { say: string; show: string };
export const SEGMENTS: Segment[] = [
  { say: "Ten thousand dollars. That's what a railroad offered, in 1896, for the men who wrecked one of its trains.", show: "$10,000. That's what a railroad offered, in 1896, for the men who wrecked one of its trains." },
  { say: "A passenger train had fallen a hundred and ten feet off a bridge in Alabama. More than twenty people were dead.", show: "A passenger train had fallen 110 feet off a bridge in Alabama. More than 20 people were dead." },
  { say: "And within hours, the newspapers knew who did it. Train robbers. Fiends in human form.", show: "And within hours, the newspapers knew who did it. Train robbers. Fiends in human form." },
  { say: "There was just one problem.", show: "There was just one problem." },
  { say: "The people who lived next to that bridge didn't believe a word of it.", show: "The people who lived next to that bridge didn't believe a word of it." },
  { say: "And more than a century later, a historian opened the railroad's own records, and argued they had been right all along.", show: "And more than a century later, a historian opened the railroad's own records, and argued they had been right all along." },
  { say: "This is the story of the Cahaba River wreck, the robbers nobody could find, and a bridge that was only four years old.", show: "This is the story of the Cahaba River wreck, the robbers nobody could find, and a bridge that was only 4 years old." },
  { say: "If you like history that sounds made up but isn't, subscribe.", show: "If you like history that sounds made up but isn't, subscribe." },
  { say: "Birmingham, Alabama, was barely twenty-five years old, and it ran on coal and iron.", show: "Birmingham, Alabama, was barely 25 years old, and it ran on coal and iron." },
  { say: "To move them, the Louisville and Nashville Railroad built a web of branch lines through the hills, called the Birmingham Mineral Railroad.", show: "To move them, the Louisville and Nashville Railroad built a web of branch lines through the hills, called the Birmingham Mineral Railroad." },
  { say: "One of those lines wound south through the Cahaba coal field, linking small mining towns like Blocton.", show: "One of those lines wound south through the Cahaba coal field, linking small mining towns like Blocton." },
  { say: "And at one point it had to cross the Cahaba River.", show: "And at one point it had to cross the Cahaba River." },
  { say: "The river there is shallow. That winter it was only three or four feet deep. But it sits at the bottom of a deep cut.", show: "The river there is shallow. That winter it was only 3 or 4 feet deep. But it sits at the bottom of a deep cut." },
  { say: "So the crossing was an iron bridge, with wooden trestles at each end, a hundred and ten feet above the water.", show: "So the crossing was an iron bridge, with wooden trestles at each end, 110 feet above the water." },
  { say: "It had been built just four years earlier. The newspapers called it perfectly safe.", show: "It had been built just 4 years earlier. The newspapers called it perfectly safe." },
  { say: "December twenty-seventh, 1896. A Sunday. Two days after Christmas.", show: "December twenty-seventh, 1896. A Sunday. 2 days after Christmas." },
  { say: "Train number forty left Birmingham with an engine, a baggage car and two passenger coaches.", show: "Train number 40 left Birmingham with an engine, a baggage car and 2 passenger coaches." },
  { say: "At the throttle was Frank White, thirty-eight years old, an engineer known for staying cool.", show: "At the throttle was Frank White, 38 years old, an engineer known for staying cool." },
  { say: "Behind him were around thirty people. Most were miners and their families.", show: "Behind him were around 30 people. Most were miners and their families." },
  { say: "One was a railroad conductor named Henry Hanbury. He wasn't working that day. He had brought his wife and their two children along for the ride.", show: "One was a railroad conductor named Henry Hanbury. He wasn't working that day. He had brought his wife and their 2 children along for the ride." },
  { say: "A little before eight in the morning, the train reached the bridge.", show: "A little before eight in the morning, the train reached the bridge." },
  { say: "The survivors all told the same story. The train left the rails. It bumped along the wooden ties. And then, with a crash, it went through.", show: "The survivors all told the same story. The train left the rails. It bumped along the wooden ties. And then, with a crash, it went through." },
  { say: "Two iron spans went down with it.", show: "2 iron spans went down with it." },
  { say: "White had seen something. When the engine was examined later, the steam was shut off and the lever was in reverse. He had tried to stop.", show: "White had seen something. When the engine was examined later, the steam was shut off and the lever was in reverse. He had tried to stop." },
  { say: "His fireman, Sam Spencer, jumped from the engine as it fell. He landed in the river, and lived, with a broken arm.", show: "His fireman, Sam Spencer, jumped from the engine as it fell. He landed in the river, and lived, with a broken arm." },
  { say: "He was the only member of the crew who did.", show: "He was the only member of the crew who did." },
  { say: "The fall did not kill everyone.", show: "The fall did not kill everyone." },
  { say: "But the coaches were heated by stoves. And within minutes, the wreck was on fire.", show: "But the coaches were heated by stoves. And within minutes, the wreck was on fire." },
  { say: "A farmer nearby heard the crash, saw the gap in the bridge, and went four miles to the nearest telegraph station.", show: "A farmer nearby heard the crash, saw the gap in the bridge, and went 4 miles to the nearest telegraph station." },
  { say: "By the time a relief train arrived, the fire had done its work.", show: "By the time a relief train arrived, the fire had done its work." },
  { say: "The count of the dead was never settled. The railroad's own notice said twenty-one. Other reports said as many as twenty-eight. Nine people came out alive.", show: "The count of the dead was never settled. The railroad's own notice said 21. Other reports said as many as 28. 9 people came out alive." },
  { say: "Henry Hanbury was one of them. His wife and both of his children were not.", show: "Henry Hanbury was one of them. His wife and both of his children were not." },
  { say: "And the day wasn't over. A second train, rushing men and timber to the bridge, ran into the relief train standing on the line.", show: "And the day wasn't over. A second train, rushing men and timber to the bridge, ran into the relief train standing on the line." },
  { say: "Two wrecks, on one railroad, in one day.", show: "Two wrecks, on one railroad, in one day." },
  { say: "The explanation arrived almost as fast as the news.", show: "The explanation arrived almost as fast as the news." },
  { say: "That same day, papers across the country reported that the train had been wrecked on purpose. Someone had removed a rail in the middle of the bridge.", show: "That same day, papers across the country reported that the train had been wrecked on purpose. Someone had removed a rail in the middle of the bridge." },
  { say: "An injured survivor was quoted, through his doctor, saying that men had come down to the wreck and robbed it. The very report that printed it admitted the story had not been confirmed.", show: "An injured survivor was quoted, through his doctor, saying that men had come down to the wreck and robbed it. The very report that printed it admitted the story had not been confirmed." },
  { say: "But it spread. Three savage-looking men had been seen leaving the river.", show: "But it spread. 3 savage-looking men had been seen leaving the river." },
  { say: "Railroad engineers said the evidence pointed to a missing rail.", show: "Railroad engineers said the evidence pointed to a missing rail." },
  { say: "And there had been a scare days earlier, on another trestle nearby, where a rail really was found removed.", show: "And there had been a scare days earlier, on another trestle nearby, where a rail really was found removed." },
  { say: "On December thirtieth, the reward notice ran in the Birmingham News. Ten thousand dollars, for the arrest and the evidence to convict whoever wrecked the bridge.", show: "On December thirtieth, the reward notice ran in the Birmingham News. $10,000, for the arrest and the evidence to convict whoever wrecked the bridge." },
  { say: "Two days after the wreck, a wire report said no trace of the three men had been found.", show: "2 days after the wreck, a wire report said no trace of the 3 men had been found." },
  { say: "In January, two men were jailed in Birmingham on suspicion. We found no record that anyone was ever convicted.", show: "In January, 2 men were jailed in Birmingham on suspicion. We found no record that anyone was ever convicted." },
  { say: "Here's what the national papers left out.", show: "Here's what the national papers left out." },
  { say: "A small Alabama paper printed a report from one of the towns that had buried the dead.", show: "A small Alabama paper printed a report from one of the towns that had buried the dead." },
  { say: "And the people who lived near the bridge, it said, put little faith in the train wrecker theory.", show: "And the people who lived near the bridge, it said, put little faith in the train wrecker theory." },
  { say: "The three men? Locals said they were respectable miners, who had helped pull people out.", show: "The 3 men? Locals said they were respectable miners, who had helped pull people out." },
  { say: "And three days after the wreck, a letter appeared in a Birmingham newspaper.", show: "And 3 days after the wreck, a letter appeared in a Birmingham newspaper." },
  { say: "Its writer said wrecks were bound to happen. And when they did, he said, railroad men who wanted to avoid paying damages told reporters that train wreckers did it.", show: "Its writer said wrecks were bound to happen. And when they did, he said, railroad men who wanted to avoid paying damages told reporters that train wreckers did it." },
  { say: "The reporters wanted a sensation. So they wired it everywhere.", show: "The reporters wanted a sensation. So they wired it everywhere." },
  { say: "And readers across the country pictured fiends in human form.", show: "And readers across the country pictured fiends in human form." },
  { say: "He was describing something real.", show: "He was describing something real." },
  { say: "Historians of Southern railroads have found the same move again and again in the 1890s.", show: "Historians of Southern railroads have found the same move again and again in the 1890s." },
  { say: "A train wrecks. The company's lawyers point to wreckers. And the question quietly changes, from \"what was wrong with the track?\" to \"who are the criminals?\"", show: "A train wrecks. The company's lawyers point to wreckers. And the question quietly changes, from \"what was wrong with the track?\" to \"who are the criminals?\"" },
  { say: "Because the difference was money.", show: "Because the difference was money." },
  { say: "If a gang pulled up a rail, the railroad was a victim.", show: "If a gang pulled up a rail, the railroad was a victim." },
  { say: "If its own bridge failed under a passenger train, it could owe every family on board.", show: "If its own bridge failed under a passenger train, it could owe every family on board." },
  { say: "For more than a hundred years, the robber story was the story.", show: "For more than 100 years, the robber story was the story." },
  { say: "Then a Birmingham historian named Terri Hicks went looking. Engineer Frank White is buried in the cemetery where she volunteers.", show: "Then a Birmingham historian named Terri Hicks went looking. Engineer Frank White is buried in the cemetery where she volunteers." },
  { say: "She went through the railroad's surviving records. And in 2012 she published what she found, under the title \"The Robbery That Never Was.\"", show: "She went through the railroad's surviving records. And in 2012 she published what she found, under the title \"The Robbery That Never Was.\"" },
  { say: "Her case is this. There were construction errors in that bridge. The company's investigators worked out what had really gone wrong. And nobody admitted it for decades.", show: "Her case is this. There were construction errors in that bridge. The company's investigators worked out what had really gone wrong. And nobody admitted it for decades." },
  { say: "Another historian, Scott Huffard, puts it more bluntly. He writes that the railroad's lawyers and investigators deliberately concealed those errors.", show: "Another historian, Scott Huffard, puts it more bluntly. He writes that the railroad's lawyers and investigators deliberately concealed those errors." },
  { say: "That is an argument built from company files, long after everyone involved had died. No court ever ruled on it.", show: "That is an argument built from company files, long after everyone involved had died. No court ever ruled on it." },
  { say: "But it fits what the neighbors said in 1897.", show: "But it fits what the neighbors said in 1897." },
  { say: "If you like stories like this one, subscribe. There's a new one every day on the Shorts channel too.", show: "If you like stories like this one, subscribe. There's a new one every day on the Shorts channel too." },
  { say: "So here's the strange part.", show: "So here's the strange part." },
  { say: "The ten thousand dollar reward may be the best evidence in the whole story.", show: "The $10,000 reward may be the best evidence in the whole story." },
  { say: "Just not for robbers.", show: "Just not for robbers." },
  { say: "The stone piers of that bridge still stand in the Cahaba River.", show: "The stone piers of that bridge still stand in the Cahaba River." },
  { say: "Henry Hanbury went back to work as a conductor. Nine years later he was killed in another wreck, keeping his passengers in their seats as a train bore down on them.", show: "Henry Hanbury went back to work as a conductor. 9 years later he was killed in another wreck, keeping his passengers in their seats as a train bore down on them." },
  { say: "And the three savage-looking men? If the neighbors were right, they were never robbers at all.", show: "And the 3 savage-looking men? If the neighbors were right, they were never robbers at all." },
  { say: "So what do you think? Robbers, or a bad bridge?", show: "So what do you think? Robbers, or a bad bridge?" },
];

/** [start, end] seconds per segment; replaced by scripts/align.py */
// __SEG_TIMES__
export const SEG_TIMES: [number, number][] = [[0.0, 6.33], [6.68, 13.68], [14.03, 19.03], [19.38, 21.05], [21.4, 26.07], [26.42, 33.42], [33.77, 41.43], [41.78, 45.45], [45.8, 50.47], [50.82, 58.15], [58.5, 64.17], [64.52, 68.18], [68.53, 76.87], [77.22, 84.22], [84.57, 89.23], [89.58, 92.58], [92.93, 97.93], [98.28, 103.28], [103.63, 107.63], [107.98, 116.65], [117.0, 121.0], [121.35, 130.02], [130.37, 132.7], [133.05, 141.72], [142.07, 149.4], [149.75, 153.08], [153.43, 155.43], [155.78, 160.78], [161.13, 168.13], [168.48, 172.82], [173.17, 181.83], [182.18, 187.18], [187.53, 195.53], [195.88, 198.55], [198.9, 201.9], [202.25, 211.25], [211.6, 222.6], [222.95, 226.95], [227.3, 230.63], [230.98, 237.32], [237.67, 246.33], [246.68, 252.68], [253.03, 259.37], [259.72, 262.05], [262.4, 268.07], [268.42, 274.42], [274.77, 279.77], [280.12, 284.45], [284.8, 294.47], [294.82, 298.15], [298.5, 301.83], [302.18, 303.85], [304.2, 309.2], [309.55, 318.22], [318.57, 320.23], [320.58, 324.58], [324.93, 330.27], [330.62, 334.62], [334.97, 341.63], [341.98, 349.65], [350.0, 359.0], [359.35, 366.02], [366.37, 373.03], [373.38, 376.38], [376.73, 383.07], [383.42, 385.08], [385.43, 390.1], [390.45, 391.78], [392.13, 396.13], [396.48, 406.82], [407.17, 412.5], [412.85, 416.18]];
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
  { seg: 8, num: "1", title: "A railroad built for coal" },
  { seg: 15, num: "2", title: "Sunday morning" },
  { seg: 26, num: "3", title: "The river" },
  { seg: 34, num: "4", title: "Fiends in human form" },
  { seg: 43, num: "5", title: "The people who didn't believe it" },
  { seg: 51, num: "6", title: "Why a railroad needs a villain" },
  { seg: 57, num: "7", title: "What the records say" },
  { seg: 65, num: "END", title: "The strange part" },
];

// ---------------- shots ----------------
/** k: "3d" = rendered scene (story3d.ts), "2d" = motion graphic (boards.tsx; maps are keyed "map:<name>:<step>").
 *  A shot starts at segment `s` (or at word `w` inside it) and runs until the next shot. g = graphic / shot key. */
export type Kind = "3d" | "2d";
type RawShot = { s: number; w: string | null; k: Kind; g: string };
const raw: RawShot[] = [
  { s: 0, w: null, k: "3d", g: "hook" },
  { s: 0, w: "railroad", k: "3d", g: "reward" },
  { s: 0, w: "men", k: "3d", g: "gang" },
  { s: 1, w: null, k: "3d", g: "gave" },
  { s: 1, w: "off", k: "3d", g: "drop" },
  { s: 1, w: "More", k: "3d", g: "dead" },
  { s: 2, w: null, k: "3d", g: "papers" },
  { s: 2, w: "Train", k: "3d", g: "fiends" },
  { s: 2, w: "human", k: "3d", g: "rail" },
  { s: 3, w: null, k: "2d", g: "problem" },
  { s: 4, w: null, k: "3d", g: "locals" },
  { s: 4, w: "believe", k: "3d", g: "doubt" },
  { s: 5, w: null, k: "3d", g: "archive" },
  { s: 5, w: "opened", k: "3d", g: "records" },
  { s: 5, w: "argued", k: "3d", g: "errors" },
  { s: 6, w: null, k: "2d", g: "story" },
  { s: 6, w: "bridge", k: "3d", g: "young" },
  { s: 7, w: null, k: "3d", g: "youngb" },
  { s: 8, w: null, k: "2d", g: "bham" },
  { s: 8, w: "coal", k: "3d", g: "townwide" },
  { s: 9, w: null, k: "2d", g: "ln" },
  { s: 9, w: "branch", k: "3d", g: "train" },
  { s: 10, w: null, k: "3d", g: "consist" },
  { s: 10, w: "linking", k: "3d", g: "townwide2" },
  { s: 11, w: null, k: "3d", g: "bridge" },
  { s: 12, w: null, k: "3d", g: "shallow" },
  { s: 12, w: "bottom", k: "3d", g: "height" },
  { s: 13, w: null, k: "3d", g: "trestle" },
  { s: 13, w: "wooden", k: "3d", g: "trestle2" },
  { s: 13, w: "110", k: "2d", g: "n110" },
  { s: 14, w: null, k: "3d", g: "young" },
  { s: 14, w: "newspapers", k: "2d", g: "safe" },
  { s: 15, w: null, k: "2d", g: "date" },
  { s: 16, w: null, k: "3d", g: "train" },
  { s: 16, w: "engine", k: "3d", g: "consist" },
  { s: 17, w: null, k: "3d", g: "white" },
  { s: 17, w: "38", k: "2d", g: "whitecard" },
  { s: 18, w: null, k: "3d", g: "families" },
  { s: 19, w: null, k: "3d", g: "hanbury" },
  { s: 19, w: "He", k: "2d", g: "hanburycard" },
  { s: 19, w: "brought", k: "3d", g: "hanbury" },
  { s: 20, w: null, k: "3d", g: "river" },
  { s: 21, w: null, k: "3d", g: "ahead" },
  { s: 21, w: "left", k: "3d", g: "wheels" },
  { s: 21, w: "bumped", k: "3d", g: "wheels2" },
  { s: 21, w: "crash", k: "3d", g: "gave" },
  { s: 22, w: null, k: "3d", g: "drop" },
  { s: 23, w: null, k: "3d", g: "white2" },
  { s: 23, w: "steam", k: "2d", g: "engine" },
  { s: 23, w: "He", k: "3d", g: "lever" },
  { s: 24, w: null, k: "3d", g: "jump" },
  { s: 24, w: "landed", k: "3d", g: "splash" },
  { s: 24, w: "lived", k: "3d", g: "lived" },
  { s: 25, w: null, k: "3d", g: "lived2" },
  { s: 26, w: null, k: "3d", g: "dead" },
  { s: 27, w: null, k: "3d", g: "coach" },
  { s: 27, w: "within", k: "3d", g: "burn" },
  { s: 28, w: null, k: "3d", g: "farmer" },
  { s: 28, w: "went", k: "2d", g: "miles" },
  { s: 29, w: null, k: "3d", g: "burn2" },
  { s: 30, w: null, k: "2d", g: "count" },
  { s: 31, w: null, k: "2d", g: "hanburyfam" },
  { s: 32, w: null, k: "2d", g: "second" },
  { s: 32, w: "ran", k: "3d", g: "consist2" },
  { s: 33, w: null, k: "2d", g: "twowrecks" },
  { s: 34, w: null, k: "3d", g: "papers" },
  { s: 35, w: null, k: "3d", g: "fiends" },
  { s: 35, w: "Someone", k: "3d", g: "rail" },
  { s: 36, w: null, k: "2d", g: "quote" },
  { s: 37, w: null, k: "3d", g: "three" },
  { s: 37, w: "leaving", k: "3d", g: "three2" },
  { s: 38, w: null, k: "3d", g: "gang" },
  { s: 39, w: null, k: "2d", g: "scare" },
  { s: 40, w: null, k: "3d", g: "posted" },
  { s: 40, w: "$10,000", k: "3d", g: "reward" },
  { s: 40, w: "whoever", k: "3d", g: "never" },
  { s: 41, w: null, k: "3d", g: "empty" },
  { s: 42, w: null, k: "2d", g: "jailed" },
  { s: 43, w: null, k: "3d", g: "did" },
  { s: 44, w: null, k: "3d", g: "townwide" },
  { s: 45, w: null, k: "3d", g: "locals" },
  { s: 45, w: "little", k: "3d", g: "doubt" },
  { s: 46, w: null, k: "3d", g: "miners" },
  { s: 46, w: "helped", k: "3d", g: "help" },
  { s: 47, w: null, k: "3d", g: "letter" },
  { s: 48, w: null, k: "3d", g: "letter2" },
  { s: 48, w: "railroad", k: "3d", g: "pay" },
  { s: 48, w: "told", k: "3d", g: "tells" },
  { s: 48, w: "train", k: "3d", g: "did" },
  { s: 49, w: null, k: "3d", g: "tells" },
  { s: 49, w: "wired", k: "2d", g: "wired" },
  { s: 50, w: null, k: "3d", g: "rail" },
  { s: 51, w: null, k: "2d", g: "real" },
  { s: 52, w: null, k: "2d", g: "n1890" },
  { s: 53, w: null, k: "3d", g: "gave" },
  { s: 53, w: "lawyers", k: "3d", g: "tells2" },
  { s: 53, w: "question", k: "2d", g: "question" },
  { s: 54, w: null, k: "2d", g: "money" },
  { s: 55, w: null, k: "3d", g: "nothing" },
  { s: 56, w: null, k: "3d", g: "everyone" },
  { s: 57, w: null, k: "2d", g: "n100" },
  { s: 58, w: null, k: "3d", g: "archive" },
  { s: 58, w: "Engineer", k: "2d", g: "whitegrave" },
  { s: 59, w: null, k: "3d", g: "records" },
  { s: 59, w: "2012", k: "2d", g: "title" },
  { s: 60, w: null, k: "3d", g: "errors" },
  { s: 60, w: "company's", k: "2d", g: "case" },
  { s: 61, w: null, k: "3d", g: "story" },
  { s: 61, w: "deliberately", k: "2d", g: "concealed" },
  { s: 62, w: null, k: "2d", g: "sure" },
  { s: 63, w: null, k: "3d", g: "doubt" },
  { s: 64, w: null, k: "3d", g: "youngb" },
  { s: 65, w: null, k: "2d", g: "strange" },
  { s: 66, w: null, k: "3d", g: "reward" },
  { s: 67, w: null, k: "3d", g: "never" },
  { s: 68, w: null, k: "3d", g: "piers" },
  { s: 68, w: "still", k: "3d", g: "piers2" },
  { s: 69, w: null, k: "2d", g: "hanbury05" },
  { s: 69, w: "keeping", k: "3d", g: "hanbury" },
  { s: 70, w: null, k: "3d", g: "miners" },
  { s: 70, w: "If", k: "3d", g: "three" },
  { s: 71, w: null, k: "2d", g: "question2" },
];
export type ShotDef = RawShot & { id: number; a: number; b: number };
export const SHOTS: ShotDef[] = raw.map((r, i) => ({ ...r, id: i + 1, a: 0, b: 0 }));
SHOTS.forEach((s, i) => { s.a = i === 0 ? 0 : (s.w ? wordAt(s.s, s.w) : segAt(s.s)) - 2; }); // cuts land ~2 f before the word
SHOTS.forEach((s, i) => { s.b = i === SHOTS.length - 1 ? VOICE_END : SHOTS[i + 1].a; });
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? null;
/** chapter-start crossfade (frames) */
export const XFADE = 10;
export const CHAPTER_SHOTS = new Set(CHAPTERS.map((c) => SHOTS.find((s) => s.s >= c.seg)!.id));
