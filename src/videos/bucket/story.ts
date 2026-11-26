// The War of the Bucket Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen LEFT), unless a shot turns round.
// Nobody is shown hurt: the battle is charges, banners and men running away; the toll is a stamp over an empty field.
import { Expr } from "../bridge/toon";
import type { Gait } from "../hayes/horse";
import { V3, FPS, Gt, Hl, Rm, WALL_Z, WALK_Y, TOWER_Z, GATE_H, RACE_Z, WELL, WELL_HOOK, HILL_C, HILL_Y, CASTLE_S, RIVER_X, RIVER_Y, hillY, HANG, THRONE, DESK } from "./place";
import { SEG_TIMES, TOTAL, VOICE_END, wordAt, words } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const norm = (s: string) => s.toLowerCase().replace(/[^\w]/g, "");
/** onset of the n-th (1-based) match of w in a segment */
const Wn = (seg: number, w: string, n: number) => { const ws = words().filter((x) => x.seg === seg && norm(x.w) === norm(w)); const hit = ws[n - 1] ?? ws[ws.length - 1]; return hit ? Math.round(hit.s * FPS) : W(seg, w); };
const CUTS: [string, number][] = [
  ["hook", 0], ["battle", W(0, "and") - 2],
  ["walls", A(1)], ["modena", W(1, "modena") - 2], ["hate1", W(1, "already") - 2], ["hate2", W(1, "each") - 2], ["pope", W(1, "one") - 2], ["emperor", Wn(1, "the", 2) - 2],
  ["night", A(2)], ["traitors", W(2, "traitors") - 2], ["handed", W(2, "handed") - 2],
  ["furious", A(3)], ["army", W(3, "it") - 2], ["few", W(3, "modena") - 2],
  ["decree", A(4)], ["bona", W(4, "passerino") - 2], ["rebel", W(4, "rebel") - 2], ["anyone", W(4, "anyone") - 2], ["forgive", W(4, "forgiveness") - 2],
  ["zappo", A(5)], ["sunset", W(5, "near") - 2], ["feint", W(5, "bonacolsi") - 2], ["ride", W(5, "now") - 2], ["behind", W(5, "behind") - 2],
  ["flee", A(6)], ["ran", W(6, "ran") - 2], ["toll", W(6, "around") - 2],
  ["chase", A(7)], ["outside", W(7, "instead") - 2], ["race", W(7, "held") - 2], ["rub", W(7, "just") - 2],
  ["well", A(8)], ["grab", W(8, "grabbed") - 2], ["prize", W(8, "that") - 2],
  ["jan", A(9)], ["kept", W(9, "modena") - 2],
  ["poet", A(10)], ["book", W(10, "comic") - 2], ["starts", W(10, "where") - 2], ["version", W(10, "and") - 2],
  ["still", A(11)], ["end", VOICE_END],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Ride = { pose: number; mirror: boolean; tilt?: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number; tilt?: number; mode?: "stand" | "sit" | "march";
  /** in the air: no contact shadow */
  air?: boolean;
  /** walking in profile: step phase 0..1; mirror = moving toward -x; carry = a point both hands hold out to */
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 }; ride?: Ride };
export type Rider = { who: string; expr: Expr; pose?: number; tilt?: number };
export type HorseSt = { k: number; p: V3; yaw: number; gait: Gait; phase: number; jump?: number; head?: number; rider?: Rider };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "page" | "decree" | "dust";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type ArmySt = { state: "stand" | "march" | "flee"; u: number; hide?: (i: number, p: V3) => boolean };
export type St3 = {
  light: "day" | "field" | "night" | "dusk" | "grey" | "tower" | "pope" | "emp" | "study"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; horses?: HorseSt[]; subjects?: [string, V3, number][];
  cards?: Card[]; puffs?: Puff[];
  /** the loose bucket: where the top of its bail is, and its turn */
  bucket?: { p: V3; r?: V3 };
  /** Bologna's gate (0 shut .. 1 open), the castle gate, the flag on the keep, the well rope's length */
  gate?: number; castleGate?: number; flag?: "bologna" | "modena"; rope?: number;
  army?: { bolo?: ArmySt; mode?: ArmySt };
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
const DUST: [number, number, number] = [0.78, 0.68, 0.54];
const hy = (x: number, z: number) => hillY(x - Hl(0, 0, 0)[0], z);
/** a point on the hill set's ground (set-local x, z), raised by y */
const hg = (x: number, z: number, y = 0): V3 => { const p = Hl(x, 0, z); return [p[0], hy(p[0], z) + y, z]; };

// ---------------- horses ----------------
const STRIDE: Record<Gait, number> = { gallop: 6.8, canter: 3.6, trot: 2.9, walk: 1.7, stand: 1 };
/** a horse heading along x (v > 0: toward +x, screen left); stride phase follows the distance run */
const gallop = (k: number, x: number, z: number, y: number, v: number, who: string | null, expr: Expr = "stern", gait: Gait = "gallop", extra: Partial<HorseSt> = {}): HorseSt =>
  ({ k, p: [x, y, z], yaw: v >= 0 ? 0 : Math.PI, gait, phase: Math.abs(x) / STRIDE[gait] + k * 0.31, rider: who ? { who, expr, pose: 0 } : undefined, ...extra });
/** hoof dust behind a running horse heading along x */
const hoofDust = (p: V3, v: number, tt: number, n = 5): Puff[] => Array.from({ length: n }, (_, i) => { const u = ((tt * 2.2 + i / n) % 1); return { p: add(p, -Math.sign(v) * (1.2 + 2.4 * u), 0.25 + 0.5 * u, 0.3 * Math.sin(i * 2.1)), s: 0.6 + 1.4 * u, c: DUST, a: 0.55 * (1 - u) }; });

// ---------------- the gate as the shots use it ----------------
const WALK_Z = WALL_Z + 0.9;
const BUCKET_AT_WELL: V3 = Gt(WELL_HOOK[0], WELL_HOOK[1], WELL_HOOK[2]);
const MO1_WELL: V3 = Gt(WELL[0] - 0.15, 0, WELL[2] - 1.25);
// ---------------- the hill ----------------
const GATE_C: V3 = hg(HILL_C[0], HILL_C[1] - CASTLE_S / 2 + 0.3, 0);   // the castle gate, on the hill top
const CY = HILL_Y;
// ---------------- the room ----------------
const BK: V3 = Rm(HANG[0], HANG[1], HANG[2]), BK_C: V3 = add(BK, 0, -0.3, 0);
const HOOK_POS: V3 = Rm(0.28, 1.85, -0.95), HOOK_LOOK: V3 = add(BK_C, 0.18, -0.32, 0), HOOK = { fov: 42, roll: 0.03 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.06), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const POPE_P: V3 = Rm(THRONE[0], THRONE[1], THRONE[2] - 0.7), EMP_P: V3 = Rm(THRONE[0], THRONE[1], THRONE[2] - 0.7), POET_P: V3 = Rm(DESK[0] + 0.1, 0, DESK[2] + 0.75);
const WIN_T: V3 = Rm(4.2, 3.0, -1.2), CANDLE_H: V3 = Rm(0, 2.2, 2.4), CANDLE_S: V3 = Rm(DESK[0] - 0.8, 1.2, DESK[2] + 0.25);

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // This bucket is a trophy from a real medieval war: Modena's bucket on its chain in the tower room (frame 0 is already close)
  hook: (s, f) => ({ light: "tower", dof: 1, closeup: true, focus: BK_C, key: WIN_T, cam: kick(hookCam(f), f, W(0, "trophy"), 0.6),
    subjects: [["the bucket", BK_C, 0.1]] }),
  // ...and the war wasn't even about the bucket: Zappolino at sunset, Modena's horsemen charging past the lens
  battle: (s, f) => { const tt = t(f - s.a), x0 = 26, v = -14;
    const hs = [gallop(0, Hl(x0 + v * tt, 0, 0)[0], -16, hy(Hl(x0 + v * tt, 0, 0)[0], -16), v, "rm1"), gallop(1, Hl(x0 + 5 + v * tt, 0, 0)[0], -19, hy(Hl(x0 + 5 + v * tt, 0, 0)[0], -19), v, "rm2"), gallop(2, Hl(x0 + 10 + v * tt, 0, 0)[0], -14, hy(Hl(x0 + 10 + v * tt, 0, 0)[0], -14), v, "rm3")];
    return { light: "dusk", dof: 0, focus: hg(0, 10, 3), horses: hs, army: { bolo: { state: "stand", u: 0 }, mode: { state: "march", u: tt + 2 } },
      puffs: hs.flatMap((h) => hoofDust(h.p, v, tt, 4)),
      cam: kick(move({ pos: hg(6, -27, 1.4), look: hg(0, 6, 4), fov: 52, roll: 0.06 }, { pos: hg(4, -27.6, 1.6), look: hg(-2, 6, 4.5), fov: 50, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(0, "wasnt"), 0.9),
      subjects: [["the battle", hg(0, 14, 4), 3]] }; },
  // You see, in 1325, Bologna...: up the city wall to the gate tower and the towers of the city behind it
  walls: (s, f) => ({ light: "day", dof: 0, focus: Gt(0, 8, TOWER_Z), gate: 0,
    people: [P("bc1", Gt(-7.5, WALK_Y, WALK_Z), "stern", 1, { extra: true }), P("bo1", Gt(7.2, WALK_Y, WALK_Z), "stern", -1, { extra: true })],
    cam: move({ pos: Gt(3.0, 1.6, -14), look: Gt(0, 7.0, TOWER_Z), fov: 54, roll: 0.05 }, { pos: Gt(2.2, 3.8, -17), look: Gt(0, 9.0, TOWER_Z), fov: 54, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["Bologna's gate", Gt(0, GATE_H + 2.6, TOWER_Z), 1]] }),
  // ...and Modena: Modena's men under their yellow-and-blue banners, out in the hill country
  modena: (s, f) => { const ps: V3[] = [hg(-0.9, -6.2), hg(0.4, -5.0), hg(1.6, -6.6), hg(-1.9, -4.6)];
    return { light: "field", dof: 1, focus: add(ps[1], 0, 1.5, 0), army: { mode: { state: "stand", u: 0, hide: (_i, p) => p[2] < -3.4 && p[2] > -8 && Math.abs(p[0] - Hl(0, 0, 0)[0]) < 3.2 } },
      people: [P("mo1", ps[0], "stern", 1), P("mo2", ps[1], "grin", 0), P("mo3", ps[2], "stern", -1), P("mo4", ps[3], "neutral", 1, { extra: true })],
      cam: move({ pos: hg(0.2, -11.5, 1.7), look: hg(0.1, -5.2, 1.6), fov: 48, roll: -0.05 }, { pos: hg(0.0, -10.9, 1.6), look: hg(0.1, -5.2, 1.65), fov: 46, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["Modena's men", add(ps[1], 0, 1.5, 0), 0.3]] }; },
  // ...already hated each other: a Bolognese soldier glares (close, low)
  hate1: (s, f) => { const p = Gt(-1.0, 0, 4.0);
    return { light: "day", dof: 1, closeup: true, focus: add(p, 0, 1.6, 0), gate: 0, people: [P("bo3", p, "stern", -1, { headTilt: 0.08 })],
      cam: kick(snap(add(p, -0.35, 1.5, -1.9), add(p, 0, 1.6, 0), f, s.a, { fov: 40, roll: -0.06 }, 1.7, 6), f, W(1, "hated"), 0.8),
      subjects: [["the Bolognese soldier", add(p, 0, 1.6, 0), 0.2]] }; },
  // ...each other: a Modenese soldier glares back
  hate2: (s, f) => { const p = hg(0.4, -5.0);
    return { light: "field", dof: 1, closeup: true, focus: add(p, 0, 1.6, 0), people: [P("mo2", p, "stern", 1, { headTilt: -0.08 })],
      cam: snap(add(p, 0.4, 1.55, -1.9), add(p, 0, 1.6, 0), f, s.a, { fov: 40, roll: 0.06 }, 1.7, 6),
      subjects: [["the Modenese soldier", add(p, 0, 1.6, 0), 0.2]] }; },
  // One side backed the Pope: the Pope before his throne, the crossed keys behind him
  pope: (s, f) => ({ light: "pope", dof: 1, focus: add(POPE_P, 0, 1.6, 0), key: CANDLE_H, people: [P("pope", POPE_P, "stern", 0, { wave: 0.6 })],
    cam: move({ pos: Rm(-0.6, 1.4, -1.8), look: add(POPE_P, 0, 1.8, 0), fov: 50, roll: 0.05 }, { pos: Rm(-0.4, 1.3, -1.2), look: add(POPE_P, 0, 1.9, 0), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the Pope", add(POPE_P, 0, 1.6, 0), 0.2], ["the papal banner", Rm(0, THRONE[1] + 3.3, 4.1), 0.5]] }),
  // The other backed the Emperor: the Emperor, crowned, the eagle behind him
  emperor: (s, f) => ({ light: "emp", dof: 1, focus: add(EMP_P, 0, 1.6, 0), key: CANDLE_H, people: [P("emp", EMP_P, "grin", 0)],
    cam: kick(move({ pos: Rm(0.7, 1.35, -1.7), look: add(EMP_P, 0, 1.85, 0), fov: 50, roll: -0.05 }, { pos: Rm(0.5, 1.3, -1.2), look: add(EMP_P, 0, 1.9, 0), fov: 48, roll: 0.04 }, f, s.a, s.b, smooth, 0), f, W(1, "emperor"), 0.7),
    subjects: [["the Emperor", add(EMP_P, 0, 1.6, 0), 0.2], ["the imperial banner", Rm(0, THRONE[1] + 3.3, 4.1), 0.5]] }),
  // That September...: Monteveglio on its hill by night, the moon behind, torches at the gate
  night: (s, f) => ({ light: "night", dof: 0, focus: add(GATE_C, 0, 4, 0), castleGate: 0, flag: "bologna",
    cam: move({ pos: hg(-6, 14, 3.5), look: hg(0, 52, 6), fov: 50, roll: 0.04 }, { pos: hg(-4, 20, 3.8), look: hg(0, 52, 6.5), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the castle", hg(0, 52, 6), 2]] }),
  // ...traitors inside Bologna's fortress: the gate swings open, two of the garrison pushing the leaves
  traitors: (s, f) => { const o = smooth((f - s.a) / 12), lp: V3 = add(GATE_C, 1.2, 0.62, 2.0), rp: V3 = add(GATE_C, -1.2, 0.62, 2.2);
    return { light: "night", dof: 1, focus: add(GATE_C, 0, 1.6, 1.9), castleGate: 0.35 + 0.65 * o, flag: "bologna", key: add(GATE_C, 2.6, 3.2, -1.0),
      people: [P("tr1", lp, "grin", -1, { wave: 0.9 }), P("tr2", rp, "nervous", 1, { wave: 0.5 })],
      cam: move({ pos: add(GATE_C, 0.4, 1.8, -7.6), look: add(GATE_C, 0, 1.6, 1.9), fov: 46, roll: -0.04 }, { pos: add(GATE_C, 0.25, 1.75, -6.6), look: add(GATE_C, 0, 1.65, 1.9), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the traitors", add(lp, 0, 1.4, 0), 0.2], ["the open gate", add(GATE_C, 0, 2.2, 0.2), 0.5]] }; },
  // ...handed it over to Modena: from inside the walls, Modena's men march in through the open gate toward us
  handed: (s, f) => { const tt = t(f - s.a), z0 = GATE_C[2] - 3.4 + 1.15 * tt, ph = (tt * 1.2 / 1.6) % 1;
    const man = (w: string, x: number, dz: number, k: number) => P(w, hg(x, z0 + dz, 0.62), k ? "grin" : "stern", 0, { march: (ph + 0.5 * k) % 1 });
    return { light: "night", dof: 1, focus: hg(0, z0 + 1.0, 2.2), castleGate: 1, flag: "modena", key: add(GATE_C, 2.6, 3.2, -1.0),
      people: [man("mo1", 0.4, 1.0, 0), man("mo2", -0.45, 0, 1), man("mo3", 0.35, -1.3, 1)],
      cam: move({ pos: hg(0.2, GATE_C[2] + 7.8, 2.2), look: hg(0, GATE_C[2] - 0.5, 2.1), fov: 48, roll: 0.05 }, { pos: hg(0.1, GATE_C[2] + 7.0, 2.1), look: hg(0, GATE_C[2] - 0.5, 2.1), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["Modena's men", hg(0, z0 + 1.0, 2.0), 0.4]] }; },
  // Bologna was furious: the podestà at the city gate, shouting, his men behind him
  furious: (s, f) => { const p = Gt(-0.3, 0, 7.6);
    return { light: "day", dof: 1, focus: add(p, 0, 1.55, 0), gate: 0, people: [P("podesta", p, "shock", 0, { wave: 1 }), P("bo1", Gt(-1.5, 0, 9.4), "stern", 1), P("bo4", Gt(1.1, 0, 9.6), "stern", -1)],
      cam: kick(move({ pos: add(p, 0.3, 1.3, -3.4), look: add(p, 0, 1.75, 0.6), fov: 50, roll: -0.06 }, { pos: add(p, 0.1, 1.35, -3.0), look: add(p, 0, 1.75, 0.6), fov: 48, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(3, "furious"), 1.0),
      subjects: [["the podestà", add(p, 0, 1.6, 0), 0.2]] }; },
  // It raised an army of more than 30,000 men: the whole slope full of Bologna's ranks, the crane rising over them
  army: (s, f) => ({ light: "field", dof: 0, focus: hg(0, 18, 6), army: { bolo: { state: "stand", u: 0 } }, flag: "bologna",
    cam: kick(move({ pos: hg(8, 2, 3.5), look: hg(-4, 20, 6), fov: 56, roll: 0.05 }, { pos: hg(10, -6, 14), look: hg(-2, 22, 4), fov: 58, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, W(3, "30000"), 0.7),
    subjects: [["Bologna's army", hg(0, 18, 7), 4]] }),
  // Modena had about 7,000: Modena's much smaller block on the plain
  few: (s, f) => ({ light: "field", dof: 0, focus: hg(0, -7, 1.5), army: { mode: { state: "stand", u: 0 } },
    cam: move({ pos: hg(-14, -24, 7), look: hg(0, -7, 1), fov: 46, roll: -0.05 }, { pos: hg(-12, -21, 6), look: hg(0, -7, 1), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    subjects: [["Modena's army", hg(0, -7, 1.5), 2]] }),
  // And the Pope had already declared...: the Pope holds up the decree
  decree: (s, f) => { const hand: V3 = add(POPE_P, 0.42, 1.55, -0.25);
    return { light: "pope", dof: 1, focus: add(POPE_P, 0.2, 1.6, 0), key: CANDLE_H, people: [P("pope", POPE_P, "stern", 1, { hw: [hand] })],
      cards: [{ kind: "decree", p: add(hand, 0.02, 0.17, -0.04), spin: -0.08, s: 1 }],
      cam: move({ pos: add(POPE_P, -0.4, 1.55, -2.9), look: add(POPE_P, 0.2, 1.65, 0), fov: 46, roll: -0.05 }, { pos: add(POPE_P, -0.3, 1.55, -2.5), look: add(POPE_P, 0.2, 1.68, 0), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the Pope", add(POPE_P, 0, 1.6, 0), 0.2], ["the decree", add(hand, 0.02, 0.17, -0.04), 0.05]] }; },
  // ...Modena's leader, Passerino Bonacolsi: in front of his men, grinning
  bona: (s, f) => { const p = hg(0.2, -1.0);
    return { light: "field", dof: 1, focus: add(p, 0, 1.55, 0), army: { mode: { state: "stand", u: 0 } }, people: [P("bona", p, "grin", 0)],
      cam: move({ pos: add(p, -1.0, 1.4, 3.4), look: add(p, 0, 1.65, 0), fov: 46, roll: 0.05 }, { pos: add(p, -0.7, 1.45, 2.9), look: add(p, 0, 1.65, 0), fov: 44, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["Bonacolsi", add(p, 0, 1.6, 0), 0.2]] }; },
  // ...a rebel: snap in on his grin
  rebel: (s, f) => { const p = hg(0.2, -1.0);
    return { light: "field", dof: 1, closeup: true, focus: add(p, 0, 1.6, 0), army: { mode: { state: "stand", u: 0 } }, people: [P("bona", p, "laugh", 0, { headTilt: 0.1 })],
      cam: kick(snap(add(p, 0.4, 1.6, 1.85), add(p, 0, 1.62, 0), f, s.a, { fov: 40, roll: -0.05 }, 1.7, 6), f, W(4, "rebel"), 0.9),
      subjects: [["Bonacolsi", add(p, 0, 1.6, 0), 0.2]] }; },
  // Anyone who harmed him...: two Bolognese soldiers at the gate, grinning at each other
  anyone: (s, f) => { const a = Gt(-0.55, 0, 6.6), b = Gt(0.6, 0, 7.4);
    return { light: "day", dof: 1, focus: L3(add(a, 0, 1.55, 0), add(b, 0, 1.55, 0), 0.5), gate: 0, people: [P("bo2", a, "grin", -1, { facing: -1 }), P("bo4", b, "grin", 1, { facing: 1 })],
      cam: move({ pos: Gt(0.2, 1.5, 3.1), look: Gt(0, 1.6, 7.0), fov: 48, roll: 0.05 }, { pos: Gt(0.1, 1.5, 3.6), look: Gt(0, 1.62, 7.0), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the Bolognese soldiers", add(a, 0.5, 1.5, 0.4), 0.3]] }; },
  // ...was promised forgiveness for their sins: the Pope raises his hand in blessing
  forgive: (s, f) => ({ light: "pope", dof: 1, closeup: true, focus: add(POPE_P, 0, 1.75, 0), key: CANDLE_H, people: [P("pope", POPE_P, "relief", 0, { wave: 0.9 })],
    cam: kick(snap(add(POPE_P, 0.3, 1.75, -2.1), add(POPE_P, 0, 1.85, 0), f, s.a, { fov: 42, roll: 0.05 }, 1.6, 6), f, W(4, "forgiveness"), 0.8),
    subjects: [["the Pope", add(POPE_P, 0, 1.7, 0), 0.2]] }),
  // The armies met at Zappolino, near sunset: the castle on its hill, Bologna's ranks on the slope, Modena's on the plain
  zappo: (s, f) => ({ light: "dusk", dof: 0, focus: hg(0, 20, 6), flag: "bologna", army: { bolo: { state: "stand", u: 0 }, mode: { state: "stand", u: 0 } },
    cam: move({ pos: hg(24, -44, 9), look: hg(-2, 22, 9), fov: 50, roll: 0.04 }, { pos: hg(18, -40, 13), look: hg(-2, 24, 9), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the castle of Zappolino", hg(0, 58, 10), 3], ["the armies", hg(0, 10, 3), 4]] }),
  // ...near sunset: Bonacolsi on his horse, the low sun behind him
  sunset: (s, f) => { const hp = hg(-1, 1.5), h: HorseSt = { k: 0, p: hp, yaw: Math.PI, gait: "stand", phase: 0, head: 0.2, rider: { who: "bona", expr: "stern", pose: 0 } };
    return { light: "dusk", dof: 1, focus: add(hp, 0, 2.2, 0), horses: [h], army: { mode: { state: "stand", u: 0, hide: (_i, p) => p[2] > -7 } },
      cam: move({ pos: add(hp, 1.8, 1.4, -5.6), look: add(hp, -0.2, 2.2, 0), fov: 46, roll: -0.05 }, { pos: add(hp, 1.2, 1.3, -5.0), look: add(hp, -0.2, 2.25, 0), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["Bonacolsi", add(hp, 0, 2.4, 0), 0.3]] }; },
  // Bonacolsi had faked a river crossing the night before: horsemen wading the Panaro by moonlight
  feint: (s, f) => { const tt = t(f - s.a), x0 = RIVER_X - 4.5, v = 1.6;
    const h = (k: number, dx: number, z: number, who: string): HorseSt => { const x = x0 + dx + v * tt, p = hg(x, z); return { k, p, yaw: 0, gait: "walk", phase: (x / STRIDE.walk) + k * 0.31, head: 0.1, rider: { who, expr: "stern", pose: 0 } }; };
    const hs = [h(0, 0, 9.0, "rm1"), h(1, -2.6, 11.4, "rm2"), h(2, -5.0, 8.0, "rm3")];
    return { light: "night", dof: 1, focus: add(hs[0].p, 0, 1.6, 0), horses: hs,
      puffs: hs.flatMap((q, i) => [0, 1].map((k) => { const u = ((tt * 1.5 + k * 0.5 + i * 0.3) % 1); return { p: [q.p[0] - 0.4 + 0.6 * k, Hl(0, RIVER_Y, 0)[1] + 0.15 + 0.3 * u, q.p[2] + 0.2] as V3, s: 0.3 + 0.5 * u, c: [0.85, 0.9, 1.0] as [number, number, number], a: 0.5 * (1 - u) }; })),
      cam: move({ pos: hg(RIVER_X - 9, 1.0, 1.4), look: hg(RIVER_X - 3, 9, 0.6), fov: 46, roll: 0.05 }, { pos: hg(RIVER_X - 8.2, 1.4, 1.5), look: hg(RIVER_X - 2, 9.5, 0.7), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the horsemen in the river", add(hs[0].p, 0, 1.6, 0), 0.4]] }; },
  // ...and now he sent his horsemen around: tracking alongside them at a gallop across the foot of the slope (dusk)
  ride: (s, f) => { const tt = t(f - s.a), v = -13, x = 30 + v * tt, z = 2.5;
    const hs = [gallop(0, Hl(x, 0, 0)[0], z, hy(Hl(x, 0, 0)[0], z), v, "rm1"), gallop(1, Hl(x + 2.6, 0, 0)[0], z + 2.4, hy(Hl(x + 2.6, 0, 0)[0], z + 2.4), v, "rm2"), gallop(2, Hl(x + 5.0, 0, 0)[0], z - 0.6, hy(Hl(x + 5.0, 0, 0)[0], z - 0.6), v, "rm3")];
    const lk = add(hs[0].p, -0.6, 1.9, 1.0);
    return { light: "dusk", dof: 1, focus: lk, horses: hs, army: { bolo: { state: "stand", u: 0 } }, puffs: hs.flatMap((h) => hoofDust(h.p, v, tt, 4)),
      cam: { pos: add(lk, -1.2, 0.1, -8.2), look: lk, fov: 46, roll: 0.03 * Math.sin(tt * 2) },
      subjects: [["Modena's horsemen", add(hs[0].p, 0, 1.9, 0), 0.4]] }; },
  // ...behind the Bolognese lines: two of Bologna's men turn in shock as the horsemen burst through behind them
  behind: (s, f) => { const tt = t(f - s.a), a = hg(-0.6, 25.4), b = hg(0.7, 26.2), v = -12, x = 7 + v * tt, z = 29.6;
    const hs = [gallop(0, Hl(x, 0, 0)[0], z, hy(Hl(x, 0, 0)[0], z), v, "rm2"), gallop(1, Hl(x + 3, 0, 0)[0], z + 1.6, hy(Hl(x + 3, 0, 0)[0], z + 1.6), v, "rm3")];
    return { light: "dusk", dof: 1, focus: add(a, 0.6, 1.5, 0.4), horses: hs, puffs: hs.flatMap((h) => hoofDust(h.p, v, tt, 4)),
      people: [P("bo1", a, f >= W(5, "bolognese") ? "shock" : "stern", 1, { facing: 1 }), P("bo2", b, f >= W(5, "bolognese") ? "shock" : "neutral", -1, { facing: -1 })],
      cam: kick(move({ pos: add(a, 0.7, 1.2, -4.4), look: add(a, 0.6, 1.9, 2.0), fov: 50, roll: -0.06 }, { pos: add(a, 0.6, 1.3, -4.0), look: add(a, 0.6, 1.95, 2.0), fov: 48, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(5, "bolognese"), 1.0),
      subjects: [["the Bolognese soldiers", add(a, 0.6, 1.5, 0.4), 0.3], ["the horsemen", add(hs[0].p, 0, 1.9, 0), 0.6]] }; },
  // In about two hours, the giant army ran: the whole slope breaks and runs, crane up over it
  flee: (s, f) => { const tt = t(f - s.a);
    return { light: "dusk", dof: 0, focus: hg(10, 20, 5), army: { bolo: { state: "flee", u: tt }, mode: { state: "march", u: 6 + tt } },
      cam: move({ pos: hg(-30, -10, 10), look: hg(6, 20, 5), fov: 54, roll: 0.05 }, { pos: hg(-34, -16, 17), look: hg(10, 22, 4), fov: 56, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["Bologna's army running", hg(10, 20, 5), 6]] }; },
  // ...ran: tracking one of them running for it, spear dropped
  ran: (s, f) => { const tt = t(f - s.a), x0 = Hl(-3, 0, 0)[0], x = x0 + 4.2 * tt, z = 18, w = walker("bo3", x0, hy(x, z), z, 4.2, tt, "shock", { side: { phase: (tt * 2.7) % 1, mirror: false, stride: 1.25 } });
    const w2 = walker("bo4", x0 - 2.4, hy(x - 2.4, z + 1.6), z + 1.6, 4.2, tt, "nervous", { side: { phase: (tt * 2.7 + 0.4) % 1, mirror: false, stride: 1.25 } });
    const lk = add(w.p, -0.6, 1.4, 0.6);
    return { light: "dusk", dof: 1, focus: lk, people: [{ ...w, who: "bo3" }, { ...w2, who: "bo4" }], army: { bolo: { state: "flee", u: 2.5 + tt, hide: (_i, p) => Math.abs(p[2] - z) < 4 && Math.abs(p[0] - x) < 8 } },
      cam: { pos: add(lk, 0.3, 0.2, -4.6), look: lk, fov: 46, roll: 0.03 * Math.sin(tt * 3) },
      subjects: [["the Bolognese soldier", add(w.p, 0, 1.5, 0), 0.2]] }; },
  // Around 2,000 men were killed or wounded: the empty slope at dusk, dropped banners and spears, dust settling
  toll: (s, f) => { const tt = t(f - s.a);
    return { light: "dusk", dof: 0, focus: hg(0, 16, 3), army: { bolo: { state: "flee", u: 9 + tt }, mode: { state: "march", u: 12 + tt } },
      puffs: Array.from({ length: 14 }, (_, i) => { const u = (tt * 0.2 + i / 14) % 1; return { p: hg(-20 + i * 3.2, 10 + (i % 4) * 3, 0.6 + 2 * u), s: 2.5 + 3 * u, c: DUST, a: 0.35 * Math.sin(Math.PI * u) }; }),
      cam: move({ pos: hg(2, -4, 4.2), look: hg(0, 22, 4), fov: 50, roll: -0.04 }, { pos: hg(2.5, -2, 4.0), look: hg(0, 22, 4.2), fov: 48, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the battlefield", hg(0, 16, 3), 4]] }; },
  // Modena chased them all the way to Bologna's walls: from the wall walk, Bologna's people look out at Modena marching up the road
  chase: (s, f) => { const tt = t(f - s.a), ph = (tt * 1.2 / 1.6) % 1, z0 = -3 + 1.2 * tt;
    const man = (w: string, x: number, dz: number, k: number) => P(w, Gt(x, 0, z0 + dz), "grin", 0, { march: (ph + 0.5 * k) % 1 });
    return { light: "day", dof: 1, focus: Gt(-16, 1.6, z0), gate: 0,
      people: [man("mo1", -15.4, 0, 0), man("mo2", -16.8, -0.6, 1), man("mo3", -14.6, -2.0, 1), man("mo4", -17.6, -2.6, 0), man("mo2", -16.0, -4.4, 0)],
      cam: move({ pos: Gt(-20.6, 12.7, 17.0), look: Gt(-16, 0.9, -2), fov: 40, roll: 0.04 }, { pos: Gt(-20.4, 12.9, 16.9), look: Gt(-16, 0.9, 0), fov: 40, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["Modena's men", Gt(-16, 1.4, z0), 0.4]] }; },
  // ...and instead of attacking the city: Modena's men stand before the shut gate, looking up, grinning
  outside: (s, f) => { const ps: V3[] = [Gt(-0.7, 0, 2.6), Gt(0.8, 0, 2.2), Gt(-1.8, 0, 1.0), Gt(1.9, 0, 0.8)];
    return { light: "day", dof: 1, focus: Gt(0, 2.5, 4), gate: 0, people: [P("mo1", ps[0], "grin", 0, { headTilt: -0.12 }), P("mo2", ps[1], "laugh", 0, { headTilt: -0.1 }), P("mo3", ps[2], "grin", 1), P("mo4", ps[3], "grin", -1)],
      cam: move({ pos: Gt(0.3, 0.9, -3.6), look: Gt(0, 4.4, 9), fov: 54, roll: -0.05 }, { pos: Gt(0.2, 0.9, -3.1), look: Gt(0, 5.0, 9), fov: 54, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["Modena's men", Gt(0, 1.5, 2.0), 0.4], ["the shut gate", Gt(0, 3, TOWER_Z + 1.2), 0.6]] }; },
  // ...they held a race outside its gates: the palio, three riders flat out along the road past the gate
  race: (s, f) => { const tt = t(f - s.a), v = 13, x = -26 + v * tt, z = RACE_Z;
    const hs = [gallop(3, Gt(x, 0, 0)[0], z - 1.6, 0, v, "pr1"), gallop(4, Gt(x - 3.4, 0, 0)[0], z + 0.4, 0, v, "pr2"), gallop(5, Gt(x - 6.0, 0, 0)[0], z + 2.2, 0, v, "pr3")];
    const lk = add(hs[0].p, 0.2, 1.8, 2.0);
    return { light: "day", dof: 1, focus: lk, horses: hs, gate: 0, puffs: hs.flatMap((h) => hoofDust(h.p, v, tt, 4)),
      people: [P("mo2", Gt(x + 6, 0, -1.2), "laugh", 0, { wave: 1, extra: true })],
      cam: { pos: add(lk, 0.8, 0.0, -9.0), look: lk, fov: 48, roll: -0.03 * Math.sin(tt * 2) },
      subjects: [["the race", add(hs[0].p, 0, 1.9, 0), 0.6]] }; },
  // Just to rub it in: Bologna's people on the wall, peeking over the merlons, appalled
  rub: (s, f) => { const a = Gt(-17.4, WALK_Y, WALK_Z + 0.2), b = Gt(-18.6, WALK_Y, WALK_Z - 0.2), c = Gt(-20.0, WALK_Y, WALK_Z + 0.3);
    return { light: "day", dof: 1, closeup: true, focus: add(b, 0, 1.6, 0), gate: 0, people: [P("bc3", a, "shock", 1), P("bc2", b, "nervous", 1), P("bo1", c, "stern", 1)],
      cam: kick(move({ pos: Gt(-15.3, WALK_Y + 1.55, WALK_Z + 0.4), look: Gt(-19.0, WALK_Y + 1.45, WALK_Z - 0.1), fov: 46, roll: 0.06 }, { pos: Gt(-15.1, WALK_Y + 1.6, WALK_Z + 0.5), look: Gt(-19.0, WALK_Y + 1.5, WALK_Z - 0.1), fov: 44, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(7, "rub"), 0.8),
      subjects: [["Bologna's people on the wall", add(b, 0, 1.6, 0), 0.3]] }; },
  // On the way home...: a Modenese soldier at the well outside the gate, the bucket hanging on its rope
  well: (s, f) => { const len = t(s.b - s.a), tt = t(f - s.a), w = walker("mo1", MO1_WELL[0] + 1.1 * len, 0, MO1_WELL[2], -1.1, Math.min(tt, len), "grin");
    return { light: "day", dof: 1, focus: L3(add(w.p, 0, 1.4, 0), BUCKET_AT_WELL, 0.5), gate: 0, rope: 0.25, bucket: { p: BUCKET_AT_WELL }, people: [w],
      cam: move({ pos: Gt(WELL[0] + 1.6, 1.5, -4.4), look: Gt(WELL[0] + 0.4, 1.35, 0.2), fov: 48, roll: 0.05 }, { pos: Gt(WELL[0] + 1.2, 1.5, -3.9), look: Gt(WELL[0] + 0.2, 1.35, 0.2), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the well", Gt(WELL[0], 1.0, WELL[2]), 0.6], ["the bucket", add(BUCKET_AT_WELL, 0, -0.3, 0), 0.1]] }; },
  // ...they grabbed a wooden bucket from a well: he lifts it off the rope
  grab: (s, f) => { const u = smooth((f - W(8, "grabbed")) / 10), bp: V3 = L3(BUCKET_AT_WELL, add(MO1_WELL, 0.22, 1.3, 0.35), u), p = MO1_WELL;
    return { light: "day", dof: 1, focus: add(bp, 0, -0.2, 0), gate: 0, rope: 0.25, bucket: { p: bp, r: [0, 0.4 * u, 0] }, people: [P("mo1", p, "grin", 1, { hw: [add(bp, 0, 0.0, 0)] })],
      cam: move({ pos: add(p, 0.9, 1.45, -2.6), look: add(p, 0.25, 1.3, 0.6), fov: 46, roll: -0.05 }, { pos: add(p, 0.7, 1.42, -2.2), look: add(p, 0.25, 1.3, 0.6), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the bucket", add(bp, 0, -0.3, 0), 0.1], ["the Modenese soldier", add(p, 0, 1.5, 0), 0.2]] }; },
  // That was the prize: he holds it up high, grinning
  prize: (s, f) => { const p = MO1_WELL, bp: V3 = add(p, 0.3, 2.05, -0.15);
    return { light: "day", dof: 1, closeup: true, focus: add(p, 0.15, 1.75, 0), gate: 0, rope: 0.25, bucket: { p: bp, r: [0, 0.6, 0.08 * Math.sin(t(f) * 3)] }, people: [P("mo1", p, "laugh", 1, { hw: [bp] })],
      cam: kick(snap(add(p, 0.1, 1.55, -2.5), add(p, 0.15, 1.8, 0), f, s.a, { fov: 44, roll: -0.05 }, 1.7, 6), f, W(8, "prize"), 1.0),
      subjects: [["the bucket", add(bp, 0, -0.3, 0), 0.1], ["the Modenese soldier", add(p, 0, 1.6, 0), 0.2]] }; },
  // By January, Bologna had its fortress back: Monteveglio on a grey day, Bologna's flag on the keep, its men at the gate
  jan: (s, f) => ({ light: "grey", dof: 0, focus: add(GATE_C, 0, 3, 0), castleGate: 1, flag: "bologna",
    people: [P("bo1", add(GATE_C, 1.2, 0.62, -2.0), "grin", 0, { wave: 0.8 }), P("bo2", add(GATE_C, -1.0, 0.62, -1.6), "laugh", 1)],
    cam: move({ pos: add(GATE_C, 1.5, 1.6, -10.5), look: add(GATE_C, 0, 3.6, 0), fov: 52, roll: 0.04 }, { pos: add(GATE_C, 1.0, 2.6, -12), look: add(GATE_C, 0, 5.0, 0), fov: 54, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the fortress", add(GATE_C, 0, 4, 0), 1.5], ["Bologna's flag", hg(0, HILL_C[1] + 5.6, 22 + 3.6), 1]] }),
  // Modena kept the bucket: back in the tower room, the bucket on its chain, circling it
  kept: (s, f) => ({ light: "tower", dof: 1, focus: BK_C, key: WIN_T, cam: orbit(s, f, BK_C, [-34, -8], [2.2, 1.9], [0.2, 0.05], 42), subjects: [["the bucket", BK_C, 0.1]] }),
  // Three hundred years later, a poet...: Tassoni at his desk, writing, the candle beside him
  poet: (s, f) => { const tt = t(f), hand: V3 = add(POET_P, -0.25 + 0.05 * Math.sin(tt * 6), 0.9, -0.55);
    return { light: "study", dof: 1, focus: add(POET_P, 0, 1.5, 0), key: CANDLE_S, people: [P("poet", POET_P, "grin", 0, { hw: [hand] })],
      cam: move({ pos: Rm(DESK[0] - 0.6, 1.5, -1.4), look: add(POET_P, 0, 1.4, 0), fov: 48, roll: -0.05 }, { pos: Rm(DESK[0] - 0.4, 1.45, -0.9), look: add(POET_P, 0, 1.42, 0), fov: 46, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the poet", add(POET_P, 0, 1.5, 0), 0.2]] }; },
  // ...wrote a comic epic: down onto the open book, the title page, La Secchia Rapita
  book: (s, f) => ({ light: "study", dof: 1, closeup: true, focus: Rm(DESK[0] - 0.16, 0.88, DESK[2] - 0.12), key: CANDLE_S,
    cam: kick(snap(Rm(DESK[0] - 0.16, 1.55, DESK[2] - 0.85), Rm(DESK[0] - 0.16, 0.88, DESK[2] - 0.1), f, s.a, { fov: 40, roll: 0.04 }, 1.6, 6), f, W(10, "epic"), 0.7),
    subjects: [["the title page", Rm(DESK[0] - 0.16, 0.88, DESK[2] - 0.12), 0.05]] }),
  // ...where the whole war starts over the bucket: he laughs, pages fly up off the desk
  starts: (s, f) => { const tt = t(f - s.a);
    return { light: "study", dof: 1, focus: add(POET_P, 0, 1.5, 0), key: CANDLE_S, people: [P("poet", POET_P, "laugh", 0, { wave: 1 })],
      cards: Array.from({ length: 8 }, (_, i) => { const u = clamp01(tt * 0.8 - i * 0.07); return { kind: "page" as const, p: add(POET_P, -0.8 + i * 0.22 + 0.2 * Math.sin(i + tt), 0.9 + 1.4 * u + 0.1 * Math.sin(tt * 3 + i), -0.6 - 0.25 * u), spin: i + tt * 2, s: 1 }; }),
      cam: kick(move({ pos: add(POET_P, 0.3, 1.45, -3.2), look: add(POET_P, 0, 1.5, 0), fov: 48, roll: 0.05 }, { pos: add(POET_P, 0.2, 1.45, -2.8), look: add(POET_P, 0, 1.55, 0), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(10, "bucket"), 0.8),
      subjects: [["the poet", add(POET_P, 0, 1.5, 0), 0.2]] }; },
  // ...and that's the version everyone remembers: the poet holds the book up to us
  version: (s, f) => { const hand: V3 = add(POET_P, 0.25, 1.35, -0.4);
    return { light: "study", dof: 1, focus: add(POET_P, 0, 1.55, 0), key: CANDLE_S, people: [P("poet", POET_P, "grin", 1, { hw: [hand] })],
      cards: [{ kind: "page", p: add(hand, 0.02, 0.12, -0.05), spin: 0.06, s: 1.3 }],
      cam: move({ pos: add(POET_P, -0.4, 1.55, -2.6), look: add(POET_P, 0.1, 1.55, 0), fov: 44, roll: -0.05 }, { pos: add(POET_P, -0.3, 1.55, -2.2), look: add(POET_P, 0.1, 1.58, 0), fov: 42, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the poet", add(POET_P, 0, 1.55, 0), 0.2]] }; },
  // And the bucket? It's still in Modena: back to the bucket on its chain, settling toward the opening frame
  still: (s, f) => ({ light: "tower", dof: 1, closeup: true, focus: BK_C, key: WIN_T,
    cam: move({ ...orb(BK_C, 26, 2.4, 0.3), fov: 42, roll: -0.03 }, { ...orb(BK_C, 10, 2.1, 0.15), fov: 40, roll: 0.02 }, f, s.a, s.b, smooth, 0), subjects: [["the bucket", BK_C, 0.1]] }),
  // loop: settle onto the opening frame (the subscribe card plays here)
  end: (s, f) => ({ light: "tower", dof: 1, closeup: true, focus: BK_C, key: WIN_T,
    cam: move({ ...orb(BK_C, 10, 2.1, 0.15), fov: 40, roll: 0.02 }, hookCam(0), f, s.a, s.b - 10, smooth, 0) }),
};
/** the house kit, for the long-form */
export { clamp01, smooth, expo, L3, move, orb, orbit, snap, kick, t as secs, P, walker, add, gallop, hoofDust, hg, hy, STRIDE, BK, BK_C, POPE_P, EMP_P, POET_P, MO1_WELL, BUCKET_AT_WELL, GATE_C, WALK_Z, CANDLE_H, CANDLE_S, WIN_T, DUST, CY };

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["battle", "walls", "pope", "night", "furious", "army", "decree", "zappo", "feint", "ride", "flee", "chase", "race", "well", "jan", "poet", "still"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps (Shorts: nothing important above y = 19 %) ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "trophy", kind: "stamp", text: "WAR TROPHY", f0: W(0, "trophy"), f1: B("hook"), y: 23, rot: -4, bg: "#c0702a", fg: "#ffffff", size: 120 },
  { key: "not", kind: "call", text: "NOT ABOUT THE BUCKET", f0: W(0, "wasnt"), f1: B("battle"), y: 23, fg: "#ffd166", size: 84 },
  { key: "1325", kind: "pill", text: "BOLOGNA", sub: "1325", f0: W(1, "bologna"), f1: B("walls"), y: 22, size: 88 },
  { key: "modena", kind: "pill", text: "MODENA", sub: "25 miles away", f0: S0("modena") + 3, f1: B("modena"), y: 22, size: 88 },
  { key: "hate", kind: "stamp", text: "ENEMIES", f0: W(1, "hated"), f1: B("hate2"), y: 23, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 140 },
  { key: "pope", kind: "pill", text: "BOLOGNA: THE POPE", f0: S0("pope") + 3, f1: B("pope"), y: 22, size: 70 },
  { key: "emp", kind: "pill", text: "MODENA: THE EMPEROR", f0: S0("emperor") + 3, f1: B("emperor"), y: 22, size: 66 },
  { key: "monte", kind: "pill", text: "MONTEVEGLIO", sub: "September 1325", f0: W(2, "september"), f1: B("night"), y: 22, size: 80 },
  { key: "traitors", kind: "stamp", text: "TRAITORS", f0: W(2, "traitors"), f1: B("traitors"), y: 23, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 140 },
  { key: "furious", kind: "stamp", text: "FURIOUS", f0: W(3, "furious"), f1: B("furious"), y: 23, rot: 4, bg: "#e0332e", fg: "#ffffff", size: 140 },
  { key: "30", kind: "call", text: "30,000+", f0: W(3, "30000"), f1: B("army"), y: 24, fg: "#ffffff", size: 160 },
  { key: "7", kind: "call", text: "~7,000", f0: W(3, "7000"), f1: B("few"), y: 24, fg: "#ffd166", size: 160 },
  { key: "bona", kind: "pill", text: "PASSERINO BONACOLSI", sub: "lord of Modena", f0: W(4, "passerino"), f1: B("bona"), y: 22, size: 64 },
  { key: "rebel", kind: "stamp", text: "REBEL", f0: W(4, "rebel"), f1: B("rebel"), y: 23, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 160 },
  { key: "sins", kind: "call", text: "SINS FORGIVEN", f0: W(4, "forgiveness"), f1: B("forgive"), y: 23, fg: "#ffd166", size: 110 },
  { key: "zap", kind: "pill", text: "ZAPPOLINO", sub: "Nov. 15, 1325", f0: W(5, "zappolino"), f1: B("zappo"), y: 22, size: 84 },
  { key: "fake", kind: "stamp", text: "FAKE CROSSING", f0: W(5, "faked"), f1: B("feint"), y: 23, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 104 },
  { key: "2h", kind: "call", text: "2 HOURS", f0: W(6, "two"), f1: B("flee"), y: 23, fg: "#ffd166", size: 140 },
  { key: "2000", kind: "stamp", text: "~2,000", sub: "", f0: W(6, "2000"), f1: B("toll"), y: 23, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 140 },
  { key: "kw", kind: "pill", text: "KILLED OR WOUNDED", f0: W(6, "killed"), f1: B("toll"), y: 33, size: 64 },
  { key: "palio", kind: "pill", text: "A PALIO", sub: "a race, to mock Bologna", f0: W(7, "race"), f1: B("race"), y: 22, size: 84 },
  { key: "prize", kind: "stamp", text: "THE PRIZE", f0: W(8, "prize"), f1: B("prize"), y: 23, rot: -4, bg: "#c0702a", fg: "#ffffff", size: 140 },
  { key: "jan", kind: "pill", text: "JANUARY 1326", sub: "peace", f0: W(9, "january"), f1: B("jan"), y: 22, size: 84 },
  { key: "back", kind: "stamp", text: "FORTRESS BACK", f0: W(9, "back"), f1: B("jan"), y: 30, rot: 3, bg: "#2f9a57", fg: "#ffffff", size: 100 },
  { key: "kept", kind: "stamp", text: "MODENA KEPT IT", f0: W(9, "kept"), f1: B("kept"), y: 23, rot: -4, bg: "#2a4aa8", fg: "#ffffff", size: 110 },
  { key: "poet", kind: "pill", text: "ALESSANDRO TASSONI", sub: "poet, 1622", f0: W(10, "poet"), f1: B("poet"), y: 22, size: 66 },
  { key: "book", kind: "pill", text: "\"THE STOLEN BUCKET\"", f0: W(10, "comic"), f1: B("book"), y: 22, size: 70 },
  { key: "legend", kind: "stamp", text: "THE LEGEND", f0: W(10, "version"), f1: B("version"), y: 23, rot: -4, bg: "#c0702a", fg: "#ffffff", size: 130 },
  { key: "still", kind: "call", text: "STILL IN MODENA", f0: W(11, "still"), f1: VOICE_END, y: 23, fg: "#ffd166", size: 110 },
] as Item[]).filter((i) => i.f1 > i.f0);
