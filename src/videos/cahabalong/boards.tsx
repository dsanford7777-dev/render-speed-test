// The Cahaba long-form's 2D boards, built from the Longyearbyen long-form's factories (say / num / card / icons /
// checks: every board moves and shows something from its first frame; content stays above the captions).
// Cues are [segment, word]: the line pops on that word.
import React from "react";
import { C, G } from "../pigwarlong/kit";
import { say, num, card, icons, checks } from "../frozenlong/boards";

const RED = C.red, GOLD = C.yellow, INK = C.ink;
export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  problem: say([{ s: "There was just", size: 100 }, { s: "one problem", cue: [3, "one"], col: RED, size: 170 }], { m: 4 }),
  story: icons([{ g: "fire", label: "The wreck" }, { g: "question", label: "The robbers nobody found", cue: [6, "robbers"] }, { g: "calendar", label: "A 4-year-old bridge", cue: [6, "bridge"] }], { top: "This is the story of", topCol: INK }),
  // ---------------- a railroad built for coal ----------------
  bham: num("25", "years old", { top: "Birmingham, Alabama", col: INK, sub: "a city built on coal and iron", subCue: [8, "ran"], glyph: "coal" }),
  ln: say([{ s: "The L&N Railroad", size: 110 }, { s: "Birmingham Mineral", cue: [9, "called"], col: RED, size: 130 }, { s: "branch lines to the mines", cue: [9, "birmingham"], size: 80 }], { m: 2 }),
  n110: num("110", "feet above the water", { dark: true, col: GOLD, m: 4 }),
  safe: say([{ s: "The newspapers:", size: 90 }, { s: "“perfectly safe”", cue: [14, "perfectly"], col: RED, size: 160 }], { m: 0 }),
  // ---------------- Sunday morning ----------------
  date: say([{ s: "December 27, 1896", size: 130 }, { s: "a Sunday", cue: [15, "sunday"], size: 100 }, { s: "two days after Christmas", cue: [15, "2"], col: RED, size: 90 }], { glyph: "calendar", m: 0 }),
  whitecard: card("J. Frank White", "engineer, age 38", "person", { col: C.blue, extra: "“noted for coolness”", extraCue: [17, "known"] }),
  hanburycard: card("Henry Hanbury", "a railroad conductor, off duty", "person", { col: C.blue, extra: "riding with his wife and two children", extraCue: [19, "wasn't"] }),
  engine: checks([{ s: "Steam: shut off", mark: "check" }, { s: "Lever: in reverse", cue: [23, "lever"], mark: "check" }], { top: "What the engine showed", topCol: INK, size: 96 }),
  // ---------------- the river ----------------
  miles: num("4", "miles to a telegraph", { col: INK, m: 2 }),
  count: checks([{ s: "The railroad's notice: 21 dead" }, { s: "Other reports: as many as 28", cue: [30, "other"] }], { top: "The count was never settled", topCol: RED, size: 70 }),
  hanburyfam: card("Henry Hanbury", "survived", "person", { col: C.blue, stamp: "HIS FAMILY DID NOT", stampCue: [31, "wife"] }),
  second: say([{ s: "The same day", size: 100 }, { s: "a second wreck", cue: [32, "second"], col: RED, size: 160 }, { s: "on the same line", cue: [32, "ran"], size: 90 }], { m: 4 }),
  twowrecks: num("2", "wrecks, one railroad, one day", { dark: true, col: GOLD, m: 0 }),
  // ---------------- fiends in human form ----------------
  quote: say([{ s: "“Men came down", size: 110 }, { s: "and robbed the wreck”", size: 110 }, { s: "one injured survivor, through his doctor", size: 60, cue: [36, "doctor"] }], { m: 2 }),
  unconfirmed: say([{ s: "The same report:", size: 100 }, { s: "“not confirmed”", cue: [36, "admitted"], col: RED, size: 170 }], { m: 4 }),
  scare: say([{ s: "Days earlier", size: 100 }, { s: "another trestle", cue: [39, "another"], size: 120 }, { s: "a rail really was removed", cue: [39, "rail"], col: RED, size: 100 }], { m: 0 }),
  jailed: checks([{ s: "2 men jailed on suspicion" }, { s: "No conviction on record", cue: [42, "we"], mark: "x" }], { top: "January 1897, Birmingham", topCol: INK, size: 92 }),
  // ---------------- the people who didn't believe it ----------------
  wired: say([{ s: "A sensation", size: 130, col: RED }, { s: "wired everywhere", cue: [49, "wired"], size: 130 }], { dark: true, m: 4 }),
  // ---------------- why a railroad needs a villain ----------------
  real: say([{ s: "He was describing", size: 100 }, { s: "something real", cue: [51, "something"], col: RED, size: 160 }], { m: 0 }),
  n1890: num("1890s", "Southern railroads", { col: INK, sub: "the same move, again and again", subCue: [52, "again"] }),
  question: checks([{ s: "“What was wrong with the track?”", mark: "x", strike: true, cue: [53, "what"] }, { s: "“Who are the criminals?”", cue: [53, "who"], mark: "check" }], { top: "The question changes", topCol: RED, size: 60 }),
  money: say([{ s: "The difference", size: 110 }, { s: "was money", cue: [54, "money"], col: GOLD, size: 190 }], { dark: true, m: 4 }),
  // ---------------- what the records say ----------------
  n100: num("100+", "years", { dark: true, col: GOLD, sub: "the robber story was the story", subCue: [57, "robber"] }),
  whitegrave: card("J. Frank White", "engineer of train No. 40", "person", { col: C.blue, extra: "buried at Oak Hill Cemetery, Birmingham", extraCue: [58, "buried"] }),
  title: say([{ s: "“The Robbery", size: 140, col: RED }, { s: "That Never Was”", size: 140, col: RED, cue: [59, "robbery"] }, { s: "Terri Hicks, 2012", size: 70, cue: [59, "never"] }], { glyph: "journal", m: 0 }),
  case: checks([{ s: "Errors in how the bridge was built" }, { s: "The company's men found the cause", cue: [60, "investigators"] }, { s: "Nobody admitted it for decades", cue: [60, "nobody"], mark: "x" }], { top: "Her case", topCol: INK, size: 62 }),
  concealed: say([{ s: "“deliberately", size: 150, col: RED }, { s: "concealed”", size: 150, col: RED, cue: [61, "concealed"] }, { s: "Scott Huffard, historian", size: 66, cue: [61, "errors"] }], { m: 4 }),
  sure: checks([{ s: "Built from company files" }, { s: "Long after everyone involved had died", cue: [62, "long"] }, { s: "No court ever ruled on it", cue: [62, "court"], mark: "x" }], { top: "How sure is it?", topCol: INK, size: 58 }),
  // ---------------- the strange part ----------------
  strange: say([{ s: "Here's the", size: 100 }, { s: "strange part", cue: [65, "strange"], col: GOLD, size: 180 }], { dark: true, m: 0 }),
  hanbury05: card("Henry Hanbury", "back at work as a conductor", "person", { col: C.blue, stamp: "KILLED IN A WRECK, 1905", stampCue: [69, "killed"] }),
  question2: say([{ s: "Robbers,", size: 170 }, { s: "or a bad bridge?", cue: [71, "or"], col: RED, size: 170 }], { glyph: "question", m: 0 }),
};
