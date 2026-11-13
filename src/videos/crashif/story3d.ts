// The 1929 "what if" long-form's 3D shots, as specs: for a shot key (timeline.ts `g`) and frame, the light, camera, how
// the street and the room are dressed, the cast, and the subjects the narration is about (for the framing check).
// Camera grammar is the house one (every shot an orbit, crane, dive, tracking move, long-lens slide or snap zoom;
// Dutch tilts; handheld sway on everything; a kick on every hit).
// Street space: Wall Street runs along x, the Exchange is on the +z side at x = 0, the bank at x = 46. Cameras sit
// mostly on the -z side looking north; the cross street opposite the Exchange (x -14..14, z < -6) is open for long lenses.
import { Expr } from "../bridge/toon";
import { FPS, ShotDef, wordAt, segAt } from "./timeline";

export type V3 = [number, number, number];
/** sidewalk height; the room's origin (far from the street) */
export const SW = 0.14;
export const ROOM_O: V3 = [1400, 0, 1400];
const at = (o: V3) => (x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
export const Rm = at(ROOM_O);
const S = (x: number, y: number, z: number): V3 => [x, y, z];
/** standing on the road / on a sidewalk */
const Rd = (x: number, z: number): V3 => [x, 0, z];
const Nw = (x: number, z: number): V3 => [x, SW, z];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean; side?: { phase: number; mirror: boolean; stride?: number } };
type Num = { text: string; bg?: string; fg?: string; k?: number; p: V3; yaw?: number };
type Card = { kind: "slip" | "sell" | "bill"; p: V3; spin: number; s: number };
type News = [string, string, string, string];
export type St3 = {
  light: "day" | "golden" | "grey" | "night"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; wipe?: { color: string; a: number }; subjects?: [string, V3, number][];
  street?: { bank?: { sign?: [string, string]; open?: number; notice?: [string, string?, string?] | null; noticeY?: number; noticeX?: number }; news?: News; cars?: { x: number; z: number; dir: 1 | -1 }[] };
  room?: { sign: [string, string]; table?: boolean; podium?: boolean; post?: [string, string?, string?] | null; ticker?: number; bed?: boolean; flag?: boolean; cash?: V3[]; gold?: number; goldAt?: V3 };
  cash?: V3[]; num?: Num | null; suitcase?: V3; paper?: { p: V3; s: number; news: News; spin?: number };
  cards?: Card[];
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


// ---------------- stages ----------------
const PLAZA: V3 = S(0, 1.45, -3);            // the road in front of the Exchange
const YOU0: V3 = Rd(0, -3);
const BANKC: V3 = S(45, SW + 1.4, 8.4);      // the sidewalk in front of the bank doors
const TABLE: V3 = Rm(0.5, 1.2, 0.9);
const FLOOR: [string, string] = ["crfloor", "NEW YORK STOCK EXCHANGE"], MORGAN: [string, string] = ["crmorgan", "J.P. MORGAN & CO. · 23 WALL STREET"];
const SPEECH: [string, string] = ["crspeech", "NATIONAL BUSINESS CONFERENCE"], OFFICE: [string, string] = ["croffice", "BROKER'S OFFICE · WALL STREET"];
const HOME: [string, string] = ["crhome", "YOUR ROOM · NEW YORK"], WH: [string, string] = ["crwh", "THE WHITE HOUSE"];
const BABSON_NEWS: News = ["crbab", "Late Edition", "BABSON PREDICTS", "CRASH IN STOCKS"], PANIC_NEWS: News = ["crpanic", "Late Edition", "WALL ST. IN PANIC", "AS STOCKS CRASH"];
const BOUS: [string, string] = ["crbous", "BANK OF UNITED STATES"], RELIEF: [string, string] = ["crrelief", "FREE BREAD · FREE SOUP"], JPM: [string, string] = ["crjpm", "J.P. MORGAN & CO."];
const GREEN = "#3f9a5a", RED = "#c9373a", WHITE = "#ffffff";
const BEHIND = (names: string[], expr: Expr | Expr[], x0 = -1.6, dx = 1.4): Person3[] =>
  names.map((n, k) => P(n, Rm(x0 + k * dx, 0, 1.75), Array.isArray(expr) ? expr[k % expr.length] : expr, k === 0 ? 1 : k === names.length - 1 ? -1 : 0));
/** extras standing in a block (deterministic jitter); ex picks each one's face */
const crowd = (n: number, x0: number, x1: number, z0: number, z1: number, seed: number, ex: (i: number) => Expr, y = 0, skip = 0): Person3[] => {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cols = Math.max(1, Math.round(Math.sqrt((n * (x1 - x0)) / Math.max(0.5, z1 - z0)))), rows = Math.ceil(n / cols), out: Person3[] = [];
  for (let i = 0; i < n; i++) {
    const cx = i % cols, rz = Math.floor(i / cols);
    out.push({ who: `c${(i + skip) % 48}`, p: [x0 + ((cx + 0.5 + (r() - 0.5) * 0.7) * (x1 - x0)) / cols, y, z0 + ((rz + 0.5 + (r() - 0.5) * 0.6) * (z1 - z0)) / rows], expr: ex(i), look: (i % 3) - 1, extra: true });
  }
  return out;
};
const WORRY: Expr[] = ["nervous", "shock", "stern", "nervous", "dazed", "shock", "pained"], HAPPY: Expr[] = ["laugh", "smile", "grin", "smile_closed", "laugh", "grin"];
const pick = (a: Expr[]) => (i: number) => a[(i * 5 + 2) % a.length];
/** paper in the air round a point: rises, tumbles, wraps */
const flurry = (kind: Card["kind"], n: number, tt: number, c: V3, spread: number, h = 3.2, s = 0.5, seed = 0): Card[] =>
  Array.from({ length: n }, (_, k) => { const q = k + seed * 7.3, y = ((q * 0.371 + tt * (0.35 + (k % 3) * 0.12)) % 1); return { kind, p: [c[0] + Math.sin(q * 2.4 + tt * 1.1) * spread * (0.35 + ((k * 7) % 10) / 14), c[1] + (1 - y) * h, c[2] + Math.cos(q * 1.7) * spread * 0.45] as V3, spin: tt * (2 + (k % 4)) + q, s: s * (0.8 + (k % 3) * 0.2) }; });
/** people streaming past along x on two lanes (extras) */
const passers = (n: number, tt: number, x0: number, x1: number, zs: number[], y = 0, v = 1.5, skip = 0, ex: Expr = "neutral"): Person3[] =>
  Array.from({ length: n }, (_, k) => { const dir = k % 2 ? -1 : 1, span = x1 - x0, sp = v * (0.85 + ((k * 3) % 5) * 0.08), x = x0 + ((((k * 0.618 * span + dir * sp * tt) % span) + span) % span);
    return { ...walker(`c${(k * 5 + skip) % 48}`, x, y, zs[k % zs.length] + ((k * 7) % 5) * 0.12, 0, 0, ex, k), p: [x, y, zs[k % zs.length] + ((k * 7) % 5) * 0.12] as V3, side: { phase: (((sp * tt) / 1.6 + k * 0.37) % 1 + 1) % 1, mirror: dir < 0, stride: 0.8 }, extra: true }; });
const FLOORX = (ex: Expr[], seed = 3): Person3[] => crowd(9, -6.2, 6.2, 2.3, 3.0, seed, pick(ex), 0, 33).map((q) => ({ ...q, wave: 0.7 }));
const STREET_GREY = { light: "grey" as const }, STREET_DAY = { light: "day" as const }, STREET_GOLD = { light: "golden" as const };
const bankCam = (s: ShotDef, f: number, a: [number, number] = [-22, 18], r: [number, number] = [8.4, 7.0], roll: [number, number] = [0.05, -0.04]) => orbit(s, f, BANKC, a, r, [0.5, 0.25], 42, roll);
const NEIGH = (ex: Expr | Expr[], x0 = 44.2, dx = 1.15): Person3[] => ["mother", "kid", "oldman", "grocer", "lady"].map((n, k) => P(n, Nw(x0 + k * dx, 8.5 + (k % 2) * 0.35), Array.isArray(ex) ? ex[k % ex.length] : ex, -1));

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- cold open: October 29 ----------------
  "open-wide": (s, f) => ({ ...STREET_GREY, dof: 0,
    cam: move({ pos: S(-8, 52, -78), look: S(0, 8, 8), fov: 52, roll: 0.07 }, { pos: S(2, 5.5, -22), look: S(0, 6.5, 10), fov: 46, roll: -0.03 }, f, s.a, s.b - 2, smooth, 0),
    people: crowd(60, -12, 12, -7, 5.2, 11, pick(WORRY)), subjects: [["the Exchange sign", S(0, 14.65, 9.8), 1]] }),
  "crowd-low": (s, f) => { const u = smooth(U(s, f)); return { ...STREET_GREY, dof: 5,
    cam: full({ pos: S(-5 + 8 * u, 1.55, -10.5), look: S(-3.4 + 7 * u, 1.5, -4), fov: 26, roll: 0.05 - 0.09 * u }),
    people: [...["oldman", "lady", "worker", "gent", "lady2", "clerk", "grocer"].map((n, k) => P(n, Rd(-5.4 + k * 1.75, -4 + (k % 2) * 0.4), WORRY[k % WORRY.length], k % 3 - 1)), ...crowd(34, -15, 15, -2.6, 5, 5, pick(WORRY), 0, 9)] }; },
  "floor-panic": (s, f) => ({ light: "day", dof: 3, room: { sign: FLOOR, post: ["U.S. STEEL"], ticker: 1 },
    cam: orbit(s, f, Rm(0, 1.5, 0.9), [-34, 26], [9.4, 7.2], [1.3, 0.4], 46, [0.09, -0.07]),
    people: [...FLOORX(WORRY), P("broker", Rm(-2.0, 0, 0.2), "shock", 1, { wave: 0.9 }), P("broker2", Rm(2.0, 0, 0.3), "shock", -1, { wave: 0.85 }), P("broker3", Rm(-3.6, 0, 1.9), "nervous", 1), P("clerk", Rm(3.6, 0, 1.8), "shock", -1, { wave: 0.8 }), P("c2", Rm(0.2, 0, -0.9), "pained", 0, { wave: 0.9, extra: true })],
    cards: [...flurry("slip", 16, t(f), Rm(0, 0.3, 0), 5), ...flurry("sell", 6, t(f), Rm(0.5, 0.6, -0.4), 4, 2.6, 0.5, 3)] }),
  "you-crowd": (s, f) => ({ ...STREET_GREY, dof: 6,
    cam: kick(orbit(s, f, PLAZA, [-22, 16], [7.4, 5.8], [0.6, 0.2], 42, [0.06, -0.04]), f, s.a + 3, 0.7),
    people: [P("you", YOU0, "neutral", 0), ...crowd(30, -9, 9, -1.6, 5, 23, pick(WORRY), 0, 4), P("c7", Rd(-1.9, -3.3), "shock", 1, { extra: true }), P("c12", Rd(1.9, -3.2), "nervous", -1, { extra: true }), P("c21", Rd(-3.6, -2.7), "stern", 1, { extra: true }), P("c30", Rd(3.7, -2.8), "shock", -1, { extra: true })] }),
  "you-calm": (s, f) => ({ ...STREET_GREY, dof: 9, closeup: true,
    cam: move({ pos: S(1.3, 1.62, -6.6), look: S(0, 1.52, -3), fov: 36, roll: -0.06 }, { pos: S(0.55, 1.58, -5.3), look: S(0, 1.52, -3), fov: 33, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", YOU0, "smile_closed", 0, { headTilt: 0.05 }), P("c7", Rd(-1.5, -2.5), "shock", 1, { extra: true }), P("c12", Rd(1.55, -2.4), "nervous", -1, { extra: true }), ...crowd(14, -7, 7, -0.6, 4, 23, pick(WORRY), 0, 14)] }),
  newsstand: (s, f) => ({ ...STREET_DAY, dof: 4, street: { news: BABSON_NEWS },
    cam: move({ pos: S(-18.6, 2.3, -1.4), look: S(-23.2, 1.1, -8.4), fov: 46, roll: 0.07 }, { pos: S(-22.0, 1.25, -5.4), look: S(-22.9, 0.9, -8.3), fov: 36, roll: -0.03 }, f, s.a, s.b - 4, smooth, 0),
    people: [P("newsboy", Nw(-21.5, -8.6), "laugh", 1, { wave: 0.9 })], subjects: [["the headline", S(-22.9, 0.86, -8.3), 0.3]] }),
  "news-read": (s, f) => ({ ...STREET_DAY, dof: 6,
    cam: move({ pos: S(-16.4, 1.7, -3.2), look: S(-18, 1.25, -8), fov: 40, roll: -0.05 }, { pos: S(-17.2, 1.5, -4.4), look: S(-18, 1.2, -8), fov: 36, roll: 0.03 }, f, s.a, s.a + 16, expo, 0.001),
    people: [P("oldman", Nw(-18, -8), "neutral", 0), ...passers(5, t(f), -30, -8, [-6.6], SW, 1.4, 3)],
    paper: { p: S(-18, 1.02, -7.5), s: 1.0, news: BABSON_NEWS, spin: 0.04 }, subjects: [["the newspaper", S(-18, 1.02, -7.5), 0.3]] }),
  "didnt-matter": (s, f) => { const u = U(s, f), d = smooth((u - 0.2) / 0.35); return { ...STREET_DAY, dof: 4,
    cam: orbit(s, f, S(-18, 1.2, -8), [20, -14], [6.4, 7.6], [0.8, 1.6], 42, [-0.06, 0.05]),
    people: [P("oldman", Nw(-18 - 2.2 * smooth((u - 0.45) / 0.55), -8), d > 0.5 ? "smile_closed" : "neutral", -1), ...passers(7, t(f), -32, -6, [-6.6, -9.4], SW, 1.5, 11)],
    paper: { p: S(-17.5 + 0.5 * d, 1.02 - 0.92 * d, -7.4 + 0.5 * d), s: 1.0, news: BABSON_NEWS, spin: 0.04 + 2.6 * d } }; },

  // ---------------- September 3 ----------------
  wake: (s, f) => { const hit = W(18, "New"); return { ...STREET_GOLD, dof: 6, street: { cars: [{ x: -30 + 7 * t(f - s.a), z: 3.2, dir: 1 }] },
    cam: kick(snap(S(-1.2, 1.5, -8.6), S(-3, 1.45, -4), f, s.a, { fov: 40, roll: -0.1 }, 1.8, 6), f, hit, 0.9),
    people: [P("you", Rd(-3, -4), f < hit ? "dazed" : "shock", 0, { headTilt: f < hit ? 0.1 : 0 }), ...passers(6, t(f), -16, 16, [1.2, 4.6], 0, 1.4, 20, "smile_closed")] }; },
  "you-know": (s, f) => ({ ...STREET_GOLD, dof: 4,
    cam: move({ pos: S(-4.4, 0.5, -9.4), look: S(-2.6, 3.4, 0), fov: 42, roll: -0.07 }, { pos: S(-3.9, 0.9, -8.2), look: S(-2.8, 2.6, -2), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rd(-3, -4), "nervous", 0)] }),
  rich: (s, f) => ({ ...STREET_DAY, dof: 3,
    cam: orbit(s, f, S(0, 1.6, -2.4), [-36, 30], [12.5, 9.6], [2.2, 0.6], 46, [0.07, -0.05]),
    people: [P("broker", Rd(-1.5, -2.6), "laugh", 1, { wave: 0.9 }), P("gent", Rd(0.3, -2.2), "grin", 0), P("lady", Rd(1.9, -2.6), "laugh", -1, { wave: 0.8 }), P("livermore", Rd(-3.4, -2.0), "smile_closed", 1), P("worker", Rd(3.8, -2.1), "grin", -1, { wave: 0.85 }), ...crowd(18, -11, 11, -0.4, 5, 31, pick(HAPPY), 0, 20)],
    cards: flurry("bill", 14, t(f), S(0, 0.4, -2.4), 6, 3.6, 0.42) }),
  feels: (s, f) => ({ ...STREET_DAY, dof: 6,
    cam: orbit(s, f, S(-5.5, 1.45, -4.4), [24, -10], [6.6, 5.6], [0.4, 0.25], 40, [-0.05, 0.04]),
    people: [P("you", Rd(-5.5, -4.4), "nervous", 1), ...passers(6, t(f), -16, 8, [-2.2, 0.2], 0, 1.5, 6, "laugh")] }),
  forever: (s, f) => ({ ...STREET_DAY, dof: 0,
    cam: move({ pos: S(0, 3, -14), look: S(0, 10, 12), fov: 48, roll: 0.05 }, { pos: S(-10, 74, -80), look: S(0, 34, 24), fov: 56, roll: -0.04 }, f, s.a + 2, s.b - 2, smooth, 0),
    people: crowd(24, -12, 12, -5, 4.6, 31, pick(HAPPY), 0, 20) }),

  // ---------------- attempt 1: tell everyone ----------------
  "corner-say": (s, f) => ({ ...STREET_DAY, dof: 5,
    cam: orbit(s, f, S(-6, 1.45, -4), [-26, 20], [8.6, 7.0], [0.6, 0.3], 42, [0.06, -0.05]),
    people: [P("you", Rd(-6, -4), "nervous", 0, { wave: 0.85 }), ...passers(9, t(f), -18, 8, [-1.6, -6.3], 0, 1.5, 0)] }),
  "crash-say": (s, f) => ({ ...STREET_DAY, dof: 9, closeup: true,
    cam: kick(snap(S(-5.2, 1.6, -7.0), S(-6, 1.5, -4), f, s.a, { fov: 34, roll: 0.08 }, 1.8, 5), f, s.a + 4, 1.0),
    people: [P("you", Rd(-6, -4), "shock", 0, { wave: 0.95 })] }),
  "nobody-slows": (s, f) => { const u = smooth(U(s, f)); return { ...STREET_DAY, dof: 5,
    cam: full({ pos: S(-10 + 6 * u, 1.7, -20), look: S(-8 + 4 * u, 1.4, -4), fov: 22, roll: -0.04 + 0.07 * u }),
    people: [P("you", Rd(-6, -4), "nervous", 0, { wave: 0.7 }), ...passers(12, t(f), -20, 10, [-1.4, -2.6, -5.6, -6.8], 0, 1.7, 0)] }; },
  "babson-speech": (s, f) => ({ light: "day", dof: 4, room: { sign: SPEECH, podium: true },
    cam: move({ pos: Rm(3.8, 2.5, -8.2), look: Rm(0, 1.5, 1.4), fov: 46, roll: 0.07 }, { pos: Rm(1.0, 1.65, -3.8), look: Rm(0, 1.5, 1.5), fov: 38, roll: -0.03 }, f, s.a, s.a + 26, expo, 0.001),
    people: [P("babson", Rm(0, 0, 1.6), "stern", 0, { wave: 0.8 }), P("c9", Rm(-3.4, 0, 2.2), "neutral", 1, { extra: true }), P("c14", Rm(3.4, 0, 2.2), "nervous", -1, { extra: true })] }),
  "news-runs": (s, f) => { const tt = t(f - s.a), x = -14 + 4.2 * tt; return { ...STREET_DAY, dof: 5, street: { news: BABSON_NEWS },
    cam: full({ pos: S(x + 2.6, 1.3, -10), look: S(x + 0.6, 1.15, -3), fov: 38, roll: 0.05 * Math.sin(tt * 2) }),
    people: [walker("newsboy", -14, 0, -3, 4.2, tt, "laugh"), ...passers(8, t(f), -24, 24, [0.4, 2.8, 4.6], 0, 1.4, 14)],
    paper: { p: S(x + 0.55, 1.35, -3.3), s: 0.85, news: BABSON_NEWS, spin: 0.1 * Math.sin(tt * 9) } }; },
  "wont-listen": (s, f) => ({ ...STREET_DAY, dof: 4,
    cam: move({ pos: S(-4.6, 1.6, -9.2), look: S(-6, 1.45, -4), fov: 38, roll: -0.05 }, { pos: S(-1, 5.5, -17), look: S(-6, 1.6, -3), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rd(-6, -4), "dazed", 0, { headTilt: 0.08 }), ...passers(10, t(f), -20, 10, [-1.6, -6.3, 1.8], 0, 1.5, 0)] }),

  // ---------------- attempt 2: the men in charge ----------------
  bankers: (s, f) => ({ light: "day", dof: 4, room: { sign: MORGAN, table: true },
    cam: orbit(s, f, TABLE, [-30, 20], [8.8, 7.2], [1.2, 0.5], 44, [0.06, -0.05]),
    people: BEHIND(["banker2", "lamont", "banker3", "banker4"], "stern"), subjects: [["the room sign", Rm(0, 3.35, 3.4), 0.3]] }),
  "bankers-close": (s, f) => { const u = smooth(U(s, f)); return { light: "day", dof: 7, room: { sign: MORGAN, table: true },
    cam: full({ pos: Rm(-2.6 + 4.6 * u, 1.55, -6), look: Rm(-1.5 + 3.8 * u, 1.45, 1.75), fov: 21, roll: 0.04 - 0.07 * u }),
    people: BEHIND(["banker2", "lamont", "banker3", "banker4"], ["stern", "neutral", "stern", "smile_closed"]) }; },
  ticker: (s, f) => { const u = U(s, f); return { light: "day", dof: 4, room: { sign: OFFICE, ticker: 0.1 + 0.9 * u },
    cam: kick(snap(Rm(-0.9, 1.5, -3.6), Rm(-3.0, 0.9, 0.5), f, s.a, { fov: 42, roll: 0.08 }, 1.6, 6), f, s.a + 5, 0.7),
    people: [P("clerk", Rm(-4.4, 0, 1.5), u > 0.45 ? "shock" : "nervous", 1)],
    cards: flurry("slip", 8, t(f), Rm(-3.0, 0.2, 0), 1.6, 2.2, 0.4), subjects: [["the ticker", Rm(-3.2, 1.15, 0.9), 0.4]] }; },
  "nobody-knows": (s, f) => ({ light: "day", dof: 5, room: { sign: OFFICE, ticker: 1 },
    cam: orbit(s, f, Rm(-0.4, 1.4, 1.2), [18, -16], [7.4, 6.2], [0.7, 0.3], 42, [-0.06, 0.05]),
    people: [P("broker", Rm(-1.6, 0, 1.4), "dazed", 1), P("broker2", Rm(-0.2, 0, 1.6), "nervous", 0), P("broker3", Rm(1.3, 0, 1.4), "shock", -1)],
    cards: [{ kind: "slip", p: Rm(-1.25, 1.05, 1.1), spin: 0.2, s: 0.6 }, { kind: "slip", p: Rm(0.15, 1.0, 1.25), spin: -0.15, s: 0.6 }, { kind: "slip", p: Rm(1.65, 1.05, 1.1), spin: 0.3, s: 0.6 }, ...flurry("slip", 6, t(f), Rm(-2.6, 0.2, 0), 1.4, 2.0, 0.4)] }),
  sell: (s, f) => ({ light: "day", dof: 3, room: { sign: FLOOR, post: ["SELL", RED, WHITE] },
    cam: kick(orbit(s, f, Rm(0, 1.6, 0.9), [28, -24], [8.2, 6.8], [0.5, 1.4], 48, [-0.1, 0.08]), f, s.a + 3, 1.0),
    people: [...FLOORX(WORRY), P("broker", Rm(-2.1, 0, 0.2), "shock", 1, { wave: 0.95 }), P("broker2", Rm(2.1, 0, 0.3), "shock", -1, { wave: 0.9 }), P("broker3", Rm(-3.7, 0, 1.8), "pained", 1, { wave: 0.85 }), P("clerk", Rm(3.7, 0, 1.7), "shock", -1, { wave: 0.9 }), P("c5", Rm(0.1, 0, -1.0), "shock", 0, { wave: 0.9, extra: true }), P("c17", Rm(-5.2, 0, 0.6), "nervous", 1, { wave: 0.8, extra: true }), P("c26", Rm(5.2, 0, 0.5), "shock", -1, { wave: 0.9, extra: true })],
    cards: flurry("sell", 14, t(f), Rm(0, 0.5, -0.2), 6, 3.0, 0.55) }),
  across: (s, f) => { const tt = t(f - s.a); return { ...STREET_GREY, dof: 3, street: { bank: { sign: JPM, open: 1 } },
    cam: move({ pos: S(36, 1.8, -3.5), look: S(42, 2.4, 10), fov: 46, roll: 0.06 }, { pos: S(42, 1.5, 0.5), look: S(46, 3.0, 11), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [...["banker2", "lamont", "banker3", "banker4"].map((n, k) => walker(n, 33.5 - k * 1.5, SW, 9.2, 1.5, tt, "stern", k)), ...crowd(12, 34, 50, 2.6, 5.6, 41, pick(WORRY), 0, 30)],
    subjects: [["the bank sign", S(46, 8.4, 10.1), 0.5]] }; },
  pool: (s, f) => { const u = U(s, f), n = Math.min(4, Math.floor(u * 5.2)); return { light: "day", dof: 4,
    room: { sign: MORGAN, table: true, cash: Array.from({ length: n }, (_, k) => Rm(-1.3 + k * 1.2, 0.8, 0.6)) },
    cam: move({ pos: Rm(0.5, 5.4, -3.0), look: Rm(0.5, 0.9, 0.7), fov: 44, roll: 0.06 }, { pos: Rm(0.5, 2.5, -4.6), look: Rm(0.5, 1.0, 0.8), fov: 38, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: BEHIND(["banker2", "lamont", "banker3", "banker4"], "stern"), subjects: [["the money", Rm(0.5, 0.95, 0.6), 0.5]] }; },
  "whitney-bid": (s, f) => { const hit = W(59, "$205"); return { light: "day", dof: 4, room: { sign: FLOOR, post: ["U.S. STEEL"] },
    cam: kick(move({ pos: Rm(-4.4, 0.7, -5.6), look: Rm(-1.6, 2.2, 0.8), fov: 46, roll: -0.09 }, { pos: Rm(-3.8, 1.0, -4.8), look: Rm(-1.6, 2.1, 0.8), fov: 42, roll: 0.03 }, f, s.a, s.a + 16, expo, 0.001), f, hit, 1.1),
    people: [...FLOORX(WORRY), P("whitney", Rm(-2.0, 0, 0.2), f < hit ? "stern" : "grin", 1, { wave: 0.95 }), P("broker", Rm(2.2, 0, 0.4), "shock", -1), P("broker2", Rm(3.6, 0, 1.7), "nervous", -1), P("broker3", Rm(0.4, 0, -0.6), "shock", 0, { extra: true })],
    num: { text: "205", bg: "#f6efdc", fg: GREEN, k: pop(f, hit), p: Rm(-3.5, 2.75, 0.25) }, subjects: [["the bid", Rm(-3.5, 2.75, 0.25), 0.6]] }; },
  "floor-cheer": (s, f) => ({ light: "day", dof: 3, room: { sign: FLOOR, post: ["205", GREEN, WHITE] },
    cam: orbit(s, f, Rm(0, 1.6, 0.9), [-20, 22], [7.2, 9.4], [0.5, 1.5], 46, [0.06, -0.05]),
    people: [...FLOORX(HAPPY), P("whitney", Rm(-2.0, 0, 0.2), "grin", 1, { wave: 0.9 }), P("broker", Rm(2.1, 0, 0.3), "laugh", -1, { wave: 0.9 }), P("broker2", Rm(3.7, 0, 1.7), "grin", -1, { wave: 0.8 }), P("broker3", Rm(-3.7, 0, 1.8), "laugh", 1, { wave: 0.85 }), P("clerk", Rm(0.2, 0, -1.0), "relief_open", 0, { wave: 0.8, extra: true })],
    cards: flurry("slip", 14, t(f), Rm(0, 0.4, 0), 5, 3.4, 0.45) }),
  hoover: (s, f) => ({ light: "day", dof: 4, room: { sign: WH, table: true, flag: true },
    cam: move({ pos: Rm(-2.6, 2.2, -7.4), look: Rm(0.5, 1.45, 1.6), fov: 44, roll: -0.06 }, { pos: Rm(0.0, 1.6, -4.0), look: Rm(0.5, 1.45, 1.7), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("hoover", Rm(0.5, 0, 1.75), "smile_closed", 0, { wave: 0.5 })], subjects: [["the room sign", Rm(0, 3.35, 3.4), 0.3]] }),
  "bankers-fail": (s, f) => ({ light: "day", dof: 4, room: { sign: MORGAN, table: true, cash: [Rm(-1.3, 0.8, 0.6), Rm(-0.1, 0.8, 0.6), Rm(1.1, 0.8, 0.6), Rm(2.3, 0.8, 0.6)] },
    cam: move({ pos: Rm(1.2, 1.6, -4.0), look: Rm(0.5, 1.4, 1.5), fov: 38, roll: 0.04 }, { pos: Rm(2.8, 2.8, -8.4), look: Rm(0.5, 1.3, 1.4), fov: 46, roll: -0.08 }, f, s.a, s.b, smooth, 0),
    people: BEHIND(["banker2", "lamont", "banker3", "banker4"], ["dazed", "pained", "nervous", "shock"]), cards: flurry("slip", 10, t(f), Rm(0.5, 0.2, 0), 5, 3.6, 0.42) }),
  "money-all": (s, f) => ({ light: "day", dof: 8, focus: Rm(0.5, 0.95, 0.6),
    room: { sign: MORGAN, table: true, cash: [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5, 2.1, 2.7].map((x) => Rm(x, 0.8, 0.6)) },
    cam: orbit(s, f, Rm(0.6, 0.95, 0.6), [-30, 18], [3.6, 2.9], [0.55, 0.3], 40, [0.07, -0.05]),
    people: BEHIND(["banker2", "lamont", "banker3", "banker4"], ["pained", "dazed", "pained", "nervous"]), closeup: true, subjects: [["the money", Rm(0.6, 0.95, 0.6), 0.4]] }),

  // ---------------- attempt 3: get rich ----------------
  "cant-stop": (s, f) => ({ ...STREET_GREY, dof: 5,
    cam: orbit(s, f, PLAZA, [152, 204], [7.2, 6.0], [0.5, 0.3], 42, [0.05, -0.05]),
    people: [P("you", YOU0, "stern", 0), ...passers(8, t(f), -14, 14, [-7, -9.5, -12], 0, 1.4, 8, "nervous")] }),
  "you-win": (s, f) => ({ light: "day", dof: 4, room: { sign: HOME, table: true, cash: [-1.2, -0.6, 0.0, 0.6, 1.2, 1.8, 2.4].map((x) => Rm(x, 0.8, 0.6)) },
    cam: kick(snap(Rm(-0.6, 1.7, -4.4), Rm(0.5, 1.35, 1.2), f, s.a, { fov: 42, roll: -0.08 }, 1.7, 6), f, s.a + 5, 0.9),
    people: [P("you", Rm(0.5, 0, 1.75), "grin", 0, { wave: 0.9 })], cards: flurry("bill", 12, t(f), Rm(0.5, 0.6, 0.4), 4.5, 3.2, 0.42) }),
  "bank-in": (s, f) => { const tt = t(f - s.a), x = Math.min(45.2, 38.5 + 1.5 * tt); return { ...STREET_DAY, dof: 3, street: { bank: { open: 1 } },
    cam: move({ pos: S(39, 1.9, -3.4), look: S(44, 2.6, 10), fov: 46, roll: 0.05 }, { pos: S(43, 1.5, 0.6), look: S(46, 3.2, 11), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [x < 45.2 ? walker("you", 38.5, SW, 9.3, 1.5, tt, "grin") : P("you", Nw(45.2, 9.3), "grin", 1)], suitcase: S(x + 0.42, SW + 0.5, 9.05),
    subjects: [["the bank sign", S(46, 8.4, 10.1), 0.5]] }; },
  "bank-gone": (s, f) => ({ ...STREET_GREY, dof: 4, street: { bank: { open: 0, notice: ["CLOSED"] } },
    cam: kick(snap(S(42.6, 1.5, 2.6), S(45.2, 1.9, 10.5), f, s.a, { fov: 40, roll: 0.09 }, 1.7, 6), f, s.a + 5, 1.1),
    people: [P("you", Nw(43.9, 9.0), "shock", 1)], suitcase: S(43.1, SW + 0.2, 8.9), subjects: [["the closed notice", S(46, 2.45, 11.6), 0.3]] }),
  bous: (s, f) => ({ ...STREET_GREY, dof: 0, street: { bank: { sign: BOUS, open: 0, notice: ["CLOSED"] } },
    cam: move({ pos: S(46, 2.2, -7), look: S(46, 4.5, 11), fov: 44, roll: -0.05 }, { pos: S(40, 13, -16), look: S(46, 4.5, 11), fov: 46, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: crowd(34, 37, 55, 1.5, 9.4, 53, pick(WORRY), 0, 6), subjects: [["the bank sign", S(46, 8.4, 10.1), 0.5]] }),
  gold: (s, f) => ({ light: "day", dof: 5, room: { sign: HOME, table: true, gold: Math.min(12, Math.floor(1 + U(s, f) * 16)) },
    cam: move({ pos: Rm(2.4, 2.0, -4.6), look: Rm(0.5, 1.1, 0.8), fov: 42, roll: 0.06 }, { pos: Rm(1.0, 1.45, -2.9), look: Rm(0.5, 1.1, 0.9), fov: 36, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rm(0.5, 0, 1.75), "grin", 0)], subjects: [["the gold", Rm(0.5, 0.95, 0.6), 0.4]] }),
  "gold-taken": (s, f) => { const u = U(s, f), n = Math.max(0, 12 - Math.floor(u * 15)); return { light: "day", dof: 4, room: { sign: HOME, table: true, gold: n },
    cam: orbit(s, f, Rm(0.9, 1.3, 1.0), [22, -14], [6.4, 5.4], [0.9, 0.4], 42, [-0.06, 0.05]),
    people: [P("you", Rm(-0.4, 0, 1.75), n > 6 ? "shock" : "dazed", 1), P("official", Rm(2.0, 0, 1.75), "stern", -1, { wave: n > 0 ? 0.6 : undefined })] }; },
  mattress: (s, f) => { const u = U(s, f); return { light: "night", dof: 4, room: { sign: HOME, bed: true, cash: u < 0.55 ? [Rm(-0.5, 0.82, 1.45)] : [] },
    cam: move({ pos: Rm(-3.0, 2.2, -3.4), look: Rm(-0.2, 1.0, 1.7), fov: 42, roll: -0.07 }, { pos: Rm(-1.8, 1.5, -1.9), look: Rm(-0.2, 1.05, 1.8), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rm(-0.4, 0, 2.5), u < 0.55 ? "nervous" : "smile_closed", u < 0.55 ? 1 : 0)],
    cards: u > 0.4 && u < 0.75 ? Array.from({ length: 5 }, (_, k) => ({ kind: "bill" as const, p: Rm(-0.5 + k * 0.12, 0.82 - 0.4 * smooth((u - 0.4 - k * 0.04) / 0.2), 1.0), spin: k, s: 0.4 })) : [],
    subjects: [["the bed", Rm(0, 0.7, 1.5), 0.8]] }; },
  works: (s, f) => ({ light: "day", dof: 5, room: { sign: HOME, bed: true },
    cam: kick(snap(Rm(-1.6, 1.55, -3.0), Rm(-0.4, 1.3, 2.3), f, s.a, { fov: 38, roll: 0.07 }, 1.6, 5), f, s.a + 4, 0.7),
    people: [P("you", Rm(-0.4, 0, 2.5), "grin", 0, { wave: 0.7 })] }),
  safest: (s, f) => { const hit = W(99, "mattress"); return { light: "day", dof: 3, room: { sign: HOME, bed: true },
    cam: orbit(s, f, Rm(0, 1.1, 1.5), [-34, 24], [7.0, 5.6], [1.6, 0.6], 42, [0.07, -0.05]),
    num: { text: "SAFE", bg: GREEN, fg: WHITE, k: pop(f, hit), p: Rm(0, 2.35, 1.6) }, subjects: [["the bed", Rm(0, 0.7, 1.5), 0.8]] }; },
  guard: (s, f) => ({ light: "night", dof: 5, room: { sign: HOME, bed: true },
    cam: move({ pos: Rm(2.6, 1.3, -3.4), look: Rm(-0.2, 1.2, 2.2), fov: 40, roll: 0.06 }, { pos: Rm(0.8, 1.6, -5.6), look: Rm(-0.2, 1.1, 2.0), fov: 42, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rm(-0.4, 0, 2.5), "stern", 0)] }),

  // ---------------- attempt 4: buy the dip ----------------
  "you-plan": (s, f) => ({ ...STREET_GREY, dof: 5, street: { news: PANIC_NEWS },
    cam: move({ pos: S(-18.4, 1.9, -2.6), look: S(-21.8, 1.2, -8.2), fov: 44, roll: -0.06 }, { pos: S(-20.0, 1.5, -4.4), look: S(-21.6, 1.15, -8.2), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Nw(-20.6, -8.5), "smile_closed", -1)], subjects: [["the headline", S(-22.9, 0.86, -8.3), 0.3]] }),
  buy: (s, f) => { const u = smooth((U(s, f) - 0.15) / 0.5); return { light: "day", dof: 4,
    room: { sign: ["crbrk", "STOCKBROKER · WALL STREET"], table: true, cash: [0, 1, 2].map((k) => Rm(-1.2 + k * 0.62 + 2.2 * u, 0.8, 0.6)) },
    cam: orbit(s, f, TABLE, [-24, 18], [7.4, 6.2], [0.9, 0.4], 42, [0.06, -0.04]),
    people: [P("you", Rm(-1.2, 0, 1.75), "grin", 1, { wave: 0.8 }), P("broker2", Rm(2.4, 0, 1.75), u > 0.6 ? "smile" : "nervous", -1)] }; },
  breadline: (s, f) => { const u = smooth(U(s, f)); return { ...STREET_GREY, dof: 4, street: { bank: { sign: RELIEF, open: 1 } },
    cam: full({ pos: S(20 + 20 * u, 1.65, -2.5), look: S(25 + 19 * u, 1.45, 9), fov: 30, roll: 0.04 - 0.07 * u }),
    people: Array.from({ length: 16 }, (_, k) => ({ who: `c${(k * 3 + 1) % 48}`, p: Nw(44.2 - k * 1.55, 9.0 + (k % 2) * 0.25), expr: (["dazed", "stern", "pained", "neutral"] as Expr[])[k % 4], look: 1, extra: true })) }; },
  "you-ruined": (s, f) => ({ ...STREET_GREY, dof: 5,
    cam: move({ pos: S(3.2, 4.8, -11), look: S(0, 1.4, -3), fov: 42, roll: 0.06 }, { pos: S(1.2, 1.2, -7.4), look: S(0, 1.45, -3), fov: 38, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", YOU0, "pained", 0, { headTilt: 0.1 }), ...passers(6, t(f), -14, 14, [1.5, 4.4], 0, 1.1, 30, "stern")] }),

  // ---------------- attempt 5: your street ----------------
  "thats-it": (s, f) => ({ ...STREET_GOLD, dof: 0,
    cam: move({ pos: S(1.4, 1.6, -8), look: S(0, 1.45, -3), fov: 40, roll: -0.05 }, { pos: S(6, 16, -40), look: S(0, 6, 4), fov: 48, roll: 0.04 }, f, s.a + 3, s.b, smooth, 0),
    people: [P("you", YOU0, "dazed", 0)] }),
  "street-people": (s, f) => { const u = smooth(U(s, f)), tt = t(f - s.a); return { ...STREET_GOLD, dof: 5, street: { bank: { open: 1 }, cars: [{ x: 70 - 6 * tt, z: -3, dir: -1 }] },
    cam: full({ pos: S(41 + 7 * u, 1.6, 0.4), look: S(43 + 6 * u, 1.4, 8.6), fov: 34, roll: -0.04 + 0.07 * u }),
    people: [...NEIGH(["smile", "laugh", "smile_closed", "smile", "smile_closed"], 42.4, 1.5), walker("worker", 36, SW, 7.2, 1.3, tt, "smile_closed")] }; },
  "bank-corner": (s, f) => ({ ...STREET_GOLD, dof: 0, street: { bank: { open: 1 } },
    cam: move({ pos: S(41, 1.6, 1.0), look: S(45, 1.6, 8.6), fov: 40, roll: 0.06 }, { pos: S(43, 3.2, -9.5), look: S(46, 6.2, 11), fov: 46, roll: -0.03 }, f, s.a, s.b - 4, smooth, 0),
    people: NEIGH(["smile", "laugh", "smile_closed", "smile", "smile_closed"], 42.4, 1.5), subjects: [["the bank sign", S(46, 8.4, 10.1), 0.5]] }),
  "you-bank": (s, f) => ({ ...STREET_GOLD, dof: 3, street: { bank: { open: 1 } },
    cam: move({ pos: S(47.4, 0.7, -3.8), look: S(45.6, 3.4, 6), fov: 42, roll: 0.07 }, { pos: S(46.8, 1.1, -3.0), look: S(45.5, 2.6, 4), fov: 38, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rd(45, 1), "nervous", 0)], subjects: [["the bank sign", S(46, 8.4, 10.1), 0.5]] }),
  "tell-neighbors": (s, f) => ({ ...STREET_GOLD, dof: 5, street: { bank: { open: 1 } },
    cam: bankCam(s, f),
    people: [P("you", Nw(42.6, 8.5), "nervous", 1, { wave: 0.85 }), ...NEIGH(["neutral", "smile", "stern", "neutral", "nervous"])] }),
  "take-out": (s, f) => ({ ...STREET_GOLD, dof: 9, closeup: true, street: { bank: { open: 1 } },
    cam: kick(snap(S(43.5, 1.62, 5.4), S(42.6, SW + 1.5, 8.5), f, s.a, { fov: 34, roll: -0.08 }, 1.7, 5), f, s.a + 4, 0.9),
    people: [P("you", Nw(42.6, 8.5), "stern", 0, { wave: 0.9 })] }),
  "run-morning": (s, f) => { const tt = t(f - s.a); return { ...STREET_GREY, dof: 3, street: { bank: { open: 1 } },
    cam: kick(orbit(s, f, S(46, 1.8, 8.6), [26, -20], [11, 9], [1.2, 2.4], 46, [-0.08, 0.06]), f, s.a + 3, 0.8),
    people: [...crowd(22, 40.5, 51.5, 5.6, 9.6, 61, pick(WORRY), SW, 2).map((q) => ({ ...q, wave: 0.8 })), ...[0, 1, 2, 3, 4].map((k) => ({ ...walker(`c${30 + k}`, 28 - k * 2.2, SW, 7.2 + (k % 2) * 0.7, 3.4, Math.min(tt, (12 + k * 2.2) / 3.4), "shock", k), extra: true }))] }; },
  "bank-shut": (s, f) => { const hit = s.a + Math.round((s.b - s.a) * 0.3), k = smooth((f - hit + 8) / 8); return { ...STREET_GREY, dof: 3, street: { bank: { open: 1 - k, notice: f >= hit ? ["CLOSED"] : null } },
    cam: kick(move({ pos: S(44, 1.7, -1.5), look: S(46, 2.6, 11), fov: 44, roll: 0.07 }, { pos: S(45, 1.6, 2.6), look: S(46, 2.5, 11), fov: 38, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, hit, 1.3),
    people: crowd(16, 41, 51, 5.6, 8.8, 61, pick(WORRY), SW, 2).filter((q) => Math.abs(q.p[0] - 46) > 1.3), subjects: f >= hit + 4 ? [["the closed notice", S(46, 2.45, 11.6), 0.3]] : [] }; },
  think: (s, f) => ({ ...STREET_GOLD, dof: 6, street: { bank: { open: 1 } },
    cam: move({ pos: S(40.4, 1.8, 2.6), look: S(43.4, SW + 1.45, 8.5), fov: 42, roll: -0.05 }, { pos: S(41.6, 1.6, 4.4), look: S(42.9, SW + 1.45, 8.5), fov: 36, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Nw(42.6, 8.5), "nervous", 0, { headTilt: 0.06 }), ...NEIGH(["neutral", "smile", "stern", "neutral", "nervous"])] }),
  "nobody-believes": (s, f) => { const tt = t(f - s.a); return { ...STREET_GOLD, dof: 4, street: { bank: { open: 1 } },
    cam: bankCam(s, f, [18, -16], [7.6, 9.2], [-0.05, 0.05]),
    people: [P("you", Nw(42.6, 8.5), "dazed", 0), ...["mother", "kid", "oldman", "grocer", "lady"].map((n, k) => walker(n, 44.2 + k * 1.15, SW, 8.5 + (k % 2) * 0.35, (k % 2 ? -1 : 1) * (1.3 + k * 0.1), Math.max(0, tt - 0.25 - k * 0.12), "smile_closed", k))] }; },
  "everybody-believes": (s, f) => { const tt = t(f - s.a); return { ...STREET_GREY, dof: 3, street: { bank: { open: 1 } },
    cam: kick(orbit(s, f, S(44, 1.6, 8.4), [-30, 16], [12, 10], [2.2, 1.0], 46, [0.08, -0.06]), f, s.a + 4, 0.9),
    people: [P("you", Nw(36.2, 7.4), "shock", 1), ...["mother", "kid", "oldman", "grocer", "lady", "worker", "lady2", "gent"].map((n, k) => { const x1 = 44.4 + (k % 4) * 0.9, x0 = 26 - k * 2.4, tk = Math.min(tt, (x1 - x0) / 3.6); return tk * 3.6 >= x1 - x0 - 0.01 ? P(n, Nw(x1, 8.4 + Math.floor(k / 4) * 0.9), "shock", 1, { wave: 0.8 }) : walker(n, x0, SW, 8.4 + Math.floor(k / 4) * 0.9, 3.6, tk, "shock", k); })] }; },
  "your-line": (s, f) => ({ ...STREET_GREY, dof: 0, street: { bank: { open: 0, notice: ["CLOSED"] } },
    cam: move({ pos: S(40.5, 1.9, 1.5), look: S(45.5, 2.2, 10), fov: 44, roll: 0.06 }, { pos: S(-14, 19, -9), look: S(18, 1.0, 8.6), fov: 50, roll: -0.04 }, f, s.a + 2, s.b - 2, smooth, 0),
    people: [P("you", Rd(30, 3.2), "shock", 1), ...Array.from({ length: 34 }, (_, k) => ({ who: `c${(k * 5 + 2) % 48}`, p: Nw(44.6 - k * 1.5, 8.9 + (k % 2) * 0.3), expr: WORRY[k % WORRY.length], look: 1, extra: true }))] }),

  // ---------------- what would have worked ----------------
  "babson-again": (s, f) => ({ light: "day", dof: 5, room: { sign: SPEECH, podium: true },
    cam: orbit(s, f, Rm(0, 1.45, 1.5), [22, -16], [6.0, 5.0], [0.5, 0.25], 40, [-0.05, 0.04]),
    people: [P("babson", Rm(0, 0, 1.6), "smile_closed", 0, { wave: 0.7 })] }),
  lost: (s, f) => { const u = smooth(U(s, f)); return { ...STREET_GREY, dof: 5,
    cam: full({ pos: S(-7 + 9 * u, 1.5, -1.5), look: S(-5 + 8 * u, 1.4, 7.6), fov: 30, roll: 0.05 - 0.08 * u }),
    people: [...["broker", "gent", "broker2", "worker", "broker3", "clerk", "livermore"].map((n, k) => P(n, Nw(-6.5 + k * 2.1, 7.6 + (k % 2) * 0.4), (["pained", "dazed", "pained", "nervous", "dazed", "pained", "stern"] as Expr[])[k], 0, { headTilt: 0.08 }))],
    cards: Array.from({ length: 7 }, (_, k) => ({ kind: "slip" as const, p: S(-6 + k * 2.2, SW + 0.06 + (k % 2) * 0.03, 6.6 + (k % 3) * 0.3), spin: k * 1.1, s: 0.5 })) }; },
  "nobody-wanted": (s, f) => { const u = smooth(U(s, f)); return { ...STREET_DAY, dof: 5,
    cam: full({ pos: S(-2 - 5 * u, 1.7, -20), look: S(-4 - 3 * u, 1.4, -4), fov: 22, roll: 0.04 - 0.07 * u }),
    people: [P("you", Rd(-6, -4), "nervous", 0, { wave: 0.7 }), ...passers(12, t(f), -20, 10, [-1.4, -2.6, -5.6, -6.8], 0, 1.7, 9)] }; },
  "bank-safe": (s, f) => { const tt = t(f - s.a); return { ...STREET_DAY, dof: 3, street: { bank: { open: 1, notice: ["DEPOSITS|INSURED", GREEN, WHITE], noticeX: 41.4, noticeY: 3.4 } },
    cam: move({ pos: S(37.6, 1.7, 0.5), look: S(42.4, 2.8, 11), fov: 44, roll: -0.05 }, { pos: S(40.0, 1.6, 3.4), look: S(42.2, 2.9, 11), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("mother", Nw(43.6, 9.2), "smile", -1), P("kid", Nw(44.6, 9.3), "laugh", -1), walker("oldman", 36, SW, 8.2, 1.2, tt, "smile_closed")], subjects: [["the insured notice", S(41.4, 3.4, 11.6), 0.3]] }; },
  windows: (s, f) => ({ ...STREET_DAY, dof: 0,
    cam: move({ pos: S(-38, 1.6, -3), look: S(-46, 48, 14), fov: 50, roll: 0.08 }, { pos: S(-40, 1.6, -4), look: S(-46, 22, 13), fov: 44, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: passers(5, t(f), -56, -30, [7.4, 9.4], SW, 1.3, 16) }),
  "you-end": (s, f) => ({ ...STREET_GOLD, dof: 4,
    cam: orbit(s, f, PLAZA, [-28, 20], [8.4, 6.6], [0.5, 0.25], 42, [0.05, -0.04]),
    people: [P("you", YOU0, U(s, f) > 0.5 ? "smile_closed" : "neutral", 0)] }),
  "babson-end": (s, f) => ({ light: "day", dof: 6, room: { sign: SPEECH, podium: true },
    cam: move({ pos: Rm(-1.6, 1.7, -4.4), look: Rm(0, 1.5, 1.6), fov: 38, roll: -0.05 }, { pos: Rm(-0.7, 1.6, -3.0), look: Rm(0, 1.5, 1.6), fov: 34, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("babson", Rm(0, 0, 1.6), "neutral", 0, { headTilt: 0.06 })] }),
  "crowd-did": (s, f) => { const tt = t(f - s.a); return { ...STREET_GREY, dof: 0, street: { bank: { open: 0, notice: ["CLOSED"] } },
    cam: move({ pos: S(10, 9, -14), look: S(24, 1.5, 6), fov: 48, roll: 0.07 }, { pos: S(26, 6, -12), look: S(42, 2.5, 9), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: Array.from({ length: 26 }, (_, k) => ({ ...walker(`c${(k * 7 + 3) % 48}`, 2 + ((k * 1.9) % 30), k % 3 === 0 ? SW : 0, k % 3 === 0 ? 7.4 + (k % 2) * 1.2 : -3 + (k % 5) * 1.9, 3.2 + (k % 4) * 0.25, tt, "shock", k), extra: true })) }; },

  thumb: () => ({ ...STREET_GREY, dof: 3,
    cam: full({ pos: S(1.6, 1.5, -7.6), look: S(-0.6, 3.6, 4), fov: 46, roll: 0 }),
    people: [P("you", Rd(1.5, -5.2), "shock", 0), ...crowd(26, -12, 8, -1.5, 5, 23, pick(WORRY), 0, 4)] }),
};

/** every shot is hand-held: a slow sway on top of its move, less when the lens is long */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * Math.min(d, 60), id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** frames where the 3D picture gets a sideways motion blur: the first frames of every 3D shot that swoops in */
const WHIP = new Set(["open-wide", "forever", "thats-it", "your-line", "across", "crowd-did", "bous", "rich", "sell"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
void segAt; void TABLE; void S; void Rd;
