// The Koepenick long-form's 2D boards, built from the Longyearbyen long-form's factories (say / num / card / icons /
// checks: every board moves and shows something from its first frame; content stays above the captions).
// Cues are [segment, word]: the line pops on that word.
import React from "react";
import { C, G } from "../pigwarlong/kit";
import { say, num, card, icons, checks } from "../frozenlong/boards";

const RED = C.red, GOLD = C.yellow, INK = C.ink, BLUE = "#26304a";
export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  problem: say([{ s: "There was just", size: 100 }, { s: "one problem", cue: [3, "one"], col: RED, size: 170 }], { m: 4 }),
  title: say([{ s: "The true story of", size: 90 }, { s: "the Captain", cue: [6, "captain"], col: RED, size: 160 }, { s: "of Köpenick", cue: [6, "köpenick"], size: 130 }], { m: 0 }),
  // ---------------- a man with no papers ----------------
  voigt: card("Wilhelm Voigt", "shoemaker", "person", { col: BLUE, extra: "born 1849, Tilsit, East Prussia", extraCue: [8, "born"] }),
  born: num("1849", "Tilsit, East Prussia", { col: INK, sub: "the son of a shoemaker", subCue: [8, "son"], glyph: "calendar" }),
  n14: num("14", "years old: his first sentence", { col: RED, m: 2 }),
  n29: num("29", "years behind bars", { dark: true, col: GOLD, sub: "the last: ~15 years, for a court's cash box", subCue: [10, "last"], m: 4 }),
  wismar: card("A real job", "a court shoemaker in Wismar", "person", { col: BLUE, extra: "“his employer liked him”", extraCue: [12, "employer"] }),
  police: say([{ s: "In Prussia,", size: 100 }, { s: "the police decided", cue: [13, "police"], col: RED, size: 122 }, { s: "where a former convict could live", cue: [13, "where"], size: 66 }], { m: 0 }),
  out: checks([{ s: "Wismar: ordered out", mark: "x" }], { top: "Within 3 months", topCol: RED, size: 110 }),
  banned: checks([{ s: "Wismar: ordered out", mark: "x" }, { s: "Berlin: banned", cue: [15, "banned"], mark: "x" }], { top: "August 1906", topCol: INK, size: 100 }),
  trap: checks([{ s: "No address → no job", cue: [16, "without"], mark: "x" }, { s: "No job → no address", cue: [16, "job"], mark: "x" }], { top: "The trap", topCol: RED, size: 96 }),
  // ---------------- building a captain ----------------
  guards: card("Captain", "1st Foot Guards", "person", { col: BLUE, extra: "one of the proudest regiments in the army", extraCue: [20, "proudest"] }),
  cap: checks([{ s: "Helmet", mark: "x", strike: true }, { s: "Officer's cap: easier to hide", cue: [21, "cap"], mark: "check" }], { top: "Not quite right", topCol: INK, size: 77 }),
  bundle: say([{ s: "Wrapped in newspaper", size: 110 }, { s: "left in a baggage room", cue: [22, "left"], col: RED, size: 99 }], { glyph: "journal", m: 4 }),
  oct15: say([{ s: "October 15, 1906", size: 130 }, { s: "the evening before", cue: [23, "collected"], size: 90, col: RED }], { glyph: "calendar", m: 0 }),
  oct16: say([{ s: "October 16, 1906", size: 130 }, { s: "a train to Köpenick", cue: [24, "train"], size: 100, col: RED }], { glyph: "calendar", m: 2 }),
  // ---------------- by order of the Kaiser ----------------
  n10: num("10", "armed men", { dark: true, col: GOLD, sub: "not one asked who he was", subCue: [30, "not"], m: 4 }),
  // ---------------- the town hall ----------------
  t246: num("2:46", "in the afternoon", { col: INK, sub: "Köpenick, a small town near Berlin", subCue: [33, "reached"], glyph: "calendar" }),
  post: say([{ s: "Calls to Berlin", size: 120 }, { s: "blocked for an hour", cue: [35, "berlin"], col: RED, size: 115 }], { m: 0, stamp: { s: "STOP", cue: [35, "stop"], y: 720, size: 110 } }),
  langerhans: card("Dr. Georg Langerhans", "mayor of Köpenick", "person", { col: C.blue }),
  wiltberg: card("von Wiltberg", "the town treasurer", "person", { col: C.blue, extra: "“close the books”", extraCue: [42, "close"] }),
  n4000: num("4,000+", "marks in the town's cash", { col: INK, m: 2 }),
  n3500: num("~3,500", "marks taken", { dark: true, col: GOLD, sub: "in two mail sacks", subCue: [44, "2"], m: 4 }),
  malzahn: card("“von Malzahn”", "the name on the receipt", "person", { col: BLUE, stamp: "HIS OLD PRISON DIRECTOR", stampCue: [47, "director"], stampX: 1240, stampY: 650, stampSize: 70 }),
  // ---------------- the captain walks away ----------------
  wache: say([{ s: "To the Neue Wache", size: 120 }, { s: "the royal guardhouse", cue: [48, "royal"], size: 100, col: RED }], { m: 0 }),
  malzahn2: say([{ s: "New suit, coat, hat, shoes", size: 84 }, { s: "signed: “von Malzahn”", cue: [51, "signed"], col: RED, size: 104 }], { m: 4 }),
  gone: say([{ s: "By then,", size: 110 }, { s: "the captain was gone", cue: [52, "captain"], col: RED, size: 110 }], { dark: true, m: 0 }),
  noticed: checks([{ s: "Took off his hat indoors", cue: [54, "taken"] }, { s: "Said “Good morning”", cue: [54, "wished"] }, { s: "Wore the uniform wrong", cue: [54, "uniform"], mark: "x" }], { top: "What the restaurant owner saw", topCol: INK, size: 74 }),
  // ---------------- manhunt ----------------
  reward: num("3,000", "marks reward", { col: RED, sub: "2,000 from the police, 1,000 from Köpenick", subCue: [57, "added"] }),
  innocent: say([{ s: "Innocent men", size: 120 }, { s: "arrested", cue: [58, "picked"], col: RED, size: 150 }, { s: "one for his handwriting", cue: [58, "handwriting"], size: 90 }], { m: 4 }),
  n10d: num("10", "days", { dark: true, col: GOLD, m: 0 }),
  n770: num("770", "marks spent", { col: INK, m: 2 }),
  // ---------------- the world laughs ----------------
  n4y: num("4", "years in prison", { col: RED, sub: "Berlin, December 1, 1906", subCue: [62, "court"] }),
  honest: say([{ s: "The judges:", size: 100 }, { s: "he had really tried", cue: [63, "really"], col: C.green, size: 115 }, { s: "to earn an honest living", cue: [63, "honest"], size: 91 }], { m: 0 }),
  world: say([{ s: "The case went", size: 110 }, { s: "around the world", cue: [64, "around"], col: GOLD, size: 137 }], { dark: true, glyph: "globe", m: 4 }),
  sf: card("A letter for mercy", "from the mayor of San Francisco", "person", { col: C.blue }),
  pardon: num("1908", "pardoned by the Kaiser", { col: C.green, sub: "after about 20 months", subCue: [68, "20"], glyph: "check" }),
  record: checks([{ s: "A gramophone record", cue: [70, "gramophone"] }, { s: "A waxworks figure", cue: [70, "waxworks"] }], { top: "A celebrity", topCol: GOLD, size: 100 }),
  tour: icons([{ g: "globe", label: "Germany" }, { g: "globe", label: "Vienna", cue: [71, "vienna"] }, { g: "globe", label: "Budapest", cue: [71, "budapest"] }, { g: "globe", label: "London", cue: [71, "london"] }], { top: "On stage", topCol: INK }),
  ny: icons([{ g: "ship", label: "Canada" }, { g: "ship", label: "New York", cue: [72, "york"] }, { g: "x", label: "No US visa", cue: [72, "refused"], mark: "x" }], { top: "Even America", topCol: INK }),
  banned2: say([{ s: "Banned again", size: 120, col: RED }, { s: "and again", cue: [73, "kept"], size: 120 }, { s: "He kept appearing.", cue: [73, "appearing"], col: C.green, size: 110 }], { m: 0 }),
  // ---------------- the passport ----------------
  memoir: card("“How I Became the Captain of Köpenick”", "his memoirs, 1909", "journal", { col: BLUE }),
  problem2: say([{ s: "One problem", size: 150, col: RED }, { s: "with that story", cue: [76, "story"], size: 110 }], { glyph: "question", m: 4 }),
  teltow: checks([{ s: "Köpenick town hall", mark: "x" }, { s: "Another office in the district", cue: [77, "different"], mark: "check" }], { top: "Where passports came from", topCol: INK, size: 75 }),
  money: say([{ s: "Or was it", size: 110 }, { s: "the money all along?", cue: [78, "money"], col: GOLD, size: 110 }], { dark: true, glyph: "question", m: 0 }),
  lux1909: say([{ s: "1909: Luxembourg", size: 120 }, { s: "May 1910: a passport", cue: [80, "may"], col: C.green, size: 110 }], { glyph: "calendar", m: 2 }),
  n1922: num("1922", "he dies in Luxembourg", { col: INK, sub: "poor: inflation took his savings", subCue: [81, "poor"] }),
  koepenickiade: say([{ s: "Köpenickiade", size: 183, col: RED }, { s: "(n.) a stunt like his", cue: [82, "stunt"], size: 90 }], { m: 4 }),
  question: say([{ s: "Would the uniform", size: 129 }, { s: "have fooled you?", cue: [85, "fooled"], col: RED, size: 137 }], { glyph: "question", m: 0 }),
};
