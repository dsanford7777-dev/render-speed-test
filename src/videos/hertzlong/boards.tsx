// The 60 Hz long-form's 2D boards. Each takes G (t = frame in shot, d = shot length, c(seg, word) = a word's onset in
// shot frames, v = variant) and builds on the narration's words. Content stays above y = 800 (captions below).
// Every board has a camera move of its own (Mv: push, pull, slide, snap zoom, Dutch swing) so no shot sits still, and
// every board shows something from its first frame. Colour code: 60 Hz = blue, 50 Hz = red. Maps live in maps.tsx.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, G, FONT, Paper, At, T, Banner, Stamp, NameCard, Row, Big, Icon, k, pop, ease, easeOut, lerp, clamp01, count, fmt } from "../pigwarlong/kit";

const B60 = "#2f5fb5", R50 = "#c9373a", INK = C.ink;
const Dark: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = "#141a2a" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #2c3550 0%, ${tone} 75%)` }}>{children}</AbsoluteFill>
);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>{children}</svg>;
const st = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const sto = { ...st, fill: "none" };

/** board camera. m: 0 push in, 1 pull out, 2 slide right, 3 slide left, 4 snap zoom (lands in 6 frames), 5 Dutch swing */
const Mv: React.FC<{ t: number; d: number; m: number; children: React.ReactNode }> = ({ t, d, m, children }) => {
  const u = ease(t / Math.max(1, d)), e = 1 - Math.pow(2, -9 * clamp01(t / 7));
  const [s, x, y, r] = m === 0 ? [lerp(1.0, 1.12, u), 0, 0, lerp(-1.2, 0.7, u)]
    : m === 1 ? [lerp(1.16, 1.02, u), 0, 0, lerp(1.0, -0.6, u)]
    : m === 2 ? [1.08, lerp(-46, 46, u), 0, lerp(0.5, -0.5, u)]
    : m === 3 ? [1.08, lerp(46, -46, u), 0, lerp(-0.5, 0.5, u)]
    : m === 4 ? [lerp(1.42, 1.03, e) + 0.07 * u, 0, 0, lerp(-2.2, 0.3, e)]
    : [lerp(1.06, 1.12, u), 0, 0, lerp(-2.6, 2.2, u)];
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`, transformOrigin: "50% 42%" }}>{children}</AbsoluteFill>;
};
const Bg: React.FC<{ dark?: boolean; tone?: string; children: React.ReactNode }> = ({ dark, tone, children }) => dark ? <Dark tone={tone}>{children}</Dark> : <Paper tone={tone}>{children}</Paper>;

/** extra glyphs for this story (100 x 100 box) */
const Glyph: React.FC<{ kind: string; s?: number; col?: string }> = ({ kind, s = 160, col }) => {
  const body = (() => {
    switch (kind) {
      case "bulb": return <><path d="M50 8 Q82 10 82 42 Q82 58 66 70 L66 80 L34 80 L34 70 Q18 58 18 42 Q18 10 50 8 Z" fill={col ?? C.yellow} {...st} /><rect x={36} y={80} width={28} height={12} fill={C.grey} {...st} /><path d="M40 52 L46 40 L54 52 L60 40" {...sto} /></>;
      case "motor": return <><rect x={16} y={30} width={58} height={44} rx={12} fill="#3f6f8f" {...st} /><path d="M28 30 L28 74 M40 30 L40 74 M52 30 L52 74 M64 30 L64 74" {...sto} strokeWidth={4} /><path d="M74 52 L92 52" {...sto} /><circle cx={92} cy={52} r={8} fill={C.red} {...st} /><path d="M22 74 L18 86 M68 74 L72 86" {...sto} /></>;
      case "clock": return <><circle cx={50} cy={50} r={40} fill="#fffaf0" {...st} /><path d="M50 50 L50 24 M50 50 L68 58" {...sto} /><circle cx={50} cy={50} r={4} fill={INK} /></>;
      case "toaster": return <><rect x={12} y={34} width={76} height={50} rx={12} fill="#c9c2b0" {...st} /><rect x={26} y={18} width={20} height={22} rx={4} fill="#d9a441" {...st} /><rect x={54} y={18} width={20} height={22} rx={4} fill="#d9a441" {...st} /><path d="M88 54 L96 54 L96 64" {...sto} /></>;
      case "fridge": return <><rect x={24} y={6} width={52} height={88} rx={8} fill="#f1efe6" {...st} /><path d="M24 38 L76 38" {...sto} /><path d="M34 18 L34 30 M34 48 L34 66" {...sto} /></>;
      case "fixture": return <><path d="M50 6 L50 30" {...sto} /><path d="M20 60 Q50 16 80 60 Z" fill="#3f7d4a" {...st} /><circle cx={50} cy={66} r={12} fill={C.yellow} {...st} /></>;
      case "elevator": return <><rect x={22} y={10} width={56} height={80} fill="#b5866a" {...st} /><path d="M50 10 L50 90" {...sto} /><path d="M34 34 L42 24 L42 44 Z M66 66 L58 56 L58 76 Z" fill={INK} /></>;
      case "generator": return <><rect x={10} y={70} width={80} height={12} fill="#4a4658" {...st} /><rect x={18} y={34} width={38} height={36} fill="#5d6f8f" {...st} /><circle cx={37} cy={30} r={14} fill="#d98a3a" {...st} /><circle cx={72} cy={50} r={20} fill="none" stroke={C.red} strokeWidth={9} /><circle cx={72} cy={50} r={20} {...sto} strokeWidth={3} /><path d="M72 30 L72 70 M52 50 L92 50" {...sto} strokeWidth={4} /></>;
      case "falls": return <><path d="M6 26 L60 26 L60 34 L6 34 Z" fill="#8a8090" {...st} /><path d="M14 34 q6 26 -2 54 M30 34 q6 30 -2 54 M46 34 q6 26 4 54" stroke="#2f7fb5" strokeWidth={9} fill="none" strokeLinecap="round" /><path d="M2 90 q12 -10 24 0 t24 0 t24 0 t24 0" {...sto} stroke="#2f7fb5" /></>;
      case "dam": return <><rect x={26} y={12} width={48} height={26} fill="#5fa3d0" /><path d="M0 2 L28 10 L38 96 L0 96 Z" fill="#a9825a" {...st} /><path d="M100 2 L72 10 L62 96 L100 96 Z" fill="#a9825a" {...st} /><path d="M27 26 Q50 40 73 26 L63 96 L37 96 Z" fill="#efe9dc" {...st} /><path d="M30 44 Q50 56 70 44 M33 62 Q50 72 67 62 M35 80 Q50 88 65 80" {...sto} strokeWidth={3} /><rect x={42} y={86} width={16} height={10} fill="#8a8090" {...st} strokeWidth={4} /></>;
      case "truck": return <><rect x={6} y={30} width={56} height={40} fill={C.red} {...st} /><path d="M62 42 L82 42 L94 56 L94 70 L62 70 Z" fill="#fffaf0" {...st} /><circle cx={24} cy={74} r={10} fill={INK} /><circle cx={78} cy={74} r={10} fill={INK} /></>;
      case "wrench": return <><path d="M22 84 L60 46 Q52 28 66 16 L70 30 L82 34 L90 22 Q98 42 80 48 Q72 50 66 48 L30 90 Z" fill={C.grey} {...st} /></>;
      case "train": return <><rect x={14} y={18} width={72} height={58} rx={14} fill={C.green} {...st} /><rect x={24} y={28} width={22} height={18} fill="#cfe8f0" {...st} /><rect x={54} y={28} width={22} height={18} fill="#cfe8f0" {...st} /><path d="M26 76 L18 90 M74 76 L82 90" {...sto} /><circle cx={30} cy={62} r={5} fill={C.yellow} /><circle cx={70} cy={62} r={5} fill={C.yellow} /></>;
      case "pylon": return <><path d="M38 92 L46 14 L54 14 L62 92 M30 34 L70 34 M24 52 L76 52 M40 70 L60 52 M60 70 L40 52" {...sto} /><path d="M4 30 L30 34 M70 34 L96 30" {...sto} strokeWidth={4} /></>;
      case "plug": return <><rect x={26} y={32} width={48} height={40} rx={10} fill="#3a3a48" {...st} /><path d="M40 32 L40 12 M60 32 L60 12" {...sto} strokeWidth={9} /><path d="M50 72 Q50 92 70 94" {...sto} /></>;
      case "order": return <><path d="M20 8 L66 8 L82 24 L82 92 L20 92 Z" fill="#fffaf0" {...st} /><path d="M32 36 L70 36 M32 52 L70 52 M32 68 L58 68" {...sto} /><circle cx={64} cy={76} r={9} fill={C.red} /></>;
      case "city": return <><path d="M8 90 L8 50 L28 50 L28 26 L50 26 L50 40 L70 40 L70 14 L92 14 L92 90 Z" fill={col ?? "#8a8090"} {...st} /></>;
      default: return null;
    }
  })();
  if (!body) return <Icon kind={kind} s={s} />;
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>{body}</svg>;
};

// ---------------- factories ----------------
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);
type Ln = { s: string; col?: string; size?: number; cue?: Cue };
type SayOpts = { dark?: boolean; tone?: string; m?: number; top?: string; topCol?: string; stamp?: { s: string; cue: Cue; x?: number; y?: number; size?: number; col?: string; r?: number }; glyph?: string; y?: number };
/** big statement: lines that pop in one after another, an optional banner, glyph and stamp */
const say = (lines: Ln[], o: SayOpts = {}): React.FC<G> => ({ t, d, c }) => {
  const fg = o.dark ? "#fff" : INK;
  const sz = lines.map((ln) => Math.min(ln.size ?? 120, 1640 / (ln.s.length * 0.68)));
  const y0 = (o.y ?? (o.glyph ? 500 : 430)) - sz.reduce((a, x) => a + x * 1.16, 0) / 2;
  let y = y0;
  return (
    <Bg dark={o.dark} tone={o.tone}><Mv t={t} d={d} m={o.m ?? 0}>
      {o.top ? <Banner text={o.top} t={t} at={0} col={o.topCol ?? C.red} /> : null}
      {o.glyph ? <At x={960} y={y0 - 120} s={pop(t, 0)}><div style={o.dark ? { background: "#f2e6c9", border: `7px solid ${INK}`, borderRadius: "50%", padding: 22 } : undefined}><Glyph kind={o.glyph} s={170} /></div></At> : null}
      {lines.map((ln, i) => {
        const size = sz[i], yy = y + size * 0.58; y += size * 1.16;
        return <At key={i} x={960} y={yy} s={pop(t, i === 0 ? 0 : at(ln.cue ?? i * 8, c))}><T size={size} col={ln.col ?? fg} style={{ textShadow: o.dark ? `0 ${size / 16}px 0 #000` : undefined }}>{ln.s}</T></At>;
      })}
      {o.stamp ? <Stamp text={o.stamp.s} t={t} at={at(o.stamp.cue, c)} x={o.stamp.x ?? 960} y={o.stamp.y ?? 690} size={o.stamp.size ?? 110} col={o.stamp.col ?? C.red} r={o.stamp.r ?? -8} /> : null}
    </Mv></Bg>
  );
};
/** a giant number with a banner above and a label below */
const num = (n: string, label: string, o: { top?: string; col?: string; dark?: boolean; m?: number; cue?: Cue; size?: number; sub?: string; subCue?: Cue } = {}): React.FC<G> => ({ t, d, c }) => (
  <Bg dark={o.dark}><Mv t={t} d={d} m={o.m ?? 4}>
    {o.top ? <Banner text={o.top} t={t} at={0} col={o.col === B60 ? B60 : o.col === R50 ? R50 : INK} y={150} /> : null}
    <Big n={n} label={label} t={t} at={at(o.cue, c, 3)} x={960} y={o.top ? 470 : 420} size={o.size ?? 330} col={o.col ?? C.red} lcol={o.dark ? "#fff" : INK} />
    {o.sub ? <At x={960} y={735} s={pop(t, at(o.subCue ?? 10, c))}><T size={52} w={800} col={o.dark ? C.gold : C.grey} up={false}>{o.sub}</T></At> : null}
  </Mv></Bg>
);
const card = (name: string, role: string, glyph: string, o: { col?: string; extra?: string; extraCue?: Cue; m?: number; stamp?: string; stampCue?: Cue } = {}): React.FC<G> => ({ t, d, c }) => (
  <Paper><Mv t={t} d={d} m={o.m ?? 0}>
    <AbsoluteFill style={{ transform: `scale(${Math.min(1, 1640 / (name.length * 66 + 520))})`, transformOrigin: "50% 39%" }}>
      <NameCard name={name} role={role} t={t} at={0} x={960} y={420} col={o.col ?? B60} icon={<Glyph kind={glyph} s={230} />} extra={o.extra} extraAt={o.extra ? at(o.extraCue ?? 12, c) : undefined} />
    </AbsoluteFill>
    {o.stamp ? <Stamp text={o.stamp} t={t} at={at(o.stampCue ?? 12, c)} x={1420} y={660} size={90} /> : null}
  </Mv></Paper>
);
/** a row of glyphs with labels, each popping on its word */
const icons = (items: { g: string; label: string; cue?: Cue; col?: string }[], o: { top?: string; topCol?: string; m?: number; foot?: string; footCue?: Cue; dark?: boolean } = {}): React.FC<G> => ({ t, d, c }) => {
  const w = Math.min(460, 1640 / items.length), x0 = 960 - (w * (items.length - 1)) / 2;
  return (
    <Bg dark={o.dark}><Mv t={t} d={d} m={o.m ?? 2}>
      {o.top ? <Banner text={o.top} t={t} at={0} col={o.topCol ?? C.red} /> : null}
      {items.map((it, i) => {
        const s = pop(t, i === 0 ? 0 : at(it.cue ?? i * 9, c));
        return <At key={i} x={x0 + i * w} y={items.length === 1 ? 430 : 450} s={s}><div style={{ textAlign: "center" }}><div style={o.dark ? { background: "#f2e6c9", border: `8px solid ${INK}`, borderRadius: 40, padding: 26, display: "inline-block" } : undefined}><Glyph kind={it.g} s={items.length === 1 ? 330 : Math.min(250, w * 0.7)} col={it.col} /></div><T size={items.length === 1 ? 84 : Math.min(52, (w * 1.25) / it.label.length)} col={o.dark ? "#fff" : INK} style={{ marginTop: 18 }}>{it.label}</T></div></At>;
      })}
      {o.foot ? <At x={960} y={720} s={pop(t, at(o.footCue ?? 20, c))}><T size={62} col={o.dark ? C.yellow : C.red}>{o.foot}</T></At> : null}
    </Mv></Bg>
  );
};
const Pill: React.FC<{ text: string; col?: string; fg?: string; size?: number }> = ({ text, col = "#fffaf0", fg = INK, size = 44 }) => (
  <div style={{ background: col, border: `6px solid ${INK}`, borderRadius: 14, padding: "8px 26px", boxShadow: `0 6px 0 ${INK}`, display: "inline-block" }}><T size={size} col={fg}>{text}</T></div>
);
/** a sine wave across the board; speed = cycles shown, phase scrolls with t */
const Wave: React.FC<{ t: number; y: number; amp?: number; cycles?: number; col?: string; speed?: number; x0?: number; x1?: number; w?: number }> = ({ t, y, amp = 90, cycles = 4, col = C.red, speed = 0.18, x0 = 200, x1 = 1720, w = 12 }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) { const u = i / 160, x = x0 + (x1 - x0) * u; pts.push(`${i ? "L" : "M"}${x.toFixed(1)} ${(y - amp * Math.sin(u * cycles * Math.PI * 2 - t * speed)).toFixed(1)}`); }
  return <g><path d={`M${x0} ${y} L${x1} ${y}`} stroke={INK} strokeWidth={4} strokeDasharray="14 14" opacity={0.4} /><path d={pts.join(" ")} stroke={INK} strokeWidth={w + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={pts.join(" ")} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
};
const Arrow: React.FC<{ x: number; y: number; len: number; dir?: 1 | -1; col?: string; s?: number }> = ({ x, y, len, dir = 1, col = C.red, s = 1 }) => s <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}><path d={`M0 0 L${len} 0`} stroke={INK} strokeWidth={34} strokeLinecap="round" /><path d={`M${len - 44} -44 L${len + 10} 0 L${len - 44} 44`} fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M0 0 L${len} 0`} stroke={col} strokeWidth={20} strokeLinecap="round" /><path d={`M${len - 44} -44 L${len + 10} 0 L${len - 44} 44`} fill="none" stroke={col} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" /></g>
);
const Bar: React.FC<{ x: number; y: number; w: number; h: number; col: string; label: string; val: string; fg?: string }> = ({ x, y, w, h, col, label, val, fg = INK }) => (
  <g><rect x={x} y={y - h} width={w} height={h} fill={col} stroke={INK} strokeWidth={7} rx={8} />
    <text x={x + w / 2} y={y + 62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={fg}>{label}</text>
    <text x={x + w / 2} y={y - h - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={fg}>{val}</text></g>
);

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  nobody: say([{ s: "Nobody", col: C.yellow, size: 190 }, { s: "chose this", cue: [2, "chose"], size: 130 }], { dark: true, m: 4 }),
  notreaty: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={5}>
      <Banner text="Who decided?" t={t} at={0} col={INK} />
      <div style={{ position: "absolute", left: 560, top: 250 }}>
        <Row text="A treaty" t={t} at={0} mark="x" markAt={c(3, "treaty") + 4} size={96} strike />
        <Row text="A vote" t={t} at={c(4, "No") - 2} mark="x" markAt={c(4, "vote") + 4} size={96} strike />
        <Row text="A committee" t={t} at={c(5, "No") - 2} mark="x" markAt={c(5, "committee") + 6} size={96} strike />
      </div>
    </Mv></Paper>
  ),
  century: num("100+", "years: just a strange fact", { m: 1, col: INK, size: 280 }),
  y2011: say([{ s: "2011", col: C.yellow, size: 300 }], { dark: true, m: 4, tone: "#2a1418", stamp: { s: "Disaster", cue: [9, "disaster"], y: 700, size: 120 }, y: 360 }),
  title: ({ t, d, c }) => (
    <Dark><Mv t={t} d={d} m={0}>
      <At x={960} y={250} s={pop(t, 0)}><T size={76} col="#fff">How the world's electricity</T></At>
      <At x={660} y={470} s={pop(t, c(11, "split") - 2)}><div style={{ background: B60, border: `8px solid ${INK}`, borderRadius: 20, padding: "10px 60px", transform: `translateX(${-ease(k(t, c(11, "split") + 4, 12)) * 60}px) rotate(-3deg)` }}><T size={230} col="#fff">60</T></div></At>
      <At x={1260} y={470} s={pop(t, c(11, "split") - 2)}><div style={{ background: R50, border: `8px solid ${INK}`, borderRadius: 20, padding: "10px 60px", transform: `translateX(${ease(k(t, c(11, "split") + 4, 12)) * 60}px) rotate(3deg)` }}><T size={230} col="#fff">50</T></div></At>
      <At x={960} y={700} s={pop(t, c(11, "two") - 2)}><T size={92} col={C.yellow}>split in two</T></At>
    </Mv></Dark>
  ),
  toolate: say([{ s: "And why it's", size: 90 }, { s: "too late to fix", col: C.yellow, size: 160, cue: [12, "too"] }], { dark: true, m: 5 }),

  // ---------------- chapter 1 ----------------
  meaning: say([{ s: "60", col: B60, size: 330 }, { s: "of what?", size: 110, cue: [13, "number"] }], { m: 4 }),
  wave: ({ t, d, v, c }) => (
    <Paper><Mv t={t} d={d} m={v === 0 ? 2 : v === 1 ? 0 : 4}>
      <Banner text={v === 0 ? "Not one direction" : v === 1 ? "Forward, backward, forward" : "Alternating current"} t={t} at={0} col={v === 2 ? C.red : INK} />
      <Svg>
        {v === 0 ? <><Arrow x={380} y={470} len={1100} col={C.grey} s={pop(t, 0)} /><g transform={`translate(960 470) scale(${pop(t, c(14, "doesn't") + 2)})`}><path d="M-90 -90 L90 90 M90 -90 L-90 90" stroke={INK} strokeWidth={56} strokeLinecap="round" /><path d="M-90 -90 L90 90 M90 -90 L-90 90" stroke={C.red} strokeWidth={34} strokeLinecap="round" /></g></>
          : <><Wave t={t} y={460} amp={150} cycles={2.5} speed={0.16} />
            {v === 1 ? <><Arrow x={300} y={720} len={280} col={B60} s={pop(t, c(15, "forward") - 2)} /><Arrow x={1090} y={720} len={280} dir={-1} col={C.red} s={pop(t, c(15, "backward") - 2)} /><Arrow x={1300} y={720} len={280} col={B60} s={pop(t, c(15, "again") - 6)} /></> : null}</>}
      </Svg>
      {v === 2 ? <At x={960} y={720} s={pop(t, 4)}><Pill text="AC" col={C.yellow} size={90} /></At> : null}
    </Mv></Paper>
  ),
  hz: ({ t, d, v, c }) => {
    const n = v === 0 ? count(t, c(17, "60") - 4, c(17, "60") + 22, 0, 60) : v === 1 ? 60 : 50, col = v === 2 ? R50 : B60;
    return (
      <Paper><Mv t={t} d={d} m={v === 0 ? 0 : 4}>
        <Banner text={v === 2 ? "Europe" : "America"} t={t} at={0} col={col} />
        <Svg><Wave t={t} y={330} amp={70} cycles={v === 2 ? 5 : 6} col={col} speed={v === 2 ? 0.5 : 0.6} w={10} /></Svg>
        <At x={960} y={560} s={pop(t, 0)}><T size={250} col={col} style={{ textShadow: `0 12px 0 ${INK}` }}>{n}</T></At>
        <At x={960} y={735} s={pop(t, v === 0 ? c(17, "times") - 2 : 3)}><T size={64}>{v === 0 ? "round trips every second" : v === 1 ? "hertz" : "hertz"}</T></At>
      </Mv></Paper>
    );
  },
  plugged: icons([{ g: "clock", label: "Clocks" }, { g: "motor", label: "Motors" }, { g: "toaster", label: "Appliances" }, { g: "bulb", label: "Lights" }], { top: "Built around the number", m: 3 }),
  y1880s: say([{ s: "1880s", col: C.red, size: 250 }, { s: "no standard at all", size: 96, cue: [22, "standard"] }], { m: 4 }),
  ownnumber: ({ t, d }) => {
    const ns: [string, number, number, number, string][] = [["133", 420, 300, -8, C.red], ["125", 1480, 290, 6, B60], ["87", 960, 250, 3, C.green], ["66", 300, 620, 5, C.gold], ["40", 1620, 630, -6, "#8a55b5"], ["25", 720, 660, -4, C.grey], ["50", 1220, 650, 7, R50], ["60", 960, 470, 0, B60]];
    return (
      <Paper><Mv t={t} d={d} m={1}>
        {ns.map(([n, x, y, r, col], i) => <At key={i} x={x} y={y} s={pop(t, i * Math.max(2, Math.floor(d / 11)))} r={r}><Pill text={n} col={col} fg="#fff" size={i === 7 ? 150 : 110} /></At>)}
      </Mv></Paper>
    );
  },
  n133: num("133", "cycles a second", { top: "Early Westinghouse", m: 4 }),
  n125: num("125", "cycles a second", { top: "A rival company", m: 0, col: B60 }),
  n87: num("87", "cycles a second", { top: "Coventry, England", m: 4, col: C.green }),
  until1906: say([{ s: "until", size: 90 }, { s: "1906", col: C.red, size: 280 }], { m: 1 }),
  hated: say([{ s: "Then something", size: 96 }, { s: "hated it", col: C.yellow, size: 190, cue: [32, "hated"] }], { dark: true, m: 5, glyph: "motor" }),

  // ---------------- chapter 2 ----------------
  westinghouse: card("George Westinghouse", "1888: buys the rights", "person", { col: B60, m: 0 }),
  tesla: card("Nikola Tesla", "The alternating-current motor", "motor", { col: C.red, m: 3 }),
  uses: icons([{ g: "factory", label: "Factories" }, { g: "streetcar", label: "Streetcars", cue: [36, "streetcars"] }, { g: "elevator", label: "Elevators", cue: [36, "elevators"] }], { top: "One motor for all of it", m: 2 }),
  oneproblem: say([{ s: "One", size: 150 }, { s: "problem", col: C.red, size: 200, cue: [38, "problem"] }], { m: 4 }),
  lower: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <At x={620} y={330} s={pop(t, 0)}><Pill text="133" col={C.grey} fg="#fff" size={150} /></At>
      <Svg><g transform="translate(1100 240) rotate(90)"><Arrow x={0} y={0} len={380} col={C.red} s={pop(t, c(40, "lower") - 6)} /></g></Svg>
      <At x={1100} y={720} s={pop(t, c(40, "lower"))}><T size={110} col={C.red}>much lower</T></At>
    </Mv></Paper>
  ),
  middle: ({ t, d, v, c }) => {
    const u = v === 0 ? ease(k(t, 4, 26)) : 1, x = lerp(1560, 620, u) + (v === 1 ? lerp(0, 200, ease(k(t, c(44, "lights") - 8, 20))) : 0);
    return (
      <Paper><Mv t={t} d={d} m={v === 0 ? 2 : 3}>
        <Banner text="Find the number in the middle" t={t} at={0} col={INK} />
        <Svg>
          <path d="M260 480 L1660 480" stroke={INK} strokeWidth={30} strokeLinecap="round" /><path d="M260 480 L1660 480" stroke="#fffaf0" strokeWidth={16} strokeLinecap="round" />
          {[["25", 300], ["50", 720], ["60", 890], ["100", 1300], ["133", 1620]].map(([n, xx]) => <g key={n as string}><path d={`M${xx} 450 L${xx} 510`} stroke={INK} strokeWidth={8} /><text x={xx as number} y={585} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>{n}</text></g>)}
          <g transform={`translate(${x} 480)`}><path d="M0 -30 L-46 -120 L46 -120 Z" fill={C.red} {...st} /></g>
        </Svg>
        <At x={420} y={300} s={pop(t, 0)}><div style={{ textAlign: "center" }}><Glyph kind="motor" s={150} /><T size={44} style={{ marginTop: 6 }}>Motors want low</T></div></At>
        <At x={1500} y={300} s={pop(t, v === 1 ? 0 : 60)}><div style={{ textAlign: "center" }}><Glyph kind="bulb" s={150} /><T size={44} style={{ marginTop: 6 }}>Lights want high</T></div></At>
      </Mv></Paper>
    );
  },
  y1890: say([{ s: "around", size: 80 }, { s: "1890", col: C.red, size: 300 }], { m: 4 }),
  fiftytoo: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <At x={960} y={360} s={pop(t, 0)}><Pill text="50" col={R50} fg="#fff" size={260} /></At>
      <At x={960} y={660} s={pop(t, 8)}><T size={96}>would have worked too</T></At>
    </Mv></Paper>
  ),
  sixtyitwas: say([{ s: "60", col: B60, size: 340 }], { m: 4, stamp: { s: "It was", cue: 8, y: 715, size: 100, col: B60, r: -6 } }),
  thatsit: say([{ s: "That's it.", size: 170 }, { s: "That's the reason.", col: C.red, size: 110, cue: [51, "That's"] }], { m: 5 }),
  notfinal: say([{ s: "Not even", size: 110 }, { s: "final", col: C.red, size: 230, cue: [53, "final"] }], { m: 4 }),
  niagara: ({ t, d, v, c }) => (
    <Paper><Mv t={t} d={d} m={v === 0 ? 1 : 4}>
      <Banner text="Niagara Falls, 1895" t={t} at={0} col={INK} />
      <At x={v === 0 ? 960 : 520} y={470} s={pop(t, 0)}><Glyph kind="falls" s={v === 0 ? 400 : 300} /></At>
      {v === 0 ? <At x={1420} y={520} s={pop(t, c(54, "power") - 2)}><Glyph kind="generator" s={250} /></At> : null}
      {v === 1 ? <><At x={1200} y={430} s={pop(t, 0)}><T size={360} col="#8a55b5" style={{ textShadow: `0 14px 0 ${INK}` }}>25</T></At><At x={1200} y={670} s={pop(t, 6)}><T size={60}>cycles a second</T></At></> : null}
    </Mv></Paper>
  ),
  turbines: icons([{ g: "gear", label: "Turbines: designed" }, { g: "doc", label: "Frequency: undecided", cue: [56, "before"] }], { top: "The order things happened in", topCol: INK, m: 3 }),
  drift: say([{ s: "Drifting toward", size: 96 }, { s: "one number", col: B60, size: 180, cue: [61, "one"] }], { m: 2 }),
  noorder: say([{ s: "Nobody", col: C.yellow, size: 170 }, { s: "ordered it", size: 130, cue: [62, "ordered"] }], { dark: true, m: 4 }),

  // ---------------- chapter 3 ----------------
  first: say([{ s: "Nothing like it", size: 110 }, { s: "had been done", col: C.red, size: 130, cue: [67, "done"] }], { m: 1, glyph: "pylon" }),
  n40: num("40", "cycles a second", { top: "But it ran at", m: 4, col: "#8a55b5" }),
  aeg: card("AEG", "Berlin · the company behind the line", "generator", { col: R50, m: 0 }),
  aeg50: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <Banner text="AEG moved up" t={t} at={0} />
      <At x={520} y={450} s={pop(t, 0)}><Pill text="40" col={C.grey} fg="#fff" size={220} /></At>
      <Svg><Arrow x={760} y={450} len={300} col={C.red} s={pop(t, 6)} /></Svg>
      <At x={1400} y={450} s={pop(t, c(73, "50") - 3)}><Pill text="50" col={R50} fg="#fff" size={300} /></At>
    </Mv></Paper>
  ),
  rathenau: card("Emil Rathenau", "Director of AEG", "person", { col: R50, m: 2 }),
  quote: ({ t, d, c }) => (
    <Paper tone="#efe2c6"><Mv t={t} d={d} m={0}>
      <At x={250} y={230} s={pop(t, 0)}><T size={330} col={R50}>“</T></At>
      <div style={{ position: "absolute", left: 330, top: 250, width: 1300 }}>
        <div style={{ opacity: ease(k(t, 0, 8)) }}><T size={72} up={false} style={{ whiteSpace: "normal", lineHeight: 1.25 }}>After thorough investigations,</T></div>
        <div style={{ opacity: ease(k(t, c(75, "decided") - 3, 8)), marginTop: 18 }}><T size={72} up={false} style={{ whiteSpace: "normal", lineHeight: 1.25 }}>we decided for <span style={{ color: R50, fontSize: 110 }}>50</span> periods per second.</T></div>
        <div style={{ opacity: ease(k(t, c(75, "periods") + 6, 8)), marginTop: 40 }}><T size={44} w={800} col={C.grey} up={false}>Emil Rathenau, 1896</T></div>
      </div>
    </Mv></Paper>
  ),
  metric: ({ t, d, v, c }) => (
    <Paper><Mv t={t} d={d} m={v === 0 ? 3 : v === 1 ? 0 : 4}>
      <Banner text="The popular story" t={t} at={0} col={INK} />
      <At x={960} y={360} s={pop(t, 0)}><div style={{ display: "flex", alignItems: "center", gap: 50 }}><Pill text="50" col={R50} fg="#fff" size={190} /><T size={80} up={false}>rounder, more “metric”?</T></div></At>
      {v === 1 ? <At x={960} y={640} s={pop(t, 2)}><T size={100} col={C.green}>A nice story</T></At> : null}
      {v === 2 ? <Stamp text="Never proved" t={t} at={c(78, "proved") - 4} x={960} y={620} size={140} /> : null}
    </Mv></Paper>
  ),
  certain: say([{ s: "What is certain:", size: 100 }, { s: "what came next", col: C.red, size: 140, cue: [79, "happened"] }], { m: 2 }),
  split1900: ({ t, d, c }) => (
    <Dark><Mv t={t} d={d} m={0}>
      <At x={960} y={170} s={pop(t, 0)}><T size={90} col="#fff">By 1900</T></At>
      <At x={600} y={470} s={pop(t, 4)}><Pill text="60" col={B60} fg="#fff" size={260} /></At>
      <At x={1320} y={470} s={pop(t, 8)}><Pill text="50" col={R50} fg="#fff" size={260} /></At>
      <Svg><path d="M960 300 L940 400 L985 470 L935 540 L960 660" stroke={C.yellow} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${ease(k(t, c(82, "split") - 2, 10)) * 400} 400`} /></Svg>
      <At x={960} y={730} s={pop(t, c(82, "set") - 2)}><T size={84} col={C.yellow}>the split was set</T></At>
    </Mv></Dark>
  ),
  two: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={5}>
      <At x={560} y={250} s={pop(t, 0)}><div style={{ textAlign: "center" }}><Glyph kind="factory" s={170} /><T size={46} col={B60}>Westinghouse</T></div></At>
      <At x={1360} y={250} s={pop(t, 5)}><div style={{ textAlign: "center" }}><Glyph kind="factory" s={170} /><T size={46} col={R50}>AEG</T></div></At>
      <At x={560} y={500} s={pop(t, c(84, "Two") - 2)}><Pill text="60" col={B60} fg="#fff" size={130} /></At>
      <At x={1360} y={500} s={pop(t, c(84, "numbers") - 2)}><Pill text="50" col={R50} fg="#fff" size={130} /></At>
      <Svg><g opacity={ease(k(t, c(85, "10") - 2, 6))}><path d="M720 500 L1200 500" stroke={INK} strokeWidth={10} strokeDasharray="20 16" /></g></Svg>
      <At x={960} y={710} s={pop(t, c(85, "10") - 2)}><T size={92} col={C.red}>10 cycles apart</T></At>
    </Mv></Paper>
  ),
  stings: say([{ s: "The part", size: 110 }, { s: "that stings", col: C.red, size: 200, cue: [86, "stings"] }], { m: 4 }),
  kinder: ({ t, d, v }) => (
    <Paper><Mv t={t} d={d} m={v === 0 ? 2 : 3}>
      <At x={v === 0 ? 560 : 1360} y={420} s={pop(t, 0)}><Pill text={v === 0 ? "60" : "50"} col={v === 0 ? B60 : R50} fg="#fff" size={280} /></At>
      <At x={v === 0 ? 1280 : 620} y={380} s={pop(t, 5)}><Glyph kind={v === 0 ? "motor" : "pylon"} s={260} /></At>
      <At x={960} y={710} s={pop(t, 8)}><T size={76}>{v === 0 ? "a little kinder to some machines" : "a little kinder to others"}</T></At>
    </Mv></Paper>
  ),

  // ---------------- chapter 4 ----------------
  united: say([{ s: "At least America", size: 96 }, { s: "was united?", size: 150, cue: [92, "united"] }], { m: 0, stamp: { s: "It wasn't", cue: [93, "It"], y: 690, size: 150, r: -7 }, y: 330 }),
  likeeurope: say([{ s: "Like", size: 110 }, { s: "Europe", col: R50, size: 260 }], { m: 4 }),
  special50: icons([{ g: "clock", label: "50-cycle clock" }, { g: "fridge", label: "50-cycle fridge", cue: 8 }, { g: "motor", label: "50-cycle motor", cue: 16 }], { top: "Special models, one market", topCol: R50, m: 2, foot: "Southern California only", footCue: [97, "just"] }),
  hoover: ({ t, d, v }) => (
    <Paper><Mv t={t} d={d} m={v === 0 ? 1 : 4}>
      <Banner text="Hoover Dam" t={t} at={0} col={INK} />
      <At x={v === 0 ? 960 : 600} y={480} s={pop(t, 0)}><Glyph kind="dam" s={v === 0 ? 420 : 330} /></At>
      {v === 1 ? <><At x={1300} y={440} s={pop(t, 2)}><Pill text="60" col={B60} fg="#fff" size={300} /></At><At x={1300} y={700} s={pop(t, 8)}><T size={56}>cycle generators</T></At></> : null}
    </Mv></Paper>
  ),
  y1936: say([{ s: "1936", col: C.red, size: 300 }, { s: "the city converts", size: 90, cue: [101, "converted"] }], { m: 4 }),
  m18: num("18", "months", { m: 0, col: INK }),
  didntcare: icons([{ g: "bulb", label: "Lights" }, { g: "fixture", label: "Lamps", cue: 6 }, { g: "toaster", label: "Toasters", cue: 12 }], { top: "Most things didn't care", topCol: C.green, m: 3 }),
  toaster: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={5}>
      <At x={960} y={400} s={pop(t, 0)}><div style={{ transform: `rotate(${Math.sin(t / 5) * 4}deg)` }}><Glyph kind="toaster" s={420} /></div></At>
      <At x={560} y={700} s={pop(t, 6)}><Pill text="50 ✓" col={R50} fg="#fff" size={84} /></At>
      <At x={1360} y={700} s={pop(t, 12)}><Pill text="60 ✓" col={B60} fg="#fff" size={84} /></At>
    </Mv></Paper>
  ),
  clockcount: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="A clock counts the cycles" t={t} at={0} col={INK} />
      <At x={520} y={480} s={pop(t, 0)}><svg width={420} height={420} viewBox="0 0 100 100" style={{ overflow: "visible" }}><circle cx={50} cy={50} r={44} fill="#fffaf0" {...st} /><path d={`M50 50 L${50 + 30 * Math.sin(t / 9)} ${50 - 30 * Math.cos(t / 9)}`} {...sto} /><path d="M50 50 L50 28" {...sto} strokeWidth={9} /><circle cx={50} cy={50} r={4} fill={INK} /></svg></At>
      <Svg><Wave t={t} y={480} amp={90} cycles={4} speed={0.5} x0={860} x1={1740} col={R50} /></Svg>
      <At x={1300} y={700} s={pop(t, 10)}><T size={64}>tick · tick · tick</T></At>
    </Mv></Paper>
  ),
  min12: num("+12", "minutes, every hour", { m: 4, col: C.red, sub: "a 50-cycle clock on 60-cycle power", subCue: 8 }),
  truck: icons([{ g: "truck", label: "Trucked in" }, { g: "wrench", label: "Rebuilt", cue: [111, "rebuilt"] }, { g: "home", label: "Home in days", cue: [111, "sent"] }], { top: "The clock run", topCol: INK, m: 2 }),
  edison: card("Southern California Edison", "The same job, on a bigger scale", "generator", { col: R50, m: 0 }),
  tally: ({ t, d, v }) => {
    const rows: [string, number, string][] = [["clock", 475000, "clocks"], ["fixture", 380000, "light fixtures"], ["fridge", 58000, "refrigerators"]];
    return (
      <Paper><Mv t={t} d={d} m={v === 1 ? 3 : 2}>
        <Banner text="The tally" t={t} at={-20} col={INK} />
        {rows.map(([g, n, label], i) => i > v ? null : (
          <div key={i} style={{ position: "absolute", left: 300, top: 220 + i * 190, display: "flex", alignItems: "center", gap: 40, opacity: i < v ? 0.55 : 1, transform: `scale(${i === v ? pop(t, 0) : 1})`, transformOrigin: "0 50%" }}>
            <Glyph kind={g} s={150} />
            <T size={i === v ? 150 : 110} col={C.red}>{fmt(i === v ? count(t, 0, 16, 0, n) : n)}</T>
            <T size={60}>{label}</T>
          </div>))}
      </Mv></Paper>
    );
  },
  bill34: num("$34M", "the bill", { m: 4, col: C.green, top: "More than", size: 300 }),
  third: ({ t, d }) => {
    const a = ease(k(t, 4, 18)) * (Math.PI * 2 * 0.36), x = 240 * Math.sin(a), y = -240 * Math.cos(a);
    return (
      <Paper><Mv t={t} d={d} m={0}>
        <Banner text="Of a year's revenue" t={t} at={0} col={INK} />
        <At x={640} y={480} s={pop(t, 0)}><svg width={520} height={520} viewBox="-260 -260 520 520"><circle r={240} fill="#fffaf0" {...st} /><path d={`M0 0 L0 -240 A240 240 0 ${a > Math.PI ? 1 : 0} 1 ${x} ${y} Z`} fill={C.green} {...st} /></svg></At>
        <At x={1300} y={440} s={pop(t, 8)}><T size={240} col={C.green} style={{ textShadow: `0 10px 0 ${INK}` }}>⅓+</T></At>
        <At x={1300} y={650} s={pop(t, 14)}><T size={56}>over a third</T></At>
      </Mv></Paper>
    );
  },
  date1948: say([{ s: "October 27", size: 130 }, { s: "1948", col: C.red, size: 280, cue: [119, "1948"] }], { m: 4 }),
  cost: say([{ s: "What it costs", size: 110 }, { s: "to change your mind", col: C.red, size: 120, cue: [120, "change"] }], { m: 5 }),
  costlist: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={2}>
      <Banner text="The price of switching" t={t} at={0} col={INK} />
      <div style={{ position: "absolute", left: 330, top: 250 }}>
        <Row text="One corner of one state" t={t} at={0} mark="check" markAt={8} size={70} />
        <Row text="12 years" t={t} at={c(122, "12") - 2} mark="check" markAt={c(122, "12") + 6} size={70} />
        <Row text="A third of a year's income" t={t} at={c(123, "third") - 4} mark="check" markAt={c(123, "third") + 6} size={70} />
      </div>
    </Mv></Paper>
  ),

  // ---------------- chapter 5 ----------------
  c50: num("50", "cycles", { top: "Tokyo · from Germany", col: R50, m: 4 }),
  c60: num("60", "cycles", { top: "Osaka · from America", col: B60, m: 4 }),
  twotrips: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={5}>
      <At x={560} y={330} s={pop(t, 0)}><div style={{ textAlign: "center" }}><Glyph kind="city" s={220} col={R50} /><T size={60} col={R50}>Tokyo</T></div></At>
      <At x={1360} y={330} s={pop(t, 6)}><div style={{ textAlign: "center" }}><Glyph kind="city" s={220} col={B60} /><T size={60} col={B60}>Osaka</T></div></At>
      <At x={960} y={670} s={pop(t, c(134, "Two") - 2)}><T size={110}>Two shopping trips</T></At>
    </Mv></Paper>
  ),
  nevermerged: say([{ s: "They've", size: 100 }, { s: "never merged", col: C.yellow, size: 190, cue: [141, "never"] }], { dark: true, m: 4 }),
  only: say([{ s: "No other major country", size: 84 }, { s: "is split like that", col: C.red, size: 130, cue: [143, "split"] }], { m: 0 }),
  y1965: say([{ s: "1965", col: C.red, size: 300 }, { s: "the first big converter", size: 84 }], { m: 4, glyph: undefined }),
  enough: say([{ s: "For decades,", size: 100 }, { s: "that was enough", col: C.green, size: 150, cue: [147, "enough"] }], { m: 1 }),

  // ---------------- chapter 6 ----------------
  date2011: say([{ s: "March 11", col: "#fff", size: 150 }, { s: "2011", col: C.yellow, size: 300, cue: [148, "2011"] }], { dark: true, tone: "#2a1418", m: 4 }),
  gw1: num("1 GW", "all the converters could carry", { m: 4, col: C.red, top: "About", size: 300, dark: true }),
  fraction: ({ t, d }) => (
    <Dark tone="#2a1418"><Mv t={t} d={d} m={0}>
      <At x={960} y={130} s={pop(t, 0)}><T size={70} col="#fff">Gigawatts</T></At>
      <Svg>
        <g opacity={pop(t, 0) > 0 ? 1 : 0}><Bar x={520} y={720} w={260} h={26} col={C.yellow} label="Could cross" val="1" fg="#fff" /></g>
        <g opacity={pop(t, 6) > 0 ? 1 : 0}><Bar x={1100} y={720} w={260} h={Math.round(520 * easeOut(k(t, 6, 22)))} col={C.red} label="East had lost" val={String(count(t, 6, 28, 0, 21))} fg="#fff" /></g>
      </Svg>
    </Mv></Dark>
  ),
  cantmake: say([{ s: "The west could not", size: 96, col: "#fff" }, { s: "make up the difference", col: C.yellow, size: 110, cue: [156, "make"] }], { dark: true, tone: "#2a1418", m: 2 }),
  blackouts: ({ t, d, c }) => (
    <Dark tone="#101018"><Mv t={t} d={d} m={0}>
      <At x={960} y={170} s={pop(t, 0)}><T size={110} col="#fff">Greater Tokyo</T></At>
      <div style={{ position: "absolute", left: 360, top: 300, display: "grid", gridTemplateColumns: "repeat(10, 120px)", gap: 0 }}>
        {Array.from({ length: 30 }, (_, i) => { const on = ((i * 7 + Math.floor(t / 9)) % 5) > 1 || t < c(157, "rolling") - 6; return <div key={i} style={{ width: 104, height: 84, margin: 8, borderRadius: 10, border: `5px solid ${INK}`, background: on ? C.yellow : "#2a2a36", boxShadow: on ? `0 0 28px ${C.yellow}` : "none" }} />; })}
      </div>
      <Stamp text="Rolling blackouts" t={t} at={c(157, "rolling") - 3} x={960} y={470} size={120} r={-6} />
    </Mv></Dark>
  ),
  trains: icons([{ g: "train", label: "Trains cut back" }], { dark: true, m: 4 }),
  factories: icons([{ g: "factory", label: "Factories went quiet" }], { dark: true, m: 0 }),
  orders: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={1}>
      <At x={330} y={330} s={pop(t, 0)}><div style={{ textAlign: "center" }}><Glyph kind="order" s={230} /><T size={46} col={R50}>Tokyo · AEG</T></div></At>
      <At x={1590} y={330} s={pop(t, 5)}><div style={{ textAlign: "center" }}><Glyph kind="order" s={230} /><T size={46} col={B60}>Osaka · GE</T></div></At>
      <At x={960} y={300} s={pop(t, c(161, "115") - 3)}><T size={250} col={C.red} style={{ textShadow: `0 10px 0 ${INK}` }}>115</T></At>
      <At x={960} y={490} s={pop(t, c(161, "years") - 2)}><T size={80}>years earlier</T></At>
      <At x={960} y={690} s={pop(t, 10)}><T size={64} col={C.grey}>Two purchase orders</T></At>
    </Mv></Paper>
  ),

  // ---------------- ending ----------------
  twice: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="What can cross the line" t={t} at={0} col={INK} />
      <Svg>
        <Bar x={520} y={690} w={280} h={190} col={C.grey} label="2011" val="1 GW" />
        <g opacity={pop(t, c(163, "2021") - 4) > 0 ? 1 : 0}><Bar x={1100} y={690} w={280} h={Math.round(400 * easeOut(k(t, c(163, "2021") - 4, 20)))} col={C.green} label="2021" val="2.1 GW" /></g>
      </Svg>
    </Mv></Paper>
  ),
  more: say([{ s: "More are", size: 110 }, { s: "being built", col: C.green, size: 170 }], { m: 4, glyph: "pylon" }),
  realproblem: say([{ s: "The real problem?", size: 130 }, { s: "Nobody's fixing it", col: C.red, size: 120, cue: [165, "fixing"] }], { m: 5 }),
  pickone: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <Banner text="Pick one number" t={t} at={0} col={INK} />
      <At x={600} y={470} s={pop(t, 0)}><div style={{ transform: `rotate(${Math.sin(t / 4) * 5}deg)` }}><Pill text="60" col={B60} fg="#fff" size={260} /></div></At>
      <At x={960} y={470} s={pop(t, 4)}><T size={120}>or</T></At>
      <At x={1320} y={470} s={pop(t, 8)}><div style={{ transform: `rotate(${-Math.sin(t / 4) * 5}deg)` }}><Pill text="50" col={R50} fg="#fff" size={260} /></div></At>
    </Mv></Paper>
  ),
  notbetter: say([{ s: "Not because", size: 110 }, { s: "one is better", col: C.red, size: 170, cue: [172, "better"] }], { m: 0 }),
  planet: say([{ s: "They weren't setting", size: 90, col: "#fff" }, { s: "a standard for the planet", col: C.yellow, size: 96, cue: [174, "standard"] }], { dark: true, m: 2 }),
};
void Big; void lerp;
