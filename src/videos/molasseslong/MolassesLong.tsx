// "The Great Molasses Flood" (Paradox Town Explained #1), 1920 x 1080. One timeline, three kinds of shot:
// 2D boards (boards.tsx), 3D scenes and archive photos (placeholders until build steps 3 and 4).
// Chapter tags at each chapter start, captions on top, an end card after the last line. Voice muxed in at render.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { TOTAL, VOICE_END, SHOTS, shotAt, wordAt, XFADE, CHAPTER_SHOTS, CHAPTERS, ShotDef, segAt, FPS } from "./timeline";
import { BOARDS } from "./boards";
import { Placeholder } from "./Placeholder";
import { Photo, PHOTOS } from "./Photo";
import { View3D, useKit, has3D } from "./View3D";
import { Captions } from "./Captions";
import { C, T, Paper, pop, k, ease } from "./kit";

export const MOLASSESLONG_FRAMES = TOTAL;

const Shot: React.FC<{ shot: ShotDef; f: number }> = ({ shot, f }) => {
  const t = f - shot.a;
  if (has3D(shot)) return null;
  if (shot.k === "2d") {
    const [key, v] = shot.g.split(":"), B = BOARDS[key];
    if (B) return <B t={t} d={shot.b - shot.a} v={Number(v ?? 0)} c={(seg, w) => wordAt(seg, w) - shot.a} />;
  }
  if (shot.k === "photo" && PHOTOS[shot.g]) return <Photo shot={shot} t={t} />;
  return <Placeholder shot={shot} t={t} />;
};

const ChapterTag: React.FC<{ f: number }> = ({ f }) => {
  const ch = [...CHAPTERS].reverse().find((c) => f >= segAt(c.seg) - 10);
  if (!ch) return null;
  const t = f - (segAt(ch.seg) - 10), L = 4.5 * FPS;
  if (t > L) return null;
  const x = ease(k(t, 0, 12)) - ease(k(t, L - 12, 12));
  return (
    <div style={{ position: "absolute", left: 70, top: 64, transform: `translateX(${(x - 1) * 120}px)`, opacity: x, display: "flex", alignItems: "stretch", boxShadow: `0 6px 0 ${C.ink}` }}>
      <div style={{ background: C.red, border: `5px solid ${C.ink}`, padding: "8px 18px" }}><T size={34} col="#fff">{ch.num}</T></div>
      <div style={{ background: "#fffaf0", border: `5px solid ${C.ink}`, borderLeft: "none", padding: "8px 22px" }}><T size={34}>{ch.title}</T></div>
    </div>
  );
};

// End card: call to action on the left; the right half stays clear for YouTube's end-screen elements
// (place them right of x ≈ 1000). The arrow points at them.
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = ease(k(t, 0, 14)), bob = Math.sin(t / 7) * 14;
  const row = (at: number) => ({ opacity: ease(k(t, at, 10)), transform: `translateX(${(1 - ease(k(t, at, 10))) * -60}px)` });
  return (
    <Paper tone="#2a160c">
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.35) 56%, rgba(0,0,0,0.45) 100%)" }} />
      <div style={{ position: "absolute", left: 120, top: 190, opacity: a }}>
        <div style={row(0)}><T size={40} w={800} col={C.gold}>Paradox Town Explained</T></div>
        <div style={{ ...row(6), marginTop: 26 }}><T size={112} col="#fff" style={{ textShadow: `0 8px 0 #000` }}>Watch this</T></div>
        <div style={{ ...row(10), display: "flex", alignItems: "center", gap: 34 }}>
          <T size={112} col={C.yellow} style={{ textShadow: `0 8px 0 #000` }}>next</T>
          <svg width={230} height={110} viewBox="0 0 230 110" style={{ transform: `translateX(${bob}px)` }}>
            <path d="M10 55 H170" stroke={C.yellow} strokeWidth={26} strokeLinecap="round" />
            <path d="M140 14 L208 55 L140 96" fill="none" stroke={C.yellow} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ ...row(18), marginTop: 60, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ background: C.red, border: `6px solid ${C.ink}`, borderRadius: 12, padding: "12px 30px", boxShadow: `0 8px 0 #000`, transform: `scale(${1 + 0.04 * Math.sin(t / 5)})` }}>
            <T size={50} col="#fff">Subscribe</T>
          </div>
          <T size={40} w={800} col="#f6efdc" up={false}>for more weird history</T>
        </div>
        <div style={{ ...row(26), marginTop: 56 }}>
          <T size={40} w={800} col={C.gold} up={false}>Same stories in 60 seconds:</T>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 10 }}>
            <T size={58} col="#fff" up={false} style={{ textShadow: `0 6px 0 #000` }}>@ParadoxTownHQ</T>
            <svg width={110} height={56} viewBox="0 0 110 56" style={{ transform: `translateX(${bob * 0.6}px)` }}>
              <path d="M6 28 H80" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
              <path d="M64 8 L100 28 L64 48" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export const MolassesLong: React.FC = () => {
  const f = useCurrentFrame();
  const voice = (getInputProps() as { voice?: boolean }).voice;
  const kit = useKit();
  if (!kit) return null;
  if (f >= VOICE_END) return <AbsoluteFill><EndCard t={f - VOICE_END} />{voice ? <Audio src={staticFile("molasseslong/voice.mp3")} /> : null}</AbsoluteFill>;
  const s = shotAt(f) ?? SHOTS[SHOTS.length - 1];
  const prev = SHOTS[s.id - 2], d3 = has3D(s);
  const fade = CHAPTER_SHOTS.has(s.id) && prev && !d3 && !has3D(prev) && f < s.a + XFADE ? (f - s.a + 1) / (XFADE + 1) : 1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <View3D kit={kit} shot={s} f={f} visible={d3} />
      {fade < 1 ? <AbsoluteFill><Shot shot={prev} f={f} /></AbsoluteFill> : null}
      <AbsoluteFill style={{ opacity: fade }}><Shot shot={s} f={f} /></AbsoluteFill>
      <ChapterTag f={f} />
      <Captions />
      {voice ? <Audio src={staticFile("molasseslong/voice.mp3")} /> : null}
    </AbsoluteFill>
  );
};
