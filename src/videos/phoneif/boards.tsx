// The 1850 phone long-form's 2D boards. Each takes G (t = frame in shot, d = shot length, c(seg, word) = a word's onset in
// shot frames, v = variant) and builds on the narration's words. Content stays above y = 800 (captions below). Every board
// has a camera move of its own (Mv) and shows something from its first frame.
// The running device is the phone itself (PhoneBoard): the same handset, its screen telling the story (no bars, the
// spinning dot, recording, 40%, airplane mode, 1%). Colour code: blue = the phone and 2026, red = failed / danger,
// green = what works, gold = 1850.
import React from "react";
import { C, G, Paper, At, T, Banner, Stamp, Row, k, pop, ease, lerp, clamp01, US_PATH } from "../pigwarlong/kit";
import { say, num, card, Mv, Bg, Dark, Svg, Pill } from "../hertzlong/boards";

const INK = C.ink, NIGHT = "#101a33", BLUE = "#2f6fd0", GREEN = "#2f9a5a", RUST = "#2a1418";
const st = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const sto = { ...st, fill: "none" };

/** glyphs for this story (100 x 100 box) */
const Gl: React.FC<{ kind: string; s?: number; col?: string }> = ({ kind, s = 160, col }) => {
  const body = (() => {
    switch (kind) {
      case "jar": return <><rect x={26} y={24} width={48} height={66} rx={8} fill="#cfe6ee" {...st} /><rect x={30} y={44} width={40} height={42} rx={5} fill="#e2d26a" /><rect x={44} y={10} width={8} height={56} fill="#8a8f99" {...st} strokeWidth={4} /><rect x={58} y={14} width={5} height={14} fill={C.gold} {...st} strokeWidth={3} /></>;
      case "plug": return <><rect x={28} y={34} width={44} height={36} rx={9} fill="#f4f1ea" {...st} /><path d="M40 34 L40 16 M60 34 L60 16" {...sto} strokeWidth={8} /><path d="M50 70 Q50 92 74 94" {...sto} /></>;
      case "outlet": return <><rect x={18} y={14} width={64} height={72} rx={10} fill="#f4f1ea" {...st} /><rect x={36} y={30} width={7} height={16} rx={3} fill={INK} /><rect x={57} y={30} width={7} height={16} rx={3} fill={INK} /><circle cx={50} cy={62} r={6} fill={INK} /></>;
      case "tower": return <><path d="M36 92 L46 22 L54 22 L64 92 M40 64 L60 64 M43 44 L57 44" {...sto} /><path d="M30 18 Q50 0 70 18 M22 10 Q50 -14 78 10" {...sto} strokeWidth={5} /></>;
      case "sat": return <><rect x={38} y={38} width={24} height={24} fill={C.grey} {...st} /><rect x={4} y={42} width={30} height={16} fill={BLUE} {...st} strokeWidth={5} /><rect x={66} y={42} width={30} height={16} fill={BLUE} {...st} strokeWidth={5} /><path d="M50 62 L50 76 M42 82 Q50 72 58 82" {...sto} strokeWidth={5} /></>;
      case "key": return <><rect x={10} y={66} width={80} height={14} rx={4} fill="#8a5a3a" {...st} /><path d="M22 60 L78 52" {...sto} strokeWidth={9} /><circle cx={24} cy={56} r={9} fill={INK} /><rect x={66} y={46} width={10} height={20} fill={C.gold} {...st} strokeWidth={4} /></>;
      case "camera": return <><rect x={18} y={30} width={56} height={40} rx={4} fill="#8a5a3a" {...st} /><rect x={74} y={40} width={16} height={20} rx={3} fill={C.gold} {...st} /><path d="M30 70 L22 96 M46 70 L46 96 M62 70 L70 96" {...sto} strokeWidth={5} /></>;
      case "plate": return <><rect x={14} y={10} width={72} height={80} rx={6} fill="#c9ccd2" {...st} /><rect x={24} y={20} width={52} height={60} rx={4} fill="#9aa0a8" /><circle cx={50} cy={42} r={11} fill="#6b7078" /><path d="M32 78 Q50 52 68 78 Z" fill="#6b7078" /></>;
      case "monkey": return <><circle cx={50} cy={34} r={22} fill="#8a5a3a" {...st} /><circle cx={26} cy={30} r={9} fill="#8a5a3a" {...st} /><circle cx={74} cy={30} r={9} fill="#8a5a3a" {...st} /><ellipse cx={50} cy={42} rx={13} ry={10} fill="#e0b48a" {...st} strokeWidth={4} /><circle cx={43} cy={30} r={3.5} fill={INK} /><circle cx={57} cy={30} r={3.5} fill={INK} /><path d="M34 56 L66 56 L60 92 L40 92 Z" fill="#8a5a3a" {...st} /></>;
      case "fish": return <><path d="M12 50 Q40 20 72 50 Q40 80 12 50 Z" fill="#7a9a8a" {...st} /><path d="M72 50 L94 30 L94 70 Z" fill="#7a9a8a" {...st} /><circle cx={28} cy={46} r={4} fill={INK} /></>;
      case "chip": return <><rect x={22} y={22} width={56} height={56} rx={6} fill="#2b2f3d" {...st} />{[30, 42, 54, 66].map((p) => <g key={p}><path d={`M${p} 22 L${p} 8 M${p} 78 L${p} 92 M22 ${p} L8 ${p} M78 ${p} L92 ${p}`} {...sto} strokeWidth={5} /></g>)}<rect x={36} y={36} width={28} height={28} fill="#5d6f8f" stroke="none" /></>;
      case "cloud": return <><path d="M22 70 Q6 70 10 54 Q12 40 28 42 Q32 22 52 26 Q70 18 76 40 Q94 42 90 58 Q88 70 74 70 Z" fill={col ?? "#a9b097"} {...st} /><path d="M30 82 q5 -6 10 0 t10 0 M56 86 q5 -6 10 0 t10 0" {...sto} strokeWidth={4} stroke="#5f6a4a" /></>;
      case "drop": return <><path d="M50 8 Q78 46 78 64 Q78 90 50 90 Q22 90 22 64 Q22 46 50 8 Z" fill="#5fa3d0" {...st} /></>;
      case "hands": return <><path d="M20 90 L24 50 Q24 40 32 40 L32 22 Q38 16 42 22 L42 40 L46 16 Q52 10 56 18 L54 40 L62 22 Q68 18 70 26 L64 52 L76 44 Q84 44 80 54 L60 84 Q56 92 44 92 Z" fill="#f5c9a0" {...st} /><circle cx={78} cy={22} r={6} fill="#9fd0ea" {...st} strokeWidth={3} /><circle cx={88} cy={36} r={4} fill="#9fd0ea" {...st} strokeWidth={3} /></>;
      case "pot": return <><path d="M18 46 L82 46 L76 88 L24 88 Z" fill={C.grey} {...st} /><path d="M10 46 L90 46" {...sto} /><path d="M34 34 q4 -10 0 -18 M50 34 q4 -10 0 -18 M66 34 q4 -10 0 -18" {...sto} strokeWidth={5} /></>;
      case "pipe": return <><path d="M10 40 L60 40 L60 26 L90 26 L90 58 L72 58 L72 72 L10 72 Z" fill="#8a7a6a" {...st} /><path d="M40 72 Q40 90 26 92" {...sto} stroke="#6b5a3a" strokeWidth={8} /><path d="M78 66 L92 84 M84 62 L96 76" stroke={C.red} strokeWidth={8} strokeLinecap="round" /></>;
      case "skull": return <><path d="M24 50 Q24 14 50 14 Q76 14 76 50 Q76 62 66 66 L66 80 L34 80 L34 66 Q24 62 24 50 Z" fill="#f4f1ea" {...st} /><circle cx={40} cy={46} r={8} fill={INK} /><circle cx={60} cy={46} r={8} fill={INK} /><path d="M44 80 L44 70 M56 80 L56 70" {...sto} strokeWidth={4} /></>;
      case "notebook": return <><rect x={22} y={10} width={60} height={80} rx={4} fill="#fffaf0" {...st} /><path d="M34 30 L70 30 M34 44 L70 44 M34 58 L62 58 M34 72 L56 72" {...sto} strokeWidth={4} /><path d="M22 20 L14 20 M22 40 L14 40 M22 60 L14 60 M22 80 L14 80" {...sto} strokeWidth={5} /></>;
      case "count": return <><path d="M14 20 L14 80 M28 20 L28 80 M42 20 L42 80 M56 20 L56 80 M8 64 L64 34" {...sto} strokeWidth={8} /><path d="M76 20 L76 80 M88 20 L88 80" {...sto} strokeWidth={8} /></>;
      case "map": return <><path d="M10 20 L36 10 L64 20 L90 10 L90 82 L64 92 L36 82 L10 92 Z" fill={C.land} {...st} /><path d="M36 10 L36 82 M64 20 L64 92" {...sto} /><circle cx={50} cy={50} r={9} fill={C.red} {...st} strokeWidth={4} /></>;
      case "bulb": return <><path d="M50 8 Q82 10 82 42 Q82 58 66 70 L66 80 L34 80 L34 70 Q18 58 18 42 Q18 10 50 8 Z" fill={C.yellow} {...st} /><rect x={36} y={80} width={28} height={12} fill={C.grey} {...st} /></>;
      case "radio": return <><rect x={10} y={30} width={80} height={56} rx={10} fill="#8a5a3a" {...st} /><circle cx={34} cy={58} r={14} fill="#c9c2b0" {...st} /><rect x={56} y={46} width={24} height={8} rx={3} fill={INK} /><rect x={56} y={62} width={24} height={8} rx={3} fill={INK} /><path d="M70 30 L84 8" {...sto} /></>;
      case "web": return <><circle cx={50} cy={50} r={38} fill="#9fd0ea" {...st} /><path d="M12 50 L88 50 M50 12 L50 88 M50 12 Q26 50 50 88 M50 12 Q74 50 50 88" {...sto} strokeWidth={5} /></>;
      case "museum": return <><path d="M6 36 L50 8 L94 36 Z" fill="#ece3d1" {...st} /><rect x={10} y={36} width={80} height={10} fill="#c9373a" {...st} />{[22, 40, 60, 78].map((x) => <rect key={x} x={x - 6} y={46} width={12} height={34} fill="#fffaf0" {...st} strokeWidth={5} />)}<rect x={6} y={80} width={88} height={12} fill="#ece3d1" {...st} /></>;
      case "person": return <><circle cx={50} cy={26} r={14} fill="#f5c9a0" {...st} /><path d="M26 92 L30 56 Q50 40 70 56 L74 92 Z" fill={col ?? BLUE} {...st} /></>;
      case "tophat": return <><rect x={30} y={18} width={40} height={52} fill="#1d1b22" {...st} /><rect x={14} y={70} width={72} height={10} rx={4} fill="#1d1b22" {...st} /><rect x={30} y={56} width={40} height={8} fill={C.red} /></>;
      case "ship": return <><path d="M6 60 L94 60 L84 82 L16 82 Z" fill="#23232b" {...st} /><rect x={42} y={30} width={10} height={30} fill="#23232b" {...st} /><rect x={42} y={30} width={10} height={6} fill={C.red} /><path d="M24 60 L24 18 M74 60 L74 14" {...sto} /><path d="M58 64 m-10 0 a10 10 0 1 0 20 0" fill="#3a3f52" {...st} strokeWidth={5} /></>;
      default: return null;
    }
  })();
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>{body}</svg>;
};

// ---------------- the phone ----------------
/** a big handset (SVG, 380 x 760 at s = 1) with a screen state */
const Handset: React.FC<{ t: number; screen: string; s?: number; pct?: number; tilt?: number }> = ({ t, screen, s = 1, pct = 80, tilt = 0 }) => {
  const W = 380, H = 760, sx = 24, sy = 24, sw = W - 48, sh = H - 48, font = { fontFamily: "Montserrat, Arial, sans-serif", fontWeight: 800 };
  const batCol = pct <= 1 ? "#ff3b30" : pct < 50 ? "#ffcc00" : "#4cd964", dim = screen === "airplane";
  const status = (
    <g>
      <text x={sx + 22} y={sy + 44} fill="#fff" fontSize={26} style={font}>No Service</text>
      {screen === "airplane" ? <text x={sx + 196} y={sy + 46} fill="#ff9500" fontSize={30} style={font}>✈</text> : null}
      <text x={sx + sw - 92} y={sy + 44} fill="#fff" fontSize={24} textAnchor="end" style={font}>{pct}%</text>
      <rect x={sx + sw - 82} y={sy + 24} width={52} height={26} rx={6} fill="none" stroke="#fff" strokeWidth={3} />
      <rect x={sx + sw - 78} y={sy + 28} width={Math.max(3, (44 * pct) / 100)} height={18} rx={3} fill={batCol} />
    </g>
  );
  const body = (() => {
    switch (screen) {
      case "black": return <rect x={sx} y={sy} width={sw} height={sh} rx={36} fill="#050507" />;
      case "dial": return <>{status}<text x={W / 2} y={190} fill="#fff" fontSize={44} textAnchor="middle" style={font}>Calling…</text>
        {t % 20 < 12 ? <text x={W / 2} y={246} fill="#ff3b30" fontSize={32} textAnchor="middle" style={font}>Call failed</text> : null}
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={95 + (i % 3) * 95} cy={340 + Math.floor(i / 3) * 95} r={36} fill="none" stroke="#5a6070" strokeWidth={4} />)}
        <circle cx={W / 2} cy={650} r={42} fill="#ff3b30" /></>;
      case "map": {
        const a = t * 0.35;
        return <><rect x={sx} y={sy} width={sw} height={sh} rx={36} fill="#e9e4d8" />{status && <rect x={sx} y={sy} width={sw} height={70} rx={36} fill="#121826" />}{status}
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${sx} ${170 + i * 100} L${sx + sw} ${130 + i * 100} M${70 + i * 60} ${sy + 70} L${95 + i * 52} ${sy + sh}`} stroke="#fff" strokeWidth={16} />)}
          <circle cx={W / 2} cy={400} r={92 + 8 * Math.sin(t / 5)} fill="rgba(47,111,208,0.22)" /><circle cx={W / 2} cy={400} r={22} fill={BLUE} stroke="#fff" strokeWidth={6} />
          <g transform={`rotate(${(a * 180) / Math.PI * 4} ${W / 2} 400)`}><path d={`M${W / 2} 400 m0 -64 a64 64 0 0 1 64 64`} fill="none" stroke={BLUE} strokeWidth={8} strokeLinecap="round" /></g>
          <text x={W / 2} y={680} fill="#121826" fontSize={32} textAnchor="middle" style={font}>Searching…</text></>;
      }
      case "rec": return <><rect x={sx} y={sy} width={sw} height={sh} rx={36} fill="#4f86b8" /><rect x={sx} y={sy + 430} width={sw} height={sh - 430} fill="#3f7f86" />
        <rect x={60} y={310} width={260} height={130} fill="#23232b" /><rect x={60} y={364} width={260} height={12} fill="#f4f1ea" /><rect x={182} y={140} width={14} height={170} fill="#1d1b22" />
        <rect x={sx} y={sy} width={sw} height={76} rx={36} fill="rgba(0,0,0,0.5)" />
        {t % 24 < 16 ? <circle cx={sx + 46} cy={sy + 38} r={14} fill="#ff3b30" /> : null}<text x={sx + 72} y={sy + 48} fill="#fff" fontSize={30} style={font}>{`REC 00:${String(Math.min(59, Math.floor(t / 30) + 7)).padStart(2, "0")}`}</text>
        <circle cx={W / 2} cy={660} r={38} fill="none" stroke="#fff" strokeWidth={7} /><rect x={W / 2 - 17} y={643} width={34} height={34} rx={5} fill="#ff3b30" /></>;
      case "search": return <>{status}<rect x={sx + 24} y={sy + 96} width={sw - 48} height={60} rx={30} fill="#2a3040" /><text x={sx + 52} y={sy + 136} fill="#c9ccd2" fontSize={26} style={font}>cholera germ photo</text>
        <g transform={`rotate(${t * 12} ${W / 2} 380)`}><circle cx={W / 2} cy={380} r={46} fill="none" stroke="#5a6070" strokeWidth={10} strokeDasharray="60 230" strokeLinecap="round" /></g>
        <text x={W / 2} y={500} fill="#fff" fontSize={32} textAnchor="middle" style={font}>No connection</text><text x={W / 2} y={548} fill="#8a8f99" fontSize={24} textAnchor="middle" style={font}>Try again later</text></>;
      default: return <>{status}
        <text x={W / 2} y={230} fill={dim ? "#3a3f4a" : "#fff"} fontSize={116} textAnchor="middle" style={{ ...font, fontWeight: 700 }}>9:41</text>
        <text x={W / 2} y={292} fill={dim ? "#3a3f4a" : "#fff"} fontSize={28} textAnchor="middle" style={font}>Tue, Sept 1, 2026</text>
        {pct <= 1 ? <text x={W / 2} y={470} fill="#ff3b30" fontSize={110} textAnchor="middle" style={font}>1%</text>
          : pct < 50 ? <text x={W / 2} y={470} fill="#ffcc00" fontSize={110} textAnchor="middle" style={font}>{pct}%</text>
          : Array.from({ length: 8 }, (_, i) => <rect key={i} x={52 + (i % 4) * 74} y={410 + Math.floor(i / 4) * 92} width={58} height={58} rx={14} fill={["#e2453c", "#4cd964", BLUE, "#ffcc00", "#7b5ac9", "#ff9500", "#30b0c7", "#f4f0e6"][i]} opacity={dim ? 0.3 : 1} />)}</>;
    }
  })();
  return (
    <svg width={W * s} height={H * s} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", transform: `rotate(${tilt}deg)` }}>
      <rect x={6} y={10} width={W - 12} height={H - 12} rx={56} fill="#000" opacity={0.35} transform="translate(10 14)" />
      <rect x={0} y={0} width={W} height={H} rx={56} fill="#1d1b22" stroke={INK} strokeWidth={10} />
      <clipPath id={`scr_${screen}`}><rect x={sx} y={sy} width={sw} height={sh} rx={36} /></clipPath>
      <g clipPath={`url(#scr_${screen})`}><rect x={sx} y={sy} width={sw} height={sh} fill={screen === "black" ? "#050507" : "#121826"} />{body}</g>
      {dim ? <rect x={sx} y={sy} width={sw} height={sh} rx={36} fill="#000" opacity={0.5} /> : null}
      <rect x={W / 2 - 50} y={sy + 10} width={100} height={22} rx={11} fill="#000" />
    </svg>
  );
};
/** the phone, big, with callouts popping on their words. v picks the story beat */
const PhoneBoard: React.FC<G> = ({ t, d, v, c }) => {
  const cue = (seg: number, w: string, lead = 2) => Math.max(0, c(seg, w) - lead);
  const call = (text: string, at: number, x: number, y: number, col: string, size = 76) => <At x={x} y={y} s={pop(t, at)}><Pill text={text} col={col} fg="#fff" size={size} /></At>;
  const B: Record<number, [string, number, React.ReactNode, number]> = {
    0: ["home", 80, <>{call("80% battery", 0, 1340, 300, GREEN)}{call("No bars", cue(4, "No"), 1340, 470, C.red)}</>, 0],
    1: ["home", 80, <>{call("2026", 0, 1340, 330, BLUE, 130)}<At x={1340} y={500} s={pop(t, 6)}><T size={56} w={800} col="#fff" up={false}>still thinks it's home</T></At></>, 5],
    2: ["dial", 80, <>{call("No signal", 0, 1360, 360, C.red, 90)}<Stamp text="Nothing" t={t} at={Math.max(4, cue(14, "Nothing"))} x={1360} y={560} size={84} r={-8} /></>, 4],
    3: ["map", 80, <>{call("Looking for satellites", Math.max(4, cue(15, "satellites")), 1340, 400, BLUE, 56)}</>, 0],
    4: ["rec", 80, <>{call("In color", 0, 1360, 330, C.red, 84)}{call("With sound", Math.max(6, cue(22, "With")), 1360, 500, BLUE, 84)}</>, 4],
    5: ["home", 40, <>{call("40%", 0, 1360, 360, "#d9a020", 150)}<At x={1360} y={540} s={pop(t, 8)}><T size={52} w={800} col="#fff" up={false}>after one video</T></At></>, 4],
    6: ["airplane", 33, <>{call("Brightness: lowest", 0, 1340, 330, C.grey, 58)}{call("Airplane mode", Math.max(6, cue(42, "airplane")), 1340, 480, "#ff9500", 70)}</>, 2],
    7: ["home", 1, <>{call("1%", 0, 1360, 400, C.red, 190)}</>, 5],
    8: ["search", 33, <>{call("A diagram?", Math.max(0, cue(63, "diagram")), 1340, 280, C.grey, 58)}{call("A study?", Math.max(4, cue(63, "study")), 1340, 420, C.grey, 58)}{call("A germ?", Math.max(8, cue(63, "germ")), 1340, 560, C.grey, 58)}</>, 0],
  };
  const [scr, pct, extra, m] = B[v] ?? B[0];
  return (
    <Dark tone={v === 7 ? RUST : NIGHT}><Mv t={t} d={d} m={m}>
      <At x={620} y={450} s={pop(t, 0) * 0.88} r={-3 + 2 * Math.sin(t / 40)}><Handset t={t} screen={scr} pct={pct} s={0.88} /></At>
      {extra}
    </Mv></Dark>
  );
};

/** a date / place card */
const DateCard = (big: string, sub: string, o: { tone?: string; col?: string; m?: number } = {}): React.FC<G> => ({ t, d }) => (
  <Dark tone={o.tone ?? NIGHT}><Mv t={t} d={d} m={o.m ?? 4}>
    <At x={960} y={380} s={pop(t, 0)}><T size={Math.min(250, 1240 / (big.length * 0.62))} col={o.col ?? C.gold} style={{ textShadow: "0 16px 0 #000", letterSpacing: 4 }}>{big}</T></At>
    <At x={960} y={620} s={pop(t, 6)}><Pill text={sub} col={C.red} fg="#fff" size={62} /></At>
  </Mv></Dark>
);

// ---------------- the map of 1850 ----------------
const CITY: Record<string, [number, number]> = { Boston: [905, 110], NY: [872, 150], Phila: [850, 182], DC: [826, 214], Richmond: [818, 248], Charleston: [790, 340], Buffalo: [796, 134], Cleveland: [756, 152], Detroit: [730, 144], Chicago: [688, 160], Pittsburgh: [788, 178], Cincinnati: [722, 228], Louisville: [700, 256], StLouis: [640, 248], Nashville: [690, 300], Mobile: [668, 403], NOLA: [634, 407] };
const LINES: [string, string][] = [["Boston", "NY"], ["NY", "Phila"], ["Phila", "DC"], ["DC", "Richmond"], ["Richmond", "Charleston"], ["Charleston", "Mobile"], ["Mobile", "NOLA"], ["NY", "Buffalo"], ["Buffalo", "Cleveland"], ["Cleveland", "Detroit"], ["Detroit", "Chicago"], ["Phila", "Pittsburgh"], ["Pittsburgh", "Cincinnati"], ["Cincinnati", "Louisville"], ["Louisville", "StLouis"], ["Louisville", "Nashville"], ["Nashville", "NOLA"], ["Cleveland", "Pittsburgh"], ["Chicago", "StLouis"]];
const MAPX = (p: [number, number]): [number, number] => [-340 + p[0] * 1.95, 30 + p[1] * 1.6];
const USMap: React.FC<{ t: number; drawn: number; route?: number; label?: string }> = ({ t, drawn, route = -1, label }) => {
  const R = ["NY", "Phila", "DC", "Richmond", "Charleston", "Mobile", "NOLA"];
  const rp = R.map((n) => MAPX(CITY[n])), rl = rp.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - rp[i][0], p[1] - rp[i][1]), 0);
  return (
    <Svg>
      <path d={US_PATH} transform="translate(-340 30) scale(1.95 1.6)" fill={C.land} stroke={INK} strokeWidth={4} vectorEffect="non-scaling-stroke" />
      {LINES.map(([a, b], i) => { const A = MAPX(CITY[a]), Bp = MAPX(CITY[b]), u = clamp01(drawn * LINES.length - i); return u > 0 ? <path key={i} d={`M${A[0]} ${A[1]} L${lerp(A[0], Bp[0], u)} ${lerp(A[1], Bp[1], u)}`} stroke={INK} strokeWidth={7} strokeDasharray="2 12" strokeLinecap="round" /> : null; })}
      {route >= 0 ? <path d={`M${rp.map((p) => p.join(" ")).join(" L")}`} fill="none" stroke={C.red} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${rl * clamp01(route)} 9999`} /> : null}
      {Object.entries(CITY).map(([n, p]) => { const q = MAPX(p); return <circle key={n} cx={q[0]} cy={q[1]} r={n === "NY" || n === "NOLA" ? 16 : 9} fill={n === "NY" ? BLUE : n === "NOLA" && route > 0.98 ? C.red : "#fffaf0"} stroke={INK} strokeWidth={5} />; })}
      {label ? <text x={MAPX(CITY.NY)[0] + 26} y={MAPX(CITY.NY)[1] - 18} fontFamily="Montserrat, Arial" fontWeight={900} fontSize={40} fill={INK}>New York</text> : null}
      {route > 0.98 ? <text x={MAPX(CITY.NOLA)[0] - 30} y={MAPX(CITY.NOLA)[1] + 60} textAnchor="middle" fontFamily="Montserrat, Arial" fontWeight={900} fontSize={40} fill={C.red}>New Orleans</text> : null}
      {void t}
    </Svg>
  );
};
/** Snow's map: deaths appear as bars, clustering round one pump */
const SnowMap: React.FC<G> = ({ t, d, v, c }) => {
  let s = 9; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pts = Array.from({ length: 120 }, () => { const a = r() * Math.PI * 2, dd = 26 + Math.pow(r(), 1.7) * 420; return [960 + Math.cos(a) * dd, 450 + Math.sin(a) * dd * 0.62] as [number, number]; });
  const n = v ? pts.length : Math.round(pts.length * clamp01(t / Math.max(10, d * 0.8))), pumpAt = v ? Math.max(4, c(69, "pump") - 2) : 9999;
  return (
    <Paper tone="#efe6d0"><Mv t={t} d={d} m={v ? 4 : 0}>
      <Svg>
        {[[200, 230, 1720, 270], [180, 640, 1740, 600], [560, 120, 600, 790], [1320, 120, 1280, 790], [200, 420, 1720, 470]].map(([a, b, e, f2], i) => <path key={i} d={`M${a} ${b} L${e} ${f2}`} stroke="#c9b48a" strokeWidth={34} strokeLinecap="round" />)}
        {pts.slice(0, n).map(([x, y], i) => <rect key={i} x={x - 12} y={y - 5} width={24} height={10} fill={INK} />)}
        {v ? <circle cx={960} cy={450} r={60 + 10 * Math.sin(t / 4)} fill="none" stroke={C.red} strokeWidth={10} opacity={clamp01((t - pumpAt) / 6)} /> : null}
        <circle cx={960} cy={450} r={22} fill={C.red} stroke={INK} strokeWidth={6} />
      </Svg>
      <Banner text={v ? "One pump" : "Every death, marked"} t={t} at={0} col={v ? C.red : INK} y={140} />
      {v ? <At x={960} y={730} s={pop(t, pumpAt)}><Pill text="Broad Street pump" col={C.red} fg="#fff" size={58} /></At> : null}
    </Mv></Paper>
  );
};
/** people in a grid; `bad` of them red */
const People: React.FC<{ t: number; n: number; bad: number; at?: number; cols?: number; y?: number; s?: number }> = ({ t, n, bad, at = 0, cols = 10, y = 260, s = 92 }) => (
  <>{Array.from({ length: n }, (_, i) => { const x = 960 + ((i % cols) - (cols - 1) / 2) * (s + 14), yy = y + Math.floor(i / cols) * (s + 22), red = i * 7919 % n < bad;
    return <At key={i} x={x} y={yy} s={pop(t, at + (i % cols) * 0.6)}><Gl kind="person" s={s} col={red ? C.red : "#c9c2b0"} /></At>; })}</>
);

export const BOARDS: Record<string, React.FC<G>> = {
  phone: (g) => <PhoneBoard {...g} />,
  attempt: ({ t, d, v }) => {
    const titles = ["Call someone", "Show it off", "Charge it", "Get it copied", "Save lives"], n = Math.max(1, Math.min(5, v || 1)), title = titles[n - 1];
    return (
      <Bg dark tone={NIGHT}><Mv t={t} d={d} m={4}>
        <At x={960} y={260} s={pop(t, 0)}><div style={{ display: "flex", alignItems: "center", gap: 36 }}><T size={150} col="#fff" style={{ textShadow: "0 10px 0 #000" }}>Attempt</T>
          <div style={{ width: 210, height: 210, borderRadius: "50%", background: C.red, border: `10px solid ${INK}`, boxShadow: "0 10px 0 #000", display: "flex", alignItems: "center", justifyContent: "center" }}><T size={150} col="#fff">{n}</T></div></div></At>
        <At x={960} y={520} s={pop(t, 6)}><div style={{ background: "#fffaf0", border: `8px solid ${INK}`, borderRadius: 18, padding: "18px 56px", boxShadow: "0 12px 0 #000" }}><T size={110}>{title}</T></div></At>
        {Array.from({ length: 5 }, (_, i) => <At key={i} x={760 + i * 100} y={720} s={pop(t, 10 + i * 2)}><div style={{ width: 54, height: 54, borderRadius: "50%", background: i < n - 1 ? C.grey : i === n - 1 ? C.red : "transparent", border: `6px solid ${i < n ? INK : "#5a6070"}` }} /></At>)}
      </Mv></Bg>
    );
  },
  lindname: say([{ s: "Jenny Lind", col: C.gold, size: 250 }], { dark: true, m: 4 }),
  rules: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="The deal" t={t} at={0} col={INK} />
      <div style={{ position: "absolute", left: 500, top: 220 }}>
        <Row text="Real history only" t={t} at={0} mark="check" markAt={Math.max(6, c(5, "Real") + 4)} size={86} />
        <Row text="No magic" t={t} at={Math.max(4, c(5, "magic") - 3)} mark="x" markAt={c(5, "magic") + 3} size={86} />
        <Row text="No internet" t={t} at={Math.max(6, c(5, "internet") - 3)} mark="x" markAt={c(5, "internet") + 3} size={86} />
        <Row text="No lucky guesses" t={t} at={Math.max(8, c(5, "lucky") - 3)} mark="x" markAt={c(5, "lucky") + 3} size={86} />
      </div>
    </Mv></Paper>
  ),
  attempts5: ({ t, d }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={2}>
      <At x={960} y={250} s={pop(t, 0)}><T size={120} col="#fff" style={{ textShadow: "0 10px 0 #000" }}>5 attempts</T></At>
      {Array.from({ length: 5 }, (_, i) => <At key={i} x={560 + i * 200} y={500} s={pop(t, 4 + i * 3)}><div style={{ width: 160, height: 160, borderRadius: "50%", background: C.red, border: `9px solid ${INK}`, boxShadow: "0 9px 0 #000", display: "flex", alignItems: "center", justifyContent: "center" }}><T size={110} col="#fff">{i + 1}</T></div></At>)}
      <At x={960} y={700} s={pop(t, 20)}><Pill text="1 phone" col={BLUE} fg="#fff" size={64} /></At>
    </Mv></Bg>
  ),
  howfar: say([{ s: "Let's see", size: 130, col: "#fff" }, { s: "how far you get", col: C.yellow, size: 160, cue: [7, "far"] }], { dark: true, m: 5 }),
  lindcard: card("Jenny Lind", "Swedish opera singer", "person", { col: C.gold, m: 0 }),
  unknown: say([{ s: "A year ago:", size: 120 }, { s: "Jenny who?", col: C.red, size: 220, cue: [9, "nobody"] }], { m: 4 }),
  papers: ({ t, d }) => (
    <Paper tone={C.paper2}><Mv t={t} d={d} m={2}>
      {[0, 1, 2, 3, 4].map((i) => (
        <At key={i} x={420 + i * 270} y={430 + (i % 2) * 60} s={pop(t, i * Math.min(6, d / 8))} r={(i % 2 ? 5 : -6) + i}>
          <div style={{ width: 380, background: "#efe6d0", border: `8px solid ${INK}`, boxShadow: `0 12px 0 ${INK}`, padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 34, color: INK }}>{["The Herald", "The Tribune", "The Sun", "The Express", "The Mirror"][i]}</div>
            <div style={{ borderTop: `6px double ${INK}`, margin: "10px 0" }} /><T size={44} col={C.red}>Jenny Lind!</T>
            {[0, 1, 2, 3].map((l) => <div key={l} style={{ height: 10, background: "#8a7a6a", margin: "12px 8px 0", width: `${80 - l * 12}%` }} />)}
          </div>
        </At>
      ))}
      <Banner text="Barnum's publicity, for months" t={t} at={0} col={INK} y={140} />
    </Mv></Paper>
  ),
  n3040: num("30–40,000", "people on the piers", { dark: true, m: 4, col: C.gold, size: 250, sub: "as the papers counted them", subCue: 10 }),
  nosignal: ({ t, d }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={4}>
      <Svg>{[0, 1, 2, 3].map((i) => <rect key={i} x={760 + i * 110} y={560 - (i + 1) * 80} width={80} height={(i + 1) * 80} rx={10} fill="#3a3f52" stroke="#fff" strokeWidth={6} opacity={pop(t, i * 2)} />)}
        <path d="M720 160 L1200 600 M1200 160 L720 600" stroke={C.red} strokeWidth={34} strokeLinecap="round" opacity={clamp01((t - 8) / 4)} /></Svg>
      <At x={960} y={720} s={pop(t, 8)}><T size={90} col="#fff">No signal</T></At>
    </Mv></Bg>
  ),
  tower: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={1}>
      <At x={620} y={420} s={pop(t, 0)}><Gl kind="tower" s={360} /></At>
      <At x={1260} y={360} s={pop(t, 4)}><T size={200} col={C.red}>100+</T></At>
      <At x={1260} y={520} s={pop(t, 8)}><T size={64}>years too early</T></At>
    </Mv></Paper>
  ),
  gps: ({ t, d }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={0}>
      <At x={lerp(520, 600, ease(t / Math.max(1, d)))} y={420} s={pop(t, 0)} r={-12}><Gl kind="sat" s={320} /></At>
      <At x={1300} y={330} s={pop(t, 4)}><T size={70} col="#fff">First GPS satellite</T></At>
      <At x={1300} y={490} s={pop(t, 8)}><T size={230} col={C.yellow} style={{ textShadow: "0 14px 0 #000" }}>1978</T></At>
    </Mv></Bg>
  ),
  wire12k: ({ t, d, c }) => (
    <Paper tone="#9fc3d9"><Mv t={t} d={d} m={1}>
      <USMap t={t} drawn={clamp01(t / Math.max(10, d * 0.7))} label="NY" />
      <At x={1420} y={760} s={pop(t, Math.max(4, c(17, "12") - 2))}><Pill text="≈12,000 miles of wire" col={INK} fg="#fff" size={58} /></At>
      <Banner text="The telegraph, 1850" t={t} at={0} col={INK} y={130} />
    </Mv></Paper>
  ),
  morse: ({ t, d, v }) => {
    const word = v ? "HELLO" : "HELP", codes: Record<string, string> = { H: "····", E: "·", L: "·−··", P: "·−−·", O: "−−−" };
    const per = Math.max(8, Math.floor((d - 6) / word.length)), n = Math.min(word.length, Math.floor(t / per) + 1);
    return (
      <Bg dark tone={NIGHT}><Mv t={t} d={d} m={v ? 1 : 2}>
        <At x={960} y={200} s={pop(t, 0)}><Gl kind="key" s={220} /></At>
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", gap: 60 }}>
          {word.split("").slice(0, n).map((ch, i) => <div key={i} style={{ textAlign: "center", transform: `scale(${pop(t, i * per)})` }}><T size={70} col={C.yellow}>{codes[ch]}</T><T size={130} col="#fff" style={{ marginTop: 10 }}>{ch}</T></div>)}
        </div>
        <At x={960} y={740} s={pop(t, 6)}><T size={54} w={800} col={C.gold} up={false}>one letter at a time</T></At>
      </Mv></Bg>
    );
  },
  neworleans: ({ t, d }) => (
    <Paper tone="#9fc3d9"><Mv t={t} d={d} m={4}>
      <USMap t={t} drawn={1} route={clamp01(t / Math.max(8, d * 0.6))} label="NY" />
      <At x={1450} y={740} s={pop(t, Math.round(d * 0.6))}><Pill text="by tonight" col={C.red} fg="#fff" size={64} /></At>
    </Mv></Paper>
  ),
  notborn: say([{ s: "Everyone you know", size: 120, col: "#fff" }, { s: "hasn't been born yet", col: C.yellow, size: 130, cue: [19, "born"] }], { dark: true, m: 0 }),
  radio: ({ t, d, c }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={0}>
      <At x={620} y={420} s={pop(t, 0)}><Gl kind="radio" s={300} /></At>
      <At x={1280} y={360} s={pop(t, Math.max(3, c(20, "radio") - 2))}><T size={110} col="#fff">A radio</T></At>
      <At x={1280} y={510} s={pop(t, Math.max(8, c(20, "nobody") - 2))}><T size={70} col={C.yellow}>nobody on the other end</T></At>
    </Mv></Bg>
  ),
  special: say([{ s: "Here's how", size: 120 }, { s: "special that is", col: BLUE, size: 170, cue: [23, "special"] }], { m: 5 }),
  dagvs: ({ t, d, c }) => {
    const rows: [string, [number, string]][] = [["One image", [23, "one"]], ["Silver plate", [23, "silver"]], ["No color", [23, "color"]], ["Hold still", [23, "hold"]]];
    return (
      <Paper><Mv t={t} d={d} m={2}>
        <Banner text="The daguerreotype" t={t} at={0} col={C.gold} y={140} />
        <At x={540} y={460} s={pop(t, 0)}><Gl kind="plate" s={380} /></At>
        <div style={{ position: "absolute", left: 900, top: 250 }}>{rows.map(([s, q], i) => <Row key={s} text={s} t={t} at={Math.max(i * 3, c(q[0], q[1]) - 3)} size={80} />)}</div>
      </Mv></Paper>
    );
  },
  portraits: ({ t, d, c }) => (
    <Paper tone={C.paper2}><Mv t={t} d={d} m={1}>
      {Array.from({ length: 14 }, (_, i) => <At key={i} x={340 + (i % 7) * 207} y={300 + Math.floor(i / 7) * 270} s={pop(t, i * 0.8)} r={(i % 3) - 1}><div style={{ width: 170, height: 220, background: "#c9ccd2", border: `8px solid ${C.gold}`, boxShadow: `0 8px 0 ${INK}`, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}><Gl kind="person" s={150} col="#6b7078" /></div></At>)}
      <Stamp text="Portraits" t={t} at={Math.max(8, c(24, "portrait") - 2)} x={960} y={440} size={140} r={-8} col={INK} />
    </Mv></Paper>
  ),
  whoshow: say([{ s: "So who do you", size: 120, col: "#fff" }, { s: "show it to?", col: C.yellow, size: 200, cue: [26, "show"] }], { dark: true, m: 4 }),
  barnumcard: card("P. T. Barnum", "Showman · the American Museum", "person", { col: C.red, m: 0 }),
  problem: say([{ s: "Just one", size: 130 }, { s: "problem", col: C.red, size: 260, cue: [29, "problem"] }], { m: 4 }),
  fakes: say([{ s: "Barnum is famous", size: 120, col: "#fff" }, { s: "for fakes", col: C.red, size: 220, cue: [29, "fakes"] }], { dark: true, m: 0 }),
  mermaid: ({ t, d, c }) => {
    const at2 = Math.max(4, c(29, "fish") - 4);
    return (
      <Paper><Mv t={t} d={d} m={0}>
        <Banner text="The “mermaid”, 1842" t={t} at={0} col={C.red} y={140} />
        <At x={420} y={430} s={pop(t, 0)}><Gl kind="monkey" s={300} /></At>
        <At x={720} y={430} s={pop(t, 4)}><T size={160}>+</T></At>
        <At x={1020} y={430} s={pop(t, at2)}><Gl kind="fish" s={300} /></At>
        <At x={1320} y={430} s={pop(t, at2 + 4)}><T size={160}>=</T></At>
        <At x={1580} y={430} s={pop(t, at2 + 8)}><Pill text="“Mermaid”" col={C.red} fg="#fff" size={70} /></At>
      </Mv></Paper>
    );
  },
  humbug: say([{ s: "Greatest showman", size: 130, col: "#fff" }, { s: "Greatest humbug", col: C.red, size: 150, cue: [30, "humbug"] }], { dark: true, m: 5 }),
  trick: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <At x={960} y={420} s={pop(t, 0)}><Gl kind="museum" s={380} /></At>
      <Stamp text="His next trick" t={t} at={Math.max(3, c(31, "trick") - 2)} x={960} y={560} size={120} r={-8} />
    </Mv></Paper>
  ),
  nooutlet: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <At x={960} y={400} s={pop(t, 0)}><Gl kind="outlet" s={340} /></At>
      <Svg><path d="M760 200 L1160 600 M1160 200 L760 600" stroke={C.red} strokeWidth={30} strokeLinecap="round" opacity={clamp01((t - 5) / 4)} /></Svg>
      <At x={960} y={720} s={pop(t, Math.max(6, c(34, "Not") - 2))}><T size={80}>Not one, anywhere</T></At>
    </Mv></Paper>
  ),
  y1882: num("1882", "New York's first power station", { dark: true, m: 4, col: C.yellow, size: 330 }),
  look: say([{ s: "Electricity", size: 180, col: C.yellow }, { s: "does exist in 1850", col: "#fff", size: 120, cue: [35, "exist"] }], { dark: true, m: 0 }),
  grove: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={2}>
      <Banner text="The Grove cell" t={t} at={0} col={C.gold} y={140} />
      <At x={620} y={460} s={pop(t, 0)}><Gl kind="jar" s={380} /></At>
      <At x={1280} y={420} s={pop(t, Math.max(4, c(36, "1.9") - 2))}><T size={210} col={C.red}>1.9 V</T></At>
      <At x={1280} y={580} s={pop(t, Math.max(8, c(36, "jar") - 2))}><T size={60}>per jar, about</T></At>
    </Mv></Paper>
  ),
  volts5: ({ t, d }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={4}>
      <At x={640} y={430} s={pop(t, 0)}><div style={{ background: "#f2e6c9", borderRadius: 40, border: `8px solid ${INK}`, padding: 30 }}><Gl kind="plug" s={280} /></div></At>
      <At x={1280} y={420} s={pop(t, 5)}><T size={260} col={BLUE} style={{ textShadow: "0 14px 0 #000" }}>5 V</T></At>
      <At x={1280} y={600} s={pop(t, 9)}><T size={56} w={800} col="#fff" up={false}>what the cable expects</T></At>
    </Mv></Bg>
  ),
  volts3: ({ t, d, c }) => {
    const at3 = Math.max(10, c(38, "over") - 2);
    return (
      <Paper><Mv t={t} d={d} m={0}>
        {[0, 1, 2].map((i) => <At key={i} x={380 + i * 250} y={360} s={pop(t, i * 4)}><div style={{ textAlign: "center" }}><Gl kind="jar" s={220} /><T size={60} style={{ marginTop: 6 }}>1.9</T></div></At>)}
        <At x={1220} y={360} s={pop(t, 12)}><T size={120}>=</T></At>
        <At x={1560} y={360} s={pop(t, 14)}><T size={170} col={C.red}>5.7 V</T></At>
        <At x={960} y={660} s={pop(t, at3)}><Pill text="A little over 5 V" col={C.red} fg="#fff" size={66} /></At>
      </Mv></Paper>
    );
  },
  gamble: ({ t, d, c }) => {
    const lo = Math.max(4, c(40, "little") - 2), hi = Math.max(lo + 8, c(40, "much") - 2), u = t < lo ? 0.5 : t < hi ? lerp(0.5, 0.08, ease((t - lo) / 10)) : lerp(0.08, 0.95, ease((t - hi) / 10));
    const a = lerp(-70, 70, u);
    return (
      <Paper><Mv t={t} d={d} m={5}>
        <Banner text="A gamble" t={t} at={0} col={C.red} y={140} />
        <Svg>
          <path d="M560 640 A400 400 0 0 1 1360 640" fill="none" stroke={INK} strokeWidth={60} />
          <path d="M560 640 A400 400 0 0 1 760 294" fill="none" stroke="#c9c2b0" strokeWidth={46} /><path d="M760 294 A400 400 0 0 1 1160 294" fill="none" stroke={GREEN} strokeWidth={46} /><path d="M1160 294 A400 400 0 0 1 1360 640" fill="none" stroke={C.red} strokeWidth={46} />
          <g transform={`rotate(${a} 960 640)`}><path d="M960 640 L960 300" stroke={INK} strokeWidth={18} strokeLinecap="round" /></g><circle cx={960} cy={640} r={30} fill={INK} />
        </Svg>
        <At x={520} y={720} s={pop(t, lo)}><T size={54} col={C.grey}>Too little</T></At>
        <At x={1400} y={720} s={pop(t, hi)}><T size={54} col={C.red}>Fried phone</T></At>
      </Mv></Paper>
    );
  },
  fumes: ({ t, d }) => (
    <Bg dark tone={RUST}><Mv t={t} d={d} m={4}>
      <At x={620} y={430} s={pop(t, 0)}><div style={{ background: "#f2e6c9", borderRadius: 40, border: `8px solid ${INK}`, padding: 30 }}><Gl kind="skull" s={260} /></div></At>
      <At x={1280} y={400} s={pop(t, 4)}><T size={110} col={C.yellow}>Poisonous</T></At>
      <At x={1280} y={540} s={pop(t, 8)}><T size={110} col="#fff">fumes</T></At>
    </Mv></Bg>
  ),
  precious: say([{ s: "Every percent", size: 150, col: "#fff" }, { s: "is now precious", col: C.yellow, size: 140, cue: [43, "precious"] }], { dark: true, m: 4 }),
  henrycard: card("Joseph Henry", "America's leading expert on electricity", "person", { col: GREEN, m: 0 }),
  relay: ({ t, d }) => {
    const u = clamp01(t / Math.max(10, d * 0.7));
    return (
      <Paper><Mv t={t} d={d} m={2}>
        <Banner text="The relay" t={t} at={0} col={INK} y={140} />
        <Svg>
          <path d="M160 450 L760 450" stroke="#c9c2b0" strokeWidth={16} /><path d={`M160 450 L${lerp(160, 760, clamp01(u * 2))} 450`} stroke={C.yellow} strokeWidth={8} />
          <rect x={780} y={360} width={360} height={180} rx={20} fill="#fffaf0" {...st} strokeWidth={9} />
          <path d="M1160 450 L1760 450" stroke="#c9c2b0" strokeWidth={26} /><path d={`M1160 450 L${lerp(1160, 1760, clamp01(u * 2 - 1))} 450`} stroke={C.yellow} strokeWidth={20} />
        </Svg>
        <At x={460} y={600} s={pop(t, 2)}><T size={46} w={800} up={false}>weak, after miles of wire</T></At>
        <At x={960} y={450} s={pop(t, 6)}><T size={64}>Relay</T></At>
        <At x={1460} y={600} s={pop(t, 12)}><T size={46} w={800} up={false} col={GREEN}>strong again</T></At>
      </Mv></Paper>
    );
  },
  smithsonian: num("1846", "Henry runs the new Smithsonian", { m: 4, col: GREEN, size: 280 }),
  understand: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="What Henry would get" t={t} at={0} col={GREEN} y={140} />
      <div style={{ position: "absolute", left: 380, top: 280 }}>
        <Row text="It runs on electricity" t={t} at={0} mark="check" markAt={c(48, "electricity") + 2} size={80} />
        <Row text="Stored in a battery" t={t} at={Math.max(4, c(48, "battery") - 6)} mark="check" markAt={c(48, "battery") + 2} size={80} />
      </div>
    </Mv></Paper>
  ),
  chip: ({ t, d, c }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={4}>
      <At x={620} y={430} s={pop(t, 0)}><div style={{ background: "#f2e6c9", borderRadius: 40, border: `8px solid ${INK}`, padding: 30 }}><Gl kind="chip" s={280} /></div></At>
      <At x={1300} y={370} s={pop(t, Math.max(4, c(50, "billions") - 2))}><T size={130} col={C.yellow}>Billions</T></At>
      <At x={1300} y={510} s={pop(t, Math.max(8, c(50, "transistors") - 2))}><T size={70} col="#fff">of transistors</T></At>
    </Mv></Bg>
  ),
  y1947: num("1947", "the first transistor", { dark: true, m: 4, col: C.yellow, size: 330 }),
  scale: ({ t, d, c }) => {
    const at2 = Math.max(6, c(51, "smaller") - 2);
    return (
      <Paper><Mv t={t} d={d} m={0}>
        <Banner text="Too small to see" t={t} at={0} col={C.red} y={140} />
        <Svg>
          <path d={Array.from({ length: 161 }, (_, i) => `${i ? "L" : "M"}${200 + i * 10} ${400 - 120 * Math.sin((i / 160) * Math.PI * 3 - t * 0.1)}`).join(" ")} fill="none" stroke="#7b5ac9" strokeWidth={14} />
          <rect x={950} y={600} width={6} height={6} fill={C.red} opacity={clamp01((t - at2) / 4)} />
          <circle cx={953} cy={603} r={40} fill="none" stroke={C.red} strokeWidth={6} opacity={clamp01((t - at2) / 4)} />
        </Svg>
        <At x={420} y={600} s={pop(t, 2)}><T size={50} w={800} up={false} col="#7b5ac9">one wavelength of light</T></At>
        <At x={1300} y={640} s={pop(t, at2)}><T size={56} w={800} up={false} col={C.red}>a transistor</T></At>
      </Mv></Paper>
    );
  },
  timeline150: ({ t, d }) => {
    const steps: [string, string][] = [["1876", "telephone"], ["1882", "power station"], ["1947", "transistor"], ["1978", "GPS"], ["2026", "your phone"]];
    return (
      <Paper><Mv t={t} d={d} m={2}>
        <Banner text="150 years of inventions" t={t} at={0} col={INK} y={140} />
        <Svg><path d={`M200 440 L${lerp(200, 1720, clamp01(t / Math.max(10, d * 0.8)))} 440`} stroke={INK} strokeWidth={12} strokeLinecap="round" /></Svg>
        <At x={200} y={440} s={pop(t, 0)}><Pill text="1850" col={C.gold} fg={INK} size={52} /></At>
        {steps.map(([y, s], i) => <At key={y} x={480 + i * 300} y={440} s={pop(t, Math.round((i + 1) * Math.max(4, d * 0.13)))}><div style={{ textAlign: "center", transform: "translateY(60px)" }}><Pill text={y} col={i === 4 ? BLUE : "#fffaf0"} fg={i === 4 ? "#fff" : INK} size={48} /><T size={40} w={800} up={false} style={{ marginTop: 14 }}>{s}</T></div></At>)}
      </Mv></Paper>
    );
  },
  save: say([{ s: "One thing that could", size: 110, col: "#fff" }, { s: "save thousands", col: GREEN, size: 150, cue: [55, "save"] }, { s: "of lives", col: GREEN, size: 150, cue: [55, "lives"] }], { dark: true, m: 0 }),
  cholera: num("5,000+", "cholera deaths, New York 1849", { dark: true, m: 4, col: C.red, size: 260 }),
  cholera54: num("2,500", "more in 1854", { dark: true, m: 4, col: C.red, size: 330, sub: "it comes back", subCue: 6 }),
  checklist: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="Cholera spreads through dirty water" t={t} at={0} col="#2f6fd0" y={110} />
      <div style={{ position: "absolute", left: 560, top: 250 }}>
        <Row text="Boil it" t={t} at={0} mark="check" markAt={c(57, "Boil") + 4} size={86} />
        <Row text="Keep sewage out" t={t} at={Math.max(4, c(57, "sewage") - 4)} mark="check" markAt={c(57, "sewage") + 4} size={86} />
        <Row text="Wash your hands" t={t} at={Math.max(8, c(57, "Wash") - 4)} mark="check" markAt={c(57, "Wash") + 4} size={86} />
      </div>
    </Mv></Paper>
  ),
  miasma: ({ t, d, c }) => (
    <Bg dark tone="#1a2218"><Mv t={t} d={d} m={5}>
      <At x={960} y={340} s={pop(t, 0)}><Gl kind="cloud" s={360} /></At>
      <At x={960} y={600} s={pop(t, Math.max(3, c(58, "air") - 6))}><T size={130} col="#c9d6a0">“Bad air”</T></At>
      <At x={960} y={730} s={pop(t, 10)}><T size={48} w={800} up={false} col="#fff">what most doctors blame</T></At>
    </Mv></Bg>
  ),
  already: say([{ s: "It's already happening", size: 110 }, { s: "to somebody else", col: C.red, size: 140, cue: [60, "somebody"] }], { m: 4 }),
  vienna: DateCard("Vienna", "1847", { m: 4 }),
  deaths: ({ t, d, c }) => {
    const at2 = Math.max(10, c(61, "50") - 2), after = t >= at2;
    return (
      <Paper><Mv t={t} d={d} m={0}>
        <Banner text={after ? "After handwashing" : "Before"} t={t} at={after ? at2 : 0} col={after ? GREEN : C.red} y={100} />
        <People t={t} n={50} bad={after ? 1 : 10} cols={10} y={250} s={78} />
        <At x={960} y={760} s={pop(t, after ? at2 : 4)}><Pill text={after ? "about 1 in 50" : "about 1 in 5 died"} col={after ? GREEN : C.red} fg="#fff" size={60} /></At>
      </Mv></Paper>
    );
  },
  stopped: say([{ s: "His hospital", size: 130 }, { s: "stopped doing it", col: C.red, size: 150, cue: [62, "stopped"] }], { m: 0 }),
  internet: say([{ s: "Everything you'd need", size: 110, col: "#fff" }, { s: "is on the internet", col: BLUE, size: 130, cue: [64, "internet"] }], { dark: true, m: 0 }),
  nointernet: ({ t, d }) => (
    <Bg dark tone={RUST}><Mv t={t} d={d} m={4}>
      <At x={960} y={400} s={pop(t, 0)}><Gl kind="web" s={340} /></At>
      <Svg><path d="M760 200 L1160 600 M1160 200 L760 600" stroke={C.red} strokeWidth={34} strokeLinecap="round" opacity={clamp01((t - 4) / 4)} /></Svg>
      <At x={960} y={700} s={pop(t, 4)}><T size={100} col="#fff">No internet</T></At>
    </Mv></Bg>
  ),
  whatdone: say([{ s: "So what should", size: 120, col: "#fff" }, { s: "you have done?", col: C.yellow, size: 160, cue: [66, "done"] }], { dark: true, m: 5 }),
  rule1: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={2}>
      <At x={960} y={250} s={pop(t, 0)}><Pill text="First" col={INK} fg="#fff" size={60} /></At>
      <At x={960} y={430} s={pop(t, 3)}><T size={96}>Stop explaining the phone</T></At>
      <At x={960} y={620} s={pop(t, Math.max(8, c(67, "check") - 2))}><T size={60} col={C.red}>Nobody can check it</T></At>
    </Mv></Paper>
  ),
  rule2: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <At x={960} y={250} s={pop(t, 0)}><Pill text="Second" col={GREEN} fg="#fff" size={60} /></At>
      <At x={960} y={440} s={pop(t, 3)}><T size={80}>Give them something</T></At>
      <At x={960} y={560} s={pop(t, 8)}><T size={110} col={GREEN}>they can test</T></At>
    </Mv></Paper>
  ),
  london: DateCard("London", "1854", { m: 4 }),
  snowcard: card("John Snow", "Doctor · London", "person", { col: "#2f6fd0", m: 0 }),
  snowmap: (g) => <SnowMap {...g} />,
  look2: say([{ s: "He needed them", size: 130, col: "#fff" }, { s: "to look", col: C.yellow, size: 280, cue: [70, "look"] }], { dark: true, m: 4 }),
  rules3: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="A notebook with a light" t={t} at={0} col={GREEN} y={140} />
      <div style={{ position: "absolute", left: 560, top: 250 }}>
        <Row text="Keep records" t={t} at={Math.max(0, c(71, "Keep") - 4)} mark="check" markAt={c(71, "Keep") + 4} size={86} />
        <Row text="Count cases" t={t} at={Math.max(4, c(71, "Count") - 4)} mark="check" markAt={c(71, "Count") + 4} size={86} />
        <Row text="Draw the map first" t={t} at={Math.max(8, c(71, "Draw") - 4)} mark="check" markAt={c(71, "Draw") + 4} size={86} />
      </div>
    </Mv></Paper>
  ),
  never: say([{ s: "Your phone was never", size: 110, col: "#fff" }, { s: "going to change 1850", col: C.gold, size: 120, cue: [72, "change"] }], { dark: true, m: 0 }),
  know: say([{ s: "What you know", size: 150 }, { s: "might", col: GREEN, size: 300, cue: [73, "might"] }], { m: 4 }),
  strange: say([{ s: "The phone was never", size: 110, col: "#fff" }, { s: "the powerful bit", col: C.yellow, size: 150, cue: [79, "powerful"] }], { dark: true, m: 0 }),
  internetwas: ({ t, d, c }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={4}>
      <At x={620} y={420} s={pop(t, 0)}><div style={{ background: "#f2e6c9", borderRadius: 40, border: `8px solid ${INK}`, padding: 30 }}><Gl kind="web" s={260} /></div></At>
      <At x={1300} y={400} s={pop(t, Math.max(3, c(79, "internet") - 2))}><T size={110} col={BLUE}>The internet</T></At>
      <At x={1300} y={540} s={pop(t, Math.max(6, c(79, "was.") - 2))}><T size={110} col="#fff">was</T></At>
    </Mv></Bg>
  ),
  comments: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <At x={960} y={290} s={pop(t, 0)}><Handset t={t} screen="black" s={0.32} /></At>
      <At x={960} y={540} s={pop(t, 3)}><T size={68}>What would you have used it for?</T></At>
      <At x={960} y={690} s={pop(t, 12)}><Pill text="Tell me in the comments" col={C.red} fg="#fff" size={60} /></At>
    </Mv></Paper>
  ),
};

/** no separate maps; the router keeps the same shape as the other long-forms */
export const MapBoard: React.FC<G & { name: string }> = () => null;
void k;
