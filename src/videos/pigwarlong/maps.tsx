// Hand-drawn maps for the Pig War long-form (drawn in code: no map textures to license). Four bases:
//  WIDE    the Oregon Country, the Rockies and the 49th parallel;
//  STRAIT  Vancouver Island, the San Juan Islands, Haro and Rosario straits (the treaty's "channel");
//  ISLAND  San Juan Island alone: English Camp (north), American Camp (south), the road;
//  AMERICAS New York, Panama and the Pacific Northwest (news by ship, Scott's six-week trip).
// Boards are keyed "map:<base>:<step>"; the step builds on the narration. Content stays above y = 800.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, G, FONT, At, T, k, pop, ease, easeOut, lerp, clamp01 } from "./kit";

const SEA = "#a9c9d8", SEA_D = "#8fb6c9", LAND = "#efe3c2", LAND2 = "#e4d4ab", INK = C.ink;
export const US_T = "rgba(47,95,181,0.42)", UK_T = "rgba(201,55,58,0.42)", MIX_T = "rgba(128,70,160,0.32)";

/** view: scale and focus point (frame px), eased between two views over the shot */
type View = [number, number, number];
const Viewport: React.FC<{ t: number; d: number; from: View; to: View; children: React.ReactNode }> = ({ t, d, from, to, children }) => {
  const u = ease(t / Math.max(1, d));
  const s = lerp(from[0], to[0], u), x = lerp(from[1], to[1], u), y = lerp(from[2], to[2], u);
  // keep (x, y) at the frame's centre (slightly above, captions own the bottom)
  return (
    <AbsoluteFill style={{ background: SEA, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${960 - x * s}px, ${470 - y * s}px) scale(${s})` }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
const Waves: React.FC<{ seed?: number }> = ({ seed = 0 }) => (
  <g opacity={0.35}>
    {Array.from({ length: 46 }, (_, i) => {
      const x = ((i * 397 + seed * 131) % 2100) - 90, y = ((i * 211 + seed * 71) % 1160) - 40;
      return <path key={i} d={`M${x} ${y} q 14 -10 28 0 t 28 0`} stroke="#ffffff" strokeWidth={3} fill="none" strokeLinecap="round" />;
    })}
  </g>
);
const Label: React.FC<{ x: number; y: number; text: string; size?: number; col?: string; o?: number; sp?: number; r?: number; italic?: boolean }> =
  ({ x, y, text, size = 34, col = INK, o = 1, sp = 8, r = 0, italic = false }) => (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={col} opacity={o} letterSpacing={sp}
      transform={r ? `rotate(${r} ${x} ${y})` : undefined} fontStyle={italic ? "italic" : "normal"}>{text}</text>
  );
const Pin: React.FC<{ x: number; y: number; s: number; col?: string; label?: string; lx?: number; ly?: number; size?: number }> = ({ x, y, s, col = C.red, label, lx = 0, ly = -46, size = 34 }) => s <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={16} fill={col} stroke={INK} strokeWidth={6} />
    {label ? <g><rect x={lx - label.length * size * 0.36 - 16} y={ly - size * 0.95} width={label.length * size * 0.72 + 32} height={size * 1.3} rx={10} fill="#fffaf0" stroke={INK} strokeWidth={5} />
      <text x={lx} y={ly} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={INK}>{label}</text></g> : null}
  </g>
);
/** a path drawn on over u (0..1), using pathLength so no measuring is needed */
const Draw: React.FC<{ d: string; u: number; col: string; w: number; dash?: string; cap?: "round" | "butt" }> = ({ d, u, col, w, dash, cap = "round" }) => u <= 0 ? null : (
  dash
    ? <g><mask id={`m${d.length}${w}`}><path d={d} pathLength={1} stroke="#fff" strokeWidth={w + 4} fill="none" strokeDasharray={`${u} 1`} /></mask>
      <path d={d} stroke={col} strokeWidth={w} fill="none" strokeDasharray={dash} strokeLinecap={cap} mask={`url(#m${d.length}${w})`} /></g>
    : <path d={d} pathLength={1} stroke={col} strokeWidth={w} fill="none" strokeDasharray={`${u} 1`} strokeLinecap={cap} strokeLinejoin="round" />
);

// ---------------- WIDE: the Oregon Country ----------------
// x: Pacific on the left, coast ~x 560, Rockies ~x 1300; y: 54°40' at 170, 49° at 470, 42° at 880.
const COAST = "M520 -60 L560 60 L600 140 L590 230 L640 300 L660 380 L700 430 L740 470 L720 520 L660 560 L640 640 L620 720 L600 800 L590 880 L600 980 L620 1140";
const WIDE_LAND = COAST + " L2000 1140 L2000 -60 Z";
const VI_WIDE = "M455 330 L500 350 L560 400 L610 440 L650 470 L680 500 L660 515 L610 505 L560 480 L500 440 L455 395 L430 360 Z";
const OREGON = "M600 170 L1270 170 L1300 470 L1330 880 L590 880 L600 800 L620 720 L640 640 L660 560 L720 520 L740 470 L700 430 L660 380 L640 300 L590 230 Z";
const NORTH = "M600 170 L1270 170 L1300 470 L740 470 L700 430 L660 380 L640 300 L590 230 Z";
const SOUTH = "M740 470 L1300 470 L1330 880 L590 880 L600 800 L620 720 L640 640 L660 560 L720 520 Z";
const WideBase: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
    <rect x={-400} y={-300} width={2700} height={1700} fill={SEA} />
    <Waves />
    <path d={WIDE_LAND} fill={LAND} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={VI_WIDE} fill={LAND} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {/* the Rockies */}
    {Array.from({ length: 16 }, (_, i) => { const x = 1240 + i * 6 + (i % 2) * 22, y = 120 + i * 56; return <path key={i} d={`M${x - 34} ${y + 30} L${x} ${y - 24} L${x + 34} ${y + 30}`} fill={LAND2} stroke={INK} strokeWidth={4} strokeLinejoin="round" />; })}
    <Label x={260} y={700} text="PACIFIC OCEAN" size={40} col="#5d87a6" sp={10} />
    <Label x={1560} y={300} text="ROCKY MTNS" size={30} col="#8b7a5a" sp={8} r={-6} o={0.8} />
    {children}
  </svg>
);
const wideMap = (t: number, d: number, c: G["c"], v: number) => {
  // v0: shared Oregon Country; v1: 1846, the deal; v2: the line west along the 49th; water0: the line hits the water; water1: bends south
  const share = v === 0 ? ease(k(t, 4, 16)) : 1;
  const split = v >= 1 ? (v === 1 ? ease(k(t, c(15, "split") - 2, 14)) : 1) : 0;
  const line = v === 2 ? easeOut(k(t, c(17, "line") - 4, Math.max(20, c(17, "ocean") - c(17, "line") + 6))) : v > 2 ? 1 : 0;
  return (
    <WideBase>
      <path d={OREGON} fill={MIX_T} opacity={share * (1 - split)} />
      <path d={NORTH} fill={UK_T} opacity={split} />
      <path d={SOUTH} fill={US_T} opacity={split} />
      <Label x={960} y={600} text="OREGON COUNTRY" size={64} sp={14} o={share * (1 - split)} />
      <Label x={960} y={330} text="BRITISH" size={58} sp={14} col="#8a1f22" o={split} />
      <Label x={960} y={700} text="AMERICAN" size={58} sp={14} col="#1f3f8f" o={split} />
      <g opacity={share * (1 - split)}>
        <Label x={470} y={160} text="SHARED BY" size={30} sp={6} />
        <g transform="translate(470 210)"><rect x={-130} y={-30} width={120} height={60} rx={8} fill={C.blue} stroke={INK} strokeWidth={5} /><rect x={10} y={-30} width={120} height={60} rx={8} fill={C.red} stroke={INK} strokeWidth={5} />
          <text x={-70} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">USA</text><text x={70} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">UK</text></g>
      </g>
      {v === 1 ? <g transform={`translate(1640 640) scale(${pop(t, c(15, "1846") - 4, 10)})`}><rect x={-150} y={-70} width={300} height={140} rx={16} fill="#fffaf0" stroke={INK} strokeWidth={7} /><text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={C.red}>1846</text></g> : null}
      {/* the 49th parallel, drawn from the Rockies west to the ocean */}
      <Draw d="M1900 470 L1300 470 L740 470" u={line} col={C.red} w={14} />
      {line > 0 ? <Label x={1610} y={450} text="49TH PARALLEL" size={36} col={C.red} sp={6} o={k(t, 6, 10)} /> : null}
    </WideBase>
  );
};

// ---------------- STRAIT: the channel(s) ----------------
const VI = "M-80 -80 L520 -80 L560 120 L610 260 L680 400 L740 520 L770 600 L740 670 L660 720 L520 750 L360 780 L180 800 L-80 820 Z";
const MAIN = "M1150 -80 L1990 -80 L1990 1160 L1180 1160 L1170 1060 L1220 960 L1280 860 L1260 760 L1300 640 L1270 540 L1250 450 L1230 390 L1200 330 L1160 200 L1130 80 Z";
const OLY = "M-80 1160 L-80 900 L200 880 L460 870 L700 880 L900 900 L1040 940 L1120 1000 L1180 1160 Z";
const SAN_JUAN = "M850 520 L905 540 L950 590 L985 650 L1000 710 L980 735 L930 705 L890 650 L860 600 L838 555 Z";
const ORCAS = "M1000 470 L1060 460 L1110 490 L1120 540 L1080 560 L1060 520 L1040 560 L1000 545 L990 505 Z";
const LOPEZ = "M1030 600 L1065 590 L1090 640 L1095 700 L1075 750 L1045 720 L1035 660 Z";
const SMALL = ["M940 470 L975 465 L985 495 L950 500 Z", "M900 470 L925 462 L930 490 L905 494 Z", "M1120 600 L1150 590 L1160 630 L1130 640 Z", "M1110 440 L1140 432 L1150 456 L1120 462 Z"];
const ISLANDS = [SAN_JUAN, ORCAS, LOPEZ, ...SMALL];
export const HARO = "M820 250 C800 360 790 450 800 560 C808 660 800 760 780 830 C700 870 500 860 -80 860";
export const ROSARIO = "M1170 250 C1180 360 1190 450 1180 560 C1172 660 1180 760 1160 830 C1000 880 600 880 -80 880";
/** the 49th parallel's run across the mainland to the water */
const P49 = "M1990 360 L1215 360 L1000 360";
const StraitBase: React.FC<{ isl?: string; children?: React.ReactNode; labels?: number; today?: boolean }> = ({ isl = LAND, children, labels = 1, today = false }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
    <rect x={-400} y={-300} width={2700} height={1700} fill={SEA} />
    <Waves seed={2} />
    <path d={VI} fill={LAND} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={MAIN} fill={LAND} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={OLY} fill={LAND} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {ISLANDS.map((p, i) => <path key={i} d={p} fill={isl} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
    {labels ? <g>
      <Label x={250} y={360} text="VANCOUVER" size={44} sp={10} o={0.8} />
      <Label x={250} y={412} text="ISLAND" size={44} sp={10} o={0.8} />
      <Label x={1640} y={210} text={today ? "CANADA" : "MAINLAND"} size={44} sp={10} o={0.8} />
      <Label x={1640} y={720} text={today ? "USA" : ""} size={44} sp={10} o={0.8} />
      <Label x={480} y={950} text={today ? "" : "STRAIT OF JUAN DE FUCA"} size={28} sp={6} col="#5d87a6" />
      <Label x={950} y={160} text={"STRAIT OF GEORGIA"} size={28} sp={6} col="#5d87a6" />
    </g> : null}
    {children}
  </svg>
);
const islandsCenter: [number, number] = [975, 610];
const straitMap = (name: string, t: number, d: number, c: G["c"], v: number) => {
  if (name === "water") {
    // the line arrives over the mainland and stops at the water; then Vancouver Island glows and the line bends south
    const ln = v === 0 ? easeOut(k(t, 0, 26)) : 1, glow = v === 1 ? ease(k(t, c(19, "Vancouver") - 2, 12)) : 0;
    const bend = v === 1 ? easeOut(k(t, c(20, "south") - 6, 26)) : 0;
    return (
      <StraitBase>
        <path d={VI} fill={UK_T} opacity={glow} />
        <Draw d={P49} u={ln} col={C.red} w={14} />
        {v === 0 ? <g transform={`translate(960 360) scale(${pop(t, c(18, "water") - 2, 10)})`}><circle r={54} fill="#fffaf0" stroke={INK} strokeWidth={7} /><text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={C.red}>?</text></g> : null}
        {v === 1 ? <g opacity={glow}><Label x={300} y={520} text="BRITAIN WANTS" size={40} col="#8a1f22" sp={6} /><Label x={300} y={566} text="ALL OF IT" size={40} col="#8a1f22" sp={6} /></g> : null}
        <Draw d="M1000 360 C 900 420 870 520 900 620 C 920 700 860 780 700 860" u={bend} col={C.red} w={12} dash="2 26" />
        {bend > 0.6 ? <Label x={1000} y={300} text="“THE MIDDLE OF THE CHANNEL”" size={34} sp={4} col={C.red} o={k(t, c(20, "middle"), 10)} /> : null}
      </StraitBase>
    );
  }
  if (name === "straits") {
    // v0: one problem -> two channels; v1 Haro; v2 Rosario; v3 islands; v4 Haro wide & deep; v5 Rosario the shipping lane
    const two = v === 0 ? ease(k(t, c(24, "two") - 4, 16)) : 1;
    const haroHi = v === 1 ? ease(k(t, 0, 12)) : v === 4 ? 1 : 0, rosHi = v === 2 ? ease(k(t, 0, 12)) : v === 5 ? 1 : 0;
    const isl = v === 3 ? ease(k(t, c(27, "San") - 4, 12)) : 0;
    return (
      <StraitBase>
        <Draw d={HARO} u={two} col={v === 4 || v === 1 ? C.blue : "#4d7da0"} w={v === 4 ? 58 : 30} />
        <Draw d={ROSARIO} u={two} col={v === 5 || v === 2 ? C.red : "#4d7da0"} w={v === 5 ? 22 : 30} />
        {v === 0 ? <g transform={`translate(1500 600) scale(${pop(t, 0, 10)})`}><rect x={-250} y={-90} width={500} height={170} rx={16} fill="#fffaf0" stroke={INK} strokeWidth={7} />
          <text y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>ONE PROBLEM</text>
          <text y={48} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={C.red} opacity={two}>TWO CHANNELS</text></g> : null}
        <g opacity={v === 0 ? two : 1}>
          <g transform={`translate(700 460) scale(${1 + 0.15 * haroHi})`}><rect x={-120} y={-40} width={240} height={64} rx={10} fill={haroHi > 0.5 ? C.blue : "#fffaf0"} stroke={INK} strokeWidth={6} />
            <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={haroHi > 0.5 ? "#fff" : INK}>HARO</text></g>
          <g transform={`translate(1310 300) scale(${1 + 0.15 * rosHi})`}><rect x={-150} y={-40} width={300} height={64} rx={10} fill={rosHi > 0.5 ? C.red : "#fffaf0"} stroke={INK} strokeWidth={6} />
            <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={rosHi > 0.5 ? "#fff" : INK}>ROSARIO</text></g>
        </g>
        {v === 1 ? <Label x={560} y={560} text="◀ WEST" size={40} col={C.blue} sp={6} o={k(t, 6, 10)} /> : null}
        {v === 2 ? <Label x={1420} y={560} text="EAST ▶" size={40} col={C.red} sp={6} o={k(t, 6, 10)} /> : null}
        {ISLANDS.map((p, i) => <path key={i} d={p} fill={C.yellow} opacity={isl} />)}
        {v === 3 ? <g opacity={isl}><Label x={975} y={820} text="SAN JUAN ISLANDS" size={44} sp={8} /></g> : null}
        {v === 4 ? <g>
          <g transform={`translate(560 600) scale(${pop(t, c(173, "widest") - 2, 10)})`}><rect x={-150} y={-46} width={300} height={74} rx={12} fill={C.blue} stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">WIDEST</text></g>
          <g transform={`translate(560 700) scale(${pop(t, c(173, "deepest") - 2, 10)})`}><rect x={-150} y={-46} width={300} height={74} rx={12} fill={C.blue} stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">DEEPEST</text></g>
        </g> : null}
        {v === 5 ? <g>{[0, 1, 2].map((i) => { const u = (t / 90 + i / 3) % 1; const y = lerp(220, 820, u); return <g key={i} transform={`translate(${1180 - 10 * Math.sin(u * 3)} ${y})`}><path d="M-22 -10 L22 -10 L14 12 L-14 12 Z" fill="#fffaf0" stroke={INK} strokeWidth={5} /><path d="M0 -10 L0 -46 L20 -16 Z" fill="#fffaf0" stroke={INK} strokeWidth={4} /></g>; })}
          <Label x={1420} y={620} text="SHIPS USED IT" size={40} col={C.red} sp={6} o={k(t, c(174, "ships") - 2, 8)} /></g> : null}
      </StraitBase>
    );
  }
  if (name === "claims") {
    // v0: America claims Haro (islands blue); v1: Britain claims Rosario (islands red); v2: both move in (arrows)
    const us = v === 0 ? ease(k(t, c(28, "Haro") - 2, 12)) : v === 2 ? 1 : 0, uk = v === 1 ? ease(k(t, c(29, "Rosario") - 2, 12)) : v === 2 ? 1 : 0;
    const half = v === 2;
    return (
      <StraitBase>
        <Draw d={HARO} u={v === 0 ? 1 : 0} col={C.blue} w={22} />
        <Draw d={ROSARIO} u={v === 1 ? 1 : 0} col={C.red} w={22} />
        {ISLANDS.map((p, i) => <path key={i} d={p} fill={half ? "#8a5ca8" : v === 0 ? C.blue : C.red} opacity={(half ? 0.7 : (v === 0 ? us : uk) * 0.85)} />)}
        {v === 0 ? <g transform={`translate(${islandsCenter[0]} 860) scale(${pop(t, c(28, "American") - 2, 10)})`}><rect x={-230} y={-48} width={460} height={76} rx={12} fill={C.blue} stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">AMERICAN</text></g> : null}
        {v === 1 ? <g transform={`translate(${islandsCenter[0]} 860) scale(${pop(t, c(29, "British") - 2, 10)})`}><rect x={-200} y={-48} width={400} height={76} rx={12} fill={C.red} stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">BRITISH</text></g> : null}
        {v === 2 ? <g>
          <Pin x={960} y={690} s={pop(t, 4, 10)} col={C.red} label="HBC FARM" lx={-150} ly={60} size={30} />
          <Pin x={900} y={600} s={pop(t, 10, 10)} col={C.blue} label="U.S. SETTLERS" lx={-200} ly={-40} size={30} />
        </g> : null}
      </StraitBase>
    );
  }
  if (name === "victoria") {
    const pin = pop(t, c(79, "Victoria") - 4, 10);
    return (
      <StraitBase>
        <Pin x={700} y={690} s={pin} col={C.red} label="VICTORIA" lx={0} ly={-50} size={36} />
        <Pin x={930} y={690} s={pop(t, 4, 10)} col={C.blue} label="PICKETT" lx={60} ly={74} size={30} />
        <Draw d="M720 690 C 780 660 860 660 910 690" u={easeOut(k(t, c(79, "furious") - 6, 14))} col={C.red} w={10} dash="4 20" />
      </StraitBase>
    );
  }
  if (name === "ruling") {
    // v0: the Kaiser's line runs down Haro; v1: the islands turn blue
    const ln = v === 0 ? easeOut(k(t, c(176, "Haro") - 6, 40)) : 1, isl = v === 1 ? ease(k(t, c(177, "United") - 4, 14)) : 0;
    return (
      <StraitBase>
        <Draw d={P49} u={1} col={C.ink} w={10} />
        <Draw d={"M1000 360 C 900 330 830 300 820 250 " + HARO.slice(HARO.indexOf("C800 360"))} u={ln} col={C.blue} w={18} />
        {ISLANDS.map((p, i) => <path key={i} d={p} fill={C.blue} opacity={isl * 0.85} />)}
        {v === 0 ? <g transform={`translate(560 460) scale(${pop(t, c(176, "Haro") + 4, 10)})`}><rect x={-150} y={-46} width={300} height={74} rx={12} fill={C.blue} stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">HARO ✓</text></g> : null}
        {v === 1 ? <g transform={`translate(${islandsCenter[0]} 860) scale(${pop(t, c(177, "United") - 2, 10)})`}><rect x={-260} y={-48} width={520} height={76} rx={12} fill={C.blue} stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">UNITED STATES</text></g> : null}
      </StraitBase>
    );
  }
  // today: the same line is the US–Canada border
  const ln = v === 0 ? easeOut(k(t, 4, 40)) : 1, tag = v === 1 ? pop(t, c(192, "border") - 4, 10) : 0;
  const BORDER = "M1990 360 L1000 360 C 900 330 830 300 820 250 " + HARO.slice(HARO.indexOf("C800 360"));
  return (
    <StraitBase today>
      <path d={"M1990 360 L1000 360 C 900 330 830 300 820 250 L -80 250 L -80 -80 L 1990 -80 Z"} fill="rgba(201,55,58,0.10)" />
      <Draw d={BORDER} u={ln} col={C.ink} w={12} dash="30 18" cap="butt" />
      {ISLANDS.map((p, i) => <path key={i} d={p} fill={C.blue} opacity={0.35} />)}
      <g transform={`translate(1500 470) scale(${tag})`}><rect x={-300} y={-50} width={600} height={80} rx={12} fill="#fffaf0" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>STILL THE BORDER</text></g>
      <g transform={`translate(1500 120) scale(${pop(t, 2, 10)})`}><rect x={-120} y={-44} width={240} height={70} rx={12} fill={C.red} stroke={INK} strokeWidth={6} /><text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#fff">TODAY</text></g>
    </StraitBase>
  );
};

// ---------------- ISLAND: San Juan Island and its two camps ----------------
const SJI = "M470 210 L590 150 L720 165 L830 225 L930 295 L1010 375 L1080 445 L1180 515 L1300 595 L1420 665 L1540 725 L1605 785 L1545 812 L1420 782 L1300 744 L1180 724 L1060 704 L940 664 L820 624 L700 566 L600 486 L515 404 L465 310 Z";
const GARRISON = "M466 300 C 500 290 540 310 545 335 C 548 360 515 372 480 360 Z";
const EC: [number, number] = [535, 335], AC: [number, number] = [1430, 770];
const ROAD = "M535 335 C 650 420 780 500 920 560 C 1080 620 1260 670 1430 770";
const islandMap = (t: number, d: number, c: G["c"], v: number) => {
  // v0 English Camp (north, sheltered bay); v1 American Camp (south); v2 13 miles; v3 the road between them
  const ec = v === 0 ? pop(t, 8, 10) : 1, ac = v === 1 ? pop(t, c(140, "American") - 4, 10) : v > 1 ? 1 : 0;
  const miles = v === 2 ? easeOut(k(t, 0, 20)) : 0, road = v === 3 ? easeOut(k(t, c(147, "road") - 4, 40)) : 0;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
      <rect x={-400} y={-300} width={2700} height={1700} fill={SEA} />
      <Waves seed={5} />
      <path d={SJI} fill={LAND} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d={GARRISON} fill={SEA} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 26 }, (_, i) => { const x = 600 + i * 34 + (i % 3) * 10, y = 250 + i * 17 + ((i * 37) % 120); return <g key={i} transform={`translate(${x} ${y})`} opacity={0.55}><path d="M0 -26 L14 6 L-14 6 Z" fill="#5f8a55" /><rect x={-3} y={6} width={6} height={8} fill="#6b4a2f" /></g>; })}
      <Label x={1120} y={540} text="SAN JUAN ISLAND" size={40} sp={10} o={0.7} r={30} />
      <Label x={330} y={160} text="▲ NORTH" size={32} sp={6} col="#5d87a6" />
      <Draw d={ROAD} u={road} col="#8a5a3a" w={12} dash="18 14" />
      {v === 2 ? <g>
        <Draw d={"M535 335 L1430 770"} u={miles} col={C.ink} w={8} dash="6 18" />
        <g transform={`translate(1040 470) scale(${pop(t, 8, 10)})`}><rect x={-160} y={-50} width={320} height={84} rx={14} fill={C.yellow} stroke={INK} strokeWidth={7} /><text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>13 MILES</text></g>
      </g> : null}
      <Pin x={EC[0]} y={EC[1]} s={ec} col={C.red} label="ENGLISH CAMP" lx={10} ly={-56} size={36} />
      <Pin x={AC[0]} y={AC[1]} s={ac} col={C.blue} label="AMERICAN CAMP" lx={-120} ly={-60} size={36} />
    </svg>
  );
};

// ---------------- AMERICAS: news by ship; Scott's route ----------------
// projected from rough lon/lat coastline points: x = 240 + (lon + 140) * 16, y = (58 - lat) * 17
const NA = "M240 -68 L320 0 L368 51 L400 60 L432 110 L440 128 L480 156 L486 165 L494 196 L494 238 L491 272 L499 306 L520 343 L530 366 L550 400 L584 408 L605 430 L621 468 L645 510 L680 544 L720 595 L728 575 L701 527 L669 471 L643 450 L675 484 L707 522 L738 552 L790 604 L792 638 L816 663 L880 697 L944 719 L1000 740 L1072 762 L1104 782 L1109 816 L1136 833 L1168 847 L1200 860 L1216 843 L1240 845 L1238 833 L1208 826 L1176 833 L1144 801 L1144 731 L1072 717 L1064 688 L1080 620 L1034 629 L1016 672 L968 677 L925 638 L917 578 L922 513 L968 484 L1040 491 L1056 471 L1120 479 L1152 493 L1157 518 L1171 544 L1194 559 L1200 530 L1179 468 L1184 442 L1216 413 L1264 388 L1264 357 L1272 332 L1296 298 L1344 280 L1360 272 L1349 255 L1408 224 L1424 221 L1456 212 L1504 212 L1520 196 L1448 153 L1424 133 L1520 128 L1584 110 L1560 60 L1504 17 L1456 -34 L1456 -68 Z";
const SA = "M1240 845 L1248 857 L1240 918 L1200 978 L1184 1037 L1168 1122 L1840 1122 L1840 1037 L1680 986 L1648 901 L1568 884 L1520 842 L1488 804 L1392 806 L1336 775 L1280 808 L1251 835 Z";
const CUBA = "M1120 614 L1168 593 L1200 593 L1248 620 L1293 643 L1240 648 L1200 617 L1152 612 Z";
const VI_AM = "M426 122 L440 134 L472 155 L486 163 L506 165 L499 151 L474 134 L434 121 Z";
const ROUTE = "M1296 298 L1328 374 L1288 459 L1232 518 L1256 592 L1286 649 L1264 731 L1202 823 L1210 835 L1168 870 L1040 782 L880 726 L776 646 L704 578 L632 502 L576 425 L504 347 L474 255 L477 173 L502 166";
const NEWS = "M502 166 L477 173 L474 255 L504 347 L576 425 L632 502 L704 578 L776 646 L880 726 L1040 782 L1168 870 L1210 835";
const TELE = ["M1296 294 L1200 299 L1078 274 L1037 330 L966 321", "M1248 325 L1128 321 L1037 330", "M1248 325 L1200 391 L1130 413 L1040 476", "M1296 294 L1344 267"];
const TELE_END: [number, number][] = [[966, 321], [1037, 330], [1040, 476]];
const PNW: [number, number] = [510, 162], NY: [number, number] = [1296, 294], PAN: [number, number] = [1206, 831];
const americasMap = (name: string, t: number, d: number, c: G["c"], v: number) => {
  const tele = name === "telegraph";
  const nu = v === 1 ? easeOut(k(t, 2, Math.max(30, d - 8))) : 0;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
      <rect x={-400} y={-300} width={2700} height={1700} fill={SEA} />
      <Waves seed={7} />
      <path d={NA} fill={LAND} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={SA} fill={LAND} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={CUBA} fill={LAND} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={VI_AM} fill={LAND} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Label x={880} y={360} text="UNITED STATES" size={44} sp={14} o={0.5} />
      <Label x={300} y={620} text="PACIFIC" size={36} sp={10} col="#5d87a6" />
      <Label x={1560} y={520} text="ATLANTIC" size={36} sp={10} col="#5d87a6" />
      {tele ? <g>
        {TELE.map((p, i) => <Draw key={i} d={p} u={easeOut(k(t, i * 4, 22))} col="#6b4a2f" w={7} dash="14 10" />)}
        {TELE_END.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill="#6b4a2f" opacity={k(t, 24, 8)} />)}
        <g transform={`translate(720 250) scale(${pop(t, c(116, "telegraph") - 2, 10)})`}><rect x={-220} y={-48} width={440} height={80} rx={14} fill="#fffaf0" stroke={INK} strokeWidth={7} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.red}>NO TELEGRAPH</text></g>
        <Pin x={PNW[0]} y={PNW[1]} s={pop(t, 2, 10)} col={C.red} label="SAN JUAN" lx={0} ly={-40} size={30} />
        {v === 1 ? <g>
          <Draw d={NEWS} u={nu} col={C.blue} w={9} dash="4 18" />
          <g transform={`translate(560 600) scale(${pop(t, c(117, "ship") - 2, 10)})`}><rect x={-200} y={-46} width={400} height={76} rx={12} fill={C.yellow} stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>NEWS BY SHIP</text></g>
        </g> : null}
      </g> : <g>
        <Draw d={ROUTE} u={easeOut(k(t, c(128, "sailing") - 4, Math.max(40, d - c(128, "sailing"))))} col={C.blue} w={10} dash="4 18" />
        <Pin x={NY[0]} y={NY[1]} s={pop(t, c(128, "New") - 4, 10)} col={C.blue} label="NEW YORK" lx={30} ly={-46} size={30} />
        <Pin x={PAN[0]} y={PAN[1]} s={pop(t, c(128, "Panama") - 4, 10)} col={C.yellow} label="PANAMA" lx={150} ly={10} size={30} />
        <Pin x={PNW[0]} y={PNW[1]} s={pop(t, 2, 10)} col={C.red} label="SAN JUAN" lx={0} ly={-40} size={30} />
        <g transform={`translate(900 520) scale(${pop(t, c(128, "6") - 4, 10)})`}><rect x={-190} y={-60} width={380} height={100} rx={16} fill={C.red} stroke={INK} strokeWidth={7} /><text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill="#fff">6 WEEKS</text></g>
      </g>}
    </svg>
  );
};

// ---------------- the board ----------------
const VIEWS: Record<string, View[]> = {
  oregon: [[1.0, 960, 520], [1.0, 960, 520], [1.0, 960, 500]],
  water: [[1.0, 960, 520], [1.0, 900, 540]],
  straits: [[0.98, 960, 520], [1.05, 820, 540], [1.05, 1100, 540], [1.25, 975, 610], [1.05, 820, 540], [1.05, 1100, 540]],
  claims: [[1.0, 960, 540], [1.0, 960, 540], [1.0, 960, 540]],
  victoria: [[1.25, 830, 620]],
  ruling: [[1.0, 900, 540], [1.15, 960, 600]],
  today: [[0.95, 960, 540], [1.0, 960, 520]],
  camps: [[1.0, 960, 520], [1.0, 1060, 560], [0.95, 1020, 520], [1.0, 1040, 540]],
  telegraph: [[0.9, 900, 520], [0.9, 900, 540]],
  route: [[0.9, 900, 540]],
};
export const MapBoard: React.FC<G & { name: string }> = ({ name, t, d, c, v }) => {
  const vw = (VIEWS[name] ?? [[1, 960, 540]])[Math.min(v, (VIEWS[name]?.length ?? 1) - 1)];
  const from: View = [vw[0] * 1.0, vw[1], vw[2]], to: View = [vw[0] * 1.05, vw[1], vw[2]];
  const body = name === "oregon" ? wideMap(t, d, c, v) : name === "water" ? (t >= 0 ? straitMap("water", t, d, c, v) : null)
    : name === "camps" ? islandMap(t, d, c, v) : name === "telegraph" || name === "route" ? americasMap(name, t, d, c, v) : straitMap(name, t, d, c, v);
  return (
    <AbsoluteFill>
      <Viewport t={t} d={d} from={from} to={to}>{body}</Viewport>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 160px rgba(30,40,60,0.45)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
export { At, T, clamp01 };
