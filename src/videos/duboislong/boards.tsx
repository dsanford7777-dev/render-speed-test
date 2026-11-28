// The Dubois long-form's 2D boards: the house factories (say / num / checks). Every number on a board is in the
// narration at that moment; what is legend or one account is labelled so.
// Board rules (checklist): nothing cut by the frame edge (80 px margin), rows under ~30 characters at size 76-84,
// content above the captions (y < 800); boards that follow a subscribe ask keep left of x ~1400.
import React from "react";
import { C, G, Paper, At, T, pop } from "../pigwarlong/kit";
import { Mv } from "../hertzlong/boards";
import { say, num, checks } from "../frozenlong/boards";

const RED = C.red, INK = C.ink, GREEN = "#2f9a57", GOLD = "#c98a20";
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);

/** the four suspects, revealed one by one (v = how many are named so far) */
const SUSPECTS = ["1. Fred Dubois himself", "2. Joseph Carey, Wyoming", "3. Hewie Youmans", "4. Billy Simpson"];
const Suspects: React.FC<G> = ({ t, d, c, v }) => (
  <Paper tone="#f3ead6"><Mv t={t} d={d} m={v === 0 ? 2 : 0}>
    <At x={960} y={250} s={pop(t, 0)}><T size={92} col={RED}>{v === 0 ? "WHO CHANGED THE NAME?" : "THE SUSPECTS"}</T></At>
    {SUSPECTS.map((s, i) => i < Math.max(v, 0) ? (
      <At key={i} x={960} y={390 + i * 100} s={i === v - 1 ? pop(t, 0) : 1}><T size={76} col={i === v - 1 ? INK : "#8a7a66"}>{s}</T></At>
    ) : null)}
    {v === 0 ? <At x={960} y={560} s={pop(t, at([21, "nobody"], c))}><T size={150} col={INK}>NOBODY AGREES</T></At> : null}
    {v === 4 ? <At x={1340} y={700} s={pop(t, at([25, "confessed"], c))}><div style={{ border: `8px solid ${RED}`, borderRadius: 14, padding: "6px 28px", transform: "rotate(-6deg)" }}><T size={70} col={RED}>CONFESSED</T></div></At> : null}
  </Mv></Paper>
);

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  spell: say([{ s: "D-U-B-O-I-S", size: 170, col: INK }, { s: "French: \"doo-BWAH\"", cue: [1, "french"], size: 90 }, { s: "Locals: \"DOO-boys\"", cue: [1, "people"], size: 100, col: RED }], { m: 2 }),
  redink: say([{ s: "A Welsh priest", size: 84 }, { s: "a politician from the wrong state", cue: [2, "politician"], size: 70 }, { s: "and a bottle of red ink", cue: [2, "red"], size: 96, col: RED }], { dark: true, m: 0 }),
  // ---------------- 1 65 miles for a letter ----------------
  n65: num("65 miles", "to the nearest post office", { col: RED, m: 4, size: 260, sub: "at Fort Washakie", subCue: 0 }),
  rules: checks([{ s: "An original name" }, { s: "Like no other post office", cue: [9, "couldn't"] }, { s: "in the territory", cue: [9, "territory"] }], { top: "The rules", topCol: INK, size: 80 }),
  // ---------------- 2 Tibo ----------------
  tiboword: say([{ s: "TIBO", size: 220, col: GREEN }, { s: "Shoshone: \"stranger\"", cue: [11, "stranger"], size: 92 }, { s: "or \"white man\"", cue: [11, "white"], size: 84 }], { m: 4 }),
  cold: say([{ s: "1883", size: 200, col: RED }, { s: "Fort Washakie", cue: [13, "washakie"], size: 100 }, { s: "about 60 below, reportedly", cue: [13, "60"], size: 72 }], { dark: true, m: 2 }),
  statehood: say([{ s: "1889", size: 200, col: RED }, { s: "a year before statehood", cue: [16, "year"], size: 96 }], { m: 2 }),
  // ---------------- 3 the red ink ----------------
  newname: say([{ s: "TIBO", size: 150, col: "#8a7a66" }, { s: "DUBOIS", cue: [17, "new"], size: 200, col: RED }], { m: 4 }),
  aug6: num("Aug. 6, 1889", "the post office opens", { col: GREEN, m: 2, size: 200, sub: "postmaster: Charles C. Smith", subCue: [18, "charles"] }),
  // ---------------- 4 four suspects ----------------
  suspects: Suspects,
  news: say([{ s: "1937:", size: 110, col: RED }, { s: "\"It was my idea\"", cue: [26, "idea"], size: 140 }, { s: "Billy Simpson, lawyer in Jackson", cue: 4, size: 68 }], { m: 2 }),
  wood: say([{ s: "du bois", size: 200, col: GOLD }, { s: "= \"of the wood\"", cue: [29, "wood"], size: 120 }], { dark: true, m: 4 }),
  // ---------------- 5 the man from Idaho ----------------
  fredbio: checks([{ s: "Born in Illinois" }, { s: "Went to Yale", cue: [31, "yale"] }, { s: "U.S. marshal, Idaho", cue: [31, "marshal"] }], { top: "Fred Dubois", topCol: INK, size: 80 }),
  delegate: checks([{ s: "1887: Idaho's delegate" }, { s: "1891: Idaho's senator", cue: [32, "senator"] }], { top: "In Congress", topCol: INK, size: 84 }),
  twotowns: num("2", "towns named after him", { col: GOLD, m: 4, size: 330, sub: "Dubois, Wyoming and Dubois, Idaho", subCue: 0 }),
  // ---------------- 6 DOO-boys ----------------
  graff: say([{ s: "He said \"doo-BWAH\"", size: 110 }, { s: "and hated \"BOYS\"", cue: [36, "hated"], size: 130, col: RED }, { s: "historian Leo Graff", cue: [36, "graff"], size: 64 }], { m: 2 }),
  twoboys: say([{ s: "One Arapaho name", size: 96 }, { s: "for the town:", size: 96, cue: 6 }, { s: "\"TWO BOYS\"", cue: [39, "two"], size: 170, col: RED }], { m: 2 }),
  theory: checks([{ s: "Spite?" }, { s: "Or a cowboy accent?", cue: [40, "cowboys"] }, { s: "Dubois, Idaho: DOO-boys too", cue: [40, "after"] }], { top: "Another theory", topCol: GOLD, size: 80 }),
  // ---------------- 7 the neighbor ----------------
  tax: num("$27.11", "owed on the ranch for 1890", { col: GREEN, m: 4, size: 280, sub: "tax records, Fremont County", subCue: 0 }),
  parker: say([{ s: "Robert LeRoy Parker", size: 110 }, { s: "BUTCH CASSIDY", cue: [45, "butch"], size: 170, col: RED }], { dark: true, m: 4 }),
  prison: checks([{ s: "1892: arrested" }, { s: "1894: prison, horse theft", cue: [46, "prison"] }], { top: "A few years later", topCol: INK, size: 84 }),
  // ---------------- 8 Neversweat? ----------------
  never: say([{ s: "\"NEVERSWEAT\"?", size: 170, col: GOLD }, { s: "a different place", cue: [47, "different"], size: 100 }], { m: 2 }),
  notchoice: checks([{ s: "Neversweat: ~15 miles away" }, { s: "1895 to 1897", cue: [48, "1895"] }, { s: "Never a choice with Dubois", cue: [48, "never"] }], { top: "Local historians", topCol: INK, size: 76 }),
  // ---------------- 9 the name stuck ----------------
  n1914: num("1914", "Dubois becomes a town", { col: RED, m: 2, size: 300 }),
  zip: say([{ s: "Its ZIP code:", size: 110 }, { s: "bigger than", cue: [50, "more"], size: 110 }, { s: "RHODE ISLAND", cue: [50, "rhode"], size: 160, col: RED }], { m: 2 }),
  notibo: say([{ s: "TIBO", size: 220, col: GREEN }, { s: "never on a map", cue: [51, "never"], size: 110, col: RED }], { dark: true, m: 4 }),
  // kept left of x ~1400: the subscribe card and mascot are still on the right when this board comes in
  endq: ({ t, d, c }) => (
    <Paper tone="#141a2a"><Mv t={t} d={d} m={4}>
      <At x={960} y={360} s={pop(t, 0)}><T size={64} col="#fff">If a stranger renamed your town...</T></At>
      <At x={960} y={520} s={pop(t, at([53, "his"], c))}><T size={110} col="#ffb347">his way...</T></At>
      <At x={960} y={660} s={pop(t, at([53, "yours"], c))}><T size={110} col="#ffb347">or yours?</T></At>
    </Mv></Paper>
  ),
};
void checks; void GREEN;
