// The Timothy Dexter Short: every shot's camera, cast and props, frame by frame (house moving camera: nothing is still).
// Cuts come from the narration (timeline.ts), so re-timing the voice re-times the shots. Sets are in place.ts; inside
// each, cameras sit on the -z side looking toward +z (world +x is screen LEFT), unless a shot turns round.
// Nobody is shown hurt: the caning is Dexter bursting out with his cane raised and his wife starting away (no contact).
import { Expr } from "../bridge/toon";
import { V3, FPS, Rv, Wd, Rm, TAVERN, WHARF, SHIP, TABLE, BAR, CRATES, COALP, FIRE, SHOP, BLD_Z, ARCH_H, ARCH_Z, COL_H, COLS, DEX_COL, COFFIN, HOUSE_Z, DESK, DESK_Y, MAP } from "./place";
import { SEG_TIMES, TOTAL, VOICE_END, wordAt, words } from "./timeline";
export type { V3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const norm = (s: string) => s.toLowerCase().replace(/[^\w]/g, "");
/** onset of the n-th (1-based) match of w in a segment */
const Wn = (seg: number, w: string, n: number) => { const ws = words().filter((x) => x.seg === seg && norm(x.w) === norm(w)); const hit = ws[n - 1] ?? ws[ws.length - 1]; return hit ? Math.round(hit.s * FPS) : W(seg, w); };
const CUTS: [string, number][] = [
  ["hook", 0], ["tropics", W(0, "to") - 2], ["money", W(0, "and") - 2],
  ["shop", A(1)], ["spell", W(1, "could") - 2], ["war", W(1, "after") - 2], ["buy", W(1, "everyone") - 2],
  ["paid", A(2)], ["rich", W(2, "and") - 2],
  ["laugh", A(3)], ["advice", W(3, "story") - 2], ["worst", W(3, "worst") - 2],
  ["coal", A(4)], ["load", W(4, "he") - 2], ["strike", W(4, "landed") - 2], ["sold", W(4, "sold") - 2],
  ["pans", A(5)], ["shipped", W(5, "dexter") - 2], ["cook", W(5, "they") - 2], ["cleared", Wn(5, "and", 1) - 2],
  ["mansion", A(6)], ["lord", W(6, "called") - 2], ["statues", Wn(6, "and", 1) - 2], ["wash", W(6, "washington") - 2], ["jeff", W(6, "jefferson") - 2], ["himself", Wn(6, "and", 2) - 2],
  ["sign", A(7)], ["proud", W(7, "greatest") - 2],
  ["coffin", A(8)], ["crowd", W(8, "about") - 2], ["wife", W(8, "but") - 2], ["hiding", W(8, "so") - 2], ["caned", W(8, "caned") - 4],
  ["book", A(9)], ["readers", W(9, "when") - 2], ["punct", W(9, "added") - 6], ["pepper", W(9, "told") - 6],
  ["fool", A(10)], ["lucky", W(10, "or") - 2], ["end", VOICE_END],
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
/** a warming pan held at `hand`, its pan out along `dir`; roll turns it about the handle (pi/2: the lid faces the camera) */
export type Pan = { hand: V3; dir: V3; roll?: number };
/** a cane: g = the knob (in the hand), b = the tip */
export type Cane = { g: V3; b: V3 };
export type Puff = { p: V3; s: number; c: [number, number, number]; a: number; add?: boolean };
export type CardKind = "paper" | "spark" | "flake" | "nugget" | "note" | "coin" | "coal" | "dot" | "comma" | "qmark";
export type Card = { kind: CardKind; p: V3; spin: number; s: number; flat?: boolean };
export type St3 = {
  light: "port" | "newcastle" | "tropic" | "mansion" | "wake" | "tavern" | "study"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][];
  tools?: Tool[]; pans?: Pan[]; canes?: Cane[]; cards?: Card[]; puffs?: Puff[];
  /** the pepper pot in a hand (its base) */
  pot?: V3;
  /** dressings: crates of bed warmers on the wharf, the coal heap (Newburyport side), the coffin out on the lawn */
  pans3?: boolean; coal?: boolean; coffin?: boolean;
  /** hide the strike board (a shot whose camera stands right under it) */
  nostrike?: boolean;
  /** the study's page board */
  page?: "pickle" | "punct";
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

// ---------------- money, coal, marks, fire ----------------
/** cards falling from above c over a w x d patch, looping every `per` seconds; toward = drift toward the camera (-z) */
const rain = (kind: CardKind, c: V3, tt: number, n: number, w = 1.6, h = 2.2, d = 0.8, per = 1.4, s = 1, toward = 0): Card[] => Array.from({ length: n }, (_, i) => {
  const u = ((tt / per + ((i * 0.618) % 1)) % 1);
  return { kind, p: add(c, w * (((i * 0.377) % 1) - 0.5) + 0.12 * Math.sin(tt * 3 + i), h * (1 - u), d * (((i * 0.733) % 1) - 0.5) - toward * u), spin: i * 1.3 + tt * (2 + (i % 3)), s: s * (0.8 + 0.4 * ((i * 0.29) % 1)) }; });
/** a stack of paper notes lying flat on a table (top at y) */
const stack = (c: V3, n: number, kind: CardKind = "note"): Card[] => Array.from({ length: n }, (_, i) => ({ kind, p: add(c, 0.12 * Math.sin(i * 2.1), 0.005 + 0.004 * i, 0.08 * Math.cos(i * 1.7)), spin: 0.4 * Math.sin(i * 1.3), s: 1, flat: true }));
/** marks flung out of the pepper pot at the lens: from p toward the camera position cp */
const fling = (p: V3, cp: V3, tt: number, n: number): Card[] => Array.from({ length: n }, (_, i) => {
  const u = ((tt * 0.9 + i / n) % 1), k: CardKind = (["dot", "comma", "qmark"] as const)[i % 3], sp = 0.5 * Math.sin(i * 2.3), up = 0.4 * Math.cos(i * 1.7);
  const q = L3(p, cp, 0.82 * u); return { kind: k, p: add(q, sp * u * 1.4, up * u + 0.6 * u * (1 - u), 0), spin: i + tt * 3, s: 0.7 + 1.6 * u }; });
const FIREC: [number, number, number] = [1.0, 0.62, 0.22], SMOKE: [number, number, number] = [0.82, 0.8, 0.78], DUST: [number, number, number] = [0.3, 0.3, 0.32];
const fire = (c: V3, tt: number): Puff[] => [
  ...Array.from({ length: 5 }, (_, i) => { const u = ((tt * 2.2 + i / 5) % 1); return { p: add(c, 0.12 * Math.sin(i * 2 + tt * 5), 0.12 + 0.45 * u, 0.1 * Math.cos(i * 1.6)), s: 0.42 * (1 - u) + 0.12, c: FIREC, a: 0.95 * (1 - u), add: true }; }),
  ...Array.from({ length: 5 }, (_, i) => { const u = ((tt * 0.45 + i / 5) % 1); return { p: add(c, 0.25 * Math.sin(i * 1.3 + tt) + 0.3 * u, 1.3 + 2.0 * u, 0.2 * u), s: 0.4 + 1.0 * u, c: SMOKE, a: 0.45 * (1 - u) }; }) ];

// ---------------- the port as the shots use it ----------------
const WY = WHARF.y, WALK = 0.22, WALK_Z = 4.4;
/** the wharf root (where people stand on the wharf near the street) */
const WR = (x: number, z: number, y = WY): V3 => Rv(x, y, z);
const DEX_HOOK: V3 = WR(11.4, 12.6);
/** Dexter holding a bed warmer up beside his face, the lid to the camera */
const holdUp = (p: V3, side = -1): Pan => ({ hand: add(p, 0.32 * side, 1.02, -0.18), dir: [0.36 * side, 0.93, -0.05], roll: Math.PI / 2 });
const HOOK_POS: V3 = add(DEX_HOOK, -0.3, 1.32, -3.0), HOOK_LOOK: V3 = add(DEX_HOOK, -0.3, 1.2, 0), HOOK = { fov: 46, roll: 0.03 };
// frame 0 is the same framing as the frames after it (a slow creep, no snap), and it is also the last frame (the loop)
const hookCam = (f: number) => move({ pos: HOOK_POS, look: HOOK_LOOK, ...HOOK }, { pos: L3(HOOK_POS, HOOK_LOOK, 0.06), look: HOOK_LOOK, ...HOOK }, f, 0, 14, smooth, 0);
const hookState = (): Partial<St3> => ({ light: "tropic", pans3: true, people: [P("dexter", DEX_HOOK, "grin", 0, { hw: [holdUp(DEX_HOOK).hand] })],
  pans: [holdUp(DEX_HOOK)], subjects: [["Dexter", head(DEX_HOOK), 0.2], ["the bed warmer", add(DEX_HOOK, -0.66, 1.9, -0.2), 0.12]] });
const SHOP_D: V3 = Rv(SHOP[0] + 1.3, WALK, WALK_Z - 0.6);
// ---------------- the room as the shots use it ----------------
const TBL: V3 = Rm(TABLE[0], 0.79, TABLE[2]);
const DEX_T: V3 = Rm(TABLE[0] - 0.15, 0, TABLE[2] - 1.0), M1_T: V3 = Rm(TABLE[0] + 0.75, 0, TABLE[2] + 0.6), M2_T: V3 = Rm(TABLE[0] - 0.8, 0, TABLE[2] + 0.55), M3_T: V3 = Rm(TABLE[0] + 0.25, 0, TABLE[2] + 1.15), M4_T: V3 = Rm(TABLE[0] - 0.55, 0, TABLE[2] + 1.25);
const LAMP_K: V3 = Rm(1.6, 2.4, 0.2);
const DESK_P: V3 = Rm(DESK[0] - 0.05, 0, DESK[2] + 0.62), BOARD: V3 = Rm(MAP.x, MAP.y, 3.86), CANDLE_K: V3 = Rm(DESK[0] - 0.55, DESK_Y + 0.6, DESK[2] + 0.1);
// ---------------- the mansion as the shots use it ----------------
const Mn = Wd;
const STAT_Y = COL_H + 0.08, ARCH_Y = ARCH_H + 0.12;
const COL_WHO = ["napoleon", "pitt", "franklin", "stat1", "dexstat", "stat2", "stat3", "stat4", "stat1", "franklin", "pitt", "stat2"];
/** every statue: the three on the arch, one on each column (each is "extra": the framing check only asks that none is cut) */
const statues = (keep: (name: string, i: number) => boolean = () => true): Person3[] => [
  P("washington", Mn(0, ARCH_Y, ARCH_Z), "stern", 0, { extra: true }), P("adams", Mn(1.45, ARCH_Y, ARCH_Z), "stern", -1, { extra: true }), P("jefferson", Mn(-1.45, ARCH_Y, ARCH_Z), "neutral", 1, { extra: true }),
  ...COLS.map(([x, z], i) => P(COL_WHO[i], Mn(x, STAT_Y, z), i === DEX_COL ? "grin" : "stern", x > 0 ? -1 : 1, { extra: true })),
].filter((q, i) => keep(q.who, i));
const DEXSTAT: V3 = Mn(COLS[DEX_COL][0], STAT_Y, COLS[DEX_COL][1]), SIGN: V3 = Mn(COLS[DEX_COL][0], COL_H - 1.25, COLS[DEX_COL][1] - 0.42);
const DOOR: V3 = Mn(0, 0.8, HOUSE_Z - 0.7);
/** the mourners: two blocks either side of the path, facing the coffin */
const MOURN = ["t1", "t2", "t3", "t4", "t5", "t6", "m1", "m2", "m3", "m4", "s1", "s2"];
const mourners = (expr: (i: number) => Expr = () => "nervous", skip: (i: number) => boolean = () => false): Person3[] => {
  const out: Person3[] = []; let i = 0;
  for (const sx of [-1, 1]) for (let row = 0; row < 6; row++) for (let k = 0; k < 4; k++) { const n = i++; if (skip(n)) continue;
    const x = sx * (1.7 + k * 0.85 + (row % 2) * 0.4), z = COFFIN[2] - 2.6 - row * 1.15 + 0.1 * k;
    if (COLS.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 0.85)) continue;
    out.push(P(MOURN[n % MOURN.length], Mn(x, 0, z), expr(n), sx > 0 ? -1 : 1, { extra: true, headTilt: 0.08 * Math.sin(n) })); }
  return out; };
const WIFE: V3 = Mn(-1.4, 0, COFFIN[2] - 1.4);

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // This man shipped 42,000 bed warmers...: Dexter on a West Indies wharf, holding one up, grinning (frame 0 already close)
  hook: (s, f) => ({ ...hookState(), light: "tropic", dof: 1, closeup: true, focus: head(DEX_HOOK), cam: kick(hookCam(f), f, W(0, "42000"), 0.6) }) as St3,
  // ...to the tropics: crane up over the wharf, the crates of bed warmers, the schooner, the palms on the far shore
  tropics: (s, f) => ({ light: "tropic", dof: 0, focus: WR(11, 15.5, 1.0), pans3: true,
    people: [P("dexter", WR(10.2, 13.6), "grin", 1, { wave: 0.8 }), P("s1", WR(11.5, 14.4), "neutral", -1), P("i1", WR(11.9, 17.6), "grin", 0, { extra: true })],
    cam: mv(s, f, { pos: Rv(8.2, 1.2, 9.0), look: WR(11.6, 16.5, 1.2), fov: 50, roll: 0.05 }, { pos: Rv(7.6, 3.6, 7.8), look: WR(12, 19, 1.0), fov: 54, roll: -0.03 }),
    subjects: [["the crates of bed warmers", add(Rv(CRATES[0], CRATES[1], CRATES[2]), 0, 0.9, 0), 0.6]] }),
  // And he made money: gold coins pour down on him, at the lens; he laughs
  money: (s, f) => { const tt = t(f - s.a), p = DEX_HOOK;
    return { light: "tropic", dof: 1, closeup: true, focus: head(p), pans3: true, people: [P("dexter", p, "laugh", 0, { headTilt: 0.12, wave: 1 })],
      cards: rain("coin", add(p, 0, 1.0, -0.5), tt, 26, 1.8, 2.4, 0.8, 1.1, 0.75, 0.5).filter((c) => Math.abs(c.p[0] - p[0]) > 0.3 || c.p[1] < p[1] + 1.15),
      cam: kick(snap(add(p, 0.1, 1.3, -2.5), head(p, 1.2), f, s.a, { fov: 46, roll: -0.05 }, 1.6, 6), f, W(0, "money"), 1.0),
      subjects: [["Dexter", head(p), 0.2]] }; },
  // You see, Timothy Dexter was a leather worker: in front of his shop in Newburyport, hides hung by the door
  shop: (s, f) => ({ light: "port", dof: 0.6, focus: head(SHOP_D, 1.4), people: [P("dexterw", SHOP_D, "grin", 0, { wave: 0.6 })],
    cam: mv(s, f, { pos: Rv(SHOP[0] + 0.5, 1.7, -2.4), look: Rv(SHOP[0] + 0.35, 2.7, 5.0), fov: 56, roll: -0.04 }, { pos: Rv(SHOP[0] + 0.45, 1.7, -1.9), look: Rv(SHOP[0] + 0.35, 2.75, 5.0), fov: 56, roll: 0.03 }),
    subjects: [["Dexter", head(SHOP_D), 0.2], ["his shop sign", Rv(SHOP[0], 3.9, BLD_Z - 0.06), 0.3], ["the hides", Rv(SHOP[0] + 1.75, 1.9, BLD_Z - 0.62), 0.3]] }),
  // ...who could barely spell: close, squinting at a letter he holds
  spell: (s, f) => { const p = SHOP_D, hand = add(p, -0.25, 1.32, -0.35);
    return { light: "port", dof: 1, closeup: true, focus: head(p), people: [P("dexterw", p, "nervous", 1, { headTilt: 0.14, hw: [hand] })],
      cards: [{ kind: "paper", p: add(hand, -0.02, 0.12, -0.03), spin: 0.15, s: 1.1 }],
      cam: snap(add(p, -0.25, 1.3, -1.9), add(p, -0.12, 1.22, 0), f, s.a, { fov: 44, roll: 0.06 }, 1.6, 6),
      subjects: [["Dexter", head(p), 0.2], ["the letter", add(hand, -0.02, 0.12, -0.03), 0.05]] }; },
  // After the Revolution, he bought up war money: the tavern, stacks of paper notes on the table, Dexter and two merchants
  war: (s, f) => ({ light: "tavern", dof: 1, focus: TBL, key: LAMP_K, cards: [...stack(add(TBL, 0.2, 0, -0.1), 8), ...stack(add(TBL, -0.25, 0, 0.15), 6)],
    people: [P("dexterw", DEX_T, "grin", 0, { hw: [add(TBL, 0.0, 0.05, -0.35)] }), P("m1", M1_T, "laugh", -1), P("m2", M2_T, "grin", 1)],
    cam: mv(s, f, { pos: Rm(TABLE[0] + 0.5, 2.3, TABLE[2] - 4.2), look: add(TBL, 0.05, 0.35, 0.2), fov: 52, roll: 0.05 }, { pos: Rm(TABLE[0] + 0.3, 2.4, TABLE[2] - 3.8), look: add(TBL, 0.05, 0.3, 0.2), fov: 52, roll: -0.03 }),
    subjects: [["the paper money", add(TBL, 0, 0.02, 0), 0.2], ["Dexter", head(DEX_T), 0.2]] }),
  // ...everyone thought was worthless: he sweeps the notes into his arms, notes flying at the lens
  buy: (s, f) => { const tt = t(f - s.a);
    return { light: "tavern", dof: 1, closeup: true, focus: head(DEX_T), key: LAMP_K, people: [P("dexterw", DEX_T, "laugh", 0, { wave: 1 })],
      cards: [...rain("note", add(DEX_T, 0, 0.9, -0.4), tt, 16, 2.0, 2.2, 0.6, 1.2, 0.6, 0.5).filter((c) => Math.abs(c.p[0] - DEX_T[0]) > 0.35 || c.p[1] < 1.1), ...stack(add(TBL, 0.2, 0, -0.1), 6)],
      cam: kick(snap(add(DEX_T, 0.15, 1.3, -2.3), head(DEX_T, 1.2), f, s.a, { fov: 46, roll: 0.05 }, 1.5, 6), f, W(1, "worthless"), 0.9),
      subjects: [["Dexter", head(DEX_T), 0.2]] }; },
  // Then Massachusetts paid its notes back in full: gold coins rain down on the table and the notes
  paid: (s, f) => { const tt = t(f - s.a);
    return { light: "tavern", dof: 1, focus: TBL, key: LAMP_K, people: [P("dexterw", DEX_T, "shock", 0), P("m1", M1_T, "shock", -1)],
      cards: [...stack(add(TBL, 0.2, 0, -0.1), 8), ...rain("coin", add(TBL, 0, 0.1, 0), tt, 30, 1.2, 1.6, 0.9, 1.0, 1.0)],
      cam: mv(s, f, { pos: Rm(TABLE[0] + 0.2, 2.6, TABLE[2] - 3.9), look: add(TBL, 0.1, 0.25, -0.2), fov: 52, roll: -0.05 }, { pos: Rm(TABLE[0] + 0.25, 2.5, TABLE[2] - 3.5), look: add(TBL, 0.1, 0.3, -0.2), fov: 52, roll: 0.04 }),
      subjects: [["the coins", add(TBL, 0, 0.3, 0), 0.3]] }; },
  // ...and Dexter was suddenly rich: close, laughing, coins bouncing past
  rich: (s, f) => { const tt = t(f - s.a);
    return { light: "tavern", dof: 1, closeup: true, focus: head(DEX_T), key: LAMP_K, people: [P("dexterw", DEX_T, "laugh", 0, { wave: 0.9, headTilt: -0.1 })],
      cards: rain("coin", add(DEX_T, 0, 1.0, -0.4), tt, 22, 1.8, 2.2, 0.7, 1.0, 0.75, 0.5).filter((c) => Math.abs(c.p[0] - DEX_T[0]) > 0.32 || c.p[1] < 1.12),
      cam: kick(snap(add(DEX_T, -0.2, 1.3, -2.2), head(DEX_T, 1.2), f, s.a, { fov: 44, roll: -0.06 }, 1.6, 6), f, W(2, "rich"), 1.0),
      subjects: [["Dexter", head(DEX_T), 0.2]] }; },
  // Newburyport's merchants laughed at him: the four round the table, an orbit
  laugh: (s, f) => ({ light: "tavern", dof: 1, focus: add(TBL, 0, 0.7, 0.4), key: LAMP_K,
    people: [P("m1", M1_T, "laugh", -1, { wave: 0.7 }), P("m2", M2_T, "laugh", 1), P("m3", M3_T, "grin", 0), P("m4", M4_T, "laugh", 1, { wave: 0.5 })],
    cam: orbit(s, f, add(TBL, 0, 0.75, 0.6), [-14, 8], [4.4, 4.1], [0.6, 0.5], 52),
    subjects: [["the merchants", add(TBL, 0, 0.8, 0.6), 0.4]] }),
  // The story goes, they gave him the worst advice: a merchant leans in to Dexter, sly
  advice: (s, f) => { const a = Rm(TABLE[0] - 0.3, 0, TABLE[2] - 0.75), b = Rm(TABLE[0] + 0.32, 0, TABLE[2] - 0.55);
    return { light: "tavern", dof: 1, focus: L3(head(a), head(b), 0.5), key: LAMP_K, people: [P("dexterw", a, "neutral", -1, { facing: -1 }), P("m2", b, "grin", 1, { facing: 1, headTilt: 0.12 })],
      cam: mv(s, f, { pos: Rm(TABLE[0] + 0.0, 1.4, TABLE[2] - 4.4), look: Rm(TABLE[0] + 0.0, 1.25, TABLE[2] - 0.6), fov: 46, roll: 0.05 }, { pos: Rm(TABLE[0] + 0.0, 1.4, TABLE[2] - 4.0), look: Rm(TABLE[0] + 0.0, 1.25, TABLE[2] - 0.6), fov: 46, roll: -0.04 }),
      subjects: [["Dexter", head(a), 0.2], ["the merchant", head(b), 0.2]] }; },
  // ...the worst advice they could think of: the merchant, snap close, grinning
  worst: (s, f) => { const b = Rm(TABLE[0] + 0.32, 0, TABLE[2] - 0.55);
    return { light: "tavern", dof: 1, closeup: true, focus: head(b), key: LAMP_K, people: [P("m2", b, "grin", 0, { headTilt: 0.12 })],
      cam: kick(snap(add(b, 0.25, 1.3, -2.0), head(b, 1.22), f, s.a, { fov: 42, roll: -0.06 }, 1.6, 6), f, W(3, "worst"), 0.8),
      subjects: [["the merchant", head(b), 0.2]] }; },
  // Ship coal to Newcastle: another merchant says it, holding up a lump of coal
  coal: (s, f) => { const p = M3_T, hand = add(p, -0.3, 1.38, -0.32);
    return { light: "tavern", dof: 1, closeup: true, focus: head(p), key: LAMP_K, people: [P("m3", p, "grin", 0, { hw: [hand] })],
      cards: [{ kind: "coal", p: add(hand, -0.02, 0.1, -0.04), spin: 0.3, s: 1.1 }],
      cam: snap(add(p, -0.2, 1.3, -2.2), add(p, -0.15, 1.22, 0), f, s.a, { fov: 44, roll: 0.05 }, 1.6, 6),
      subjects: [["the merchant", head(p), 0.2], ["the coal", add(hand, -0.02, 0.1, -0.04), 0.06]] }; },
  // He did...: on the Newburyport wharf, the coal heap and the schooner loaded with coal, Dexter nodding
  load: (s, f) => { const p = WR(10.0, 18.2);
    return { light: "port", dof: 0.6, focus: head(p), coal: true, people: [P("dexter", p, "grin", 1, { wave: 0.6 }), P("s2", WR(11.4, 19.6), "neutral", -1)],
      cam: mv(s, f, { pos: WR(8.6, 13.6, 1.5), look: WR(11.4, 21, 1.1), fov: 50, roll: 0.04 }, { pos: WR(8.9, 14.4, 1.8), look: WR(11.6, 22, 1.0), fov: 50, roll: -0.03 }),
      subjects: [["Dexter", head(p), 0.2], ["the coal", Rv(COALP[0], COALP[1] + 0.7, COALP[2]), 0.6]] }; },
  // ...and it landed during a miners' strike: Newcastle, grey; idle miners by the strike board as the schooner lies in
  strike: (s, f) => { const a = WR(10.4, 9.0), b = WR(11.3, 9.5), c = WR(11.75, 8.8);
    return { light: "newcastle", dof: 0.5, focus: WR(11, 11.5, 1.6),
      people: [P("mn1", a, "stern", 1), P("mn2", b, "stern", -1), P("mn3", c, "neutral", -1)],
      cam: kick(mv(s, f, { pos: WR(11.0, 4.2, 1.6), look: WR(11.1, 12, 1.6), fov: 52, roll: -0.04 }, { pos: WR(11.1, 4.8, 1.7), look: WR(11.2, 12.4, 1.6), fov: 52, roll: 0.03 }), f, W(4, "strike"), 0.8),
      subjects: [["the strike board", Rv(11, WHARF.y + 2.0, 10.33), 0.3], ["the miners", head(b), 0.3], ["the schooner", Rv(SHIP[0] - 4, 1.5, SHIP[2]), 1.5]] }; },
  // It sold at a premium: a buyer hands coins over a lump of coal; coins flash
  sold: (s, f) => { const tt = t(f - s.a), b = WR(10.6, 12.4), m = WR(11.7, 12.8), hb = add(b, 0.32, 1.25, -0.3), hm = add(m, -0.32, 1.25, -0.3);
    return { light: "newcastle", dof: 1, focus: L3(head(b), head(m), 0.5), coal: true, nostrike: true, people: [P("buyer", b, "grin", -1, { hw: [hb] }), P("mn1", m, "laugh", 1, { hw: [hm] })],
      cards: [{ kind: "coal", p: add(hb, 0.02, 0.09, -0.04), spin: 0.2, s: 1.1 }, ...rain("coin", add(hm, 0, -0.1, 0), tt, 10, 0.3, 0.5, 0.2, 0.7, 0.8)],
      cam: kick(mv(s, f, { pos: WR(11.15, 8.4, 1.35), look: WR(11.15, 12.6, 1.25), fov: 48, roll: 0.05 }, { pos: WR(11.15, 8.8, 1.35), look: WR(11.15, 12.6, 1.25), fov: 48, roll: -0.04 }), f, W(4, "premium"), 0.8),
      subjects: [["the buyer", head(b), 0.2], ["the coins", add(hm, 0, 0.15, 0), 0.1]] }; },
  // Bed warmers to the West Indies?: back in the tavern, a merchant holds up a bed warmer, laughing
  pans: (s, f) => { const p = M4_T, hand = add(p, -0.3, 1.0, -0.25);
    return { light: "tavern", dof: 1, closeup: true, focus: head(p), key: LAMP_K, people: [P("m4", p, "laugh", 0, { hw: [hand] })],
      pans: [{ hand, dir: [-0.5, 0.86, -0.1], roll: Math.PI / 2 }],
      cam: kick(snap(add(p, -0.4, 1.35, -3.1), add(p, -0.4, 1.3, 0), f, s.a, { fov: 46, roll: 0.06 }, 1.6, 6), f, W(5, "indies"), 0.7),
      subjects: [["the merchant", head(p), 0.2], ["the bed warmer", add(hand, -0.48, 0.82, -0.1), 0.12]] }; },
  // Dexter bragged he shipped 42,000: the West Indies wharf, the crates piled high, Dexter on top of the cargo with a pan
  shipped: (s, f) => { const p = WR(9.9, 14.6);
    return { light: "tropic", dof: 0.5, focus: head(p), pans3: true, people: [P("dexter", p, "grin", 1, { hw: [holdUp(p, 1).hand] })],
      pans: [holdUp(p, 1)],
      cam: mv(s, f, { pos: WR(9.0, 9.4, 1.0), look: WR(10.9, 15.8, 1.6), fov: 52, roll: -0.05 }, { pos: WR(9.3, 10.2, 1.2), look: WR(11.0, 16.0, 1.6), fov: 52, roll: 0.04 }),
      subjects: [["Dexter", head(p), 0.2], ["the crates", add(Rv(CRATES[0], CRATES[1], CRATES[2]), 0, 0.9, 0), 0.6]] }; },
  // They used them for cooking: an islander cooks over the fire in a bed warmer's pan, smoke rising
  cook: (s, f) => { const tt = t(f - s.a), fc = Rv(FIRE[0], 0, FIRE[2]), cook = Rv(FIRE[0] + 0.95, 0, FIRE[2] + 0.45), hand = add(cook, -0.42, 1.0, -0.15);
    return { light: "tropic", dof: 1, focus: add(fc, 0, 0.6, -0.4), people: [P("i2", cook, "grin", 0, { hw: [hand] }), P("i3", Rv(FIRE[0] - 0.15, 0, FIRE[2] + 1.9), "grin", 1)],
      pans: [{ hand, dir: [-0.6, -0.67, -0.45] }], puffs: fire(add(fc, 0, 0.05, 0), tt),
      cam: mv(s, f, { pos: Rv(FIRE[0] + 0.45, 2.3, FIRE[2] - 4.2), look: add(fc, 0.45, 0.75, 0.6), fov: 48, roll: 0.05 }, { pos: Rv(FIRE[0] + 0.45, 2.2, FIRE[2] - 3.8), look: add(fc, 0.45, 0.8, 0.6), fov: 48, roll: -0.04 }),
      subjects: [["the cook", head(cook), 0.2], ["the pan over the fire", add(hand, -0.57, -0.64, -0.43), 0.24]] }; },
  // ...and he cleared 79%: Dexter laughing, close, the pan over his shoulder
  cleared: (s, f) => { const p = DEX_HOOK;
    return { light: "tropic", dof: 1, closeup: true, focus: head(p), pans3: true, people: [P("dexter", p, "laugh", 0, { headTilt: -0.1, hw: [add(p, 0.3, 1.2, -0.2)] })],
      pans: [{ hand: add(p, 0.3, 1.2, -0.2), dir: [0.45, 0.6, 0.66] }],
      cam: kick(snap(add(p, 0.35, 1.3, -2.4), head(p, 1.25), f, s.a, { fov: 44, roll: 0.06 }, 1.6, 6), f, W(5, "79"), 1.0),
      subjects: [["Dexter", head(p), 0.2]] }; },
  // So he bought a mansion: from High Street, crane up through the arch to the house, its cupola and gold eagle
  mansion: (s, f) => ({ light: "mansion", dof: 0, focus: Mn(0, 6, HOUSE_Z), people: statues((_n, i) => i < 3 || [4, 5, 8, 9].includes(i - 3)),
    cam: mv(s, f, { pos: Mn(0.6, 1.6, -11.0), look: Mn(0, 5.5, HOUSE_Z), fov: 54, roll: 0.04 }, { pos: Mn(0.4, 4.6, -10.0), look: Mn(0, 7.5, HOUSE_Z), fov: 56, roll: -0.03 }),
    subjects: [["the mansion", Mn(0, 6, HOUSE_Z - 0.2), 3], ["the gold eagle", Mn(0, 12.9 + 2.1, HOUSE_Z + 5), 0.5]] }),
  // ...called himself Lord Timothy Dexter: on his steps, chin up, cane in hand
  lord: (s, f) => { const p = Mn(0.2, 0.8, HOUSE_Z - 1.2), hand = add(p, -0.34, 0.95, -0.25);
    return { light: "mansion", dof: 1, focus: head(p), people: [P("dexter", p, "grin", 0, { headTilt: -0.12, hw: [hand] })], canes: [{ g: hand, b: add(p, -0.42, 0.02, -0.4) }],
      cam: kick(mv(s, f, { pos: add(p, 0.4, 0.7, -3.6), look: head(p, 1.55), fov: 46, roll: -0.05 }, { pos: add(p, 0.3, 0.6, -3.1), look: head(p, 1.6), fov: 46, roll: 0.04 }), f, W(6, "lord"), 0.8),
      subjects: [["Dexter", head(p), 0.2]] }; },
  // ...and filled the garden with about 40 wooden statues: tracking low up the path between the columns
  statues: (s, f) => ({ light: "mansion", dof: 0, focus: Mn(0, 4.5, 8), people: statues((_n, i) => i >= 3 && COLS[i - 3][0] > 0 && i - 3 !== 0 && i - 3 !== 6),
    cam: mv(s, f, { pos: Mn(-0.6, 2.4, -1.0), look: Mn(6.0, 4.6, 9.5), fov: 56, roll: 0.06 }, { pos: Mn(-0.4, 2.6, 1.0), look: Mn(6.2, 4.8, 11.5), fov: 56, roll: -0.04 }),
    subjects: [["the statues", Mn(4.2, STAT_Y + 1, 7.5), 0.5]] }),
  // Washington.: low, up at the arch, Washington in the middle
  wash: (s, f) => ({ light: "mansion", dof: 1, focus: head(Mn(0, ARCH_Y, ARCH_Z)), people: statues((n) => ["washington", "adams", "jefferson"].includes(n)),
    cam: snap(Mn(0.2, 3.2, ARCH_Z - 8.2), Mn(0, ARCH_Y + 0.7, ARCH_Z), f, s.a, { fov: 46, roll: 0.05 }, 1.3, 6),
    subjects: [["Washington", head(Mn(0, ARCH_Y, ARCH_Z)), 0.2]] }),
  // Jefferson.: whip to Jefferson, close
  jeff: (s, f) => { const p = Mn(-1.45, ARCH_Y, ARCH_Z);
    return { light: "mansion", dof: 1, closeup: true, focus: head(p), people: statues((n) => n === "jefferson"),
      cam: snap(add(p, -0.2, 0.2, -2.3), head(p, 1.45), f, s.a, { fov: 44, roll: -0.06 }, 1.5, 6),
      subjects: [["Jefferson", head(p), 0.2]] }; },
  // And himself.: snap to Dexter's own statue on its column, the real Dexter below pointing up at it
  himself: (s, f) => { const me = Mn(COLS[DEX_COL][0] - 0.2, 0, COLS[DEX_COL][1] - 1.6);
    return { light: "mansion", dof: 0.6, focus: add(DEXSTAT, 0, 1.0, 0), people: [...statues((n) => n === "dexstat"), P("dexter", me, "grin", -1, { wave: 1, headTilt: -0.15 })],
      cam: kick(snap(Mn(1.6, 1.6, 1.2), add(DEXSTAT, 0, -1.6, 0), f, s.a, { fov: 58, roll: 0.05 }, 1.4, 6), f, Wn(6, "himself", 2), 0.9),
      subjects: [["Dexter's statue", add(DEXSTAT, 0, 1.5, 0), 0.2], ["Dexter", head(me), 0.2]] }; },
  // His statue's sign said...: up the column from the sign to the statue
  sign: (s, f) => ({ light: "mansion", dof: 1, focus: SIGN,
    cam: mv(s, f, { pos: add(SIGN, 0.25, -0.15, -3.5), look: add(SIGN, 0, -0.12, 0), fov: 46, roll: -0.04 }, { pos: add(SIGN, 0.15, -0.15, -3.9), look: add(SIGN, 0, -0.12, 0), fov: 46, roll: 0.03 }),
    subjects: [["the sign", SIGN, 0.15]] }),
  // ...the greatest philosopher in the Western world: Dexter under his statue, chest out, the camera circling
  proud: (s, f) => { const me = Mn(COLS[DEX_COL][0] - 0.1, 0, COLS[DEX_COL][1] - 1.3);
    return { light: "mansion", dof: 0.5, focus: head(me), people: [...statues((n) => n === "dexstat"), P("dexter", me, "grin", 0, { headTilt: -0.14 })],
      cam: orbit(s, f, add(me, 0.05, 2.9, 0.6), [-52, -34], [5.8, 5.6], [-1.1, -1.0], 58),
      subjects: [["Dexter", head(me), 0.2], ["Dexter's statue", add(DEXSTAT, 0, 1.4, 0), 0.2]] }; },
  // Then he faked his own death: grey day, the coffin on its trestles on the path, two mourners with bowed heads
  coffin: (s, f) => ({ light: "wake", dof: 0.8, focus: Mn(0, 1.0, COFFIN[2]), people: [P("t1", Mn(-0.55, 0, COFFIN[2] - 1.7), "nervous", 1, { headTilt: 0.15 }), P("t2", Mn(0.6, 0, COFFIN[2] - 1.8), "nervous", -1, { headTilt: 0.15 })],
    cam: mv(s, f, { pos: Mn(0.3, 1.6, COFFIN[2] - 6.6), look: Mn(0, 1.0, COFFIN[2] - 0.8), fov: 46, roll: -0.04 }, { pos: Mn(0.25, 1.6, COFFIN[2] - 6.0), look: Mn(0, 1.0, COFFIN[2] - 0.8), fov: 46, roll: 0.03 }),
    subjects: [["the coffin", Mn(0, 1.0, COFFIN[2] - 0.44), 0.1]] }),
  // About 3,000 people came: crane up over the crowd filling the lawn round the coffin
  crowd: (s, f) => ({ light: "wake", dof: 0, focus: Mn(0, 1, COFFIN[2] - 3), people: mourners(undefined, (n) => { const k = n % 4, row = Math.floor((n % 24) / 4); return k === 3 || (k === 2 && row % 2 === 1); }),
    cam: mv(s, f, { pos: Mn(0.3, 8.5, COFFIN[2] - 15), look: Mn(0, 0.2, COFFIN[2] - 4), fov: 66, roll: 0.03 }, { pos: Mn(0.2, 11.5, COFFIN[2] - 15.5), look: Mn(0, 0.0, COFFIN[2] - 4), fov: 66, roll: -0.03 }),
    subjects: [["the crowd", Mn(-2.2, 1.4, COFFIN[2] - 4.5), 1], ["the coffin", Mn(0, 1.24, COFFIN[2]), 0.1]] }),
  // But his wife didn't cry enough...: Elizabeth among the weeping mourners, dry-eyed, whistling
  wife: (s, f) => ({ light: "wake", dof: 1, focus: head(WIFE), people: [P("wife", WIFE, "whistle", 0), P("t4", Mn(-0.75, 0, COFFIN[2] - 0.4), "nervous", -1, { headTilt: 0.15 }), P("t6", Mn(-2.05, 0, COFFIN[2] - 0.3), "nervous", 1, { headTilt: 0.12 })],
    cam: mv(s, f, { pos: add(WIFE, 0.0, 1.35, -3.6), look: head(WIFE, 1.25), fov: 46, roll: 0.05 }, { pos: add(WIFE, 0.0, 1.35, -3.2), look: head(WIFE, 1.25), fov: 46, roll: -0.04 }),
    subjects: [["his wife", head(WIFE), 0.2]] }),
  // ...so the dead man came out of hiding: Dexter bursts out of his front door, cane raised, at the lens
  hiding: (s, f) => { const tt = t(f - s.a), p = add(DOOR, 0, 0, -Math.min(1.6, 1.8 * tt)), hand = add(p, -0.3, 2.0, -0.15);
    return { light: "wake", dof: 1, focus: head(p), people: [P("dexter", p, "shock", 0, { hw: [hand], headTilt: -0.08 })], canes: [{ g: hand, b: add(hand, -0.35, 0.75, 0.2) }],
      cam: kick(mv(s, f, { pos: add(DOOR, 0.3, 0.7, -5.0), look: head(DOOR, 1.25), fov: 48, roll: -0.06 }, { pos: add(DOOR, 0.25, 0.6, -4.2), look: head(add(DOOR, 0, 0, -1.4), 1.25), fov: 46, roll: 0.05 }), f, s.a + 3, 1.0),
      subjects: [["Dexter", head(p), 0.2], ["the cane", hand, 0.1]] }; },
  // ...and caned her: his wife starts away, Dexter behind her with the cane up (no blow is shown)
  caned: (s, f) => { const w = add(WIFE, 0.35, 0, 0.1), d = add(WIFE, -0.45, 0, 1.1), hand = add(d, 0.28, 2.05, -0.1);
    return { light: "wake", dof: 1, focus: L3(head(w), head(d), 0.5), people: [P("wife", w, "shock", -1, { facing: -1 }), P("dexter", d, "shock", 1, { hw: [hand] })], canes: [{ g: hand, b: add(hand, 0.25, 0.8, 0.15) }],
      cam: kick(mv(s, f, { pos: add(WIFE, -0.05, 1.4, -4.4), look: add(L3(head(w), head(d), 0.5), 0, -0.25, 0), fov: 46, roll: 0.06 }, { pos: add(WIFE, -0.05, 1.4, -4.0), look: add(L3(head(w), head(d), 0.5), 0, -0.25, 0), fov: 46, roll: -0.05 }), f, W(8, "caned"), 0.8),
      subjects: [["his wife", head(w), 0.2], ["Dexter", head(d), 0.2]] }; },
  // He even wrote a book with no punctuation: the study, Dexter at his standing desk writing, the page on the board
  book: (s, f) => { const hand = Rm(DESK[0] - 0.25, DESK_Y + 0.06, DESK[2] + 0.05);
    return { light: "study", dof: 0.6, focus: head(DESK_P), key: CANDLE_K, page: "pickle", people: [P("dexter", DESK_P, "grin", 0, { hw: [hand] })],
      cam: mv(s, f, { pos: Rm(-0.8, 1.5, DESK[2] - 4.6), look: Rm(0, 1.6, DESK[2]), fov: 52, roll: 0.05 }, { pos: Rm(-0.6, 1.55, DESK[2] - 4.1), look: Rm(0, 1.62, DESK[2]), fov: 52, roll: -0.03 }),
      subjects: [["Dexter", head(DESK_P), 0.2], ["the page", BOARD, 0.2]] }; },
  // When readers complained: two readers in the tavern, frowning over his pages
  readers: (s, f) => { const a = Rm(TABLE[0] - 0.25, 0, TABLE[2] - 0.75), b = Rm(TABLE[0] + 0.45, 0, TABLE[2] - 0.55), ha = add(a, -0.28, 1.3, -0.3), hb = add(b, 0.28, 1.3, -0.3);
    return { light: "tavern", dof: 1, focus: L3(head(a), head(b), 0.5), key: LAMP_K, people: [P("t3", a, "shock", 0, { hw: [ha] }), P("t5", b, "stern", 0, { hw: [hb] })],
      cards: [{ kind: "paper", p: add(ha, -0.02, 0.12, -0.03), spin: 0.1, s: 1.1 }, { kind: "paper", p: add(hb, 0.02, 0.12, -0.03), spin: -0.12, s: 1.1 }],
      cam: mv(s, f, { pos: Rm(TABLE[0] + 0.1, 1.4, TABLE[2] - 4.4), look: Rm(TABLE[0] + 0.1, 1.3, TABLE[2] - 0.6), fov: 46, roll: -0.05 }, { pos: Rm(TABLE[0] + 0.1, 1.4, TABLE[2] - 4.0), look: Rm(TABLE[0] + 0.1, 1.3, TABLE[2] - 0.6), fov: 46, roll: 0.04 }),
      subjects: [["the readers", L3(head(a), head(b), 0.5), 0.3]] }; },
  // ...he added a page of just periods and commas: push in on the board, the page of stops; Dexter beside it, proud
  punct: (s, f) => { const me = Rm(-0.75, 0, 2.2);
    return { light: "study", dof: 0.5, focus: BOARD, key: CANDLE_K, page: "punct", people: [P("dexter", me, "grin", -1, { wave: 0.8 })],
      cam: kick(mv(s, f, { pos: Rm(-0.5, 1.6, -1.6), look: Rm(-0.4, 1.55, 3.8), fov: 54, roll: -0.04 }, { pos: Rm(-0.4, 1.6, -0.8), look: Rm(-0.35, 1.58, 3.8), fov: 54, roll: 0.03 }), f, W(9, "commas"), 0.7),
      subjects: [["the page of punctuation", BOARD, 0.2], ["Dexter", head(me), 0.2]] }; },
  // ...and told them to salt and pepper it as they pleased: he shakes a pepper pot at us and the marks fly at the lens
  pepper: (s, f) => { const tt = t(f - s.a), p = Rm(0.1, 0, 0.9), hand = add(p, -0.3, 1.45, -0.4), cp = add(p, -0.05, 1.5, -2.3);
    return { light: "study", dof: 1, closeup: true, focus: head(p), key: CANDLE_K, page: "punct", people: [P("dexter", p, "laugh", 0, { hw: [add(hand, 0, 0.03 * Math.sin(tt * 30), 0)] })],
      pot: add(hand, -0.02, 0.02 + 0.03 * Math.sin(tt * 30), -0.05), cards: fling(add(hand, 0, 0.15, -0.1), cp, tt, 18),
      cam: kick({ pos: add(cp, 0, -0.15, 0), look: head(p, 1.2), fov: 46, roll: 0.04 * Math.sin(tt * 1.5) }, f, W(9, "pepper"), 0.8),
      subjects: [["Dexter", head(p), 0.2], ["the pepper pot", add(hand, -0.02, 0.1, -0.05), 0.06]] }; },
  // So... was he a fool,: Dexter on the island wharf with his bed warmer, the camera circling
  fool: (s, f) => { const p = DEX_HOOK;
    return { ...hookState(), light: "tropic", dof: 1, focus: head(p), people: [P("dexter", p, "whistle", 0, { hw: [holdUp(p).hand] })],
      cam: mv(s, f, { pos: add(p, 0.5, 1.3, -3.3), look: add(p, -0.35, 1.2, 0), fov: 46, roll: 0.04 }, { pos: add(p, -0.1, 1.3, -3.1), look: add(p, -0.35, 1.2, 0), fov: 46, roll: -0.03 }), subjects: [["Dexter", head(p), 0.2]] } as St3; },
  // ...or the luckiest man who ever lived?: snap close on his grin
  lucky: (s, f) => { const p = DEX_HOOK;
    return { ...hookState(), light: "tropic", dof: 1, closeup: true, focus: head(p), people: [P("dexter", p, "grin", 0, { hw: [holdUp(p).hand], headTilt: 0.1 })],
      cam: kick(snap(add(p, -0.35, 1.3, -2.9), add(p, -0.35, 1.22, 0), f, s.a, { fov: 46, roll: -0.05 }, 1.5, 6), f, W(10, "luckiest"), 0.8) } as St3; },
  // loop: back to the wharf, settling onto the opening frame (the subscribe card plays here)
  end: (s, f) => { const h0 = hookCam(0), hold = { pos: add(DEX_HOOK, 0.2, 1.3, -3.4), look: add(DEX_HOOK, 0.3, 1.2, 0), fov: 46, roll: 0.02 };
    return { ...hookState(), light: "tropic", dof: 1, closeup: true, focus: head(DEX_HOOK), subjects: [["Dexter", head(DEX_HOOK), 0.2]],
      cam: f < s.b - 16 ? move({ ...orb(add(DEX_HOOK, -0.3, 1.2, 0), 22, 4.2, 0.2), fov: 46, roll: 0.0 }, hold, f, s.a, s.a + 24, smooth, 0)
        : move(hold, h0, f, s.b - 16, s.b - 5, smooth, 0) } as St3; },
};
/** the house kit, for the long-form */
export { clamp01, smooth, expo, L3, move, orb, orbit, snap, kick, t as secs, P, walker, add, rain, stack, fling, fire, holdUp, statues, mourners, hookState, hookCam, head, DEX_HOOK, SHOP_D, DEX_T, M1_T, M2_T, M3_T, M4_T, TBL, LAMP_K, DESK_P, BOARD, CANDLE_K, DEXSTAT, SIGN, DOOR, WIFE, WR, STAT_Y, ARCH_Y, Mn };

/** every shot is hand-held: a slow sway on top of its move (not the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, loop = s.g === "hook" ? clamp01(f / 20) : s.g === "end" ? clamp01((TOTAL - 3 - f) / 20) : 1, sw = 0.0032 * Math.min(d, 60) * loop;
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["tropics", "shop", "war", "laugh", "coal", "strike", "pans", "cook", "mansion", "jeff", "coffin", "hiding", "book", "readers", "fool"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps (Shorts: nothing important above y = 19 %) ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "42k", kind: "stamp", text: "42,000", f0: W(0, "42000"), f1: B("hook"), y: 50, rot: -4, bg: "#e0a32e", fg: "#1e1a22", size: 150 },
  { key: "trop", kind: "call", text: "TO THE TROPICS", f0: S0("tropics") + 2, f1: B("tropics"), y: 24, fg: "#ffd166", size: 104 },
  { key: "dex", kind: "pill", text: "TIMOTHY DEXTER", sub: "Newburyport, Mass.", f0: W(1, "timothy"), f1: B("shop"), y: 22, size: 78 },
  { key: "spell", kind: "call", text: "COULD BARELY SPELL", f0: W(1, "barely"), f1: B("spell"), y: 24, fg: "#ffd166", size: 92 },
  { key: "worthless", kind: "stamp", text: "WORTHLESS?", f0: W(1, "worthless"), f1: B("buy"), y: 24, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 120 },
  { key: "full", kind: "stamp", text: "PAID IN FULL", f0: W(2, "full"), f1: B("paid"), y: 24, rot: 4, bg: "#2f9a57", fg: "#ffffff", size: 120 },
  { key: "rich", kind: "call", text: "RICH!", f0: W(2, "rich"), f1: B("rich"), y: 24, fg: "#ffd166", size: 160 },
  { key: "worst", kind: "stamp", text: "THE WORST ADVICE", f0: W(3, "worst"), f1: B("worst"), y: 24, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 100 },
  { key: "nc", kind: "pill", text: "NEWCASTLE", sub: "England's coal capital", f0: W(4, "newcastle"), f1: B("coal"), y: 22, size: 84 },
  { key: "strike", kind: "stamp", text: "MINERS ON STRIKE", f0: W(4, "strike"), f1: B("strike"), y: 24, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 100 },
  { key: "sold", kind: "stamp", text: "SOLD!", f0: W(4, "premium"), f1: B("sold"), y: 24, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 150 },
  { key: "wi", kind: "pill", text: "THE WEST INDIES", sub: "where it never gets cold", f0: W(5, "west"), f1: B("pans"), y: 22, size: 76 },
  { key: "42k2", kind: "stamp", text: "42,000", f0: W(5, "42000"), f1: B("shipped"), y: 24, rot: 4, bg: "#e0a32e", fg: "#1e1a22", size: 150 },
  { key: "79", kind: "stamp", text: "79% PROFIT", f0: W(5, "79"), f1: B("cleared"), y: 24, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 120 },
  { key: "lord", kind: "pill", text: "\"LORD\" TIMOTHY DEXTER", f0: W(6, "lord"), f1: B("lord"), y: 22, size: 64 },
  { key: "40", kind: "call", text: "40 STATUES", f0: W(6, "40"), f1: B("statues"), y: 24, fg: "#ffd166", size: 120 },
  { key: "wash", kind: "pill", text: "WASHINGTON", f0: W(6, "washington"), f1: B("wash"), y: 22, size: 84 },
  { key: "jeff", kind: "pill", text: "JEFFERSON", f0: W(6, "jefferson"), f1: B("jeff"), y: 22, size: 84 },
  { key: "me", kind: "stamp", text: "AND HIMSELF", f0: Wn(6, "himself", 2), f1: B("himself"), y: 46, rot: -4, bg: "#e0332e", fg: "#ffffff", size: 120 },
  { key: "east", kind: "pill", text: "FIRST IN THE EAST", f0: W(7, "east"), f1: W(7, "west"), y: 22, size: 76 },
  { key: "west", kind: "pill", text: "FIRST IN THE WEST", f0: W(7, "west"), f1: W(7, "greatest"), y: 22, size: 76 },
  { key: "phil", kind: "pill", text: "THE GREATEST PHILOSOPHER", sub: "in the Western world", f0: W(7, "greatest"), f1: B("proud"), y: 44, size: 56 },
  { key: "fake", kind: "stamp", text: "FAKE FUNERAL", f0: W(8, "faked"), f1: B("coffin"), y: 24, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 110 },
  { key: "3000", kind: "call", text: "3,000 MOURNERS", f0: W(8, "3000"), f1: B("crowd"), y: 24, fg: "#ffd166", size: 100 },
  { key: "cry", kind: "call", text: "NOT ONE TEAR", f0: W(8, "cry"), f1: B("wife"), y: 24, fg: "#ffd166", size: 110 },
  { key: "alive", kind: "stamp", text: "NOT DEAD", f0: S0("hiding") + 3, f1: B("hiding"), y: 24, rot: 4, bg: "#e0332e", fg: "#ffffff", size: 130 },
  { key: "nop", kind: "stamp", text: "NO PUNCTUATION", f0: W(9, "punctuation"), f1: B("book"), y: 24, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 100 },
  { key: "salt", kind: "call", text: "SALT AND PEPPER IT", f0: W(9, "salt"), f1: B("pepper"), y: 24, fg: "#ffd166", size: 96 },
  { key: "fool", kind: "stamp", text: "A FOOL?", f0: W(10, "fool"), f1: B("fool"), y: 24, rot: -4, bg: "#2f2a3a", fg: "#ffffff", size: 140 },
  { key: "lucky", kind: "stamp", text: "OR JUST LUCKY?", f0: W(10, "luckiest"), f1: B("lucky"), y: 24, rot: 4, bg: "#e0a32e", fg: "#1e1a22", size: 110 },
] as Item[]).filter((i) => i.f1 > i.f0);
void TAVERN; void BAR;
