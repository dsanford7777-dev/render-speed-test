// The Frozen Graves Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen LEFT), unless a shot turns round.
import { Expr } from "../bridge/toon";
import { V3, FPS, Gv, Qy, Wd, Ct, Ak, Lb, CROSS_X, CROSS_Z, LID_Y, CUT, PIER, GANG, APIT, BENCH_Y, SCREEN, SCOPE, SET } from "./place";
import { SEG_TIMES, TOTAL, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["crosses", W(0, "7") - 2], ["virus", W(0, "because") - 2], ["alive", W(0, "alive") - 2],
  ["ship", A(1)], ["town", W(1, "tiny") - 2], ["sick", W(1, "nearly") - 2],
  ["week", A(2)], ["oldest", W(2, "oldest") - 2],
  ["frozen", A(3)], ["dynamite", W(3, "blast") - 2], ["boom", W(3, "dynamite") - 2],
  ["millions", A(4)], ["sample", W(4, "nobody") - 2],
  ["later", A(5)], ["flags", W(5, "4") - 2], ["radar", W(5, "ground") - 2], ["suits", W(5, "protective") - 2],
  ["plan", A(6) + 8], ["idea", W(6, "miners") - 2], ["solid", W(6, "virus") - 2],
  ["dig", A(7)], ["hit", W(7, "less") - 2],
  ["shallow", A(8)], ["layer", W(8, "above") - 2], ["summers", W(8, "for") - 2],
  ["gone", A(9)],
  ["plane", A(10)], ["hultin", W(10, "72") - 2], ["village", W(10, "village") - 2], ["shears", W(10, "garden") - 2],
  ["adig", A(11)], ["found", W(11, "found") - 2],
  ["mail", A(12)], ["inside", W(12, "inside") - 2], ["reveal", W(12, "found") - 2],
  ["town2", A(13)], ["end", W(13, "1950") - 2],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number;
  /** a white mask (protective suit) or a cloth (the sick) in front of the mouth */
  mask?: boolean;
  /** a cloth held to the mouth (1918) */
  cloth?: boolean;
  /** walking in profile: step phase 0..1; mirror = moving toward -x; carry = a point in the world both hands hold out to */
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 } };
export type Tool = { kind: "shovel" | "pick" | "shears" | "dynamite" | "quill"; g: V3; b: V3; s?: number };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "mask" | "virus" | "dead" | "flake" | "sun" | "spark" | "chunk" | "cloth";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type St3 = {
  light: "night" | "grey" | "twilight" | "quay" | "ward" | "cut" | "alaska" | "lab"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  tools?: Tool[]; cards?: Card[]; puffs?: Puff[];
  /** cemetery: snow on the ground, the pit open, the 1998 tent, the 1918 lanterns, the coffins in the pit, the crosses, a temporary pit floor, the field of crosses, the radar cart */
  snow?: boolean; dug?: boolean; tent?: boolean; lanterns?: boolean; coffins?: boolean; crosses?: boolean; fill?: number; field?: boolean; radar?: { p: V3; yaw: number } | null;
  /** quay: the ship's position along the pier (0 = moored) */
  shipZ?: number;
  /** ward: candles still lit, the calendar's day */
  candles?: number; day?: number;
  /** the cut: 1 = the top layer thawed, 0 = frozen; the hoped-for coffins six feet down */
  thaw?: number; ghosts?: boolean;
  /** Alaska: the plane (and its propeller), lab: the screen's result, the parcel, the empty jar */
  plane?: { p: V3; yaw: number; roll?: number } | null; spin?: number; done?: boolean; parcel?: { p: V3; yaw: number; tilt?: number; roll?: number; open: boolean } | null; jar?: boolean;
  book?: { p: V3; yaw: number; tilt?: number } | null; specimen?: V3 | null; duffel?: { p: V3; yaw: number; roll?: number } | null;
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
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", extra: Partial<Person3> = {}, carry?: (p: V3) => V3): Person3 => {
  const d = Math.abs(v) * tt, p: V3 = [x0 + v * tt, y, z];
  return { who, p, expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: Math.min(1.25, Math.abs(v) / 1.6), carry: carry ? carry(p) : undefined }, ...extra };
};
const add = (p: V3, x: number, y: number, z: number): V3 => [p[0] + x, p[1] + y, p[2] + z];
const breath = (p: V3, tt: number, k = 1): Puff[] => [0, 1].map((i) => { const u = (tt * 0.8 + i * 0.5) % 1; return { p: add(p, 0.08 + 0.2 * u, 0.05 * u, -0.1 - 0.15 * u), s: 0.12 + 0.3 * u, c: [0.9, 0.94, 1.0] as [number, number, number], a: 0.4 * (1 - u) * k }; });
/** earth thrown off a shovel or a pick: a spray of chunks along an arc */
const spray = (from: V3, to: V3, tt: number, n: number, rate = 1.6, s = 0.9): Card[] => Array.from({ length: n }, (_, i) => { const u = (tt * rate + i / n) % 1, p = L3(from, to, u); return { kind: "chunk" as const, p: [p[0] + 0.08 * Math.sin(i * 3), p[1] + 0.9 * Math.sin(Math.PI * u), p[2]] as V3, spin: u * 6 + i, s: s * (0.6 + 0.4 * ((i * 7) % 3) / 2) }; });

// ---------------- the cemetery as the shots use it ----------------
/** the hook digger: a scientist in a suit driving his shovel into the gravel in front of the second cross from the right */
const DIGGER: V3 = Gv(-1.75, 0, 1.0);
const digPose = (tt: number) => { const k = 0.5 + 0.5 * Math.sin(tt * 4.2), g = Gv(-1.42, 1.05 + 0.2 * k, 1.1), b = Gv(-1.1, 0.06 + 0.35 * k, 1.66);
  return { tool: { kind: "shovel" as const, g, b }, man: (expr: Expr) => P("sci2", DIGGER, expr, 1, { mask: true, hw: [g, L3(g, b, 0.42)] }), k, blade: b }; };
const HOOK_POS: V3 = Gv(-0.85, 0.95, -3.5), HOOK_LOOK: V3 = Gv(-0.95, 0.95, 1.8), HOOK = { fov: 50, roll: 0.05 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.05), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const hookState = (tt: number): Partial<St3> => { const d = digPose(tt);
  return { light: "grey", tent: true, dug: false, tools: [d.tool], people: [d.man("stern")], cards: spray(d.blade, add(d.blade, -0.9, 0.1, -0.2), tt, 4, 1.4, 0.7) }; };
/** a 1998 grave-side: the team round the pit */
const TEAM: [string, V3, Expr][] = [["lead", Gv(1.6, 0, 0.35), "stern"], ["sci1", Gv(-0.4, 0, 0.3), "neutral"], ["sci3", Gv(-2.4, 0, 0.4), "nervous"]];

// ---------------- the cut ----------------
const CZ = CUT.z - 0.06;
const viruses = (tt: number, y: number, k = 1, dead = false): Card[] => CROSS_X.flatMap((x, i) => [0, 1].map((j) => ({ kind: (dead ? "dead" : "virus") as CardKind, p: Ct(x + (j ? 0.1 : -0.1), y + 0.04 * Math.sin(tt * 3 + i + j * 2) + (j ? -0.06 : 0.05), CZ - 0.01 * j) as V3, spin: 0.2 * Math.sin(tt * 2 + i * 1.3 + j), s: 0.42 * k })));

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // they dug up seven dead miners: a shovel bites the gravel in front of the white crosses (frame 0 is already close)
  hook: (s, f) => ({ ...hookState(t(f)), light: "grey", dof: 2, closeup: true, focus: Gv(-1.4, 0.8, 1.4), cam: kick(hookCam(f), f, W(0, "dug"), 0.9), subjects: [["the shovel", Gv(-1.1, 0.25, 1.66), 0.3], ["a cross", Gv(0, 0.8, CROSS_Z), 0.3]] }),
  // seven: a low long-lens slide along the seven crosses inside the tent
  crosses: (s, f) => ({ light: "grey", tent: true, dug: false, dof: 2, focus: Gv(0, 0.75, CROSS_Z),
    cam: move({ pos: Gv(3.1, 0.75, -2.2), look: Gv(2.0, 0.7, CROSS_Z), fov: 36, roll: -0.05 }, { pos: Gv(-3.0, 0.8, -2.2), look: Gv(-1.9, 0.7, CROSS_Z), fov: 36, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    subjects: [["the seven crosses", Gv(0, 0.75, CROSS_Z), 0.4]] }),
  // the deadliest virus in history: the ground cut open, a virus waiting in every coffin
  virus: (s, f) => { const tt = t(f - s.a);
    return { light: "cut", thaw: 0, ghosts: false, dof: 1, focus: Ct(0, -0.95, CUT.z), key: Ct(-1.5, 3.4, CUT.z - 2.6),
      cam: move({ pos: Ct(0.6, 0.6, -7.2), look: Ct(0, -0.8, CUT.z), fov: 50, roll: 0.06 }, { pos: Ct(0.2, -0.4, -4.6), look: Ct(0, -0.95, CUT.z), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      cards: viruses(tt, LID_Y - 0.17, 0.9), subjects: [["a coffin", Ct(0, LID_Y - 0.17, CUT.z), 0.2]] }; },
  // might still be alive inside them: snap onto one virus, pulsing
  alive: (s, f) => { const tt = t(f - s.a), cards = viruses(tt, LID_Y - 0.17, 0.9); cards[6] = { ...cards[6], s: 0.5 + 0.06 * Math.sin(tt * 10) };
    return { light: "cut", thaw: 0, dof: 3, closeup: true, focus: Ct(0.1, LID_Y - 0.12, CUT.z), key: Ct(-1.5, 3.4, CUT.z - 2.6),
      cam: kick(snap(Ct(0.25, LID_Y - 0.02, -2.2), Ct(0.05, LID_Y - 0.15, CUT.z), f, s.a, { fov: 34, roll: -0.07 }, 1.6, 5), f, W(0, "alive"), 1.0), cards }; },
  // in 1918 a ship sailed into a tiny coal town: the Forsete comes in along the pier, smoking, through falling snow
  ship: (s, f) => { const u = smooth(U(s, f));
    return { light: "quay", shipZ: -16 * (1 - u), dof: 0, focus: Qy(6.4, 4, -10),
      cam: move({ pos: Qy(-1.0, 2.3, -34), look: Qy(5.5, 4.2, -12), fov: 56, roll: 0.06 }, { pos: Qy(-1.6, 4.6, -31), look: Qy(6.0, 4.6, -8), fov: 50, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the ship", Qy(6.4, 3.5, -10 - 16 * (1 - u)), 2]] }; },
  // ...near the North Pole: past the signpost on the pier to the snowy town
  town: (s, f) => ({ light: "quay", dof: 1, focus: Qy(-1.4, PIER.y + 2.2, 2.94),
    cam: move({ pos: Qy(-0.3, PIER.y + 2.0, -1.6), look: Qy(-1.45, PIER.y + 2.15, 2.94), fov: 46, roll: -0.06 }, { pos: Qy(0.3, PIER.y + 2.4, -2.6), look: Qy(-1.6, PIER.y + 2.6, 8), fov: 54, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the signpost", Qy(-1.4, PIER.y + 2.25, 2.94), 0.4]] }),
  // nearly everyone on board was sick: the men come down onto the pier coughing, a cloth to the mouth
  sick: (s, f) => { const tt = t(f - s.a), y = PIER.y, mouth = (p: V3): V3 => add(p, 0.1, 1.3, -0.12);
    const men: [string, V3, Expr][] = [["sick1", Qy(1.6, y, -8.4), "pained"], ["sick2", Qy(0.6, y, -9.3), "dazed"], ["sick3", Qy(1.15, y, -10.6), "pained"]];
    return { light: "quay", dof: 2, focus: Qy(1.0, y + 1.3, -9.4),
      cam: move({ pos: Qy(0.4, y + 1.6, -15.8), look: Qy(1.1, y + 1.35, -9.0), fov: 42, roll: 0.05 }, { pos: Qy(0.9, y + 1.5, -15.2), look: Qy(1.1, y + 1.3, -9.2), fov: 40, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [...men.map(([w, p, e], i) => P(w, add(p, 0, 0, -0.25 * tt), e, -1, { cloth: true, hw: [mouth(add(p, 0, 0, -0.25 * tt))], march: (tt * 0.9 + i * 0.3) % 1 }))],
      puffs: men.flatMap(([, p], i) => breath(add(p, 0, 1.3, -0.25 * tt), tt + i * 0.3, 0.8)) }; },
  // within a week, seven young men were dead: along the seven beds, the candles go out one by one; the calendar turns
  week: (s, f) => { const u = U(s, f);
    return { light: "ward", candles: 7 - Math.floor(clamp01(u * 1.12) * 7.0), day: 1 + Math.floor(u * 6.99), dof: 2, focus: Wd(0, 0.8, 3.2), key: Wd(0, 2.35, 0.6),
      cam: move({ pos: Wd(4.3, 1.35, -0.9), look: Wd(3.0, 0.85, 3.2), fov: 44, roll: -0.05 }, { pos: Wd(-4.3, 1.35, -0.9), look: Wd(-3.0, 0.85, 3.2), fov: 44, roll: 0.05 }, f, s.a, s.b, (x) => x, 0),
      subjects: [["the beds", Wd(0, 0.6, 3.2), 0.3]] }; },
  // the oldest was twenty-eight: the nurse writes the last name in the register
  oldest: (s, f) => { const tt = t(f - s.a), bk = Wd(0.45, 1.08, 0.28), pen: V3 = add(bk, -0.08 + 0.05 * Math.sin(tt * 9), 0.06, -0.02);
    return { light: "ward", candles: 0, day: 7, dof: 2, focus: Wd(0.5, 1.3, 0.5), key: Wd(0, 2.35, 0.6),
      cam: move({ pos: Wd(-0.6, 1.5, -2.7), look: Wd(0.45, 1.3, 0.55), fov: 40, roll: 0.05 }, { pos: Wd(-0.3, 1.5, -2.4), look: Wd(0.45, 1.3, 0.5), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("nurse", Wd(0.5, 0, 0.75), "nervous", -1, { hw: [add(bk, 0.15, 0, 0), pen] })], book: { p: bk, yaw: 0, tilt: -0.95 }, tools: [{ kind: "quill", g: add(pen, 0.04, 0.1, 0), b: pen }],
      subjects: [["the register", bk, 0.15]] }; },
  // the ground was frozen so hard: night, snow, lanterns; a pick bounces off the ground in sparks
  frozen: (s, f) => { const tt = t(f - s.a), ph = (tt * 1.6) % 1, k = ph < 0.6 ? ph / 0.6 : 1 - (ph - 0.6) / 0.4, hit = ph > 0.55 && ph < 0.75;
    const g = Gv(0.05, 1.05 + 0.2 * (1 - k), 1.05), b = Gv(0.45, 0.05 + 1.25 * (1 - k * k), 1.75), strike = Gv(0.45, 0.05, 1.75);
    return { light: "night", snow: true, dug: false, lanterns: true, crosses: false, dof: 1, focus: Gv(-0.3, 0.8, 1.6), key: Gv(3.9, 1.9, 0.6),
      cam: kick(move({ pos: Gv(1.2, 0.9, -2.2), look: Gv(0.1, 0.85, 1.7), fov: 50, roll: 0.07 }, { pos: Gv(0.9, 0.95, -1.9), look: Gv(0.1, 0.85, 1.7), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, s.a + Math.round(0.36 * FPS), 0.8),
      people: [P("miner4", Gv(-0.35, 0, 1.0), hit ? "shock" : "stern", -1, { hw: [g, L3(g, b, 0.35)] }), P("miner2", Gv(0.45, 0, 4.4), "nervous", 1)],
      tools: [{ kind: "pick", g, b }], cards: hit ? Array.from({ length: 8 }, (_, i) => ({ kind: "spark" as const, p: add(strike, 0.25 * Math.cos(i * 0.8) * (ph - 0.5) * 5, 0.3 * (ph - 0.5) * 5 * (1 + (i % 3)) * 0.4, -0.05), spin: i, s: 0.9 })) : [],
      puffs: [...breath(Gv(-0.35, 1.5, 1.0), tt), ...breath(Gv(0.45, 1.5, 4.4), tt + 0.5)], subjects: [["the frozen ground", strike, 0.3]] }; },
  // so they blasted the graves open: a dynamite stick, the fuse fizzing
  dynamite: (s, f) => { const tt = t(f - s.a), hand = Gv(-0.32, 1.0, 1.25), tip = add(hand, 0, 0.14 + 0.01 * Math.sin(tt * 30), 0);
    return { light: "night", snow: true, dug: false, lanterns: true, crosses: false, dof: 2, closeup: true, focus: hand, key: Gv(3.9, 1.9, 0.6),
      cam: snap(Gv(0.35, 1.2, -1.35), Gv(-0.5, 1.05, 1.5), f, s.a, { fov: 44, roll: -0.08 }, 1.4, 5),
      people: [P("miner1", Gv(-0.6, 0, 1.6), "nervous", -1, { hw: [hand] })], tools: [{ kind: "dynamite", g: add(hand, 0, 0.1, 0), b: add(hand, 0, -0.12, 0), s: 1.6 }],
      cards: Array.from({ length: 6 }, (_, i) => { const u = (tt * 3 + i / 6) % 1; return { kind: "spark" as const, p: add(tip, 0.18 * u * Math.cos(i * 2.1), 0.05 + 0.16 * u, -0.05 - 0.05 * u * Math.sin(i * 2.1)), spin: i + u * 4, s: 0.7 * (1 - u) + 0.2 }; }),
      puffs: [{ p: tip, s: 0.3, c: [1.0, 0.75, 0.35], a: 0.8, add: true }, ...breath(Gv(-0.6, 1.35, 1.6), tt)], subjects: [["the dynamite", hand, 0.2]] }; },
  // ...with dynamite: the blast throws frozen earth outward from the grave; chunks fly at the lens
  boom: (s, f) => { const tt = t(f - s.a), c = Gv(0, 0.2, 2.0), blown = tt > 0.08;
    const chunks: Card[] = blown ? Array.from({ length: 34 }, (_, i) => { const a = (i / 34) * 6.283 + 0.3 * Math.sin(i * 5), v = 4.5 + 3 * ((i * 7) % 5) / 5, up = 3.2 + 2.6 * ((i * 3) % 4) / 4, T2 = tt - 0.08, toward = i % 5 === 0 ? -1 : 0.35 * Math.sin(a);
      return { kind: "chunk" as const, p: add(c, Math.cos(a) * v * T2, up * T2 - 4.9 * T2 * T2 + 0.2, toward * v * T2 * (i % 5 === 0 ? 1.6 : 1)), spin: i + T2 * 8, s: 0.9 + 0.7 * ((i * 11) % 3) / 2 }; }).filter((q) => q.p[1] > -0.2) : [];
    return { light: "night", snow: true, dug: blown, coffins: false, lanterns: true, crosses: false, dof: 0, focus: c, key: Gv(3.9, 1.9, 0.6),
      cam: kick(kick(move({ pos: Gv(0.9, 1.2, -6.8), look: Gv(0, 1.1, 2.0), fov: 54, roll: 0.05 }, { pos: Gv(1.3, 1.6, -7.6), look: Gv(0, 1.6, 2.0), fov: 58, roll: -0.04 }, f, s.a, s.b, expo, 0), f, s.a + 2, 1.6), f, s.a + 9, 0.9),
      people: [P("miner2", Gv(4.0, 0, -2.7), "shock", -1), P("miner1", Gv(-3.9, 0, -2.4), "shock", 1)],
      cards: chunks, puffs: [...(tt < 0.35 ? [{ p: add(c, 0, 0.6, -0.4), s: 3 + 14 * tt, c: [1.0, 0.82, 0.5] as [number, number, number], a: 0.95 * (1 - tt / 0.35), add: true }] : []),
        ...Array.from({ length: 10 }, (_, i) => { const u = clamp01(tt * 1.2 + i * 0.03), a = (i / 10) * 6.283; return { p: add(c, Math.cos(a) * 1.4 * u, 0.4 + 2.2 * u, Math.sin(a) * 0.8 * u), s: 1.2 + 3.2 * u, c: [0.5, 0.52, 0.6] as [number, number, number], a: blown ? 0.75 * (1 - 0.6 * u) : 0 }; })] }; },
  // that flu went on to kill tens of millions: up and up over a field of crosses running to the horizon
  millions: (s, f) => ({ light: "twilight", snow: true, dug: false, field: true, dof: 0, focus: Gv(0, 0, -40),
    cam: move({ pos: Gv(0.5, 3.2, 7.0), look: Gv(0, 0.5, -16), fov: 58, roll: 0.05 }, { pos: Gv(-0.5, 17, 12), look: Gv(0, 0, -56), fov: 60, roll: -0.03 }, f, s.a, s.b, smooth, 0) }),
  // and nobody had kept a sample: the lab shelf, a jar marked 1918 FLU, empty
  sample: (s, f) => ({ light: "lab", jar: true, dof: 3, closeup: true, focus: Lb(-0.3, 1.92, 3.82),
    cam: move({ pos: Lb(0.9, 1.65, 1.0), look: Lb(-0.3, 1.9, 3.82), fov: 44, roll: 0.06 }, { pos: Lb(-0.05, 1.95, 2.85), look: Lb(-0.3, 1.92, 3.82), fov: 36, roll: -0.04 }, f, s.a, s.b, expo, 0),
    subjects: [["the empty jar", Lb(-0.3, 1.92, 3.82), 0.15]] }),
  // eighty years later, scientists from four countries: the team walks in with their cases (the four flags on them)
  later: (s, f) => { const tt = t(f - s.a), z = -7.2, X = SET.grave[0], carry = (p: V3): V3 => add(p, 0.4, 0.75, 0);
    const ps = [walker("lead", X - 3.1, 0, z, 1.25, tt, "stern"), walker("sci1", X - 3.95, 0, z - 0.35, 1.25, tt, "neutral", {}, carry), walker("sci2", X - 4.8, 0, z + 0.1, 1.25, tt, "neutral", {}, carry), walker("sci4", X - 5.65, 0, z - 0.2, 1.25, tt, "stern", {}, carry)];
    return { light: "grey", tent: false, dug: false, dof: 1, focus: Gv(-3.2 + 1.25 * tt, 1.4, z),
      cam: move({ pos: Gv(-3.6, 1.5, -15.4), look: Gv(-4.1, 1.3, z), fov: 50, roll: 0.04 }, { pos: Gv(-1.6, 1.6, -15.2), look: Gv(-2.1, 1.3, z), fov: 50, roll: -0.03 }, f, s.a, s.b, (x) => x, 0),
      people: ps }; },
  // ground radar: the cart rolls over the graves, seven bumps on its screen
  radar: (s, f) => { const tt = t(f - s.a), z = 1.6 - 0.3 * tt, cart = Gv(0.45, 0, z), hand = Gv(0.45, 0.92, z + 0.62);
    return { light: "grey", tent: true, dug: false, dof: 2, focus: Gv(0.45, 0.6, z), radar: { p: cart, yaw: Math.PI },
      cam: move({ pos: Gv(0.75, 1.25, -1.6), look: Gv(0.45, 0.8, z + 0.6), fov: 46, roll: -0.06 }, { pos: Gv(0.6, 1.15, -1.3), look: Gv(0.45, 0.8, z + 0.6), fov: 44, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("sci1", Gv(0.5, 0, z + 0.95), "smile", 0, { mask: true, hw: [add(hand, 0.1, 0, 0), add(hand, -0.1, 0, 0)] })], subjects: [["the radar cart", Gv(0.45, 0.2, z), 0.2]] }; },
  // ...from four countries: the four flags on the team's cases
  flags: (s, f) => ({ light: "grey", tent: true, dug: false, dof: 2, closeup: true, focus: Gv(-4.7, 0.25, -0.5),
    cam: move({ pos: Gv(-4.55, 1.1, -5.6), look: Gv(-4.74, 0.3, -0.6), fov: 60, roll: 0.05 }, { pos: Gv(-4.95, 1.05, -5.3), look: Gv(-4.74, 0.3, -0.6), fov: 60, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the flags", Gv(-4.74, 0.24, -0.8), 0.1]] }),
  // the idea was simple: the leader points down at the graves
  plan: (s, f) => { const tt = t(f - s.a);
    return { light: "grey", tent: true, dug: false, dof: 2, focus: Gv(0.45, 1.4, 0.2),
      cam: move({ pos: Gv(0.1, 1.5, -2.9), look: Gv(0.65, 1.25, 0.7), fov: 44, roll: -0.05 }, { pos: Gv(0.3, 1.45, -2.6), look: Gv(0.65, 1.25, 0.7), fov: 44, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("lead", Gv(0.5, 0, 0.25), "stern", -1, { hw: [Gv(0.05, 0.85 + 0.04 * Math.sin(tt * 5), 0.6)] }), P("sci1", Gv(0.95, 0, 1.5), "neutral", -1, { mask: true })] }; },
  // protective suits: snap onto a face in a hood and mask
  suits: (s, f) => ({ light: "grey", tent: true, dug: false, dof: 3, closeup: true, focus: Gv(-2.0, 1.5, -0.6),
    cam: kick(snap(Gv(-1.62, 1.55, -2.85), Gv(-2.0, 1.5, -0.6), f, s.a, { fov: 34, roll: 0.07 }, 1.5, 5), f, s.a + 2, 0.8),
    people: [P("sci3", Gv(-2.0, 0, -0.6), "stern", 1, { mask: true })] }),
  // the idea: the coffins six feet down, deep in ground that never thaws
  idea: (s, f) => { const tt = t(f - s.a);
    return { light: "cut", thaw: 0, ghosts: true, coffins: false, dof: 1, focus: Ct(0, -2.0, CUT.z), key: Ct(-1.5, 3.4, CUT.z - 2.6),
      cam: move({ pos: Ct(-0.6, 0.4, -5.2), look: Ct(0, -0.4, CUT.z), fov: 52, roll: -0.05 }, { pos: Ct(-0.3, -1.6, -4.4), look: Ct(0, -2.0, CUT.z), fov: 48, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      cards: viruses(tt, -2.0, 0.9), subjects: [["the six-foot line", Ct(0, -2.0, CUT.z), 0.2]] }; },
  // the virus should be frozen solid: close on one, locked in the ice
  solid: (s, f) => { const tt = t(f - s.a);
    return { light: "cut", thaw: 0, ghosts: true, coffins: false, dof: 3, closeup: true, focus: Ct(0, -2.0, CUT.z), key: Ct(-1.5, 3.4, CUT.z - 2.6),
      cam: kick(snap(Ct(-0.15, -1.9, -2.1), Ct(0, -2.0, CUT.z), f, s.a, { fov: 34, roll: 0.06 }, 1.5, 5), f, W(6, "frozen"), 0.9), cards: viruses(tt * 0.1, -2.0, 0.9) }; },
  // they dug for a week: the tent, the team at the pit, earth flying, the days going by
  dig: (s, f) => { const tt = t(f - s.a), u = U(s, f), d1 = digPose(tt), k2 = 0.5 + 0.5 * Math.sin(tt * 4.6 + 1.4), g2 = Gv(0.45, 1.05 + 0.2 * k2, 0.85), b2 = Gv(0.15, 0.0 + 0.3 * k2, 1.45);
    return { light: "grey", tent: true, dug: true, coffins: false, fill: -0.15 - 0.4 * u, dof: 1, focus: Gv(0, 0.8, 1.6),
      cam: orbit(s, f, Gv(-0.7, 0.8, 1.4), [14, -10], [5.2, 4.9], [1.5, 2.0], 50, [0.05, -0.04]),
      people: [d1.man("stern"), P("sci4", Gv(0.75, 0, 0.6), "stern", -1, { mask: true, hw: [g2, L3(g2, b2, 0.42)] })],
      tools: [d1.tool, { kind: "shovel", g: g2, b: b2 }], cards: [...spray(d1.blade, Gv(-4.5, 0.6, 2.0), tt, 4, 1.3), ...spray(b2, Gv(2.2, 0.6, 0.0), tt + 0.3, 4, 1.3)] }; },
  // and less than one meter down, they hit the coffins: a shovel knocks on wood at the pit's edge
  hit: (s, f) => { const tt = t(f - s.a), k = 0.5 + 0.5 * Math.cos(Math.min(tt, 0.4) * 7.8), g = Gv(-3.05, 1.05, 2.2), b = Gv(-2.6, LID_Y + 0.02 + 0.3 * k, 2.25);
    return { light: "grey", tent: true, dug: true, coffins: true, dof: 1, focus: Gv(-2.6, LID_Y, 2.2),
      cam: kick(move({ pos: Gv(-2.1, 2.2, -2.4), look: Gv(-3.0, 0.3, 2.0), fov: 54, roll: 0.06 }, { pos: Gv(-2.25, 2.05, -2.1), look: Gv(-3.05, 0.25, 2.0), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, W(7, "hit"), 1.0),
      people: [P("sci2", Gv(-3.45, 0, 2.3), tt > 0.6 ? "shock" : "stern", 1, { mask: true, hw: [g, L3(g, b, 0.4)] })], tools: [{ kind: "shovel", g, b }],
      subjects: [["the coffin lid", Gv(-2.7, LID_Y, 1.9), 0.3]] }; },
  // too shallow: back in the cut, the coffins sit above the frozen line; where they should have been, empty
  shallow: (s, f) => ({ light: "cut", thaw: 1, ghosts: true, coffins: true, dof: 0, focus: Ct(0, -1.2, CUT.z), key: Ct(-1.5, 3.4, CUT.z - 2.6),
    cam: move({ pos: Ct(0.4, 0.2, -6.6), look: Ct(0, -1.1, CUT.z), fov: 52, roll: 0.05 }, { pos: Ct(0.1, -0.5, -5.6), look: Ct(0, -1.2, CUT.z), fov: 50, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the coffins", Ct(0, LID_Y - 0.17, CUT.z), 0.2], ["the frozen line", Ct(0, CUT.ice, CUT.z), 0.1]] }),
  // above the frozen layer: close on the gap between the coffins and the ice
  layer: (s, f) => ({ light: "cut", thaw: 1, ghosts: false, coffins: true, dof: 2, closeup: true, focus: Ct(0.45, -1.18, CUT.z), key: Ct(-1.5, 3.4, CUT.z - 2.6),
    cam: move({ pos: Ct(1.4, -0.95, -2.4), look: Ct(0.45, -1.15, CUT.z), fov: 38, roll: -0.07 }, { pos: Ct(0.2, -1.05, -2.2), look: Ct(0.0, -1.15, CUT.z), fov: 36, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    subjects: [["the gap", Ct(0.0, -1.18, CUT.z), 0.1]] }),
  // for eighty summers: thaw, freeze, thaw; sun and snowflake take turns over the graves
  summers: (s, f) => { const tt = t(f - s.a), cyc = (tt * 1.5) % 1, th = cyc < 0.5 ? smooth(cyc * 4) : 1 - smooth((cyc - 0.5) * 4);
    return { light: "cut", thaw: th, coffins: true, dof: 0, focus: Ct(0, -0.6, CUT.z), key: Ct(-1.5, 3.4, CUT.z - 2.6),
      cam: orbit(s, f, Ct(0, -0.6, CUT.z + 0.4), [-16, 14], [6.2, 5.8], [0.6, 0.9], 52, [0.05, -0.05]),
      cards: [{ kind: th > 0.5 ? "sun" : "flake", p: Ct(-2.2 + 4.4 * cyc, 1.6 + 0.2 * Math.sin(tt * 6), CUT.z + 0.4), spin: tt * 2, s: 1.4 }], subjects: [["the coffins", Ct(0, LID_Y - 0.17, CUT.z), 0.2]] }; },
  // the virus was gone: the viruses grey, crack and crumble away
  gone: (s, f) => { const u = U(s, f), tt = t(f - s.a), cards = viruses(tt, LID_Y - 0.17 - 0.25 * u * u, 2.0 * (1 - 0.6 * u * u), true);
    return { light: "cut", thaw: 1, coffins: true, dof: 2, closeup: true, focus: Ct(0, LID_Y - 0.2, CUT.z), key: Ct(-1.5, 3.4, CUT.z - 2.6),
      cam: kick(move({ pos: Ct(0.5, -0.5, -2.8), look: Ct(0.1, LID_Y - 0.2, CUT.z), fov: 40, roll: 0.07 }, { pos: Ct(0.3, -0.6, -2.4), look: Ct(0.05, LID_Y - 0.22, CUT.z), fov: 38, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, W(9, "gone"), 0.9), cards }; },
  // but here's the thing: a year earlier, a bush plane rolls in on the gravel strip in Alaska
  plane: (s, f) => { const u = smooth(U(s, f)), z = 34 - 24 * u;
    return { light: "alaska", spin: 1, plane: { p: Ak(-16, 0, z), yaw: Math.PI / 2, roll: 0.02 * Math.sin(t(f) * 9) * (1 - u) }, dof: 0, focus: Ak(-16, 1.4, z),
      cam: move({ pos: Ak(-12.5, 1.0, z - 14), look: Ak(-16, 1.6, z), fov: 50, roll: 0.06 }, { pos: Ak(-12.0, 1.2, z - 11), look: Ak(-16, 1.7, z), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      puffs: Array.from({ length: 5 }, (_, i) => { const v = (t(f) * 1.5 + i / 5) % 1; return { p: Ak(-16 + 0.6 * Math.sin(i * 2), 0.3 + 0.6 * v, z + 2.5 + 4 * v), s: 0.8 + 2 * v, c: [0.7, 0.66, 0.58] as [number, number, number], a: 0.4 * (1 - v) }; }),
      subjects: [["the plane", Ak(-16, 1.4, z), 1]] }; },
  // a seventy-two-year-old retired doctor: Hultin steps down from the plane with his duffel bag
  hultin: (s, f) => { const tt = t(f - s.a), z = 10, X = SET.alaska[0], h = walker("hultin", X - 13.2, 0, z - 2.2, 0.9, tt, "smile", {}, (p) => add(p, 0.35, 0.72, 0)), bag = add(h.p, 0.35, 0.5, -0.05);
    return { light: "alaska", plane: { p: Ak(-16, 0, z), yaw: Math.PI / 2 }, dof: 2, focus: add(h.p, 0, 1.4, 0), duffel: { p: bag, yaw: 0 },
      cam: move({ pos: Ak(-10.4, 1.55, z - 6.6), look: Ak(-12.6, 1.45, z - 2.2), fov: 44, roll: -0.05 }, { pos: Ak(-10.0, 1.5, z - 6.2), look: Ak(-11.8, 1.45, z - 2.2), fov: 42, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [h] }; },
  // ...flew to a village in Alaska: the village, the church, the fenced grave under two crosses
  village: (s, f) => ({ light: "alaska", dof: 0, focus: Ak(0, 1, 6),
    cam: move({ pos: Ak(-8, 7, -14), look: Ak(1, 0.5, 8), fov: 56, roll: 0.05 }, { pos: Ak(-4, 4.5, -11), look: Ak(1.5, 1.2, 8), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the crosses", Ak(0, 1.8, 5.7), 0.5]] }),
  // ...with his wife's garden shears in a duffel bag: he pulls them out; they come at the lens
  shears: (s, f) => { const tt = t(f - s.a), u = expo(U(s, f) * 2), hand = L3(Ak(0.05, 1.1, -0.95), Ak(-0.05, 1.42, -1.55), u);
    return { light: "alaska", dof: 3, closeup: true, focus: hand, duffel: { p: Ak(0.55, 0, -0.85), yaw: 0.3 },
      cam: kick(move({ pos: Ak(-0.35, 1.45, -3.5), look: Ak(0.15, 1.3, -1.0), fov: 40, roll: -0.07 }, { pos: Ak(-0.3, 1.45, -3.2), look: Ak(0.05, 1.38, -1.2), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, W(10, "shears"), 0.9),
      people: [P("hultin", Ak(0.3, 0, -0.9), "grin", 1, { hw: [hand] })], tools: [{ kind: "shears", g: add(hand, 0, 0.04, 0), b: add(hand, 0, -0.12, -0.04), s: 1.15 + 0.25 * u }],
      cards: [{ kind: "spark", p: add(hand, 0.12, -0.25, -0.1), spin: tt * 6, s: 0.6 + 0.3 * Math.sin(tt * 20) }], subjects: [["the shears", add(hand, 0, -0.1, 0), 0.15]] }; },
  // he dug into a frozen mass grave: Hultin and two men of the village at the pit, earth flying, the crosses behind
  adig: (s, f) => { const tt = t(f - s.a), k = 0.5 + 0.5 * Math.sin(tt * 4.4), k2 = 0.5 + 0.5 * Math.sin(tt * 3.8 + 1.7);
    const g1 = Ak(-1.35, 1.05 + 0.2 * k, 1.75), b1 = Ak(-0.85, 0.0 + 0.4 * k, 2.6), g2 = Ak(1.45, 1.3 + 0.4 * k2, 1.7), b2 = Ak(0.95, 0.1 + 1.0 * (1 - k2), 2.5);
    return { light: "alaska", dug: true, dof: 1, focus: Ak(0, 0.8, 2.6),
      cam: orbit(s, f, Ak(0, 0.4, 2.6), [-18, 8], [5.6, 5.2], [2.3, 2.8], 52, [0.05, -0.04]),
      people: [P("vil1", Ak(-1.7, 0, 1.6), "stern", 1, { hw: [g1, L3(g1, b1, 0.42)] }), P("vil3", Ak(1.75, 0, 1.55), "stern", -1, { hw: [g2, L3(g2, b2, 0.35)] }), P("hultin", Ak(0.1, 0, 1.25), "stern", 0)],
      tools: [{ kind: "shovel", g: g1, b: b1 }, { kind: "pick", g: g2, b: b2 }], cards: [...spray(b1, Ak(-2.7, 0.6, 3.2), tt, 4, 1.3), ...spray(b2, Ak(2.7, 0.5, 3.2), tt + 0.4, 3, 1.1)] }; },
  // ...and found a woman whose lungs had been preserved: from down in the pit, his face over the edge, lantern-lit
  found: (s, f) => { const tt = t(f - s.a);
    return { light: "alaska", dug: true, dof: 2, closeup: true, focus: Ak(0.2, 1.35, 2.0),
      cam: move({ pos: Ak(0.5, 1.15, 5.6), look: Ak(0.15, 0.75, 2.2), fov: 48, roll: 0.06 }, { pos: Ak(0.4, 1.1, 5.3), look: Ak(0.15, 0.8, 2.2), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      specimen: tt > 0.5 ? Ak(-0.15, 1.15, 1.75) : null, people: [P("hultin", Ak(0.2, 0, 1.95), tt > 0.6 ? "smile" : "shock", 0, { headTilt: 0.2, hw: tt > 0.5 ? [Ak(-0.12, 1.1, 1.78)] : [] }), P("vil2", Ak(1.35, 0, 1.75), "shock", 0)], key: Ak(1.55, 0.4, 2.0), subjects: [["the pit", Ak(0, -0.6, 3.4), 0.3]] }; },
  // he mailed them to a lab: the parcel lands on the bench, hard
  mail: (s, f) => { const u = expo(U(s, f) * 1.8), pp = L3(Lb(0.6, 1.6, 0.4), Lb(0.15, BENCH_Y, 3.35), u);
    return { light: "lab", parcel: { p: pp, yaw: 0.3 * (1 - u), tilt: 0.6 * (1 - u), roll: 0.8 * (1 - u), open: false }, dof: 2, focus: Lb(0.15, BENCH_Y + 0.15, 3.35),
      cam: kick(move({ pos: Lb(0.5, 1.55, 0.4), look: Lb(0.15, 1.2, 3.3), fov: 46, roll: 0.06 }, { pos: Lb(0.4, 1.5, 0.9), look: Lb(0.15, 1.1, 3.35), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, s.a + Math.round(0.42 * FPS), 1.0),
      people: [P("path", Lb(0.6, 0, 2.5), "nervous", -1)], subjects: [["the parcel", Lb(0.15, BENCH_Y + 0.15, 3.35), 0.2]] }; },
  // and inside them: at the microscope
  inside: (s, f) => ({ light: "lab", parcel: { p: Lb(0.15, BENCH_Y, 3.35), yaw: 0.1, open: true }, dof: 2, focus: Lb(0.9, 1.4, 2.4),
    cam: orbit(s, f, Lb(1.15, 1.25, 2.4), [-22, -6], [3.4, 3.1], [0.25, 0.2], 46, [-0.05, 0.03]),
    people: [P("path", Lb(1.45, 0, 2.3), "stern", 1, { hw: [Lb(SCOPE[0] - 0.12, BENCH_Y + 0.22, SCOPE[2] - 0.08), Lb(SCOPE[0] + 0.12, BENCH_Y + 0.22, SCOPE[2] - 0.08)] })] }),
  // scientists found the whole 1918 flu: the screen fills, the result comes up
  reveal: (s, f) => { const on = f >= W(12, "found") + 4;
    return { light: "lab", parcel: { p: Lb(0.15, BENCH_Y, 3.35), yaw: 0.1, open: true }, done: on, dof: 2, focus: Lb(SCREEN[0], BENCH_Y + 0.25, SCREEN[2] - 0.26),
      cam: kick(snap(Lb(-0.7, 1.45, 0.25), Lb(-0.95, 1.2, 2.6), f, s.a, { fov: 44, roll: 0.06 }, 1.5, 5), f, W(12, "found") + 4, 1.0),
      people: [P("path", Lb(-0.6, 0, 2.15), on ? "grin" : "shock", 1)], subjects: [["the screen", Lb(SCREEN[0], BENCH_Y + 0.25, SCREEN[2] - 0.26), 0.1]] }; },
  // and that Arctic town? the seven crosses under new snow, blue twilight, nobody about
  town2: (s, f) => ({ light: "twilight", snow: true, dug: false, dof: 0, focus: Gv(0, 0.6, -30),
    cam: move({ pos: Gv(-0.6, 2.6, 6.4), look: Gv(0.4, 0.2, -30), fov: 54, roll: 0.05 }, { pos: Gv(-0.2, 1.7, 5.2), look: Gv(0.3, 0.4, -30), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the seven crosses", Gv(0, 0.75, CROSS_Z), 0.4], ["the town", Gv(0, 2, -36), 3]] }),
  // back to the shovel, as the film began (loop)
  end: (s, f) => { const tt = t(f - TOTAL), h0 = hookCam(0);
    return { ...hookState(tt), light: "grey", dof: 2, closeup: true, focus: Gv(-1.4, 0.8, 1.4),
      cam: move({ pos: Gv(-0.6, 1.5, -5.0), look: Gv(-0.9, 1.0, 1.8), fov: 54, roll: -0.03 }, h0, f, s.a, s.b - 2, smooth, 0) }; },
};
void APIT; void GANG;

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["ship", "week", "frozen", "millions", "later", "idea", "plane", "mail", "town2"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags, speech and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
const days = (): Item[] => { const a = S0("dig"), b = B("dig"), n = 7; return Array.from({ length: n }, (_, i) => ({ key: "day" + i, kind: "call" as const, text: `DAY ${i + 1}`, f0: Math.round(a + ((b - a) * i) / n), f1: Math.round(a + ((b - a) * (i + 1)) / n), y: 14, fg: "#ffd166", size: 140 })); };
export const ITEMS = (): Item[] => ([
  { key: "7", kind: "call", text: "7 MINERS", f0: W(0, "7"), f1: B("crosses"), y: 14, fg: "#ffd166", size: 150 },
  { key: "alive", kind: "stamp", text: "STILL ALIVE?", f0: W(0, "alive"), f1: B("alive"), y: 15, rot: -5, bg: "#2f9a57", fg: "#ffffff", size: 104 },
  { key: "1918", kind: "pill", text: "1918", sub: "Longyear City, Svalbard", f0: W(1, "1918"), f1: B("ship"), y: 12, size: 90 },
  { key: "28", kind: "stamp", text: "THE OLDEST: 28", f0: W(2, "oldest"), f1: B("oldest"), y: 15, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 96 },
  { key: "clank", kind: "call", text: "CLANK!", f0: S0("frozen") + Math.round(0.36 * FPS), f1: S0("frozen") + Math.round(0.36 * FPS) + 14, y: 16, fg: "#ffffff", size: 150, rot: -6 },
  { key: "boom", kind: "call", text: "BOOM!", f0: S0("boom") + 2, f1: B("boom"), y: 15, fg: "#ffd166", size: 210, rot: 5 },
  { key: "mil", kind: "call", text: "TENS OF MILLIONS", f0: W(4, "tens"), f1: B("millions"), y: 14, fg: "#ffffff", size: 104 },
  { key: "nos", kind: "stamp", text: "NO SAMPLE", f0: W(4, "sample"), f1: B("sample"), y: 15, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 120 },
  { key: "1998", kind: "pill", text: "1998", sub: "a team from 4 countries", f0: W(5, "80"), f1: B("later"), y: 12, size: 90 },
  { key: "6ft", kind: "call", text: "6 FEET DOWN?", f0: W(6, "buried"), f1: B("idea"), y: 14, fg: "#9ad8ff", size: 120 },
  { key: "solid", kind: "stamp", text: "FROZEN SOLID", f0: W(6, "frozen"), f1: B("solid"), y: 15, rot: 4, bg: "#2f5a9a", fg: "#ffffff", size: 110 },
  { key: "bumps", kind: "call", text: "7 COFFINS", f0: S0("radar") + 2, f1: B("radar"), y: 14, fg: "#7dff8e", size: 140 },
  ...days(),
  { key: "1m", kind: "call", text: "UNDER 1 METER", f0: W(7, "meter"), f1: B("hit"), y: 14, fg: "#ffd166", size: 120 },
  { key: "shallow", kind: "stamp", text: "TOO SHALLOW", f0: S0("shallow") + 2, f1: B("shallow"), y: 15, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 120 },
  { key: "80", kind: "call", text: "80 SUMMERS", f0: W(8, "80"), f1: B("summers"), y: 14, fg: "#ffd166", size: 140 },
  { key: "gone", kind: "stamp", text: "GONE", f0: W(9, "gone"), f1: B("gone"), y: 15, rot: 5, bg: "#4a4a50", fg: "#ffffff", size: 170 },
  { key: "1997", kind: "pill", text: "1997", sub: "Brevig Mission, Alaska", f0: S0("plane") + 6, f1: B("plane"), y: 12, size: 90 },
  { key: "hult", kind: "pill", text: "JOHAN HULTIN, 72", sub: "retired pathologist", f0: W(10, "72"), f1: B("hultin"), y: 12, size: 64 },
  { key: "flu", kind: "stamp", text: "1918 FLU: FOUND", f0: W(12, "found") + 4, f1: B("reveal"), y: 15, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 96 },
  { key: "1950", kind: "stamp", text: "NO COFFINS SINCE 1950", f0: W(13, "since"), f1: TOTAL - 24, y: 82, rot: -3, bg: "#2f2a3a", fg: "#ffffff", size: 70 },
] as Item[]).filter((i) => i.f1 > i.f0);
