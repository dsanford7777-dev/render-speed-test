// Subscribe end card for Paradox Town Shorts (Daniel, Nov 16 2026). No voice line, so the loop survives.
// Over the last ~3.2 s: a channel card (real avatar, public/brand/avatar.png) floats up, the mascot (the red-cap
// "you" from the What If long-forms and the channel avatar, or a Short's own character via `outfit`) walks in,
// winds up and SLAPS the red SUBSCRIBE button, which flips to grey "SUBSCRIBED" with a ringing bell; he turns to
// the camera, grins and gives a thumbs up; everything floats away before the final frames, which still land on
// the hook's camera. Kit 2 look: Montserrat 900, ink outlines.
// Usage, Shorts: <SubscribeTag total={TOTAL_FRAMES} /> as the last child of the root AbsoluteFill (end card).
// Usage, long-forms (16:9): one <SubscribeTag at={subscribeAt(wordAt(seg, "subscribe"))} /> per spoken "subscribe";
// the card sits upper right and the mascot comes in from the right. The render workflow adds the slap sound on
// every "subscribe" in the aligned WORDS (scripts/slap_times.py).
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Pen, bodyFront, bodySide, Outfit, SKIN, INK as TOON_INK } from "../bridge/toon";

const { fontFamily } = loadFont("normal", { weights: ["900", "700"], subsets: ["latin"] });
const INK = "#120c16";
const RED = "#e0332e";

/** the recurring viewer character: red cap, blue jacket, white trainers (phoneif/world3d.ts "you") */
export const MASCOT: Outfit = { jacket: "#2f6fd0", pants: "#39405a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", skin: SKIN, buttons: "#f4f1ea" };

type Props = {
  total?: number;     // Shorts: composition length in frames (the card ends `tail` frames before it)
  at?: number;        // long-forms: frame the card starts; use subscribeAt(wordAt(seg, "subscribe")) so the slap lands on the word
  len?: number;       // frames on screen (default 96 = 3.2 s)
  tail?: number;      // frames left clear at the very end for the loop (default 8)
  top?: number;       // card centre, % of height (default 20)
  line?: string;      // tagline under the channel name
  outfit?: Outfit;    // who slaps the button (default: the red-cap mascot)
  seed?: number;      // face seed for that character
  mascot?: boolean;   // false = card only, no character
};

/** frames from the end of the video to the slap with the default len/tail (8 + 96 - 34). The render workflow mixes
 *  public/brand/slap.mp3 in at this point (render.yml): change both together, and don't override len/tail on a Short. */
export const SLAP_FROM_END = 70;
/** frames from the card's first frame to the slap */
export const SLAP_TAP = 34;
/** start frame that puts the slap on a given frame (e.g. the narrator's "subscribe") */
export const subscribeAt = (slapFrame: number) => slapFrame - SLAP_TAP;
// Layout: Shorts (portrait) as designed at 1080x1920; long-forms (landscape) scale everything by k, put the card in
// the upper right, and mirror the mascot so he walks in from the right edge and slaps from the right of the button.
type Lay = { W: number; H: number; k: number; cardX: number; cardY: number; S: number; CX: number; FEET: number; mir: boolean };
const layout = (W: number, H: number, top: number): Lay => {
  const land = W > H, k = land ? 0.72 : 1;
  const cardX = land ? W - 500 : W / 2, cardY = land ? 0.21 * H : (top / 100) * H;
  return { W, H, k, cardX, cardY, S: 0.75 * k, CX: cardX + (land ? 180 : -180) * k, FEET: cardY + (69 + 650) * k, mir: land };
};
const CW = 900, CH = 1100, OX = 150, OY = 60;    // character canvas; canvas offset of design unit (0,0)

const Bell: React.FC<{ ring: number }> = ({ ring }) => (
  <svg width={64} height={64} viewBox="0 0 24 24" style={{ transform: `rotate(${ring}deg)`, transformOrigin: "50% 15%" }}>
    <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v.6A6.5 6.5 0 0 1 18.5 10.5v4.2l1.8 2.3H3.7l1.8-2.3v-4.2A6.5 6.5 0 0 1 10.5 4.1v-.6A1.5 1.5 0 0 1 12 2z" fill={INK} />
    <path d="M9.5 19h5a2.5 2.5 0 0 1-5 0z" fill={INK} />
  </svg>
);

/** thumbs-up fist drawn over the hand point (design units) */
const thumb = (g: CanvasRenderingContext2D, x: number, y: number, skin: string) => {
  g.save(); g.translate(x, y); g.lineWidth = 10; g.strokeStyle = TOON_INK; g.lineJoin = "round"; g.fillStyle = skin;
  g.beginPath(); g.ellipse(-4, -54, 15, 34, -0.12, 0, Math.PI * 2); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(-34, -26, 64, 58, 20); g.fill(); g.stroke();
  g.lineWidth = 6;
  for (const k of [0, 1, 2]) { g.beginPath(); g.moveTo(-30, -10 + k * 15); g.lineTo(4, -10 + k * 15); g.stroke(); }
  g.restore();
};

/** open palm drawn over the hand point (design units), fingers pointing along `ang` */
const palm = (g: CanvasRenderingContext2D, x: number, y: number, ang: number, skin: string) => {
  g.save(); g.translate(x, y); g.rotate(ang); g.lineWidth = 9; g.strokeStyle = TOON_INK; g.lineJoin = "round"; g.fillStyle = skin;
  for (const [fx, fy, r] of [[-26, -40, 0.25], [-9, -48, 0.08], [9, -48, -0.08], [26, -40, -0.25]] as const) {
    g.save(); g.translate(fx, fy); g.rotate(r); g.beginPath(); g.ellipse(0, 0, 11, 26, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
  }
  g.save(); g.translate(-40, -4); g.rotate(-0.9); g.beginPath(); g.ellipse(0, 0, 11, 24, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
  g.beginPath(); g.ellipse(0, -8, 38, 34, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.restore();
};

const Mascot: React.FC<{ d: number; tap: number; slapAt: [number, number]; o: Outfit; seed: number; op: number; L: Lay }> = ({ d, tap, slapAt, o, seed, op, L }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { S, CX, FEET, mir, W } = L;
  const walkU = interpolate(d, [4, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(walkU, [0, 1], [mir ? W + 260 * L.k : -260, CX], { easing: Easing.out(Easing.quad) });
  const walking = d < 24;
  useLayoutEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH);
    g.translate(OX, OY);
    const p = new Pen(g);
    if (walking) { bodySide(p, o, { phase: (d / 7.5) % 1, mode: "march", expr: "grin", seed }); return; }
    const tx = 300 + (mir ? CX - slapAt[0] : slapAt[0] - CX) / S, ty = 975 + (slapAt[1] - FEET) / S;   // the button, in design units
    if (d < tap + 12) {
      const up: [number, number] = [tx + 30, ty - 170];
      let hand: [number, number];
      if (d < tap - 3) { const k = interpolate(d, [24, tap - 3], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }); hand = [420 + (up[0] - 420) * k, 640 + (up[1] - 640) * k]; }
      else if (d < tap) { const k = (d - (tap - 3)) / 3; hand = [up[0] + (tx - up[0]) * k, up[1] + (ty - up[1]) * k]; }
      else hand = [tx, ty];
      bodyFront(p, o, { mode: "stand", facing: 1, expr: d < tap ? "stern" : "laugh", hands: { r: hand }, seed, tilt: d >= tap && d < tap + 4 ? 0.05 : 0 });
      // palm faces the button: fingers point away from the shoulder
      const sx = 380, sy = 600, ang = Math.atan2(hand[1] - sy, hand[0] - sx) + Math.PI / 2;
      palm(g, hand[0], hand[1], ang, o.skin ?? SKIN);
      return;
    }
    const tu = Math.min(1, (d - tap - 12) / 5), bob = Math.sin((d - tap) / 4) * 4;
    const th: [number, number] = [300 + 175, 560 - 50 * tu + bob];
    bodyFront(p, o, { mode: "stand", facing: 0, expr: "grin", hands: { r: th }, seed, headTilt: -0.06, blink: d > tap + 26 && d < tap + 30 ? 1 : 0 });
    thumb(g, th[0], th[1], o.skin ?? SKIN);
  });
  return <canvas ref={ref} width={CW} height={CH} style={{ position: "absolute", opacity: op, transform: mir ? "scaleX(-1)" : undefined, transformOrigin: `${(OX + 300) * S}px 0`, filter: "drop-shadow(5px 0 0 #fffaf0) drop-shadow(-5px 0 0 #fffaf0) drop-shadow(0 5px 0 #fffaf0) drop-shadow(0 -5px 0 #fffaf0) drop-shadow(0 10px 0 rgba(18,12,22,0.45))", width: CW * S, height: CH * S, left: x - (OX + 300) * S, top: FEET - (OY + 975) * S }} />;
};

export const SubscribeTag: React.FC<Props> = ({ total, at, len = 96, tail = 8, top = 20, line = "a new paradox every day", outfit = MASCOT, seed = 41, mascot = true }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = layout(width, height, top), k = L.k;
  const start = at ?? (total ?? 0) - tail - len, d = f - start;
  if (d < 0 || d >= len) return null;

  const inU = interpolate(d, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
  const outU = interpolate(d, [len - 12, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const y = ((1 - inU) * 220 - outU * 160 + (d > 12 ? Math.sin(d / 9) * 5 : 0)) * k;
  const op = Math.min(1, d / 5) * (1 - outU);
  const sc = (0.82 + 0.18 * inU) * k;

  const TAP = SLAP_TAP;
  const subbed = d >= TAP;
  const btnPop = d >= TAP && d < TAP + 8 ? 1 + 0.16 * Math.sin(((d - TAP) / 8) * Math.PI) - (d < TAP + 2 ? 0.2 : 0) : 1;
  const ring = subbed && d < TAP + 22 ? 22 * Math.sin((d - TAP) * 1.3) * (1 - (d - TAP) / 22) : 0;
  const ripple = d - TAP;
  const shake = d >= TAP && d < TAP + 6 ? Math.sin((d - TAP) * 3) * 10 * k * (1 - (d - TAP) / 6) : 0;
  const smack = mascot && d >= TAP && d < TAP + 14;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
      <div style={{ position: "absolute", left: L.cardX, top: L.cardY, opacity: op, transform: `translate(-50%, -50%) translateY(${y}px) scale(${sc})` }}>
        <div style={{ width: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, background: "#fffaf0", border: `10px solid ${INK}`, borderRadius: 44, padding: "28px 34px 32px", boxShadow: `0 14px 0 rgba(18,12,22,0.55)`, fontFamily }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, alignSelf: "stretch" }}>
            <div style={{ width: 120, height: 120, flex: "0 0 120px", borderRadius: 60, border: `8px solid ${INK}`, overflow: "hidden", boxSizing: "border-box" }}>
              <Img src={staticFile("brand/avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontWeight: 900, fontSize: 64, color: INK, lineHeight: 1 }}>Paradox Town</div>
              <div style={{ fontWeight: 700, fontSize: 34, color: "#6b5d63", lineHeight: 1.1, whiteSpace: "nowrap" }}>{line}</div>
            </div>
          </div>
          <div style={{ position: "relative", transform: `scale(${btnPop})` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: subbed ? "#d9d4cf" : RED, color: subbed ? INK : "#fff", border: `9px solid ${INK}`, borderRadius: 999, padding: subbed ? "16px 40px 16px 30px" : "18px 64px", fontWeight: 900, fontSize: 58, letterSpacing: 2, boxShadow: `0 8px 0 rgba(18,12,22,0.45)` }}>
              {subbed ? <Bell ring={ring} /> : null}
              {subbed ? "SUBSCRIBED" : "SUBSCRIBE"}
            </div>
            {ripple >= 0 && ripple < 14 ? (
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 60 + ripple * 30, height: 60 + ripple * 30, borderRadius: "50%", border: `8px solid ${RED}`, opacity: 1 - ripple / 14, transform: "translate(-50%, -50%)" }} />
            ) : null}
          </div>
        </div>
      </div>
      {mascot ? <Mascot d={d} tap={TAP} slapAt={[L.cardX, L.cardY + 69 * k]} o={outfit} seed={seed} op={op} L={L} /> : null}
      {smack ? (
        <div style={{ position: "absolute", left: L.cardX + (L.mir ? -540 : 250) * k, top: L.cardY + (L.mir ? -20 : 69 - 130) * k, opacity: op, transform: `translate(-50%, -50%) rotate(${L.mir ? -12 : 12}deg) scale(${(0.6 + 0.6 * Math.min(1, (d - TAP) / 3)) * k})`, fontFamily, fontWeight: 900, fontSize: 96, color: "#ffd23a", WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill", letterSpacing: 2 }}>SMACK!</div>
      ) : null}
    </AbsoluteFill>
  );
};
