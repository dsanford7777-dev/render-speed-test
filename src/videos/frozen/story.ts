// The Great Stink Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is ever still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen left).
import { Expr } from "../bridge/toon";
import { V3, FPS, Rm, Rv, St, Sw, TABLE, WATER, PUMP, SEWER, SEWER_LAMPS, SET } from "./place";
import { SEG_TIMES, TOTAL, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const TMP = ["hook", "outside", "scientist", "summer", "left", "clerk", "curtains", "nohelp", "meeting", "move", "thing", "noses", "same", "days"];
const CUTS: [string, number][] = SEG_TIMES.map((_, i) => [TMP[i], A(i)] as [string, number]);
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number;
  /** holds a handkerchief over the nose */
  hanky?: boolean;
  /** walking in profile: step phase 0..1; mirror = moving toward -x; carry = a point in the world both hands hold out to */
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 } };
export type Tool = { kind: "brush" | "shovel" | "pick" | "quill"; g: V3; b: V3 };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "hanky" | "drop" | "stink";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type St3 = {
  light: "room" | "river" | "street" | "sewer"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  /** the curtains: soaked or dry */
  wet?: boolean;
  /** the river's level (place.ts WATER), and how hard the sewer mouths pour (0..1) */
  river?: number; pour?: number;
  tools?: Tool[]; buckets?: { p: V3; brown?: boolean }[]; cards?: Card[]; puffs?: Puff[];
  news?: { p: V3; yaw: number; tilt: number; roll?: number; s: number } | null; bill?: { p: V3; yaw: number; tilt?: number } | null; plan?: { p: V3; yaw: number; tilt?: number } | null;
  bags?: V3[]; cases?: { p: V3; yaw: number }[]; crates?: { p: V3; yaw: number; tilt?: number }[];
  /** the parish pump running; the sewer still being built; how much water runs in it (0 = a trickle, 1 = today) */
  pump?: boolean; works?: boolean; flow?: number;
  /** the lamp the sewer's shadows fall from */
  key?: V3;
};

// ---------------- helpers (the house kit) ----------------
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const expo = (u: number) => { const x = clamp01(u); return x >= 1 ? 1 : 1 - Math.pow(2, -9 * x); };
const rad = (d: number) => (d * Math.PI) / 180;
const L3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
type Shot = Partial<Cam> & { pos: V3; look: V3 };
const full = (c: Shot): Cam => ({ fov: 42, roll: 0, ...c });
const mix = (a: Cam, b: Cam, k: number): Cam => ({ pos: L3(a.pos, b.pos, k), look: L3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k });
const move = (a: Shot, b: Shot, f: number, f0: number, f1: number, ease: (u: number) => number = expo, creep = 0.0012): Cam => {
  const c = mix(full(a), full(b), ease((f - f0) / Math.max(1, f1 - f0)));
  const k = 1 - Math.exp(-creep * Math.max(0, f - f1));
  return { ...c, pos: L3(c.pos, c.look, k) };
};
const orb = (c: V3, a: number, r: number, h: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [c[0] + r * Math.sin(rad(a)), c[1] + h, c[2] - r * Math.cos(rad(a))], look: c, ...rest });
const orbit = (s: ShotDef, f: number, c: V3, a: [number, number], r: [number, number], h: [number, number], fov = 46, roll: [number, number] = [0.05, -0.04], ease = smooth): Cam => {
  const u = ease((f - s.a) / Math.max(1, s.b - s.a));
  return full(orb(c, a[0] + (a[1] - a[0]) * u, r[0] + (r[1] - r[0]) * u, h[0] + (h[1] - h[0]) * u, { fov, roll: roll[0] + (roll[1] - roll[0]) * u }));
};
const snap = (pos: V3, look: V3, f: number, f0: number, rest: Partial<Cam> = {}, back = 1.5, n = 5): Cam => {
  const far: V3 = [look[0] + (pos[0] - look[0]) * back, look[1] + (pos[1] - look[1]) * back, look[2] + (pos[2] - look[2]) * back];
  const fov = rest.fov ?? 42;
  return move({ pos: far, look, ...rest, fov: fov * 1.25 }, { pos, look, ...rest, fov }, f, f0, f0 + n, expo, 0.0015);
};
const kick = (c: Cam, f: number, f0: number, k = 1): Cam => {
  if (f < f0 || f >= f0 + 7) return c;
  const e = f - f0, s = (e % 2 ? -1 : 1) * k * (1 - e / 7), d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const a = 0.012 * Math.max(1.2, Math.min(40, d));
  return { ...c, pos: [c.pos[0], c.pos[1] + a * s, c.pos[2] + 0.6 * a * s], roll: c.roll + 0.014 * s };
};
const t = (f: number) => f / FPS;
const U = (s: ShotDef, f: number) => clamp01((f - s.a) / Math.max(1, s.b - s.a));
const P = (who: string, p: V3, expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => ({ who, p, expr, look, ...extra });
/** someone walking in profile along x from x0 at v m/s */
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", extra: Partial<Person3> = {}, carry?: (p: V3) => V3): Person3 => {
  const d = Math.abs(v) * tt, p: V3 = [x0 + v * tt, y, z];
  return { who, p, expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: Math.min(1.25, Math.abs(v) / 1.6), carry: carry ? carry(p) : undefined }, ...extra };
};
const add = (p: V3, x: number, y: number, z: number): V3 => [p[0] + x, p[1] + y, p[2] + z];

// ---------------- the stink ----------------
const GREEN: [number, number, number] = [0.74, 0.8, 0.34];
/** wavy stink lines rising from a row of points */
const stinks = (pts: V3[], tt: number, s = 1, rise = 0.7): Card[] => pts.map((p, i) => { const u = (tt * 0.5 + i * 0.37) % 1; return { kind: "stink" as const, p: [p[0] + 0.06 * Math.sin(tt * 3 + i), p[1] + rise * u, p[2]] as V3, spin: 0.14 * Math.sin(tt * 2.3 + i * 1.7), s: s * (0.75 + 0.35 * Math.sin(Math.PI * u)) }; });
/** soft green haze drifting over a patch */
const haze = (c: V3, tt: number, n: number, spread: number, size: number, a = 0.3): Puff[] => Array.from({ length: n }, (_, i) => { const u = (tt * 0.12 + i / n) % 1; return { p: [c[0] + spread * Math.sin(i * 2.4 + tt * 0.3), c[1] + 1.6 * u, c[2] + spread * 0.6 * Math.cos(i * 1.9)] as V3, s: size * (0.7 + 0.8 * u), c: GREEN, a: a * Math.sin(Math.PI * u) }; });

// ---------------- the room as the shots use it ----------------
const TY = TABLE.y;
/** the man soaking the middle window's left-hand drape: where he stands, his brush stroke k (0 = high, 1 = low) */
const SOAK: V3 = Rm(1.85, 0, 4.12);
const soak = (ph: number) => { const k = 0.5 + 0.5 * Math.sin(ph * 7), bp = Rm(1.02, 2.02 - 0.8 * k, 4.6), hand = Rm(1.5, 1.52 - 0.34 * k, 4.3);
  const drops: Card[] = Array.from({ length: 9 }, (_, i) => { const u = (ph * 1.5 + i * 0.111) % 1; return { kind: "drop" as const, p: Rm(1.02 + 0.22 * Math.sin(i * 2.1), 1.95 - 0.25 * (i % 3) - 1.8 * u * u, 4.52) as V3, spin: 0, s: 1.1 }; });
  return { tool: { kind: "brush" as const, g: hand, b: bp }, hand, drops, man: (expr: Expr, extra: Partial<Person3> = {}) => P("hand1", SOAK, expr, 1, { hw: [hand], ...extra }) }; };
const HOOK_POS: V3 = Rm(1.25, 1.25, 1.8), HOOK_LOOK: V3 = Rm(1.56, 1.32, 4.7), HOOK = { fov: 46, roll: 0.06 };
// frame 0 is already close on the brush and the curtain (it is also the last frame: the film loops)
const hookCam = (f: number) => snap(HOOK_POS, HOOK_LOOK, f, 0, HOOK, 1.1, 8);
const hookState = (ph: number): Partial<St3> => { const sk = soak(ph); return { light: "room", wet: true, tools: [sk.tool], buckets: [{ p: Rm(1.25, 0, 3.75) }], cards: sk.drops, people: [sk.man("grin", { extra: true })] }; };
/** the bench crowd: members standing in front of the benches, both sides */
const BENCH_L: V3[] = [Rm(2.65, 0, 0.5), Rm(2.6, 0, 1.75), Rm(2.65, 0, 3.0)], BENCH_R: V3[] = [Rm(-2.65, 0, 0.9), Rm(-2.6, 0, 2.15), Rm(-2.65, 0, 3.3)];
const crowd = (expr: Expr[], hanky: boolean, wave?: number): Person3[] => [
  ...["mp1", "mp2", "mp3"].map((n, i) => P(n, BENCH_L[i], expr[i % expr.length], -1, { hanky, wave, extra: true })),
  ...["mp5", "mp6", "mp4"].map((n, i) => P(n, BENCH_R[i], expr[(i + 1) % expr.length], 1, { hanky, wave, extra: true }))];
/** the dash for the door: where the chancellor is, tr seconds after he bolts */
const RUN_V = 2.5;
const runAt = (tr: number): V3 => { const x = 1.2 - RUN_V * Math.max(0, tr); return Rm(x, 0, -0.9 - 0.34 * (1.2 - x)); };
const runner = (tr: number, expr: Expr): { man: Person3; papers: Card[]; gone: boolean } => { const p = runAt(tr), d = RUN_V * Math.max(0, tr), gone = p[0] < SET.room[0] - 6.1;
  const man: Person3 = { who: "chancellor", p, expr, hanky: true, side: { phase: (d / 1.9) % 1, mirror: true, stride: 1.25, carry: add(p, -0.3, 1.36, 0) } };
  const papers: Card[] = Array.from({ length: 7 }, (_, i) => { const age = (tr * 1.3 + i * 0.143) % 1, back = runAt(tr - 0.12 - age * 0.9); return { kind: "paper" as const, p: [back[0] + 0.1 * Math.sin(i * 3), 1.15 + 0.5 * Math.sin(Math.PI * age) - 0.9 * age * age + 0.1 * (i % 3), back[2] - 0.15 + 0.1 * (i % 2)] as V3, spin: age * 5 + i, s: 0.9 }; });
  return { man, papers: tr > 0.15 ? papers : [], gone }; };

// ---------------- the river ----------------
const riverStink = (tt: number, lv: number, n = 8): Card[] => stinks(Array.from({ length: n }, (_, i) => Rv(-7 + i * 2.1 + 0.7 * Math.sin(i * 5), lv + 0.1, 3 + 5 * ((i * 0.37) % 1)) as V3), tt, 1.5, 1.2);

// ---------------- the sewer ----------------
const LAMP = (i: number): V3 => Sw(0, SEWER.wall + 0.4 + SEWER.r - 1.15, SEWER_LAMPS[i]);
const dig = (tt: number): { people: Person3[]; tools: Tool[]; plan: St3["plan"]; buckets: St3["buckets"] } => {
  const k = 0.5 + 0.5 * Math.sin(tt * 5.5), k2 = 0.5 + 0.5 * Math.sin(tt * 4.2 + 1.2);
  const g1 = Sw(1.02, 1.05 + 0.15 * k, 2.8), b1 = Sw(0.62, 0.12 + 0.3 * k, 3.25), g2 = Sw(-1.0, 1.3 + 0.45 * k2, 6.2), b2 = Sw(-1.95, 2.3 - 1.2 * k2, 6.45);
  return { tools: [{ kind: "shovel", g: g1, b: b1 }, { kind: "pick", g: g2, b: b2 }],
    people: [P("navvy1", Sw(1.3, 0, 3.0), "stern", -1, { hw: [g1, L3(g1, b1, 0.45)], extra: true }), P("navvy2", Sw(-1.28, 0, 6.5), "stern", 1, { hw: [g2, L3(g2, b2, 0.4)] }),
      P("engineer", Sw(-1.3, 0, 3.4), "smile", 1, { hw: [Sw(-1.52, 1.18, 3.2), Sw(-1.02, 1.18, 3.2)] }), P("navvy3", Sw(1.32, 0, 8.4), "neutral", -1, { hw: [Sw(1.05, 0.72, 8.2)], extra: true })],
    plan: { p: Sw(-1.27, 1.2, 3.17), yaw: 0, tilt: -0.5 }, buckets: [{ p: Sw(1.05, 0.38, 8.2), brown: true }] }; };

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // hook: a man slaps lime wash onto a heavy red curtain, drips flying
  hook: (s, f) => ({ ...hookState(t(f)), light: "room", dof: 2, closeup: true, focus: Rm(1.1, 1.9, 4.6), cam: kick(hookCam(f), f, W(0, "bleach"), 1.0), subjects: [["the curtain", Rm(1.02, 2.2, 4.62), 0.3]] }),
  // the most powerful men in the country: three members in top hats, handkerchiefs to their noses
  gag: (s, f) => { const tt = t(f - s.a);
    return { light: "room", dof: 2, wet: true, focus: Rm(0, 1.45, -1.0),
      cam: move({ pos: Rm(-0.9, 1.0, -5.6), look: Rm(0, 1.5, -1.0), fov: 46, roll: -0.07 }, { pos: Rm(0.4, 1.2, -5.1), look: Rm(0, 1.5, -1.0), fov: 42, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("chief", Rm(0.0, 0, -1.25), "pained", 0, { hanky: true }), P("mp1", Rm(0.62, 0, -0.8), "dazed", -1, { hanky: true }), P("mp2", Rm(-0.62, 0, -0.9), "shock", 1, { hanky: true })],
      cards: stinks([Rm(0.5, 1.7, -0.6), Rm(-0.55, 1.8, -0.7), Rm(1.6, 1.5, -0.4), Rm(-1.6, 1.6, -0.5)], tt, 0.9), puffs: haze(Rm(0, 1.2, 0.6), tt, 5, 1.6, 1.3, 0.22) }; },
  // ...couldn't breathe in their own building: the long gothic front and the clock tower, the stink rising to it
  building: (s, f) => { const tt = t(f - s.a);
    return { light: "river", dof: 0, river: WATER.high, focus: Rv(30, 14, 16),
      cam: move({ pos: Rv(21.5, 1.3, -4.7), look: Rv(41, 24, 20), fov: 66, roll: 0.08 }, { pos: Rv(18.5, 2.6, -4.9), look: Rv(39, 20, 20), fov: 60, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      cards: stinks([Rv(19, 0.4, 2), Rv(23, 0.4, 5), Rv(27, 0.6, 8), Rv(22, 2, 10), Rv(30, 3, 11)], tt, 2.4, 2.4), puffs: haze(Rv(26, 0.5, 6), tt, 6, 6, 5, 0.25) }; },
  // right outside their windows ran a river: down from the terrace onto the brown water
  outside: (s, f) => { const tt = t(f - s.a);
    return { light: "river", dof: 0, river: WATER.high, focus: Rv(-2, -0.4, 5),
      cam: move({ pos: Rv(6.0, 6.4, -6.5), look: Rv(4.5, 0.3, 9), fov: 60, roll: -0.06 }, { pos: Rv(5.0, 3.4, -7.5), look: Rv(4.5, 0.4, 7), fov: 54, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      cards: riverStink(tt, WATER.high, 6), puffs: haze(Rv(4, -0.2, 5), tt, 5, 5, 3.5, 0.2), subjects: [["the river", Rv(4.5, WATER.high, 5), 0.5]] }; },
  // nearly three million people: the sewer mouths in the wall, every one of them pouring
  million: (s, f) => { const tt = t(f - s.a), lv = WATER.high;
    return { light: "river", dof: 1, river: lv, pour: 1, focus: Rv(0, -0.4, 12),
      cam: move({ pos: Rv(-4.6, 0.25, 4.6), look: Rv(-2, 0.2, 12), fov: 58, roll: 0.07 }, { pos: Rv(2.4, 0.5, 5.6), look: Rv(1.5, 0.1, 12), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      puffs: [...[0, 6.5, -6.5].flatMap((x, i) => [0, 1].map((k) => ({ p: Rv(x + 0.3 * Math.sin(tt * 7 + i + k), lv + 0.15, 11.5 - 0.3 * k) as V3, s: 0.9 + 0.3 * Math.sin(tt * 9 + i), c: [0.62, 0.52, 0.3] as [number, number, number], a: 0.5 }))), ...haze(Rv(0, lv, 9), tt, 4, 5, 2.4, 0.2)],
      subjects: [["a sewer mouth", Rv(0, 0.35, 11.9), 0.4]] }; },
  // flushing their toilets straight into it: the camera rides the gutter down the court to the arch and the river
  flush: (s, f) => { const u = smooth(U(s, f)), tt = t(f - s.a), z = -7.5 + 11.5 * u, tip = 0.5 + 0.5 * Math.sin(tt * 3);
    return { light: "street", dof: 1, focus: St(0, 0.3, z + 6),
      cam: { pos: St(0.12, 0.42 + 0.1 * u, z), look: St(0, 0.45, z + 8), fov: 62, roll: 0.05 - 0.09 * u },
      people: [P("mother", St(-1.45, 0, 0.9), "neutral", 1, { hw: [St(-0.95, 0.75 + 0.1 * tip, 0.85)], extra: true }), P("poor1", St(1.6, 0, 4.4), "neutral", -1, { hw: [St(1.1, 0.7, 4.3)], extra: true }), P("kid", St(1.3, 0, -2.6), "neutral", -1, { extra: true })],
      buckets: [{ p: St(-0.95, 0.42 + 0.1 * tip, 0.85), brown: true }, { p: St(1.1, 0.4, 4.3), brown: true }],
      puffs: haze(St(0, 0.1, z + 5), tt, 4, 1.0, 1.0, 0.2) }; },
  // a famous scientist warned them: on the jetty, dropping white cards into the water; they vanish at once
  scientist: (s, f) => { const tt = t(f - s.a), hand = Rv(-0.2, 1.42, 0.55);
    const cards: Card[] = Array.from({ length: 4 }, (_, i) => { const u = (tt * 0.9 + i * 0.25) % 1, y = 1.4 - 2.2 * u * u; return { kind: "paper" as const, p: Rv(-0.3 - 0.12 * i + 0.1 * Math.sin(u * 9 + i), y, 0.9 + 0.5 * u) as V3, spin: u * 4 + i, s: 0.6 }; }).filter((c) => c.p[1] > WATER.high + 0.02);
    return { light: "river", dof: 2, river: WATER.high, focus: Rv(0.3, 1.4, 0.6),
      cam: orbit(s, f, Rv(0.1, 1.15, 0.6), [-28, -6], [4.4, 3.8], [0.1, 0.4], 46, [0.06, -0.03]),
      people: [P("scientist", Rv(0.35, 0.54, 0.45), "stern", 1, { hw: [hand] })], cards: [...cards, { kind: "paper", p: hand, spin: 0.2, s: 0.6 }, ...riverStink(tt, WATER.high, 3)],
      subjects: [["the scientist's card", hand, 0.3]] }; },
  // newspapers begged them: the front page flies at the lens
  papers: (s, f) => { const u = expo(U(s, f) * 1.5), tt = t(f - s.a);
    return { light: "room", dof: 1, focus: Rm(0, 1.5, -1), cam: { pos: Rm(0.1, 1.5, -5.0), look: Rm(0, 1.55, 0.5), fov: 44, roll: 0.03 },
      news: { p: L3(Rm(0.6, 2.4, 2.0), Rm(0.08, 1.52, -2.6), u), yaw: 0.5 * (1 - u), tilt: -0.3 * (1 - u), roll: (1 - u) * 5.5 + 0.05 * Math.sin(tt * 5), s: 0.4 + 0.56 * u },
      people: crowd(["stern", "neutral"], false), subjects: [["the front page", Rm(0.08, 1.52, -2.6), 0.6]] }; },
  // and for years they gave the same answer: a slide along three members who could not care less
  years: (s, f) => ({ light: "room", dof: 3, focus: Rm(0.5, 1.45, -0.3),
    cam: move({ pos: Rm(-1.6, 1.5, -5.2), look: Rm(0.15, 1.45, -0.3), fov: 30, roll: -0.04 }, { pos: Rm(1.8, 1.5, -5.2), look: Rm(1.05, 1.45, -0.3), fov: 30, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("chief", Rm(0.6, 0, -0.4), "neutral", 0), ...crowd(["stern", "neutral"], false)] }),
  // too expensive: snap to the stout senior member, his hand up
  expensive: (s, f) => ({ light: "room", dof: 3, closeup: true, focus: Rm(0.6, 1.45, -0.4),
    cam: kick(snap(Rm(0.95, 1.5, -2.75), Rm(0.6, 1.5, -0.4), f, s.a, { fov: 36, roll: -0.06 }, 1.5, 5), f, W(2, "expensive"), 0.9),
    people: [P("chief", Rm(0.6, 0, -0.4), "stern", 0, { wave: 1 }), P("mp2", Rm(-0.55, 0, -0.2), "stern", 1, { extra: true }), P("mp4", Rm(1.75, 0, -0.1), "stern", -1, { extra: true })] }),
  // then came a brutally hot summer: the whole river front under a white sun
  summer: (s, f) => { const tt = t(f - s.a);
    return { light: "river", dof: 0, river: WATER.high, focus: Rv(0, 3, 14),
      cam: move({ pos: Rv(-8, 6.5, -12), look: Rv(4, 16, 18), fov: 64, roll: -0.05 }, { pos: Rv(-6.5, 2.4, -10.5), look: Rv(2, 5, 14), fov: 56, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("toff2", Rv(-4.4, 0.5, -6.6), "pained", 1, { hanky: true, extra: true })],
      puffs: [{ p: Rv(10, 44, 80), s: 70, c: [1.0, 0.9, 0.6], a: 0.55, add: true }, { p: Rv(10, 44, 80), s: 26, c: [1.0, 0.97, 0.85], a: 0.9, add: true }, ...haze(Rv(0, 0, 5), tt, 4, 7, 4, 0.16)] }; },
  // the river dropped: the water sinks away, the barge grounds, the mud and the sewer mouths come out
  dropped: (s, f) => { const u = smooth(U(s, f) * 1.15), tt = t(f - s.a), lv = WATER.high + (WATER.low - WATER.high) * u;
    return { light: "river", dof: 0, river: lv, pour: 0.8, focus: Rv(-6, -1, 7),
      cam: move({ pos: Rv(5.6, 1.1, -3.6), look: Rv(1.5, -0.6, 9), fov: 56, roll: 0.06 }, { pos: Rv(5.0, 0.5, -3.2), look: Rv(1.0, -1.0, 9), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      cards: riverStink(tt, lv, 4) }; },
  // the sun cooked what was left: close on the bare mud, steaming
  cooked: (s, f) => { const tt = t(f - s.a);
    return { light: "river", dof: 2, river: WATER.low, pour: 0.6, focus: Rv(2.2, -1.4, 9.2),
      cam: move({ pos: Rv(5.2, -0.5, 5.4), look: Rv(2.2, -1.4, 9.4), fov: 46, roll: -0.07 }, { pos: Rv(4.2, -0.9, 6.0), look: Rv(2.0, -1.3, 9.4), fov: 42, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      cards: stinks([Rv(2.6, -1.3, 9.0), Rv(1.2, -1.2, 9.8), Rv(3.6, -1.1, 10.2), Rv(0.2, -1.4, 8.6), Rv(4.4, -1.5, 8.2)], tt, 1.2, 1.0), puffs: haze(Rv(2.4, -1.7, 8.2), tt, 5, 1.6, 1.2, 0.2),
      subjects: [["the mud", Rv(2.2, -1.5, 9.2), 0.6]] }; },
  // and the smell climbed the walls: stink lines crawl up the terrace wall to the windows; the camera climbs with them
  climbed: (s, f) => { const u = smooth(U(s, f)), tt = t(f - s.a);
    return { light: "river", dof: 0, river: WATER.low, pour: 0.6, focus: Rv(0, 2 + 6 * u, 13),
      cam: move({ pos: Rv(-2.0, -0.7, 4.5), look: Rv(-0.5, 0.2, 12), fov: 58, roll: 0.07 }, { pos: Rv(-1.6, 5.8, 5.6), look: Rv(0, 9.5, 16.5), fov: 54, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      cards: Array.from({ length: 9 }, (_, i) => { const y = -1.4 + 11 * u + 1.3 * ((i * 0.37) % 1) - 0.5 * (i % 3); return { kind: "stink" as const, p: Rv(-3.4 + i * 0.85, y, y > 3.3 ? 15.6 : 11.5) as V3, spin: 0.14 * Math.sin(tt * 2.3 + i * 1.7), s: 2.6 }; }),
      puffs: haze(Rv(0, -1 + 10 * u, 11), tt, 5, 3, 2.6, 0.25) }; },
  // anyone who could afford to left the city: carpet bags and handkerchiefs hurrying along the quay
  left: (s, f) => { const tt = t(f - s.a), z = -6.7, carry = (p: V3): V3 => add(p, -0.45, 0.95, 0);
    const X = SET.river[0], ps = [walker("toff", X + 2.0, 0.5, z, -1.9, tt, "nervous", {}, carry), walker("lady", X + 3.5, 0.5, z - 0.35, -1.9, tt, "pained", { hanky: true }), walker("toff2", X + 5.1, 0.5, z + 0.1, -1.9, tt, "dazed", {}, carry)];
    return { light: "river", dof: 1, river: WATER.low, pour: 0.5, focus: Rv(1.0 - 1.9 * tt + 1.4, 1.6, z),
      cam: move({ pos: Rv(2.8, 1.5, -12.2), look: Rv(2.2, 1.7, z), fov: 46, roll: 0.05 }, { pos: Rv(-0.6, 1.6, -12.0), look: Rv(-1.2, 1.7, z), fov: 44, roll: -0.03 }, f, s.a, s.b, (x) => x, 0),
      people: ps, cases: [ps[0], ps[2]].map((q) => ({ p: add(q.p, -0.45, 0.72, 0), yaw: 0 })), cards: riverStink(tt, WATER.low, 4) }; },
  // so a clerk asks, "Should we fix the river?"
  clerk: (s, f) => { const tt = t(f - s.a);
    return { light: "room", dof: 3, focus: Rm(-0.7, 1.45, -1.3),
      cam: move({ pos: Rm(0.5, 1.45, -4.4), look: Rm(-0.55, 1.5, -1.3), fov: 38, roll: 0.05 }, { pos: Rm(0.2, 1.5, -4.0), look: Rm(-0.5, 1.5, -1.3), fov: 36, roll: 0.0 }, f, s.a, s.b, smooth, 0),
      people: [P("clerk", Rm(-0.7, 0, -1.3), "nervous", -1, { hw: [Rm(-1.25, 1.55 + 0.05 * Math.sin(tt * 6), -1.3)] }), P("chief", Rm(0.75, 0, -1.0), "stern", 1, { hanky: true, extra: true })],
      cards: stinks([Rm(-1.7, 1.6, -0.6), Rm(1.6, 1.7, -0.4)], tt, 0.9) }; },
  // "No. Soak the curtains."
  no: (s, f) => { const tt = t(f - s.a);
    return { light: "room", dof: 3, closeup: true, focus: Rm(0.75, 1.45, -1.0),
      cam: kick(snap(Rm(-0.15, 1.5, -3.2), Rm(0.7, 1.52, -1.0), f, s.a, { fov: 34, roll: -0.06 }, 1.5, 5), f, s.a + 2, 0.9),
      people: [P("chief", Rm(0.75, 0, -1.0), "stern", 0, { hw: [Rm(1.3, 1.75 + 0.04 * Math.sin(tt * 8), -1.0)] }), P("clerk", Rm(-0.7, 0, -1.3), "shock", -1, { extra: true })] }; },
  // curtains: two men with buckets and brushes slopping lime wash onto the drapes
  curtains: (s, f) => { const tt = t(f - s.a), sk = soak(tt), k2 = 0.5 + 0.5 * Math.sin(tt * 6 + 1.5), h2 = Rm(3.05, 1.7 - 0.45 * k2, 4.3), b2 = Rm(2.72, 2.7 - 1.4 * k2, 4.6);
    return { light: "room", dof: 1, wet: true, focus: Rm(1.6, 2.0, 4.6),
      cam: kick(move({ pos: Rm(-0.4, 2.3, -3.0), look: Rm(1.5, 2.2, 4.8), fov: 54, roll: -0.05 }, { pos: Rm(0.6, 1.9, -1.6), look: Rm(1.7, 2.2, 4.8), fov: 50, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, s.a + 2, 0.8),
      tools: [sk.tool, { kind: "brush", g: h2, b: b2 }], buckets: [{ p: Rm(1.25, 0, 3.75) }, { p: Rm(2.45, 0, 3.8) }],
      cards: [...sk.drops, ...Array.from({ length: 6 }, (_, i) => { const u = (tt * 1.4 + i * 0.166) % 1; return { kind: "drop" as const, p: Rm(2.72 + 0.2 * Math.sin(i * 2.7), 2.5 - 2.2 * u * u, 4.52) as V3, spin: 0, s: 1.1 }; })],
      people: [sk.man("stern"), P("hand2", Rm(3.3, 0, 4.1), "stern", -1, { hw: [h2], extra: true })] }; },
  // that was the plan: close on a soaked drape dripping into a bucket
  plan: (s, f) => { const tt = t(f - s.a);
    return { light: "room", dof: 3, wet: true, closeup: true, focus: Rm(-1.0, 1.6, 4.6),
      cam: move({ pos: Rm(-1.6, 0.9, 2.3), look: Rm(-1.05, 1.7, 4.7), fov: 46, roll: 0.07 }, { pos: Rm(-1.5, 1.1, 2.6), look: Rm(-1.05, 1.35, 4.7), fov: 42, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      buckets: [{ p: Rm(-1.0, 0, 4.4) }], cards: Array.from({ length: 10 }, (_, i) => { const u = (tt * 1.1 + i * 0.1) % 1; return { kind: "drop" as const, p: Rm(-1.3 + 0.065 * i, 0.62 - 0.3 * u * u + (i % 2) * 0.05, 4.5) as V3, spin: 0, s: 1.3 }; }),
      subjects: [["the wet curtain", Rm(-1.0, 1.8, 4.62), 0.3]] }; },
  // it didn't help: the stink drifts in past the dripping curtains all the same
  nohelp: (s, f) => { const u = U(s, f), tt = t(f - s.a);
    return { light: "room", dof: 1, wet: true, focus: Rm(0.6, 1.8, 2.6),
      cam: move({ pos: Rm(2.6, 1.5, -1.6), look: Rm(0.6, 2.1, 4.8), fov: 52, roll: 0.06 }, { pos: Rm(2.1, 1.6, -1.0), look: Rm(0.5, 2.0, 4.8), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      cards: Array.from({ length: 8 }, (_, i) => { const v = (u * 1.2 + i * 0.13) % 1; return { kind: "stink" as const, p: Rm(-0.5 + 0.35 * i + 0.4 * v, 1.6 + 0.5 * Math.sin(i * 1.3) + 0.4 * v, 4.9 - 4.2 * v) as V3, spin: 0.14 * Math.sin(tt * 2.3 + i * 1.7), s: 1.0 + 0.5 * v }; }),
      puffs: haze(Rm(0.4, 1.4, 3.2), tt, 6, 1.6, 1.5, 0.3), people: [P("mp3", Rm(1.25, 0, 1.9), "dazed", 1, { hanky: true })] }; },
  // men gave speeches through handkerchiefs: one at the table, the benches all doing the same
  speech: (s, f) => { const tt = t(f - s.a), orator = Rm(0.05, 0, 2.0);
    return { light: "room", dof: 1, wet: true, focus: Rm(0, 1.45, 2.0),
      cam: orbit(s, f, Rm(0, 1.35, 1.7), [-20, 12], [6.0, 5.2], [0.5, 0.8], 50, [0.05, -0.04]),
      people: [P("mp4", orator, "stern", 0, { hanky: true, hw: [Rm(0.6, 1.3 + 0.12 * Math.sin(tt * 7), 1.6)] }),
        P("mp1", Rm(1.8, 0, 1.0), "pained", -1, { hanky: true, extra: true }), P("mp2", Rm(1.95, 0, 2.5), "dazed", -1, { hanky: true, extra: true }), P("mp5", Rm(-1.8, 0, 1.2), "nervous", 1, { hanky: true, extra: true }), P("mp6", Rm(-1.95, 0, 2.7), "pained", 1, { hanky: true, extra: true })],
      cards: stinks([Rm(-1.2, 2.0, 3.6), Rm(1.3, 2.1, 3.4), Rm(0.2, 2.4, 4.2)], tt, 1.0) }; },
  // one meeting ended with the man in charge of the country's money...
  meeting: (s, f) => { const tt = t(f - s.a), p = runAt(0);
    return { light: "room", dof: 2, wet: true, focus: add(p, 0, 1.45, 0),
      cam: move({ pos: Rm(0.0, 1.45, -3.6), look: add(p, 0, 1.5, 0), fov: 40, roll: 0.05 }, { pos: Rm(0.5, 1.5, -3.2), look: add(p, 0, 1.5, 0), fov: 36, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("chancellor", p, tt > 0.7 ? "shock" : "nervous", 1, { hw: [add(p, 0.42, 1.1, -0.12)] }), ...crowd(["dazed", "pained"], true)],
      cards: [{ kind: "paper", p: add(p, 0.42, 1.14, -0.14), spin: 0.2, s: 0.9 }, { kind: "paper", p: add(p, 0.47, 1.12, -0.16), spin: -0.1, s: 0.9 }, ...stinks([add(p, -0.5, 1.5, 0.3), add(p, 0.9, 1.6, 0.4)], tt, 1.0)] }; },
  // ...running for the door
  run: (s, f) => { const tr = t(f - s.a), r = runner(tr, "shock"), p = r.man.p;
    return { light: "room", dof: 1, wet: true, focus: add(p, 0, 1.3, 0),
      cam: { pos: [p[0] + 1.3, 1.45, SET.room[2] - 7.2], look: [p[0] - 0.7, 1.25, p[2]], fov: 50, roll: 0.06 },
      people: [...(r.gone ? [] : [r.man]), ...crowd(["shock", "dazed"], true)], cards: r.papers }; },
  // papers in one hand, nose in the other: closer, still running, then out through the door
  hand: (s, f) => { const tr = t(f - SHOTS.find((x) => x.g === "run")!.a), r = runner(tr, "pained"), p = r.man.p, px = Math.max(p[0], SET.room[0] - 5.3);
    return { light: "room", dof: 2, wet: true, focus: [px, 1.3, p[2]],
      cam: { pos: [px + 0.5, 1.5, SET.room[2] - 6.6], look: [px - 0.25, 1.35, p[2]], fov: 34, roll: -0.05 },
      people: r.gone ? [] : [r.man], cards: r.papers }; },
  // they even talked about moving the whole government: members carrying crates of papers out
  move: (s, f) => { const tt = t(f - s.a), z1 = 1.6 - 1.3 * tt, z2 = 2.6 - 1.3 * tt, c1 = Rm(0.75, 1.02, z1 - 0.28), c2 = Rm(-0.8, 1.02, z2 - 0.28);
    return { light: "room", dof: 1, wet: true, focus: Rm(0, 1.2, z1),
      cam: move({ pos: Rm(-1.4, 1.1, -5.4), look: Rm(0.2, 1.3, 0.0), fov: 50, roll: -0.06 }, { pos: Rm(-0.8, 1.5, -5.0), look: Rm(0.1, 1.3, -0.4), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("mp1", Rm(0.75, 0, z1), "nervous", 0, { march: (tt * 1.9) % 1, hw: [add(c1, 0.3, -0.05, 0), add(c1, -0.3, -0.05, 0)] }), P("mp6", Rm(-0.8, 0, z2), "pained", 0, { march: (tt * 1.9 + 0.5) % 1, hw: [add(c2, 0.3, -0.05, 0), add(c2, -0.3, -0.05, 0)], extra: true }), P("chief", Rm(2.3, 0, -0.6), "stern", -1, { hanky: true, extra: true })],
      crates: [{ p: c1, yaw: 0 }, { p: c2, yaw: 0.1 }, { p: Rm(-2.2, 0.21, -1.9), yaw: 0.4 }, { p: Rm(-2.3, 0.63, -1.95), yaw: -0.2 }] }; },
  // ...to another town: from above, the room being packed up
  town: (s, f) => { const tt = t(f - s.a) + t(s.a - SHOTS.find((x) => x.g === "move")!.a), z1 = 1.6 - 1.3 * tt, z2 = 2.6 - 1.3 * tt, c1 = Rm(0.75, 1.02, z1 - 0.28), c2 = Rm(-0.8, 1.02, z2 - 0.28);
    return { light: "room", dof: 0, wet: true, focus: Rm(0, 0.8, -0.5),
      cam: move({ pos: Rm(0.6, 4.3, -5.6), look: Rm(0, 0.9, -0.2), fov: 56, roll: 0.06 }, { pos: Rm(0.2, 3.9, -6.0), look: Rm(0, 0.9, -0.6), fov: 52, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("mp1", Rm(0.75, 0, z1), "nervous", 0, { march: (tt * 1.9) % 1, hw: [add(c1, 0.3, -0.05, 0), add(c1, -0.3, -0.05, 0)], extra: true }), P("mp6", Rm(-0.8, 0, z2), "pained", 0, { march: (tt * 1.9 + 0.5) % 1, hw: [add(c2, 0.3, -0.05, 0), add(c2, -0.3, -0.05, 0)], extra: true }), P("chief", Rm(2.3, 0, -0.6), "stern", -1, { hanky: true, extra: true })],
      crates: [{ p: c1, yaw: 0 }, { p: c2, yaw: 0.1 }, { p: Rm(-2.2, 0.21, -1.9), yaw: 0.4 }, { p: Rm(-2.3, 0.63, -1.95), yaw: -0.2 }] }; },
  // but here's the thing: down past the washing into the court
  thing: (s, f) => { const tt = t(f - s.a);
    return { light: "street", dof: 0, focus: St(0, 1.3, 1.5),
      cam: move({ pos: St(0.5, 4.6, -8.8), look: St(0, 2.6, 2), fov: 60, roll: 0.07 }, { pos: St(0.35, 2.0, -6.4), look: St(0.1, 1.3, 1.5), fov: 54, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: court(tt, false), buckets: [{ p: St(-0.55, 0, 0.2), brown: true }], cards: stinks([St(-0.2, 0.2, 3), St(0.2, 0.2, 5.5)], tt, 1.1, 0.9), puffs: haze(St(0, 0.2, 4), tt, 4, 1.2, 1.4, 0.22) }; },
  // the poor had been breathing that river for decades: a long lens along their faces
  poor: (s, f) => { const tt = t(f - s.a);
    return { light: "street", dof: 3, focus: St(-1.0, 1.25, 1.9),
      cam: move({ pos: St(0.9, 1.3, -4.0), look: St(-1.3, 1.15, 2.4), fov: 30, roll: -0.05 }, { pos: St(-0.4, 1.3, -4.0), look: St(-0.5, 1.15, 1.4), fov: 30, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: court(tt, false).map((q) => (q.who === "oldman" ? q : { ...q, extra: true })), buckets: [{ p: St(-0.55, 0, 0.2), brown: true }], cards: stinks([St(-1.7, 1.5, 3.0), St(-0.2, 1.4, 2.6), St(0.6, 1.5, 3.2)], tt, 0.9) }; },
  // ...and drinking it: the pump runs brown
  drinking: (s, f) => { const tt = t(f - s.a);
    return { light: "street", dof: 2, pump: true, focus: St(0.95, 0.8, 1.6),
      cam: kick(snap(St(0.2, 1.25, -3.0), St(1.5, 1.0, 1.4), f, s.a, { fov: 46, roll: 0.06 }, 1.3, 5), f, s.a + 2, 0.8),
      people: court(tt, true).filter((q) => q.who === "mother"), puffs: [0, 1, 2].map((i) => ({ p: St(PUMP[0] - 0.55 + 0.12 * Math.sin(tt * 9 + i * 2), 0.36 + 0.06 * i, PUMP[2] - 0.05) as V3, s: 0.34, c: [0.6, 0.48, 0.26] as [number, number, number], a: 0.55 })), subjects: [["the pump", St(PUMP[0] - 0.3, 1.0, PUMP[2]), 0.4]] }; },
  // nobody rushed for them: a gentleman hurries past the end of the court with his nose covered and does not look in
  nobody: (s, f) => { const tt = t(f - s.a);
    return { light: "street", dof: 1, focus: St(0, 1.3, -1),
      cam: move({ pos: St(0.3, 1.5, -11.6), look: St(0, 1.4, 0), fov: 46, roll: 0.04 }, { pos: St(-0.2, 1.5, -11.2), look: St(0, 1.4, 0), fov: 44, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [walker("toff", SET.street[0] + 0.95, 0, -8.4, -1.35, tt, "pained", { hanky: true }), ...court(tt, false).map((q) => ({ ...q, extra: true }))], buckets: [{ p: St(-0.55, 0, 0.2), brown: true }] }; },
  // this time it was their own noses: a slow line of members, then right in on one nose
  noses: (s, f) => ({ light: "room", dof: 3, wet: true, closeup: true, focus: Rm(0.2, 1.42, -1.0),
    cam: kick(snap(Rm(0.45, 1.45, -3.0), Rm(0.2, 1.42, -1.0), f, s.a + 14, { fov: 30, roll: 0.05 }, 2.2, 10), f, W(11, "noses"), 0.8),
    people: [P("chief", Rm(0.2, 0, -1.0), "pained", 0, { hanky: true }), P("mp1", Rm(1.25, 0, -0.8), "dazed", -1, { hanky: true, extra: true }), P("mp2", Rm(-0.9, 0, -0.85), "shock", 1, { hanky: true, extra: true }), P("mp5", Rm(-1.95, 0, -0.6), "pained", 1, { hanky: true, extra: true })] }),
  // so the same men who had argued for years: all of them round the table at once
  same: (s, f) => ({ light: "room", dof: 1, wet: true, focus: Rm(0, 1.2, 0.9),
    cam: orbit(s, f, Rm(0, 1.15, 0.9), [22, -8], [5.6, 4.8], [1.3, 0.9], 48, [-0.06, 0.04]),
    people: [P("chief", Rm(0.0, 0, 2.0), "stern", 0, { hanky: true }), P("clerk", Rm(1.05, 0, 2.05), "nervous", -1, { hanky: true, extra: true }), P("mp1", Rm(2.0, 0, 0.9), "stern", -1, { hanky: true, extra: true }), P("mp2", Rm(-2.0, 0, 0.9), "stern", 1, { hanky: true, extra: true }), P("mp5", Rm(-1.1, 0, 2.05), "pained", 1, { hanky: true, extra: true })],
    bill: { p: Rm(0, TY + 0.012, 0.78), yaw: 0 } }),
  // wrote a law: the quill on the bill
  law: (s, f) => { const tt = t(f - s.a), tip = Rm(0.02 + 0.12 * Math.sin(tt * 9), TY + 0.03, 0.9 + 0.03 * Math.sin(tt * 13)), top = add(tip, 0.1, 0.3, 0.16);
    return { light: "room", dof: 2, wet: true, closeup: true, focus: Rm(0, TY, 0.8),
      cam: move({ pos: Rm(0.5, 2.2, -0.9), look: Rm(0, TY, 0.82), fov: 42, roll: 0.07 }, { pos: Rm(0.25, 1.9, -0.6), look: Rm(0, TY, 0.82), fov: 38, roll: 0.0 }, f, s.a, s.b, smooth, 0),
      bill: { p: Rm(0, TY + 0.012, 0.78), yaw: 0 }, tools: [{ kind: "quill", g: top, b: tip }], people: [P("chief", Rm(0.0, 0, 2.0), "stern", 0, { hw: [add(tip, 0.06, 0.16, 0.08)], extra: true })],
      subjects: [["the bill", Rm(0, TY + 0.02, 0.78), 0.15]] }; },
  // voted on it: every hand goes up
  voted: (s, f) => ({ light: "room", dof: 1, wet: true, focus: Rm(2.6, 1.6, 1.75),
    cam: kick(move({ pos: Rm(-2.4, 1.2, -3.4), look: Rm(2.4, 1.8, 1.7), fov: 50, roll: -0.07 }, { pos: Rm(-1.6, 1.6, -2.8), look: Rm(2.5, 1.8, 1.7), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, s.a + 3, 0.8),
    people: [...["mp1", "mp2", "mp3"].map((n, i) => P(n, BENCH_L[i], "grin", -1, { wave: 1 })), P("chief", Rm(1.2, 0, -0.2), "relief", -1, { wave: 1, extra: true })] }),
  // and paid: bags of money hit the table
  paid: (s, f) => { const d = f - s.a, drop = (i: number) => { const u = clamp01((d - i * 4) / 6); return TY + 0.02 + 0.9 * (1 - u) * (1 - u) + (u >= 1 ? 0.03 * Math.max(0, 1 - (d - i * 4 - 6) / 5) : 0); };
    return { light: "room", dof: 2, wet: true, closeup: true, focus: Rm(0, 1.0, 0.75),
      cam: kick(kick(move({ pos: Rm(0.9, 1.7, -1.9), look: Rm(0, 1.0, 0.75), fov: 44, roll: 0.06 }, { pos: Rm(0.6, 1.5, -1.6), look: Rm(0, 1.0, 0.75), fov: 40, roll: 0.0 }, f, s.a, s.b, smooth, 0), f, s.a + 6, 1.0), f, s.a + 10, 0.7),
      bags: [Rm(-0.45, drop(0), 0.75), Rm(0.05, drop(1), 0.62), Rm(0.5, drop(2), 0.8)], bill: { p: Rm(-0.95, TY + 0.012, 0.7), yaw: 0.3 },
      people: [P("mp2", Rm(-0.5, 0, 2.0), "grin", 1, { extra: true }), P("chief", Rm(0.6, 0, 2.0), "relief", -1, { extra: true })] }; },
  // for brand new sewers under the entire city: navvies at work, the engineer with his drawing, the lamps running away
  sewers: (s, f) => { const tt = t(f - s.a), dg = dig(tt);
    return { light: "sewer", dof: 1, works: true, flow: 0, key: LAMP(0), focus: Sw(0, 1.4, 4), ...dg,
      cam: move({ pos: Sw(0.25, 1.75, -4.6), look: Sw(0, 1.45, 5), fov: 60, roll: 0.06 }, { pos: Sw(-0.05, 2.5, -1.2), look: Sw(0, 1.6, 30), fov: 62, roll: -0.03 }, f, s.a + 8, s.b, smooth, 0) }; },
  // it took them eighteen days: the bill held up, done
  days: (s, f) => ({ light: "room", dof: 2, wet: true, focus: Rm(0.1, 1.45, -1.0),
    cam: kick(snap(Rm(0.6, 1.5, -4.0), Rm(0.28, 1.45, -1.0), f, s.a, { fov: 40, roll: -0.05 }, 1.5, 5), f, W(13, "18"), 1.0),
    people: [P("chief", Rm(0.55, 0, -0.95), "grin", 1, { hw: [Rm(0.12, 1.62, -1.1)] }), P("clerk", Rm(-0.7, 0, -1.15), "shock", -1)],
    bill: { p: Rm(-0.02, 1.62, -1.12), yaw: 0, tilt: Math.PI / 2 - 0.12 }, subjects: [["the bill", Rm(-0.02, 1.62, -1.12), 0.2]] }),
  // and those sewers? the city still flushes into them today: the same tunnel, full and running; the camera rides the water
  today: (s, f) => { const u = U(s, f);
    return { light: "sewer", dof: 0, flow: 1, key: LAMP(1), focus: Sw(0, 1.2, 20),
      cam: { pos: Sw(0.15 * Math.sin(u * 5), 0.55 + 0.25 * u, 1 + 15 * u), look: Sw(0, 1.1, 34 + 15 * u), fov: 64, roll: 0.07 - 0.12 * u } }; },
  // back to the curtain, as the film began (loop)
  end: (s, f) => { const ph = t(f - TOTAL), h0 = hookCam(0);
    return { ...hookState(ph), light: "room", dof: 2, closeup: true, focus: Rm(1.1, 1.9, 4.6),
      cam: move({ pos: Rm(1.7, 2.3, 0.6), look: Rm(1.1, 2.0, 4.7), fov: 54, roll: -0.04 }, h0, f, s.a, s.b - 2, smooth, 0) }; },
};
/** the people of the court: a mother at the pump, a boy with a cup, an old man, a girl with a bucket, a man in a doorway */
function court(tt: number, pumping: boolean): Person3[] {
  const hk = 0.5 + 0.5 * Math.sin(tt * (pumping ? 7 : 2)), handle: V3 = St(PUMP[0] + 0.02, 1.25 + 0.25 * hk, PUMP[2] - 0.72);
  return [P("mother", St(PUMP[0] + 0.6, 0, PUMP[2] - 0.7), "neutral", 1, { hw: [handle] }), P("kid", St(0.2, 0, 2.15), "neutral", -1, { hw: [St(0.68, 0.8, 1.75)] }),
    P("oldman", St(-1.25, 0, 2.5), "pained", 1), P("girl", St(-0.95, 0, 0.3), "neutral", 1, { hw: [St(-0.62, 0.36, 0.22)] }), P("poor1", St(-2.05, 0, 4.8), "neutral", 1, { extra: true })];
}

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["building", "flush", "summer", "left", "curtains", "thing", "sewers", "today"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags, speech and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "parl", kind: "pill", text: "PARLIAMENT", sub: "London", f0: S0("building") + 4, f1: B("building"), y: 12, size: 70 },
  { key: "3m", kind: "call", text: "3 MILLION", f0: W(1, "3"), f1: B("million"), y: 14, fg: "#ffd166", size: 150 },
  { key: "sci", kind: "pill", text: "A FAMOUS SCIENTIST", sub: "tested the river", f0: A(2) + 6, f1: B("scientist"), y: 12, size: 54 },
  { key: "exp", kind: "stamp", text: "TOO EXPENSIVE", f0: W(2, "too"), f1: B("expensive"), y: 15, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 104 },
  { key: "ask", kind: "pill", text: "\"SHOULD WE FIX THE RIVER?\"", f0: W(5, "should"), f1: B("clerk"), y: 13, size: 52 },
  { key: "no", kind: "pill", text: "\"NO. SOAK THE CURTAINS.\"", f0: W(5, "no"), f1: B("no"), y: 13, size: 54 },
  { key: "plan", kind: "stamp", text: "THE PLAN", f0: W(6, "plan"), f1: B("plan"), y: 15, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 130 },
  { key: "money", kind: "pill", text: "THE MAN WITH THE MONEY", sub: "the country's finance minister", f0: W(8, "man"), f1: B("meeting"), y: 12, size: 52 },
  { key: "move", kind: "pill", text: "MOVE THE GOVERNMENT?", sub: "to Oxford, or St Albans", f0: A(9) + 6, f1: B("town"), y: 12, size: 54 },
  { key: "aye", kind: "call", text: "AYE!", f0: W(12, "voted"), f1: B("voted"), y: 16, fg: "#ffd166", size: 200, rot: -5 },
  { key: "18", kind: "stamp", text: "18 DAYS", f0: W(13, "18"), f1: B("days"), y: 15, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 150 },
  { key: "today", kind: "stamp", text: "STILL IN USE", f0: W(14, "still"), f1: B("today"), y: 82, rot: -3, bg: "#e0332e", fg: "#ffffff", size: 96 },
] as Item[]).filter((i) => i.f1 > i.f0);
void WATER; void TABLE;
