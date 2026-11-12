// The Titanic "what if" long-form's 2D boards. Each takes G (t = frame in shot, d = shot length, c(seg, word) = a word's
// onset in shot frames, v = variant) and builds on the narration's words. Content stays above y = 800 (captions below).
// Every board has a camera move of its own (Mv) and shows something from its first frame. Colour code: red = danger /
// failed, blue = the sea and the viewer, yellow = the point. Maps are at the bottom (keyed "map:<name>").
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, G, FONT, Paper, At, T, Banner, Stamp, Row, Big, k, pop, ease, lerp, clamp01, count, fmt } from "../pigwarlong/kit";
import { say, num, card, icons, Mv, Bg, Dark, Svg, Pill, cueAt } from "../hertzlong/boards";

const INK = C.ink, SEA = "#2f5fb5", NIGHT = "#101a33";
const st = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const sto = { ...st, fill: "none" };

/** glyphs for this story (100 x 100 box) */
const Gl: React.FC<{ kind: string; s?: number }> = ({ kind, s = 160 }) => {
  const body = (() => {
    switch (kind) {
      case "binoc": return <><rect x={10} y={30} width={34} height={52} rx={12} fill="#3a3a48" {...st} /><rect x={56} y={30} width={34} height={52} rx={12} fill="#3a3a48" {...st} /><rect x={40} y={40} width={20} height={16} fill="#5a5a6a" {...st} /><circle cx={27} cy={74} r={11} fill="#9fd0ea" {...st} /><circle cx={73} cy={74} r={11} fill="#9fd0ea" {...st} /><rect x={16} y={14} width={22} height={18} rx={4} fill="#5a5a6a" {...st} /><rect x={62} y={14} width={22} height={18} rx={4} fill="#5a5a6a" {...st} /></>;
      case "key": return <><circle cx={26} cy={50} r={18} fill={C.gold} {...st} /><circle cx={26} cy={50} r={6} fill="#fffaf0" {...st} strokeWidth={5} /><path d="M44 50 L92 50 M74 50 L74 66 M86 50 L86 62" {...sto} strokeWidth={10} stroke={INK} /><path d="M44 50 L92 50 M74 50 L74 66 M86 50 L86 62" fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" /></>;
      case "lock": return <><path d="M30 46 L30 30 Q30 10 50 10 Q70 10 70 30 L70 46" {...sto} strokeWidth={10} /><rect x={18} y={44} width={64} height={48} rx={8} fill={C.gold} {...st} /><circle cx={50} cy={64} r={7} fill={INK} /><path d="M50 66 L50 80" {...sto} /></>;
      case "radio": return <><rect x={10} y={56} width={80} height={30} rx={6} fill="#8a5a3a" {...st} /><rect x={20} y={34} width={18} height={24} rx={4} fill="#d98a3a" {...st} /><rect x={44} y={34} width={18} height={24} rx={4} fill="#d98a3a" {...st} /><path d="M70 60 L92 46" {...sto} /><circle cx={92} cy={46} r={6} fill={INK} /><path d="M30 26 q-8 -8 0 -16 M52 26 q8 -8 0 -16" {...sto} strokeWidth={5} /></>;
      case "berg": return <><path d="M6 78 L30 30 L46 48 L58 14 L78 44 L94 78 Z" fill="#eaf4fb" {...st} /><path d="M30 30 L38 62 M58 14 L62 58" {...sto} strokeWidth={4} stroke="#9fc3e0" /><path d="M0 80 q12 -8 25 0 t25 0 t25 0 t25 0" {...sto} stroke={SEA} /></>;
      case "boat": return <><path d="M6 46 L94 46 L82 78 L18 78 Z" fill="#f4f0e6" {...st} /><path d="M6 46 L94 46" {...sto} stroke="#7a5236" strokeWidth={9} /><path d="M30 46 L30 78 M50 46 L50 78 M70 46 L70 78" {...sto} strokeWidth={4} /></>;
      case "violin": return <><path d="M38 44 Q20 50 24 66 Q16 82 34 92 Q50 98 62 88 Q76 78 68 64 Q74 48 56 44 Z" fill="#b5662f" {...st} /><path d="M46 44 L62 8 L70 12 L56 46" fill="#5a3b2a" {...st} /><path d="M36 60 L60 74" {...sto} strokeWidth={4} /><path d="M80 30 q10 4 6 16 M88 22 q14 8 8 26" {...sto} strokeWidth={5} /></>;
      case "ship": return <><path d="M4 60 L96 60 L86 82 L12 82 Z" fill="#23232b" {...st} /><rect x={22} y={44} width={56} height={16} fill="#f1ede2" {...st} />{[30, 44, 58, 72].map((x) => <rect key={x} x={x - 5} y={18} width={10} height={26} fill="#e2a04e" {...st} strokeWidth={5} />)}</>;
      case "bubble": return <><path d="M10 14 L90 14 Q96 14 96 22 L96 62 Q96 70 90 70 L46 70 L26 90 L28 70 L10 70 Q4 70 4 62 L4 22 Q4 14 10 14 Z" fill="#fffaf0" {...st} /><path d="M22 34 L78 34 M22 50 L62 50" {...sto} /></>;
      case "pin": return <><path d="M50 92 L28 46 Q22 14 50 10 Q78 14 72 46 Z" fill={C.red} {...st} /><circle cx={50} cy={36} r={11} fill="#fffaf0" {...st} /></>;
      case "clock24": return <><circle cx={50} cy={50} r={40} fill="#fffaf0" {...st} /><path d="M50 50 L50 22 M50 50 L72 50" {...sto} /><circle cx={50} cy={50} r={4} fill={INK} /></>;
      default: return null;
    }
  })();
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>{body}</svg>;
};

const ATTEMPTS = ["Tell everyone", "Tell the captain", "The lookouts", "The wireless room", "Fill the lifeboats"];
/** the attempt card (and, with failed, the stamp that slams onto it) */
const Attempt: React.FC<G & { failed?: boolean }> = ({ t, d, v, c, failed }) => {
  const n = Math.max(1, Math.min(5, v || 1)), title = ATTEMPTS[n - 1];
  const tw = Math.min(118, 1500 / (title.length * 0.66));
  return (
    <Bg dark tone={failed ? "#2a1418" : NIGHT}><Mv t={t} d={d} m={failed ? 5 : 4}>
      <At x={960} y={250} s={pop(t, 0)}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <T size={150} col="#fff" style={{ textShadow: "0 10px 0 #000" }}>Attempt</T>
          <div style={{ width: 210, height: 210, borderRadius: "50%", background: failed ? C.grey : C.red, border: `10px solid ${INK}`, boxShadow: "0 10px 0 #000", display: "flex", alignItems: "center", justifyContent: "center" }}><T size={150} col="#fff">{n}</T></div>
        </div>
      </At>
      <At x={960} y={500} s={pop(t, failed ? 0 : Math.max(4, c(SEG_OF[n - 1], WORD_OF[n - 1]) - 2))}>
        <div style={{ background: "#fffaf0", border: `8px solid ${INK}`, borderRadius: 18, padding: "18px 56px", boxShadow: "0 12px 0 #000" }}><T size={tw}>{title}</T></div>
      </At>
      {failed ? <Stamp text="Failed" t={t} at={Math.max(3, c(FAIL_SEG[n - 1], "failed") - 2)} x={960} y={420} size={230} r={-9} /> : null}
    </Mv></Bg>
  );
};
// where each attempt is announced / fails in the script (segment, word)
const SEG_OF = [26, 40, 58, 76, 148], WORD_OF = ["Tell", "Tell", "lookouts", "wireless", "attempt"], FAIL_SEG = [35, 57, 75, 97, 97];

const TimeCard = (time: string, ampm: string, sub: string, o: { tone?: string; col?: string; m?: number } = {}): React.FC<G> => ({ t, d }) => (
  <Bg dark tone={o.tone ?? NIGHT}><Mv t={t} d={d} m={o.m ?? 4}>
    <At x={960} y={380} s={pop(t, 0)}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 30 }}>
        <T size={330} col={o.col ?? C.yellow} style={{ textShadow: "0 16px 0 #000", letterSpacing: 4 }}>{time}</T>
        <T size={120} col="#fff" style={{ marginBottom: 40, textShadow: "0 8px 0 #000" }}>{ampm}</T>
      </div>
    </At>
    <At x={960} y={650} s={pop(t, 6)}><Pill text={sub} col={C.red} fg="#fff" size={58} /></At>
  </Mv></Bg>
);

/** a Marconi telegram form with lines that pop in */
const Telegram: React.FC<{ t: number; from: string; time: string; lines: { s: string; at: number }[]; x?: number; y?: number; sc?: number }> = ({ t, from, time, lines, x = 960, y = 430, sc = 1 }) => (
  <At x={x} y={y} s={pop(t, 0) * sc}>
    <div style={{ width: 1180, background: "#fff6dc", border: `8px solid ${INK}`, borderRadius: 10, boxShadow: `0 14px 0 ${INK}`, overflow: "hidden" }}>
      <div style={{ background: C.red, padding: "14px 34px", display: "flex", justifyContent: "space-between", borderBottom: `8px solid ${INK}` }}><T size={46} col="#fff">Marconi wireless</T><T size={46} col="#fff">{time}</T></div>
      <div style={{ padding: "22px 34px 30px" }}>
        <T size={44} w={800} col={C.grey}>From: {from}</T>
        {lines.map((ln, i) => <div key={i} style={{ marginTop: 16, opacity: clamp01((t - ln.at) / 5), transform: `translateX(${(1 - ease(k(t, ln.at, 8))) * -40}px)` }}><T size={Math.min(84, 1080 / (ln.s.length * 0.64))}>{ln.s}</T></div>)}
      </div>
    </div>
  </At>
);

/** the ship from the side, cut into her sixteen watertight compartments; the first n flood */
const Compartments: React.FC<{ t: number; n: number; from: number; col: string }> = ({ t, n, from, col }) => {
  const X0 = 260, W = 1400, Y = 430, H = 150, cw = W / 16;
  return (
    <Svg>
      <path d={`M${X0 - 40} ${Y} L${X0 + W + 90} ${Y} L${X0 + W + 20} ${Y + H} L${X0 + 10} ${Y + H} Z`} fill="#3a3a48" {...st} />
      {Array.from({ length: 16 }, (_, i) => {
        const fi = 15 - i, on = fi < n, a = on ? clamp01((t - from - fi * 5) / 10) : 0; // bow is on the right
        return <g key={i}><rect x={X0 + i * cw + 6} y={Y + 12 + (1 - a) * (H - 24)} width={cw - 12} height={a * (H - 24)} fill={col} /><path d={`M${X0 + i * cw} ${Y} L${X0 + i * cw} ${Y + H}`} {...sto} strokeWidth={5} /></g>;
      })}
      <rect x={X0 + 260} y={Y - 62} width={880} height={62} fill="#f1ede2" {...st} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={X0 + 380 + i * 190} y={Y - 170} width={66} height={110} fill="#e2a04e" {...st} />)}
      <path d={`M120 ${Y + 60} q40 -22 80 0 t80 0`} {...sto} stroke={SEA} /><path d={`M1640 ${Y + 60} q40 -22 80 0 t80 0`} {...sto} stroke={SEA} />
    </Svg>
  );
};

/** rows of seats: `full` filled, the rest empty */
const Seats: React.FC<{ t: number; total: number; full: number; cols: number; x: number; y: number; r: number; gap: number; at: number; fillAt: number }> = ({ t, total, full, cols, x, y, r, gap, at, fillAt }) => (
  <Svg>
    {Array.from({ length: total }, (_, i) => {
      const cx = x + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap, a = clamp01((t - at - i * (total > 100 ? 0.05 : 0.2)) / 5), f = i < full ? clamp01((t - fillAt - i * 0.4) / 5) : 0;
      return <g key={i} opacity={a}><circle cx={cx} cy={cy} r={r} fill="#fffaf0" stroke={INK} strokeWidth={r > 12 ? 6 : 3} /><circle cx={cx} cy={cy} r={r * 0.62 * f} fill={SEA} /></g>;
    })}
  </Svg>
);

const WARN_SHIPS = ["Caronia", "Baltic", "Amerika", "Noordam", "Californian", "Mesaba"];

export const BOARDS: Record<string, React.FC<G>> = {
  // ---------------- cold open ----------------
  t1139: TimeCard("11:39", "PM", "April 14, 1912"),
  gone: say([{ s: "2 hours 40 minutes", col: C.yellow, size: 150 }], { dark: true, tone: "#2a1418", m: 4, y: 380, stamp: { s: "Gone", cue: [4, "gone"], y: 640, size: 190 } }),
  n1500: num("1,500", "people", { dark: true, m: 0, col: C.red, size: 360 }),
  whatdo: say([{ s: "So what", size: 150, col: "#fff" }, { s: "do you do?", col: C.yellow, size: 190, cue: [7, "do"] }], { dark: true, m: 5 }),
  everybody: say([{ s: "“I'd warn somebody.”", size: 130 }, { s: "everybody", col: C.red, size: 150, cue: [9, "everybody"] }], { m: 2 }),
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
  warned: say([{ s: "The Titanic", size: 120, col: "#fff" }, { s: "was warned", col: C.yellow, size: 180, cue: [13, "warned"] }], { dark: true, m: 0 }),
  six: num("6", "times in one day", { dark: true, m: 4, col: C.yellow, size: 420 }),

  // ---------------- chapter 1 ----------------
  rewind: ({ t, d }) => (
    <Dark tone={NIGHT}><Mv t={t} d={d} m={3}>
      <At x={960} y={300} s={pop(t, 0)}>
        <svg width={520} height={220} viewBox="0 0 520 220" style={{ transform: `translateX(${-18 * Math.sin(t / 3)}px)` }}>
          <path d="M250 20 L60 110 L250 200 Z M480 20 L290 110 L480 200 Z" fill={C.yellow} stroke={INK} strokeWidth={14} strokeLinejoin="round" />
        </svg>
      </At>
      <At x={960} y={560} s={pop(t, 4)}><T size={150} col="#fff" style={{ textShadow: "0 12px 0 #000" }}>4 days earlier</T></At>
    </Mv></Dark>
  ),
  ticket: ({ t, d }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <At x={960} y={420} s={pop(t, 0)} r={-4}>
        <div style={{ width: 1240, background: "#fff6dc", border: `10px solid ${INK}`, borderRadius: 22, boxShadow: `0 16px 0 ${INK}`, padding: "34px 54px", position: "relative" }}>
          <T size={56} col={C.red}>White Star Line</T>
          <T size={128} style={{ marginTop: 10 }}>R.M.S. Titanic</T>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, borderTop: `8px dashed ${INK}`, paddingTop: 24 }}>
            <div><T size={40} w={800} col={C.grey}>Class</T><T size={92} col={SEA}>Third</T></div>
            <div><T size={40} w={800} col={C.grey}>Sailing</T><T size={92}>10 April 1912</T></div>
          </div>
        </div>
      </At>
      <Stamp text="Admit one" t={t} at={10} x={1420} y={640} size={74} r={-12} />
    </Mv></Paper>
  ),
  getoff: say([{ s: "You know how many", size: 96, col: "#fff" }, { s: "are getting off", col: C.yellow, size: 136, cue: [24, "getting"] }], { dark: true, m: 1 }),
  n700: num("700", "about that many", { dark: true, m: 4, col: C.red, size: 400 }),
  attempt: (g) => <Attempt {...g} />,
  fail: (g) => <Attempt {...g} failed />,
  magazine: ({ t, d, c }) => (
    <Paper tone={C.paper2}><Mv t={t} d={d} m={0}>
      <At x={960} y={420} s={pop(t, 0)} r={2}>
        <div style={{ width: 1320, background: "#fffaf0", border: `10px solid ${INK}`, boxShadow: `0 16px 0 ${INK}`, padding: "30px 50px" }}>
          <div style={{ borderBottom: `10px double ${INK}`, paddingBottom: 14, textAlign: "center" }}><T size={96}>The Shipbuilder</T><T size={34} w={800} col={C.grey} style={{ marginTop: 6 }}>Special number · 1911</T></div>
          <div style={{ marginTop: 34, textAlign: "center" }}>
            <T size={54} w={800} up={false}>the new liners are</T>
            <div style={{ transform: `scale(${pop(t, Math.max(6, c(31, "practically") - 2))})`, marginTop: 10 }}><T size={86} col={C.red}>“Practically unsinkable”</T></div>
          </div>
        </div>
      </At>
    </Mv></Paper>
  ),

  // ---------------- chapter 2 ----------------
  smith: card("Edward Smith", "Captain, R.M.S. Titanic", "person", { col: SEA, m: 0 }),
  senior: say([{ s: "White Star's", size: 100 }, { s: "most senior captain", col: SEA, size: 108, cue: [43, "senior"] }], { m: 3 }),
  problem: say([{ s: "Here's the", size: 110, col: "#fff" }, { s: "problem", col: C.red, size: 250, cue: [46, "problem"] }], { dark: true, m: 4 }),
  warn6: ({ t, d, v, c }) => (
    <Paper><Mv t={t} d={d} m={v ? 1 : 0}>
      <Banner text={v ? "6 warnings" : "Ice warnings · April 14"} t={t} at={0} col={C.red} />
      {WARN_SHIPS.map((n, i) => {
        const at = v ? i * 3 : Math.round(i * Math.min(9, d * 0.09));
        return <At key={i} x={420 + (i % 3) * 540} y={350 + Math.floor(i / 3) * 250} s={pop(t, at)} r={(i % 2 ? 1 : -1) * 2.5}>
          <div style={{ width: 470, background: "#fff6dc", border: `7px solid ${INK}`, borderRadius: 8, boxShadow: `0 10px 0 ${INK}`, overflow: "hidden" }}>
            <div style={{ background: C.red, padding: "6px 18px", borderBottom: `7px solid ${INK}` }}><T size={30} col="#fff">Ice report</T></div>
            <div style={{ padding: "14px 18px 18px", display: "flex", alignItems: "center", gap: 14 }}><Gl kind="berg" s={86} /><T size={Math.min(56, 340 / (n.length * 0.7))}>{n}</T></div>
          </div>
        </At>;
      })}
    </Mv></Paper>
  ),
  speed: num("22", "knots", { dark: true, m: 4, col: C.yellow, size: 400, sub: "close to full speed", subCue: [51, "full"] }),
  normal: say([{ s: "Not reckless", size: 130 }, { s: "Normal", col: SEA, size: 260, cue: [53, "normal"] }], { m: 0 }),
  y1912: say([{ s: "1912", col: C.red, size: 300 }, { s: "full speed in clear weather", size: 84, cue: [54, "speed"] }], { m: 4 }),

  // ---------------- chapter 3 ----------------
  binoc: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <At x={960} y={360} s={pop(t, 0)}><Gl kind="binoc" s={380} /></At>
      <At x={960} y={670} s={pop(t, Math.max(6, c(62, "meant") - 2))}><Pill text="For the crow's nest" col={C.yellow} size={74} /></At>
    </Mv></Paper>
  ),
  locked: ({ t, d, c }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={0}>
      <At x={960} y={400} s={pop(t, 0)}>
        <div style={{ width: 620, height: 470, background: "#8a5a3a", border: `12px solid ${INK}`, borderRadius: 14, boxShadow: "0 16px 0 #000", position: "relative" }}>
          <div style={{ position: "absolute", left: 304, top: 0, width: 12, height: "100%", background: INK }} />
          <div style={{ position: "absolute", left: 210, top: 150, transform: `scale(${pop(t, Math.max(5, c(63, "locked") - 2))}) rotate(${4 * Math.sin(t / 4)}deg)` }}><Gl kind="lock" s={200} /></div>
        </div>
      </At>
      <At x={960} y={720} s={pop(t, 4)}><T size={70} col="#fff">Binoculars</T></At>
    </Mv></Bg>
  ),
  blair: card("David Blair", "Second officer · taken off the crew", "person", { col: C.red, m: 3 }),
  pocket: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={5}>
      <At x={960} y={340} s={pop(t, 0)} r={-18 + 6 * Math.sin(t / 6)}><Gl kind="key" s={420} /></At>
      <At x={960} y={660} s={pop(t, Math.max(6, c(66, "pocket") - 4))}><T size={110} col={C.red}>Still in his pocket</T></At>
    </Mv></Paper>
  ),
  fleet: card("Frederick Fleet", "Lookout · survived", "person", { col: SEA, m: 0 }),
  quote: ({ t, d, c }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={0}>
      <At x={960} y={170} s={pop(t, 0)}><T size={54} col={C.gold}>With binoculars, how much sooner?</T></At>
      <At x={960} y={430} s={pop(t, Math.max(4, c(68, "Enough") - 2))}><T size={128} col="#fff" style={{ textShadow: "0 10px 0 #000" }}>“Enough to get</T></At>
      <At x={960} y={600} s={pop(t, Math.max(8, c(68, "out") - 2))}><T size={128} col={C.yellow} style={{ textShadow: "0 10px 0 #000" }}>out of the way.”</T></At>
      <At x={960} y={760} s={pop(t, Math.max(12, c(68, "way") + 4))}><T size={44} w={800} col={C.gold} up={false}>Frederick Fleet, U.S. Senate inquiry, 1912</T></At>
    </Mv></Bg>
  ),
  experts: say([{ s: "Some experts:", size: 100 }, { s: "it wouldn't have helped", col: C.red, size: 98, cue: [70, "wouldn't"] }], { m: 2 }),

  // ---------------- chapter 4 ----------------
  bestshot: say([{ s: "Your", size: 130, col: "#fff" }, { s: "best shot", col: C.yellow, size: 205, cue: [77, "best"] }], { dark: true, m: 4 }),
  broke: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <Banner text="The day before" t={t} at={0} col={INK} />
      <At x={960} y={450} s={pop(t, 0)} r={3 * Math.sin(t / 3)}><Gl kind="radio" s={380} /></At>
      <Stamp text="Broken" t={t} at={Math.max(6, c(79, "broke") - 2)} x={960} y={470} size={170} r={-10} />
    </Mv></Paper>
  ),
  phillips: card("Jack Phillips", "Senior wireless operator · age 25", "person", { col: SEA, m: 3 }),
  mesaba: ({ t, d, v, c }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={v ? 0 : 4}>
      <Telegram t={v ? 99 : t} from="S.S. Mesaba" time="9:40 PM" y={420}
        lines={v ? [{ s: "Heavy pack ice", at: 0 }, { s: "Large icebergs", at: Math.max(4, c(85, "Large") - 2) }, { s: "In your path", at: Math.max(8, c(85, "Right") - 2) }].map((l) => ({ ...l, at: l.at + 99 - t }))
          : [{ s: "Ice report", at: 6 }]} />
    </Mv></Bg>
  ),
  neverbridge: ({ t, d, c }) => {
    const x = Math.max(8, c(86, "never") - 2);
    return (
      <Paper><Mv t={t} d={d} m={2}>
        <At x={480} y={420} s={pop(t, 0)}><div style={{ textAlign: "center" }}><Gl kind="radio" s={230} /><div style={{ marginTop: 16 }}><Pill text="Wireless room" size={52} /></div></div></At>
        <At x={1440} y={420} s={pop(t, 4)}><div style={{ textAlign: "center" }}><Gl kind="ship" s={230} /><div style={{ marginTop: 16 }}><Pill text="The bridge" size={52} /></div></div></At>
        <Svg><path d={`M700 400 L${700 + 520 * ease(k(t, 2, 14))} 400`} stroke={INK} strokeWidth={22} strokeLinecap="round" strokeDasharray="34 30" /></Svg>
        <At x={960} y={400} s={pop(t, x)}><T size={280} col={C.red} style={{ textShadow: `0 10px 0 ${INK}` }}>✗</T></At>
      </Mv></Paper>
    );
  },
  shutup: ({ t, d, c }) => (
    <Bg dark tone="#3a1016"><Mv t={t} d={d} m={5}>
      <At x={960} y={250} s={pop(t, 0)}><T size={220} col="#fff" style={{ textShadow: "0 14px 0 #000" }}>“Shut up.</T></At>
      <At x={960} y={470} s={pop(t, Math.max(5, c(91, "up.") + 10))}><T size={220} col="#fff" style={{ textShadow: "0 14px 0 #000" }}>Shut up.</T></At>
      <At x={960} y={690} s={pop(t, Math.max(10, c(91, "I") - 2))}><T size={190} col={C.yellow} style={{ textShadow: "0 14px 0 #000" }}>I am busy.”</T></At>
    </Mv></Bg>
  ),
  remember: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={4}>
      <At x={960} y={300} s={pop(t, 0)} r={-8}><Gl kind="pin" s={300} /></At>
      <At x={960} y={590} s={pop(t, 3)}><T size={170}>Remember that</T></At>
      <At x={960} y={740} s={pop(t, Math.max(8, c(93, "matters") - 2))}><T size={70} col={C.red}>It matters later</T></At>
    </Mv></Paper>
  ),

  // ---------------- chapter 5 ----------------
  t1139b: TimeCard("11:39", "PM", "Back where we started", { tone: "#2a1418" }),
  compart: ({ t, d, v, c }) => (
    <Paper><Mv t={t} d={d} m={v ? 4 : 0}>
      <Banner text={v ? "The ice opens at least 5" : "She floats with 4 flooded"} t={t} at={0} col={v ? C.red : SEA} />
      <Compartments t={t} n={v ? 5 : 4} from={v ? 2 : Math.max(4, c(109, "4") - 14)} col={v ? C.red : SEA} />
      {v ? <Stamp text="Too many" t={t} at={Math.max(10, c(110, "5") + 6)} x={960} y={690} size={130} r={-6} />
        : <At x={960} y={700} s={pop(t, Math.max(10, c(109, "4") + 8))}><Pill text="Still afloat" col={C.green} fg="#fff" size={70} /></At>}
    </Mv></Paper>
  ),
  cruelest: say([{ s: "The cruelest fact", size: 130, col: "#fff" }, { s: "of the whole night", col: C.yellow, size: 110, cue: [111, "whole"] }], { dark: true, tone: "#2a1418", m: 0 }),
  wilding: card("Edward Wilding", "Naval architect, Harland & Wolff", "person", { col: SEA, m: 0 }),
  headon: ({ t, d, v, c }) => {
    const hit = v === 0 ? clamp01((t - 8) / 14) : 1, cr = v >= 1 ? clamp01((t - 2) / 10) : 0;
    const bx = lerp(520, 800, ease(hit));
    return (
      <Bg dark tone="#16304f"><Mv t={t} d={d} m={v === 0 ? 2 : v === 1 ? 4 : 0}>
        <Banner text={v === 0 ? "If she had hit it head-on" : v === 1 ? "The bow: crushed" : "The ship: survives"} t={t} at={0} col={v === 1 ? C.red : v === 2 ? C.green : INK} />
        <Svg><g transform="translate(960 440) scale(1.45) translate(-900 -430)">
          <g transform="translate(1160 430)"><path d="M-150 60 L-60 -120 L20 -40 L80 -150 L170 30 L120 130 L-90 140 Z" fill="#eaf4fb" {...st} /><path d="M-60 -120 L-20 40 M80 -150 L70 60" {...sto} strokeWidth={5} stroke="#9fc3e0" /></g>
          <g transform={`translate(${bx} 430)`}>
            <path d={`M-560 -70 L${110 - 90 * cr} -70 L${220 - 150 * cr} 0 L${110 - 90 * cr} 70 L-560 70 Q-620 0 -560 -70 Z`} fill="#3a3a48" {...st} />
            <rect x={-470} y={-40} width={500} height={80} fill="#f1ede2" {...st} />
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={-400 + i * 120} cy={0} r={26} fill="#e2a04e" {...st} />)}
            {cr > 0 ? <path d={`M${120 - 90 * cr} -70 L${225 - 150 * cr} 0 L${120 - 90 * cr} 70`} fill="none" stroke={C.red} strokeWidth={20} strokeLinejoin="round" opacity={cr} /> : null}
          </g>
        </g></Svg>
        {v === 2 ? <Stamp text="Afloat" t={t} at={Math.max(6, c(114, "survived") - 4)} x={720} y={660} size={170} col={C.green} r={-8} /> : null}
        {v === 1 ? <At x={960} y={720} s={pop(t, Math.max(8, c(113, "People") - 2))}><T size={76} col="#fff">People would have died</T></At> : null}
      </Mv></Bg>
    );
  },
  notturning: say([{ s: "What might have saved her:", size: 76, col: "#fff" }, { s: "not turning", col: C.yellow, size: 185, cue: [115, "not"] }], { dark: true, m: 5 }),
  andrews: card("Thomas Andrews", "Her designer · on board", "person", { col: C.red, m: 3 }),
  hours: ({ t, d, c }) => (
    <Bg dark tone="#2a1418"><Mv t={t} d={d} m={4}>
      <At x={960} y={330} s={pop(t, 0)}><T size={300} col={C.yellow} style={{ textShadow: "0 14px 0 #000" }}>1 hour</T></At>
      <At x={960} y={600} s={pop(t, Math.max(6, c(119, "Maybe") - 2))}><T size={170} col="#fff" style={{ textShadow: "0 10px 0 #000" }}>maybe 2</T></At>
    </Mv></Bg>
  ),

  // ---------------- chapter 6 ----------------
  nothing: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={1}>
      <div style={{ position: "absolute", left: 480, top: 170 }}>
        {ATTEMPTS.slice(0, 4).map((a, i) => <Row key={i} text={a} t={t} at={i * 5} mark="x" markAt={8 + i * 6} size={70} strike />)}
      </div>
      <At x={960} y={720} s={pop(t, Math.max(30, c(122, "nothing") - 2))}><Pill text="Changed: nothing" col={C.red} fg="#fff" size={84} /></At>
    </Mv></Paper>
  ),
  wrong: say([{ s: "You've been thinking", size: 96, col: "#fff" }, { s: "about this wrong", col: C.yellow, size: 118, cue: [123, "wrong"] }], { dark: true, m: 5 }),
  next2: say([{ s: "The next", size: 120 }, { s: "2 hours", col: C.red, size: 280, cue: [127, "2"] }], { m: 4 }),
  n1178: num("1,178", "lifeboat seats", { m: 4, col: SEA, size: 330, top: "20 lifeboats" }),
  vs2200: ({ t, d, c }) => {
    const a = ease(k(t, 2, 14)), b = ease(k(t, Math.max(8, c(130, "2,200") - 6), 14));
    return (
      <Paper><Mv t={t} d={d} m={0}>
        <div style={{ position: "absolute", left: 220, top: 210 }}><T size={56}>Lifeboat seats</T>
          <div style={{ marginTop: 12, width: 1480 * (1178 / 2200) * a, height: 130, background: SEA, border: `8px solid ${INK}`, boxShadow: `0 10px 0 ${INK}`, display: "flex", alignItems: "center", paddingLeft: 30, overflow: "hidden" }}><T size={96} col="#fff">1,178</T></div></div>
        <div style={{ position: "absolute", left: 220, top: 490 }}><T size={56}>People on board</T>
          <div style={{ marginTop: 12, width: 1480 * b, height: 130, background: C.red, border: `8px solid ${INK}`, boxShadow: `0 10px 0 ${INK}`, display: "flex", alignItems: "center", paddingLeft: 30, overflow: "hidden" }}><T size={96} col="#fff">about 2,200</T></div></div>
      </Mv></Paper>
    );
  },
  notenough: say([{ s: "Not enough", col: C.red, size: 200 }, { s: "everybody knows that part", size: 80, cue: [131, "Everybody"] }], { m: 0 }),
  dontknow: say([{ s: "Here's the part", size: 110, col: "#fff" }, { s: "they don't", col: C.yellow, size: 250, cue: [132, "they"] }], { dark: true, m: 4 }),
  t1240: TimeCard("12:40", "AM", "The first lifeboat leaves"),
  seats: ({ t, d, v, c }) => {
    if (v === 3) return (
      <Bg dark tone={NIGHT}><Mv t={t} d={d} m={1}>
        <Seats t={t} total={472} full={0} cols={40} x={258} y={150} r={13} gap={36} at={0} fillAt={9999} />
        <At x={960} y={690} s={pop(t, 8)}><Pill text="472 empty seats" col={C.red} fg="#fff" size={96} /></At>
      </Mv></Bg>
    );
    const total = v === 2 ? 40 : 65, full = v === 0 ? 0 : v === 1 ? 28 : 12, cols = v === 2 ? 10 : 13, gap = v === 2 ? 96 : 84;
    const fillAt = v === 1 ? Math.max(4, c(135, "28") - 10) : v === 2 ? Math.max(6, c(136, "12") - 10) : 9999;
    return (
      <Paper><Mv t={t} d={d} m={v === 0 ? 0 : 4}>
        <Banner text={v === 0 ? "Room for 65" : v === 1 ? "It leaves with 28" : "Built for 40 · leaves with 12"} t={t} at={0} col={v === 0 ? SEA : C.red} y={110} />
        <Seats t={v === 0 ? t : 99} total={total} full={full} cols={cols} x={960 - ((cols - 1) * gap) / 2} y={250} r={30} gap={gap} at={0} fillAt={v === 0 ? 9999 : 99 - t + fillAt} />
      </Mv></Paper>
    );
  },
  why: say([{ s: "Why?", col: C.yellow, size: 420 }], { dark: true, m: 4 }),
  band: ({ t, d }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={2}>
      <At x={960} y={380} s={pop(t, 0)} r={6 * Math.sin(t / 5)}><div style={{ background: "#f2e6c9", border: `8px solid ${INK}`, borderRadius: "50%", padding: 44 }}><Gl kind="violin" s={300} /></div></At>
      <At x={960} y={700} s={pop(t, 5)}><T size={110} col="#fff">The band is playing</T></At>
    </Mv></Bg>
  ),
  drill: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <At x={960} y={420} s={pop(t, 0)} r={-2}>
        <div style={{ width: 1240, background: "#fffaf0", border: `10px solid ${INK}`, boxShadow: `0 16px 0 ${INK}`, padding: "36px 54px", textAlign: "center" }}>
          <T size={50} w={800} col={C.grey}>Notice</T>
          <T size={128} style={{ marginTop: 8 }}>Lifeboat drill</T>
          <T size={62} col={SEA} style={{ marginTop: 14 }}>Sunday morning, April 14</T>
        </div>
      </At>
      <Stamp text="Cancelled" t={t} at={Math.max(8, c(143, "cancelled") - 2)} x={960} y={440} size={190} r={-10} />
    </Mv></Paper>
  ),
  n472: ({ t, d, c }) => {
    const a = Math.max(2, c(146, "472") - 6);
    return (
      <Bg dark tone="#2a1418"><Mv t={t} d={d} m={4}>
        <Big n={fmt(count(t, a, a + 26, 0, 472))} label="seats go unused" t={t} at={0} x={960} y={420} size={400} col={C.yellow} lcol="#fff" />
      </Mv></Bg>
    );
  },
  phillipsdead: card("Jack Phillips", "1887 – 1912", "person", { col: C.red, m: 0 }),
  morning: say([{ s: "Nobody wakes him", size: 120, col: "#fff" }, { s: "until morning", col: C.yellow, size: 160, cue: [164, "until"] }], { dark: true, m: 0 }),

  // ---------------- ending ----------------
  t220: TimeCard("2:20", "AM", "April 15, 1912", { tone: "#2a1418" }),
  n700b: num("700", "survivors, about", { m: 4, col: SEA, size: 400 }),
  fewmore: ({ t, d, c }) => (
    <Bg dark tone={NIGHT}><Mv t={t} d={d} m={0}>
      <At x={690} y={400} s={pop(t, 0)}><T size={330} col="#fff" style={{ textShadow: "0 14px 0 #000" }}>700</T></At>
      <At x={1400} y={400} s={pop(t, Math.max(10, c(170, "few") - 4))}><T size={128} col={C.yellow} style={{ textShadow: "0 10px 0 #000" }}>+ a few</T></At>
      <At x={960} y={680} s={pop(t, 4)}><T size={64} col={C.gold}>The real night · your night</T></At>
    </Mv></Bg>
  ),
  notship: say([{ s: "Not the ship", size: 170 }, { s: "Not everyone", col: C.red, size: 170, cue: [171, "everyone"] }], { m: 5 }),
  ruleschange: say([{ s: "Afterward", size: 110 }, { s: "the rules change", col: SEA, size: 138, cue: [173, "rules"] }], { m: 0 }),
  rule: ({ t, d, v }) => {
    const [g, top, label] = [["boat", "Rule 1", "A lifeboat seat for everyone"], ["clock24", "Rule 2", "Radio watch around the clock"], ["berg", "Since 1914", "The International Ice Patrol"]][v] ?? ["boat", "", ""];
    return (
      <Paper><Mv t={t} d={d} m={v === 1 ? 3 : 2}>
        <Banner text={top} t={t} at={0} col={v === 2 ? SEA : INK} />
        <At x={960} y={400} s={pop(t, 0)}><Gl kind={g} s={320} /></At>
        <At x={960} y={690} s={pop(t, 5)}><T size={Math.min(84, 1640 / (label.length * 0.8))}>{label}</T></At>
      </Mv></Paper>
    );
  },
  title: ({ t, d, c }) => (
    <Dark tone={NIGHT}><Mv t={t} d={d} m={0}>
      <At x={960} y={220} s={pop(t, 0)}><T size={110} col="#fff" style={{ textShadow: "0 8px 0 #000" }}>What if you were</T></At>
      <At x={960} y={410} s={pop(t, Math.max(6, c(177, "only") - 2))}><T size={190} col={C.yellow} style={{ textShadow: "0 12px 0 #000" }}>the only one</T></At>
      <At x={960} y={610} s={pop(t, Math.max(12, c(177, "knew") - 2))}><T size={150} col="#fff" style={{ textShadow: "0 10px 0 #000" }}>who knew?</T></At>
    </Mv></Dark>
  ),
  knowing: say([{ s: "Knowing was never", size: 110, col: "#fff" }, { s: "the problem", col: C.yellow, size: 185, cue: [179, "problem"] }], { dark: true, m: 4 }),
  comments: ({ t, d, c }) => (
    <Paper><Mv t={t} d={d} m={0}>
      <At x={960} y={300} s={pop(t, 0)}><Gl kind="bubble" s={300} /></At>
      <At x={960} y={560} s={pop(t, 3)}><T size={84}>What would you have tried?</T></At>
      <At x={960} y={720} s={pop(t, Math.max(10, c(182, "Tell") - 2))}><Pill text="Tell me in the comments" col={C.red} fg="#fff" size={70} /></At>
    </Mv></Paper>
  ),
};

// ---------------- maps ----------------
const MSEA = "#a9c9d8", LAND = "#efe3c2";
const land = { fill: LAND, stroke: INK, strokeWidth: 8, strokeLinejoin: "round" as const };
const Label: React.FC<{ x: number; y: number; s: string; size?: number; col?: string }> = ({ x, y, s, size = 44, col = INK }) => <text x={x} y={y} fontFamily={FONT} fontWeight={900} fontSize={size} fill={col} textAnchor="middle" style={{ textTransform: "uppercase" }}>{s}</text>;
const Dot: React.FC<{ x: number; y: number; s: number; col?: string }> = ({ x, y, s, col = C.red }) => <g transform={`translate(${x} ${y}) scale(${s})`}><circle r={26} fill={col} stroke={INK} strokeWidth={8} /><circle r={8} fill="#fffaf0" /></g>;
const Route: React.FC<{ pts: [number, number][]; u: number }> = ({ pts, u }) => {
  const dd = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return <path d={dd} fill="none" stroke={C.red} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len}`} strokeDashoffset={len * (1 - clamp01(u))} />;
};
const SOTON: [number, number] = [1340, 566], CHER: [number, number] = [1318, 700], QUEEN: [number, number] = [1010, 512];
/** the Channel and the Irish Sea, close */
const NearMap: React.FC<G & { step: number }> = ({ t, d, c, step }) => (
  <AbsoluteFill style={{ background: MSEA }}><Mv t={t} d={d} m={step ? 3 : 0}>
    <Svg>
      <path d="M1180 60 L1420 40 L1520 200 L1480 380 L1560 480 L1500 560 L1300 580 L1140 600 L1200 480 L1150 400 L1230 300 L1160 200 Z" {...land} />
      <path d="M900 300 L1060 260 L1110 360 L1080 480 L960 530 L860 470 L850 380 Z" {...land} />
      <path d="M1180 712 L1330 700 L1390 730 L1560 690 L1700 650 L1920 630 L1920 1080 L1100 1080 L1150 900 L1080 790 Z" {...land} />
      <Label x={1360} y={300} s="England" col="#8a7a55" /><Label x={970} y={400} s="Ireland" col="#8a7a55" /><Label x={1560} y={860} s="France" col="#8a7a55" />
      {step ? <Route pts={[SOTON, CHER, [1180, 640], QUEEN]} u={(t - 2) / Math.max(20, d - 16)} /> : null}
      <Dot x={SOTON[0]} y={SOTON[1]} s={pop(t, step ? 0 : 4)} />
      {step ? <><Dot x={CHER[0]} y={CHER[1]} s={pop(t, Math.max(6, c(38, "France") - 2))} col={SEA} /><Dot x={QUEEN[0]} y={QUEEN[1]} s={pop(t, Math.max(12, c(38, "Ireland") - 2))} col={SEA} /></> : null}
    </Svg>
    <At x={SOTON[0] + 70} y={SOTON[1] - 78} s={pop(t, step ? 0 : 6)}><Pill text="Southampton" size={50} /></At>
    {step ? <><At x={CHER[0] + 210} y={CHER[1] + 60} s={pop(t, Math.max(6, c(38, "France") - 2))}><Pill text="Cherbourg" size={46} /></At><At x={QUEEN[0] - 60} y={QUEEN[1] + 86} s={pop(t, Math.max(12, c(38, "Ireland") - 2))}><Pill text="Queenstown" size={46} /></At></>
      : <At x={420} y={350} s={pop(t, 0)}><div style={{ background: C.red, border: `8px solid ${INK}`, borderRadius: 14, padding: "14px 40px", boxShadow: `0 10px 0 ${INK}` }}><T size={110} col="#fff">April 10</T><T size={60} col="#fff">1912</T></div></At>}
  </Mv></AbsoluteFill>
);
/** the North Atlantic, wide */
const FarMap: React.FC<G & { step: number }> = ({ t, d, c, step }) => {
  const u = step === 0 ? (t - 2) / Math.max(20, d - 10) : 1, sx = lerp(1486, 900, ease(clamp01(u)) * (step === 0 ? 1 : 0.86)), sy = lerp(268, 400, ease(clamp01(u)) * (step === 0 ? 1 : 0.86));
  return (
    <AbsoluteFill style={{ background: MSEA }}><Mv t={t} d={d} m={step ? 4 : 2}>
      <Svg>
        <path d="M0 0 L420 0 L470 120 L380 200 L430 300 L330 420 L300 560 L200 700 L160 1080 L0 1080 Z" {...land} />
        <path d="M430 250 L520 230 L545 310 L462 340 Z" {...land} />
        <path d="M1560 150 L1640 130 L1680 260 L1600 300 L1540 240 Z" {...land} /><path d="M1468 212 L1520 200 L1532 262 L1480 272 Z" {...land} />
        <path d="M1600 340 L1920 300 L1920 1080 L1560 1080 L1620 800 L1540 640 L1640 480 Z" {...land} />
        <Label x={180} y={360} s="America" col="#8a7a55" /><Label x={1760} y={560} s="Europe" col="#8a7a55" /><Label x={960} y={180} s="North Atlantic" size={56} col="#5d87a6" />
        <Route pts={[[1486, 268], [sx, sy]]} u={1} />
        <g transform={`translate(${sx - 60} ${sy - 76})`}><Gl kind="ship" s={120} /></g>
        {step === 0 ? <g opacity={clamp01((t - Math.max(8, c(39, "open") - 2)) / 8)}><path d="M860 400 L340 452" stroke={INK} strokeWidth={10} strokeDasharray="26 22" strokeLinecap="round" fill="none" /></g> : null}
        <Dot x={330} y={456} s={pop(t, 6)} col={SEA} />
      </Svg>
      <At x={330} y={530} s={pop(t, 6)}><Pill text="New York" size={44} /></At>
      {step === 1 ? <>
        <At x={1720} y={470} s={pop(t, Math.max(4, c(64, "key") - 2))} r={-14}><div style={{ background: "#fffaf0", border: `8px solid ${INK}`, borderRadius: "50%", padding: 22, boxShadow: `0 10px 0 ${INK}` }}><Gl kind="key" s={170} /></div></At>
        <Svg><path d={`M1600 470 Q1300 560 ${sx + 60} ${sy + 20}`} stroke={C.red} strokeWidth={12} strokeDasharray="22 22" strokeLinecap="round" fill="none" opacity={clamp01((t - 10) / 8)} /></Svg>
        <At x={1240} y={640} s={pop(t, 12)}><Pill text="hundreds of miles apart" col={C.yellow} size={48} /></At>
      </> : null}
    </Mv></AbsoluteFill>
  );
};
export const MapBoard: React.FC<G & { name: string }> = ({ name, ...g }) =>
  name === "soton" ? <NearMap {...g} step={0} /> : name === "stops" ? <NearMap {...g} step={1} /> : name === "west" ? <FarMap {...g} step={0} /> : <FarMap {...g} step={1} />;
void icons; void cueAt;
