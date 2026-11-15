// The exploding rats Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is ever still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Rooms are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen left).
import { Expr } from "../bridge/toon";
import { V3, FPS, Wk, Sh, Bo, Sc, De, BENCH, COUNTER, FIRE, COAL, coalY, CASE, LECTERN, CRATE } from "./place";
import { SEG_TIMES, TOTAL, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0],
  ["workshop", A(1)], ["boiler", W(1, "blow") - 2],
  ["notice", A(2)],
  ["stoker", A(3)], ["toss", W(3, "throws") - 2],
  ["shop", A(4)], ["crate", W(4, "100") - 3],
  ["lab", A(5)],
  ["fill", A(6)], ["sew", W(6, "sewed") - 2], ["fuse", W(6, "fitted") - 2],
  ["plan", A(7)], ["shovel", W(7, "stoker") - 2], ["boom", W(7, "boom") - 2],
  ["caught", A(8)],
  ["seized", A(9)], ["zero", W(9, "before") - 2],
  ["working", A(10)],
  ["school", A(11)], ["search", W(11, "hunting") - 2],
  ["hundreds", A(12)],
  ["files", A(13)], ["end", W(13, "than") - 2],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; hold?: { r?: [number, number]; l?: [number, number] } };
/** a rat: lying on its side (the dead ones) or crouched; open = the slit along its back (0..1, the charge shows past 0.3) */
export type RatPose = { p: V3; yaw?: number; side?: boolean; s?: number; open?: number; stitch?: boolean; fuse?: boolean; spin?: number };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type Card = { p: V3; spin: number; s: number };
export type St3 = {
  light: "room" | "boil" | "dim"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  rats?: RatPose[]; crate?: { p: V3; yaw?: number; lid?: number } | null;
  /** the stoker's shovel: grip point g, blade point b; load = a lump of coal on it; tip = blade tipped forward */
  shovel?: { g: V3; b: V3; load?: boolean; tip?: number } | null;
  /** firebox door 0 = shut .. 1 = open; flare = the fire roaring up */
  fire?: number; flare?: number;
  needle?: { p: V3; yaw: number; tilt?: number } | null; putty?: V3[]; file?: { p: V3; yaw: number } | null; lanterns?: V3[];
  puffs?: Puff[]; cards?: Card[];
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

// ---------------- the sets as the shots use them ----------------
/** the hero rat on the workshop bench, lying on its side, back to the camera */
const HERO = Wk(0.1, BENCH.y, 1.45);
const heroRat = (o: Partial<RatPose> = {}): RatPose => ({ p: HERO, yaw: 0, side: true, s: 1.15, ...o });
/** the man in the white coat behind the bench, his hands on the rat */
const maker = (expr: Expr, hands: V3[] = [Wk(0.25, BENCH.y + 0.14, 1.5), Wk(-0.12, BENCH.y + 0.1, 1.5)], extra: Partial<Person3> = {}) => P("maker", Wk(0.15, 0, 2.35), expr, 0, { hw: hands, ...extra });
/** the rats on the bench being worked on, in a row to the maker's left */
const benchRow = (n: number, o: Partial<RatPose> = {}): RatPose[] => Array.from({ length: n }, (_, i) => ({ p: Wk(-1.0 - i * 0.55, BENCH.y, 1.45 + (i % 2) * 0.1), yaw: 0.1 * (i % 3), side: true, s: 1.0, ...o }));
/** the crate's rats: two layers, any yaw, inside crate c (crate origin at its floor centre) */
const crateRats = (c: V3, n = 12, s = 0.95): RatPose[] => Array.from({ length: n }, (_, i) => { const k = i % 6, layer = Math.floor(i / 6);
  return { p: [c[0] - 0.24 + (k % 3) * 0.24 + (layer ? 0.1 : 0), c[1] + 0.035 + layer * 0.1, c[2] - 0.12 + Math.floor(k / 3) * 0.24], yaw: (i * 1.9) % 6.28, side: i % 3 !== 0, s }; });
/** the boiler room: where the stoker stands, the rat lying on the coal */
const STOKER = Bo(-0.6, 0, -0.35);
const COAL_RAT = Bo(-1.55, coalY(-1.55, 0.45) + 0.07, 0.45);
const MOUTH = Bo(FIRE[0], FIRE[1] - 0.12, FIRE[2] - 0.3);
/** shovel from the stoker's hands down to blade point b (a point on the coal or at the fire) */
const shovelTo = (b: V3, load = false, tip = 0) => { const g: V3 = [STOKER[0] + 0.2, 1.0, STOKER[2] - 0.15]; return { g, b, load, tip }; };
const stoker = (expr: Expr, sh: { g: V3; b: V3 } | null, extra: Partial<Person3> = {}) =>
  P("stoker", STOKER, expr, 0, { hw: sh ? [sh.g, L3(sh.g, sh.b, 0.42)] : undefined, ...extra });
const fireLight = (k: number): Puff[] => k > 0.05 ? [{ p: Bo(FIRE[0], FIRE[1], FIRE[2] - 0.35), s: 1.6, c: [1.0, 0.55, 0.2], a: 0.35 * k, add: true }] : [];

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // hook: close on the rat, the charge being pressed into its back
  hook: (s, f) => { const u = U(s, f), boom = W(0, "explosives");
    let c = snap(Wk(-0.55, BENCH.y + 0.8, -0.25), Wk(0.05, BENCH.y + 0.14, 1.45), f, s.a, { fov: 40, roll: 0.07 }, 1.4, 6);
    c = kick(c, f, boom, 1.0);
    return { light: "room", dof: 3, closeup: true, focus: Wk(0.1, BENCH.y + 0.15, 1.45), cam: c,
      rats: [heroRat({ open: 0.6 + 0.4 * u }), ...benchRow(3)], putty: [Wk(0.6, BENCH.y + 0.035, 1.75)],
      people: [maker("grin", [Wk(0.1, BENCH.y + 0.22, 1.47), Wk(-0.2, BENCH.y + 0.12, 1.5)], { extra: true })],
      subjects: [["the rat", Wk(0.1, BENCH.y + 0.12, 1.45), 0.2]] }; },
  // the saboteurs' workshop: orbit round the bench, both men at work
  workshop: (s, f) => ({ light: "room", dof: 1, focus: Wk(0, 1.2, 1.6),
    cam: orbit(s, f, Wk(-0.45, 1.0, 1.6), [-16, 12], [6.0, 5.4], [1.0, 0.8], 50, [0.05, -0.04]),
    rats: [heroRat({ open: 1 }), ...benchRow(4)], putty: [Wk(0.6, BENCH.y + 0.035, 1.75)],
    people: [maker("stern"), P("officer", Wk(-1.25, 0, 2.5), "grin", 1, { hw: [Wk(-1.1, BENCH.y + 0.02, 1.85)] })] }),
  // German boilers: crane up the boiler front, the fire glowing through its door
  boiler: (s, f) => { const u = smooth(U(s, f));
    return { light: "boil", dof: 1, fire: 0.25, focus: Bo(FIRE[0], 1.4, 1.6),
      cam: move({ pos: Bo(2.6, 0.5, -2.6), look: Bo(0.6, 1.2, 1.6), fov: 54, roll: -0.07 }, { pos: Bo(1.9, 2.1, -3.4), look: Bo(0.3, 1.6, 1.6), fov: 50, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      puffs: fireLight(0.25 + 0.1 * u), people: [stoker("neutral", null, { extra: true })],
      subjects: [["the boiler", Bo(FIRE[0], FIRE[1] + 0.45, FIRE[2] - 0.25), 0.4]] }; },
  // "they noticed something": snap to the officer's face, finger up
  notice: (s, f) => ({ light: "room", dof: 4, closeup: true, focus: Wk(-1.9, 1.55, 2.5),
    cam: kick(snap(Wk(-1.55, 1.5, 0.35), Wk(-1.9, 1.52, 2.5), f, s.a, { fov: 34, roll: -0.06 }, 1.5), f, s.a + 4, 0.8),
    people: [P("officer", Wk(-1.9, 0, 2.5), "grin", -1, { hold: { r: [0.42, 1.62] } })] }),
  // a stoker finds a dead rat in his coal
  stoker: (s, f) => { const u = U(s, f), sh = shovelTo(L3(Bo(-1.25, coalY(-1.25, 0.2) + 0.05, 0.2), Bo(-1.4, coalY(-1.4, 0.4) + 0.06, 0.4), smooth(u * 1.4)));
    return { light: "boil", dof: 2, fire: 0.3, focus: COAL_RAT,
      cam: move({ pos: Bo(-1.3, 1.7, -3.8), look: Bo(-1.05, 0.75, 0.2), fov: 52, roll: 0.06 }, { pos: Bo(-1.1, 1.5, -3.3), look: Bo(-1.0, 0.8, 0.2), fov: 50, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      rats: [{ p: COAL_RAT, yaw: 0.4, side: true, s: 1.3 }], shovel: sh, puffs: fireLight(0.3),
      people: [stoker(u > 0.5 ? "stern" : "neutral", sh, { look: 1 })],
      subjects: [["the rat on the coal", COAL_RAT, 0.25]] }; },
  // ...and throws it in the fire: the shovel swings to the open door, the rat flies in
  toss: (s, f) => { const u = U(s, f), sw = smooth(clamp01(u * 1.8)), fly = clamp01((u - 0.45) / 0.3);
    const from = Bo(-1.4, coalY(-1.4, 0.4) + 0.06, 0.4), to = MOUTH, blade = L3(from, Bo(FIRE[0] - 0.4, 1.05, FIRE[2] - 0.55), sw), sh = shovelTo(blade, false, -0.4 * sw);
    const rp: V3 = fly <= 0 ? [blade[0], blade[1] + 0.03, blade[2]] : [blade[0] + (to[0] - blade[0]) * fly, blade[1] + (to[1] - blade[1]) * fly + 0.35 * Math.sin(Math.PI * fly), blade[2] + (to[2] - blade[2]) * fly];
    return { light: "boil", dof: 1, fire: 1, flare: fly >= 1 ? 0.6 : 0, focus: Bo(FIRE[0] - 0.4, 1.0, FIRE[2] - 0.4),
      cam: kick(move({ pos: Bo(0.45, 1.4, -3.9), look: Bo(-0.3, 1.05, 0.6), fov: 56, roll: -0.08 }, { pos: Bo(0.35, 1.35, -3.6), look: Bo(-0.2, 1.05, 0.7), fov: 54, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, s.a + Math.round((s.b - s.a) * 0.75), 0.8),
      rats: fly < 1 ? [{ p: rp, yaw: 0.4 + 2 * fly, side: true, s: 1.3, spin: 6 * fly }] : [], shovel: sh, puffs: fireLight(1 + (fly >= 1 ? 0.6 : 0)),
      people: [stoker("grin", sh, { look: -1 })] }; },
  // London: the officer at the supplier's counter
  shop: (s, f) => ({ light: "room", dof: 1, focus: Sh(-0.5, 1.4, 1.0),
    cam: move({ pos: Sh(0.6, 1.5, -3.9), look: Sh(-0.1, 1.3, 1.2), fov: 54, roll: 0.06 }, { pos: Sh(0.2, 1.6, -3.3), look: Sh(-0.1, 1.3, 1.2), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("officer", Sh(-0.6, 0, 0.05), "stern", -1, { hw: [Sh(-0.4, COUNTER.y + 0.02, 0.75)] }), P("keeper", Sh(0.7, 0, 2.15), "neutral", 1, { hw: [Sh(0.5, COUNTER.y + 0.02, 1.3)] })] }),
  // a hundred dead rats: straight down into the crate on the counter, turning
  crate: (s, f) => { const c = Sh(0.2, COUNTER.y + 0.06, 1.1);
    return { light: "room", dof: 1, focus: c, crate: { p: c, lid: 1 },
      cam: kick(orbit(s, f, [c[0], c[1] + 0.15, c[2]], [-20, 25], [0.55, 0.45], [1.55, 1.35], 52, [0.0, 0.25]), f, W(4, "100"), 0.6),
      rats: crateRats(c, 12), subjects: [["the crate", [c[0], c[1] + 0.2, c[2]], 0.3]] }; },
  // "they're for a laboratory experiment": the officer smiles, the shopkeeper doesn't ask
  lab: (s, f) => { const mid = W(5, "he");
    return { light: "room", dof: 4, closeup: true, focus: f < mid ? Sh(-0.6, 1.55, 0.05) : Sh(0.7, 1.55, 2.15),
      cam: f < mid ? snap(Sh(-0.25, 1.5, -1.95), Sh(-0.6, 1.52, 0.05), f, s.a, { fov: 36, roll: 0.05 }, 1.4) : snap(Sh(1.5, 1.65, 0.25), Sh(0.7, 1.55, 2.15), f, mid, { fov: 36, roll: -0.06 }, 1.4),
      crate: { p: Sh(0.2, COUNTER.y + 0.06, 1.1), lid: 1 }, rats: crateRats(Sh(0.2, COUNTER.y + 0.06, 1.1), 12),
      people: [P("officer", Sh(-0.6, 0, 0.05), "grin", -1, { hw: [Sh(-0.4, COUNTER.y + 0.02, 0.75)] }), P("keeper", Sh(0.7, 0, 2.15), f < mid ? "neutral" : "nervous", 1, { headTilt: f < mid ? 0 : 0.08, hw: [Sh(0.5, COUNTER.y + 0.02, 1.3)] })] }; },
  // the charge goes in
  fill: (s, f) => { const u = U(s, f);
    return { light: "room", dof: 3, closeup: true, focus: HERO,
      cam: move({ pos: Wk(0.95, BENCH.y + 0.85, -0.2), look: Wk(0.05, BENCH.y + 0.12, 1.45), fov: 40, roll: -0.07 }, { pos: Wk(0.7, BENCH.y + 0.75, 0.05), look: Wk(0.1, BENCH.y + 0.14, 1.45), fov: 40, roll: 0.02 }, f, s.a, s.b, smooth, 0),
      rats: [heroRat({ open: 0.5 + 0.5 * smooth(u * 1.5) }), ...benchRow(3)], putty: [Wk(0.62, BENCH.y + 0.035, 1.72), Wk(0.82, BENCH.y + 0.035, 1.78)],
      people: [maker("stern", [Wk(0.08, BENCH.y + 0.2, 1.46), Wk(0.62, BENCH.y + 0.08, 1.72)], { extra: true })],
      subjects: [["the charge", Wk(0.1, BENCH.y + 0.2, 1.4), 0.2]] }; },
  // sewn shut: the needle works along the back
  sew: (s, f) => { const u = U(s, f), nx = -0.08 + 0.18 * ((u * 3) % 1);
    return { light: "room", dof: 3, closeup: true, focus: HERO,
      cam: snap(Wk(-0.7, BENCH.y + 0.75, 0.05), Wk(0.1, BENCH.y + 0.15, 1.45), f, s.a, { fov: 40, roll: 0.08 }, 1.35),
      rats: [heroRat({ stitch: true }), ...benchRow(3)], needle: { p: Wk(0.1 + nx, BENCH.y + 0.26, 1.36), yaw: 0.3, tilt: 0.4 },
      people: [maker("stern", [Wk(0.1 + nx, BENCH.y + 0.27, 1.37), Wk(-0.15, BENCH.y + 0.12, 1.47)], { extra: true })],
      subjects: [["the stitches", Wk(0.1, BENCH.y + 0.2, 1.4), 0.2]] }; },
  // and a fuse: snap in on the brass pin at the tail end, then pull back along the row of finished rats
  fuse: (s, f) => { const u = smooth(U(s, f));
    return { light: "room", dof: 2, focus: Wk(-0.3, BENCH.y + 0.15, 1.45),
      cam: kick(move({ pos: Wk(-0.6, BENCH.y + 0.7, 0.05), look: Wk(-0.2, BENCH.y + 0.12, 1.45), fov: 40, roll: -0.05 }, { pos: Wk(-1.1, BENCH.y + 0.9, -0.2), look: Wk(-0.6, BENCH.y + 0.1, 1.5), fov: 44, roll: 0.04 }, f, s.a + 6, s.b, smooth, 0), f, s.a + 2, 0.7),
      rats: [heroRat({ stitch: true, fuse: true }), ...benchRow(4, { stitch: true, fuse: true })],
      people: [maker("grin", [Wk(-0.05, BENCH.y + 0.16, 1.45)], { extra: true })] }; },
  // the plan: a rat left on the coal pile
  plan: (s, f) => ({ light: "boil", dof: 2, fire: 0.3, focus: COAL_RAT,
    cam: snap(Bo(-2.05, 1.35, -1.1), COAL_RAT, f, s.a, { fov: 40, roll: 0.07 }, 1.5),
    rats: [{ p: COAL_RAT, yaw: 0.4, side: true, s: 1.3, stitch: true, fuse: true }], puffs: fireLight(0.3),
    subjects: [["the rat on the coal", COAL_RAT, 0.25]] }),
  // the stoker shovels it in
  shovel: (s, f) => { const u = U(s, f), sw = smooth(clamp01(u * 1.3)), blade = L3(Bo(-1.4, coalY(-1.4, 0.4) + 0.06, 0.4), Bo(FIRE[0] - 0.35, 1.0, FIRE[2] - 0.5), sw), sh = shovelTo(blade, true, -0.2 * sw);
    return { light: "boil", dof: 1, fire: 1, focus: Bo(-0.3, 1.0, 0.6),
      cam: orbit(s, f, Bo(-0.3, 1.0, 0.6), [-35, -2], [3.8, 3.5], [0.2, 0.3], 50, [-0.06, 0.04]),
      rats: [{ p: [blade[0], blade[1] + 0.04, blade[2]], yaw: 0.4, side: true, s: 1.3, stitch: true, fuse: true }], shovel: sh, puffs: fireLight(1),
      people: [stoker("neutral", sh, { look: -1 })] }; },
  // boom: the fire blows out of the door, toward us
  boom: (s, f) => { const e = t(f - s.a);
    const puffs: Puff[] = e < 0.08 ? fireLight(1) : Array.from({ length: 22 }, (_, i) => { const a = i * 2.4, k = Math.min(1, e / 0.9);
      return { p: Bo(FIRE[0] + Math.cos(a) * 0.9 * k, FIRE[1] + 0.2 + Math.sin(a * 1.3) * 0.6 * k + 0.4 * k * k, FIRE[2] - 0.3 - 2.6 * k * (0.5 + 0.5 * ((i * 7) % 5) / 5)), s: 0.6 + 1.8 * k, c: i % 3 ? [1.0, 0.62, 0.22] : [1.0, 0.9, 0.55], a: Math.max(0, 0.95 - 0.7 * k), add: i % 2 === 0 }; });
    return { light: "boil", dof: 0, fire: 1, flare: e < 0.08 ? 0 : 1, focus: Bo(FIRE[0], FIRE[1], FIRE[2]),
      cam: kick(kick(move({ pos: Bo(1.2, 1.0, -1.4), look: Bo(FIRE[0], FIRE[1] + 0.2, FIRE[2]), fov: 50, roll: 0.05 }, { pos: Bo(1.6, 1.15, -2.6), look: Bo(FIRE[0], FIRE[1] + 0.4, FIRE[2]), fov: 54, roll: -0.08 }, f, s.a + 2, s.a + 14, expo, 0), f, s.a + 2, 1.8), f, s.a + 9, 1.0),
      puffs, cards: e > 0.05 && e < 1.2 ? Array.from({ length: 14 }, (_, i) => { const a = i * 0.9, k = e / 1.2; return { p: Bo(FIRE[0] + Math.cos(a) * 1.4 * k, FIRE[1] + 0.3 + 1.0 * k - 1.6 * k * k + Math.sin(a) * 0.3, FIRE[2] - 0.3 - 2.0 * k), spin: e * 9 + i, s: 0.13 }; }) : [] }; },
  // the first shipment, caught: Germans pry the crate open
  caught: (s, f) => { const u = U(s, f), lid = smooth(clamp01((u - 0.15) / 0.5)), c = De(CRATE[0], 0, CRATE[2]);
    return { light: "dim", dof: 1, focus: De(0, 0.9, 1.3), crate: { p: c, lid },
      cam: move({ pos: De(-1.1, 1.4, -3.0), look: De(0, 0.9, 1.3), fov: 54, roll: -0.06 }, { pos: De(-0.35, 1.5, -2.9), look: De(0.0, 0.9, 1.3), fov: 54, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      rats: lid > 0.6 ? crateRats(c, 12) : [],
      people: [P("gofficer", De(0.15, 0, 1.95), lid > 0.7 ? "shock" : "stern", 0, { hw: [De(-0.1, 0.5 + 0.5 * lid, 1.3 + 0.2 * lid), De(0.35, 0.5 + 0.5 * lid, 1.3 + 0.2 * lid)] }),
        P("gs1", De(-0.95, 0, 1.9), "stern", 1), P("gs2", De(0.95, 0, 1.75), lid > 0.7 ? "shock" : "neutral", -1)],
      subjects: [["the crate", De(0, 0.56, 0.95), 0.35]] }; },
  // every rat, seized: straight down into the open crate
  seized: (s, f) => { const c = De(CRATE[0], 0, CRATE[2]);
    return { light: "dim", dof: 1, focus: c, crate: { p: c, lid: 1 },
      cam: orbit(s, f, [c[0], 0.2, c[2]], [15, -30], [0.5, 0.4], [1.7, 1.45], 52, [0.1, -0.2]),
      rats: crateRats(c, 12), subjects: [["the crate", [c[0], 0.3, c[2]], 0.3]] }; },
  // before a single one was used: the officer lifts one out by the tail and stares at it
  zero: (s, f) => { const c = De(CRATE[0], 0, CRATE[2]), u = smooth(clamp01(U(s, f) * 2));
    const hand = De(0.45, 1.0 + 0.4 * u, 1.35);
    return { light: "dim", dof: 3, focus: De(0.15, 1.45, 1.8), crate: { p: c, lid: 1 },
      cam: snap(De(-0.45, 1.35, -0.6), De(0.25, 1.35, 1.6), f, s.a, { fov: 40, roll: 0.06 }, 1.3),
      rats: [...crateRats(c, 11), { p: [hand[0], hand[1] - 0.35, hand[2]], yaw: Math.PI / 2, side: true, s: 1.1, spin: -1.4, stitch: true, fuse: true }],
      people: [P("gofficer", De(0.15, 0, 1.95), "shock", 1, { hw: [hand] })] }; },
  // that's when the trick started working: the German officer's face, close
  working: (s, f) => ({ light: "dim", dof: 4, closeup: true, focus: De(0.15, 1.55, 1.95),
    cam: kick(snap(De(-0.05, 1.55, 0.2), De(0.15, 1.55, 1.95), f, s.a, { fov: 40, roll: -0.08 }, 1.6), f, W(10, "working"), 0.8),
    crate: { p: De(CRATE[0], 0, CRATE[2]), lid: 1 },
    people: [P("gofficer", De(0.15, 0, 1.95), "nervous", -1, { headTilt: 0.07 })] }),
  // on display at the military school: the rat under glass, the lecturer pointing at it
  school: (s, f) => { const rp = Sc(CASE[0], CASE[1] + 0.02, CASE[2]);
    return { light: "room", dof: 2, focus: rp,
      cam: orbit(s, f, Sc(-0.15, 1.25, 2.1), [-25, 4], [3.4, 3.0], [0.25, 0.1], 50, [0.05, -0.05]),
      rats: [{ p: rp, yaw: 0, side: true, s: 1.1, stitch: true, fuse: true }],
      people: [P("lecturer", Sc(0.35, 0, 2.6), "stern", 1, { hold: { l: [-0.55, 1.45] } }),
        P("cad1", Sc(-2.4, 0, 2.5), "shock", -1, { extra: true }), P("cad2", Sc(-1.7, 0, 3.0), "nervous", -1, { extra: true }), P("cad3", Sc(-3.2, 0, 2.9), "shock", -1, { extra: true })],
      subjects: [["the rat in the case", rp, 0.2]] }; },
  // ...and hunting for more: soldiers with lanterns over the coal
  search: (s, f) => { const tt = t(f - s.a), l1 = Bo(-1.9 + 0.2 * Math.sin(tt * 2), 0.9, 0.0), l2 = Bo(-2.6, 1.0 + 0.1 * Math.sin(tt * 3), 0.5);
    return { light: "dim", dof: 1, fire: 0.2, focus: Bo(COAL[0], 0.5, COAL[2]), lanterns: [l1, l2],
      cam: move({ pos: Bo(-0.4, 2.4, -2.6), look: Bo(-2.1, 0.4, 0.6), fov: 50, roll: 0.07 }, { pos: Bo(-0.9, 1.8, -2.3), look: Bo(-2.1, 0.5, 0.6), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("gs3", Bo(-1.6, 0, -0.55), "stern", 1, { hw: [l1] }), P("gs4", Bo(-3.3, 0, 0.05), "nervous", 1, { hw: [l2], extra: true })],
      puffs: fireLight(0.2) }; },
  // hundreds already out there: the stoker, shovel over the coal, sweating
  hundreds: (s, f) => { const sh = shovelTo(Bo(-1.25, coalY(-1.25, 0.2) + 0.25, 0.2));
    return { light: "boil", dof: 4, closeup: true, fire: 0.3, focus: [STOKER[0], 1.5, STOKER[2]],
      cam: move({ pos: Bo(-0.2, 1.45, -2.2), look: Bo(-0.6, 1.4, -0.35), fov: 42, roll: 0.07 }, { pos: Bo(-0.3, 1.5, -1.95), look: Bo(-0.6, 1.45, -0.35), fov: 42, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      shovel: sh, puffs: fireLight(0.3), people: [stoker("nervous", sh, { look: 1, headTilt: 0.06 })] }; },
  // Britain's own files: the file on the bench, both men grinning over it
  files: (s, f) => { const fp = Wk(0.2, BENCH.y + 0.005, 1.4);
    return { light: "room", dof: 2, focus: fp, file: { p: fp, yaw: 0 },
      cam: move({ pos: Wk(0.2, BENCH.y + 1.4, 0.2), look: fp, fov: 48, roll: 0.0 }, { pos: Wk(0.1, 1.6, -2.0), look: Wk(0.05, 1.3, 2.0), fov: 56, roll: 0.05 }, f, s.a + 4, s.b, smooth, 0),
      people: [P("officer", Wk(-0.55, 0, 2.3), "grin", 1, { hw: [Wk(-0.2, BENCH.y + 0.01, 1.6)], extra: f < s.a + 30 }), P("maker", Wk(0.65, 0, 2.3), "laugh", -1, { extra: f < s.a + 30 })],
      subjects: [["the file", fp, 0.1]] }; },
  // ...than if the rats had actually been used: back to the bench, the hero rat, as the film began (loop)
  end: (s, f) => { const u = smooth(U(s, f));
    return { light: "room", dof: 3, closeup: true, focus: Wk(0.1, BENCH.y + 0.15, 1.45),
      cam: move({ pos: Wk(1.2, BENCH.y + 0.9, -0.2), look: Wk(0.0, BENCH.y + 0.3, 1.5), fov: 46, roll: 0.03 }, { pos: Wk(-0.35, BENCH.y + 0.42, 0.75), look: Wk(0.1, BENCH.y + 0.14, 1.5), fov: 44, roll: 0.07 }, f, s.a, s.b - 2, smooth, 0),
      rats: [heroRat({ open: 0.6 + 0.0 * u }), ...benchRow(3)], putty: [Wk(0.6, BENCH.y + 0.035, 1.75)], file: { p: Wk(-1.2, BENCH.y + 0.005, 1.35), yaw: 0.3 },
      people: [maker("grin", [Wk(0.1, BENCH.y + 0.22, 1.47), Wk(-0.2, BENCH.y + 0.12, 1.5)], { extra: true })] }; },
};

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * Math.min(d, 60), id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["boiler", "shop", "caught", "school", "search", "files"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "soe", kind: "pill", text: "BRITAIN'S SABOTEURS", sub: "S.O.E. · World War 2", f0: A(1) + 6, f1: B("workshop"), y: 13, size: 58 },
  { key: "boilers", kind: "pill", text: "GERMAN BOILERS", sub: "the target", f0: S0("boiler") + 4, f1: B("boiler"), y: 13, size: 62 },
  { key: "100", kind: "call", text: "100 RATS", f0: W(4, "100"), f1: B("crate"), y: 14, fg: "#ffd166", size: 150 },
  { key: "lab", kind: "pill", text: "\"FOR AN EXPERIMENT\"", sub: "the cover story", f0: W(5, "laboratory"), f1: B("lab"), y: 13, size: 56 },
  { key: "plan", kind: "pill", text: "THE PLAN", sub: "never happened", f0: A(7), f1: B("boom"), y: 12, size: 70 },
  { key: "boom", kind: "call", text: "BOOM", f0: W(7, "boom"), f1: B("boom"), y: 30, fg: "#ff8a3d", size: 210, rot: -6 },
  { key: "caught", kind: "stamp", text: "CAUGHT", f0: W(8, "caught"), f1: B("caught"), y: 16, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 130 },
  { key: "zero", kind: "stamp", text: "0 USED", f0: W(9, "single"), f1: B("zero"), y: 15, rot: 5, bg: "#2f2a3a", fg: "#ffffff", size: 130 },
  { key: "school", kind: "pill", text: "ON DISPLAY", sub: "German military schools", f0: A(11) + 4, f1: B("school"), y: 13, size: 62 },
  { key: "hundreds", kind: "call", text: "HUNDREDS?", f0: W(12, "hundreds"), f1: B("hundreds"), y: 14, fg: "#ffd166", size: 140 },
  { key: "file", kind: "pill", text: "SOE'S OWN FILES", sub: "a secret report", f0: A(13) + 4, f1: B("files"), y: 13, size: 60 },
  { key: "success", kind: "stamp", text: "SUCCESS", f0: W(13, "success"), f1: TOTAL - 4, y: 15, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 130 },
] as Item[]).filter((i) => i.f1 > i.f0);
