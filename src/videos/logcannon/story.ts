// The log cannon Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is ever still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots.
import { Expr } from "../bridge/toon";
import { V3, FPS, BARN, GUNF, GUN_YAW, TREE, BENCH, CAMP } from "./place";
import { SEG_TIMES, TOTAL, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0],
  ["aerial", A(1)], ["inside", W(1, "holed") - 2], ["fortress", W(1, "barn") - 2],
  ["walls", A(2)], ["ditch", W(2, "a") - 2], ["stakes", W(2, "sharpened") - 2],
  ["wash", A(3)], ["eighty", W(3, "with") - 2], ["nocannon", W(3, "and") - 2],
  ["musket", A(4)],
  ["point", A(5)],
  ["chop", A(6)], ["blacken", W(6, "blackened") - 2], ["wheels", W(6, "and") - 2],
  ["roll", A(7)], ["aim", W(7, "and") - 2],
  ["surrender", A(8)],
  ["slit", A(9)],
  ["checks", A(10)],
  ["door", A(11)], ["column", W(11, "more") - 2],
  ["noshot", A(12)],
  ["general", A(13)],
  ["end", A(14)],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
/** the log on its carriage: where the axle's middle is on the ground, which way the muzzle points (0 = toward -z) */
export type Gun = { p: V3; yaw: number; spin?: number; black?: number; wheels?: boolean };
export type Tool = { kind: "axe"; at: V3; k: number } | { kind: "brush" | "quill"; at: V3 };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  /** marching on the spot of the card: phase 0..1 */
  march?: number;
  /** hands rest on these points in the world (the thing they hold or lean on) */
  hw?: V3[];
  /** a hand held out, in metres from the feet on the card (x = to the card's right, y = up) */
  hold?: { r?: [number, number]; l?: [number, number] };
  /** the tool in the hand: an axe that lands on a point, or a brush / quill whose tip sits on a point */
  tool?: Tool };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type Card = { kind: "spark" | "chip"; p: V3; spin: number; s: number };
export type St3 = {
  light: "day" | "barn"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  gun?: Gun | null; col?: { adv: number; march: boolean } | null; door?: number; fell?: number;
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
const P = (who: string, p: V3, expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => ({ who, p, expr, look, ...extra });
const S = (x: number, y: number, z: number): V3 => [x, y, z];
const bounce = (u: number) => { const x = clamp01(u); return x >= 1 ? 1 : 1 - Math.pow(2, -8 * x) * Math.cos(x * 9); };
/** a point on the gun: lx = to its right, ly = up, lz = back from the axle (negative = toward the muzzle) */
export const gp = (g: Gun, lx: number, ly: number, lz: number): V3 => { const c = Math.cos(g.yaw), s = Math.sin(g.yaw); return [g.p[0] + lx * c + lz * s, g.p[1] + ly, g.p[2] - lx * s + lz * c]; };

/** the finished gun where it ends up, aimed at the door */
const GF: Gun = { p: GUNF, yaw: GUN_YAW, black: 1, wheels: true };
const washAtGun = (expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => P("wash", gp(GF, 0.5, 0, 0.78), expr, look, { hw: [gp(GF, 0.12, 1.15, 0.6)], ...extra });
const rugAtGun = (expr: Expr, extra: Partial<Person3> = {}): Person3 => P("rug", gp(GF, 1.0, 0, 2.3), expr, -1, { headTilt: -0.06, ...extra });
const WP: V3 = [1.7, 0, 6.6], WP2: V3 = [13.4, 0, 7.2];
/** the men inside the barn */
const INSIDE: [string, number, number, Expr, number][] = [
  ["l1", -3.0, -8.6, "nervous", 1], ["l2", -1.5, -8.7, "stern", 0], ["rug", 0, -8.5, "stern", 0], ["l3", 1.5, -8.7, "nervous", -1], ["l4", 3.0, -8.6, "stern", -1],
  ["l5", -3.8, -10.1, "stern", 1], ["l6", -2.3, -10.2, "nervous", 0], ["l7", -0.8, -10.1, "stern", 0], ["l8", 0.8, -10.2, "nervous", 0], ["l9", 2.3, -10.1, "stern", -1], ["l10", 3.8, -10.2, "nervous", -1],
  ["l11", -3.0, -11.6, "stern", 0], ["l12", -1.0, -11.6, "nervous", 0], ["l13", 1.0, -11.6, "stern", 0], ["l14", 3.0, -11.6, "nervous", 0],
];
/** after the surrender: the door stands open and the men are lined up down the path */
const AFTER = { door: 1, col: { adv: 40, march: false }, fell: 1 };
const HOOK_C = gp(GF, 0.25, 0.8, 0);
const hookCam = (a: number, r: number, h: number, roll: number, fov = 52): Cam => full(orb(HOOK_C, a, r, h, { fov, roll }));

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // hook: the black muzzle and the man with his hand on it; the camera swings round behind the log to face the fort
  hook: (s, f) => { const u = smooth((f - s.a) / (s.b - s.a));
    return { light: "day", dof: 2, gun: GF, ...AFTER, focus: gp(GF, 0, 0.9, 0),
      cam: hookCam(27 - 167 * u, 3.9 + 0.7 * u, 0.55 + 0.6 * u, 0.06 - 0.1 * u, 52 + 5 * u),
      people: [washAtGun("grin"), rugAtGun("pained", { extra: true })] }; },
  // the fort from the air: barn, ditch and the ring of stakes, Washington's men drawn up outside
  aerial: (s, f) => ({ light: "day", dof: 0, gun: null,
    cam: orbit(s, f, S(0, 0, -7), [212, 172], [36, 28], [30, 22], 56, [0.05, -0.03]),
    people: [P("wash", WP, "stern", 0, { extra: true })] }),
  // inside: the loyalists packed in the dark
  inside: (s, f) => ({ light: "barn", dof: 2, gun: null, focus: S(0, 1.4, -8.6),
    cam: snap(S(0.5, 1.7, -5.75), S(0, 1.3, -9.6), f, s.a, { fov: 52, roll: 0.04 }, 1.06),
    people: INSIDE.map(([n, x, z, e, l], i) => P(n, S(x, 0, z), e, l, { extra: i > 4 })) }),
  // low under the wall, looking up at it over the stakes
  fortress: (s, f) => ({ light: "day", dof: 0, gun: null,
    cam: move({ pos: S(9.4, 0.5, 4.4), look: S(1.5, 2.3, -6), fov: 52, roll: 0.07 }, { pos: S(8.2, 1.0, 3.4), look: S(0.8, 2.9, -7), fov: 48, roll: 0.02 }, f, s.a, s.b, smooth, 0) }),
  walls: (s, f) => ({ light: "day", dof: 3, gun: null, focus: S(-4, 1.7, -5),
    cam: move({ pos: S(-8.0, 1.0, -3.1), look: S(-3, 1.7, -5.1), fov: 48, roll: -0.06 }, { pos: S(-7.2, 1.7, -3.4), look: S(-1, 2.0, -5.1), fov: 48, roll: 0.02 }, f, s.a, s.b, smooth, 0) }),
  ditch: (s, f) => ({ light: "day", dof: 1, gun: null,
    cam: move({ pos: S(-10.6, 2.7, 1.8), look: S(-4, -0.9, -1.7), fov: 52, roll: 0.06 }, { pos: S(-7.5, 2.1, 1.3), look: S(-1, -0.9, -1.8), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0) }),
  stakes: (s, f) => ({ light: "day", dof: 3, gun: null, focus: S(4.9, 0.9, 1.2),
    cam: snap(S(4.3, 0.8, 3.3), S(4.9, 0.85, 0.7), f, s.a, { fov: 46, roll: -0.07 }, 1.9, 6) }),
  // Washington, the fort behind him
  wash: (s, f) => ({ light: "day", dof: 3, gun: null, focus: S(WP[0], 1.5, WP[2]),
    cam: snap(S(3.0, 1.0, 9.9), S(1.75, 1.42, 6.6), f, s.a, { fov: 42, roll: 0.05 }, 1.35),
    people: [P("wash", WP, "stern", 0)] }),
  // his eighty men: the camera climbs off him to take in both blocks
  eighty: (s, f) => ({ light: "day", dof: 0, gun: null,
    cam: move({ pos: S(1.3, 1.6, 2.8), look: S(1.6, 1.2, 7), fov: 50, roll: -0.05 }, { pos: S(0, 13, -6.5), look: S(0, 0, 14), fov: 60, roll: 0.02 }, f, s.a, s.b, smooth, 0),
    people: [P("wash", WP, "stern", 0)] }),
  nocannon: (s, f) => ({ light: "day", dof: 4, gun: null, closeup: true, focus: S(WP[0], 1.6, WP[2]),
    cam: snap(S(2.5, 1.55, 9.2), S(1.72, 1.56, 6.6), f, s.a, { fov: 32, roll: -0.05 }, 1.5),
    people: [P("wash", WP, "pained", 0)] }),
  // a soldier and his musket in front of walls that don't care
  musket: (s, f) => { const tt = t(f - s.a);
    return { light: "day", dof: 2, gun: null, focus: S(-1.8, 1.4, 4.6),
      cam: move({ pos: S(-0.9, 1.0, 7.7), look: S(-1.7, 1.2, 4.6), fov: 44, roll: 0.06 }, { pos: S(-1.5, 0.7, 7.7), look: S(-1.65, 1.9, 2.0), fov: 46, roll: -0.02 }, f, s.a + 8, s.b, smooth, 0),
      people: [P("b1", S(-1.8, 0, 4.6), tt > 0.9 ? "pained" : "stern", 0, { headTilt: tt > 0.9 ? 0.08 : 0 })] }; },
  // "that one": he points, the camera whips up the pine
  point: (s, f) => { const pan = W(5, "pine") - 5;
    return { light: "day", dof: 1, gun: null, focus: S(WP2[0], 1.5, WP2[2]),
      cam: move({ pos: S(12.3, 1.25, 10.9), look: S(13.9, 1.5, 7.0), fov: 44, roll: -0.05 }, { pos: S(11.4, 1.2, 13.4), look: S(15.6, 3.9, 5.0), fov: 56, roll: 0.05 }, f, pan, pan + 12, expo, 0.0006),
      people: [P("wash", WP2, f < pan ? "stern" : "grin", 1, { hold: { r: [0.52, 1.45] } })],
      subjects: [["the pine", S(TREE[0], 4, TREE[2]), 1.5]] }; },
  // the axe goes in; the pine goes over, away from the axe
  chop: (s, f) => { const tt = t(f - s.a), per = 0.42, cyc = (tt / per) % 1, n = Math.floor(tt / per), fall = s.b - 16;
    const k = f >= fall ? 1 : cyc < 0.42 ? 1 - smooth(cyc / 0.42) : cyc < 0.56 ? 0 : cyc < 0.7 ? Math.pow((cyc - 0.56) / 0.14, 2) : 1, hit = f < fall + 3 && cyc >= 0.7 && cyc < 0.9;
    const at: V3 = S(TREE[0] - 0.26, 0.72, TREE[2] + 0.05), fk = f < fall ? 0 : Math.pow((f - fall) / 26, 2);
    let c = move({ pos: S(15.2, 1.1, 9.2), look: S(16.5, 0.45, 4.1), fov: 44, roll: 0.06 }, { pos: S(14.2, 1.3, 12.6), look: S(19.5, 3.0, 4.1), fov: 54, roll: -0.04 }, f, fall - 6, s.b - 4, smooth, 0);
    for (let q = 0; q <= n; q++) c = kick(c, f, s.a + Math.round((q + 0.7) * per * FPS), 0.8);
    return { light: "day", dof: 1, gun: null, fell: fk, cam: c, focus: S(TREE[0], 1.2, TREE[2]),
      people: [P("ax", S(TREE[0] - 1.15, 0, TREE[2] + 0.3), "stern", 1, { tool: { kind: "axe", at, k } })],
      cards: cyc >= 0.7 && f < fall + 8 ? Array.from({ length: 6 }, (_, q) => { const u = (cyc - 0.7) / 0.3, a = q * 1.05 + n; return { kind: "chip" as const, p: S(at[0] - 0.1 - Math.abs(Math.cos(a)) * 0.7 * u, at[1] + 0.9 * u - 1.6 * u * u, at[2] + 0.3 + Math.sin(a) * 0.3 * u), spin: tt * 9 + q, s: 0.13 }; }) : [],
      puffs: hit ? [] : [] }; },
  // the log on blocks: one end goes black under the brush
  blacken: (s, f) => { const g: Gun = { p: S(BENCH[0], -0.38, BENCH[2]), yaw: Math.PI / 2, black: smooth((f - s.a - 3) / Math.max(1, s.b - s.a - 8)), wheels: false };
    const dab = 0.05 * Math.sin(t(f - s.a) * 14);
    return { light: "day", dof: 3, gun: g, fell: 1, focus: gp(g, 0, 0.92, -1.6),
      cam: orbit(s, f, gp(g, 0, 1.05, -1.3), [205, 222], [5.6, 5.3], [0.5, 0.7], 44, [0.05, -0.03]),
      people: [P("br", S(BENCH[0] - 1.75, 0, BENCH[2] - 0.75), "stern", 1, { tool: { kind: "brush", at: gp(g, dab, 1.15, -1.55) } })],
      subjects: [["the black end", gp(g, 0, 0.92, -1.7), 0.3]] }; },
  // set down on its wheels
  wheels: (s, f) => { const u = (f - s.a) / 13, lift = 0.5 * (1 - bounce(u)), g: Gun = { p: S(BENCH[0], lift, BENCH[2]), yaw: Math.PI / 2, black: 1, wheels: true }, land = t(f - s.a - 5);
    return { light: "day", dof: 1, gun: g, fell: 1,
      cam: kick(orbit(s, f, S(BENCH[0] - 0.3, 0.75, BENCH[2]), [200, 170], [5.4, 4.7], [0.45, 0.8], 44, [0.05, -0.04]), f, s.a + 5, 1.2),
      people: [P("b2", S(BENCH[0] - 0.55, 0, BENCH[2] - 0.85), "grin", 0, { hw: [gp(g, 0, 1.15, -0.55)] }), P("b3", S(BENCH[0] + 0.4, 0, BENCH[2] - 0.85), "stern", 0, { hw: [gp(g, 0, 1.15, 0.4)] })],
      puffs: land > 0 && land < 0.8 ? Array.from({ length: 8 }, (_, i) => ({ p: S(BENCH[0] + (i < 4 ? -0.3 : 0.3) + (i % 4 - 1.5) * 0.25 * (1 + land), 0.15 + 0.25 * land, BENCH[2] + (i < 4 ? 0.75 : -0.75) + 0.3 * land * (i < 4 ? 1 : -1)), s: 0.4 + 0.5 * land, c: [0.62, 0.55, 0.42] as [number, number, number], a: Math.max(0, 0.4 * (1 - land / 0.8)) })) : [] }; },
  // rolled out like the real thing: the camera backs away in front of the muzzle
  roll: (s, f) => { const tt = t(f - s.a), d = 1.7 * tt, g = rollGun(d);
    return { light: "day", dof: 1, gun: g, fell: 1, focus: gp(g, 0, 0.92, -1.7),
      cam: move({ pos: S(g.p[0] + 0.7, 0.5, g.p[2] - 3.9), look: gp(g, 0, 0.9, -1.0), fov: 50, roll: 0.07 }, { pos: S(g.p[0] + 0.4, 0.75, g.p[2] - 3.5), look: gp(g, 0, 1.0, -1.0), fov: 48, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: pushers(g, tt), subjects: [["the muzzle", gp(g, 0, 0.92, -1.7), 0.3]] }; },
  // and aimed: it swings onto the door
  aim: (s, f) => { const k = 0.4 + 0.6 * smooth((f - s.a) / Math.max(16, s.b - s.a - 14)), g0 = rollGun(1.7 * t(SHOTS.find((x) => x.g === "aim")!.a - SHOTS.find((x) => x.g === "roll")!.a));
    const g: Gun = { p: L3(g0.p, GUNF, k), yaw: GUN_YAW * k, spin: (g0.spin ?? 0) + 9 * k, black: 1, wheels: true };
    return { light: "day", dof: 1, gun: g, fell: 1, focus: gp(g, 0, 0.9, 0),
      cam: move({ pos: S(-5.6, 2.6, 8.7), look: S(0.2, 0.6, 5.0), fov: 54, roll: -0.06 }, { pos: S(-6.6, 2.4, 8.6), look: S(-0.8, 0.5, -4), fov: 50, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("b3", gp(g, 0.9, 0, -0.95), "grin", 0, { hw: [gp(g, 0.2, 0.98, -0.95)] })] }; },
  // "surrender": low in front of the muzzle, the man beside it
  surrender: (s, f) => { const b = W(8, "blown") - 3;
    return { light: "day", dof: 3, gun: GF, fell: 1, focus: gp(GF, 0.5, 1.3, -1.1),
      cam: f < b ? snap(gp(GF, -1.1, 0.7, -4.3), gp(GF, 0.4, 1.0, -1.0), f, s.a, { fov: 48, roll: 0.07 }, 1.1)
        : kick(snap(gp(GF, -0.8, 0.9, -4.4), gp(GF, 0.45, 1.2, -1.0), f, b, { fov: 40, roll: -0.05 }, 1.15), f, b, 1.4),
      people: [P("wash", gp(GF, 0.78, 0, -1.1), "stern", 0, { hw: [gp(GF, 0.16, 1.1, -1.05)] })] }; },
  // from inside, through a gap in the logs: a black circle on wheels
  slit: (s, f) => { const u = smooth((f - s.a) / (s.b - s.a));
    return { light: "day", dof: 0, gun: GF, fell: 1,
      cam: full({ pos: S(0.5 - 0.25 * u, 1.5, -4.35), look: gp(GF, 0, -0.45 + 0.9 * u, -0.9), fov: 46 - 27 * u, roll: 0 }),
      people: [P("wash", gp(GF, 0.75, 0, 1.3), "stern", 0, { extra: true })] }; },
  // nobody wants to be the one who checks
  checks: (s, f) => { const c = W(10, "checks") - 3, tt = t(f - s.a), sw = Math.sin(tt * 5) > 0 ? 1 : -1;
    return { light: "barn", dof: 3, gun: GF, fell: 1, closeup: f >= c, focus: S(0, 1.5, -8.5),
      cam: f < c ? move({ pos: S(1.3, 1.45, -5.6), look: S(-0.1, 1.42, -8.6), fov: 46, roll: 0.05 }, { pos: S(0.5, 1.5, -5.7), look: S(0, 1.45, -8.6), fov: 42, roll: -0.03 }, f, s.a, c, smooth, 0)
        : kick(snap(S(0.25, 1.55, -6.6), S(0, 1.55, -8.5), f, c, { fov: 36, roll: -0.04 }, 1.4), f, c, 1.2),
      people: INSIDE.map(([n, x, z, e, l], i) => n === "rug" ? P(n, S(x, 0, z), f < c ? "nervous" : "shock", f < c ? sw : 0)
        : P(n, S(x, 0, z), i < 5 && f >= c ? "grin" : e, i < 5 ? (x < 0 ? 1 : -1) : l, { extra: i !== 1 && i !== 3 })) }; },
  // the door opens
  door: (s, f) => { const tt = t(f - s.a), adv = 1.3 + 1.5 * tt;
    return { light: "day", dof: 1, gun: GF, fell: 1, door: smooth((f - s.a - 1) / 12), col: { adv, march: true }, focus: S(0, 1.4, BARN.z1),
      cam: move({ pos: S(0.95, 0.7, 4.2), look: S(0, 1.5, -5), fov: 38, roll: -0.05 }, { pos: S(1.2, 0.95, 5.0), look: S(0, 1.25, -4.5), fov: 38, roll: 0.02 }, f, s.a, s.b, smooth, 0) }; },
  // more than a hundred men walk out, down the path between Washington's lines
  column: (s, f) => { const tt = t(f - s.a);
    return { light: "day", dof: 0, gun: GF, fell: 1, door: 1, col: { adv: 13 + 1.5 * tt, march: true },
      cam: move({ pos: S(6.6, 7.0, 15.5), look: S(-0.4, 0.6, 3.5), fov: 48, roll: 0.05 }, { pos: S(5.4, 5.2, 18.5), look: S(-0.4, 0.9, 4.5), fov: 48, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [washAtGun("grin")] }; },
  // not one shot fired: round to the back of the "cannon", where it is plainly a tree
  noshot: (s, f) => ({ light: "day", dof: 2, gun: GF, ...AFTER, focus: gp(GF, 0, 0.9, 0.4),
    cam: orbit(s, f, gp(GF, 0.25, 1.0, 0.1), [15, -140], [4.8, 4.5], [0.55, 0.85], 54, [-0.05, 0.04]),
    people: [washAtGun("grin")] }),
  // the British general hears, and writes one line
  general: (s, f) => { const u = (f - s.a) / (s.b - s.a);
    return { light: "day", dof: 3, gun: GF, ...AFTER, focus: S(CAMP[0], 1.3, CAMP[2] + 0.75),
      cam: move({ pos: S(CAMP[0] - 2.2, 1.6, CAMP[2] - 3.9), look: S(CAMP[0], 1.1, CAMP[2] + 0.6), fov: 44, roll: 0.05 }, { pos: S(CAMP[0] - 0.9, 1.45, CAMP[2] - 2.9), look: S(CAMP[0], 1.15, CAMP[2] + 0.6), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("corn", S(CAMP[0], 0, CAMP[2] + 0.75), u > 0.55 ? "grin" : "stern", 0, { headTilt: 0.05, tool: { kind: "quill", at: S(CAMP[0] - 0.12 + 0.3 * ((u * 3) % 1), 0.83, CAMP[2] + 0.12) } })] }; },
  // Rugeley, glum, beside the log that beat him; the camera comes back round to where the film began
  end: (s, f) => { const mid = W(14, "made") - 2, u = smooth((f - mid) / (s.b - mid - 4)), rp = gp(GF, 1.0, 1.45, 2.3);
    return { light: "day", dof: 2, gun: GF, ...AFTER, focus: f < mid ? rp : gp(GF, 0, 1.0, 0), closeup: f < mid,
      cam: f < mid ? snap(gp(GF, 2.6, 1.5, -0.6), rp, f, s.a, { fov: 40, roll: -0.05 }, 1.3) : hookCam(-40 + 67 * u, 4.3 - 0.4 * u, 0.9 - 0.35 * u, -0.03 + 0.09 * u),
      people: [washAtGun("grin", -1, { extra: f < mid }), rugAtGun("pained", { extra: f >= mid })] }; },
};
function rollGun(d: number): Gun { return { p: [0, 0, 12.4 - d], yaw: 0, spin: d / 0.62, black: 1, wheels: true }; }
function pushers(g: Gun, tt: number): Person3[] {
  const m = tt < 0 ? undefined : (tt * 1.9) % 1;
  return [P("b2", gp(g, -0.5, 0, 2.2), "stern", 0, { march: m, hw: [gp(g, -0.16, 1.05, 1.0)] }), P("b3", gp(g, 0.5, 0, 2.2), "grin", 0, { march: m === undefined ? undefined : (m + 0.5) % 1, hw: [gp(g, 0.16, 1.05, 1.0)] })];
}

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * Math.min(d, 60), id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["fortress", "eighty", "roll", "column", "end"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
/** the view through the gap in the logs (fractions of the frame height) */
export const slitAt = (f: number): { y: number; h: number } | null => { const s = shotAt(f); return s.g === "slit" ? { y: 0.36 + 0.004 * Math.sin(f * 0.19), h: 0.2 } : null; };

// ---------------- name tags and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
export const ITEMS = (): Item[] => ([
  { key: "sc", kind: "pill", text: "SOUTH CAROLINA", sub: "1780", f0: A(1) + 8, f1: B("aerial"), y: 13 },
  { key: "ww", kind: "pill", text: "WILLIAM WASHINGTON", sub: "George's cousin", f0: W(3, "william"), f1: B("wash"), y: 13, size: 58 },
  { key: "80", kind: "call", text: "80 MEN", f0: W(3, "80"), f1: B("eighty"), y: 13, fg: "#8fb8ff", size: 150 },
  { key: "nocannon", kind: "stamp", text: "NO CANNON", f0: W(3, "no"), f1: B("nocannon"), y: 16, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 112 },
  { key: "useless", kind: "stamp", text: "USELESS", f0: W(4, "useless") + 2, f1: B("musket"), y: 15, rot: 5, bg: "#e0332e", fg: "#ffffff", size: 128 },
  { key: "noshot", kind: "stamp", text: "0 SHOTS FIRED", f0: W(12, "shot"), f1: B("noshot"), y: 15, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 100 },
  { key: "corn", kind: "pill", text: "LORD CORNWALLIS", sub: "British general", f0: W(13, "british"), f1: B("general"), y: 13, size: 62 },
  { key: "rug", kind: "pill", text: "COLONEL RUGELEY", sub: "beaten by a log", f0: A(14) + 6, f1: TOTAL - 6, y: 13, size: 62 },
] as Item[]).filter((i) => i.f1 > i.f0);
