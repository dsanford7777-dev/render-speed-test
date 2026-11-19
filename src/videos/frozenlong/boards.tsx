// The Longyearbyen long-form's 2D boards and maps. Each takes G (t = frame in shot, d = shot length, c(seg, word) = a
// word's onset in shot frames, v = variant). Content stays above y = 800 (captions below). Every board moves (Mv) and
// shows something from its first frame. Colour code: the flu = red, cold / frozen = blue, Alaska = green.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, G, FONT, Paper, At, T, Banner, Stamp, NameCard, Row, Big, k, pop, ease, lerp, clamp01 } from "../pigwarlong/kit";
import { Mv, Dark, Glyph as HGlyph } from "../hertzlong/boards";
import { Viewport, Land, Label, Pin, Draw, Burst, Title, Wrap } from "../hertzlong/maps";

const INK = C.ink, ICE = "#3f7fb5", ICE2 = "#bfe0f2", FLU = C.red, AK = C.green, EARTH = "#8a6440", EARTH2 = "#6e4e30";
const st = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const sto = { ...st, fill: "none" };
type Cue = number | [number, string];
const at = (cue: Cue | undefined, c: G["c"], lead = 2) => cue === undefined ? 0 : typeof cue === "number" ? cue : Math.max(0, c(cue[0], cue[1]) - lead);

// ---------------- glyphs (100 x 100 box) ----------------
const coffinPath = "M38 6 L62 6 L74 28 L66 94 L34 94 L26 28 Z";
const Glyph: React.FC<{ kind: string; s?: number; col?: string }> = ({ kind, s = 160, col }) => {
  const body = (() => {
    switch (kind) {
      case "virus": return <>{Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <g key={i}><path d={`M${50 + 30 * Math.cos(a)} ${50 + 30 * Math.sin(a)} L${50 + 44 * Math.cos(a)} ${50 + 44 * Math.sin(a)}`} {...sto} strokeWidth={6} /><circle cx={50 + 46 * Math.cos(a)} cy={50 + 46 * Math.sin(a)} r={6} fill={col ?? FLU} {...st} strokeWidth={4} /></g>; })}<circle cx={50} cy={50} r={31} fill={col ?? FLU} {...st} /><circle cx={40} cy={42} r={6} fill="#fff" opacity={0.6} /><circle cx={58} cy={60} r={5} fill={INK} opacity={0.35} /></>;
      case "coffin": return <><path d={coffinPath} fill={col ?? "#8a5a34"} {...st} /><path d="M50 30 L50 62 M38 42 L62 42" {...sto} strokeWidth={6} stroke="#e8d7b0" /></>;
      case "cross": return <><path d="M44 8 L56 8 L56 30 L80 30 L80 42 L56 42 L56 94 L44 94 L44 42 L20 42 L20 30 L44 30 Z" fill={col ?? "#f4f0e6"} {...st} /></>;
      case "flake": return <>{[0, 60, 120].map((r) => <g key={r} transform={`rotate(${r} 50 50)`}><path d="M50 6 L50 94 M50 22 L40 12 M50 22 L60 12 M50 78 L40 88 M50 78 L60 88" {...sto} stroke={col ?? ICE} strokeWidth={9} /></g>)}</>;
      case "sun": return <>{Array.from({ length: 8 }, (_, i) => <path key={i} transform={`rotate(${i * 45} 50 50)`} d="M50 4 L50 20" {...sto} stroke={C.yellow} strokeWidth={9} />)}<circle cx={50} cy={50} r={24} fill={C.yellow} {...st} /></>;
      case "shovel": return <><path d="M48 6 L54 6 L54 58 L48 58 Z" fill="#a9825a" {...st} /><path d="M38 6 L64 6" {...sto} strokeWidth={9} /><path d="M32 56 L70 56 L68 84 Q51 98 34 84 Z" fill="#9aa0a8" {...st} /></>;
      case "shears": return <><path d="M44 50 L20 8 L30 6 L52 46 Z M56 50 L80 8 L70 6 L48 46 Z" fill="#c9ccd2" {...st} /><circle cx={34} cy={74} r={16} fill="none" stroke={C.red} strokeWidth={10} /><circle cx={66} cy={74} r={16} fill="none" stroke={C.red} strokeWidth={10} /><path d="M40 60 L50 50 L60 60" {...sto} /></>;
      case "x": return <path d="M20 20 L80 80 M80 20 L20 80" {...sto} stroke={C.red} strokeWidth={16} />;
      case "check": return <path d="M16 54 L40 78 L86 22" {...sto} stroke={C.green} strokeWidth={16} />;
      case "bed": return <><rect x={8} y={50} width={84} height={22} rx={6} fill="#c9b8a0" {...st} /><rect x={12} y={38} width={24} height={16} rx={6} fill="#f4f0e6" {...st} /><path d="M8 30 L8 86 M92 50 L92 86" {...sto} strokeWidth={9} /></>;
      case "coal": return <><path d="M10 84 L22 54 L40 46 L52 26 L70 38 L84 56 L92 84 Z" fill="#2c2c34" {...st} /><path d="M34 62 L44 56 M60 50 L68 58 M50 74 L58 70" stroke="#6a6a78" strokeWidth={5} strokeLinecap="round" /></>;
      case "flagno": return <><rect x={6} y={18} width={88} height={62} fill="#c9373a" {...st} /><rect x={30} y={18} width={16} height={62} fill="#fff" /><rect x={6} y={41} width={88} height={16} fill="#fff" /><rect x={34} y={18} width={8} height={62} fill="#20356a" /><rect x={6} y={45} width={88} height={8} fill="#20356a" /><rect x={6} y={18} width={88} height={62} fill="none" {...st} /></>;
      case "calendar": return <><rect x={10} y={16} width={80} height={76} rx={8} fill="#fffaf0" {...st} /><rect x={10} y={16} width={80} height={22} fill={FLU} {...st} /><text x={50} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK}>8</text></>;
      case "fire": return <><path d="M50 94 Q14 90 18 58 Q22 36 40 22 Q40 44 52 46 Q46 26 62 6 Q70 34 80 50 Q90 70 78 84 Q68 94 50 94 Z" fill="#e8762a" {...st} /><path d="M50 90 Q34 86 36 70 Q40 58 50 52 Q52 66 62 70 Q66 86 50 90 Z" fill={C.yellow} /></>;
      case "question": return <><circle cx={50} cy={50} r={44} fill={C.yellow} {...st} /><text x={50} y={72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={INK}>?</text></>;
      case "freezer": return <><rect x={18} y={6} width={64} height={88} rx={8} fill="#e8f2f6" {...st} /><path d="M18 40 L82 40" {...sto} /><path d="M28 20 L28 32 M28 50 L28 70" {...sto} /><g transform="translate(50 66) scale(0.32) translate(-50 -50)"><path d="M50 6 L50 94 M12 28 L88 72 M88 28 L12 72" {...sto} stroke={ICE} strokeWidth={14} /></g></>;
      case "microscope": return <><path d="M20 90 L80 90" {...sto} strokeWidth={10} /><path d="M40 90 Q30 70 46 58" {...sto} /><rect x={44} y={10} width={16} height={46} rx={4} transform="rotate(-20 52 33)" fill="#3a3a48" {...st} /><rect x={30} y={60} width={44} height={8} fill="#8a8090" {...st} /></>;
      case "lungs": return <><path d="M46 20 L46 46 Q30 30 18 50 Q8 72 14 86 Q26 94 44 82 Q48 64 46 46" fill="#e89aa0" {...st} /><path d="M54 20 L54 46 Q70 30 82 50 Q92 72 86 86 Q74 94 56 82 Q52 64 54 46" fill="#e89aa0" {...st} /><path d="M50 6 L50 34" {...sto} strokeWidth={9} /></>;
      case "urn": return <><path d="M34 14 L66 14 L62 24 Q84 36 78 64 Q72 90 50 92 Q28 90 22 64 Q16 36 38 24 Z" fill="#8a6a9a" {...st} /><path d="M30 14 L70 14" {...sto} strokeWidth={9} /></>;
      case "baby": return <><circle cx={50} cy={30} r={20} fill="#f5d2b4" {...st} /><path d="M22 92 Q20 56 50 54 Q80 56 78 92 Z" fill="#a8c0d8" {...st} /><circle cx={43} cy={30} r={3} fill={INK} /><circle cx={57} cy={30} r={3} fill={INK} /></>;
      case "hospital": return <><rect x={12} y={30} width={76} height={62} fill="#f4f0e6" {...st} /><path d="M6 32 L50 8 L94 32" {...sto} /><rect x={40} y={44} width={20} height={36} fill={C.red} /><rect x={32} y={52} width={36} height={20} fill={C.red} /></>;
      case "globe": return <><circle cx={50} cy={50} r={42} fill={C.sea} {...st} /><path d="M28 24 Q44 30 40 46 Q30 54 34 70 M62 16 Q58 36 72 40 Q84 52 76 76" stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" /><circle cx={50} cy={50} r={42} fill="none" {...st} /></>;
      case "wind": return <><path d="M8 34 L62 34 Q80 34 78 18 Q74 6 62 12" {...sto} stroke={ICE} strokeWidth={10} /><path d="M8 54 L80 54 Q96 56 92 72 Q86 84 74 76" {...sto} stroke={ICE} strokeWidth={10} /><path d="M8 74 L44 74" {...sto} stroke={ICE} strokeWidth={10} /></>;
      case "apart": return <><circle cx={20} cy={30} r={12} fill="#f5d2b4" {...st} /><path d="M6 90 Q6 50 20 48 Q34 50 34 90" fill="#5a6a7a" {...st} /><circle cx={80} cy={30} r={12} fill="#f5d2b4" {...st} /><path d="M66 90 Q66 50 80 48 Q94 50 94 90" fill="#5a6a7a" {...st} /><path d="M40 60 L60 60 M44 54 L38 60 L44 66 M56 54 L62 60 L56 66" {...sto} strokeWidth={5} /></>;
      case "miner": return <><circle cx={50} cy={34} r={18} fill="#f0d2b0" {...st} /><path d="M30 28 Q50 8 70 28 Z" fill="#4a4a52" {...st} /><circle cx={50} cy={18} r={5} fill={C.yellow} {...st} strokeWidth={4} /><path d="M24 96 Q24 56 50 54 Q76 56 76 96 Z" fill="#4a5a6a" {...st} /></>;
      case "carpenter": return <><circle cx={44} cy={34} r={18} fill="#f0d2b0" {...st} /><path d="M24 28 Q44 12 64 28 Z" fill="#8a5a34" {...st} /><path d="M18 96 Q18 56 44 54 Q70 56 70 96 Z" fill="#8a7a3a" {...st} /><path d="M76 40 L76 80 M66 40 L86 40" {...sto} strokeWidth={9} stroke="#5a3a20" /></>;
      case "journal": return <><rect x={16} y={6} width={68} height={88} fill="#fffaf0" {...st} /><rect x={16} y={6} width={68} height={24} fill="#b31b1b" {...st} /><text x={50} y={25} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={15} fill="#fff">SCIENCE</text><path d="M28 44 L72 44 M28 56 L72 56 M28 68 L60 68" {...sto} strokeWidth={5} /></>;
      case "plane": return <><path d="M6 52 L80 46 Q96 46 94 54 Q92 60 78 60 L6 58 Z" fill="#f4f0e6" {...st} /><path d="M40 50 L26 18 L38 18 L58 49 M40 58 L28 84 L40 84 L58 59 M10 52 L4 34 L14 34 L22 51" fill={C.red} {...st} /></>;
      case "ship": return <><path d="M6 60 L94 60 L82 84 L18 84 Z" fill="#3a3a48" {...st} /><rect x={30} y={40} width={36} height={20} fill="#c9b8a0" {...st} /><rect x={52} y={18} width={12} height={22} fill={C.red} {...st} /></>;
      case "nosign": return <><circle cx={50} cy={50} r={42} fill="none" stroke={C.red} strokeWidth={12} /><path d="M22 78 L78 22" stroke={C.red} strokeWidth={12} /></>;
      default: return null;
    }
  })();
  if (!body) return <HGlyph kind={kind} s={s} col={col} />;
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>{body}</svg>;
};
const Bg: React.FC<{ dark?: boolean; tone?: string; children: React.ReactNode }> = ({ dark, tone, children }) => dark ? <Dark tone={tone}>{children}</Dark> : <Paper tone={tone}>{children}</Paper>;
const Disc: React.FC<{ dark?: boolean; children: React.ReactNode }> = ({ dark, children }) => <div style={dark ? { background: "#f2e6c9", border: `7px solid ${INK}`, borderRadius: "50%", padding: 22, display: "inline-block" } : undefined}>{children}</div>;

// ---------------- factories ----------------
type Ln = { s: string; col?: string; size?: number; cue?: Cue };
type SayOpts = { dark?: boolean; tone?: string; m?: number; top?: string; topCol?: string; stamp?: { s: string; cue: Cue; x?: number; y?: number; size?: number; col?: string; r?: number }; glyph?: string; y?: number };
/** big statement: lines that pop in one after another, an optional banner, glyph and stamp */
export const say = (lines: Ln[], o: SayOpts = {}): React.FC<G> => ({ t, d, c }) => {
  const fg = o.dark ? "#fff" : INK;
  const sz = lines.map((ln) => Math.min(ln.size ?? 120, 1640 / (ln.s.length * 0.68)));
  const y0 = (o.y ?? (o.glyph ? 500 : 430)) - sz.reduce((a, x) => a + x * 1.16, 0) / 2;
  let y = y0;
  return (
    <Bg dark={o.dark} tone={o.tone}><Mv t={t} d={d} m={o.m ?? 0}>
      {o.top ? <Banner text={o.top} t={t} at={0} col={o.topCol ?? FLU} /> : null}
      {o.glyph ? <At x={960} y={y0 - 120} s={pop(t, 0)}><Disc dark={o.dark}><Glyph kind={o.glyph} s={170} /></Disc></At> : null}
      {lines.map((ln, i) => {
        const size = sz[i], yy = y + size * 0.58; y += size * 1.16;
        return <At key={i} x={960} y={yy} s={pop(t, i === 0 ? 0 : at(ln.cue ?? i * 8, c))}><T size={size} col={ln.col ?? fg} style={{ textShadow: o.dark ? `0 ${size / 16}px 0 #000` : undefined }}>{ln.s}</T></At>;
      })}
      {o.stamp ? <Stamp text={o.stamp.s} t={t} at={at(o.stamp.cue, c)} x={o.stamp.x ?? 960} y={o.stamp.y ?? 690} size={o.stamp.size ?? 110} col={o.stamp.col ?? FLU} r={o.stamp.r ?? -8} /> : null}
    </Mv></Bg>
  );
};
/** a giant number with a banner above and a label below */
export const num = (n: string, label: string, o: { top?: string; col?: string; dark?: boolean; m?: number; cue?: Cue; size?: number; sub?: string; subCue?: Cue; glyph?: string } = {}): React.FC<G> => ({ t, d, c }) => (
  <Bg dark={o.dark}><Mv t={t} d={d} m={o.m ?? 4}>
    {o.top ? <Banner text={o.top} t={t} at={0} col={o.col ?? INK} y={150} /> : null}
    {o.glyph ? <At x={Math.max(170, 960 - (n.length * Math.min(o.size ?? 330, 1500 / (n.length * 0.62)) * 0.62) / 2 - 190)} y={440} s={pop(t, 4)} r={-8}><Disc dark={o.dark}><Glyph kind={o.glyph} s={200} /></Disc></At> : null}
    <Big n={n} label={label} t={t} at={at(o.cue, c, 3)} x={960} y={o.top ? 470 : 420} size={Math.min(o.size ?? 330, 1500 / (n.length * 0.62))} col={o.col ?? FLU} lcol={o.dark ? "#fff" : INK} />
    {o.sub ? <At x={960} y={735} s={pop(t, at(o.subCue ?? 10, c))}><T size={52} w={800} col={o.dark ? C.gold : C.grey} up={false}>{o.sub}</T></At> : null}
  </Mv></Bg>
);
export const card = (name: string, role: string, glyph: string, o: { col?: string; extra?: string; extraCue?: Cue; m?: number; stamp?: string; stampCue?: Cue; stampX?: number; stampY?: number; stampSize?: number } = {}): React.FC<G> => ({ t, d, c }) => (
  <Paper><Mv t={t} d={d} m={o.m ?? 0}>
    <AbsoluteFill style={{ transform: `scale(${Math.min(1, 1640 / (Math.max(name.length * 66, role.length * 33) + 520))})`, transformOrigin: "50% 39%" }}>
      <NameCard name={name} role={role} t={t} at={0} x={960} y={420} col={o.col ?? ICE} icon={<Glyph kind={glyph} s={230} />} extra={o.extra} extraAt={o.extra ? at(o.extraCue ?? 12, c) : undefined} />
    </AbsoluteFill>
    {o.stamp ? <Stamp text={o.stamp} t={t} at={at(o.stampCue ?? 12, c)} x={o.stampX ?? 1420} y={o.stampY ?? 680} size={o.stampSize ?? 90} /> : null}
  </Mv></Paper>
);
/** a row of glyphs with labels, each popping on its word */
export const icons = (items: { g: string; label: string; cue?: Cue; col?: string; mark?: "x" | "check" }[], o: { top?: string; topCol?: string; m?: number; foot?: string; footCue?: Cue; dark?: boolean } = {}): React.FC<G> => ({ t, d, c }) => {
  const w = Math.min(520, 1640 / items.length), x0 = 960 - (w * (items.length - 1)) / 2;
  return (
    <Bg dark={o.dark}><Mv t={t} d={d} m={o.m ?? 2}>
      {o.top ? <Banner text={o.top} t={t} at={0} col={o.topCol ?? FLU} /> : null}
      {items.map((it, i) => {
        const a = i === 0 ? 0 : at(it.cue ?? i * 9, c), s = pop(t, a), gs = items.length === 1 ? 330 : Math.min(250, w * 0.62);
        return <At key={i} x={x0 + i * w} y={items.length === 1 ? 430 : 450} s={s}><div style={{ textAlign: "center", position: "relative" }}>
          <Disc dark={o.dark}><Glyph kind={it.g} s={gs} col={it.col} /></Disc>
          {it.mark ? <div style={{ position: "absolute", right: -10, top: -10, transform: `scale(${pop(t, a + 8)})` }}><Glyph kind={it.mark} s={gs * 0.5} /></div> : null}
          <T size={items.length === 1 ? 84 : Math.min(52, Math.max(40, (w * 1.3) / Math.max(6, it.label.length)))} col={o.dark ? "#fff" : INK} style={{ whiteSpace: "normal", width: w * 0.92, margin: "0 auto" }}>{it.label}</T></div></At>;
      })}
      {o.foot ? <At x={960} y={735} s={pop(t, at(o.footCue ?? 20, c))}><T size={62} col={o.dark ? C.yellow : FLU}>{o.foot}</T></At> : null}
    </Mv></Bg>
  );
};
/** a checklist: rows that appear on their words, each ticked or crossed */
export const checks = (rows: { s: string; cue?: Cue; mark?: "x" | "check"; strike?: boolean }[], o: { top?: string; topCol?: string; m?: number; size?: number; stamp?: { s: string; cue: Cue; col?: string } } = {}): React.FC<G> => ({ t, d, c }) => (
  <Paper><Mv t={t} d={d} m={o.m ?? 0}>
    {o.top ? <Banner text={o.top} t={t} at={0} col={o.topCol ?? INK} /> : null}
    <div style={{ position: "absolute", left: 0, right: 0, top: o.top ? 250 : 200, display: "flex", justifyContent: "center" }}><div>
      {rows.map((r, i) => { const a = i === 0 ? 0 : at(r.cue ?? i * 12, c); return <Row key={i} text={r.s} t={t} at={a} mark={r.mark ?? "check"} markAt={a + 8} size={o.size ?? 76} strike={r.strike} />; })}
    </div></div>
    {o.stamp ? <Stamp text={o.stamp.s} t={t} at={at(o.stamp.cue, c)} x={1450} y={690} size={96} col={o.stamp.col ?? FLU} r={-8} /> : null}
  </Mv></Paper>
);

// ---------------- diagrams ----------------
/** a cut through the ground: snow, the top layer (thawed or frozen), permafrost below, coffins at a depth */
const Ground: React.FC<{ t: number; thaw: number; coffY: number; ghost?: boolean; labels?: boolean; iceY?: number; lab?: number }> = ({ t, thaw, coffY, ghost, labels = true, iceY = 420, lab = 1 }) => {
  const top = 230, act = `rgb(${Math.round(lerp(170, 120, thaw))},${Math.round(lerp(200, 86, thaw))},${Math.round(lerp(222, 52, thaw))})`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <rect x={-200} y={-200} width={2320} height={top + 200} fill={thaw > 0.5 ? "#a9d0e6" : "#cfdbe6"} />
      <rect x={-200} y={top} width={2320} height={iceY - top} fill={act} />
      <rect x={-200} y={iceY} width={2320} height={1300} fill={ICE} />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 211) % 1920} cy={iceY + 30 + ((i * 97) % 420)} r={4 + (i % 3) * 2} fill="#fff" opacity={0.35} />)}
      <path d={`M-200 ${iceY} L2120 ${iceY}`} stroke="#fff" strokeWidth={8} strokeDasharray="30 18" />
      <rect x={-200} y={top - 34} width={2320} height={34} fill="#fff" opacity={1 - thaw} />
      <path d={`M-200 ${top} L2120 ${top}`} stroke={INK} strokeWidth={8} />
      {[560, 960, 1360].map((x, i) => <g key={i} transform={`translate(${x} ${top - 110})`}><path d="M-8 0 L8 0 L8 26 L34 26 L34 40 L8 40 L8 110 L-8 110 L-8 40 L-34 40 L-34 26 L-8 26 Z" fill="#f4f0e6" stroke={INK} strokeWidth={6} /></g>)}
      {[560, 960, 1360].map((x, i) => <g key={i} transform={`translate(${x - 120} ${coffY})`} opacity={ghost ? 0.35 : 1}><rect width={240} height={70} rx={12} fill={ghost ? "none" : "#8a5a34"} stroke={INK} strokeWidth={7} strokeDasharray={ghost ? "16 10" : undefined} /></g>)}
      {labels ? <g opacity={lab}>
        <text x={1840} y={(top + iceY) / 2 + 16} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">{thaw > 0.5 ? "THAWS EVERY SUMMER" : "FROZEN"}</text>
        <text x={1840} y={iceY + 80} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={52} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">PERMAFROST</text>
        <text x={1840} y={iceY + 136} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={38} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">NEVER THAWS</text>
      </g> : null}
      {void t}
    </svg>
  );
};

// ---------------- maps (drawn in code; stylised, not survey-grade) ----------------
const GREEN_L = "M-200 -200 L560 -200 L600 40 L520 260 L440 420 L330 560 L180 700 L-200 760 Z";
const NORWAY = "M760 1300 L820 1120 L900 1010 L980 930 L1060 880 L1150 830 L1240 790 L1310 760 L1400 770 L1480 760 L1560 790 L1660 780 L1760 800 L1900 840 L2200 860 L2200 1300 Z";
const SPITS = "M860 330 L930 290 L1010 300 L1060 270 L1110 300 L1090 360 L1120 410 L1080 470 L1060 540 L1010 600 L960 590 L920 530 L880 470 L900 420 Z";
const NORDA = "M1140 290 L1230 270 L1290 300 L1270 350 L1190 370 L1140 340 Z";
const EDGE = "M1080 500 L1150 470 L1190 520 L1150 580 L1090 570 Z";
const LYB: [number, number] = [985, 455], TROMSO: [number, number] = [1080, 905], POLE: [number, number] = [1010, -420], NOR_HOME: [number, number] = [900, 1040];
const Pole: React.FC<{ s: number }> = ({ s }) => s <= 0 ? null : <g transform={`translate(${POLE[0]} ${POLE[1]}) scale(${s})`}><circle r={26} fill={C.yellow} stroke={INK} strokeWidth={7} /><text y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK} stroke="#fffaf0" strokeWidth={10} paintOrder="stroke">NORTH POLE</text></g>;
const ShipMark: React.FC<{ x: number; y: number; s: number; flip?: boolean }> = ({ x, y, s, flip }) => s <= 0 ? null : <g transform={`translate(${x - 50 * s} ${y - 70 * s}) scale(${s * (flip ? -1 : 1)} ${s})`} style={{ transformOrigin: "50px 50px" }}><Glyph kind="ship" s={100} /></g>;
const along = (pts: [number, number][], u: number): [number, number] => { const n = pts.length - 1, x = clamp01(u) * n, i = Math.min(n - 1, Math.floor(x)), f = x - i; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; };
const pathOf = (pts: [number, number][]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
const SEA_ROUTE: [number, number][] = [[1090, 930], [1040, 800], [990, 660], [960, 560], [985, 470]];
const ArcticMap: React.FC<G> = ({ t, d, v, c }) => {
  const views: [[number, number, number], [number, number, number]][] = [
    [[0.62, 1000, 300], [1.9, 990, 440]], [[1.1, 990, 420], [0.5, 1000, 80]], [[0.85, 1020, 650], [0.95, 1010, 620]],
    [[1.0, 980, 600], [0.85, 960, 700]], [[0.8, 1000, 500], [1.5, 985, 455]], [[0.85, 1000, 600], [0.8, 1030, 680]]];
  const [from, to] = views[v] ?? views[0];
  const u = ease(t / Math.max(1, d)), p1 = pop(t, 4);
  const shipU = v === 2 ? clamp01((t - 6) / Math.max(1, d - 20)) : v === 3 ? clamp01((t - at([20, "Their"], c) - 4) / Math.max(1, d * 0.7)) : 0;
  const home: [number, number][] = [[985, 470], [960, 600], [930, 760], [900, 900], NOR_HOME];
  return (
    <Wrap title={<Title y={175} text={["Svalbard", "1,300 km to the Pole", "Spring and summer 1918", "Shipped home", "Longyearbyen", "Flown south"][v] ?? "Svalbard"} s={pop(t, 0)} col={v === 3 ? INK : v === 5 ? ICE : FLU} />}>
      <Viewport t={t} d={d} from={from} to={to}>
        <Land d={GREEN_L} fill="#f2f6f8" /><Land d={NORWAY} /><Land d={SPITS} fill="#f6f8fa" /><Land d={NORDA} fill="#f6f8fa" /><Land d={EDGE} fill="#f6f8fa" />
        <Label x={300} y={260} text="GREENLAND" size={44} bg={null} col={C.grey} /><Label x={1500} y={960} text="NORWAY" size={56} bg={null} col={C.grey} />
        {v === 1 ? <><Draw d={`M${LYB[0]} ${LYB[1]} L${POLE[0]} ${POLE[1]}`} u={k(t, 8, d * 0.5)} col={ICE} w={14} /><Pole s={pop(t, Math.round(d * 0.45))} />
          <Label x={1140} y={40} text="1,300 KM" size={64} o={k(t, d * 0.4, 8)} /></> : null}
        {v === 2 ? <><Draw d={pathOf(SEA_ROUTE)} u={clamp01(shipU * 1.2)} col={FLU} w={10} /><ShipMark x={along(SEA_ROUTE, shipU)[0]} y={along(SEA_ROUTE, shipU)[1]} s={0.9} />
          <At x={along(SEA_ROUTE, shipU)[0] + 90} y={along(SEA_ROUTE, shipU)[1] - 60} s={pop(t, 14)}><Glyph kind="virus" s={70} /></At></> : null}
        {v === 3 ? <><Draw d={pathOf(home)} u={shipU} col={INK} w={8} /><ShipMark x={along(home, shipU)[0]} y={along(home, shipU)[1]} s={0.9} />
          {[0, 1, 2].map((i) => <At key={i} x={along(home, shipU)[0] - 60 + i * 60} y={along(home, shipU)[1] - 150} s={pop(t, 4 + i * 4)}><Glyph kind="coffin" s={64} /></At>)}</> : null}
        {v === 5 ? <><Draw d={`M${LYB[0]} ${LYB[1]} Q1160 700 ${TROMSO[0]} ${TROMSO[1]}`} u={k(t, at([72, "flown"], c), 30)} col={ICE} w={10} />
          <At x={lerp(LYB[0], TROMSO[0], ease(k(t, at([72, "flown"], c), 30)))} y={lerp(LYB[1], TROMSO[1], ease(k(t, at([72, "flown"], c), 30))) - 40} s={pop(t, at([72, "flown"], c))}><Glyph kind="plane" s={110} /></At>
          <Pin x={TROMSO[0]} y={TROMSO[1]} s={pop(t, 6)} col={ICE} label="Tromsø" lx={170} ly={10} size={44} /></> : null}
        {v !== 5 ? <Pin x={TROMSO[0]} y={TROMSO[1]} s={v === 2 || v === 3 ? p1 : 0} col={INK} label="Tromsø" lx={170} ly={10} size={40} /> : null}
        <Pin x={LYB[0]} y={LYB[1]} s={v === 0 ? pop(t, Math.round(d * 0.35)) : p1} col={FLU} label="Longyearbyen" lx={-270} ly={0} size={v === 4 ? 30 : 44} />
        {v === 4 ? <Burst x={LYB[0]} y={LYB[1]} s={pop(t, 10) * 0.8} /> : null}
        {void u}
      </Viewport>
    </Wrap>
  );
};
// Boston to Svalbard (1901)
const NAM = "M-200 200 L180 160 L300 260 L330 380 L360 470 L420 560 L400 680 L300 760 L180 860 L-200 900 Z";
const EUR = "M1500 1300 L1440 1000 L1500 840 L1560 700 L1640 580 L1720 520 L1860 480 L2200 460 L2200 1300 Z";
const BOS: [number, number] = [390, 560], SVB: [number, number] = [1560, 180];
const AtlanticMap: React.FC<G> = ({ t, d }) => (
  <Wrap title={<Title y={175} text="Boston to Svalbard, 1901" s={pop(t, 0)} col={INK} />}>
    <Viewport t={t} d={d} from={[0.8, 960, 470]} to={[0.88, 1000, 430]}>
      <Land d={NAM} /><Land d={EUR} /><Land d="M1470 150 L1560 120 L1640 160 L1600 230 L1520 240 Z" fill="#f6f8fa" /><Land d={GREEN_L.replace("M-200 -200 L560", "M500 -200 L1100").replace("L600 40 L520 260 L440 420 L330 560 L180 700 L-200 760 Z", "L1120 60 L1040 260 L900 340 L760 300 L620 160 Z")} fill="#f2f6f8" />
      <Draw d={`M${BOS[0]} ${BOS[1]} Q1000 300 ${SVB[0]} ${SVB[1]}`} u={k(t, 6, d * 0.6)} col={FLU} w={10} dash />
      <Pin x={BOS[0]} y={BOS[1]} s={pop(t, 0)} col={C.blue} label="Boston" lx={0} ly={70} size={44} />
      <Pin x={SVB[0]} y={SVB[1]} s={pop(t, Math.round(d * 0.6))} col={FLU} label="Svalbard" lx={0} ly={-60} size={44} />
    </Viewport>
  </Wrap>
);
// Alaska: the Seward Peninsula, Brevig Mission
const AKL = "M-200 120 L300 60 L700 80 L1100 40 L1500 60 L2200 40 L2200 1300 L1500 1300 L1400 1000 L1250 880 L1080 860 L940 900 L820 840 L700 760 L560 700 L420 640 L330 560 L360 480 L460 440 L380 380 L240 400 L-200 420 Z";
const RUS = "M-200 600 L80 620 L160 700 L120 860 L-200 980 Z";
const BREVIG: [number, number] = [560, 560], NOME: [number, number] = [930, 820];
const AlaskaMap: React.FC<G> = ({ t, d }) => (
  <Wrap title={<Title y={175} text="Brevig Mission, Alaska" s={pop(t, 0)} col={AK} />}>
    <Viewport t={t} d={d} from={[0.7, 960, 500]} to={[1.15, 600, 560]}>
      <Land d={AKL} /><Land d={RUS} fill={C.paper2} />
      <Label x={1400} y={420} text="ALASKA" size={64} bg={null} col={C.grey} /><Label x={20} y={760} text="RUSSIA" size={40} bg={null} col={C.grey} />
      <Pin x={NOME[0]} y={NOME[1]} s={pop(t, 6)} col={INK} label="Nome" lx={0} ly={60} size={36} />
      <Pin x={BREVIG[0]} y={BREVIG[1]} s={pop(t, 0)} col={AK} label="Brevig Mission" lx={0} ly={-60} size={44} />
    </Viewport>
  </Wrap>
);
// the US: Alaska to Iowa (1951), San Francisco (1997)
const L48 = "M300 560 L560 540 L900 545 L1150 555 L1300 560 L1420 520 L1560 500 L1640 540 L1600 620 L1560 700 L1520 800 L1440 840 L1400 920 L1300 900 L1180 960 L1060 1000 L960 940 L800 920 L640 900 L520 880 L420 830 L340 760 L300 660 Z";
const AKU = "M120 120 L420 100 L520 160 L560 300 L520 380 L420 360 L300 400 L180 380 L80 300 Z";
const IOWA: [number, number] = [1080, 640], SF: [number, number] = [330, 720], AKP: [number, number] = [230, 210];
const UsaMap: React.FC<G> = ({ t, d, v, c }) => {
  const a = v === 0 ? at([37, "carried"], c) : 0;
  return (
    <Wrap title={<Title y={175} text={v === 0 ? "Back to Iowa, 1951" : "San Francisco, 1997"} s={pop(t, 0)} col={v === 0 ? AK : INK} />}>
      <Viewport t={t} d={d} from={v === 0 ? [0.95, 640, 420] : [0.85, 330, 480]} to={v === 0 ? [1.0, 680, 440] : [0.92, 320, 500]}>
        <Land d={L48} /><Land d={AKU} /><Label x={330} y={250} text="ALASKA" size={40} bg={null} col={C.grey} />
        <Pin x={AKP[0]} y={AKP[1]} s={pop(t, 0)} col={AK} label="Brevig Mission" lx={0} ly={-56} size={36} />
        {v === 0 ? <><Draw d={`M${AKP[0]} ${AKP[1]} Q760 260 ${IOWA[0]} ${IOWA[1]}`} u={k(t, a + 4, d * 0.55)} col={AK} w={10} /><Pin x={IOWA[0]} y={IOWA[1]} s={pop(t, Math.round(d * 0.55))} col={INK} label="Iowa" lx={0} ly={60} size={44} />
          <At x={lerp(AKP[0], IOWA[0], ease(k(t, a + 4, d * 0.55)))} y={lerp(AKP[1], IOWA[1], ease(k(t, a + 4, d * 0.55))) - 40} s={pop(t, 4)}><Glyph kind="lungs" s={90} /></At></> : null}
        {v === 1 ? <><Pin x={SF[0]} y={SF[1]} s={pop(t, 0)} col={FLU} label="San Francisco" lx={0} ly={70} size={44} /><Burst x={SF[0]} y={SF[1]} s={pop(t, 6) * 0.7} /></> : null}
      </Viewport>
    </Wrap>
  );
};
const MAPS: Record<string, React.FC<G>> = { arctic: ArcticMap, atlantic: AtlanticMap, alaska: AlaskaMap, usa: UsaMap };
export const MapBoard: React.FC<G & { name: string }> = ({ name, ...g }) => { const M = MAPS[name]; return M ? <M {...g} /> : null; };

// ---------------- boards ----------------
const People: React.FC<{ t: number; n: number; sick: number; at0: number }> = ({ t, n, sick, at0 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 22 }}>
    {Array.from({ length: n }, (_, i) => { const s = i < sick ? clamp01((t - at0 - i * 3) / 6) : 0;
      return <div key={i} style={{ transform: `scale(${pop(t, i * 2)})`, position: "relative" }}><Glyph kind="miner" s={180} />
        {s > 0 ? <div style={{ position: "absolute", left: 40, top: -10, transform: `scale(${s})` }}><Glyph kind="virus" s={70} /></div> : null}</div>; })}
  </div>
);
const Cols: React.FC<{ t: number; d: number; c: G["c"]; L: { g: string; title: string; sub: string; mark: "x" | "check"; cue?: Cue }; R: { g: string; title: string; sub: string; mark: "x" | "check"; cue?: Cue }; mid?: string }> = ({ t, d, c, L, R, mid }) => (
  <Paper><Mv t={t} d={d} m={0}>
    {[L, R].map((x, i) => { const a = i === 0 ? 0 : at(x.cue ?? 20, c); return (
      <At key={i} x={i === 0 ? 560 : 1360} y={420} s={pop(t, a)}><div style={{ textAlign: "center", background: "#fffaf0", border: `8px solid ${INK}`, borderRadius: 24, padding: "30px 50px", boxShadow: `0 12px 0 ${INK}`, position: "relative", width: 560 }}>
        <Glyph kind={x.g} s={220} /><T size={Math.min(58, 760 / x.title.length)}>{x.title}</T><T size={40} w={800} col={C.grey} up={false}>{x.sub}</T>
        <div style={{ position: "absolute", right: -40, top: -40, transform: `scale(${pop(t, a + 10)})` }}><Glyph kind={x.mark} s={130} /></div></div></At>); })}
    {mid ? <At x={960} y={420} s={pop(t, 6)}><T size={80} col={FLU}>{mid}</T></At> : null}
  </Mv></Paper>
);
const Sequence: React.FC<G> = ({ t, d }) => {
  const B = "AGCU", cols: Record<string, string> = { A: C.red, G: C.green, C: C.blue, U: C.gold };
  return (
    <Dark><Mv t={t} d={d} m={2}>
      <Banner text="Reading the 1918 virus" t={t} at={0} col={FLU} />
      {Array.from({ length: 4 }, (_, r) => (
        <div key={r} style={{ position: "absolute", left: 0, right: 0, top: 260 + r * 120, display: "flex", justifyContent: "center", gap: 12, transform: `translateX(${((t * (r % 2 ? 6 : -6)) % 120)}px)` }}>
          {Array.from({ length: 18 }, (_, i) => { const ch = B[(i * 7 + r * 3 + Math.floor(i / 3)) % 4], on = clamp01((t - (r * 18 + i) * 0.9) / 6);
            return <div key={i} style={{ width: 84, height: 96, borderRadius: 12, border: `6px solid ${INK}`, background: on > 0 ? cols[ch] : "#2c3550", opacity: 0.3 + 0.7 * on, display: "flex", alignItems: "center", justifyContent: "center" }}><T size={60} col="#fff">{on > 0 ? ch : ""}</T></div>; })}
        </div>))}
    </Mv></Dark>
  );
};
const Radar: React.FC<G> = ({ t, d, c }) => {
  const sweep = (t * 0.09) % (Math.PI * 2);
  return (
    <Dark tone="#0e1a14"><Mv t={t} d={d} m={0}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={360} y={170} width={1200} height={560} rx={30} fill="#0b2a1c" stroke={INK} strokeWidth={12} />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M380 ${230 + i * 110} L1540 ${230 + i * 110}`} stroke="#2f7a52" strokeWidth={3} opacity={0.6} />)}
        <path d={`M380 ${360 + 8 * Math.sin(t * 0.3)} ${Array.from({ length: 58 }, (_, i) => { const x = 380 + i * 20, b = Math.floor((i - 4) / 7.4), bump = i >= 4 && i < 56 && ((i - 4) % 7.4) < 4 && t > 8 + b * 6; return `L${x} ${360 + (bump ? 150 : 0) + 12 * Math.sin(i * 1.7 + t * 0.2)}`; }).join(" ")}`} stroke="#7cf0a8" strokeWidth={8} fill="none" />
        <rect x={380 + ((sweep / (Math.PI * 2)) * 1160)} y={180} width={16} height={540} fill="#7cf0a8" opacity={0.25} />
      </svg>
      <Stamp text="7 COFFINS" t={t} at={at([47, "7"], c)} x={960} y={660} size={110} col={C.yellow} r={-6} />
    </Mv></Dark>
  );
};
const Science: React.FC<G> = ({ t, d }) => (
  <Paper><Mv t={t} d={d} m={0}>
    <At x={760} y={420} s={pop(t, 0)} r={-4}><div style={{ width: 520, height: 660, background: "#fffaf0", border: `8px solid ${INK}`, boxShadow: `0 14px 0 ${INK}` }}>
      <div style={{ background: "#b31b1b", padding: "26px 0", textAlign: "center", borderBottom: `8px solid ${INK}` }}><T size={86} col="#fff">Science</T></div>
      <div style={{ padding: 34 }}><T size={44} w={800} col={C.grey} up={false}>March 1997</T>
        <div style={{ marginTop: 26 }}>{["Pieces of the", "1918 flu, from", "soldiers' saved", "tissue"].map((l, i) => <div key={i}><T size={50} up={false}>{l}</T></div>)}</div></div></div></At>
    <At x={1380} y={420} s={pop(t, 12)}><Glyph kind="microscope" s={300} /></At>
  </Mv></Paper>
);
const Freezer: React.FC<G> = ({ t, d, c }) => (
  <Paper><Mv t={t} d={d} m={4}>
    <Banner text="5 years of work" t={t} at={0} col={INK} />
    <At x={960} y={450} s={pop(t, 2)}><Glyph kind="freezer" s={360} /></At>
    <Stamp text="OFF EVERY SUMMER" t={t} at={at([57, "switched"], c)} x={960} y={500} size={100} col={FLU} r={-10} />
  </Mv></Paper>
);
const Heave: React.FC<G> = ({ t, d }) => { const cyc = (t / 40) % 1, th = cyc < 0.5 ? ease(cyc * 4) : 1 - ease((cyc - 0.5) * 4), up = ease(t / Math.max(1, d));
  return <AbsoluteFill><Mv t={t} d={d} m={0}><Ground t={t} thaw={th} coffY={560 - 220 * up} iceY={480} labels={false} />
    <At x={1560} y={420} s={pop(t, 0)}><div style={{ background: "#fffaf0", border: `7px solid ${INK}`, borderRadius: 18, padding: "18px 30px" }}><T size={54}>{th > 0.5 ? "Thaw" : "Freeze"}</T></div></At>
    <svg width={1920} height={1080} style={{ position: "absolute" }}><path d={`M760 ${700 - 220 * up} L760 ${520 - 220 * up}`} stroke={C.yellow} strokeWidth={22} strokeLinecap="round" /><path d={`M720 ${560 - 220 * up} L760 ${510 - 220 * up} L800 ${560 - 220 * up}`} stroke={C.yellow} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </Mv></AbsoluteFill>; };

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  y80: num("80", "years in the ground", { dark: true, col: C.yellow, glyph: "cross" }),
  flu1918: say([{ s: "The 1918 flu", col: FLU, size: 170 }, { s: "the deadliest pandemic", cue: [3, "deadliest"] }, { s: "in modern history", cue: [3, "modern"], size: 90 }], { glyph: "virus", m: 4 }),
  permafrost: ({ t, d, c }) => <AbsoluteFill><Mv t={t} d={d} m={0}><Ground t={t} thaw={0} coffY={600} lab={k(t, at([4, "never"], c), 10)} /><Title text="Ground that never thaws" s={pop(t, 0)} col={ICE} y={82} size={50} /></Mv></AbsoluteFill>,
  story: icons([{ g: "shovel", label: "The dig" }, { g: "x", label: "Why it failed", cue: [6, "failed"] }, { g: "shears", label: "The man who found it", cue: [6, "man"] }], { top: "This is the story of", topCol: INK }),
  noburial: say([{ s: "Today:", size: 90 }, { s: "no burials at all", cue: [7, "buried"], col: FLU, size: 140 }], { glyph: "nosign", m: 4 }),
  // ---------------- a town named after an American ----------------
  longyear: card("John Munro Longyear", "a businessman from Boston", "person", { col: C.blue, extra: "came to Svalbard as a tourist, 1901", extraCue: [10, "visited"] }),
  coal: icons([{ g: "coal", label: "He saw coal" }], { m: 4 }),
  acc: num("1906", "the Arctic Coal Company", { col: INK, sub: "docks, houses, “Longyear City”", subCue: [11, "built"], glyph: "coal" }),
  minebeds: say([{ s: "Not a town.", size: 110 }, { s: "A mine with beds.", cue: [12, "mine"], col: FLU, size: 140 }], { glyph: "bed", m: 0 }),
  storenorske: card("Store Norske", "a Norwegian company", "flagno", { col: FLU, stamp: "BOUGHT, 1916", stampCue: [13, "bought"] }),
  // ---------------- the summer the mines went quiet ----------------
  fluarrived: say([{ s: "Two years later", size: 100 }, { s: "the flu arrived", cue: [14, "flu"], col: C.yellow, size: 150 }], { dark: true, glyph: "virus", m: 4 }),
  half: ({ t, d, c }) => <Paper><Mv t={t} d={d} m={2}><Banner text="By July: more than half sick" t={t} at={0} col={FLU} /><People t={t} n={9} sick={5} at0={Math.max(6, at([16, "half"], c))} /></Mv></Paper>,
  n20: num("20", "of 200 men could work", { sub: "one day in late July, 1918", subCue: [16, "late"], glyph: "miner" }),
  shifts: checks([{ s: "Shifts", mark: "x", strike: true }, { s: "Whole mines, for days", cue: [17, "mines"], mark: "x", strike: true }], { top: "Stopped", topCol: FLU, size: 90 }),
  carpenters: ({ t, d, c }) => <Cols t={t} d={d} c={c} L={{ g: "miner", title: "Miners", sub: "underground", mark: "x" }} R={{ g: "carpenter", title: "Carpenters", sub: "outside", mark: "check", cue: [18, "carpenters"] }} />,
  freshair: icons([{ g: "wind", label: "Fresh air" }, { g: "apart", label: "Distance", cue: [18, "distance"] }], { top: "Today we'd say", topCol: ICE }),
  aug8: say([{ s: "August 8, 1918", size: 110 }, { s: "the first miner dies", cue: [19, "first"], col: FLU }], { glyph: "calendar", m: 0 }),
  age20: num("20", "years old", { col: FLU, m: 4 }),
  three: icons([{ g: "coffin", label: "" }, { g: "coffin", label: "", cue: 6 }, { g: "coffin", label: "", cue: 12 }], { top: "3 more in two weeks", topCol: INK, m: 3 }),
  over: say([{ s: "By the end of August", size: 100 }, { s: "it seemed over", cue: [21, "seemed"], size: 150 }], { m: 1, stamp: { s: "IT WASN'T", cue: [21, "over"], y: 700, size: 90 } }),
  // ---------------- the last ship ----------------
  nothome: say([{ s: "This time,", size: 100 }, { s: "nobody shipped them home", cue: [25, "nobody"], col: C.yellow }], { dark: true, m: 0 }),
  burned: icons([{ g: "fire", label: "Their clothes" }, { g: "fire", label: "Their bedding", cue: [25, "bedding"] }], { top: "Burned", topCol: FLU, m: 2 }),
  // ---------------- a virus nobody kept ----------------
  nosample: num("0", "samples kept", { dark: true, col: C.yellow, sub: "not one", subCue: [30, "Not"], glyph: "virus" }),
  nocause: say([{ s: "In 1918,", size: 100 }, { s: "nobody knew", cue: [31, "nobody"], col: FLU, size: 150 }, { s: "what caused the flu", cue: [31, "caused"], size: 100 }], { glyph: "question", m: 0 }),
  y1933: num("1933", "the flu virus is first isolated", { col: C.blue, m: 4, glyph: "microscope" }),
  questions: say([{ s: "Why so deadly?", col: FLU, size: 140 }, { s: "Could it happen again?", cue: [33, "could"], size: 120 }], { glyph: "virus", m: 5 }),
  cold: say([{ s: "The best hope:", size: 100 }, { s: "cold", cue: [34, "cold"], col: ICE, size: 230 }], { glyph: "flake", m: 4 }),
  freezer: icons([{ g: "freezer", label: "Like meat in a freezer" }], { m: 0 }),
  hultin51: card("Johan Hultin", "a graduate student, 1951", "person", { col: AK }),
  n72: num("72 of 80", "villagers dead in 5 days", { col: FLU, sub: "Brevig Mission, November 1918", subCue: 8, size: 280 }),
  nothing: say([{ s: "He tried everything.", size: 100 }, { s: "Nothing grew.", cue: [37, "Nothing"], col: FLU, size: 160 }], { glyph: "microscope", stamp: { s: "FAILED", cue: [37, "grew"], y: 720, size: 100 } }),
  army: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="1951: the U.S. Army looks too" t={t} at={0} col={INK} />
      <At x={960} y={460} s={pop(t, 0)} r={-3}><div style={{ width: 760, height: 470, background: "#fffaf0", border: `8px solid ${INK}`, padding: 40, boxShadow: `0 12px 0 ${INK}` }}>
        <T size={40}>Search for the 1918 virus</T>{[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 22, background: INK, opacity: 0.85, margin: "28px 0", width: `${[90, 70, 84, 55][i]}%` }} />)}</div></At>
      <Stamp text="CLASSIFIED" t={t} at={at([38, "classified"], c)} x={860} y={400} size={110} col={FLU} r={-10} />
      <Stamp text="NEGATIVE" t={t} at={at([38, "negative"], c)} x={1100} y={600} size={110} col={INK} r={6} />
    </Mv></Paper>
  ),
  // ---------------- the geographer ----------------
  duncan: card("Kirsty Duncan", "a medical geographer, Canada", "globe", { col: FLU, extra: "1990s", extraCue: 10 }),
  archives: icons([{ g: "doc", label: "Death records" }, { g: "doc", label: "Burial records", cue: 8 }, { g: "doc", label: "Diaries", cue: 16 }], { top: "Years in the archives", topCol: INK, m: 3 }),
  checklist: checks([{ s: "Died of the 1918 flu" }, { s: "Buried somewhere frozen", cue: [41, "buried"] }, { s: "Records of who they were", cue: [41, "records"] }], { top: "She needed victims who", topCol: INK }),
  perfect: checks([{ s: "Known names" }, { s: "Known dates", cue: [43, "dates"] }, { s: "A graveyard in permafrost", cue: [43, "graveyard"] }], { top: "Close to perfect", topCol: C.green }),
  n5: num("5", "years to set it up", { col: INK, glyph: "doc" }),
  permits: checks([{ s: "Norwegian authorities" }, { s: "The miners' families", cue: [44, "families"] }], { top: "Permission from", topCol: INK, size: 84 }),
  whatif: say([{ s: "What if", size: 120 }, { s: "it's still alive?", cue: [45, "alive"], col: C.yellow, size: 150 }], { dark: true, glyph: "virus", m: 4 }),
  // ---------------- the dig ----------------
  radarscreen: Radar,
  depth: ({ t, d, c }) => (
    <AbsoluteFill><Mv t={t} d={d} m={0}><Ground t={t} thaw={1} coffY={330} iceY={470} labels={false} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={150} y={230} width={70} height={560} fill="#fffaf0" stroke={INK} strokeWidth={7} />
        {[0, 1, 2].map((i) => <g key={i}><path d={`M150 ${230 + i * 200} L250 ${230 + i * 200}`} stroke={INK} strokeWidth={7} /><text x={270} y={246 + i * 200} fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK} stroke="#fffaf0" strokeWidth={8} paintOrder="stroke">{i} M</text></g>)}
      </svg>
      <At x={1500} y={300} s={pop(t, 0)}><div style={{ background: "#fffaf0", border: `7px solid ${INK}`, borderRadius: 16, padding: "12px 26px" }}><T size={52}>Coffins: under 1 m</T></div></At>
      <At x={1480} y={560} s={pop(t, at([51, "1.2"], c))}><div style={{ background: ICE, border: `7px solid ${INK}`, borderRadius: 16, padding: "12px 26px" }}><T size={52} col="#fff">Permafrost: 1.2 m</T></div></At>
    </Mv></AbsoluteFill>
  ),
  active: ({ t, d, c }) => { const cyc = (t / 36) % 1, th = cyc < 0.5 ? ease(cyc * 4) : 1 - ease((cyc - 0.5) * 4);
    return <AbsoluteFill><Mv t={t} d={d} m={0}><Ground t={t} thaw={th} coffY={300} iceY={420} /><Title text={th > 0.5 ? "Summer: it thaws" : "Winter: it freezes"} s={pop(t, 0)} col={th > 0.5 ? "#a8642a" : ICE} y={82} size={50} />
      <At x={360} y={630} s={pop(t, at([53, "summer"], c))}><Glyph kind={th > 0.5 ? "sun" : "flake"} s={180} /></At></Mv></AbsoluteFill>; },
  six7: num("6 of 7", "bodies sampled", { col: INK, m: 4 }),
  notpreserved: say([{ s: "But not preserved", size: 130 }, { s: "the way they'd hoped", cue: [55, "way"], size: 100, col: FLU }], { glyph: "x", m: 1 }),
  either: ({ t, d, c }) => <Cols t={t} d={d} c={c} L={{ g: "coffin", title: "They rose", sub: "over the years", mark: "x" }} R={{ g: "shovel", title: "Never that deep", sub: "in 1918", mark: "x", cue: [56, "never"] }} mid="OR" />,
  switchoff: Freezer,
  stings: say([{ s: "Here's the part", size: 110 }, { s: "that stings", cue: [58, "stings"], col: FLU, size: 170 }], { dark: true, m: 4 }),
  // ---------------- meanwhile, in Alaska ----------------
  science: Science,
  taub: card("Jeffery Taubenberger", "a government pathologist", "microscope", { col: INK, extra: "pieces of the 1918 virus from saved tissue", extraCue: [59, "pulled"] }),
  tiny: say([{ s: "The samples were tiny.", size: 120 }], { glyph: "microscope", stamp: { s: "NEED MORE", cue: [59, "needed"], y: 680, size: 110 } }),
  hultin97: card("Johan Hultin, 72", "a retired doctor, San Francisco", "person", { col: AK, extra: "the same man, 46 years on", extraCue: [60, "same"] }),
  n46: num("46", "years after he failed", { col: AK, sub: "Brevig Mission, again", subCue: 10, glyph: "shears" }),
  lucy: card("“Lucy”", "a woman of about 30", "cross", { col: AK }),
  lungs: say([{ s: "Her lungs:", size: 110 }, { s: "still preserved", cue: [64, "preserved"], col: C.green, size: 150 }], { glyph: "lungs", m: 4 }),
  code: Sequence,
  y2005: num("2005", "rebuilt in a secure lab", { col: FLU, sub: "to see what made it so deadly", subCue: [66, "finally"], glyph: "microscope" }),
  twoplaces: ({ t, d, c }) => <Cols t={t} d={d} c={c} L={{ g: "shears", title: "Alaska", sub: "1997: found", mark: "check" }} R={{ g: "coffin", title: "Longyearbyen", sub: "1998: gone", mark: "x", cue: [67, "Just"] }} />,
  // ---------------- the rule ----------------
  y1950: num("1950", "the last coffin burial", { col: INK, glyph: "coffin", sub: "then it stopped", subCue: [69, "stopped"] }),
  decay: say([{ s: "In that ground,", size: 100 }, { s: "bodies barely decay", cue: [70, "decay"], col: ICE, size: 140 }], { glyph: "flake", m: 0 }),
  heave: Heave,
  rules: icons([{ g: "coffin", label: "Coffins: no", mark: "x" }, { g: "urn", label: "Ashes: with permission", cue: [71, "Ashes"], mark: "check" }, { g: "ship", label: "Everything else: the mainland", cue: [71, "Anything"] }], { top: "The rule since 1950", topCol: INK, m: 2 }),
  hospital: icons([{ g: "hospital", label: "No delivery room" }, { g: "baby", label: "Babies: born on the mainland", cue: [72, "babies"] }], { top: "The rest of life, too", topCol: INK, m: 3 }),
  illegal: say([{ s: "The town where", size: 110 }, { s: "it's illegal to die", cue: [73, "illegal"], col: FLU, size: 150 }], { m: 4 }),
  myth: say([{ s: "The town where", size: 110 }, { s: "it's illegal to die", col: FLU, size: 150, cue: 0 }], { m: 0, stamp: { s: "MYTH", cue: 0, y: 470, size: 200, col: C.blue, r: -10 } }),
  strange: say([{ s: "So here's", size: 110 }, { s: "the strange part", cue: [77, "strange"], col: C.yellow, size: 136 }], { dark: true, m: 4 }),
  question: say([{ s: "Should anyone", size: 110 }, { s: "have brought it back?", cue: [82, "bring"], col: C.yellow, size: 100 }], { dark: true, glyph: "virus", m: 0 }),
};
void Label; void Burst; void FLU;
