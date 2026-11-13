// Kit 2 test: six short shots, one per new capability, each with the house moving camera.
import * as THREE from "three";
import { Expr } from "../bridge/toon";
import { V3, FPS, PATCH, WORK, GUN, LAMPS, FUSE, ARMY_Z, groundH } from "./place";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d"; s: number };
const LEN: [string, number, string][] = [["army", 84, "an army"], ["work", 84, "hands on tools"], ["break", 84, "the ground breaks"], ["rain", 78, "rain and lanterns"], ["fuse", 96, "ride the fuse"], ["volley", 96, "all at once"]];
export const SHOTS: ShotDef[] = []; { let a = 0; LEN.forEach(([g, n], i) => { SHOTS.push({ id: i + 1, g, a, b: a + n, k: "3d", s: i }); a += n; }); }
export const LABELS = LEN.map((l) => l[2]);
export const TOTAL = SHOTS[SHOTS.length - 1].b;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
const wordAt = (_s: number, _w: string) => 0, segAt = (_s: number) => 0; void wordAt; void segAt;

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean; side?: { phase: number; mirror: boolean; stride?: number };
  /** hands in metres from the feet (x = to the card's right, y = up); the tool sits in the right hand */
  hold?: { r?: [number, number]; l?: [number, number]; tool?: "hammer" | "torch"; swing?: number } };
type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
type Card = { kind: "spark" | "chip"; p: V3; spin: number; s: number };
export type St3 = {
  light: "day" | "golden" | "grey" | "night"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; wipe?: { color: string; a: number }; subjects?: [string, V3, number][];
  army?: { adv: number; march: boolean } | null; breakK?: number; rain?: number; lamps?: number; fuse?: number;
  puffs?: Puff[]; cards?: Card[];
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
  // hundreds of soldiers coming down the hillside; one grinning scout low in the foreground
  army: (s, f) => { const tt = t(f - s.a), adv = 17 + 2.6 * tt;
    return { light: "day", dof: 2, focus: S(1.15, 1.5, 26), army: { adv, march: true },
      cam: move({ pos: S(1.4, 0.55, 23.2), look: S(0, 3.2, 60), fov: 52, roll: 0.07 }, { pos: S(2.0, 2.9, 20.5), look: S(0, 2.2, 62), fov: 48, roll: -0.03 }, f, s.a + 6, s.b, smooth, 0),
      people: [P("scout", S(1.15, 0, 26.0), "grin", 0)],
      puffs: Array.from({ length: 16 }, (_, k) => ({ p: S(-34 + k * 4.5 + 2 * Math.sin(tt + k), groundH(0, ARMY_Z - adv + (k % 4) * 7, false) + 1.2, ARMY_Z - adv - 2 + (k % 4) * 7), s: 9 + (k % 3) * 3, c: [0.86, 0.78, 0.6] as [number, number, number], a: 0.22 })) }; },
  // the carpenter hammers pegs into a frame: his hands are on the work, chips fly, one lands on the chief
  work: (s, f) => { const tt = t(f - s.a), cyc = (tt * 2.4) % 1, up = cyc < 0.6 ? Math.sin((cyc / 0.6) * Math.PI) : 0, hit = cyc > 0.58 && cyc < 0.78, hx = 0.34, n = Math.floor(tt * 2.4);
    const peg: V3 = S(WORK[0] + hx - 0.25 + 0.3 * ((n % 3)), 1.42, WORK[2]);
    return { light: "day", dof: 5, closeup: true,
      cam: kick(move({ pos: S(WORK[0] + 3.4, 2.2, WORK[2] + 5.8), look: S(WORK[0] + 0.2, 1.35, WORK[2] - 0.3), fov: 46, roll: 0.08 }, { pos: S(WORK[0] + 1.5, 1.55, WORK[2] + 2.9), look: S(WORK[0] + 0.3, 1.4, WORK[2] - 0.3), fov: 50, roll: -0.03 }, f, s.a, s.a + 22, expo, 0.0012), f, s.a + 16, 0.6),
      people: [P("carp", S(WORK[0] + 0.05, 0, WORK[2] - 0.62), "stern", 1, { hold: { r: [hx, 1.5 + 0.42 * up], l: [-0.36, 1.26], tool: "hammer", swing: -0.25 - 1.0 * up } }),
        P("chief", S(WORK[0] + 1.75, 0, WORK[2] - 0.75), tt > 1.6 ? "pained" : "stern", -1)],
      cards: [...(hit ? [{ kind: "spark" as const, p: peg, spin: n, s: 0.34 }] : []),
        ...Array.from({ length: 7 }, (_, k) => { const u = ((tt * 2.4 + k * 0.31) % 1), a = k * 0.9 + n; return { kind: "chip" as const, p: S(peg[0] + Math.cos(a) * 0.9 * u + (k === 0 ? 0.9 * u : 0), peg[1] + 1.1 * u - 1.9 * u * u + (k === 0 ? 0.5 * u : 0), peg[2] + 0.3 + Math.sin(a) * 0.4 * u), spin: tt * 9 + k, s: 0.16 }; })] }; },
  // a stomp, and the lawn drops away in blocks round the carpenter, like a moat. The onlookers stare.
  break: (s, f) => { const hit = s.a + 20, k = f < hit ? 0 : bounce((f - hit) / 26), tt = t(f - hit);
    return { light: "day", dof: 0, breakK: k,
      cam: kick(move({ pos: S(PATCH[0] - 1.5, 1.9, PATCH[1] + 8.2), look: S(PATCH[0], 1.1, PATCH[1]), fov: 46, roll: -0.07 }, { pos: S(PATCH[0] + 3.6, 7.4, PATCH[1] + 8.4), look: S(PATCH[0], 0.2, PATCH[1] - 0.6), fov: 46, roll: 0.04 }, f, hit - 2, s.b, smooth, 0), f, hit, 1.6),
      people: [P("carp", S(PATCH[0], 0, PATCH[1]), f < hit ? "neutral" : "nervous", 0),
        ...["chief", "c3", "c8", "c13", "c21", "c30"].map((n, i) => P(n, S(PATCH[0] - 4.2 + i * 1.7, 0, PATCH[1] - 5.6 - (i % 2) * 0.5), f < hit ? (i === 0 ? "stern" : "neutral") : SHOCK[i], 0, { wave: f >= hit && i % 2 ? 0.8 : undefined }))],
      puffs: f >= hit ? Array.from({ length: 14 }, (_, i) => { const a = i * 0.45, r = 1.9 + (i % 3) * 0.7; return { p: S(PATCH[0] + Math.cos(a) * r, 0.2 + 1.6 * tt, PATCH[1] + Math.sin(a) * r), s: 1.6 + 2.2 * tt, c: [0.62, 0.5, 0.36] as [number, number, number], a: Math.max(0, 0.5 - 0.3 * tt) }; }) : [] }; },
  // the same yard on a rainy night: lanterns glow and light the ground under them
  rain: (s, f) => ({ light: "night", dof: 3, rain: 1, lamps: 1,
    cam: orbit(s, f, S(LAMPS[2][0] + 0.9, 1.7, LAMPS[2][2] + 0.4), [150, 196], [7.6, 6.0], [0.3, 0.9], 44, [0.07, -0.05]),
    people: [P("carp", S(LAMPS[2][0] + 1.5, 0, LAMPS[2][2] + 0.5), "nervous", -1, { headTilt: 0.08 }), P("c5", S(-3.6, 0, -12.6), "stern", 1, { extra: true }), P("c11", S(3.6, 0, -12.6), "neutral", -1, { extra: true })],
    subjects: [["the lantern", LAMPS[2], 0.4]] }),
  // the camera rides the burning fuse from the torch to the cannon
  fuse: (s, f) => { const k = smooth((f - s.a - 14) / (s.b - s.a - 24)), p = fuseAt(k), q = fuseAt(k + 0.07), b = fuseAt(k - 0.05), tt = t(f - s.a), lit = f > s.a + 12;
    const ride: Shot = { pos: S(b[0] + (b[0] - q[0]) * 1.1 + 0.35, p[1] + 0.55, b[2] + (b[2] - q[2]) * 1.1), look: S(q[0], q[1] + 0.1, q[2]), fov: 58, roll: 0.06 * Math.sin(tt * 2.2) };
    return { light: "golden", dof: 4, fuse: lit ? k : 0, focus: p,
      cam: f < s.a + 14 ? move({ pos: S(3.6, 1.5, 11.4), look: S(1.3, 0.9, 8.1), fov: 42, roll: -0.06 }, ride, f, s.a + 6, s.a + 14, smooth, 0) : full(ride),
      people: [P("chief", S(0.75, 0, 8.3), lit ? "grin" : "stern", 1, { hold: { r: [0.42, lit ? 0.62 : 1.0], tool: "torch", swing: lit ? -1.9 : -0.5 } })],
      cards: lit && k < 1 ? [{ kind: "spark", p: S(p[0], p[1] + 0.1, p[2]), spin: tt * 14, s: 0.36 + 0.08 * Math.sin(tt * 30) }] : [],
      puffs: lit ? Array.from({ length: 10 }, (_, i) => { const kk = k - 0.012 * (i + 1), pp = fuseAt(kk); return { p: S(pp[0], pp[1] + 0.12 + 0.06 * i, pp[2]), s: 0.22 + 0.07 * i, c: [0.8, 0.8, 0.84] as [number, number, number], a: kk > 0 ? 0.5 - 0.045 * i : 0 }; }) : [] }; },
  // everything fires at once: smoke trails fill the sky and land on the army; the carpenter doesn't flinch
  volley: (s, f) => { const tt = t(f - s.a), fly = clamp01(tt / 1.5), boomT = tt - 1.45, N = 14, M2 = 13;
    const target: V3 = S(0, groundH(0, ARMY_Z - 14, false) + 1, ARMY_Z - 12);
    const trail = (i: number, u: number): V3 => { const tx = target[0] + (i - N / 2) * 4.4, tz = target[2] + (i % 3) * 5, x = GUN[0] + (tx - GUN[0]) * u + Math.sin(u * 9 + i) * 0.6 * (1 - u), z = GUN[2] + (tz - GUN[2]) * u; return [x, 1.2 + (target[1] - 1.2) * u + (20 + (i % 4) * 4) * 4 * u * (1 - u), z]; };
    const puffs: Puff[] = [];
    for (let i = 0; i < N; i++) { const head = clamp01(fly * (0.86 + (i % 5) * 0.04)); for (let j = 0; j < M2; j++) { const u = head * (j + 1) / M2; puffs.push({ p: trail(i, u), s: 0.35 + 2.4 * u + 0.5 * tt, c: [0.96, 0.96, 0.98], a: Math.max(0, 0.8 - 0.22 * Math.max(0, tt - 1.2)) }); } }
    if (boomT > 0) for (let i = 0; i < 26; i++) { const a = i * 2.4, r = (3 + (i % 5) * 2.6) * Math.min(1, boomT * 2.4 + 0.25), up = (i % 4) * 3 * Math.min(1, boomT * 2); puffs.push({ p: S(target[0] + Math.cos(a) * r * 2.1, target[1] + 1.5 + up + Math.sin(a) * 1.2, target[2] + Math.sin(a) * r), s: (4 + (i % 3) * 2) * (0.5 + Math.min(1, boomT * 2)), c: i % 3 === 0 ? [2.6, 2.1, 1.1] : i % 3 === 1 ? [1.9, 0.95, 0.3] : [1.2, 0.5, 0.16], a: Math.max(0, 0.7 - 0.25 * boomT), add: i % 3 === 0 }); }
    return { light: "day", dof: 2, army: { adv: 14, march: false }, fuse: 1, focus: S(9, 1.4, -6.5),
      cam: kick(move({ pos: S(11.6, 1.5, -11.6), look: S(8, 5, 6), fov: 56, roll: 0.09 }, { pos: S(10.2, 1.6, -11.2), look: S(6.5, 3.4, 10), fov: 50, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, s.a + 44, 1.8),
      people: [P("carp", S(9.3, 0, -8.2), "smile_closed", 0)], puffs }; },
};

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * Math.min(d, 60), id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
export const whipAt = (s: ShotDef, f: number) => (s.g === "army" || s.g === "volley" ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
void W; void U; void pop; void walker; void GUN; void orb;
