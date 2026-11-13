// The 1929 "what if" long-form's 2D boards. Each takes G (t = frame in shot, d = shot length, c(seg, word) = a word's
// onset in shot frames, v = variant) and builds on the narration's words. Content stays above y = 800 (captions below).
// Every board has a camera move of its own (Mv) and shows something from its first frame. Colour code: red = falling /
// failed, green = money and rising, yellow = the point. The Dow chart (Chart) is the running device: the same line,
// redrawn at each turn of the story, with labels only on the closing values that are on the record.
import React from "react";
import { C, G, Paper, At, T, Banner, Stamp, Row, k, pop, ease, lerp, clamp01 } from "../pigwarlong/kit";
import { say, num, card, Mv, Bg, Dark, Svg, Pill } from "../hertzlong/boards";

const INK = C.ink, NIGHT = "#101a33", GREEN = "#2f9a5a", MONEY = "#7fc48a";
const st = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const sto = { ...st, fill: "none" };

/** glyphs for this story (100 x 100 box) */
const Gl: React.FC<{ kind: string; s?: number }> = ({ kind, s = 160 }) => {
  const body = (() => {
    switch (kind) {
      case "bank": return <><path d="M6 36 L50 8 L94 36 Z" fill="#e6dcc8" {...st} /><rect x={10} y={36} width={80} height={10} fill="#e6dcc8" {...st} />{[20, 40, 60, 80].map((x) => <rect key={x} x={x - 6} y={46} width={12} height={34} fill="#fffaf0" {...st} strokeWidth={5} />)}<rect x={6} y={80} width={88} height={12} fill="#e6dcc8" {...st} /></>;
      case "bill": return <><rect x={6} y={24} width={88} height={52} rx={6} fill={MONEY} {...st} /><circle cx={50} cy={50} r={15} fill="#fffaf0" {...st} strokeWidth={5} /><path d="M50 40 L50 60 M44 45 Q50 40 56 45 Q50 50 44 55 Q50 60 56 55" {...sto} strokeWidth={4} /></>;
      case "gold": return <><path d="M14 70 L26 40 L74 40 L86 70 Z" fill="#e8b83a" {...st} /><path d="M26 40 L34 30 L66 30 L74 40" fill="#f6d874" {...st} /></>;
      case "shield": return <><path d="M50 8 L88 22 L88 50 Q88 78 50 94 Q12 78 12 50 L12 22 Z" fill={GREEN} {...st} /><path d="M30 50 L45 64 L72 34" {...sto} stroke="#fff" strokeWidth={11} /></>;
      case "badge": return <><path d="M50 6 L62 20 L80 16 L82 34 L96 46 L84 60 L88 78 L70 80 L60 94 L50 82 L40 94 L30 80 L12 78 L16 60 L4 46 L18 34 L20 16 L38 20 Z" fill={C.gold} {...st} /><circle cx={50} cy={50} r={18} fill="#fffaf0" {...st} strokeWidth={5} /></>;
      case "bubble": return <><path d="M10 14 L90 14 Q96 14 96 22 L96 62 Q96 70 90 70 L46 70 L26 90 L28 70 L10 70 Q4 70 4 62 L4 22 Q4 14 10 14 Z" fill="#fffaf0" {...st} /><path d="M22 34 L78 34 M22 50 L62 50" {...sto} /></>;
      case "house": return <><path d="M8 50 L50 14 L92 50" {...sto} /><rect x={20} y={48} width={60} height={42} fill="#f2c9a0" {...st} /><rect x={42} y={62} width={16} height={28} fill="#8a5a3a" {...st} strokeWidth={5} /></>;
      case "farm": return <><path d="M14 46 L36 22 L58 46 L58 88 L14 88 Z" fill={C.red} {...st} /><rect x={28} y={60} width={16} height={28} fill="#fffaf0" {...st} strokeWidth={5} /><rect x={64} y={34} width={22} height={54} rx={10} fill="#c9c2b0" {...st} /></>;
      case "shop": return <><rect x={12} y={40} width={76} height={50} fill="#f6efdc" {...st} /><path d="M6 40 L18 16 L82 16 L94 40 Z" fill="#5a8fc2" {...st} /><rect x={24} y={54} width={22} height={36} fill="#8a5a3a" {...st} strokeWidth={5} /><rect x={56} y={54} width={22} height={20} fill="#9fd0ea" {...st} strokeWidth={5} /></>;
      case "bed": return <><rect x={6} y={50} width={88} height={22} rx={5} fill="#f4f0e6" {...st} /><rect x={6} y={30} width={10} height={58} fill="#8a5a3a" {...st} strokeWidth={5} /><rect x={84} y={46} width={10} height={42} fill="#8a5a3a" {...st} strokeWidth={5} /><rect x={18} y={38} width={24} height={14} rx={5} fill="#fffaf0" {...st} strokeWidth={5} /></>;
      default: return null;
    }
  })();
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>{body}</svg>;
};

// ---------------- the Dow chart ----------------
type Pt = [number, number];
type Label = { i: number; text: string; sub?: string; col?: string; cue?: number; dx?: number; dy?: number };
/** a line chart drawn left to right. pts = [x 0..1, value]; `u` = how much of the line is drawn (0..1 of its points);
 *  labels pop on when the line reaches their point (or at `cue` frames) */
const Chart: React.FC<{ t: number; pts: Pt[]; lo: number; hi: number; u: number; col?: string; labels?: Label[]; left?: string; right?: string; dark?: boolean; ghost?: Pt[] }> =
  ({ t, pts, lo, hi, u, col = GREEN, labels = [], left, right, dark, ghost }) => {
    const X0 = 250, X1 = 1670, Y0 = 250, Y1 = 730, fg = dark ? "#fff" : INK;
    const px = (p: Pt): [number, number] => [X0 + (X1 - X0) * p[0], Y1 - ((p[1] - lo) / (hi - lo)) * (Y1 - Y0)];
    const n = pts.length - 1, uu = clamp01(u) * n, k0 = Math.min(n - 1, Math.floor(uu)), fr = uu - k0;
    const shown = pts.slice(0, k0 + 1).map(px);
    const a = px(pts[k0]), b = px(pts[Math.min(n, k0 + 1)]), tip: [number, number] = [lerp(a[0], b[0], fr), lerp(a[1], b[1], fr)];
    shown.push(tip);
    const dpath = (q: [number, number][]) => q.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    return (
      <>
        <Svg>
          <path d={`M${X0} ${Y0 - 30} L${X0} ${Y1 + 20} L${X1 + 30} ${Y1 + 20}`} fill="none" stroke={fg} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
          {[0.25, 0.5, 0.75].map((g) => <path key={g} d={`M${X0} ${lerp(Y1, Y0, g)} L${X1} ${lerp(Y1, Y0, g)}`} stroke={fg} strokeWidth={3} strokeDasharray="10 16" opacity={0.2} />)}
          {ghost ? <path d={dpath(ghost.map(px))} fill="none" stroke={fg} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.25} /> : null}
          <path d={dpath(shown)} fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
          <path d={dpath(shown)} fill="none" stroke={col} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={tip[0]} cy={tip[1]} r={17 + 3 * Math.sin(t / 3)} fill={col} stroke={INK} strokeWidth={7} />
        </Svg>
        {left ? <At x={X0 + 6} y={Y1 + 62} center={false}><T size={40} w={800} col={fg} up={false}>{left}</T></At> : null}
        {right ? <div style={{ position: "absolute", right: 1920 - X1, top: Y1 + 40 }}><T size={40} w={800} col={fg} up={false}>{right}</T></div> : null}
        {labels.map((lb, j) => {
          const p = px(pts[lb.i]), on = lb.cue !== undefined ? t >= lb.cue : uu >= lb.i - 0.02, since = lb.cue !== undefined ? t - lb.cue : (uu - lb.i) * 6;
          if (!on) return null;
          return <At key={j} x={p[0] + (lb.dx ?? 0)} y={p[1] + (lb.dy ?? -84)} s={lb.cue !== undefined ? pop(t, lb.cue) : Math.min(1, 0.6 + Math.max(0, since) * 0.2)}>
            <div style={{ textAlign: "center" }}><Pill text={lb.text} col={lb.col ?? "#fffaf0"} fg={lb.col ? "#fff" : INK} size={78} />{lb.sub ? <T size={46} w={800} col={fg} up={false} style={{ marginTop: 10 }}>{lb.sub}</T> : null}</div>
          </At>;
        })}
      </>
    );
  };
// closing values on the record: 381.17 (Sept 3, 1929), 299.47 (Oct 24; low that day 272.32), 260.64 (Oct 28), 230.07 (Oct 29),
// 198.69 (Nov 13), 294.07 (April 17, 1930), 41.22 (July 8, 1932), 194.40 (March 1937), 92.92 (April 1942), 382.74 (Nov 23, 1954).
// Points between them only carry the shape.
const BULL: Pt[] = [[0, 64], [0.18, 88], [0.36, 118], [0.52, 158], [0.68, 200], [0.8, 262], [0.9, 318], [1, 381]];
const SEPT: Pt[] = [[0, 372], [0.18, 376], [0.34, 381], [0.5, 370], [0.6, 369], [0.74, 375], [0.88, 377], [1, 373]];
const DAY24: Pt[] = [[0, 306], [0.14, 292], [0.3, 278], [0.42, 272], [0.54, 279], [0.68, 290], [0.84, 296], [1, 299]];
const CRASH: Pt[] = [[0, 381], [0.14, 368], [0.28, 352], [0.42, 330], [0.54, 306], [0.6, 299], [0.68, 261], [0.74, 230], [0.8, 258], [0.9, 226], [1, 199]];
const RALLY: Pt[] = [[0, 199], [0.2, 228], [0.4, 247], [0.6, 263], [0.8, 280], [1, 294]];
const SLIDE: Pt[] = [[0, 294], [0.1, 255], [0.2, 214], [0.3, 168], [0.4, 190], [0.5, 148], [0.6, 110], [0.7, 78], [0.8, 86], [0.9, 56], [1, 41]];
const LONG: Pt[] = [[0, 381], [0.02, 199], [0.04, 294], [0.12, 41], [0.2, 100], [0.32, 194], [0.38, 110], [0.52, 93], [0.64, 190], [0.84, 235], [1, 382]];
const WHOLE: Pt[] = [[0, 381], [0.1, 199], [0.2, 294], [0.4, 165], [0.6, 78], [0.8, 56], [0.9, 41], [1, 62]];

const ChartBoard: React.FC<G> = ({ t, d, v, c }) => {
  const U = (lead = 0.75) => clamp01(t / Math.max(8, d * lead));
  const bd = (top: string, col: string, node: React.ReactNode, dark = false, m = 0) => (
    <Bg dark={dark} tone={dark ? NIGHT : undefined}><Mv t={t} d={d} m={m}><Banner text={top} t={t} at={0} col={col} y={110} />{node}</Mv></Bg>
  );
  switch (v) {
    case 0: return bd("The Dow Jones", INK, <Chart t={t} pts={BULL} lo={0} hi={420} u={U(0.6)} labels={[{ i: 7, text: "381", sub: "September 3, 1929", dx: -290, dy: -10 }]} left="1921" right="1929" />);
    case 1: return bd("Back to 381", C.red, <Chart t={t} pts={LONG} lo={0} hi={420} u={U(0.7)} col={C.red} labels={[{ i: 0, text: "1929", dx: 70, dy: -70 }, { i: 10, text: "1954", sub: "25 years later", dx: -110, dy: -40 }]} />, true, 1);
    case 2: return bd("September 1929", C.red, <Chart t={t} pts={SEPT.slice(0, 5)} lo={355} hi={388} u={U(0.6)} col={C.red} ghost={SEPT} labels={[{ i: 2, text: "Babson speaks", dx: 30, dy: -86 }, { i: 4, text: "about −3%", col: C.red, dx: 60, dy: 96 }]} />, false, 4);
    case 3: return bd("September 1929", GREEN, <Chart t={t} pts={SEPT} lo={355} hi={388} u={0.57 + 0.43 * U(0.6)} labels={[{ i: 2, text: "Babson speaks", dx: 30, dy: -86 }, { i: 7, text: "back up", col: GREEN, dx: -60, dy: -92 }]} />, false, 0);
    case 4: return bd("Black Thursday · October 24", GREEN, <Chart t={t} pts={DAY24} lo={262} hi={312} u={U(0.6)} labels={[{ i: 3, text: "1:30 PM", dx: 0, dy: 96 }, { i: 7, text: "down only 2%", col: GREEN, dx: -150, dy: -90 }]} left="Opening bell" right="Close" />, false, 1);
    case 5: return bd("September to November 1929", C.red, <Chart t={t} pts={CRASH} lo={150} hi={400} u={U(0.6)} col={C.red} labels={[{ i: 0, text: "381", dx: 90, dy: -30 }, { i: 10, text: "199", sub: "November 13", col: C.red, dx: -150, dy: -40 }]} />, true, 0);
    case 6: return bd("November 1929 to April 1930", GREEN, <Chart t={t} pts={RALLY} lo={150} hi={400} u={U(0.6)} labels={[{ i: 0, text: "199", dx: 90, dy: 60 }, { i: 5, text: "294", sub: "April 17, 1930", col: GREEN, dx: -150, dy: -40 }]} />, false, 0);
    case 7: return bd("April 1930 onward", C.red, <Chart t={t} pts={SLIDE.slice(0, 8)} lo={0} hi={320} u={U(0.85)} col={C.red} ghost={SLIDE} labels={[{ i: 0, text: "294", dx: 100, dy: -30 }]} left="1930" right="1932" />, true, 2);
    case 8: return bd("July 8, 1932", C.red, <Chart t={t} pts={SLIDE} lo={0} hi={320} u={0.7 + 0.3 * U(0.45)} col={C.red} labels={[{ i: 0, text: "294", dx: 100, dy: -30 }, { i: 10, text: "41", col: C.red, dx: -120, dy: -70, cue: Math.max(6, c(116, "41") - 2) }]} left="1930" right="1932" />, true, 4);
    default: return bd("1929 to 1932", GREEN, <Chart t={t} pts={WHOLE} lo={0} hi={420} u={U(0.5)} col={C.grey} labels={[{ i: 0, text: "381", dx: 90, dy: -30 }, { i: 6, text: "Buy here", sub: "summer 1932", col: GREEN, dx: -40, dy: -110, cue: Math.max(8, c(158, "buy") - 3) }]} left="1929" right="1932" />, false, 0);
  }
};

const ATTEMPTS = ["Tell everyone", "Tell the men in charge", "Get rich", "Buy the dip", "Save your street"];
// where each attempt is announced / ends in the script (segment, word)
const SEG_OF = [28, 45, 71, 102, 132], WORD_OF = ["Tell", "Tell", "Forget", "Buy", "attempt"], END_SEG = [44, 70, 101, 122, 148];
/** the attempt card (and, with `end`, the stamp that slams onto it) */
const Attempt: React.FC<G & { end?: "failed" | "draw" }> = ({ t, d, v, c, end }) => {
  const n = Math.max(1, Math.min(5, v || 1)), title = ATTEMPTS[n - 1];
  const tw = Math.min(118, 1500 / (title.length * 0.66));
  return (
    <Bg dark tone={end === "failed" ? "#2a1418" : end ? "#2a2414" : NIGHT}><Mv t={t} d={d} m={end ? 5 : 4}>
      <At x={960} y={250} s={pop(t, 0)}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <T size={150} col="#fff" style={{ textShadow: "0 10px 0 #000" }}>Attempt</T>
          <div style={{ width: 210, height: 210, borderRadius: "50%", background: end ? C.grey : C.red, border: `10px solid ${INK}`, boxShadow: "0 10px 0 #000", display: "flex", alignItems: "center", justifyContent: "center" }}><T size={150} col="#fff">{n}</T></div>
        </div>
      </At>
      <At x={960} y={500} s={pop(t, end ? 0 : Math.max(4, c(SEG_OF[n - 1], WORD_OF[n - 1]) - 2))}>
        <div style={{ background: "#fffaf0", border: `8px solid ${INK}`, borderRadius: 18, padding: "18px 56px", boxShadow: "0 12px 0 #000" }}><T size={tw}>{title}</T></div>
      </At>
      {end === "failed" ? <Stamp text="Failed" t={t} at={Math.max(3, c(END_SEG[n - 1], "failed") - 2)} x={960} y={420} size={230} r={-9} /> : null}
      {end === "draw" ? <Stamp text="A draw" t={t} at={Math.max(3, c(END_SEG[n - 1], "draw") - 2)} x={960} y={420} size={200} r={-9} col="#f2c94c" /> : null}
    </Mv></Bg>
  );
};

/** a date card: big day, the year or a note in a pill */
const DateCard = (big: string, sub: string, o: { tone?: string; col?: string; m?: number; top?: string } = {}): React.FC<G> => ({ t, d }) => (
  <Bg dark tone={o.tone ?? NIGHT}><Mv t={t} d={d} m={o.m ?? 4}>
    {o.top ? <Banner text={o.top} t={t} at={0} col={C.red} y={140} /> : null}
    <At x={960} y={o.top ? 430 : 390} s={pop(t, 0)}><T size={Math.min(250, 1240 / (big.length * 0.62))} col={o.col ?? C.yellow} style={{ textShadow: "0 16px 0 #000", letterSpacing: 4 }}>{big}</T></At>
    <At x={960} y={o.top ? 660 : 640} s={pop(t, 6)}><Pill text={sub} col={C.red} fg="#fff" size={62} /></At>
  </Mv></Bg>
);
/** a quotation with who said it */
const Quote = (lines: string[], who: string, o: { cue?: [number, string]; hi?: number; top?: string } = {}): React.FC<G> => ({ t, d, c }) => (
  <Dark tone={NIGHT}><Mv t={t} d={d} m={0}>
    {o.top ? <At x={960} y={150} s={pop(t, 0)}><T size={46} w={800} col={C.gold}>{o.top}</T></At> : null}
    {lines.map((ln, i) => {
      const hi = o.hi ?? lines.length - 1, hiAt = o.cue ? Math.max(hi * 6, c(o.cue[0], o.cue[1]) - 2) : hi * 9;
      const size = Math.min(112, 1600 / (ln.length * 0.64)), at = i === 0 ? 0 : i < hi ? i * 7 : hiAt + (i - hi) * 8;
      return <At key={i} x={960} y={(o.top ? 270 : 215) + i * 128 + (3 - lines.length) * 60} s={pop(t, at)}><T size={size} col={i === (o.hi ?? lines.length - 1) ? C.yellow : "#fff"} style={{ textShadow: "0 8px 0 #000" }}>{ln}</T></At>;
    })}
    <At x={960} y={(o.top ? 270 : 215) + lines.length * 128 + (3 - lines.length) * 60 - 6} s={pop(t, 12)}><T size={42} w={800} col="#f6efdc" up={false}>{who}</T></At>
  </Mv></Dark>
);
/** dollar bills in a row; the first `cut` get crossed out at `cutAt` */
const Bills: React.FC<{ t: number; n: number; cut?: number; cutAt?: number; y?: number; s?: number }> = ({ t, n, cut = 0, cutAt = 0, y = 440, s = 250 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const x = 960 + (i - (n - 1) / 2) * (s + 40), gone = i < cut && t >= cutAt + i * 4;
      return <At key={i} x={x} y={y} s={pop(t, i * 3)} r={(i % 2 ? 3 : -3)}>
        <div style={{ position: "relative", opacity: gone ? 0.5 : 1 }}><Gl kind="bill" s={s} />
          {gone ? <svg width={s} height={s} viewBox="0 0 100 100" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", transform: `scale(${pop(t, cutAt + i * 4)})` }}><path d="M14 22 L86 78 M86 22 L14 78" stroke={C.red} strokeWidth={13} strokeLinecap="round" /></svg> : null}
        </div>
      </At>;
    })}
  </>
);
/** one stacked bar: `a` of it in one colour, the rest in another */
const Split: React.FC<{ t: number; a: number; la: string; lb: string; ca: string; cb: string; at: number; y?: number }> = ({ t, a, la, lb, ca, cb, at, y = 430 }) => {
  const W = 1400, X = 260, g = ease(k(t, at, 16)), wa = W * a, wb = (W - wa) * g;
  return (
    <>
      <Svg><rect x={X} y={y - 70} width={W} height={140} rx={16} fill="#fffaf0" {...st} strokeWidth={9} /><rect x={X + 6} y={y - 64} width={wa - 6} height={128} fill={ca} /><rect x={X + wa} y={y - 64} width={Math.max(0, wb - 6)} height={128} fill={cb} /></Svg>
      <At x={X + wa / 2} y={y - 130} s={pop(t, 0)}><T size={50} col={ca}>{la}</T></At>
      <At x={X + wa + (W - wa) / 2} y={y + 130} s={pop(t, at)}><T size={64} col={cb}>{lb}</T></At>
    </>
  );
};

export const BOARDS: Record<string, React.FC<G>> = {
  chart: (g) => <ChartBoard {...g} />,
  attempt: (g) => <Attempt {...g} />,
  fail: (g) => <Attempt {...g} end="failed" />,
  draw: (g) => <Attempt {...g} end="draw" />,

  // ---------------- cold open ----------------
  d1029: DateCard("October 29", "1929 · Black Tuesday", { tone: "#2a1418" }),
  n16m: num("16,000,000", "shares sold in one day", { dark: true, m: 4, col: C.red, size: 250 }),
  weeks8: num("8", "weeks", { dark: true, m: 4, col: C.yellow, size: 420, sub: "You've known the whole time", subCue: 8 }),
  whystop: say([{ s: "So why didn't you", size: 110, col: "#fff" }, { s: "stop it?", col: C.yellow, size: 240, cue: [8, "stop"] }], { dark: true, m: 5 }),
  getrich: say([{ s: "Or at least", size: 110, col: "#fff" }, { s: "get rich?", col: MONEY, size: 240, cue: [9, "get"] }], { dark: true, m: 4 }),
  tryit: say([{ s: "Let's actually", size: 110, col: "#fff" }, { s: "try it", col: C.yellow, size: 260, cue: [10, "try"] }], { dark: true, m: 4 }),
  rules: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="The rules" t={t} at={0} col={INK} />
      <div style={{ position: "absolute", left: 470, top: 240 }}>
        <Row text="5 attempts" t={t} at={0} mark="check" markAt={6} size={104} />
        <Row text="Real history" t={t} at={Math.max(4, c(11, "Real") - 2)} mark="check" markAt={c(11, "Real") + 5} size={104} />
        <Row text="No superpowers" t={t} at={Math.max(8, c(11, "No") - 2)} mark="x" markAt={c(11, "No") + 5} size={104} />
      </div>
    </Mv></Paper>
  ),
  warned: say([{ s: "People", size: 130, col: "#fff" }, { s: "were warned", col: C.yellow, size: 190, cue: [13, "warned"] }], { dark: true, m: 0 }),

  // ---------------- September 3 ----------------
  rewind: ({ t, d }) => (
    <Dark tone={NIGHT}><Mv t={t} d={d} m={3}>
      <At x={960} y={300} s={pop(t, 0)}>
        <svg width={520} height={220} viewBox="0 0 520 220" style={{ transform: `translateX(${-18 * Math.sin(t / 3)}px)` }}>
          <path d="M250 20 L60 110 L250 200 Z M480 20 L290 110 L480 200 Z" fill={C.yellow} stroke={INK} strokeWidth={14} strokeLinejoin="round" />
        </svg>
      </At>
      <At x={960} y={560} s={pop(t, 4)}><T size={150} col="#fff" style={{ textShadow: "0 12px 0 #000" }}>8 weeks earlier</T></At>
    </Mv></Dark>
  ),
  dsept3: DateCard("September 3", "1929", { m: 0 }),
  dollars: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <Bills t={t} n={3} y={400} s={300} />
      <At x={960} y={670} s={pop(t, 8)}><T size={84}>A few dollars</T></At>
    </Mv></Paper>
  ),
  highest: say([{ s: "The highest", size: 150, col: "#fff" }, { s: "it has ever been", col: C.yellow, size: 130, cue: [21, "ever"] }], { dark: true, m: 0 }),
  x6: num("×6", "in 8 years", { m: 4, col: GREEN, size: 400 }),
  borrowed: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="How a lot of them paid" t={t} at={0} col={INK} />
      <Split t={t} a={0.1} la="Their own" lb="Borrowed" ca={GREEN} cb={C.red} at={Math.max(6, c(26, "borrowed") - 3)} />
    </Mv></Paper>
  ),

  // ---------------- attempt 1 ----------------
  strange: say([{ s: "Here's the", size: 110, col: "#fff" }, { s: "strange part", col: C.yellow, size: 200, cue: [32, "strange"] }], { dark: true, m: 4 }),
  somebody: say([{ s: "Somebody", size: 170 }, { s: "actually does this", col: C.red, size: 130, cue: [33, "actually"] }], { m: 0 }),
  babson: card("Roger Babson", "Economist · September 5, 1929", "person", { col: C.red, m: 0 }),
  bquote: Quote(["“Sooner or later", "a crash is coming,", "and it may be terrific.”"], "Roger Babson, September 5, 1929", { cue: [35, "terrific"] }),
  years: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={2}>
      <Banner text="Babson's warning" t={t} at={0} col={C.red} />
      {["1927", "1928", "1929"].map((y, i) => (
        <At key={y} x={480 + i * 480} y={440} s={pop(t, i === 0 ? 0 : Math.round(i * Math.min(9, d * 0.14)))}>
          <div style={{ textAlign: "center" }}><Gl kind="bubble" s={i === 2 ? 250 : 210} /><T size={i === 2 ? 120 : 96} col={i === 2 ? C.red : INK} style={{ marginTop: 14 }}>{y}</T></div>
        </At>
      ))}
      <At x={960} y={730} s={pop(t, Math.max(10, c(39, "years") - 3))}><T size={54} w={800} col={C.grey} up={false}>the same warning, year after year</T></At>
    </Mv></Paper>
  ),
  fisher: card("Irving Fisher", "Economist · Yale University", "person", { col: GREEN, m: 0 }),
  plateau: Quote(["“What looks like a", "permanently", "high plateau.”"], "Irving Fisher, October 1929", { cue: [41, "permanently"], hi: 1 }),
  weekbefore: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={3}>
      <Banner text="October 1929" t={t} at={0} col={INK} />
      <Svg><path d="M420 380 L1500 380" {...sto} strokeWidth={12} strokeDasharray={`${1080 * ease(k(t, 4, Math.max(10, c(42, "week"))))} 1200`} /></Svg>
      <At x={420} y={500} s={pop(t, 0)}><div style={{ textAlign: "center" }}><Pill text="Mid-October" col={GREEN} fg="#fff" size={58} /><T size={44} w={800} up={false} style={{ marginTop: 14 }}>“permanently high”</T></div></At>
      <At x={1500} y={500} s={pop(t, 5)}><div style={{ textAlign: "center" }}><Pill text="October 24" col={C.red} fg="#fff" size={58} /><T size={44} w={800} up={false} style={{ marginTop: 14 }}>the crash begins</T></div></At>
      <At x={960} y={300} s={pop(t, Math.max(6, c(42, "week") - 2))}><T size={84} col={C.red}>About a week</T></At>
    </Mv></Paper>
  ),

  // ---------------- attempt 2 ----------------
  problem: say([{ s: "Here's the", size: 110, col: "#fff" }, { s: "problem", col: C.red, size: 250, cue: [48, "problem"] }], { dark: true, m: 4 }),
  theytry: say([{ s: "They", size: 150, col: "#fff" }, { s: "try", col: C.yellow, size: 330, cue: [49, "try"] }], { dark: true, m: 0 }),
  doct24: DateCard("October 24", "Black Thursday", { tone: "#2a1418" }),
  open11: num("−11%", "at the opening bell", { dark: true, m: 4, col: C.red, size: 380 }),
  t130: DateCard("1:30 PM", "Black Thursday", { m: 4 }),
  whitney: card("Richard Whitney", "Vice president of the Exchange", "person", { col: INK, m: 0 }),
  above: ({ t, d, c }) => {
    const at2 = Math.max(6, c(60, "above") - 3);
    return (
      <Paper><Mv t={t} d={d} m={0}>
        <Banner text="U.S. Steel, per share" t={t} at={0} col={INK} />
        <Svg>
          <rect x={520} y={640 - 250 * ease(k(t, 0, 12))} width={300} height={250 * ease(k(t, 0, 12))} fill={C.grey} {...st} />
          <rect x={1100} y={640 - 310 * ease(k(t, at2, 12))} width={300} height={310 * ease(k(t, at2, 12))} fill={GREEN} {...st} />
          <path d="M400 640 L1520 640" {...sto} strokeWidth={10} />
        </Svg>
        <At x={670} y={700} s={pop(t, 2)}><T size={50} w={800} up={false}>the going price</T></At>
        <At x={1250} y={700} s={pop(t, at2)}><T size={50} w={800} up={false}>his bid</T></At>
        <At x={1250} y={262} s={pop(t, at2 + 6)}><T size={100} col={GREEN}>$205</T></At>
      </Mv></Paper>
    );
  },
  y1907: num("1907", "it worked then", { m: 4, col: INK, size: 360 }),
  hquote: Quote(["“On a sound", "and prosperous", "basis.”"], "President Herbert Hoover, October 25, 1929", { cue: [64, "prosperous"], hi: 1 }),
  weekend: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={2}>
      <Banner text="It holds" t={t} at={0} col={GREEN} />
      {["Friday", "Saturday"].map((day, i) => (
        <At key={day} x={640 + i * 640} y={450} s={pop(t, i * Math.min(10, Math.round(d * 0.25)))}>
          <div style={{ width: 540, background: "#fffaf0", border: `8px solid ${INK}`, borderRadius: 18, boxShadow: `0 12px 0 ${INK}`, padding: "26px 0 34px", textAlign: "center" }}><T size={74}>{day}</T><T size={170} col={GREEN} style={{ marginTop: 6 }}>✓</T></div>
        </At>
      ))}
    </Mv></Paper>
  ),
  monday: num("−13%", "Monday, October 28", { dark: true, m: 4, col: C.red, size: 380, sub: "almost", subCue: 0 }),
  tuesday: num("−12%", "Tuesday, October 29", { dark: true, m: 5, col: C.red, size: 380, sub: "almost, again", subCue: 0 }),

  // ---------------- attempt 3 ----------------
  betonit: say([{ s: "So", size: 130, col: "#fff" }, { s: "bet on it", col: MONEY, size: 260, cue: [73, "bet"] }], { dark: true, m: 4 }),
  short: say([{ s: "It's called", size: 100 }, { s: "selling short", col: C.red, size: 190, cue: [74, "selling"] }], { m: 0 }),
  shortsteps: ({ t, d, c }) => {
    const steps: [string, string, [number, string] | null][] = [["1", "Borrow shares", null], ["2", "Sell them today", [75, "sell"]], ["3", "Wait for the fall", [75, "buy"]], ["4", "Buy them back cheap", [75, "back"]]];
    return (
      <Paper><Mv t={t} d={d} m={2}>
        <Banner text="Selling short" t={t} at={0} col={C.red} />
        {steps.map(([n, s, cue], i) => (
          <At key={n} x={360 + i * 400} y={450} s={pop(t, cue ? Math.max(i * 5, c(cue[0], cue[1]) - 2) : 0)}>
            <div style={{ width: 350, textAlign: "center" }}>
              <div style={{ width: 190, height: 190, borderRadius: "50%", background: i === 3 ? GREEN : INK, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", border: `8px solid ${INK}` }}><T size={124} col="#fff">{n}</T></div>
              <T size={48} style={{ marginTop: 22, whiteSpace: "normal" }}>{s}</T>
            </div>
          </At>
        ))}
      </Mv></Paper>
    );
  },
  oneman: say([{ s: "One man", size: 190 }, { s: "does exactly this", col: C.red, size: 120, cue: [76, "exactly"] }], { m: 0 }),
  livermore: card("Jesse Livermore", "Speculator", "person", { col: GREEN, m: 0 }),
  n100m: num("$100,000,000", "said to be his profit from the crash", { dark: true, m: 4, col: MONEY, size: 210 }),
  onequestion: say([{ s: "Except for", size: 110, col: "#fff" }, { s: "one question", col: C.yellow, size: 190, cue: [80, "one"] }], { dark: true, m: 5 }),
  where: say([{ s: "Where do you", size: 120 }, { s: "put the money?", col: C.red, size: 170, cue: [81, "put"] }], { m: 4 }),
  noinsurance: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="1929" t={t} at={0} col={INK} />
      <At x={960} y={400} s={pop(t, 0)}><Gl kind="bank" s={300} /></At>
      <At x={960} y={660} s={pop(t, 4)}><T size={96}>Deposit insurance</T></At>
      <Stamp text="None" t={t} at={Math.max(6, c(83, "no") - 2)} x={960} y={440} size={210} r={-10} />
    </Mv></Paper>
  ),
  banks: ({ t, d, c }) => {
    const cols = 25, rows = 10, at = Math.max(8, c(85, "9,000") - 4), bad = 90;
    return (
      <Paper><Mv t={t} d={d} m={1}>
        <Banner text="About 25,000 American banks" t={t} at={0} col={INK} y={110} />
        <Svg>
          {Array.from({ length: cols * rows }, (_, i) => {
            const x = 330 + (i % cols) * 52, y = 230 + Math.floor(i / cols) * 46, o = (i * 37) % (cols * rows), dead = o < bad, a = dead ? clamp01((t - at - (o / bad) * Math.max(10, d - at - 14)) / 4) : 0;
            return <rect key={i} x={x} y={y} width={38} height={32} rx={5} fill={a > 0 ? C.red : "#e6dcc8"} stroke={INK} strokeWidth={4} opacity={clamp01((t - (i % cols) * 0.3) / 4) * (a > 0 ? 1 : 1)} />;
          })}
        </Svg>
        <At x={960} y={740} s={pop(t, at + 4)}><T size={70} col={C.red}>About 9,000 fail by 1933</T></At>
      </Mv></Paper>
    );
  },
  onethird: num("1 in 3", "and then some", { dark: true, m: 4, col: C.red, size: 340 }),
  andliv: card("Jesse Livermore", "Speculator", "person", { col: GREEN, m: 1 }),
  livbroke: card("Jesse Livermore", "Bankrupt by 1934", "person", { col: C.grey, m: 1, stamp: "Bankrupt", stampCue: [89, "bankrupt"] }),
  easy: say([{ s: "Getting rich was", size: 110, col: "#fff" }, { s: "the easy part", col: C.yellow, size: 190, cue: [90, "easy"] }], { dark: true, m: 0 }),
  order: ({ t, d, c }) => (
    <Paper tone={C.paper2}><Mv t={t} d={d} m={0}>
      <At x={960} y={420} s={pop(t, 0)} r={-2}>
        <div style={{ width: 1160, background: "#fffaf0", border: `10px solid ${INK}`, boxShadow: `0 16px 0 ${INK}`, padding: "30px 40px", textAlign: "center" }}>
          <T size={46} col={C.grey}>The White House · April 5, 1933</T>
          <T size={70} style={{ marginTop: 14 }}>Executive Order 6102</T>
          <div style={{ borderTop: `8px double ${INK}`, marginTop: 20, paddingTop: 22, transform: `scale(${pop(t, Math.max(8, c(92, "hand") - 2))})` }}><T size={48} col={C.red} style={{ whiteSpace: "normal" }}>Forbidding the hoarding of gold coin, gold bullion and gold certificates</T></div>
        </div>
      </At>
    </Mv></Paper>
  ),
  over100: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <At x={620} y={420} s={pop(t, 0)}><Gl kind="gold" s={340} /></At>
      <At x={1220} y={370} s={pop(t, 3)}><T size={90}>Keep up to</T></At>
      <At x={1220} y={500} s={pop(t, Math.max(6, c(94, "$100") - 2))}><T size={200} col={C.red}>$100</T></At>
      <At x={960} y={720} s={pop(t, 12)}><T size={50} w={800} col={C.grey} up={false}>hand in almost everything above that</T></At>
    </Mv></Paper>
  ),
  prices: num("−25%", "prices, 1929 to 1933", { m: 4, col: GREEN, size: 380, sub: "about a quarter", subCue: 0 }),
  dollar: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="The same dollar" t={t} at={0} col={GREEN} />
      <At x={960} y={450} s={lerp(0.7, 1.25, ease(t / Math.max(1, d)))}><Gl kind="bill" s={520} /></At>
      <At x={960} y={740} s={pop(t, 8)}><T size={70} col={GREEN}>buys more every year</T></At>
    </Mv></Paper>
  ),

  // ---------------- attempt 4 ----------------
  half: num("−48%", "from the top", { dark: true, m: 4, col: C.red, size: 380, sub: "almost half", subCue: 0 }),
  itworks: say([{ s: "And", size: 130, col: "#fff" }, { s: "it works", col: MONEY, size: 280, cue: [107, "works"] }], { dark: true, m: 4 }),
  up50: num("+48%", "in five months", { m: 4, col: GREEN, size: 380 }),
  worstover: say([{ s: "“The worst", size: 150 }, { s: "is over”", col: GREEN, size: 220, cue: [110, "over"] }], { m: 0, top: "Spring 1930", topCol: INK }),
  trap: say([{ s: "This is", size: 130, col: "#fff" }, { s: "the trap", col: C.red, size: 300, cue: [111, "trap"] }], { dark: true, tone: "#2a1418", m: 4 }),
  never: say([{ s: "The crash was never", size: 100, col: "#fff" }, { s: "the disaster", col: C.yellow, size: 200, cue: [112, "disaster"] }], { dark: true, m: 0 }),
  firststep: ({ t, d }) => {
    const n = 6, u = clamp01(t / Math.max(10, d * 0.8)) * (n - 1), i0 = Math.floor(u), fr = u - i0;
    const sx = (i: number) => 380 + i * 200, sy = (i: number) => 260 + i * 80;
    return (
      <Dark tone={NIGHT}><Mv t={t} d={d} m={1}>
        <Svg>
          <path d={Array.from({ length: n }, (_, i) => `${i ? "L" : "M"}${sx(i)} ${sy(i)} L${sx(i) + 200} ${sy(i)}`).join(" ") + ` L${sx(n - 1) + 200} 760 L${sx(0)} 760 Z`} fill="#2c3550" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
          <circle cx={lerp(sx(i0), sx(Math.min(n - 1, i0 + 1)), fr) + 100} cy={lerp(sy(i0), sy(Math.min(n - 1, i0 + 1)), fr) - 46 - 60 * Math.sin(fr * Math.PI)} r={44} fill={C.red} stroke={INK} strokeWidth={8} />
        </Svg>
        <At x={1300} y={300} s={pop(t, 0)}><T size={110} col={C.yellow} style={{ textShadow: "0 8px 0 #000" }}>The first step</T></At>
      </Mv></Dark>
    );
  },
  djul8: DateCard("July 8", "1932", { tone: "#2a1418", m: 0 }),
  down89: num("−89%", "from the top", { dark: true, m: 4, col: C.red, size: 400 }),
  fourfive: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="If you bought the dip" t={t} at={0} col={C.red} />
      <Bills t={t} n={5} cut={4} cutAt={Math.max(8, c(118, "$4") - 2)} y={440} s={250} />
      <At x={960} y={700} s={pop(t, Math.max(14, c(118, "$5") + 2))}><T size={76} col={C.red}>$4 of every $5, gone</T></At>
    </Mv></Paper>
  ),
  knewdate: say([{ s: "You knew", size: 130 }, { s: "the date", col: C.red, size: 250, cue: [120, "date"] }], { m: 0 }),

  // ---------------- attempt 5 ----------------
  list: ({ t, d, v, c }) => (
    <Paper><Mv t={t} d={d} m={v ? 0 : 2}>
      <div style={{ position: "absolute", left: 420, top: 150 }}>
        {["Tell everyone", "Tell the men in charge", "Get rich", "Buy the dip"].map((s, i) => <Row key={s} text={s} t={v ? 99 : t} at={i * 4} mark={i === 2 ? null : "x"} markAt={i * 4 + 5} strike={i !== 2} size={82} />)}
      </div>
      {v ? <Stamp text="Changed: nothing" t={t} at={Math.max(4, c(125, "nothing") - 2)} x={1180} y={640} size={96} r={-7} /> : null}
    </Mv></Paper>
  ),
  wrong: say([{ s: "You've been thinking", size: 100, col: "#fff" }, { s: "about this wrong", col: C.yellow, size: 118, cue: [126, "wrong"] }], { dark: true, m: 5 }),
  beatmarket: say([{ s: "Trying to", size: 110 }, { s: "beat the market", col: C.red, size: 160, cue: [127, "beat"] }], { m: 0 }),
  forget: say([{ s: "Forget", size: 200, col: "#fff" }, { s: "the market", col: C.yellow, size: 200, cue: [128, "market"] }], { dark: true, m: 4 }),
  cruelest: say([{ s: "The cruelest fact", size: 120, col: "#fff" }, { s: "of the whole story", col: C.yellow, size: 110, cue: [135, "whole"] }], { dark: true, tone: "#2a1418", m: 0 }),
  howdies: say([{ s: "That is exactly", size: 110 }, { s: "how a bank dies", col: C.red, size: 170, cue: [136, "how"] }], { m: 4 }),
  vault: ({ t, d, v, c }) => {
    const at = v ? Math.max(6, c(138, "lends") - 3) : 9999, dst: [number, number, string][] = [[1240, 280, "house"], [1500, 280, "farm"], [1240, 520, "shop"], [1500, 520, "house"]];
    return (
      <Paper><Mv t={t} d={d} m={v ? 2 : 0}>
        <Banner text={v ? "Where the money really is" : "What everyone pictures"} t={t} at={0} col={INK} y={110} />
        <Svg><rect x={300} y={230} width={620} height={500} rx={24} fill="#c9c2b0" {...st} strokeWidth={12} /><circle cx={610} cy={480} r={150} fill="#b0a894" {...st} strokeWidth={10} /><path d="M610 480 L610 360 M610 480 L710 540 M610 480 L510 540" {...sto} strokeWidth={12} /></Svg>
        {Array.from({ length: 10 }, (_, i) => {
          const hx = 380 + (i % 5) * 115, hy = 330 + Math.floor(i / 5) * 290, out = v && i > 0, g = out ? ease(k(t, at + i * 3, 14)) : 0, [dx, dy] = dst[i % 4];
          return <At key={i} x={lerp(hx, dx + ((i * 37) % 60) - 30, g)} y={lerp(hy, dy + 120 + ((i * 53) % 40), g)} s={pop(t, i) * 0.9}><Gl kind="bill" s={110} /></At>;
        })}
        {v ? dst.map(([x, y, g], i) => <At key={i} x={x} y={y} s={pop(t, at + i * 3)}><Gl kind={g} s={170} /></At>) : null}
        {v ? <At x={1370} y={730} s={pop(t, at + 14)}><T size={64} col={C.red}>Lent out</T></At> : <At x={1370} y={470} s={pop(t, 8)}><T size={76} style={{ whiteSpace: "normal", width: 560, textAlign: "center" }}>Everyone's money, in the vault</T></At>}
      </Mv></Paper>
    );
  },
  bankrun: say([{ s: "A bank", size: 160, col: "#fff" }, { s: "run", col: C.red, size: 400, cue: [140, "run"] }], { dark: true, tone: "#2a1418", m: 4 }),
  bouscard: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <At x={960} y={420} s={pop(t, 0)}>
        <div style={{ display: "flex", alignItems: "center", gap: 44, background: "#fffaf0", border: `8px solid ${INK}`, borderLeft: `40px solid ${C.red}`, borderRadius: 18, padding: "40px 60px", boxShadow: `0 14px 0 ${INK}` }}>
          <Gl kind="bank" s={230} />
          <div><T size={84}>Bank of United States</T><T size={54} w={800} col={C.red} style={{ marginTop: 8 }}>New York · 400,000 customers</T></div>
        </div>
      </At>
    </Mv></Paper>
  ),
  afterrun: DateCard("December 11, 1930", "Closed after a run", { tone: "#2a1418", m: 0 }),

  // ---------------- what would have worked ----------------
  whatworked: say([{ s: "So what would", size: 110, col: "#fff" }, { s: "actually have worked?", col: C.yellow, size: 120, cue: [149, "actually"] }], { dark: true, m: 5 }),
  small: say([{ s: "Small things", size: 170 }, { s: "Quiet things", col: C.grey, size: 150, cue: [150, "Quiet"] }], { m: 0 }),
  debt: Quote(["“Get out", "of debt.”"], "Roger Babson, in the same speech, September 5, 1929", { cue: [152, "debt"] }),
  margin: ({ t, d, v, c }) => (
    <Paper><Mv t={t} d={d} m={v ? 3 : 0}>
      <Banner text="Buying stock in 1929" t={t} at={0} col={INK} />
      <Split t={v ? 99 : t} a={0.1} la="10% down" lb="90% borrowed" ca={GREEN} cb={C.red} at={v ? 0 : Math.max(8, d - 6)} />
      {v ? null : <At x={960} y={720} s={pop(t, Math.max(6, c(153, "10") - 2))}><T size={56} w={800} col={C.grey} up={false}>as little as 10 percent of your own money</T></At>}
    </Mv></Paper>
  ),
  secrets: ({ t, d, v, c }) => {
    const rows: [string, [number, string]][] = [["Don't owe anyone money", [156, "owe"]], ["Keep cash a bank can't lock up", [157, "cash"]], ["Summer 1932: buy", [158, "buy"]]];
    return (
      <Paper><Mv t={t} d={d} m={v === 2 ? 0 : 2}>
        <Banner text="The whole secret" t={t} at={0} col={GREEN} />
        <div style={{ position: "absolute", left: 300, top: 250 }}>
          {rows.slice(0, v + 1).map(([s, cue], i) => <Row key={s} text={s} t={i < v ? 99 : t} at={i < v ? 0 : v === 2 ? 0 : Math.max(0, c(cue[0], cue[1]) - 4)} mark="check" markAt={i < v ? 0 : v === 2 ? 5 : Math.max(5, c(cue[0], cue[1]) + 3)} size={66} />)}
        </div>
      </Mv></Paper>
    );
  },
  ruleschange: say([{ s: "Afterward", size: 130 }, { s: "the rules change", col: "#2f5fb5", size: 138, cue: [161, "rules"] }], { m: 0 }),
  law: ({ t, d, v }) => (
    <Paper><Mv t={t} d={d} m={v ? 3 : 2}>
      <At x={960} y={170} s={pop(t, 0)}><Pill text={v ? "1934" : "1933"} col={INK} fg="#fff" size={70} /></At>
      <At x={960} y={410} s={pop(t, 2)}><Gl kind={v ? "badge" : "shield"} s={270} /></At>
      <At x={960} y={660} s={pop(t, 6)}><T size={v ? 66 : 100}>{v ? "Securities and Exchange Commission" : "Deposit insurance"}</T></At>
    </Mv></Paper>
  ),
  myth: say([{ s: "Brokers jumping", size: 130 }, { s: "out of windows?", size: 130 }], { m: 0, stamp: { s: "Myth", cue: [166, "myth"], y: 470, size: 230 } }),
  nowave: say([{ s: "No wave of them", size: 130, col: "#fff" }, { s: "that fall", col: C.yellow, size: 190, cue: [167, "fall"] }], { dark: true, m: 0 }),
  title: say([{ s: "What if you were", size: 96, col: "#fff" }, { s: "the only one", col: C.yellow, size: 150, cue: [168, "only"] }, { s: "who knew?", size: 150, col: "#fff", cue: [168, "knew"] }], { dark: true, m: 0 }),
  knowing: say([{ s: "Knowing was never", size: 110, col: "#fff" }, { s: "the problem", col: C.yellow, size: 185, cue: [170, "problem"] }], { dark: true, m: 4 }),
  sawit: say([{ s: "Not because", size: 110 }, { s: "nobody saw it coming", col: C.red, size: 120, cue: [172, "nobody"] }], { m: 0 }),
  comments: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <At x={960} y={280} s={pop(t, 0)}><Gl kind="bubble" s={230} /></At>
      <At x={960} y={500} s={pop(t, 3)}><T size={84}>What would you have tried?</T></At>
      <At x={960} y={650} s={pop(t, Math.max(8, c(175, "comments") - 6))}><Pill text="Tell me in the comments" col={C.red} fg="#fff" size={60} /></At>
    </Mv></Paper>
  ),
};

/** no maps in this one; kept so the composition's router stays the same as the other long-forms */
export const MapBoard: React.FC<G & { name: string }> = () => null;
