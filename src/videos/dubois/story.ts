// The Dubois Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen LEFT), unless a shot turns round.
// The Shoshone are shown as the mission's friends and neighbours in ordinary 1880s clothes; nobody is a costume.
import { Expr } from "../bridge/toon";
import type { Gait } from "../hayes/horse";
import { V3, FPS, Rv, Wd, Rm, POST, STORE, BLD_Z, WSIGN, TABLE, MAP, CHAPEL_Z, riverY } from "./place";
import { SEG_TIMES, TOTAL, VOICE_END, wordAt, words } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const norm = (s: string) => s.toLowerCase().replace(/[^\w]/g, "");
/** onset of the n-th (1-based) match of w in a segment */
const Wn = (seg: number, w: string, n: number) => { const ws = words().filter((x) => x.seg === seg && norm(x.w) === norm(w)); const hit = ws[n - 1] ?? ws[ws.length - 1]; return hit ? Math.round(hit.s * FPS) : W(seg, w); };
const CUTS: [string, number][] = [
  ["hook", 0], ["purpose", W(0, "on") - 2],
  ["valley", A(1)], ["ranchers", W(1, "few") - 2], ["wanted", W(1, "wanted") - 2], ["miles", W(1, "nearest") - 2], ["mail", W(1, "mail") - 2],
  ["write", A(2)], ["tibo", W(2, "tibo") - 2],
  ["mission", A(3)], ["nick", W(3, "fond") - 2], ["roberts", W(3, "welsh") - 2],
  ["clerk", A(4)], ["red", W(4, "red") - 2], ["letter", W(4, "their") - 2],
  ["fred", A(5)], ["congress", W(5, "congress") - 2], ["map", W(5, "not") - 2], ["barely", W(5, "barely") - 2],
  ["who", A(6)], ["friend", W(6, "some") - 2], ["himself", Wn(6, "some", 2) - 2],
  ["twist", A(7)], ["bwah", W(7, "doobwah") - 2], ["boys", W(7, "hated") - 2],
  ["town", A(8)], ["shout", W(8, "dooboys") - 2], ["wink", W(8, "on") - 2], ["every", W(8, "every") - 2],
  ["today", A(9)], ["tourist", W(9, "say") - 2], ["stare", W(9, "everybody") - 2],
  ["butch", A(10)], ["creek", W(10, "moved") - 2],
  ["stranger", A(11)], ["his", W(11, "would") - 2], ["end", VOICE_END],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Ride = { pose: number; mirror: boolean; tilt?: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number; tilt?: number; mode?: "stand" | "sit";
  /** in the air: no contact shadow */
  air?: boolean;
  /** walking in profile: step phase 0..1; mirror = moving toward -x; carry = a point both hands hold out to */
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 }; ride?: Ride };
/** a horse at p (its hooves on the ground), heading yaw (0: toward +x); gait and stride phase; an optional rider */
export type HorseSt = { k: number; p: V3; yaw: number; gait: Gait; phase: number; head?: number; rider?: { who: string; expr: Expr; pose?: number } };
/** musket: g = the butt at the shoulder, b = the muzzle; knife and pick: g = the hand, b = the way the blade points */
export type Tool = { kind: "musket" | "knife" | "pick"; g: V3; b: V3 };
/** a cane: g = the knob (in the hand), b = the tip */
export type Cane = { g: V3; b: V3 };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "spark" | "flake" | "nugget" | "note" | "coin" | "coal" | "dot" | "comma" | "qmark" | "sack";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type St3 = {
  light: "valley" | "today" | "mission" | "cabin" | "capitol" | "office"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; horses?: HorseSt[]; subjects?: [string, V3, number][];
  tools?: Tool[]; canes?: Cane[]; cards?: Card[]; puffs?: Puff[];
  /** the post office sign (1889): false before there was a post office */
  posign?: boolean;
  /** today: the "SAY IT: DOO-BOYS" plate on the welcome sign */
  plate?: boolean;
  /** the wall board's page: the application (black ink), the same amended in red, the map, the 1937 newspaper */
  page?: "app" | "red" | "map" | "news";
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
const P = (who: string, p: V3, expr: Expr, look = 0, extra: Partial<Person3> = {}): Person3 => ({ who, p, expr, look, ...extra });
/** someone walking in profile along x from x0 (absolute) at v m/s */
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", extra: Partial<Person3> = {}): Person3 => {
  const d = Math.abs(v) * tt, p: V3 = [x0 + v * tt, y, z];
  return { who, p, expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: Math.min(1.25, Math.abs(v) / 1.6) }, ...extra };
};
const add = (p: V3, x: number, y: number, z: number): V3 => [p[0] + x, p[1] + y, p[2] + z];
const mv = (s: ShotDef, f: number, a: Shot, b: Shot) => move(a, b, f, s.a, s.b, smooth, 0);
const head = (p: V3, y = 1.55): V3 => add(p, 0, y, 0);
const STRIDE: Record<Gait, number> = { gallop: 6.8, canter: 3.6, trot: 2.9, walk: 1.7, stand: 1 };
/** a horse heading along x (v > 0: toward +x, screen left); its stride phase follows the distance it covers */
const horse = (k: number, x: number, y: number, z: number, v: number, gait: Gait, who: string | null, expr: Expr = "neutral", extra: Partial<HorseSt> = {}): HorseSt =>
  ({ k, p: [x, y, z], yaw: v >= 0 ? 0 : Math.PI, gait, phase: Math.abs(x) / STRIDE[gait] + k * 0.31, rider: who ? { who, expr, pose: 0 } : undefined, ...extra });

// ---------------- the settlement as the shots use it ----------------
/** in front of the post office (under its porch roof), the store, the welcome sign (today) */
const PO = (x: number, z = 4.3): V3 => Rv(POST.x + x, 0, z);
const SIGN_MAN: V3 = Rv(WSIGN[0] + 0.45, 0, WSIGN[2] - 2.2);
/** the post office sign, hung from the porch beam */
const POSIGN: V3 = Rv(POST.x, 2.32, BLD_Z - 1.66);
const SIGN_TOP: V3 = Rv(WSIGN[0], 2.75, WSIGN[2] - 0.15);
const HOOK_POS: V3 = Rv(WSIGN[0] + 0.3, 1.75, WSIGN[2] - 4.65), HOOK_LOOK: V3 = Rv(WSIGN[0] + 0.2, 1.26, WSIGN[2]), HOOK = { fov: 64, roll: 0.03 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.05), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const hookState = (expr: Expr = "grin"): Partial<St3> => ({ light: "today", people: [P("local", SIGN_MAN, expr, 0)],
  subjects: [["the local", head(SIGN_MAN), 0.2], ["the town's sign", SIGN_TOP, 0.3]] });
// ---------------- the room as the shots use it ----------------
const TBL: V3 = Rm(TABLE[0], 0.79, TABLE[2]);
const LAMP_K: V3 = Rm(1.6, 2.4, 0.2), WIN_K: V3 = Rm(4.2, 2.4, -1.4);
const BOARD: V3 = Rm(MAP.x, MAP.y, 3.86);
/** the name on the application: "Tibo" (black) and "Dubois" (red) on the board */
const TIBO: V3 = Rm(-0.14, 1.74, 3.85), DUB: V3 = Rm(-0.14, 1.42, 3.85);
const CLERK: V3 = Rm(1.45, 0, 2.6), FRED: V3 = Rm(-0.4, 0, 1.2), CAREY: V3 = Rm(0.45, 0, 1.25);
// ---------------- the mission ----------------
const Ms = Wd;
const ROB: V3 = Ms(0.25, 0, CHAPEL_Z - 2.4), SH1: V3 = Ms(1.0, 0, CHAPEL_Z - 1.7), SH2: V3 = Ms(-0.6, 0, CHAPEL_Z - 1.5), SHK: V3 = Ms(-0.75, 0, CHAPEL_Z - 2.9);

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // This town says its own name wrong...: a local under the town's sign today, grinning (frame 0 already close)
  hook: (s, f) => ({ ...hookState(), light: "today", dof: 0.8, closeup: true, focus: head(SIGN_MAN), cam: hookCam(f) }) as St3,
  // ...on purpose: snap in on his grin, a wink
  purpose: (s, f) => ({ ...hookState("grin"), light: "today", dof: 1, closeup: true, focus: head(SIGN_MAN), people: [P("local", SIGN_MAN, "grin", 0, { headTilt: 0.12 })],
    cam: kick(snap(add(SIGN_MAN, -2.0, 1.3, -1.1), head(SIGN_MAN, 1.25), f, s.a, { fov: 46, roll: -0.05 }, 1.6, 6), f, W(0, "purpose"), 0.9),
    subjects: [["the local", head(SIGN_MAN), 0.2]] }) as St3,
  // You see, in 1889, a few ranchers on Horse Creek, Wyoming: crane up over the creek, the cabins, the badlands and peaks
  valley: (s, f) => ({ light: "valley", dof: 0, focus: Rv(-10, 2, 10), posign: false,
    people: [P("smith", PO(1.0), "neutral", 1, { extra: true }), P("r1", PO(-0.4), "neutral", -1, { extra: true })],
    cam: mv(s, f, { pos: Rv(14, 1.8, -9), look: Rv(-6, 2.0, 14), fov: 56, roll: 0.04 }, { pos: Rv(12, 7.5, -12), look: Rv(-8, 1.0, 16), fov: 58, roll: -0.03 }),
    subjects: [["the cabins", Rv(-6.5, 1.5, BLD_Z + 2), 1]] }),
  // ...a few ranchers: three homesteaders in front of Charles Smith's cabin, talking
  ranchers: (s, f) => { const a = PO(1.2, 3.9), b = PO(0.0, 3.6), c = PO(-1.2, 4.0);
    return { light: "valley", dof: 0.8, focus: head(b), posign: false, people: [P("smith", a, "grin", -1), P("r1", b, "neutral", 0), P("r2", c, "grin", 1)],
      cam: orbit(s, f, add(b, 0, 1.3, 0.2), [-14, 4], [6.8, 6.4], [0.2, 0.1], 50),
      subjects: [["the ranchers", head(b), 0.4]] }; },
  // ...wanted a post office: Smith points at his own cabin door (no sign yet)
  wanted: (s, f) => { const p = PO(1.6, 3.2), hand = add(p, -0.55, 1.45, 0.2);
    return { light: "valley", dof: 0.8, focus: head(p), posign: false, people: [P("smith", p, "grin", -1, { hw: [hand] }), P("r2", PO(-0.1, 3.95), "neutral", 1)],
      cam: kick(mv(s, f, { pos: add(p, 0.9, 1.2, -4.2), look: add(p, -1.1, 1.7, 1.4), fov: 52, roll: 0.05 }, { pos: add(p, 0.7, 1.25, -3.7), look: add(p, -1.2, 1.75, 1.5), fov: 52, roll: -0.03 }), f, W(1, "post"), 0.6),
      subjects: [["Smith", head(p), 0.2], ["his cabin", Rv(POST.x - 0.7, 1.2, BLD_Z - 0.05), 0.4]] }; },
  // The nearest one was 65 miles away: down the empty track toward the horizon, sagebrush and mountains
  miles: (s, f) => ({ light: "valley", dof: 0, focus: Rv(60, 1, 0), posign: false,
    cam: mv(s, f, { pos: Rv(4, 1.3, -1.0), look: Rv(60, 1.6, 4), fov: 50, roll: -0.03 }, { pos: Rv(8, 1.6, -1.2), look: Rv(64, 1.9, 4), fov: 46, roll: 0.03 }),
    subjects: [["the empty track", Rv(40, 0.5, 0), 3]] }),
  // ...and the mail came in on horseback: the rider walks his horse in along the track, the mail sack on his shoulder
  mail: (s, f) => { const tt = t(f - s.a), x = 9 - 1.8 * tt, h = horse(0, Rv(x, 0, 0)[0], 0, 0.2, -1.8, "walk", "rider", "neutral");
    return { light: "valley", dof: 0.6, focus: Rv(x, 1.9, 0.2), posign: false, horses: [h],
      cards: [{ kind: "sack", p: Rv(x + 0.5, 1.3, -0.25), spin: 0.1, s: 0.9 }],
      cam: mv(s, f, { pos: Rv(9.5, 1.7, -5.4), look: Rv(8.6, 1.9, 0.2), fov: 50, roll: 0.04 }, { pos: Rv(9 - 1.8 * t(s.b - s.a) + 0.3, 1.7, -5.2), look: Rv(9 - 1.8 * t(s.b - s.a) - 0.3, 1.9, 0.2), fov: 50, roll: -0.03 }),
      subjects: [["the rider", Rv(x, 2.2, 0.2), 0.4]] }; },
  // So they sent Washington the name they'd picked: in Smith's cabin, Simpson writes it on the form, Smith watching
  write: (s, f) => { const a = Rm(TABLE[0] - 0.25, 0, TABLE[2] - 0.8), b = Rm(TABLE[0] + 0.65, 0, TABLE[2] - 0.45), hand = add(TBL, -0.2, 0.04, -0.3);
    return { light: "cabin", dof: 1, focus: L3(head(a), head(b), 0.5), key: LAMP_K, people: [P("simpson", a, "neutral", 0, { hw: [hand], headTilt: 0.18 }), P("smith", b, "grin", 1)],
      cards: [{ kind: "paper", p: add(TBL, -0.12, 0.012, -0.12), spin: 0.2, s: 1.4, flat: true }],
      cam: mv(s, f, { pos: Rm(TABLE[0] + 0.25, 2.3, TABLE[2] - 3.6), look: add(TBL, 0.15, 0.55, -0.2), fov: 56, roll: 0.05 }, { pos: Rm(TABLE[0] + 0.2, 2.35, TABLE[2] - 3.3), look: add(TBL, 0.15, 0.5, -0.2), fov: 56, roll: -0.03 }),
      subjects: [["Simpson", head(a), 0.2], ["the form", add(TBL, -0.12, 0.02, -0.12), 0.08]] }; },
  // ...Tibo: Washington; the application on the office's wall board, the name in black ink
  tibo: (s, f) => ({ light: "capitol", dof: 0.6, focus: TIBO, key: WIN_K, page: "app",
    cam: kick(snap(Rm(-0.1, 1.72, 1.05), TIBO, f, s.a, { fov: 44, roll: 0.04 }, 1.7, 6), f, W(2, "tibo"), 0.8),
    subjects: [["the name Tibo", TIBO, 0.1]] }),
  // It's a Shoshone word for stranger: the mission, Father Roberts with Shoshone friends before the chapel, laughing
  mission: (s, f) => ({ light: "mission", dof: 0.4, focus: head(ROB), people: [P("roberts", ROB, "grin", 1), P("sh1", SH1, "laugh", -1), P("sh2", SH2, "grin", -1), P("shkid", SHK, "grin", 1)],
    cam: mv(s, f, { pos: Ms(0.2, 1.3, CHAPEL_Z - 8.0), look: Ms(0.1, 1.6, CHAPEL_Z - 2.0), fov: 54, roll: 0.04 }, { pos: Ms(0.1, 2.4, CHAPEL_Z - 8.6), look: Ms(0.0, 2.6, CHAPEL_Z - 1.0), fov: 56, roll: -0.03 }),
    subjects: [["Father Roberts", head(ROB), 0.2], ["the chapel", Ms(0, 3, CHAPEL_Z - 0.4), 1]] }),
  // The Shoshone used it as a fond nickname: Roberts and a Shoshone friend sharing a joke, close two-shot
  nick: (s, f) => { const a = add(ROB, 0, 0, 0.3), b = add(SH1, 0.25, 0, 0.3);
    return { light: "mission", dof: 1, focus: L3(head(a), head(b), 0.5), people: [P("roberts", a, "laugh", 1, { facing: 1 }), P("sh1", b, "laugh", -1, { facing: -1, wave: 0.6 })],
      cam: mv(s, f, { pos: add(L3(a, b, 0.5), 0.2, 1.35, -4.2), look: add(L3(a, b, 0.5), 0, 1.25, 0), fov: 48, roll: -0.05 }, { pos: add(L3(a, b, 0.5), -0.1, 1.35, -3.9), look: add(L3(a, b, 0.5), 0, 1.25, 0), fov: 48, roll: 0.04 }),
      subjects: [["Roberts", head(a), 0.2], ["his friend", head(b), 0.2]] }; },
  // ...a Welsh priest named John Roberts: snap to Roberts, close
  roberts: (s, f) => ({ light: "mission", dof: 1, closeup: true, focus: head(ROB), people: [P("roberts", ROB, "grin", 0, { headTilt: 0.06 })],
    cam: kick(snap(add(ROB, 0.2, 1.25, -2.1), head(ROB, 1.22), f, s.a, { fov: 44, roll: 0.05 }, 1.6, 6), f, W(3, "roberts"), 0.6),
    subjects: [["Roberts", head(ROB), 0.2]] }),
  // But the application came back... changed: the clerk at the board in Washington, pen raised
  clerk: (s, f) => { const hand = add(CLERK, -0.4, 1.55, 0.3);
    return { light: "capitol", dof: 0.6, focus: head(CLERK), key: WIN_K, page: "app", people: [P("clerk", CLERK, "neutral", -1, { hw: [hand] })],
      cam: mv(s, f, { pos: Rm(0.85, 1.55, -1.2), look: Rm(0.95, 1.7, 3.6), fov: 50, roll: -0.04 }, { pos: Rm(0.85, 1.6, -0.6), look: Rm(0.9, 1.7, 3.6), fov: 50, roll: 0.03 }),
      subjects: [["the clerk", head(CLERK), 0.2], ["the application", BOARD, 0.3]] }; },
  // ...in red ink: the page now, Tibo struck through, Dubois written over it in red
  red: (s, f) => ({ light: "capitol", dof: 0.6, focus: L3(TIBO, DUB, 0.5), key: WIN_K, page: "red",
    cam: kick(snap(Rm(-0.1, 1.6, 1.1), L3(TIBO, DUB, 0.45), f, s.a, { fov: 46, roll: -0.05 }, 1.6, 6), f, W(4, "red"), 1.0),
    subjects: [["the red ink", DUB, 0.1]] }),
  // Their town would be called Dubois: back on Horse Creek, the settlers read the letter, shocked
  letter: (s, f) => { const a = PO(0.3, 3.8), hand = add(a, -0.28, 1.3, -0.32);
    return { light: "valley", dof: 1, focus: head(a), people: [P("smith", a, "shock", 0, { hw: [hand] }), P("r1", PO(-0.25, 4.7), "shock", 1), P("r2", PO(1.0, 4.5), "nervous", -1)],
      cards: [{ kind: "paper", p: add(hand, -0.02, 0.12, -0.03), spin: 0.15, s: 1.2 }],
      cam: kick(mv(s, f, { pos: add(a, 0.2, 1.4, -3.4), look: add(a, 0.2, 1.3, 0.4), fov: 50, roll: 0.05 }, { pos: add(a, 0.15, 1.4, -3.0), look: add(a, 0.2, 1.3, 0.4), fov: 50, roll: -0.04 }), f, W(4, "dubois"), 0.8),
      subjects: [["Smith", head(a), 0.2], ["the letter", add(hand, -0.02, 0.12, -0.03), 0.05]] }; },
  // Named after Fred Dubois: the man himself in Washington, chin up
  fred: (s, f) => ({ light: "capitol", dof: 1, closeup: true, focus: head(FRED), key: WIN_K, people: [P("dubois", FRED, "grin", 0, { headTilt: -0.1 })],
    cam: snap(add(FRED, 0.25, 1.3, 1.5), head(FRED, 1.22), f, s.a, { fov: 60, roll: -0.05 }, 1.25, 6),
    subjects: [["Fred Dubois", head(FRED), 0.2]] }),
  // He was Idaho's man in Congress: orbit him among the desks
  congress: (s, f) => ({ light: "capitol", dof: 0.6, focus: head(FRED), key: WIN_K, page: "map", people: [P("dubois", FRED, "grin", 0)],
    cam: orbit(s, f, add(FRED, 0, 1.35, 0.4), [-22, 6], [3.6, 3.3], [0.25, 0.15], 52),
    subjects: [["Fred Dubois", head(FRED), 0.2]] }),
  // Not Wyoming's. Idaho's.: the map on the board, Idaho beside Wyoming, Horse Creek marked
  map: (s, f) => ({ light: "capitol", dof: 0, focus: BOARD, key: WIN_K, page: "map",
    cam: kick(mv(s, f, { pos: Rm(0.0, 2.0, 0.2), look: BOARD, fov: 50, roll: 0.04 }, { pos: Rm(0.0, 2.0, 0.7), look: BOARD, fov: 50, roll: -0.03 }), f, W(5, "not"), 0.7),
    subjects: [["the map", BOARD, 0.3]] }),
  // He'd barely spent any time in Wyoming: Dubois shrugs
  barely: (s, f) => ({ light: "capitol", dof: 1, closeup: true, focus: head(FRED), key: WIN_K, people: [P("dubois", FRED, "whistle", 1, { wave: 0.5, headTilt: 0.1 })],
    cam: mv(s, f, { pos: add(FRED, -0.3, 1.3, 1.5), look: head(FRED, 1.22), fov: 60, roll: 0.05 }, { pos: add(FRED, -0.2, 1.3, 1.45), look: head(FRED, 1.22), fov: 60, roll: -0.04 }),
    subjects: [["Fred Dubois", head(FRED), 0.2]] }),
  // Who swapped the names? Nobody agrees.: the settlers before the new post office, scratching their heads
  who: (s, f) => { const a = PO(0.9, 3.7), b = PO(-0.3, 3.5), c = PO(-1.5, 3.9);
    return { light: "valley", dof: 0.6, focus: head(b), people: [P("smith", a, "nervous", -1, { headTilt: 0.15 }), P("r1", b, "nervous", 0, { headTilt: -0.12 }), P("r3", add(c, 0.4, 0, 0.4), "nervous", 1)],
      cam: kick(mv(s, f, { pos: add(b, 0.2, 1.7, -5.4), look: add(b, 0.1, 1.8, 1.0), fov: 54, roll: -0.04 }, { pos: add(b, 0.15, 1.6, -4.8), look: add(b, 0.1, 1.8, 1.0), fov: 54, roll: 0.03 }), f, W(6, "nobody"), 0.8),
      subjects: [["the settlers", head(b), 0.4], ["the post office sign", POSIGN, 0.3]] }; },
  // Some say his friend, Wyoming's man in Congress, picked it: Carey and Dubois shake hands
  friend: (s, f) => { const hm = add(L3(FRED, CAREY, 0.5), 0, 1.05, -0.22);
    return { light: "capitol", dof: 1, focus: L3(head(FRED), head(CAREY), 0.5), key: WIN_K, page: "map", people: [P("dubois", FRED, "grin", 1, { facing: 1, hw: [hm] }), P("carey", CAREY, "grin", -1, { facing: -1, hw: [hm] })],
      cam: mv(s, f, { pos: add(L3(FRED, CAREY, 0.5), 0.3, 1.35, -3.6), look: add(L3(FRED, CAREY, 0.5), 0, 1.2, 0), fov: 46, roll: 0.05 }, { pos: add(L3(FRED, CAREY, 0.5), -0.1, 1.35, -3.2), look: add(L3(FRED, CAREY, 0.5), 0, 1.2, 0), fov: 46, roll: -0.04 }),
      subjects: [["Dubois", head(FRED), 0.2], ["Joseph Carey", head(CAREY), 0.2]] }; },
  // Some say Dubois wrote down his own name himself: Dubois at the board with the pen, the red Dubois on the form
  himself: (s, f) => { const p = Rm(-1.15, 0, 2.6), hand = add(DUB, 0.45, 0, -0.15);
    return { light: "capitol", dof: 0.7, focus: L3(head(p), DUB, 0.5), key: WIN_K, page: "red", people: [P("dubois", p, "grin", -1, { hw: [hand] })],
      cam: kick(mv(s, f, { pos: Rm(-0.6, 1.55, -0.8), look: Rm(-0.65, 1.6, 3.6), fov: 54, roll: 0.05 }, { pos: Rm(-0.6, 1.55, -0.3), look: Rm(-0.65, 1.6, 3.6), fov: 54, roll: -0.04 }), f, W(6, "himself"), 0.8),
      subjects: [["Dubois", head(p), 0.2], ["his name", DUB, 0.1]] }; },
  // And here's the twist. Dubois said his name the French way: close, prim, lips pursed
  twist: (s, f) => ({ light: "capitol", dof: 1, closeup: true, focus: head(FRED), key: WIN_K, people: [P("dubois", FRED, "whistle", 0, { headTilt: -0.12 })],
    cam: kick(snap(add(FRED, -0.2, 1.3, 1.5), head(FRED, 1.22), f, s.a, { fov: 58, roll: 0.06 }, 1.25, 6), f, W(7, "french"), 0.6),
    subjects: [["Fred Dubois", head(FRED), 0.2]] }),
  // doo-BWAH: very close, prim, from the other side
  bwah: (s, f) => ({ light: "capitol", dof: 1, closeup: true, focus: head(FRED), key: WIN_K, people: [P("dubois", FRED, "whistle", 0, { headTilt: 0.1 })],
    cam: kick(snap(add(FRED, 0.45, 1.3, 1.4), head(FRED, 1.24), f, s.a, { fov: 52, roll: -0.07 }, 1.3, 5), f, W(7, "doobwah"), 0.7),
    subjects: [["Fred Dubois", head(FRED), 0.2]] }),
  // ...he reportedly hated it when people said "boys": his face drops
  boys: (s, f) => ({ light: "capitol", dof: 1, closeup: true, focus: head(FRED), key: WIN_K, people: [P("dubois", FRED, "stern", 0, { headTilt: 0.08 })],
    cam: kick(mv(s, f, { pos: add(FRED, 0.25, 1.3, 1.5), look: head(FRED, 1.22), fov: 56, roll: -0.06 }, { pos: add(FRED, 0.2, 1.3, 1.4), look: head(FRED, 1.22), fov: 56, roll: 0.05 }), f, W(7, "boys"), 1.0),
    subjects: [["Fred Dubois", head(FRED), 0.2]] }),
  // So, the story goes, the town said "boys": the settlers in front of the post office, grinning
  town: (s, f) => { const a = PO(1.2, 3.8), b = PO(0.0, 3.5), c = PO(-1.2, 3.9), k = PO(0.6, 2.8);
    return { light: "valley", dof: 0.6, focus: head(b), people: [P("smith", a, "grin", -1), P("r1", b, "grin", 0), P("wife1", c, "grin", 1), P("kid", k, "grin", 0)],
      cam: mv(s, f, { pos: add(b, 0.0, 1.0, -5.6), look: add(b, 0, 1.9, 1.0), fov: 54, roll: 0.04 }, { pos: add(b, 0.0, 1.1, -5.0), look: add(b, 0, 1.9, 1.0), fov: 54, roll: -0.03 }),
      subjects: [["the settlers", head(b), 0.4], ["the post office sign", POSIGN, 0.3]] }; },
  // DOO-boys.: they shout it, the kid loudest, at the lens
  shout: (s, f) => { const k = PO(0.4, 2.6), a = PO(1.3, 3.5), b = PO(-0.6, 3.6);
    return { light: "valley", dof: 1, focus: head(k, 1.15), people: [P("kid", k, "laugh", 0, { wave: 1 }), P("smith", add(a, -0.4, 0, 0), "laugh", -1, { wave: 0.8 })],
      cam: kick(snap(add(k, 0.1, 1.1, -2.6), add(k, 0.25, 1.2, 0.5), f, s.a, { fov: 54, roll: 0.06 }, 1.6, 5), f, W(8, "dooboys"), 1.2),
      subjects: [["the kid", head(k, 1.15), 0.15], ["Smith", head(a), 0.2]] }; },
  // On purpose.: Smith, close, a sly grin
  wink: (s, f) => { const a = PO(0.3, 3.6);
    return { light: "valley", dof: 1, closeup: true, focus: head(a), people: [P("smith", a, "grin", 0, { headTilt: 0.14 })],
      cam: kick(snap(add(a, 0.2, 1.25, -2.1), head(a, 1.22), f, s.a, { fov: 44, roll: -0.06 }, 1.6, 6), f, W(8, "purpose"), 0.7),
      subjects: [["Smith", head(a), 0.2]] }; },
  // Every single time.: crane up over the settlement, everyone waving, the creek and the peaks behind
  every: (s, f) => ({ light: "valley", dof: 0, focus: Rv(-12, 1.5, 4),
    people: [P("smith", PO(1.2, 3.8), "laugh", -1, { wave: 1 }), P("r1", PO(0.0, 3.5), "laugh", 0, { wave: 0.8 }), P("wife1", PO(-1.2, 3.9), "grin", 1, { wave: 1 }), P("kid", PO(0.6, 2.8), "laugh", 0, { wave: 1 }), P("r2", PO(-2.0, 4.4), "grin", 1, { wave: 0.6 }), P("r3", PO(2.0, 4.4), "grin", -1, { wave: 0.7 })],
    cam: mv(s, f, { pos: Rv(POST.x + 0.3, 2.0, -5.5), look: Rv(POST.x, 1.6, 4.0), fov: 56, roll: 0.03 }, { pos: Rv(POST.x + 0.2, 7.5, -8.5), look: Rv(POST.x, 0.6, 6.0), fov: 58, roll: -0.03 }),
    subjects: [["the settlers", Rv(POST.x, 1.6, 3.6), 1]] }),
  // More than 130 years later, they still do: today, the sign by the road, two locals beside it
  today: (s, f) => ({ light: "today", dof: 0, focus: SIGN_TOP, people: [P("local", SIGN_MAN, "grin", 1), P("local2", add(SIGN_MAN, -1.3, 0, 0.4), "grin", -1)],
    cam: mv(s, f, { pos: Rv(WSIGN[0] + 3.5, 1.5, WSIGN[2] - 9.5), look: Rv(WSIGN[0] - 0.2, 2.1, WSIGN[2]), fov: 52, roll: 0.03 }, { pos: Rv(WSIGN[0] + 1.5, 2.2, WSIGN[2] - 9.0), look: Rv(WSIGN[0] - 0.3, 2.2, WSIGN[2]), fov: 52, roll: -0.03 }),
    subjects: [["the town's sign", SIGN_TOP, 0.3], ["the locals", head(SIGN_MAN), 0.4]] }),
  // Say doo-BWAH in Dubois today: a visitor reads the sign and says it the French way
  tourist: (s, f) => { const p = add(SIGN_MAN, 1.4, 0, -1.2);
    return { light: "today", dof: 1, focus: head(p), people: [P("tourist", p, "grin", -1, { headTilt: -0.1 })],
      cam: mv(s, f, { pos: add(p, -1.7, 1.3, -2.0), look: head(p, 1.3), fov: 46, roll: -0.05 }, { pos: add(p, -1.55, 1.3, -1.8), look: head(p, 1.3), fov: 46, roll: 0.04 }),
      subjects: [["the visitor", head(p), 0.2]] }; },
  // ...and everybody knows you're not from there: the two locals turn and stare at him
  stare: (s, f) => { const a = SIGN_MAN, b = add(SIGN_MAN, -1.3, 0, 0.4), v = add(SIGN_MAN, 1.4, 0, -1.2);
    return { light: "today", dof: 0.6, focus: L3(head(a), head(b), 0.5), people: [P("local", a, "stern", 1, { facing: 1 }), P("local2", b, "stern", 1, { facing: 1 }), P("tourist", v, "nervous", -1, { facing: -1 })],
      cam: kick(mv(s, f, { pos: Rv(WSIGN[0] + 1.6, 1.6, WSIGN[2] - 9.6), look: Rv(WSIGN[0] + 0.7, 1.7, WSIGN[2] - 1.5), fov: 50, roll: 0.05 }, { pos: Rv(WSIGN[0] + 1.4, 1.6, WSIGN[2] - 8.8), look: Rv(WSIGN[0] + 0.7, 1.7, WSIGN[2] - 1.5), fov: 50, roll: -0.04 }), f, W(9, "not"), 0.8),
      subjects: [["the locals", head(a), 0.2], ["the visitor", head(v), 0.2]] }; },
  // Oh, and that first winter? Butch Cassidy moved in on the same creek: Butch rides along the creek bank with his horses
  butch: (s, f) => { const tt = t(f - s.a), x = -2 + 2.6 * tt;
    return { light: "valley", dof: 0.5, focus: Rv(x, 2, 12.5), horses: [horse(1, Rv(x, 0, 0)[0], riverY(x, 12.5), 12.5, 2.6, "trot", "butch", "grin"), horse(2, Rv(x - 3.2, 0, 0)[0], riverY(x - 3.2, 13.6), 13.6, 2.6, "trot", null), horse(3, Rv(x - 5.8, 0, 0)[0], riverY(x - 5.8, 12.9), 12.9, 2.6, "trot", null)],
      cam: mv(s, f, { pos: Rv(-2.3, 1.5, 7.4), look: Rv(-1.2, 1.9, 12.5), fov: 50, roll: 0.04 }, { pos: Rv(-2 + 2.6 * t(s.b - s.a) - 0.2, 1.5, 7.6), look: Rv(-2 + 2.6 * t(s.b - s.a) - 0.6, 1.9, 12.5), fov: 50, roll: -0.03 }),
      subjects: [["Butch Cassidy", Rv(x, 2.3, 12.5), 0.3]] }; },
  // ...on the same creek: Butch beside his horse by the water, grinning at us
  creek: (s, f) => { const p = Rv(-1.0, riverY(-1.0, 13.6), 13.6);
    return { light: "valley", dof: 1, focus: head(p), people: [P("butch", p, "grin", 0, { headTilt: 0.08 })], horses: [{ k: 1, p: Rv(-2.6, riverY(-2.6, 14.6), 14.6), yaw: Math.PI, gait: "stand", phase: 0, head: 0.3 }],
      cam: kick(snap(add(p, 0.25, 1.25, -2.3), head(p, 1.22), f, s.a, { fov: 46, roll: 0.05 }, 1.6, 6), f, W(10, "creek"), 0.6),
      subjects: [["Butch Cassidy", head(p), 0.2]] }; },
  // So... if a stranger renamed your town: back at the sign today, the local asks us
  stranger: (s, f) => ({ ...hookState("neutral"), light: "today", dof: 0.8, focus: head(SIGN_MAN),
    cam: mv(s, f, { pos: add(HOOK_POS, 0.6, 0.1, -0.4), look: HOOK_LOOK, fov: 56, roll: 0.04 }, { pos: add(HOOK_POS, 0.25, 0.05, -0.1), look: HOOK_LOOK, fov: 56, roll: -0.02 }) }) as St3,
  // ...would you say it his way?: snap close on his raised eyebrow grin
  his: (s, f) => ({ ...hookState("grin"), light: "today", dof: 1, closeup: true, focus: head(SIGN_MAN), people: [P("local", SIGN_MAN, "grin", 0, { headTilt: -0.12 })],
    cam: kick(snap(add(SIGN_MAN, -1.9, 1.3, -1.3), head(SIGN_MAN, 1.25), f, s.a, { fov: 46, roll: 0.05 }, 1.5, 6), f, W(11, "his"), 0.8),
    subjects: [["the local", head(SIGN_MAN), 0.2]] }) as St3,
  // loop: back to the sign, settling onto the opening frame (the subscribe card plays here)
  end: (s, f) => { const h0 = hookCam(0), hold = { pos: add(SIGN_MAN, -2.6, 1.45, -1.6), look: add(SIGN_MAN, 0.15, 1.25, -0.4), fov: 56, roll: 0.02 };
    return { ...hookState(), light: "today", dof: 0.8, closeup: true, focus: head(SIGN_MAN), subjects: [["the local", head(SIGN_MAN), 0.2]],
      cam: f < s.b - 9 ? move({ pos: add(SIGN_MAN, -2.95, 1.6, -1.95), look: add(SIGN_MAN, 0.15, 1.25, -0.4), fov: 56, roll: 0.0 }, hold, f, s.a, s.a + 24, smooth, 0)
        : move(hold, h0, f, s.b - 9, s.b - 3, smooth, 0) } as St3; },
};
/** the house kit, for the long-form */
export { clamp01, smooth, expo, L3, move, orb, orbit, snap, kick, t as secs, P, walker, horse, add, head, hookState, hookCam, PO, POSIGN, SIGN_MAN, SIGN_TOP, HOOK_POS, HOOK_LOOK, TBL, LAMP_K, WIN_K, BOARD, TIBO, DUB, CLERK, FRED, CAREY, ROB, SH1, SH2, SHK, Ms };

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["valley", "write", "tibo", "mission", "clerk", "fred", "who", "twist", "town", "today", "butch", "stranger"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps (Shorts: nothing important above y = 19 %) ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "wrong", kind: "call", text: "SAYS IT WRONG", f0: W(0, "wrong"), f1: B("hook"), y: 24, fg: "#ffd166", size: 104 },
  { key: "purpose", kind: "stamp", text: "ON PURPOSE", f0: W(0, "purpose"), f1: B("purpose"), y: 56, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 130 },
  { key: "hc", kind: "pill", text: "HORSE CREEK, WYOMING", sub: "1889", f0: W(1, "horse"), f1: B("ranchers"), y: 22, size: 64 },
  { key: "po", kind: "call", text: "A POST OFFICE?", f0: W(1, "post"), f1: B("wanted"), y: 24, fg: "#ffd166", size: 104 },
  { key: "65", kind: "stamp", text: "65 MILES AWAY", f0: W(1, "65"), f1: B("miles"), y: 24, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 110 },
  { key: "tibo", kind: "stamp", text: "TIBO", f0: W(2, "tibo"), f1: B("tibo"), y: 26, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 160 },
  { key: "str", kind: "call", text: "TIBO = \"STRANGER\"", f0: W(3, "stranger"), f1: B("mission"), y: 24, fg: "#ffd166", size: 92 },
  { key: "rob", kind: "pill", text: "REV. JOHN ROBERTS", sub: "a priest from Wales", f0: W(3, "john"), f1: B("roberts"), y: 22, size: 70 },
  { key: "red", kind: "stamp", text: "CHANGED", f0: W(4, "changed"), f1: B("clerk"), y: 24, rot: 4, bg: "#e0332e", fg: "#ffffff", size: 130 },
  { key: "fred", kind: "pill", text: "FRED DUBOIS", sub: "Idaho's man in Congress", f0: W(5, "fred"), f1: B("congress"), y: 22, size: 84 },
  { key: "notwy", kind: "stamp", text: "NOT WYOMING", f0: W(5, "not"), f1: B("map"), y: 24, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 120 },
  { key: "nobody", kind: "stamp", text: "NOBODY AGREES", f0: W(6, "nobody"), f1: B("who"), y: 24, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 110 },
  { key: "carey", kind: "pill", text: "JOSEPH CAREY", sub: "Wyoming's man in Congress", f0: W(6, "friend"), f1: B("friend"), y: 22, size: 84 },
  { key: "bwah", kind: "call", text: "\"doo-BWAH\"", f0: W(7, "doobwah"), f1: B("bwah"), y: 24, fg: "#ffd166", size: 130 },
  { key: "boys", kind: "call", text: "\"BOYS\"?!", f0: W(7, "boys"), f1: B("boys"), y: 24, fg: "#ff6a5a", size: 150 },
  { key: "dooboys", kind: "stamp", text: "DOO-BOYS!", f0: W(8, "dooboys"), f1: B("shout"), y: 24, rot: -4, bg: "#e0a32e", fg: "#1e1a22", size: 150 },
  { key: "today", kind: "pill", text: "DUBOIS TODAY", sub: "130+ years later", f0: S0("today") + 2, f1: B("today"), y: 22, size: 84 },
  { key: "fr", kind: "call", text: "\"doo-BWAH?\"", f0: W(9, "doobwah"), f1: B("tourist"), y: 24, fg: "#ffd166", size: 130 },
  { key: "tour", kind: "stamp", text: "NOT FROM HERE", f0: W(9, "not"), f1: B("stare"), y: 24, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 110 },
  { key: "butch", kind: "pill", text: "BUTCH CASSIDY", sub: "Horse Creek, 1889", f0: W(10, "butch"), f1: B("butch"), y: 22, size: 84 },
  { key: "q", kind: "call", text: "WHOSE WAY?", f0: W(11, "his"), f1: B("his"), y: 52, fg: "#ffd166", size: 120 },
] as Item[]).filter((i) => i.f1 > i.f0);
void STORE;
