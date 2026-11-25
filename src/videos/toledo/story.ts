// The Toledo War Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen LEFT), unless a shot turns round.
// Nobody is shown hurt: the shots at Phillips Corners go over the surveyors' heads, and the penknife is a raised hand,
// then Wood holding his side (no wound, no blood).
import { Expr } from "../bridge/toon";
import { V3, FPS, Rv, Wd, Rm, Nt, TAVERN, WHARF, SHIP, COMPASS, LINE_Z, TABLE, MAP, BAR, STOVE, OUTCROP, PORTAL, BLD_Z as BLD, northY } from "./place";
import { SEG_TIMES, TOTAL, VOICE_END, wordAt } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["knife", W(0, "only") - 2],
  ["strip", A(1)], ["toledo", W(1, "with") - 2], ["port", W(1, "everyone") - 2],
  ["mason", A(2)], ["boy", W(2, "its") - 2], ["mimarch", W(2, "called") - 2], ["lucas", W(2, "ohios") - 2],
  ["survey", A(3)], ["ambush", W(3, "michigan") - 2], ["fire", W(3, "fired") - 2], ["duck", W(3, "over") - 2], ["nobody", W(3, "nobody") - 2],
  ["wood", A(4)], ["tavern", W(4, "arrest") - 2], ["yes", W(4, "yes") - 2], ["one", W(4, "his") - 2],
  ["stab", A(5)], ["lived", W(5, "wood") - 2], ["only", W(5, "that") - 2],
  ["congress", A(6)], ["deal", W(6, "give") - 2], ["up", W(6, "well") - 2],
  ["furious", A(7)], ["snow", W(7, "up") - 2], ["no", W(7, "they") - 2],
  ["broke", A(8)], ["frost", W(8, "december") - 2], ["yes2", W(8, "said") - 2],
  ["copper", A(9)], ["mine", W(9, "for") - 2],
  ["ohio", A(10)], ["rich", W(10, "michigan") - 2], ["end", VOICE_END],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  march?: number; hw?: V3[]; s?: number; tilt?: number;
  /** in the air: no contact shadow */
  air?: boolean;
  /** walking in profile: step phase 0..1; mirror = moving toward -x; carry = a point both hands hold out to */
  side?: { phase: number; mirror: boolean; stride?: number; carry?: V3 } };
/** musket: g = the butt at the shoulder, b = the muzzle; knife and pick: g = the hand, b = the way the blade points */
export type Tool = { kind: "musket" | "knife" | "pick"; g: V3; b: V3 };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "spark" | "flake" | "nugget";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type St3 = {
  light: "river" | "woods" | "tavern" | "congress" | "conv" | "northW" | "northS"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  tools?: Tool[]; cards?: Card[]; puffs?: Puff[];
  /** Congress: which map is on the wall */
  map?: "strip" | "up";
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
const carrying = (w: Person3, at: V3): Person3 => ({ ...w, side: { ...w.side!, carry: at } });

// ---------------- smoke, snow, copper ----------------
const SMOKE: [number, number, number] = [0.86, 0.86, 0.88];
/** musket smoke: a burst from the muzzle that rolls forward and spreads */
const shot = (m: V3, dir: V3, tt: number, n = 6): Puff[] => tt < 0 ? [] : Array.from({ length: n }, (_, i) => { const u = Math.min(1, tt * 0.9 + i * 0.06), k = 1 - Math.exp(-3 * u);
  return { p: add(m, dir[0] * (0.3 + 1.6 * k) + 0.25 * Math.sin(i * 2.1) * u, 0.1 * i * u + 0.15 * u, dir[2] * (0.3 + 1.6 * k) + 0.25 * Math.cos(i * 1.7) * u), s: 0.25 + 1.1 * k, c: SMOKE, a: 0.85 * (1 - u * 0.75) }; });
/** a flash at the muzzle for 3 frames */
const flash = (m: V3, f: number, f0: number): Puff[] => f >= f0 && f < f0 + 3 ? [{ p: m, s: 0.5, c: [1.0, 0.75, 0.3], a: 0.9, add: true }] : [];
const snowfall = (c: V3, tt: number, n: number, w = 7, h = 5): Card[] => Array.from({ length: n }, (_, i) => { const u = (tt * 0.18 + ((i * 0.618) % 1)) % 1;
  return { kind: "flake" as const, p: add(c, w * (((i * 0.377) % 1) - 0.5) + 0.3 * Math.sin(tt + i), h * (1 - u) - 0.5, ((i * 0.733) % 1) * 4 - 2), spin: i + tt, s: 0.7 + 0.5 * ((i * 0.31) % 1) }; });
const ng = (x: number, z: number, y = 0): V3 => { const p = Nt(x, 0, z); return [p[0], northY(x, z) + y, z]; };

// ---------------- the river town as the shots use it ----------------
const BW = 0.22; // the board walk
const WALK_Z = 4.4;
/** the two militias facing off: two files across the street, Michigan at screen left, Ohio at screen right, receding */
const MI_LINE = ["mi1", "mi2", "mi3", "mi4"].map((w, i): [string, V3] => [w, Rv(0.8 + 0.08 * (i % 2), 0, 0.2 + i * 1.7)]);
const OH_LINE = ["oh1", "oh2", "oh3", "oh4"].map((w, i): [string, V3] => [w, Rv(-0.8 - 0.08 * (i % 2), 0, 1.0 + i * 1.7)]);
const faceoff = (exM: Expr, exO: Expr): Person3[] => [...MI_LINE.map(([w, p], i) => P(w, p, i === 1 ? "grin" : exM, 1, { facing: 1 })), ...OH_LINE.map(([w, p], i) => P(w, p, i === 2 ? "grin" : exO, -1, { facing: -1 }))];
const HOOK_POS: V3 = Rv(0.15, 1.5, -4.6), HOOK_LOOK: V3 = Rv(0, 1.25, 3.0), HOOK = { fov: 50, roll: 0.03 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.06), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const hookState = (): Partial<St3> => ({ light: "river", people: faceoff("stern", "stern") });
const TAV: V3 = Rv(TAVERN.x, 0, TAVERN.z);
// ---------------- the room as the shots use it ----------------
const TWO_P: V3 = Rm(TABLE[0] + 0.25, 0, TABLE[2] + 0.95), ONE_P: V3 = Rm(TABLE[0] - 0.6, 0, TABLE[2] + 1.1), WOOD_IN: V3 = Rm(0.45, 0, -0.6), BARMAN: V3 = Rm(0.1, 0, BAR.z + 0.62);
/** for the stab Two is up and round the table's side, Wood facing him */
const TWO_UP: V3 = Rm(1.3, 0, 1.0), WOOD_AT: V3 = Rm(0.6, 0, 0.75);
const MAPC: V3 = Rm(MAP.x, MAP.y, 3.86), CG2: V3 = Rm(0.95, 0.35, 3.05);
/** the four delegates at the convention: two rows in front of the table */
const DELS: V3[] = [Rm(1.2, 0, 1.0), Rm(0.1, 0, 1.0), Rm(1.75, 0, 2.0), Rm(-0.5, 0, 2.0)];
const LAMP_T: V3 = Rm(-0.2, 2.4, 0.4), LAMP_C: V3 = Rm(STOVE[0], 1.2, STOVE[2] - 0.6), WIN_C: V3 = Rm(4.4, 2.2, -1.4);
// ---------------- the woods ----------------
const CMP: V3 = Wd(COMPASS[0], 1.3, COMPASS[2]);
const SV: [string, V3][] = [["sv1", Wd(COMPASS[0] - 0.45, 0, COMPASS[2] + 0.15)], ["sv2", Wd(-1.2, 0, LINE_Z + 1.6)], ["sv3", Wd(-3.4, 0, LINE_Z + 3.0)]];
const MF: [string, V3][] = [["mf1", Wd(10.5, 0, 9.6)], ["mf2", Wd(12.2, 0, 10.8)], ["mf3", Wd(13.6, 0, 9.2)]];
/** a Michigan man aiming: butt at his shoulder, muzzle 1.3 m toward `at`, raised by `up` */
const aim = (p: V3, at: V3, up: number) => { const dx = at[0] - p[0], dz = at[2] - p[2], l = Math.hypot(dx, dz), d: V3 = [dx / l, 0, dz / l];
  const g: V3 = add(p, d[0] * 0.22, 1.36, d[2] * 0.22), b: V3 = add(g, d[0] * 1.25, up, d[2] * 1.25);
  return { d, g, b, hands: [L3(g, b, 0.12), L3(g, b, 0.48)] as V3[] }; };
// ---------------- the north ----------------
const ORE: V3 = ng(OUTCROP[0], OUTCROP[2] - 1.1, 0.7);
const CART: V3 = ng(PORTAL[0], PORTAL[2] - 3.6, 0.9);

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // Ohio and Michigan once went to war: the two militias face to face across Toledo's street (frame 0 is already close)
  hook: (s, f) => ({ ...hookState(), light: "river", dof: 1, focus: Rv(0, 1.3, 2.0), cam: kick(hookCam(f), f, W(0, "war"), 0.7),
    subjects: [["the Michigan militia", add(MI_LINE[0][1], 0, 1.4, 0), 0.2], ["the Ohio militia", add(OH_LINE[0][1], 0, 1.4, 0), 0.2]] }),
  // ...and the only wound came from a penknife: in the tavern, Two Stickney holds it up, grinning
  knife: (s, f) => { const hand: V3 = add(TWO_P, -0.22, 1.28, -0.38), tip: V3 = add(hand, 0.03, 0.2, -0.02);
    return { light: "tavern", dof: 1, closeup: true, focus: add(hand, 0, 0.1, 0), key: LAMP_T, tools: [{ kind: "knife", g: hand, b: tip }],
      people: [P("two", TWO_P, "grin", -1, { hw: [hand] })],
      cam: kick(snap(add(TWO_P, -0.3, 1.45, -1.75), add(TWO_P, -0.12, 1.42, 0), f, s.a, { fov: 42, roll: -0.05 }, 1.6, 6), f, W(0, "penknife"), 0.8),
      subjects: [["the penknife", add(hand, 0.01, 0.12, 0), 0.04], ["Two Stickney", add(TWO_P, 0, 1.5, 0), 0.2]] }; },
  // You see, in 1835, both of them claimed the same strip of land: the map, Michigan's line and Ohio's line
  strip: (s, f) => ({ light: "congress", map: "strip", dof: 1, focus: add(MAPC, -0.4, -0.1, 0), key: WIN_C,
    cam: move({ pos: Rm(0.2, 1.8, -2.4), look: add(MAPC, -0.4, -0.1, 0), fov: 46, roll: -0.04 }, { pos: Rm(-0.3, 1.9, 0.9), look: add(MAPC, -0.45, -0.15, 0), fov: 44, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the Toledo Strip on the map", add(MAPC, -0.45, -0.15, 0), 0.3]] }),
  // ...with the town of Toledo on it: up over the river town, the street, the buildings, the Maumee
  toledo: (s, f) => { const tt = t(f - s.a);
    return { light: "river", dof: 0, focus: Rv(-14, 2, 4),
      people: [walker("t1", -9, BW, WALK_Z, -0.9, tt + 1), walker("t2", -16, 0, 1.0, 1.1, tt), P("t3", Rv(-21.5, BW, WALK_Z), "grin", 1, { extra: true }), P("t4", Rv(-22.4, BW, WALK_Z + 0.3), "smile", -1, { extra: true })],
      cam: move({ pos: Rv(6.0, 4.5, -2.0), look: Rv(-16, 1.2, 4.0), fov: 52, roll: 0.04 }, { pos: Rv(6.5, 7.0, -2.6), look: Rv(-16, 0.6, 4.0), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the town", Rv(-13, 3, BLD + 1), 2]] }; },
  // Everyone thought Toledo would be the next great port: the wharf, a schooner tied up, crates going ashore
  port: (s, f) => ({ light: "river", dof: 1, focus: Rv(14, 1.5, 22),
    people: [P("t2", Rv(11.4, WHARF.y, 19.5), "grin", 1), P("t3", Rv(10.6, WHARF.y, 22.5), "smile", -1, { wave: 0.5 })],
    cam: move({ pos: Rv(9.0, 3.0, 6.0), look: Rv(14, 1.2, 25), fov: 50, roll: 0.05 }, { pos: Rv(9.6, 3.6, 7.0), look: Rv(15, 1.6, 26), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the schooner", Rv(SHIP[0] - 4, 2, SHIP[2]), 1], ["the wharf", Rv(11, WHARF.y, 18), 1]] }),
  // Michigan wasn't even a state yet: its governor on the board walk outside the tavern
  mason: (s, f) => { const p = Rv(TAVERN.x + 2.2, BW, WALK_Z - 0.2);
    return { light: "river", dof: 1, focus: add(p, 0, 1.4, 0), people: [P("mason", p, "stern", -1), P("t1", Rv(TAVERN.x - 1.2, BW, WALK_Z + 0.2), "neutral", 1)],
      cam: move({ pos: Rv(TAVERN.x + 4.6, 1.6, 0.0), look: add(p, -0.4, 1.4, 0), fov: 44, roll: -0.05 }, { pos: Rv(TAVERN.x + 4.0, 1.55, 0.6), look: add(p, -0.5, 1.4, 0), fov: 42, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["Mason", add(p, 0, 1.4, 0), 0.2]] }; },
  // Its governor was 23: close on young Mason, grinning
  boy: (s, f) => { const p = Rv(TAVERN.x + 2.2, BW, WALK_Z - 0.2);
    return { light: "river", dof: 1, closeup: true, focus: add(p, 0, 1.6, 0), people: [P("mason", p, f >= W(2, "23") ? "grin" : "smile", -1)],
      cam: kick(snap(add(p, 0.75, 1.62, -1.9), add(p, 0.05, 1.58, 0), f, s.a, { fov: 40, roll: 0.04 }, 1.7, 6), f, W(2, "23"), 0.8),
      subjects: [["Mason", add(p, 0, 1.6, 0), 0.2]] }; },
  // ...and he called out the militia: Michigan's men march down the street, past the camera
  mimarch: (s, f) => { const tt = t(f - s.a), ph = (tt * 1.1 / 1.6) % 1;
    const row = (w: string, x: number, z0: number, k: number) => P(w, Rv(x, 0, z0 - 1.1 * tt), k ? "stern" : "grin", 0, { march: (ph + 0.5 * k) % 1 });
    return { light: "river", dof: 1, focus: Rv(0, 1.3, 3.6 - 1.1 * tt),
      people: [row("mi1", 0.45, 4.2, 0), row("mi2", -0.45, 4.2, 1), row("mi3", 0.45, 5.8, 1), row("mi4", -0.45, 5.8, 0)],
      cam: move({ pos: Rv(0.3, 0.9, -3.6), look: Rv(0, 1.35, 4), fov: 50, roll: 0.06 }, { pos: Rv(-0.2, 0.95, -3.9), look: Rv(0, 1.4, 3), fov: 50, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the militia", Rv(0, 1.3, 3.8 - 1.1 * tt), 0.3]] }; },
  // Ohio's governor called out his: Lucas on the board walk, Ohio's men lined up in the street before him
  lucas: (s, f) => { const p = Rv(-21, BW, WALK_Z - 0.3);
    return { light: "river", dof: 1, focus: add(p, 0, 1.4, 0),
      people: [P("lucas", p, "stern", 0, { wave: 0.8 }), P("oh1", Rv(-20.35, 0, 1.6), "stern", -1, { facing: -1 }), P("oh2", Rv(-21.65, 0, 1.8), "grin", 1, { facing: 1 })],
      cam: move({ pos: Rv(-20.7, 1.5, -2.9), look: Rv(-21, 1.45, 3.4), fov: 48, roll: 0.05 }, { pos: Rv(-21.1, 1.55, -2.4), look: Rv(-21, 1.5, 3.4), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["Lucas", add(p, 0, 1.45, 0), 0.2], ["the Ohio militia", Rv(-20.35, 1.3, 1.6), 0.2]] }; },
  // The one real battle? Phillips Corners: the Ohio survey crew in the woods, the compass on its staff, the chain
  survey: (s, f) => ({ light: "woods", dof: 1, focus: CMP,
    people: [P(SV[0][0], SV[0][1], "neutral", -1, { hw: [add(CMP, 0.1, -0.05, -0.12)] }), P(SV[1][0], SV[1][1], "whistle", 1), P(SV[2][0], SV[2][1], "neutral", 1)],
    cam: move({ pos: Wd(-1.9, 1.45, 0.7), look: Wd(-2.3, 1.25, 6.0), fov: 48, roll: -0.05 }, { pos: Wd(-2.0, 1.5, 1.3), look: Wd(-2.2, 1.25, 6.0), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the compass", CMP, 0.1], ["the surveyors", add(SV[0][1], 0, 1.4, 0), 0.2]] }),
  // Michigan men caught an Ohio survey crew: they come out of the trees, rifles up; the surveyors turn
  ambush: (s, f) => { const tt = t(f - s.a), seen = f >= W(3, "crew"), ph = (tt * 1.2 / 1.6) % 1;
    const man = (w: string, x: number, z0: number, k: number) => P(w, Wd(x, 0, z0 - 1.2 * tt), "stern", 0, { march: (ph + 0.5 * k) % 1 });
    return { light: "woods", dof: 1, focus: Wd(-1.2, 1.3, 9),
      people: [man("mi1", -1.0, 16.5, 0), man("mi3", 0.3, 17.4, 1), man("mi2", -2.3, 17.6, 1),
        P(SV[0][0], SV[0][1], seen ? "shock" : "neutral", seen ? 0 : -1), P(SV[1][0], SV[1][1], seen ? "shock" : "whistle", 0)],
      cam: move({ pos: Wd(-1.9, 1.5, 1.0), look: Wd(-1.4, 1.4, 12), fov: 50, roll: 0.05 }, { pos: Wd(-1.8, 1.55, 1.6), look: Wd(-1.2, 1.4, 12), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the Michigan men", Wd(-1.0, 1.3, 16.5 - 1.2 * tt), 0.3], ["the surveyors", add(SV[1][1], 0, 1.4, 0), 0.2]] }; },
  // ...and fired: three muskets, flashes, smoke rolling (aimed high, over the surveyors)
  fire: (s, f) => { const f0 = W(3, "fired") + 1, tt = t(f - f0), target = Wd(-1, 0, 5.5);
    const guns = MF.map(([, p], i) => aim(p, target, 0.32 + 0.04 * i));
    return { light: "woods", dof: 1, focus: add(MF[1][1], 0, 1.4, 0),
      tools: guns.map((g) => ({ kind: "musket" as const, g: g.g, b: g.b })),
      people: MF.map(([w, p], i) => P(w, p, f >= f0 ? "stern" : "grin", 1, { hw: guns[i].hands })),
      puffs: guns.flatMap((g, i) => [...flash(g.b, f, f0 + i * 2), ...shot(g.b, g.d, t(f - f0 - i * 2), 5)]),
      cam: kick(move({ pos: Wd(5.5, 1.5, 4.0), look: Wd(12, 1.4, 10), fov: 46, roll: -0.05 }, { pos: Wd(5.0, 1.45, 4.6), look: Wd(12, 1.45, 10), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0), f, f0, 1.2),
      subjects: [["the Michigan men", add(MF[1][1], 0, 1.4, 0), 0.2]] }; void tt; },
  // ...over their heads, or at them: the surveyors duck, smoke drifting over them
  duck: (s, f) => { const tt = t(f - s.a);
    return { light: "woods", dof: 1, focus: add(SV[0][1], 0.3, 1.1, 0.5),
      people: [P(SV[0][0], SV[0][1], "shock", 1, { tilt: 0.22, s: 0.95 }), P(SV[1][0], SV[1][1], "shock", -1, { tilt: -0.18 }), P(SV[2][0], Wd(-3.0, 0, 7.0), "nervous", 1, { tilt: 0.12 })],
      puffs: Array.from({ length: 10 }, (_, i) => { const u = (tt * 0.25 + i / 10) % 1; return { p: Wd(1.5 - 6 * u, 2.5 + 0.3 * Math.sin(i), 6.4 + 1.2 * Math.cos(i * 1.7)), s: 0.9 + 0.8 * u, c: SMOKE, a: 0.5 * Math.sin(Math.PI * u) }; }),
      cam: move({ pos: Wd(-2.2, 1.2, 1.8), look: Wd(-2.0, 1.3, 6.5), fov: 50, roll: 0.06 }, { pos: Wd(-2.1, 1.15, 2.3), look: Wd(-2.0, 1.35, 6.5), fov: 48, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the surveyors", add(SV[0][1], 0, 1.3, 0), 0.2]] }; },
  // Nobody was hit: the surveyors run for it, out of the clearing, the staff left standing
  nobody: (s, f) => { const tt = t(f - s.a);
    return { light: "woods", dof: 1, focus: Wd(-2.8 - 2.6 * smooth((f - s.a) / Math.max(1, s.b - s.a)), 1.2, 6.5),
      people: [walker("sv1", -2.2, 0, 5.6, -3.0, tt, "shock"), walker("sv2", -1.4, 0, 7.8, -3.0, tt + 0.1, "shock"), walker("sv3", -3.4, 0, 7.2, -3.0, tt, "nervous")],
      cam: move({ pos: Wd(-2.4, 1.4, -0.4), look: Wd(-2.8, 1.2, 6.5), fov: 50, roll: -0.05 }, { pos: Wd(-4.8, 1.4, -0.2), look: Wd(-5.6, 1.2, 6.5), fov: 50, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the surveyors", Wd(-2.8 - 3.0 * tt, 1.3, 6.5), 0.6]] }; },
  // Then a Michigan deputy sheriff, Joseph Wood, went into Toledo: along the board walk toward the tavern
  wood: (s, f) => { const tt = t(f - s.a), w = walker("wood", TAVERN.x + 6.0, BW, WALK_Z, -1.05, tt), lk = add(w.p, -0.4, 1.35, 0);
    return { light: "river", dof: 1, focus: add(w.p, 0, 1.4, 0), people: [w, P("t4", Rv(TAVERN.x - 1.6, BW, WALK_Z + 0.4), "nervous", 1, { extra: true })],
      cam: { pos: add(lk, 1.6, 0.2, -4.4), look: lk, fov: 46, roll: 0.03 * Math.sin(tt * 1.3) },
      subjects: [["Wood", add(w.p, 0, 1.4, 0), 0.2]] }; },
  // ...to arrest a man named Two Stickney: inside the tavern, Wood at the door, Two at his table
  tavern: (s, f) => ({ light: "tavern", dof: 1, focus: add(TWO_P, -0.5, 1.4, 0), key: LAMP_T,
    people: [P("wood", WOOD_IN, "stern", 1, { facing: 1 }), P("two", TWO_P, f >= W(4, "two") ? "grin" : "neutral", -1), P("barman", BARMAN, "nervous", 1, { extra: true })],
    cam: move({ pos: Rm(0.85, 1.6, -3.9), look: Rm(0.95, 1.35, 1.0), fov: 50, roll: 0.05 }, { pos: Rm(0.95, 1.6, -3.5), look: Rm(1.0, 1.35, 1.0), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["Two Stickney", add(TWO_P, 0, 1.4, 0), 0.2], ["Wood", add(WOOD_IN, 0, 1.4, 0), 0.2]] }),
  // Yes, Two: close on him, grinning
  yes: (s, f) => ({ light: "tavern", dof: 1, closeup: true, focus: add(TWO_P, 0, 1.6, 0), key: LAMP_T, people: [P("two", TWO_P, "grin", -1, { headTilt: 0.12 })],
    cam: kick(snap(add(TWO_P, -0.5, 1.62, -1.7), add(TWO_P, 0, 1.58, 0), f, s.a, { fov: 40, roll: -0.04 }, 1.7, 6), f, W(4, "two."), 0.7),
    subjects: [["Two Stickney", add(TWO_P, 0, 1.6, 0), 0.2]] }),
  // His brother was named One: One steps in beside him and waves
  one: (s, f) => { const m = L3(TWO_P, ONE_P, 0.5);
    return { light: "tavern", dof: 1, focus: add(m, 0, 1.4, 0), key: LAMP_T,
      people: [P("two", TWO_P, "grin", -1), P("one", ONE_P, "laugh", 1, { wave: 0.7 })],
      cam: move({ pos: add(m, -0.2, 1.55, -3.8), look: add(m, 0, 1.4, 0), fov: 46, roll: 0.04 }, { pos: add(m, 0.1, 1.55, -3.4), look: add(m, 0, 1.42, 0), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["One", add(ONE_P, 0, 1.4, 0), 0.2], ["Two", add(TWO_P, 0, 1.4, 0), 0.2]] }; },
  // Two Stickney pulled out a penknife and stabbed him: the knife comes up, Wood flinches (nothing shown)
  stab: (s, f) => { const go = smooth((f - W(5, "penknife")) / 8), hit = f >= W(5, "stabbed"), wp = WOOD_AT, hand: V3 = add(TWO_UP, 0.05 - 0.2 * go, 1.15 + 0.35 * go, -0.3), tip: V3 = add(hand, -0.12, 0.16, -0.02);
    const m = L3(TWO_UP, wp, 0.5);
    return { light: "tavern", dof: 1, focus: add(m, 0, 1.4, 0), key: LAMP_T, tools: [{ kind: "knife", g: hand, b: tip }],
      people: [P("two", TWO_UP, hit ? "stern" : "grin", -1, { hw: [hand], facing: -1 }), P("wood", wp, hit ? "shock" : "stern", 1, { tilt: hit ? -0.1 : 0, facing: 1 })],
      cam: kick(move({ pos: add(m, 0.1, 1.55, -3.7), look: add(m, 0, 1.4, 0), fov: 44, roll: -0.05 }, { pos: add(m, -0.1, 1.5, -3.2), look: add(m, 0, 1.42, 0), fov: 44, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(5, "stabbed"), 1.2),
      subjects: [["the penknife", add(hand, -0.05, 0.08, 0), 0.04], ["Wood", add(wp, 0, 1.4, 0), 0.2]] }; },
  // Wood lived: he holds his side and breathes out
  lived: (s, f) => { const wp = WOOD_AT;
    return { light: "tavern", dof: 1, closeup: true, focus: add(wp, 0, 1.55, 0), key: LAMP_T, people: [P("wood", wp, f >= W(5, "lived") ? "relief" : "dazed", 0, { hw: [add(wp, -0.2, 0.78, -0.14)] })],
      cam: snap(add(wp, -0.3, 1.6, -1.9), add(wp, 0, 1.45, 0), f, s.a, { fov: 42, roll: 0.04 }, 1.6, 6),
      subjects: [["Wood", add(wp, 0, 1.5, 0), 0.2]] }; },
  // That was the only blood of the entire war: back out in the street, the militias standing about, bored
  only: (s, f) => ({ light: "river", dof: 0, focus: Rv(0, 1.2, 3.0),
    people: [...MI_LINE.map(([w, p], i) => P(w, p, i === 0 ? "whistle" : "neutral", 1, { headTilt: 0.1 })), ...OH_LINE.map(([w, p], i) => P(w, p, i === 1 ? "whistle" : "neutral", -1, { headTilt: -0.1 }))],
    cam: move({ pos: Rv(0.2, 3.4, -5.2), look: Rv(0, 0.9, 3.0), fov: 50, roll: 0.04 }, { pos: Rv(0, 4.4, -6.0), look: Rv(0, 0.8, 3.0), fov: 50, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the militias", Rv(0, 1.2, 2.0), 0.6]] }),
  // Washington finally stepped in: Congress, the members by the speaker's desk, the map behind them
  congress: (s, f) => ({ light: "congress", map: "strip", dof: 1, focus: Rm(0.5, 1.6, 2.0), key: WIN_C,
    people: [P("cg1", Rm(-0.3, 0, 1.2), "stern", 1), P("cg2", CG2, "neutral", -1), P("cg3", Rm(1.3, 0, 0.8), "stern", -1)],
    cam: move({ pos: Rm(0.2, 1.7, -4.4), look: Rm(0.5, 1.7, 2.4), fov: 50, roll: -0.04 }, { pos: Rm(0.6, 1.75, -3.8), look: Rm(0.5, 1.75, 2.4), fov: 48, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["Congress", Rm(0.5, 1.5, 1.2), 0.3], ["the map", add(MAPC, 0.3, 0, 0), 0.5]] }),
  // Congress told Michigan: give up Toledo: one points at the strip on the map
  deal: (s, f) => { const tip = Rm(0.5, 1.95, 3.72);
    return { light: "congress", map: "strip", dof: 1, focus: L3(add(CG2, 0, 1.5, 0), MAPC, 0.5), key: WIN_C,
      people: [P("cg2", CG2, "stern", -1, { hw: [tip], facing: -1 })],
      cam: move({ pos: Rm(0.0, 1.9, -0.9), look: Rm(0.45, 1.85, 3.3), fov: 48, roll: 0.05 }, { pos: Rm(0.15, 1.95, -0.4), look: Rm(0.45, 1.9, 3.4), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the map", add(MAPC, -0.4, -0.1, 0), 0.4], ["the congressman", add(CG2, 0, 1.4, 0), 0.2]] }; },
  // ...and we'll throw in the Upper Peninsula: the map now shows the whole north, the peninsula in gold
  up: (s, f) => ({ light: "congress", map: "up", dof: 1, focus: MAPC, key: WIN_C,
    cam: kick(snap(Rm(0.1, 2.0, 0.9), add(MAPC, 0, 0.1, 0), f, s.a, { fov: 46, roll: 0.03 }, 1.8, 6), f, W(6, "upper"), 0.8),
    subjects: [["the Upper Peninsula", add(MAPC, 0.1, 0.5, 0), 0.3]] }),
  // Michigan was furious: Mason and two delegates in the tavern, shouting
  furious: (s, f) => { const mp = Rm(0.6, 0, 1.4), d1 = Rm(1.15, 0, 2.15), d2 = Rm(0.0, 0, 1.9);
    return { light: "tavern", dof: 1, focus: add(mp, 0, 1.5, 0), key: LAMP_T,
      people: [P("mason", mp, "shock", 0, { wave: 0.9 }), P("d1", d1, "stern", -1), P("d2", d2, "shock", 1)],
      cam: kick(move({ pos: add(mp, -0.1, 1.5, -3.6), look: add(mp, 0, 1.45, 0.3), fov: 48, roll: -0.06 }, { pos: add(mp, 0.1, 1.55, -3.2), look: add(mp, 0, 1.5, 0.3), fov: 46, roll: 0.05 }, f, s.a, s.b, smooth, 0), f, W(7, "furious"), 1.0),
      subjects: [["Mason", add(mp, 0, 1.5, 0), 0.2]] }; },
  // Up there was supposed to be nothing but snow and trees: the Upper Peninsula in winter
  snow: (s, f) => { const tt = t(f);
    return { light: "northW", dof: 0, focus: Nt(-8, 2, 12), cards: snowfall(Nt(-6, 1.8, 3), tt, 60, 9, 5),
      cam: move({ pos: Nt(2, 1.8, -6), look: Nt(-10, 2.4, 12), fov: 52, roll: 0.04 }, { pos: Nt(0, 2.6, -8), look: Nt(-12, 3.0, 14), fov: 52, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the snowy pines", Nt(-17, 4, 6), 2], ["the frozen lake", Nt(-6, -0.5, 28), 3]] }; },
  // They voted no: the delegates in the tavern, arms folded, stern
  no: (s, f) => { const ps: V3[] = [Rm(1.0, 0, 1.2), Rm(0.1, 0, 1.2), Rm(1.45, 0, 2.1), Rm(-0.35, 0, 1.95)];
    return { light: "tavern", dof: 1, focus: Rm(0.5, 1.5, 1.6), key: LAMP_T,
      people: ["d1", "d2", "d3", "d4"].map((w, i) => P(w, ps[i], "stern", i % 2 ? 1 : -1, { headTilt: i % 2 ? -0.1 : 0.1 })),
      cam: kick(move({ pos: Rm(0.5, 1.6, -3.6), look: Rm(0.5, 1.45, 1.6), fov: 48, roll: 0.05 }, { pos: Rm(0.5, 1.6, -3.2), look: Rm(0.5, 1.5, 1.6), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, W(7, "no"), 1.0),
      subjects: [["the delegates", Rm(0.5, 1.5, 1.6), 0.3]] }; },
  // Then, broke and stuck: the convention cabin, Mason by the stove, worried
  broke: (s, f) => { const mp = Rm(STOVE[0] - 1.0, 0, STOVE[2] - 0.3);
    return { light: "conv", dof: 1, focus: add(mp, 0, 1.5, 0), key: LAMP_C, people: [P("mason", mp, "nervous", 1, { headTilt: -0.1 })],
      cam: move({ pos: add(mp, -1.4, 1.6, -2.9), look: add(mp, 0.4, 1.35, 0), fov: 44, roll: -0.05 }, { pos: add(mp, -1.0, 1.55, -2.5), look: add(mp, 0.4, 1.4, 0), fov: 42, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["Mason", add(mp, 0, 1.5, 0), 0.2], ["the stove", Rm(STOVE[0], 0.7, STOVE[2]), 0.3]] }; },
  // ...they met again in December, at the Frostbitten Convention: delegates in coats, frost on the windows, the stove
  frost: (s, f) => { const ps = DELS, tt = t(f);
    return { light: "conv", dof: 1, focus: Rm(0.6, 1.5, 1.5), key: LAMP_C,
      people: ["d1", "d2", "d3", "d4"].map((w, i) => P(w, ps[i], i % 2 ? "nervous" : "neutral", i % 2 ? 1 : -1)),
      puffs: ps.map((p, i) => { const u = (tt * 0.7 + i * 0.3) % 1; return { p: add(p, (i % 2 ? -0.15 : 0.15) - 0.3 * u, 1.55 + 0.15 * u, -0.25 - 0.2 * u), s: 0.12 + 0.3 * u, c: [0.96, 0.97, 1.0] as [number, number, number], a: 0.4 * (1 - u) }; }),
      cam: move({ pos: Rm(0.4, 1.75, -4.4), look: Rm(0.6, 1.6, 1.6), fov: 50, roll: 0.04 }, { pos: Rm(0.6, 1.8, -3.9), look: Rm(0.6, 1.65, 1.6), fov: 48, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      subjects: [["the delegates", Rm(0.6, 1.5, 1.5), 0.3], ["the frosted window", Rm(1.7, 1.9, 3.98), 0.2]] }; },
  // ...and said yes: hands up, grins
  yes2: (s, f) => { const ps = DELS, up = f >= W(8, "yes");
    return { light: "conv", dof: 1, focus: Rm(0.6, 1.5, 1.5), key: LAMP_C,
      people: ["d1", "d2", "d3", "d4"].map((w, i) => P(w, ps[i], up ? "laugh" : "grin", i % 2 ? 1 : -1, { wave: up ? 0.9 : 0.4 })),
      cam: kick(move({ pos: Rm(0.6, 1.6, -3.4), look: Rm(0.6, 1.55, 1.6), fov: 48, roll: -0.04 }, { pos: Rm(0.6, 1.6, -3.0), look: Rm(0.6, 1.6, 1.6), fov: 48, roll: 0.04 }, f, s.a, s.b, smooth, 0), f, W(8, "yes"), 1.0),
      subjects: [["the delegates", Rm(0.6, 1.6, 1.5), 0.3]] }; },
  // A few years later, they found copper up there: summer, a prospector's pick at the outcrop, the copper showing
  copper: (s, f) => { const p = ng(-2.0, 5.4), sw = 0.5 + 0.5 * Math.sin(t(f) * 5), hand = add(p, -0.3, 1.2 + 0.25 * sw, 0.1), head = add(hand, -0.2, 0.35 - 0.5 * sw, 0.35);
    return { light: "northS", dof: 1, focus: ORE, tools: [{ kind: "pick", g: hand, b: head }],
      people: [P("pros", p, f >= W(9, "copper") ? "grin" : "neutral", -1, { hw: [hand] })],
      cards: f >= W(9, "copper") ? [0, 1, 2].map((i) => ({ kind: "nugget" as const, p: add(ORE, -0.2 + i * 0.3, 0.25 + 0.1 * i, -0.5), spin: i, s: 0.8 })) : [],
      cam: kick(move({ pos: ng(-2.2, 1.4, 1.5), look: ng(-2.6, 6.4, 0.9), fov: 48, roll: 0.05 }, { pos: ng(-2.4, 2.0, 1.4), look: ng(-2.7, 6.4, 0.85), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(9, "copper"), 0.8),
      subjects: [["the copper", ORE, 0.2], ["the prospector", add(p, 0, 1.4, 0), 0.2]] }; },
  // For 40 years, Michigan mined more copper than any state: the mine, a cart heaped with copper, miners pushing it out
  mine: (s, f) => { const tt = t(f - s.a), cz = PORTAL[2] - 3.6 - 0.35 * tt, cp = ng(PORTAL[0], cz, 0.9);
    return { light: "northS", dof: 1, focus: cp,
      people: [P("mn1", ng(PORTAL[0] + 0.5, cz + 1.25), "grin", 0, { hw: [add(cp, 0.4, 0.15, 0.75)] }), P("mn2", ng(PORTAL[0] - 1.6, cz - 0.6), "laugh", 1, { wave: 0.6 })],
      cam: move({ pos: ng(PORTAL[0] - 3.5, PORTAL[2] - 10, 1.8), look: add(cp, 0, 0.4, 1.0), fov: 48, roll: -0.04 }, { pos: ng(PORTAL[0] - 2.8, PORTAL[2] - 9, 1.5), look: add(cp, 0, 0.3, 0.5), fov: 46, roll: 0.04 }, f, s.a, s.b, smooth, 0),
      subjects: [["the mine", ng(PORTAL[0], PORTAL[2], 1.5), 0.6], ["the copper cart", cp, 0.4]] }; },
  // Ohio got Toledo: Lucas on Toledo's board walk, his men cheering
  ohio: (s, f) => { const p = Rv(-21, BW, WALK_Z - 0.3);
    return { light: "river", dof: 1, focus: add(p, 0, 1.4, 0),
      people: [P("lucas", p, "laugh", 0), P("oh1", Rv(-20.35, 0, 1.6), "laugh", -1, { wave: 0.9 }), P("oh2", Rv(-21.65, 0, 1.8), "grin", 1, { wave: 0.6 })],
      cam: kick(move({ pos: Rv(-21.2, 1.5, -2.4), look: Rv(-21, 1.45, 3.4), fov: 48, roll: -0.05 }, { pos: Rv(-20.9, 1.55, -2.0), look: Rv(-21, 1.5, 3.4), fov: 46, roll: 0.04 }, f, s.a, s.b, smooth, 0), f, W(10, "toledo"), 0.8),
      subjects: [["Lucas", add(p, 0, 1.45, 0), 0.2]] }; },
  // Michigan got rich: Mason by the copper cart, laughing
  rich: (s, f) => { const mp = ng(PORTAL[0] - 1.1, PORTAL[2] - 3.9);
    return { light: "northS", dof: 1, focus: add(mp, 0.4, 1.3, 0), people: [P("mason", mp, "laugh", 1, { wave: 0.8 })],
      cards: [0, 1].map((i) => ({ kind: "nugget" as const, p: add(mp, -0.25 - 0.1 * i, 1.0 + 0.12 * i, -0.25), spin: i * 2, s: 0.7 })),
      cam: kick(move({ pos: add(mp, 0.9, 1.6, -3.0), look: add(mp, 0.5, 1.3, 0), fov: 46, roll: 0.05 }, { pos: add(mp, 0.6, 1.55, -2.5), look: add(mp, 0.45, 1.35, 0), fov: 44, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, W(10, "rich"), 1.0),
      subjects: [["Mason", add(mp, 0, 1.5, 0), 0.2], ["the copper cart", CART, 0.4]] }; },
  // loop: back to the face-off in the street, settling onto the opening frame
  end: (s, f) => { const h0 = hookCam(0);
    return { ...hookState(), light: "river", dof: 1, focus: Rv(0, 1.3, 2.0),
      cam: move({ ...orb(Rv(0, 1.3, 3.0), 18, 8, 2.2), fov: 50, roll: 0.0 }, h0, f, s.a, s.b - 10, smooth, 0) }; },
};
/** the house kit, for the long-form */
export { clamp01, smooth, expo, L3, move, orb, orbit, snap, kick, t as secs, P, walker, add, shot, flash, snowfall, aim, hookState, faceoff, MI_LINE, OH_LINE, TWO_P, ONE_P, MAPC };

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["strip", "toledo", "mason", "mimarch", "survey", "fire", "wood", "stab", "only", "congress", "furious", "snow", "broke", "copper", "ohio", "rich"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps (Shorts: nothing important above y = 19 %) ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "war", kind: "stamp", text: "OHIO vs. MICHIGAN", f0: 0, f1: B("hook"), y: 23, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 96 },
  { key: "wound", kind: "call", text: "THE ONLY WOUND", f0: W(0, "wound"), f1: B("knife"), y: 23, fg: "#ffd166", size: 110 },
  { key: "1835", kind: "pill", text: "1835", sub: "both claimed the Toledo Strip", f0: W(1, "1835"), f1: B("strip"), y: 22, size: 84 },
  { key: "toledo", kind: "pill", text: "TOLEDO", sub: "on the Maumee River", f0: W(1, "toledo"), f1: B("toledo"), y: 22, size: 84 },
  { key: "port", kind: "call", text: "THE NEXT GREAT PORT", f0: W(1, "next"), f1: B("port"), y: 23, fg: "#ffd166", size: 96 },
  { key: "terr", kind: "pill", text: "MICHIGAN", sub: "a territory, not a state", f0: W(2, "state"), f1: B("mason"), y: 22, size: 84 },
  { key: "mason", kind: "pill", text: "GOV. STEVENS T. MASON", f0: S0("boy") + 3, f1: W(2, "23"), y: 22, size: 64 },
  { key: "23", kind: "stamp", text: "AGE 23", f0: W(2, "23"), f1: B("boy"), y: 23, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 130 },
  { key: "lucas", kind: "pill", text: "GOV. ROBERT LUCAS", sub: "Ohio", f0: S0("lucas") + 3, f1: B("lucas"), y: 22, size: 70 },
  { key: "battle", kind: "stamp", text: "THE ONE REAL BATTLE", f0: S0("survey") + 2, f1: B("survey"), y: 23, rot: 3, bg: "#2f2a3a", fg: "#ffffff", size: 96 },
  { key: "phil", kind: "pill", text: "PHILLIPS CORNERS", sub: "April 1835", f0: W(3, "phillips"), f1: B("ambush"), y: 22, size: 76 },
  { key: "nobody", kind: "stamp", text: "NOBODY WAS HIT", f0: W(3, "nobody"), f1: B("nobody"), y: 23, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 110 },
  { key: "wood", kind: "pill", text: "DEPUTY JOSEPH WOOD", sub: "Michigan", f0: W(4, "joseph"), f1: B("wood"), y: 22, size: 70 },
  { key: "two", kind: "pill", text: "TWO STICKNEY", f0: W(4, "two"), f1: B("tavern"), y: 22, size: 80 },
  { key: "yes", kind: "stamp", text: "YES, TWO.", f0: W(4, "yes"), f1: B("yes"), y: 23, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 130 },
  { key: "one", kind: "pill", text: "HIS BROTHER: ONE", f0: W(4, "one"), f1: B("one"), y: 22, size: 76 },
  { key: "lived", kind: "stamp", text: "WOOD LIVED", f0: W(5, "lived"), f1: B("lived"), y: 23, rot: 4, bg: "#2f9a57", fg: "#ffffff", size: 120 },
  { key: "blood", kind: "call", text: "THE ONLY BLOOD OF THE WAR", f0: W(5, "only"), f1: B("only"), y: 23, fg: "#ff6b5a", size: 84 },
  { key: "dc", kind: "pill", text: "CONGRESS", sub: "Washington, 1836", f0: W(6, "congress"), f1: B("congress"), y: 22, size: 84 },
  { key: "give", kind: "stamp", text: "GIVE UP TOLEDO", f0: W(6, "give"), f1: B("deal"), y: 23, rot: -3, bg: "#2f2a3a", fg: "#ffffff", size: 110 },
  { key: "up", kind: "call", text: "+ THE UPPER PENINSULA", f0: W(6, "upper"), f1: B("up"), y: 23, fg: "#ffd166", size: 90 },
  { key: "furious", kind: "stamp", text: "FURIOUS", f0: W(7, "furious"), f1: B("furious"), y: 23, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 140 },
  { key: "no", kind: "stamp", text: "VOTED NO", f0: W(7, "no"), f1: B("no"), y: 23, rot: 4, bg: "#e0332e", fg: "#ffffff", size: 130 },
  { key: "dec", kind: "pill", text: "DECEMBER 1836", f0: W(8, "december"), f1: W(8, "frostbitten"), y: 22, size: 84 },
  { key: "frost", kind: "pill", text: "THE FROSTBITTEN CONVENTION", f0: W(8, "frostbitten"), f1: B("frost"), y: 22, size: 60 },
  { key: "yes2", kind: "stamp", text: "YES", f0: W(8, "yes"), f1: B("yes2"), y: 23, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 150 },
  { key: "cu", kind: "call", text: "COPPER", f0: W(9, "copper"), f1: B("copper"), y: 23, fg: "#ff9a4a", size: 150 },
  { key: "40", kind: "call", text: "40 YEARS", f0: W(9, "40"), f1: W(9, "more"), y: 23, fg: "#ffd166", size: 140 },
  { key: "no1", kind: "stamp", text: "#1 IN THE U.S.", f0: W(9, "more"), f1: B("mine"), y: 23, rot: -4, bg: "#c0702a", fg: "#ffffff", size: 120 },
  { key: "oh", kind: "pill", text: "OHIO: TOLEDO", f0: W(10, "ohio"), f1: B("ohio"), y: 22, size: 84 },
  { key: "mi", kind: "pill", text: "MICHIGAN: RICH", f0: W(10, "michigan"), f1: B("rich"), y: 22, size: 84 },
] as Item[]).filter((i) => i.f1 > i.f0);
