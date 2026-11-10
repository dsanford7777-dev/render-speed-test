// The Pig War long-form's 2D boards. Each takes G (t = frame in shot, d = shot length, c(seg, word) = a word's onset in
// shot frames, v = variant) and builds on the narration's words. Content stays above y = 800 (captions below).
// Every narrated number gets a big callout (Nov 9 pacing rules). Maps live in maps.tsx.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, G, FONT, Paper, Cam, At, T, Banner, Stamp, NameCard, Row, Big, Icon, k, pop, ease, easeOut, lerp, clamp01, count, fmt } from "./kit";
import { PORTRAITS } from "./portraits";

const Dark: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = "#141a2a" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #2c3550 0%, ${tone} 75%)` }}>{children}</AbsoluteFill>
);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>{children}</svg>;
const st = { fill: "none", stroke: C.ink, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** extra glyphs for this story (100 x 100 box) */
const Glyph: React.FC<{ kind: string; s?: number }> = ({ kind, s = 160 }) => {
  const body = (() => {
    switch (kind) {
      case "pig": return <><ellipse cx={50} cy={56} rx={36} ry={24} fill="#f3a7b5" {...st} /><circle cx={80} cy={46} r={14} fill="#f3a7b5" {...st} /><ellipse cx={90} cy={50} rx={6} ry={5} fill="#e88a9c" {...st} /><path d="M70 34 L74 24 L80 34" fill="#f3a7b5" {...st} /><circle cx={80} cy={42} r={2.5} fill={C.ink} /><path d="M28 76 L28 90 M44 78 L44 90 M60 78 L60 90 M72 74 L72 90" {...st} /><path d="M14 52 Q6 46 12 40" {...st} /></>;
      case "blackpig": return <><ellipse cx={50} cy={56} rx={36} ry={24} fill="#3a3038" {...st} /><circle cx={80} cy={46} r={14} fill="#3a3038" {...st} /><ellipse cx={90} cy={50} rx={6} ry={5} fill="#d98a9a" {...st} /><path d="M70 34 L74 24 L80 34" fill="#3a3038" {...st} /><circle cx={80} cy={42} r={2.5} fill="#fff" /><path d="M28 76 L28 90 M44 78 L44 90 M60 78 L60 90 M72 74 L72 90" {...st} /><path d="M14 52 Q6 46 12 40" {...st} /></>;
      case "sheep": return <><path d="M22 56 Q14 40 30 34 Q34 20 50 26 Q64 18 72 32 Q88 34 84 50 Q90 66 74 70 L26 70 Q12 68 22 56 Z" fill="#fbf7ee" {...st} /><ellipse cx={84} cy={52} rx={9} ry={11} fill="#3a3038" {...st} /><path d="M34 70 L34 88 M66 70 L66 88" {...st} /></>;
      case "potato": return <><path d="M20 52 Q18 30 44 26 Q74 20 82 44 Q88 70 60 76 Q26 82 20 52 Z" fill="#c9a26a" {...st} /><circle cx={40} cy={44} r={3} fill={C.ink} /><circle cx={62} cy={40} r={3} fill={C.ink} /><circle cx={56} cy={60} r={3} fill={C.ink} /></>;
      case "cannon": return <><path d="M14 42 L76 26 L80 40 L18 58 Z" fill="#3a3a48" {...st} /><circle cx={34} cy={68} r={18} fill="#8a5a3a" {...st} /><circle cx={34} cy={68} r={5} fill={C.ink} /></>;
      case "crown": return <><path d="M14 78 L18 34 L36 54 L50 24 L64 54 L82 34 L86 78 Z" fill={C.gold} {...st} /><path d="M14 78 L86 78" {...st} /></>;
      case "eagle": return <><path d="M50 30 Q40 20 30 26 Q18 32 8 30 Q20 46 34 48 L40 70 L50 62 L60 70 L66 48 Q80 46 92 30 Q82 32 70 26 Q60 20 50 30 Z" fill="#6b4a2f" {...st} /><circle cx={50} cy={30} r={9} fill="#fbf7ee" {...st} /></>;
      case "scroll": return <><rect x={22} y={14} width={56} height={72} fill="#fffaf0" {...st} /><path d="M16 14 Q22 4 28 14 M72 86 Q78 96 84 86" {...st} /><path d="M32 34 L68 34 M32 48 L68 48 M32 62 L56 62" {...st} /></>;
      case "letter": return <><rect x={10} y={24} width={80} height={54} fill="#fffaf0" {...st} /><path d="M10 24 L50 56 L90 24" {...st} /></>;
      case "ship": return <><path d="M10 66 L90 66 L78 86 L22 86 Z" fill="#6b4a2f" {...st} /><path d="M50 66 L50 12" {...st} /><path d="M50 16 L80 56 L50 56 Z" fill="#fffaf0" {...st} /><path d="M50 22 L24 56 L50 56 Z" fill="#fffaf0" {...st} /></>;
      case "gun": return <><path d="M8 50 L70 42 L72 52 L40 58 L34 74 L22 74 L26 58 L8 58 Z" fill="#6b4a2f" {...st} /><path d="M70 44 L94 40" {...st} /></>;
      case "flagUS": return <><path d="M20 90 L20 10" {...st} /><rect x={20} y={12} width={66} height={42} fill="#fffaf0" {...st} />{[0, 1, 2].map((i) => <rect key={i} x={20} y={16 + i * 14} width={66} height={7} fill={C.red} />)}<rect x={20} y={12} width={28} height={22} fill={C.blue} /><rect x={20} y={12} width={66} height={42} {...st} /></>;
      case "flagUK": return <><path d="M20 90 L20 10" {...st} /><rect x={20} y={12} width={66} height={42} fill={C.blue} {...st} /><path d="M20 12 L86 54 M86 12 L20 54" stroke="#fff" strokeWidth={9} /><path d="M53 12 L53 54 M20 33 L86 33" stroke="#fff" strokeWidth={13} /><path d="M53 12 L53 54 M20 33 L86 33" stroke={C.red} strokeWidth={7} /><rect x={20} y={12} width={66} height={42} {...st} /></>;
      case "cake": return <><rect x={18} y={50} width={64} height={36} fill="#f3a7b5" {...st} /><path d="M18 62 Q34 70 50 62 Q66 54 82 62" {...st} /><path d="M34 50 L34 34 M50 50 L50 30 M66 50 L66 34" {...st} /><path d="M34 26 L34 30 M50 22 L50 26 M66 26 L66 30" stroke={C.yellow} strokeWidth={8} strokeLinecap="round" /></>;
      case "tree": return <><path d="M50 8 L80 60 L62 60 L84 84 L16 84 L38 60 L20 60 Z" fill={C.green} {...st} /><rect x={44} y={84} width={12} height={10} fill="#6b4a2f" /></>;
      case "picnic": return <><path d="M10 50 L90 50 L84 60 L16 60 Z" fill={C.red} {...st} /><path d="M24 60 L18 90 M76 60 L82 90" {...st} /><path d="M30 50 Q30 36 42 36 Q54 36 54 50" fill="#c9a26a" {...st} /><rect x={62} y={30} width={14} height={20} fill="#cfe8f0" {...st} /></>;
      case "horse": return <><path d="M14 54 Q20 38 48 40 L66 40 L76 22 L90 30 L84 44 L76 46 L74 62 L70 90 M24 56 L22 90 M38 60 L40 90 M62 62 L58 90" fill="none" {...st} /><path d="M14 54 Q20 38 48 40 L66 40 L74 62 Q50 70 24 62 Z" fill="#8a5a3a" stroke="none" /></>;
      case "cup": return <><path d="M26 30 L74 30 L68 86 L32 86 Z" fill="#e8c45a" {...st} /><path d="M26 42 L74 42" stroke="#fffaf0" strokeWidth={6} /></>;
      case "handshake": return <><path d="M6 44 L30 34 L52 44 L70 36 L94 46 L94 64 L72 70 L56 82 Q48 86 42 80 L22 66 L6 64 Z" fill="#f5c9a0" {...st} /><path d="M52 44 L40 56 Q46 62 54 56 L64 50" {...st} /></>;
      case "court": return <><path d="M10 34 L50 12 L90 34 Z" fill="#e9dcb8" {...st} /><path d="M20 40 L20 78 M40 40 L40 78 M60 40 L60 78 M80 40 L80 78" {...st} /><path d="M10 84 L90 84" {...st} /></>;
      case "expert": return <><circle cx={50} cy={28} r={14} fill="#f5c9a0" {...st} /><path d="M38 28 L62 28" stroke={C.ink} strokeWidth={4} /><circle cx={44} cy={28} r={5} fill="none" stroke={C.ink} strokeWidth={4} /><circle cx={56} cy={28} r={5} fill="none" stroke={C.ink} strokeWidth={4} /><path d="M26 92 L30 56 Q50 40 70 56 L74 92 Z" fill="#2b3a63" {...st} /></>;
      case "capitol": return <><path d="M20 84 L80 84 L80 60 L20 60 Z" fill="#fbf7ee" {...st} /><path d="M30 60 Q30 34 50 30 Q70 34 70 60" fill="#fbf7ee" {...st} /><path d="M50 30 L50 16" {...st} /><path d="M28 66 L28 84 M40 66 L40 84 M60 66 L60 84 M72 66 L72 84" {...st} /></>;
      case "bigben": return <><rect x={36} y={26} width={28} height={64} fill="#d9c08a" {...st} /><path d="M36 26 L50 6 L64 26" fill="#d9c08a" {...st} /><circle cx={50} cy={40} r={9} fill="#fffaf0" {...st} /></>;
      default: return <Icon kind={kind} s={s} />;
    }
  })();
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>{body}</svg>;
};

/** a framed archive portrait (public domain, see portraits.ts) or a drawn stand-in */
const Portrait: React.FC<{ who: string; s?: number }> = ({ who, s = 300 }) => {
  const p = PORTRAITS[who];
  return (
    <div style={{ width: s, height: s * 1.25, border: `8px solid ${C.ink}`, borderRadius: 14, overflow: "hidden", background: "#d9cfb8", flex: "none", position: "relative" }}>
      {p ? <Img src={staticFile(p.file)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "50% 25%", transform: `scale(${p.zoom ?? 1})`, transformOrigin: p.pos ?? "50% 25%", filter: "sepia(0.4) contrast(1.05)" }} />
        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}><Icon kind="person" s={s * 0.7} /></div>}
    </div>
  );
};
const Person: React.FC<{ t: number; d: number; who: string; name: string; role: string; col?: string; c?: number; extra?: string; extraAt?: number; stamp?: string; stampAt?: number }> =
  ({ t, d, who, name, role, col = C.blue, c = 0, extra, extraAt, stamp, stampAt }) => (
    <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
      <NameCard name={name} role={role} t={t} at={c} x={960} y={420} col={col} icon={<Portrait who={who} s={250} />} extra={extra} extraAt={extraAt} />
      {stamp ? <Stamp text={stamp} t={t} at={stampAt ?? 10} x={1420} y={650} size={96} /> : null}
    </Cam></Paper>
  );
const Pill: React.FC<{ text: string; col?: string; fg?: string; size?: number }> = ({ text, col = "#fffaf0", fg = C.ink, size = 44 }) => (
  <div style={{ background: col, border: `6px solid ${C.ink}`, borderRadius: 14, padding: "10px 30px", boxShadow: `0 8px 0 ${C.ink}` }}><T size={size} col={fg}>{text}</T></div>
);
const Bubble: React.FC<{ who: string; text: string; side: "l" | "r"; s: number; col?: string }> = ({ who, text, side, s, col = "#fffaf0" }) => (
  <div style={{ transform: `scale(${s})`, transformOrigin: side === "l" ? "0% 100%" : "100% 100%", maxWidth: 900 }}>
    <T size={34} col={C.grey} style={{ marginBottom: 8, textAlign: side === "l" ? "left" : "right" }}>{who}</T>
    <div style={{ background: col, border: `7px solid ${C.ink}`, borderRadius: 30, padding: "26px 40px", boxShadow: `0 10px 0 ${C.ink}` }}>
      <T size={56} up={false} style={{ whiteSpace: "normal", lineHeight: 1.15 }}>{text}</T>
    </div>
  </div>
);
const Doc: React.FC<{ children: React.ReactNode; w?: number; r?: number }> = ({ children, w = 1240, r = -1.5 }) => (
  <div style={{ width: w, background: "#f6ecd2", border: `6px solid ${C.ink}`, padding: "44px 64px", boxShadow: "0 30px 60px rgba(0,0,0,0.35)", transform: `rotate(${r}deg)` }}>{children}</div>
);
const Serif: React.FC<{ size: number; children: React.ReactNode; col?: string; style?: React.CSSProperties }> = ({ size, children, col = C.ink, style }) => (
  <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: size, color: col, lineHeight: 1.25, ...style }}>{children}</div>
);
const VS: React.FC<{ t: number; at: number; l: React.ReactNode; r: React.ReactNode; mid?: string }> = ({ t, at, l, r, mid = "VS" }) => (
  <div style={{ position: "absolute", top: 220, width: 1920, display: "flex", justifyContent: "center", alignItems: "center", gap: 70 }}>
    <div style={{ transform: `scale(${pop(t, at, 10)})` }}>{l}</div>
    <div style={{ transform: `scale(${pop(t, at + 6, 10)})` }}><T size={110} col={C.red} style={{ textShadow: `0 8px 0 ${C.ink}` }}>{mid}</T></div>
    <div style={{ transform: `scale(${pop(t, at + 10, 10)})` }}>{r}</div>
  </div>
);
const shake = (t: number, at: number, amp = 14) => { const u = t - at; return u >= 0 && u < 12 ? amp * (1 - u / 12) * Math.sin(u * 2.6) : 0; };

// ---------------- cold open ----------------
const men2000: React.FC<G> = ({ t, d, c }) => (
  <Dark><Cam t={t} d={d} from={1.1} to={1.0}>
    <At x={960} y={260} s={pop(t, 0, 8)}><Glyph kind="ship" s={220} /></At>
    <Big n={fmt(count(t, 0, 16, 0, 2000)) + "+"} label="British troops offshore" t={t} at={0} x={960} y={560} size={260} col="#ff6b6b" lcol="#f6efdc" />
  </Cam></Dark>
);
const versus: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.08}>
    <VS t={t} at={0} l={<div style={{ textAlign: "center" }}><Glyph kind="flagUS" s={300} /><T size={58}>United States</T></div>}
      r={<div style={{ textAlign: "center" }}><Glyph kind="flagUK" s={300} /><T size={58}>British Empire</T></div>} />
    <Stamp text="WAR?" t={t} at={c(4, "war") - 2} x={960} y={720} size={110} />
  </Cam></Paper>
);
const title: React.FC<G> = ({ t, d }) => (
  <Dark tone="#0e1220"><Cam t={t} d={d} from={1.0} to={1.08}>
    <At x={960} y={250} s={pop(t, 2, 12)}><Glyph kind="blackpig" s={260} /></At>
    <At x={960} y={470} s={pop(t, 6, 12)}><T size={84} col="#f6efdc" style={{ letterSpacing: 22 }}>The</T></At>
    <At x={960} y={590} s={pop(t, 9, 12)}><T size={190} col={C.yellow} style={{ textShadow: `0 14px 0 #000` }}>Pig War</T></At>
    <At x={960} y={730} o={k(t, 18, 14)}><T size={46} w={800} col="#cfd6e8" style={{ letterSpacing: 10 }}>San Juan Island · 1859</T></At>
  </Cam></Dark>
);
const years13: React.FC<G> = ({ t, d, c }) => {
  const y = count(t, 2, Math.max(12, d - 6), 1859, 1872);
  return (
    <Paper><Cam t={t} d={d} from={1.08} to={1.0}>
      <Big n={String(y)} t={t} at={0} x={960} y={380} size={260} col={C.ink} />
      <At x={960} y={640} s={pop(t, c(7, "13") - 2, 10)}><Pill text="13 years" col={C.red} fg="#fff" size={70} /></At>
    </Cam></Paper>
  );
};
const cast3: React.FC<G> = ({ t, d, c }) => {
  const items: [string, string, string][] = [["crown", "2 empires", "2"], ["person", "a future Confederate general", "Confederate"], ["eagle", "a German emperor", "German"]];
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
      <div style={{ position: "absolute", top: 180, width: 1920, display: "flex", justifyContent: "center", gap: 90 }}>
        {items.map(([g, l, w]) => (
          <div key={l} style={{ transform: `scale(${pop(t, c(8, w) - 4, 10)})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: 460 }}>
            <div style={{ background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 30, padding: 26, boxShadow: `0 10px 0 ${C.ink}` }}><Glyph kind={g} s={190} /></div>
            <T size={46} style={{ whiteSpace: "normal", textAlign: "center" }}>{l}</T>
          </div>))}
      </div>
    </Cam></Paper>
  );
};
const zeroshots: React.FC<G> = ({ t, d, c, v }) => (
  <Dark><Cam t={t} d={d} from={v ? 1.12 : 1.0} to={v ? 1.0 : 1.08}>
    <At x={960 + (v ? shake(t, c(11, "Almost") - 2) : 0)} y={360} s={pop(t, v ? 0 : c(9, "nobody") - 4, 10)}>
      <div style={{ textAlign: "center" }}>
        <T size={70} col="#cfd6e8" style={{ letterSpacing: 12 }}>Shots fired at people</T>
        <T size={300} col={C.yellow} style={{ textShadow: `0 16px 0 #000` }}>0</T>
      </div>
    </At>
    {v ? <At x={1400} y={650} s={pop(t, c(11, "Almost") - 2, 9)} r={-10}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Glyph kind="blackpig" s={200} /><T size={80} col="#ff6b6b">…almost</T></div></At> : null}
  </Cam></Dark>
);

// ---------------- chapter 1: the treaty ----------------
const back13: React.FC<G> = ({ t, d, c }) => {
  const y = Math.round(lerp(1859, 1846, easeOut(k(t, 6, Math.max(14, d - 16)))));
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.08}>
      <Big n={String(y)} t={t} at={0} x={960} y={380} size={260} col={y === 1846 ? C.red : C.ink} />
      <At x={960} y={640} s={pop(t, c(12, "13") - 2, 10)}><Pill text="13 years earlier" /></At>
    </Cam></Paper>
  );
};
const treaty: React.FC<G> = ({ t, d }) => (
  <Dark><Cam t={t} d={d} from={1.14} to={1.0}>
    <At x={960} y={420} s={pop(t, 0, 10)}><Doc w={1000}>
      <Serif size={60} style={{ textAlign: "center", fontWeight: 700 }}>Treaty</Serif>
      <Serif size={34} style={{ textAlign: "center", marginTop: 6 }}>establishing the boundary west of the Rocky Mountains</Serif>
      <div style={{ marginTop: 26 }}>{[0, 1, 2, 3, 4].map((j) => <div key={j} style={{ height: 12, background: "rgba(36,23,38,0.3)", margin: "16px 0", width: `${96 - (j % 3) * 10}%` }} />)}</div>
      <Serif size={34} style={{ textAlign: "right", fontStyle: "italic" }}>June 15, 1846</Serif>
    </Doc></At>
  </Cam></Dark>
);
const quote: React.FC<G> = ({ t, d, c, v }) => {
  const circ = v === 0 ? 0 : easeOut(k(t, 0, 14));
  return (
    <Paper><Cam t={t} d={d} from={v ? 1.18 : 1.0} to={v ? 1.25 : 1.06} oy={45}>
      <At x={960} y={400} s={v ? 1 : pop(t, 0, 10)}><Doc w={1420} r={0}>
        <Serif size={60}>“…to the middle of <span style={{ position: "relative", display: "inline-block" }}><b>the channel</b>
          <svg width={360} height={120} style={{ position: "absolute", left: -30, top: -20, overflow: "visible" }}><ellipse cx={170} cy={45} rx={175} ry={56} fill="none" stroke={C.red} strokeWidth={8} pathLength={1} strokeDasharray={`${circ} 1`} /></svg>
        </span> which separates the continent from Vancouver's Island…”</Serif>
      </Doc></At>
      {v === 0 ? null : <Stamp text="SINGULAR" t={t} at={c(22, "Singular") - 2} x={1300} y={680} size={110} />}
      {v === 0 ? null : <At x={600} y={680} s={pop(t, 4, 10)}><Pill text="ONE channel" col={C.yellow} size={56} /></At>}
    </Cam></Paper>
  );
};
const samesentence: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <At x={960} y={180} s={pop(t, 0, 10)}><Pill text="“the middle of the channel”" size={56} /></At>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <path d="M960 230 L560 420" stroke={C.blue} strokeWidth={10} pathLength={1} strokeDasharray={`${easeOut(k(t, c(31, "both") - 4, 14))} 1`} />
      <path d="M960 230 L1360 420" stroke={C.red} strokeWidth={10} pathLength={1} strokeDasharray={`${easeOut(k(t, c(31, "both") - 4, 14))} 1`} />
    </svg>
    <At x={560} y={520} s={pop(t, c(31, "sure") - 4, 10)}><div style={{ textAlign: "center" }}><Glyph kind="flagUS" s={170} /><Pill text="= HARO" col={C.blue} fg="#fff" size={60} /></div></At>
    <At x={1360} y={520} s={pop(t, c(31, "different") - 4, 10)}><div style={{ textAlign: "center" }}><Glyph kind="flagUK" s={170} /><Pill text="= ROSARIO" col={C.red} fg="#fff" size={60} /></div></At>
  </Cam></Paper>
);
const bellevue: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={960} y={130} s={pop(t, 0, 10)}><Pill text="1853" col={C.red} fg="#fff" size={70} /></At>
    <At x={620} y={430} s={pop(t, c(35, "Hudson's") - 4, 10)}><div style={{ textAlign: "center" }}><Glyph kind="flagUK" s={190} /><T size={44}>Hudson's Bay Company</T></div></At>
    <At x={1320} y={430} s={pop(t, c(35, "sheep") - 4, 10)}><div style={{ display: "flex", gap: 10 }}><Glyph kind="sheep" s={170} /><Glyph kind="sheep" s={140} /></div></At>
    <At x={960} y={690} s={pop(t, c(36, "Belle") - 4, 10)}><div style={{ background: "#8a5a3a", border: `8px solid ${C.ink}`, borderRadius: 10, padding: "16px 50px", boxShadow: `0 10px 0 ${C.ink}` }}><T size={80} col="#fffaf0" style={{ fontFamily: "Georgia, serif" }}>Belle Vue Farm</T></div></At>
  </Cam></Paper>
);
const griffin: React.FC<G> = ({ t, d, c }) => <Person t={t} d={d} who="griffin" name="Charles Griffin" role="Ran Belle Vue Farm (HBC)" col={C.red} c={c(37, "Charles") - 4} />;
const sheep: React.FC<G> = ({ t, d, c }) => {
  const n = count(t, 0, c(38, "sheep"), 0, 4000);
  return (
    <Paper><Cam t={t} d={d} from={1.06} to={1.0}>
      <Svg>{Array.from({ length: Math.floor(n / 80) }, (_, i) => <g key={i} transform={`translate(${130 + (i % 14) * 120} ${520 + Math.floor(i / 14) * 70}) scale(0.7)`}><path d="M0 26 Q-8 10 8 4 Q12 -10 28 -4 Q42 -12 50 2 Q66 4 62 20 Q68 36 52 40 L4 40 Q-10 38 0 26 Z" fill="#fbf7ee" stroke={C.ink} strokeWidth={5} /><ellipse cx={62} cy={22} rx={9} ry={11} fill="#3a3038" /></g>)}</Svg>
      <Big n={fmt(n) + "+"} label="sheep" t={t} at={0} x={960} y={250} size={220} col={C.ink} />
    </Cam></Paper>
  );
};
const flagground: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.08}>
    <At x={620} y={420} s={pop(t, 0, 10)}><div style={{ textAlign: "center" }}><Icon kind="warehouse" s={240} /><T size={46}>A real business</T></div></At>
    <At x={1320} y={420} s={pop(t, c(42, "flag") - 4, 10)}><div style={{ textAlign: "center" }}><Glyph kind="flagUK" s={260} /><T size={46}>A flag in the ground</T></div></At>
    <At x={960} y={710} s={pop(t, c(43, "British") - 4, 10)}><Pill text="Island looks British" col={C.red} fg="#fff" size={58} /></At>
  </Cam></Paper>
);
const settlers: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={960} y={150} s={pop(t, c(45, "Washington") - 4, 10)}><Pill text="Washington Territory: “Ours.”" col={C.blue} fg="#fff" size={56} /></At>
    <div style={{ position: "absolute", top: 330, width: 1920, display: "flex", justifyContent: "center", gap: 50 }}>
      {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ transform: `translateX(${(1 - easeOut(k(t, c(45, "settlers") - 6 + i * 4, 16))) * 900}px)`, opacity: k(t, c(45, "settlers") - 6 + i * 4, 6) }}><Icon kind="person" s={190} col={[C.blue, C.green, "#c9a26a", C.blue, C.mol2][i]} /></div>)}
    </div>
    <At x={960} y={700} s={pop(t, c(45, "land") - 4, 10)}><Pill text="Staking out land" size={52} /></At>
  </Cam></Paper>
);
const cutlarcard: React.FC<G> = ({ t, d }) => <Person t={t} d={d} who="cutlar" name="Lyman Cutlar" role="American settler · farmer" col={C.green} />;

// ---------------- chapter 2: the pig ----------------
const date: React.FC<G> = ({ t, d, c, v }) => {
  if (v === 0) return (
    <Paper><Cam t={t} d={d} from={1.1} to={1.0}>
      <At x={960} y={400} s={pop(t, 0, 10)}><div style={{ width: 520, background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 20, overflow: "hidden", boxShadow: `0 14px 0 ${C.ink}`, textAlign: "center" }}>
        <div style={{ background: C.red, padding: 14 }}><T size={60} col="#fff">June</T></div><T size={240}>15</T><T size={60} col={C.grey} style={{ marginBottom: 20 }}>1859</T></div></At>
    </Cam></Paper>
  );
  // v1: June 15 again: 1846 (treaty) and 1859 (the pig), 13 years to the day
  const card = (y: string, l: string, col: string) => (
    <div style={{ textAlign: "center" }}><div style={{ width: 420, background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 20, overflow: "hidden", boxShadow: `0 14px 0 ${C.ink}` }}>
      <div style={{ background: col, padding: 10 }}><T size={50} col="#fff">June</T></div><T size={190}>15</T><T size={54} col={C.grey} style={{ marginBottom: 16 }}>{y}</T></div>
      <T size={44} style={{ marginTop: 18 }}>{l}</T></div>
  );
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
      <VS t={t} at={0} mid="=" l={card("1846", "Treaty signed", C.blue)} r={<div style={{ opacity: k(t, c(54, "13") - 8, 6) }}>{card("1859", "Pig shot", C.red)}</div>} />
      <At x={960} y={110} s={pop(t, c(54, "Exactly") - 2, 10)}><Pill text="13 years to the day" col={C.yellow} size={60} /></At>
    </Cam></Paper>
  );
};
const hogtag: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.08}>
    <At x={760} y={420} s={pop(t, 0, 10)}><Glyph kind="blackpig" s={480} /></At>
    <At x={1340} y={330} s={pop(t, 6, 10)} r={8}><div style={{ background: "#fffaf0", border: `7px solid ${C.ink}`, borderRadius: 14, padding: "18px 34px" }}><T size={40} col={C.grey}>Property of</T><T size={60}>Griffin · HBC</T></div></At>
    <At x={1300} y={640} s={pop(t, 12, 10)}><div style={{ display: "flex", gap: 6 }}><Glyph kind="potato" s={120} /><Glyph kind="potato" s={100} /><Glyph kind="potato" s={110} /></div></At>
  </Cam></Paper>
);
const whichchannel: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.15} to={1.05}>
    <At x={960} y={360} s={pop(t, 0, 10)}><Doc w={1300} r={1}><Serif size={56}>“…the middle of <b>the channel</b>…”</Serif></Doc></At>
    <At x={960} y={660} s={pop(t, c(55, "which") - 4, 10)}><Pill text="Which channel?" col={C.red} fg="#fff" size={70} /></At>
  </Cam></Paper>
);
const offer: React.FC<G> = ({ t, d, c, v }) => {
  const ten = <div style={{ textAlign: "center" }}><T size={50}>Cutlar offers</T><T size={230} col={C.green} style={{ textShadow: `0 10px 0 ${C.ink}` }}>$10</T></div>;
  const hund = <div style={{ textAlign: "center" }}><T size={50}>Griffin wants</T><T size={230} col={C.red} style={{ textShadow: `0 10px 0 ${C.ink}` }}>$100</T></div>;
  if (v === 0) return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
      <div style={{ position: "absolute", top: 230, width: 1920, display: "flex", justifyContent: "center", gap: 200 }}>
        <div style={{ transform: `scale(${pop(t, c(58, "$10") - 4, 10)})` }}>{ten}</div>
        <div style={{ transform: `scale(${pop(t, c(59, "$100") - 4, 10)}) translateX(${shake(t, c(59, "$100"))}px)` }}>{hund}</div>
      </div>
    </Cam></Paper>
  );
  // v1: offer withdrawn: $10 struck out to $0; trespassing stamp
  const sk = easeOut(k(t, c(65, "back") - 2, 10));
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
      <At x={760} y={400}><div style={{ position: "relative", opacity: 1 - 0.5 * sk }}>{ten}<div style={{ position: "absolute", left: -20, top: "60%", height: 18, background: C.red, width: `${sk * 110}%`, borderRadius: 9 }} /></div></At>
      <At x={1260} y={430} s={pop(t, c(66, "paying") - 4, 10)}><T size={260} col={C.ink}>$0</T></At>
      <Stamp text="TRESPASSING" t={t} at={c(67, "trespassing") - 2} x={960} y={700} size={100} />
    </Cam></Paper>
  );
};
const exchange: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <At x={960} y={110} s={pop(t, 0, 10)}><Pill text="The story goes…" size={46} /></At>
    <div style={{ position: "absolute", left: 140, top: 230 }}><Bubble who="Cutlar" text="“It was eating my potatoes.”" side="l" s={pop(t, c(61, "It") - 4, 10)} /></div>
    <div style={{ position: "absolute", right: 140, top: 480 }}><Bubble who="Griffin" text="“It is up to you to keep your potatoes out of my pig.”" side="r" s={pop(t, c(62, "It") - 4, 10)} col="#ffe0e0" /></div>
  </Cam></Paper>
);
const myth: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.06} to={1.0}>
    <div style={{ position: "absolute", left: 140, top: 230, opacity: 0.45 }}><Bubble who="Cutlar" text="“It was eating my potatoes.”" side="l" s={1} /></div>
    <div style={{ position: "absolute", right: 140, top: 480, opacity: 0.45 }}><Bubble who="Griffin" text="“It is up to you to keep your potatoes out of my pig.”" side="r" s={1} col="#ffe0e0" /></div>
    <Stamp text="PROBABLY MADE UP" t={t} at={c(63, "made") - 4} x={960} y={420} size={110} />
    <At x={960} y={720} s={pop(t, c(64, "mood") - 4, 10)}><Pill text="…but it captures the mood" col={C.yellow} size={50} /></At>
  </Cam></Paper>
);
const logic: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={960} y={130} s={pop(t, 0, 10)}><Pill text="The real problem" col={C.red} fg="#fff" size={56} /></At>
    <div style={{ position: "absolute", top: 300, width: 1920, display: "flex", justifyContent: "center", alignItems: "center", gap: 40 }}>
      <div style={{ transform: `scale(${pop(t, c(71, "British") - 4, 10)})`, textAlign: "center" }}><Glyph kind="court" s={200} /><T size={42}>British court</T></div>
      <T size={90} col={C.grey} style={{ opacity: k(t, c(71, "arrest") - 4, 6) }}>→</T>
      <div style={{ transform: `scale(${pop(t, c(71, "American") - 4, 10)})`, textAlign: "center" }}><Icon kind="person" s={200} col={C.blue} /><T size={42}>arrests an American</T></div>
      <T size={90} col={C.grey} style={{ opacity: k(t, c(71, "then") - 4, 6) }}>=</T>
      <div style={{ transform: `scale(${pop(t, c(71, "then") + 10, 10)})`, textAlign: "center" }}><Glyph kind="flagUK" s={200} /><T size={42}>British island</T></div>
    </div>
  </Cam></Paper>
);
const askarmy: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.1} to={1.0}>
    <At x={960} y={400} s={pop(t, 0, 10)} r={-3}><Doc w={1100}>
      <Serif size={44}>To the U.S. Army:</Serif>
      <Serif size={64} style={{ marginTop: 24, fontWeight: 700 }}>We ask for your protection.</Serif>
      <Serif size={36} style={{ marginTop: 30, textAlign: "right", fontStyle: "italic" }}>— the American settlers of San Juan Island</Serif>
    </Doc></At>
  </Cam></Paper>
);

// ---------------- chapter 3: the soldiers and the warship ----------------
const harney: React.FC<G> = ({ t, d, c }) => <Person t={t} d={d} who="harney" name="Gen. William Harney" role="U.S. Army, Pacific Northwest" c={c(74, "General") - 4} />;
const pickett64: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <Big n="64" label="soldiers" t={t} at={c(76, "64") - 4} x={480} y={400} size={280} col={C.blue} />
    <At x={1250} y={420} s={pop(t, c(76, "George") - 4, 10)}><div style={{ display: "flex", alignItems: "center", gap: 30 }}><Portrait who="pickett" s={260} /><div><T size={40} col={C.grey}>Captain</T><T size={84}>George</T><T size={84}>Pickett</T></div></div></At>
  </Cam></Paper>
);
const douglas: React.FC<G> = ({ t, d, c }) => <Person t={t} d={d} who="douglas" name="James Douglas" role="Governor · Vancouver Island & B.C." col={C.red} extra="Also a senior Hudson's Bay Company man" extraAt={c(81, "senior") - 4} />;
const tribune: React.FC<G> = ({ t, d, c }) => (
  <Dark><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={960} y={170} s={pop(t, 0, 10)}><T size={110} col="#f6efdc" style={{ letterSpacing: 10, fontFamily: "Georgia, serif" }}>HMS Tribune</T></At>
    <div style={{ position: "absolute", top: 340, width: 1920, display: "flex", justifyContent: "center", gap: 110, alignItems: "center" }}>
      <div style={{ transform: `scale(${pop(t, c(84, "31") - 4, 10)})`, textAlign: "center" }}><div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", width: 520 }}>{Array.from({ length: 31 }, (_, i) => <div key={i} style={{ width: 44, height: 22, background: "#3a3a48", border: "4px solid #f6efdc", borderRadius: 6, opacity: k(t, c(84, "31") - 4 + i * 0.6, 3) }} />)}</div><T size={100} col={C.yellow} style={{ marginTop: 14 }}>31 guns</T></div>
      <div style={{ transform: `scale(${pop(t, c(85, "Captain") - 4, 10)})`, display: "flex", alignItems: "center", gap: 26 }}><Portrait who="hornby" s={220} /><div><T size={40} col="#cfd6e8">Captain</T><T size={70} col="#fff">Geoffrey</T><T size={70} col="#fff">Hornby</T></div></div>
    </div>
  </Cam></Dark>
);
const leave: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.12} oy={40}>
    <At x={960} y={170} s={pop(t, 0, 10)}><Pill text="Message to Pickett" size={50} /></At>
    <At x={960 + shake(t, c(87, "Leave") - 2, 20)} y={450} s={pop(t, c(87, "Leave") - 4, 8)}><T size={300} col={C.red} style={{ textShadow: `0 14px 0 ${C.ink}` }}>LEAVE.</T></At>
  </Cam></Paper>
);
const bunkerhill: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={420} y={410} s={pop(t, 0, 10)}><Portrait who="pickett" s={300} /></At>
    <At x={1160} y={410} s={pop(t, 2, 10)}><div style={{ width: 1050 }}><Bubble who="Capt. George Pickett" text="“We'll make a Bunker Hill of it.”" side="l" s={1} col={C.yellow} /></div></At>
    <At x={1300} y={720} o={k(t, 20, 10)}><T size={34} col={C.grey} up={false}>Bunker Hill (1775): Americans dug in on a hill and made the British pay for it</T></At>
  </Cam></Paper>
);
const buildup: React.FC<G> = ({ t, d, c }) => {
  const a = c(92, "171"), b = c(93, "461");
  const n = t < a - 4 ? 64 : t < b - 4 ? count(t, a - 4, a + 16, 64, 235) : count(t, b - 4, b + 16, 235, 461);
  const dots = Math.round(n / 5);
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
      <Svg>{Array.from({ length: dots }, (_, i) => { const x = 180 + (i % 31) * 50, y = 520 + Math.floor(i / 31) * 52; return <g key={i}><circle cx={x} cy={y} r={12} fill={C.blue} /><rect x={x - 13} y={y + 13} width={26} height={22} rx={6} fill={C.blue} /></g>; })}</Svg>
      <Big n={String(n)} label="Americans on the island" t={t} at={0} x={960} y={270} size={230} col={C.blue} />
      {t > a - 4 && t < b - 4 ? <At x={1500} y={170} s={pop(t, a - 4, 10)}><Pill text="+171" col={C.yellow} size={70} /></At> : null}
      {t >= b - 4 ? <At x={1520} y={180} s={pop(t, c(93, "14") - 4, 10)}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Glyph kind="cannon" s={140} /><T size={80}>× 14</T></div></At> : null}
      <At x={330} y={140} s={pop(t, 4, 10)}><Pill text={t < a - 4 ? "July 27" : t < b - 4 ? "Aug 10" : "Aug 31"} size={48} /></At>
    </Cam></Paper>
  );
};
const odds: React.FC<G> = ({ t, d, c }) => {
  const u = easeOut(k(t, c(95, "2,000") - 6, 20));
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.04}>
      <At x={960} y={120} s={pop(t, 0, 10)}><Pill text="The odds" size={52} /></At>
      <div style={{ position: "absolute", left: 220, top: 260 }}>
        <T size={50} col={C.blue}>Americans</T>
        <div style={{ height: 90, width: 1480 * (461 / 2140), background: C.blue, border: `6px solid ${C.ink}`, borderRadius: 10, marginTop: 10, display: "flex", alignItems: "center", paddingLeft: 20 }}><T size={56} col="#fff">461</T></div>
        <T size={50} col={C.red} style={{ marginTop: 50 }}>British</T>
        <div style={{ height: 90, width: Math.max(40, 1480 * u), background: C.red, border: `6px solid ${C.ink}`, borderRadius: 10, marginTop: 10, display: "flex", alignItems: "center", paddingLeft: 20 }}><T size={56} col="#fff">{u > 0.3 ? "2,000+" : ""}</T></div>
      </div>
      <At x={960} y={720} s={pop(t, c(95, "offshore") - 4, 10)}><Pill text="waiting offshore" col={C.yellow} size={48} /></At>
    </Cam></Paper>
  );
};

// ---------------- chapter 4: the admiral ----------------
const force: React.FC<G> = ({ t, d, c }) => (
  <Dark><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={620} y={400} s={pop(t, 0, 10)}><div style={{ textAlign: "center" }}><Glyph kind="ship" s={240} /><T size={70} col="#ff6b6b">2,000+</T></div></At>
    <At x={1300} y={400} s={pop(t, 6, 10)}><div style={{ textAlign: "center" }}><Glyph kind="flagUS" s={220} /><T size={70} col="#8fb3ff">461</T></div></At>
    <At x={960} y={700} s={pop(t, c(99, "landed") - 4, 10)}><Pill text="Douglas: land the troops" col="#f6efdc" size={52} /></At>
  </Cam></Dark>
);
const navy: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={960} y={160} s={pop(t, 0, 10)}><Pill text="To land troops…" size={56} /></At>
    <At x={960} y={460} s={pop(t, c(100, "navy") - 4, 10)}><div style={{ display: "flex", alignItems: "center", gap: 30 }}><Glyph kind="ship" s={260} /><T size={120} col={C.blue}>…he needed the navy</T></div></At>
  </Cam></Paper>
);
const baynes: React.FC<G> = ({ t, d, c }) => <Person t={t} d={d} who="baynes" name="R. Adm. Lambert Baynes" role="Royal Navy, Pacific" col={C.blue} c={c(101, "Rear") - 4} />;
const squabble: React.FC<G> = ({ t, d }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={380} y={420} s={pop(t, 0, 10)}><Portrait who="baynes" s={280} /></At>
    <At x={1140} y={420} s={pop(t, 4, 10)}><div style={{ width: 1100 }}><Bubble who="Rear Admiral Baynes" text="Not going to “involve two great nations in a war over a squabble about a pig.”" side="l" s={1} col="#e7f0ff" /></div></At>
  </Cam></Paper>
);
const orders: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <At x={960} y={130} s={pop(t, 0, 10)}><Pill text="Orders to Captain Hornby" col={C.blue} fg="#fff" size={52} /></At>
    <div style={{ position: "absolute", left: 420, top: 260 }}>
      <Row text="Don't land" t={t} at={c(106, "Don't") - 4} mark="x" markAt={c(106, "land") + 2} size={70} />
      <Row text="Don't touch the guns" t={t} at={c(107, "Don't") - 4} mark="x" markAt={c(107, "guns") + 2} size={70} />
      <Row text="Hold and wait for diplomats" t={t} at={c(108, "Hold") - 4} mark="check" markAt={c(108, "diplomats") + 2} size={70} />
    </div>
  </Cam></Paper>
);

// ---------------- chapter 5: six weeks away ----------------
const noidea: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={960} y={130} s={pop(t, 0, 10)}><Pill text="The wildest part" col={C.yellow} size={52} /></At>
    <At x={620} y={430} s={pop(t, c(115, "governments") - 4, 10)}><div style={{ textAlign: "center" }}><Glyph kind="capitol" s={240} /><T size={56}>Washington</T></div></At>
    <At x={1300} y={430} s={pop(t, c(115, "governments"), 10)}><div style={{ textAlign: "center" }}><Glyph kind="bigben" s={240} /><T size={56}>London</T></div></At>
    <At x={960} y={700} s={pop(t, c(115, "idea") - 4, 10)}><T size={120} col={C.red}>???</T></At>
  </Cam></Paper>
);
const september: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.1} to={1.0}>
    <At x={960} y={360} s={pop(t, 0, 10)}><div style={{ width: 600, background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 20, overflow: "hidden", boxShadow: `0 14px 0 ${C.ink}`, textAlign: "center" }}>
      <div style={{ background: C.red, padding: 14 }}><T size={70} col="#fff">September</T></div><T size={150} style={{ margin: "20px 0" }}>1859</T></div></At>
    <At x={960} y={690} s={pop(t, c(118, "nearly") - 4, 10)}><Pill text="“We nearly went to war?”" size={52} /></At>
    {c(119, "pig") < d ? <At x={1560} y={300} s={pop(t, c(119, "pig") - 4, 10)} r={10}><Glyph kind="blackpig" s={220} /></At> : null}
  </Cam></Paper>
);
const buchanan: React.FC<G> = ({ t, d, c }) => <Person t={t} d={d} who="buchanan" name="James Buchanan" role="President of the United States" c={c(120, "President") - 4} extra="Alarmed" extraAt={c(120, "alarmed") - 2} />;
const civilwar: React.FC<G> = ({ t, d, c, v }) => {
  const crack = v === 0 ? easeOut(k(t, c(121, "civil") - 6, 20)) : 1;
  return (
    <Dark><Cam t={t} d={d} from={1.0} to={1.06}>
      <Svg>
        <g transform="translate(460 170) scale(1.0)">
          <path d="M80 60 L300 70 L520 92 L598 112 L640 150 L700 122 L760 140 L840 104 L890 70 L934 108 L884 168 L852 232 L818 300 L800 360 L834 452 L812 520 L770 472 L738 404 L650 420 L560 432 L500 482 L440 430 L410 520 L360 470 L330 420 L222 402 L150 380 L92 300 L60 200 L70 120 Z" fill="#d9cfb8" stroke="#f6efdc" strokeWidth={6} />
          <path d="M120 280 L300 300 L480 280 L620 300 L760 270 L900 250" fill="none" stroke={C.red} strokeWidth={12} pathLength={1} strokeDasharray={`${crack} 1`} strokeLinejoin="round" />
        </g>
      </Svg>
      {v === 0 ? <At x={960} y={760} s={pop(t, c(122, "Britain") - 4, 10)}><Pill text="Last thing it needed: war with Britain" col="#f6efdc" size={46} /></At>
        : <At x={960} y={120} s={pop(t, c(155, "1861") - 4, 10)}><Pill text="1861: Civil War" col={C.red} fg="#fff" size={60} /></At>}
    </Cam></Dark>
  );
};
const scott: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <At x={420} y={430} s={pop(t, c(124, "Winfield") - 4, 10)}><Portrait who="scott" s={330} /></At>
    <div style={{ position: "absolute", left: 760, top: 170 }}>
      <div style={{ transform: `scale(${pop(t, c(124, "Winfield") - 2, 10)})`, transformOrigin: "0 50%" }}><T size={100}>Winfield Scott</T><T size={46} col={C.blue}>Commanding general, U.S. Army</T></div>
      <div style={{ marginTop: 30 }}>
        <Row text="War of 1812 veteran" t={t} at={c(125, "1812") - 6} mark="check" markAt={c(125, "1812")} size={54} />
        <Row text="Calmed 2 border crises" t={t} at={c(125, "calmed") - 4} mark="check" markAt={c(125, "crises")} size={54} />
        <Row text="…with Britain, 1830s" t={t} at={c(125, "1830s") - 6} size={54} />
      </div>
    </div>
  </Cam></Paper>
);
const scottorders: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.12} to={1.0}>
    <At x={960} y={400} s={pop(t, 0, 10)} r={-1.5}><Doc w={1300}>
      <Serif size={40} style={{ fontStyle: "italic" }}>Orders to General Scott, 1859 (paraphrased)</Serif>
      <Serif size={66} style={{ marginTop: 26, fontWeight: 700 }}>It would be shocking if two nations were dragged into war over a small island.</Serif>
    </Doc></At>
  </Cam></Paper>
);
const letters: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={960} y={130} s={pop(t, 0, 10)}><Pill text="October 1859" col={C.red} fg="#fff" size={56} /></At>
    <At x={460} y={440} s={pop(t, c(130, "letters") - 6, 10)}><Portrait who="scott" s={220} /></At>
    <At x={1460} y={440} s={pop(t, c(130, "Douglas") - 4, 10)}><Portrait who="douglas" s={220} /></At>
    {[0, 1, 2].map((i) => { const u = ((t - c(130, "letters")) / 40 + i / 3) % 1; const on = t > c(130, "letters"); return on ? <At key={i} x={lerp(640, 1280, i % 2 ? 1 - u : u)} y={420 - Math.sin(u * Math.PI) * 140}><Glyph kind="letter" s={120} /></At> : null; })}
    <At x={960} y={720} s={pop(t, c(130, "deal") - 4, 10)}><Glyph kind="handshake" s={200} /></At>
  </Cam></Paper>
);
const deal: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.04}>
    <At x={960} y={120} s={pop(t, 0, 10)}><Pill text="The deal" col={C.green} fg="#fff" size={56} /></At>
    <div style={{ position: "absolute", left: 340, top: 230 }}>
      <Row text="Pull back most forces" t={t} at={c(131, "pull") - 4} mark="check" markAt={c(131, "forces")} size={64} />
      <Row text="One small camp each" t={t} at={c(132, "small") - 6} mark="check" markAt={c(132, "camp")} size={64} />
      <Row text="Share the island, peacefully" t={t} at={c(133, "share") - 4} mark="check" markAt={c(133, "peacefully")} size={64} />
      <Row text="…until the border is settled" t={t} at={c(133, "border") - 6} size={64} />
    </div>
  </Cam></Paper>
);
const agreed: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <VS t={t} at={0} mid="+" l={<Glyph kind="flagUS" s={280} />} r={<Glyph kind="flagUK" s={280} />} />
    <Stamp text="AGREED" t={t} at={c(134, "agreed") - 2} x={960} y={660} size={120} col={C.green} />
  </Cam></Paper>
);
const rebuked: React.FC<G> = ({ t, d, c }) => <Person t={t} d={d} who="harney" name="Gen. William Harney" role="The man who sent Pickett" stamp="REBUKED" stampAt={c(135, "rebuked") - 2} extra="Moved to a new post" extraAt={c(135, "moved") - 2} />;

// ---------------- chapter 6: the friendliest occupation ----------------
const yearcount: React.FC<G> = ({ t, d }) => {
  const y = count(t, 2, Math.max(10, d - 4), 1860, 1872);
  return (
    <Paper><Cam t={t} d={d} from={1.1} to={1.0}>
      <Big n={String(y)} t={t} at={0} x={960} y={360} size={260} col={C.ink} />
      <At x={960} y={620} s={pop(t, 4, 10)}><Pill text="12 years · 0 battles" col={C.green} fg="#fff" size={64} /></At>
    </Cam></Paper>
  );
};
const parties: React.FC<G> = ({ t, d, c }) => {
  const items: [string, string, number][] = [["tree", "Christmas", c(150, "Christmases")], ["picnic", "Picnics", c(151, "picnics")], ["cup", "Drinks", c(151, "drinks")], ["horse", "Horse races", c(151, "horse")]];
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
      <At x={960} y={120} s={pop(t, 0, 10)}><Pill text="Together" col={C.green} fg="#fff" size={56} /></At>
      <div style={{ position: "absolute", top: 260, width: 1920, display: "flex", justifyContent: "center", gap: 50 }}>
        {items.map(([g, l, at]) => <div key={l} style={{ transform: `scale(${pop(t, at - 4, 10)})`, textAlign: "center", width: 380 }}>
          <div style={{ background: "#fffaf0", border: `8px solid ${C.ink}`, borderRadius: 30, padding: 26, boxShadow: `0 10px 0 ${C.ink}`, display: "inline-block" }}><Glyph kind={g} s={190} /></div>
          <T size={50} style={{ marginTop: 16 }}>{l}</T></div>)}
      </div>
    </Cam></Paper>
  );
};
const together: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <div style={{ position: "absolute", left: 300, top: 180 }}>
      <Row text="Theft" t={t} at={c(152, "theft") - 4} mark="check" markAt={c(152, "together") - 6} size={70} />
      <Row text="Fights" t={t} at={c(152, "fights") - 4} mark="check" markAt={c(152, "together") - 4} size={70} />
      <Row text="Smuggling" t={t} at={c(152, "smuggling") - 4} mark="check" markAt={c(152, "together") - 2} size={70} />
    </div>
    <At x={1380} y={420} s={pop(t, c(152, "together") - 4, 10)}><div style={{ textAlign: "center" }}><div style={{ display: "flex", gap: 10 }}><Glyph kind="flagUS" s={170} /><Glyph kind="flagUK" s={170} /></div><T size={52}>Handled jointly</T></div></At>
  </Cam></Paper>
);
const resigned: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <NameCard name="George Pickett" role="Resigned · went home to Virginia" t={t} at={0} roleAt={c(156, "resigned") - 2} x={960} y={400} col="#7a7a8a" icon={<Portrait who="pickett" s={250} />} extra="Joined the Confederacy" extraAt={c(156, "Confederacy") - 4} />
  </Cam></Paper>
);
const gettysburg: React.FC<G> = ({ t, d, c }) => (
  <Dark tone="#1a1010"><Cam t={t} d={d} from={1.1} to={1.0}>
    <At x={960} y={260} s={pop(t, 0, 10)}><T size={90} col="#f6efdc" style={{ letterSpacing: 16 }}>Gettysburg</T></At>
    <At x={960} y={420} s={pop(t, 4, 10)}><T size={180} col={C.yellow}>1863</T></At>
    <At x={960} y={650} s={pop(t, c(157, "deadliest") - 4, 10)}><Pill text="One of the war's deadliest charges" col="#ff6b6b" fg="#fff" size={50} /></At>
  </Cam></Dark>
);
const charge: React.FC<G> = ({ t, d, c }) => (
  <Dark tone="#1a1010"><Cam t={t} d={d} from={1.0} to={1.1}>
    <At x={960} y={260} s={pop(t, 0, 10)}><T size={60} col="#cfd6e8">History named it after him</T></At>
    <At x={960 + shake(t, c(159, "Pickett's") - 2, 16)} y={470} s={pop(t, c(159, "Pickett's") - 4, 9)}><T size={200} col="#ff6b6b" style={{ textShadow: "0 12px 0 #000" }}>Pickett's Charge</T></At>
  </Cam></Dark>
);
const irony: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <div style={{ position: "absolute", top: 230, width: 1920, display: "flex", justifyContent: "center", alignItems: "center", gap: 60 }}>
      <div style={{ transform: `scale(${pop(t, 0, 10)})`, textAlign: "center" }}><Glyph kind="blackpig" s={240} /><T size={46}>1859: almost a war</T><T size={46}>over a pig</T></div>
      <T size={140} col={C.red} style={{ opacity: k(t, c(160, "ended") - 4, 6) }}>→</T>
      <div style={{ transform: `scale(${pop(t, c(160, "bloodiest") - 6, 10)})`, textAlign: "center" }}><Glyph kind="cannon" s={240} /><T size={46}>1863: one of the bloodiest</T><T size={46}>attacks in U.S. history</T></div>
    </div>
    <At x={960} y={130} s={pop(t, 2, 10)}><Pill text="Same man" col={C.yellow} size={56} /></At>
  </Cam></Paper>
);

// ---------------- chapter 7: the Kaiser ----------------
const settle: React.FC<G> = ({ t, d, c }) => {
  const y = Math.round(lerp(1860, 1871, easeOut(k(t, 0, 18))));
  return (
    <Paper><Cam t={t} d={d} from={1.08} to={1.0}>
      <Big n={String(y)} t={t} at={0} x={960} y={360} size={260} col={C.ink} />
      <At x={960} y={620} s={pop(t, c(162, "settle") - 4, 10)}><Pill text="Time to settle it" col={C.green} fg="#fff" size={60} /></At>
    </Cam></Paper>
  );
};
const washington: React.FC<G> = ({ t, d, c }) => (
  <Dark><Cam t={t} d={d} from={1.12} to={1.0}>
    <At x={960} y={400} s={pop(t, 0, 10)}><Doc w={1000}>
      <Serif size={66} style={{ textAlign: "center", fontWeight: 700 }}>Treaty of Washington</Serif>
      <Serif size={44} style={{ textAlign: "center" }}>1871</Serif>
      <div style={{ marginTop: 24 }}>{[0, 1, 2, 3].map((j) => <div key={j} style={{ height: 12, background: "rgba(36,23,38,0.3)", margin: "16px 0", width: `${96 - (j % 3) * 10}%` }} />)}</div>
      <Serif size={40} style={{ marginTop: 10 }}>The San Juan question: to the Emperor of Germany.</Serif>
    </Doc></At>
  </Cam></Dark>
);
const kaiser: React.FC<G> = ({ t, d }) => <Person t={t} d={d} who="kaiser" name="Kaiser Wilhelm I" role="Emperor of Germany · the referee" col="#2b3a63" />;
const rules: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <At x={960} y={120} s={pop(t, 0, 10)}><Pill text="The rules" col="#2b3a63" fg="#fff" size={56} /></At>
    <div style={{ position: "absolute", top: 230, width: 1920, display: "flex", justifyContent: "center", gap: 80 }}>
      <div style={{ transform: `scale(${pop(t, c(168, "Haro") - 4, 10)})` }}><Pill text="HARO" col={C.blue} fg="#fff" size={80} /></div>
      <T size={70} style={{ opacity: k(t, c(168, "or") - 4, 6) }}>or</T>
      <div style={{ transform: `scale(${pop(t, c(168, "Rosario") - 4, 10)})` }}><Pill text="ROSARIO" col={C.red} fg="#fff" size={80} /></div>
    </div>
    <div style={{ position: "absolute", left: 560, top: 440 }}>
      <Row text="Compromise" t={t} at={c(169, "compromise") - 6} mark="x" markAt={c(169, "compromise")} strike size={64} />
      <Row text="Appeal" t={t} at={c(170, "appeal") - 6} mark="x" markAt={c(170, "appeal")} strike size={64} />
    </div>
  </Cam></Paper>
);
const commission: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.05}>
    <At x={960} y={130} s={pop(t, c(171, "commission") - 4, 10)}><Pill text="3 German experts" col="#2b3a63" fg="#fff" size={56} /></At>
    <div style={{ position: "absolute", top: 280, width: 1920, display: "flex", justifyContent: "center", gap: 80 }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ transform: `scale(${pop(t, c(171, "three") - 4 + i * 4, 10)})` }}><Glyph kind="expert" s={260} /></div>)}
    </div>
    <At x={960} y={680} s={pop(t, c(171, "evidence") - 4, 10)}><Glyph kind="scroll" s={140} /></At>
  </Cam></Paper>
);
const bancroft: React.FC<G> = ({ t, d, c }) => <Person t={t} d={d} who="bancroft" name="George Bancroft" role="Made America's case" c={c(172, "George") - 4} />;
const lastleave: React.FC<G> = ({ t, d, c }) => (
  <Paper><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={620} y={400} s={pop(t, 0, 10)}><div style={{ textAlign: "center" }}><Glyph kind="flagUK" s={220} /><T size={52}>Royal Marines leave</T><T size={46} col={C.grey}>Nov 1872</T></div></At>
    <At x={1300} y={400} s={pop(t, c(179, "1874") - 6, 10)}><div style={{ textAlign: "center" }}><Glyph kind="flagUS" s={220} /><T size={52}>Last U.S. troops leave</T><T size={46} col={C.grey}>1874</T></div></At>
  </Cam></Paper>
);

// ---------------- ending ----------------
const final: React.FC<G> = ({ t, d, c }) => {
  const rows: [string, number][] = [["1859 → 1872", c(181, "1859")], ["13 years", c(182, "13")], ["2 empires", c(183, "2")], ["2,000+ men", c(184, "2,000")],
    ["Warships · cannons", c(185, "Warships")], ["A future Confederate general", c(185, "Confederate")], ["A German emperor", c(185, "German")], ["A treaty that forgot a word", c(185, "treaty")]];
  return (
    <Paper><Cam t={t} d={d} from={1.0} to={1.04}>
      <At x={960} y={100} s={pop(t, 0, 10)}><Pill text="The final count" col={C.ink} fg="#fff" size={56} /></At>
      <div style={{ position: "absolute", left: 200, top: 190, display: "grid", gridTemplateColumns: "760px 760px", columnGap: 40 }}>
        {rows.map(([s, at]) => <Row key={s} text={s} t={t} at={at - 4} mark="check" markAt={at + 4} size={48} />)}
      </div>
    </Cam></Paper>
  );
};
const casualties: React.FC<G> = ({ t, d, c }) => (
  <Dark tone="#0e1220"><Cam t={t} d={d} from={1.0} to={1.12}>
    <At x={960} y={200} s={pop(t, 0, 10)}><T size={80} col="#cfd6e8" style={{ letterSpacing: 14 }}>Total casualties</T></At>
    <At x={760 + shake(t, c(186, "1") - 2, 20)} y={480} s={pop(t, c(186, "1") - 4, 8)}><T size={300} col={C.yellow} style={{ textShadow: "0 14px 0 #000" }}>1</T></At>
    <At x={1180 + shake(t, c(186, "pig") - 2, 20)} y={480} s={pop(t, c(186, "pig") - 4, 8)}><Glyph kind="blackpig" s={300} /></At>
  </Cam></Dark>
);
const park: React.FC<G> = ({ t, d, c }) => (
  <Paper tone="#e6efd9"><Cam t={t} d={d} from={1.0} to={1.06}>
    <At x={960} y={130} s={pop(t, 0, 10)}><Pill text="Today" col={C.green} fg="#fff" size={60} /></At>
    <At x={960} y={430} s={pop(t, 4, 10)}><div style={{ background: "#5b3a24", border: `10px solid ${C.ink}`, borderRadius: 16, padding: "30px 70px", boxShadow: `0 14px 0 ${C.ink}`, textAlign: "center" }}>
      <T size={44} col="#f6efdc">San Juan Island</T><T size={90} col="#fffaf0">National Historical Park</T><T size={40} col="#e8c45a" style={{ marginTop: 10 }}>English Camp · American Camp</T></div></At>
  </Cam></Paper>
);

export const BOARDS: Record<string, React.FC<G>> = {
  men2000, versus, title, years13, cast3, zeroshots, back13, treaty, quote, samesentence, bellevue, griffin, sheep, flagground, settlers, cutlarcard,
  date, hogtag, whichchannel, offer, exchange, myth, logic, askarmy, harney, pickett64, douglas, tribune, leave, bunkerhill, buildup, odds,
  force, navy, baynes, squabble, orders, noidea, september, buchanan, civilwar, scott, scottorders, letters, deal, agreed, rebuked,
  yearcount, parties, together, resigned, gettysburg, charge, irony, settle, washington, kaiser, rules, commission, bancroft, lastleave,
  final, casualties, park,
};
export { Glyph, FONT, Banner, clamp01, Icon };
