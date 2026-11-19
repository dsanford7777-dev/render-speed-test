// The Cahaba bridge Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen LEFT), unless a shot turns round.
// The train runs from +x to -x (screen left to right). Nobody hurt is ever shown: the fall is iron, timber and water.
import { Expr } from "../bridge/toon";
import { V3, FPS, Gg, Tw, Of, H, SET, CAR_AT, carPose, groundY, POSTER, DESK } from "./place";
import { SEG_TIMES, TOTAL, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["gang", W(0, "gang") - 2], ["never", W(0, "who") - 2],
  ["train", A(1)], ["bridge", W(1, "passenger") - 2], ["height", W(1, "110") - 2], ["river", W(1, "cahaba") - 2],
  ["families", A(2)],
  ["engineer", A(3)], ["ahead", W(3, "something") - 2], ["wheels", W(3, "shut") - 2], ["lever", W(3, "threw") - 2],
  ["gave", A(4)], ["drop", W(4, "whole") - 2], ["splash", W(4, "river") - 2],
  ["jump", A(5)], ["lived", W(5, "lived") - 2],
  ["dead", A(6)],
  ["papers", A(7)], ["fiends", W(7, "fiends") - 2], ["rail", W(7, "robbers") - 2],
  ["three", A(8)],
  ["posted", A(9)], ["reward", W(9, "10000") - 2],
  ["locals", A(10) + 12], ["doubt", W(10, "never") - 2],
  ["miners", A(11)], ["help", W(11, "ran") - 2],
  ["letter", A(12)], ["pay", W(12, "when") - 2], ["tells", W(12, "it") - 2], ["did", W(12, "train") - 2],
  ["young", A(13)],
  ["archive", A(14)], ["records", W(14, "railroad's") - 2], ["errors", W(14, "construction") - 2], ["story", W(14, "company") - 2],
  ["nothing", A(15)], ["everyone", A(16)],
  ["reason", A(17)], ["end", W(17, "offer") - 2],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number;
  /** an arm in a sling (a cloth at the chest) */
  sling?: boolean;
  /** in the air or in the water: no contact shadow */
  air?: boolean;
  /** walking in profile: step phase 0..1; mirror = moving toward -x; carry = a point in the world both hands hold out to */
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 } };
export type Tool = { kind: "brush" | "lever" | "bar" | "pick" | "quill" | "pencil"; g: V3; b: V3; s?: number };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "spark" | "chunk" | "cloth";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type NewsKey = "fiends" | "did" | "robbers";
export type St3 = {
  light: "morn" | "dusk" | "night" | "today" | "townN" | "townD" | "rr" | "arch"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  tools?: Tool[]; cards?: Card[]; puffs?: Puff[];
  /** gorge: the train (x of the engine's centre, how far the collapse has run, wheels locked), the wreck in the river, today's ruin, the cab's fire glow */
  train?: { x: number; fall?: number; locked?: boolean; speed?: number } | null; wreck?: boolean; ruin?: boolean; cab?: boolean;
  /** town: which notice is on the wall */
  poster?: "none" | "reward" | "q";
  /** office: money sacks on the desk, the bridge drawing, the folder, the letter, the heap of claims */
  sacks?: number; blueprint?: boolean; folder?: boolean; letter?: boolean; claims?: boolean;
  /** newspapers held up (they turn to the camera) */
  news?: { p: V3; head: NewsKey; yaw?: number; tilt?: number; roll?: number; s?: number }[];
  /** the lamp lamp-lit shadows fall from */
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
const orb = (c: V3, a: number, r: number, h: number, rest: Partial<Cam> = {}): Shot => ({ pos: [c[0] + r * Math.sin(rad(a)), c[1] + h, c[2] - r * Math.cos(rad(a))], look: c, ...rest });
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
/** someone walking in profile along x from x0 (absolute) at v m/s */
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", extra: Partial<Person3> = {}): Person3 => {
  const d = Math.abs(v) * tt, p: V3 = [x0 + v * tt, y, z];
  return { who, p, expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: Math.min(1.25, Math.abs(v) / 1.6) }, ...extra };
};
const add = (p: V3, x: number, y: number, z: number): V3 => [p[0] + x, p[1] + y, p[2] + z];
const breath = (p: V3, tt: number, k = 1): Puff[] => [0, 1].map((i) => { const u = (tt * 0.8 + i * 0.5) % 1; return { p: add(p, 0.08 + 0.2 * u, 0.05 * u, -0.1 - 0.15 * u), s: 0.12 + 0.3 * u, c: [0.92, 0.94, 1.0] as [number, number, number], a: 0.35 * (1 - u) * k }; });

// ---------------- the town wall as the shots use it ----------------
const SW = 0.16; // sidewalk height
/** the railroad's man pasting the notice up: he stands screen right of it, the brush on the notice's corner */
const PASTER: V3 = Tw(-0.5, SW, 2.5);
const paste = (tt: number) => { const k = 0.5 + 0.5 * Math.sin(tt * 5.2), g = Tw(-0.3, 1.5 + 0.3 * k, 2.74), b = Tw(-0.1, 1.72 + 0.35 * k, 2.98);
  return { tool: { kind: "brush" as const, g, b }, man: (expr: Expr) => P("rr", PASTER, expr, 1, { hw: [g] }) }; };
const HOOK_POS: V3 = Tw(0.5, 1.9, -3.0), HOOK_LOOK: V3 = Tw(0.5, 1.9, 3.0), HOOK = { fov: 50, roll: 0.04 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.05), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const hookState = (tt: number): Partial<St3> => { const d = paste(tt); return { light: "townN", poster: "reward", tools: [d.tool], people: [d.man("smile")], key: Tw(-2.3, 3.1, 1.7) }; };
const TKEY: V3 = Tw(-2.3, 3.1, 1.7);

// ---------------- the gorge as the shots use it ----------------
/** x of the engine when the whole train stands on the two iron spans */
const ON_SPAN = -10;
/** the three "wreckers" of the newspaper story, on the deck by night with a crowbar */
const wreckers = (tt: number) => { const k = 0.5 + 0.5 * Math.sin(tt * 6), g = Gg(0.55, H + 1.0 + 0.25 * k, -0.35), b = Gg(0.1, H - 0.02, -0.72);
  return { people: [P("m2", Gg(0.95, H, -0.1), "stern", -1, { hw: [g, L3(g, b, 0.4)] }), P("m4", Gg(-0.75, H, 0.55), "nervous", 1), P("m1", Gg(2.3, H, 0.6), "stern", -1)], tool: { kind: "bar" as const, g, b }, tip: b }; };
/** a rider in car i at local (x, z), feet on that car's floor */
const ride = (trainX: number, i: number, lx: number, lz: number, floor: number): V3 => { const c = carPose(trainX, i, 0).p; return Gg(c[0] + lx, c[1] + floor, lz); };
/** water thrown up where the train went in */
const plume = (tt: number, k = 1): Puff[] => Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * 6.283, u = clamp01(tt * 1.1 + (i % 4) * 0.05), up = (9 + 7 * ((i * 3) % 5) / 5) * k;
  return { p: Gg(1 + Math.cos(a) * (2 + 7 * u) + (i % 3) * 3 - 3, 0.5 + up * Math.sin(Math.PI * Math.min(1, u * 0.9)), -1 + Math.sin(a) * (1 + 3 * u)), s: (4 + 9 * u) * k, c: (i % 3 ? [0.9, 0.94, 0.96] : [0.62, 0.56, 0.48]) as [number, number, number], a: 0.85 * (1 - u * 0.75) }; });
const splinters = (c: V3, tt: number, n: number, v = 7): Card[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * 6.283 + 0.4 * Math.sin(i * 5), sp = v * (0.5 + 0.5 * ((i * 7) % 5) / 5), up = 3 + 4 * ((i * 3) % 4) / 4;
  return { kind: "chunk" as const, p: add(c, Math.cos(a) * sp * tt, up * tt - 4.9 * tt * tt, (i % 4 === 0 ? -1.4 : 0.3 * Math.sin(a)) * sp * tt), spin: i + tt * 7, s: 0.9 + 0.8 * ((i * 11) % 3) / 2 }; });
const BANK3: [string, V3][] = [["m1", Gg(13.85, 0.64, -3.9)], ["m3", Gg(14.7, 0.68, -4.7)], ["m4", Gg(15.55, 0.72, -5.5)]];

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // the railroad offered $10,000: its man pastes the reward notice on the newspaper office wall (frame 0 is already close)
  hook: (s, f) => ({ ...hookState(t(f)), light: "townN", dof: 1, focus: Tw(POSTER[0], POSTER[1], 3.0), cam: kick(hookCam(f), f, W(0, "10000"), 0.9), subjects: [["the reward notice", Tw(POSTER[0], POSTER[1] + 0.5, 3.0), 0.1]] }),
  // ...for a gang of train wreckers: three men on the bridge by night, a crowbar under the rail
  gang: (s, f) => { const tt = t(f - s.a), w = wreckers(tt);
    return { light: "night", dof: 1, focus: Gg(0.5, H + 1.2, 0), people: w.people, tools: [w.tool],
      cam: move({ pos: Gg(5.6, H + 2.9, -9.5), look: Gg(0.8, H + 0.9, 0.1), fov: 46, roll: 0.07 }, { pos: Gg(3.4, H + 1.5, -7.6), look: Gg(0.8, H + 1.0, 0.1), fov: 44, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the crowbar", Gg(0.3, H + 0.5, -0.5), 0.3]] }; },
  // ...who may never have existed: the notice again, the three wanted men are blanks
  never: (s, f) => ({ light: "townN", poster: "q", dof: 2, closeup: true, focus: Tw(0, 2.2, 3.0), key: TKEY,
    cam: kick(snap(Tw(0.35, 2.22, 0.45), Tw(0, 2.1, 3.0), f, s.a, { fov: 44, roll: -0.06 }, 1.6, 5), f, W(0, "never"), 0.9), subjects: [["the three blanks", Tw(0, 2.05, 3.0), 0.1]] }),
  // two days after Christmas, 1896: the train comes down the line at the lens
  train: (s, f) => { const u = U(s, f), x = 128 - 34 * u;
    return { light: "morn", train: { x, speed: 12 }, dof: 1, focus: Gg(x - 4, H + 2, 0),
      cam: move({ pos: Gg(88, H + 1.1, -3.6), look: Gg(110, H + 2.4, 0), fov: 52, roll: 0.06 }, { pos: Gg(86.5, H + 0.9, -3.2), look: Gg(100, H + 2.6, 0), fov: 56, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the engine", Gg(x - 4.4, H + 2.2, -0.2), 1.2]] }; },
  // a passenger train rolled onto an iron bridge: the whole crossing, the train coming out over the river
  bridge: (s, f) => { const u = U(s, f), x = 68 - 22 * u;
    return { light: "morn", train: { x, speed: 9 }, dof: 0, focus: Gg(34, H - 6, 0),
      cam: orbit(s, f, Gg(34, 15, 0), [-24, -14], [86, 80], [-3, 1], 56, [0.05, -0.03]), subjects: [["the bridge", Gg(34, H - 3, -1.5), 2.5]] }; },
  // 110 feet above: down the pier from the rails to the water
  height: (s, f) => { const u = smooth(U(s, f)), x = 46 - 3 * U(s, f);
    return { light: "morn", train: { x, speed: 9 }, dof: 0, focus: Gg(-17, 12, 0),
      cam: move({ pos: Gg(-26, H + 4, -30), look: Gg(-8, H - 2, 0), fov: 58, roll: 0.07 }, { pos: Gg(-22, 4.5, -34), look: Gg(-10, 13, 0), fov: 62, roll: -0.05 }, f, s.a, s.b, smooth, 0),
      subjects: u < 0.5 ? [["the span", Gg(-8, H - 3, -1.5), 2]] : [["the pier", Gg(-17, 12, -4.4), 0.5]] }; },
  // ...the Cahaba River: from the water, looking up at the train going over
  river: (s, f) => { const x = 43 - 5 * U(s, f);
    return { light: "morn", train: { x, speed: 9 }, dof: 0, focus: Gg(27, H, 0),
      cam: move({ pos: Gg(7.5, 1.3, -25), look: Gg(27, 18, 0), fov: 70, roll: -0.06 }, { pos: Gg(7, 1.1, -22), look: Gg(26, 20, 0), fov: 72, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the span from below", Gg(30, H - 5.6, -1.5), 0.5]] }; },
  // it was full of coal miners and their families: faces at two coach windows, the camera riding alongside
  families: (s, f) => { const u = U(s, f), tt = t(f - s.a), x = 38 - 6 * u, c = carPose(x, 3, 0).p, cx = c[0];
    return { light: "morn", train: { x, speed: 6 }, dof: 1, focus: Gg(cx, H + 2.5, -1.3),
      cam: move({ pos: Gg(cx + 1.1, H + 2.9, -8.4), look: Gg(cx - 0.1, H + 2.3, -1.3), fov: 40, roll: 0.03 }, { pos: Gg(cx - 0.9, H + 2.6, -8.0), look: Gg(cx - 0.1, H + 2.3, -1.3), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("m1", ride(x, 3, 0.65, -0.8, 1.1), "smile", -1, { low: true }), P("wife", ride(x, 3, -0.45, -0.8, 1.1), "smile", 1, { low: true }), P("kid", ride(x, 3, -1.0, -0.95, 1.72), tt % 1.2 < 0.6 ? "grin" : "laugh", 1, { low: true, wave: 0.5 + 0.5 * Math.sin(tt * 9) })] }; },
  // the engineer saw something wrong: his face in the cab window
  engineer: (s, f) => { const u = U(s, f), tt = t(f - s.a), x = 32 - 2 * u, p = ride(x, 0, 3.0, 0.1, 1.3);
    return { light: "morn", train: { x, speed: 9 }, cab: true, dof: 2, closeup: true, focus: add(p, 0, 1.5, 0),
      cam: move({ pos: add(p, -1.3, 1.75, -5.2), look: add(p, 0.05, 1.5, 0), fov: 32, roll: 0.05 }, { pos: add(p, -1.0, 1.65, -4.6), look: add(p, 0.05, 1.5, 0), fov: 30, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("engineer", p, tt > 0.55 ? "shock" : "stern", -1, { low: true })] }; },
  // ...something wrong: riding the boiler, the track running out onto the bridge ahead
  ahead: (s, f) => { const u = U(s, f), x = 28 - 8 * u;
    return { light: "morn", train: { x, speed: 9 }, dof: 0, focus: Gg(x - 30, H, 0),
      cam: kick(move({ pos: Gg(x - 0.6, H + 4.5, -0.9), look: Gg(x - 30, H + 0.4, 0), fov: 62, roll: 0.02 }, { pos: Gg(x - 1.0, H + 4.3, -0.7), look: Gg(x - 26, H - 0.2, 0), fov: 58, roll: -0.05 }, f, s.a, s.b, smooth, 0), f, W(3, "wrong"), 1.0),
      subjects: [["the track ahead", Gg(x - 22, H, 0), 1.5]] }; },
  // he shut off the steam: the driving wheels lock and slide, sparks off the rail
  wheels: (s, f) => { const u = U(s, f), tt = t(f - s.a), x = 16 - 5 * u;
    return { light: "morn", train: { x, locked: true, speed: 2 }, dof: 2, closeup: true, focus: Gg(x + 0.75, H + 0.5, -0.8),
      cam: kick(move({ pos: Gg(x - 2.6, H + 0.75, -3.4), look: Gg(x + 0.6, H + 0.75, -0.8), fov: 50, roll: -0.07 }, { pos: Gg(x - 2.2, H + 0.65, -3.0), look: Gg(x + 0.6, H + 0.7, -0.8), fov: 48, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, s.a + 3, 0.8),
      cards: [-0.9, 0.75, 2.4].flatMap((wx, j) => Array.from({ length: 6 }, (_, i) => { const v = (tt * 2.6 + i / 6 + j * 0.2) % 1; return { kind: "spark" as const, p: Gg(x + wx + 0.5 + 1.8 * v, H + 0.02 + 0.7 * v * (1 - v) * (1 + (i % 3)), -0.75 - 0.25 * v * (i % 2 ? 1 : 2.4)), spin: i + v * 5, s: 1.2 * (1 - v) + 0.3 }; })),
      subjects: [["the locked wheels", Gg(x + 0.75, H + 0.86, -0.9), 0.3]] }; },
  // ...and threw the engine into reverse: both hands haul the lever back
  lever: (s, f) => { const u = expo(U(s, f) * 1.8), x = 6, p = ride(x, 0, 3.15, 0.2, 1.3), foot = add(p, 0.62, 0, -0.3), grip = add(foot, -0.45 + 0.7 * u, 1.12, -0.05);
    return { light: "morn", train: { x, locked: true, speed: 1 }, cab: true, dof: 2, closeup: true, focus: add(p, -0.3, 1.4, -0.4),
      cam: kick(move({ pos: add(p, -1.9, 1.5, -4.6), look: add(p, -0.25, 1.38, -0.2), fov: 34, roll: -0.06 }, { pos: add(p, -1.5, 1.6, -4.3), look: add(p, -0.2, 1.4, -0.2), fov: 33, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, W(3, "reverse"), 1.0),
      people: [P("engineer", p, "shock", -1, { low: true, hw: [grip, add(grip, 0, -0.16, 0)] })], tools: [{ kind: "lever", g: grip, b: foot }] }; },
  // too late; the bridge gave way: the two spans go, the train with them
  gave: (s, f) => { const tt = Math.max(0, t(f - W(4, "bridge"))), fall = 0.5 * clamp01(tt / 1.1) ** 1.6 + 0.02 * clamp01(t(f - s.a) * 2);
    return { light: "morn", train: { x: ON_SPAN, fall, locked: true }, dof: 0, focus: Gg(10, H - 6, 0),
      cam: kick(kick(move({ pos: Gg(22, H - 3, -66), look: Gg(12, H - 6, 0), fov: 56, roll: 0.05 }, { pos: Gg(16, H - 9, -60), look: Gg(10, H - 12, 0), fov: 58, roll: -0.05 }, f, s.a, s.b, smooth, 0), f, W(4, "bridge"), 1.6), f, W(4, "gave"), 1.2),
      cards: tt > 0 ? [...splinters(Gg(17, H - 3, -1), tt, 14), ...splinters(Gg(-17, H - 3, -1), tt * 0.9, 10), ...splinters(Gg(51, H - 3, -1), tt * 0.8, 8)] : [],
      puffs: tt > 0 ? [17, -17, 51].map((px, i) => ({ p: Gg(px, H - 4 - 4 * tt, -2), s: 5 + 9 * tt, c: [0.7, 0.62, 0.52] as [number, number, number], a: 0.6 * (1 - 0.5 * clamp01(tt)) * (i === 2 ? 0.7 : 1) })) : [] }; },
  // ...and the whole train dropped: from the river, iron and timber coming down at the lens
  drop: (s, f) => { const u = U(s, f), tt = t(f - s.a), fall = 0.5 + 0.27 * u;
    return { light: "morn", train: { x: ON_SPAN, fall, locked: true }, dof: 0, focus: Gg(4, 14, 0),
      cam: kick(move({ pos: Gg(6, 1.3, -19), look: Gg(3, 17, 0), fov: 74, roll: -0.08 }, { pos: Gg(5, 1.2, -22), look: Gg(2, 12, 0), fov: 78, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, s.a + 2, 1.2),
      cards: Array.from({ length: 20 }, (_, i) => { const v = (tt * 0.9 + i / 20) % 1; return { kind: "chunk" as const, p: Gg(-10 + (i * 5.3) % 24, 22 - 22 * v, -2 - 12 * v * (i % 4 === 0 ? 1 : 0.2)), spin: i + v * 9, s: 1.6 + (i % 3) }; }) }; },
  // ...into the river: the water goes up; when it comes down the bridge has a hole in it
  splash: (s, f) => { const tt = t(f - s.a);
    return { light: "morn", wreck: true, dof: 0, focus: Gg(2, 8, 0),
      cam: kick(move({ pos: Gg(-6, 9, -52), look: Gg(4, 9, 0), fov: 58, roll: 0.06 }, { pos: Gg(-4, 12, -58), look: Gg(4, 13, 0), fov: 60, roll: -0.03 }, f, s.a, s.b, expo, 0), f, s.a + 1, 1.8),
      puffs: [...plume(tt, 2.2), ...(tt < 0.3 ? [{ p: Gg(2, 4, -6), s: 30, c: [0.95, 0.96, 0.98] as [number, number, number], a: 0.9 * (1 - tt / 0.3) }] : [])] }; },
  // the fireman jumped in mid-air: Sam Spencer leaps clear of the falling engine
  jump: (s, f) => { const u = U(s, f), fall = 0.42 + 0.1 * u, e = carPose(ON_SPAN, 0, fall).p, p: V3 = Gg(e[0] + 3.4 - 1.2 * u, e[1] + 1.6 + 3.2 * u * (1 - u) - 2.4 * u, -2.2 - 5.5 * u);
    return { light: "morn", train: { x: ON_SPAN, fall, locked: true }, dof: 1, focus: add(p, 0, 1.2, 0),
      cam: kick(move({ pos: add(p, 2.4, 1.4, -8.2), look: add(p, 0.2, 1.1, 0), fov: 44, roll: 0.09 }, { pos: add(p, 1.6, 0.9, -7.4), look: add(p, 0.1, 1.1, 0), fov: 42, roll: -0.06 }, f, s.a, s.b, (x) => x, 0), f, W(5, "jumped"), 1.0),
      people: [P("fireman", p, "shock", -1, { air: true, wave: 1, headTilt: -0.2 })], cards: splinters(Gg(e[0] + 6, e[1] + 2, -1), 0.25 + 0.4 * u, 8, 5) }; },
  // ...and lived, with a broken arm: on the bank, an arm in a sling, the wreck smoking behind him
  lived: (s, f) => { const tt = t(f - s.a), p = Gg(14.4, 0.64, -9.2);
    return { light: "morn", wreck: true, dof: 2, focus: add(p, 0, 1.4, 0),
      cam: kick(snap(add(p, -1.3, 1.5, -4.6), add(p, 0, 1.25, 0), f, s.a, { fov: 42, roll: -0.05 }, 1.5, 5), f, W(5, "broken"), 0.7),
      people: [P("fireman", p, tt > 0.7 ? "relief" : "dazed", 1, { sling: true, hw: [add(p, -0.1, 1.0, -0.14)] })], puffs: breath(add(p, 0, 1.45, 0), tt) }; },
  // more than twenty people didn't: the hole in the bridge, smoke going up through it; nobody is shown
  dead: (s, f) => ({ light: "morn", wreck: true, dof: 0, focus: Gg(4, 16, 0),
    cam: move({ pos: Gg(12, 5, -74), look: Gg(8, 15, 0), fov: 60, roll: 0.05 }, { pos: Gg(8, 20, -84), look: Gg(8, 20, 0), fov: 62, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the gap", Gg(17, H - 6.5, -4.4), 0.6]] }),
  // by that night the newspapers had their answer: a newsboy holds the front page up under the lamp
  papers: (s, f) => { const tt = t(f - s.a), nb = Tw(-0.35, 0, -0.2), np = add(nb, 0, 1.72 + 0.05 * Math.sin(tt * 7), -0.12);
    return { light: "townN", poster: "none", dof: 1, focus: add(nb, 0.3, 1.3, 0), key: TKEY, news: [{ p: np, head: "fiends", s: 1.25 }],
      cam: orbit(s, f, Tw(0.2, 1.25, 0), [-18, 10], [5.6, 5.0], [0.3, 0.5], 48, [0.05, -0.04]),
      people: [P("newsboy", nb, "laugh", 0, { hw: [add(np, 0.22, -0.3, 0.02), add(np, -0.22, -0.3, 0.02)] }), P("m4", Tw(0.95, 0, 0.35), "shock", 1)],
      subjects: [["the front page", np, 0.2]] }; },
  // Fiends.: snap onto the headline in a reader's hands
  fiends: (s, f) => { const m = Tw(0.95, 0, 0.35), np = add(m, 0, 0.86, -0.3);
    return { light: "townN", poster: "none", dof: 2, closeup: true, focus: np, key: TKEY, news: [{ p: np, head: "fiends", s: 1.3, tilt: -0.12 }],
      cam: kick(snap(add(m, -0.25, 1.3, -2.5), add(m, 0, 1.22, -0.2), f, s.a, { fov: 44, roll: 0.07 }, 1.6, 5), f, W(7, "fiends"), 1.1),
      people: [P("m4", m, "shock", 0, { hw: [add(np, 0.3, -0.05, 0.02), add(np, -0.3, -0.05, 0.02)] })], subjects: [["the headline", add(np, 0, 0.25, 0), 0.1]] }; },
  // robbers had pulled up a rail to loot the wreck: the papers' story, close on the crowbar under the rail
  rail: (s, f) => { const tt = t(f - s.a), w = wreckers(tt);
    return { light: "night", dof: 2, focus: Gg(0.4, H + 0.6, -0.4), people: w.people.slice(0, 1), tools: [w.tool],
      cam: kick(move({ pos: Gg(-1.6, H + 0.75, -4.6), look: Gg(0.5, H + 0.95, 0), fov: 50, roll: -0.08 }, { pos: Gg(-1.2, H + 0.95, -4.9), look: Gg(0.4, H + 1.0, 0), fov: 50, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, W(7, "rail"), 0.9),
      cards: Array.from({ length: 5 }, (_, i) => { const v = (tt * 3 + i / 5) % 1; return { kind: "spark" as const, p: add(w.tip, 0.2 * v * Math.cos(i * 2), 0.05 + 0.25 * v, -0.1 * v), spin: i, s: 0.9 * (1 - v) + 0.2 }; }),
      subjects: [["the crowbar", Gg(0.3, H + 0.5, -0.5), 0.3]] }; },
  // three strange men had been seen at the river: across the water at dusk, three dark figures on the bank
  three: (s, f) => ({ light: "dusk", wreck: true, dof: 1, focus: Gg(14.7, 1.4, -4.6),
    cam: move({ pos: Gg(-7.5, 1.7, -27), look: Gg(14.7, 1.35, -4.7), fov: 17, roll: 0.04 }, { pos: Gg(-6.5, 1.6, -26), look: Gg(14.7, 1.35, -4.7), fov: 15.5, roll: -0.02 }, f, s.a, s.b, smooth, 0),
    people: BANK3.map(([w, p], i) => P(w, p, "stern", i === 0 ? 1 : -1)) }),
  // so the railroad posted a reward: the brush goes over the notice
  posted: (s, f) => { const d = paste(t(f));
    return { light: "townN", poster: "reward", dof: 1, focus: Tw(-0.2, 1.9, 2.9), key: TKEY, tools: [d.tool], people: [d.man("stern")],
      cam: move({ pos: Tw(2.4, 1.4, -2.6), look: Tw(-0.05, 1.9, 3.0), fov: 50, roll: -0.06 }, { pos: Tw(1.8, 1.6, -2.2), look: Tw(-0.05, 1.9, 3.0), fov: 50, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the reward notice", Tw(POSTER[0], POSTER[1] + 0.5, 3.0), 0.1]] }; },
  // $10,000.: snap onto the figure
  reward: (s, f) => ({ light: "townN", poster: "reward", dof: 2, closeup: true, focus: Tw(0, 2.7, 3.0), key: TKEY,
    cam: kick(snap(Tw(0.12, 2.5, 0.2), Tw(0.0, 2.48, 3.0), f, s.a, { fov: 42, roll: 0.06 }, 1.7, 5), f, W(9, "10000"), 1.2), subjects: [["$10,000", Tw(0, 2.8, 3.0), 0.1]] }),
  // but the people who lived by that bridge: three of them in the street by day, not having it
  locals: (s, f) => { const tt = t(f - s.a);
    return { light: "townD", poster: "reward", dof: 1, focus: Tw(0.1, 1.3, -1.0),
      cam: orbit(s, f, Tw(0.1, 1.2, -1.0), [14, -10], [6.4, 5.8], [0.4, 0.3], 46, [-0.04, 0.04]),
      people: [P("m2", Tw(1.0, 0, -0.9), "stern", -1), P("wife2", Tw(0.05, 0, -1.2), "stern", 0, { headTilt: 0.1 * Math.sin(tt * 5) }), P("old", Tw(-0.9, 0, -0.8), "stern", 1)] }; },
  // ...never believed it: the miner shakes his head
  doubt: (s, f) => { const tt = t(f - s.a), p = Tw(1.0, 0, -0.9);
    return { light: "townD", poster: "reward", dof: 3, closeup: true, focus: add(p, 0, 1.5, 0),
      cam: kick(snap(add(p, 0.35, 1.55, -2.4), add(p, 0, 1.5, 0), f, s.a, { fov: 34, roll: -0.06 }, 1.5, 5), f, W(10, "never"), 0.8),
      people: [P("m2", p, "stern", 0, { headTilt: 0.16 * Math.sin(tt * 7) })] }; },
  // they said the three men were local miners: the same three on the bank, in daylight, faces you can see
  miners: (s, f) => { const tt = t(f - s.a);
    return { light: "morn", wreck: true, dof: 1, focus: Gg(14.7, 1.4, -4.6),
      cam: move({ pos: Gg(14.0, 1.7, -13.4), look: Gg(14.7, 1.3, -4.7), fov: 42, roll: 0.04 }, { pos: Gg(15.2, 1.5, -12.6), look: Gg(14.7, 1.3, -4.7), fov: 42, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      people: BANK3.map(([w, p], i) => P(w, p, "shock", i === 0 ? 1 : -1, { headTilt: 0.05 * Math.sin(tt * 3 + i) })), puffs: BANK3.flatMap(([, p], i) => breath(add(p, 0, 1.45, 0), tt + i * 0.3)) }; },
  // ...who ran to help: they run down the bank toward the wreck
  help: (s, f) => { const tt = t(f - s.a), X = SET.gorge[0], run = (w: string, x0: number, z: number, d: number) => { const q = walker(w, X + x0, 0.7, z, -3.4, tt + d, "shock"); q.p[1] = groundY(q.p[0] - X) + 0.06; return q; }, cx = 19.5 - 3.4 * tt;
    return { light: "morn", wreck: true, dof: 1, focus: Gg(cx, 1.5, -6),
      cam: move({ pos: Gg(cx - 1.3, 1.9, -15.5), look: Gg(cx - 1.3, 1.4, -6), fov: 50, roll: 0.05 }, { pos: Gg(cx - 1.3, 1.7, -15.0), look: Gg(cx - 1.3, 1.4, -6), fov: 50, roll: -0.04 }, f, s.a, s.b, (x) => x, 0),
      people: [run("m1", 18.6, -5.4, 0), run("m3", 19.9, -6.3, 0.15), run("m4", 21.1, -5.6, 0.3)] }; },
  // a man wrote to the Birmingham paper: by lamplight, a pen on a letter
  letter: (s, f) => { const tt = t(f - s.a), pen: V3 = Of(0.02 + 0.07 * Math.sin(tt * 9), DESK.y + 0.07, DESK.z - 0.14), p = Of(0.15, 0, DESK.z + 0.85);
    return { light: "rr", letter: true, dof: 2, focus: Of(0.1, 1.2, DESK.z), key: Of(-0.7, 1.4, 1.0),
      cam: move({ pos: Of(-1.3, 1.9, -2.6), look: Of(0.1, 1.05, DESK.z), fov: 42, roll: 0.05 }, { pos: Of(-0.7, 1.55, -1.9), look: Of(0.1, 1.1, DESK.z), fov: 40, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("writer", p, "stern", 0, { low: true, hw: [pen] })], tools: [{ kind: "quill", g: add(pen, 0.04, 0.12, 0), b: pen }], subjects: [["the letter", Of(0.12, DESK.y + 0.02, DESK.z - 0.12), 0.1]] }; },
  // when a railroad doesn't want to pay for a wreck: its man behind the desk, arms round the money
  pay: (s, f) => { const p = Of(0.3, 0, DESK.z + 0.85);
    return { light: "rr", sacks: 6, dof: 2, focus: Of(0.3, 1.2, DESK.z), key: Of(-0.7, 1.4, 1.0),
      cam: kick(snap(Of(-0.5, 1.5, -2.2), Of(0.3, 1.2, DESK.z + 0.2), f, s.a, { fov: 42, roll: -0.06 }, 1.5, 5), f, W(12, "pay"), 0.9),
      people: [P("rr", p, "nervous", 0, { low: true, hw: [Of(0.78, DESK.y + 0.14, DESK.z + 0.05), Of(-0.14, DESK.y + 0.14, DESK.z + 0.05)] })], subjects: [["the money", Of(0.34, DESK.y + 0.18, DESK.z + 0.1), 0.2]] }; },
  // ...it tells reporters: a word in the reporter's ear, his pencil going
  tells: (s, f) => { const tt = t(f - s.a), r = Of(-0.55, 0, -0.75), pad = add(r, 0.05, 1.12, -0.2), pc = add(pad, -0.06 + 0.04 * Math.sin(tt * 12), 0.06, -0.02);
    return { light: "rr", dof: 2, focus: Of(0, 1.4, -0.7), key: Of(-0.7, 1.4, 1.0),
      cam: orbit(s, f, Of(0.05, 1.3, -0.7), [12, -8], [4.6, 4.2], [0.25, 0.2], 40, [0.05, -0.04]),
      people: [P("rr", Of(0.6, 0, -0.6), "smile", 1, { headTilt: -0.14, wave: 0.6 }), P("reporter", r, "grin", -1, { hw: [add(pad, 0.14, -0.02, 0), pc] })],
      tools: [{ kind: "pencil", g: add(pc, 0.03, 0.11, 0), b: pc }], cards: [{ kind: "paper", p: pad, spin: 0.1, s: 1.0 }] }; },
  // ...that train wreckers did it: the next morning's front page comes at the lens
  did: (s, f) => { const u = expo(U(s, f) * 1.6), p = L3(Tw(-0.4, 1.3, 1.6), Tw(0.05, 1.62, -3.3), u);
    return { light: "townN", poster: "reward", dof: 0, closeup: true, focus: p, key: TKEY, news: [{ p, head: "did", s: 1.2 + 1.5 * u, roll: 2.6 * (1 - u) }],
      cam: kick(move({ pos: Tw(0.3, 1.6, -5.6), look: Tw(0, 1.6, 2.0), fov: 46, roll: 0.05 }, { pos: Tw(0.2, 1.6, -5.9), look: Tw(0, 1.62, 2.0), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, s.a + 9, 1.0),
      subjects: [["the front page", p, 0.2]] }; },
  // the bridge was four years old: the main span from the bank, whole, new paint in the morning sun
  young: (s, f) => ({ light: "morn", dof: 0, focus: Gg(0, H - 3, 0),
    cam: orbit(s, f, Gg(2, 17, 0), [-24, -6], [44, 38], [-14, -12], 66, [0.07, -0.04]), subjects: [["the span", Gg(0, H - 3, -1.5), 2]] }),
  // decades later, a historian: the records room, a box open on the table
  archive: (s, f) => { const tt = t(f - s.a), p = Of(0.25, 0, DESK.z + 0.85);
    return { light: "arch", folder: true, dof: 1, focus: Of(0.2, 1.2, DESK.z), key: Of(0, 2.7, 0.2),
      cam: move({ pos: Of(2.2, 1.9, -3.6), look: Of(0.2, 1.15, DESK.z), fov: 46, roll: 0.05 }, { pos: Of(1.1, 1.6, -2.6), look: Of(0.2, 1.15, DESK.z), fov: 44, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("historian", p, tt > 0.9 ? "shock" : "neutral", 0, { low: true, hw: [Of(0.5, DESK.y + 0.05, DESK.z - 0.05), Of(-0.1, DESK.y + 0.05, DESK.z - 0.05)] })], subjects: [["the folder", Of(0.2, DESK.y + 0.02, DESK.z - 0.05), 0.1]] }; },
  // ...went through the railroad's own records: down onto the folder
  records: (s, f) => ({ light: "arch", folder: true, dof: 2, closeup: true, focus: Of(0.2, DESK.y, DESK.z - 0.05), key: Of(0, 2.7, 0.2),
    cam: kick(snap(Of(0.3, 1.75, DESK.z - 1.05), Of(0.2, DESK.y, DESK.z - 0.05), f, s.a, { fov: 40, roll: 0.07 }, 1.6, 5), f, W(14, "records"), 0.8), subjects: [["the folder", Of(0.2, DESK.y + 0.02, DESK.z - 0.05), 0.1]] }),
  // she says they show construction errors in that bridge: the drawing, the main span ringed in red
  errors: (s, f) => ({ light: "arch", blueprint: true, dof: 1, closeup: true, focus: Of(-0.05, DESK.y, DESK.z - 0.02), key: Of(0, 2.7, 0.2),
    cam: kick(move({ pos: Of(-0.7, 2.0, DESK.z - 1.5), look: Of(-0.05, DESK.y, DESK.z), fov: 46, roll: -0.08 }, { pos: Of(-0.2, 1.75, DESK.z - 1.05), look: Of(-0.02, DESK.y, DESK.z - 0.02), fov: 42, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, W(14, "errors"), 1.0),
    subjects: [["the drawing", Of(0.03, DESK.y + 0.02, DESK.z + 0.0), 0.1]] }),
  // ...and a company that let the robber story run: its man reads the headline, pleased
  story: (s, f) => { const p = Of(0.2, 0, -0.6), np = add(p, 0, 0.86, -0.3);
    return { light: "rr", dof: 2, focus: add(p, 0, 1.3, 0), key: Of(-0.7, 1.4, 1.0), news: [{ p: np, head: "robbers", s: 1.3, tilt: -0.15 }],
      cam: kick(snap(add(p, 0.5, 1.35, -3.0), add(p, 0, 1.22, -0.1), f, s.a, { fov: 40, roll: 0.06 }, 1.5, 5), f, W(14, "robber"), 0.8),
      people: [P("rr", p, "grin", 0, { hw: [add(np, 0.3, -0.05, 0.02), add(np, -0.3, -0.05, 0.02)] })], subjects: [["the headline", add(np, 0, 0.25, 0), 0.1]] }; },
  // if a gang wrecked the train, the railroad might owe nothing: the money stays on the desk
  nothing: (s, f) => { const p = Of(0.3, 0, DESK.z + 0.85);
    return { light: "rr", sacks: 6, dof: 1, focus: Of(0.3, 1.2, DESK.z), key: Of(-0.7, 1.4, 1.0),
      cam: orbit(s, f, Of(0.3, 1.15, DESK.z + 0.2), [-16, 10], [3.6, 3.2], [0.5, 0.35], 44, [0.05, -0.04]),
      people: [P("rr", p, "grin", 0, { low: true, hw: [Of(0.78, DESK.y + 0.14, DESK.z + 0.05), Of(-0.14, DESK.y + 0.14, DESK.z + 0.05)] })], subjects: [["the money", Of(0.34, DESK.y + 0.18, DESK.z + 0.1), 0.2]] }; },
  // and if the bridge failed, it owed everyone: the claims land on the desk and keep coming, at the lens
  everyone: (s, f) => { const tt = t(f - s.a), p = Of(0.3, 0, DESK.z + 0.85);
    return { light: "rr", claims: true, dof: 1, focus: Of(0.3, 1.2, DESK.z), key: Of(-0.7, 1.4, 1.0),
      cam: kick(move({ pos: Of(-0.6, 1.3, -2.0), look: Of(0.3, 1.2, DESK.z + 0.2), fov: 50, roll: -0.07 }, { pos: Of(-0.4, 1.4, -2.5), look: Of(0.3, 1.25, DESK.z + 0.2), fov: 52, roll: 0.04 }, f, s.a, s.b, smooth, 0), f, W(16, "everyone"), 1.1),
      people: [P("rr", p, "shock", 0, { low: true, hw: [Of(0.9, DESK.y + 0.02, DESK.z - 0.3), Of(-0.35, DESK.y + 0.02, DESK.z - 0.3)] })],
      cards: Array.from({ length: 18 }, (_, i) => { const v = (tt * 0.7 + i / 18) % 1; return { kind: "paper" as const, p: Of(0.25 + 1.5 * Math.sin(i * 2.4) * v, DESK.y + 0.5 + 1.5 * Math.sin(Math.PI * v) * (0.6 + (i % 3) * 0.3), DESK.z - 0.1 - 2.9 * v * (i % 3 === 0 ? 1 : 0.5)), spin: i + v * 6, s: 1.0 + 0.9 * v }; }),
      subjects: [["the claims", Of(0.25, DESK.y + 0.3, DESK.z - 0.1), 0.25]] }; },
  // which is a very good reason: back at the wall, the notice, wide
  reason: (s, f) => { const d = paste(t(f));
    return { light: "townN", poster: "reward", dof: 1, focus: Tw(0, 1.9, 2.9), key: TKEY, tools: [d.tool], people: [d.man("smile")],
      cam: orbit(s, f, Tw(0.3, 1.85, 3.0), [16, 3], [8.4, 7.4], [0.3, 0.1], 50, [-0.05, 0.03]), subjects: [["the reward notice", Tw(POSTER[0], POSTER[1] + 0.5, 3.0), 0.1]] }; },
  // ...to offer $10,000: in to the notice, as the film began (loop)
  end: (s, f) => { const h0 = hookCam(0);
    return { ...hookState(t(f - TOTAL)), light: "townN", dof: 1, focus: Tw(POSTER[0], POSTER[1], 3.0),
      cam: move({ ...orb(Tw(0.3, 1.85, 3.0), 3, 7.4, 0.1), fov: 50, roll: 0.03 }, h0, f, s.a, s.b - 2, smooth, 0) }; },
};
void CAR_AT;
/** the house kit, for the long-form (cahabalong/story3d.ts) */
export { clamp01, smooth, expo, L3, move, orb, orbit, snap, kick, t as secs, U, P, walker, add, breath, paste, hookState, wreckers, ride, plume, splinters, BANK3, ON_SPAN, TKEY };

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["train", "families", "gave", "papers", "three", "locals", "miners", "letter", "young", "archive", "nothing"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags, speech and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "gang", kind: "call", text: "TRAIN WRECKERS", f0: W(0, "train"), f1: B("gang"), y: 14, fg: "#ffd166", size: 110 },
  { key: "never", kind: "stamp", text: "NEVER EXISTED?", f0: W(0, "never"), f1: B("never"), y: 13, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 100 },
  { key: "1896", kind: "pill", text: "DEC. 27, 1896", sub: "near Birmingham, Alabama", f0: W(1, "christmas"), f1: B("train"), y: 12, size: 80 },
  { key: "110", kind: "call", text: "110 FEET UP", f0: W(1, "110"), f1: B("height"), y: 14, fg: "#ffd166", size: 130 },
  { key: "cah", kind: "pill", text: "THE CAHABA RIVER", f0: W(1, "cahaba"), f1: B("river"), y: 12, size: 70 },
  { key: "wrong", kind: "call", text: "?!", f0: W(3, "wrong"), f1: B("ahead"), y: 15, fg: "#ffffff", size: 220, rot: 6 },
  { key: "rev", kind: "stamp", text: "REVERSE!", f0: W(3, "reverse"), f1: B("lever"), y: 14, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 130 },
  { key: "late", kind: "call", text: "TOO LATE", f0: S0("gave") + 2, f1: W(4, "bridge"), y: 14, fg: "#ffffff", size: 150, rot: -4 },
  { key: "sam", kind: "pill", text: "SAM SPENCER", sub: "the fireman", f0: S0("jump") + 6, f1: B("jump"), y: 12, size: 76 },
  { key: "arm", kind: "stamp", text: "A BROKEN ARM", f0: W(5, "broken"), f1: B("lived"), y: 14, rot: 4, bg: "#2f9a57", fg: "#ffffff", size: 96 },
  { key: "20", kind: "stamp", text: "MORE THAN 20 DEAD", f0: W(6, "20"), f1: B("dead"), y: 14, rot: -3, bg: "#2f2a3a", fg: "#ffffff", size: 80 },
  { key: "story", kind: "pill", text: "THE STORY IN THE PAPERS", f0: S0("rail") + 4, f1: B("rail"), y: 12, size: 54 },
  { key: "3", kind: "call", text: "3 STRANGE MEN", f0: W(8, "3"), f1: B("three"), y: 14, fg: "#ffd166", size: 110 },
  { key: "10k", kind: "call", text: "$10,000", f0: W(9, "10000"), f1: B("reward"), y: 12, fg: "#ffd166", size: 190, rot: -4 },
  { key: "doubt", kind: "stamp", text: "THEY NEVER BELIEVED IT", f0: W(10, "never"), f1: B("doubt"), y: 13, rot: 3, bg: "#2f2a3a", fg: "#ffffff", size: 66 },
  { key: "miners", kind: "pill", text: "LOCAL MINERS", sub: "the neighbors' account", f0: W(11, "local"), f1: B("miners"), y: 12, size: 76 },
  { key: "help", kind: "call", text: "THEY RAN TO HELP", f0: W(11, "ran"), f1: B("help"), y: 14, fg: "#7dff8e", size: 100 },
  { key: "letter", kind: "pill", text: "A LETTER TO THE EDITOR", sub: "Birmingham, Dec. 30, 1896", f0: W(12, "wrote"), f1: B("letter"), y: 12, size: 54 },
  { key: "pay", kind: "call", text: "WON'T PAY?", f0: W(12, "pay"), f1: B("pay"), y: 14, fg: "#ffd166", size: 130 },
  { key: "4", kind: "call", text: "4 YEARS OLD", f0: W(13, "4"), f1: B("young"), y: 14, fg: "#ffd166", size: 130 },
  { key: "later", kind: "pill", text: "DECADES LATER", sub: "a Birmingham historian", f0: S0("archive") + 4, f1: B("archive"), y: 12, size: 76 },
  { key: "err", kind: "stamp", text: "CONSTRUCTION ERRORS", f0: W(14, "construction"), f1: B("errors"), y: 13, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 70 },
  { key: "gang0", kind: "stamp", text: "A GANG: PAY NOTHING?", f0: W(15, "railroad"), f1: B("nothing"), y: 13, rot: 3, bg: "#2f9a57", fg: "#ffffff", size: 68 },
  { key: "all", kind: "stamp", text: "A BAD BRIDGE: PAY EVERYONE", f0: W(16, "owed"), f1: B("everyone"), y: 13, rot: -3, bg: "#e0332e", fg: "#ffffff", size: 56 },
] as Item[]).filter((i) => i.f1 > i.f0);
