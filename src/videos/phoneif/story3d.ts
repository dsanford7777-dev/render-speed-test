// The 1850 phone long-form's 3D shots, as specs: for a shot key (timeline.ts `g`) and frame, the light, camera, how the
// room is dressed, the phone, the cast, and the subjects the narration is about (for the framing check).
// Camera grammar is the house one: every shot an orbit, crane, dive, tracking move, long-lens slide or snap zoom; Dutch
// tilts; handheld sway on everything (specAt); a kick on every hit.
// Wharf: pier deck at y = PIER, its water edge at z = 8; the Atlantic alongside at z 11..25 (deck 6.5), gangway at x = 8
// from the deck (z 11) down to the pier (z 5); the welcome arch at x -20..-8, z = -4. Cameras on the -z side look at the
// ship (world +x = screen left); cameras over the water look back at the crowd's faces (+x = screen right).
// Broadway (Bw): the museum front at z = 12, x -6..24; Genin's shop x -16..-6.4. The room (Rm): table x -2..3, z 0.1..1.1.
import { Expr } from "../bridge/toon";
import { FPS, ShotDef, wordAt, segAt } from "./timeline";
import { V3, Cam, Person3, St3, Card, Phone, PIER, SW, Rm, Bw } from "./story3d.types";
import { SHIP } from "./world3d";
export type { V3, St3, Person3 } from "./story3d.types";

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
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", k = 0, extra = false): Person3 => {
  const d = Math.abs(v) * tt + k * 0.37;
  return { who, p: [x0 + v * tt, y, z], expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: 0.8 }, extra };
};
/** extras standing in a block (deterministic jitter); ex picks each one's face. `keep` drops anyone it rejects */
const crowd = (n: number, x0: number, x1: number, z0: number, z1: number, seed: number, ex: (i: number) => Expr, y = 0, skip = 0, keep: (p: V3) => boolean = () => true, wave?: number): Person3[] => {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cols = Math.max(1, Math.round(Math.sqrt((n * (x1 - x0)) / Math.max(0.5, z1 - z0)))), rows = Math.ceil(n / cols), out: Person3[] = [];
  for (let i = 0; i < n; i++) {
    const cx = i % cols, rz = Math.floor(i / cols);
    const p: V3 = [x0 + ((cx + 0.5 + (r() - 0.5) * 0.6) * (x1 - x0)) / cols, y, z0 + ((rz + 0.5 + (r() - 0.5) * 0.5) * (z1 - z0)) / rows];
    if (!keep(p)) continue;
    out.push({ who: `c${(i + skip) % 48}`, p, expr: ex(i), look: (i % 3) - 1, extra: true, wave: wave !== undefined && i % 3 === 0 ? wave : undefined });
  }
  return out;
};
const CHEER: Expr[] = ["laugh", "grin", "smile", "laugh", "relief_open", "grin", "smile_closed"], WORRY: Expr[] = ["nervous", "shock", "stern", "nervous", "dazed", "pained"];
const CALM: Expr[] = ["neutral", "smile_closed", "neutral", "stern", "smile"], MOCK: Expr[] = ["laugh", "grin", "stern", "laugh", "smile"];
const pick = (a: Expr[]) => (i: number) => a[(i * 5 + 2) % a.length];
/** keep the arch posts and the gangway's foot clear */
const pierFree = (p: V3) => !(Math.abs(p[0] + 20) < 0.9 && Math.abs(p[2] + 4) < 0.9) && !(Math.abs(p[0] + 8) < 0.9 && Math.abs(p[2] + 4) < 0.9) && !(p[0] > 6.2 && p[0] < 9.8 && p[2] > 2.6);
const Pr = (x: number, z: number): V3 => [x, PIER, z];
const Sw = (x: number, z: number): V3 => Bw(x, SW, z);
const Rd = (x: number, z: number): V3 => Bw(x, 0, z);
/** the big crowd on the pier, faces toward the river */
const WHARF = (n: number, seed: number, ex: Expr[], wave?: number, z1 = 5.2, skip = 0) => crowd(n, -32, 30, -13, z1, seed, pick(ex), PIER, skip, pierFree, wave);
/** the phone in "you"'s right hand, chest high, a little toward the camera side (-z) */
const inHand = (p: V3, dx = 0.2, dy = 0.92, dz = -0.3): V3 => [p[0] + dx, p[1] + dy, p[2] + dz];
const phone = (p: V3, screen: string, s = 1.6, extra: Partial<Phone> = {}): Phone => ({ p, screen, s, face: "cam", ...extra });
/** Lind on the gangway: u = 0 at the ship's rail, 1 at the pier */
const lindOn = (u: number, shipX = 0): V3 => { const k = clamp01(u); return [8 + shipX, SHIP.deck + 0.1 + (PIER - SHIP.deck - 0.1) * k, SHIP.z0 - 0.4 - 5.6 * k]; };
const YOU: V3 = Pr(0, -2.2), BARN: V3 = Pr(11, 3.2);
const DAY = { light: "day" as const }, GOLD = { light: "golden" as const }, NIGHT = { light: "night" as const };
const OFFICE: [string, string] = ["pfoffice", "MAGNETIC TELEGRAPH CO."], LAB: [string, string] = ["pflab", "SMITHSONIAN INSTITUTION"];
const STUDIO: [string, string] = ["pfdag", "DAGUERREAN GALLERY"], MUSEUM: [string, string] = ["pfmus", "AMERICAN MUSEUM"], CLINIC: [string, string] = ["pfclinic", "DISPENSARY · NEW YORK"];
const WARD: [string, string] = ["pfward", "GENERAL HOSPITAL · VIENNA"], SNOW: [string, string] = ["pfsnow", "DR. JOHN SNOW · LONDON"], LODGING: [string, string] = ["pflodge", "BOARDING HOUSE · NEW YORK"];
const OFFICE_ROOM = { sign: OFFICE, table: true, telegraph: true, jars: 12, wires: true };
const papers = (n: number, tt: number, c: V3, spread: number, h = 3, s = 0.4): Card[] =>
  Array.from({ length: n }, (_, k) => { const q = k * 1.7, y = ((q * 0.371 + tt * (0.3 + (k % 3) * 0.1)) % 1); return { kind: "paper" as const, p: [c[0] + Math.sin(q * 2.4 + tt) * spread * (0.35 + ((k * 7) % 10) / 14), c[1] + (1 - y) * h, c[2] + Math.cos(q * 1.7) * spread * 0.4] as V3, spin: tt * (1.5 + (k % 4)) + q, s }; });

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- cold open ----------------
  "open-wide": (s, f) => ({ ...DAY, dof: 0, ship: { x: -40 * (1 - smooth(U(s, f) * 0.8)) },
    cam: move({ pos: [-70, 26, 2], look: [0, 4, 2], fov: 50, roll: 0.06 }, { pos: [-36, 7, -1], look: [0, 3.6, 4], fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: WHARF(70, 11, CHEER, 0.8) }),
  "crowd-low": (s, f) => { const u = smooth(U(s, f)); return { ...DAY, dof: 5,
    cam: full({ pos: [-18 + 10 * u, PIER + 1.4, 9.2], look: [-14 + 9 * u, PIER + 1.3, -2], fov: 26, roll: 0.05 - 0.09 * u }),
    people: [...["c3", "c1", "c8", "c4", "c13", "c10", "c7"].map((n, k) => P(n, Pr(-14 + k * 1.8 + 6 * u * 0, 2.6 + (k % 2) * 0.5), CHEER[k % CHEER.length], k % 3 - 1, { wave: k % 2 ? 0.85 : undefined, extra: true })), ...WHARF(44, 5, CHEER, 0.7, 2.0)] }; },
  "crowd-push": (s, f) => { const u = U(s, f); return { ...DAY, dof: 4,
    cam: kick(orbit(s, f, Pr(-12, 0.5), [200, 164], [8.6, 8.2], [2.4, 1.2], 50, [0.07, -0.05]), f, s.a + 3, 0.7),
    people: WHARF(56, 7, CHEER, 0.75).map((q, i) => ({ ...q, p: [q.p[0], q.p[1], q.p[2] + 0.5 * smooth(u - (i % 5) * 0.05)] as V3 })) }; },
  "push-water": (s, f) => ({ ...DAY, dof: 3,
    cam: move({ pos: [-3, PIER + 0.9, 7.2], look: [-1, PIER + 1.7, -6], fov: 50, roll: -0.08 }, { pos: [2, PIER + 1.6, 7.4], look: [0, PIER + 1.4, -6], fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: WHARF(48, 9, CHEER, 0.9, 5.4) }),
  "ship-in": (s, f) => { const u = U(s, f); return { ...DAY, dof: 0, ship: { x: 46 - 46 * smooth(u * 1.1), smoke: 1 },
    cam: move({ pos: [30, PIER + 3, -6], look: [10, 7, 18], fov: 48, roll: 0.05 }, { pos: [22, PIER + 2.2, -4], look: [4, 8, 18], fov: 52, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: crowd(20, 6, 34, -6, 5, 13, pick(CHEER), PIER, 4, pierFree, 0.8), subjects: [["the steamship", [6, 9, 18], 4]] }; },
  "crowd-cheer": (s, f) => ({ ...DAY, dof: 4,
    cam: kick(orbit(s, f, Pr(-14, 0), [150, 200], [9.2, 8.8], [1.6, 0.6], 50, [-0.07, 0.06]), f, W(1, "screaming") - 1, 0.8),
    people: WHARF(60, 21, ["laugh", "laugh", "grin", "relief_open"], 0.95) }),
  pocket: (s, f) => ({ ...DAY, dof: 7, closeup: true,
    cam: move({ pos: [0.9, PIER + 1.4, -4.6], look: [0, PIER + 1.35, -2.2], fov: 36, roll: 0.07 }, { pos: [0.5, PIER + 1.2, -3.7], look: [0.05, PIER + 1.1, -2.2], fov: 34, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", YOU, "nervous", 0), P("c7", Pr(-1.6, -1.2), "laugh", 1, { extra: true, wave: 0.8 }), P("c16", Pr(1.7, -1.0), "grin", -1, { extra: true })] }),
  "phone-reveal": (s, f) => { const hit = s.a + 4, ph = inHand(YOU, 0.16, 0.95, -0.32); return { ...DAY, dof: 10, closeup: true, focus: ph,
    cam: kick(snap([0.5, PIER + 1.3, -3.6], [0.08, PIER + 1.2, -2.4], f, s.a, { fov: 40, roll: -0.09 }, 1.8, 5), f, hit, 0.8),
    people: [P("you", YOU, "shock", 0, { hw: [ph] })], phone: phone(ph, "80", 1.3), subjects: [["the phone", ph, 0.15]] }; },
  "phone-screen": (s, f) => { const ph = inHand(YOU, 0.16, 0.95, -0.32); return { ...DAY, dof: 12, closeup: true, focus: ph,
    cam: move({ pos: [0.3, PIER + 1.52, -2.95], look: ph, fov: 30, roll: 0.06 }, { pos: [0.22, PIER + 1.46, -2.86], look: ph, fov: 26, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", YOU, "dazed", 0, { hw: [ph] })], phone: phone(ph, "80", 1.3), subjects: [["the phone", ph, 0.12]] }; },
  "you-alone": (s, f) => ({ ...DAY, dof: 4,
    cam: move({ pos: [1.2, PIER + 1.5, -6.2], look: [0, PIER + 1.4, -2.2], fov: 38, roll: -0.05 }, { pos: [6, PIER + 14, -22], look: [0, PIER + 1, -1], fov: 44, roll: 0.04 }, f, s.a + 4, s.b, smooth, 0),
    people: [P("you", YOU, "nervous", 0, { hw: [inHand(YOU)] }), ...WHARF(60, 23, CHEER, 0.7, 5.2, 3).filter((q) => Math.hypot(q.p[0], q.p[2] + 2.2) > 1.4)], phone: phone(inHand(YOU), "80") }),
  "phone-hero": (s, f) => { const ph: V3 = [YOU[0] + 0.15, PIER + 1.9, YOU[2] - 0.32]; return { ...DAY, dof: 6, focus: ph,
    cam: kick(orbit(s, f, ph, [-30, 26], [1.5, 1.3], [-0.9, -1.0], 54, [0.12, -0.08]), f, s.a + 3, 0.6),
    people: [P("you", YOU, "stern", 0, { hw: [ph] }), ...WHARF(30, 31, CHEER, 0.7, 5.2, 8).filter((q) => Math.hypot(q.p[0], q.p[2] + 2.2) > 1.4)], phone: phone(ph, "80", 1.5), closeup: true }; },

  // ---------------- who's on the ship ----------------
  "crowd-wide2": (s, f) => ({ ...DAY, dof: 0,
    cam: move({ pos: [24, 34, 40], look: [0, 2, -2], fov: 50, roll: -0.05 }, { pos: [8, 16, 22], look: [-2, PIER, -3], fov: 46, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: WHARF(80, 41, CHEER, 0.8) }),
  "barnum-dock": (s, f) => ({ ...DAY, dof: 5,
    cam: orbit(s, f, [BARN[0], PIER + 1.4, BARN[2]], [160, 196], [5.6, 4.6], [0.3, 0.1], 40, [-0.06, 0.05]),
    people: [P("barnum", BARN, "grin", -1, { wave: 0.9 }), ...crowd(20, 2, 22, -8, 2, 51, pick(CHEER), PIER, 6, pierFree, 0.8)], subjects: [["Barnum", [BARN[0], PIER + 1.5, BARN[2]], 0.4]] }),
  "crowd-crane": (s, f) => ({ ...DAY, dof: 0,
    cam: move({ pos: [-6, PIER + 2, 12], look: [-4, PIER + 1.6, -4], fov: 46, roll: 0.06 }, { pos: [-12, 46, 34], look: [-2, PIER, -6], fov: 50, roll: -0.04 }, f, s.a + 2, s.b, smooth, 0),
    people: WHARF(90, 43, CHEER, 0.85) }),
  "crowd-cheer2": (s, f) => ({ ...DAY, dof: 5,
    cam: full({ pos: [-26 + 14 * smooth(U(s, f)), PIER + 1.6, 9.2], look: [-22 + 12 * smooth(U(s, f)), PIER + 1.4, -2], fov: 26, roll: 0.04 }),
    people: WHARF(64, 47, ["laugh", "relief_open", "grin", "laugh"], 0.95) }),
  "you-only": (s, f) => { const u = smooth(U(s, f)), ph: V3 = [YOU[0] + 0.15, PIER + 1.25 + 0.6 * u, YOU[2] + 0.32]; return { ...DAY, dof: 5, ship: { x: 0 },
    cam: move({ pos: [0.4, PIER + 1.6, 4.6], look: [0, PIER + 1.4, -2.2], fov: 40, roll: 0.05 }, { pos: [0.2, PIER + 1.5, 3.4], look: [0, PIER + 1.5, -2.2], fov: 36, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", YOU, "grin", 0, { hw: [ph] }), ...WHARF(40, 59, CHEER, 0.8, 5.2, 11).filter((q) => Math.hypot(q.p[0], q.p[2] + 2.2) > 1.4)], phone: phone(ph, "rec", 1.6, { face: 0 }) }; },

  // ---------------- attempt 1: call someone ----------------
  "you-dial": (s, f) => { const ph = inHand(YOU, 0.12, 1.0, -0.25); return { ...DAY, dof: 9, closeup: true, focus: ph,
    cam: kick(snap([0.7, PIER + 1.6, -4.0], [0, PIER + 1.5, -2.2], f, s.a, { fov: 38, roll: 0.08 }, 1.7, 5), f, s.a + 4, 0.7),
    people: [P("you", YOU, "nervous", 0, { hw: [ph], headTilt: 0.12 }), P("c7", Pr(-1.7, -1.0), "laugh", 1, { extra: true, wave: 0.8 })], phone: phone(ph, "dial", 1.3) }; },
  "telegraph-wide": (s, f) => ({ ...DAY, dof: 3, room: OFFICE_ROOM,
    cam: move({ pos: Rm(-4.6, 3.2, -6.4), look: Rm(0.3, 1.0, 1.4), fov: 48, roll: -0.07 }, { pos: Rm(-1.6, 1.8, -3.8), look: Rm(0.5, 1.05, 1.5), fov: 42, roll: 0.03 }, f, s.a, s.b, expo, 0.0008),
    people: [P("operator", Rm(0.3, 0, 1.75), "stern", 0, { hw: [Rm(0.17, 0.92, 0.55)] }), P("c2", Rm(2.6, 0, -0.8), "neutral", -1, { extra: true })], subjects: [["the telegraph key", Rm(0.3, 0.86, 0.55), 0.2], ["the room sign", Rm(0, 3.3, 3.4), 0.3]] }),
  "operator-taps": (s, f) => { const tap = Math.floor(t(f) * 6) % 3 === 0 ? -0.012 : 0; return { ...DAY, dof: 10, closeup: true, room: OFFICE_ROOM, focus: Rm(0.25, 0.9, 0.55),
    cam: kick(snap(Rm(-0.5, 1.25, -0.5), Rm(0.25, 0.92, 0.6), f, s.a, { fov: 40, roll: -0.1 }, 1.6, 5), f, s.a + 4, 0.5),
    people: [P("operator", Rm(0.3, 0, 1.75), "stern", 0, { hw: [Rm(0.17, 0.92 + tap, 0.55)] })], subjects: [["the telegraph key", Rm(0.3, 0.86, 0.55), 0.15]] }; },
  "you-office": (s, f) => ({ ...DAY, dof: 4, room: OFFICE_ROOM,
    cam: orbit(s, f, Rm(-0.8, 1.35, 0), [-26, 18], [5.4, 4.4], [0.4, 0.15], 42, [0.06, -0.05]),
    people: [P("you", Rm(-1.0, 0, -0.4), "dazed", 1, { hw: [Rm(-0.8, 0.95, -0.7)] }), P("operator", Rm(0.6, 0, 1.75), "neutral", -1, { hw: [Rm(0.17, 0.92, 0.55)] })], phone: phone(Rm(-0.8, 0.95, -0.7), "80") }),

  // ---------------- attempt 2: show it off ----------------
  "you-raise": (s, f) => { const u = smooth(U(s, f)), ph: V3 = [YOU[0] + 0.15, PIER + 1.2 + 0.75 * u, YOU[2] + 0.3]; return { ...DAY, dof: 4,
    cam: move({ pos: [-2.4, PIER + 0.6, -6.8], look: [0, PIER + 1.8, -2], fov: 46, roll: -0.08 }, { pos: [-1.6, PIER + 0.9, -5.6], look: [0, PIER + 1.9, -2], fov: 42, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", YOU, "grin", 0, { hw: [ph] }), ...WHARF(36, 61, CHEER, 0.8, 5.2, 14).filter((q) => q.p[2] > -1 && Math.hypot(q.p[0], q.p[2] + 2.2) > 1.4)], phone: phone(ph, "rec", 1.5, { face: 0 }) }; },
  "film-lind": (s, f) => { const u = U(s, f), ph: V3 = [3.0, PIER + 1.95, -0.6]; return { ...DAY, dof: 6, focus: lindOn(0.25 + 0.5 * u),
    cam: move({ pos: [2.3, PIER + 1.95, -2.2], look: [8, PIER + 3.2, 7], fov: 40, roll: 0.05 }, { pos: [2.5, PIER + 2.0, -1.9], look: [8, PIER + 2.6, 6.4], fov: 34, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Pr(2.8, -0.9), "grin", 1, { hw: [ph] }), P("lind", lindOn(0.25 + 0.5 * u), "smile", -1, { wave: 0.85 }), P("captain", lindOn(0.08), "smile_closed", -1), P("barnum", Pr(10.4, 3.4), "grin", -1, { wave: 0.8 }),
      ...crowd(14, 3, 14, -1, 4, 67, pick(CHEER), PIER, 6, (p) => pierFree(p) && Math.hypot(p[0] - 2.8, p[2] + 0.9) > 1.2, 0.9)],
    phone: phone(ph, "rec", 1.4), subjects: [["Jenny Lind", lindOn(0.25 + 0.5 * u).map((x, i) => (i === 1 ? x + 1.4 : x)) as V3, 0.4]] }; },
  "dag-studio": (s, f) => ({ ...DAY, dof: 4, room: { sign: STUDIO, daguerre: true },
    cam: orbit(s, f, Rm(-0.3, 1.3, 0.4), [-60, -24], [5.6, 4.8], [0.6, 0.2], 42, [0.07, -0.05]),
    people: [P("sitter", Rm(-0.3, 0, 1.6), "stern", 0), P("dagman", Rm(0.6, 0, -1.4), "neutral", -1, { hw: [Rm(0.05, 1.5, -1.1)] })], subjects: [["the camera", Rm(-0.3, 1.47, -1.2), 0.3]] }),
  "phone-hero2": (s, f) => { const ph: V3 = [3.0, PIER + 1.95, -0.6]; return { ...DAY, dof: 12, closeup: true, focus: ph,
    cam: move({ pos: [2.55, PIER + 2.08, -1.25], look: ph, fov: 34, roll: -0.08 }, { pos: [2.62, PIER + 2.05, -1.12], look: ph, fov: 30, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Pr(2.8, -0.9), "grin", 1, { hw: [ph] }), P("lind", lindOn(0.9), "smile", -1, { wave: 0.8 })], phone: phone(ph, "rec", 1.4) }; },
  "barnum-reveal": (s, f) => ({ ...DAY, dof: 6,
    cam: kick(snap([BARN[0] - 1.6, PIER + 1.65, BARN[2] - 4.2], [BARN[0], PIER + 1.5, BARN[2]], f, s.a, { fov: 38, roll: 0.09 }, 1.8, 5), f, s.a + 4, 0.8),
    people: [P("barnum", BARN, "grin", -1, { wave: 0.95 }), ...crowd(12, 4, 20, 0.5, 5, 71, pick(CHEER), PIER, 2, (p) => pierFree(p) && Math.hypot(p[0] - BARN[0], p[2] - BARN[2]) > 1.3, 0.8)], subjects: [["Barnum", [BARN[0], PIER + 1.5, BARN[2]], 0.4]] }),
  "museum-wide": (s, f) => ({ ...DAY, dof: 0,
    cam: move({ pos: Bw(4, 1.6, -9), look: Bw(9, 14, 12), fov: 56, roll: 0.07 }, { pos: Bw(-6, 4, -14), look: Bw(6, 12, 12), fov: 50, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [...Array.from({ length: 10 }, (_, k) => walker(`c${(k * 5) % 48}`, -20 + ((k * 7.3) % 40), k % 2 ? SW : 0, k % 2 ? 8 + (k % 3) * 0.9 : -3 + (k % 4) * 1.6, (k % 2 ? 1 : -1) * 1.3, t(f - s.a), "neutral", k, true))],
    subjects: [["the museum sign", Bw(9, 20.4, 11.8), 1]] }),
  "barnum-grin": (s, f) => ({ ...DAY, dof: 9, closeup: true,
    cam: move({ pos: [BARN[0] + 1.2, PIER + 1.6, BARN[2] - 2.4], look: [BARN[0], PIER + 1.62, BARN[2]], fov: 34, roll: -0.07 }, { pos: [BARN[0] + 0.7, PIER + 1.65, BARN[2] - 2.0], look: [BARN[0], PIER + 1.66, BARN[2]], fov: 32, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("barnum", BARN, "laugh", -1, { wave: 0.8 })] }),
  "mermaid-case": (s, f) => ({ ...DAY, dof: 3, room: { sign: MUSEUM, mermaid: true },
    cam: orbit(s, f, Rm(0, 1.2, 1.6), [-40, 26], [5.2, 4.0], [0.9, 0.3], 44, [0.08, -0.06]),
    people: [P("barnum", Rm(1.6, 0, 2.2), "grin", -1, { wave: 0.9 }), ...crowd(10, -4.6, 4.6, -1.2, 0.4, 73, pick(["shock", "laugh", "grin", "shock"]), 0, 9)], subjects: [["the mermaid case", Rm(0, 1.2, 1.6), 0.5]] }),
  "museum-crowd": (s, f) => { const ph = Rm(0, 1.25, 1.6); return { ...DAY, dof: 4, room: { sign: MUSEUM, mermaid: true },
    cam: kick(orbit(s, f, Rm(0, 1.3, 1.4), [30, -16], [5.0, 4.2], [0.5, 0.2], 44, [-0.07, 0.05]), f, W(31, "trick"), 0.8),
    people: [P("barnum", Rm(1.6, 0, 2.2), "grin", -1, { wave: 0.9 }), P("you", Rm(-1.4, 0, 1.9), "nervous", 1), ...crowd(10, -4.6, 4.6, -1.2, 0.4, 79, pick(MOCK), 0, 19)], phone: phone(ph, "rec", 2.4, { glow: 0.6 }), subjects: [["the phone", ph, 0.2]] }; },

  // ---------------- attempt 3: charge it ----------------
  "you-worried": (s, f) => { const ph = inHand(Sw(-2, 8.6), 0.15, 0.95, -0.3); return { ...DAY, dof: 5,
    cam: orbit(s, f, Bw(-2, SW + 1.4, 8.6), [-24, 16], [5.6, 4.6], [0.5, 0.2], 40, [0.06, -0.05]),
    people: [P("you", Sw(-2, 8.6), "nervous", 0, { hw: [ph], headTilt: 0.1 }), ...Array.from({ length: 6 }, (_, k) => walker(`c${(k * 7 + 2) % 48}`, -14 + k * 5, k % 2 ? SW : 0, k % 2 ? 10.4 : 2 + k * 0.6, (k % 2 ? 1 : -1) * 1.3, t(f - s.a), "neutral", k, true))], phone: phone(ph, "40") }; },
  "jars-crane": (s, f) => ({ ...DAY, dof: 4, room: OFFICE_ROOM,
    cam: move({ pos: Rm(0.6, 4.6, -1.0), look: Rm(0, 0.9, 3.1), fov: 48, roll: 0.06 }, { pos: Rm(-0.4, 1.6, 0.2), look: Rm(0, 0.85, 3.1), fov: 42, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    subjects: [["the battery jars", Rm(0, 0.65, 3.15), 0.4]] }),
  "operator-batt": (s, f) => ({ ...DAY, dof: 4, room: OFFICE_ROOM,
    cam: orbit(s, f, Rm(-0.4, 1.2, 2.2), [-30, 20], [4.8, 4.0], [0.6, 0.3], 44, [0.07, -0.05]),
    people: [P("operator", Rm(-2.2, 0, 2.6), "smile_closed", 1, { hw: [Rm(-1.25, 1.05, 3.0)] })], subjects: [["the battery jars", Rm(0, 0.65, 3.15), 0.4]] }),
  "jars-close": (s, f) => ({ ...DAY, dof: 12, closeup: true, room: { ...OFFICE_ROOM, jarsLit: 12 }, focus: Rm(-0.2, 0.62, 3.15),
    cam: full({ pos: Rm(-1.2 + 1.4 * smooth(U(s, f)), 0.75, 2.05), look: Rm(-0.6 + 1.2 * smooth(U(s, f)), 0.62, 3.15), fov: 34, roll: 0.06 - 0.1 * smooth(U(s, f)) }),
    subjects: [["the battery jars", Rm(0, 0.62, 3.15), 0.3]] }),
  "you-cable": (s, f) => { const u = smooth(U(s, f)), ph = Rm(-0.75, 0.62 + 0.04 * u, 2.6); return { ...DAY, dof: 7, room: { ...OFFICE_ROOM, jarsLit: 3 }, closeup: true, focus: Rm(-0.75, 0.6, 3.0),
    cam: move({ pos: Rm(-2.2, 1.5, 0.6), look: Rm(-0.9, 0.85, 2.8), fov: 42, roll: -0.07 }, { pos: Rm(-1.9, 1.25, 1.0), look: Rm(-0.85, 0.8, 2.8), fov: 38, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rm(-1.5, 0, 2.3), "nervous", 1, { hw: [ph, Rm(-1.0, 0.6, 2.95)] })], phone: phone(ph, "40", 1.4), subjects: [["three jars", Rm(-0.75, 0.6, 3.15), 0.3]] }; },
  "you-no": (s, f) => { const u = smooth(U(s, f)), y = Rm(-1.5 - 0.9 * u, 0, 2.3 - 1.4 * u); return { ...DAY, dof: 4, room: OFFICE_ROOM,
    cam: kick(move({ pos: Rm(-0.6, 1.4, -3.6), look: Rm(-1.6, 1.2, 1.8), fov: 42, roll: 0.06 }, { pos: Rm(-1.2, 1.5, -3.0), look: Rm(-2.0, 1.25, 1.2), fov: 40, roll: -0.05 }, f, s.a, s.b, smooth, 0), f, s.a + 3, 0.6),
    people: [P("you", y, "stern", 0, { hw: [[y[0] + 0.18, 0.95, y[2] - 0.3]] })], phone: phone([y[0] + 0.18, 0.95, y[2] - 0.3], "40") }; },

  // ---------------- attempt 4: get it copied ----------------
  "you-walk": (s, f) => { const tt = t(f - s.a); return { ...DAY, dof: 4,
    cam: full({ pos: Bw(-30 + 1.6 * tt + 2.2, 1.5, 2.2), look: Bw(-30 + 1.6 * tt + 0.4, 1.35, 9), fov: 38, roll: 0.05 * Math.sin(tt * 1.6) }),
    people: [walker("you", -30, SW, 9, 1.6, tt, "stern"), ...Array.from({ length: 6 }, (_, k) => walker(`c${(k * 9 + 5) % 48}`, -40 + k * 6, SW, 10.8, (k % 2 ? 1 : -1) * 1.2, tt, "neutral", k, true))] }; },
  "henry-lab": (s, f) => ({ ...DAY, dof: 4, room: { sign: LAB, magnet: true, table: true },
    cam: move({ pos: Rm(-6.2, 2.4, -3.2), look: Rm(-2.8, 1.3, 1.6), fov: 46, roll: -0.07 }, { pos: Rm(-4.6, 1.7, -2.2), look: Rm(-2.6, 1.4, 1.6), fov: 40, roll: 0.03 }, f, s.a, s.b, expo, 0.0008),
    people: [P("henry", Rm(-1.9, 0, 1.75), "smile_closed", -1, { hw: [Rm(-2.55, 1.17, 1.6)] })], subjects: [["the electromagnet", Rm(-3.2, 1.6, 1.6), 0.4]] }),
  "magnet-close": (s, f) => { const u = U(s, f), lift = 0.05 * smooth((u - 0.2) / 0.3); return { ...DAY, dof: 10, closeup: true, room: { sign: LAB, magnet: true }, focus: Rm(-3.2, 1.3, 1.6),
    cam: kick(orbit(s, f, Rm(-3.2, 1.25 + lift, 1.6), [-36, 20], [2.2, 1.9], [-0.1, 0.1], 40, [0.09, -0.06]), f, s.a + Math.round((s.b - s.a) * 0.35), 0.6),
    subjects: [["the electromagnet", Rm(-3.2, 1.6, 1.6), 0.3]] }; },
  "you-henry": (s, f) => { const ph = Rm(-0.75, 1.0, 1.2); return { ...DAY, dof: 4, room: { sign: LAB, magnet: true },
    cam: orbit(s, f, Rm(-1.3, 1.35, 1.5), [-24, 18], [4.8, 4.0], [0.4, 0.2], 42, [0.06, -0.05]),
    people: [P("you", Rm(-0.4, 0, 1.5), "grin", -1, { hw: [ph] }), P("henry", Rm(-1.9, 0, 1.75), "nervous", 1)], phone: phone(ph, "low", 1.6, { glow: 0.3 }) }; },
  "open-phone": (s, f) => { const u = U(s, f), ph = Rm(0.5, 0.815, 0.6); return { ...DAY, dof: 10, closeup: true, room: { sign: LAB, table: true, magnet: true }, focus: ph,
    cam: move({ pos: Rm(0.8, 2.1, -0.4), look: ph, fov: 40, roll: 0.06 }, { pos: Rm(0.6, 1.45, -0.05), look: ph, fov: 34, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("henry", Rm(1.4, 0, 1.75), u > 0.5 ? "shock" : "nervous", -1, { hw: [Rm(0.75, 0.84, 0.75)] }), P("you", Rm(-0.6, 0, 1.75), "neutral", 1)],
    phone: { p: ph, screen: "black", s: 1.8, face: 0, tilt: -Math.PI / 2 }, subjects: [["the phone", ph, 0.15]] }; },
  "henry-squint": (s, f) => ({ ...DAY, dof: 9, closeup: true, room: { sign: LAB, magnet: true },
    cam: kick(snap(Rm(-1.5, 1.66, -0.6), Rm(-1.9, 1.62, 1.75), f, s.a, { fov: 34, roll: 0.09 }, 1.7, 5), f, s.a + 4, 0.6),
    people: [P("henry", Rm(-1.9, 0, 1.75), "dazed", 0, { headTilt: 0.12 })] }),

  // ---------------- attempt 5: save lives ----------------
  "you-think": (s, f) => ({ ...GOLD, dof: 5,
    cam: orbit(s, f, Bw(-2, SW + 1.45, 8.6), [22, -12], [5.0, 4.2], [0.3, 0.1], 40, [-0.06, 0.05]),
    people: [P("you", Sw(-2, 8.6), "neutral", 0, { headTilt: 0.08 })] }),
  "you-doctors": (s, f) => ({ ...DAY, dof: 4, room: { sign: CLINIC, table: true },
    cam: orbit(s, f, Rm(0.4, 1.35, 1.2), [-28, 18], [5.6, 4.6], [0.5, 0.2], 42, [0.06, -0.05]),
    people: [P("you", Rm(-1.6, 0, 0.0), "nervous", 1, { wave: 0.85 }), P("doctor", Rm(0.2, 0, 1.75), "stern", -1), P("doctor2", Rm(1.5, 0, 1.75), "neutral", -1), P("doctor3", Rm(2.8, 0, 1.7), "stern", -1)] }),
  badair: (s, f) => { const tt = t(f - s.a); return { light: "fog", dof: 3,
    cam: full({ pos: Bw(-40 + 1.0 * tt, 1.7, -4), look: Bw(-34 + 1.0 * tt, 3.0, 12), fov: 48, roll: 0.05 }),
    people: Array.from({ length: 8 }, (_, k) => walker(`c${(k * 11 + 3) % 48}`, -44 + k * 3.4, k % 2 ? SW : 0, k % 2 ? 9 + (k % 3) * 0.8 : 1.5 + k * 0.4, (k % 2 ? 1 : -1) * 1.1, tt, "pained", k, true)) }; },
  "you-tell": (s, f) => ({ ...DAY, dof: 5, room: { sign: CLINIC, table: true },
    cam: kick(snap(Rm(-1.0, 1.55, -2.2), Rm(-1.6, 1.5, 0.0), f, s.a, { fov: 38, roll: -0.08 }, 1.7, 5), f, s.a + 3, 0.7),
    people: [P("you", Rm(-1.6, 0, 0.0), "shock", 1, { wave: 0.95 }), P("doctor", Rm(0.2, 0, 1.75), "laugh", -1)] }),
  "semmel-ward": (s, f) => ({ ...DAY, dof: 4, room: { sign: WARD, beds: true, basin: true },
    cam: move({ pos: Rm(5.8, 2.6, -4.6), look: Rm(1.8, 1.2, 1.6), fov: 48, roll: 0.07 }, { pos: Rm(5.0, 1.8, -2.6), look: Rm(3.0, 1.3, 1.2), fov: 42, roll: -0.03 }, f, s.a, s.b, expo, 0.0008),
    people: [P("semmel", Rm(3.0, 0, 1.3), "stern", 1, { hw: [Rm(3.45, 0.97, 1.0)] }), P("patient", Rm(-2.0, 0, 1.0), "nervous", 1), P("patient2", Rm(0.4, 0, 1.0), "neutral", 1)], subjects: [["the wash basin", Rm(3.6, 0.95, 1.0), 0.25]] }),
  handwash: (s, f) => { const sw = 0.05 * Math.sin(t(f) * 9); return { ...DAY, dof: 12, closeup: true, room: { sign: WARD, beds: true, basin: true }, focus: Rm(3.6, 0.98, 1.0),
    cam: kick(snap(Rm(3.0, 1.35, 0.1), Rm(3.55, 0.98, 1.0), f, s.a, { fov: 40, roll: 0.09 }, 1.6, 5), f, s.a + 4, 0.5),
    people: [P("doctor2", Rm(3.6, 0, 1.6), "stern", 0, { hw: [Rm(3.5 + sw, 1.0, 0.95), Rm(3.7 - sw, 1.0, 0.95)] })], subjects: [["the wash basin", Rm(3.6, 0.95, 1.0), 0.2]] }; },
  ridiculed: (s, f) => ({ ...DAY, dof: 4, room: { sign: WARD, beds: true, basin: true },
    cam: orbit(s, f, Rm(1.4, 1.4, 0.6), [24, -16], [5.8, 4.8], [0.5, 0.2], 42, [-0.06, 0.05]),
    people: [P("semmel", Rm(3.0, 0, 1.3), "dazed", -1), P("doctor", Rm(0.0, 0, 0.2), "laugh", 1, { wave: 0.8 }), P("doctor2", Rm(1.2, 0, -0.4), "laugh", 1), P("doctor3", Rm(-1.2, 0, 0.4), "grin", 1)] }),
  "you-search": (s, f) => { const ph = Rm(-0.2, 1.0, -0.25); return { ...NIGHT, dof: 10, closeup: true, room: { sign: LODGING, bed: true, candle: 1 }, focus: ph,
    cam: move({ pos: Rm(0.4, 1.55, -1.6), look: Rm(-0.3, 1.45, 0.05), fov: 38, roll: -0.06 }, { pos: Rm(0.25, 1.5, -1.25), look: Rm(-0.3, 1.45, 0.05), fov: 34, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rm(-0.4, 0, 0.05), "nervous", 0, { hw: [ph] })], phone: phone(ph, "map", 1.3, { glow: 1 }) }; },
  "snow-desk": (s, f) => ({ ...DAY, dof: 4, room: { sign: SNOW, table: true, map: true },
    cam: move({ pos: Rm(0.5, 3.6, -2.4), look: Rm(0.5, 0.82, 0.6), fov: 46, roll: 0.07 }, { pos: Rm(-0.6, 2.0, -2.4), look: Rm(0.4, 1.2, 1.0), fov: 42, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("snow", Rm(0.5, 0, 1.75), "stern", 0, { hw: [Rm(0.3, 0.84, 0.55)] })], subjects: [["the map", Rm(0.5, 0.82, 0.6), 0.3]] }),

  // ---------------- what would have worked / ending ----------------
  "you-notebook": (s, f) => { const ph = Rm(0.3, 0.83, 0.55); return { ...NIGHT, dof: 6, room: { sign: LODGING, table: true, candle: 1 }, focus: ph,
    cam: orbit(s, f, Rm(0.3, 1.0, 0.8), [-30, 10], [3.4, 2.8], [0.8, 0.5], 42, [0.07, -0.05]),
    people: [P("you", Rm(0.3, 0, 1.75), "stern", 0, { hw: [Rm(0.42, 0.85, 0.6)] })], phone: { p: ph, screen: "low", s: 1.6, face: 0, tilt: -Math.PI / 2 + 0.3, glow: 0.8 },
    cards: [{ kind: "paper", p: Rm(-0.4, 0.81, 0.6), spin: 0.2, s: 0.5, flat: true }, { kind: "paper", p: Rm(1.2, 0.81, 0.55), spin: -0.3, s: 0.5, flat: true }] }; },
  "you-wharf-dusk": (s, f) => ({ ...GOLD, dof: 4,
    cam: move({ pos: [-2, PIER + 1.4, -8], look: [0, PIER + 1.5, -2.2], fov: 40, roll: 0.05 }, { pos: [-8, PIER + 8, -20], look: [2, PIER + 3, 6], fov: 46, roll: -0.04 }, f, s.a + 2, s.b, smooth, 0),
    people: [P("you", YOU, "neutral", 0), ...crowd(10, -24, 20, -12, 4, 91, pick(CALM), PIER, 21, pierFree)] }),
  flicker: (s, f) => { const fl = Math.floor(t(f) * 7) % 4 === 0, ph = Rm(-0.2, 0.95, 0.1); return { ...NIGHT, dof: 9, closeup: true, room: { sign: LODGING, bed: true, candle: 0.7 }, focus: ph,
    cam: move({ pos: Rm(0.5, 1.55, -1.7), look: Rm(-0.35, 1.3, 0.5), fov: 40, roll: -0.07 }, { pos: Rm(0.35, 1.5, -1.35), look: Rm(-0.35, 1.3, 0.5), fov: 36, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("you", Rm(-0.4, 0, 0.4), "nervous", 0, { hw: [ph] })], phone: phone(ph, fl ? "black" : "low", 1.4, { glow: fl ? 0 : 0.9 }) }; },
  lastvideo: (s, f) => { const ph: V3 = [YOU[0] + 0.15, PIER + 1.9, YOU[2] + 0.32]; return { ...GOLD, dof: 5, focus: ph,
    cam: move({ pos: [0.5, PIER + 2.1, -3.6], look: [2, PIER + 3.4, 12], fov: 44, roll: -0.05 }, { pos: [0.3, PIER + 2.0, -3.1], look: [3, PIER + 3.6, 12], fov: 40, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", YOU, "neutral", 0, { hw: [ph] }), ...crowd(10, -12, 14, 1, 5, 93, pick(CALM), PIER, 23, pierFree)], phone: phone(ph, "rec", 1.5) }; },
  "ships-pan": (s, f) => { const u = smooth(U(s, f)); return { ...GOLD, dof: 0, ship: { smoke: 0.4 },
    cam: full({ pos: [30 - 50 * u, PIER + 3, -14], look: [24 - 50 * u, 7, 18], fov: 40, roll: 0.03 }) }; },
  "crowd-last": (s, f) => ({ ...GOLD, dof: 0,
    cam: move({ pos: [10, PIER + 3, 10], look: [-6, PIER + 1.2, -6], fov: 46, roll: 0.05 }, { pos: [16, 22, 26], look: [-4, PIER, -6], fov: 50, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: WHARF(70, 97, CALM, undefined) }),
  black: (s, f) => { const u = U(s, f), ph: V3 = [YOU[0] + 0.15, PIER + 0.95, YOU[2] - 0.32]; return { ...GOLD, dof: 12, closeup: true, focus: ph,
    cam: move({ pos: [0.4, PIER + 1.2, -3.1], look: ph, fov: 30, roll: 0.05 }, { pos: [0.3, PIER + 1.15, -2.95], look: ph, fov: 26, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("you", YOU, "dazed", 0, { hw: [ph] })], phone: phone(ph, u > 0.35 ? "black" : "1", 1.3) }; },
  glass: (s, f) => { const ph = inHand(YOU, 0.15, 0.92, -0.3); return { ...GOLD, dof: 0,
    cam: move({ pos: [0.6, PIER + 1.5, -4.2], look: [0, PIER + 1.3, -2.2], fov: 38, roll: -0.05 }, { pos: [-6, PIER + 18, -16], look: [2, PIER + 2, 2], fov: 46, roll: 0.04 }, f, s.a + 3, s.b, smooth, 0),
    people: [P("you", YOU, "dazed", 0, { hw: [ph], headTilt: 0.1 }), ...crowd(16, -20, 20, -11, 4, 99, pick(CALM), PIER, 27, (p) => pierFree(p) && Math.hypot(p[0], p[2] + 2.2) > 1.6)], phone: phone(ph, "black", 1.4) }; },
  "operator-last": (s, f) => { const tap = Math.floor(t(f) * 6) % 3 === 0 ? -0.012 : 0; return { ...NIGHT, dof: 5, room: { ...OFFICE_ROOM, candle: 1 },
    cam: orbit(s, f, Rm(0.3, 1.2, 1.2), [-30, 14], [4.4, 3.4], [0.5, 0.2], 40, [0.06, -0.05]),
    people: [P("operator", Rm(0.3, 0, 1.75), "stern", 0, { hw: [Rm(0.17, 0.92 + tap, 0.55)] })], subjects: [["the telegraph key", Rm(0.3, 0.86, 0.55), 0.2]] }; },

  thumb: () => { const ph: V3 = [YOU[0] + 0.32, PIER + 1.62, YOU[2] - 0.55]; return { ...DAY, dof: 3, focus: [YOU[0], PIER + 1.5, YOU[2]], ship: { x: 0 },
    cam: full({ pos: [1.3, PIER + 1.55, -5.4], look: [-1.0, PIER + 2.6, 6], fov: 46, roll: 0 }),
    people: [P("you", YOU, "shock", 0, { hw: [ph] }), ...WHARF(50, 13, CHEER, 0.8).filter((q) => Math.hypot(q.p[0] - YOU[0], q.p[2] - YOU[2]) > 1.6)], phone: phone(ph, "80", 2.4, { glow: 0.5 }) }; },
};

/** every shot is hand-held: a slow sway on top of its move, less when the lens is long */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * Math.min(d, 60), id = s.id;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** frames where the 3D picture gets a sideways motion blur: the first frames of every 3D shot that swoops in */
const WHIP = new Set(["open-wide", "crowd-wide2", "crowd-crane", "museum-wide", "ship-in", "you-raise", "jars-crane", "henry-lab", "semmel-ward", "glass"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
void segAt; void Rd; void pop;
