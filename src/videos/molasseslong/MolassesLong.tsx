// "The Great Molasses Flood" (Paradox Town Explained #1), 1920 x 1080. One timeline, three kinds of shot:
// 2D boards (boards.tsx), 3D scenes and archive photos (placeholders until build steps 3 and 4).
// Chapter tags at each chapter start, captions on top, an end card after the last line. Voice muxed in at render.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { TOTAL, VOICE_END, SHOTS, shotAt, wordAt, XFADE, CHAPTER_SHOTS, CHAPTERS, ShotDef, segAt, FPS } from "./timeline";
import { BOARDS } from "./boards";
import { Placeholder } from "./Placeholder";
import { Captions } from "./Captions";
import { C, T, Paper, pop, k, ease } from "./kit";

export const MOLASSESLONG_FRAMES = TOTAL;

const Shot: React.FC<{ shot: ShotDef; f: number }> = ({ shot, f }) => {
  const t = f - shot.a;
  if (shot.k === "2d") {
    const [key, v] = shot.g.split(":"), B = BOARDS[key];
    if (B) return <B t={t} d={shot.b - shot.a} v={Number(v ?? 0)} c={(seg, w) => wordAt(seg, w) - shot.a} />;
  }
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

const EndCard: React.FC<{ t: number }> = ({ t }) => (
  <Paper tone="#2a160c">
    <div style={{ position: "absolute", top: 150, width: 1920, textAlign: "center", transform: `scale(${pop(t, 6)})` }}>
      <T size={92} col={C.yellow} style={{ textShadow: `0 8px 0 #000` }}>Paradox Town Explained</T>
      <T size={40} w={800} col="#f6efdc" style={{ marginTop: 16 }}>Weird history, explained</T>
    </div>
  </Paper>
);

export const MolassesLong: React.FC = () => {
  const f = useCurrentFrame();
  const voice = (getInputProps() as { voice?: boolean }).voice;
  if (f >= VOICE_END) return <AbsoluteFill><EndCard t={f - VOICE_END} />{voice ? <Audio src={staticFile("molasseslong/voice.mp3")} /> : null}</AbsoluteFill>;
  const s = shotAt(f) ?? SHOTS[SHOTS.length - 1];
  const prev = SHOTS[s.id - 2], fade = CHAPTER_SHOTS.has(s.id) && prev && f < s.a + XFADE ? (f - s.a + 1) / (XFADE + 1) : 1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {fade < 1 ? <AbsoluteFill><Shot shot={prev} f={f} /></AbsoluteFill> : null}
      <AbsoluteFill style={{ opacity: fade }}><Shot shot={s} f={f} /></AbsoluteFill>
      <ChapterTag f={f} />
      <Captions />
      {voice ? <Audio src={staticFile("molasseslong/voice.mp3")} /> : null}
    </AbsoluteFill>
  );
};
