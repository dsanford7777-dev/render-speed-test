// Hand-drawn maps for the 60 Hz long-form (drawn in code: no map textures to license). Stylised, not survey-grade.
//  usa      the lower 48 and a strip of Canada: Pittsburgh, Niagara, Southern California, Hoover Dam
//  atlantic America's east coast, the ocean, Europe
//  lauffen  Germany close up: Lauffen to Frankfurt, 175 km
//  europe   Berlin and 50 Hz going out with AEG's generators
//  japan    Honshu split east (50) / west (60), Tokyo, Osaka, the converter stations, March 2011
//  world    who runs on which number
// Colour code everywhere: 60 Hz = blue, 50 Hz = red. Boards are keyed "map:<base>:<step>". Content stays above y = 800.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, G, FONT, k, pop, ease, easeOut, lerp, clamp01 } from "../pigwarlong/kit";

const SEA = "#a9c9d8", LAND = "#efe3c2", LAND2 = "#e0d0a8", INK = C.ink;
const B60 = "#2f5fb5", R50 = "#c9373a", P25 = "#8a55b5";
type View = [number, number, number];
/** view: scale and focus point (frame px), eased between two views over the shot, with a little roll so nothing sits still */
const Viewport: React.FC<{ t: number; d: number; from: View; to: View; roll?: [number, number]; shake?: number; snap?: boolean; children: React.ReactNode }> = ({ t, d, from, to, roll = [-0.8, 0.6], shake = 0, snap = false, children }) => {
  const u = snap ? 1 - Math.pow(2, -9 * clamp01(t / 10)) * 1 + 0.06 * ease(t / Math.max(1, d)) : ease(t / Math.max(1, d));
  const s = lerp(from[0], to[0], u), x = lerp(from[1], to[1], u), y = lerp(from[2], to[2], u), r = lerp(roll[0], roll[1], ease(t / Math.max(1, d)));
  const sx = shake * 14 * Math.sin(t * 2.9), sy = shake * 10 * Math.sin(t * 3.7 + 1);
  return (
    <AbsoluteFill style={{ background: SEA, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${x}px ${y}px`, transform: `translate(${960 - x + sx}px, ${450 - y + sy}px) scale(${s}) rotate(${r}deg)` }}>
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          <g opacity={0.35}>{Array.from({ length: 60 }, (_, i) => { const wx = ((i * 397) % 2700) - 400, wy = ((i * 211) % 1500) - 200; return <path key={i} d={`M${wx} ${wy} q 14 -10 28 0 t 28 0`} stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />; })}</g>
          {children}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
const Land: React.FC<{ d: string; fill?: string; o?: number; w?: number }> = ({ d, fill = LAND, o = 1, w = 7 }) => <path d={d} fill={fill} opacity={o} stroke={INK} strokeWidth={w} strokeLinejoin="round" />;
const Tint: React.FC<{ d: string; col: string; o: number }> = ({ d, col, o }) => o <= 0 ? null : <path d={d} fill={col} opacity={o} />;
const Label: React.FC<{ x: number; y: number; text: string; size?: number; col?: string; o?: number; bg?: string | null }> = ({ x, y, text, size = 40, col = INK, o = 1, bg = "#fffaf0" }) => o <= 0 ? null : (
  <g opacity={o}>
    {bg ? <rect x={x - text.length * size * 0.34 - 18} y={y - size * 0.82} width={text.length * size * 0.68 + 36} height={size * 1.3} rx={12} fill={bg} stroke={INK} strokeWidth={6} /> : null}
    <text x={x} y={y + size * 0.16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={col} letterSpacing={2}>{text}</text>
  </g>
);
const Pin: React.FC<{ x: number; y: number; s: number; col?: string; label?: string; lx?: number; ly?: number; size?: number; r?: number }> = ({ x, y, s, col = C.red, label, lx = 0, ly = -56, size = 36, r = 16 }) => s <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={r} fill={col} stroke={INK} strokeWidth={6} />
    {label ? <Label x={lx} y={ly} text={label} size={size} /> : null}
  </g>
);
/** a big number tag: white digits on the colour of that frequency */
const Tag: React.FC<{ x: number; y: number; n: string; col: string; s: number; size?: number; sub?: string }> = ({ x, y, n, col, s, size = 90, sub }) => s <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-n.length * size * 0.36 - 22} y={-size * 0.62} width={n.length * size * 0.72 + 44} height={size * 1.2 + (sub ? size * 0.5 : 0)} rx={16} fill={col} stroke={INK} strokeWidth={8} />
    <text x={0} y={size * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill="#fff">{n}</text>
    {sub ? <text x={0} y={size * 0.86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size * 0.34} fill="#fff" letterSpacing={3}>{sub}</text> : null}
  </g>
);
const Draw: React.FC<{ d: string; u: number; col: string; w: number; dash?: boolean }> = ({ d, u, col, w, dash }) => u <= 0 ? null : (
  <g>
    <path d={d} pathLength={1} stroke={INK} strokeWidth={w + 8} fill="none" strokeDasharray={`${u} 1`} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} pathLength={1} stroke={col} strokeWidth={w} fill="none" strokeDasharray={dash ? undefined : `${u} 1`} strokeLinecap="round" strokeLinejoin="round" opacity={dash ? u : 1} />
  </g>
);
const Burst: React.FC<{ x: number; y: number; s: number; col?: string }> = ({ x, y, s, col = C.yellow }) => s <= 0 ? null : (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -60 L14 -20 L56 -34 L28 0 L60 26 L18 24 L10 62 L-8 28 L-48 48 L-28 10 L-62 -8 L-20 -16 Z" fill={col} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
);
const Title: React.FC<{ text: string; s: number; col?: string; y?: number; size?: number }> = ({ text, s, col = C.red, y = 96, size = 58 }) => s <= 0 ? null : (
  <div style={{ position: "absolute", left: 960, top: y, transform: `translate(-50%, -50%) scale(${s})` }}>
    <div style={{ background: col, padding: "12px 40px", border: `6px solid ${INK}`, borderRadius: 10, boxShadow: `0 8px 0 ${INK}`, fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#fff", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 1 }}>{text}</div>
  </div>
);
const Wrap: React.FC<{ children: React.ReactNode; title?: React.ReactNode }> = ({ children, title }) => <AbsoluteFill>{children}{title}</AbsoluteFill>;

// ---------------- USA ----------------
const US = "M260 250 L420 235 L760 240 L1010 250 L1180 262 L1250 300 L1330 280 L1400 300 L1480 250 L1560 240 L1590 300 L1540 360 L1500 430 L1470 500 L1440 560 L1400 640 L1420 740 L1390 790 L1350 720 L1320 660 L1220 660 L1120 690 L1040 700 L980 780 L900 760 L860 690 L760 680 L640 670 L560 660 L470 650 L380 630 L320 560 L280 470 L250 360 Z";
const CANADA = "M180 60 L1700 40 L1680 200 L1560 240 L1480 250 L1400 300 L1330 280 L1250 300 L1180 262 L1010 250 L760 240 L420 235 L260 250 L200 180 Z";
const NORTH25 = "M1180 262 L1250 300 L1330 280 L1400 300 L1480 250 L1560 240 L1590 300 L1540 360 L1440 380 L1300 370 L1200 340 Z";
const CAN25 = "M1150 120 L1560 110 L1560 240 L1480 250 L1400 300 L1330 280 L1250 300 L1180 262 Z";
const SOCAL = "M318 556 L352 536 L404 556 L452 588 L470 650 L380 630 Z";
const PITT: [number, number] = [1360, 400], NIAG: [number, number] = [1385, 322], LA: [number, number] = [352, 598], HOOVER: [number, number] = [470, 548], REDL: [number, number] = [392, 606];
const UsaMap: React.FC<G> = ({ t, d, v, c }) => {
  const wide: View = [1.0, 920, 480], east: View = [1.5, 1330, 380], west: View = [2.6, 400, 590], westW: View = [1.7, 470, 560];
  const views: [View, View][] = [[east, [1.35, 1300, 340]], [[1.2, 1200, 420], wide], [[1.5, 640, 560], [2.3, 400, 600]], [[2.3, 400, 600], [2.0, 420, 590]],
    [wide, [1.35, 700, 520]], [westW, west], [[2.3, 420, 580], [2.0, 430, 575]], [west, westW], [[1.6, 560, 540], wide]];
  const [from, to] = views[v] ?? [wide, wide];
  const blue = v >= 1 ? (v === 1 ? ease(k(t, 2, Math.max(20, d - 14))) : 1) : 0;
  const so = v >= 4;                                       // Southern California shown as its own region
  const soCol = v === 8 ? (t > c(119, "joined") + 6 ? B60 : R50) : R50;
  const laBlue = v === 7 || v === 6 && t > d * 0.6;
  return (
    <Wrap title={
      v === 0 ? <Title text="25 cycles: Niagara and the north" s={pop(t, 2)} col={P25} />
      : v === 1 ? <Title text="60 was spreading" s={pop(t, 2)} col={B60} />
      : v === 5 ? <Title text="An electrical island" s={pop(t, c(96, "island") - 4)} />
      : v === 7 ? <Title text="12 more years on 50" s={pop(t, 4)} />
      : v === 8 ? <Title text="October 27, 1948: all on 60" s={pop(t, 12)} col={B60} /> : null}>
      <Viewport t={t} d={d} from={from} to={to} roll={v % 2 ? [0.7, -0.5] : [-0.7, 0.5]}>
        <Land d={CANADA} fill={LAND2} />
        <Land d={US} />
        {v === 0 ? <><Tint d={NORTH25} col={P25} o={0.55 * ease(k(t, 4, 16))} /><Tint d={CAN25} col={P25} o={0.55 * ease(k(t, 12, 16))} /></> : null}
        {blue > 0 ? <g><clipPath id="usclip"><path d={US} /></clipPath><circle cx={PITT[0]} cy={PITT[1]} r={(v === 1 ? blue : 1) * 1500} fill={B60} opacity={0.5} clipPath="url(#usclip)" /></g> : null}
        {so ? <path d={SOCAL} fill={soCol} stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={0.95} /> : null}
        <path d={US} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        {v === 0 ? <><Pin x={NIAG[0]} y={NIAG[1]} s={pop(t, 0)} col={P25} label="NIAGARA" /><Tag x={1420} y={190} n="25" col={P25} s={pop(t, 8)} /></> : null}
        {v === 1 ? <><Pin x={PITT[0]} y={PITT[1]} s={pop(t, 0)} col={B60} label="PITTSBURGH" /><Tag x={900} y={450} n="60" col={B60} s={pop(t, 14)} size={130} /></> : null}
        {v === 2 || v === 3 ? <>
          <Pin x={REDL[0]} y={REDL[1]} s={pop(t, 0)} col={v === 2 ? R50 : B60} label="MILL CREEK, CALIFORNIA" ly={56} size={20} r={9} />
          <Tag x={470} y={520} n={v === 2 ? "50" : "60"} col={v === 2 ? R50 : B60} s={pop(t, v === 2 ? c(59, "50") - 2 : c(60, "60") - 2) * 0.5} sub={v === 2 ? "1893" : "A YEAR LATER"} />
        </> : null}
        {v === 4 ? <><Tag x={420} y={500} n="50" col={R50} s={pop(t, c(94, "50") - 2) * 0.8} /><Tag x={1000} y={450} n="60" col={B60} s={pop(t, 0)} size={130} /></> : null}
        {v >= 5 && v <= 7 ? <Pin x={LA[0]} y={LA[1]} s={pop(t, 0) * 0.55} col={laBlue ? B60 : R50} label="LOS ANGELES" ly={52} size={26} /> : null}
        {v === 5 ? <Tag x={410} y={520} n="50" col={R50} s={0.34 * pop(t, 2)} /> : null}
        {v === 6 ? <>
          <Draw d={`M${HOOVER[0]} ${HOOVER[1]} Q420 560 ${LA[0] + 8} ${LA[1] - 6}`} u={ease(k(t, 8, 22))} col={B60} w={5} />
          <Pin x={HOOVER[0]} y={HOOVER[1]} s={pop(t, 0) * 0.55} col={B60} label="HOOVER DAM" ly={-44} size={26} />
          <Tag x={440} y={500} n="60" col={B60} s={0.32 * pop(t, c(100, "power") - 2)} />
        </> : null}
        {v === 7 ? <Tag x={500} y={610} n="50" col={R50} s={0.3 * pop(t, 6)} sub="UNTIL 1948" /> : null}
        {v === 8 ? <Tag x={940} y={450} n="60" col={B60} s={pop(t, c(119, "joined") + 4)} size={150} /> : null}
      </Viewport>
    </Wrap>
  );
};

// ---------------- the Atlantic: America to Germany ----------------
const AM_EAST = "M-200 -100 L620 -100 L560 60 L600 170 L540 300 L560 400 L500 520 L520 640 L440 760 L400 900 L300 1200 L-200 1200 Z";
const EUROPE_W = "M1250 -100 L1330 60 L1290 140 L1360 200 L1330 300 L1400 330 L1380 420 L1300 470 L1330 560 L1280 660 L1340 700 L1420 690 L1500 760 L1560 900 L2200 1200 L2200 -100 Z";
const BRITAIN = "M1130 150 L1190 130 L1210 220 L1180 300 L1120 310 L1140 230 Z";
const AtlanticMap: React.FC<G> = ({ t, d }) => (
  <Wrap title={<Title text="Meanwhile, in Germany" s={pop(t, Math.round(d * 0.55))} />}>
    <Viewport t={t} d={d} from={[1.5, 480, 420]} to={[1.5, 1500, 400]} roll={[1, -0.8]}>
      <Land d={AM_EAST} /><Tint d={AM_EAST} col={B60} o={0.45} /><Land d={EUROPE_W} /><Land d={BRITAIN} />
      <Pin x={470} y={410} s={1} col={B60} label="PITTSBURGH" />
      <Tag x={330} y={560} n="60" col={B60} s={1} />
      <Pin x={1560} y={330} s={pop(t, Math.round(d * 0.5))} col={R50} label="BERLIN" />
      <Draw d="M520 400 Q1000 180 1520 320" u={ease(k(t, 4, Math.max(16, d * 0.6)))} col="#fffaf0" w={6} dash />
    </Viewport>
  </Wrap>
);

// ---------------- Germany: Lauffen to Frankfurt ----------------
const GER = "M560 60 L900 20 L1260 60 L1420 200 L1380 420 L1460 600 L1340 820 L1100 900 L860 860 L640 900 L520 700 L560 480 L480 300 Z";
const LAUF: [number, number] = [930, 690], FRANK: [number, number] = [860, 330];
const LauffenMap: React.FC<G> = ({ t, d, v, c }) => {
  const u = v === 0 ? ease(k(t, c(65, "Lauffen") - 2, Math.max(24, c(65, "Frankfurt") - c(65, "Lauffen") + 10))) : 1;
  const line = `M${LAUF[0]} ${LAUF[1]} Q1000 520 ${FRANK[0]} ${FRANK[1]}`;
  return (
    <Wrap title={v === 0 ? <Title text="1891" s={pop(t, 0)} /> : null}>
      <Viewport t={t} d={d} from={v === 0 ? [1.25, 920, 620] : [1.5, 900, 500]} to={v === 0 ? [1.4, 890, 420] : [1.35, 900, 500]} roll={v === 0 ? [-1, 0.6] : [0.8, -0.4]}>
        <Land d={GER} />
        <path d="M900 900 Q960 780 930 690 Q900 600 1010 560 Q1100 520 1080 420" stroke="#7aa8c7" strokeWidth={12} fill="none" strokeLinecap="round" />
        <Draw d={line} u={u} col={C.yellow} w={10} />
        <Pin x={LAUF[0]} y={LAUF[1]} s={pop(t, 0)} col={R50} label="LAUFFEN" ly={62} />
        <path transform={`translate(${LAUF[0] - 84} ${LAUF[1] - 30})`} d="M0 0 L40 0 M6 0 q4 26 -4 52 M20 0 q4 30 -2 56 M34 0 q4 26 6 52" stroke="#2f7fb5" strokeWidth={7} fill="none" strokeLinecap="round" />
        <Pin x={FRANK[0]} y={FRANK[1]} s={pop(t, v === 0 ? c(65, "Frankfurt") - 2 : 0)} col={C.yellow} label="FRANKFURT" />
        {v === 1 ? <Tag x={1150} y={500} n="175 KM" col={INK} s={pop(t, 2)} size={80} /> : null}
      </Viewport>
    </Wrap>
  );
};

// ---------------- Europe: 50 goes out from Berlin ----------------
const EU_MAIN = "M420 760 L360 620 L420 520 L520 500 L600 420 L560 320 L660 250 L780 270 L880 210 L1040 200 L1220 160 L1420 180 L1560 260 L1600 420 L1540 560 L1420 620 L1300 600 L1200 680 L1100 640 L1000 700 L960 800 L900 900 L840 820 L860 720 L760 700 L640 720 L560 800 Z";
const EU_UK = "M470 250 L540 220 L560 320 L530 410 L450 420 L480 330 Z", EU_SCAN = "M820 130 L900 20 L1000 -40 L1040 60 L980 150 L900 180 Z";
const BERLIN: [number, number] = [1010, 380];
const EU_PTS: [number, number][] = [[640, 520], [760, 640], [1190, 470], [1330, 380], [900, 760], [930, 250], [1180, 620], [520, 640]];
const EuropeMap: React.FC<G> = ({ t, d, v }) => (
  <Wrap title={<Title text={v === 0 ? "AEG: Europe's giant" : "Wherever AEG sold, 50 followed"} s={pop(t, 2)} />}>
    <Viewport t={t} d={d} from={v === 0 ? [1.6, 1010, 400] : [1.25, 980, 440]} to={v === 0 ? [1.25, 980, 440] : [1.05, 960, 460]} roll={v === 0 ? [0.9, -0.5] : [-0.6, 0.6]}>
      <Land d={EU_MAIN} /><Land d={EU_UK} /><Land d={EU_SCAN} />
      {v === 1 ? EU_PTS.map(([x, y], i) => {
        const at = 6 + i * Math.max(3, Math.floor((d - 30) / EU_PTS.length));
        return <g key={i}><Draw d={`M${BERLIN[0]} ${BERLIN[1]} L${x} ${y}`} u={ease(k(t, at, 10))} col={R50} w={5} /><Tag x={x} y={y} n="50" col={R50} s={pop(t, at + 8) * 0.5} /></g>;
      }) : null}
      <Pin x={BERLIN[0]} y={BERLIN[1]} s={pop(t, 0)} col={R50} label="BERLIN" />
      <Tag x={BERLIN[0] + 150} y={BERLIN[1] + 10} n="AEG" col={INK} s={pop(t, 6) * 0.7} />
    </Viewport>
  </Wrap>
);

// ---------------- Japan ----------------
const J_WEST = "M500 650 L560 600 L660 590 L760 570 L850 560 L900 520 L935 475 L985 505 L960 560 L930 610 L870 640 L800 650 L720 640 L640 660 L560 690 Z";
const J_EAST = "M935 475 L990 430 L1050 400 L1090 340 L1130 280 L1180 220 L1240 190 L1270 220 L1250 290 L1230 360 L1200 430 L1190 500 L1150 540 L1090 540 L1040 560 L985 505 Z";
const J_KYU = "M400 680 L470 660 L500 720 L480 790 L420 800 L390 740 Z", J_SHI = "M600 700 L700 690 L740 720 L690 750 L610 740 Z", J_HOK = "M1270 60 L1380 40 L1450 90 L1400 150 L1320 160 L1270 120 Z";
const TOKYO: [number, number] = [1150, 515], OSAKA: [number, number] = [805, 625], FUKU: [number, number] = [1232, 372], EPI: [number, number] = [1360, 330], MEET: [number, number] = [960, 490];
const PLANTS: [number, number][] = [[1246, 300], [1232, 372], [1218, 420], [1204, 462]];
const JapanMap: React.FC<G> = ({ t, d, v, c }) => {
  const all: View = [1.15, 920, 440], tokyoV: View = [1.9, 1130, 470], osakaV: View = [1.9, 830, 590], mid: View = [2.3, 960, 500], eastV: View = [1.7, 1180, 380], westV: View = [1.6, 760, 620];
  const views: [View, View][] = [[[1.6, 960, 470], all], [[1.45, 920, 440], [1.1, 920, 440]], [all, tokyoV], [tokyoV, osakaV], [[1.5, 960, 520], [1.3, 940, 500]], [[1.3, 940, 500], eastV], [eastV, westV], [[1.4, 940, 500], mid],
    [mid, all], [all, [1.5, 1220, 360]], [[1.5, 1220, 360], eastV], [eastV, westV], [mid, [2.0, 960, 500]], [all, [1.25, 920, 440]]];
  const [from, to] = views[v] ?? [all, all];
  // how much of each half is coloured
  const eastK = v === 0 ? ease(k(t, 2, 10)) : v <= 4 ? 0 : v === 5 ? ease(k(t, 2, Math.max(16, d - 12))) : 1;
  const westK = v === 0 ? ease(k(t, 8, 10)) : v <= 5 ? 0 : v === 6 ? ease(k(t, 2, Math.max(16, d - 12))) : 1;
  const grow = v === 4 ? ease(k(t, 2, Math.max(20, d - 6))) : 0;
  const quake = v === 9, dark = v === 10 || v === 11;
  const half = v === 13;
  return (
    <Wrap title={
      v === 0 ? <Title text="One country got both" s={pop(t, 14)} />
      : v === 1 ? <Title text="A whole nation?" s={pop(t, 4)} />
      : v === 7 ? <Title text="They met in the middle" s={pop(t, c(140, "met") - 4)} />
      : v === 8 ? <Title text="Still split today" s={pop(t, 2)} />
      : v === 11 ? <Title text="Power to spare in the west" s={pop(t, 4)} col={B60} />
      : v === 12 ? <Title text="Widening the bridges" s={pop(t, 2)} col={INK} />
      : v === 13 ? <Title text="Rebuild half the country" s={pop(t, c(167, "half") - 6)} /> : null}>
      <Viewport t={t} d={d} from={from} to={to} roll={v % 2 ? [0.8, -0.6] : [-0.8, 0.6]} shake={quake ? clamp01(1 - t / 40) : 0}>
        {[J_KYU, J_SHI, J_WEST, J_EAST, J_HOK].map((p, i) => <Land key={i} d={p} />)}
        {grow > 0 ? <><clipPath id="jclip"><path d={J_EAST + " " + J_WEST + " " + J_HOK + " " + J_KYU + " " + J_SHI} /></clipPath>
          <circle cx={TOKYO[0]} cy={TOKYO[1]} r={grow * 130} fill={R50} opacity={0.6} clipPath="url(#jclip)" /><circle cx={OSAKA[0]} cy={OSAKA[1]} r={grow * 130} fill={B60} opacity={0.6} clipPath="url(#jclip)" /></> : null}
        {[J_EAST, J_HOK].map((p, i) => <Tint key={"e" + i} d={p} col={dark ? "#3a3440" : R50} o={(dark ? 0.85 : 0.7) * eastK} />)}
        {[J_WEST, J_KYU, J_SHI].map((p, i) => <Tint key={"w" + i} d={p} col={B60} o={(v === 11 ? 0.85 : 0.7) * westK} />)}
        {half ? <Tint d={J_EAST} col={C.yellow} o={0.75 * (0.5 + 0.5 * Math.sin(t / 3))} /> : null}
        {[J_KYU, J_SHI, J_WEST, J_EAST, J_HOK].map((p, i) => <path key={"o" + i} d={p} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />)}
        {v >= 7 ? <Draw d="M925 455 L995 525" u={v === 7 ? ease(k(t, c(140, "met") - 2, 8)) : 1} col="#fffaf0" w={v === 12 ? 6 : 9} /> : null}
        {v === 7 ? <Burst x={MEET[0]} y={MEET[1]} s={pop(t, c(140, "met")) * 0.6} /> : null}
        {v === 12 ? [-16, 0, 16, 32].map((o, i) => <Draw key={i} d={`M${930 + o * 0.9} ${505 + o} L${975 + o * 0.9} ${470 + o}`} u={ease(k(t, 4 + i * 8, 10))} col={C.yellow} w={i < 3 ? 6 : 12} />) : null}
        {v >= 2 && v !== 10 && v !== 9 ? <Pin x={TOKYO[0]} y={TOKYO[1]} s={pop(t, v === 2 ? c(125, "Tokyo's") - 2 : 0) * (v === 2 || v === 3 ? 0.7 : 0.55)} col={R50} label="TOKYO" ly={v >= 4 ? 54 : -56} /> : null}
        {v >= 3 && v !== 10 && v !== 9 ? <Pin x={OSAKA[0]} y={OSAKA[1]} s={pop(t, v === 3 ? c(129, "Osaka's") - 2 : 0) * (v === 3 ? 0.7 : 0.55)} col={B60} label="OSAKA" ly={54} /> : null}
        {v === 2 ? <Tag x={1290} y={560} n="1895" col={INK} s={pop(t, 2) * 0.5} /> : null}
        {v === 0 || v === 8 || v === 5 || v === 6 || v === 7 ? <Tag x={1330} y={420} n="50" col={R50} s={pop(t, v === 5 ? c(138, "50") - 2 : v === 0 ? 4 : 0) * 0.75} /> : null}
        {v === 0 || v === 8 || v === 6 || v === 7 ? <Tag x={640} y={500} n="60" col={B60} s={pop(t, v === 6 ? c(139, "60") - 2 : v === 0 ? 10 : 0) * 0.75} /> : null}
        {quake ? <>{[0, 1, 2].map((i) => { const u = ((t + i * 14) % 42) / 42; return <circle key={i} cx={EPI[0]} cy={EPI[1]} r={20 + u * 170} fill="none" stroke={C.red} strokeWidth={9 * (1 - u)} opacity={1 - u} />; })}
          <Burst x={EPI[0]} y={EPI[1]} s={pop(t, 0) * 0.7} col={C.red} /><Label x={1500} y={250} text="MARCH 11, 2011" size={34} /></> : null}
        {v === 10 ? <>{PLANTS.map(([x, y], i) => { const s = pop(t, 4 + i * 5); return s <= 0 ? null : <g key={i} transform={`translate(${x} ${y}) scale(${s * 0.5})`}><path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke={C.yellow} strokeWidth={10} strokeLinecap="round" /></g>; })}
          <Label x={FUKU[0] + 150} y={FUKU[1]} text="FUKUSHIMA" size={28} o={ease(k(t, c(149, "Fukushima") - 4, 6))} /></> : null}
        {v === 11 ? <><Label x={1360} y={470} text="SHORT OF POWER" size={30} col={C.red} /><Tag x={640} y={500} n="60" col={B60} s={0.75} /></> : null}
      </Viewport>
    </Wrap>
  );
};

// ---------------- the world ----------------
const W_NA = "M120 190 L200 150 L300 170 L360 140 L470 130 L560 110 L650 150 L700 210 L640 250 L660 300 L610 330 L590 380 L560 400 L570 440 L540 430 L520 400 L470 410 L440 460 L460 510 L500 540 L540 580 L560 610 L548 628 L500 610 L460 580 L420 540 L390 480 L350 420 L310 380 L270 330 L250 270 L200 240 L150 230 Z";
const W_SAN = "M540 620 L640 600 L740 650 L770 720 L700 770 L600 760 L560 700 Z", W_SAS = "M600 760 L700 770 L690 850 L650 930 L620 990 L600 930 L590 850 Z";
const W_EU = "M880 250 L960 200 L1060 210 L1100 260 L1080 330 L1000 350 L940 380 L890 350 L900 300 Z";
const W_AF = "M900 420 L1020 400 L1110 450 L1130 560 L1080 700 L1020 780 L970 700 L940 580 L890 500 Z";
const W_AS = "M1100 200 L1300 150 L1560 170 L1700 230 L1680 330 L1600 400 L1520 470 L1420 500 L1330 470 L1260 520 L1200 470 L1130 400 L1110 300 Z";
const W_AU = "M1520 660 L1640 640 L1720 700 L1690 780 L1580 790 L1510 730 Z";
const W_JE = "M1772 286 L1798 298 L1792 336 L1770 330 Z", W_JW = "M1770 330 L1792 336 L1770 376 L1748 364 Z";
const A60 = [W_NA, W_SAN, W_JW], A50 = [W_SAS, W_EU, W_AF, W_AS, W_AU, W_JE];
const WorldMap: React.FC<G> = ({ t, d, v, c }) => {
  const allP = [...A60, ...A50];
  // v0: the whole world in one colour, then the other ("either would have been fine"); v1/v2: the split; v3: the 60 side; v4: the 50 side
  const flip = v === 0 ? (t > d * 0.55 ? 1 : 0) : 0;
  const o60 = v === 0 ? 0 : v === 4 ? 0.3 : 0.75, o50 = v === 0 ? 0 : v === 3 ? 0.3 : 0.75;
  const inK = v === 1 ? ease(k(t, 2, 12)) : 1;
  return (
    <Wrap title={
      v === 0 ? <Title text="Either one would have worked" s={pop(t, 2)} col={INK} />
      : v === 1 ? <Title text="It just didn't pick the same one" s={pop(t, 4)} />
      : v === 2 ? <Title text="Same story, whole world" s={pop(t, 2)} col={INK} /> : null}>
      <Viewport t={t} d={d} from={v === 3 ? [1.0, 940, 520] : v === 4 ? [1.25, 620, 480] : [1.05, 960, 500]} to={v === 3 ? [1.25, 620, 480] : v === 4 ? [1.15, 1260, 460] : [0.96, 960, 500]} roll={v % 2 ? [0.7, -0.6] : [-0.7, 0.6]}>
        {allP.map((p, i) => <Land key={i} d={p} w={6} />)}
        {v === 0 ? allP.map((p, i) => <Tint key={"a" + i} d={p} col={flip ? R50 : B60} o={0.7} />) : null}
        {A60.map((p, i) => <Tint key={"b" + i} d={p} col={B60} o={o60 * inK} />)}
        {A50.map((p, i) => <Tint key={"r" + i} d={p} col={R50} o={o50 * inK} />)}
        {allP.map((p, i) => <path key={"o" + i} d={p} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
        {v === 0 ? <Tag x={960} y={560} n={flip ? "50" : "60"} col={flip ? R50 : B60} s={flip ? pop(t, Math.round(d * 0.55)) : pop(t, 0)} size={150} /> : null}
        {v >= 1 && v !== 4 ? <Tag x={420} y={330} n="60" col={B60} s={pop(t, v === 3 ? c(170, "60") - 2 : 6) * (v === 3 ? 1 : 0.8)} size={110} /> : null}
        {v >= 1 && v !== 3 ? <Tag x={1330} y={330} n="50" col={R50} s={pop(t, v === 4 ? c(171, "50") - 2 : 12) * (v === 4 ? 1 : 0.8)} size={110} /> : null}
      </Viewport>
    </Wrap>
  );
};

const MAPS: Record<string, React.FC<G>> = { usa: UsaMap, atlantic: AtlanticMap, lauffen: LauffenMap, europe: EuropeMap, japan: JapanMap, world: WorldMap };
export const MapBoard: React.FC<G & { name: string }> = ({ name, ...g }) => { const M = MAPS[name]; return M ? <M {...g} /> : null; };
void easeOut;
