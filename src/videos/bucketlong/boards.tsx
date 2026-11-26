// The War of the Bucket long-form's 2D boards: the house factories (say / num / checks) plus two maps drawn in code
// (stylised, not survey-grade): "region", northern Italy from Milan to Rimini, and "local", the country between Modena
// and Bologna, which builds up one idea at a time: the border castles, 1296, Monteveglio, the feint across the Panaro,
// Zappolino, the chase to Bologna's walls, the castles wrecked on the way and the broken weir at Casalecchio.
// Diagram rules (checklist): every label sits beside what it names; nothing cut by the frame edge (80 px margin);
// content stays above the captions (y < 800).
import React from "react";
import { C, G, Paper, At, T, k, pop, ease } from "../pigwarlong/kit";
import { Mv } from "../hertzlong/boards";
import { say, num, checks } from "../frozenlong/boards";

const RED = C.red, INK = C.ink, BOL = "#c8262c", MOD = "#2a4aa8", MODY = "#d9a400", WATER = "#9cc0d0", SHORE = "#5a8aa0", HILLS = "#cdb98a";
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);
type LL = [number, number];

const Tag: React.FC<{ x: number; y: number; text: string; s: number; col?: string; size?: number }> = ({ x, y, text, s, col = INK, size = 38 }) => (
  <At x={x} y={y} s={s}><div style={{ background: "#fffaf0", border: `5px solid ${col}`, borderRadius: 14, padding: "6px 16px", boxShadow: `0 5px 0 ${INK}`, whiteSpace: "nowrap" }}><T size={size} col={col} up={false}>{text}</T></div></At>
);
const Dot: React.FC<{ p: [number, number]; col: string; r?: number; s?: number }> = ({ p, col, r = 16, s = 1 }) => s > 0 ? <g transform={`translate(${p[0]} ${p[1]}) scale(${s})`}><circle r={r} fill={INK} /><circle r={r * 0.6} fill={col} /></g> : null;

// ---------------- the region: northern Italy ----------------
/** x = 500 + (lon - 9.19) * 273; y = 120 + (45.46 - lat) * 379  (Milan top left, Florence bottom, Rimini right; all above y 800) */
const PR = ([lo, la]: LL): [number, number] => [500 + (lo - 9.19) * 273, 120 + (45.46 - la) * 379];
const pathR = (pts: LL[], close = true) => "M" + pts.map((p) => PR(p).join(" ")).join(" L") + (close ? " Z" : "");
const CITY: Record<string, LL> = { Milan: [9.19, 45.46], Mantua: [10.79, 45.16], Ferrara: [11.62, 44.84], Modena: [10.93, 44.65], Bologna: [11.34, 44.49], Florence: [11.25, 43.77], Rimini: [12.57, 44.06] };
const PO: LL[] = [[8.9, 45.12], [9.5, 45.08], [10.0, 45.02], [10.5, 44.98], [10.9, 45.02], [11.3, 44.94], [11.8, 44.9], [12.2, 44.94], [12.45, 44.92]];
const SEA: LL[] = [[12.32, 45.6], [12.32, 45.1], [12.42, 44.92], [12.3, 44.7], [12.28, 44.45], [12.4, 44.2], [12.57, 44.07], [12.9, 43.85], [13.4, 43.5], [13.8, 43.5], [13.8, 45.6]];
const APENNINES: LL[] = [[9.0, 44.62], [9.8, 44.5], [10.4, 44.38], [10.9, 44.25], [11.4, 44.18], [11.9, 44.0], [12.3, 43.78], [12.4, 43.6], [11.6, 43.55], [10.8, 43.75], [10.0, 44.05], [9.0, 44.3]];
const EMILIA: LL[] = [[9.7, 45.05], [10.33, 44.8], [10.63, 44.7], [10.93, 44.65], [11.34, 44.49], [11.88, 44.29], [12.57, 44.06]];

/** v: 0 Bologna and Modena; 1 the road between them, 25 miles; 2 Bonacolsi's lands (Mantua and Modena) and the allies */
const Region: React.FC<G> = ({ t, d, c, v }) => {
  const m = v ?? 0, a = ease(k(t, 4, 24)), bo = PR(CITY.Bologna), mo = PR(CITY.Modena);
  return (
    <Paper tone="#efe2c2"><Mv t={t} d={d} m={m === 2 ? 3 : 2}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1920} height={1080} fill="#e9dcbc" />
        <path d={pathR(APENNINES)} fill={HILLS} stroke="#a8945e" strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => { const p = PR([9.6 + i * 0.5, 44.32 - i * 0.07]); return <path key={i} d={`M${p[0] - 30} ${p[1] + 14} L${p[0]} ${p[1] - 20} L${p[0] + 30} ${p[1] + 14}`} stroke="#8a7a4a" strokeWidth={5} fill="none" />; })}
        <path d={pathR(SEA)} fill={WATER} stroke={SHORE} strokeWidth={5} />
        <path d={pathR(PO, false)} stroke={SHORE} strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d={pathR(EMILIA, false)} stroke="#a0845a" strokeWidth={6} strokeDasharray="14 10" fill="none" />
        {m === 1 ? <path d={`M${mo.join(" ")} L${mo[0] + (bo[0] - mo[0]) * a} ${mo[1] + (bo[1] - mo[1]) * a}`} stroke={RED} strokeWidth={12} strokeLinecap="round" /> : null}
        {m === 2 ? <path d={`M${PR(CITY.Mantua).join(" ")} L${mo.join(" ")}`} stroke={MOD} strokeWidth={10} strokeDasharray="20 12" opacity={a} /> : null}
      </svg>
      <At x={PR([12.95, 44.6])[0]} y={PR([12.95, 44.6])[1]} s={1}><T size={34} col="#2a5a7a" up={false}>Adriatic Sea</T></At>
      <At x={PR([10.3, 45.18])[0]} y={PR([10.3, 45.18])[1]} s={1}><T size={30} col="#2a5a7a" up={false}>River Po</T></At>
      <At x={PR([11.0, 44.08])[0]} y={PR([11.0, 44.08])[1]} s={1}><T size={30} col="#6a5a3a" up={false}>Apennines</T></At>
      {(["Milan", "Ferrara", "Florence", "Rimini"] as const).map((n) => { const p = PR(CITY[n]), on = m === 2 && n !== "Florence" && n !== "Rimini" ? 1 : 0.85; return <React.Fragment key={n}><svg width={1920} height={1080} style={{ position: "absolute" }}><Dot p={p} col="#8a8090" r={11} /></svg><At x={p[0]} y={p[1] - 40} s={on}><T size={32} col="#5a4a3a" up={false}>{n}</T></At></React.Fragment>; })}
      <svg width={1920} height={1080} style={{ position: "absolute" }}><Dot p={bo} col={BOL} s={pop(t, 2)} /><Dot p={mo} col={MODY} s={pop(t, 6)} />{m === 2 ? <Dot p={PR(CITY.Mantua)} col={MODY} s={pop(t, at([12, "mantua"], c))} /> : <Dot p={PR(CITY.Mantua)} col="#8a8090" r={11} />}</svg>
      <Tag x={bo[0] + 150} y={bo[1] + 40} text="Bologna" col={BOL} s={pop(t, 2)} size={44} />
      <Tag x={mo[0] - 150} y={mo[1] - 40} text="Modena" col={MOD} s={pop(t, 6)} size={44} />
      {m !== 2 ? <At x={PR(CITY.Mantua)[0]} y={PR(CITY.Mantua)[1] - 40} s={0.85}><T size={32} col="#5a4a3a" up={false}>Mantua</T></At> : <Tag x={PR(CITY.Mantua)[0] - 120} y={PR(CITY.Mantua)[1] - 50} text="Mantua" col={MOD} s={pop(t, at([12, "mantua"], c))} size={40} />}
      {m === 1 ? <Tag x={(bo[0] + mo[0]) / 2 + 40} y={(bo[1] + mo[1]) / 2 - 90} text="about 25 miles" col={RED} s={pop(t, 14)} /> : null}
      {m === 1 ? <Tag x={PR([10.2, 44.8])[0]} y={PR([10.2, 44.8])[1] + 60} text="the old Roman road" col="#7a5a2a" s={pop(t, at([5, "roman"], c))} size={32} /> : null}
      {m === 2 ? <Tag x={(PR(CITY.Mantua)[0] + mo[0]) / 2 + 210} y={(PR(CITY.Mantua)[1] + mo[1]) / 2} text="Bonacolsi's lands" col={MOD} s={pop(t, at([13, "modena"], c))} /> : null}
    </Mv></Paper>
  );
};

// ---------------- the local map: Modena to Bologna ----------------
/** lon 10.8..11.45, lat 44.25..44.75 onto 1920 x 1080 (content kept above y 800) */
const PL = ([lo, la]: LL): [number, number] => [(lo - 10.8) / 0.65 * 1920, (44.75 - la) / 0.5 * 1080];
const pathL = (pts: LL[], close = true) => "M" + pts.map((p) => PL(p).join(" ")).join(" L") + (close ? " Z" : "");
const L: Record<string, LL> = { Modena: [10.926, 44.647], Bologna: [11.343, 44.494], Monteveglio: [11.098, 44.468], Zappolino: [11.083, 44.5], Marano: [10.968, 44.456],
  Bazzano: [11.087, 44.502], Savigno: [11.074, 44.392], Crespellano: [11.128, 44.513], Zola: [11.218, 44.49], Anzola: [11.193, 44.546], Castelfranco: [11.051, 44.596], Piumazzo: [11.07, 44.548], Casalecchio: [11.276, 44.476] };
const PANARO: LL[] = [[10.86, 44.3], [10.92, 44.38], [10.968, 44.45], [11.0, 44.5], [11.0, 44.56], [10.98, 44.62], [10.99, 44.72]];
const RENO: LL[] = [[11.2, 44.3], [11.24, 44.4], [11.276, 44.476], [11.29, 44.53], [11.3, 44.6], [11.33, 44.72]];
const VIA: LL[] = [[10.83, 44.69], [10.926, 44.647], [11.051, 44.596], [11.193, 44.546], [11.343, 44.494], [11.45, 44.46]];
const HILLS_L: LL[] = [[10.8, 44.28], [10.8, 44.45], [10.95, 44.46], [11.06, 44.49], [11.2, 44.47], [11.3, 44.46], [11.45, 44.44], [11.45, 44.28]];
const CHASE: LL[] = [[11.083, 44.5], [11.128, 44.513], [11.193, 44.546], [11.218, 44.49], [11.276, 44.476], [11.343, 44.494]];

/** v: 0 the border lined with castles; 1 1296, Bazzano and Savigno to Bologna; 2 Monteveglio; 3 the feint at Marano across
 *  the Panaro; 4 Zappolino: Bologna's army on the slope, Modena's coming up; 5 the chase to Bologna; 6 the castles wrecked
 *  on the way and the weir at Casalecchio */
const Local: React.FC<G> = ({ t, d, c, v }) => {
  const m = v ?? 0, a = ease(k(t, 4, 26)), bo = PL(L.Bologna), mo = PL(L.Modena);
  const castle = (n: string, col: string, s: number, x = false) => { const p = PL(L[n]); return s > 0 ? <g key={n} transform={`translate(${p[0]} ${p[1]}) scale(${1.6 * s})`}>
    <path d="M-20 14 L-20 -10 L-14 -10 L-14 -16 L-6 -16 L-6 -10 L6 -10 L6 -16 L14 -16 L14 -10 L20 -10 L20 14 Z" fill={col} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {x ? <path d="M-24 -20 L24 18 M24 -20 L-24 18" stroke={RED} strokeWidth={8} strokeLinecap="round" /> : null}</g> : null; };
  const BORDER = ["Bazzano", "Savigno", "Monteveglio", "Crespellano", "Piumazzo", "Castelfranco"];
  const WRECK = ["Crespellano", "Zola", "Anzola", "Castelfranco", "Piumazzo"];
  const route = (pts: LL[], u: number) => { const P = pts.map(PL); let len = 0; const seg = P.slice(1).map((p, i) => { const l = Math.hypot(p[0] - P[i][0], p[1] - P[i][1]); len += l; return l; });
    let left = len * u, dd = `M${P[0].join(" ")}`; for (let i = 0; i < seg.length && left > 0; i++) { const f = Math.min(1, left / seg[i]); dd += ` L${P[i][0] + (P[i + 1][0] - P[i][0]) * f} ${P[i][1] + (P[i + 1][1] - P[i][1]) * f}`; left -= seg[i]; } return dd; };
  return (
    <Paper tone="#efe2c2"><Mv t={t} d={d} m={m % 2 ? 3 : 2}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs><marker id="bkTip" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill={MOD} /></marker>
          <marker id="bkTipR" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill={BOL} /></marker></defs>
        <rect x={0} y={0} width={1920} height={1080} fill="#e9dcbc" />
        <path d={pathL(HILLS_L)} fill={HILLS} />
        {Array.from({ length: 9 }, (_, i) => { const p = PL([10.86 + i * 0.07, 44.36 + 0.02 * Math.sin(i)]); return <path key={i} d={`M${p[0] - 34} ${p[1] + 14} L${p[0]} ${p[1] - 22} L${p[0] + 34} ${p[1] + 14}`} stroke="#8a7a4a" strokeWidth={5} fill="none" />; })}
        <path d={pathL(PANARO, false)} stroke={SHORE} strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d={pathL(RENO, false)} stroke={SHORE} strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d={pathL(VIA, false)} stroke="#a0845a" strokeWidth={7} strokeDasharray="16 10" fill="none" />
        {/* the cities */}
        <rect x={bo[0] - 42} y={bo[1] - 42} width={84} height={84} rx={18} fill={BOL} stroke={INK} strokeWidth={6} />
        <rect x={mo[0] - 36} y={mo[1] - 36} width={72} height={72} rx={16} fill={MODY} stroke={INK} strokeWidth={6} />
        {/* castles */}
        {m === 0 ? BORDER.map((n, i) => castle(n, "#d8cdb8", pop(t, 6 + i * 4))) : null}
        {m === 1 ? ["Bazzano", "Savigno"].map((n, i) => castle(n, BOL, pop(t, at([11, i ? "savigno" : "bazzano"], c)))) : null}
        {m >= 2 && m <= 4 ? castle("Monteveglio", m === 2 ? MODY : MODY, m === 2 ? pop(t, 4) : 1) : null}
        {m === 3 ? <path d={route([[11.06, 44.47], [11.0, 44.46], [10.968, 44.456]], a)} stroke={MOD} strokeWidth={10} strokeDasharray="22 12" fill="none" markerEnd="url(#bkTip)" /> : null}
        {m === 4 ? <>
          <ellipse cx={PL(L.Zappolino)[0]} cy={PL(L.Zappolino)[1] + 30} rx={110} ry={46} fill={BOL} opacity={0.55} stroke={BOL} strokeWidth={4} />
          <path d={route([[11.0, 44.53], [11.04, 44.515], [11.07, 44.506]], a)} stroke={MOD} strokeWidth={12} fill="none" markerEnd="url(#bkTip)" />
          <path d={route([[11.0, 44.53], [11.06, 44.535], [11.12, 44.52], [11.11, 44.505]], ease(k(t, at([37, "horsemen"], c), 20)))} stroke={MOD} strokeWidth={8} strokeDasharray="16 10" fill="none" markerEnd="url(#bkTip)" />
          {castle("Zappolino", "#d8cdb8", 1)}</> : null}
        {m >= 5 ? <path d={route(CHASE, m === 5 ? a : 1)} stroke={MOD} strokeWidth={12} fill="none" markerEnd="url(#bkTip)" /> : null}
        {m === 6 ? WRECK.map((n, i) => castle(n, "#d8cdb8", pop(t, at([42, n.toLowerCase()], c)), true)) : null}
        {m === 6 ? (() => { const p = PL(L.Casalecchio), s = pop(t, at([42, "weir"], c)); return s > 0 ? <g transform={`translate(${p[0]} ${p[1]}) scale(${s})`}><rect x={-26} y={-8} width={52} height={16} fill="#c8bca8" stroke={INK} strokeWidth={5} /><path d="M-30 -22 L30 22 M30 -22 L-30 22" stroke={RED} strokeWidth={8} strokeLinecap="round" /></g> : null; })() : null}
      </svg>
      <Tag x={bo[0] - 30} y={bo[1] - 92} text="Bologna" col={BOL} s={1} size={44} />
      <Tag x={mo[0] + 40} y={mo[1] - 86} text="Modena" col={MOD} s={1} size={44} />
      <At x={PL([10.93, 44.39])[0] - 90} y={PL([10.93, 44.39])[1]} s={1}><T size={30} col="#2a5a7a" up={false}>Panaro</T></At>
      <At x={PL([11.25, 44.36])[0] + 70} y={PL([11.25, 44.36])[1]} s={1}><T size={30} col="#2a5a7a" up={false}>Reno</T></At>
      {m === 0 ? <Tag x={PL(L.Crespellano)[0] + 40} y={PL(L.Crespellano)[1] - 110} text="border castles" col={INK} s={pop(t, 14)} /> : null}
      {m === 1 ? <><Tag x={PL(L.Bazzano)[0] + 160} y={PL(L.Bazzano)[1] - 60} text="Bazzano" col={BOL} s={pop(t, at([11, "bazzano"], c))} size={34} /><Tag x={PL(L.Savigno)[0] + 160} y={PL(L.Savigno)[1] - 50} text="Savigno" col={BOL} s={pop(t, at([11, "savigno"], c))} size={34} /><Tag x={960} y={220} text="1296: taken by Bologna" col={BOL} s={pop(t, 4)} size={44} /></> : null}
      {m === 2 ? <Tag x={PL(L.Monteveglio)[0] + 40} y={PL(L.Monteveglio)[1] + 90} text="Monteveglio" col={BOL} s={pop(t, 6)} size={42} /> : null}
      {m === 3 ? <><Tag x={PL(L.Marano)[0] - 40} y={PL(L.Marano)[1] + 90} text="Marano: the fake attack" col={MOD} s={pop(t, at([30, "marano"], c))} size={36} /><Tag x={960} y={220} text="the night before" col={INK} s={pop(t, 4)} size={44} /></> : null}
      {m === 4 ? <><Tag x={PL(L.Zappolino)[0] + 40} y={PL(L.Zappolino)[1] - 90} text="Zappolino" col={INK} s={pop(t, 4)} size={42} /><Tag x={PL(L.Zappolino)[0] + 300} y={PL(L.Zappolino)[1] + 60} text="Bologna's army" col={BOL} s={pop(t, 10)} size={34} /></> : null}
      {m === 5 ? <Tag x={960} y={220} text="the chase: all the way to Bologna" col={MOD} s={pop(t, 4)} size={44} /> : null}
      {m === 6 ? <Tag x={PL(L.Casalecchio)[0] + 20} y={PL(L.Casalecchio)[1] + 92} text="the weir: broken" col={RED} s={pop(t, at([42, "weir"], c))} size={34} /> : null}
    </Mv></Paper>
  );
};

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  title: say([{ s: "THE WAR OF THE BUCKET", size: 150, col: RED }, { s: "Bologna vs. Modena, 1325", cue: [3, "real"], size: 80 }], { dark: true, m: 0, y: 520 }),
  // ---------------- two cities ----------------
  region: Region, local: Local,
  split: say([{ s: "Italy, split in two", size: 120 }, { s: "GUELPHS: the Pope", cue: [8, "guelphs"], col: BOL, size: 110 }, { s: "GHIBELLINES: the Emperor", cue: [8, "ghibellines"], col: MOD, size: 100 }], { m: 2 }),
  sides: say([{ s: "Bologna: Guelph", size: 130, col: BOL }, { s: "Modena: Ghibelline", cue: [9, "modena"], size: 130, col: MOD }], { m: 4 }),
  // ---------------- the rebel ----------------
  indulge: say([{ s: "Harm Bonacolsi...", size: 130 }, { s: "...and your sins", cue: [15, "indulgence"], size: 120 }, { s: "are forgiven", cue: [15, "forgiveness"], col: RED, size: 140 }], { dark: true, m: 4 }),
  // ---------------- a castle, not a bucket ----------------
  raids: checks([{ s: "July: fields raided" }, { s: "August: two weeks of raids", cue: 14 }, { s: "September: ???", cue: 28 }], { size: 84 }),
  notbucket: say([{ s: "Not over a bucket.", size: 140 }, { s: "Over a castle.", cue: [22, "castle"], col: RED, size: 160 }], { dark: true, m: 4 }),
  // ---------------- 30,000 vs 7,000 ----------------
  bolo: checks([{ s: "Bologna's own militia" }, { s: "Allies: Florence and Romagna", cue: [23, "florence"] }, { s: "Hired: Malatesta of Rimini", cue: [23, "malatesta"] }], { top: "Bologna's army", topCol: BOL, size: 74 }),
  n30: num("30,000", "on foot (the usual figure)", { col: BOL, m: 4, sub: "+ a couple of thousand on horseback", subCue: [24, "couple"] }),
  n7: num("~7,000", "Modena's side", { col: MOD, m: 4 }),
  allies: checks([{ s: "German pros, from Milan" }, { s: "Mantua", cue: [27, "mantua"] }, { s: "Ferrara", cue: [27, "ferrara"] }], { top: "Modena's side", topCol: MOD, size: 80 }),
  // ---------------- the trick ----------------
  cheats: say([{ s: "Can't win a fair fight?", size: 120 }, { s: "Cheat.", cue: [29, "cheats"], col: RED, size: 200 }], { dark: true, m: 4 }),
  fooled: say([{ s: "Fooled.", size: 200, col: RED }, { s: "Call the men back!", cue: [32, "calling"], size: 110 }], { m: 4 }),
  // ---------------- zappolino ----------------
  n2000: num("~2,000", "killed or wounded", { col: RED, m: 4, sub: "most of them Bolognese", subCue: [39, "most"] }),
  griffoni: num("1,000+", "Bolognese dead", { col: BOL, m: 2, top: "Matteo Griffoni, Bologna's chronicler" }),
  // ---------------- the race and the bucket ----------------
  shame: say([{ s: "\"...to the eternal shame", size: 120 }, { s: "of Bologna\"", cue: [45, "bologna"], col: RED, size: 140 }], { dark: true, m: 0 }),
  n26: num("26", "nobles taken prisoner", { col: MOD, m: 4, size: 330 }),
  // ---------------- the peace ----------------
  stops: say([{ s: "And then...", size: 130 }, { s: "the war just stops.", cue: [49, "war"], col: RED, size: 130 }], { dark: true, m: 0 }),
  peace: checks([{ s: "Monteveglio: back to Bologna" }, { s: "The other castles: back", cue: [50, "castles"] }, { s: "Prisoners: home in 11 weeks", cue: [51, "prisoners"] }], { top: "January 1326: peace", topCol: "#2f9a57", size: 74 }),
  paper: say([{ s: "On paper:", size: 120 }, { s: "right back", cue: [52, "right"], col: RED, size: 130 }, { s: "where it started", cue: [52, "where"], col: RED, size: 120 }], { m: 2 }),
  won: say([{ s: "Modena won:", size: 120 }, { s: "a victory", cue: [53, "victory"], size: 130 }, { s: "and a bucket", cue: [53, "bucket"], col: "#c0702a", size: 150 }], { dark: true, m: 4 }),
  // ---------------- how a joke became history ----------------
  gods: say([{ s: "In the poem:", size: 110 }, { s: "the bucket starts the war", cue: [56, "stealing"], col: RED, size: 110 }, { s: "even the gods take sides", cue: [56, "gods"], size: 100 }], { m: 2 }),
  salieri: checks([{ s: "1622: printed" }, { s: "Translated", cue: [58, "translated"] }, { s: "1772: Salieri's opera", cue: [58, "opera"] }], { top: "A very popular joke", topCol: RED, size: 76 }),
  legend: say([{ s: "\"Two cities went to war", size: 110 }, { s: "over a stolen bucket\"", cue: [59, "stolen"], col: RED, size: 120 }], { dark: true, m: 0 }),
  // ---------------- where it is today ----------------
  today: checks([{ s: "Original: the town hall" }, { s: "Copy: the bell tower", cue: [62, "copy"] }], { top: "Today", topCol: MOD, size: 74 }),
  // kept left of x ~1400: the subscribe card and mascot may still be on the right when this board comes in
  question: ({ t, d, c }) => (
    <Paper tone="#141a2a"><Mv t={t} d={d} m={4}>
      <At x={620} y={330} s={pop(t, 0)}><T size={84} col="#fff">If you were Bologna...</T></At>
      <At x={620} y={500} s={pop(t, at([64, "would"], c))}><T size={72} col="#ffb347">would you want it back?</T></At>
    </Mv></Paper>
  ),
};
