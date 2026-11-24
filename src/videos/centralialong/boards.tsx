// The Centralia long-form's 2D boards: the house factories (say / num / checks) plus its own: a stylised Pennsylvania
// map (drawn in code, not survey-grade), a cut through the ground under the town (tunnels, the pit, the fire creeping),
// the cost comparison and the 1983 vote. Diagram rules (checklist): every label sits beside what it names; nothing cut
// by the frame edge (80 px margin); content stays above the captions (y < 800).
import React from "react";
import { C, G, FONT, Paper, At, T, Banner, Stamp, k, pop, ease, lerp, clamp01 } from "../pigwarlong/kit";
import { Mv } from "../hertzlong/boards";
import { say, num, checks } from "../frozenlong/boards";
import { Viewport, Land, Label, Pin } from "../hertzlong/maps";

const RED = C.red, INK = C.ink, FIRE = "#ff7a2a", COAL = "#2a2630", ROCK = "#8a7660", ROCK2 = "#7a6650";
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);

// ---------------- Pennsylvania ----------------
const P = (lon: number, lat: number): [number, number] => [(lon + 81.0) * 250 + 140, (42.45 - lat) * 330 + 40];
const PA: [number, number][] = [[-80.52, 39.72], [-75.79, 39.72], [-75.42, 39.80], [-75.13, 39.95], [-74.86, 40.08], [-74.72, 40.15], [-74.95, 40.35], [-75.06, 40.58], [-75.19, 40.79], [-75.1, 40.95], [-74.9, 41.15], [-74.69, 41.36], [-75.07, 41.6], [-75.36, 42.0], [-79.76, 42.0], [-79.76, 42.27], [-80.52, 41.98]];
const PA_D = "M" + PA.map(([a, b]) => P(a, b).join(" ")).join(" L") + " Z";
const CEN = P(-76.34, 40.8), PHL = P(-75.16, 39.95), PIT = P(-80.0, 40.44), HBG = P(-76.88, 40.27);
const PaMap: React.FC<G> = ({ t, d, c }) => {
  const coal = ease(k(t, at([5, "hard"], c), 14)), pin = pop(t, 6);
  return (
    <Viewport t={t} d={d} from={[0.78, 990, 500]} to={[0.88, 1010, 500]}>
      <Land d={PA_D} />
      <ellipse cx={CEN[0] + 10} cy={CEN[1] + 10} rx={150} ry={70} transform={`rotate(-14 ${CEN[0]} ${CEN[1]})`} fill={COAL} opacity={0.55 * coal} stroke={INK} strokeWidth={coal > 0 ? 5 : 0} />
      <Label x={CEN[0] + 40} y={CEN[1] - 150} text="HARD COAL COUNTRY" size={34} o={coal} />
      <Pin x={PHL[0]} y={PHL[1]} s={pop(t, 2)} col={INK} label="Philadelphia" ly={46} size={30} r={11} />
      <Pin x={PIT[0]} y={PIT[1]} s={pop(t, 2)} col={INK} label="Pittsburgh" ly={46} size={30} r={11} />
      <Pin x={HBG[0]} y={HBG[1]} s={pop(t, 4)} col={INK} label="Harrisburg" ly={46} size={30} r={11} />
      <Pin x={CEN[0]} y={CEN[1]} s={pin} col={RED} label="CENTRALIA" size={44} r={18} />
      <Label x={(P(-80.2, 41)[0] + P(-77, 41)[0]) / 2} y={P(-78.5, 41.3)[1]} text="PENNSYLVANIA" size={46} col={C.grey} bg={null} />
    </Viewport>
  );
};

// ---------------- the ground under the town ----------------
/** v: 0 = the old tunnels under the houses, 1 = the pit's opening and the fire getting in, 2 = the fire creeping, air pulled
 *  in through cracks; `labels` adds names beside the parts */
const Section: React.FC<G & { mode: number }> = ({ t, d, c, mode }) => {
  const g0 = 300, W = 1920;
  const tunnels = [[180, 420, 900, 470], [520, 540, 1460, 590], [260, 660, 1180, 705], [980, 440, 1500, 485]];
  const fire = mode === 0 ? 0 : mode === 1 ? ease(k(t, at([12, "led"], c), 40)) : 0.35 + 0.65 * ease(t / Math.max(1, d));
  const pitX = 1620;
  const house = (x: number, i: number) => (<g key={i} transform={`translate(${x} ${g0})`}><rect x={-34} y={-62} width={68} height={62} fill={["#c9c2b0", "#9ab0b8", "#d8c89a", "#b8a090"][i % 4]} stroke={INK} strokeWidth={6} /><path d="M-44 -60 L0 -104 L44 -60 Z" fill="#5a4a44" stroke={INK} strokeWidth={6} strokeLinejoin="round" /><rect x={-10} y={-34} width={20} height={34} fill="#3a2a22" /></g>);
  const fireAlong = (x0: number, y: number, x1: number, h: number, u: number, key: number) => u <= 0 ? null : (
    <g key={key}><rect x={Math.max(x0, x1 - (x1 - x0) * u)} y={y + 6} width={(x1 - x0) * u} height={h - 12} rx={18} fill={FIRE} opacity={0.85} />
      {Array.from({ length: 6 }, (_, i) => { const fx = x1 - (x1 - x0) * u * (i + 0.5) / 6; return <path key={i} d={`M${fx - 14} ${y + h - 8} Q ${fx} ${y - 10 - 8 * Math.sin(t / 3 + i)} ${fx + 14} ${y + h - 8} Z`} fill="#ffd166" stroke={INK} strokeWidth={4} />; })}</g>);
  return (
    <Paper tone="#f1e6cf"><Mv t={t} d={d} m={3}>
      <svg width={W} height={1080} style={{ position: "absolute" }}>
        <rect x={0} y={g0} width={W} height={560} fill={ROCK} />
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={0} y={g0 + 40 + i * 72} width={W} height={14 + (i % 3) * 6} fill={ROCK2} opacity={0.6} />)}
        <rect x={0} y={g0 - 12} width={W} height={20} fill="#6a8a4a" stroke={INK} strokeWidth={5} />
        {/* the coal seams the tunnels follow */}
        <rect x={0} y={448} width={W} height={10} fill={COAL} opacity={0.5} /><rect x={0} y={566} width={W} height={10} fill={COAL} opacity={0.5} /><rect x={0} y={684} width={W} height={10} fill={COAL} opacity={0.5} />
        {tunnels.map(([x0, y0, x1, y1], i) => <rect key={i} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={18} fill={COAL} stroke={INK} strokeWidth={6} />)}
        {/* shafts joining them */}
        <rect x={540} y={470} width={30} height={72} fill={COAL} stroke={INK} strokeWidth={5} /><rect x={1140} y={590} width={30} height={72} fill={COAL} stroke={INK} strokeWidth={5} /><rect x={1300} y={485} width={30} height={58} fill={COAL} stroke={INK} strokeWidth={5} />
        {/* the strip-mine pit and the dump in it, the opening in its wall down to the old workings */}
        <path d={`M${pitX - 190} ${g0} L${pitX - 120} ${g0 + 150} L${pitX + 120} ${g0 + 150} L${pitX + 190} ${g0} Z`} fill="#c9b08a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M${pitX - 90} ${g0 + 150} Q ${pitX} ${g0 + 80} ${pitX + 90} ${g0 + 150} Z`} fill="#7a6a5a" stroke={INK} strokeWidth={5} />
        {mode > 0 ? <rect x={pitX - 140} y={g0 + 128} width={46} height={62} rx={10} fill={COAL} stroke={RED} strokeWidth={mode === 1 ? 8 : 5} /> : null}
        {mode > 0 ? <rect x={1460} y={g0 + 168} width={40} height={34} fill={COAL} /> : null}
        {Array.from({ length: 9 }, (_, i) => house(160 + i * 150, i))}
        <g transform={`translate(${160 + 4 * 150 + 75} ${g0})`}><rect x={-40} y={-120} width={80} height={120} fill="#ecebe4" stroke={INK} strokeWidth={6} /><path d="M-8 -170 h16 v24 h14 v14 h-14 v34 h-16 v-34 h-14 v-14 h14 z" fill="#d9b85a" stroke={INK} strokeWidth={4} /></g>
        {/* the fire: into the pit's opening, then along the tunnels toward the town */}
        {mode > 0 ? <>{fireAlong(980, 440, 1500, 45, fire, 0)}{fireAlong(520, 540, 1460, 50, clamp01(fire * 1.4 - 0.3), 1)}{fireAlong(180, 420, 900, 50, clamp01(fire * 1.6 - 0.7), 2)}{fireAlong(260, 660, 1180, 45, clamp01(fire * 1.6 - 0.8), 3)}</> : null}
        {mode > 0 ? <ellipse cx={pitX} cy={g0 + 120} rx={70 * (0.6 + 0.4 * Math.sin(t / 4))} ry={30} fill={FIRE} opacity={0.8} /> : null}
        {/* air pulled in through cracks (mode 2): arrows down from the surface */}
        {mode === 2 ? [380, 760, 1100].map((x, i) => { const u = (t / 30 + i * 0.33) % 1; return <g key={i} opacity={Math.sin(Math.PI * u)}><path d={`M${x} ${g0 - 10} l -12 40 l 16 30 l -10 60`} stroke={INK} strokeWidth={6} fill="none" /><path d={`M${x + 40} ${g0 - 40 + 100 * u} v 50 m -16 -18 l 16 18 l 16 -18`} stroke="#3f7fb5" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>; }) : null}
      </svg>
      {mode === 0 ? <At x={1090} y={760} s={pop(t, at([6, "miles"], c))}><T size={46} col="#fff" style={{ textShadow: `0 4px 0 ${INK}` }}>old mine tunnels</T></At> : null}
      {mode === 0 ? <At x={600} y={150} s={pop(t, at([6, "houses"], c))}><T size={46}>houses, churches, streets</T></At> : null}
      {mode === 1 ? <At x={1620} y={150} s={pop(t, 0)}><T size={46}>the dump pit</T></At> : null}
      {mode === 1 ? <At x={1340} y={780} s={pop(t, at([12, "led"], c))}><T size={44} col="#fff" style={{ textShadow: `0 4px 0 ${INK}` }}>an opening into the old tunnels</T></At> : null}
      {mode === 2 ? <At x={1340} y={150} s={pop(t, at([15, "pulling"], c))}><T size={46} col="#3f7fb5">air in through every crack</T></At> : null}
      {mode === 2 ? <At x={900} y={790} s={pop(t, at([15, "creeps"], c))}><T size={46} col="#fff" style={{ textShadow: `0 4px 0 ${INK}` }}>the fire eats the coal</T></At> : null}
    </Mv></Paper>
  );
};

/** $663 million to dig the fire out vs $42 million to move the town: bars to scale */
const Compare: React.FC<G> = ({ t, d, c }) => {
  const u1 = ease(k(t, 2, 22)), u2 = ease(k(t, 16, 14)), H = 520, base = 720;
  const bar = (x: number, v: number, u: number, col: string, label: string, sub: string) => (
    <>
      <div style={{ position: "absolute", left: x - 140, top: base - H * v * u, width: 280, height: H * v * u, background: col, border: `7px solid ${INK}`, boxShadow: `0 8px 0 ${INK}` }} />
      <At x={x} y={base - H * v * u - 60} s={u > 0.95 ? pop(t, 0) : u}><T size={70} col={col}>{label}</T></At>
      <At x={x} y={base + 50} s={u}><T size={38} w={800} col={INK} up={false}>{sub}</T></At>
    </>
  );
  return (
    <Paper><Mv t={t} d={d} m={2}>
      {bar(680, 1, u1, RED, "$663 million", "dig the fire out (no promise)")}
      {bar(1240, 42 / 663, u2, "#2f9a57", "$42 million", "move the town")}
      <Stamp text="FAR LESS" t={t} at={at([34, "far"], c)} x={1540} y={300} size={90} col="#2f9a57" r={-8} />
    </Mv></Paper>
  );
};

/** August 1983: leave vs stay, almost two to one */
const Vote: React.FC<G> = ({ t, d, c }) => {
  const go = at([35, "leaving"], c), u = ease(k(t, go, 18));
  const row = (y: number, label: string, v: number, col: string, a: number) => (
    <>
      <At x={360} y={y} s={pop(t, a)}><T size={64}>{label}</T></At>
      <div style={{ position: "absolute", left: 560, top: y - 50, height: 100, width: 1100 * v * u, background: col, border: u > 0 ? `7px solid ${INK}` : "none", boxShadow: u > 0 ? `0 8px 0 ${INK}` : "none" }} />
    </>
  );
  return (
    <Paper><Mv t={t} d={d} m={2}>
      <Banner text="August 1983: the vote" t={t} at={0} col={INK} />
      {row(380, "GO", 1, "#2f9a57", at([35, "go"], c))}
      {row(560, "STAY", 0.53, RED, at([35, "stay"], c))}
      <Stamp text="ALMOST 2 TO 1" t={t} at={at([35, "2"], c)} x={1380} y={720} size={84} col="#2f9a57" r={-5} />
    </Mv></Paper>
  );
};

/** two sides of town: get out / it's overblown */
const Agree: React.FC<G> = ({ t, d, c }) => (
  <Paper><Mv t={t} d={d} m={2}>
    <Banner text="How bad was it?" t={t} at={0} col={INK} />
    <At x={560} y={460} s={pop(t, at([25, "some"], c))}><div style={{ background: "#fffaf0", border: `7px solid ${INK}`, borderRadius: 26, padding: "40px 50px", boxShadow: `0 10px 0 ${INK}` }}><T size={74} col={RED}>"Get us out"</T></div></At>
    <At x={1360} y={460} s={pop(t, at([25, "others"], c))}><div style={{ background: "#fffaf0", border: `7px solid ${INK}`, borderRadius: 26, padding: "40px 50px", boxShadow: `0 10px 0 ${INK}` }}><T size={74} col="#3f7fb5">"It's overblown"</T></div></At>
  </Mv></Paper>
);

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  since1962: num("1962", "burning ever since", { col: RED, m: 4, size: 320 }),
  strangest: say([{ s: "The strangest part?", size: 120 }, { s: "the town most likely", cue: [3, "started"], col: RED, size: 110 }, { s: "started it", cue: [3, "started"], col: RED, size: 110 }], { dark: true, glyph: "question", m: 4 }),
  title: say([{ s: "CENTRALIA", size: 220, col: RED }, { s: "Pennsylvania", cue: [4, "centralia"], size: 90 }], { dark: true, m: 0, y: 610 }),
  // ---------------- a coal town ----------------
  map: PaMap,
  anthracite: say([{ s: "Anthracite", size: 160, col: RED }, { s: "the hardest,", cue: [5, "hardest"], size: 100 }, { s: "hottest-burning coal", cue: [5, "hottest"], size: 100 }], { glyph: "coal", m: 2 }),
  section: (g) => <Section {...g} mode={0} />,
  // ---------------- the dump ----------------
  memday: say([{ s: "Memorial Day", size: 150, col: RED }, { s: "was coming", cue: [8, "coming"], size: 110 }], { m: 2 }),
  section2: (g) => <Section {...g} mode={1} />,
  theories: checks([{ s: "The dump fire, May 1962", mark: "check" }, { s: "An old 1930s mine fire", cue: [13, "1930s"], mark: "check" }, { s: "Still argued about", cue: [13, "argue"], mark: "x" }], { top: "How did it start?", topCol: INK, size: 70 }),
  shut: say([{ s: "August 1962:", size: 110 }, { s: "deadly gas in the mines", cue: [14, "carbon"], col: RED, size: 100 }, { s: "every mine shut down", cue: [14, "shut"], size: 100 }], { m: 2 }),
  // ---------------- a fire you can't reach ----------------
  creep: (g) => <Section {...g} mode={2} />,
  oct: say([{ s: "October 1962:", size: 110 }, { s: "the money ran out", cue: [16, "money"], col: RED, size: 120 }, { s: "the fire didn't", cue: [16, "fire"], size: 110 }], { m: 2 }),
  n33: num("$3.3 million", "1962-1978", { col: RED, m: 2, sub: "\"limited results\" (the state's own words)", subCue: [18, "limited"] }),
  // ---------------- the warning signs ----------------
  tomato: say([{ s: "Tomatoes", size: 150, col: RED }, { s: "in the winter", cue: [20, "winter"], size: 120 }], { glyph: "sun", m: 2 }),
  n172: num("172°F", "the gasoline in his tank", { col: RED, m: 4, size: 300 }),
  first: say([{ s: "The first building", size: 120 }, { s: "torn down", cue: [23, "torn"], col: RED, size: 150 }, { s: "because of the fire", cue: [23, "because"], size: 90 }], { m: 2 }),
  agree: Agree,
  // ---------------- the hole ----------------
  feb14: say([{ s: "February 14, 1981", size: 130, col: RED }, { s: "Valentine's Day", size: 100, cue: [26, "valentine's"] }], { m: 2 }),
  co: num("150 ft", "deep, full of carbon monoxide", { col: RED, m: 4, size: 300, sub: "enough to kill", subCue: [31, "kill"] }),
  watching: say([{ s: "Now the whole country", size: 110 }, { s: "was watching", cue: [32, "watching"], col: RED, size: 140 }], { dark: true, m: 0 }),
  // ---------------- stay or go ----------------
  n663: num("$663 million", "to dig the fire out", { col: RED, m: 2, sub: "with no promise it would work", subCue: [33, "promise"] }),
  compare: Compare,
  vote: Vote,
  n1000: checks([{ s: "1,000+ people moved away" }, { s: "~500 buildings torn down", cue: [37, "500"] }], { top: "By the end of the 1980s", topCol: INK, size: 80 }),
  // ---------------- the holdouts ----------------
  coal: say([{ s: "\"They want the coal\"?", size: 110 }, { s: "officials always denied it", cue: [38, "denied"], col: RED, size: 100 }], { glyph: "coal", m: 2 }),
  n1992: say([{ s: "1992", size: 220, col: RED }, { s: "the state takes", cue: [39, "eminent"], size: 100 }, { s: "every property left", cue: [39, "every"], size: 100 }], { m: 2 }),
  n1993: say([{ s: "Route 61", size: 150 }, { s: "closed, 1993", cue: [40, "1993"], col: RED, size: 140 }], { m: 2 }),
  zipcard: say([{ s: "ZIP 17927", size: 170 }, { s: "retired, 2002", cue: [41, "zip"], col: RED, size: 120 }], { m: 2 }),
  court: num("20 years", "in court", { col: RED, m: 4, size: 300 }),
  n349: num("$349,500", "between them", { col: RED, m: 2, sub: "and the right to stay for life", subCue: [43, "stay"] }),
  // ---------------- the graffiti highway ----------------
  grafcard: say([{ s: "The Graffiti Highway", size: 140, col: RED }], { dark: true, m: 0 }),
  n400: num("~400", "truckloads of dirt", { col: RED, m: 4, size: 320, sub: "2020", subCue: 6 }),
  // ---------------- today ----------------
  n250: num("250 more years?", "at the rate it's burning", { col: RED, m: 2, size: 200 }),
  n49: num("~$49 million", "to fight the fire and move the town", { col: RED, m: 2 }),
  // kept left of x ~1400: the subscribe card and mascot are still on the right when this board comes in
  question: ({ t, d, c }) => (
    <Paper tone="#141a2a"><Mv t={t} d={d} m={4}>
      <At x={740} y={400} s={pop(t, 0)}><T size={100} col="#fff">Take the buyout...</T></At>
      <At x={740} y={580} s={pop(t, at([52, "stayed"], c))}><T size={150} col={RED}>or stay?</T></At>
    </Mv></Paper>
  ),
};
void FONT; void lerp; void Label;
