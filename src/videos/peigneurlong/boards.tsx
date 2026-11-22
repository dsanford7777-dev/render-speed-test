// The Lake Peigneur long-form's 2D boards: the Longyearbyen long-form's factories (say / num / card / icons / checks),
// plus two of its own: a cut through the lake, the salt dome and the mine (Section), and a map of the lake, the canal
// and the Gulf (LakeMap). Diagram rules (checklist, Nov 20): the sun is in the sky; every label sits beside what it
// names and never on it; nothing is cut by the frame edge (80 px margin); content stays above the captions (y < 800).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, G, FONT, Paper, At, T, Banner, Stamp, k, pop, ease, lerp } from "../pigwarlong/kit";
import { Mv } from "../hertzlong/boards";
import { say, num, card, icons, checks } from "../frozenlong/boards";

const RED = C.red, GOLD = C.yellow, INK = C.ink, WATER = "#3f7fb5", WATER2 = "#9cc6e0", SALT = "#ece8de", SALT2 = "#d6d0c2", MUD = "#8a6a48", GRASS = "#6a9a4a", SKY = "#cfe2f0";
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);
const st = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** a label with a short leader line to the point it names; the text box sits at (x, y) */
const Lab: React.FC<{ x: number; y: number; px?: number; py?: number; s: string; size?: number; col?: string; o?: number; anchor?: "start" | "middle" | "end" }> = ({ x, y, px, py, s, size = 40, col = INK, o = 1, anchor = "start" }) => (
  <g opacity={o}>
    {px !== undefined && py !== undefined ? <path d={`M${px} ${py} L${anchor === "end" ? x + 12 : anchor === "start" ? x - 12 : x} ${y - size * 0.35}`} stroke={INK} strokeWidth={4} fill="none" strokeDasharray="10 8" /> : null}
    <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={size} fill={col} stroke="#fffaf0" strokeWidth={10} paintOrder="stroke">{s}</text>
  </g>
);

// ---------------- the cut through the lake ----------------
/** v: 0 = the layers; 1 = + the mine's three levels; 2 = + the rig and the pipe, stopping above the mine; 3 = the pipe
 *  through the roof; 4 = water pouring down, the hole widening; 5 = today: the dome as gas storage */
const Section: React.FC<G & { v: number }> = ({ t, d, v }) => {
  const W = 1920, sky = 210, wl = 250, bed = 300, lv = [470, 560, 650], rigX = 1350, isX = 470;
  const pipeTo = v < 2 ? 0 : v === 2 ? lerp(bed, lv[0] - 40, ease(k(t, 4, 30))) : lv[0] + 6;
  const hole = v >= 4 ? 20 + 90 * ease(k(t, 6, Math.max(20, d - 20))) : v === 3 ? 10 : 0;
  const dome = `M200 1080 C 220 620 300 360 ${isX} 330 C 640 300 1500 330 1640 520 C 1760 700 1780 900 1800 1080 Z`;
  return (
    <Paper tone="#fffaf0"><Mv t={t} d={d} m={v % 2 ? 2 : 0}>
      <svg width={W} height={1080} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={W} height={wl} fill={SKY} />
        {/* the sun: in the sky, top right */}
        <g transform="translate(1720 110)">{Array.from({ length: 8 }, (_, i) => <path key={i} transform={`rotate(${i * 45})`} d="M0 -62 L0 -82" stroke={GOLD} strokeWidth={10} strokeLinecap="round" />)}<circle r={44} fill={GOLD} {...st} /></g>
        {/* the ground under the lake, the island hill on the left */}
        <rect x={0} y={bed} width={W} height={1080 - bed} fill={MUD} />
        <path d={`M0 ${wl} L${isX - 220} ${wl} C ${isX - 150} ${sky - 40} ${isX + 80} ${sky - 60} ${isX + 200} ${wl} L${isX + 200} ${bed} L0 ${bed} Z`} fill={GRASS} {...st} />
        <path d={dome} fill={SALT} {...st} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${300 + i * 40} ${1000 - i * 8} C ${700} ${420 + i * 50} ${1300} ${430 + i * 50} ${1700 - i * 10} ${1000 - i * 6}`} stroke={SALT2} strokeWidth={5} fill="none" />)}
        {/* the lake */}
        <rect x={isX + 200} y={wl} width={W - isX - 200} height={bed - wl} fill={WATER} />
        <path d={`M${isX + 200} ${wl} L${W} ${wl}`} stroke={WATER2} strokeWidth={6} />
        {/* the mine: three levels of rooms and pillars, the shaft from the island */}
        {v >= 1 && v < 5 ? <g opacity={ease(k(t, 0, 10))}>
          <path d={`M${isX - 40} ${sky + 10} L${isX - 40} ${lv[2] + 30}`} stroke={INK} strokeWidth={14} />
          {lv.map((y, i) => <g key={i}>{Array.from({ length: 10 }, (_, j) => <rect key={j} x={isX - 40 + j * 110} y={y} width={80} height={34} fill="#3a3430" />)}<rect x={isX - 40} y={y} width={1080} height={34} fill="none" stroke={INK} strokeWidth={4} /></g>)}
          <path d={`M${isX - 80} ${sky - 10} L${isX - 40} ${sky - 70} L${isX} ${sky - 10}`} fill="none" stroke={INK} strokeWidth={8} />
        </g> : null}
        {/* the rig on the lake and its pipe */}
        {v >= 2 && v < 5 ? <g>
          <path d={`M${rigX - 60} ${wl} L${rigX - 18} ${wl - 150} L${rigX + 18} ${wl - 150} L${rigX + 60} ${wl}`} fill="none" stroke={INK} strokeWidth={8} />
          <path d={`M${rigX - 40} ${wl - 60} L${rigX + 40} ${wl - 60} M${rigX - 30} ${wl - 100} L${rigX + 30} ${wl - 100}`} stroke={INK} strokeWidth={6} />
          <rect x={rigX - 80} y={wl - 22} width={160} height={22} fill={RED} {...st} />
          <path d={`M${rigX} ${wl - 150} L${rigX} ${pipeTo}`} stroke="#5a5e66" strokeWidth={10} />
        </g> : null}
        {/* the hole: water running down the pipe, salt dissolving round it */}
        {hole > 0 ? <g>
          <path d={`M${rigX - hole} ${bed} C ${rigX - hole * 0.6} ${bed + 60} ${rigX - 12} ${lv[0] - 60} ${rigX - 8} ${lv[0]} L${rigX + 8} ${lv[0]} C ${rigX + 12} ${lv[0] - 60} ${rigX + hole * 0.6} ${bed + 60} ${rigX + hole} ${bed} Z`} fill={WATER} {...st} />
          {v >= 4 ? Array.from({ length: 6 }, (_, i) => { const u = ((t / 30) * 1.2 + i / 6) % 1; return <path key={i} d={`M${rigX} ${bed + u * (lv[0] - bed - 30)} l-14 -26 m14 26 l14 -26`} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />; }) : null}
          {v >= 4 ? <rect x={rigX - 380} y={lv[0]} width={500} height={34} fill={WATER} opacity={ease(k(t, 20, 30))} /> : null}
        </g> : null}
        {v === 5 ? <g opacity={ease(k(t, 4, 12))}>{Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={760 + i * 150} cy={560 + (i % 2) * 60} rx={50} ry={110} fill="#f0c860" {...st} />)}</g> : null}
        {/* labels: beside what they name, never on it */}
        <Lab x={760} y={sky + 12} px={850} py={wl + 20} s="THE LAKE: 10 FT DEEP" size={40} col={WATER} o={pop(t, 2)} />
        <Lab x={110} y={sky - 70} px={isX - 120} py={sky + 10} s="JEFFERSON ISLAND" size={40} o={pop(t, 4)} />
        <Lab x={1810} y={760} px={1650} py={700} s="A MOUNTAIN OF SALT" size={44} o={pop(t, 8)} anchor="end" />
        {v >= 1 && v < 5 ? lv.map((y, i) => <Lab key={i} x={110} y={y + 28} s={["1,000 FT", "1,300 FT", "1,500 FT"][i]} size={36} o={pop(t, 6 + i * 4)} />) : null}
        {v >= 2 && v < 5 ? <Lab x={rigX - 100} y={wl - 110} s="TEXACO RIG" size={40} col={RED} o={pop(t, 2)} anchor="end" /> : null}
        {v === 2 ? <Lab x={rigX + 40} y={(pipeTo + bed) / 2 + 40} s="DRILL PIPE" size={36} o={pop(t, 10)} /> : null}
        {v >= 4 ? <Lab x={rigX - hole - 40} y={bed + 110} px={rigX - hole * 0.6} py={bed + 60} s="SALT DISSOLVING" size={38} col={WATER} o={pop(t, 14)} anchor="end" /> : null}
        {v === 5 ? <Lab x={1810} y={380} px={1360} py={520} s="NATURAL GAS STORAGE" size={42} col={RED} o={pop(t, 10)} anchor="end" /> : null}
      </svg>
      {v === 3 ? <Stamp text="THROUGH THE ROOF" t={t} at={8} x={1460} y={420} size={70} col={RED} r={-6} /> : null}
    </Mv></Paper>
  );
};

// ---------------- the map ----------------
/** v: 0 = where the lake is; 1 = the canal running out to the bay; 2 = the canal running backwards (in) */
const LakeMap: React.FC<G & { v: number }> = ({ t, d, v }) => {
  const lake = { x: 860, y: 300 }, bay = { x: 960, y: 640 }, ni = { x: 1260, y: 250 };
  const canal = `M${lake.x + 20} ${lake.y + 52} C ${lake.x + 30} ${lake.y + 160} ${bay.x - 40} ${bay.y - 180} ${bay.x} ${bay.y - 60}`;
  const u = (t / 30) * 0.9 % 1;
  return (
    <Paper tone="#e8dcc0"><Mv t={t} d={d} m={v ? 2 : 4}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* the Gulf and Vermilion Bay (south = down) */}
        <path d="M0 700 C 300 660 520 720 700 640 C 820 590 880 600 1000 560 C 1120 600 1300 660 1500 640 C 1700 620 1820 680 1920 660 L1920 1080 L0 1080 Z" fill={WATER2} {...st} />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${80 + i * 135} ${820 + (i % 3) * 40} q 20 -12 40 0 t 40 0`} stroke={WATER} strokeWidth={5} fill="none" />)}
        {/* marsh dabs, roads */}
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 197) % 1880 + 20} cy={460 + ((i * 89) % 170)} r={6} fill="#8aa86a" opacity={0.6} />)}
        <path d="M200 240 L1700 210" stroke="#b9a27a" strokeWidth={10} strokeDasharray="30 18" />
        {/* the canal */}
        <path d={canal} stroke={WATER} strokeWidth={16} fill="none" />
        {/* the lake */}
        <ellipse cx={lake.x} cy={lake.y} rx={110} ry={58} fill={WATER} {...st} />
        <ellipse cx={lake.x + 70} cy={lake.y + 6} rx={34} ry={24} fill="#8aa86a" {...st} />
        {/* the flow arrows: out to the bay, or (v 2) in from the Gulf */}
        {v >= 1 ? [0, 1, 2].map((i) => { const p = ((v === 1 ? u : 1 - u) + i / 3) % 1, y = lake.y + 70 + p * (bay.y - lake.y - 150), x = lake.x + 26 + p * (bay.x - lake.x - 60), dir = v === 1 ? 1 : -1;
          return <path key={i} d={`M${x - 22} ${y - 14 * dir} L${x} ${y + 14 * dir} L${x + 22} ${y - 14 * dir}`} stroke={v === 1 ? INK : RED} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />; }) : null}
        {/* New Iberia: a town dot, east of the lake */}
        <circle cx={ni.x} cy={ni.y} r={16} fill={RED} {...st} />
        <Lab x={ni.x + 30} y={ni.y - 24} s="NEW IBERIA" size={42} o={pop(t, 6)} />
        <Lab x={lake.x - 130} y={lake.y - 90} px={lake.x - 40} py={lake.y - 50} s="LAKE PEIGNEUR" size={52} col={WATER} o={pop(t, 2)} />
        <Lab x={bay.x + 110} y={bay.y - 160} px={bay.x - 20} py={bay.y - 120} s="DELCAMBRE CANAL" size={40} o={pop(t, v ? 2 : 14)} />
        <Lab x={1300} y={720} s="GULF OF MEXICO" size={48} col={WATER} o={pop(t, 10)} />
        <Lab x={300} y={130} s="LOUISIANA" size={60} o={pop(t, 0)} />
        <path d={`M${lake.x + 140} ${lake.y + 40} L${ni.x - 30} ${ni.y + 10}`} stroke={INK} strokeWidth={4} strokeDasharray="12 10" />
        <Lab x={(lake.x + ni.x) / 2 + 60} y={(lake.y + ni.y) / 2 + 70} s="~10 MILES" size={34} o={pop(t, 12)} />
      </svg>
      {v === 2 ? <Stamp text="BACKWARDS" t={t} at={6} x={560} y={480} size={84} col={RED} r={-7} /> : null}
    </Mv></Paper>
  );
};

/** before / after, side by side */
const Compare: React.FC<G> = ({ t, d, c }) => (
  <Paper><Mv t={t} d={d} m={2}>
    <Banner text="The lake that came back" t={t} at={0} col={INK} />
    {[{ x: 560, top: "1980", a: "10 FEET", b: "FRESH WATER", col: WATER, cue: 0 }, { x: 1360, top: "TODAY", a: "200 FEET", b: "SALT WATER", col: RED, cue: at([53, "now"], c) }].map((p, i) => (
      <At key={i} x={p.x} y={470} s={pop(t, p.cue)}><div style={{ textAlign: "center", background: "#fffaf0", border: `7px solid ${INK}`, borderRadius: 24, padding: "28px 56px", boxShadow: `0 10px 0 ${INK}` }}>
        <T size={50} w={800} col={C.grey}>{p.top}</T><T size={140} col={p.col}>{p.a}</T><T size={64} col={INK}>{p.b}</T></div></At>))}
  </Mv></Paper>
);

const W1 = "#26304a";
export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  title: say([{ s: "The day a lake", size: 130 }, { s: "went down the drain", cue: [3, "drain"], col: RED, size: 140 }], { m: 0 }),
  // ---------------- a lake on a mountain of salt ----------------
  map: (g) => <LakeMap {...g} v={0} />,
  dome: (g) => <Section {...g} v={0} />,
  jefferson: card("Joseph Jefferson", "the actor famous as Rip Van Winkle", "person", { col: W1, extra: "bought the island in 1869", extraCue: [8, "bought"] }),
  levels: (g) => <Section {...g} v={1} />,
  // ---------------- two companies, one lake ----------------
  texaco: say([{ s: "Texaco", size: 170, col: RED }, { s: "hired Wilson Brothers", cue: [12, "contractor"], size: 100 }, { s: "to drill from the lake", cue: [12, "drill"], size: 80 }], { m: 2 }),
  both: (g) => <Section {...g} v={2} />,
  // ---------------- the drill gets stuck ----------------
  n1230: num("1,230", "feet down: stuck", { col: RED, sub: "after about a day and a half of drilling", subCue: [14, "day"], m: 2 }),
  n5m: num("$5M", "the rig", { dark: true, col: GOLD, m: 4 }),
  nobottom: say([{ s: "10 feet of water", size: 120 }, { s: "can't swallow a rig", cue: [18, "swallow"], col: RED, size: 120 }], { m: 0 }),
  unless: say([{ s: "Unless", size: 150 }, { s: "there's no bottom", cue: [18, "bottom"], col: RED, size: 140 }], { dark: true, m: 4 }),
  pierce: (g) => <Section {...g} v={3} />,
  dissolve: (g) => <Section {...g} v={4} />,
  // ---------------- on the lake ----------------
  viator: card("Leonce Viator Jr.", "out fishing with his nephew", "person", { col: C.blue }),
  // ---------------- 1,500 feet down ----------------
  enemy: say([{ s: "Water:", size: 130 }, { s: "the one thing", cue: [26, "one"], size: 110 }, { s: "you never let in", cue: [26, "never"], col: RED, size: 130 }], { m: 2 }),
  n1: num("1", "elevator out", { col: INK, sub: "8 people at a time", subCue: [27, "8"], m: 0 }),
  lasalle: card("Randy LaSalle", "maintenance foreman", "person", { col: C.blue, extra: "warned the men who hadn't heard", extraCue: [28, "warning"] }),
  n6: num("6", "miners given awards", { col: C.green, sub: "for getting others out first", subCue: [31, "getting"], m: 4 }),
  // ---------------- the whirlpool ----------------
  quarter: num("1/4", "mile wide", { dark: true, col: GOLD, m: 2 }),
  // ---------------- the canal runs backwards ----------------
  notover: say([{ s: "But the story", size: 120 }, { s: "isn't over", cue: [37, "over"], col: RED, size: 150 }], { m: 0 }),
  mapout: (g) => <LakeMap {...g} v={1} />,
  mapin: (g) => <LakeMap {...g} v={2} />,
  n150: num("~150 ft", "a waterfall into the crater", { col: C.blue, sub: "for a few days, Louisiana's tallest", subCue: [41, "few"], m: 4 }),
  andthen: say([{ s: "And then", size: 150 }, { s: "the strangest thing", cue: [43, "strangest"], col: RED, size: 120 }], { dark: true, m: 0 }),
  never: checks([{ s: "The rig: never came back", mark: "x" }, { s: "The tugboat: never came back", cue: [45, "tugboat"], mark: "x" }], { top: "Still down there", topCol: INK, size: 80 }),
  // ---------------- who was to blame? ----------------
  who: say([{ s: "So who", size: 150 }, { s: "was to blame?", cue: [46, "blame"], col: RED, size: 150 }], { dark: true, glyph: "question", m: 4 }),
  sides: checks([{ s: "Texaco: “they kept the mine a secret”", mark: "x" }, { s: "Salt company: “they drilled in the wrong place”", cue: [47, "crew"], mark: "x" }], { top: "Two stories", topCol: INK, size: 62 }),
  report: say([{ s: "The 1981 report:", size: 100 }, { s: "“extremely difficult", cue: [48, "extremely"], col: RED, size: 110 }, { s: "to determine the precise cause”", cue: [48, "precise"], size: 86 }], { m: 2 }),
  nobody: say([{ s: "Officially:", size: 120 }, { s: "nobody knows", cue: [49, "nobody"], col: RED, size: 150 }], { m: 0 }),
  n32: num("$32M", "Texaco & Wilson Brothers to the salt company", { dark: true, col: GOLD, sub: "1983, out of court", m: 4, size: 300 }),
  n128: num("$12.8M", "more, to the gardens on the island", { col: C.green, m: 2, size: 280 }),
  n1986: num("1986", "the salt mine closes for good", { col: INK, m: 0 }),
  // ---------------- the lake today ----------------
  compare: Compare,
  gas: (g) => <Section {...g} v={5} />,
  losses: say([{ s: "The only confirmed losses:", size: 90 }, { s: "3 dogs", cue: [58, "3"], col: RED, size: 150 }, { s: "...and a lake", cue: [58, "lake"], size: 130 }], { m: 4 }),
  question: say([{ s: "Who do you think", size: 130 }, { s: "was to blame?", cue: [60, "blame"], col: RED, size: 150 }], { glyph: "question", m: 0 }),
};
void icons; void AbsoluteFill;
