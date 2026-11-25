// The Toledo War long-form's 2D boards: the house factories (say / num / checks) plus its own map of the bottom of Lake
// Michigan and the west end of Lake Erie (drawn in code, not survey-grade), which builds up chapter 1 one idea at a time:
// the 1787 line, the Mitchell Map's tip, Ohio's bend to the bay, the real tip, the two lines, the strip, the canals.
// Diagram rules (checklist): every label sits beside what it names; nothing cut by the frame edge (80 px margin);
// content stays above the captions (y < 800).
import React from "react";
import { C, G, Paper, At, T, Stamp, k, pop, ease, clamp01 } from "../pigwarlong/kit";
import { Mv } from "../hertzlong/boards";
import { say, num, checks } from "../frozenlong/boards";

const RED = C.red, INK = C.ink, OHIO = "#2a7a3a", MICH = "#2a4a8a", WATER = "#9cc0d0", SHORE = "#5a8aa0";
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);

// ---------------- the map ----------------
type LL = [number, number];
/** lon -88.5..-80.5, lat 40.4..43.7 onto 1920 x 1080 */
const P = ([lo, la]: LL): [number, number] => [(lo + 88.5) * 240, (43.7 - la) * 327];
const path = (pts: LL[], close = true) => "M" + pts.map((p) => P(p).join(" ")).join(" L") + (close ? " Z" : "");
const ERIE: LL[] = [[-83.47, 41.7], [-83.2, 41.62], [-82.7, 41.45], [-81.7, 41.5], [-80.5, 41.95], [-79.8, 42.3], [-79.0, 42.8], [-79.8, 42.85], [-80.5, 42.6], [-81.6, 42.6], [-82.5, 42.0], [-83.1, 42.02], [-83.45, 41.8]];
const MI_LAKE: LL[] = [[-87.8, 41.62], [-87.0, 41.65], [-86.6, 41.9], [-86.3, 42.4], [-86.2, 43.0], [-86.4, 44.0], [-88.0, 44.0], [-87.8, 43.4], [-87.9, 42.8], [-87.8, 42.3]];
const HURON: LL[] = [[-82.4, 43.0], [-82.5, 43.6], [-83.0, 44.05], [-81.0, 44.05], [-81.75, 43.4]];
const STCLAIR: LL[] = [[-82.9, 42.35], [-82.5, 42.3], [-82.45, 42.6], [-82.75, 42.65]];
const TIP: LL = [-87.3, 41.62], MITCH_DY = 0.5;
const HARRIS: LL[] = [[-84.81, 41.696], [-83.45, 41.733]], FULTON: LL[] = [[-84.81, 41.62], [-83.3, 41.62]];
const STRIP: LL[] = [[-84.81, 41.62], [-83.3, 41.62], [-83.47, 41.7], [-83.45, 41.733], [-84.81, 41.696]];
const TOLEDO: LL = [-83.55, 41.663];
const MAUMEE: LL[] = [[-83.47, 41.69], [-83.55, 41.65], [-83.65, 41.57], [-83.9, 41.47], [-84.2, 41.35], [-84.36, 41.28], [-84.8, 41.1]];
const CANAL: LL[] = [[-84.36, 41.28], [-84.4, 41.0], [-84.35, 40.6], [-84.3, 40.4]];

const Tag: React.FC<{ p: LL; text: string; s: number; col?: string; size?: number; dx?: number; dy?: number }> = ({ p, text, s, col = INK, size = 40, dx = 0, dy = 0 }) => {
  const [x, y] = P(p);
  return <At x={x + dx} y={y + dy} s={s}><div style={{ background: "#fffaf0", border: `5px solid ${col}`, borderRadius: 14, padding: "6px 16px", boxShadow: `0 5px 0 ${INK}` }}><T size={size} col={col} up={false}>{text}</T></div></At>;
};

/** v: 0 the two lakes; 1 the 1787 line from the tip; 2 the Mitchell Map's tip, too far north; 3 Ohio's 1802 bend up to the
 *  bay; 4 the real tip, further south; 5 the two survey lines; 6 the strip and Toledo; 7 the canals */
const Lines: React.FC<G> = ({ t, d, c, v }) => {
  const m = v ?? 0, a = ease(k(t, 4, 26));
  const lineTo = (from: LL, to: LL, u: number): LL => [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u];
  const ghost = m === 2 || m === 3, mtip: LL = [TIP[0], TIP[1] + MITCH_DY];
  const ordEnd: LL = [-83.3, TIP[1]];
  return (
    <Paper tone="#efe2c2"><Mv t={t} d={d} m={2}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1920} height={1080} fill="#e9dcbc" />
        {/* states (faint): Michigan above, Ohio and Indiana below */}
        <path d={path([[-84.81, 41.7], [-80.5, 41.75], [-80.5, 43.7], [-88.5, 43.7], [-88.5, 41.76], [-84.81, 41.76]])} fill="#e7d9a6" />
        <path d={path([[-84.81, 40.4], [-80.52, 40.4], [-80.52, 41.98], [-83.45, 41.733], [-84.81, 41.696]])} fill={m >= 5 ? "#e9dcbc" : "#d9e6bc"} />
        <path d={path([[-80.52, 40.4], [-80.52, 41.98], [-80.5, 43.7], [-80.4, 43.7], [-80.4, 40.4]])} fill="#e9dcbc" />
        <path d={`M${P([-84.81, 40.4]).join(" ")} L${P([-84.81, 41.76]).join(" ")} L${P([-86.8, 41.76]).join(" ")}`} stroke={INK} strokeWidth={4} strokeDasharray="18 12" fill="none" opacity={0.6} />
        <path d={`M${P([-80.52, 40.4]).join(" ")} L${P([-80.52, 41.98]).join(" ")}`} stroke={INK} strokeWidth={4} strokeDasharray="18 12" fill="none" opacity={0.6} />
        {/* the lakes */}
        {[ERIE, HURON, STCLAIR].map((lk, i) => <path key={i} d={path(lk)} fill={WATER} stroke={SHORE} strokeWidth={5} />)}
        <path d={path(MI_LAKE)} fill={WATER} stroke={SHORE} strokeWidth={5} transform={ghost ? `translate(0 ${-MITCH_DY * 327})` : undefined} opacity={ghost ? 0.55 : 1} strokeDasharray={ghost ? "16 10" : undefined} />
        {m === 4 ? <path d={path(MI_LAKE)} fill={WATER} stroke={SHORE} strokeWidth={5} opacity={a} /> : null}
        <path d={path(MAUMEE, false)} stroke={SHORE} strokeWidth={10} fill="none" strokeLinecap="round" />
        {m >= 7 ? <path d={path(CANAL, false)} stroke="#7a5a2a" strokeWidth={9} strokeDasharray={`${1400 * a} 2000`} fill="none" /> : null}
        {/* the 1787 line: due east from the tip */}
        {m === 1 || m === 4 ? (() => { const e = lineTo(TIP, ordEnd, m === 1 ? a : 1); return <path d={`M${P(TIP).join(" ")} L${P(e).join(" ")}`} stroke={RED} strokeWidth={8} strokeDasharray="22 12" />; })() : null}
        {m === 2 ? (() => { const e = lineTo(mtip, [-82.2, mtip[1]], a); return <path d={`M${P(mtip).join(" ")} L${P(e).join(" ")}`} stroke={RED} strokeWidth={8} strokeDasharray="22 12" />; })() : null}
        {m === 3 ? (() => { const e = lineTo(TIP, [-83.45, 41.733], a); return <path d={`M${P(TIP).join(" ")} L${P(e).join(" ")}`} stroke={OHIO} strokeWidth={8} />; })() : null}
        {m >= 5 ? <>
          <path d={`M${P([-87.3, 41.7]).join(" ")} L${P(HARRIS[0]).join(" ")} L${P(lineTo(HARRIS[0], HARRIS[1], m === 5 ? a : 1)).join(" ")}`} stroke={OHIO} strokeWidth={9} fill="none" />
          <path d={`M${P(TIP).join(" ")} L${P(FULTON[0]).join(" ")} L${P(lineTo(FULTON[0], FULTON[1], m === 5 ? ease(k(t, at([10, "michigan"], c), 22)) : 1)).join(" ")}`} stroke={MICH} strokeWidth={9} fill="none" />
        </> : null}
        {m >= 6 ? <path d={path(STRIP)} fill={RED} opacity={0.5 * (m === 6 ? a : 1)} stroke={RED} strokeWidth={4} /> : null}
        {m >= 6 ? <><circle cx={P(TOLEDO)[0]} cy={P(TOLEDO)[1]} r={16} fill={INK} /><circle cx={P(TOLEDO)[0]} cy={P(TOLEDO)[1]} r={9} fill="#ffd166" /></> : null}
        {m >= 7 ? <path d={`M${P([-82.0, 42.1]).join(" ")} L${P([-80.9, 42.55]).join(" ")}`} stroke="#7a5a2a" strokeWidth={9} markerEnd="url(#tip)" strokeDasharray={`${700 * ease(k(t, at([13, "linking"], c), 20))} 2000`} /> : null}
        <defs><marker id="tip" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#7a5a2a" /></marker></defs>
      </svg>
      {/* names: lakes and states */}
      <At x={P([-87.15, 42.9])[0]} y={P([-87.15, 42.9])[1] - (ghost ? MITCH_DY * 327 : 0)} s={1}><T size={38} col="#2a5a7a" up={false}>Lake Michigan</T></At>
      <At x={P([-81.6, 42.05])[0]} y={P([-81.6, 42.05])[1]} s={1}><T size={40} col="#2a5a7a" up={false}>Lake Erie</T></At>
      <At x={P([-84.1, 43.1])[0]} y={P([-84.1, 43.1])[1]} s={1}><T size={60} col={MICH}>MICHIGAN</T></At>
      <At x={P([-82.3, 40.75])[0]} y={P([-82.3, 40.75])[1]} s={1}><T size={60} col={OHIO}>OHIO</T></At>
      <At x={P([-86.3, 41.0])[0]} y={P([-86.3, 41.0])[1]} s={1}><T size={40} col="#5a4a3a">INDIANA</T></At>
      {/* what each step adds */}
      {m === 1 ? <Tag p={[-85.4, 41.62]} dy={-70} s={pop(t, 14)} col={RED} text="1787: due east from the tip" /> : null}
      {m === 2 ? <Tag p={mtip} dx={420} dy={-60} s={pop(t, at([7, "mitchell"], c))} col={RED} text="the Mitchell Map's tip: too far north" /> : null}
      {m === 3 ? <Tag p={[-85.8, 41.7]} dy={-80} s={pop(t, at([8, "bend"], c))} col={OHIO} text="Ohio, 1802: bend up to Maumee Bay" /> : null}
      {m === 4 ? <Tag p={TIP} dx={330} dy={80} s={pop(t, at([9, "further"], c))} col={RED} text="the real tip: further south" /> : null}
      {m === 5 ? <><Tag p={[-86.0, 41.72]} dy={-62} s={pop(t, at([10, "ohio"], c))} col={OHIO} text="Ohio's line" /><Tag p={[-86.0, 41.62]} dy={62} s={pop(t, at([10, "michigan"], c))} col={MICH} text="Michigan's line" /></> : null}
      {m === 6 ? <><Tag p={[-84.1, 41.66]} dy={-90} s={pop(t, at([11, "468"], c))} col={RED} text="468 square miles" /><Tag p={TOLEDO} dx={30} dy={70} s={pop(t, at([11, "toledo"], c))} text="Toledo" /></> : null}
      {m === 7 ? <><Tag p={[-84.35, 40.9]} dx={190} s={pop(t, at([13, "ohio"], c))} col="#7a5a2a" text="Ohio's canal" /><Tag p={[-80.9, 42.55]} dx={-330} dy={-80} s={pop(t, at([13, "linking"], c))} col="#7a5a2a" text="to the Erie Canal and New York" /><Tag p={TOLEDO} dx={30} dy={70} s={1} text="Toledo" /></> : null}
    </Mv></Paper>
  );
};
void clamp01; void Stamp;

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  strangest: say([{ s: "The strangest part?", size: 120 }, { s: "the side that lost", cue: [3, "lost"], col: RED, size: 110 }, { s: "got rich", cue: [3, "rich"], col: "#2f9a57", size: 140 }], { dark: true, m: 4 }),
  title: say([{ s: "THE TOLEDO WAR", size: 190, col: RED }, { s: "Ohio vs. Michigan, 1835", cue: [4, "toledo"], size: 80 }], { dark: true, m: 0, y: 560 }),
  // ---------------- a bad map ----------------
  lines: Lines,
  // ---------------- the prize ----------------
  canals: say([{ s: "Why fight over a swamp?", size: 110 }, { s: "CANALS", cue: [12, "canals"], col: RED, size: 200 }], { m: 2 }),
  // ---------------- the boy governor ----------------
  statehood: say([{ s: "1835:", size: 130 }, { s: "Michigan wants", cue: [15, "michigan"], size: 110 }, { s: "to be a state", cue: [15, "state"], col: RED, size: 120 }], { m: 2 }),
  boygov: say([{ s: "\"The Boy Governor\"", size: 140, col: RED }, { s: "Stevens T. Mason, 22", cue: [16, "people"], size: 80 }], { m: 2 }),
  feb: say([{ s: "February 1835", size: 130, col: RED }, { s: "Ohio takes over", cue: [18, "taking"], size: 110 }, { s: "the strip", cue: [18, "strip"], size: 110 }], { m: 2 }),
  pains: num("$1,000", "fine for Ohio officials", { col: RED, m: 2, top: "The Pains and Penalties Act", sub: "or 5 years of hard labor", subCue: [19, "locked"] }),
  armies: checks([{ s: "Ohio: about 600 militia" }, { s: "Michigan: around 1,000", cue: [20, "mason"] }], { top: "Both sides call out the militia", topCol: INK, size: 80 }),
  // ---------------- the one real battle ----------------
  phillips: say([{ s: "Phillips Corners", size: 140, col: RED }, { s: "April 1835", size: 100 }], { m: 2 }),
  nine: num("9", "surveyors arrested", { col: RED, m: 4, size: 340, sub: "nobody hit", subCue: 0 }),
  // ---------------- one and two ----------------
  sons: say([{ s: "His sons:", size: 110 }, { s: "ONE", cue: [25, "one"], col: RED, size: 200 }, { s: "and TWO", cue: [25, "two"], col: RED, size: 160 }], { m: 2 }),
  onlyblood: checks([{ s: "Wounded: 1 deputy sheriff" }, { s: "Killed: 1 horse", cue: [28, "horse"] }], { top: "The Toledo War's casualties", topCol: RED, size: 84 }),
  // ---------------- the midnight court ----------------
  lucascounty: say([{ s: "LUCAS COUNTY", size: 160, col: OHIO }, { s: "named after", cue: [29, "named"], size: 100 }, { s: "the governor", cue: [29, "governor"], col: RED, size: 110 }], { m: 2 }),
  sept: say([{ s: "September 1835", size: 130, col: RED }, { s: "court in the middle", cue: [30, "middle"], size: 100 }, { s: "of the night", cue: [30, "night"], size: 100 }], { dark: true, m: 2 }),
  notcoming: say([{ s: "The militia", size: 120 }, { s: "was NOT coming", cue: [31, "not"], col: RED, size: 140 }], { dark: true, m: 4 }),
  jackson: say([{ s: "President Andrew Jackson", size: 100 }, { s: "had had enough", cue: [32, "enough"], col: RED, size: 130 }, { s: "Mason: removed", cue: [32, "removed"], size: 110 }], { m: 2 }),
  // ---------------- the deal ----------------
  annarbor: say([{ s: "Ann Arbor, September 1836", size: 100 }, { s: "NO", cue: [37, "no"], col: RED, size: 300 }], { m: 4 }),
  surplus: checks([{ s: "Federal surplus shared out" }, { s: "States: a share", cue: [38, "share"], mark: "check" }, { s: "Territories: nothing", cue: [38, "territories"], mark: "x" }], { top: "Money on the table", topCol: INK, size: 78 }),
  statehood2: say([{ s: "January 26, 1837", size: 120 }, { s: "the 26th state", cue: [41, "26th"], col: "#2f9a57", size: 140 }, { s: "without Toledo", cue: [41, "without"], col: RED, size: 120 }], { m: 2 }),
  // ---------------- the frozen wasteland ----------------
  houghton: say([{ s: "1841", size: 200, col: RED }, { s: "copper", cue: [43, "copper"], col: "#c0702a", size: 170 }, { s: "Douglass Houghton, state geologist", cue: [43, "douglass"], size: 64 }], { m: 2 }),
  n40: num("40 years", "#1 in copper in the U.S.", { col: "#c0702a", m: 4, size: 300, sub: "1847 to 1887", subCue: 0 }),
  // ---------------- who won? ----------------
  court1973: say([{ s: "1973: the Supreme Court", size: 110 }, { s: "Michigan v. Ohio", cue: [48, "michigan"], size: 120 }, { s: "Ohio wins again", cue: [48, "won"], col: OHIO, size: 130 }], { m: 2 }),
  // kept left of x ~1400: the subscribe card and mascot are still on the right when this board comes in
  question: ({ t, d, c }) => (
    <Paper tone="#141a2a"><Mv t={t} d={d} m={4}>
      <At x={620} y={300} s={pop(t, 0)}><T size={84} col="#fff">Who really won?</T></At>
      <At x={620} y={460} s={pop(t, at([50, "ohio"], c))}><T size={72} col="#7fd18a">Ohio: the port</T></At>
      <At x={620} y={590} s={pop(t, at([50, "michigan"], c))}><T size={72} col="#ffb347">Michigan: the copper</T></At>
    </Mv></Paper>
  ),
};
