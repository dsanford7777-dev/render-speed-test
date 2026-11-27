// The Timothy Dexter long-form's 2D boards: the house factories (say / num / checks). Every number on a board is in the
// narration at that moment; claims that are Dexter's own (from his book) are labelled as his, legends as legends.
// Board rules (checklist): nothing cut by the frame edge (80 px margin), rows under ~30 characters at size 76-84,
// content above the captions (y < 800); boards that follow a subscribe ask keep left of x ~1400.
import React from "react";
import { C, G, Paper, At, T, pop } from "../pigwarlong/kit";
import { Mv } from "../hertzlong/boards";
import { say, num, checks } from "../frozenlong/boards";

const RED = C.red, INK = C.ink, GREEN = "#2f9a57", GOLD = "#c98a20";
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  title: say([{ s: "TIMOTHY DEXTER", size: 170, col: RED }, { s: "the luckiest fool in America?", cue: [2, "luckiest"], size: 76 }], { dark: true, m: 0, y: 520 }),
  // ---------------- 1 a poor boy from Malden ----------------
  malden: say([{ s: "1747", size: 200, col: RED }, { s: "Malden, Massachusetts", cue: [4, "malden"], size: 96 }, { s: "a poor family", cue: [4, "poor"], size: 84 }], { m: 2 }),
  farm: checks([{ s: "Age 8: farm work" }, { s: "Age 16: a tanner's apprentice", cue: [5, "16"] }], { top: "No school after 8", topCol: INK, size: 76 }),
  // ---------------- 2 worthless money ----------------
  cont: say([{ s: "CONTINENTALS", size: 170, col: GREEN }, { s: "the Revolution's paper money", cue: [9, "paper"], size: 76 }], { m: 2 }),
  worthless: say([{ s: "\"Not worth", size: 140 }, { s: "a Continental\"", cue: [10, "not"], size: 140, col: RED }], { m: 4 }),
  cent: num("1¢", "per dollar from the U.S.", { col: RED, m: 2, size: 330, sub: "for the old Continentals", subCue: 0 }),
  full: num("100%", "Massachusetts paid its own notes", { col: GREEN, m: 4, size: 300 }),
  // ---------------- 3 the worst advice ----------------
  notimp: say([{ s: "To Newburyport's old money:", size: 76 }, { s: "a fool", cue: [14, "fool"], size: 170, col: RED }, { s: "who got lucky", cue: [14, "lucky"], size: 110 }], { m: 2 }),
  legend: say([{ s: "THE LEGEND", size: 170, col: GOLD }, { s: "the worst advice they could think of", cue: [15, "worst"], size: 66 }], { dark: true, m: 0 }),
  coals: say([{ s: "\"Carrying coals", size: 130 }, { s: "to Newcastle\"", size: 130, col: RED, cue: 6 }, { s: "= the most pointless thing", cue: [17, "pointless"], size: 72 }], { m: 2 }),
  mittens: checks([{ s: "Wool mittens to the tropics" }, { s: "Sold on to Siberia", cue: [19, "siberia"] }], { top: "Another legend", topCol: GOLD, size: 76, stamp: { s: "ONE TELLING", cue: [19, "telling"], col: GOLD } }),
  // ---------------- 4 in his own words ----------------
  ownbook: checks([{ s: "Coal to Newcastle", mark: "x" }, { s: "Mittens to Siberia", mark: "x", cue: [20, "mittens"] }], { top: "In Dexter's own book", topCol: INK, size: 80, stamp: { s: "NOT THERE", cue: [20, "doesnt"], col: RED } }),
  dream: say([{ s: "3 nights", size: 180, col: RED }, { s: "he dreamed of warming pans", cue: [21, "dreamed"], size: 80 }], { dark: true, m: 2 }),
  n42k: num("42,000", "bed warmers on 9 ships", { col: GOLD, m: 4, size: 280, sub: "he says", subCue: 0 }),
  ladles: say([{ s: "Later tellers:", size: 90 }, { s: "ladles for", cue: [23, "ladles"], size: 130, col: GOLD }, { s: "the sugar works", cue: [23, "sugar"], size: 110 }], { m: 2 }),
  bibles: checks([{ s: "21,000 Bibles" }, { s: "21 ships", cue: [24, "vessels"] }, { s: "100% profit", cue: [24, "profit"] }], { top: "His own claim", topCol: INK, size: 80 }),
  whale: num("340 tons", "of whalebone", { col: INK, m: 4, size: 260, sub: "also his claim", subCue: 0 }),
  generous: say([{ s: "We only have", size: 120 }, { s: "his word for it", cue: [26, "word"], size: 130, col: RED }], { m: 2 }),
  // ---------------- 5 Lord Timothy ----------------
  lord: say([{ s: "\"LORD\"", size: 190, col: GOLD }, { s: "Timothy Dexter", cue: [28, "timothy"], size: 120 }], { dark: true, m: 4 }),
  n40: num("40", "wooden statues on tall columns", { col: GOLD, m: 4, size: 330, sub: "carved by Joseph Wilson", subCue: 0 }),
  signboard: say([{ s: "\"I am the first in the East,", size: 76 }, { s: "the first in the West,", cue: [32, "west"], size: 76 }, { s: "and the greatest philosopher", cue: [32, "greatest"], size: 76, col: RED }, { s: "in the Western world\"", cue: [32, "western"], size: 76, col: RED }], { m: 2 }),
  poet: say([{ s: "His own poet:", size: 100 }, { s: "Jonathan Plummer", cue: [33, "jonathan"], size: 130, col: RED }, { s: "a fish seller", cue: [33, "fish"], size: 84 }], { m: 2 }),
  // ---------------- 6 the fake funeral ----------------
  miss: say([{ s: "When he died,", size: 120 }, { s: "who would miss him?", cue: [34, "miss"], size: 130, col: RED }], { dark: true, m: 2 }),
  n3000: num("3,000", "people came to the wake", { col: RED, m: 4, size: 330 }),
  accounts: say([{ s: "How the earliest accounts", size: 84 }, { s: "tell it", size: 84, cue: 4 }, { s: "written down years later", cue: [38, "written"], size: 84, col: GOLD }], { m: 2 }),
  ghost: say([{ s: "His wife?", size: 130 }, { s: "\"the ghost\"", cue: [39, "ghost"], size: 170, col: RED }, { s: "he told visitors", cue: [39, "visitors"], size: 76 }], { dark: true, m: 2 }),
  // ---------------- 7 the book ----------------
  pickle: say([{ s: "1802", size: 150, col: RED }, { s: "A Pickle for", cue: [40, "pickle"], size: 120 }, { s: "the Knowing Ones", size: 120, cue: [40, "knowing"] }], { m: 2 }),
  n9000: num("~9,000", "words, and not one full stop", { col: RED, m: 4, size: 280, sub: "spelling all his own", subCue: [41, "spelling"] }),
  // ---------------- 8 fool or genius? ----------------
  died: say([{ s: "October 1806", size: 130, col: RED }, { s: "Newburyport, age 59", cue: [43, "59"], size: 96 }], { m: 2 }),
  todaylist: checks([{ s: "Pitt: Museum of Old Newbury" }, { s: "The house: still on High St.", cue: [45, "house"] }], { top: "What's left", topCol: INK, size: 74 }),
  biographer: say([{ s: "His early biographer:", size: 90 }, { s: "no fool at all", cue: [46, "fool"], size: 150, col: GREEN }, { s: "not luck", cue: [46, "luck"], size: 100 }], { m: 2 }),
  // kept left of x ~1400: the subscribe card and mascot are still on the right when this board comes in
  endq: ({ t, d, c }) => (
    <Paper tone="#141a2a"><Mv t={t} d={d} m={4}>
      <At x={720} y={300} s={pop(t, 0)}><T size={72} col="#fff">A fool who got lucky...</T></At>
      <At x={720} y={470} s={pop(t, at([48, "genius"], c))}><T size={76} col="#ffb347">or a genius who let</T></At>
      <At x={720} y={570} s={pop(t, at([48, "everyone"], c))}><T size={76} col="#ffb347">everyone think so?</T></At>
    </Mv></Paper>
  ),
};
