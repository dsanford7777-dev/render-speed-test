// The Frank Hayes long-form's 2D boards: the house factories (say / num / checks) plus a few of its own: 1923
// newspapers (mastheads and headlines as printed; body text is grey bars, never invented words), the weight rule,
// the two ages, and the viral photo (an empty frame and a stamp: the photo itself is never recreated).
// Diagram rules (checklist): every label sits beside what it names; nothing cut by the frame edge (80 px margin);
// content stays above the captions (y < 800).
import React from "react";
import { C, G, FONT, Paper, At, T, Banner, Stamp, k, pop, ease } from "../pigwarlong/kit";
import { Mv } from "../hertzlong/boards";
import { say, num, checks } from "../frozenlong/boards";

const RED = C.red, INK = C.ink, GOLD = C.yellow;
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);

/** a 1923 front page: masthead, date line, the headline as printed, grey bars for the columns */
const Paper1923: React.FC<{ t: number; x: number; y: number; w: number; name: string; date: string; head?: string[]; deck?: string; r?: number; s?: number; o?: number }> = ({ t, x, y, w, name, date, head = [], deck, r = 0, s = 1, o = 1 }) => {
  const h = w * 1.28, rows = 14;
  return (
    <At x={x} y={y} s={s} r={r} o={o}>
      <div style={{ width: w, height: h, background: "#f4eedf", border: `6px solid ${INK}`, boxShadow: "0 14px 0 rgba(36,23,38,0.35)", padding: w * 0.05, boxSizing: "border-box", fontFamily: FONT, color: INK }}>
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: w * 0.085, textAlign: "center", borderBottom: `4px solid ${INK}`, paddingBottom: w * 0.012, whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ fontSize: w * 0.03, fontWeight: 800, textAlign: "center", borderBottom: `2px solid ${INK}`, padding: `${w * 0.008}px 0`, letterSpacing: 2 }}>{date}</div>
        {head.length ? <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: w * 0.066, lineHeight: 1.08, textAlign: "center", marginTop: w * 0.03 }}>{head.map((l, i) => <div key={i} style={{ opacity: ease(k(t, 4 + i * 5, 8)) }}>{l}</div>)}</div> : null}
        {deck ? <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: w * 0.042, textAlign: "center", marginTop: w * 0.02, opacity: ease(k(t, 14, 8)) }}>{deck}</div> : null}
        <div style={{ display: "flex", gap: w * 0.03, marginTop: w * 0.04 }}>
          {[0, 1, 2].map((col) => <div key={col} style={{ flex: 1 }}>{Array.from({ length: rows }, (_, i) => <div key={i} style={{ height: w * 0.014, background: "#b9b0a0", marginBottom: w * 0.017, width: `${80 + ((i * 7 + col * 13) % 20)}%` }} />)}</div>)}
        </div>
      </div>
    </At>
  );
};

/** the weight rule: rider + saddle (+ lead if too light) = the weight the horse is set to carry */
const Assigned: React.FC<G> = ({ t, d, c }) => {
  const box = (label: string, sub: string, col: string, a: number) => (
    <div style={{ opacity: ease(k(t, a, 8)), transform: `scale(${0.6 + 0.4 * ease(k(t, a, 8))})`, background: "#fffaf0", border: `7px solid ${INK}`, borderRadius: 26, padding: "26px 34px", textAlign: "center", boxShadow: `0 10px 0 ${INK}`, minWidth: 270 }}>
      <T size={64} col={col}>{label}</T><T size={30} w={800} col={C.grey} up={false}>{sub}</T>
    </div>
  );
  const op = (s: string, a: number) => <div style={{ opacity: ease(k(t, a, 6)) }}><T size={90}>{s}</T></div>;
  const lead = at([17, "light"], c), heavy = at([17, "heavy"], c);
  return (
    <Paper><Mv t={t} d={d} m={2}>
      <Banner text="Every horse carries a set weight" t={t} at={0} col={INK} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
        {box("Rider", "in his silks", INK, at([17, "rider"], c))}{op("+", at([17, "saddle"], c))}{box("Saddle", "and gear", INK, at([17, "saddle"], c))}{op("+", lead)}{box("Lead", "if he's too light", C.blue, lead)}
      </div>
      <Stamp text="TOO HEAVY? LOSE IT" t={t} at={heavy} x={960} y={660} size={84} col={RED} r={-4} />
    </Mv></Paper>
  );
};

/** the age: 22 in most accounts today, 35 in a 1923 paper */
const Ages: React.FC<G> = ({ t, d, c }) => {
  const b = at([41, "35"], c, 4), a = at([41, "22"], c, 4);
  const big = (n: string, l: string, col: string, x: number, s0: number) => (
    <At x={x} y={420} s={pop(t, s0)}><div style={{ textAlign: "center" }}><T size={330} col={col} style={{ textShadow: `0 12px 0 ${INK}` }}>{n}</T><T size={44} w={800} col={INK} up={false}>{l}</T></div></At>
  );
  return (
    <Paper><Mv t={t} d={d} m={4}>
      <Banner text="How old was he?" t={t} at={0} col={INK} />
      {big("22?", "most accounts today", C.blue, 600, a)}
      {big("35?", "a paper at the time", RED, 1320, b)}
    </Mv></Paper>
  );
};

/** the viral photo: an empty frame (never a recreation), the stamp, where it is really from */
const Photo: React.FC<G> = ({ t, d, c }) => {
  const st = at([42, "isn't"], c), au = at([42, "australia"], c), np = at([42, "no"], c);
  return (
    <Paper><Mv t={t} d={d} m={2}>
      <At x={620} y={430} s={pop(t, 0)} r={-3}>
        <div style={{ width: 640, height: 460, background: "#3a3632", border: "26px solid #f4eedf", boxShadow: `0 0 0 6px ${INK}, 0 16px 0 rgba(36,23,38,0.4)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <T size={64} col="#cfc6b6" up={false} style={{ textAlign: "center", lineHeight: 1.2 }}>the famous<br />“dead jockey”<br />photo</T>
        </div>
      </At>
      <Stamp text="NOT FRANK" t={t} at={st} x={620} y={430} size={110} col={RED} r={-12} />
      <At x={1380} y={330} s={pop(t, au)}><div style={{ textAlign: "left", width: 620 }}><T size={70} col={INK}>Sydney, Australia</T><T size={54} w={800} col={C.grey} up={false}>a different race, 1933</T></div></At>
      <At x={1380} y={590} s={pop(t, np)}><div style={{ textAlign: "left", width: 620 }}><T size={54} col={RED}>No photo of Frank</T><T size={54} col={RED}>on Sweet Kiss</T><T size={40} w={800} col={INK} up={false}>has ever turned up</T></div></At>
    </Mv></Paper>
  );
};

const News: React.FC<G & { v: number }> = ({ t, d, v }) => {
  if (v === 0) return ( // the papers from that week: three front pages fanned out (mastheads only)
    <Paper tone="#e8d7b0"><Mv t={t} d={d} m={2}>
      <Paper1923 t={-99} x={560} y={460} w={460} name="Buffalo Courier" date="JUNE 5, 1923" r={-8} s={pop(t, 0)} />
      <Paper1923 t={-99} x={1360} y={470} w={460} name="Daily News" date="JUNE 1923" r={7} s={pop(t, 6)} />
      <Paper1923 t={-99} x={960} y={430} w={500} name="The New York Times" date="JUNE 5, 1923" r={-1} s={pop(t, 12)} />
    </Mv></Paper>
  );
  if (v === 1) return ( // the Buffalo Courier's headline, June 5, 1923
    <Paper tone="#e8d7b0"><Mv t={t} d={d} m={0}>
      <Paper1923 t={t} x={960} y={440} w={720} name="Buffalo Courier" date="TUESDAY, JUNE 5, 1923" head={["Steeplechase Rider, Winning", "His First Victory, Topples", "From the Saddle, Dead"]} s={pop(t, 0)} />
    </Mv></Paper>
  );
  return ( // the New York Times, June 5, 1923
    <Paper tone="#e8d7b0"><Mv t={t} d={d} m={0}>
      <Paper1923 t={t} x={960} y={440} w={760} name="The New York Times" date="JUNE 5, 1923" head={["JOCKEY DIES AS HE", "WINS HIS FIRST RACE"]} deck="Hayes Collapses Passing the Winning Post" s={pop(t, 0)} />
    </Mv></Paper>
  );
};

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  legend0: say([{ s: "For 100 years:", size: 100 }, { s: "a dead man", cue: [2, "dead"], col: RED, size: 150 }, { s: "won a horse race", cue: [2, "horse"], size: 110 }], { m: 0 }),
  papers: (g) => <News {...g} v={0} />,
  title: say([{ s: "Did a dead man", size: 140 }, { s: "win this race?", cue: [3, "stranger"], col: RED, size: 140 }], { dark: true, glyph: "question", m: 4 }),
  // ---------------- the stable hand ----------------
  mother: say([{ s: "His mother:", size: 100 }, { s: "he'd loved horses", cue: [7, "loved"], col: RED, size: 120 }, { s: "since he was a child", cue: [7, "child"], size: 90 }], { m: 2 }),
  kisscard: say([{ s: "Sweet Kiss", size: 160, col: RED }, { s: "entered in the name of", cue: [9, "name"], size: 70 }, { s: "Miss A. M. Frayling", cue: [9, "miss"], size: 100 }], { m: 2 }),
  // ---------------- what a steeplechase is ----------------
  chase: say([{ s: "Steeplechase:", size: 130 }, { s: "a horse race", cue: [11, "horse"], size: 100 }, { s: "with fences in the way", cue: [11, "fences"], col: RED, size: 100 }], { m: 0 }),
  n2mi: num("~2 miles", "about two miles long", { col: RED, sub: "with 12 jumps", subCue: [12, "12"], m: 4, size: 280 }),
  date: say([{ s: "June 4, 1923", size: 150, col: RED }, { s: "Belmont Park, New York", cue: [12, "date"], size: 90 }], { m: 2 }),
  favorite: checks([{ s: "Gimme: the favorite", mark: "check" }, { s: "Sweet Kiss: not the favorite", cue: [14, "favorite"], mark: "x" }], { top: "The betting", topCol: INK, size: 70 }),
  odds: say([{ s: "Her odds:", size: 100 }, { s: "5-1 … 20-1", cue: [15, "5"], col: RED, size: 170 }, { s: "depending on who you read", cue: [15, "20"], size: 60 }], { m: 4 }),
  // ---------------- making the weight ----------------
  assigned: Assigned,
  n10: num("10+ lb", "lost in about a day", { col: RED, m: 2 }),
  // ---------------- the race ----------------
  courier: (g) => <News {...g} v={1} />,
  // ---------------- past the post ----------------
  failure: say([{ s: "Heart failure", size: 140, col: RED }, { s: "brought on by", cue: [35, "brought"], size: 80 }, { s: "losing all that weight", cue: [35, "weight"], size: 100 }], { m: 2 }),
  nyt: (g) => <News {...g} v={2} />,
  // ---------------- the legend ----------------
  grow: say([{ s: "Then the story", size: 130 }, { s: "started to grow", cue: [37, "grow"], col: RED, size: 140 }], { dark: true, m: 0 }),
  reports: checks([{ s: "Swayed after the last jump" }, { s: "Recovered", cue: [39, "recovered"] }, { s: "Crossed the line first", cue: [39, "finished"] }, { s: "Fell after the line", cue: [39, "fell"] }], { top: "What the 1923 reports say", topCol: INK, size: 64 }),
  age: Ages,
  photo: Photo,
  kissofdeath: say([{ s: "“Sweet Kiss of Death”?", size: 110 }, { s: "never raced again?", cue: [43, "never"], size: 90 }, { s: "no proof of either", cue: [43, "proof"], col: RED, size: 110 }], { m: 2 }),
  // ---------------- the end ----------------
  question: say([{ s: "Alive at the line...", size: 120 }, { s: "or a dead man?", cue: [47, "dead"], col: RED, size: 140 }], { dark: true, glyph: "question", m: 4 }),
};
void GOLD;
