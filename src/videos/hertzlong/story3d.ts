// The 60 Hz long-form's 3D shots, as specs: for a shot key (timeline.ts `g`) and frame, the light, camera, props, cast and
// the subjects the narration is about (for the framing check).
// Camera grammar (Daniel, Nov 11: every video moves like the Lustig short, long-form too): no creeping push-ins. Every
// shot is an orbit, a crane, a dive, a tracking move, a long-lens slide or a snap zoom on a cut; Dutch tilts that flip on
// the next cut; handheld sway on everything; a kick on every hit. Several shots cut to a second setup on a word.
// Sets: the lamp yard (Lm), the room (Rm, open toward -z, cameras look +z), the post clock (Ck), the two pylon lines (Py).
import { Expr } from "../bridge/toon";
import { FPS, ShotDef, wordAt } from "./timeline";

export type V3 = [number, number, number];
export const D0 = 6.0;
const at = (o: V3) => (x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
export const LAMP_O: V3 = [-300, D0, -60], ROOM_O: V3 = [300, D0, 300], CLOCK_O: V3 = [-220, D0, -56], PYL_O: V3 = [-140, D0, -62];
export const Lm = at(LAMP_O), Rm = at(ROOM_O), Ck = at(CLOCK_O), Py = at(PYL_O);

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; side?: { phase: number; mirror: boolean; stride?: number } };
type Num = { text: string; bg?: string; fg?: string; k?: number };
export type St3 = {
  light: "day" | "golden"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; wipe?: { color: string; a: number }; subjects?: [string, V3, number][];
  /** lamp yard: brightness of the three street lamps, flicker rate (Hz), generator wheel angle, the number board */
  lamps?: number[]; flicker?: number; gen?: number; sign?: Num | null;
  /** the room: wall sign [key, text], what is on the table, the number board on the back wall */
  room?: { sign: [string, string]; motor?: number | null; shake?: number; tgen?: number; bulb?: number; flicker?: number; bulb2?: number; flicker2?: number; num?: Num | null; clocks?: number; clockRate?: number };
  /** post clock time in hours (10.17 = ten past ten) */
  clock?: number;
  /** pylons: lamp brightness on each side, the converter hut, a spark in the gap, lamps taking turns going dark */
  pyl?: { west: number; east: number; hut?: boolean; spark?: number; wturn?: number; eturn?: number };
  spark?: { p: V3; s: number }; cards?: { p: V3; spin: number; s: number }[];
};

// ---------------- helpers ----------------
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
/** fast start, soft landing (swoops, crash zooms) */
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
/** an orbit over the whole shot: angle a0 -> a1, radius r0 -> r1, height h0 -> h1, roll r0 -> r1 */
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
const W = (seg: number, w: string) => wordAt(seg, w);
const P = (who: string, p: V3, expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => ({ who, p, expr, look, ...extra });
/** pop-in scale with overshoot */
const pop = (f: number, f0: number, dur = 9) => { const u = clamp01((f - f0) / dur); if (u <= 0) return 0; const s = 2.38, x = u - 1; return 1 + (s + 1) * x * x * x + s * x * x; };
const BLUE = "#2f5fb5", RED = "#c9373a", WHITE = "#ffffff";
const N60: Num = { text: "60", bg: BLUE, fg: WHITE }, N50: Num = { text: "50", bg: RED, fg: WHITE };

// rooms
const PITTS: [string, string] = ["hzpitts", "WESTINGHOUSE · PITTSBURGH"], AEG: [string, string] = ["hzaeg", "A.E.G. · BERLIN"];
const SALES: [string, string] = ["hzsales", "GENERATORS · ALL 60 CYCLES"], LAB: [string, string] = ["hzlab", "ENGINEERING DEPT."];
const DEPOT: [string, string] = ["hzdepot", "CLOCK DEPOT"], TOKYO: [string, string] = ["hztokyo", "TOKYO ELECTRIC LIGHT CO."], OSAKA: [string, string] = ["hzosaka", "OSAKA ELECTRIC LIGHT CO."];
/** behind the table (heads at y 1.6), left to right */
const BEHIND = (names: string[], expr: Expr | Expr[], x0 = -0.9, dx = 1.4): Person3[] =>
  names.map((n, k) => P(n, Rm(x0 + k * dx, 0, 1.75), Array.isArray(expr) ? expr[k] : expr, k === 0 ? 1 : k === names.length - 1 ? -1 : 0));
const TABLE: V3 = Rm(0.5, 1.2, 0.9);

// ---------------- the hook (and the loop back to it) ----------------
const humCam = (f: number, f0: number, dir = 1): Cam => {
  const u = expo((f - f0) / 46);
  return full(orb(Lm(0.75, 2.9, -0.2), dir * (30 - 22 * u), 5.4 - 1.3 * u, -1.5 + 0.5 * u, { fov: 60, roll: dir * 0.07 * (1 - u) }));
};
const hum = (f: number, f0: number, n: Num, dir = 1, hit?: number): St3 => ({
  light: "day", dof: 5, lamps: [1.2, 1.2, 1.2], sign: { ...n, k: 1 },
  cam: hit === undefined ? humCam(f, f0, dir) : kick(humCam(f, f0, dir), f, hit, 1.1),
  subjects: [["number board", Lm(1.55, 2.1, -0.8), 0.4]],
});

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  hum60: (s, f) => hum(f, s.a, N60, 1, W(0, "60")),
  hum50: (s, f) => {
    const hit = W(1, "50");
    return { light: "day", dof: 5, lamps: [1.2, 1.2, 1.2], sign: { ...N50, k: 1 },
      cam: kick(move({ pos: Lm(7.5, 7.5, -9), look: Lm(1.55, 2.3, -0.7), fov: 62, roll: -0.16 }, { pos: Lm(3.4, 1.5, -3.6), look: Lm(1.55, 2.3, -0.7), fov: 52, roll: 0.05 }, f, s.a, s.a + 22, expo, 0.0015), f, hit, 1.1),
      subjects: [["number board", Lm(1.55, 2.1, -0.8), 0.4]] };
  },
  hum60b: (s, f) => hum(f, s.a, N60, -1, W(176, "60")),
  hum50b: (s, f) => {
    const hit = W(177, "50");
    return { light: "day", dof: 5, lamps: [1.2, 1.2, 1.2], sign: { ...N50, k: 1 },
      cam: kick(orbit(s, f, Lm(1.2, 2.6, 0.3), [-34, -8], [6.2, 4.4], [1.6, -0.6], 56, [-0.1, 0.03], expo), f, hit, 1.1),
      subjects: [["number board", Lm(1.55, 2.1, -0.8), 0.4]] };
  },
  loop: (s, f) => {
    const cut = s.b - 26;
    if (f >= cut) return hum(s.a, s.a, N60, 1);
    // one last crane: up and away from the lamps until the whole yard is small
    return { light: "day", dof: 0, lamps: [1.2, 1.2, 1.2], sign: { ...N60, k: 1 },
      cam: move({ pos: Lm(2.2, 2.2, -5.5), look: Lm(0.5, 2.6, 0), fov: 50, roll: 0.06 }, { pos: Lm(-6, 15, -30), look: Lm(-1.5, 1.5, 0), fov: 58, roll: -0.03 }, f, s.a, cut, smooth, 0) };
  },

  // ---------------- cold open ----------------
  "eng-pitts": (s, f) => ({
    light: "day", dof: 5, room: { sign: PITTS, tgen: t(f) * 7, bulb: 1 },
    cam: orbit(s, f, TABLE, [-34, 6], [6.6, 5.0], [0.9, 0.5], 50, [0.07, -0.03], expo),
    people: BEHIND(["eng0", "westinghouse", "eng1"], ["smile_closed", "stern", "neutral"]),
  }),
  "eng-berlin": (s, f) => {
    const x = 2.2 - 3.4 * smooth((f - s.a) / Math.max(1, s.b - s.a));
    return { light: "day", dof: 8, room: { sign: AEG, tgen: t(f) * 7, bulb: 1 },
      cam: full({ pos: Rm(x, 1.62, -5.2), look: Rm(x * 0.6 + 0.2, 1.55, 1.75), fov: 26, roll: -0.05 }),
      people: BEHIND(["ger0", "rathenau", "ger1"], ["neutral", "stern", "smile_closed"]) };
  },
  "lamp-close": (s, f) => ({
    light: "day", dof: 10, closeup: true, room: { sign: PITTS, bulb: 1.25, tgen: t(f) * 7 },
    cam: snap(Rm(2.75, 1.45, -1.0), Rm(2.2, 1.34, 0.6), f, s.a, { fov: 38, roll: 0.1 }),
    subjects: [["lamp", Rm(2.2, 1.34, 0.6), 0.15]],
  }),
  "dark-half": (s, f) => ({
    light: "golden", dof: 3, pyl: { west: 1.2, east: 0, hut: true },
    cam: move({ pos: Py(-15, 7.5, -15), look: Py(-6.2, 1.8, -2.6), fov: 58, roll: 0.12 }, { pos: Py(-8.6, 1.5, -8.4), look: Py(-6.2, 1.9, -2.6), fov: 50, roll: -0.04 }, f, s.a, s.b - 6, smooth, 0),
    people: [P("la1", Py(-6.2, 0, -4.4), "nervous", -1, { headTilt: 0.06 })],
  }),
  "west-lit0": (s, f) => ({
    light: "golden", dof: 3, pyl: { west: 1.3, east: 0, hut: true },
    cam: orbit(s, f, Py(6.2, 1.9, -2.8), [26, -18], [6.4, 5.0], [0.4, 0.1], 52, [-0.08, 0.05]),
    people: [P("la3", Py(6.2, 0, -4.4), "smile", 1)],
  }),

  // ---------------- chapter 1: the hum ----------------
  socket: (s, f) => ({
    light: "day", dof: 9, closeup: true, lamps: [1, 1, 1],
    cam: f < s.a + 22 ? snap(Lm(9.5, 1.7, -2.4), Lm(9, 1.5, 0), f, s.a, { fov: 40, roll: -0.12 })
      : orbit(s, f, Lm(9, 1.5, 0), [8, -26], [2.3, 1.9], [0.15, 0.3], 40, [-0.1, 0.08]),
    subjects: [["socket", Lm(9, 1.5, -0.05), 0.1]],
  }),
  "island-plant": (s, f) => ({
    light: "day", dof: 0, lamps: [1, 1, 1], gen: t(f) * 6,
    cam: move({ pos: Lm(-5.4, 1.3, -2.6), look: Lm(-6.5, 1.0, 0.6), fov: 46, roll: 0.1 }, { pos: Lm(-13, 15, -27), look: Lm(-4.5, 0.8, 0.6), fov: 56, roll: -0.03 }, f, s.a + 4, s.b - 2, smooth, 0),
    subjects: [["generator", Lm(-6.6, 1.2, 0.2), 0.6]],
  }),
  "gen-lamps": (s, f) => ({
    light: "day", dof: 3, lamps: [1.1, 1.1, 1.1], gen: t(f) * 6,
    cam: move({ pos: Lm(-9.5, 2.0, -9), look: Lm(-3, 1.6, 0), fov: 60, roll: -0.08 }, { pos: Lm(2.4, 2.0, -7.6), look: Lm(2.6, 2.3, 0), fov: 50, roll: 0.05 }, f, s.a, s.b - 4, smooth, 0),
    people: [P("la1", Lm(4.4, 0, -1.6), "smile", -1)],
  }),
  "lamps-steady": (s, f) => ({
    light: "day", dof: 3, lamps: [1.2, 1.2, 1.2], sign: { text: "133", k: 1 },
    cam: orbit(s, f, Lm(0.6, 2.8, 0.2), [-30, 14], [6.2, 5.2], [-2.0, -1.5], 62, [-0.09, 0.05]),
    subjects: [["number board", Lm(1.55, 2.1, -0.8), 0.4]],
  }),
  "lamp-small": (s, f) => ({
    light: "day", dof: 9, closeup: true, lamps: [1.25, 1.25, 1.25],
    cam: snap(Lm(-2.2, 3.9, -2.1), Lm(-3, 3.49, 0), f, s.a, { fov: 36, roll: 0.12 }),
    subjects: [["lamp", Lm(-3, 3.49, -0.3), 0.3]],
  }),

  // ---------------- chapter 2: Pittsburgh ----------------
  "motor-reveal": (s, f) => ({
    light: "day", dof: 9, closeup: true, room: { sign: PITTS, motor: t(f) * 9 },
    cam: kick(snap(Rm(1.25, 1.3, -1.25), Rm(0.55, 1.07, 0.6), f, s.a, { fov: 38, roll: -0.1 }), f, s.a + 4, 0.9),
    subjects: [["motor", Rm(0.5, 1.1, 0.4), 0.15]],
  }),
  future: (s, f) => ({
    light: "day", dof: 6, room: { sign: PITTS, motor: t(f) * 9 },
    cam: orbit(s, f, Rm(0.3, 1.45, 1.4), [24, -16], [4.6, 3.9], [-0.35, 0.5], 46, [0.08, -0.06]),
    people: [P("westinghouse", Rm(-0.6, 0, 1.75), "grin", 1), P("tesla", Rm(1.2, 0, 1.75), "smile_closed", -1)],
  }),
  samepower: (s, f) => {
    const u = smooth((f - s.a) / Math.max(1, s.b - s.a - 4)), x = 0.3 + 2.0 * u;
    return { light: "day", dof: 9, closeup: true, room: { sign: PITTS, motor: t(f) * 9, bulb: 1.2 },
      cam: full({ pos: Rm(x - 0.2, 1.22, -2.6), look: Rm(x, 1.16, 0.6), fov: 26, roll: 0.04 }),
      subjects: f > s.b - 12 ? [["lamp", Rm(2.2, 1.34, 0.6), 0.15]] : [] };
  },
  "motor-bad": (s, f) => {
    const hit = W(39, "badly");
    return { light: "day", dof: 7, room: { sign: PITTS, motor: Math.floor(t(f) * 14) * 1.3, shake: 1, num: { text: "133", k: 1 } },
      spark: f >= hit ? { p: Rm(0.95, 1.25 + 0.1 * Math.sin(f), 0.45), s: 0.5 + 0.2 * Math.sin(f * 1.9) } : undefined,
      cam: kick(move({ pos: Rm(-1.4, 1.0, -2.6), look: Rm(0.5, 1.2, 0.8), fov: 48, roll: 0.14 }, { pos: Rm(-0.6, 1.2, -1.9), look: Rm(0.5, 1.3, 0.8), fov: 48, roll: 0.14 }, f, s.a, s.a + 16, expo, 0.001), f, hit, 1.2),
      people: [P("eng0", Rm(1.9, 0, 1.75), "shock", -1), P("westinghouse", Rm(-1.0, 0, 1.75), "nervous", 1)],
      subjects: [["motor", Rm(0.5, 1.1, 0.4), 0.2]] };
  },
  "flicker-low": (s, f) => ({
    light: "day", dof: 4, lamps: [1.2, 1.2, 1.2], flicker: 5, sign: { text: "25", k: 1 },
    cam: orbit(s, f, Lm(0.2, 2.2, -0.6), [20, -24], [6.4, 5.4], [-1.3, -0.9], 58, [0.12, -0.1]),
    people: [P("eng1", Lm(-1.6, 0, -1.4), "nervous", 1, { headTilt: 0.07 }), P("eng2", Lm(-0.4, 0, -1.7), "pained", 1)],
    subjects: [["number board", Lm(1.55, 2.1, -0.8), 0.4]],
  }),
  "eng-search": (s, f) => {
    const seq = ["133", "100", "80", "70", "40", "50", "60"], k = Math.min(seq.length - 1, Math.floor((f - s.a) / Math.max(1, (s.b - s.a) / seq.length)));
    return { light: "day", dof: 4, room: { sign: PITTS, tgen: t(f) * 7, bulb: 1, flicker: k === 4 ? 5 : 0, num: { text: seq[k], k: 1 } },
      cam: orbit(s, f, Rm(0.5, 1.7, 1.9), [-28, 22], [5.6, 4.8], [0.3, 0.1], 50, [-0.06, 0.06]),
      people: BEHIND(["eng0", "eng1", "eng2"], "stern", -1.6, 2.1),
      subjects: [["number board", Rm(0.5, 2.15, 3.3), 0.3]] };
  },
  "sixty-board": (s, f) => {
    const hit = W(46, "60");
    return { light: "day", dof: 6, room: { sign: PITTS, tgen: t(f) * 7, bulb: 1.2, num: { ...N60, k: pop(f, hit - 2) || 0.001 } },
      cam: kick(snap(Rm(0.9, 1.95, -1.6), Rm(0.5, 2.15, 3.38), f, s.a, { fov: 44, roll: -0.08 }, 1.6, 6), f, hit, 1.3),
      subjects: f > hit + 8 ? [["number board", Rm(0.5, 2.15, 3.3), 0.3]] : [] };
  },
  "arc-lamps": (s, f) => ({
    light: "day", dof: 4, lamps: [1.3, 1.3, 1.3], sign: { ...N60, k: 1 },
    cam: move({ pos: Lm(4.4, 0.9, -4.6), look: Lm(2.2, 2.4, 0), fov: 56, roll: 0.1 }, { pos: Lm(5.2, 4.6, -5.8), look: Lm(1.6, 2.8, 0), fov: 50, roll: -0.03 }, f, s.a, s.b - 4, smooth, 0),
    people: [P("eng0", Lm(-0.9, 0, -1.2), "smile", 1), P("eng1", Lm(-2.0, 0, -1.6), "smile_closed", 1)],
    subjects: [["number board", Lm(1.55, 2.1, -0.8), 0.4]],
  }),
  "room-liked": (s, f) => ({
    light: "day", dof: 3, room: { sign: PITTS, tgen: t(f) * 7, bulb: 1.25, num: { ...N60, k: 1 } },
    cam: move({ pos: Rm(1.6, 1.6, -1.9), look: Rm(1.2, 1.5, 1.4), fov: 46, roll: 0.06 }, { pos: Rm(0.4, 3.0, -6.4), look: Rm(0.5, 1.7, 1.75), fov: 60, roll: -0.02 }, f, s.a + 6, s.b - 4, smooth, 0),
    people: BEHIND(["eng0", "eng1", "eng2"], "smile", -1.2, 1.3),
  }),
  "sell-match": (s, f) => ({
    light: "day", dof: 6, room: { sign: SALES, tgen: t(f) * 7 },
    cam: orbit(s, f, Rm(0.4, 1.4, 1.3), [-26, 18], [4.8, 4.0], [0.5, -0.2], 46, [-0.07, 0.06]),
    people: [P("geman", Rm(-0.9, 0, 1.75), "grin", 1, { wave: 0.8 }), P("la1", Rm(1.9, 0, 1.75), "smile", -1)],
  }),

  // ---------------- chapter 3: Berlin ----------------
  "frankfurt-lamps": (s, f) => {
    const on = clamp01((f - s.a - 2) / 5);
    return { light: "day", dof: 4, lamps: [1.35 * on, 1.35 * clamp01((f - s.a - 5) / 5), 1.35 * clamp01((f - s.a - 8) / 5)],
      cam: kick(move({ pos: Lm(-1.2, 1.0, -5.4), look: Lm(-0.4, 2.0, 0), fov: 60, roll: -0.09 }, { pos: Lm(0.6, 2.6, -7.4), look: Lm(0, 2.3, 0), fov: 54, roll: 0.03 }, f, s.a, s.b - 2, smooth, 0), f, s.a + 3, 1),
      people: [P("ger0", Lm(-1.6, 0, -1.3), "laugh", 0), P("ger2", Lm(-0.3, 0, -1.6), "smile", 0), P("ger1", Lm(1.0, 0, -1.3), "grin", 0, { wave: 0.8 })] };
  },
  flicker40: (s, f) => {
    const cut = W(70, "see") - 2;
    return { light: "day", dof: 6, closeup: f >= cut, lamps: [1.25, 1.25, 1.25], flicker: 4, sign: { text: "40", k: 1 },
      cam: f < cut ? orbit(s, f, Lm(0.8, 2.8, 0.2), [18, -6], [5.6, 5.0], [-1.6, -1.3], 60, [0.1, 0.04])
        : snap(Lm(-0.5, 1.72, -4.4), Lm(-0.9, 1.6, -1.4), f, cut, { fov: 34, roll: -0.12 }),
      people: [P("ger0", Lm(-1.6, 0, -1.3), "pained", 0), P("ger2", Lm(-0.3, 0, -1.6), "nervous", 0, { headTilt: 0.08 })],
      subjects: f < cut ? [["number board", Lm(1.55, 2.1, -0.8), 0.4]] : [] };
  },
  neither: (s, f) => ({
    light: "day", dof: 5, room: { sign: LAB, bulb: 1.2, bulb2: 1.2, num: { text: "60 ≈ 50", fg: "#241726", k: 1 } },
    cam: orbit(s, f, Rm(0.5, 1.5, 1.5), [22, -20], [5.2, 4.4], [0.1, 0.5], 50, [0.06, -0.06]),
    people: [P("eng2", Rm(-0.2, 0, 1.75), "neutral", 1, { wave: 0.5 }), P("eng1", Rm(1.2, 0, 1.75), "smile_closed", -1)],
    subjects: [["number board", Rm(0.5, 2.15, 3.3), 0.3]],
  }),

  // ---------------- chapter 4: Los Angeles ----------------
  "clocks-cared": (s, f) => ({
    light: "day", dof: 7, closeup: true, clock: 10.17,
    cam: kick(snap(Ck(0.8, 2.3, -3.4), Ck(0, 2.7, 0), f, s.a, { fov: 44, roll: 0.12 }, 1.7, 6), f, s.a + 5, 1.2),
    subjects: [["clock", Ck(0, 2.7, -0.2), 0.3]],
  }),
  "clock-fast": (s, f) => ({
    light: "day", dof: 5, clock: 10.17 + (f - s.a) / FPS * 1.6,
    cam: orbit(s, f, Ck(-0.4, 2.2, -0.4), [-30, 20], [5.2, 4.2], [-1.2, -0.7], 54, [-0.1, 0.08]),
    people: [P("la0", Ck(-1.9, 0, -1.3), "shock", 1)],
    subjects: [["clock", Ck(0, 2.7, -0.2), 0.3]],
  }),
  collect: (s, f) => {
    const tt = (f - s.a) / FPS, names = ["la0", "la1", "la2", "la3"], people: Person3[] = [], cards: { p: V3; spin: number; s: number }[] = [];
    names.forEach((n, k) => {
      const x = -5.5 + 1.3 * tt - k * 1.5, dist = 1.3 * tt + 20 - k * 1.5;
      people.push({ who: n, p: Ck(x, 0, -3.2 + (k % 2) * 0.4), expr: "stern", side: { phase: ((dist / 1.6) % 1 + 1) % 1, mirror: false, stride: 0.8 } });
      cards.push({ p: Ck(x + 0.42, 1.12 + 0.03 * Math.sin(dist * 3.9), -3.5 + (k % 2) * 0.4), spin: 0, s: 0.62 });
    });
    const cx = -5.5 + 1.3 * tt - 2.2;
    return { light: "day", dof: 3, clock: 10.17, people, cards,
      cam: full({ pos: Ck(cx + 2.4, 1.25, -9.2), look: Ck(cx, 1.3, -3.2), fov: 50, roll: 0.05 }) };
  },
  depot: (s, f) => ({
    light: "day", dof: 4, room: { sign: DEPOT, clocks: 5, clockRate: 1.2 },
    cam: move({ pos: Rm(0.5, 1.3, -2.7), look: Rm(0.5, 1.25, 0.6), fov: 56, roll: -0.07 }, { pos: Rm(0.2, 2.2, -5.6), look: Rm(0.4, 1.8, 1.75), fov: 58, roll: 0.03 }, f, s.a, s.b - 4, smooth, 0),
    people: [P("worker", Rm(0.5, 0, 1.75), "stern", 0), P("la0", Rm(-3.6, 0, 2.2), "nervous", 1), P("la2", Rm(4.4, 0, 2.2), "neutral", -1)],
  }),
  "clocks-fly": (s, f) => {
    const cards: { p: V3; spin: number; s: number }[] = [];
    for (let k = 0; k < 12; k++) {
      const f0 = s.a + 2 + k * 3.2, u = (f - f0) / 20;
      if (u <= 0 || u >= 1) continue;
      const x = -1.6 + (k * 1.7) % 4.4, zx = (k % 3 - 1) * 0.35;
      cards.push({ p: Rm(x + (0.5 - x) * 0.72 * u + zx * u, 1.3 + 1.5 * Math.sin(u * Math.PI) * 0.6 + 0.15 * u, 0.6 - 4.6 * u), spin: (k % 2 ? 1 : -1) * u * 5, s: 0.8 + 1.5 * u });
    }
    return { light: "day", dof: 3, room: { sign: DEPOT, clocks: 5, clockRate: 2.4 }, cards,
      cam: kick(kick(full({ pos: Rm(0.5, 1.15, -4.6), look: Rm(0.5, 1.5, 0.6), fov: 60, roll: 0.06 }), f, s.a + 18, 1), f, s.a + 34, 1.1),
      people: [P("worker", Rm(0.5, 0, 1.75), "shock", 0, { wave: 0.9 })] };
  },

  // ---------------- chapter 5: Japan ----------------
  "tokyo-buys": (s, f) => {
    const cut = W(127, "AEG") - 2;
    return { light: "day", dof: 6, room: { sign: TOKYO, tgen: t(f) * 7, num: f >= cut ? { ...N50, k: pop(f, cut) } : null },
      cam: f < cut ? orbit(s, f, Rm(0.5, 1.45, 1.4), [-26, 4], [5.0, 4.2], [0.5, 0.2], 46, [-0.07, 0.02])
        : kick(snap(Rm(1.9, 1.6, -1.4), Rm(1.75, 1.62, 1.75), f, cut, { fov: 36, roll: 0.11 }), f, cut + 3, 0.8),
      people: [P("tokyo", Rm(-0.75, 0, 1.75), "smile_closed", 1), P("aegman", Rm(1.75, 0, 1.75), "grin", -1, { wave: 0.7 })] };
  },
  "osaka-buys": (s, f) => {
    const cut = W(131, "General") - 2;
    return { light: "day", dof: 6, room: { sign: OSAKA, tgen: t(f) * 7, num: f >= cut ? { ...N60, k: pop(f, cut) } : null },
      cam: f < cut ? orbit(s, f, Rm(0.5, 1.45, 1.4), [26, -4], [5.0, 4.2], [0.5, 0.2], 46, [0.07, -0.02])
        : kick(snap(Rm(-0.9, 1.6, -1.4), Rm(-0.75, 1.62, 1.75), f, cut, { fov: 36, roll: -0.11 }), f, cut + 3, 0.8),
      people: [P("geman", Rm(-0.75, 0, 1.75), "grin", 1, { wave: 0.7 }), P("osaka", Rm(1.75, 0, 1.75), "smile_closed", -1)] };
  },
  "nobody-cared": (s, f) => ({
    light: "day", dof: 5, lamps: [1.2, 1.2, 1.2],
    cam: orbit(s, f, Lm(0, 1.5, -1.5), [-22, 20], [4.6, 3.8], [0.2, 0.0], 44, [-0.08, 0.07]),
    people: [P("tokyo", Lm(-0.75, 0, -1.5), "smile", 1), P("osaka", Lm(0.75, 0, -1.5), "smile_closed", -1)],
  }),
  "bulb-same": (s, f) => {
    const u = smooth((f - s.a) / Math.max(1, s.b - s.a - 4)), x = -1.2 + 3.4 * u;
    return { light: "day", dof: 9, closeup: true, room: { sign: LAB, bulb: 1.25, bulb2: 1.25, num: { text: "50 or 60", fg: "#241726", k: 1 } },
      cam: full({ pos: Rm(x + 0.3, 1.36, -2.4), look: Rm(x, 1.34, 0.6), fov: 28, roll: -0.05 }),
      subjects: f > s.b - 12 ? [["lamp", Rm(2.2, 1.34, 0.6), 0.15]] : [] };
  },
  gap: (s, f) => ({
    light: "day", dof: 2, pyl: { west: 1.1, east: 1.1, spark: 1.6 },
    cam: kick(move({ pos: Py(-3.6, 0.8, -9.5), look: Py(0, 4.2, 0), fov: 64, roll: 0.16 }, { pos: Py(1.4, 1.0, -7.2), look: Py(0, 4.1, 0), fov: 60, roll: -0.08 }, f, s.a, s.b - 2, smooth, 0), f, s.a + 6, 1.2),
    subjects: [["the gap", Py(0, 4.0, -0.2), 0.3]],
  }),
  converter: (s, f) => ({
    light: "day", dof: 2, pyl: { west: 1.1, east: 1.1, hut: true },
    cam: orbit(s, f, Py(0, 1.9, -0.4), [-36, 26], [10.5, 8.0], [3.4, 0.8], 54, [-0.07, 0.05]),
    subjects: [["converter station", Py(0.55, 1.5, -1.4), 0.3]],
  }),

  // ---------------- chapter 6: 2011 ----------------
  "tokyo-dark": (s, f) => ({
    light: "golden", dof: 4, pyl: { west: 1.3, east: 0, hut: true },
    cam: move({ pos: Py(-11, 6.5, -12), look: Py(-6.2, 1.7, -3.4), fov: 56, roll: -0.1 }, { pos: Py(-7.6, 1.6, -8.2), look: Py(-6.2, 1.7, -3.4), fov: 42, roll: 0.05 }, f, s.a, s.a + 26, expo, 0.001),
    people: [P("tokyo", Py(-6.2, 0, -4.4), "nervous", -1, { headTilt: 0.08 })],
  }),
  "west-lit": (s, f) => ({
    light: "golden", dof: 4, pyl: { west: 1.35, east: 0, hut: true },
    cam: orbit(s, f, Py(6.2, 1.8, -3.2), [-24, 18], [6.0, 4.8], [0.2, 0.5], 50, [0.08, -0.05]),
    people: [P("osaka", Py(6.2, 0, -4.4), "smile", 1)],
  }),
  "line-stood": (s, f) => {
    const u = smooth((f - s.a) / Math.max(1, s.b - s.a));
    return { light: "golden", dof: 2, pyl: { west: 1.3, east: 0, hut: true },
      cam: full({ pos: Py(5.5 - 9 * u, 0.9, -8.5), look: Py(1.5 - 3 * u, 2.6, 0), fov: 60, roll: -0.1 + 0.2 * u }),
      subjects: [["converter station", Py(0.55, 1.5, -1.4), 0.3]] };
  },
  "turns-dark": (s, f) => ({
    light: "golden", dof: 3, pyl: { west: 1.3, east: 1.1, eturn: (f - s.a) / 13, hut: true },
    cam: orbit(s, f, Py(-6.2, 2.0, -2.6), [-20, 22], [6.6, 5.2], [0.8, -0.4], 54, [-0.09, 0.06]),
  }),

  // ---------------- ending ----------------
  "clock-remember": (s, f) => ({
    light: "day", dof: 5, clock: 10.17 + (f - s.a) / FPS * 0.9,
    cam: move({ pos: Ck(3.6, 5.2, -7.6), look: Ck(0, 2.6, 0), fov: 54, roll: -0.12 }, { pos: Ck(1.1, 2.2, -4.0), look: Ck(0, 2.7, 0), fov: 46, roll: 0.05 }, f, s.a, s.a + 24, expo, 0.001),
    subjects: [["clock", Ck(0, 2.7, -0.2), 0.3]],
  }),
  "eng-lamps": (s, f) => ({
    light: "day", dof: 5, room: { sign: PITTS, bulb: 1.25, num: { text: "1890", fg: "#241726", k: 1 } },
    cam: orbit(s, f, Rm(0.9, 1.6, 1.6), [-24, 16], [5.4, 4.4], [0.4, 0.1], 50, [-0.06, 0.05]),
    people: BEHIND(["eng0", "eng1", "eng2"], ["smile_closed", "stern", "neutral"], -1.2, 1.3),
    subjects: [["number board", Rm(0.5, 2.15, 3.3), 0.3]],
  }),
  "stop-flicker": (s, f) => {
    const stop = W(175, "stop");
    return { light: "day", dof: 4, lamps: [1.25, 1.25, 1.25], flicker: f < stop ? 4 : 0,
      cam: kick(move({ pos: Lm(-3.6, 1.1, -5.2), look: Lm(-0.6, 2.2, 0), fov: 58, roll: 0.1 }, { pos: Lm(-1.8, 2.8, -6.6), look: Lm(-0.4, 2.3, 0), fov: 52, roll: -0.02 }, f, s.a, s.b - 2, smooth, 0), f, stop, 0.8),
      people: [P("eng0", Lm(-1.5, 0, -1.3), f < stop ? "pained" : "relief", 1), P("eng1", Lm(-0.3, 0, -1.6), f < stop ? "nervous" : "smile", 1)] };
  },
};

/** handheld sway on every 3D shot (the hook's first frames and the loop frame are steady, so the video loops) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const steady = (s.g === "hum60" && f < s.a + 2) || (s.g === "loop" && f >= s.b - 26);
  if (steady) return st;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * d, id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** frames where the 3D picture gets a sideways motion blur: the first frames of every 3D shot that swoops in */
const WHIP = new Set(["hum50", "west-lit0", "island-plant", "gen-lamps", "dark-half", "tokyo-dark", "arc-lamps", "depot", "clock-remember", "gap", "loop", "hum50b"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
void glide;
