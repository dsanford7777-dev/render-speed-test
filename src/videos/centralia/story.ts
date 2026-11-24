// The Centralia Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen LEFT), unless a shot turns round.
// Nobody is shown hurt: Todd falls into the hole, holds the roots and is pulled out; the fire is coal, smoke and steam.
import { Expr } from "../bridge/toon";
import { V3, FPS, Tw, Pt, Mn, Yd, Rm, HOLD, crackZ, HEAP, PIT_C, RZ, DEPTH, TRUCK, TRENCH, BORE, HOLE, HOLE_R, TREE, DESK, HOUSE_Z, FRONT_Z, SEAM } from "./place";
import { SEG_TIMES, TOTAL, VOICE_END, wordAt } from "./timeline";
import { pitGround } from "./csets";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["years", W(0, "for") - 2], ["burning", W(0, "still") - 2],
  ["street", A(1)], ["tunnels", W(1, "built") - 2],
  ["dump", A(2)], ["heap", W(2, "its") - 2], ["council", W(2, "so") - 2], ["five", W(2, "5") - 2], ["light", W(2, "set") - 4],
  ["pitwide", A(3)], ["seam", W(3, "flames") - 2],
  ["hose", A(4)], ["back", W(4, "came") - 6], ["under", W(4, "because") - 2], ["reach", W(4, "where") - 2],
  ["trench", A(5)], ["flush", W(5, "flushed") - 2], ["nothing", W(5, "nothing") - 2], ["yards", W(5, "smoke") - 2], ["cellar", W(5, "gas") - 2],
  ["boy", A(6)], ["todd", W(6, "todd") - 4], ["open", W(6, "felt") - 2],
  ["fell", A(7)], ["cousin", W(7, "until") - 2], ["deep", W(7, "hole") - 4],
  ["money", A(8)], ["boxes", W(8, "buy") - 2], ["houses", W(8, "state") - 2], ["zip", W(8, "postal") - 2],
  ["refused", A(9)], ["stay", W(9, "won") - 2],
  ["five2020", A(10)],
  ["fire", A(11)], ["end", VOICE_END],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number; tilt?: number;
  /** in the air or in a hole: no contact shadow */
  air?: boolean;
  /** walking in profile: step phase 0..1; mirror = moving toward -x; carry = a point both hands hold out to */
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 } };
export type Tool = { kind: "hose" | "pick" | "shovel" | "torch"; g: V3; b: V3; tail?: V3 };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "spark" | "chunk";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type St3 = {
  light: "town62" | "townT" | "pit" | "pitD" | "mineC" | "mineF" | "yardW" | "yardS" | "council" | "cellar"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  tools?: Tool[]; cards?: Card[]; puffs?: Puff[];
  /** town: condemned notices on the doors, the moving van */
  condemned?: boolean; van?: boolean;
  /** pit: how far the seam glow has spread (0..1), the heap's heat (0..1), the fire light (0..1), water down the borehole */
  seam?: number; heat?: number; fire?: number; flush?: boolean;
  /** mine: how far the fire has spread (0..1) */
  burn?: number;
  /** yard: the sinkhole */
  hole?: "closed" | "open";
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
const P = (who: string, p: V3, expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => ({ who, p, expr, look, ...extra });
/** someone walking in profile along x from x0 (absolute) at v m/s */
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", extra: Partial<Person3> = {}): Person3 => {
  const d = Math.abs(v) * tt, p: V3 = [x0 + v * tt, y, z];
  return { who, p, expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: Math.min(1.25, Math.abs(v) / 1.6) }, ...extra };
};
const add = (p: V3, x: number, y: number, z: number): V3 => [p[0] + x, p[1] + y, p[2] + z];
const carrying = (w: Person3, at: V3): Person3 => ({ ...w, side: { ...w.side!, carry: at } });
const pg = (x: number, z: number): V3 => { const p = Pt(x, 0, z); return [p[0], pitGround(p[0], z), z]; };

// ---------------- smoke, steam, fire ----------------
const SMOKE: [number, number, number] = [0.72, 0.72, 0.74], STEAM: [number, number, number] = [0.94, 0.95, 0.98], GAS: [number, number, number] = [0.7, 0.74, 0.66];
/** a vent: puffs rising from p, drifting in x by `lean` */
const vent = (p: V3, tt: number, n = 4, rise = 2.6, s0 = 0.4, s1 = 1.8, a = 0.6, c = SMOKE, lean = 0.4, seed = 0): Puff[] => Array.from({ length: n }, (_, i) => { const u = (tt * 0.45 + i / n + seed * 0.37) % 1;
  return { p: add(p, lean * u * u + 0.08 * Math.sin(seed + i), rise * u, 0.06 * Math.cos(i + seed)), s: s0 + (s1 - s0) * u, c, a: a * Math.sin(Math.PI * Math.min(1, u * 1.15)) }; });
/** flames on a heap: additive orange puffs low down, smoke above */
const flames = (c: V3, tt: number, k: number, r = 3, n = 16): Puff[] => Array.from({ length: n }, (_, i) => { const a = i * 2.39, d = r * Math.sqrt((i + 0.5) / n), u = (tt * 1.4 + i * 0.13) % 1;
  return { p: add(c, Math.cos(a) * d, 0.3 + 1.8 * u * k + 0.5 * (1 - d / r), Math.sin(a) * d * 0.8), s: (0.7 + 1.0 * (1 - u)) * k, c: [1.0, 0.34 + 0.25 * (1 - u), 0.05] as [number, number, number], a: Math.min(0.85, 0.9 * (1 - u) * k), add: true }; });
const smokeCol = (c: V3, tt: number, k: number, n = 10, h = 14): Puff[] => Array.from({ length: n }, (_, i) => { const u = (tt * 0.2 + i / n) % 1;
  return { p: add(c, 2.5 * Math.sin(i * 1.7) * (1 - u) + 3 * u * u, 1.5 + h * u, 1.5 * Math.cos(i * 2.3)), s: (1.6 + 5.5 * u) * k, c: [0.34, 0.32, 0.32], a: 0.75 * (1 - u * 0.8) * k }; });
const sparks = (c: V3, tt: number, n: number): Card[] => Array.from({ length: n }, (_, i) => { const u = (tt * 0.8 + i / n) % 1; return { kind: "spark" as const, p: add(c, 1.8 * Math.sin(i * 2.7) * (0.4 + u), 0.6 + 4.5 * u, 1.2 * Math.cos(i * 1.9)), spin: i + u * 5, s: 0.7 + 0.5 * (1 - u) }; });

// ---------------- the town as the shots use it ----------------
const SW = 0.14; // sidewalk height
const VENTS = [-9.5, -6.2, -3.1, 0.4, 2.2, 3.6, 5.2, 6.8, 9.9];
const roadSmoke = (tt: number, k = 1): Puff[] => VENTS.flatMap((x, i) => vent(Tw(x, 0.1, crackZ(x)), tt, 4, 4.0 * k, 0.4, 2.4 * k, 0.45, SMOKE, 0.6, i));
const HOOK_POS: V3 = Tw(-0.5, 1.7, -4.5), HOOK_LOOK: V3 = Tw(12.5, 1.2, 9), HOOK = { fov: 50, roll: 0.035 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.05), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const hookState = (tt: number): Partial<St3> => ({ light: "townT", puffs: roadSmoke(tt) });
/** the holdouts on their porch (house HOLD[0]) */
const PORCH = (dx: number): V3 => Tw(HOLD[0].x + dx, 0.45, HOLD[0].z - 4.6);

// ---------------- the pit as the shots use it ----------------
const HEAPC: V3 = Pt(HEAP[0], HEAP[1] + 0.9, HEAP[2]);
const SEAMP: V3 = Pt(2.3, (SEAM[0] + SEAM[1]) / 2, 24.3);
const FLOOR = HEAP[1];
/** the five firemen along the near rim, by the truck */
const RIM5 = [-1.5, -0.75, 0, 0.75, 1.5].map((x, i) => pg(x + 2, 3.4 + [0.7, 0, 0.35, 0, 0.7][i]));
const ffs = (expr: Expr, look = 0) => ["ff1", "ff2", "ff3", "ff4", "ff5"].map((w, i) => P(w, RIM5[i], i === 2 ? "grin" : expr, look));

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // This town has been on fire for 64 years: the cracked road today, smoke pouring out of it (frame 0 is already close)
  hook: (s, f) => ({ ...hookState(t(f)), light: "townT", dof: 1, focus: Tw(3.6, 0.4, 1.0), cam: kick(hookCam(f), f, W(0, "64"), 0.8),
    subjects: [["the crack", Tw(6.8, 0.1, crackZ(6.8)), 0.2], ["the holdout house", Tw(HOLD[0].x, 3.2, HOLD[0].z - 3.5), 0.5]] }),
  // ...for 64 years: up and back, the crack running across the whole street, smoking all along it
  years: (s, f) => ({ light: "townT", dof: 0, focus: Tw(1, 0.5, 2), puffs: roadSmoke(t(f)),
    cam: kick(move({ pos: Tw(-2.5, 3.2, -9.0), look: Tw(2, 0.6, 2.5), fov: 50, roll: -0.05 }, { pos: Tw(-5.5, 7.5, -15), look: Tw(1, 0.6, 3.5), fov: 50, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, W(0, "64"), 0.8),
    subjects: [["the crack", Tw(0.4, 0.1, crackZ(0.4)), 0.3]] }),
  // ...its dump cleaned up: low by the heap on the pit floor, rubbish of every kind
  heap: (s, f) => ({ light: "pit", dof: 1, focus: HEAPC, puffs: vent(add(HEAPC, 1, 0.5, 0), t(f), 3, 2, 0.4, 1.2, 0.3, SMOKE, 0.3, 2),
    cam: orbit(s, f, add(HEAPC, 0, 0.2, 0), [-30, -10], [6.4, 5.6], [1.3, 1.0], 48, [-0.05, 0.04]),
    subjects: [["the rubbish heap", HEAPC, 1.5]] }),
  // ...to buy out the town: close on the family carrying their boxes to the van
  boxes: (s, f) => { const tt = t(f - s.a);
    return { light: "town62", van: true, dof: 1, focus: Tw(-8.6, 1.2, 4.8),
      people: [carrying(walker("man", -8.0, SW, 4.6, -0.7, tt + 2, "neutral"), Tw(-8.5 - 0.7 * (tt + 2), 1.1, 4.3)), P("wife", Tw(-8.9, SW, 5.3), "nervous", 1), P("kid", Tw(-8.4, SW, 5.0), "nervous", 1)],
      cam: move({ pos: Tw(-5.6, 1.5, -0.6), look: Tw(-9.2, 1.2, 4.8), fov: 44, roll: -0.05 }, { pos: Tw(-6.0, 1.45, 0.0), look: Tw(-9.3, 1.2, 4.8), fov: 42, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the family", Tw(-8.8, 1.3, 5.0), 0.3]] }; },
  // ...and it's still burning: down into the crack, orange inside
  burning: (s, f) => ({ light: "townT", dof: 1, focus: Tw(-0.6, 0.08, crackZ(-0.6)), puffs: roadSmoke(t(f)),
    cam: kick(snap(Tw(-0.2, 0.9, crackZ(-0.6) - 1.9), Tw(-0.6, 0.06, crackZ(-0.6)), f, s.a, { fov: 46, roll: -0.08 }, 2.2, 6), f, W(0, "burning"), 1.0),
    subjects: [["the hot crack", Tw(-0.6, 0.08, crackZ(-0.6)), 0.1]] }),
  // Centralia, Pennsylvania, was a coal town: the main street in 1962, people on the sidewalk, miners going to work
  street: (s, f) => { const tt = t(f - s.a);
    return { light: "town62", dof: 1, focus: Tw(-2, 1.4, 5.2),
      cam: move({ pos: Tw(5.0, 1.7, -3.4), look: Tw(-3.4, 1.6, 6.0), fov: 46, roll: 0.05 }, { pos: Tw(3.8, 1.6, -2.8), look: Tw(-3.8, 1.6, 6.0), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("man", Tw(-1.9, SW, 4.9), "grin", -1), P("wife", Tw(-1.2, SW, 5.1), "laugh", 1), P("kid", Tw(-1.55, SW, 4.5), "grin", 0, { wave: 0.6 }),
        walker("m1", -5.0, SW, 4.6, 1.1, tt, "neutral"), walker("m2", -5.9, SW, 5.0, 1.1, tt, "grin")],
      subjects: [["the town", Tw(-1.5, 1.4, 5.0), 0.3]] }; },
  // ...built right on top of old mine tunnels: the camera is in the dark tunnel, a miner's lamp, the old coal car
  tunnels: (s, f) => ({ light: "mineC", dof: 1, focus: Mn(0, 1.1, 9.8), key: Mn(0.4, 2.0, 2),
    cam: move({ pos: Mn(0.6, 2.1, -4.5), look: Mn(0, 1.0, 10), fov: 50, roll: 0.06 }, { pos: Mn(0.2, 1.3, 1.5), look: Mn(0, 1.0, 12), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the coal car", Mn(0, 0.9, 9.8), 0.4]] }),
  // In May of 1962, the town wanted its dump cleaned up: the dump in the old pit, by day
  dump: (s, f) => ({ light: "pit", dof: 1, focus: HEAPC, puffs: vent(add(HEAPC, 1, 0.5, 0), t(f), 3, 2, 0.4, 1.2, 0.3, SMOKE, 0.3, 2),
    cam: move({ pos: Pt(-5, 3.0, 6.0), look: add(HEAPC, 0, -0.5, 0), fov: 46, roll: 0.05 }, { pos: Pt(3, 2.5, 7.0), look: add(HEAPC, 0, -0.3, 0), fov: 44, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    subjects: [["the rubbish heap", HEAPC, 0.8]] }),
  // So the council hired five volunteer firefighters: the council at the table, one points at the plan
  council: (s, f) => { const p1 = Rm(-0.62, 0, 2.0), p2 = Rm(0, 0, 2.1), p3 = Rm(0.62, 0, 2.0);
    return { light: "council", dof: 1, focus: Rm(0, 1.45, 1.9), key: Rm(-0.4, 2.5, 0.4),
      cam: move({ pos: Rm(-0.8, 1.55, -3.4), look: Rm(0, 1.35, 1.9), fov: 44, roll: -0.05 }, { pos: Rm(0.4, 1.5, -3.0), look: Rm(0.05, 1.38, 1.9), fov: 42, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      people: [P("c1", p1, "stern", 1, { hw: [Rm(-0.45, DESK.y + 0.02, 1.3)] }), P("c2", p2, "grin", 0, { hw: [Rm(0.25, DESK.y + 0.05, 1.1), Rm(-0.3, DESK.y + 0.05, 1.2)] }), P("c3", p3, "neutral", -1)],
      subjects: [["the plan on the table", Rm(0, DESK.y + 0.02, 1.1), 0.2]] }; },
  // ...five volunteer firefighters: lined up on the rim by the fire company's truck
  five: (s, f) => ({ light: "pit", dof: 1, focus: add(RIM5[2], 0, 1.3, 0), people: ffs("neutral"),
    cam: kick(move({ pos: add(RIM5[2], 1.0, 1.2, -7.2), look: add(RIM5[2], 0, 1.2, 0), fov: 50, roll: 0.06 }, { pos: add(RIM5[2], -0.5, 1.3, -7.6), look: add(RIM5[2], 0, 1.25, 0), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, W(2, "5"), 0.7),
    subjects: [["the firemen", add(RIM5[2], 0, 1.3, 0), 0.2]] }),
  // ...and they set the dump on fire: a torch to the heap at dusk, the fire takes, at the lens
  light: (s, f) => { const tt = t(f - s.a), go = clamp01((f - W(2, "fire")) / 12), p = Pt(-1.5, FLOOR, 13.6), hand = add(p, 0.4, 1.15, 0.4), tip = add(p, 0.8, 1.5, 0.75);
    return { light: "pitD", dof: 1, focus: add(HEAPC, -1.5, 0, -2), fire: 0.25 + 0.75 * go, heat: go * 0.8, key: HEAPC,
      puffs: [...flames(HEAPC, tt, 0.3 + 0.7 * go, 3.2), ...smokeCol(HEAPC, tt, go, 10, 12)], cards: sparks(HEAPC, tt, Math.round(14 * go)), tools: [{ kind: "torch", g: hand, b: tip }],
      people: [P("ff2", p, go > 0.3 ? "shock" : "grin", -1, { hw: [hand] })],
      cam: kick(move({ pos: Pt(-4.2, FLOOR + 1.6, 8.6), look: add(HEAPC, -0.6, 0.2, -1), fov: 48, roll: -0.06 }, { pos: Pt(-3.4, FLOOR + 1.2, 10.4), look: add(HEAPC, -0.6, 0.6, -1), fov: 52, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(2, "fire"), 1.2),
      subjects: [["the burning heap", add(HEAPC, 0, 0.8, 0), 2.2], ["the torch", tip, 0.1]] }; },
  // The problem? That dump sat in an old strip-mine pit: a crane up and out, the walls in layers, the fire in the bottom
  pitwide: (s, f) => { const tt = t(f);
    return { light: "pitD", dof: 0, focus: HEAPC, fire: 1, heat: 0.8, key: HEAPC, puffs: [...flames(HEAPC, tt, 1, 3.2, 12), ...smokeCol(HEAPC, tt, 1, 10, 16)],
      cam: move({ pos: Pt(3, -5.5, 10.6), look: Pt(1.5, FLOOR + 1.2, 18), fov: 50, roll: 0.06 }, { pos: Pt(-4, 9, 2), look: Pt(1, FLOOR + 1.5, 17), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the pit wall", Pt(0, -4, PIT_C[2] + RZ * 0.85), 1.5], ["the fire", HEAPC, 1]] }; },
  // ...and most likely, the flames found a seam of coal: the black band in the wall starts to glow, spreading
  seam: (s, f) => { const tt = t(f), sp = clamp01((f - W(3, "seam") + 10) / 40) * 0.75 + 0.06;
    return { light: "pitD", dof: 1, focus: SEAMP, fire: 0.9, heat: 0.8, seam: sp, key: HEAPC, puffs: flames(HEAPC, tt, 0.8, 3.2, 10),
      cam: kick(move({ pos: Pt(-2.5, FLOOR + 2.0, 18.5), look: SEAMP, fov: 46, roll: 0.08 }, { pos: Pt(-1.0, FLOOR + 2.4, 20.0), look: add(SEAMP, 0.3, 0, 0), fov: 42, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(3, "seam"), 0.8),
      subjects: [["the coal seam", SEAMP, 0.5]] }; },
  // They hosed it down: two firemen on the pit floor, water on the heap, steam
  hose: (s, f) => { const tt = t(f - s.a), p1 = Pt(-2.0, FLOOR, 13.6), p2 = Pt(-0.4, FLOOR, 13.0), h1 = add(p1, -0.35, 1.1, 0.35), n1 = add(p1, -0.6, 1.3, 0.95), h2 = add(p2, -0.3, 1.1, 0.35), n2 = add(p2, -0.4, 1.3, 0.95);
    const jet = (n: V3, i0: number): Puff[] => Array.from({ length: 8 }, (_, i) => { const u = (tt * 1.6 + i / 8 + i0) % 1; return { p: add(n, 0.3 + 2.6 * u * (HEAPC[0] - n[0]) / 3, 0.25 * Math.sin(Math.PI * u) - 0.4 * u * u, 0.6 + 3.8 * u), s: 0.3 + 0.5 * u, c: [0.82, 0.9, 1.0] as [number, number, number], a: 0.85 * (1 - u * 0.5) }; });
    return { light: "pit", dof: 1, focus: add(p2, 0, 1.2, 0), heat: 0.35, fire: 0.2, key: HEAPC,
      puffs: [...jet(n1, 0), ...jet(n2, 0.5), ...vent(add(HEAPC, 0, -0.3, -1), tt, 8, 4, 0.8, 3.2, 0.7, STEAM, 0.5, 1)],
      tools: [{ kind: "hose", g: h1, b: n1, tail: Pt(-6, FLOOR + 0.05, 10) }, { kind: "hose", g: h2, b: n2, tail: Pt(-4, FLOOR + 0.05, 9.5) }],
      people: [P("ff1", p1, "stern", -1, { hw: [h1, n1] }), P("ff3", p2, "stern", -1, { hw: [h2, n2] })],
      cam: move({ pos: Pt(0.4, FLOOR + 1.5, 9.6), look: add(p2, 0.6, 1.0, 2.6), fov: 52, roll: 0.05 }, { pos: Pt(-0.6, FLOOR + 1.6, 9.9), look: add(p2, 0.4, 1.0, 2.8), fov: 50, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the water on the heap", Pt(0.0, FLOOR + 0.6, 15.6), 0.8]] }; },
  // It came back: smoke out of the ground round the heap again, the firemen look round
  back: (s, f) => { const tt = t(f - s.a), k = clamp01(tt / 0.6), spots = [[-4.2, 16], [-0.5, 17], [-2.5, 19], [1.2, 15], [-3.5, 14.5]] as [number, number][];
    return { light: "pit", dof: 1, focus: Pt(-1, FLOOR + 1.2, 13), heat: 0.6, fire: 0.25, key: HEAPC,
      puffs: spots.flatMap(([x, z], i) => vent(Pt(x, FLOOR + 0.05, z), tt, 3, 3 * k, 0.5, 2.2, 0.7, SMOKE, 0.3, i)),
      people: [P("ff1", Pt(-2.5, FLOOR, 13.8), "shock", 1), P("ff3", Pt(-1.5, FLOOR, 13.2), "nervous", -1)],
      cam: kick(snap(Pt(-2.0, FLOOR + 1.5, 9.4), Pt(-2.1, FLOOR + 1.3, 13.3), f, s.a, { fov: 54, roll: -0.07 }, 1.15, 5), f, W(4, "back"), 0.9),
      subjects: [["the smoke from the ground", Pt(-2.5, FLOOR + 1.5, 19), 0.8]] }; },
  // Because now it was burning underground, in the tunnels: in the tunnel, the fire coming toward us
  under: (s, f) => { const tt = t(f - s.a), bn = 0.4 + 0.6 * clamp01(tt / 2);
    return { light: "mineF", dof: 1, burn: bn, focus: Mn(0, 1.2, 16), key: Mn(0, 1.4, 18),
      puffs: Array.from({ length: 12 }, (_, i) => { const u = (tt * 0.35 + i / 12) % 1; return { p: Mn(0.5 * Math.sin(i * 2.1), 1.45 - 0.15 * Math.sin(i), 30 - 26 * u), s: 0.6 + 0.9 * u, c: [0.28, 0.2, 0.18], a: 0.6 * Math.sin(Math.PI * u) }; }),
      cam: move({ pos: Mn(0.4, 1.2, 1.0), look: Mn(0, 1.1, 20), fov: 52, roll: -0.05 }, { pos: Mn(0.2, 1.3, 6.5), look: Mn(0, 1.2, 22), fov: 48, roll: 0.04 }, f, s.a, s.b, expo, 0),
      subjects: [["the burning tunnel", Mn(0, 1.2, 18), 1]] }; },
  // ...where no hose could reach: a fireman on the pit floor sprays the ground; the steam just rolls off
  reach: (s, f) => { const tt = t(f - s.a), p = Pt(-2.0, FLOOR, 13.6), h = add(p, -0.35, 1.1, 0.35), n = add(p, -0.55, 1.15, 0.9), aim = Pt(-3.4, FLOOR, 16.5);
    return { light: "pit", dof: 1, focus: add(p, 0, 1.1, 0), heat: 0.55, key: HEAPC,
      puffs: [...Array.from({ length: 8 }, (_, i) => { const u = (tt * 1.6 + i / 8) % 1; return { p: L3(n, aim, u), s: 0.25 + 0.35 * u, c: [0.82, 0.9, 1.0] as [number, number, number], a: 0.85 }; }), ...vent(aim, tt, 6, 3, 0.6, 2.6, 0.75, STEAM, 0.3, 4)],
      tools: [{ kind: "hose", g: h, b: n, tail: Pt(-6, FLOOR + 0.05, 10) }], people: [P("ff5", p, "nervous", -1, { hw: [h, n] })],
      cam: orbit(s, f, add(p, -0.4, 1.0, 1.2), [26, 8], [4.6, 4.0], [0.8, 0.5], 48, [0.06, -0.04]),
      subjects: [["the spraying hose", n, 0.1], ["the steam", add(aim, 0, 1.2, 0), 0.4]] }; },
  // Crews dug trenches: men digging along the line, dirt flying where the shovels go in
  trench: (s, f) => { const tt = t(f - s.a), y0 = pitGround(Pt(TRENCH[0], 0, 0)[0], TRENCH[2] - 1.4), ph = (tt * 1.3) % 1, dig = Math.sin(ph * 6.283);
    const p1 = Pt(TRENCH[0] + 1.3, y0, TRENCH[2] - 1.5), p2 = Pt(TRENCH[0], y0, TRENCH[2] - 1.9), p3 = Pt(TRENCH[0] - 1.3, y0, TRENCH[2] - 1.4);
    const s1g = add(p1, -0.2, 1.05 + 0.2 * dig, 0.3), s1b = add(p1, 0.15, 0.05 + 0.25 * Math.max(0, dig), 1.2), pkg = add(p2, -0.1, 1.2 + 0.35 * dig, 0.35), pkb = add(p2, -0.1, 0.4 + 0.6 * Math.max(0, dig), 1.1);
    return { light: "pit", dof: 1, focus: add(p2, 0, 1.0, 0.8),
      tools: [{ kind: "shovel", g: s1g, b: s1b }, { kind: "pick", g: pkg, b: pkb }, { kind: "shovel", g: add(p3, 0.2, 1.0, 0.3), b: add(p3, 0.3, 0.1, 1.1) }],
      people: [P("w1", p1, "stern", -1, { hw: [s1g, L3(s1g, s1b, 0.35)] }), P("w2", p2, "stern", 1, { hw: [pkg, L3(pkg, pkb, 0.3)] }), P("w3", p3, "neutral", 0, { hw: [add(p3, 0.2, 1.0, 0.3)] })],
      cards: dig < -0.2 ? [] : Array.from({ length: 8 }, (_, i) => { const u = ((tt * 1.3) % 1) * 1.5; return { kind: "chunk" as const, p: add(s1b, 0.3 * Math.sin(i * 2) * u, 0.3 + 1.2 * u - 1.4 * u * u, -0.4 * u), spin: i + u * 4, s: 0.5 + 0.2 * (i % 3) }; }),
      cam: move({ pos: Pt(TRENCH[0] + 3.4, y0 + 2.4, TRENCH[2] - 8.2), look: add(p2, 0, 0.7, 1.2), fov: 46, roll: 0.05 }, { pos: Pt(TRENCH[0] + 2.2, y0 + 2.2, TRENCH[2] - 8.0), look: add(p2, 0, 0.75, 1.2), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the trench", Pt(TRENCH[0] + 0.6, y0 + 0.2, TRENCH[2] - 1.1), 0.6]] }; },
  // ...and flushed the mines: water pouring down the borehole, a man watching the gauge
  flush: (s, f) => { const y0 = pitGround(Pt(BORE[0], 0, 0)[0], BORE[2]), c = Pt(BORE[0], y0 + 1.0, BORE[2]);
    const tt = t(f), noz = Pt(BORE[0] + 0.15, y0 + 2.12, BORE[2] + 0.05);
    return { light: "pit", dof: 1, focus: c, people: [P("w2", Pt(BORE[0] - 1.6, y0, BORE[2] - 0.6), "stern", 1)],
      puffs: [...Array.from({ length: 14 }, (_, i) => { const u = (tt * 2.4 + i / 14) % 1; return { p: add(noz, 0.04 * Math.sin(i * 3), -1.15 * u, 0.04 * Math.cos(i * 2)), s: 0.22 + 0.06 * Math.sin(i * 1.7), c: [0.78, 0.88, 1.0] as [number, number, number], a: 0.9 }; }), ...vent(add(c, 0, 0.1, 0), tt, 4, 1.2, 0.3, 0.9, 0.5, STEAM, 0.1, 3)],
      cam: kick(snap(add(c, -2.6, 1.0, -4.6), add(c, 0.1, 0.4, 0), f, s.a, { fov: 46, roll: 0.07 }, 1.5, 5), f, W(5, "flushed"), 0.8),
      subjects: [["the water down the borehole", add(c, 0.1, 0.45, 0), 0.2]] }; },
  // Nothing worked: the trench smoking along its whole length, the crew standing back
  nothing: (s, f) => { const tt = t(f - s.a), y0 = pitGround(Pt(TRENCH[0], 0, 0)[0], TRENCH[2] - 1.4);
    return { light: "pit", dof: 0, focus: Pt(TRENCH[0], y0, TRENCH[2]),
      puffs: [-9, -5, -1, 3, 7].flatMap((dx, i) => vent(Pt(TRENCH[0] + dx, y0 - 1.6, TRENCH[2]), tt, 4, 4.4, 0.6, 3.0, 0.7, SMOKE, 0.5, i)),
      people: [P("w1", Pt(TRENCH[0] + 3, y0, TRENCH[2] - 3.2), "dazed", -1), P("w2", Pt(TRENCH[0] - 1, y0, TRENCH[2] - 3.4), "nervous", 1), P("w3", Pt(TRENCH[0] - 4.5, y0, TRENCH[2] - 3.1), "dazed", 0)],
      cam: orbit(s, f, Pt(TRENCH[0], y0 + 1.2, TRENCH[2] - 1.5), [-12, 8], [11, 10], [2.6, 2.0], 46, [-0.05, 0.04]),
      subjects: [["the smoking trench", Pt(TRENCH[0], y0 + 0.4, TRENCH[2]), 0.6]] }; },
  // Smoke rose from cracks in backyards: a summer yard, smoke out of the lawn by the clothesline, a woman stares
  yards: (s, f) => { const tt = t(f - s.a);
    return { light: "yardS", dof: 1, focus: Yd(-2.6, 0.6, 0.4),
      puffs: [[-3.2, 0.2], [-1.6, 1.3], [-4.6, -0.8]].flatMap(([x, z], i) => vent(Yd(x, 0.02, z), tt, 4, 2.4, 0.4, 1.8, 0.7, SMOKE, 0.3, i)),
      people: [P("wife", Yd(-0.8, 0, -1.6), "shock", 1)],
      cam: move({ pos: Yd(1.2, 1.5, -6.8), look: Yd(-2.0, 0.9, 0.4), fov: 46, roll: -0.05 }, { pos: Yd(0.2, 1.4, -6.0), look: Yd(-2.2, 0.8, 0.4), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the smoking lawn", Yd(-3.2, 0.4, 0.2), 0.4]] }; },
  // Gas crept into basements: a cellar, grey gas curling up through the floor cracks, a man backing off
  cellar: (s, f) => { const tt = t(f - s.a);
    return { light: "cellar", dof: 1, focus: Rm(0.4, 0.6, 0.2), key: Rm(0.4, 2.35, 0.2),
      puffs: [[0.4, 0.2], [-1.0, -0.6], [1.2, -1.4]].flatMap(([x, z], i) => vent(Rm(x, 0.02, z), tt, 5, 1.6, 0.4, 1.4, 0.6, GAS, 0.25, i)),
      people: [P("man", Rm(-1.5, 0, 1.6), "nervous", -1)],
      cam: kick(move({ pos: Rm(1.5, 1.2, -3.6), look: Rm(-0.2, 0.7, 0.6), fov: 48, roll: 0.07 }, { pos: Rm(1.0, 1.0, -3.0), look: Rm(-0.3, 0.75, 0.6), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, W(5, "basements"), 0.6),
      subjects: [["the gas", Rm(0.4, 0.9, 0.2), 0.3]] }; },
  // Then, on Valentine's Day, 1981: the yard in winter, a boy walking toward a wisp of steam
  boy: (s, f) => { const tt = t(f - s.a);
    return { light: "yardW", hole: "closed", dof: 1, focus: Yd(-1.2, 1.0, 2.4), puffs: vent(Yd(HOLE[0], 0.02, HOLE[2]), tt, 3, 1.6, 0.3, 1.1, 0.5, STEAM, 0.2, 1),
      people: [P("todd", Yd(-1.6 + 0.55 * tt, 0, 0.6 + 0.35 * tt), "neutral", 1, { march: (tt * 1.6) % 1 })],
      cam: orbit(s, f, Yd(-0.6, 1.0, 1.6), [-18, -4], [6.2, 5.4], [0.9, 0.6], 46, [0.04, -0.03]),
      subjects: [["the wisp of steam", Yd(HOLE[0], 0.8, HOLE[2]), 0.6]] }; },
  // ...a 12-year-old boy named Todd Domboski: close on him at the spot, looking down at it
  todd: (s, f) => { const p = Yd(HOLE[0] - 0.1, 0, HOLE[2] - 0.15);
    return { light: "yardW", hole: "closed", dof: 2, focus: add(p, 0, 0.95, 0), puffs: vent(Yd(HOLE[0] + 0.3, 0.02, HOLE[2] + 0.2), t(f), 3, 1.4, 0.3, 1.0, 0.5, STEAM, 0.2, 2),
      people: [P("todd", p, "neutral", 1, { headTilt: 0.15 })],
      cam: snap(add(p, 0.5, 1.05, -2.7), add(p, 0, 0.9, 0), f, s.a, { fov: 40, roll: 0.07 }, 1.5, 5),
      subjects: [["Todd", add(p, 0, 1.0, 0), 0.1]] }; },
  // ...felt the ground open under his feet: the ground gives way, earth falls in, he drops
  open: (s, f) => { const tt = t(f - s.a), f0 = W(6, "open"), u = clamp01((f - f0) / 8), p = Yd(HOLE[0], -0.9 * u * u, HOLE[2]);
    return { light: "yardW", hole: f >= f0 ? "open" : "closed", dof: 1, focus: add(p, 0, 0.8, 0),
      puffs: f >= f0 ? vent(Yd(HOLE[0], -0.3, HOLE[2]), tt, 6, 2.6, 0.4, 1.6, 0.6 * clamp01((f - f0 - 6) / 14), STEAM, 0.2, 3) : vent(Yd(HOLE[0] + 0.3, 0.02, HOLE[2] + 0.2), tt, 3, 1.4, 0.3, 1.0, 0.5, STEAM, 0.2, 2),
      cards: f >= f0 ? Array.from({ length: 10 }, (_, i) => { const v = clamp01((f - f0) / 14); return { kind: "chunk" as const, p: Yd(HOLE[0] + 0.55 * Math.cos(i * 0.63), 0.1 - 1.8 * v * v, HOLE[2] + 0.5 * Math.sin(i * 0.63)), spin: i + v * 4, s: 0.28 + 0.08 * (i % 3) }; }) : [],
      people: [P("todd", p, u > 0 ? "shock" : "neutral", 0, { air: u > 0, wave: u > 0 ? 1 : undefined })],
      cam: kick(move({ pos: Yd(HOLE[0] + 0.9, 1.5, HOLE[2] - 3.6), look: Yd(HOLE[0], 0.7, HOLE[2]), fov: 46, roll: -0.06 }, { pos: Yd(HOLE[0] + 0.6, 1.7, HOLE[2] - 3.2), look: Yd(HOLE[0], 0.4, HOLE[2]), fov: 48, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, f0, 1.3),
      subjects: [["the ground opening", Yd(HOLE[0], 0.0, HOLE[2]), 0.3]] }; },
  // He fell into a smoking sinkhole, and held onto tree roots: from above the lip, his hands on the roots, steam round him
  fell: (s, f) => { const tt = t(f - s.a), p = Yd(HOLE[0], -1.05, HOLE[2] + 0.05), rL = Yd(HOLE[0] - HOLE_R * 0.9 + 0.1, -0.42, HOLE[2] + 0.18), rR = Yd(HOLE[0] - HOLE_R * 0.9 + 0.0, -0.22, HOLE[2] - 0.2);
    return { light: "yardW", hole: "open", dof: 1, focus: add(p, 0, 1.1, 0), closeup: true,
      puffs: vent(Yd(HOLE[0] + 0.2, -0.6, HOLE[2] + 0.3), tt, 6, 2.2, 0.35, 1.5, 0.6, STEAM, 0.15, 5),
      people: [P("todd", p, "shock", -1, { air: true, hw: [rL, rR] })],
      cam: move({ pos: Yd(HOLE[0] + 0.6, 1.6, HOLE[2] - 2.4), look: add(p, -0.1, 1.05, 0), fov: 44, roll: 0.08 }, { pos: Yd(HOLE[0] + 0.3, 1.4, HOLE[2] - 2.0), look: add(p, -0.1, 1.0, 0), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the tree roots", L3(rL, rR, 0.5), 0.1]] }; },
  // ...until his cousin pulled him out: Eric at the lip, both hands on Todd's, Todd coming up
  cousin: (s, f) => { const u = smooth((f - s.a) / Math.max(1, s.b - s.a - 6)), p = Yd(HOLE[0] + 0.05, -1.05 + 0.85 * u, HOLE[2] + 0.1), e = Yd(HOLE[0] - 0.15, 0, HOLE[2] - 0.95), grip = add(p, 0, 1.5 * 0.72 + 0.12, -0.25);
    return { light: "yardW", hole: "open", dof: 1, focus: add(e, 0, 1.0, 0.4),
      puffs: vent(Yd(HOLE[0] + 0.25, -0.6, HOLE[2] + 0.3), t(f), 5, 2.2, 0.35, 1.5, 0.55, STEAM, 0.15, 6),
      people: [P("eric", e, "stern", 0, { hw: [add(grip, -0.12, 0, 0), add(grip, 0.12, 0, 0)] }), P("todd", p, u > 0.6 ? "relief_open" : "nervous", 0, { air: true, hw: [add(grip, -0.1, 0, 0.05), add(grip, 0.1, 0, 0.05)] })],
      cam: move({ pos: Yd(HOLE[0] + 2.6, 1.2, HOLE[2] - 3.4), look: add(e, 0, 0.8, 0.5), fov: 46, roll: -0.06 }, { pos: Yd(HOLE[0] + 2.0, 1.1, HOLE[2] - 3.0), look: add(e, 0, 0.9, 0.5), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["Eric", add(e, 0, 1.3, 0), 0.1], ["Todd", add(p, 0, 1.0, 0), 0.1]] }; },
  // The hole was about 150 feet deep: the camera drops into the throat, steam rushing past, dark below
  deep: (s, f) => { const tt = t(f - s.a), u = expo((f - s.a) / Math.max(1, s.b - s.a));
    return { light: "yardW", hole: "open", dof: 0, focus: Yd(HOLE[0], -6.8, HOLE[2]),
      puffs: vent(Yd(HOLE[0], -4.5, HOLE[2] + 0.1), tt, 8, 6, 0.3, 1.2, 0.5, STEAM, 0.05, 7),
      cam: kick({ pos: Yd(HOLE[0], 1.8 - 4.2 * u, HOLE[2] - 0.35 + 0.2 * u), look: Yd(HOLE[0] + 0.02, -7, HOLE[2] + 0.4), fov: 58, roll: 0.3 * u }, f, W(7, "150"), 1.0),
      subjects: [["the sinkhole", Yd(HOLE[0], -3.5, HOLE[2] + 0.3), 0.2]] }; },
  // After that, Congress paid $42 million to buy out the town: the moving van, families carrying boxes out (1962 street)
  money: (s, f) => { const tt = t(f - s.a);
    return { light: "town62", van: true, dof: 1, focus: Tw(-13, 1.6, 3.2),
      people: [carrying(walker("man", -7.6, SW, 4.6, -0.7, tt, "neutral"), Tw(-8.1 - 0.7 * tt, 1.1, 4.3)), P("wife", Tw(-8.9, SW, 5.3), "nervous", 1), P("kid", Tw(-8.4, SW, 5.0), "nervous", 1)],
      cam: move({ pos: Tw(-3.0, 2.3, -8.6), look: Tw(-9.4, 1.5, 3.6), fov: 50, roll: 0.05 }, { pos: Tw(-3.8, 2.2, -8.2), look: Tw(-9.6, 1.5, 3.6), fov: 50, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the moving van", Tw(-11.4, 2.0, 2.2), 1.5]] }; },
  // The state took the houses: a condemned notice on a door, snapped in close
  houses: (s, f) => ({ light: "town62", condemned: true, dof: 1, focus: Tw(22.81, 1.15, 8.07),
    cam: kick(snap(Tw(21.6, 1.55, 5.2), Tw(22.6, 1.3, 8.07), f, s.a, { fov: 44, roll: -0.08 }, 2.2, 6), f, W(8, "houses"), 0.8),
    subjects: [["the condemned notice", Tw(22.81, 1.15, 8.07), 0.1]] }),
  // The Postal Service even took away the ZIP code: the post office sign
  zip: (s, f) => ({ light: "town62", dof: 1, focus: Tw(-4.6, 3.55, FRONT_Z),
    cam: kick(move({ pos: Tw(-1.8, 3.4, -4.4), look: Tw(-4.6, 4.3, FRONT_Z), fov: 44, roll: 0.06 }, { pos: Tw(-2.9, 3.5, -3.4), look: Tw(-4.6, 4.3, FRONT_Z), fov: 42, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(8, "zip"), 1.0),
    subjects: [["the ZIP code sign", Tw(-4.6, 3.55, FRONT_Z), 0.1], ["the post office sign", Tw(-4.6, 5.9, FRONT_Z), 0.1]] }),
  // But a few people refused to leave: the couple on their porch, today, arms set
  refused: (s, f) => ({ light: "townT", dof: 1, focus: add(PORCH(0), 0, 1.2, 0), puffs: roadSmoke(t(f), 0.7),
    people: [P("holdM", PORCH(-0.6), "stern", 1), P("holdW", PORCH(0.55), "stern", -1)],
    cam: move({ pos: Tw(HOLD[0].x - 1.2, 1.7, 1.2), look: add(PORCH(0), 0, 1.25, 0), fov: 44, roll: -0.05 }, { pos: Tw(HOLD[0].x + 0.6, 1.6, 1.8), look: add(PORCH(0), 0, 1.25, 0), fov: 42, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    subjects: [["the couple", add(PORCH(0), 0, 1.3, 0), 0.2]] }),
  // ...and they won the right to stay for the rest of their lives: crane up over the empty grid, their house, and one other
  stay: (s, f) => ({ light: "townT", dof: 0, focus: Tw(0, 1, 8), puffs: roadSmoke(t(f), 1.2),
    people: [P("holdM", PORCH(-0.6), "grin", 1, { wave: 0.8 }), P("holdW", PORCH(0.55), "grin", -1)],
    cam: move({ pos: Tw(HOLD[0].x - 2.0, 2.4, -1.0), look: add(PORCH(0), 0, 1.2, 0), fov: 46, roll: 0.03 }, { pos: Tw(-1.5, 26, -40), look: Tw(-1.5, 0, 11), fov: 60, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["their house", Tw(HOLD[0].x, 3, HOLD[0].z), 1]] }),
  // By 2020, the census counted five people: the five of them in the empty road
  five2020: (s, f) => { const row: [string, number][] = [["holdM", -1.2], ["holdW", -0.6], ["r3", 0], ["r4", 0.6], ["r5", 1.2]];
    return { light: "townT", dof: 1, focus: Tw(0, 1.2, 5.0), puffs: roadSmoke(t(f), 0.5).filter((_, i) => i % 2 === 0),
      people: row.map(([w, x], i) => P(w, Tw(x, SW, 4.9 + [0.5, 0, 0.3, 0, 0.5][i]), i === 2 ? "grin" : "neutral", x > 0 ? -1 : 1)),
      cam: kick(orbit(s, f, Tw(0, 1.2, 5.0), [-10, 6], [8.0, 7.4], [0.4, 0.2], 46, [-0.04, 0.03]), f, W(10, "5"), 0.8),
      subjects: [["the five", Tw(0, 1.3, 5.0), 0.2]] }; },
  // And the fire? It could keep burning for another 250 years: the burning tunnel, the camera pushing into it
  fire: (s, f) => { const tt = t(f - s.a);
    return { light: "mineF", dof: 1, burn: 1, focus: Mn(0, 1.2, 20), key: Mn(0, 1.4, 18),
      puffs: Array.from({ length: 12 }, (_, i) => { const u = (tt * 0.35 + i / 12) % 1; return { p: Mn(0.5 * Math.sin(i * 2.1), 1.45 - 0.15 * Math.sin(i), 34 - 24 * u), s: 0.6 + 0.9 * u, c: [0.28, 0.2, 0.18], a: 0.55 * Math.sin(Math.PI * u) }; }),
      cards: sparks(Mn(0, 0.2, 16), tt, 10),
      cam: kick(move({ pos: Mn(-0.5, 1.6, 4.0), look: Mn(0, 1.2, 24), fov: 50, roll: 0.08 }, { pos: Mn(0.2, 1.3, 10.5), look: Mn(0, 1.3, 26), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(11, "250"), 1.0),
      subjects: [["the fire", Mn(0, 1.2, 22), 1]] }; },
  // loop: back to the smoking road, settling onto the opening frame
  end: (s, f) => { const h0 = hookCam(0);
    return { ...hookState(t(f - TOTAL)), light: "townT", dof: 1, focus: Tw(1.2, 0.4, 0.8),
      cam: move({ ...orb(Tw(1.0, 1.1, 2.0), -14, 10, 1.0), fov: 50, roll: 0.0 }, h0, f, s.a, s.b - 10, smooth, 0) }; },
};
void DEPTH; void HOUSE_Z;
/** the house kit, for the long-form */
export { clamp01, smooth, expo, L3, move, orb, orbit, snap, kick, t as secs, P, walker, add, vent, flames, smokeCol, sparks, roadSmoke, hookState, pg, PORCH, RIM5 };

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["years", "heap", "boxes", "street", "dump", "five", "hose", "under", "trench", "yards", "boy", "money", "refused", "fire"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps (Shorts: nothing important above y = 19 %) ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "64", kind: "stamp", text: "64 YEARS", f0: W(0, "64"), f1: B("hook"), y: 23, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 140 },
  { key: "pa", kind: "pill", text: "CENTRALIA", sub: "Pennsylvania", f0: W(1, "centralia"), f1: B("street"), y: 22, size: 84 },
  { key: "1962", kind: "pill", text: "MAY 1962", sub: "cleaning up the town dump", f0: W(2, "may"), f1: B("dump"), y: 22, size: 84 },
  { key: "5", kind: "call", text: "5 FIREFIGHTERS", f0: W(2, "5"), f1: B("five"), y: 23, fg: "#ffd166", size: 110 },
  { key: "pit", kind: "pill", text: "AN OLD STRIP-MINE PIT", f0: W(3, "stripmine"), f1: B("pitwide"), y: 22, size: 60 },
  { key: "coal", kind: "call", text: "A SEAM OF COAL", f0: W(3, "seam"), f1: B("seam"), y: 23, fg: "#ff9a4a", size: 110 },
  { key: "back", kind: "stamp", text: "IT CAME BACK", f0: W(4, "came"), f1: B("back"), y: 23, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 110 },
  { key: "nothing", kind: "stamp", text: "NOTHING WORKED", f0: W(5, "nothing"), f1: B("nothing"), y: 23, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 96 },
  { key: "1981", kind: "pill", text: "FEB. 14, 1981", sub: "Valentine's Day", f0: W(6, "valentines"), f1: B("boy"), y: 22, size: 84 },
  { key: "todd", kind: "pill", text: "TODD DOMBOSKI, 12", f0: S0("todd") + 4, f1: B("todd"), y: 22, size: 70 },
  { key: "eric", kind: "pill", text: "HIS COUSIN, ERIC", f0: W(7, "cousin"), f1: B("cousin"), y: 22, size: 70 },
  { key: "150", kind: "stamp", text: "150 FEET DEEP", f0: W(7, "150"), f1: B("deep"), y: 23, rot: -3, bg: "#2f2a3a", fg: "#ffffff", size: 110 },
  { key: "42", kind: "call", text: "$42 MILLION", f0: W(8, "42"), f1: B("money"), y: 23, fg: "#7dff8e", size: 150, rot: -4 },
  { key: "zip", kind: "stamp", text: "ZIP CODE: GONE", f0: W(8, "zip"), f1: B("zip"), y: 23, rot: 4, bg: "#e0332e", fg: "#ffffff", size: 100 },
  { key: "life", kind: "stamp", text: "FOR LIFE", f0: W(9, "rest"), f1: B("stay"), y: 23, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 130 },
  { key: "census", kind: "call", text: "5 PEOPLE", f0: W(10, "5"), f1: B("five2020"), y: 23, fg: "#ffd166", size: 150 },
  { key: "250", kind: "stamp", text: "250 MORE YEARS?", f0: W(11, "250"), f1: B("fire"), y: 23, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 96 },
] as Item[]).filter((i) => i.f1 > i.f0);
