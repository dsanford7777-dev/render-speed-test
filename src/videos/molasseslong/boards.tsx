// The 2D motion-graphics boards. Each takes G (t = frame in shot, d = shot length, c(seg, word) = word onset in shot
// frames, v = variant) and builds on the narration's words. Content stays above y = 800 (captions below).
import React from "react";
import { AbsoluteFill } from "remotion";
import {
  C, G, FONT, Paper, Cam, At, T, Banner, Stamp, NameCard, Row, Big, Icon, BostonMap, MAP_TANK, US_PATH,
  k, pop, ease, easeOut, lerp, clamp01, count, fmt,
} from "./kit";

const Dark: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = "#2a160c" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #4a2814 0%, ${tone} 75%)` }}>{children}</AbsoluteFill>
);
const arrow = (x1: number, y1: number, x2: number, y2: number, u: number, col = C.ink, w = 12) => {
  const x = lerp(x1, x2, u), y = lerp(y1, y2, u), a = Math.atan2(y2 - y1, x2 - x1);
  return u <= 0 ? null : (<g>
    <path d={`M${x1} ${y1} L${x} ${y}`} stroke={col} strokeWidth={w} strokeLinecap="round" />
    <path d={`M${x} ${y} L${x - 34 * Math.cos(a - 0.5)} ${y - 34 * Math.sin(a - 0.5)} M${x} ${y} L${x - 34 * Math.cos(a + 0.5)} ${y - 34 * Math.sin(a + 0.5)}`} stroke={col} strokeWidth={w} strokeLinecap="round" />
  </g>);
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} style={{ position: "absolute" }}>{children}</svg>;
const Node: React.FC<{ x: number; y: number; s: number; icon: string; label: string; col?: string }> = ({ x, y, s, icon, label, col = "#fffaf0" }) => (
  <At x={x} y={y} s={s}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ background: col, border: `8px solid ${C.ink}`, borderRadius: 30, padding: 26, boxShadow: `0 10px 0 ${C.ink}` }}><Icon kind={icon} s={170} /></div>
      <T size={44} style={{ textAlign: "center", whiteSpace: "pre-line" }}>{label}</T>
    </div>
  </At>
);

// ---------------- cold open ----------------
const count21: React.FC<G> = ({ t, d, c }) => (
  <Dark><Cam t={t} d={d} from={1.08} to={1.0}>
    <Big n="21" label="people killed" t={t} at={c(2, "21") - 4} x={960} y={430} size={330} col={C.yellow} lcol="#f6efdc" />
  </Cam></Dark>
);
const headline: React.FC<G> = ({ t, d }) => (
  <Dark><Cam t={t} d={d} from={1.15} to={1.0} oy={40}>
    <At x={960} y={420} r={-3} s={pop(t, 0, 8)}>
      <div style={{ width: 1180, background: "#efe6d0", border: `6px solid ${C.ink}`, padding: "30px 50px", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ borderBottom: `6px double ${C.ink}`, paddingBottom: 12, textAlign: "center" }}><T size={46} style={{ fontFamily: "Georgia, serif", letterSpacing: 8 }}>The Evening Extra</T></div>
        <div style={{ textAlign: "center", marginTop: 20 }}><T size={150} col={C.ink} style={{ fontFamily: "Georgia, serif", letterSpacing: -2 }}>ANARCHISTS!</T></div>
        <div style={{ textAlign: "center" }}><T size={46} w={800} style={{ fontFamily: "Georgia, serif" }}>Company says tank was blown up</T></div>
        <div style={{ display: "flex", gap: 30, marginTop: 24 }}>{[0, 1, 2].map((i) => <div key={i} style={{ flex: 1 }}>{[0, 1, 2, 3].map((j) => <div key={j} style={{ height: 12, background: "rgba(36,23,38,0.35)", margin: "12px 0", width: `${90 - ((i + j) % 3) * 12}%` }} />)}</div>)}</div>
      </div>
    </At>
  </Cam></Dark>
);
const title: React.FC<G> = ({ t, d }) => {
  const drip = (x: number, len: number, at: number) => { const u = easeOut(k(t, at, 40)); return <path key={x} d={`M${x - 26} 0 L${x - 26} ${len * u} Q${x} ${len * u + 46} ${x + 26} ${len * u} L${x + 26} 0 Z`} fill={C.mol2} />; };
  return (
    <Dark tone="#1c0e07"><Cam t={t} d={d} from={1.0} to={1.08}>
      <Svg>{[[180, 160, 0], [420, 260, 6], [700, 120, 3], [1010, 220, 9], [1290, 150, 2], [1560, 280, 5], [1780, 140, 8]].map(([x, l, a]) => drip(x, l, a))}<rect width={1920} height={30} fill={C.mol2} /></Svg>
      <At x={960} y={420} s={pop(t, 4, 12)}><T size={64} col="#f6efdc" style={{ letterSpacing: 18, textAlign: "center" }}>The Great</T></At>
      <At x={960} y={540} s={pop(t, 8, 12)}><T size={150} col={C.yellow} style={{ textShadow: `0 12px 0 ${C.mol}` }}>Molasses Flood</T></At>
      <At x={960} y={690} o={k(t, 20, 14)}><T size={50} w={800} col="#f6efdc" style={{ letterSpacing: 12 }}>Boston · January 15, 1919</T></At>
    </Cam></Dark>
  );
};


// cold open (rewritten): the company's non-fixes, and the lawsuit
const nofix: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} ox={30}>
    <Banner text="The company's fix" t={t} col={C.mol2} />
    <At x={360} y={300} center={false}><div>
      <Row text="Drain it" t={t} at={0} mark="x" markAt={c(6, "drain") + 4} size={90} strike />
      <Row text="Fix it" t={t} at={c(6, "fix") - 8} mark="x" markAt={c(6, "fix") + 4} size={90} strike />
    </div></At>
  </Cam></Paper>
);
const sued: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.08} to={1.0}>
    <Svg>{Array.from({ length: 24 }, (_, i) => { const x = 380 + (i % 8) * 165, y = 300 + Math.floor(i / 8) * 150, o = k(t, i * 0.7, 4); return <g key={i} opacity={o}><circle cx={x} cy={y} r={30} fill={[C.blue, C.red, C.green, C.mol2][i % 4]} /><rect x={x - 34} y={y + 34} width={68} height={70} rx={14} fill={[C.blue, C.red, C.green, C.mol2][i % 4]} /></g>; })}</Svg>
    <Stamp text="Sued" t={t} at={c(8, "sued") - 2} x={960} y={470} size={170} />
  </Cam></Paper>
);

// ---------------- 1. why Boston had a molasses tank ----------------
const whatfor: React.FC<G> = ({ t, d }) => (
  <Paper><Cam t={t} d={d}>
    <At x={760} y={430} s={pop(t, 0)}><Icon kind="barrel" s={380} /></At>
    <At x={1160} y={330} s={pop(t, 10)} r={10}><T size={360} col={C.red} style={{ textShadow: `0 14px 0 ${C.ink}` }}>?</T></At>
    <At x={960} y={690} o={k(t, 16)}><T size={70}>What was molasses for?</T></At>
  </Cam></Paper>
);
const warmap: React.FC<G> = ({ t, d, c }) => (
  <Paper tone="#e6d3a8"><Cam t={t} d={d} dx={-40}>
    <Big n="1915" t={t} at={0} x={960} y={300} size={200} col={C.ink} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <At key={i} x={420 + i * 180} y={600} s={pop(t, c(11, "war") - 6 + i * 2)}><Icon kind="shell" s={170} /></At>)}
    <Banner text="Europe at war" t={t} at={c(11, "Europe") - 2} y={470} />
  </Cam></Paper>
);
const chain: React.FC<G> = ({ t, d, c, v }) => {
  const a0 = v ? -30 : c(12, "explosives"), a1 = v ? -30 : c(12, "alcohol"), a2 = v ? c(13, "molasses") - 4 : 1e9;
  return (
    <Paper><Cam t={t} d={d} from={v ? 1.06 : 1.0} to={v ? 1.12 : 1.06} ox={v ? 30 : 60}>
      <Banner text={v ? "Cheapest way: ferment molasses" : "What armies needed"} t={t} at={v ? c(13, "cheapest") : 0} col={v ? C.mol2 : C.red} />
      <Node x={1500} y={480} s={pop(t, a0)} icon="shell" label="Explosives" />
      <Node x={960} y={480} s={pop(t, a1)} icon="flask" label={"Industrial\nalcohol"} />
      <Node x={420} y={480} s={pop(t, a2)} icon="barrel" label="Molasses" col="#f3dcc0" />
      <Svg>
        {arrow(1110, 440, 1330, 440, k(t, a1 + 4, 10))}
        {arrow(570, 440, 790, 440, k(t, a2 + 4, 10), C.mol2)}
      </Svg>
      {v ? <At x={680} y={360} o={k(t, c(13, "ferment"), 8)}><T size={40} col={C.mol2}>ferment</T></At> : null}
    </Cam></Paper>
  );
};
const caribbean: React.FC<G> = ({ t, d, c }) => {
  const u = 0.74 * ease(k(t, 4, d - 10)), bx = (s: number) => [lerp(380, 1500, s), 860 - 640 * Math.sin(s * Math.PI * 0.5) - 120 * Math.sin(s * Math.PI)];
  const [sx, sy] = bx(u);
  return (
    <AbsoluteFill style={{ background: C.sea }}><Cam t={t} d={d} from={1.0} to={1.05}>
      <Svg>
        <path d="M1380 0 L1920 0 L1920 40 Q1760 120 1640 220 Q1560 300 1600 420 Q1540 520 1420 560 Q1300 600 1260 740 Q1240 860 1120 960 L1080 1080 L860 1080 Q900 980 1000 900 Q1100 800 1120 680 Q1150 560 1260 480 Q1380 400 1400 260 Q1410 140 1380 0 Z" fill={C.land} stroke={C.ink} strokeWidth={8} />
        {[[260, 860, 120, 40], [430, 900, 70, 26], [560, 930, 90, 30], [340, 960, 50, 20], [660, 980, 60, 22]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={C.land} stroke={C.ink} strokeWidth={6} />)}
        <path d="M380 860 Q700 600 1000 420 Q1250 260 1500 220" fill="none" stroke={C.ink} strokeWidth={8} strokeDasharray="22 18" opacity={0.6} />
        <circle cx={1500} cy={220} r={20} fill={C.red} stroke={C.ink} strokeWidth={6} />
      </Svg>
      <At x={1500} y={150}><T size={56}>Boston</T></At>
      <At x={420} y={790} o={k(t, c(13, "Caribbean") - 6)}><T size={50}>Caribbean</T></At>
      <At x={420} y={720} o={k(t, c(13, "sugar") - 4)}><T size={34} w={800} col={C.mol2}>sugar plantations</T></At>
      <At x={sx} y={sy - 40} r={-8}><Icon kind="ship" s={150} /></At>
    </Cam></AbsoluteFill>
  );
};
const company: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d}>
    <At x={500} y={420} s={pop(t, 0)}><div style={{ background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 18, padding: "36px 46px", boxShadow: `0 12px 0 ${C.ink}`, textAlign: "center" }}><Icon kind="factory" s={150} /><T size={58}>Purity</T><T size={58}>Distilling</T></div></At>
    <Svg>{arrow(780, 420, 1060, 420, k(t, c(14, "later") - 4, 12), C.red, 14)}</Svg>
    <At x={920} y={350} o={k(t, c(14, "bought"), 8)}><T size={40} col={C.red}>bought by</T></At>
    <At x={1430} y={420} s={pop(t, c(14, "United"))}><div style={{ background: C.blue, border: `8px solid ${C.ink}`, borderRadius: 18, padding: "40px 46px", boxShadow: `0 12px 0 ${C.ink}`, textAlign: "center" }}>
      <T size={46} col="#fff">United States</T><T size={46} col="#fff">Industrial</T><T size={46} col="#fff">Alcohol Co.</T></div></At>
    <At x={960} y={700} o={k(t, c(14, "store"), 10)}><T size={60}>Needed: a place to store it</T></At>
  </Cam></Paper>
);
const pipeline: React.FC<G> = ({ t, d, c }) => {
  const flow = (t * 4) % 60;
  return (
    <Paper><Cam t={t} d={d} dx={-30}>
      <Svg>
        <path d="M560 520 L840 520" stroke={C.mol2} strokeWidth={30} strokeDasharray="30 30" strokeDashoffset={-flow} opacity={k(t, 0, 10)} />
        <path d="M1110 520 L1390 520" stroke={C.mol2} strokeWidth={30} strokeDasharray="30 30" strokeDashoffset={-flow} opacity={k(t, c(15, "distillery") - 4, 10)} />
      </Svg>
      <Node x={400} y={500} s={pop(t, 0)} icon="ship" label="Ship" />
      <Node x={975} y={500} s={pop(t, 4)} icon="tank" label="Giant tank" />
      <Node x={1550} y={500} s={pop(t, c(15, "distillery") - 6)} icon="factory" label="Distillery" />
    </Cam></Paper>
  );
};
const northend: React.FC<G> = ({ t, d, c }) => {
  const p = pop(t, c(16, "Commercial") - 4), hl = k(t, c(16, "North") - 4, 10);
  return (
    <AbsoluteFill><Cam t={t} d={d} from={1.0} to={1.25} ox={63} oy={46}>
      <BostonMap>
        <path d="M900 330 Q1010 300 1120 340 Q1230 380 1240 470 Q1250 560 1150 590 Q1040 620 960 560 Q880 500 880 420 Z" fill={C.yellow} opacity={0.45 * hl} />
        <g transform={`translate(${MAP_TANK.x} ${MAP_TANK.y - 60 * p}) scale(${p})`}><path d="M0 60 Q-40 10 -40 -20 A40 40 0 1 1 40 -20 Q40 10 0 60 Z" fill={C.red} stroke={C.ink} strokeWidth={6} /><circle cx={0} cy={-22} r={14} fill="#fff" /></g>
      </BostonMap>
    </Cam>
      <At x={1300} y={170} o={k(t, c(16, "Commercial"), 8)}><div style={{ background: "#fffaf0", border: `6px solid ${C.ink}`, borderRadius: 10, padding: "10px 28px" }}><T size={52}>Commercial St. · North End</T></div></At>
    </AbsoluteFill>
  );
};
const neighborhood: React.FC<G> = ({ t, d, c }) => {
  const items: [string, string, number][] = [
    ["family", "Families", c(17, "Italian")], ["worker", "Workers", c(17, "workers")], ["horse", "Horses", c(17, "horses")],
    ["warehouse", "Warehouses", c(17, "warehouses")], ["firehouse", "A firehouse", c(17, "firehouse")], ["swing", "A playground", c(17, "playground")],
  ];
  return (
    <Paper><Cam t={t} d={d}>
      <Banner text="One of the most crowded neighborhoods" t={t} at={0} col={C.blue} y={110} />
      {items.map(([ic, l, a], i) => <At key={l} x={420 + (i % 3) * 540} y={i < 3 ? 360 : 640} s={pop(t, a - 4)}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Icon kind={ic} s={170} /><T size={44}>{l}</T></div></At>)}
    </Cam></Paper>
  );
};
const scale: React.FC<G> = ({ t, d, c }) => {
  const g = easeOut(k(t, 0, 24)), a90 = k(t, c(20, "90") - 4, 12), H = 480 * g, base = 690;
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
      <Svg>
        {[0, 1, 2, 3, 4].map((i) => <g key={i} opacity={k(t, c(19, "five") - 8 + i * 2, 6)}><rect x={360} y={base - (i + 1) * 96} width={200} height={96} fill="#c98d6a" stroke={C.ink} strokeWidth={6} />
          <rect x={390} y={base - (i + 1) * 96 + 22} width={50} height={52} fill="#cfe8f0" stroke={C.ink} strokeWidth={5} /><rect x={480} y={base - (i + 1) * 96 + 22} width={50} height={52} fill="#cfe8f0" stroke={C.ink} strokeWidth={5} /></g>)}
        <rect x={760} y={base - H} width={700} height={H} fill="#9a929e" stroke={C.ink} strokeWidth={8} />
        <ellipse cx={1110} cy={base - H} rx={350} ry={46} fill="#b8b0bc" stroke={C.ink} strokeWidth={8} />
        {[1, 2, 3].map((i) => <path key={i} d={`M760 ${base - H * i / 4} L1460 ${base - H * i / 4}`} stroke={C.ink} strokeWidth={4} opacity={0.4} />)}
        <path d={`M200 ${base} L1720 ${base}`} stroke={C.ink} strokeWidth={8} />
        <g opacity={k(t, c(19, "50") - 4, 8)}><path d={`M1530 ${base} L1530 ${base - 480}`} stroke={C.red} strokeWidth={10} /><path d={`M1505 ${base} L1555 ${base} M1505 ${base - 480} L1555 ${base - 480}`} stroke={C.red} strokeWidth={10} /></g>
        {a90 > 0 ? <g><path d={`M760 ${base + 50} L${760 + 700 * a90} ${base + 50}`} stroke={C.blue} strokeWidth={10} /><path d={`M760 ${base + 30} L760 ${base + 70}`} stroke={C.blue} strokeWidth={10} /></g> : null}
      </Svg>
      <At x={1640} y={base - 260} s={pop(t, c(19, "50") - 2)}><T size={90} col={C.red}>50 ft</T></At>
      <At x={460} y={base - 530} s={pop(t, c(19, "five"))}><T size={52}>5 stories</T></At>
      <At x={1110} y={base + 100} s={pop(t, c(20, "90"))}><T size={64} col={C.blue}>90 ft across</T></At>
    </Cam></Paper>
  );
};
const gallons: React.FC<G> = ({ t, d, c }) => {
  const a = c(21, "2.3") - 6, n = count(t, a, a + 30, 0, 2300000), lvl = easeOut(k(t, 0, d - 10));
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>
        <rect x={250} y={180} width={420} height={560} fill="#9a929e" stroke={C.ink} strokeWidth={8} />
        <rect x={258} y={180 + 552 * (1 - lvl)} width={404} height={552 * lvl} fill={C.mol} />
        <ellipse cx={460} cy={180} rx={210} ry={30} fill="#b8b0bc" stroke={C.ink} strokeWidth={8} />
      </Svg>
      <At x={1260} y={380} o={k(t, a - 2, 6)}><T size={170} col={C.mol2} style={{ textShadow: `0 8px 0 ${C.ink}` }}>{fmt(n)}</T></At>
      <At x={1260} y={540} o={k(t, a + 6, 8)}><T size={84}>gallons</T></At>
      <At x={1260} y={640} o={k(t, a + 14, 8)}><T size={44} w={800} col={C.grey}>when full</T></At>
    </Cam></Paper>
  );
};

// ---------------- 2. built by a treasurer ----------------
const jellcard: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d}>
    <NameCard name="Arthur Jell" role="Company treasurer" t={t} at={0} roleAt={c(24, "treasurer") - 4} icon={<Icon kind="doc" s={170} />} />
  </Cam></Paper>
);
const notrain: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} ox={30}>
    <Banner text="Arthur Jell's training" t={t} col={C.blue} />
    <At x={300} y={300} center={false}><div>
      <Row text="Engineering" t={t} at={c(25, "engineering") - 6} mark="x" markAt={c(25, "engineering") + 6} size={80} />
      <Row text="Architecture" t={t} at={c(25, "architecture") - 6} mark="x" markAt={c(25, "architecture") + 6} size={80} />
    </div></At>
  </Cam></Paper>
);
const deadline: React.FC<G> = ({ t, d, c }) => {
  const sx = lerp(1900, 1250, easeOut(k(t, 0, d)));
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>
        <circle cx={600} cy={420} r={230} fill="#fffaf0" stroke={C.ink} strokeWidth={12} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M600 ${210} L600 ${240}`} stroke={C.ink} strokeWidth={10} transform={`rotate(${i * 30} 600 420)`} />)}
        <path d="M600 420 L600 270" stroke={C.ink} strokeWidth={14} strokeLinecap="round" transform={`rotate(${t * 18} 600 420)`} />
        <path d="M600 420 L600 320" stroke={C.red} strokeWidth={16} strokeLinecap="round" transform={`rotate(${t * 1.5} 600 420)`} />
      </Svg>
      <At x={sx} y={400}><Icon kind="ship" s={300} /></At>
      <At x={1350} y={640} o={k(t, c(25, "shipment") - 4, 8)}><T size={56}>Big shipment coming</T></At>
      <At x={600} y={720} s={pop(t, c(25, "fast") - 4)}><T size={80} col={C.red}>Finish fast!</T></At>
    </Cam></Paper>
  );
};
const corners: React.FC<G> = ({ t, d, c }) => {
  const a = c(26, "cut") - 6, cut = (i: number) => k(t, a + i * 3, 6);
  return (
    <AbsoluteFill style={{ background: "#2f5fb5" }}><Cam t={t} d={d} from={1.0} to={1.08}>
      <Svg>
        <defs><pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="#5a86d4" strokeWidth={2} /></pattern></defs>
        <rect width={1920} height={1080} fill="url(#grid)" />
        <rect x={560} y={160} width={800} height={560} fill="none" stroke="#fff" strokeWidth={8} />
        <ellipse cx={960} cy={440} rx={200} ry={200} fill="none" stroke="#fff" strokeWidth={6} />
        {[[560, 160], [1360, 160], [1360, 720], [560, 720]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l${x < 900 ? 120 : -120} 0 L${x} ${y + (y < 400 ? 120 : -120)} Z`} fill="#2f5fb5" stroke="#fff" strokeWidth={6} strokeDasharray="14 10"
          transform={`translate(${(x < 900 ? -1 : 1) * 80 * cut(i)} ${(y < 400 ? -1 : 1) * 80 * cut(i)}) rotate(${cut(i) * 25} ${x} ${y})`} opacity={1 - cut(i) * 0.4} />)}
      </Svg>
      <At x={960} y={440} s={pop(t, a + 12)}><T size={110} col={C.yellow} style={{ textShadow: `0 8px 0 ${C.ink}` }}>Corners cut</T></At>
    </Cam></AbsoluteFill>
  );
};
const watertest: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} ox={30}>
    <Banner text="The standard test" t={t} col={C.blue} />
    <At x={260} y={290} center={false}><div>
      <Row text="1. Fill it with water" t={t} at={c(27, "fill") - 6} size={74} />
      <Row text="2. Look for leaks" t={t} at={c(27, "look") - 6} size={74} />
    </div></At>
    <At x={1520} y={430} s={pop(t, c(27, "water") - 4)}><svg width={260} height={300} viewBox="0 0 100 115"><path d="M50 6 Q86 56 86 76 A36 36 0 0 1 14 76 Q14 56 50 6 Z" fill={C.sea2} stroke={C.ink} strokeWidth={6} /></svg></At>
    <Stamp text="Skipped" t={t} at={c(28, "skipped") - 2} x={1200} y={600} size={140} />
  </Cam></Paper>
);
const heavier: React.FC<G> = ({ t, d, c }) => {
  const tilt = 9 * ease(k(t, c(31, "heavier") - 10, 18));
  return (
    <Paper><Cam t={t} d={d}>
      <At x={960} y={130} s={pop(t, 0)}><T size={76}>Molasses <span style={{ color: C.red }}>≠</span> water</T></At>
      <Svg>
        <path d="M960 720 L960 330 M880 720 L1040 720" stroke={C.ink} strokeWidth={14} />
        <g transform={`rotate(${tilt} 960 330)`}>
          <path d="M520 330 L1400 330" stroke={C.ink} strokeWidth={14} />
          <path d="M560 330 L520 470 M560 330 L600 470 M1360 330 L1320 470 M1360 330 L1400 470" stroke={C.ink} strokeWidth={6} />
          <g transform={`rotate(${-tilt} 560 470)`}><rect x={460} y={470} width={200} height={150} fill={C.sea2} stroke={C.ink} strokeWidth={8} /></g>
          <g transform={`rotate(${-tilt} 1360 470)`}><rect x={1260} y={470} width={200} height={150} fill={C.mol} stroke={C.ink} strokeWidth={8} /></g>
        </g>
      </Svg>
      <At x={560 - tilt * 6} y={430 - tilt * 6}><T size={44}>Water</T></At>
      <At x={1360 + tilt * 6} y={430 + tilt * 6}><T size={44}>Molasses</T></At>
      <At x={1600} y={760} s={pop(t, c(31, "50") - 4)}><T size={120} col={C.red} style={{ textShadow: `0 6px 0 ${C.ink}` }}>+50%</T></At>
    </Cam></Paper>
  );
};
const pressure: React.FC<G> = ({ t, d, c }) => {
  const g = ease(k(t, c(32, "more") - 8, 20));
  return (
    <Paper><Cam t={t} d={d} from={1.08} to={1.0}>
      <Svg>
        <rect x={660} y={170} width={600} height={580} fill={C.mol} stroke={C.ink} strokeWidth={14} />
        {[0, 1, 2, 3].map((i) => { const y = 260 + i * 140, L = 70 + (i + 1) * 30 * (0.4 + g); return <g key={i}>{arrow(700, y, 700 - L, y, k(t, 4 + i * 3, 8), C.red, 14)}{arrow(1220, y, 1220 + L, y, k(t, 4 + i * 3, 8), C.red, 14)}</g>; })}
      </Svg>
      <At x={960} y={92} o={k(t, c(32, "more") - 4, 8)}><T size={64}>Far more weight on every inch</T></At>
    </Cam></Paper>
  );
};
const mayville: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d}>
    <NameCard name="Ronald Mayville" role="Structural engineer" t={t} at={0} icon={<Icon kind="doc" s={170} />} extra="Went back through the records, ~a century later" extraAt={c(33, "records") - 6} />
  </Cam></Paper>
);
const wallcut: React.FC<G> = ({ t, d, c }) => {
  const h = ease(k(t, c(34, "half") - 8, 14));
  return (
    <Paper><Cam t={t} d={d}>
      <Banner text="The steel walls" t={t} col={C.blue} />
      <Svg>
        <rect x={460} y={260} width={240} height={440} fill="#9a929e" stroke={C.ink} strokeWidth={8} />
        <rect x={1220} y={260} width={240 * (1 - 0.5 * h)} height={440} fill={h > 0.5 ? "#b56a5a" : "#9a929e"} stroke={C.ink} strokeWidth={8} />
        <path d={`M${1220 + 240 * (1 - 0.5 * h)} 260 L1460 260 L1460 700 L${1220 + 240 * (1 - 0.5 * h)} 700`} fill="none" stroke={C.red} strokeWidth={6} strokeDasharray="16 12" opacity={h} />
      </Svg>
      <At x={580} y={760}><T size={48}>Should have been</T></At>
      <At x={1340} y={760} o={k(t, 6)}><T size={48}>What they built</T></At>
      <At x={1610} y={480} s={pop(t, c(34, "half") - 2)}><T size={130} col={C.red} style={{ textShadow: `0 6px 0 ${C.ink}` }}>½</T></At>
    </Cam></Paper>
  );
};
const manganese: React.FC<G> = ({ t, d, c }) => {
  const cr = k(t, c(35, "brittle") - 4, 12);
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>
        <rect x={360} y={260} width={700} height={420} fill="#9a929e" stroke={C.ink} strokeWidth={10} />
        <path d={`M700 260 L${700 - 60 * cr} ${260 + 120 * cr} L${700 + 40 * cr} ${260 + 220 * cr} L${700 - 30 * cr} ${260 + 330 * cr} L${700 + 20 * cr} ${260 + 420 * cr}`} fill="none" stroke={C.ink} strokeWidth={10} />
      </Svg>
      <At x={1450} y={330} s={pop(t, c(35, "manganese") - 6)}><div style={{ border: `8px solid ${C.ink}`, borderRadius: 16, background: "#fffaf0", padding: "18px 30px", textAlign: "center" }}><T size={96} col={C.blue} up={false}>Mn</T><T size={40}>Low manganese</T></div></At>
      <At x={1450} y={620} s={pop(t, c(35, "cold") - 6)}><T size={120} col={C.blue}>❄</T></At>
      <At x={710} y={760} o={cr}><T size={64} col={C.red}>Brittle in the cold</T></At>
    </Cam></Paper>
  );
};
const rivets: React.FC<G> = ({ t, d, c }) => {
  const hl = k(t, c(36, "holes") - 6, 8), cr = ease(k(t, c(37, "cracks") - 6, 16));
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.15}>
      <Svg>
        <rect x={160} y={200} width={1600} height={260} fill="#9a929e" stroke={C.ink} strokeWidth={8} />
        <rect x={160} y={420} width={1600} height={260} fill="#8a8290" stroke={C.ink} strokeWidth={8} />
        {Array.from({ length: 9 }, (_, i) => { const x = 280 + i * 170; return <g key={i}>
          <circle cx={x} cy={440} r={30 + 14 * hl} fill={hl ? "#f2b84a" : "#6a6270"} opacity={hl ? 0.6 : 0} />
          <circle cx={x} cy={440} r={26} fill="#6a6270" stroke={C.ink} strokeWidth={6} />
          {cr > 0 ? <path d={`M${x + 26} 440 L${x + 26 + 40 * cr} ${440 - 30 * cr} L${x + 26 + 70 * cr} ${440 - 10 * cr} M${x - 26} 440 L${x - 26 - 46 * cr} ${440 + 26 * cr}`} stroke={C.ink} strokeWidth={6} fill="none" /> : null}
        </g>; })}
      </Svg>
      <At x={960} y={120} o={k(t, 0, 8)}><T size={60}>Rivets too weak around their holes</T></At>
      <At x={960} y={755} s={pop(t, c(37, "cracks") - 2)}><T size={76} col={C.red}>First cracks</T></At>
    </Cam></Paper>
  );
};

// ---------------- 3. the warning signs ----------------
const groan: React.FC<G> = ({ t, d, c }) => (
  <Paper tone="#e9d8b6"><Cam t={t} d={d} from={1.05} to={1.0}>
    <At x={960} y={450} r={Math.sin(t * 1.3) * 1.2}><Icon kind="tank" s={420} /></At>
    <Svg>{[0, 1, 2].map((i) => { const r = ((t * 6 + i * 70) % 210) + 260; return <g key={i} opacity={1 - (r - 260) / 210}>
      <path d={`M${960 - r} ${450 - r * 0.5} Q${960 - r - 40} 450 ${960 - r} ${450 + r * 0.5}`} fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <path d={`M${960 + r} ${450 - r * 0.5} Q${960 + r + 40} 450 ${960 + r} ${450 + r * 0.5}`} fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" /></g>; })}</Svg>
    <At x={420} y={220} s={pop(t, c(47, "groaned") - 4)} r={-10}><T size={110} col={C.red}>Groan…</T></At>
    <At x={1500} y={700} s={pop(t, c(47, "rumbled") - 4)} r={8}><T size={110} col={C.mol2}>Rumble…</T></At>
  </Cam></Paper>
);
const reports: React.FC<G> = ({ t, d, c }) => {
  const a = c(48, "reported") - 4, n = Math.max(0, Math.min(7, Math.floor((t - a) / 9) + 1));
  return (
    <Paper><Cam t={t} d={d}>
      <NameCard name="Isaac Gonzales" role="Worker at the tank" t={t} at={0} x={680} y={300} col={C.green} />
      {Array.from({ length: n }, (_, i) => <At key={i} x={1460 + (i % 2) * 18} y={640 - i * 34} r={(i % 3 - 1) * 5} s={pop(t, a + i * 9, 6)}>
        <div style={{ width: 440, height: 120, background: "#fffaf0", border: `6px solid ${C.ink}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><T size={32} col={C.red}>Report: tank unsafe</T></div></At>)}
      <At x={600} y={620} s={pop(t, c(48, "again") - 4)}><T size={90} col={C.red}>Again…</T></At>
      <At x={600} y={730} s={pop(t, c(48, "again") + 14)}><T size={90} col={C.red}>and again.</T></At>
    </Cam></Paper>
  );
};
const response: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} ox={30}>
    <Banner text="The company's options" t={t} col={C.blue} />
    <At x={360} y={280} center={false}><div>
      <Row text="Drain the tank" t={t} at={c(50, "drain") - 6} mark="x" markAt={c(50, "drain") + 4} size={76} strike />
      <Row text="Repair it" t={t} at={c(50, "repair") - 6} mark="x" markAt={c(50, "repair") + 4} size={76} strike />
      <Row text="Call in an engineer" t={t} at={c(50, "call") - 6} mark="x" markAt={c(50, "engineer") + 2} size={76} strike />
    </div></At>
  </Cam></Paper>
);
const blend: React.FC<G> = ({ t, d, c }) => {
  const tank = (x: number, brown: number) => <g transform={`translate(${x} 0)`}>
    <rect x={-200} y={220} width={400} height={480} fill={brown ? C.mol2 : "#9a929e"} stroke={C.ink} strokeWidth={8} />
    <ellipse cx={0} cy={220} rx={200} ry={30} fill={brown ? "#9a5a2a" : "#b8b0bc"} stroke={C.ink} strokeWidth={8} />
    {[-140, -50, 60, 150].map((sx, i) => <path key={i} d={`M${sx} 240 Q${sx + 8} ${380 + i * 30} ${sx - 6} ${560 + i * 30}`} stroke={C.mol} strokeWidth={22} strokeLinecap="round" fill="none" opacity={brown ? 0.25 : 1} />)}
  </g>;
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>{tank(560, 0)}{tank(1360, 1)}{arrow(820, 460, 1100, 460, k(t, 6, 10), C.red, 14)}</Svg>
      <At x={560} y={770}><T size={48}>Streaks show</T></At>
      <At x={1360} y={770} o={k(t, 10)}><T size={48}>Painted brown</T></At>
      <At x={960} y={130} s={pop(t, c(52, "blend") - 4)}><T size={84} col={C.mol2}>Blends right in</T></At>
    </Cam></Paper>
  );
};
const sept1918: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d}>
    <At x={960} y={420} s={pop(t, 0)}><div style={{ width: 640, background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 18, overflow: "hidden", boxShadow: `0 14px 0 ${C.ink}` }}>
      <div style={{ background: C.red, padding: "18px 0", textAlign: "center" }}><T size={64} col="#fff">September</T></div>
      <div style={{ padding: "40px 0", textAlign: "center" }}><T size={180}>1918</T></div></div></At>
    <Stamp text="Gonzales quits" t={t} at={c(53, "quit") - 2} x={960} y={640} size={96} />
  </Cam></Paper>
);

// ---------------- 4. January 15, 1919 ----------------
const thermo: React.FC<G> = ({ t, d, c }) => {
  const a = c(56, "2") - 4, b = c(56, "40"), u = ease(k(t, a, Math.max(10, b - a))), deg = Math.round(lerp(2, 41, u)), H = 430;
  const col = u < 0.5 ? C.blue : C.red;
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>
        <rect x={860} y={150} width={200} height={H + 40} rx={100} fill="#fffaf0" stroke={C.ink} strokeWidth={10} />
        <circle cx={960} cy={150 + H + 90} r={120} fill={col} stroke={C.ink} strokeWidth={10} />
        <rect x={915} y={150 + H + 20 - (H - 40) * (0.1 + 0.85 * u)} width={90} height={(H - 40) * (0.1 + 0.85 * u) + 40} fill={col} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M1060 ${200 + i * 56} L1100 ${200 + i * 56}`} stroke={C.ink} strokeWidth={6} />)}
      </Svg>
      <At x={1440} y={400}><T size={180} col={col} style={{ textShadow: `0 8px 0 ${C.ink}` }}>{deg}°F</T></At>
      <At x={480} y={330} o={k(t, 0, 8)}><T size={52}>A couple of days</T></At>
      <At x={480} y={420} s={pop(t, b + 4)}><T size={90} col={C.red}>Warm spell</T></At>
    </Cam></Paper>
  );
};
const layers: React.FC<G> = ({ t, d, c }) => {
  const fill = easeOut(k(t, 0, 50)), full = pop(t, c(58, "nearly") - 4);
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>
        <rect x={560} y={170} width={800} height={620} fill="#d8d0dc" stroke={C.ink} strokeWidth={12} />
        <rect x={572} y={480} width={776} height={298} fill="#3a1a0a" />
        <rect x={572} y={480 - 230 * fill} width={776} height={230 * fill} fill="#b8641e" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${700 + i * 140} ${470 - 200 * fill} q 10 -24 0 -48`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.5 * fill} transform={`translate(0 ${-((t * 2 + i * 9) % 30)})`} />)}
        <path d={`M1440 120 L1440 210 L1352 210`} stroke={C.ink} strokeWidth={34} fill="none" />
        <path d={`M1340 210 Q1300 230 1300 ${480 - 230 * fill}`} stroke="#b8641e" strokeWidth={26} fill="none" opacity={1 - k(t, 50, 10)} />
      </Svg>
      <At x={960} y={360} o={k(t, 18, 8)}><T size={70} col="#fff" style={{ textShadow: `0 4px 0 ${C.ink}` }}>Warm</T></At>
      <At x={960} y={640}><T size={70} col="#c9d9ef">Cold</T></At>
      <At x={1640} y={480} s={full}><T size={62} col={C.red}>Nearly full</T></At>
    </Cam></Paper>
  );
};
const triggers: React.FC<G> = ({ t, d, v }) => {
  const P = [
    { x: 400, l: "Warm heats cold", s: "expands" },
    { x: 960, l: "Fermentation", s: "gas builds up" },
    { x: 1520, l: "Crack at a", s: "manhole cover" },
  ];
  const focus = v - 1, z = v ? 1.32 : 1.0, ox = v ? [20, 50, 80][focus] : 50;
  const anim = (i: number) => {
    const u = (t % 60) / 60;
    if (i === 0) return <><rect x={-120} y={-60} width={240} height={150} fill="#3a1a0a" /><rect x={-120} y={-120} width={240} height={60} fill="#b8641e" />
      {focus === 0 ? arrow(-120, 20, -120 - 50 * ease(k(t, 0, 20)), 20, 1, C.red, 10) : null}{focus === 0 ? arrow(120, 20, 120 + 50 * ease(k(t, 0, 20)), 20, 1, C.red, 10) : null}</>;
    if (i === 1) return <><rect x={-120} y={-120} width={240} height={210} fill="#5a2a10" />{[0, 1, 2, 3, 4, 5].map((j) => <circle key={j} cx={-90 + j * 36} cy={80 - (((u + j * 0.17) % 1) * 190)} r={8 + (j % 3) * 4} fill="none" stroke="#f2d6a8" strokeWidth={5} opacity={focus === 1 ? 1 : 0.5} />)}</>;
    const cr = focus === 2 ? ease(k(t, 4, 30)) : 0.25;
    return <><rect x={-120} y={-120} width={240} height={210} fill="#9a929e" /><circle cx={0} cy={50} r={36} fill="#6a6270" stroke={C.ink} strokeWidth={6} />
      <path d={`M36 50 L${36 + 40 * cr} ${50 - 50 * cr} L${36 + 70 * cr} ${50 - 70 * cr} L${36 + 80 * cr} ${50 - 130 * cr}`} stroke={C.ink} strokeWidth={7} fill="none" /></>;
  };
  return (
    <Paper><Cam t={t} d={d} from={z} to={z * 1.04} ox={ox} oy={50}>
      {v === 0 ? <Banner text="What set it off?" t={t} col={C.blue} y={130} /> : null}
      {P.map((p, i) => <At key={i} x={p.x} y={520} s={v === 0 ? pop(t, i * 6) : 1} o={v && focus !== i ? 0.35 : 1}>
        <div style={{ width: 470, background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 22, boxShadow: `0 12px 0 ${C.ink}`, padding: "26px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <svg width={280} height={240} viewBox="-140 -130 280 240"><rect x={-130} y={-125} width={260} height={225} fill="#d8d0dc" stroke={C.ink} strokeWidth={8} />{anim(i)}</svg>
          <T size={36}>{p.l}</T><T size={32} w={800} col={C.red}>{p.s}</T>
          {v === 0 ? <T size={70} col={C.red}>?</T> : null}
        </div></At>)}
    </Cam></Paper>
  );
};
const clock: React.FC<G> = ({ t, d, c }) => {
  const a = c(64, "12:30") - 6, u = ease(k(t, a, 14)), mins = lerp(0, 30, u), hrs = 12 + mins / 60;
  return (
    <Paper><Cam t={t} d={d}>
      <At x={560} y={420} s={pop(t, 0)}><div style={{ width: 520, background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 18, overflow: "hidden", boxShadow: `0 14px 0 ${C.ink}` }}>
        <div style={{ background: C.red, padding: "16px 0", textAlign: "center" }}><T size={56} col="#fff">January 1919</T></div>
        <div style={{ padding: "26px 0", textAlign: "center" }}><T size={230}>15</T></div></div></At>
      <Svg>
        <g opacity={k(t, 6, 8)}>
          <circle cx={1360} cy={420} r={240} fill="#fffaf0" stroke={C.ink} strokeWidth={12} />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M1360 200 L1360 232" stroke={C.ink} strokeWidth={10} transform={`rotate(${i * 30} 1360 420)`} />)}
          <path d="M1360 420 L1360 280" stroke={C.ink} strokeWidth={16} strokeLinecap="round" transform={`rotate(${hrs * 30} 1360 420)`} />
          <path d="M1360 420 L1360 230" stroke={C.red} strokeWidth={12} strokeLinecap="round" transform={`rotate(${mins * 6} 1360 420)`} />
        </g>
      </Svg>
      <At x={1360} y={730} s={pop(t, a + 10)}><T size={70}>12:30 p.m.</T></At>
    </Cam></Paper>
  );
};
const wavestats: React.FC<G> = ({ t, d, c }) => {
  const w = ease(k(t, c(72, "160") - 10, 16));
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
      <Svg>
        <path d={`M${960 - 700 * w} 760 Q${960 - 600 * w} 420 ${960 - 200 * w} 360 Q960 330 ${960 + 200 * w} 360 Q${960 + 600 * w} 420 ${960 + 700 * w} 760 Z`} fill={C.mol} stroke={C.ink} strokeWidth={10} />
        <path d="M120 760 L1800 760" stroke={C.ink} strokeWidth={10} />
        <path d="M200 760 L200 350 M175 350 L225 350" stroke={C.red} strokeWidth={10} />
        {w > 0 ? <path d={`M${960 - 700 * w} 830 L${960 + 700 * w} 830`} stroke={C.blue} strokeWidth={10} /> : null}
      </Svg>
      <At x={320} y={300} s={pop(t, 0)}><T size={70} col={C.red}>25 ft high</T></At>
      <At x={1100} y={200} s={pop(t, c(72, "160") - 2)}><T size={100} col={C.blue} style={{ textShadow: `0 6px 0 ${C.ink}` }}>160 ft wide</T></At>
    </Cam></Paper>
  );
};
const runner: React.FC<G> = ({ t, d }) => {
  const u = 0.8 * ease(k(t, 2, d - 6));
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>
        {[360, 640].map((y) => <path key={y} d={`M200 ${y + 80} L1720 ${y + 80}`} stroke={C.ink} strokeWidth={6} strokeDasharray="30 20" />)}
        <path d={`M200 640 L${300 + 1300 * u} 640 Q${360 + 1300 * u} 640 ${380 + 1300 * u} 720 L200 720 Z`} fill={C.mol} stroke={C.ink} strokeWidth={8} />
      </Svg>
      <At x={300 + 700 * u} y={380}><Icon kind="person" s={170} /></At>
      <At x={360 + 1300 * u} y={560} o={k(t, 4)}><T size={70} col={C.red}>35 mph</T></At>
      <At x={960} y={140} s={pop(t, 0)}><T size={72}>Faster than you can run</T></At>
    </Cam></Paper>
  );
};
const floodmap: React.FC<G> = ({ t, d, c }) => {
  const u = easeOut(k(t, 0, c(81, "deep") + 6));
  return (
    <AbsoluteFill><Cam t={t} d={d} from={1.35} to={1.2} ox={63} oy={46}>
      <BostonMap>
        <path d={`M${MAP_TANK.x - 120} ${MAP_TANK.y + 30} m${-180 * u} 0 q${40 * u} ${-140 * u} ${160 * u} ${-120 * u} q${150 * u} ${10 * u} ${170 * u} ${120 * u} q${10 * u} ${140 * u} ${-150 * u} ${160 * u} q${-170 * u} ${10 * u} ${-180 * u} ${-160 * u} Z`} fill={C.mol} opacity={0.85} stroke={C.ink} strokeWidth={5} />
        <circle cx={MAP_TANK.x} cy={MAP_TANK.y} r={16} fill={C.red} stroke={C.ink} strokeWidth={5} />
      </BostonMap>
    </Cam>
      <At x={960} y={130} s={pop(t, c(81, "2") - 4)}><div style={{ background: "#fffaf0", border: `6px solid ${C.ink}`, borderRadius: 12, padding: "10px 30px" }}><T size={60} col={C.mol2}>Several blocks · 2–3 ft deep</T></div></At>
    </AbsoluteFill>
  );
};

// ---------------- 5. why it was so deadly ----------------
const cold: React.FC<G> = ({ t, d }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #e8f1f8 0%, #9fc3d9 80%)" }}><Cam t={t} d={d} from={1.1} to={1.0}>
    <At x={960} y={360} s={pop(t, 0)} r={t * 0.6}><T size={300} col="#fff" style={{ textShadow: `0 10px 0 ${C.blue}` }}>❄</T></At>
    <At x={960} y={690} s={pop(t, 6)}><T size={110} col={C.ink}>It's the cold</T></At>
  </Cam></AbsoluteFill>
);
const viscosity: React.FC<G> = ({ t, d, c }) => {
  const cool = ease(k(t, c(86, "winter") - 6, 30)), px = lerp(1500, 520, cool), py = 645 - 420 * Math.pow(cool, 1.6);
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>
        <path d="M400 700 L1620 700 M400 700 L400 160" stroke={C.ink} strokeWidth={10} />
        <path d="M420 210 Q700 560 1580 650" fill="none" stroke={C.mol2} strokeWidth={14} />
        <circle cx={px} cy={py} r={34} fill={cool > 0.5 ? C.blue : C.red} stroke={C.ink} strokeWidth={8} />
      </Svg>
      <At x={1010} y={760}><T size={44}>Colder ←   temperature   → warmer</T></At>
      <At x={250} y={470} r={-90}><T size={44}>Thicker</T></At>
      <At x={1150} y={120} s={pop(t, 0)}><T size={70} col={C.mol2}>Thicker as it cools</T></At>
      <At x={1460} y={600} o={k(t, c(86, "flows") - 4, 8) * (1 - cool)}><T size={48} col={C.red}>flows easily</T></At>
      <At x={820} y={300} o={k(t, c(86, "set") - 4, 8)}><T size={48} col={C.blue}>starts to set</T></At>
    </Cam></Paper>
  );
};
const harvard: React.FC<G> = ({ t, d, c, v }) => (
  <Paper><Cam t={t} d={d}>
    {v === 0 ? <NameCard name="Harvard, 2016" role="Rebuilt the disaster" t={t} at={0} roleAt={c(87, "rebuilt") - 4} col={C.red} icon={<Icon kind="doc" s={170} />} /> : <>
      <Banner text="How they rebuilt it" t={t} col={C.red} />
      {([["map", "Old maps", "maps"], ["cloud", "Weather records", "weather"], ["model", "A scale model", "scale"]] as const).map(([ic, l, w], i) =>
        <Node key={l} x={420 + i * 540} y={500} s={pop(t, c(87, w) - 6)} icon={ic} label={l} />)}
    </>}
  </Cam></Paper>
);
const spreadcool: React.FC<G> = ({ t, d, c }) => {
  const s = easeOut(k(t, 0, c(88, "fast") + 10)), cl = ease(k(t, c(88, "cooled") - 8, 30));
  const col = `rgb(${Math.round(lerp(190, 70, cl))},${Math.round(lerp(100, 34, cl))},${Math.round(lerp(30, 14, cl))})`;
  return (
    <Paper tone="#dccfae"><Cam t={t} d={d} from={1.0} to={1.08}>
      <Svg>
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={250 + (i % 3) * 520} y={i < 3 ? 160 : 560} width={380} height={300} fill="#c9b48a" stroke={C.ink} strokeWidth={4} opacity={0.6} />)}
        <path d={`M960 500 m${-760 * s} 0 q${80 * s} ${-280 * s} ${380 * s} ${-300 * s} q${400 * s} ${-20 * s} ${760 * s} ${40 * s} q${360 * s} ${80 * s} ${380 * s} ${260 * s} q${-40 * s} ${200 * s} ${-420 * s} ${200 * s} q${-460 * s} 0 ${-720 * s} ${-60 * s} Z`} fill={col} opacity={0.92} />
        {cl < 0.6 ? [0, 1, 2, 3].map((i) => <ellipse key={i} cx={760 + i * 120} cy={460 + (i % 2) * 40} rx={50} ry={12} fill="#fff" opacity={0.35 * (1 - cl) * s} />) : null}
        <rect x={900} y={430} width={120} height={140} fill="#9a929e" stroke={C.ink} strokeWidth={6} />
      </Svg>
      <At x={420} y={110} s={pop(t, c(88, "spread") - 4)}><T size={64} col={C.red}>Spread fast</T></At>
      <At x={1460} y={110} s={pop(t, c(88, "cooled") - 4)}><T size={64} col={C.blue}>Cooled · thickened</T></At>
    </Cam></Paper>
  );
};
const memorial: React.FC<G> = ({ t, d, c }) => (
  <AbsoluteFill style={{ background: "#2a2430" }}><Cam t={t} d={d} from={1.0} to={1.04}>
    <Big n="21" label="people died" t={t} at={c(92, "21") - 6} x={960} y={300} size={240} col="#f6efdc" lcol="#cfc6d4" />
    <At x={960} y={560} o={k(t, c(93, "10") - 6, 10)}><T size={72} col="#f6efdc">Ages 10 to 78</T></At>
    <At x={960} y={680} o={k(t, c(94, "150") - 6, 10)}><T size={56} w={800} col="#cfc6d4">About 150 more injured</T></At>
  </Cam></AbsoluteFill>
);
const cadets: React.FC<G> = ({ t, d, c }) => {
  const a = c(97, "116") - 6, n = count(t, a, a + 36, 0, 116);
  return (
    <Paper><Cam t={t} d={d}>
      <At x={480} y={330} s={pop(t, a - 4)}><T size={230} col={C.blue} style={{ textShadow: `0 10px 0 ${C.ink}` }}>{n}</T></At>
      <At x={480} y={500} o={k(t, a + 6)}><T size={70}>cadets</T></At>
      <At x={480} y={590} o={k(t, 0)}><T size={40} w={800} col={C.grey}>USS Nantucket</T></At>
      <Svg>{Array.from({ length: n }, (_, i) => { const x = 980 + (i % 12) * 66, y = 170 + Math.floor(i / 12) * 62; return <g key={i}><circle cx={x} cy={y} r={14} fill={C.blue} /><rect x={x - 16} y={y + 16} width={32} height={30} rx={8} fill={C.blue} /></g>; })}</Svg>
    </Cam></Paper>
  );
};
const fourdays: React.FC<G> = ({ t, d, c }) => {
  const a = c(101, "four") - 10, n = Math.max(1, Math.min(4, Math.floor((t - a) / 6) + 1));
  return (
    <Paper tone="#ddd2bc"><Cam t={t} d={d}>
      {Array.from({ length: n }, (_, i) => <At key={i} x={600 + i * 60} y={420 + i * 10} r={(i - 1.5) * 4} s={pop(t, a + i * 6, 6)}>
        <div style={{ width: 380, background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 14, overflow: "hidden" }}><div style={{ background: C.ink, padding: "10px 0", textAlign: "center" }}><T size={40} col="#fff">January</T></div>
          <div style={{ padding: "20px 0", textAlign: "center" }}><T size={150}>{15 + i}</T></div></div></At>)}
      <At x={1450} y={430} s={pop(t, a + 26)}><T size={150} col={C.ink}>4 days</T></At>
      <At x={1450} y={560} o={k(t, a + 32)}><T size={48} w={800} col={C.grey}>of searching</T></At>
    </Cam></Paper>
  );
};

// ---------------- 6. the cleanup ----------------
const STEPS: [number, number][] = [[0, 0], [60, -50], [130, -60], [200, -110], [260, -140], [330, -130], [400, -180], [470, -230], [540, -220], [600, -270]];
const footprints: React.FC<G> = ({ t, d, v }) => {
  const trails = v ? [[-1.5, 0.2], [-1.2, -0.9], [-1.6, 0.8], [-0.5, -1.4], [-0.9, 1.3]] : [[-1.4, -0.6]];
  return (
    <AbsoluteFill><Cam t={t} d={d} from={v ? 1.0 : 1.4} to={v ? 1.04 : 1.3} ox={63} oy={46}>
      <BostonMap>
        <circle cx={MAP_TANK.x} cy={MAP_TANK.y} r={20} fill={C.mol} stroke={C.ink} strokeWidth={5} />
        {trails.map(([sx, sy], j) => STEPS.map(([x, y], i) => {
          const o = k(t, i * 4 + j * 3, 4); const px = MAP_TANK.x + x * sx + (i % 2) * 14 * sy, py = MAP_TANK.y - y * sy + (i % 2) * 14 * sx;
          return <ellipse key={`${j}_${i}`} cx={px} cy={py} rx={12} ry={20} fill={C.mol} opacity={0.85 * o} transform={`rotate(${Math.atan2(-y * sy, x * sx) * 57 + 90} ${px} ${py})`} />;
        }))}
      </BostonMap>
    </Cam>
      <At x={960} y={130} s={pop(t, 4)}><div style={{ background: "#fffaf0", border: `6px solid ${C.ink}`, borderRadius: 12, padding: "12px 34px" }}><T size={54} col={C.mol2}>{v ? "Tracked everywhere" : "The molasses traveled"}</T></div></At>
    </AbsoluteFill>
  );
};
const sticky: React.FC<G> = ({ t, d }) => (
  <Paper><Cam t={t} d={d}>
    <At x={960} y={420} s={pop(t, 0)}><div style={{ maxWidth: 1400, textAlign: "center" }}>
      <T size={200} col={C.mol2} style={{ lineHeight: 0.6 }}>“</T>
      <T size={86} up={false} style={{ whiteSpace: "normal" }}>Everything that a Bostonian touched was sticky.</T>
      <T size={40} w={800} col={C.grey} style={{ marginTop: 30 }}>— one report</T></div></At>
  </Cam></Paper>
);
const harborbrown: React.FC<G> = ({ t, d, c }) => {
  const b = ease(k(t, 0, 30)), sm = k(t, c(115, "summer") - 8, 12);
  const col = `rgb(${Math.round(lerp(159, 122, b))},${Math.round(lerp(195, 82, b))},${Math.round(lerp(217, 40, b))})`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], m = Math.min(5, Math.floor(lerp(0, 5.99, ease(k(t, 20, Math.max(20, c(115, "summer") - 20))))));
  return (
    <AbsoluteFill style={{ background: col }}><Cam t={t} d={d}>
      <Svg>{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M0 ${300 + i * 130} Q480 ${270 + i * 130 + Math.sin(t / 10 + i) * 10} 960 ${300 + i * 130} T1920 ${300 + i * 130}`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.25} />)}
        <path d="M0 0 L1920 0 L1920 140 Q1500 200 960 160 Q400 120 0 180 Z" fill={C.land} stroke={C.ink} strokeWidth={8} /></Svg>
      <At x={960} y={110}><T size={60}>Boston Harbor</T></At>
      <At x={1640} y={480} s={pop(t, 16)}><div style={{ width: 300, background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ background: sm > 0 ? C.yellow : C.ink, padding: "8px 0", textAlign: "center" }}><T size={36} col={sm > 0 ? C.ink : "#fff"}>1919</T></div>
        <div style={{ padding: "20px 0", textAlign: "center" }}><T size={120}>{months[m]}</T></div></div></At>
      <At x={740} y={520} s={pop(t, c(115, "brown") - 4)}><T size={92} col="#f6efdc" style={{ textShadow: `0 6px 0 ${C.ink}` }}>Brown until summer</T></At>
    </Cam></AbsoluteFill>
  );
};

// ---------------- 7. the anarchist defense ----------------
const lawsuit: React.FC<G> = ({ t, d, c, v }) => (
  <Paper><Cam t={t} d={d}>
    <Svg>{Array.from({ length: 40 }, (_, i) => { const x = 160 + (i % 8) * 92, y = 230 + Math.floor(i / 8) * 104, o = v ? 1 : k(t, i * 0.8, 4); return <g key={i} opacity={o}><circle cx={x} cy={y} r={20} fill={[C.blue, C.red, C.green, C.mol2][i % 4]} /><rect x={x - 22} y={y + 22} width={44} height={44} rx={10} fill={[C.blue, C.red, C.green, C.mol2][i % 4]} /></g>; })}</Svg>
    <At x={500} y={130} s={v ? 1 : pop(t, c(118, "hundred") - 6)}><T size={70}>100+ people sued</T></At>
    <At x={1450} y={430} s={v ? 1 : pop(t, c(118, "United") - 6)}><div style={{ background: C.blue, border: `8px solid ${C.ink}`, borderRadius: 18, padding: "34px 40px", textAlign: "center", boxShadow: `0 12px 0 ${C.ink}` }}>
      <T size={44} col="#fff">U.S. Industrial</T><T size={44} col="#fff">Alcohol Co.</T></div></At>
    <At x={960} y={430} o={v ? 1 : k(t, c(118, "United"), 8)}><T size={90} col={C.red}>vs</T></At>
    {v ? <Stamp text="Class action" sub="one of the first in Massachusetts" t={t} at={c(118, "class") - 4} x={960} y={620} size={110} r={-6} /> : null}
  </Cam></Paper>
);
const bomb: React.FC<G> = ({ t, d, c }) => (
  <AbsoluteFill style={{ background: "#2f5fb5" }}><Cam t={t} d={d}>
    <Svg>
      <defs><pattern id="grid2" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="#5a86d4" strokeWidth={2} /></pattern></defs>
      <rect width={1920} height={1080} fill="url(#grid2)" />
      <rect x={660} y={300} width={600} height={440} fill="none" stroke="#fff" strokeWidth={8} />
      <path d="M720 740 L640 800 M1200 740 L1280 800" stroke="#fff" strokeWidth={6} strokeDasharray="12 10" />
    </Svg>
    <At x={960} y={600} s={pop(t, c(120, "bomb") - 6)}><Icon kind="bomb" s={260} /></At>
    <At x={960} y={120} s={pop(t, 0)}><T size={60} col="#fff">The company's claim</T></At>
    <At x={960} y={220} s={pop(t, c(120, "anarchists") - 6)}><T size={84} col={C.yellow} style={{ textShadow: `0 6px 0 ${C.ink}` }}>Anarchists planted a bomb</T></At>
  </Cam></AbsoluteFill>
);
const warlink: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d}>
    <Node x={460} y={460} s={pop(t, 0)} icon="barrel" label="Molasses" col="#f3dcc0" />
    <Node x={960} y={460} s={pop(t, c(120, "alcohol") - 4)} icon="flask" label="Alcohol" />
    <Node x={1460} y={460} s={pop(t, c(120, "explosives") - 6)} icon="shell" label="War explosives" />
    <Svg>{arrow(610, 420, 800, 420, k(t, c(120, "alcohol"), 8), C.mol2)}{arrow(1110, 420, 1300, 420, k(t, c(120, "explosives") - 2, 8), C.red)}</Svg>
    <At x={960} y={130} s={pop(t, c(120, "explosives") + 8)}><T size={64} col={C.red}>A reason to target it?</T></At>
  </Cam></Paper>
);
const headlines: React.FC<G> = ({ t, d, v }) => {
  const papers = v ? [["BOMB PLOT FEARED", -6, 560, 360], ["POLICE ON ALERT", 5, 1300, 420], ["ANARCHIST SCARE", -2, 940, 640]] : [["ANARCHIST BOMBINGS", -4, 760, 400], ["CITY ON EDGE", 6, 1260, 560]];
  return (
    <AbsoluteFill style={{ background: "#3a3036" }}><Cam t={t} d={d} from={1.0} to={1.08}>
      {papers.map(([h, r, x, y], i) => <At key={i} x={x as number} y={y as number} r={r as number} s={pop(t, i * 10, 8)}>
        <div style={{ width: 760, background: "#efe6d0", border: `5px solid ${C.ink}`, padding: "20px 34px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          <div style={{ borderBottom: `4px double ${C.ink}`, textAlign: "center", paddingBottom: 6 }}><T size={28} style={{ fontFamily: "Georgia, serif", letterSpacing: 6 }}>1919</T></div>
          <T size={66} style={{ fontFamily: "Georgia, serif", textAlign: "center", marginTop: 12, whiteSpace: "normal" }}>{h}</T>
          {[0, 1, 2].map((j) => <div key={j} style={{ height: 10, background: "rgba(36,23,38,0.35)", margin: "10px 0", width: `${92 - j * 14}%` }} />)}
        </div></At>)}
      <At x={960} y={110} o={0.9}><T size={30} w={800} col="#cfc6d4" up={false}>Illustrative headlines</T></At>
    </Cam></AbsoluteFill>
  );
};
const mailbombs: React.FC<G> = ({ t, d, c }) => {
  const dests = [[150, 220], [260, 330], [420, 180], [560, 300], [690, 260], [780, 360], [860, 160], [620, 420], [360, 420], [480, 120]];
  const a = c(123, "mailed") - 10;
  return (
    <Paper><Cam t={t} d={d}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}><g transform="translate(460 240) scale(1.0)">
        <path d={US_PATH} fill={C.land} stroke={C.ink} strokeWidth={7} />
        {dests.map(([x, y], i) => { const u = ease(k(t, a + i * 3, 18)), sx = 860, sy = 140; return <g key={i}>
          <circle cx={x} cy={y} r={10} fill={C.red} opacity={u >= 1 ? 1 : 0} />
          {u > 0 && u < 1 ? <g transform={`translate(${lerp(sx, x, u) - 22} ${lerp(sy, y, u) - 16 - 60 * Math.sin(u * Math.PI)}) scale(0.44)`}><Icon kind="envelope" s={100} /></g> : null}</g>; })}
      </g></svg>
      <At x={960} y={110} s={pop(t, 0)}><T size={66}>1919: bombs in the mail</T></At>
      <At x={960} y={190} o={k(t, c(123, "officials") - 4, 8)}><T size={46} col={C.red}>to officials across the country</T></At>
    </Cam></Paper>
  );
};
const ogden: React.FC<G> = ({ t, d }) => (
  <Paper><Cam t={t} d={d}>
    <NameCard name="Hugh Ogden" role="Court-appointed auditor" t={t} at={0} col={C.mol2} icon={<Icon kind="doc" s={170} />} extra="Lawyer and war veteran" extraAt={8} />
  </Cam></Paper>
);
const years: React.FC<G> = ({ t, d }) => {
  const y = count(t, 0, Math.max(10, d - 4), 1919, 1925);
  return (
    <Paper><Cam t={t} d={d} from={1.1} to={1.0}>
      <Big n={String(y)} label="It took years" t={t} at={0} x={960} y={420} size={260} col={C.ink} />
    </Cam></Paper>
  );
};
const WIT: [string, string][] = [["gear", "Engineers"], ["bomb", "Explosives experts"], ["family", "Survivors"], ["worker", "Company employees"]];
const witnesses: React.FC<G> = ({ t, d, c, v }) => {
  if (v === 0) {
    const n = Math.min(180, Math.floor(lerp(0, 60, k(t, 0, c(127, "testified"))) + lerp(0, 120, k(t, c(127, "thousands") - 6, 20))));
    return (
      <Paper><Cam t={t} d={d} from={1.1} to={1.0}>
        <Svg>{Array.from({ length: n }, (_, i) => { const x = 120 + (i % 30) * 58, y = 260 + Math.floor(i / 30) * 86; return <g key={i}><circle cx={x} cy={y} r={14} fill={[C.blue, C.red, C.green, C.mol2, C.grey][i % 5]} /><rect x={x - 16} y={y + 16} width={32} height={34} rx={8} fill={[C.blue, C.red, C.green, C.mol2, C.grey][i % 5]} /></g>; })}</Svg>
        <At x={960} y={130} s={pop(t, 0)}><T size={74}>Hundreds of witnesses</T></At>
        <At x={960} y={790} s={pop(t, c(127, "thousands") - 4)}><T size={60} col={C.red}>…by some counts, thousands</T></At>
      </Cam></Paper>
    );
  }
  const [ic, l] = WIT[v - 1];
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.08}>
      <div style={{ position: "absolute", top: 80, width: 1920, display: "flex", justifyContent: "center", gap: 26 }}>
        {WIT.slice(0, v - 1).map(([, x]) => <div key={x} style={{ background: "#fffaf0", border: `5px solid ${C.ink}`, borderRadius: 40, padding: "8px 26px" }}><T size={32}>{x}</T></div>)}
      </div>
      <At x={960} y={430} s={pop(t, 0, 7)}><div style={{ display: "flex", alignItems: "center", gap: 40 }}><Icon kind={ic} s={280} /><T size={110}>{l}</T></div></At>
    </Cam></Paper>
  );
};
const pages: React.FC<G> = ({ t, d }) => {
  const h = easeOut(k(t, 0, d - 6));
  return (
    <Paper><Cam t={t} d={d}>
      <Svg>{[0, 1, 2, 3, 4].map((i) => { const H = (200 + i * 70) * h; return <g key={i}>
        <rect x={300 + i * 280} y={780 - H} width={220} height={H} fill="#fffaf0" stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: Math.floor(H / 16) }, (_, j) => <path key={j} d={`M${300 + i * 280} ${780 - j * 16} l220 0`} stroke="#c9b48a" strokeWidth={3} />)}</g>; })}</Svg>
      <At x={960} y={130} s={pop(t, 0)}><T size={68}>Tens of thousands of pages</T></At>
    </Cam></Paper>
  );
};
const facts: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} ox={30}>
    <Banner text="What the testimony showed" t={t} col={C.mol2} />
    <At x={260} y={300} center={false}><div>
      <Row text="No engineering training" t={t} at={c(134, "no") - 6} mark="x" markAt={c(134, "training") - 2} size={76} />
      <Row text="Never tested with water" t={t} at={c(134, "never") - 6} mark="x" markAt={c(134, "water") - 2} size={76} />
    </div></At>
  </Cam></Paper>
);
const ruling: React.FC<G> = ({ t, d, c, v }) => (
  <Paper><Cam t={t} d={d} from={v === 0 ? 1.0 : 1.03} to={v === 0 ? 1.06 : 1.06} ox={40}>
    <At x={600} y={430} s={v === 0 ? pop(t, 0) : 1}><div style={{ width: 700, height: 600, background: "#fffaf0", border: `8px solid ${C.ink}`, padding: "40px 50px", boxShadow: `0 14px 0 ${C.ink}` }}>
      <T size={54}>Auditor's report</T><T size={40} w={800} col={C.grey}>Hugh Ogden · 1925</T>
      {Array.from({ length: 7 }, (_, j) => <div key={j} style={{ height: 14, background: "rgba(36,23,38,0.3)", margin: "22px 0", width: `${94 - (j % 3) * 14}%` }} />)}
    </div></At>
    {v === 0 ? <At x={1420} y={430} s={pop(t, c(135, "six") - 4)}><T size={84} col={C.red}>6 years later</T></At> : null}
    {v >= 1 ? <Stamp text="No bomb" t={t} at={v === 1 ? c(136, "bomb") - 4 : -20} x={600} y={380} size={130} /> : null}
    {v === 2 ? <At x={990} y={300} center={false}><div>
      <Row text="Tank too weak" t={t} at={c(137, "weak") - 8} mark="check" markAt={c(137, "weak")} size={48} />
      <Row text="Company responsible" t={t} at={c(137, "responsible") - 10} mark="check" markAt={c(137, "responsible") - 2} size={48} />
    </div></At> : null}
  </Cam></Paper>
);
const money: React.FC<G> = ({ t, d, c, v }) => {
  if (v === 0) { const a = c(138, "628000") - 6, n = count(t, a, a + 24, 0, 628000);
    return <Paper><Cam t={t} d={d}><At x={960} y={400} o={k(t, a - 2, 4)}><T size={210} col={C.green} style={{ textShadow: `0 10px 0 ${C.ink}` }}>${fmt(n)}</T></At>
      <At x={960} y={590} o={k(t, c(138, "settle") - 4, 8)}><T size={64}>to settle the claims</T></At></Cam></Paper>; }
  if (v === 1) return <Paper><Cam t={t} d={d}><At x={960} y={300}><T size={90} col={C.grey}>$628,000 in 1925</T></At>
    <At x={960} y={520} s={pop(t, c(139, "11") - 6)}><T size={170} col={C.green} style={{ textShadow: `0 8px 0 ${C.ink}` }}>≈ $11 million</T></At>
    <At x={960} y={680} o={k(t, c(139, "today") - 4)}><T size={64}>today</T></At></Cam></Paper>;
  return <Paper tone="#e6dcc6"><Cam t={t} d={d}><At x={960} y={360} s={pop(t, 0)}><T size={190} col={C.ink}>≈ $7,000</T></At>
    <At x={960} y={560} o={k(t, 8)}><T size={60}>to each family of those who died</T></At></Cam></Paper>;
};

// ---------------- 8. what changed ----------------
const plans: React.FC<G> = ({ t, d, c, v }) => {
  const zoom = v === 1 ? [1.5, 1.6, 74, 74] : v === 3 ? [1.25, 1.35, 74, 72] : [1.0, 1.05, 50, 45];
  const calc = v >= 2 ? k(t, v === 2 ? c(143, "calculations") - 8 : -40, 30) : 0;
  return (
    <AbsoluteFill style={{ background: "#2f5fb5" }}><Cam t={t} d={d} from={zoom[0]} to={zoom[1]} ox={zoom[2]} oy={zoom[3]}>
      <Svg>
        <defs><pattern id="grid3" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="#5a86d4" strokeWidth={2} /></pattern></defs>
        <rect width={1920} height={1080} fill="url(#grid3)" />
        <rect x={260} y={140} width={760} height={620} fill="none" stroke="#fff" strokeWidth={6} />
        <ellipse cx={640} cy={450} rx={240} ry={240} fill="none" stroke="#fff" strokeWidth={6} />
        <rect x={1100} y={140} width={560} height={620} fill="none" stroke="#fff" strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M1140 ${210 + i * 60} l${380 * clamp01(calc * 6 - i)} 0`} stroke={C.yellow} strokeWidth={8} />)}
        <path d="M1140 690 L1620 690" stroke="#fff" strokeWidth={5} />
      </Svg>
      <At x={1180} y={720} center={false}><T size={30} col="#fff">Engineer:</T></At>
      {v >= 2 ? <At x={1300} y={240} o={calc}><T size={34} col={C.yellow}>calculations</T></At> : null}
      {v === 1 ? <At x={1500} y={640} s={pop(t, c(142, "checking") - 6)}><T size={80} col={C.yellow}>?</T></At> : null}
      {v === 3 ? <>
        <Svg><path d={`M1300 ${700} q30 -40 60 0 t60 0 t60 0 t60 0`} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray={600} strokeDashoffset={600 * (1 - k(t, c(143, "signed") - 4, 14))} /></Svg>
        <Stamp text="Sealed" sub="licensed engineer" t={t} at={c(143, "sealed") - 4} x={1520} y={560} size={70} col={C.yellow} r={-10} />
      </> : null}
    </Cam>
      {v === 0 ? <At x={960} y={90} s={pop(t, 0)}><T size={64} col="#fff" style={{ textShadow: `0 5px 0 ${C.ink}` }}>Before the flood</T></At> : null}
      {v === 1 ? <At x={960} y={90} o={k(t, c(142, "checking") - 4)}><T size={64} col={C.yellow} style={{ textShadow: `0 5px 0 ${C.ink}` }}>Nobody checked the math</T></At> : null}
      {v >= 2 ? <At x={960} y={90} s={v === 2 ? pop(t, 0) : 1}><T size={64} col="#fff" style={{ textShadow: `0 5px 0 ${C.ink}` }}>After the flood</T></At> : null}
    </AbsoluteFill>
  );
};
const spread: React.FC<G> = ({ t, d }) => {
  const dots = [[860, 120], [700, 200], [560, 280], [420, 160], [300, 300], [180, 220], [760, 330], [640, 420], [480, 400], [820, 250], [380, 250], [250, 370]];
  return (
    <Paper><Cam t={t} d={d}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}><g transform="translate(410 200) scale(1.1)">
        <path d={US_PATH} fill={C.land} stroke={C.ink} strokeWidth={7} />
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={18 * pop(t, 6 + i * 4)} fill={C.blue} stroke={C.ink} strokeWidth={4} />)}
        <circle cx={880} cy={110} r={24} fill={C.red} stroke={C.ink} strokeWidth={5} />
      </g></svg>
      <At x={960} y={110} s={pop(t, 0)}><T size={64}>Rules spread across the country</T></At>
    </Cam></Paper>
  );
};

// ---------------- 9. still there ----------------
const radar: React.FC<G> = ({ t, d, c, v }) => {
  const sweep = v === 0 ? ease(k(t, 10, d - 10)) : 1, ring = v === 1 ? ease(k(t, 0, 24)) : 0;
  return (
    <AbsoluteFill style={{ background: "#5d8a4a" }}><Cam t={t} d={d} from={v ? 1.1 : 1.0} to={v ? 1.18 : 1.06}>
      <Svg><g transform="translate(960 440) scale(0.82) translate(-960 -480)">
        <path d="M960 820 L620 480 L960 140 L1300 480 Z" fill="#c9965a" />
        <path d="M960 760 L680 480 L960 200 L1240 480 Z" fill="#6f9a52" />
        {[[960, 820], [620, 480], [960, 140], [1300, 480]].map(([x, y], i) => <rect key={i} x={x - 18} y={y - 18} width={36} height={36} fill="#fff" />)}
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M560 ${200 + i * 46} L${560 + 800 * clamp01(sweep * 14 - i)} ${200 + i * 46}`} stroke={C.yellow} strokeWidth={6} opacity={0.7} />)}
        {ring > 0 ? <circle cx={960} cy={480} r={330} fill="none" stroke={C.red} strokeWidth={16} strokeDasharray={2075} strokeDashoffset={2075 * (1 - ring)} /> : null}
      </g></Svg>
    </Cam>
      {v === 0 ? <At x={960} y={90} s={pop(t, 0)}><div style={{ background: "#fffaf0", border: `6px solid ${C.ink}`, borderRadius: 12, padding: "10px 30px" }}><T size={52}>2019 · 100 years on</T></div></At> : null}
      {v === 0 ? <At x={1480} y={700} o={k(t, c(150, "radar") - 4)}><T size={40} col="#fff" style={{ textShadow: `0 3px 0 ${C.ink}` }}>Ground-penetrating radar</T></At> : null}
      {v === 1 ? <At x={960} y={90} s={pop(t, c(151, "base") - 4)}><div style={{ background: "#fffaf0", border: `6px solid ${C.ink}`, borderRadius: 12, padding: "10px 30px" }}><T size={52} col={C.red}>The tank's concrete base</T></div></At> : null}
      {v === 1 ? <At x={1500} y={640} s={pop(t, c(151, "20") - 4)}><T size={80} col="#fff" style={{ textShadow: `0 5px 0 ${C.ink}` }}>~20 in down</T></At> : null}
    </AbsoluteFill>
  );
};
const recap: React.FC<G> = ({ t, d, c }) => (
  <Dark><Cam t={t} d={d}>
    {([["Warning signs", c(153, "warning")], ["A coat of brown paint", c(153, "coat")], ["21 lives", c(153, "21")]] as const).map(([l, a], i) =>
      <At key={l} x={960} y={250 + i * 190} s={pop(t, a - 4)}><T size={i === 2 ? 120 : 84} col={i === 2 ? C.yellow : "#f6efdc"} style={{ textShadow: `0 6px 0 #000` }}>{l}</T></At>)}
  </Cam></Dark>
);

export const BOARDS: Record<string, React.FC<G>> = {
  count21, headline, title, nofix, sued, whatfor, warmap, chain, caribbean, company, pipeline, northend, neighborhood, scale, gallons,
  jellcard, notrain, deadline, corners, watertest, heavier, pressure, mayville, wallcut, manganese, rivets,
  groan, reports, response, blend, sept1918,
  thermo, layers, triggers, clock, wavestats, runner, floodmap,
  cold, viscosity, harvard, spreadcool, memorial, cadets, fourdays,
  footprints, sticky, harborbrown,
  lawsuit, bomb, warlink, headlines, mailbombs, ogden, years, witnesses, pages, facts, ruling, money,
  plans, spread, radar, recap,
};
