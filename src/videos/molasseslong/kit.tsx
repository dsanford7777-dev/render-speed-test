// Shared look for the long-form 2D layer: paper boards, ink type, pops, stamps, name cards and a slow camera on
// every board (nothing sits still). Layout is 1920 x 1080; keep content above y = 800, the captions own the bottom.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

export const { fontFamily: FONT } = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });

export const C = {
  paper: "#f2e6c9", paper2: "#e8d7b0", ink: "#241726", red: "#c9373a", yellow: "#ffd84d", blue: "#2f5fb5",
  gold: "#e8c45a", mol: "#5a2a10", mol2: "#8a4a1c", green: "#3f7d4a", sea: "#9fc3d9", sea2: "#7aa8c7", land: "#e9dcb8", grey: "#8a8090",
};

/** what every board gets: t = frames since the shot started, d = shot length, c(seg, word) = a word's onset in shot frames */
export type G = { t: number; d: number; c: (seg: number, w: string) => number; v: number };

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
/** 0 -> 1 over `dur` frames from `at` */
export const k = (t: number, at: number, dur = 10) => clamp01((t - at) / dur);
/** pop-in scale with overshoot (0 before `at`) */
export const pop = (t: number, at: number, dur = 9) => {
  const u = clamp01((t - at) / dur);
  if (u <= 0) return 0;
  const s = 1.70158 * 1.4, x = u - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
};
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** count from a to b between frames t0 and t1 */
export const count = (t: number, t0: number, t1: number, a: number, b: number) => Math.round(lerp(a, b, easeOut((t - t0) / Math.max(1, t1 - t0))));
export const fmt = (n: number) => n.toLocaleString("en-US");

/** paper background with a soft vignette and fibre texture */
export const Paper: React.FC<{ tone?: string; children?: React.ReactNode }> = ({ tone = C.paper, children }) => (
  <AbsoluteFill style={{ background: tone }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 55%, rgba(60,30,10,0.28) 100%)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.16, mixBlendMode: "multiply" }}>
      <filter id="fib"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves={2} seed={4} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.9 0" /></filter>
      <rect width={1920} height={1080} filter="url(#fib)" />
    </svg>
    {children}
  </AbsoluteFill>
);

/** slow camera on a board: push in (or out) and drift over the shot */
export const Cam: React.FC<{ t: number; d: number; from?: number; to?: number; dx?: number; dy?: number; ox?: number; oy?: number; children: React.ReactNode }> =
  ({ t, d, from = 1.0, to = 1.06, dx = 0, dy = 0, ox = 50, oy = 42, children }) => {
    const u = ease(t / Math.max(1, d));
    return (
      <AbsoluteFill style={{ transform: `translate(${dx * u}px, ${dy * u}px) scale(${lerp(from, to, u)})`, transformOrigin: `${ox}% ${oy}%` }}>
        {children}
      </AbsoluteFill>
    );
  };

/** positioned box (px, from top-left of the 1920 x 1080 frame), with optional pop scale / fade */
export const At: React.FC<{ x: number; y: number; s?: number; o?: number; r?: number; center?: boolean; children: React.ReactNode; style?: React.CSSProperties }> =
  ({ x, y, s = 1, o = 1, r = 0, center = true, children, style }) => (
    <div style={{ position: "absolute", left: x, top: y, transform: `${center ? "translate(-50%, -50%) " : ""}rotate(${r}deg) scale(${s})`, opacity: o, transformOrigin: "center", ...style }}>{children}</div>
  );

export const T: React.FC<{ size?: number; w?: number; col?: string; children: React.ReactNode; style?: React.CSSProperties; up?: boolean }> =
  ({ size = 64, w = 900, col = C.ink, children, style, up = true }) => (
    <div style={{ fontFamily: FONT, fontWeight: w, fontSize: size, color: col, lineHeight: 1.05, textTransform: up ? "uppercase" : "none", whiteSpace: "nowrap", letterSpacing: 0.5, ...style }}>{children}</div>
  );

/** a heading banner across the top of a board */
export const Banner: React.FC<{ text: string; t: number; at?: number; col?: string; y?: number }> = ({ text, t, at = 0, col = C.red, y = 120 }) => {
  const s = pop(t, at, 10);
  return (
    <At x={960} y={y} s={s}>
      <div style={{ background: col, padding: "14px 44px", boxShadow: `0 8px 0 ${C.ink}`, border: `6px solid ${C.ink}`, borderRadius: 10 }}>
        <T size={58} col="#fff">{text}</T>
      </div>
    </At>
  );
};

/** rubber stamp that slams in */
export const Stamp: React.FC<{ text: string; t: number; at: number; x: number; y: number; r?: number; size?: number; col?: string; sub?: string }> =
  ({ text, t, at, x, y, r = -12, size = 120, col = C.red, sub }) => {
    if (t < at) return null;
    const u = clamp01((t - at) / 6), s = lerp(1.8, 1, easeOut(u)), o = clamp01((t - at) / 3);
    return (
      <At x={x} y={y} s={s} o={o * 0.95} r={r}>
        <div style={{ border: `${size / 10}px solid ${col}`, borderRadius: size / 6, padding: `${size / 10}px ${size / 3}px`, textAlign: "center", background: "rgba(242,230,201,0.55)" }}>
          <T size={size} col={col}>{text}</T>
          {sub ? <T size={size * 0.32} col={col} style={{ marginTop: 6 }}>{sub}</T> : null}
        </div>
      </At>
    );
  };

/** name card: big name, role underneath, a coloured edge */
export const NameCard: React.FC<{ name: string; role: string; t: number; at?: number; roleAt?: number; x?: number; y?: number; col?: string; icon?: React.ReactNode; extra?: string; extraAt?: number }> =
  ({ name, role, t, at = 0, roleAt, x = 960, y = 420, col = C.blue, icon, extra, extraAt }) => {
    const s = pop(t, at, 10), r = clamp01((t - (roleAt ?? at + 6)) / 8), e = extraAt === undefined ? 0 : clamp01((t - extraAt) / 8);
    return (
      <At x={x} y={y} s={s}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, background: "#fffaf0", border: `8px solid ${C.ink}`, borderLeft: `40px solid ${col}`, borderRadius: 18, padding: "40px 64px", boxShadow: `0 14px 0 ${C.ink}` }}>
          {icon}
          <div>
            <T size={104}>{name}</T>
            <div style={{ opacity: r, transform: `translateY(${(1 - r) * 20}px)` }}><T size={54} w={800} col={col}>{role}</T></div>
            {extra ? <div style={{ opacity: e, marginTop: 10 }}><T size={40} w={700} col={C.grey} up={false}>{extra}</T></div> : null}
          </div>
        </div>
      </At>
    );
  };

/** a ✓ / ✗ checklist row */
export const Row: React.FC<{ text: string; t: number; at: number; mark?: "x" | "check" | null; markAt?: number; size?: number; strike?: boolean }> =
  ({ text, t, at, mark = null, markAt, size = 64, strike = false }) => {
    const o = clamp01((t - at) / 7), m = markAt === undefined ? 0 : pop(t, markAt, 8), st = markAt === undefined ? 0 : clamp01((t - markAt) / 6);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: o, transform: `translateX(${(1 - o) * -40}px)`, margin: "16px 0" }}>
        <div style={{ width: size * 1.15, height: size * 1.15, border: `7px solid ${C.ink}`, borderRadius: 12, background: "#fffaf0", position: "relative", flex: "none" }}>
          {mark ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${m})` }}>
            <T size={size * 1.25} col={mark === "x" ? C.red : C.green}>{mark === "x" ? "✗" : "✓"}</T></div> : null}
        </div>
        <div style={{ position: "relative" }}>
          <T size={size}>{text}</T>
          {strike ? <div style={{ position: "absolute", left: -8, top: "50%", height: 10, background: C.red, width: `${st * 104}%`, borderRadius: 5 }} /> : null}
        </div>
      </div>
    );
  };

/** big number with a label under it */
export const Big: React.FC<{ n: string; label?: string; t: number; at: number; x: number; y: number; size?: number; col?: string; lcol?: string }> =
  ({ n, label, t, at, x, y, size = 220, col = C.red, lcol = C.ink }) => (
    <At x={x} y={y} s={pop(t, at, 10)}>
      <div style={{ textAlign: "center" }}>
        <T size={size} col={col} style={{ textShadow: `0 ${size / 22}px 0 ${C.ink}` }}>{n}</T>
        {label ? <T size={size * 0.26} col={lcol} style={{ marginTop: 8 }}>{label}</T> : null}
      </div>
    </At>
  );

/** simple icon glyphs drawn in SVG, sized by `s` (px) */
export const Icon: React.FC<{ kind: string; s?: number; col?: string }> = ({ kind, s = 160, col = C.ink }) => {
  const st = { fill: "none", stroke: C.ink, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const body = (() => {
    switch (kind) {
      case "barrel": return <><ellipse cx={50} cy={20} rx={30} ry={10} fill={C.mol2} {...st} /><path d="M20 20 Q14 50 20 82 Q50 94 80 82 Q86 50 80 20" fill={C.mol} {...st} /><path d="M18 42 Q50 52 82 42 M18 62 Q50 72 82 62" {...st} /></>;
      case "shell": return <><path d="M38 90 L38 40 Q50 6 62 40 L62 90 Z" fill={C.gold} {...st} /><path d="M34 90 L66 90" {...st} /><path d="M38 70 L62 70" {...st} /></>;
      case "flask": return <><path d="M40 10 L40 40 L18 84 Q16 92 26 92 L74 92 Q84 92 82 84 L60 40 L60 10" fill="#cfe8f0" {...st} /><path d="M24 74 L76 74 L82 86 Q82 92 74 92 L26 92 Q18 92 18 86 Z" fill={C.blue} /><path d="M34 10 L66 10" {...st} /></>;
      case "ship": return <><path d="M8 62 L92 62 L80 86 L20 86 Z" fill={C.red} {...st} /><path d="M30 62 L30 36 L62 36 L62 62" fill="#fff" {...st} /><path d="M70 62 L70 26" {...st} /><path d="M40 36 L40 22 L50 22 L50 36" fill={C.ink} {...st} /></>;
      case "tank": return <><rect x={14} y={18} width={72} height={70} rx={6} fill={C.grey} {...st} /><ellipse cx={50} cy={18} rx={36} ry={9} fill="#a89fae" {...st} /><path d="M14 46 L86 46 M14 70 L86 70" {...st} /></>;
      case "factory": return <><path d="M8 90 L8 50 L30 38 L30 50 L52 38 L52 50 L74 38 L74 90 Z" fill="#c9b48a" {...st} /><rect x={78} y={18} width={12} height={72} fill={C.red} {...st} /><path d="M8 90 L92 90" {...st} /></>;
      case "family": return <><circle cx={32} cy={26} r={11} fill="#f5c9a0" {...st} /><path d="M16 88 L18 52 Q32 40 46 52 L48 88 Z" fill={C.blue} {...st} /><circle cx={70} cy={44} r={9} fill="#f5c9a0" {...st} /><path d="M58 88 L60 64 Q70 56 80 64 L82 88 Z" fill={C.red} {...st} /></>;
      case "worker": return <><circle cx={50} cy={28} r={13} fill="#f5c9a0" {...st} /><path d="M34 22 Q50 6 66 22 Z" fill={C.ink} {...st} /><path d="M28 92 L30 54 Q50 40 70 54 L72 92 Z" fill="#5d7a3a" {...st} /></>;
      case "horse": return <><path d="M14 54 Q20 38 48 40 L66 40 L76 22 L90 30 L84 44 L76 46 L74 62 L70 90 M24 56 L22 90 M38 60 L40 90 M62 62 L58 90" fill="none" {...st} /><path d="M14 54 Q20 38 48 40 L66 40 L74 62 Q50 70 24 62 Z" fill="#8a5a3a" stroke="none" /></>;
      case "warehouse": return <><path d="M8 90 L8 40 L50 14 L92 40 L92 90 Z" fill="#b5866a" {...st} /><rect x={34} y={54} width={32} height={36} fill={C.ink} /></>;
      case "firehouse": return <><rect x={14} y={30} width={72} height={60} fill={C.red} {...st} /><rect x={30} y={52} width={40} height={38} fill="#f6efdc" {...st} /><path d="M10 30 L90 30" {...st} /><rect x={38} y={12} width={24} height={18} fill={C.red} {...st} /></>;
      case "swing": return <><path d="M14 90 L30 14 L70 14 L86 90 M30 14 L70 14" {...st} /><path d="M44 14 L44 62 M58 14 L58 62 M40 62 L62 62" {...st} /></>;
      case "subway": return <><rect x={14} y={20} width={72} height={58} rx={12} fill={C.yellow} {...st} /><rect x={24} y={30} width={22} height={18} fill="#cfe8f0" {...st} /><rect x={54} y={30} width={22} height={18} fill="#cfe8f0" {...st} /><path d="M28 78 L20 92 M72 78 L80 92" {...st} /></>;
      case "streetcar": return <><rect x={8} y={30} width={84} height={46} rx={8} fill={C.green} {...st} /><path d="M20 30 L50 8 M50 8 L56 8" {...st} /><rect x={18} y={40} width={16} height={14} fill="#cfe8f0" {...st} /><rect x={42} y={40} width={16} height={14} fill="#cfe8f0" {...st} /><rect x={66} y={40} width={16} height={14} fill="#cfe8f0" {...st} /><circle cx={28} cy={84} r={7} fill={C.ink} /><circle cx={72} cy={84} r={7} fill={C.ink} /></>;
      case "phone": return <><rect x={28} y={10} width={44} height={80} rx={6} fill="#3a3a48" {...st} /><circle cx={50} cy={42} r={14} fill="#c9c2b0" {...st} /><path d="M36 70 Q50 80 64 70" {...st} /></>;
      case "home": return <><path d="M14 90 L14 46 L50 16 L86 46 L86 90 Z" fill="#e0b46a" {...st} /><rect x={40} y={60} width={20} height={30} fill={C.ink} /></>;
      case "doc": return <><path d="M20 8 L66 8 L82 24 L82 92 L20 92 Z" fill="#fffaf0" {...st} /><path d="M32 36 L70 36 M32 52 L70 52 M32 68 L58 68" {...st} /></>;
      case "map": return <><path d="M10 20 L36 10 L64 20 L90 10 L90 82 L64 92 L36 82 L10 92 Z" fill={C.land} {...st} /><path d="M36 10 L36 82 M64 20 L64 92" {...st} /></>;
      case "cloud": return <><path d="M22 70 Q6 70 10 54 Q12 40 28 42 Q32 22 52 26 Q70 18 76 40 Q94 42 90 58 Q88 70 74 70 Z" fill="#dfe8f0" {...st} /><path d="M30 80 L26 92 M50 80 L46 92 M70 80 L66 92" {...st} /></>;
      case "model": return <><rect x={10} y={66} width={80} height={14} fill="#b5866a" {...st} /><rect x={36} y={30} width={28} height={36} fill={C.grey} {...st} /><ellipse cx={50} cy={30} rx={14} ry={4} fill="#a89fae" {...st} /></>;
      case "envelope": return <><rect x={8} y={24} width={84} height={56} fill="#fffaf0" {...st} /><path d="M8 24 L50 58 L92 24" {...st} /></>;
      case "bomb": return <><circle cx={46} cy={58} r={30} fill={C.ink} {...st} /><path d="M62 32 L70 22 Q78 14 86 18" {...st} /><path d="M86 10 L88 18 M94 16 L88 20 M90 26 L86 22" stroke={C.red} strokeWidth={6} strokeLinecap="round" /></>;
      case "person": return <><circle cx={50} cy={26} r={14} fill={col === C.ink ? "#f5c9a0" : col} {...st} /><path d="M26 92 L30 56 Q50 40 70 56 L74 92 Z" fill={col === C.ink ? C.blue : col} {...st} /></>;
      case "gear": return <><circle cx={50} cy={50} r={22} fill={C.grey} {...st} /><circle cx={50} cy={50} r={8} fill="#fffaf0" {...st} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={45} y={14} width={10} height={14} fill={C.grey} {...st} transform={`rotate(${i * 45} 50 50)`} />)}</>;
      case "boom": return <><path d="M50 6 L60 34 L90 26 L70 50 L94 70 L62 70 L58 94 L46 72 L18 88 L32 60 L6 44 L36 40 Z" fill={C.yellow} {...st} /></>;
      case "nurse": return <><circle cx={50} cy={30} r={13} fill="#f5c9a0" {...st} /><path d="M34 20 L66 20 L62 12 L38 12 Z" fill="#fff" {...st} /><path d="M28 92 L30 56 Q50 42 70 56 L72 92 Z" fill="#fff" {...st} /><path d="M50 60 L50 80 M40 70 L60 70" stroke={C.red} strokeWidth={7} /></>;
      case "police": return <><circle cx={50} cy={32} r={13} fill="#f5c9a0" {...st} /><path d="M32 22 L68 22 L64 10 L36 10 Z" fill="#1f3f8f" {...st} /><path d="M28 92 L30 56 Q50 42 70 56 L72 92 Z" fill="#1f3f8f" {...st} /><circle cx={42} cy={64} r={4} fill={C.gold} /></>;
      case "helmet": return <><circle cx={50} cy={36} r={13} fill="#f5c9a0" {...st} /><path d="M30 30 Q50 6 70 30 L76 34 L24 34 Z" fill={C.red} {...st} /><path d="M28 92 L30 58 Q50 44 70 58 L72 92 Z" fill="#3a3a48" {...st} /></>;
      default: return <circle cx={50} cy={50} r={40} fill={col} {...st} />;
    }
  })();
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>{body}</svg>;
};

/** stylised Boston waterfront map used by several boards (1920 x 1080 space) */
export const BostonMap: React.FC<{ children?: React.ReactNode; dim?: number }> = ({ children, dim = 0 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute" }}>
    <rect width={1920} height={1080} fill={C.sea} />
    <path d="M0 0 L1920 0 L1920 140 Q1700 170 1560 260 Q1460 330 1430 420 Q1400 520 1300 560 Q1200 600 1180 700 Q1160 800 1060 860 L900 1080 L0 1080 Z" fill={C.land} stroke={C.ink} strokeWidth={8} />
    <path d="M900 330 Q1010 300 1120 340 Q1230 380 1240 470 Q1250 560 1150 590 Q1040 620 960 560 Q880 500 880 420 Z" fill="#efe2bf" stroke={C.ink} strokeWidth={6} />
    {[[700, 200, 820, 900], [400, 300, 1100, 300], [300, 620, 1150, 620], [560, 80, 600, 1000], [200, 450, 900, 450]].map(([a, b, c, d], i) =>
      <path key={i} d={`M${a} ${b} L${c} ${d}`} stroke="#d4c49c" strokeWidth={18} strokeLinecap="round" />)}
    <path d="M1000 330 Q1170 360 1236 470 Q1250 540 1170 590" fill="none" stroke="#c9b48a" strokeWidth={22} strokeLinecap="round" />
    <text x={880} y={410} fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.ink} opacity={0.75}>NORTH END</text>
    <text x={1500} y={700} fontFamily={FONT} fontWeight={900} fontSize={52} fill="#5d87a6" letterSpacing={6}>BOSTON HARBOR</text>
    {dim ? <rect width={1920} height={1080} fill="#f2e6c9" opacity={dim} /> : null}
    {children}
  </svg>
);
/** tank position on BostonMap */
export const MAP_TANK = { x: 1218, y: 500 };

/** stylised outline of the continental US in a 1000 x 600 box */
export const US_PATH = "M80 60 L300 70 L520 92 L598 112 L640 150 L700 122 L760 140 L840 104 L890 70 L934 108 L884 168 L852 232 L818 300 L800 360 L834 452 L812 520 L770 472 L738 404 L650 420 L560 432 L500 482 L440 430 L410 520 L360 470 L330 420 L222 402 L150 380 L92 300 L60 200 L70 120 Z";
