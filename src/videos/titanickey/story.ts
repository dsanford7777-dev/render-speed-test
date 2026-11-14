// The Titanic key Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is ever still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. The world is the Titanic
// long-form's (ship, Southampton quay, crow's nest, sea, iceberg, the cabin far off at ROOM_O) plus props.ts.
// Ship space: bow toward +x, y up from the waterline; the quay is on the -z side, so cameras there see the bow screen left.
import { Expr } from "../bridge/toon";
import { DECK, NEST, Rm, type V3, type Person3, type St3 as WorldSt } from "../titanicif/story3d";
import type { KeyState, KeyPose } from "./props";
import { FPS, SEG_TIMES, TOTAL, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
export type St = WorldSt & KeyState;
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["ship", W(0, "titanic") - 2],
  ["story", A(1)],
  ["deck", A(2)], ["officer", W(2, "second") - 2], ["bumped", W(2, "bumped") - 2],
  ["walk", A(3)], ["pocket", W(3, "key") - 3],
  ["locker", A(4)], ["bino", W(4, "binoculars") - 4],
  ["night", A(5)], ["eyes", W(5, "watched") - 2], ["dark", W(5, "nothing") - 2],
  ["inquiry", A(6)], ["berg", W(6, "iceberg") - 3], ["fleet", W(6, "lookout") - 2],
  ["swerve", A(7)],
  ["tag", A(8)], ["read", A(9)], ["phone", W(9, "telephone") - 2],
  ["table", A(10)],
  ["hogg", A(11)], ["lock", W(11, "locked") - 2], ["dock", W(11, "before") - 2],
  ["ask", A(12)], ["none", W(12, "there") - 2],
  ["auction", A(13)], ["hammer", W(13, "£90,000") - 2],
  ["end", A(14)],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };

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
const S = (x: number, y: number, z: number): V3 => [x, y, z];
const QUAY = 2.4;
const Qy = (x: number, y: number, z: number): V3 => [x, QUAY + y, z];
const Dk = (x: number, y: number, z: number): V3 => [x, DECK + y, z];
const Nt = (x: number, y: number, z: number): V3 => [NEST[0] + x, NEST[1] + y, NEST[2] + z];
/** a walker along x (side card) */
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral"): Person3 =>
  ({ who, p: [x0 + v * tt, y, z], expr, side: { phase: (((Math.abs(v) * tt) / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: 0.8 } });

// ---------------- places ----------------
const DAY = { light: "day" as const, dock: true, flow: 0.2 };
const SEA = { light: "night" as const, flow: 9 };
/** Blair on the quay, the ship's black side behind him */
const BL: V3 = Qy(6, 0, -21.5);
/** the key in his hand: held by the shaft at chest height, out toward the lens (cameras on the -z side, so screen right is -x) */
const HAND: V3 = [BL[0] - 0.3, BL[1] + 1.1, BL[2] - 0.3];
/** front = the tag's lettered face (CROWS NEST TELEPHONE KEY) to the lens; otherwise its back (R.M.S. TITANIC) */
/** held up in his fist by the bow, shaft pointing at the sky, the tag (its R.M.S. TITANIC side to the lens) hanging below */
const keyInHand = (f: number, s = 1.4): KeyPose => ({ p: [HAND[0], HAND[1] + 0.04, HAND[2]], yaw: 0, roll: Math.PI / 2, s, swing: -Math.PI / 2 + 0.12 * Math.sin(f * 0.15) * Math.min(1, f / 12, (TOTAL - f) / 12) });
/** the middle of the tag hanging off a key */
const tagC = (k: KeyPose): V3 => {
  // the tag's middle in the key's own frame, turned by the key's rotation (order Y, X, Z as in props.ts)
  const sc = 1.35 * (k.s ?? 1); let x = -0.045 * sc, y = -0.073 * sc, z = 0;
  const r = k.roll ?? 0, pi = k.pitch ?? 0, ya = k.yaw ?? 0;
  [x, y] = [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
  [y, z] = [y * Math.cos(pi) - z * Math.sin(pi), y * Math.sin(pi) + z * Math.cos(pi)];
  [x, z] = [x * Math.cos(ya) + z * Math.sin(ya), -x * Math.sin(ya) + z * Math.cos(ya)];
  return [k.p[0] + x, k.p[1] + y, k.p[2] + z];
};
const blair = (expr: Expr, f: number, look = 0, extra: Partial<Person3> = {}): Person3 => P("blair", BL, expr, look, { hands: [HAND], ...extra });
/** hook framing: close on the key in his hand, his face behind it */
const HOOK_C: V3 = [HAND[0] + 0.2, HAND[1] + 0.3, HAND[2]];
const hookCam = (f: number, k: number): Cam => full({ pos: [HOOK_C[0] + 0.1 + 0.3 * k, HOOK_C[1] + 0.05, HOOK_C[2] - 2.05 - 0.15 * k], look: HOOK_C, fov: 36, roll: -0.06 + 0.08 * k });
// the cabin far off at ROOM_O: plain (no wheelhouse dressing), its sign swapped per scene
const CABIN: [string, string] = ["tkcabin", "SECOND OFFICER"], INQ: [string, string] = ["tkinq", "U.S. SENATE INQUIRY · 1912"], AUC: [string, string] = ["tkauc", "AUCTION · 2007"];
const room = (sign: [string, string]) => ({ sign, plain: true });
const CUP: V3 = Rm(-3.6, 0, 3.22);
const TABLE: V3 = Rm(0.5, 0.8, 0.6);
/** the key lying flat on the table in Blair's cabin, lettered face up */
const TAB_KEY: KeyPose = { p: [TABLE[0] - 0.6, TABLE[1] + 0.02, TABLE[2] + 0.05], yaw: Math.PI, pitch: -Math.PI / 2, s: 1, swing: 0 };
/** the key lying flat on the auction cushion, lettered face up */
const AUC_KEY: KeyPose = { p: [TABLE[0] + 0.12, TABLE[1] + 0.085, TABLE[2] - 0.02], yaw: Math.PI, pitch: -Math.PI / 2, s: 0.9, swing: 0 };

export const SPECS: Record<string, (s: ShotDef, f: number) => St> = {
  // "This key": the key big in the frame, Blair's face behind it
  hook: (s, f) => ({ ...DAY, dof: 3, closeup: true, focus: HAND,
    cam: hookCam(f, smooth(U(s, f))), key: keyInHand(f), people: [blair("grin", f)],
    subjects: [["the key", [HAND[0], HAND[1] + 0.2, HAND[2]], 0.1]] }),
  // "...sank the Titanic": snap out and up the black side of the ship towering over him
  ship: (s, f) => ({ ...DAY, dof: 0,
    cam: kick(move({ pos: Qy(7.8, 0.6, -25.2), look: Qy(5.5, 2.2, -21), fov: 56, roll: 0.08 }, { pos: Qy(12, 0.5, -30.5), look: S(-6, 19, -8), fov: 62, roll: -0.04 }, f, s.a, s.b, expo, 0), f, s.a + 2, 1),
    key: keyInHand(f), people: [blair("grin", f)] }),
  // "At least, that's the story."
  story: (s, f) => ({ ...DAY, dof: 4,
    cam: orbit(s, f, Qy(BL[0], 1.45, BL[2]), [-30, 10], [3.9, 3.2], [0.15, 0.05], 40, [0.07, -0.05]),
    key: keyInHand(f), people: [blair("nervous", f, 0, { headTilt: 0.06 })] }),
  // days before the voyage, on the boat deck: Blair and the senior officer who came aboard
  deck: (s, f) => ({ ...DAY, dof: 2,
    cam: orbit(s, f, Dk(0, 1.4, -10.2), [-38, -4], [8.5, 6.8], [1.4, 0.4], 44, [0.06, -0.04]),
    people: [P("blair", Dk(0.9, 0, -10.2), "neutral", -1), P("wilde", Dk(-0.9, 0, -10.0), "stern", 1)] }),
  // Second Officer David Blair
  officer: (s, f) => ({ ...DAY, dof: 6, closeup: true,
    cam: orbit(s, f, Dk(0.9, 1.5, -10.2), [-24, 8], [2.6, 2.2], [0.1, 0.05], 36, [-0.08, 0.04]),
    people: [P("blair", Dk(0.9, 0, -10.2), "grin", 0)] }),
  // bumped off the ship
  bumped: (s, f) => ({ ...DAY, dof: 8, closeup: true,
    cam: kick(snap(Dk(1.6, 1.62, -12.5), Dk(0.9, 1.56, -10.2), f, s.a, { fov: 34, roll: 0.1 }, 1.6, 5), f, s.a + 4, 1.1),
    people: [P("blair", Dk(0.9, 0, -10.2), "shock", 0, { headTilt: 0.08 })] }),
  // he walks off down the quay, the ship sliding by behind (long lens tracking)
  walk: (s, f) => { const tt = t(f - s.a), x = 10 - 1.25 * tt;
    return { ...DAY, dof: 2, focus: Qy(x, 1.3, -22),
      cam: move({ pos: Qy(x - 2.5, 1.2, -33), look: Qy(x, 1.6, -22), fov: 34, roll: -0.04 }, { pos: Qy(x - 3.1, 1.4, -32.4), look: Qy(x - 0.6, 1.9, -22), fov: 32, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [walker("blair", 10, QUAY, -22, -1.25, tt, "grin")] }; },
  // a key in his pocket: close on his hip, the tag dangling out of the jacket
  pocket: (s, f) => { const hip: V3 = [BL[0] - 0.22, BL[1] + 0.98, BL[2] - 0.12];
    return { ...DAY, dof: 6, closeup: true, focus: hip,
      cam: kick(snap([hip[0] - 0.25, hip[1] - 0.05, hip[2] - 1.5], [hip[0] + 0.1, hip[1] + 0.42, hip[2]], f, s.a, { fov: 42, roll: -0.09 }, 1.5, 5), f, s.a + 4, 0.8),
      key: { p: hip, yaw: 0, roll: -1.35, s: 0.8, swing: 1.35 + 0.15 * Math.sin(f * 0.2) },
      people: [P("blair", BL, "grin", 0)], subjects: [["the key", hip, 0.1]] }; },
  // the lookouts' locker up in the crow's nest (in port, by day): the camera cranes up the foremast to it
  locker: (s, f) => ({ ...DAY, dof: 1, nestBox: true,
    cam: move({ pos: Nt(-4.5, -4.5, -7.5), look: Nt(-0.4, 0.4, 0), fov: 50, roll: 0.06 }, { pos: Nt(0.6, 3.0, -1.7), look: Nt(-0.65, 0.6, 0), fov: 44, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    subjects: [["the locker", Nt(-0.6, 1.1, 0.45), 0.25]] }),
  // binoculars: whip onto a pair, lying on the locker lid
  bino: (s, f) => ({ ...DAY, dof: 4, nestBox: true, focus: Nt(-0.7, 0.8, 0),
    cam: kick(snap(Nt(0.2, 1.95, -0.1), Nt(-0.6, 1.17, 0.45), f, s.a, { fov: 40, roll: 0.1 }, 1.8, 5), f, s.a + 4, 0.8),
    bino: { p: Nt(-0.6, 1.17, 0.45), yaw: 0.6 + 0.2 * U(s, f) },
    subjects: [["the binoculars", Nt(-0.6, 1.17, 0.45), 0.15]] }),
  // that night: the camera rises past the nest at sea, two men in it
  night: (s, f) => ({ ...SEA, dof: 3, nestBox: true,
    cam: orbit(s, f, Nt(0, 1.45, 0), [58, 112], [7.4, 5.4], [-1.6, 0.6], 44, [0.08, -0.06]),
    people: [P("fleet", Nt(0, 0.06, -0.36), "stern", 0, { low: true }), P("lee", Nt(0.05, 0.06, 0.4), "neutral", 0, { low: true })] }),
  // nothing but their eyes
  eyes: (s, f) => ({ ...SEA, dof: 10, closeup: true, nestBox: true,
    cam: snap(Nt(2.5, 1.72, -1.5), Nt(0, 1.62, -0.36), f, s.a, { fov: 30, roll: -0.1 }),
    people: [P("fleet", Nt(0, 0.06, -0.36), "nervous", 0, { low: true })] }),
  // looking up at him against the stars, nothing in his hands
  dark: (s, f) => ({ ...SEA, dof: 6, nestBox: true,
    cam: kick(snap(Nt(1.3, 0.9, -1.6), Nt(0.1, 1.9, -0.36), f, s.a, { fov: 46, roll: 0.14 }, 1.5, 5), f, s.a + 3, 1),
    people: [P("fleet", Nt(0, 0.06, -0.36), "pained", 0, { low: true })] }),
  // the inquiry: Fleet in the witness spot, a senator at the table
  inquiry: (s, f) => ({ light: "day", dof: 4, room: room(INQ),
    cam: orbit(s, f, Rm(0.6, 1.3, 1.55), [24, -10], [5.6, 4.8], [0.4, 0.1], 42, [-0.06, 0.04]),
    people: [P("fleet", Rm(1.2, 0, 1.55), "nervous", -1), P("senator", Rm(0.0, 0, 1.6), "stern", 1)] }),
  // the iceberg, as it came out of the dark
  berg: (s, f) => { const bx = 232 - 30 * U(s, f);
    return { ...SEA, flow: 11, dof: 0, berg: { p: S(bx, 0, -5), s: 1.9 },
      cam: kick(snap(Nt(1.6, 2.6, 0.4), S(bx, 9, -5), f, s.a, { fov: 40, roll: 0.1 }, 1.02, 6), f, s.a + 3, 1.3),
      subjects: [["iceberg", S(bx, 10, -5), 14]] }; },
  // lookout Fred Fleet
  fleet: (s, f) => ({ light: "day", dof: 8, closeup: true, room: room(INQ),
    cam: snap(Rm(0.8, 1.6, -0.9), Rm(1.2, 1.55, 1.55), f, s.a, { fov: 32, roll: 0.08 }, 1.5),
    people: [P("fleet", Rm(1.2, 0, 1.55), "stern", 0)] }),
  // "Enough to get out of the way": the ship swings and the iceberg slides past the bow, just clear
  swerve: (s, f) => { const u = smooth(U(s, f)), bx = 190 - 60 * u, bz = -36;
    return { ...SEA, flow: 11, dof: 0, berg: { p: S(bx, 0, bz), s: 1.6 },
      cam: kick(move({ pos: Nt(1.5, 3.2, 1.6), look: S(bx + 20, 8, bz), fov: 56, roll: 0.1 }, { pos: Nt(1.0, 3.0, 1.8), look: S(bx - 8, 8, bz + 4), fov: 52, roll: -0.05 }, f, s.a, s.b, smooth, 0), f, s.a + 2, 1),
      subjects: [["iceberg", S(bx, 9, bz), 12]] }; },
  // the key again: round from the back of the tag (R.M.S. TITANIC) to its face
  tag: (s, f) => { const u = smooth(U(s, f)), c = tagC(TAB_KEY);
    return { light: "day", dof: 4, room: room(CABIN), cupboard: { door: 0 }, focus: c,
      cam: move({ pos: [TAB_KEY.p[0] - 0.55, TAB_KEY.p[1] + 0.3, TAB_KEY.p[2] - 0.25], look: TAB_KEY.p, fov: 40, roll: 0.12 }, { pos: [c[0] + 0.05, c[1] + 0.62, c[2] - 0.42], look: c, fov: 36, roll: -0.05 }, f, s.a, s.b, smooth, 0),
      key: TAB_KEY, subjects: [["the tag", c, 0.05]] }; },
  // "It says: crow's nest telephone": snap onto the tag's face
  read: (s, f) => { const c = tagC(TAB_KEY);
    return { light: "day", dof: 6, room: room(CABIN), cupboard: { door: 0 }, focus: c,
      cam: kick(snap([c[0], c[1] + 0.42, c[2] - 0.2], c, f, s.a, { fov: 36, roll: 0.06 }, 1.8, 5), f, W(9, "crow's") - 1, 0.7),
      key: TAB_KEY, subjects: [["the tag", c, 0.05]] }; },
  // the telephone box in the crow's nest
  phone: (s, f) => ({ ...DAY, dof: 3, nestBox: true, focus: Nt(-0.72, 1.36, 0),
    cam: kick(snap(Nt(0.55, 1.75, -0.45), Nt(-0.72, 1.36, 0), f, s.a, { fov: 40, roll: 0.09 }, 1.6, 5), f, s.a + 4, 0.9),
    subjects: [["the telephone", Nt(-0.72, 1.36, 0), 0.15]] }),
  // "And the binoculars?": on the table in Blair's cabin
  table: (s, f) => ({ light: "day", dof: 4, room: room(CABIN), cupboard: { door: 1 }, focus: TABLE,
    cam: orbit(s, f, [TABLE[0], TABLE[1] + 0.1, TABLE[2]], [-40, -5], [1.6, 1.3], [0.55, 0.35], 40, [0.1, -0.03], expo),
    bino: { p: [TABLE[0], TABLE[1] + 0.05, TABLE[2]], yaw: 0.4 },
    subjects: [["the binoculars", [TABLE[0], TABLE[1] + 0.05, TABLE[2]], 0.2]] }),
  // a lookout (Hogg) puts them in the cupboard in Blair's cabin
  hogg: (s, f) => { const u = smooth(U(s, f)), shelf: V3 = [CUP[0], CUP[1] + 0.86, CUP[2] - 0.05], hp: V3 = L3([TABLE[0], TABLE[1] + 0.05, TABLE[2]], shelf, u);
    return { light: "day", dof: 3, room: room(CABIN), cupboard: { door: 1 },
      cam: move({ pos: Rm(-1.6, 1.5, -1.4), look: Rm(-3.0, 1.0, 2.7), fov: 46, roll: 0.06 }, { pos: Rm(-2.0, 1.4, -0.9), look: Rm(-3.2, 1.0, 2.8), fov: 44, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      bino: { p: hp, yaw: 0.4 }, people: [P("hogg", Rm(-2.7, 0, 2.45), "neutral", -1, { hands: [hp] })],
      subjects: [["the cupboard", Rm(-3.6, 1.0, 2.9), 0.3]] }; },
  // locked: the door swings shut
  lock: (s, f) => { const shelf: V3 = [CUP[0], CUP[1] + 0.86, CUP[2] - 0.05], d = 1 - expo((f - s.a - 2) / 12);
    return { light: "day", dof: 3, room: room(CABIN), cupboard: { door: d },
      cam: kick(snap(Rm(-3.0, 1.15, 0.9), Rm(-3.6, 0.85, 2.9), f, s.a, { fov: 44, roll: -0.08 }, 1.5, 5), f, s.a + 14, 1.2),
      bino: { p: shelf, yaw: 0.4 }, people: [P("hogg", Rm(-2.6, 0, 2.45), "grin", -1)] }; },
  // before the voyage: the ship at her berth in Southampton
  dock: (s, f) => ({ ...DAY, dof: 0,
    cam: move({ pos: Qy(-20, 3, -60), look: S(10, 14, 0), fov: 50, roll: 0.06 }, { pos: Qy(-40, 12, -85), look: S(0, 14, 0), fov: 54, roll: -0.03 }, f, s.a, s.b, smooth, 0) }),
  // at sea, a lookout asks the second officer for glasses
  ask: (s, f) => ({ light: "day", dof: 4, room: room(CABIN), cupboard: { door: 0 },
    cam: orbit(s, f, Rm(0.5, 1.3, 1.75), [-22, 14], [5.6, 4.9], [0.2, 0.05], 42, [0.06, -0.05]),
    people: [P("symons", Rm(0.0, 0, 1.75), "nervous", 1, { wave: 0.6 }), P("lightoller", Rm(1.0, 0, 1.75), "stern", -1)] }),
  // "There are none."
  none: (s, f) => ({ light: "day", dof: 8, closeup: true, room: room(CABIN), cupboard: { door: 0 },
    cam: kick(snap(Rm(0.6, 1.62, -0.7), Rm(1.0, 1.56, 1.75), f, s.a, { fov: 32, roll: -0.1 }, 1.6, 5), f, W(12, "none") - 1, 1.2),
    people: [P("lightoller", Rm(1.0, 0, 1.75), "stern", 0, { headTilt: -0.05 })] }),
  // the auction, 2007: the auctioneer behind the key on its red cushion
  auction: (s, f) => ({ light: "day", dof: 2, room: room(AUC), auction: { gavel: 0 }, key: AUC_KEY,
    cam: orbit(s, f, Rm(1.0, 1.25, 1.2), [-20, 8], [4.2, 3.6], [0.2, 0.0], 42, [0.07, -0.05]),
    people: [P("auctioneer", Rm(1.25, 0, 1.55), "grin", -1, { hands: [[TABLE[0] + 0.75, TABLE[1] + 0.12, TABLE[2] + 0.1]] })],
    subjects: [["the key", AUC_KEY.p, 0.1]] }),
  // the hammer comes down on ninety thousand pounds
  hammer: (s, f) => { const bang = s.a + 9, g = f < bang - 7 ? smooth((f - s.a) / 2) : f < bang ? 1 - smooth((f - bang + 7) / 7) : 0;
    return { light: "day", dof: 5, closeup: true, room: room(AUC), auction: { gavel: g }, key: AUC_KEY, focus: AUC_KEY.p,
      cam: kick(snap([AUC_KEY.p[0] - 0.05, AUC_KEY.p[1] + 0.6, AUC_KEY.p[2] - 0.75], AUC_KEY.p, f, s.a, { fov: 40, roll: -0.08 }, 1.4, 5), f, bang, 1.5),
      subjects: [["the key", AUC_KEY.p, 0.1]] }; },
  // "Nobody can agree what it opened": back on the quay, the camera comes round to where the film began
  end: (s, f) => { const u = smooth(U(s, f)), h = hookCam(f, 0);
    const c0 = full({ pos: [HAND[0] - 1.6, HAND[1] + 0.3, HAND[2] - 2.4], look: [HAND[0] + 0.12, HAND[1] + 0.12, HAND[2]], fov: 40, roll: 0.08 });
    return { ...DAY, dof: 3, closeup: true, focus: [HAND[0] + 0.1, HAND[1], HAND[2]],
      cam: u >= 1 ? h : mix(c0, h, u), key: keyInHand(f), people: [blair(u > 0.5 ? "grin" : "nervous", f)],
      subjects: [["the key", [HAND[0], HAND[1] + 0.2, HAND[2]], 0.1]] }; },
};

/** every shot is hand-held: a slow sway on top of its move (none at the loop frames) */
export const specAt = (s: ShotDef, f: number): St => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const loopy = f < 6 || f >= TOTAL - 6;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = loopy ? 0 : 0.0032 * Math.min(d, 60), id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
const WHIP = new Set(["ship", "bino", "berg", "table", "phone"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const F = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "story", kind: "stamp", text: "THE STORY", f0: W(1, "story") - 2, f1: B("story"), y: 15, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 120 },
  { key: "blair", kind: "pill", text: "DAVID BLAIR", sub: "Second Officer", f0: W(2, "david"), f1: B("deck"), y: 13 },
  { key: "bumped", kind: "stamp", text: "BUMPED", f0: W(2, "bumped"), f1: B("bumped"), y: 15, rot: 5, bg: "#e0332e", fg: "#ffffff", size: 140 },
  { key: "soton", kind: "pill", text: "SOUTHAMPTON", sub: "April 1912", f0: F("walk") + 3, f1: B("walk"), y: 13 },
  { key: "nobino", kind: "stamp", text: "NO BINOCULARS", f0: W(5, "nothing"), f1: B("eyes"), y: 15, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 96 },
  { key: "fleet", kind: "pill", text: "FRED FLEET", sub: "Lookout", f0: W(6, "fred"), f1: B("fleet"), y: 13 },
  { key: "hogg", kind: "pill", text: "GEORGE HOGG", sub: "Lookout", f0: F("hogg") + 4, f1: B("lock"), y: 13 },
  { key: "locked", kind: "stamp", text: "LOCKED AWAY", f0: W(11, "locked") + 10, f1: B("lock"), y: 15, rot: 4, bg: "#2f5fb5", fg: "#ffffff", size: 100 },
  { key: "light", kind: "pill", text: "CHARLES LIGHTOLLER", sub: "Second Officer, at sea", f0: F("ask") + 4, f1: B("ask"), y: 13, size: 58 },
  { key: "none", kind: "stamp", text: "THERE ARE NONE", f0: W(12, "none"), f1: B("none"), y: 15, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 92 },
  { key: "90k", kind: "call", text: "£90,000", f0: W(13, "£90,000"), f1: B("hammer"), y: 14, fg: "#ffd84d", size: 170 },
  { key: "q", kind: "call", text: "?", f0: W(14, "opened") - 2, f1: TOTAL - 8, y: 16, fg: "#ffffff", size: 200 },
] as Item[]).filter((i) => i.f1 > i.f0);
