// The Lake Peigneur Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; cameras
// sit on the -z side looking toward +z (world +x is screen LEFT), unless a shot turns round. Nobody is hurt in any
// shot: nobody died that day (three dogs did; they are not shown).
import { Expr } from "../bridge/toon";
import { nz } from "../frozen/fsets";
import { V3, FPS, Lk, Mn, HOLE, RC, BED, RIG, BARGES, TUG, FISH, HOUSE, HEADFRAME, CHIMNEY, CANAL_Z, CANAL_X1, W0, CAGE, BREACH, END_Z, groundY, islandY, craterY, funnelY } from "./place";
import { SEG_TIMES, TOTAL, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["plug", W(0, "plug") - 2], ["entire", W(0, "entire") - 2],
  ["calm", A(1)], ["ten", W(1, "10") - 2], ["fisher", W(1, "fishermen") - 2], ["garden", W(1, "garden") - 2], ["drilling", W(1, "rig") - 2],
  ["know", A(2)], ["under", W(2, "right") - 2], ["mine", W(2, "salt") - 2], ["fifty", W(2, "50") - 2],
  ["jam", A(3)], ["pops", W(3, "loud") - 2], ["tilt", W(3, "started") - 2],
  ["off", A(4)], ["flip", W(4, "whole") - 2], ["vanish", W(4, "vanished") - 2], ["deep", W(4, "into") - 2],
  ["bit", A(5)], ["pour", W(5, "and") - 2],
  ["coming", A(6)], ["cage", W(6, "1") - 2], ["eight", W(6, "8") - 2],
  ["whirl", A(7)], ["tug", W(7, "tugboat") - 2], ["barges", W(7, "11") - 2], ["trees", W(7, "trees") - 2], ["acres", W(7, "65") - 2],
  ["gone", A(8)], ["crater", W(8, "lake") - 2],
  ["canal", A(9)], ["falls", W(9, "louisiana's") - 2], ["fill", W(9, "poured") - 2],
  ["pop", A(10)], ["corks", W(10, "like") - 2],
  ["crazy", A(11)], ["nobody", W(11, "not") - 2], ["out", W(11, "every") - 2],
  ["today", A(12)], ["deep200", W(12, "200") - 2],
  ["blame", A(13)], ["paid", W(13, "texaco") - 2], ["end", W(13, "anyway") - 2],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number; air?: boolean;
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 } };
export type Tool = { kind: "knob" | "pick" | "pen" | "shovel"; g: V3; b: V3 };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "chunk" | "drop" | "salt" | "cloth";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
/** a barge or the tug: [x, z, yaw, y, roll] in lake coordinates; null = not there */
export type Boat = [number, number, number, number?, number?] | null;
export type St3 = {
  light: "dawn" | "morn" | "day" | "today" | "mine"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][]; tools?: Tool[]; cards?: Card[]; puffs?: Puff[]; key?: V3;
  /** the lake: water level, whirlpool radius / depth / spin, the crater, the stream and the waterfall */
  lake?: { lv?: number; hole?: number; depth?: number; spin?: number; pull?: number; crater?: boolean; stream?: boolean; fall?: boolean };
  /** the rig: tilt (about x), roll (about z), yaw, how far it has sunk, a sideways drift, the drill pipe turning; null = gone */
  rig?: { tilt?: number; roll?: number; yaw?: number; sink?: number; dx?: number; dz?: number; spin?: boolean } | null;
  barges?: Boat[]; tug?: Boat; skiff?: [number, number, number, number?] | null; slump?: number; today?: boolean;
  /** the mine: where the water front has got to (z), its depth, the roof breach jet, the drill bit (0 above the roof .. 1
   *  through it), the cage gate (0 open .. 1 shut), the cage's height (it goes up the shaft) */
  mine?: { front?: number; level?: number; jet?: boolean; bit?: number; gate?: number; cageY?: number };
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
const orbit = (s: { a: number; b: number }, f: number, c: V3, a: [number, number], r: [number, number], h: [number, number], fov = 46, roll: [number, number] = [0.05, -0.04], ease = smooth): Cam => {
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
const U = (s: { a: number; b: number }, f: number) => clamp01((f - s.a) / Math.max(1, s.b - s.a));
const P = (who: string, p: V3, expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => ({ who, p, expr, look, ...extra });
const add = (p: V3, x: number, y: number, z: number): V3 => [p[0] + x, p[1] + y, p[2] + z];
/** the ground's height as built (the sheet adds a little noise on land) */
const gy = (x: number, z: number) => { const y = groundY(x, z); return y + (y > 0.7 ? nz(x, z) * 3 : 0); };
const onGround = (x: number, z: number): V3 => Lk(x, gy(x, z), z);

// ---------------- the rig ----------------
const HX = HOLE.x, HZ = HOLE.z, DK = RIG.deck + 0.6, FL = RIG.deck + 1.4;
/** a point on the rig (untilted), relative to its centre at the waterline */
const Rg = (x: number, y: number, z: number): V3 => Lk(HX + x, y, HZ + z);
/** the driller at the brake on the drill floor, and his brake handle (pivot -> knob) */
const DRILLER: V3 = Rg(2.6, FL, -4.2), PIVOT: V3 = add(DRILLER, 0.62, 0.05, -0.3);
/** the brake handle stands at his right hand, so his hand is on it in every framing */
const brake = (pull: number) => { const knob: V3 = add(PIVOT, -0.12 + 0.12 * pull, 0.95 - 0.15 * pull, -0.12); return { tool: { kind: "knob" as const, g: PIVOT, b: knob }, knob }; };
const HOOK_POS: V3 = Lk(HX - 16, 3.2, HZ - 64), HOOK_LOOK: V3 = Lk(HX, 22, HZ), HOOK = { fov: 58, roll: 0.03 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.04), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const hookState = (tt: number): Partial<St3> => { const b = brake(0.5 + 0.5 * Math.sin(tt * 2));
  return { light: "dawn", rig: { spin: true }, tools: [b.tool], people: [P("driller", DRILLER, "smile", -1, { hw: [b.knob] }), P("hand1", Rg(-3.6, FL, -4.6), "neutral", 1)], lake: { lv: 0 } }; };

// ---------------- boats ----------------
const home = (): Boat[] => BARGES.map((b) => [b[0], b[1], b[2], 0, 0]);
/** a boat caught by the whirlpool: starts at its mooring, spirals in and goes down the funnel (u: 0..1) */
const sucked = (b: [number, number, number], u: number, hole: number, depth: number, lv = 0): Boat => {
  const a0 = Math.atan2(b[1] - HZ, b[0] - HX), r0 = Math.hypot(b[0] - HX, b[1] - HZ), k = clamp01(u), r = r0 * (1 - k) + 2, a = a0 + k * k * 4.2;
  if (r < 4 && k > 0.95) return null;
  const y = lv + (r < hole ? funnelY(r, hole, depth) : 0) - 0.3 * k;
  return [HX + Math.cos(a) * r, HZ + Math.sin(a) * r, -a + Math.PI / 2 + b[2] * 0.2, y, r < hole ? 0.35 * (1 - r / hole) : 0];
};
/** local -> lake coordinates on the tug (yaw y) */
const onTug = (q: [number, number, number], lx: number, ly: number, lz: number): V3 => { const c = Math.cos(q[2]), s = Math.sin(q[2]); return Lk(q[0] + lx * c + lz * s, ly, q[1] - lx * s + lz * c); };
const TUGQ: [number, number, number] = [TUG[0], TUG[1], TUG[2]];
const SKIFF: [number, number, number] = [FISH.x, FISH.z, 0.9];
const onSkiff = (lx: number, lz: number): V3 => { const c = Math.cos(SKIFF[2]), s = Math.sin(SKIFF[2]); return Lk(SKIFF[0] + lx * c + lz * s, 0.02, SKIFF[1] - lx * s + lz * c); };

// ---------------- splash and spray ----------------
const WHITE: [number, number, number] = [0.94, 0.96, 0.97], MUD: [number, number, number] = [0.6, 0.52, 0.42];
const splash = (c: V3, tt: number, k = 1, n = 16): Puff[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * 6.283, u = clamp01(tt * 0.9 + (i % 4) * 0.05), up = (8 + 6 * ((i * 3) % 5) / 5) * k;
  return { p: add(c, Math.cos(a) * (2 + 8 * u) * k, 0.5 + up * Math.sin(Math.PI * Math.min(1, u * 0.9)), Math.sin(a) * (2 + 6 * u) * k), s: (4 + 10 * u) * k, c: i % 4 ? WHITE : MUD, a: 0.85 * (1 - u * 0.7) }; });
const mistAt = (c: V3, tt: number, k = 1, n = 10): Puff[] => Array.from({ length: n }, (_, i) => { const u = (tt * 0.35 + i / n) % 1; return { p: add(c, (i % 3 - 1) * 6 * k + 3 * u, 2 + 18 * u * k, (i % 2 ? 3 : -3) * k), s: (6 + 16 * u) * k, c: WHITE, a: 0.55 * (1 - u) }; });

// ---------------- the mine as the shots use it ----------------
const MINERS = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"];
/** the eight men in the cage, three rows deep */
const inCage = (expr: (i: number) => Expr, y = 0.15): Person3[] => MINERS.map((m, i) => { const row = i < 3 ? 0 : i < 6 ? 1 : 2, k = row === 2 ? i - 6 : i - row * 3, n = row === 2 ? 2 : 3;
  return P(m, Mn(CAGE.x + (k - (n - 1) / 2) * 0.95, y, CAGE.z - 0.9 + row * 0.75), expr(i), (k - 1) * 0.3, { low: row > 0 }); });
const PADY = islandY(HEADFRAME.x, HEADFRAME.z) + 0.15;

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // this oil rig: low off the water at dawn, the derrick filling the frame (frame 0 is already close)
  hook: (s, f) => ({ ...hookState(t(f)), focus: HOOK_LOOK, dof: 0, cam: kick(hookCam(f), f, W(0, "rig"), 0.6), subjects: [["the rig", Rg(0, 20, 0), 3]] } as St3),
  // ...pulled the plug: from above, the rig going over into a spinning hole
  plug: (s, f) => { const u = U(s, f), tt = t(f - s.a), hole = 30 + 14 * u;
    return { light: "dawn", lake: { lv: 0, hole, depth: hole * 0.6, spin: 0.7 }, rig: { tilt: 0.35 + 0.5 * u, roll: 0.2 * u, sink: 6 + 12 * u, dz: 4 * u }, barges: home().map((b, i) => (b ? sucked(BARGES[i], 0.1 * u, hole, hole * 0.6) : null)),
      dof: 0, focus: Rg(0, 0, 0), cam: kick(move({ pos: Rg(-20, 75, -60), look: Rg(0, 0, 4), fov: 54, roll: -0.08 }, { pos: Rg(-14, 62, -48), look: Rg(0, -2, 6), fov: 56, roll: 0.06 }, f, s.a, s.b, smooth, 0), f, W(0, "plug"), 1.2),
      puffs: splash(Rg(0, 0, 0), 0.3 + tt * 0.6, 1.6), subjects: [["the hole", Rg(0, -4, 4), 4]] }; },
  // ...on an entire lake: high and wide, the whole lake turning round the hole
  entire: (s, f) => { const hole = 70;
    return { light: "dawn", lake: { lv: 0, hole, depth: 40, spin: 0.5 }, rig: null, barges: BARGES.map((b, i) => sucked(b, 0.3 + 0.04 * i, hole, 40)), tug: sucked(TUGQ, 0.25, hole, 40), dof: 0, focus: Lk(HX, 0, HZ),
      cam: orbit(s, f, Lk(HX + 20, -10, HZ + 20), [-30, -12], [330, 300], [260, 240], 52, [0.05, -0.03]), subjects: [["the whirlpool", Lk(HX, -0.5, HZ), 6]] }; },
  // you see, in 1980, Lake Peigneur: the calm lake at dawn from the near shore, the island and the rig across the water
  calm: (s, f) => ({ light: "dawn", lake: { lv: 0 }, rig: { spin: true }, skiff: [...SKIFF], dof: 0, focus: Lk(HX, 10, HZ),
    cam: move({ pos: Lk(-40, 4.5, -96), look: Lk(70, 9, 160), fov: 50, roll: 0.04 }, { pos: Lk(-20, 9, -92), look: Lk(80, 10, 160), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("local1", onGround(-24, -84), "smile", 1), P("local2", onGround(-21, -83), "smile", -1)], subjects: [["the rig", Rg(0, 20, 0), 3]] }),
  // ...about 10 feet deep: at the waterline by the rig's hull; the water barely covers a man's head
  ten: (s, f) => { const tt = t(f - s.a);
    return { light: "dawn", lake: { lv: 0 }, rig: { spin: true }, dof: 1, focus: Rg(-18, 1.5, -8),
      cam: move({ pos: Rg(-30, 1.2, -30), look: Rg(-16, 2.4, -6), fov: 44, roll: -0.05 }, { pos: Rg(-27, 1.6, -27), look: Rg(-16, 2.6, -6), fov: 44, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      puffs: [0, 1, 2].map((i) => ({ p: Rg(-18.4 + i * 0.3, 0.3, -8 - i * 4), s: 1.4 + 0.4 * Math.sin(tt * 3 + i), c: WHITE, a: 0.5 })), subjects: [["the hull at the waterline", Rg(-18, 0.8, -8), 1]] }; },
  // fishermen: Leonce Viator Jr. and his nephew in their skiff
  fisher: (s, f) => { const fp = onSkiff(-0.6, 0.15), np = onSkiff(1.0, -0.1);
    return { light: "dawn", lake: { lv: 0 }, rig: { spin: true }, skiff: [...SKIFF], dof: 2, focus: add(fp, 0, 1.4, 0),
      cam: orbit(s, f, add(fp, 0.6, 1.25, 0), [-28, -12], [6.6, 5.8], [0.4, 0.2], 42, [0.05, -0.04]),
      people: [P("fisher", fp, "smile", -1, { low: true, hw: [add(fp, 0.35, 0.55, -0.55), add(fp, -0.3, 0.55, -0.55)] }), P("nephew", np, "grin", 1, { low: true })], subjects: [["the fisherman", add(fp, 0, 1.5, 0), 0.3]] }; },
  // a garden on an island: the Jefferson house among the live oaks, the crane rising over the trees
  garden: (s, f) => { const hy = islandY(HOUSE.x, HOUSE.z);
    return { light: "dawn", lake: { lv: 0 }, rig: { spin: true }, dof: 0, focus: Lk(HOUSE.x, hy + 6, HOUSE.z),
      cam: move({ pos: Lk(HOUSE.x - 26, hy + 3, HOUSE.z - 52), look: Lk(HOUSE.x, hy + 7, HOUSE.z), fov: 50, roll: 0.04 }, { pos: Lk(HOUSE.x - 18, hy + 14, HOUSE.z - 48), look: Lk(HOUSE.x, hy + 7, HOUSE.z), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the house", Lk(HOUSE.x, hy + 6, HOUSE.z - 6), 1]] }; },
  // ...and a rig drilling for oil: the drill floor, the pipe turning, the driller on the brake
  drilling: (s, f) => { const b = brake(0.5 + 0.5 * Math.sin(t(f) * 2));
    return { light: "dawn", lake: { lv: 0 }, rig: { spin: true }, tools: [b.tool], dof: 1, focus: Rg(0.5, FL + 2, -2),
      cam: orbit(s, f, Rg(1.2, FL + 1.6, -2.5), [-34, -14], [11.5, 10.5], [0.9, 1.6], 50, [0.06, -0.03]),
      people: [P("driller", DRILLER, "smile", -1, { hw: [b.knob] }), P("hand1", Rg(-3.6, FL, -4.6), "neutral", 1), P("hand2", Rg(-1.5, FL, 3.5), "neutral", 0)], subjects: [["the drill pipe", Rg(0, FL + 4, 0), 0.4]] }; },
  // what the drillers didn't know: close on the driller, cheerful, the pipe turning behind him
  know: (s, f) => { const b = brake(0.5 + 0.5 * Math.sin(t(f) * 2));
    return { light: "dawn", lake: { lv: 0 }, rig: { spin: true }, tools: [b.tool], dof: 2, closeup: true, focus: add(DRILLER, 0, 1.5, 0),
      cam: move({ pos: add(DRILLER, -1.6, 1.7, -4.4), look: add(DRILLER, 0, 1.45, 0), fov: 36, roll: -0.06 }, { pos: add(DRILLER, -1.2, 1.6, -3.9), look: add(DRILLER, 0, 1.45, 0), fov: 35, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("driller", DRILLER, "smile", -1, { hw: [b.knob] })] }; },
  // right under the lake: down the pipe, from the derrick to the water where it goes in
  under: (s, f) => ({ light: "dawn", lake: { lv: 0 }, rig: { spin: true }, dof: 0, focus: Rg(0, 2, 0),
    cam: move({ pos: Rg(-5, 30, -14), look: Rg(0, 12, 0), fov: 52, roll: 0.05 }, { pos: Rg(-3.5, 6, -9), look: Rg(0, 1.5, 0), fov: 58, roll: -0.08 }, f, s.a, s.b, expo, 0),
    subjects: [["the drill pipe", Rg(0, 4, 0), 0.4]] }),
  // ...a salt mine: a vast white room, pillars of salt, lamps; men at work far off
  mine: (s, f) => ({ light: "mine", dof: 0, focus: Mn(0, 4, -40), key: Mn(0, 12.6, -36),
    cam: kick(move({ pos: Mn(-6, 2.2, 22), look: Mn(-2, 5.5, -40), fov: 62, roll: 0.05 }, { pos: Mn(-4, 3.6, 14), look: Mn(0, 5, -40), fov: 60, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, W(2, "salt"), 0.7),
    people: [P("m1", Mn(-2.5, 0, -14), "neutral", 1, { hw: [Mn(-2.1, 1.2, -14.4)] }), P("m3", Mn(2.4, 0, -20), "smile", -1), P("m4", Mn(-1, 0, -28), "neutral", 0)],
    tools: [{ kind: "shovel", g: Mn(-2.1, 1.2, -14.4), b: Mn(-1.6, 0.15, -14.9) }], subjects: [["the salt room", Mn(0, 5, -40), 6]] }),
  // ...about 50 men working inside: a crew at the face, the loader behind
  fifty: (s, f) => { const tt = t(f - s.a), sw = 0.5 + 0.5 * Math.sin(tt * 6);
    return { light: "mine", dof: 1, focus: Mn(30, 1.6, -28), key: Mn(30, 12.6, -24),
      cam: orbit(s, f, Mn(31, 1.6, -27), [-24, -4], [12.5, 11.0], [0.9, 1.4], 50, [0.05, -0.04]),
      people: [P("m2", Mn(28.6, 0, -26.2), "smile", 1, { hw: [Mn(29.1, 1.4 + 0.3 * sw, -26.6)] }), P("m5", Mn(31, 0, -25.4), "neutral", -1), P("m6", Mn(33.2, 0, -26.6), "smile", 0), P("foreman", Mn(26.5, 0, -24.6), "neutral", 1)],
      tools: [{ kind: "pick", g: Mn(29.1, 1.4 + 0.3 * sw, -26.6), b: Mn(29.7, 1.9 + 0.4 * sw, -27.3) }],
      cards: Array.from({ length: 6 }, (_, i) => { const v = (tt * 2 + i / 6) % 1; return { kind: "salt" as const, p: Mn(29.9 + 0.6 * v * Math.cos(i), 1.8 + 0.6 * v - 2 * v * v, -27.4 - 0.3 * v), spin: i + v * 5, s: 1 - 0.5 * v }; }),
      subjects: [["the miners", Mn(31, 1.4, -26), 0.4]] }; },
  // that morning, the drill jammed: the table stops; the driller hauls on the brake
  jam: (s, f) => { const u = expo(U(s, f) * 1.6), b = brake(u);
    return { light: "dawn", lake: { lv: 0 }, rig: { spin: false }, tools: [b.tool], dof: 2, closeup: true, focus: add(DRILLER, 0, 1.3, 0),
      cam: kick(move({ pos: add(DRILLER, 1.6, 1.4, -4.6), look: add(DRILLER, -0.6, 1.3, 0.2), fov: 40, roll: 0.07 }, { pos: add(DRILLER, 1.2, 1.5, -4.0), look: add(DRILLER, -0.6, 1.3, 0.2), fov: 40, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(3, "jammed"), 1.0),
      people: [P("driller", DRILLER, u > 0.4 ? "pained" : "stern", -1, { hw: [b.knob] })], subjects: [["the rotary table", Rg(0, FL + 0.6, 0), 0.3]] }; },
  // then came loud pops: under the deck at the waterline, water jumping round the hull
  pops: (s, f) => { const tt = t(f - s.a), pops = [W(3, "loud"), W(3, "pops"), W(3, "rig") - 4];
    const near = pops.map((p) => clamp01((f - p) / 12)).filter((u) => u > 0 && u < 1);
    return { light: "dawn", lake: { lv: 0 }, rig: { spin: false, tilt: 0.01 * Math.sin(tt * 30) * (near.length ? 1 : 0) }, dof: 0, focus: Rg(-14, 2, -10),
      cam: kick(kick(move({ pos: Rg(-26, 1.0, -26), look: Rg(-12, 3, -8), fov: 56, roll: -0.08 }, { pos: Rg(-24, 1.2, -24), look: Rg(-12, 3.2, -8), fov: 56, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, pops[0], 1.4), f, pops[1], 1.4),
      puffs: near.flatMap((u, i) => splash(Rg(-16 + 6 * i, 0, -11 + 2 * i), u, 0.5, 8)), subjects: [["the hull", Rg(-16, 1.2, -11), 1]] }; },
  // ...and it started to tilt: the whole rig leaning, the crew grabbing the rail
  tilt: (s, f) => { const u = U(s, f), tl = 0.02 + 0.08 * smooth(u);
    return { light: "dawn", lake: { lv: 0, hole: 6 + 4 * u, depth: 4, spin: 1 }, rig: { tilt: tl, roll: 0.02 * u, sink: 0.5 * u }, dof: 0, focus: Rg(0, 18, 0),
      cam: move({ pos: Rg(-40, 8, -70), look: Rg(0, 20, 0), fov: 56, roll: 0.02 }, { pos: Rg(-38, 6, -64), look: Rg(0, 18, 0), fov: 56, roll: 0.09 }, f, s.a, s.b, smooth, 0),
      subjects: [["the rig", Rg(0, 22, 0), 3]] }; },
  // the crew got off: on the tug pulling away, looking back at the rig
  off: (s, f) => { const u = U(s, f), q: [number, number, number] = [TUGQ[0] - 3 * u, TUGQ[1] - 8 * u, TUGQ[2]];
    const ps: Person3[] = [P("pusher", onTug(q, -6.4, 1.75, -1.2), "shock", 1, { low: false }), P("hand1", onTug(q, -7.4, 1.75, 0.6), "shock", -1), P("hand2", onTug(q, -5.6, 1.75, 1.3), "nervous", 0), P("driller", onTug(q, -7.8, 1.75, -1.6), "shock", 1)];
    return { light: "dawn", lake: { lv: 0, hole: 12, depth: 6, spin: 1.2 }, rig: { tilt: 0.1 + 0.05 * u, roll: 0.03, sink: 0.6 + 1 * u }, tug: [q[0], q[1], q[2], 0, 0], dof: 1, focus: onTug(q, -6.8, 3.2, 0),
      cam: move({ pos: onTug(q, -2, 3.6, -9), look: onTug(q, -6.8, 3.0, 0), fov: 46, roll: 0.05 }, { pos: onTug(q, -3, 3.3, -8), look: onTug(q, -6.8, 3.0, 0), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      people: ps, subjects: [["the crew", onTug(q, -6.8, 3.0, 0), 0.6]] }; },
  // then the whole rig flipped over: it rolls and goes down, water thrown up
  flip: (s, f) => { const u = U(s, f), tt = t(f - s.a), k = smooth(u * 1.15);
    return { light: "dawn", lake: { lv: 0, hole: 16 + 10 * u, depth: 12, spin: 1.4 }, rig: { tilt: 0.15 + 1.25 * k, roll: 0.25 * k, sink: 2 + 34 * k * k, dz: 10 * k }, dof: 0, focus: Rg(0, 10, 4),
      cam: kick(move({ pos: Rg(-60, 14, -110), look: Rg(0, 16, 0), fov: 46, roll: -0.03 }, { pos: Rg(-54, 10, -100), look: Rg(0, 6, 4), fov: 50, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(4, "flipped"), 1.4),
      puffs: u > 0.35 ? splash(Rg(0, 0, 8), (tt - 0.35 * t(s.b - s.a)) * 0.9, 2.2, 20) : [], subjects: [["the rig", Rg(0, 10, 4), 4]] }; },
  // ...and vanished: where it stood, foam going round, a hole in the water
  vanish: (s, f) => { const u = U(s, f);
    return { light: "dawn", lake: { lv: 0, hole: 20 + 6 * u, depth: 14, spin: 1.6 }, rig: null, barges: home(), dof: 0, focus: Rg(0, -2, 0),
      cam: move({ pos: Rg(-26, 18, -42), look: Rg(0, -3, 2), fov: 52, roll: 0.07 }, { pos: Rg(-20, 14, -36), look: Rg(0, -4, 2), fov: 54, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the hole", Rg(0, -3, 0), 3]] }; },
  // ...into water 10 feet deep: the crew on the tug, staring
  deep: (s, f) => { const q: [number, number, number] = [TUGQ[0] - 3, TUGQ[1] - 8, TUGQ[2]];
    return { light: "dawn", lake: { lv: 0, hole: 26, depth: 16, spin: 1.6 }, rig: null, tug: [q[0], q[1], q[2], 0, 0], dof: 2, focus: onTug(q, -6.6, 3.2, 0),
      cam: kick(snap(onTug(q, -3.5, 3.4, -4.6), onTug(q, -6.6, 3.1, 0), f, s.a, { fov: 44, roll: -0.06 }, 1.5, 5), f, W(4, "10"), 0.8),
      people: [P("pusher", onTug(q, -6.4, 1.75, -1.2), "shock", 1), P("driller", onTug(q, -7.4, 1.75, 0.4), "shock", -1)], subjects: [["the crew", onTug(q, -6.8, 3.0, -0.4), 0.4]] }; },
  // they'd drilled straight into the mine: the bit comes through the roof, salt falling
  bit: (s, f) => { const u = expo(U(s, f) * 1.4), tt = t(f - s.a);
    return { light: "mine", mine: { bit: 0.2 + 0.8 * u }, dof: 1, focus: Mn(BREACH.x, 12, BREACH.z), key: Mn(BREACH.x + 6, 12.6, BREACH.z + 4),
      cam: kick(move({ pos: Mn(BREACH.x + 6, 4, BREACH.z - 14), look: Mn(BREACH.x, 12.4, BREACH.z), fov: 50, roll: -0.08 }, { pos: Mn(BREACH.x + 5, 3.4, BREACH.z - 12), look: Mn(BREACH.x, 12.6, BREACH.z), fov: 50, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(5, "into") , 1.0),
      cards: Array.from({ length: 14 }, (_, i) => { const v = (tt * 1.2 + i / 14) % 1; return { kind: "salt" as const, p: Mn(BREACH.x + 1.5 * Math.sin(i * 2.1), 13.8 - 13 * v * v, BREACH.z + 1.5 * Math.cos(i * 1.7)), spin: i + v * 6, s: 1.6 - v }; }),
      subjects: [["the drill bit", Mn(BREACH.x, 12.6, BREACH.z), 0.4]] }; },
  // ...and the lake was pouring in: a column of water out of the roof, the floor flooding
  pour: (s, f) => { const u = U(s, f), tt = t(f - s.a);
    return { light: "mine", mine: { jet: true, front: BREACH.z + 12 + 24 * u, level: 0.08 }, dof: 0, focus: Mn(BREACH.x, 6, BREACH.z), key: Mn(BREACH.x + 6, 12.6, BREACH.z + 4),
      cam: kick(move({ pos: Mn(BREACH.x + 1.5, 2.6, BREACH.z + 30), look: Mn(BREACH.x, 6.5, BREACH.z), fov: 54, roll: 0.06 }, { pos: Mn(BREACH.x + 1, 2.0, BREACH.z + 25), look: Mn(BREACH.x, 6.0, BREACH.z), fov: 56, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(5, "pouring"), 1.2),
      puffs: mistAt(Mn(BREACH.x, 0, BREACH.z), tt, 0.35, 10), cards: Array.from({ length: 20 }, (_, i) => { const v = (tt * 1.6 + i / 20) % 1, a = i * 2.4; return { kind: "drop" as const, p: Mn(BREACH.x + Math.cos(a) * (1.5 + 4 * v), 0.4 + 3 * v - 4 * v * v, BREACH.z + Math.sin(a) * (1.5 + 4 * v)), spin: a, s: 2.4 - v }; }),
      subjects: [["the water", Mn(BREACH.x, 7, BREACH.z), 1]] }; },
  // down below, the miners saw the water coming: they turn; the water runs along the floor toward them
  coming: (s, f) => { const u = U(s, f);
    return { light: "mine", mine: { front: -40 + 18 * u, level: 0.08 }, dof: 1, focus: Mn(0, 1.5, -12), key: Mn(0, 12.6, -10),
      cam: move({ pos: Mn(1.2, 1.5, -2), look: Mn(0, 1.2, -40), fov: 52, roll: -0.05 }, { pos: Mn(1.0, 1.4, -4.5), look: Mn(0, 1.0, -40), fov: 54, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      people: [P("m1", Mn(-0.9, 0, -11), "shock", 1, { facing: 0 }), P("m3", Mn(1.4, 0, -13.5), "shock", -1), P("m4", Mn(-0.2, 0, -17), "nervous", 0)], subjects: [["the water", Mn(0, 0.2, -25), 1]] }; },
  // one elevator: the cage at the shaft station, gate open
  cage: (s, f) => ({ light: "mine", mine: { gate: 0, front: -10, level: 0.08 }, dof: 1, focus: Mn(CAGE.x, 1.6, CAGE.z), key: Mn(0, 12.6, END_Z - 6),
    cam: kick(snap(Mn(CAGE.x + 1.5, 1.9, CAGE.z - 9), Mn(CAGE.x, 1.7, CAGE.z), f, s.a, { fov: 44, roll: 0.05 }, 1.6, 5), f, W(6, "1"), 0.8),
    people: [P("foreman", Mn(CAGE.x + 3.6, 0, CAGE.z - 3.2), "stern", -1, { wave: 1 })], subjects: [["the cage", Mn(CAGE.x, 1.4, CAGE.z), 0.4]] }),
  // ...8 men at a time: eight in the cage, the gate shuts, it goes up
  eight: (s, f) => { const u = U(s, f), g = clamp01((u - 0.15) * 3), up = Math.max(0, u - 0.6) * 9;
    return { light: "mine", mine: { gate: g, cageY: up, front: -4 + 6 * u, level: 0.1 }, dof: 1, focus: Mn(CAGE.x, 1.6 + up, CAGE.z), key: Mn(0, 12.6, END_Z - 6),
      cam: move({ pos: Mn(CAGE.x - 1.2, 1.8, CAGE.z - 8.2), look: Mn(CAGE.x, 1.6, CAGE.z), fov: 46, roll: -0.04 }, { pos: Mn(CAGE.x - 0.8, 1.6, CAGE.z - 7.4), look: Mn(CAGE.x, 2.6, CAGE.z), fov: 48, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: inCage((i) => (i % 3 ? "nervous" : "stern"), 0.15 + up), subjects: [["the cage", Mn(CAGE.x, 1.4 + up, CAGE.z), 0.4]] }; },
  // up top, the lake became a whirlpool: overhead, barges circling the hole
  whirl: (s, f) => { const u = U(s, f), hole = 50 + 10 * u;
    return { light: "morn", lake: { lv: 0, hole, depth: 32, spin: 0.9 }, rig: null, barges: BARGES.map((b, i) => sucked(b, 0.1 + 0.25 * u + 0.02 * i, hole, 32)), tug: sucked(TUGQ, 0.15 + 0.2 * u, hole, 32), dof: 0, focus: Lk(HX, -8, HZ),
      cam: move({ pos: Lk(HX - 30, 150, HZ - 120), look: Lk(HX, -6, HZ), fov: 54, roll: 0.06 }, { pos: Lk(HX - 10, 140, HZ - 100), look: Lk(HX, -8, HZ), fov: 56, roll: -0.08 }, f, s.a, s.b, smooth, 0),
      subjects: [["the whirlpool", Lk(HX, -10, HZ), 5]] }; },
  // it swallowed a tugboat: riding alongside the tug as it spirals in
  tug: (s, f) => { const u = U(s, f), hole = 62, q = sucked(TUGQ, 0.45 + 0.4 * u, hole, 34)!;
    return { light: "morn", lake: { lv: 0, hole, depth: 34, spin: 1.0 }, rig: null, tug: q, barges: BARGES.map((b, i) => sucked(b, 0.4 + 0.02 * i, hole, 34)), dof: 0, focus: Lk(q[0], (q[3] ?? 0) + 3, q[1]),
      cam: kick(move({ pos: Lk(q[0] - 22, (q[3] ?? 0) + 14, q[1] - 30), look: Lk(q[0], (q[3] ?? 0) + 2, q[1]), fov: 50, roll: 0.08 }, { pos: Lk(q[0] - 18, (q[3] ?? 0) + 11, q[1] - 26), look: Lk(q[0], (q[3] ?? 0) + 2, q[1]), fov: 50, roll: -0.05 }, (f), s.a, s.b, smooth, 0), f, W(7, "tugboat"), 0.8),
      subjects: [["the tugboat", Lk(q[0], (q[3] ?? 0) + 3, q[1]), 2]] }; },
  // ...11 barges: the barges going round and down
  barges: (s, f) => { const u = U(s, f), hole = 66;
    return { light: "morn", lake: { lv: 0, hole, depth: 36, spin: 1.0 }, rig: null, tug: null, barges: BARGES.map((b, i) => sucked(b, 0.55 + 0.35 * u + 0.015 * i, hole, 36)), dof: 0, focus: Lk(HX, -10, HZ),
      cam: orbit(s, f, Lk(HX, -8, HZ), [-50, -26], [150, 135], [70, 62], 50, [0.06, -0.05]), subjects: [["the barges", Lk(HX - 20, -6, HZ - 20), 4]] }; },
  // ...trees: the oaks on the island's edge start to go
  trees: (s, f) => { const u = U(s, f), hole = 72;
    return { light: "morn", lake: { lv: -0.5, hole, depth: 38, spin: 0.9 }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 0.25 * smooth(u), dof: 0, focus: Lk(HX + RC - 2, 4, HZ),
      cam: kick(move({ pos: Lk(HX + RC - 50, 10, HZ - 70), look: Lk(HX + RC - 2, 5, HZ), fov: 44, roll: -0.06 }, { pos: Lk(HX + RC - 44, 8, HZ - 62), look: Lk(HX + RC - 4, 3, HZ), fov: 46, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(7, "trees") + 4, 1.0),
      puffs: u > 0.3 ? splash(Lk(HX + RC - 14, -2, HZ), (u - 0.3) * 1.6, 1.2, 10) : [], subjects: [["the island's edge", Lk(HX + RC - 4, 3, HZ), 3]] }; },
  // ...and 65 acres of the island: the edge breaks off and slides into the hole
  acres: (s, f) => { const u = U(s, f), hole = 78;
    return { light: "morn", lake: { lv: -1, hole, depth: 40, spin: 0.9 }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 0.25 + 0.75 * smooth(u), dof: 0, focus: Lk(HX + 50, -4, HZ),
      cam: move({ pos: Lk(HX - 40, 70, HZ - 140), look: Lk(HX + 50, -6, HZ), fov: 46, roll: 0.05 }, { pos: Lk(HX - 30, 60, HZ - 128), look: Lk(HX + 46, -10, HZ), fov: 48, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      puffs: splash(Lk(HX + RC - 24, -6, HZ), (U(s, f) * 1.4) % 1, 2.0, 14), subjects: [["the island's edge", Lk(HX + RC - 10, -2, HZ), 5]] }; },
  // in about 3 hours, the lake was gone: the water level drops, the crater opens (the sun climbs)
  gone: (s, f) => { const u = smooth(U(s, f)), lv = -3 * u;
    return { light: "morn", lake: { lv: u > 0.97 ? -60 : lv, hole: 80 + 15 * u, depth: 40, spin: 0.7, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 0, focus: Lk(HX, -10, HZ),
      cam: move({ pos: Lk(HX - 160, 120, HZ - 240), look: Lk(HX, -10, HZ + 10), fov: 50, roll: 0.03 }, { pos: Lk(HX - 140, 100, HZ - 220), look: Lk(HX, -14, HZ + 10), fov: 50, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the lake bed", Lk(HX - 60, -3, HZ), 6]] }; },
  // ...gone: down into the crater, mud and a puddle at the bottom
  crater: (s, f) => ({ light: "morn", lake: { lv: -46, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 0, focus: Lk(HX, -40, HZ),
    cam: move({ pos: Lk(HX - RC - 12, 6, HZ - 40), look: Lk(HX, -40, HZ + 10), fov: 56, roll: -0.04 }, { pos: Lk(HX - RC - 4, 2, HZ - 34), look: Lk(HX, -44, HZ + 12), fov: 58, roll: 0.05 }, f, s.a, s.b, smooth, 0),
    subjects: [["the crater", Lk(HX, -42, HZ), 5]] }),
  // then the canal to the Gulf started running backwards: low at the canal mouth, the water running in toward the lake bed
  canal: (s, f) => ({ light: "day", lake: { lv: -46, crater: true, stream: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 0, focus: Lk(CANAL_X1, BED + 1, CANAL_Z),
    cam: move({ pos: Lk(CANAL_X1 + 90, -0.8, CANAL_Z - 22), look: Lk(CANAL_X1 + 30, -1.6, CANAL_Z), fov: 52, roll: 0.05 }, { pos: Lk(CANAL_X1 + 82, -1.2, CANAL_Z - 18), look: Lk(CANAL_X1 + 30, -1.8, CANAL_Z), fov: 52, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    subjects: [["the canal", Lk(CANAL_X1, BED + 0.6, CANAL_Z), 2]] }),
  // ...Louisiana's tallest waterfall: from the crater floor, the water coming over the rim
  falls: (s, f) => { const tt = t(f - s.a), lv = -44;
    return { light: "day", lake: { lv, crater: true, stream: true, fall: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 0, focus: Lk(W0.x + 10, -24, W0.z),
      cam: kick(move({ pos: Lk(W0.x + 70, lv + 3, W0.z - 34), look: Lk(W0.x + 6, -18, W0.z), fov: 58, roll: -0.06 }, { pos: Lk(W0.x + 64, lv + 2, W0.z - 30), look: Lk(W0.x + 6, -14, W0.z), fov: 60, roll: 0.04 }, f, s.a, s.b, smooth, 0), f, W(9, "waterfall"), 1.0),
      puffs: mistAt(Lk(W0.x + 28, lv, W0.z), tt, 1.2, 12), subjects: [["the waterfall", Lk(W0.x + 14, -20, W0.z), 3]] }; },
  // ...poured into the hole: from above the rim, the crater filling
  fill: (s, f) => { const u = U(s, f), tt = t(f - s.a), lv = -44 + 14 * smooth(u);
    return { light: "day", lake: { lv, crater: true, stream: true, fall: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 0, focus: Lk(HX, lv, HZ),
      cam: orbit(s, f, Lk(HX, lv + 4, HZ), [-40, -24], [150, 140], [90, 80], 50, [0.04, -0.04]), puffs: mistAt(Lk(W0.x + 28, lv, W0.z), tt, 1.2, 8), subjects: [["the crater", Lk(HX, lv, HZ), 6]] }; },
  // days later, 9 of the barges popped back up: the lake full again, barges bursting out of the water
  pop: (s, f) => { const u = U(s, f), tt = t(f - s.a);
    const bs: Boat[] = BARGES.map((b, i) => { if (i > 8) return null; const k = clamp01((u - i * 0.06) * 3), r = 20 + i * 6, a = i * 0.7; return k <= 0 ? null : [HX + Math.cos(a) * r, HZ + Math.sin(a) * r, a, -6 + 6.2 * Math.sin(Math.min(1, k) * Math.PI * 0.62) / Math.sin(Math.PI * 0.62), 0.3 * Math.sin(k * 9) * (1 - k)]; });
    return { light: "day", lake: { lv: 0, crater: true }, rig: null, tug: null, barges: bs, slump: 1, dof: 0, focus: Lk(HX, 2, HZ),
      cam: move({ pos: Lk(HX - 60, 22, HZ - 110), look: Lk(HX, 1, HZ + 10), fov: 50, roll: 0.05 }, { pos: Lk(HX - 50, 16, HZ - 96), look: Lk(HX, 1, HZ + 10), fov: 52, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      puffs: bs.flatMap((b, i) => (b ? splash(Lk(b[0], 0, b[1]), clamp01((u - i * 0.06) * 3) * 1.2, 0.9, 4) : [])).slice(0, 60), subjects: [["the barges", Lk(HX, 1, HZ), 6]] }; },
  // ...like corks: one barge bobbing up close, water pouring off its deck
  corks: (s, f) => { const u = U(s, f), tt = t(f - s.a), b: Boat = [HX - 30, HZ - 20, 0.4, -0.6 + 1.2 * Math.abs(Math.sin(tt * 3.2)) * (1 - 0.6 * u), 0.08 * Math.sin(tt * 4)];
    return { light: "day", lake: { lv: 0, crater: true }, rig: null, tug: null, barges: [b, ...BARGES.slice(1).map(() => null)], slump: 1, dof: 1, focus: Lk(b[0], 2, b[1]),
      cam: kick(move({ pos: Lk(b[0] - 24, 3, b[1] - 30), look: Lk(b[0], 1.6, b[1]), fov: 46, roll: -0.06 }, { pos: Lk(b[0] - 20, 2.4, b[1] - 26), look: Lk(b[0], 1.8, b[1]), fov: 46, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(10, "corks"), 1.0),
      puffs: splash(Lk(b[0], 0, b[1]), (tt * 0.8) % 1, 1.4, 12), subjects: [["the barge", Lk(b[0], 1.4, b[1]), 2]] }; },
  // and here's the crazy part: the crew and locals on the shore, stunned
  crazy: (s, f) => { const c = onGround(-8, -96);
    return { light: "morn", lake: { lv: -60, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 1, focus: add(c, 0, 1.5, 0),
      cam: orbit(s, f, add(c, 0, 1.4, 0), [-14, 10], [9.2, 8.4], [0.4, 0.2], 44, [0.05, -0.04]),
      people: [P("pusher", onGround(-9.4, -95.6), "shock", 1), P("local1", onGround(-7.8, -96.4), "shock", 0), P("hand1", onGround(-6.4, -95.8), "shock", -1)], subjects: [["the crew", add(c, 0, 1.5, 0), 0.6]] }; },
  // not one person died: up top by the headframe, the miners out in the daylight
  nobody: (s, f) => { const c = Lk(HEADFRAME.x + 1, PADY, HEADFRAME.z - 9);
    return { light: "morn", lake: { lv: -60, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 1, focus: add(c, 0, 1.5, 0),
      cam: move({ pos: add(c, -3, 2.4, -10.5), look: add(c, 0, 1.5, 0), fov: 46, roll: 0.05 }, { pos: add(c, -2.4, 2.1, -9.4), look: add(c, 0, 1.5, 0), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("m1", add(c, -1.6, 0, 0.4), "relief", 1), P("m2", add(c, 0, 0, -0.2), "relief_open", 0, { wave: 0.6 + 0.4 * Math.sin(t(f) * 8) }), P("m3", add(c, 1.6, 0, 0.5), "relief", -1)], subjects: [["the miners", add(c, 0, 1.5, 0), 0.5]] }; },
  // every miner got out: wider, the whole crew round the headframe, the foreman counting
  out: (s, f) => { const c = Lk(HEADFRAME.x + 3, PADY, HEADFRAME.z - 8);
    return { light: "morn", lake: { lv: -60, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 1, focus: add(c, 0, 1.6, 0),
      cam: orbit(s, f, add(c, 0.6, 1.6, 0), [-26, -16], [15.5, 14.5], [2.6, 3], 50, [0.04, -0.04]),
      people: [...MINERS.map((m, i) => P(m, add(c, -5 + (i % 4) * 2.6, 0, -1 + Math.floor(i / 4) * 2.2), i % 2 ? "relief" : "smile", 0)), P("foreman", add(c, 6.5, 0, -1.6), "relief_open", 1, { wave: 1 })],
      subjects: [["the miners", add(c, 0.6, 1.6, 0), 4]] }; },
  // but the lake that came back was salt water: today, calm, a brick chimney standing in it
  today: (s, f) => ({ light: "today", today: true, lake: { lv: 0, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 0, focus: Lk(CHIMNEY.x, 5, CHIMNEY.z),
    cam: orbit(s, f, Lk(CHIMNEY.x, 4, CHIMNEY.z), [-40, -20], [44, 38], [6, 3], 46, [0.04, -0.04]), subjects: [["the chimney", Lk(CHIMNEY.x, 6, CHIMNEY.z), 1]] }),
  // ...and 200 feet deep: down to the water's surface by the chimney
  deep200: (s, f) => ({ light: "today", today: true, lake: { lv: 0, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 0, focus: Lk(HX, 0, HZ),
    cam: move({ pos: Lk(HX - 30, 60, HZ - 90), look: Lk(HX, 0, HZ), fov: 50, roll: 0.05 }, { pos: Lk(HX - 18, 3, HZ - 60), look: Lk(HX, -2, HZ), fov: 56, roll: -0.05 }, f, s.a, s.b, expo, 0),
    subjects: [["the water over the hole", Lk(HX, 0, HZ), 4]] }),
  // officially, nobody ever proved whose fault it was: Texaco's man and the salt company's man, pointing at each other
  blame: (s, f) => { const tt = t(f - s.a), c = onGround(12, -96), a = add(c, 1.0, 0, 0), b = add(c, -1.0, 0, 0.2);
    return { light: "today", today: true, lake: { lv: 0, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 1, focus: add(c, 0, 1.5, 0),
      cam: orbit(s, f, add(c, 0, 1.4, 0), [-18, 6], [7.8, 7.2], [0.2, 0.1], 42, [0.05, -0.04]),
      people: [P("oil", a, tt % 1.2 < 0.6 ? "stern" : "pained", -1, { hw: [add(a, -0.75, 1.32, -0.2)] }), P("salt", b, "stern", 1, { hw: [add(b, 0.75, 1.32, -0.2)] })], subjects: [["the two companies", add(c, 0, 1.5, 0), 0.4]] }; },
  // Texaco and its driller paid the salt company $32 million anyway: Texaco's man signs, the salt man takes the paper
  paid: (s, f) => { const u = U(s, f), c = onGround(12, -96), a = add(c, 0.75, 0, 0), b = add(c, -0.75, 0, 0.2), paper: V3 = add(c, 0.4 - 0.8 * smooth((u - 0.5) * 2), 1.15, -0.32);
    return { light: "today", today: true, lake: { lv: 0, crater: true }, rig: null, tug: null, barges: BARGES.map(() => null), slump: 1, dof: 2, focus: add(c, 0, 1.4, 0),
      cam: kick(snap(add(c, 0, 1.5, -5.8), add(c, 0, 1.3, 0), f, s.a, { fov: 42, roll: 0.05 }, 1.5, 5), f, W(13, "32"), 1.0),
      people: [P("oil", a, "pained", -1, { hw: [add(paper, 0.18, 0, 0)] }), P("salt", b, u > 0.5 ? "grin" : "smile", 1, { hw: [add(paper, -0.18, 0, 0)] })], cards: [{ kind: "paper", p: paper, spin: 0.1, s: 1.4 }],
      subjects: [["the paper", paper, 0.1]] }; },
  // ...anyway: back to the rig at dawn, as the film began (loop)
  end: (s, f) => { const h0 = hookCam(0);
    return { ...hookState(t(f - TOTAL)), focus: HOOK_LOOK, dof: 0,
      cam: move({ pos: L3(HOOK_POS, HOOK_LOOK, -0.12), look: HOOK_LOOK, fov: 60, roll: -0.02 }, h0, f, s.a, s.b - 2, smooth, 0), subjects: [["the rig", Rg(0, 20, 0), 3]] } as St3; },
};
void craterY; void RC;

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["calm", "mine", "jam", "off", "bit", "coming", "whirl", "gone", "canal", "pop", "crazy", "today", "blame"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "1980", kind: "pill", text: "NOV. 20, 1980", sub: "Lake Peigneur, Louisiana", f0: W(1, "lake"), f1: B("calm"), y: 12, size: 80 },
  { key: "10ft", kind: "call", text: "10 FEET DEEP", f0: W(1, "10"), f1: B("ten"), y: 14, fg: "#ffd166", size: 130 },
  { key: "fisher", kind: "pill", text: "LEONCE VIATOR JR.", sub: "and his nephew", f0: S0("fisher") + 4, f1: B("fisher"), y: 12, size: 64 },
  { key: "texaco", kind: "pill", text: "A TEXACO RIG", sub: "drilling for oil", f0: S0("drilling") + 3, f1: B("drilling"), y: 12, size: 80 },
  { key: "mine", kind: "pill", text: "A SALT MINE", sub: "1,500 feet down", f0: W(2, "salt"), f1: B("mine"), y: 12, size: 90 },
  { key: "50", kind: "call", text: "ABOUT 50 MEN", f0: W(2, "50"), f1: B("fifty"), y: 14, fg: "#ffd166", size: 120 },
  { key: "jam", kind: "stamp", text: "STUCK!", f0: W(3, "jammed"), f1: B("jam"), y: 14, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 150 },
  { key: "pop", kind: "call", text: "POP! POP!", f0: W(3, "pops"), f1: B("pops"), y: 14, fg: "#ffffff", size: 140, rot: 5 },
  { key: "10b", kind: "stamp", text: "10 FEET DEEP?!", f0: W(4, "10"), f1: B("deep"), y: 13, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 96 },
  { key: "1el", kind: "call", text: "1 ELEVATOR", f0: W(6, "1"), f1: B("cage"), y: 14, fg: "#ffd166", size: 130 },
  { key: "8", kind: "stamp", text: "8 MEN AT A TIME", f0: W(6, "8"), f1: B("eight"), y: 13, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 90 },
  { key: "11", kind: "call", text: "11 BARGES", f0: W(7, "11"), f1: B("barges"), y: 14, fg: "#ffd166", size: 140 },
  { key: "65", kind: "stamp", text: "65 ACRES", f0: W(7, "65"), f1: B("acres"), y: 13, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 130 },
  { key: "3h", kind: "call", text: "3 HOURS", f0: W(8, "3"), f1: B("gone"), y: 14, fg: "#ffd166", size: 150 },
  { key: "gulf", kind: "pill", text: "THE DELCAMBRE CANAL", sub: "running backwards", f0: W(9, "canal"), f1: B("canal"), y: 12, size: 64 },
  { key: "fall", kind: "call", text: "~150 FT WATERFALL", f0: W(9, "waterfall"), f1: B("falls"), y: 14, fg: "#ffffff", size: 96 },
  { key: "9", kind: "call", text: "9 BARGES", f0: W(10, "9"), f1: B("pop"), y: 14, fg: "#ffd166", size: 140 },
  { key: "0", kind: "stamp", text: "0 PEOPLE DIED", f0: W(11, "died"), f1: B("nobody"), y: 13, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 100 },
  { key: "200", kind: "call", text: "200 FEET DEEP", f0: W(12, "200"), f1: B("deep200"), y: 14, fg: "#ffd166", size: 130 },
  { key: "fault", kind: "call", text: "WHOSE FAULT?", f0: W(13, "fault"), f1: B("blame"), y: 14, fg: "#ffffff", size: 130, rot: -4 },
  { key: "32m", kind: "stamp", text: "$32 MILLION", f0: W(13, "32"), f1: B("paid"), y: 13, rot: 4, bg: "#2f9a57", fg: "#ffffff", size: 120 },
] as Item[]).filter((i) => i.f1 > i.f0);

/** the house kit, for the long-form (peigneurlong/story3d.ts) */
export { clamp01, smooth, expo, L3, move, orb, orbit, snap, kick, t as secs, U, P, add, Rg, Lk, Mn, gy, onGround, brake, hookState, hookCam, home, sucked, onTug, onSkiff, splash, mistAt, inCage, TUGQ, SKIFF, DRILLER, FL, PADY, MINERS };
export { HOOK_POS, HOOK_LOOK };
