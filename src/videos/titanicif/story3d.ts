// The Titanic "what if" long-form's 3D shots, as specs: for a shot key (timeline.ts `g`) and frame, the light, camera,
// what the ship, the iceberg, the room and the cards are doing, the cast, and the subjects the narration is about (for
// the framing check). Camera grammar is the house one (every shot an orbit, crane, dive, tracking move, long-lens slide
// or snap zoom; Dutch tilts; handheld sway on everything; a kick on every hit).
// Ship space: bow toward +x, y up from the waterline. Cameras sit mostly on the -z side, so the bow is screen left.
import { Expr } from "../bridge/toon";
import { FPS, ShotDef, wordAt, segAt } from "./timeline";

export type V3 = [number, number, number];
/** boat deck height, the crow's nest floor, the room's origin (far from the ship), the other steamer's patch of sea */
export const DECK = 16.62;
export const NEST: V3 = [97.25, 25, 0];
export const ROOM_O: V3 = [1400, 1, 1400];
const CAL_O: V3 = [0, 0, -1500];
const QUAY = 2.4, BOAT7_X = 25, WHEEL_X = -3.4;
const at = (o: V3) => (x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
export const Rm = at(ROOM_O);
const Cl = at(CAL_O);
const S = (x: number, y: number, z: number): V3 => [x, y, z];
/** on the boat deck / on the quay: x, height above the planks or cobbles, z */
const Dk = (x: number, y: number, z: number): V3 => [x, DECK + y, z];
const Qy = (x: number, y: number, z: number): V3 => [x, QUAY + y, z];
const Nt = at(NEST);

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; /** sitting in seaBoats[ride]: `p` is then in the boat's own frame (x along, y up from the keel, z across) and the person moves with the boat */ ride?: number; /** world points the hands are on: the arms reach to them */ hands?: V3[]; side?: { phase: number; mirror: boolean; stride?: number } };
type Num = { text: string; bg?: string; fg?: string; k?: number };
type Card = { kind: "paper" | "ice" | "spark"; p: V3; spin: number; s: number; /** lying face-up on something, not facing the camera */ flat?: boolean };
export type St3 = {
  light: "day" | "golden" | "night"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; wipe?: { color: string; a: number }; subjects?: [string, V3, number][];
  /** water sliding past (m/s): the ship is under way */
  flow?: number;
  ship?: { yaw?: number; pitch?: number; sink?: number; lights?: number; hide?: boolean };
  dock?: boolean;
  berg?: { p: V3; s?: number; yaw?: number } | null;
  floes?: V3 | null;
  cal?: { p: V3; yaw?: number; lights: number; kind?: "cal" | "carp" } | null;
  /** the story's lifeboat: 0..1 swung out over the side, metres lowered */
  boat?: { out: number; drop: number };
  seaBoats?: V3[];
  bell?: number;
  room?: { sign: [string, string]; /** night outside the wheelhouse windows */ night?: boolean; wheel?: number; radio?: boolean; papers?: number[]; num?: Num | null };
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

// the deck amidships (the gap between the forward and aft boats), where most deck scenes play
const MID: V3 = Dk(0, 1.45, -10.2);
const YOU0: V3 = Dk(0, 0, -10.2);
const SEA = { light: "night" as const, flow: 9 };
// rooms
const BRIDGE: [string, string] = ["ttbridge", "BRIDGE · R.M.S. TITANIC"], MARCONI: [string, string] = ["ttmarconi", "MARCONI WIRELESS ROOM"];
const TABLE: V3 = Rm(0.5, 1.2, 0.9);
// the helmsman stands behind the wheel with both hands on its rim
const HELM: V3 = Rm(WHEEL_X, 0.3, 1.35), RIM: V3[] = [Rm(WHEEL_X - 0.4, 1.33, 0.62), Rm(WHEEL_X + 0.4, 1.33, 0.62)];
const helm = (expr: Expr, look = 0): Person3 => P("helm", HELM, expr, look, { hands: RIM });
// the operator stands at the desk with his hand on the key
const PHIL: V3 = Rm(0.5, 0, 1.45), KEY: V3 = Rm(0.75, 1.07, 0.6), SET: V3 = Rm(0.35, 1.22, 0.82);
const phil = (expr: Expr, hands: V3[] = [KEY]): Person3 => P("phillips", PHIL, expr, 0, { hands });
const BEHIND = (names: string[], expr: Expr | Expr[], x0 = -0.9, dx = 1.4): Person3[] =>
  names.map((n, k) => P(n, Rm(x0 + k * dx, 0, 1.75), Array.isArray(expr) ? expr[k] : expr, k === 0 ? 1 : k === names.length - 1 ? -1 : 0));
const RED = "#c9373a", WHITE = "#ffffff";
// the lookouts, standing in the tub (only their heads and shoulders show over the rim)
const LOOKOUTS = (a: Expr, b: Expr = a): Person3[] => [P("fleet", Nt(0, 0.06, -0.36), a, 0, { low: true }), P("lee", Nt(0.05, 0.06, 0.4), b, 0, { low: true })];
const NESTC: V3 = Nt(0, 1.45, 0);
// the story's lifeboat when swung out: its middle, and seats along it
const B7 = (drop: number): V3 => [BOAT7_X, DECK + 0.75 - drop, -15.3];
const inBoat = (names: string[], drop: number, expr: Expr | Expr[] = "nervous", o: V3 = B7(drop)): Person3[] =>
  names.map((n, k) => P(n, [o[0] - 3.0 + (k % 6) * 1.2 + (k >= 6 ? 0.6 : 0), o[1] + 0.55, o[2] + (k >= 6 ? 0.55 : k % 2 ? 0.25 : -0.3)], Array.isArray(expr) ? expr[k % expr.length] : expr, 0, { low: true }));
// a boat in the water: people sit on its thwarts, inside the hull (half-width 1.12 inside, rail 1.24 above the keel)
const SEA_SEATS: V3[] = [[-2.6, 0.55, -0.45], [-1.3, 0.55, 0.45], [0, 0.55, -0.45], [1.3, 0.55, 0.45], [2.6, 0.55, -0.45], [-1.95, 0.55, 0.0], [0.65, 0.55, 0.0], [1.95, 0.55, -0.1]];
const inSeaBoat = (boat: number, names: string[], expr: (k: number) => Expr, kids: string[] = ["kid"]): Person3[] =>
  names.map((n, k) => { const q = SEA_SEATS[k % SEA_SEATS.length]; return P(n, [q[0], kids.includes(n) ? 0.95 : q[1], q[2]], expr(k), 0, { low: true, ride: boat }); });
// by the lifeboat: the bit of open deck just aft of it, seen from outside the rail
const GATE: V3 = Dk(17.6, 1.4, -10.5);
const gateCam = (s: ShotDef, f: number, a: [number, number] = [-16, 14], r: [number, number] = [9.2, 8.0], roll: [number, number] = [0.05, -0.04]) => orbit(s, f, GATE, a, r, [0.5, 0.25], 40, roll);
const YOUG = (expr: Expr, wave = 0.85): Person3 => P("you", Dk(19.3, 0, -10.6), expr, -1, { wave });

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- cold open ----------------
  "open-wide": (s, f) => ({ ...SEA, dof: 0,
    cam: move({ pos: S(190, 70, -200), look: S(30, 14, 0), fov: 52, roll: 0.07 }, { pos: S(64, 27, -74), look: S(6, 17, 0), fov: 46, roll: -0.03 }, f, s.a, s.b - 2, smooth, 0) }),
  "you-deck": (s, f) => ({ ...SEA, dof: 6,
    cam: kick(snap(Dk(1.6, 1.55, -15.2), MID, f, s.a, { fov: 40, roll: 0.09 }, 1.7, 6), f, s.a + 5, 0.8),
    people: [P("you", YOU0, "nervous", 0)] }),
  "berg-ahead": (s, f) => {
    const u = U(s, f), bx = 430 - 150 * u, hit = W(3, "iceberg");
    return { ...SEA, flow: 11, dof: 0, berg: { p: S(bx, 0, -5), s: 2.0 },
      cam: kick(move({ pos: S(129, 17.5, 2), look: S(260, 10, -4), fov: 58, roll: -0.08 }, { pos: S(133, 14.5, 0.5), look: S(260, 9, -5), fov: 44, roll: 0.03 }, f, s.a, s.b - 2, smooth, 0), f, hit, 1.2),
      subjects: [["iceberg", S(bx, 10, -5), 12]] };
  },
  "you-alone": (s, f) => ({ ...SEA, dof: 4,
    cam: orbit(s, f, MID, [-28, 22], [9.4, 7.4], [0.7, 0.25], 44, [0.06, -0.05]),
    people: [P("gent", Dk(-3.9, 0, -9.7), "smile", 1), P("lady", Dk(-2.7, 0, -9.5), "laugh", -1), P("you", YOU0, "nervous", 0, { headTilt: 0.06 }), P("lady2", Dk(2.9, 0, -9.5), "smile", 1), P("gent2", Dk(4.1, 0, -9.8), "smile_closed", -1)] }),
  warn: (s, f) => ({ ...SEA, dof: 6,
    cam: move({ pos: Dk(-3.6, 2.4, -17.5), look: Dk(0.2, 1.45, -10.2), fov: 46, roll: -0.08 }, { pos: Dk(-1.2, 1.6, -15.4), look: Dk(0.2, 1.5, -10.2), fov: 40, roll: 0.04 }, f, s.a, s.a + 18, expo, 0.001),
    people: [P("you", Dk(-0.75, 0, -10.2), "shock", 1, { wave: 0.9 }), P("gent", Dk(1.0, 0, -10.0), "stern", -1)] }),
  "ship-night-pass": (s, f) => { const u = smooth(U(s, f)); return { ...SEA, dof: 0,
    cam: full({ pos: S(70 - 95 * u, 8.5, -78), look: S(52 - 95 * u, 9.5, 0), fov: 26, roll: 0.05 - 0.1 * u }) }; },
  "didnt-matter": (s, f) => ({ ...SEA, dof: 0, flow: 0.3, berg: { p: S(330, 0, -34), s: 1.1, yaw: 0.5 },
    cam: orbit(s, f, S(318, 9, -30), [150, 118], [74, 58], [2, -3], 50, [-0.08, 0.05]),
    subjects: [["iceberg", S(330, 12, -34), 12]] }),

  // ---------------- chapter 1: Southampton ----------------
  "dock-wake": (s, f) => {
    const hit = W(18, "dock");
    return { light: "day", dock: true, flow: 0.2, dof: 6,
      cam: kick(snap(Qy(-4.3, 1.5, -28.6), Qy(-6, 1.45, -24), f, s.a, { fov: 40, roll: -0.1 }, 1.8, 6), f, hit, 0.9),
      people: [P("you", Qy(-6, 0, -24), f < hit ? "dazed" : "shock", 0, { headTilt: f < hit ? 0.1 : 0 })] };
  },
  "ship-reveal": (s, f) => ({ light: "day", dock: true, flow: 0.2, dof: 0,
    cam: move({ pos: Qy(-8, 1.5, -31), look: Qy(-6, 2.2, -22), fov: 46, roll: 0.08 }, { pos: S(-70, 34, -190), look: S(4, 17, 0), fov: 56, roll: -0.03 }, f, s.a + 3, s.b - 2, smooth, 0),
    people: [P("you", Qy(-6, 0, -24), "shock", 0)] }),
  "ship-length": (s, f) => { const u = smooth(U(s, f)); return { light: "day", dock: true, flow: 0.2, dof: 0,
    cam: full({ pos: S(128 - 190 * u, 9, -44), look: S(104 - 185 * u, 11, 0), fov: 44, roll: 0.06 - 0.1 * u }) }; },
  funnels: (s, f) => ({ light: "day", dock: true, flow: 0.2, dof: 0,
    cam: orbit(s, f, S(1, 31, 0), [-44, 26], [84, 60], [-14, -6], 50, [0.1, -0.07]) }),
  boarding: (s, f) => {
    const tt = (f - s.a) / FPS, names = ["gent", "lady", "worker", "lady2", "gent2", "mother", "kid", "gent3", "lady3"];
    const people = names.map((n, k) => walker(n, -14 + 1.25 * 0 - k * 1.7, QUAY, -22.4 + (k % 3) * 0.7, 1.25, tt, "neutral", k));
    const cx = -14 + 1.25 * tt - 6;
    return { light: "day", dock: true, flow: 0.2, dof: 3, people,
      cam: full({ pos: Qy(cx + 3.2, 1.2, -33.5), look: Qy(cx, 1.6, -22.5), fov: 52, roll: 0.05 }) };
  },
  "you-know": (s, f) => ({ light: "day", dock: true, flow: 0.2, dof: 10, closeup: true,
    cam: snap(Qy(-5.4, 1.62, -26.4), Qy(-6, 1.58, -24), f, s.a, { fov: 32, roll: 0.08 }),
    people: [P("you", Qy(-6, 0, -24), "nervous", 0, { headTilt: 0.05 })] }),
  grab: (s, f) => ({ light: "day", dock: true, flow: 0.2, dof: 6,
    cam: orbit(s, f, Qy(-5.2, 1.45, -24), [-24, 12], [6.4, 5.2], [0.4, 0.2], 44, [0.07, -0.04], expo),
    people: [P("you", Qy(-6, 0, -24), "nervous", 1, { wave: 0.8 }), P("man", Qy(-4.4, 0, -23.9), "neutral", -1)] }),
  "sink-say": (s, f) => ({ light: "day", dock: true, flow: 0.2, dof: 8,
    cam: kick(snap(Qy(-6.6, 1.6, -27.4), Qy(-5.4, 1.5, -24), f, s.a, { fov: 38, roll: -0.11 }), f, s.a + 4, 1),
    people: [P("you", Qy(-6, 0, -24), "shock", 1, { wave: 0.95 }), P("man", Qy(-4.4, 0, -23.9), "neutral", -1)] }),
  "he-laughs": (s, f) => ({ light: "day", dock: true, flow: 0.2, dof: 10, closeup: true,
    cam: snap(Qy(-3.7, 1.6, -26.3), Qy(-4.4, 1.56, -23.9), f, s.a, { fov: 32, roll: 0.1 }),
    people: [P("man", Qy(-4.4, 0, -23.9), "laugh", 0)] }),
  "laugh-wide": (s, f) => ({ light: "day", dock: true, flow: 0.2, dof: 5,
    cam: orbit(s, f, Qy(-4.4, 1.4, -23.6), [22, -18], [7.6, 6.2], [0.5, 0.2], 46, [-0.07, 0.05]),
    people: [P("you", Qy(-6.6, 0, -24.2), "pained", 1), P("man", Qy(-4.6, 0, -23.9), "laugh", -1), P("gent3", Qy(-3.2, 0, -23.5), "laugh", -1), P("lady2", Qy(-2.0, 0, -23.8), "laugh", -1)] }),
  stranger: (s, f) => {
    const tt = (f - s.a) / FPS;
    return { light: "day", dock: true, flow: 0.2, dof: 0,
      cam: move({ pos: Qy(-3, 3, -31), look: Qy(-6, 1.2, -24), fov: 46, roll: 0.1 }, { pos: Qy(1, 9.5, -43), look: Qy(-6, 0.8, -23), fov: 50, roll: -0.04 }, f, s.a, s.b - 2, smooth, 0),
      people: [P("you", Qy(-6, 0, -24), "shock", 0, { wave: 0.95 }), walker("gent", -16, QUAY, -21.6, 1.2, tt, "neutral", 1), walker("lady", -17.4, QUAY, -21.2, 1.2, tt, "neutral", 2), walker("worker", 6, QUAY, -26.8, -1.1, tt, "neutral", 3), walker("lady3", -22, QUAY, -27.6, 1.3, tt, "neutral", 4)] };
  },
  "ten-more": (s, f) => {
    const tt = (f - s.a) / FPS, x = -6 + 2.4 * tt, row = ["gent", "lady", "worker", "gent2", "lady3", "worker2", "husband", "wife"];
    return { light: "day", dock: true, flow: 0.2, dof: 4,
      cam: full({ pos: Qy(x + 2.6, 1.5, -31.2), look: Qy(x + 0.8, 1.4, -23), fov: 46, roll: -0.06 }),
      people: [walker("you", -6, QUAY, -24.6, 2.4, tt, "nervous", 0), ...row.map((n, k) => P(n, Qy(-3.4 + k * 2.3, 0, -22.4), k % 3 === 0 ? "stern" : k % 3 === 1 ? "neutral" : "smile_closed", 1))] };
  },
  "nobody-stays": (s, f) => {
    const tt = (f - s.a) / FPS, row = ["gent", "lady", "gent2", "lady3", "husband", "wife"];
    return { light: "day", dock: true, flow: 0.2, dof: 0,
      cam: move({ pos: Qy(-12, 1.4, -31), look: Qy(-4, 1.6, -23), fov: 50, roll: -0.08 }, { pos: Qy(-20, 9, -42), look: Qy(2, 2, -21), fov: 54, roll: 0.03 }, f, s.a, s.b - 2, smooth, 0),
      people: [P("you", Qy(-7, 0, -24.4), "pained", 1), ...row.map((n, k) => walker(n, -2 + k * 1.8, QUAY, -21.6 + (k % 2) * 0.6, 1.3, tt, "neutral", k))] };
  },
  "get-on": (s, f) => {
    const tt = (f - s.a) / FPS, x = 2 + 1.5 * tt;
    return { light: "day", dock: true, flow: 0.2, dof: 3,
      cam: full({ pos: Qy(x + 2.6, 0.9, -27.6), look: Qy(x + 0.5, 2.2, -21), fov: 52, roll: 0.08 }),
      people: [walker("you", 2, QUAY, -21.4, 1.5, tt, "stern", 0)] };
  },
  "ship-leave": (s, f) => ({ light: "golden", dock: true, flow: 0.3, dof: 0,
    cam: move({ pos: Qy(-10, 2.2, -40), look: S(10, 14, 0), fov: 56, roll: 0.06 }, { pos: Qy(-46, 22, -110), look: S(10, 16, 0), fov: 56, roll: -0.03 }, f, s.a, s.b - 2, smooth, 0),
    people: [P("worker", Qy(-13, 0, -24), "smile", 0, { wave: 0.8 }), P("lady3", Qy(-9.6, 0, -23.4), "smile", 0, { wave: 0.6 }), P("worker2", Qy(-4, 0, -24.6), "smile_closed", 0), P("gent3", Qy(1, 0, -23.2), "smile", 0, { wave: 0.9 })] }),

  // ---------------- chapter 2: the captain ----------------
  "smith-bridge": (s, f) => ({ light: "day", dof: 5, room: { sign: BRIDGE, wheel: 0.25 * Math.sin(t(f) * 0.9) },
    cam: orbit(s, f, Rm(-1.4, 1.5, 1.4), [-30, 10], [7.4, 6.0], [0.8, 0.4], 48, [0.07, -0.03], expo),
    people: [helm("neutral", 1), P("smith", Rm(0.4, 0, 1.75), "stern", 0)] }),
  "days-near": (s, f) => {
    const tt = (f - s.a) / FPS, x = -10 + 1.2 * tt;
    return { light: "day", flow: 9, dof: 4,
      cam: full({ pos: Dk(x + 1.5, 2.0, -34), look: Dk(x - 3.5, 1.4, -10), fov: 26, roll: -0.04 }),
      people: [walker("smith", -10, DECK, -9.6, 1.2, tt, "stern", 0), walker("officer", -11.3, DECK, -9.1, 1.2, tt, "neutral", 2), walker("you", -19.5, DECK, -10.6, 1.2, tt, "nervous", 1)] };
  },
  "sir-ice": (s, f) => ({ light: "day", dof: 6, room: { sign: BRIDGE, wheel: 0.2 * Math.sin(t(f) * 0.9) },
    cam: orbit(s, f, Rm(1.2, 1.45, 1.5), [24, -14], [5.2, 4.3], [0.4, 0.2], 44, [-0.07, 0.05]),
    people: [P("smith", Rm(0.4, 0, 1.75), "stern", 1), P("you", Rm(2.1, 0, 1.75), "nervous", -1, { wave: 0.8 })] }),
  "he-knows": (s, f) => ({ light: "day", dof: 10, closeup: true, room: { sign: BRIDGE },
    cam: kick(snap(Rm(1.05, 1.64, -0.7), Rm(0.4, 1.6, 1.75), f, s.a, { fov: 34, roll: 0.1 }), f, s.a + 4, 0.8),
    people: [P("smith", Rm(0.4, 0, 1.75), "stern", 0)] }),
  "smith-paper": (s, f) => {
    const k = pop(f, s.a + 2);
    return { light: "day", dof: 8, room: { sign: BRIDGE },
      cam: move({ pos: Rm(-0.6, 2.4, -2.6), look: Rm(0.4, 1.3, 1.5), fov: 44, roll: -0.09 }, { pos: Rm(0.1, 1.7, -1.6), look: Rm(0.4, 1.35, 1.5), fov: 40, roll: 0.03 }, f, s.a, s.a + 20, expo, 0.001),
      cards: [{ kind: "paper", p: Rm(-0.08, 1.32, 1.5), spin: -0.1, s: 0.8 * k }, { kind: "paper", p: Rm(0.88, 1.32, 1.5), spin: 0.1, s: 0.8 * k }],
      people: [P("smith", Rm(0.4, 0, 1.75), "stern", 0, { hands: [Rm(0.1, 1.2, 1.5), Rm(0.7, 1.2, 1.5)] })],
      subjects: [["ice warning", Rm(-0.08, 1.32, 1.5), 0.3]] };
  },
  knots: (s, f) => ({ ...SEA, flow: 14, dof: 0,
    cam: move({ pos: S(186, 2.2, -34), look: S(128, 8, -4), fov: 60, roll: 0.12 }, { pos: S(150, 5, -52), look: S(110, 9, -6), fov: 52, roll: -0.04 }, f, s.a, s.b - 2, smooth, 0) }),
  "lookouts-trust": (s, f) => ({ light: "day", flow: 9, dof: 3,
    cam: move({ pos: S(120, 15, -19), look: Nt(0, 0.4, 0), fov: 52, roll: -0.09 }, { pos: Nt(7.5, 3.4, -7), look: NESTC, fov: 44, roll: 0.04 }, f, s.a, s.b - 4, smooth, 0),
    people: LOOKOUTS("stern", "neutral") }),
  "nothing-new": (s, f) => ({ light: "day", dof: 6, room: { sign: BRIDGE, wheel: 0.2 * Math.sin(t(f) * 0.9) },
    cam: orbit(s, f, Rm(1.2, 1.5, 1.5), [-22, 16], [4.8, 4.1], [0.2, 0.5], 44, [0.06, -0.05]),
    people: [P("smith", Rm(0.4, 0, 1.75), "neutral", 1), P("you", Rm(2.1, 0, 1.75), "nervous", -1)] }),
  "least-qualified": (s, f) => ({ light: "day", dof: 5, room: { sign: BRIDGE },
    cam: snap(Rm(0.5, 1.5, -2.9), Rm(0.5, 1.5, 1.75), f, s.a, { fov: 44, roll: -0.06 }, 1.6, 6),
    people: BEHIND(["murdoch", "smith", "officer"], "stern", -0.9, 1.4) }),

  // ---------------- chapter 3: the lookouts ----------------
  nest: (s, f) => ({ ...SEA, dof: 5,
    cam: orbit(s, f, NESTC, [62, 112], [7.4, 5.6], [1.6, 0.5], 44, [0.08, -0.06]),
    people: LOOKOUTS("stern", "neutral") }),
  "bare-eyes": (s, f) => ({ ...SEA, dof: 10, closeup: true,
    cam: snap(Nt(2.5, 1.72, -1.5), Nt(0, 1.62, -0.36), f, s.a, { fov: 30, roll: -0.1 }),
    people: [P("fleet", Nt(0, 0.06, -0.36), "stern", 0, { low: true })] }),
  "dark-ahead": (s, f) => ({ ...SEA, flow: 11, dof: 0,
    cam: move({ pos: Nt(-0.6, 4.4, 0.3), look: S(240, 4, 0), fov: 60, roll: 0.06 }, { pos: Nt(3.2, 3.0, 0.2), look: S(260, 3, 0), fov: 50, roll: -0.03 }, f, s.a, s.b - 2, smooth, 0) }),
  search: (s, f) => {
    const tt = (f - s.a) / FPS, x = -8 + 2.6 * tt;
    return { ...SEA, dof: 4,
      cam: full({ pos: Dk(x + 2.2, 1.5, -17.2), look: Dk(x + 0.6, 1.4, -10.4), fov: 38, roll: 0.07 }),
      people: [walker("you", -8, DECK, -10.4, 2.6, tt, "nervous", 0)] };
  },
  "no-moon": (s, f) => { const u = smooth(U(s, f)); return { ...SEA, dof: 0,
    cam: full({ pos: S(60, 22, -90), look: L3(S(20, 18, 0), S(-40, 190, 260), u), fov: 54, roll: 0.05 - 0.1 * u }) }; },
  "flat-calm": (s, f) => ({ ...SEA, flow: 0.15, dof: 0, berg: { p: S(700, 0, 40), s: 1.2 },
    cam: move({ pos: S(250, 1.1, -30), look: S(700, 6, 40), fov: 52, roll: -0.05 }, { pos: S(330, 2.2, -18), look: S(700, 8, 40), fov: 46, roll: 0.03 }, f, s.a, s.b - 2, smooth, 0) }),
  "berg-dark": (s, f) => ({ ...SEA, flow: 0.15, dof: 0, berg: { p: S(700, 0, 40), s: 1.2 },
    cam: orbit(s, f, S(700, 9, 40), [-150, -112], [78, 54], [6, 1], 48, [0.08, -0.05]),
    subjects: [["iceberg", S(700, 12, 40), 14]] }),
  "no-binoc": (s, f) => ({ ...SEA, dof: 6,
    cam: orbit(s, f, Dk(0.2, 1.45, -10.2), [20, -16], [7.6, 6.4], [0.5, 0.2], 42, [-0.07, 0.05]),
    people: [P("you", Dk(-0.9, 0, -10.2), "nervous", 1, { wave: 0.8 }), P("officer", Dk(1.0, 0, -10.0), "stern", 1, { facing: 1 })] }),

  // ---------------- chapter 4: the wireless room ----------------
  "wireless-wide": (s, f) => ({ light: "day", dof: 5, room: { sign: MARCONI, radio: true, papers: [0.14, 0.08, 0.05, 0] },
    cam: orbit(s, f, TABLE, [-34, 8], [6.6, 5.0], [0.9, 0.5], 50, [0.07, -0.03], expo),
    people: [phil("stern")] }),
  fixing: (s, f) => {
    const on = Math.sin(f * 1.7) > 0.2;
    return { light: "day", dof: 7, room: { sign: MARCONI, radio: true, papers: [0.1, 0.05, 0, 0] },
      cam: kick(move({ pos: Rm(-1.6, 1.0, -2.4), look: Rm(0.5, 1.2, 0.7), fov: 48, roll: 0.12 }, { pos: Rm(-0.7, 1.25, -1.8), look: Rm(0.5, 1.25, 0.7), fov: 46, roll: 0.06 }, f, s.a, s.a + 16, expo, 0.001), f, s.a + 10, 0.8),
      cards: on ? [{ kind: "spark", p: Rm(0.37, 1.34, 0.7), spin: f * 0.9, s: 0.34 + 0.1 * Math.sin(f * 2.3) }] : [],
      people: [P("bride", Rm(-0.9, 0, 1.45), "nervous", 1), P("phillips", Rm(0.75, 0, 1.45), "pained", -1, { hands: [SET] })] };
  },
  buried: (s, f) => {
    const u = smooth(U(s, f)), x = 1.2 + 1.6 * u;
    return { light: "day", dof: 7, room: { sign: MARCONI, radio: true, papers: [0.14 + 0.5 * u, 0.08 + 0.42 * u, 0.05 + 0.36 * u, 0.32 * u] },
      cam: full({ pos: Rm(x - 2.4, 1.55, -2.5), look: Rm(x * 0.5 + 0.5, 1.3, 0.9), fov: 40, roll: 0.05 }),
      people: [phil("pained")] };
  },
  hundreds: (s, f) => {
    const cards: Card[] = [];
    for (let k = 0; k < 14; k++) {
      const f0 = s.a + 1 + k * 2.6, u = (f - f0) / 20;
      if (u <= 0 || u >= 1) continue;
      const x = 1.2 + (k * 1.3) % 2.2, zx = (k % 3 - 1) * 0.4;
      cards.push({ kind: "paper", p: Rm(x + (0.5 - x) * 0.7 * u + zx * u, 1.5 + 0.9 * Math.sin(u * Math.PI) + 0.1 * u, 0.6 - 4.4 * u), spin: (k % 2 ? 1 : -1) * u * 4, s: 0.7 + 1.5 * u });
    }
    return { light: "day", dof: 3, room: { sign: MARCONI, radio: true, papers: [0.64, 0.5, 0.41, 0.32] }, cards,
      cam: kick(kick(full({ pos: Rm(0.5, 1.15, -4.6), look: Rm(0.6, 1.55, 0.6), fov: 60, roll: 0.06 }), f, s.a + 14, 1), f, s.a + 30, 1.1),
      people: [phil("shock", [])] };
  },
  "set-aside": (s, f) => {
    const u = smooth((f - s.a - 6) / 24), p = L3(Rm(0.3, 1.04, 0.5), Rm(1.5, 1.4, 0.78), u);
    return { light: "day", dof: 9, closeup: true, room: { sign: MARCONI, radio: true, papers: [0.64, 0.5, 0.41, 0.32] },
      cam: snap(Rm(1.5, 1.7, -1.8), Rm(1.0, 1.25, 0.55), f, s.a, { fov: 40, roll: -0.08 }),
      cards: [{ kind: "paper", p, spin: -0.2 + 0.25 * u, s: 0.8 }],
      people: [P("phillips", Rm(0.95, 0, 1.45), "stern", 0, { hands: [[p[0] + 0.12, p[1] + 0.02, p[2]]] })],
      subjects: [["the warning", p, 0.3]] };
  },
  californian: (s, f) => ({ light: "night", flow: 0.15, dof: 0, cal: { p: CAL_O, lights: 1, yaw: 0.25 }, floes: CAL_O, ship: { hide: true },
    cam: orbit(s, f, Cl(0, 8, 0), [-40, -8], [230, 160], [40, 16], 46, [0.07, -0.04]),
    subjects: [["the Californian", Cl(0, 8, 0), 12]] }),
  "cal-ice": (s, f) => ({ light: "night", flow: 0.15, dof: 0, cal: { p: CAL_O, lights: 1, yaw: 0.25 }, floes: CAL_O, ship: { hide: true },
    cam: orbit(s, f, Cl(8, 5, 0), [14, 44], [96, 74], [7, 2.4], 50, [-0.08, 0.06]) }),
  "phillips-answers": (s, f) => ({ light: "day", dof: 10, closeup: true, room: { sign: MARCONI, radio: true, papers: [0.64, 0.5, 0.41, 0.32] },
    cam: kick(snap(Rm(-0.2, 1.62, -0.9), Rm(0.5, 1.6, 1.45), f, s.a, { fov: 34, roll: -0.1 }), f, s.a + 4, 0.8),
    people: [phil("stern")] }),
  "cal-off": (s, f) => {
    const off = W(92, "switches") + 8;
    return { light: "night", flow: 0.15, dof: 0, cal: { p: CAL_O, lights: f < off ? 1 : 0.1, yaw: 0.25 }, floes: CAL_O, ship: { hide: true },
      cam: orbit(s, f, Cl(-4, 8, 0), [-30, 4], [70, 92], [5, 12], 46, [0.06, -0.04]),
      subjects: [["the Californian", Cl(-4, 8, 0), 12]] };
  },
  door: (s, f) => ({ light: "day", dof: 4, room: { sign: MARCONI, radio: true, papers: [0.64, 0.5, 0.41, 0.32] },
    cam: move({ pos: Rm(2.6, 1.7, 2.9), look: Rm(0.4, 1.4, -8), fov: 46, roll: 0.07 }, { pos: Rm(1.4, 1.6, -1.2), look: Rm(0.1, 1.35, -8), fov: 40, roll: -0.03 }, f, s.a, s.b - 2, smooth, 0),
    people: [P("you", Rm(0, 0, -8.4), "nervous", 0, { headTilt: 0.05 })] }),
  desk: (s, f) => ({ light: "day", dof: 9, closeup: true, room: { sign: MARCONI, radio: true, papers: [0.64, 0.5, 0.41, 0.32] },
    cam: kick(snap(Rm(2.9, 1.55, -1.5), Rm(2.2, 1.2, 0.6), f, s.a, { fov: 38, roll: 0.11 }), f, s.a + 4, 0.7),
    subjects: [["the paper pile", Rm(2.0, 1.3, 0.45), 0.25]] }),
  note: (s, f) => {
    // each slip drops a hand's height and lies flat on the first pile, one on another
    const TOP = 0.8 + 0.55 * 0.64 + 0.004;
    const cards: Card[] = [], land = (f0: number, x: number, y: number, sp: number) => { const u = clamp01((f - f0) / 6); if (u > 0) cards.push({ kind: "paper", p: Rm(x, y + 0.35 * (1 - u) * (1 - u), 0.6), spin: sp, s: 0.42, flat: true }); };
    land(s.a + 4, 1.5, TOP, 0.1);
    for (let k = 0; k < 5; k++) land(s.a + 26 + k * 9, 1.5 + (k % 2 ? 0.02 : -0.02), TOP + 0.004 * (k + 1), (k % 2 ? -1 : 1) * 0.16);
    return { light: "day", dof: 8, closeup: true, room: { sign: MARCONI, radio: true, papers: [0.64, 0.5, 0.41, 0.32] }, cards,
      cam: orbit(s, f, Rm(1.6, 1.2, 0.55), [26, -12], [3.2, 2.7], [1.5, 1.2], 40, [0.08, -0.05]),
      subjects: [["the note", Rm(1.5, 1.17, 0.6), 0.3]] };
  },

  // ---------------- chapter 5: 11:39 ----------------
  "back-deck": (s, f) => ({ ...SEA, dof: 5,
    cam: orbit(s, f, MID, [26, -10], [8.2, 5.6], [0.9, 0.2], 42, [-0.09, 0.05], expo),
    people: [P("you", YOU0, "shock", 0)] }),
  bell: (s, f) => {
    const r0 = W(100, "rings") - 2, e = f - r0, ring = e >= 0 && e < 40;
    let c = orbit(s, f, Nt(0.35, 1.9, 0), [108, 78], [5.6, 4.6], [0.5, 0.9], 44, [-0.08, 0.06]);
    for (const k of [0, 13, 26]) c = kick(c, f, r0 + k, 0.9);
    const sw = ring ? 0.6 * Math.sin((e / 13) * Math.PI * 2) : 0, rope: V3 = Nt(0.85 + 1.08 * Math.sin(sw), 2.75 - 1.08 * Math.cos(sw), 0);
    return { ...SEA, flow: 11, dof: 6, bell: sw, cam: c,
      people: [P("fleet", Nt(0.42, 0.06, -0.12), "shock", 0, { low: true, hands: [rope] }), P("lee", Nt(-0.3, 0.06, 0.42), "shock", 0, { low: true })], subjects: [["the bell", Nt(0.85, 2.5, 0), 0.5]] };
  },
  "iceberg-ahead": (s, f) => {
    const u = U(s, f), bx = 232 - 50 * u;
    return { ...SEA, flow: 11, dof: 0, berg: { p: S(bx, 0, -5), s: 1.9 },
      cam: kick(snap(Nt(1.6, 2.6, 0.4), S(bx, 9, -5), f, s.a, { fov: 40, roll: 0.1 }, 1.02, 6), f, s.a + 4, 1.4),
      subjects: [["iceberg", S(bx, 10, -5), 14]] };
  },
  "officer-bridge": (s, f) => ({ light: "day", dof: 6, room: { sign: BRIDGE, night: true, wheel: 0 },
    cam: kick(snap(Rm(-1.2, 1.6, -3.6), Rm(-1.5, 1.55, 1.75), f, s.a, { fov: 46, roll: 0.09 }, 1.6, 6), f, s.a + 5, 1),
    people: [helm("shock", 1), P("murdoch", Rm(0.4, 0, 1.75), "shock", 0)] }),
  turn: (s, f) => ({ light: "day", dof: 9, closeup: true, room: { sign: BRIDGE, night: true, wheel: -7 * expo((f - s.a) / 26) },
    cam: kick(snap(Rm(WHEEL_X + 1.0, 1.5, -2.1), Rm(WHEEL_X, 1.4, 0.63), f, s.a, { fov: 40, roll: -0.12 }), f, s.a + 3, 1.2),
    people: [helm("shock")],
    subjects: [["the wheel", Rm(WHEEL_X, 1.05, 0.6), 0.2]] }),
  swing: (s, f) => {
    const u = smooth(U(s, f));
    return { ...SEA, flow: 11, dof: 0, ship: { yaw: -0.13 * u }, berg: { p: S(246 - 78 * u, 0, -12 - 14 * u), s: 1.2 },
      cam: full({ pos: S(176 - 20 * u, 250 - 40 * u, -70), look: S(150 - 10 * u, 0, -8), fov: 52, roll: -0.12 + 0.2 * u }) };
  },
  almost: (s, f) => {
    const u = smooth(U(s, f));
    return { ...SEA, flow: 11, dof: 0, berg: { p: S(200 - 52 * u, 0, -31), s: 1.15 },
      cam: move({ pos: S(118, 2.0, -70), look: S(140, 9, -16), fov: 58, roll: 0.12 }, { pos: S(132, 3.0, -62), look: S(140, 10, -16), fov: 52, roll: -0.03 }, f, s.a, s.b - 2, smooth, 0) };
  },
  scrape: (s, f) => {
    const u = U(s, f), bx = 132 - 62 * u, cards: Card[] = [];
    for (let k = 0; k < 8; k++) { const ph = ((f - s.a) * 0.045 + k * 0.137) % 1; cards.push({ kind: "ice", p: S(bx + 16 - k * 1.1, 6 + 9 * Math.sin(ph * Math.PI) + (k % 3), -15.2 - 9 * ph), spin: ph * 6 * (k % 2 ? 1 : -1), s: 2.0 + (k % 3) * 0.9 }); }
    return { ...SEA, flow: 11, dof: 0, berg: { p: S(bx, 0, -30.5), s: 1.15, yaw: 0.4 }, cards,
      cam: kick(kick(full({ pos: S(bx - 6, 5.5, -86), look: S(bx + 8, 9, -14), fov: 46, roll: 0.07 }), f, s.a + 6, 1.4), f, s.a + 24, 1.2) };
  },
  "barely-feel": (s, f) => ({ ...SEA, dof: 5,
    cam: kick(orbit(s, f, Dk(-0.4, 1.45, -10), [-20, 14], [8.4, 7.0], [0.5, 0.2], 42, [0.05, -0.04]), f, s.a + 8, 0.5),
    people: [P("gent", Dk(-1.6, 0, -9.9), "smile_closed", 1), P("lady", Dk(-0.2, 0, -9.7), "smile", -1), P("gent2", Dk(1.4, 0, -10.1), "neutral", -1)] }),
  "ice-play": (s, f) => {
    const cards: Card[] = [];
    // one chunk held in both hands, one held up in one hand, the rest lying on the deck
    const bob = 0.03 * Math.sin((f - s.a) * 0.25), held: V3 = S(99.2, 12.1 + bob, -5.75), up: V3 = S(101.3, 12.75 + 0.05 * Math.sin((f - s.a) * 0.2), -5.3);
    cards.push({ kind: "ice", p: held, spin: 0.2, s: 0.75 }, { kind: "ice", p: up, spin: -0.4, s: 0.55 });
    for (const [x, z, sp, sz] of [[97.9, -6.6, 0.5, 0.8], [100.3, -6.9, 2.1, 1.0], [101.9, -6.4, 1.2, 0.7], [103.4, -6.8, 0.2, 0.9]]) cards.push({ kind: "ice", p: S(x, 11.06 + 0.2 * sz, z), spin: sp, s: sz });
    return { ...SEA, dof: 4, cards,
      cam: orbit(s, f, S(100.6, 12.5, -5.8), [-24, 18], [9.6, 8.0], [0.6, 0.3], 44, [0.07, -0.05]),
      people: [P("worker", S(99.2, 11.06, -5.4), "grin", 1, { hands: [[held[0] - 0.16, held[1] - 0.05, held[2]], [held[0] + 0.16, held[1] - 0.05, held[2]]] }), P("gent3", S(100.8, 11.06, -5.0), "laugh", 0, { hands: [[up[0], up[1] - 0.08, up[2]]] }), P("worker2", S(102.5, 11.06, -5.5), "smile", -1)] };
  },
  "wheel-man": (s, f) => ({ light: "day", dof: 6, room: { sign: BRIDGE, night: true, wheel: -7 },
    cam: orbit(s, f, Rm(WHEEL_X + 0.9, 1.45, 1.4), [20, -16], [5.0, 4.2], [0.3, 0.5], 44, [-0.07, 0.05]),
    people: [helm("dazed", 1), P("you", Rm(WHEEL_X + 1.9, 0, 1.75), "nervous", -1, { wave: 0.85 })] }),
  truth: (s, f) => ({ light: "day", dof: 6, room: { sign: BRIDGE, night: true },
    cam: orbit(s, f, Rm(0.5, 1.5, 1.6), [-26, 14], [5.2, 4.2], [0.5, 0.2], 44, [0.06, -0.05]),
    people: [P("andrews", Rm(-0.3, 0, 1.75), "stern", 1), P("smith", Rm(1.3, 0, 1.75), "nervous", -1)] }),

  // ---------------- chapter 6: the empty seats ----------------
  "thats-it": (s, f) => ({ ...SEA, flow: 0.3, dof: 0,
    cam: move({ pos: Dk(1.0, 1.6, -15.5), look: MID, fov: 42, roll: 0.07 }, { pos: S(-18, 52, -110), look: S(0, 15, 0), fov: 52, roll: -0.03 }, f, s.a + 8, s.b - 2, smooth, 0),
    people: [P("you", YOU0, "pained", 0, { headTilt: 0.08 })] }),
  "save-ship": (s, f) => ({ light: "night", flow: 0.3, dof: 0, ship: { pitch: -0.014, sink: 0.4 },
    cam: orbit(s, f, S(20, 12, 0), [-52, -22], [290, 230], [46, 22], 46, [0.06, -0.04]) }),
  finished: (s, f) => { const u = smooth(U(s, f)); return { light: "night", flow: 0.3, dof: 0, ship: { pitch: -0.045 - 0.03 * u, sink: 1.5 + 2.0 * u },
    cam: move({ pos: S(160, 2.2, -36), look: S(124, 6, 0), fov: 58, roll: 0.14 }, { pos: S(148, 4.5, -27), look: S(120, 5, 0), fov: 52, roll: 0.05 }, f, s.a, s.b - 2, smooth, 0) }; },
  people: (s, f) => ({ light: "night", flow: 0.3, dof: 3,
    cam: orbit(s, f, Dk(0, 1.4, -10), [26, -20], [12.5, 9.5], [1.6, 0.4], 46, [-0.07, 0.05]),
    people: [P("gent", Dk(-5.2, 0, -9.6), "nervous", 1), P("lady", Dk(-3.9, 0, -9.9), "nervous", 1), P("mother", Dk(-2.2, 0, -9.5), "nervous", 0), P("kid", Dk(-1.3, 0, -10.4), "neutral", 0), P("husband", Dk(0.6, 0, -9.7), "stern", -1), P("wife", Dk(1.6, 0, -9.9), "nervous", -1), P("lady3", Dk(3.3, 0, -9.5), "neutral", -1), P("gent2", Dk(4.6, 0, -10.0), "stern", -1)] }),
  "boats-row": (s, f) => { const u = smooth(U(s, f)); return { light: "night", flow: 0.3, dof: 0,
    cam: full({ pos: S(72 - 52 * u, DECK + 5.5, -34), look: S(66 - 52 * u, DECK + 0.9, -12.3), fov: 38, roll: 0.06 - 0.1 * u }) }; },
  "nobody-believes": (s, f) => ({ light: "night", flow: 0.3, dof: 3, boat: { out: 1, drop: 0 },
    cam: orbit(s, f, Dk(19, 1.3, -11), [-22, 10], [15, 12], [5.5, 3.4], 44, [0.07, -0.04]),
    people: [P("officer", Dk(19.2, 0, -10.8), "stern", -1, { wave: 0.8 }), P("gent", Dk(16.9, 0, -10.1), "smile", 1), P("lady", Dk(15.6, 0, -10.4), "laugh", 1), P("lady2", Dk(14.2, 0, -9.9), "smile_closed", 1)] }),
  "barely-tilt": (s, f) => ({ light: "night", flow: 0.3, dof: 0, ship: { pitch: -0.016, sink: 0.5 },
    cam: orbit(s, f, S(10, 14, 0), [24, 52], [250, 200], [18, 34], 44, [-0.06, 0.04]) }),
  "lights-on": (s, f) => { const u = smooth(U(s, f)); return { light: "night", flow: 0.3, dof: 0,
    cam: full({ pos: S(46 - 56 * u, 14.2, -33), look: S(40 - 56 * u, 13.8, -13.6), fov: 32, roll: -0.05 + 0.1 * u }) }; },
  "boat-hang": (s, f) => ({ light: "night", flow: 0.3, dof: 0, boat: { out: 1, drop: 2.5 },
    cam: move({ pos: S(BOAT7_X + 13, 1.2, -40), look: S(BOAT7_X, DECK - 2.0, -15.3), fov: 56, roll: 0.14 }, { pos: S(BOAT7_X + 5, 2.2, -31), look: S(BOAT7_X, DECK - 1.8, -15.3), fov: 50, roll: 0.04 }, f, s.a, s.b - 2, smooth, 0),
    people: inBoat(["lady2", "sailor", "lady"], 2.5, "nervous").map((q, k) => ({ ...q, p: [BOAT7_X - 2.4 + k * 2.4, q.p[1], q.p[2]] as V3 })),
    subjects: [["the lifeboat", B7(2.5), 2]] }),
  "officers-unsure": (s, f) => ({ light: "night", flow: 0.3, dof: 5, boat: { out: 1, drop: 0 },
    cam: gateCam(s, f, [14, -14], [8.4, 7.2], [-0.06, 0.05]),
    people: [P("murdoch", Dk(18.6, 0, -10.6), "nervous", 1, { headTilt: 0.06 }), P("officer", Dk(16.9, 0, -10.3), "nervous", 1)] }),
  "half-empty": (s, f) => {
    const u = smooth(U(s, f)), drop = 1 + 9 * u;
    return { light: "night", flow: 0.3, dof: 0, boat: { out: 1, drop },
      cam: full({ pos: S(BOAT7_X + 9 - 4 * u, DECK + 9 - 7 * u, -36 + 4 * u), look: [BOAT7_X, DECK + 0.6 - drop, -15.3], fov: 46, roll: 0.07 - 0.1 * u }),
      people: inBoat(["lady2", "sailor", "lady", "lady3"], drop, ["nervous", "stern", "nervous", "neutral"]).map((q, k) => ({ ...q, p: [BOAT7_X - 2.7 + k * 1.8, q.p[1], q.p[2]] as V3 })),
      subjects: [["the lifeboat", B7(drop), 2]] };
  },
  "cant-berg": (s, f) => ({ ...SEA, flow: 11, dof: 0, berg: { p: S(150, 0, -31), s: 1.2, yaw: 0.3 },
    cam: orbit(s, f, S(140, 8, -20), [-70, -40], [130, 100], [50, 26], 46, [0.08, -0.05]),
    subjects: [["iceberg", S(150, 14, -31), 14]] }),
  "cant-captain": (s, f) => ({ light: "night", flow: 0.3, dof: 10, closeup: true,
    cam: kick(snap(Dk(0.8, 1.64, -13.0), Dk(0, 1.6, -10.2), f, s.a, { fov: 32, roll: -0.09 }), f, s.a + 4, 0.7),
    people: [P("smith", YOU0, "stern", 0)] }),
  "get-in": (s, f) => {
    const hit = W(151, "Get");
    return { light: "night", flow: 0.3, dof: 5, boat: { out: 1, drop: 0 },
      cam: kick(gateCam(s, f, [-18, 8], [9.4, 7.6]), f, hit, 1),
      people: [YOUG(f < hit ? "stern" : "shock"), P("gent", Dk(16.9, 0, -10.2), "neutral", 1), P("lady", Dk(15.7, 0, -10.5), "nervous", 1)] };
  },
  mother: (s, f) => ({ light: "night", flow: 0.3, dof: 6, boat: { out: 1, drop: 0 },
    cam: gateCam(s, f, [16, -8], [8.0, 6.8], [-0.06, 0.04]),
    people: [YOUG("nervous"), P("mother", Dk(17.3, 0, -10.2), "nervous", 1, { headTilt: 0.06 }), P("kid", Dk(16.3, 0, -10.9), "neutral", 1)] }),
  couple: (s, f) => ({ light: "night", flow: 0.3, dof: 6, boat: { out: 1, drop: 0 },
    cam: gateCam(s, f, [-12, 12], [7.8, 6.8]),
    people: [YOUG("nervous"), P("husband", Dk(17.3, 0, -10.2), "stern", 1), P("wife", Dk(16.5, 0, -10.4), "nervous", 1, { headTilt: -0.06 })] }),
  "says-no": (s, f) => {
    const tt = (f - s.a) / FPS, go = Math.max(0, tt - 0.5);
    return { light: "night", flow: 0.3, dof: 5, boat: { out: 1, drop: 0 },
      cam: gateCam(s, f, [10, -12], [8.8, 8.0], [-0.05, 0.05]),
      people: [YOUG("pained", 0.5), go > 0 ? walker("gent", 17.0, DECK, -10.2, -1.3, go, "stern", 1) : P("gent", Dk(17.0, 0, -10.2), "stern", 1)] };
  },
  tenth: (s, f) => ({ light: "night", flow: 0.3, dof: 3, boat: { out: 1, drop: 0 },
    cam: orbit(s, f, Dk(21.5, 1.0, -13), [-6, 20], [14, 11.5], [6.2, 4.2], 44, [0.06, -0.04]),
    people: [YOUG("relief", 0.4), ...inBoat(["lady3", "mother", "kid", "lady2"], 0, ["smile", "nervous", "neutral", "nervous"]).map((q, k) => ({ ...q, p: [BOAT7_X - 3 + k * 1.5, q.p[1], q.p[2]] as V3 }))] }),
  "dont-believe": (s, f) => ({ light: "night", flow: 0.3, dof: 5, boat: { out: 1, drop: 0 },
    cam: gateCam(s, f, [-20, 16], [10.0, 8.2]),
    people: [YOUG("stern"), P("wife", Dk(17.2, 0, -10.2), "nervous", 1), P("husband", Dk(16.2, 0, -10.5), "stern", 1), P("gent2", Dk(14.9, 0, -10.0), "neutral", 1), P("lady", Dk(13.8, 0, -10.4), "nervous", 1)] }),
  "take-seat": (s, f) => {
    const names = ["lady3", "mother", "kid", "lady2", "wife", "husband", "lady", "gent2", "gent3", "worker2"], n = Math.min(names.length, 3 + Math.floor(U(s, f) * 8.5));
    return { light: "night", flow: 0.3, dof: 3, boat: { out: 1, drop: 0 },
      cam: orbit(s, f, Dk(22.5, 0.9, -13.4), [18, -10], [13.5, 11], [6.6, 4.6], 44, [-0.06, 0.04]),
      people: [YOUG("smile", 0.7), ...names.slice(0, n).map((nm, k) => P(nm, [BOAT7_X - 3.3 + (k % 5) * 1.6 + (k >= 5 ? 0.8 : 0), DECK + 1.3, -15.3 + (k >= 5 ? 0.55 : -0.3)], k % 3 === 0 ? "smile_closed" : "nervous", 0, { low: true }))],
      subjects: [["the lifeboat", B7(0), 2]] };
  },
  "wireless-again": (s, f) => ({ light: "day", dof: 5, room: { sign: MARCONI, radio: true, papers: [0.2, 0.1, 0.05, 0] },
    cam: orbit(s, f, TABLE, [30, -6], [6.0, 4.8], [0.8, 0.4], 48, [-0.07, 0.03], expo),
    people: [phil("stern")] }),
  distress: (s, f) => {
    const on = Math.floor(f / 3) % 3 !== 0;
    return { light: "day", dof: 7, room: { sign: MARCONI, radio: true, papers: [0.2, 0.1, 0.05, 0], num: { text: "SOS", bg: RED, fg: WHITE, k: pop(f, s.a + 6) || 0.001 } },
      cam: kick(move({ pos: Rm(2.4, 1.2, -3.4), look: Rm(0.5, 1.6, 1.6), fov: 50, roll: -0.1 }, { pos: Rm(1.6, 1.45, -2.6), look: Rm(0.5, 1.7, 1.75), fov: 46, roll: -0.03 }, f, s.a, s.a + 18, expo, 0.001), f, s.a + 7, 1),
      cards: on ? [{ kind: "spark", p: Rm(0.78, 1.14, 0.56), spin: f * 0.8, s: 0.22 + 0.06 * Math.sin(f * 2.1) }] : [],
      people: [phil("stern")],
      subjects: f > s.a + 16 ? [["SOS", Rm(0.5, 2.15, 3.3), 0.3]] : [] };
  },
  cal2: (s, f) => ({ light: "night", flow: 0.15, dof: 0, cal: { p: CAL_O, lights: 0.1, yaw: 0.25 }, floes: CAL_O, ship: { hide: true },
    cam: orbit(s, f, Cl(0, 8, 0), [30, 4], [170, 120], [22, 10], 46, [-0.06, 0.04]),
    subjects: [["the Californian", Cl(0, 8, 0), 12]] }),
  rockets: (s, f) => {
    const cards: Card[] = [];
    for (let k = 0; k < 3; k++) { const f0 = s.a + 4 + k * 26, e = f - f0; if (e > 0 && e < 30) cards.push({ kind: "spark", p: Cl(40 - k * 34, 26 + 30 * expo(e / 12) - 0.3 * Math.max(0, e - 12), 400), spin: 0.3 * k, s: 6 + 16 * expo(e / 10) }); }
    return { light: "night", flow: 0.15, dof: 0, cal: { p: CAL_O, lights: 0.1, yaw: 0.25 }, floes: CAL_O, cards,
      cam: move({ pos: Cl(0, 26, -150), look: Cl(4, 26, 400), fov: 44, roll: 0.05 }, { pos: Cl(6, 20, -112), look: Cl(4, 30, 400), fov: 40, roll: -0.03 }, f, s.a, s.b - 2, smooth, 0) };
  },
  asleep: (s, f) => ({ light: "night", flow: 0.15, dof: 0, cal: { p: CAL_O, lights: 0.06, yaw: 0.25 }, floes: CAL_O, ship: { hide: true },
    cam: orbit(s, f, Cl(-6, 8, 0), [-16, 12], [60, 48], [4, 7], 44, [0.05, -0.04]) }),

  // ---------------- ending ----------------
  under: (s, f) => {
    const u = smooth(U(s, f));
    return { light: "night", flow: 0.2, dof: 0, ship: { pitch: -0.2 - 0.26 * u, sink: 9 + 16 * u, lights: u < 0.45 ? 0.8 : 0.05 },
      seaBoats: [S(-60, 0, -120), S(-110, 0, -96), S(10, 0, -140), S(-150, 0, -150)],
      cam: orbit(s, f, S(-60, 24, 0), [-30, -4], [190, 160], [16, 7], 48, [0.08, -0.05]) };
  },
  freezing: (s, f) => ({ light: "night", flow: 0.2, dof: 0, ship: { hide: true },
    seaBoats: [S(0, 0, 0), S(24, 0, 14), S(-30, 0, 22), S(52, 0, -10)], floes: S(120, 0, 160),
    cam: move({ pos: S(10, 1.4, -34), look: S(6, 1.2, 4), fov: 54, roll: -0.08 }, { pos: S(-8, 9, -46), look: S(8, 0.5, 6), fov: 50, roll: 0.03 }, f, s.a, s.b - 2, smooth, 0) }),
  carpathia: (s, f) => ({ light: "golden", flow: 0.3, dof: 0, ship: { hide: true }, cal: { p: S(0, 0, 120), lights: 1, yaw: -0.3, kind: "carp" },
    seaBoats: [S(-10, 0, 20), S(30, 0, 44), S(-48, 0, 54)],
    cam: orbit(s, f, S(0, 8, 96), [-24, 10], [150, 112], [20, 9], 46, [0.07, -0.04]),
    subjects: [["the Carpathia", S(0, 9, 120), 10]] }),
  "few-seats": (s, f) => ({ light: "golden", flow: 0.3, dof: 3, ship: { hide: true }, cal: { p: S(-40, 0, 190), lights: 1, yaw: -0.3, kind: "carp" },
    seaBoats: [S(0, 0, 0)],
    cam: orbit(s, f, S(0, 1.5, 0), [-26, 16], [11, 9], [2.6, 1.4], 44, [0.06, -0.05]),
    people: inSeaBoat(0, ["lady3", "mother", "kid", "lady2", "wife", "husband", "sailor"], (k) => (k % 3 === 0 ? "relief" : k % 3 === 1 ? "neutral" : "smile_closed")) }),
  "you-end": (s, f) => ({ light: "golden", flow: 0.6, dof: 5, ship: { hide: true }, cal: { p: S(0, 0, 0), lights: 1, kind: "carp" },
    cam: orbit(s, f, S(30, 6.5, -4.5), [-18, 16], [8.5, 6.6], [0.6, 0.2], 42, [0.06, -0.04]),
    people: [P("you", S(30, 5.08, -4.5), "neutral", 0, { headTilt: 0.06 })] }),
  act: (s, f) => ({ light: "night", flow: 0.3, dof: 0, boat: { out: 1, drop: 0 },
    cam: move({ pos: Dk(15, 2.0, -19), look: GATE, fov: 42, roll: 0.06 }, { pos: S(-4, 46, -92), look: S(16, 16, -6), fov: 50, roll: -0.03 }, f, s.a + 10, s.b - 2, smooth, 0),
    people: [YOUG("stern"), P("gent", Dk(16.9, 0, -10.2), "nervous", 1), P("lady", Dk(15.7, 0, -10.5), "nervous", 1), ...inBoat(["lady3", "mother", "kid", "lady2", "wife"], 0, "nervous").map((q, k) => ({ ...q, p: [BOAT7_X - 3 + k * 1.5, q.p[1], q.p[2]] as V3 }))] }),

  // the thumbnail still: the viewer in his red cap at the rail, the iceberg dead ahead of the bow
  thumb: () => ({ ...SEA, dof: 0, berg: { p: S(172, 0, 9), s: 1.7, yaw: 0.6 },
    cam: full({ pos: S(112.4, 12.5, -7.3), look: S(160, 16.5, -15), fov: 50, roll: 0 }),
    people: [P("you", S(113.85, 11.06, -8.2), "shock", 0)] }),
};

/** handheld sway on every 3D shot */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * Math.min(d, 60), id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** frames where the 3D picture gets a sideways motion blur: the first frames of every 3D shot that swoops in */
const WHIP = new Set(["open-wide", "ship-reveal", "stranger", "knots", "lookouts-trust", "dark-ahead", "almost", "finished", "boat-hang", "thats-it", "ship-leave", "freezing"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
void segAt;
