// Kit 2 test: six short shots, one per new capability, each with the house moving camera.
import * as THREE from "three";
import { Expr } from "../bridge/toon";
import { V3, FPS, PATCH, WORK, GUN, LAMPS, FUSE, ARMY_Z, groundH } from "./place";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d"; s: number };
const LEN: [string, number, string][] = [["army", 84, "an army"], ["work", 84, "hands on tools"], ["break", 84, "the ground gives way"], ["rain", 78, "rain and lanterns"], ["fuse", 96, "ride the fuse"], ["volley", 96, "one shot"]];
export const SHOTS: ShotDef[] = []; { let a = 0; LEN.forEach(([g, n], i) => { SHOTS.push({ id: i + 1, g, a, b: a + n, k: "3d", s: i }); a += n; }); }
export const LABELS = LEN.map((l) => l[2]);
export const TOTAL = SHOTS[SHOTS.length - 1].b;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
const wordAt = (_s: number, _w: string) => 0, segAt = (_s: number) => 0; void wordAt; void segAt;

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean; side?: { phase: number; mirror: boolean; stride?: number };
  /** hands in metres from the feet (x = to the card's right, y = up); the tool sits in the right hand */
  hold?: { r?: [number, number]; l?: [number, number]; tool?: "hammer" | "torch"; swing?: number;
    /** the hammer head lands on this point in the world when k = 1 and is raised at k = 0; the hand follows the grip */
    strike?: { at: V3; k: number };
    /** the left hand rests on this point in the world */
    lw?: V3 };
  /** marching on the spot of the card: phase 0..1 */
  march?: number };
type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
type Card = { kind: "spark" | "chip"; p: V3; spin: number; s: number };
export type St3 = {
  light: "day" | "golden" | "grey" | "night"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; wipe?: { color: string; a: number }; subjects?: [string, V3, number][];
  army?: { adv: number; march: boolean } | null; breakK?: number; rain?: number; lamps?: number; fuse?: number;
  puffs?: Puff[]; cards?: Card[]; pegDrop?: number; ball?: V3;
  /** an explosion at a point, t seconds ago: soldiers near it fall outward */
  blast?: { at: V3; t: number };
};

// ---------------- helpers ----------------
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const expo = (u: number) => { const x = clamp01(u); return x >= 1 ? 1 : 1 - Math.pow(2, -9 * x); };
const rad = (d: number) => (d * Math.PI) / 180;
const L3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
type Shot = Partial<Cam> & { pos: V3; look: V3 };
const full = (c: Shot): Cam => ({ fov: 42, roll: 0, ...c });
const mix = (a: Cam, b: Cam, k: number): Cam => ({ pos: L3(a.pos, b.pos, k), look: L3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k });
/** travel from setup a to setup b between f0 and f1, then keep creeping toward the subject so nothing is ever still */
const move = (a: Shot, b: Shot, f: number, f0: number, f1: number, ease: (u: number) => number = expo, creep = 0.0012): Cam => {
  const c = mix(full(a), full(b), ease((f - f0) / Math.max(1, f1 - f0)));
  const k = 1 - Math.exp(-creep * Math.max(0, f - f1));
  return { ...c, pos: L3(c.pos, c.look, k) };
};
/** circle a point: angle a (degrees, 0 = camera on the -z side, + = toward +x), radius r, camera height h above the centre */
const orb = (c: V3, a: number, r: number, h: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [c[0] + r * Math.sin(rad(a)), c[1] + h, c[2] - r * Math.cos(rad(a))], look: c, ...rest });
const orbit = (s: ShotDef, f: number, c: V3, a: [number, number], r: [number, number], h: [number, number], fov = 46, roll: [number, number] = [0.05, -0.04], ease = smooth): Cam => {
  const u = ease((f - s.a) / Math.max(1, s.b - s.a));
  return full(orb(c, a[0] + (a[1] - a[0]) * u, r[0] + (r[1] - r[0]) * u, h[0] + (h[1] - h[0]) * u, { fov, roll: roll[0] + (roll[1] - roll[0]) * u }));
};
/** snap zoom: used on a cut. Starts further back and wider, lands in n frames, then creeps in */
const snap = (pos: V3, look: V3, f: number, f0: number, rest: Partial<Cam> = {}, back = 1.5, n = 5): Cam => {
  const far: V3 = [look[0] + (pos[0] - look[0]) * back, look[1] + (pos[1] - look[1]) * back, look[2] + (pos[2] - look[2]) * back];
  const fov = rest.fov ?? 42;
  return move({ pos: far, look, ...rest, fov: fov * 1.25 }, { pos, look, ...rest, fov }, f, f0, f0 + n, expo, 0.0015);
};
/** 7-frame camera kick at frame f0 */
const kick = (c: Cam, f: number, f0: number, k = 1): Cam => {
  if (f < f0 || f >= f0 + 7) return c;
  const e = f - f0, s = (e % 2 ? -1 : 1) * k * (1 - e / 7), d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const a = 0.012 * Math.max(1.2, Math.min(40, d));
  return { ...c, pos: [c.pos[0], c.pos[1] + a * s, c.pos[2] + 0.6 * a * s], roll: c.roll + 0.014 * s };
};
const t = (f: number) => f / FPS;
const U = (s: ShotDef, f: number) => clamp01((f - s.a) / Math.max(1, s.b - s.a));
const W = (seg: number, w: string) => wordAt(seg, w);
const P = (who: string, p: V3, expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => ({ who, p, expr, look, ...extra });
const pop = (f: number, f0: number, dur = 9) => { const u = clamp01((f - f0) / dur); if (u <= 0) return 0; const s = 2.38, x = u - 1; return 1 + (s + 1) * x * x * x + s * x * x; };
/** someone walking along x from x0 at v m/s (side card) */
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", k = 0): Person3 => {
  const d = Math.abs(v) * tt + k * 0.37;
  return { who, p: [x0 + v * tt, y, z], expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: 0.8 } };
};



const S = (x: number, y: number, z: number): V3 => [x, y, z];
const fusePath = new THREE.CatmullRomCurve3(FUSE.map((p) => new THREE.Vector3(...p)));
const fuseAt = (k: number): V3 => { const p = fusePath.getPointAt(clamp01(k)); return [p.x, p.y, p.z]; };
const bounce = (u: number) => { const x = clamp01(u); return x >= 1 ? 1 : 1 - Math.pow(2, -8 * x) * Math.cos(x * 9); };
const SHOCK: Expr[] = ["shock", "nervous", "shock", "dazed", "shock", "pained"];

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // the scout leads hundreds of soldiers down the hillside; the camera backs away in front of him and rises to show them all
  army: (s, f) => { const tt = t(f - s.a), adv = 8 + 2.4 * tt, sz = ARMY_Z - adv - 4.5, gy = groundH(1.0, sz, false);
    return { light: "day", dof: 0, army: { adv, march: true },
      cam: move({ pos: S(1.5, gy + 0.75, sz - 3.3), look: S(0.9, gy + 2.3, sz + 18), fov: 52, roll: 0.07 }, { pos: S(2.6, gy + 4.6, sz - 6.5), look: S(0.2, gy + 1.6, sz + 16), fov: 48, roll: -0.03 }, f, s.a + 8, s.b, smooth, 0),
      people: [P("scout", S(1.0, gy, sz), "grin", 0, { march: (tt * 1.9) % 1 })],
      // dust rising behind the last ranks only
      puffs: Array.from({ length: 12 }, (_, k) => { const x = -24 + k * 4.4 + Math.sin(tt * 1.3 + k), z = ARMY_Z - adv + 34 + (k % 3) * 3; return { p: S(x, groundH(x, z, false) + 1.5, z), s: 7 + (k % 3) * 2, c: [0.72, 0.64, 0.48] as [number, number, number], a: 0.3 }; }) }; },
  // the carpenter drives a peg into the frame: the hammer head comes down on the peg, the peg goes in a little each time
  work: (s, f) => { const tt = t(f - s.a), cyc = (tt * 2.0) % 1, n = Math.floor(tt * 2.0 + 0.3), m = Math.floor(tt * 2.0);
    const k = cyc < 0.42 ? 1 - smooth(cyc / 0.42) : cyc < 0.56 ? 0 : cyc < 0.7 ? Math.pow((cyc - 0.56) / 0.14, 2) : 1, hit = cyc >= 0.7 && cyc < 0.86;
    const drop = Math.min(0.4, 0.085 * (cyc < 0.7 ? m : m + Math.min(1, (cyc - 0.7) / 0.07))), peg: V3 = S(WORK[0] + 0.6, 1.62 - drop, WORK[2]);
    return { light: "day", dof: 5, closeup: true, pegDrop: drop,
      cam: kick(move({ pos: S(WORK[0] + 3.2, 2.6, WORK[2] + 5.8), look: S(WORK[0] + 0.25, 1.45, WORK[2] - 0.3), fov: 46, roll: 0.08 }, { pos: S(WORK[0] + 1.5, 2.2, WORK[2] + 3.1), look: S(WORK[0] + 0.3, 1.5, WORK[2] - 0.3), fov: 46, roll: -0.03 }, f, s.a, s.a + 22, expo, 0.0012), f, s.a + 16, 0.6),
      people: [P("carp", S(WORK[0] - 0.5, 0, WORK[2] - 0.62), "stern", 1, { hold: { tool: "hammer", strike: { at: peg, k }, lw: S(WORK[0] - 0.55, 1.22, WORK[2] - 0.25) } }),
        P("chief", S(WORK[0] + 2.0, 0, WORK[2] - 0.8), tt > 1.6 ? "pained" : "stern", -1)],
      cards: [...(hit ? [{ kind: "spark" as const, p: S(peg[0], peg[1] + 0.02, peg[2] + 0.05), spin: n, s: 0.34 }] : []),
        ...(cyc >= 0.7 ? Array.from({ length: 6 }, (_, q) => { const u = (cyc - 0.7) / 0.3, a = q * 1.05 + n; return { kind: "chip" as const, p: S(peg[0] + Math.cos(a) * 0.7 * u, peg[1] + 0.9 * u - 1.6 * u * u, peg[2] + 0.25 + Math.sin(a) * 0.35 * u), spin: tt * 9 + q, s: 0.12 }; }) : [])] }; },
  // the lawn round the carpenter cracks into rough chunks of earth that sink and tilt, leaving him on an island (a moat)
  break: (s, f) => { const hit = s.a + 20, k = f < hit ? 0 : bounce((f - hit) / 30), tt = t(f - hit);
    return { light: "day", dof: 0, breakK: k,
      cam: kick(move({ pos: S(PATCH[0] - 2.4, 2.4, PATCH[1] + 7.6), look: S(PATCH[0], 1.0, PATCH[1]), fov: 46, roll: -0.07 }, { pos: S(PATCH[0] + 2.6, 4.4, PATCH[1] + 7.4), look: S(PATCH[0], 0.2, PATCH[1] - 0.8), fov: 46, roll: 0.04 }, f, hit - 2, s.b, smooth, 0), f, hit, 1.6),
      people: [P("carp", S(PATCH[0], 0, PATCH[1]), f < hit ? "neutral" : "nervous", 0),
        ...["chief", "c3", "c8", "c13", "c21", "c30"].map((n, i) => P(n, S(PATCH[0] - 4.2 + i * 1.7, 0, PATCH[1] - 5.6 - (i % 2) * 0.5), f < hit ? (i === 0 ? "stern" : "neutral") : SHOCK[i], 0, { wave: f >= hit && i % 2 ? 0.8 : undefined, extra: true }))],
      // crumbs of earth and a little brown dust out of the cracks, gone in a second
      cards: f >= hit && tt < 0.9 ? Array.from({ length: 14 }, (_, i) => { const a = i * 0.45 + 0.2, r = 1.3 + (i % 2) * 2.2, u = tt / 0.9; return { kind: "chip" as const, p: S(PATCH[0] + Math.cos(a) * r, 0.1 + 1.3 * u - 2.2 * u * u, PATCH[1] + Math.sin(a) * r), spin: tt * 8 + i, s: 0.14 }; }) : [],
      puffs: f >= hit && tt < 1.3 ? Array.from({ length: 12 }, (_, i) => { const a = i * 0.52, r = i % 2 ? 1.35 : 3.5; return { p: S(PATCH[0] + Math.cos(a) * r, -0.3 + 0.7 * Math.min(1, tt * 3), PATCH[1] + Math.sin(a) * r), s: 0.6 + 0.7 * tt, c: [0.3, 0.24, 0.17] as [number, number, number], a: Math.max(0, 0.38 * (1 - tt / 1.3)) }; }) : [] }; },
  // the same yard on a rainy night: lanterns glow and light the ground under them
  rain: (s, f) => ({ light: "night", dof: 3, rain: 1, lamps: 1,
    cam: orbit(s, f, S(LAMPS[2][0] + 0.9, 1.7, LAMPS[2][2] + 0.4), [150, 196], [7.6, 6.0], [0.3, 0.9], 44, [0.07, -0.05]),
    people: [P("carp", S(LAMPS[2][0] + 1.5, 0, LAMPS[2][2] + 0.5), "nervous", -1, { headTilt: 0.08 }), P("c5", S(-3.6, 0, -12.6), "stern", 1, { extra: true }), P("c11", S(3.6, 0, -12.6), "neutral", -1, { extra: true })],
    subjects: [["the lantern", LAMPS[2], 0.4]] }),
  // the camera rides the burning fuse from the torch, then swings out to see it reach the cannon
  fuse: (s, f) => { const k = smooth((f - s.a - 14) / (s.b - s.a - 30)), tt = t(f - s.a), lit = f > s.a + 12, p = fuseAt(k);
    const rideAt = (kk: number): Shot => { const a = fuseAt(kk), q = fuseAt(kk + 0.07), b = fuseAt(kk - 0.05); return { pos: S(b[0] + (b[0] - q[0]) * 1.1 + 0.35, a[1] + 0.6, b[2] + (b[2] - q[2]) * 1.1), look: S(q[0], q[1] + 0.1, q[2]), fov: 58, roll: 0.06 * Math.sin(tt * 2.2) }; };
    const side: Shot = { pos: S(GUN[0] - 6.2, 1.9, GUN[2] + 4.4), look: S(GUN[0], 1.05, GUN[2] + 0.9), fov: 46, roll: -0.05 };
    const ride = rideAt(Math.min(k, 0.8)), boom = clamp01((f - (s.b - 9)) / 9);
    return { light: "day", dof: k < 0.8 ? 4 : 1, fuse: lit ? k : 0, focus: k < 0.8 ? p : S(GUN[0], 1, GUN[2] + 0.5),
      cam: f < s.a + 14 ? move({ pos: S(4.0, 1.5, 12.0), look: S(0.9, 1.15, 8.2), fov: 46, roll: -0.06 }, ride, f, s.a + 6, s.a + 14, smooth, 0)
        : k < 0.8 ? full(ride) : move(rideAt(0.8), side, f, s.b - 34, s.b - 14, smooth, 0),
      people: f > s.a + 15 ? [] : [P("chief", S(0.75, 0, 8.3), lit ? "grin" : "stern", 1, { hold: { r: [0.42, lit ? 0.62 : 1.0], tool: "torch", swing: lit ? -1.9 : -0.5 } })],
      cards: lit && k < 1 ? [{ kind: "spark", p: S(p[0], p[1] + 0.1, p[2]), spin: tt * 14, s: 0.36 + 0.08 * Math.sin(tt * 30) }] : boom > 0 ? [{ kind: "spark", p: S(GUN[0], 1.35, GUN[2] + 1.5), spin: tt * 20, s: 0.8 + 1.6 * boom }] : [],
      puffs: [...(lit && k < 1 ? Array.from({ length: 10 }, (_, i) => { const kk = k - 0.01 * (i + 1), pp = fuseAt(kk); return { p: S(pp[0], pp[1] + 0.14 + 0.07 * i, pp[2]), s: 0.2 + 0.06 * i, c: [0.55, 0.55, 0.6] as [number, number, number], a: kk > 0 ? 0.4 - 0.036 * i : 0 }; }) : []),
        ...(boom > 0 ? Array.from({ length: 8 }, (_, i) => ({ p: S(GUN[0] + Math.sin(i * 2.1) * 0.5 * boom, 1.35 + Math.cos(i * 1.7) * 0.4 * boom, GUN[2] + 1.6 + 1.6 * boom * (0.4 + (i % 4) * 0.2)), s: 0.5 + 1.3 * boom, c: (i % 2 ? [1.5, 0.9, 0.35] : [0.8, 0.8, 0.82]) as [number, number, number], a: 0.7 })) : [])] }; },
  // one cannon, one ball: it arcs over the field on a thin trail of smoke and lands in front of the army; the carpenter doesn't flinch
  volley: (s, f) => { const tt = t(f - s.a), dur = 1.5, u = clamp01(tt / dur), land = tt - dur;
    const A: V3 = S(GUN[0], 1.45, GUN[2] + 1.6), T: V3 = S(3.5, groundH(3.5, ARMY_Z - 10, false) + 0.3, ARMY_Z - 10);
    const at = (v: number): V3 => [A[0] + (T[0] - A[0]) * v, A[1] + (T[1] - A[1]) * v + 46 * v * (1 - v), A[2] + (T[2] - A[2]) * v];
    const puffs: Puff[] = [], cards: Card[] = [];
    // smoke hanging at the muzzle
    for (let i = 0; i < 7; i++) puffs.push({ p: S(GUN[0] + Math.sin(i * 2.1) * 0.5 - 0.3 * tt, 1.5 + 0.25 * i * Math.min(1, tt) + 0.3 * tt, GUN[2] + 1.9 + 0.4 * i), s: 0.6 + 0.25 * i + 0.4 * tt, c: [0.82, 0.82, 0.85], a: Math.max(0, 0.45 - 0.2 * tt) });
    // the ball's trail: thin, close-packed, fading with age
    if (u > 0.02) for (let j = 0; j < 70; j++) { const v = u - 0.5 * (j / 70) * Math.min(1, u * 2.5); if (v <= 0.02) continue; const age = j / 70; puffs.push({ p: at(v), s: 0.9 + 1.5 * age, c: [0.9, 0.9, 0.93], a: Math.max(0, (0.5 - 0.42 * age) * (land > 0 ? Math.max(0, 1 - land * 2) : 1)) }); }
    // one explosion where it lands: a flash, flying earth, a rising column of dark smoke
    if (land > 0) { const g = Math.min(1, land * 4);
      puffs.push({ p: S(T[0], T[1] + 1.5, T[2]), s: 9 * g + 3, c: [1.9, 1.1, 0.4], a: Math.max(0, 1 - land * 2.4), add: true });
      for (let i = 0; i < 30; i++) { const a = i * 0.9, r = (0.6 + (i % 5) * 0.9) * g; puffs.push({ p: S(T[0] + Math.cos(a) * r * 1.6, T[1] + 0.8 + (i % 5) * 1.1 * g + 2.2 * land, T[2] + Math.sin(a) * r), s: 2.0 + 2.2 * g + 1.2 * land, c: (i % 3 === 0 ? [1.3, 0.6, 0.15] : i % 3 === 1 ? [0.2, 0.18, 0.18] : [0.36, 0.28, 0.2]) as [number, number, number], a: Math.max(0, (i % 3 === 0 ? 1 - land * 1.4 : 1 - land * 0.28)) }); }
      if (land < 0.8) for (let i = 0; i < 12; i++) { const a = i * 0.55, w = land / 0.8; cards.push({ kind: "chip", p: S(T[0] + Math.cos(a) * 5 * w, T[1] + 7 * w - 7 * w * w + 0.3, T[2] + Math.sin(a) * 3 * w), spin: tt * 10 + i, s: 0.45 }); } }
    return { light: "day", dof: 0, army: { adv: 14, march: false }, ball: u < 1 ? at(u) : undefined, blast: land > 0 ? { at: T, t: land } : undefined,
      cam: kick(move({ pos: S(5.6, 1.5, 15.5), look: S(5.0, 9, 30), fov: 56, roll: 0.09 }, { pos: S(5.9, 2.2, 16.2), look: S(3.6, 2.6, 40), fov: 50, roll: -0.03 }, f, s.a, s.a + 50, smooth, 0), f, s.a + Math.round(dur * FPS), 2.2),
      people: [P("carp", S(5.0, 0, 20.4), "smile_closed", 0)], puffs, cards }; },
};

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * Math.min(d, 60), id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
export const whipAt = (s: ShotDef, f: number) => (s.g === "army" || s.g === "volley" ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
void W; void U; void pop; void walker; void orb;
