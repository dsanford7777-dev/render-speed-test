// The Captain of Koepenick Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is
// still). Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts;
// cameras sit on the -z side looking toward +z (world +x is screen LEFT).
import { Expr } from "../bridge/toon";
import { V3, FPS, St, Sq, Rm, WZ, KERB, PAVE, JUNK_X, TAILOR_X, BATHS_X, STATION_X, TZ, GATE, BOARD, DESK, TABLE, COUNTER } from "./place";
import { SEG_TIMES, TOTAL, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["gate", W(0, "then") - 2], ["arrest", W(0, "arrest") - 2],
  ["notoff", A(1)], ["shoe", W(1, "was") - 4], ["prison", W(1, "just") - 2], ["dealer", W(1, "bought") - 2], ["pieces", W(1, "piece") - 2], ["shops", W(1, "from") - 2],
  ["fit", A(2)], ["checked", W(2, "nobody") - 2],
  ["swim", A(3)], ["baths", W(3, "army") - 2], ["order", W(3, "by") - 2], ["salute", W(3, "they") - 2],
  ["six", A(4)], ["beer", W(4, "beer") - 2], ["mark", W(4, "and") - 2],
  ["train", A(5)], ["hall", W(5, "town") - 2],
  ["mayor", A(6)], ["where", W(6, "where") - 2], ["bayonets", W(6, "pointed") - 4], ["mine", W(6, "these") - 2],
  ["hauled", A(7)], ["count", W(7, "and") - 2],
  ["sign", A(8)], ["warden", W(8, "with") - 2],
  ["walk", A(9)], ["suit", W(9, "bought") - 2],
  ["key", A(10)], ["noid", W(10, "and") - 2],
  ["caught", A(11)], ["laugh", W(11, "and") - 2], ["kaiser", W(11, "in") - 2],
  ["swear", A(12)], ["board", W(12, "small") - 2], ["nopass", W(12, "couldn't") - 2],
  ["lux", A(13)], ["luxpass", W(13, "from") - 2], ["end", TOTAL - 8],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number;
  /** a towel over the shoulder (the four from the swimming baths) */
  towel?: boolean;
  /** in the air: no contact shadow */
  air?: boolean;
  /** walking in profile: step phase 0..1; mirror = moving toward -x; carry = a point in the world both hands hold out to */
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 } };
export type Tool = { kind: "stein" | "quill" | "hammer" | "boot" | "bread"; g: V3; b: V3; s?: number; yaw?: number; tilt?: number };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "coin" | "note" | "towel" | "sausage" | "passport";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type NewsKey = "fake" | "ha" | "cap";
export type St3 = {
  light: "noon" | "aft" | "junk" | "pub" | "office" | "palace" | "lux"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  tools?: Tool[]; cards?: Card[]; puffs?: Puff[];
  /** square: how far the gate leaves are open (radians) */
  gate?: number;
  /** room: the cash box (lid open 0..1), the receipt on the desk, stacks of notes */
  cashbox?: { open: number }; receipt?: boolean; bills?: boolean;
  /** the two mail sacks: where each hangs (top of the sack, world) */
  sacks?: V3[];
  /** newspapers held up (they turn to the camera) */
  news?: { p: V3; head: NewsKey; yaw?: number; tilt?: number; roll?: number; s?: number }[];
  /** the lamp lamp-lit shadows fall from */
  key?: V3;
};

// ---------------- helpers (the house kit) ----------------
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const expo = (u: number) => { const x = clamp01(u); return x >= 1 ? 1 : 1 - Math.pow(2, -9 * x); };
const rad = (d: number) => (d * Math.PI) / 180;
const L3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
type Shot = Partial<Cam> & { pos: V3; look: V3 };
const full = (c: Shot): Cam => ({ fov: 42, roll: 0, ...c });
const mix = (a: Cam, b: Cam, k: number): Cam => ({ pos: L3(a.pos, b.pos, k), look: L3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k });
export const move = (a: Shot, b: Shot, f: number, f0: number, f1: number, ease: (u: number) => number = expo, creep = 0.0012): Cam => {
  const c = mix(full(a), full(b), ease((f - f0) / Math.max(1, f1 - f0)));
  const k = 1 - Math.exp(-creep * Math.max(0, f - f1));
  return { ...c, pos: L3(c.pos, c.look, k) };
};
const orb = (c: V3, a: number, r: number, h: number, rest: Partial<Cam> = {}): Shot => ({ pos: [c[0] + r * Math.sin(rad(a)), c[1] + h, c[2] - r * Math.cos(rad(a))], look: c, ...rest });
export const orbit = (s: ShotDef, f: number, c: V3, a: [number, number], r: [number, number], h: [number, number], fov = 46, roll: [number, number] = [0.05, -0.04], ease = smooth): Cam => {
  const u = ease((f - s.a) / Math.max(1, s.b - s.a));
  return full(orb(c, a[0] + (a[1] - a[0]) * u, r[0] + (r[1] - r[0]) * u, h[0] + (h[1] - h[0]) * u, { fov, roll: roll[0] + (roll[1] - roll[0]) * u }));
};
export const snap = (pos: V3, look: V3, f: number, f0: number, rest: Partial<Cam> = {}, back = 1.5, n = 5): Cam => {
  const far: V3 = [look[0] + (pos[0] - look[0]) * back, look[1] + (pos[1] - look[1]) * back, look[2] + (pos[2] - look[2]) * back];
  const fov = rest.fov ?? 42;
  return move({ pos: far, look, ...rest, fov: fov * 1.25 }, { pos, look, ...rest, fov }, f, f0, f0 + n, expo, 0.0015);
};
export const kick = (c: Cam, f: number, f0: number, k = 1): Cam => {
  if (f < f0 || f >= f0 + 7) return c;
  const e = f - f0, s = (e % 2 ? -1 : 1) * k * (1 - e / 7), d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const a = 0.012 * Math.max(1.2, Math.min(40, d));
  return { ...c, pos: [c.pos[0], c.pos[1] + a * s, c.pos[2] + 0.6 * a * s], roll: c.roll + 0.014 * s };
};
const t = (f: number) => f / FPS;
export const secs = t;
export const U = (s: ShotDef, f: number) => clamp01((f - s.a) / Math.max(1, s.b - s.a));
export const P = (who: string, p: V3, expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => ({ who, p, expr, look, ...extra });
/** someone walking in profile along x from x0 (absolute) at v m/s */
export const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", extra: Partial<Person3> = {}): Person3 => {
  const d = Math.abs(v) * tt, p: V3 = [x0 + v * tt, y, z];
  return { who, p, expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: Math.min(1.25, Math.abs(v) / 1.6) }, ...extra };
};
export const add = (p: V3, x: number, y: number, z: number): V3 => [p[0] + x, p[1] + y, p[2] + z];
/** a salute: the hand at the helmet's brim, on the screen-right side of the face */
export const salute = (p: V3, s = 1): V3 => add(p, -0.2 * s, 1.66 * s, -0.12);
/** coins dropping from a hand into a palm */
const coinDrop = (from: V3, to: V3, tt: number, n = 5): { kind: "coin"; p: V3; spin: number; s: number }[] => Array.from({ length: n }, (_, i) => { const u = clamp01(tt * 2.2 - i * 0.18); return { kind: "coin" as const, p: L3(from, to, u) .map((v, k) => (k === 1 ? v + 0.25 * Math.sin(Math.PI * u) : v)) as V3, spin: i * 1.3 + tt * 9, s: 1 }; }).filter((_, i) => tt * 2.2 - i * 0.18 > 0);

// ---------------- the beer hall as the shots use it (the hook) ----------------
const TY = PAVE; void TY;
const PUB_CAP: V3 = Rm(0, 0, TABLE.z + 0.62), PUB_L: V3 = Rm(0.5, 0, TABLE.z + 0.58), PUB_R: V3 = Rm(-0.5, 0, TABLE.z + 0.58), PUB_L2: V3 = Rm(1.55, 0, TABLE.z + 0.62), PUB_R2: V3 = Rm(-1.55, 0, TABLE.z + 0.62);
/** the clink: three steins meeting over the table (k 0..1 how far raised) */
const clink = (k: number) => { const c: V3 = Rm(0, 1.08 + 0.1 * k, TABLE.z + 0.22), l: V3 = Rm(0.19 * k + 0.35 * (1 - k), 1.05 + 0.1 * k, TABLE.z + 0.24), r: V3 = Rm(-0.19 * k - 0.35 * (1 - k), 1.05 + 0.1 * k, TABLE.z + 0.24);
  return { tools: [{ kind: "stein" as const, g: c, b: c }, { kind: "stein" as const, g: l, b: l }, { kind: "stein" as const, g: r, b: r }], c, l, r }; };
const HOOK_POS: V3 = Rm(0, 1.62, -2.35), HOOK_LOOK: V3 = Rm(0, 1.36, TABLE.z + 0.4), HOOK = { fov: 48, roll: 0.035 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.05), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const hookState = (f: number): Partial<St3> => { const k = 0.8 + 0.2 * smooth(f / 12), cl = clink(k);
  return { light: "pub", tools: cl.tools, people: [P("cap", PUB_CAP, "grin", 0, { hw: [cl.c] }), P("b1", PUB_L, "laugh", -1, { hw: [cl.l] }), P("b2", PUB_R, "grin", 1, { hw: [cl.r] })],
    cards: [{ kind: "sausage", p: Rm(0.6, TABLE.y + 0.05, TABLE.z - 0.1), spin: 0.2, s: 1.1, flat: true }, { kind: "sausage", p: Rm(-0.4, TABLE.y + 0.05, TABLE.z), spin: -0.4, s: 1.1, flat: true }], key: Rm(0.6, 2.6, 0.3) }; };

// ---------------- the square ----------------
export const AP = 0.12; // the stone apron in front of the town hall
const gateGuards = (expr: Expr = "stern"): Person3[] => [P("g1", Sq(GATE.x + 2.6, AP, TZ - 1.5), expr, 0), P("g2", Sq(GATE.x - 2.6, AP, TZ - 1.5), expr, 0), P("g3", Sq(GATE.x + 4.2, AP, TZ - 1.6), expr, 0, { extra: true }), P("g4", Sq(GATE.x - 4.2, AP, TZ - 1.6), expr, 0, { extra: true })];

// ---------------- the office ----------------
export const MAYOR: V3 = Rm(0.15, 0, DESK.z + DESK.hd + 0.35), CAPO: V3 = Rm(-0.95, 0, DESK.z - DESK.hd - 0.55), TREAS: V3 = Rm(-0.4, 0, DESK.z + DESK.hd + 0.35);
const officeGuards = (): Person3[] => [P("g5", Rm(1.0, 0, 2.1), "stern", 0), P("g6", Rm(-1.6, 0, 1.9), "stern", 0)];

const ROW = (k: number) => St(BATHS_X + RW[0] + RW[1] * k, 0, 3.2 + RW[2] * k), RW = [1.4, 0.6, 0.3], BA = [0.5, 2.5, -6.8, 1.7];
const SA = [4.2, -2.4, 2.3];
const SX = [5, 2.2, -7, 0.4];
const HX = [-1.5, 0.8];
const MK = [3.4];
const TR = [-1.5, 3.0, -8, -0.5, 3.4];
const HA = [0.6, -8];
const MY = [-5.2, -0.1];
const LA = [11.5, 7.9];
const BY = [-1.3, -4.6, -1.6];
const HLY = 6.5;
const SWIM_CAM = [5, 1.8, -5.5, 0.4];
export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // --- 0: "He bought ten soldiers a beer..." the clink in the beer hall (frame 0 already close) ---
  hook: (s, f) => ({ ...hookState(f), light: "pub", dof: 1, focus: Rm(0, 1.4, TABLE.z + 0.2), cam: kick(hookCam(f), f, W(0, "beer"), 0.9), subjects: [["the steins", Rm(0, 1.45, TABLE.z + 0.2), 0.3]] }),
  // "...then used them": the same men, rifles and bayonets, flanking the town hall gate (low, wide, a crane down)
  gate: (s, f) => ({ light: "aft", dof: 0.6, gate: 0, people: [...gateGuards().slice(0, 2), P("cap", Sq(GATE.x, AP, TZ - 2.6), "grin", 0)],
    cam: move({ pos: Sq(1.2, 5.0, TZ - 15), look: Sq(0, 2.6, TZ - 1), fov: 54, roll: -0.05 }, { pos: Sq(0.6, 1.4, TZ - 13.5), look: Sq(0, 2.4, TZ - 1), fov: 54, roll: 0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the town hall gate", Sq(GATE.x, 2.4, TZ), 0.6]] }),
  // "...to arrest a mayor": the mayor behind his desk, hands up, a guard either side (snap zoom)
  arrest: (s, f) => ({ light: "office", dof: 1, people: [P("mayor", MAYOR, "shock", 0, { hw: [add(MAYOR, 0.32, 1.75, -0.2), add(MAYOR, -0.32, 1.75, -0.2)] }), P("g5", Rm(0.75, 0, 2.2), "stern", -1), P("g6", Rm(-0.65, 0, 2.2), "stern", 1)],
    cam: kick(snap(Rm(0.1, 1.6, -2.5), Rm(0.1, 1.45, MAYOR[2]), f, s.a, { fov: 46, roll: -0.05 }), f, W(0, "arrest") + 2, 0.8), subjects: [["the mayor", add(MAYOR, 0, 1.5, 0), 0.3]] }),
  // --- 1: "You see, he wasn't an officer." the captain alone in the beer hall, an orbit round his grin ---
  notoff: (s, f) => ({ light: "pub", dof: 1.2, people: [P("cap", PUB_CAP, "smile_closed", 0)], key: Rm(0.6, 2.6, 0.3),
    cam: orbit(s, f, Rm(0, 1.5, PUB_CAP[2]), [-24, 12], [2.4, 2.1], [0.05, 0.12], 40, [0.06, -0.05]), subjects: [["the captain", add(PUB_CAP, 0, 1.5, 0), 0.3]] }),
  // "He was a fifty-seven-year-old shoemaker": the same man in his own clothes, a boot on his fist, tapping with a hammer
  shoe: (s, f) => { const p = Rm(-0.4, 0, COUNTER.z - 0.95), tt = t(f - s.a), k = Math.abs(Math.sin(tt * 7)), g: V3 = add(p, 0.22, 0.86, -0.4), hg: V3 = add(p, -0.32, 1.02 + 0.1 * k, -0.4), hb: V3 = add(p, -0.1, 1.0 + 0.06 * k, -0.48);
    return { light: "junk", dof: 1.2, people: [P("voigt", p, "neutral", 0, { hw: [g, hg] })], tools: [{ kind: "boot", g, b: g, yaw: 0, s: 1.4 }, { kind: "hammer", g: hg, b: hb }],
      cam: move({ pos: add(p, -0.5, 1.35, -2.4), look: add(p, 0, 1.3, 0), fov: 44, roll: 0.06 }, { pos: add(p, -0.2, 1.4, -2.0), look: add(p, 0, 1.32, 0), fov: 44, roll: -0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the boot", g, 0.15]] }; },
  // "just out of prison": walking out along the pavement past the station in his old clothes
  prison: (s, f) => { const tt = t(f - s.a); return { light: "noon", dof: 0.6, people: [walker("voigt", St(STATION_X + 6, 0, 0)[0], PAVE, WZ - 1.5, 1.2, tt, "neutral")],
    cam: move({ pos: St(STATION_X + 3, 1.7, WZ - 7.5), look: St(STATION_X + 6.5, 1.6, WZ - 1.5), fov: 44, roll: 0.03 }, { pos: St(STATION_X + 5.5, 1.6, WZ - 7.2), look: St(STATION_X + 8.5, 1.5, WZ - 1.5), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0),
    subjects: [["the man walking", St(STATION_X + 6.5 + 1.2 * tt, 1.5, WZ - 1.5), 0.3]] }; },
  // "and he'd bought that captain's uniform": the junk dealer behind his counter, our man in front, the goods between them
  dealer: (s, f) => { const dp = Rm(0.5, 0, COUNTER.z + 0.75), vp = Rm(-0.5, 0, COUNTER.z - 0.75);
    return { light: "junk", dof: 1, people: [P("dealer", dp, "smile", -1, { hw: [Rm(-0.2, COUNTER.y + 0.08, COUNTER.z)] }), P("voigt", vp, "grin", 1)],
      cam: move({ pos: Rm(-1.4, 1.75, -2.6), look: Rm(0, 1.3, COUNTER.z), fov: 50, roll: 0.04 }, { pos: Rm(-0.9, 1.65, -2.3), look: Rm(0, 1.3, COUNTER.z), fov: 50, roll: -0.02 }, f, s.a, s.b, smooth, 0), subjects: [["the cap on the counter", Rm(COUNTER.x - 0.2, COUNTER.y + 0.12, COUNTER.z), 0.2]] }; },
  // "piece by piece": a long-lens slide along the counter, coat, cap, sword, each with its price tag
  pieces: (s, f) => { const tags = [1.3, 0.2, -0.6], u = U(s, f) * 3, i = Math.min(2, Math.floor(u)), k = smooth(clamp01((u - i) / 0.3)), x = i === 0 ? tags[0] : tags[i - 1] + (tags[i] - tags[i - 1]) * k;
    const tx = COUNTER.x + x - 0.4, cam: Cam = { pos: Rm(tx + 0.25, COUNTER.y + 0.62, COUNTER.z - 1.05), look: Rm(tx, COUNTER.y + 0.14, COUNTER.z - 0.2), fov: 44, roll: 0.05 - 0.04 * i };
    return { light: "junk", dof: 1.6, closeup: true, cam, subjects: [["the price tags", [cam.look[0], COUNTER.y + 0.25, COUNTER.z - 0.32], 0.3]] }; },
  // "from junk shops": outside the TROEDLER, he comes out with a bundle wrapped in newspaper
  shops: (s, f) => { const tt = t(f - s.a); return { light: "noon", dof: 0.6, people: [walker("voigt", St(JUNK_X - 0.5, 0, 0)[0], PAVE, WZ - 1.2, -1.0, tt, "grin", { side: undefined })].map((q) => ({ ...q, side: { phase: ((tt * 1.0 / 1.6) % 1), mirror: true, stride: 0.62, carry: add(q.p, -0.25, 1.05, -0.1) } })),
    cards: [{ kind: "paper", p: add(St(JUNK_X - 0.5 - tt, PAVE, WZ - 1.2), -0.35, 1.05, -0.12), spin: 0.2, s: 1.6 }],
    cam: move({ pos: St(JUNK_X - 1, 2.6, WZ - 9.5), look: St(JUNK_X, 2.4, WZ), fov: 46, roll: -0.03 }, { pos: St(JUNK_X - 2, 1.9, WZ - 8.2), look: St(JUNK_X - 1, 2.2, WZ), fov: 46, roll: 0.02 }, f, s.a, s.b, smooth, 0), subjects: [["the junk shop sign", St(JUNK_X, 3.25, WZ - 0.16), 0.3]] }; },
  // --- 2: "It didn't even fit right." in the uniform, cap askew, in the junk shop's mirror light (tilt in) ---
  fit: (s, f) => { const p = Rm(-0.6, 0, COUNTER.z - 0.9); return { light: "junk", dof: 1.2, people: [P("cap", p, "grin", 0, { headTilt: 0.12 })],
    cam: move({ pos: Rm(-0.9, 1.15, p[2] - 2.6), look: add(p, 0, 1.3, 0), fov: 44, roll: -0.12 }, { pos: Rm(-0.7, 1.3, p[2] - 2.1), look: add(p, 0, 1.4, 0), fov: 42, roll: 0.08 }, f, s.a, s.b, expo, 0), subjects: [["the captain", add(p, 0, 1.5, 0), 0.3]] }; },
  // "Nobody checked.": on the street a guardsman snaps a salute as the captain passes
  checked: (s, f) => { const tt = t(f - s.a), gp = St(2, PAVE, WZ - 1.0); return { light: "noon", dof: 0.8, people: [P("g7", gp, "stern", -1, { hw: [salute(gp)] }), walker("cap", St(4.2, 0, 0)[0], 0, 4.4, -1.1, tt, "smile")],
    cam: move({ pos: St(1.2, 1.5, 0.6), look: add(gp, 0, 1.4, 0), fov: 40, roll: 0.05 }, { pos: St(1.6, 1.55, 1.2), look: add(gp, 0, 1.45, 0), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0), subjects: [["the guardsman", add(gp, 0, 1.4, 0), 0.3]] }; },
  // --- 3: "He stopped four guardsmen on their way back from the army swimming baths." four with towels, marching ---
  swim: (s, f) => { const tt = t(f - s.a), x0 = St(BATHS_X - 1, 0, 0)[0], v = 1.3, sp = 1.0, cx = x0 + 1.5 * sp + v * tt, mk = (k: number, who: string) => ({ ...walker(who, x0 + sp * k, 0, 3.0 - 0.15 * k, v, tt, "neutral"), towel: true });
    const u = U(s, f);
    return { light: "noon", dof: 0.7, people: [mk(0, "g1"), mk(1, "g2"), mk(2, "g3"), mk(3, "g4")],
      cam: { pos: [cx + SWIM_CAM[0], SWIM_CAM[1], SWIM_CAM[2]], look: [cx + SWIM_CAM[3], 1.35, 3.0], fov: 44, roll: 0.04 - 0.06 * u },
      subjects: [["the four guardsmen", [cx, 1.4, 3.0], 0.5]] }; },
  // "...the army swimming baths": the gate and its sign, the four halted in front of it, the captain stepping up
  baths: (s, f) => { const mk = (k: number, who: string): Person3 => ({ ...P(who, ROW(k), "neutral", 1), towel: true });
    return { light: "noon", dof: 0.5, people: [mk(0, "g1"), mk(1, "g2"), mk(2, "g3"), mk(3, "g4"), P("cap", St(BATHS_X + BA[0], 0, 2.4), "stern", -1)],
      cam: move({ pos: St(BATHS_X + BA[1], 2.2, BA[2]), look: St(BATHS_X + BA[3], 3.0, WZ), fov: 50, roll: -0.03 }, { pos: St(BATHS_X + BA[1] - 0.4, 1.8, BA[2] + 1.1), look: St(BATHS_X + BA[3] - 0.2, 2.7, WZ), fov: 50, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the baths sign", St(BATHS_X, 4.75, WZ - 0.32), 0.3]] }; },
  // "By order of the Kaiser, you're with me.": the captain, low and close, finger up; one setup, a slow push (dialogue)
  order: (s, f) => { const p = St(BATHS_X - 2.2, 0, 2.6), hand: V3 = add(p, -0.24, 1.78, -0.25);
    return { light: "noon", dof: 1.2, people: [P("cap", p, "stern", 0, { hw: [hand] })],
      cam: move({ pos: add(p, 0.25, 0.95, -2.3), look: add(p, 0, 1.6, 0), fov: 42, roll: 0.07 }, { pos: add(p, 0.2, 1.0, -1.95), look: add(p, 0, 1.62, 0), fov: 42, roll: 0.06 }, f, s.a, s.b, smooth, 0), subjects: [["the captain's raised finger", hand, 0.15]] }; },
  // "They saluted.": the four in a row, hands to their helmets, towels still on their shoulders (a whip in)
  salute: (s, f) => { const row = [0, 1, 2, 3].map((k) => ROW(k)), sal = (k: number) => clamp01((f - s.a - k * 2) / 5);
    return { light: "noon", dof: 0.9, people: row.map((p, k) => ({ ...P(`g${k + 1}`, p, "stern", 0, sal(k) > 0.5 ? { hw: [salute(p)] } : {}), towel: true })),
      cam: kick(move({ pos: St(BATHS_X + SA[0], 1.55, SA[1]), look: St(BATHS_X + SA[2], 1.45, 3.4), fov: 50, roll: -0.04 }, { pos: St(BATHS_X + SA[0], 1.5, SA[1] + 0.5), look: St(BATHS_X + SA[2], 1.45, 3.4), fov: 50, roll: 0.02 }, f, s.a, s.b, smooth, 0), f, W(3, "saluted"), 0.7),
      subjects: [["the four saluting", St(BATHS_X + SA[2], 1.55, 3.4), 0.4]] }; },
  // --- 4: "Six more joined from the shooting range." six with rifles march in from the other side ---
  six: (s, f) => { const tt = t(f - s.a), x0 = St(BATHS_X - 4.0, 0, 0)[0], v = 1.4, cx = x0 - 1.1 + v * tt, u = U(s, f);
    return { light: "noon", dof: 0.6, people: [5, 6, 7, 8, 9, 10].map((n, k) => walker(`g${n}`, x0 - 1.1 * Math.floor(k / 2), 0, 1.4 + (k % 2) * 1.0, v, tt, "neutral")),
      cam: { pos: [cx + SX[0], SX[1] - 0.3 * u, SX[2]], look: [cx + SX[3], 1.3, 1.9], fov: 50, roll: 0.03 - 0.06 * u },
      subjects: [["the six", [cx, 1.4, 1.9], 0.6]] }; },
  // "Beer, sausages,": the beer hall table, steins coming down, a sausage on a fork (macro, top-down tilt)
  beer: (s, f) => { const st = hookState(f), cam = move({ pos: Rm(1.5, TABLE.y + 0.75, TABLE.z - 1.7), look: Rm(1.05, TABLE.y + 0.12, TABLE.z), fov: 44, roll: -0.08 }, { pos: Rm(0.9, TABLE.y + 0.7, TABLE.z - 1.6), look: Rm(0.65, TABLE.y + 0.1, TABLE.z), fov: 44, roll: 0.05 }, f, s.a, s.b, smooth, 0);
    return { ...st, light: "pub", dof: 1.6, closeup: true, people: [], tools: [], cam, subjects: [["the steins", [cam.look[0] - 0.05, TABLE.y + 0.12, TABLE.z - 0.15], 0.1]] }; },
  // "and one mark each.": the captain's hand drops coins into a guardsman's open palm
  mark: (s, f) => { const tt = t(f - s.a), cp = Rm(0.45, 0, TABLE.z + 0.62), gp = Rm(-0.45, 0, TABLE.z + 0.6), from: V3 = Rm(0.12, 1.32, TABLE.z + 0.08), to: V3 = Rm(-0.12, 1.08, TABLE.z + 0.08);
    return { light: "pub", dof: 1.4, people: [P("cap", cp, "smile", -1, { hw: [from] }), P("b1", gp, "grin", 1, { hw: [to] })], cards: coinDrop(from, to, tt, 6), key: Rm(0.6, 2.6, 0.3),
      cam: move({ pos: Rm(0.05, 1.5, TABLE.z - MK[0]), look: Rm(0, 1.25, TABLE.z + 0.3), fov: 44, roll: 0.06 }, { pos: Rm(0, 1.48, TABLE.z - MK[0] + 0.3), look: Rm(0, 1.25, TABLE.z + 0.3), fov: 44, roll: -0.04 }, f, s.a, s.b, smooth, 0), subjects: [["the coins", L3(from, to, 0.6), 0.12]] }; },
  // --- 5: "Then he took them by train": the column marches into the station (left to right on screen) ---
  train: (s, f) => { const tt = t(f - s.a), x0 = St(STATION_X + 2.4, 0, 0)[0], v = -1.5, cx = x0 + 1.3 + v * tt, u = U(s, f);
    return { light: "noon", dof: 0.5, people: [walker("cap", x0, 0, 4.2, v, tt, "grin"), ...[1, 2, 3, 4, 5, 6].map((n, k) => walker(`g${n}`, x0 + 1.0 + 0.9 * Math.floor(k / 2), 0, 3.5 + (k % 2) * 1.1, v, tt, "neutral"))],
      cam: { pos: [cx + TR[0], TR[1] - 0.4 * u, TR[2]], look: [cx + TR[3], TR[4], WZ], fov: 54, roll: -0.03 + 0.06 * u },
      subjects: [["the station sign", St(STATION_X, 6.7, WZ - 0.04), 0.3]] }; },
  // "to a town hall outside Berlin.": a crane up the town hall's front to the tower, the squad marching in below
  hall: (s, f) => { const tt = t(f - s.a), v = 1.2;
    return { light: "aft", dof: 0.4, gate: 0.2, people: [walker("cap", Sq(HX[0], 0, 0)[0], AP, TZ - 3.2, v, tt, "grin"), ...[1, 2, 3, 4].map((n, k) => walker(`g${n}`, Sq(HX[0] - 1.1 - HX[1] * k, 0, 0)[0], AP, TZ - 2.6 - (k % 2) * 0.9, v, tt, "neutral"))],
      cam: move({ pos: Sq(1, 1.2, -9), look: Sq(-1, HLY, TZ), fov: 56, roll: 0.03 }, { pos: Sq(0, 4.5, -13), look: Sq(-3, 10, TZ), fov: 56, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      subjects: [["the town hall", Sq(0, 6, TZ), 0.8]] }; },
  // --- 6: "The mayor asked one question." the office: mayor behind the desk, the captain in front, two guards ---
  mayor: (s, f) => ({ light: "office", dof: 0.9, people: [P("mayor", MAYOR, "neutral", -1), P("cap", CAPO, "stern", 1), ...officeGuards()],
    cam: move({ pos: Rm(0.6, 1.9, MY[0]), look: Rm(MY[1], 1.3, 1.0), fov: 56, roll: -0.04 }, { pos: Rm(0.3, 1.8, MY[0] + 0.4), look: Rm(-0.3, 1.3, 1.0), fov: 56, roll: 0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the mayor", add(MAYOR, 0, 1.5, 0), 0.3]] }),
  // "Where is your warrant?": the mayor, palm out; one setup, a slow push (dialogue)
  where: (s, f) => { const palm: V3 = add(MAYOR, -0.3, 1.18, -0.45);
    return { light: "office", dof: 1.3, people: [P("mayor", MAYOR, "stern", -1, { hw: [palm] })],
      cam: move({ pos: add(MAYOR, -0.35, 1.45, -2.4), look: add(MAYOR, 0, 1.45, 0), fov: 42, roll: -0.06 }, { pos: add(MAYOR, -0.3, 1.47, -2.05), look: add(MAYOR, 0, 1.47, 0), fov: 42, roll: -0.05 }, f, s.a, s.b, smooth, 0), subjects: [["the mayor's open palm", palm, 0.12]] }; },
  // "He pointed at the bayonets.": the captain points; the camera slides along two rifles, bayonets fixed
  bayonets: (s, f) => { const u = U(s, f), pt: V3 = add(CAPO, 0.55, 1.45, 0.25), g1 = Rm(-2.0, 0, 1.4), g2 = Rm(-2.45, 0, 1.5);
    return { light: "office", dof: 1.0, people: [P("cap", CAPO, "smile_closed", 1, { hw: [add(CAPO, -0.55, 1.45, 0.3)] }), P("g6", g1, "stern", 0), P("g5", g2, "stern", 0)],
      cam: move({ pos: Rm(BY[0], 1.7, BY[1]), look: Rm(BY[2], 1.5, 0.9), fov: 46, roll: 0.05 }, { pos: Rm(BY[0], 1.75, BY[1] + 0.5), look: Rm(BY[2], 1.6, 1.0), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0), subjects: [["the rifles", Rm(-2.3, 1.7, 1.25), 0.4]] }; },
  // "These are my warrant.": the captain, low and close, the grin (punch on "warrant")
  mine: (s, f) => ({ light: "office", dof: 1.3, people: [P("cap", CAPO, "grin", 0)],
    cam: kick(move({ pos: add(CAPO, 0.4, 0.9, -2.1), look: add(CAPO, 0, 1.6, 0), fov: 42, roll: 0.09 }, { pos: add(CAPO, 0.3, 0.95, -1.85), look: add(CAPO, 0, 1.62, 0), fov: 42, roll: 0.07 }, f, s.a, s.b, smooth, 0), f, W(6, "warrant"), 1), subjects: [["the captain", add(CAPO, 0, 1.55, 0), 0.3]] }),
  // --- 7: "He had the mayor hauled off to Berlin under guard": out through the gate between two guards, his wife after ---
  hauled: (s, f) => { const tt = t(f - s.a), v = -1.0, x0 = Sq(GATE.x + 0.4, 0, 0)[0], z = Sq(0, 0, TZ - 2.6)[2], cx = x0 + v * tt + 0.4, u = U(s, f);
    return { light: "aft", dof: 0.7, gate: 1.4, people: [walker("g3", x0 + 0.85, AP, TZ - 2.6, v, tt, "stern"), walker("mayor", x0, AP, TZ - 2.6, v, tt, "shock"), walker("g4", x0 - 0.85, AP, TZ - 2.6, v, tt, "stern"), walker("wife", x0 + 1.7, AP, TZ - 2.2, v, tt, "nervous")],
      cam: { pos: [cx + HA[0], 1.6, z + HA[1]], look: [cx, 1.6, z + 0.4], fov: 50, roll: 0.04 - 0.07 * u }, subjects: [["the mayor", [x0 + v * tt, 1.5, z], 0.3]] }; },
  // "and the treasurer count out the town's cash": the cash box open, notes and coins on the desk, the captain's sacks
  count: (s, f) => { const tt = t(f - s.a), hand: V3 = Rm(-0.15, DESK.y + 0.22 + 0.06 * Math.abs(Math.sin(tt * 8)), DESK.z + 0.05);
    return { light: "office", dof: 1.2, cashbox: { open: 1 }, bills: true, people: [P("treas", TREAS, "nervous", 1, { hw: [hand] }), P("cap", Rm(0.75, 0, DESK.z - DESK.hd - 0.45), "grin", -1, { hw: [Rm(0.4, 1.05, DESK.z - DESK.hd - 0.35)] })],
      sacks: [Rm(0.4, 1.05, DESK.z - DESK.hd - 0.35)], cards: Array.from({ length: 4 }, (_, i) => ({ kind: "note" as const, p: Rm(-0.2 + 0.12 * i, DESK.y + 0.01 + 0.002 * i, DESK.z - 0.2), spin: 0.3 * i, s: 1.2, flat: true })),
      cam: move({ pos: Rm(0.2, 2.1, -3.1), look: Rm(0.15, DESK.y + 0.4, DESK.z - 0.2), fov: 54, roll: -0.05 }, { pos: Rm(0.15, 2.0, -2.8), look: Rm(0.15, DESK.y + 0.4, DESK.z - 0.2), fov: 54, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the cash box", Rm(0.35, DESK.y + 0.15, DESK.z - 0.05), 0.2]] }; },
  // --- 8: "Then he signed a receipt..." top down: the pen writing on the receipt ---
  sign: (s, f) => { const tt = t(f - s.a), x = -0.55 + 0.4 * clamp01(tt / 1.6), g: V3 = Rm(x + 0.05, DESK.y + 0.16, DESK.z - 0.2), b: V3 = Rm(x - 0.02, DESK.y + 0.005, DESK.z - 0.12 + 0.01 * Math.sin(tt * 20));
    return { light: "office", dof: 1.5, closeup: true, receipt: true, people: [P("cap", Rm(-0.3, 0, DESK.z - DESK.hd - 0.35), "smile_closed", 0, { hw: [g], extra: true })], tools: [{ kind: "quill", g, b }],
      cam: move({ pos: Rm(-0.3, DESK.y + 1.1, DESK.z - 0.55), look: Rm(-0.35, DESK.y, DESK.z - 0.29), fov: 44, roll: 0.1 }, { pos: Rm(-0.35, DESK.y + 0.9, DESK.z - 0.45), look: Rm(-0.35, DESK.y, DESK.z - 0.29), fov: 44, roll: -0.05 }, f, s.a, s.b, smooth, 0),
      subjects: [["the receipt", Rm(-0.35, DESK.y, DESK.z - 0.15), 0.1]] }; },
  // "...with the name of his old prison warden.": the signature, close (the pill overlay names him)
  warden: (s, f) => ({ light: "office", dof: 1.6, closeup: true, receipt: true,
    cam: kick(move({ pos: Rm(-0.32, DESK.y + 0.62, DESK.z - 0.42), look: Rm(-0.35, DESK.y, DESK.z - 0.22), fov: 40, roll: -0.06 }, { pos: Rm(-0.34, DESK.y + 0.52, DESK.z - 0.36), look: Rm(-0.35, DESK.y, DESK.z - 0.22), fov: 40, roll: 0.04 }, f, s.a, s.b, smooth, 0), f, W(8, "warden"), 0.6),
    subjects: [["the signature", Rm(-0.35, DESK.y, DESK.z - 0.12), 0.1]] }),
  // --- 9: "He walked off with more than three and a half thousand marks": across the square, a mail sack in each hand ---
  walk: (s, f) => { const tt = t(f - s.a), v = -1.1, x0 = Sq(1.5, 0, 0)[0], w = walker("cap", x0, AP, TZ - 4.5, v, tt, "grin"), hp: V3 = add(w.p, 0, 0.82, -0.15);
    return { light: "aft", dof: 0.6, gate: 1.4, people: [{ ...w, side: { ...w.side!, carry: hp } }], sacks: [add(hp, 0.12, 0.05, -0.05), add(hp, -0.15, 0.05, -0.08)],
      cam: move({ pos: Sq(0.6, 1.4, TZ - 11.5), look: Sq(0.8, 1.4, TZ - 4.5), fov: 46, roll: -0.03 }, { pos: Sq(-1.6, 1.5, TZ - 11), look: Sq(-1.4, 1.4, TZ - 4.5), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the sacks", hp, 0.2]] }; },
  // "and bought himself a new suit.": out of the HERRENMODEN in a new suit, a turn for the camera
  suit: (s, f) => { const p = St(TAILOR_X - 0.2, PAVE, WZ - 1.3); return { light: "noon", dof: 0.9, people: [P("suit", p, "smile_closed", 0, { hw: [add(p, -0.3, 1.38, -0.2)] })], sacks: [add(p, 0.38, 0.82, -0.2)],
    cam: move({ pos: St(TAILOR_X + 0.3, 1.2, WZ - 6.5), look: St(TAILOR_X, 2.2, WZ), fov: 48, roll: 0.06 }, { pos: St(TAILOR_X, 1.35, WZ - 5.2), look: St(TAILOR_X, 2.1, WZ), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the tailor's sign", St(TAILOR_X, 3.25, WZ - 0.16), 0.3]] }; },
  // --- 10: "a uniform worked like a master key.": he walks at the gate and the leaves swing open by themselves ---
  key: (s, f) => { const tt = t(f - s.a), u = U(s, f), w = walker("cap", Sq(GATE.x - 2.2, 0, 0)[0], AP, TZ - 2.4, 0.8, tt, "smile");
    return { light: "aft", dof: 0.7, gate: 1.45 * smooth(u * 1.6), people: [w, ...gateGuards("stern").slice(0, 2).map((q) => ({ ...q, hw: [salute(q.p)] }))],
      cam: move({ pos: Sq(-0.6, 1.5, TZ - 14), look: Sq(-0.4, 2.0, TZ - 1), fov: 54, roll: 0.05 }, { pos: Sq(-0.3, 1.55, TZ - 13), look: Sq(0, 2.0, TZ - 1), fov: 54, roll: -0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the gate", Sq(GATE.x, 2.0, TZ + 0.3), 0.6]] }; },
  // "And nobody asks a key for ID.": one guardsman, deadpan, saluting, the captain's shoulder sliding past
  noid: (s, f) => { const gp = Sq(GATE.x + 2.6, AP, TZ - 1.5); return { light: "aft", dof: 1.1, gate: 1.45, people: [P("g1", gp, "neutral", 0, { hw: [salute(gp)] })],
    cam: move({ pos: add(gp, -0.4, 1.4, -2.4), look: add(gp, 0, 1.5, 0), fov: 42, roll: -0.05 }, { pos: add(gp, -0.3, 1.45, -2.1), look: add(gp, 0, 1.5, 0), fov: 42, roll: 0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the guardsman", add(gp, 0, 1.5, 0), 0.3]] }; },
  // --- 11: "Ten days later he was caught": at breakfast in his lodgings (the beer hall's table), two policemen behind him ---
  caught: (s, f) => { const p = Rm(0, 0, TABLE.z + 0.62), br: V3 = add(p, 0.25, 1.25, -0.35);
    return { light: "pub", dof: 1, people: [P("voigt", p, "shock", 0, { hw: [br] }), P("cop1", Rm(0.7, 0, TABLE.z + 1.4), "stern", -1, { hw: [add(Rm(0.7, 0, TABLE.z + 1.4), -0.45, 1.35, -0.45)] }), P("cop2", Rm(-0.7, 0, TABLE.z + 1.4), "stern", 1)], tools: [{ kind: "bread", g: br, b: br }], key: Rm(0.6, 2.6, 0.3),
      cam: kick(snap(Rm(0.2, 1.65, -2.3), Rm(0, 1.45, TABLE.z + 0.9), f, s.a, { fov: 50, roll: 0.05 }), f, W(11, "caught"), 0.8), subjects: [["the man at breakfast", add(p, 0, 1.5, 0), 0.3]] }; },
  // "and the whole world laughed.": a Berlin pavement, people with the papers, laughing
  laugh: (s, f) => { const tt = t(f - s.a), row: [string, V3, Expr][] = [["p1", St(7.3, PAVE, WZ - 1.8), "laugh"], ["p3", St(6.4, PAVE, WZ - 1.3), "laugh"], ["p2", St(5.5, PAVE, WZ - 1.9), "grin"], ["boy", St(4.7, PAVE, WZ - 1.5), "laugh"], ["p4", St(LA[1], PAVE, WZ - 1.4), "laugh"]];
    const papers: { p: V3; head: NewsKey; s: number; roll: number }[] = [{ p: add(row[0][1], -0.2, 1.25, -0.35), head: "fake", s: 0.9, roll: 0.06 * Math.sin(tt * 9) }, { p: add(row[2][1], 0.15, 1.25, -0.35), head: "ha", s: 0.9, roll: -0.05 * Math.sin(tt * 8) }, { p: add(row[3][1], 0, 1.0, -0.3), head: "cap", s: 0.75, roll: 0.07 * Math.sin(tt * 10) }];
    return { light: "noon", dof: 0.8, people: row.map(([w, p, e], i) => P(w, p, e, 0, i === 0 || i === 2 || i === 3 ? { hw: [add(papers[i === 0 ? 0 : i === 2 ? 1 : 2].p, 0, -0.2, 0)] } : {})), news: papers,
      cam: move({ pos: St(6.7, 1.7, WZ - LA[0]), look: St(6.4, 1.4, WZ - 1.6), fov: 46, roll: -0.04 }, { pos: St(6.2, 1.65, WZ - LA[0] + 0.7), look: St(6.4, 1.4, WZ - 1.6), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the papers", add(row[0][1], -0.2, 1.25, -0.35), 0.2]] }; },
  // "In the end, even the Kaiser let him go.": the Kaiser at his desk, the paper in his hand, laughing
  kaiser: (s, f) => { const p = Rm(0, 0, DESK.z + DESK.hd + 0.35), pp: V3 = add(p, 0.5, 1.02, -0.5);
    return { light: "palace", dof: 1, people: [P("kaiser", p, "laugh", 0, { hw: [add(pp, 0.1, -0.18, 0)] })], news: [{ p: pp, head: "fake", s: 0.62, roll: 0.05 * Math.sin(t(f) * 12) }],
      cam: kick(move({ pos: Rm(0.3, 1.4, -1.4), look: add(p, 0, 1.45, 0), fov: 46, roll: 0.06 }, { pos: Rm(0.15, 1.45, -1.0), look: add(p, 0, 1.5, 0), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, W(11, "go"), 0.6), subjects: [["the Kaiser", add(p, 0, 1.5, 0), 0.3]] }; },
  // --- 12: "He'd later swear he only did it to get a passport.": in his new suit, hand up as if under oath ---
  swear: (s, f) => { const p = St(TAILOR_X + 2.2, PAVE, WZ - 1.6); return { light: "noon", dof: 1.1, people: [P("suit", p, "smile_closed", 0, { hw: [add(p, -0.42, 1.7, -0.15)] })],
    cam: move({ pos: add(p, 0.6, 1.3, -2.8), look: add(p, 0, 1.55, 0), fov: 42, roll: 0.05 }, { pos: add(p, 0.4, 1.38, -2.4), look: add(p, 0, 1.58, 0), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the raised hand", add(p, -0.42, 1.7, -0.15), 0.12]] }; },
  // "Small problem.": the board by the town hall gate, the offices one by one (a tilt down the list)
  board: (s, f) => ({ light: "aft", dof: 1.4, closeup: true, gate: 0,
    cam: move({ pos: Sq(BOARD[0] - 1.6, BOARD[1] - 0.2, BOARD[2] - 7.5), look: Sq(BOARD[0] - 0.9, BOARD[1] - 0.5, BOARD[2]), fov: 40, roll: 0.04 }, { pos: Sq(BOARD[0] - 0.35, BOARD[1] - 0.45, BOARD[2] - 4.3), look: Sq(BOARD[0], BOARD[1] - 0.57, BOARD[2]), fov: 40, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the board", Sq(BOARD[0], BOARD[1], BOARD[2]), 0.2]] }),
  // "That town hall couldn't issue passports.": the whole board in shot, no passport office on it (the stamp says so)
  nopass: (s, f) => ({ light: "aft", dof: 1.2, closeup: true, gate: 0,
    cam: kick(move({ pos: Sq(BOARD[0] - 0.3, BOARD[1] - 0.45, BOARD[2] - 3.9), look: Sq(BOARD[0], BOARD[1] - 0.57, BOARD[2]), fov: 40, roll: -0.04 }, { pos: Sq(BOARD[0] - 0.25, BOARD[1] - 0.45, BOARD[2] - 3.6), look: Sq(BOARD[0], BOARD[1] - 0.57, BOARD[2]), fov: 40, roll: 0.02 }, f, s.a, s.b, smooth, 0), f, W(12, "passports"), 0.7),
    subjects: [["the board", Sq(BOARD[0], BOARD[1], BOARD[2]), 0.2]] }),
  // --- 13: "Four years later, he finally got one...": the Luxembourg counter, the clerk hands over the passport ---
  lux: (s, f) => { const u = U(s, f), cp = Rm(-1.7, 0, DESK.z + 0.25), vp = Rm(-1.1, 0, DESK.z - DESK.hd - 0.45), pass: V3 = L3(add(cp, 0.3, 1.1, -0.6), add(vp, 0.25, 1.15, 0.45), smooth(u * 1.5));
    return { light: "lux", dof: 1, people: [P("clerk", cp, "smile", -1, { hw: [u < 0.66 ? pass : add(cp, 0.2, 1.0, -0.3)] }), P("suit", vp, "smile", 1, { hw: [u > 0.4 ? pass : add(vp, 0.2, 1.0, 0.2)] })], cards: [{ kind: "passport", p: pass, spin: -0.1, s: 1.3 }],
      cam: move({ pos: Rm(-0.85, 1.65, -3.0), look: Rm(-1.0, 1.35, DESK.z - 0.3), fov: 56, roll: 0.04 }, { pos: Rm(-0.9, 1.6, -2.75), look: Rm(-1.0, 1.35, DESK.z - 0.3), fov: 56, roll: -0.03 }, f, s.a, s.b, smooth, 0), subjects: [["the passport", pass, 0.1]] }; },
  // "...from Luxembourg.": he holds it up, deadpan; the flag behind him (kept screen right of the subscribe mascot's spot)
  luxpass: (s, f) => { const vp = Rm(-1.4, 0, DESK.z - DESK.hd - 0.3), pass: V3 = add(vp, 0.32, 1.48, -0.3);
    return { light: "lux", dof: 1.2, people: [P("suit", vp, "neutral", 0, { hw: [add(pass, 0, -0.08, 0)] })], cards: [{ kind: "passport", p: pass, spin: -0.06, s: 1.5 }],
      cam: kick(move({ pos: add(vp, 0.5, 1.5, -2.7), look: add(vp, 0.3, 1.5, 0), fov: 46, roll: -0.04 }, { pos: add(vp, 0.45, 1.5, -2.5), look: add(vp, 0.3, 1.52, 0), fov: 46, roll: 0.02 }, f, s.a, s.b, smooth, 0), f, W(13, "luxembourg"), 0.6), subjects: [["the passport", pass, 0.1]] }; },
  // the loop: back to the hook's framing
  end: (s, f) => ({ ...hookState(f - s.a + 30), light: "pub", dof: 1, focus: Rm(0, 1.4, TABLE.z + 0.2), cam: hookCam(0) }),
};

/** tilt these shots down a little (metres off the look point) so faces sit above the captions */
const TILT: Record<string, number> = { gate: 0.8, shops: 0.5, baths: 1.3, order: 0.2, mine: 0.2, train: 2.5, suit: 0.5, notoff: 0.15, fit: 0.15, kaiser: 0.2 };
export const specAt = (s: ShotDef, f: number): St3 => {
  const st0 = SPECS[s.g](s, f), st = TILT[s.g] ? { ...st0, cam: { ...st0.cam, look: [st0.cam.look[0], st0.cam.look[1] - TILT[s.g], st0.cam.look[2]] as V3 } } : st0, c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? 0 : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["gate", "notoff", "prison", "swim", "six", "train", "hall", "hauled", "walk", "key", "laugh", "kaiser", "swear", "lux"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags, speech and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "10", kind: "call", text: "10 SOLDIERS", f0: W(0, "10"), f1: B("hook"), y: 14, fg: "#ffd166", size: 120 },
  { key: "arrest", kind: "stamp", text: "ARRESTED!", f0: W(0, "arrest") + 2, f1: B("arrest"), y: 13, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 120 },
  { key: "fake", kind: "stamp", text: "NOT AN OFFICER", f0: W(1, "officer"), f1: B("notoff"), y: 13, rot: 4, bg: "#e0332e", fg: "#ffffff", size: 96 },
  { key: "57", kind: "pill", text: "WILHELM VOIGT", sub: "shoemaker, 57", f0: S0("shoe") + 6, f1: B("shoe"), y: 12, size: 74 },
  { key: "prison", kind: "call", text: "JUST OUT OF PRISON", f0: W(1, "just"), f1: B("prison"), y: 14, fg: "#ffffff", size: 96 },
  { key: "pieces", kind: "call", text: "PIECE BY PIECE", f0: W(1, "piece"), f1: B("pieces"), y: 14, fg: "#ffd166", size: 110 },
  { key: "berlin", kind: "pill", text: "BERLIN, OCT. 16, 1906", sub: "about noon", f0: S0("swim") + 4, f1: B("swim"), y: 12, size: 62 },
  { key: "kaiser", kind: "call", text: "BY ORDER OF THE KAISER!", f0: W(3, "by"), f1: B("order"), y: 14, fg: "#ffffff", size: 84, rot: -3 },
  { key: "mark", kind: "stamp", text: "1 MARK EACH", f0: W(4, "1"), f1: B("mark"), y: 13, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 110 },
  { key: "koep", kind: "pill", text: "KÖPENICK", sub: "2:46 PM", f0: W(5, "town"), f1: B("hall"), y: 12, size: 90 },
  { key: "warrant", kind: "call", text: "\"WHERE IS YOUR WARRANT?\"", f0: W(6, "where"), f1: B("where"), y: 14, fg: "#ffffff", size: 72 },
  { key: "my", kind: "call", text: "\"THESE ARE MY WARRANT.\"", f0: W(6, "these"), f1: B("mine"), y: 14, fg: "#ffd166", size: 72, rot: 3 },
  { key: "malz", kind: "pill", text: "\"VON MALZAHN\"", sub: "his old prison's director", f0: W(8, "name"), f1: B("warden"), y: 13, size: 80 },
  { key: "3500", kind: "stamp", text: "3,500+ MARKS", f0: W(9, "3,500"), f1: B("walk"), y: 13, rot: -4, bg: "#e8c45a", fg: "#120c16", size: 110 },
  { key: "10d", kind: "stamp", text: "CAUGHT IN 10 DAYS", f0: W(11, "caught"), f1: B("caught"), y: 13, rot: 4, bg: "#e0332e", fg: "#ffffff", size: 84 },
  { key: "pardon", kind: "stamp", text: "PARDONED", f0: W(11, "go"), f1: B("kaiser"), y: 13, rot: -5, bg: "#2f9a57", fg: "#ffffff", size: 120 },
  { key: "pass", kind: "call", text: "A PASSPORT?", f0: W(12, "passport"), f1: B("swear"), y: 14, fg: "#ffd166", size: 120 },
  { key: "nopass", kind: "stamp", text: "NO PASSPORT OFFICE", f0: W(12, "passports") - 6, f1: B("nopass"), y: 13, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 84 },
] as Item[]);
