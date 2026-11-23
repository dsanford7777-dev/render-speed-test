// The Frank Hayes Short: every shot's camera, cast, horses and props, frame by frame (house moving camera).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; cameras
// sit on the -z side looking toward +z (world +x is screen LEFT). On the course the horses run toward -x (screen right).
// Nobody is shown hurt: Frank slides off onto the turf; after that he is seen lying still, at a distance, people round him.
import { Expr } from "../bridge/toon";
import { V3, FPS, Tk, Sb, Wr, Gv, LANE, FENCES, LAST, POST, JUDGES, FALL, AISLE, STALL_Z, SCALE, GRAVE, HILL, TURF, DIRT } from "./place";
import { SEG_TIMES, TOTAL, wordAt } from "./timeline";
import type { Gait } from "./horse";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["never", W(0, "never") - 3],
  ["barn", A(1)], ["frank", W(1, "frank") - 2], ["trained", W(1, "trained") - 2], ["stalls", W(1, "cleaned") - 2], ["dream", W(1, "dreamed") - 2],
  ["boss", A(2)], ["belmont", W(2, "steeplechase") - 2], ["fences", W(2, "2") - 2], ["longshot", W(2, "and") - 2],
  ["problem", A(3)], ["carry", W(3, "130") - 2], ["heavy", W(3, "frank") - 2],
  ["starve", A(4)], ["ran", W(4, "ran") - 2], ["water", W(4, "went") - 2], ["made", W(4, "and") - 2],
  ["start", A(5)], ["lead", W(5, "and") - 2],
  ["jump", A(6)], ["sway", W(6, "people") - 2],
  ["finish", A(7)], ["firstwin", W(7, "his") - 2],
  ["judges", A(8)], ["slid", W(8, "frank") - 2],
  ["doctor", A(9)], ["dead", W(9, "frank") - 2], ["heart", W(9, "his") - 2],
  ["strange", A(10)], ["when", W(10, "nobody") - 2], ["before", W(10, "before") - 2], ["after", W(10, "or") - 2],
  ["counted", A(11)],
  ["grave", A(12)], ["silks", W(12, "racing") - 2], ["end", Math.round((SEG_TIMES[12][1] + 0.35) * FPS)],
];
/** the Short runs on past the voice: the last shot goes back to the race (the hook's framing) under the subscribe card,
 *  so the card never plays over the funeral */
export const END = Math.round((SEG_TIMES[12][1] + 0.35) * FPS) + 84;
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? END : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Ride = { pose: number; mirror: boolean; tilt?: number; lying?: boolean };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number; air?: boolean; shut?: boolean; mode?: "stand" | "march" | "sit" | "fall"; tilt?: number;
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3; mode?: "march" | "stand" }; ride?: Ride };
/** a rider on a horse: pose 0 crouched .. 1 slumped; tilt sways the card sideways; slide 0..1 comes off the saddle; off = lying there */
export type Rider = { who: string; expr: Expr; pose?: number; tilt?: number; slide?: number; off?: V3 };
export type HorseSt = { k: number; p: V3; yaw: number; gait: Gait; phase: number; jump?: number; head?: number; rider?: Rider; tack?: boolean };
export type Prop = { p: V3; r?: [number, number, number] };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number };
export type St3 = {
  light: "day" | "dawn" | "eve" | "barn" | "room" | "grey"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; horses?: HorseSt[]; subjects?: [string, V3, number][]; props?: Record<string, Prop>; puffs?: Puff[]; key?: V3;
  /** the weighing-room dial (pounds) and the result board (shown or not) */
  needle?: number; board?: boolean;
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

// ---------------- horses ----------------
const STRIDE: Record<Gait, number> = { gallop: 6.8, canter: 3.6, trot: 2.9, walk: 1.7, stand: 1 };
const RIDERS = ["frankRace", "j1", "j2", "j3", "j4"];
/** a horse on the course heading toward -x (screen right) at track x; stride phase follows the distance run, so the
 *  hooves keep pace with the ground; over a fence it jumps (from 2.6 m before the fence to 2.6 m after) */
const run = (k: number, x: number, gait: Gait = "gallop", lane = k + 1, rider: Partial<Rider> | null = {}, extra: Partial<HorseSt> = {}): HorseSt => {
  let jump: number | undefined; for (const fx of FENCES) { const j = (fx + 2.6 - x) / 5.2; if (j >= 0 && j <= 1) jump = j; }
  return { k, p: Tk(x, 0, LANE(lane)), yaw: Math.PI, gait, phase: (-x / STRIDE[gait]) + k * 0.31, jump, rider: rider ? { who: RIDERS[k], expr: "stern", pose: 0, ...rider } : undefined, ...extra };
};
/** distance run after tt seconds, slowing from v0 to v1 over T seconds */
const coast = (tt: number, v0: number, v1: number, T: number) => { const u = Math.min(tt, T); return v0 * u - ((v0 - v1) * u * u) / (2 * T) + v1 * Math.max(0, tt - T); };
const V_RACE = 15.5;
const TURF_C: [number, number, number] = [0.42, 0.5, 0.26], DUST: [number, number, number] = [0.72, 0.62, 0.48];
/** clods of turf kicked up behind a galloping horse */
const kickUp = (h: HorseSt, tt: number, n = 5): Puff[] => Array.from({ length: n }, (_, i) => { const u = (tt * 2.2 + i / n) % 1;
  return { p: add(h.p, 1.4 + 2.6 * u, 0.2 + 0.7 * Math.sin(Math.PI * u), (i % 2 ? 0.3 : -0.3)), s: 0.35 + 0.5 * u, c: TURF_C, a: 0.7 * (1 - u) }; });
/** the five on the course: Sweet Kiss (0) and Gimme (1) side by side, the rest strung out behind */
const field = (x: number, lead = 0, riders: Partial<Rider>[] = [], gait: Gait = "gallop"): HorseSt[] =>
  [0, 1, 2, 3, 4].map((k) => run(k, x + (k === 0 ? -lead : k === 1 ? 0 : 3 + k * 2.6), gait, [2, 3, 1, 4, 5][k], riders[k] ?? {}));

// ---------------- where people stand ----------------
/** a point on the track / in the barn: (x, z) on the ground, or (x, y, z) */
const IN = (x: number, a: number, b?: number): V3 => (b === undefined ? Tk(x, 0, a) : Tk(x, a, b));
const AIS = (x: number, a: number, b?: number): V3 => (b === undefined ? Sb(x, 0, a) : Sb(x, a, b));
const KISS_STALL = STALL_Z(2);
/** Sweet Kiss looking out over her stall door (the -x side, screen right) */
const kissInStall = (head = 0): HorseSt => ({ k: 0, p: Sb(-3.0, 0, KISS_STALL), yaw: 0, gait: "stand", phase: 0, head });
const otherStalls = (): HorseSt[] => [{ k: 5, p: Sb(3.0, 0, STALL_Z(1)), yaw: Math.PI, gait: "stand", phase: 0, head: 0.2 }, { k: 6, p: Sb(-3.0, 0, STALL_Z(4)), yaw: 0, gait: "stand", phase: 0, head: -0.1 }, { k: 7, p: Sb(3.0, 0, STALL_Z(5)), yaw: Math.PI, gait: "stand", phase: 0, head: 0.1 }];
const SC: V3 = Wr(SCALE.x, 0.14, SCALE.z - 0.05), DIAL: V3 = Wr(SCALE.x, 2.05, SCALE.z + 0.47);
const fans = (x: number): Person3[] => [P("fan1", IN(x, DIRT.z1 + 1.2), "shock", 0, { hw: [IN(x + 0.1, DIRT.z1 + 0.6)] }), P("fan2", IN(x - 0.8, DIRT.z1 + 1.4), "shock", 1), P("fan3", IN(x + 0.9, DIRT.z1 + 1.3), "nervous", -1), P("fan4", IN(x - 1.7, DIRT.z1 + 1.6), "shock", 0), P("fan5", IN(x + 1.8, DIRT.z1 + 1.5), "nervous", 0)];

export const leadAt = (s: { a: number; b: number }, f: number, took: number): St3 => { const tt = t(f - s.a), x = 200 - V_RACE * tt, lead = -1.8 + 4.2 * smooth((f - took + 8) / 22), h = field(x, lead, [{ expr: "grin" }]), mid = L3(h[0].p, h[1].p, 0.5);
    return { light: "day", horses: h, dof: 1, focus: add(mid, 0, 1.8, 0), puffs: [...kickUp(h[0], tt), ...kickUp(h[1], tt + 0.4)],
      cam: move({ pos: add(mid, -0.3, 2.6, -15.5), look: add(mid, -0.6, 0.9, 0), fov: 44, roll: 0.02 }, { pos: add(mid, -1.2, 2.5, -15.0), look: add(mid, -1.2, 0.9, 0), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Sweet Kiss", add(h[0].p, 0, 1.5, 0), 1], ["Gimme", add(h[1].p, 0, 1.5, 0), 1]] }; };
export const swayAt = (s: { a: number; b: number }, f: number, tip: number, up: number): St3 => { const tt = t(f - s.a), x = 70 - 13.5 * tt;
    const tilt = 0.08 * Math.sin(tt * 5) + 0.42 * smooth((f - tip + 2) / 8) * (1 - smooth((f - up + 2) / 10));
    const h = [run(0, x, "gallop", 2, { pose: 0.35, tilt, expr: "neutral" }), run(1, x + 14, "gallop", 3)];
    return { light: "day", horses: h, dof: 1.2, focus: add(h[0].p, 0, 2.0, 0),
      cam: move({ pos: add(h[0].p, -9.0, 2.5, -6.8), look: add(h[0].p, -0.6, 1.35, 0), fov: 40, roll: 0.02 }, { pos: add(h[0].p, -8.2, 2.4, -6.6), look: add(h[0].p, -0.6, 1.4, 0), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank", add(h[0].p, 0.1, 2.2, 0.3), 0.4]] }; };
export const finishAt = (s: { a: number; b: number }, f: number, cross: number): St3 => { const tt = t(f - s.a), fl = cross - s.a, x = V_RACE * (fl / FPS) - V_RACE * tt + 1.2, h = field(x, 3.0, [{ pose: 0.4, expr: "neutral" }]), k0 = h[0];
    return { light: "day", horses: h, dof: 1, focus: add(k0.p, 0, 1.8, 0), puffs: kickUp(h[0], tt),
      cam: move({ pos: add(k0.p, 0.4, 1.9, -11.0), look: add(k0.p, -0.2, 1.05, 0), fov: 44, roll: -0.02 }, { pos: add(k0.p, 0.0, 1.8, -10.4), look: add(k0.p, -0.4, 1.05, 0), fov: 44, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Sweet Kiss", add(k0.p, 0, 1.5, 0), 1]] }; };
export const slidAt = (s: { a: number; b: number }, f: number, f0: number, f1: number): St3 => { const u = clamp01((f - f0) / (f1 - f0)), tt = t(f - s.a), x = FALL.x + 1.6 - 1.6 * smooth(tt / 1.8);
    const lieAt = Tk(FALL.x + 0.2, 0.22, LANE(2) - 1.0), h = run(0, x, tt < 1.6 ? "walk" : "stand", 2, u >= 1 ? { off: lieAt, expr: "neutral" } : { pose: 0.95 - 0.5 * u, slide: u, expr: "neutral" });
    const thud = f - f1;
    return { light: "day", horses: [h], dof: 1.4, focus: add(h.p, 0, 1.4, -0.6),
      puffs: thud >= 0 && thud < 18 ? [0, 1, 2, 3].map((i) => ({ p: add(lieAt, -0.6 + i * 0.4, 0.1 + 0.02 * thud, 0.1), s: 0.4 + 0.05 * thud, c: TURF_C, a: 0.5 * (1 - thud / 18) })) : [],
      cam: move({ pos: add(h.p, -0.6, 1.9, -9.6), look: add(h.p, 0.0, 1.0, -0.6), fov: 44, roll: -0.03 }, { pos: add(h.p, -0.8, 1.8, -9.0), look: add(h.p, 0.0, 0.9, -0.6), fov: 44, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Sweet Kiss", add(h.p, 0, 1.4, 0), 1]] }; };

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // This jockey won his very first race: tracking beside Sweet Kiss on the run-in, Gimme at her quarters, the post going by
  hook: (s, f) => { const tt = t(f), x = 40 - V_RACE * tt, h = field(x, 1.7), k0 = h[0];
    return { light: "day", horses: h, dof: 1, focus: add(k0.p, 0, 1.8, 0), puffs: [...kickUp(h[0], tt), ...kickUp(h[1], tt + 0.3)],
      cam: move({ pos: add(k0.p, -1.0, 2.0, -11.6), look: add(k0.p, -0.6, 1.05, 0), fov: 44, roll: 0.03 }, { pos: add(k0.p, -1.6, 1.9, -11.0), look: add(k0.p, -0.8, 1.05, 0), fov: 44, roll: -0.02 }, f, 0, s.b, smooth, 0),
      subjects: [["Sweet Kiss", add(k0.p, 0, 1.4, 0), 1.2], ["Frank", add(k0.p, 0, 2.2, 0.3), 0.6]] }; },
  // ...and never got off the horse alive: past the post she eases to a canter; Frank folds forward over her neck
  never: (s, f) => { const tt = t(f - s.a), u = U(s, f), x = -6 - coast(tt, 13, 6, 1.4), k0 = run(0, x, u < 0.4 ? "gallop" : "canter", 2, { pose: 0.3 + 0.7 * smooth(u * 1.6), expr: "neutral" });
    return { light: "day", horses: [k0, run(1, x + 9 - 2 * tt, "canter", 3)], dof: 2, focus: add(k0.p, 0.3, 2.0, 0),
      cam: move({ pos: add(k0.p, -3.0, 2.3, -8.6), look: add(k0.p, -0.2, 1.35, 0), fov: 40, roll: -0.03 }, { pos: add(k0.p, -2.2, 2.2, -7.4), look: add(k0.p, -0.1, 1.4, 0), fov: 38, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank slumped", add(k0.p, 0.4, 2.0, 0.3), 0.4]] }; },

  // You see, in 1923, Frank Hayes wasn't really a jockey: the barn aisle in the morning, Frank coming down it with a fork
  barn: (s, f) => { const u = U(s, f), z = 16 - 5 * u;
    return { light: "barn", horses: [kissInStall(0.1), ...otherStalls()], dof: 1, focus: AIS(0.2, 1.6, z),
      people: [P("frank", AIS(0.3, z), "neutral", 0, { march: (z * 1.25) % 1, hw: [AIS(0.75, 1.05, z - 0.1)] })], props: { fork: { p: AIS(0.78, 1.05, z - 0.12), r: [0, 0, 0.12] } },
      cam: move({ pos: AIS(-0.6, 1.7, z - 9.5), look: AIS(0.2, 1.4, z), fov: 50, roll: 0.03 }, { pos: AIS(-0.4, 1.6, z - 8.2), look: AIS(0.2, 1.4, z), fov: 48, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank", AIS(0.3, 1.5, z), 0.4]] }; },
  // Frank Hayes: closer, he stops and leans on the fork by Sweet Kiss's stall
  frank: (s, f) => { const fp = AIS(-0.6, KISS_STALL - 1.3);
    return { light: "barn", horses: [kissInStall(0.25), ...otherStalls()], dof: 2, focus: add(fp, 0, 1.6, 0),
      people: [P("frank", fp, "smile", -1, { hw: [add(fp, 0.42, 1.0, -0.1)] })], props: { fork: { p: add(fp, 0.45, 1.0, -0.12), r: [0, 0, 0.05] } },
      cam: orbit(s, f, add(fp, -0.4, 1.4, 0.3), [12, 24], [4.4, 3.9], [0.2, 0.1], 42, [0.03, -0.02]), subjects: [["Frank", add(fp, 0, 1.6, 0), 0.3], ["Sweet Kiss's head", Sb(-1.5, 1.9, KISS_STALL), 0.4]] }; },
  // He trained horses: Frank leads a horse down the aisle by its halter, walking with it
  trained: (s, f) => { const tt = t(f - s.a), z = 24 - 1.25 * tt, h: HorseSt = { k: 5, p: AIS(-0.45, z), yaw: Math.PI / 2, gait: "walk", phase: (24 - z) / 1.7, head: 0.1 };
    return { light: "barn", horses: [h, kissInStall(0), { k: 6, p: Sb(-3.0, 0, STALL_Z(4)), yaw: 0, gait: "stand", phase: 0 }], dof: 1.5, focus: AIS(0.3, 1.6, z - 1.2),
      people: [P("frank", AIS(0.5, z - 1.3), "smile", 1, { march: ((24 - z) / 1.6) % 1, hw: [AIS(0.05, 1.5, z - 1.4)] })],
      cam: move({ pos: AIS(0.9, 1.5, z - 7.6), look: AIS(-0.1, 1.5, z - 0.6), fov: 46, roll: -0.03 }, { pos: AIS(1.0, 1.6, z - 6.9), look: AIS(-0.1, 1.5, z - 0.6), fov: 46, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the horse's head", AIS(-0.45, 2.0, z - 1.55), 0.6], ["Frank", AIS(0.5, 1.6, z - 1.3), 0.3]] }; },
  // cleaned out stalls: in an empty stall, forking dirty straw into the barrow, a horse looking in next door
  stalls: (s, f) => { const tt = t(f - s.a), z = STALL_Z(3) - 0.6, fp = AIS(0.9, z), sw = 0.5 + 0.5 * Math.sin(tt * 4.2), fork: V3 = add(fp, -0.45 - 0.25 * sw, 0.75 + 0.35 * sw, -0.2);
    return { light: "barn", horses: otherStalls(), dof: 1.5, focus: add(fp, 0, 1.3, 0),
      people: [P("frank", fp, "neutral", -1, { hw: [fork, add(fork, 0.25, 0.3, 0)] })], props: { fork: { p: fork, r: [0, 0, 0.5 - 0.5 * sw] }, barrow: { p: AIS(-0.5, z - 0.2), r: [0, 0.3, 0] } },
      cam: move({ pos: AIS(0.2, 1.5, z - 4.6), look: AIS(0.3, 1.0, z), fov: 46, roll: 0.04 }, { pos: AIS(0.3, 1.45, z - 4.0), look: AIS(0.3, 1.0, z), fov: 46, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank forking straw", add(fp, 0, 1.4, 0), 0.4], ["the barrow", AIS(-0.5, 0.95, z - 0.2), 0.5]] }; },
  // and dreamed of riding one in a real race: an evening at the rail, horses galloping past him on the turf
  dream: (s, f) => { const tt = t(f - s.a), fp = IN(4, TURF.z0 - 1.2), x = 22 - 9 * tt, h = [run(2, x, "gallop", 2), run(3, x + 4, "gallop", 3)];
    return { light: "eve", horses: h, dof: 1.2, focus: add(fp, 0, 1.6, 0),
      people: [P("frank", fp, "smile", 1, { hw: [add(fp, -0.3, 1.1, 0.6), add(fp, 0.3, 1.1, 0.6)] })],
      cam: move({ pos: add(fp, -2.4, 1.5, -5.6), look: add(fp, 1.4, 1.5, 6), fov: 46, roll: 0.03 }, { pos: add(fp, -2.0, 1.55, -5.0), look: add(fp, 1.0, 1.5, 6), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank at the rail", add(fp, 0, 1.6, 0), 0.3]] }; },
  // Then his boss's mare, Sweet Kiss: Miss Frayling at the stall, Frank beside her, the mare's head over the door
  boss: (s, f) => { const bp = AIS(-0.7, KISS_STALL - 0.9), fp = AIS(0.7, KISS_STALL - 1.3);
    return { light: "barn", horses: [kissInStall(0.15), ...otherStalls()], dof: 1.5, focus: Sb(-0.6, 1.7, KISS_STALL - 0.6),
      people: [P("boss", bp, "smile", -1, { hw: [Sb(-1.3, 1.75, KISS_STALL - 0.2)] }), P("frank", fp, "grin", -1)],
      cam: move({ pos: Sb(0.5, 1.7, KISS_STALL - 7.6), look: Sb(-0.1, 1.3, KISS_STALL - 0.6), fov: 46, roll: -0.03 }, { pos: Sb(0.4, 1.7, KISS_STALL - 7.0), look: Sb(-0.1, 1.35, KISS_STALL - 0.6), fov: 46, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Sweet Kiss", Sb(-1.6, 1.85, KISS_STALL), 0.4], ["Miss Frayling", add(bp, 0, 1.5, 0), 0.3], ["Frank", add(fp, 0, 1.5, 0), 0.3]] }; },
  // ...a steeplechase at Belmont Park, in New York: race day, the grandstand full, the course and its fences
  belmont: (s, f) => { const tt = t(f - s.a), x = 176 - V_RACE * tt, h = field(x, -1.5);
    return { light: "day", horses: h, dof: 0, focus: IN(120, 2, -8), board: false, puffs: kickUp(h[0], tt),
      cam: move({ pos: IN(108, 5.5, -46), look: IN(x - 4, 1.0, -6), fov: 52, roll: 0.03 }, { pos: IN(106, 5.0, -43), look: IN(x - 6, 1.0, -6), fov: 50, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the field", add(h[1].p, 0, 1.5, 0), 2]] }; },
  // 2 miles, with fences to jump: low at a brush fence as a horse goes over it (not Sweet Kiss)
  fences: (s, f) => { const tt = t(f - s.a), fx = FENCES[1], x = fx + 9 - 9.5 * tt, h = [run(3, x, "gallop", 2), run(4, x + 7, "gallop", 3)];
    return { light: "day", horses: h, dof: 1.2, focus: IN(fx, 1.8, LANE(2)), puffs: kickUp(h[0], tt),
      cam: move({ pos: IN(x - 0.2, 2.3, LANE(2) - 11.5), look: IN(x - 0.6, 1.3, LANE(2)), fov: 46, roll: -0.03 }, { pos: IN(x - 0.4, 2.2, LANE(2) - 11.0), look: IN(x - 0.8, 1.3, LANE(2)), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the horse", add(h[0].p, 0, 1.5, 0), 1]] }; },
  // And she was a long shot: Sweet Kiss alone in her stall, looking out (a slow push in)
  longshot: (s, f) => ({ light: "barn", horses: [kissInStall(0.3 * Math.sin(t(f - s.a) * 1.2)), ...otherStalls()], dof: 2, focus: Sb(-1.4, 1.9, KISS_STALL),
    cam: move({ pos: Sb(1.2, 1.8, KISS_STALL - 4.4), look: Sb(-1.4, 1.8, KISS_STALL), fov: 42, roll: 0.03 }, { pos: Sb(0.8, 1.85, KISS_STALL - 3.6), look: Sb(-1.4, 1.8, KISS_STALL), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0),
    subjects: [["Sweet Kiss", Sb(-1.5, 1.9, KISS_STALL), 0.3]] }),

  // One problem: the weighing room, Frank stepping up onto the scale, the clerk at his ledger
  problem: (s, f) => { const u = U(s, f);
    return { light: "room", needle: 141 * smooth((u - 0.4) * 3), dof: 1, focus: add(SC, 0, 1.4, 0),
      people: [P("frank", add(SC, 0, 0, 0.0), "neutral", 0), P("clerk", Wr(-1.45, 0, 3.0), "stern", 1, { hw: [Wr(-1.55, 0.84, 2.6)] })],
      cam: move({ pos: Wr(-0.2, 1.7, -3.6), look: Wr(-0.2, 1.4, 2.4), fov: 48, roll: 0.03 }, { pos: Wr(0.0, 1.6, -3.0), look: Wr(-0.2, 1.4, 2.4), fov: 48, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank on the scale", add(SC, 0, 1.4, 0), 0.4], ["the dial", DIAL, 0.2]] }; },
  // Sweet Kiss had to carry 130 pounds, rider included: on the dial, the red mark at 130
  carry: (s, f) => ({ light: "room", needle: 141, dof: 2, focus: DIAL, closeup: true,
    cam: move({ pos: add(DIAL, 0.25, 0.05, -1.6), look: add(DIAL, 0.05, 0.02, 0), fov: 40, roll: 0.04 }, { pos: add(DIAL, 0.15, 0.02, -1.25), look: add(DIAL, 0.05, 0.02, 0), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0),
    subjects: [["the 130 mark", add(DIAL, -0.18, 0.08, 0), 0.05]] }),
  // Frank was more than 10 pounds too heavy: the needle past the mark; the clerk shakes his head
  heavy: (s, f) => { const tt = t(f - s.a);
    return { light: "room", needle: 141 + 0.6 * Math.sin(tt * 5) * Math.exp(-tt), dof: 1, focus: add(SC, 0, 1.5, 0),
      people: [P("frank", SC, "nervous", 1), P("clerk", Wr(-1.0, 0, 1.4), "stern", 1, { headTilt: 0.12 * Math.sin(tt * 7) })],
      cam: orbit(s, f, add(SC, -0.4, 1.15, 0.3), [16, 4], [4.2, 3.8], [0.6, 0.5], 46, [-0.03, 0.02]),
      subjects: [["Frank", add(SC, 0, 1.55, 0), 0.3], ["the dial", DIAL, 0.2]] }; },

  // So he starved himself: on a hay bale in the barn, pushing his plate away
  starve: (s, f) => { const u = U(s, f), fp = Sb(-1.2, 0.5, 27.6), pl: V3 = Sb(-0.4 + 0.3 * smooth(u * 2), 0.51, 27.95);
    return { light: "barn", horses: otherStalls(), dof: 2, focus: add(fp, 0, 0.9, 0),
      people: [P("frank", fp, "stern", 1, { mode: "sit", hw: [add(pl, -0.12, 0.04, 0)] })], props: { plate: { p: pl } },
      cam: move({ pos: Sb(-0.95, 1.15, 23.8), look: Sb(-0.8, 0.95, 27.9), fov: 46, roll: 0.03 }, { pos: Sb(-0.95, 1.1, 24.2), look: Sb(-0.8, 0.95, 27.9), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank", add(fp, 0, 1.0, 0), 0.3], ["the plate", add(pl, 0, 0.05, 0), 0.05]] }; },
  // He ran for hours: dawn on the dirt track, Frank jogging along the rail in a heavy sweater
  ran: (s, f) => { const tt = t(f - s.a), x = 30 - 3.4 * tt, fp = IN(x, DIRT.z0 + 1.2);
    return { light: "dawn", dof: 1.5, focus: add(fp, 0, 1.4, 0),
      people: [P("frankJog", fp, "nervous", 0, { side: { phase: (tt * 2.6) % 1, mirror: false, stride: 1.2 } })], puffs: [0, 1, 2].map((i) => ({ p: add(fp, 0.8 + i * 0.6, 0.15, 0), s: 0.4 + 0.2 * i, c: DUST, a: 0.4 - 0.1 * i })),
      cam: move({ pos: add(fp, -0.4, 1.3, -4.4), look: add(fp, 0.2, 1.0, 0), fov: 44, roll: 0.03 }, { pos: add(fp, -0.8, 1.3, -4.0), look: add(fp, 0.1, 1.0, 0), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank jogging", add(fp, 0, 1.4, 0), 0.3]] }; },
  // He went without water: a stable hand holds out a cup; Frank shakes his head
  water: (s, f) => { const tt = t(f - s.a), fp = AIS(0.4, 6.0), hp = AIS(-0.5, 5.6), cup: V3 = add(hp, 0.42, 1.12, -0.25);
    return { light: "barn", horses: otherStalls(), dof: 2, focus: add(fp, 0, 1.5, 0),
      people: [P("frank", fp, "stern", 1, { headTilt: 0.16 * Math.sin(tt * 8) * Math.exp(-tt * 0.6), hw: [add(fp, -0.35, 1.25, -0.2)] }), P("hand", hp, "smile", -1, { hw: [cup] })], props: { cup: { p: add(cup, 0, -0.05, 0) } },
      cam: orbit(s, f, AIS(0, 1.5, 5.8), [-14, -4], [4.0, 3.5], [0.2, 0.1], 44, [0.03, -0.02]),
      subjects: [["Frank", add(fp, 0, 1.5, 0), 0.3], ["the cup", cup, 0.05]] }; },
  // And he made the weight: race day, in Sweet Kiss's silks on the scale; the needle settles on 130
  made: (s, f) => { const tt = t(f - s.a);
    return { light: "room", needle: 130 + 8 * Math.exp(-tt * 2.2) * Math.cos(tt * 6), dof: 1, focus: add(SC, 0, 1.4, 0),
      people: [P("frankRace", SC, tt > 0.9 ? "grin" : "nervous", 1), P("clerk", Wr(-1.0, 0, 1.4), tt > 0.9 ? "smile" : "neutral", 1)],
      cam: move({ pos: Wr(1.6, 1.6, -1.4), look: add(SC, -0.2, 1.6, 0.3), fov: 46, roll: -0.03 }, { pos: Wr(1.4, 1.65, -1.0), look: add(SC, -0.2, 1.6, 0.3), fov: 46, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank", add(SC, 0, 1.5, 0), 0.3], ["the dial", DIAL, 0.2]] }; },

  // The race started: the starter's flag drops and the field goes off up the course
  start: (s, f) => { const tt = t(f - s.a), drop = smooth(tt * 3), x = 458 - coast(tt, 3, 14, 1.8), sp = IN(470, 1.6, TURF.z0 - 3);
    return { light: "day", horses: field(x, 0, [], tt < 0.6 ? "canter" : "gallop"), dof: 0.8, focus: add(sp, -2, 0.4, 6),
      people: [P("starter", sp, "stern", -1, { hw: [add(sp, -0.35, 1.9 - 1.0 * drop, 0.3)] })], props: { flag: { p: add(sp, -0.35, 1.9 - 1.0 * drop, 0.3), r: [0, 0, 2.4 * drop] } },
      cam: move({ pos: IN(472.5, 1.9, -30), look: IN(459, 1.5, -10), fov: 50, roll: 0.03 }, { pos: IN(472, 1.85, -29.4), look: IN(458, 1.5, -10), fov: 50, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the field", IN(x, 1.5, LANE(2)), 2], ["the starter", add(sp, 0, 1.5, 0), 0.4]] }; },
  // ...and near the end, the long shot took the lead: tracking the pair; Sweet Kiss draws past Gimme
  lead: (s, f) => leadAt(s, f, W(5, "took")),
  // After the last jump: low at the last fence as Sweet Kiss goes over it, Frank folded over her neck
  jump: (s, f) => { const tt = t(f - s.a), x = LAST + 7 - 11 * tt, h = [run(0, x, "gallop", 2), run(1, x + 6, "gallop", 3)];
    return { light: "day", horses: h, dof: 1.2, focus: IN(LAST, 1.8, LANE(2)), puffs: kickUp(h[0], tt),
      cam: move({ pos: IN(x - 0.2, 2.1, LANE(2) - 11.0), look: IN(x - 0.6, 1.3, LANE(2)), fov: 46, roll: -0.03 }, { pos: IN(x - 0.4, 2.0, LANE(2) - 10.4), look: IN(x - 0.8, 1.3, LANE(2)), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["Sweet Kiss", add(h[0].p, 0, 1.5, 0), 1]] }; },
  // people saw...: the crowd at the outer rail, gasping and pointing
  saw: (s, f) => { const fx = 60;
    return { light: "day", dof: 1.5, focus: IN(fx, 1.6, DIRT.z1 + 1.3), people: fans(fx),
      cam: move({ pos: IN(fx + 1.2, 1.5, DIRT.z1 - 4.6), look: IN(fx, 1.6, DIRT.z1 + 1.3), fov: 46, roll: 0.03 }, { pos: IN(fx + 0.8, 1.5, DIRT.z1 - 3.9), look: IN(fx, 1.65, DIRT.z1 + 1.3), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the crowd", IN(fx, 1.6, DIRT.z1 + 1.3), 0.4]] }; },
  // ...Frank sway in the saddle. He tipped to one side... then straightened up: a three-quarter view from ahead
  sway: (s, f) => swayAt(s, f, W(6, "tipped"), W(6, "straightened")),
  // Sweet Kiss crossed the finish line first: low by the post as she goes through, Gimme behind
  finish: (s, f) => finishAt(s, f, W(7, "first")),
  // His first race. His first win: beside Frank, his head low over her neck
  firstwin: (s, f) => { const tt = t(f - s.a), x = -8 - coast(tt, 14, 9, 3), h = run(0, x, "gallop", 2, { pose: 0.5, expr: "neutral" });
    return { light: "day", horses: [h], dof: 2, focus: add(h.p, 0.3, 2.0, 0),
      cam: move({ pos: add(h.p, -1.2, 2.3, -7.0), look: add(h.p, -0.3, 1.45, 0), fov: 40, roll: 0.03 }, { pos: add(h.p, -1.8, 2.25, -6.4), look: add(h.p, -0.3, 1.5, 0), fov: 38, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank", add(h.p, 0.3, 2.1, 0.3), 0.3]] }; },
  // Then, near the judges' stand: wide, Sweet Kiss coming down to a walk by the stand, Frank slumped
  judges: (s, f) => { const tt = t(f - s.a), x = -58 - coast(tt, 7, 1.4, 3.2), g: Gait = tt < 1.2 ? "canter" : tt < 2.4 ? "trot" : "walk", h = run(0, x, g, 2, { pose: 0.9, expr: "neutral" });
    return { light: "day", horses: [h], dof: 0.6, focus: add(h.p, 0, 1.6, 0), board: false,
      people: [P("judge1", IN(JUDGES.x - 0.6, 3.6, JUDGES.z - 0.4), "nervous", 0, { low: true }), P("judge2", IN(JUDGES.x + 0.7, 3.6, JUDGES.z - 0.3), "shock", 0, { low: true })],
      cam: move({ pos: IN(-63, 3.6, -46), look: IN(-68, 2.2, -4), fov: 48, roll: 0.03 }, { pos: IN(-63.5, 3.4, -44), look: IN(-68.5, 2.2, -4), fov: 48, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Sweet Kiss", add(h.p, 0, 1.4, 0), 1], ["the judges' stand", IN(JUDGES.x, 4.6, JUDGES.z), 1]] }; },
  // Frank slid out of the saddle... and hit the ground: medium; she stops; he slides off her near side onto the turf
  slid: (s, f) => slidAt(s, f, W(8, "slid") - 1, W(8, "hit") + 2),
  // The track doctor ran over: wide, the doctor running with his bag, two attendants behind; Frank lying still, the mare by him
  doctor: (s, f) => { const tt = t(f - s.a), lie = Tk(FALL.x + 0.2, 0.22, LANE(2) - 1.0), dx = FALL.x + 4.6 - 3.0 * tt, dp = IN(Math.max(dx, FALL.x + 1.4), LANE(2) - 2.2);
    return { light: "day", horses: [run(0, FALL.x, "stand", 2, { off: lie, expr: "neutral" }, { head: -0.6 })], dof: 0.8, focus: add(lie, 2, 1, 0),
      people: [P("doctor", dp, "nervous", 0, { side: { phase: (tt * 2.8) % 1, mirror: false, stride: 1.2 } }), P("att1", IN(dx + 1.6, LANE(2) - 3.4), "nervous", 0, { side: { phase: (tt * 2.8 + 0.3) % 1, mirror: false, stride: 1.2 } }), P("att2", IN(dx + 2.6, LANE(2) - 1.2), "nervous", 0, { side: { phase: (tt * 2.8 + 0.6) % 1, mirror: false, stride: 1.2 } })],
      props: { bag: { p: add(dp, -0.3, 0.6, -0.2) } },
      cam: move({ pos: IN(FALL.x + 3.5, 2.6, LANE(2) - 15), look: IN(FALL.x + 2.2, 0.9, LANE(2) - 1.5), fov: 46, roll: 0.03 }, { pos: IN(FALL.x + 3.0, 2.5, LANE(2) - 14), look: IN(FALL.x + 1.8, 0.9, LANE(2) - 1.5), fov: 46, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the doctor", add(dp, 0, 1.4, 0), 0.4], ["Sweet Kiss", Tk(FALL.x, 1.4, LANE(2)), 1]] }; },
  // Frank Hayes was dead: further off and higher, the doctor kneeling by him, the attendants with their caps off
  dead: (s, f) => { const lie = Tk(FALL.x + 0.2, 0.22, LANE(2) - 1.0);
    return { light: "day", horses: [run(0, FALL.x, "stand", 2, { off: lie, expr: "neutral" }, { head: -0.7 })], dof: 0.6, focus: add(lie, 0, 0.8, 0),
      people: [P("doctor", IN(FALL.x - 0.9, LANE(2) - 1.7), "nervous", -1, { mode: "sit" }), P("att1", IN(FALL.x - 2.2, LANE(2) - 2.6), "nervous", 1), P("att2", IN(FALL.x + 1.8, LANE(2) - 2.6), "nervous", -1)], props: { bag: { p: IN(FALL.x - 1.5, 0, LANE(2) - 2.0) } },
      cam: move({ pos: IN(FALL.x + 3, 7.5, LANE(2) - 20), look: IN(FALL.x - 0.5, 0.8, LANE(2) - 1.4), fov: 40, roll: 0.02 }, { pos: IN(FALL.x + 2, 6.8, LANE(2) - 18.5), look: IN(FALL.x - 0.5, 0.8, LANE(2) - 1.4), fov: 40, roll: -0.01 }, f, s.a, s.b, smooth, 0),
      subjects: [["the doctor", IN(FALL.x - 0.9, 0.8, LANE(2) - 1.7), 0.3]] }; },
  // His heart had given out, and they blamed all that weight he'd lost: the empty weighing room, the scale at rest
  heart: (s, f) => ({ light: "room", needle: 0, dof: 1, focus: add(SC, 0, 1.3, 0.3),
    cam: move({ pos: Wr(-0.6, 1.5, -2.8), look: add(SC, 0, 1.4, 0.4), fov: 46, roll: 0.03 }, { pos: Wr(-0.2, 1.55, -2.0), look: add(SC, 0, 1.5, 0.4), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
    subjects: [["the scale", add(SC, 0, 1.2, 0.4), 0.3]] }),

  // And here's the strange part: the finish post on its own, a slow circle round it
  strange: (s, f) => ({ light: "day", dof: 1, focus: IN(POST.x, 3.6, POST.z),
    cam: orbit(s, f, IN(POST.x, 3.0, POST.z), [-30, -10], [12, 11], [0.6, 1.0], 44, [0.04, -0.03]), subjects: [["the finish post", IN(POST.x, 4.5, POST.z), 0.4]] }),
  // Nobody knows exactly when his heart stopped: from the infield, the finish again, slower
  when: (s, f) => { const tt = t(f - s.a), x = 10 - 7 * tt, h = run(0, x, "canter", 2, { pose: 0.45, expr: "neutral" });
    return { light: "day", horses: [h], dof: 0.8, focus: add(h.p, 0, 1.8, 0),
      cam: move({ pos: IN(POST.x + 1.5, 2.3, -27), look: IN(x * 0.75, 1.5, LANE(2)), fov: 40, roll: 0.03 }, { pos: IN(POST.x + 1.0, 2.2, -25.5), look: IN(x * 0.75, 1.5, LANE(2)), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Sweet Kiss", add(h.p, 0, 1.5, 0), 1]] }; },
  // Before the finish line...: she comes toward the post, still short of it
  before: (s, f) => { const tt = t(f - s.a), x = 16 - 10 * tt, h = run(0, x, "gallop", 2, { pose: 0.4, expr: "neutral" });
    return { light: "day", horses: [h], dof: 1, focus: add(h.p, 0, 1.9, 0),
      cam: move({ pos: add(h.p, -1.4, 2.0, -13), look: add(h.p, -1.4, 1.2, 0), fov: 44, roll: -0.03 }, { pos: add(h.p, -1.8, 2.0, -12.4), look: add(h.p, -1.8, 1.2, 0), fov: 44, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank", add(h.p, 0.1, 2.1, 0.3), 0.4]] }; },
  // ...or after it: the same, past the post, the post going away behind
  after: (s, f) => { const tt = t(f - s.a), x = -1 - 10 * tt, h = run(0, x, "gallop", 2, { pose: 0.6, expr: "neutral" });
    return { light: "day", horses: [h], dof: 1, focus: add(h.p, 0, 1.9, 0),
      cam: move({ pos: add(h.p, 1.4, 2.0, -13), look: add(h.p, 1.4, 1.2, 0), fov: 44, roll: 0.03 }, { pos: add(h.p, 1.8, 2.0, -12.4), look: add(h.p, 1.8, 1.2, 0), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["Frank", add(h.p, 0.1, 2.1, 0.3), 0.4]] }; },

  // But the win still counted: the result board by the judges' stand, the judges above it
  counted: (s, f) => { const bx = JUDGES.x - 8;
    return { light: "day", board: true, dof: 0.6, focus: IN(bx, 4.1, JUDGES.z + 0.5),
      people: [P("judge1", IN(JUDGES.x - 0.6, 3.6, JUDGES.z - 0.4), "stern", -1, { low: true }), P("judge2", IN(JUDGES.x + 0.7, 3.6, JUDGES.z - 0.3), "neutral", -1, { low: true })],
      cam: move({ pos: IN(bx + 1.2, 3.4, -16), look: IN(bx + 0.6, 3.4, JUDGES.z), fov: 44, roll: 0.03 }, { pos: IN(bx + 1.0, 3.5, -14.5), look: IN(bx + 0.5, 3.5, JUDGES.z), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the result board", IN(bx, 4.15, JUDGES.z + 0.5), 0.5]] }; },
  // 3 days later, they buried him: Holy Cross Cemetery, the mourners round the grave
  grave: (s, f) => { const gy = HILL(GRAVE.x, GRAVE.z), at = (x: number, z: number): V3 => Gv(GRAVE.x + x, HILL(GRAVE.x + x, GRAVE.z + z), GRAVE.z + z);
    return { light: "grey", dof: 1, focus: Gv(GRAVE.x, gy + 1, GRAVE.z),
      people: [P("mother", at(-1.6, -0.6), "nervous", 1), P("mourn1", at(-2.2, 0.4), "nervous", 1), P("mourn2", at(1.6, -0.4), "nervous", -1), P("mourn3", at(2.2, 0.7), "nervous", -1), P("boss", at(0.9, -1.6), "nervous", 0)],
      cam: move({ pos: Gv(GRAVE.x - 3, gy + 2.6, GRAVE.z - 11), look: Gv(GRAVE.x, gy + 1.0, GRAVE.z + 0.6), fov: 46, roll: 0.03 }, { pos: Gv(GRAVE.x - 2.4, gy + 2.3, GRAVE.z - 9.6), look: Gv(GRAVE.x, gy + 1.0, GRAVE.z + 0.6), fov: 46, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the grave", Gv(GRAVE.x, gy + 0.5, GRAVE.z + 1), 0.6]] }; },
  // ...in the racing silks he won in: close on the stone, the wreath in blue and yellow, his silk cap on the mound
  silks: (s, f) => { const gy = HILL(GRAVE.x, GRAVE.z), cap = Gv(GRAVE.x - 0.1, gy + 0.33, GRAVE.z - 0.2);
    return { light: "grey", dof: 2, focus: Gv(GRAVE.x, gy + 0.6, GRAVE.z + 0.6), closeup: true, props: { cap: { p: cap, r: [0, 2.2, 0.08] } },
      cam: move({ pos: Gv(GRAVE.x - 1.2, gy + 1.5, GRAVE.z - 3.2), look: Gv(GRAVE.x, gy + 0.6, GRAVE.z + 0.6), fov: 42, roll: 0.03 }, { pos: Gv(GRAVE.x - 1.0, gy + 1.45, GRAVE.z - 2.7), look: Gv(GRAVE.x, gy + 0.6, GRAVE.z + 0.6), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the wreath", Gv(GRAVE.x, gy + 0.88, GRAVE.z + 1.3), 0.1], ["the silk cap", add(cap, 0, 0.07, 0), 0.05]] }; },
  // (after the words) back to the race: the hook's own framing, so the loop lands; the subscribe card plays over it
  end: (s, f) => SPECS.hook({ ...s, a: 0, b: 79 }, f - END + 1),
};
void AISLE; void TOTAL; void expo; void kick; void IN;

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0032 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["end", "barn", "boss", "problem", "start", "jump", "finish", "judges", "doctor", "strange", "counted", "grave"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
// every callout sits at 19-20 % from the top, below the YouTube Shorts buttons
export const ITEMS = (): Item[] => ([
  { key: "1923", kind: "pill", text: "JUNE 1923", sub: "Belmont Park, New York", f0: W(1, "1923"), f1: B("barn"), y: 19, size: 84 },
  { key: "frank", kind: "pill", text: "FRANK HAYES", sub: "stable hand", f0: W(1, "frank"), f1: B("frank"), y: 19, size: 80 },
  { key: "kiss", kind: "pill", text: "SWEET KISS", sub: "his boss's mare", f0: W(2, "sweet"), f1: B("boss"), y: 19, size: 84 },
  { key: "2mi", kind: "call", text: "2 MILES", f0: W(2, "2"), f1: B("fences"), y: 20, fg: "#ffd166", size: 150 },
  { key: "long", kind: "stamp", text: "LONG SHOT", f0: W(2, "long"), f1: B("longshot"), y: 20, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 120 },
  { key: "130", kind: "call", text: "130 POUNDS", f0: W(3, "130"), f1: B("carry"), y: 20, fg: "#ffd166", size: 130 },
  { key: "10", kind: "stamp", text: "10+ LB TOO HEAVY", f0: W(3, "10"), f1: B("heavy"), y: 20, rot: 4, bg: "#e0332e", fg: "#ffffff", size: 90 },
  { key: "hours", kind: "call", text: "FOR HOURS", f0: W(4, "hours"), f1: B("ran"), y: 20, fg: "#ffffff", size: 130 },
  { key: "made", kind: "stamp", text: "MADE WEIGHT", f0: W(4, "made"), f1: B("made"), y: 20, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 110 },
  { key: "lead", kind: "call", text: "THE LONG SHOT LEADS", f0: W(5, "took"), f1: B("lead"), y: 20, fg: "#ffd166", size: 96 },
  { key: "1st", kind: "stamp", text: "1ST!", f0: W(7, "first"), f1: B("finish"), y: 20, rot: -5, bg: "#2f9a57", fg: "#ffffff", size: 160 },
  { key: "race1", kind: "call", text: "FIRST RACE. FIRST WIN.", f0: W(7, "his") + 2, f1: B("firstwin"), y: 20, fg: "#ffffff", size: 86 },
  { key: "doc", kind: "pill", text: "THE TRACK DOCTOR", f0: W(9, "doctor"), f1: B("doctor"), y: 19, size: 70 },
  { key: "heart", kind: "call", text: "HEART FAILURE", f0: W(9, "heart"), f1: B("heart"), y: 20, fg: "#ffffff", size: 120 },
  { key: "when", kind: "call", text: "WHEN?", f0: W(10, "when"), f1: B("when"), y: 20, fg: "#ffd166", size: 160, rot: -4 },
  { key: "before", kind: "stamp", text: "BEFORE?", f0: W(10, "before"), f1: B("before"), y: 20, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 130 },
  { key: "after", kind: "stamp", text: "AFTER?", f0: W(10, "after"), f1: B("after"), y: 20, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 130 },
  { key: "count", kind: "stamp", text: "IT COUNTED", f0: W(11, "counted"), f1: B("counted"), y: 20, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 120 },
  { key: "3d", kind: "pill", text: "3 DAYS LATER", sub: "Holy Cross Cemetery, Brooklyn", f0: W(12, "3"), f1: B("grave"), y: 19, size: 80 },
] as Item[]).filter((i) => i.f1 > i.f0);

/** the house kit, for the long-form */
export { clamp01, smooth, expo, L3, move, orb, orbit, kick, t as secs, U, P, add, run, field, coast, kickUp, fans, kissInStall, otherStalls, IN, AIS, SC, DIAL, KISS_STALL, V_RACE, TURF_C, DUST };
