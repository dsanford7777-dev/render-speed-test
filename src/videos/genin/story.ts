// "Why a Hat Maker Paid $225 for One Concert Ticket" (Paradox Town #11): every shot's camera, cast and props, frame by
// frame, in the 1850 world built for the phone long-form (phoneif/world3d.ts): Broadway with Barnum's museum and Genin's
// hat shop, the Canal Street wharf with the Atlantic, and the room dressed as Castle Garden (stage + benches) or Barnum's
// office. Cuts come from the narration (timeline.ts). The film opens and ends on Genin outside his shop, so it loops.
// Broadway: shop front at z = 12 (x -16..-6.4), cameras on the -z side looking +z (world +x = screen LEFT).
import { Expr } from "../bridge/toon";
import { SEG_TIMES, TOTAL, wordAt, FPS } from "./timeline";
import type { V3, Cam, Person3, St3, Card } from "../phoneif/story3d.types";
import { PIER, SW, Rm, Bw } from "../phoneif/story3d.types";
import { SHIP } from "../phoneif/world3d";
export type { V3, St3 };

export type ShotDef = { id: number; g: string; a: number; b: number; k: "3d" };
const A = (seg: number) => (seg === 0 ? 0 : Math.round(SEG_TIMES[seg][0] * FPS) - 2);
const W = (seg: number, w: string) => wordAt(seg, w);
const CUTS: [string, number][] = [
  ["hook", 0], ["ticketclose", W(0, "for") - 2], ["hall-bid", W(0, "concert") - 2],
  ["next", A(1)],
  ["museum", A(2)], ["barnum", W(2, "Barnum") - 2], ["lind", W(2, "Jenny") - 2],
  ["packed", A(3)], ["gavel", W(3, "auctioned") - 2],
  ["winner", A(4)], ["shop", W(4, "hatter") - 2],
  ["paper", A(5)], ["seat", W(5, "seat") - 2],
  ["hathold", A(6)],
  ["wink", A(7)], ["headline", W(7, "He") - 2],
  ["flurry", A(8)], ["newsboy", W(8, "printed") - 2],
  ["hats-off", A(9)], ["peek", W(9, "check") - 2],
  ["office", A(10)], ["queue", W(10, "foundation") - 2],
  ["again", A(11)],
  ["ship", A(12)], ["pier", W(12, "Genin") - 2], ["pile", W(12, "pile") - 2],
  ["parade", A(13)],
  ["sellout", A(14)], ["end", W(14, "sold") - 2],
];
export const SHOTS: ShotDef[] = CUTS.map(([g, a], i) => ({ id: i + 1, g, a, b: i === CUTS.length - 1 ? TOTAL : CUTS[i + 1][1], k: "3d" as const }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

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
const walker = (who: string, x0: number, y: number, z: number, v: number, tt: number, expr: Expr = "neutral", k = 0, extra = true): Person3 => {
  const d = Math.abs(v) * tt + k * 0.37;
  return { who, p: [x0 + v * tt, y, z], expr, side: { phase: ((d / 1.6) % 1 + 1) % 1, mirror: v < 0, stride: 0.8 }, extra };
};
const bw = (q: Person3): Person3 => ({ ...q, p: Bw(q.p[0], q.p[1], q.p[2]) });
const crowd = (n: number, x0: number, x1: number, z0: number, z1: number, seed: number, ex: (i: number) => Expr, y = 0, skip = 0, keep: (p: V3) => boolean = () => true, wave?: number, pre = "c"): Person3[] => {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cols = Math.max(1, Math.round(Math.sqrt((n * (x1 - x0)) / Math.max(0.5, z1 - z0)))), rows = Math.ceil(n / cols), out: Person3[] = [];
  for (let i = 0; i < n; i++) {
    const cx = i % cols, rz = Math.floor(i / cols);
    const p: V3 = [x0 + ((cx + 0.5 + (r() - 0.5) * 0.6) * (x1 - x0)) / cols, y, z0 + ((rz + 0.5 + (r() - 0.5) * 0.5) * (z1 - z0)) / rows];
    if (!keep(p)) continue;
    out.push({ who: `${pre}${(i + skip) % 48}`, p, expr: ex(i), look: (i % 3) - 1, extra: true, wave: wave !== undefined && i % 2 === 0 ? wave : undefined });
  }
  return out;
};
const CHEER: Expr[] = ["laugh", "grin", "smile", "laugh", "relief_open", "grin"], BID: Expr[] = ["shock", "grin", "nervous", "laugh", "stern"];
const pick = (a: Expr[]) => (i: number) => a[(i * 5 + 2) % a.length];

// ---------------- places ----------------
const GEN: V3 = Bw(-11, SW, 10.3);                 // Genin, on the sidewalk outside his shop
const TICKET: V3 = [GEN[0] + 0.32, GEN[1] + 1.45, GEN[2] - 0.22];
/** the hook's camera, and the end's last frames land on it exactly (the loop) */
const HOOK_CAM: Cam = { pos: [GEN[0] + 0.55, GEN[1] + 1.35, GEN[2] - 2.75], look: [GEN[0] + 0.12, GEN[1] + 1.32, GEN[2]], fov: 40, roll: -0.05 };
const HALL: [string, string] = ["gnhall", "CASTLE GARDEN · TICKET AUCTION"], OFFICE: [string, string] = ["gnoffice", "AMERICAN MUSEUM · OFFICE"];
const STAGE_Y = 0.76, AUCT: V3 = Rm(0, STAGE_Y, 2.75), GEN_HALL: V3 = Rm(-1.1, 0, -0.05);
/** bidders standing in the aisles between the benches */
const BIDDERS = (n: number, seed: number, wave?: number, skip = 0) => crowd(n, -5.6, 5.6, -4.8, -0.2, seed, pick(BID), 0, skip, (p) => Math.abs(p[0] - GEN_HALL[0] + 1400) > 0.8 || Math.abs(p[2] - GEN_HALL[2] + 1400) > 0.8, wave).map((q) => ({ ...q, p: Rm(q.p[0], q.p[1], q.p[2]) }));
const lindOn = (u: number): V3 => { const k = clamp01(u); return [8, SHIP.deck + 0.1 + (PIER - SHIP.deck - 0.1) * k, SHIP.z0 - 0.4 - 5.6 * k]; };
const pierFree = (p: V3) => !(Math.abs(p[0] + 20) < 0.9 && Math.abs(p[2] + 4) < 0.9) && !(Math.abs(p[0] + 8) < 0.9 && Math.abs(p[2] + 4) < 0.9) && !(p[0] > 6.2 && p[0] < 9.8 && p[2] > 2.6);
const Pr = (x: number, z: number): V3 => [x, PIER, z];
const DAY = { light: "day" as const };
const ticket = (p: V3, s = 0.34, spin = 0.08): Card => ({ kind: "ticket", p, spin, s });

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // a hat maker, holding up the ticket, outside his shop
  hook: (s, f) => ({ ...DAY, dof: 6, closeup: true, focus: TICKET,
    cam: kick(move({ ...HOOK_CAM }, { pos: [GEN[0] + 0.35, GEN[1] + 1.4, GEN[2] - 2.3], look: [GEN[0] + 0.14, GEN[1] + 1.36, GEN[2]], fov: 40, roll: 0.03 }, f, s.a, s.b, smooth, 0), f, W(0, "$225") - 1, 0.7),
    people: [P("genin", GEN, "grin", 0, { hw: [TICKET] })], cards: [ticket(TICKET)] }),
  ticketclose: (s, f) => ({ ...DAY, dof: 14, closeup: true, focus: TICKET,
    cam: kick(snap([TICKET[0] + 0.12, TICKET[1] + 0.05, TICKET[2] - 0.75], TICKET, f, s.a, { fov: 40, roll: 0.1 }, 1.8, 5), f, s.a + 3, 0.5),
    people: [P("genin", GEN, "grin", 0, { hw: [TICKET], extra: true })], cards: [ticket(TICKET)], subjects: [["the ticket", TICKET, 0.1]] }),
  "hall-bid": (s, f) => ({ ...DAY, dof: 3, room: { sign: HALL, hall: true },
    cam: orbit(s, f, Rm(0, 1.3, -1.6), [-30, 14], [8.6, 7.4], [2.0, 1.0], 54, [0.06, -0.04]),
    people: [P("auctioneer", AUCT, "grin", 0, { wave: 0.9 }), P("genin", GEN_HALL, "stern", 0, { wave: 0.95 }), ...BIDDERS(26, 11, 0.85)], subjects: [["the room sign", Rm(0, 3.3, 3.4), 0.3]] }),
  next: (s, f) => ({ ...DAY, dof: 6,
    room: { sign: HALL, hall: true },
    cam: kick(snap(Rm(0.8, 2.3, -0.4), Rm(0, 2.2, 2.75), f, s.a, { fov: 44, roll: 0.08 }, 1.6, 5), f, s.a + 4, 0.6),
    people: [P("auctioneer", AUCT, "laugh", 0, { wave: 0.9 })] }),
  museum: (s, f) => ({ ...DAY, dof: 0,
    cam: move({ pos: Bw(6, 1.4, -6), look: Bw(9, 16, 12), fov: 62, roll: 0.07 }, { pos: Bw(2, 3, -12), look: Bw(6, 13, 12), fov: 56, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: Array.from({ length: 8 }, (_, k) => bw(walker(`c${(k * 5) % 48}`, -14 + ((k * 7.3) % 30), k % 2 ? SW : 0, k % 2 ? 8 + (k % 3) * 0.9 : -2 + (k % 4) * 1.4, (k % 2 ? 1 : -1) * 1.3, t(f - s.a), "neutral", k))),
    subjects: [["the museum sign", Bw(9, 20.4, 11.8), 1]] }),
  barnum: (s, f) => ({ ...DAY, dof: 6,
    cam: kick(snap(Bw(9.6, 1.5, 6.6), Bw(9, 1.55, 9.6), f, s.a, { fov: 42, roll: -0.08 }, 1.7, 5), f, s.a + 4, 0.6),
    people: [P("barnum", Bw(9, SW, 9.6), "grin", 0, { wave: 0.9 })] }),
  lind: (s, f) => { const u = U(s, f); return { ...DAY, dof: 4, ship: { x: 0, smoke: 0.7 },
    cam: move({ pos: [3.4, PIER + 1.2, -2.8], look: [8, PIER + 3.4, 6], fov: 46, roll: 0.06 }, { pos: [4.6, PIER + 1.5, -1.2], look: [8, PIER + 2.8, 6], fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("lind", lindOn(0.35 + 0.35 * u), "smile", 0, { wave: 0.85 }), P("captain", lindOn(0.1), "smile_closed", 0), ...crowd(12, 3, 14, -2, 3.5, 21, pick(CHEER), PIER, 3, (p) => pierFree(p) && Math.hypot(p[0] - 3.4, p[2] + 2.8) > 2, 0.9)],
    subjects: [["Jenny Lind", lindOn(0.5).map((x, i) => (i === 1 ? x + 1.3 : x)) as V3, 0.5]] }; },
  packed: (s, f) => ({ ...DAY, dof: 2, room: { sign: HALL, hall: true },
    cam: move({ pos: Rm(-4.6, 4.4, -6.2), look: Rm(0, 0.8, -1.8), fov: 56, roll: -0.06 }, { pos: Rm(-3.4, 2.8, -5.4), look: Rm(0, 1.2, -1.4), fov: 52, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("auctioneer", AUCT, "grin", 0, { wave: 0.8 }), ...BIDDERS(34, 13, 0.9, 7)] }),
  gavel: (s, f) => { const hit = W(3, "auctioned"), down = f >= hit && f < hit + 5; return { ...DAY, dof: 8, closeup: true, room: { sign: HALL, hall: true },
    cam: kick(move({ pos: Rm(-1.0, 2.1, 0.4), look: Rm(0, 2.0, 2.6), fov: 42, roll: 0.09 }, { pos: Rm(-0.6, 2.05, 0.8), look: Rm(0, 2.0, 2.6), fov: 40, roll: -0.04 }, f, s.a, s.b, smooth, 0), f, hit, 1.0),
    people: [P("auctioneer", AUCT, down ? "laugh" : "grin", 0, { hw: [Rm(0.28, down ? 1.32 : 1.75, 2.3)] })] }; },
  winner: (s, f) => ({ ...DAY, dof: 5, room: { sign: HALL, hall: true },
    cam: kick(orbit(s, f, Rm(-1.1, 1.4, -0.05), [-24, 14], [4.0, 3.4], [0.4, 0.15], 46, [0.07, -0.05]), f, W(4, "Genin") - 1, 0.8),
    people: [P("genin", GEN_HALL, "grin", 0, { wave: 0.95 }), ...BIDDERS(14, 17, undefined, 3).filter((q) => q.p[2] > -2.2).map((q) => ({ ...q, expr: "shock" as Expr }))] }),
  shop: (s, f) => { const u = smooth(U(s, f)); return { ...DAY, dof: 3,
    cam: full({ pos: Bw(-6 - 5 * u, 1.7, 1.5), look: Bw(-10.2 - 1.3 * u, 3.4, 12), fov: 54, roll: 0.05 - 0.08 * u }),
    people: [P("genin", GEN, "grin", 0, { wave: 0.85 }), ...Array.from({ length: 5 }, (_, k) => bw(walker(`c${(k * 9 + 4) % 48}`, -26 + k * 7, k % 2 ? SW : 0, k % 2 ? 8.4 : 2.4, (k % 2 ? 1 : -1) * 1.2, t(f - s.a), "neutral", k)))],
    subjects: [["the shop sign", Bw(-11.2, 4.1, 11.82), 0.5]] }; },
  paper: (s, f) => ({ ...DAY, dof: 3, focus: Bw(-11, 1.6, 9.6),
    cam: move({ pos: Bw(-10.4, 1.7, 7.6), look: Bw(-11, 1.6, 9.6), fov: 46, roll: -0.08 }, { pos: Bw(-10.6, 1.65, 8.1), look: Bw(-11, 1.6, 9.6), fov: 42, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    news: { p: Bw(-11, 1.6, 9.6), s: 1.1, text: ["The Herald", "THE LIND", "AUCTION"], spin: 0.04 }, subjects: [["the newspaper", Bw(-11, 1.6, 9.6), 0.3]] }),
  seat: (s, f) => ({ ...DAY, dof: 4, room: { sign: HALL, hall: true },
    cam: move({ pos: Rm(0.6, 3.6, 1.4), look: Rm(-1.4, 0.5, -0.2), fov: 50, roll: 0.07 }, { pos: Rm(0.2, 3.0, 1.0), look: Rm(-1.3, 0.6, -0.1), fov: 46, roll: -0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("genin", Rm(-1.3, 0, -0.05), "smile_closed", 0)], subjects: [["Genin's seat", Rm(-1.3, 0.5, 0.6), 0.4]] }),
  hathold: (s, f) => { const hp: V3 = [GEN[0] + 0.34, GEN[1] + 1.25, GEN[2] - 0.25]; return { ...DAY, dof: 6, closeup: true,
    cam: orbit(s, f, [GEN[0], GEN[1] + 1.25, GEN[2]], [-26, 12], [2.6, 2.3], [0.15, 0.05], 42, [0.07, -0.05]),
    people: [P("genin", GEN, "grin", 0, { hw: [hp] })], cards: [{ kind: "hat", p: hp, spin: 0.15, s: 0.6 }] }; },
  wink: (s, f) => ({ ...DAY, dof: 8, closeup: true,
    cam: kick(snap([GEN[0] - 0.4, GEN[1] + 1.55, GEN[2] - 2.3], [GEN[0], GEN[1] + 1.5, GEN[2]], f, s.a, { fov: 38, roll: 0.09 }, 1.7, 5), f, s.a + 4, 0.6),
    people: [P("genin", GEN, "smile_closed", 0, { headTilt: 0.12 })] }),
  headline: (s, f) => ({ ...DAY, dof: 2, focus: Bw(-11, 1.6, 9.6),
    cam: kick(snap(Bw(-10.75, 1.6, 7.7), Bw(-11, 1.6, 9.6), f, s.a, { fov: 44, roll: -0.1 }, 1.8, 5), f, s.a + 4, 0.8),
    news: { p: Bw(-11, 1.6, 9.6), s: 1.1, text: ["The Herald", "GENIN", "THE HATTER"], spin: -0.05 }, subjects: [["the headline", Bw(-11, 1.6, 9.6), 0.3]] }),
  flurry: (s, f) => { const tt = t(f); return { ...DAY, dof: 4,
    cam: orbit(s, f, [GEN[0], GEN[1] + 1.3, GEN[2]], [30, -24], [4.0, 3.4], [0.6, 0.2], 50, [-0.07, 0.05]),
    people: [P("genin", GEN, "laugh", 0, { wave: 0.9 })],
    cards: Array.from({ length: 14 }, (_, k) => { const q = k * 1.7, y = ((q * 0.371 + tt * (0.3 + (k % 3) * 0.1)) % 1); return { kind: "paper" as const, p: [GEN[0] + Math.sin(q * 2.4 + tt) * 2.2 * (0.35 + ((k * 7) % 10) / 14), GEN[1] + 0.3 + (1 - y) * 3, GEN[2] - 0.8 + Math.cos(q * 1.7) * 0.9] as V3, spin: tt * (1.5 + (k % 4)) + q, s: 0.42 }; }) }; },
  newsboy: (s, f) => { const tt = t(f - s.a), nb: V3 = Bw(-20, 0, 2.6), np: V3 = Bw(-19.7, 1.25 + 0.06 * Math.sin(tt * 9), 2.35); return { ...DAY, dof: 4,
    cam: orbit(s, f, Bw(-20, 0.9, 2.6), [-28, 10], [2.8, 2.4], [0.3, 0.1], 46, [0.07, -0.05]),
    people: [P("newsboy", nb, "laugh", 0, { hw: [np] }), ...Array.from({ length: 4 }, (_, k) => bw(walker(`c${(k * 7 + 9) % 48}`, -26 + k * 5, SW, 8.6, -1.2, tt, "neutral", k)))],
    news: { p: np, s: 0.62, text: ["The Herald", "GENIN", "THE HATTER"], spin: 0.1 * Math.sin(tt * 8) } }; },
  "hats-off": (s, f) => ({ ...DAY, dof: 3,
    cam: move({ pos: Bw(-25.5, 1.7, 3.2), look: Bw(-24, 1.4, 9), fov: 54, roll: -0.06 }, { pos: Bw(-24.2, 1.7, 3.6), look: Bw(-23.4, 1.4, 9), fov: 52, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    ...(() => { const pp = crowd(14, -27, -21, 7.4, 10.6, 31, pick(["nervous", "dazed", "shock", "stern"]), SW, 2, () => true, undefined, "b").filter((q) => parseInt(q.who.slice(1), 10) % 3 !== 1).map(bw);
      return { people: pp.map((q) => ({ ...q, hw: [[q.p[0] + 0.25, q.p[1] + 1.05, q.p[2] - 0.25] as V3] })), cards: pp.map((q, k) => ({ kind: "hat" as const, p: [q.p[0] + 0.25, q.p[1] + 1.05, q.p[2] - 0.25] as V3, spin: Math.PI + 0.2 * Math.sin(k), s: 0.36 })) }; })() }),
  peek: (s, f) => { const m: V3 = Bw(-21, SW, 8.8), hp: V3 = [m[0] + 0.3, m[1] + 1.25, m[2] - 0.3]; return { ...DAY, dof: 8, closeup: true,
    cam: kick(snap([m[0] + 0.5, m[1] + 1.45, m[2] - 2.4], [m[0] + 0.1, m[1] + 1.4, m[2]], f, s.a, { fov: 40, roll: -0.09 }, 1.7, 5), f, s.a + 4, 0.6),
    people: [P("b6", m, "shock", 1, { hw: [hp] })], cards: [{ kind: "hat", p: hp, spin: Math.PI + 0.3, s: 0.4 }] }; },
  office: (s, f) => { const pp = Rm(0.4, 0.815, 0.6); return { ...DAY, dof: 4, room: { sign: OFFICE, table: true },
    cam: move({ pos: Rm(-1.6, 2.6, -2.6), look: Rm(0.4, 1.1, 1.0), fov: 48, roll: -0.07 }, { pos: Rm(-0.9, 1.9, -2.2), look: Rm(0.4, 1.2, 1.2), fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("barnum", Rm(0.5, 0, 1.75), "grin", 0, { hw: [Rm(0.45, 0.85, 0.65)] })], cards: [{ kind: "paper", p: pp, spin: 0.1, s: 0.5, flat: true }] }; },
  queue: (s, f) => { const u = smooth(U(s, f)); return { ...DAY, dof: 3,
    cam: full({ pos: Bw(-6 - 4 * u, 1.6, 3.0), look: Bw(-10 - 3 * u, 2.2, 12), fov: 52, roll: 0.05 - 0.08 * u }),
    people: [P("genin", Bw(-8.6, SW, 10.6), "laugh", 0, { wave: 0.9 }), ...Array.from({ length: 10 }, (_, k) => ({ who: `c${(k * 5 + 3) % 48}`, p: Bw(-10.4 - k * 1.05, SW, 9.2 + (k % 2) * 0.3), expr: (["grin", "smile", "neutral", "smile_closed"] as Expr[])[k % 4], look: 1, extra: true }))],
    subjects: [["the shop sign", Bw(-11.2, 4.1, 11.82), 0.5]] }; },
  again: (s, f) => ({ ...DAY, dof: 8, closeup: true,
    cam: kick(orbit(s, f, [GEN[0], GEN[1] + 1.45, GEN[2]], [22, -14], [2.6, 2.3], [0.1, 0.0], 40, [-0.08, 0.06]), f, s.a + 3, 0.6),
    people: [P("genin", GEN, "grin", 0, { wave: 0.8 })] }),
  ship: (s, f) => { const u = U(s, f), sx = 34 - 34 * smooth(u * 1.1); return { ...DAY, dof: 0, ship: { x: sx, smoke: 1 },
    cam: move({ pos: [-14, PIER + 2.6, -8], look: [6, 8, 18], fov: 58, roll: 0.06 }, { pos: [-8, PIER + 2.0, -6], look: [4, 8, 18], fov: 56, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    people: crowd(16, -12, 12, -6, 4, 41, pick(CHEER), PIER, 5, pierFree, 0.85), subjects: u > 0.5 ? [["the steamship", [2 + sx, 5, SHIP.z0 - 1.7], 2]] : [] }; },
  pier: (s, f) => { const u = U(s, f); return { ...DAY, dof: 4,
    cam: orbit(s, f, Pr(6.6, 2.4).map((x, i) => (i === 1 ? x + 1.6 : x)) as V3, [-30, -10], [6.6, 5.8], [0.6, 0.3], 54, [0.06, -0.04]),
    people: [P("genin", Pr(5.8, 2.0), "grin", 1, { wave: 0.85 }), P("kossuth", lindOn(0.55 + 0.4 * u), "smile", -1, { wave: 0.7 })], pile: { p: Pr(6.8, 1.6), n: 14 } }; },
  pile: (s, f) => ({ ...DAY, dof: 8, closeup: true, focus: Pr(6.8, 1.6).map((x, i) => (i === 1 ? x + 0.3 : x)) as V3,
    cam: kick(move({ pos: [6.4, PIER + 1.4, 0.0], look: [6.8, PIER + 0.3, 1.6], fov: 46, roll: -0.08 }, { pos: [6.5, PIER + 1.1, 0.4], look: [6.8, PIER + 0.35, 1.6], fov: 44, roll: 0.04 }, f, s.a, s.b, smooth, 0), f, s.a + 3, 0.6),
    pile: { p: Pr(6.8, 1.6), n: 14 }, subjects: [["the hats", [6.8, PIER + 0.3, 1.6], 0.3]] }),
  parade: (s, f) => { const tt = t(f - s.a); return { ...DAY, dof: 3,
    cam: full({ pos: Bw(-14 + 1.4 * tt, 2.2, -5.6), look: Bw(-10 + 1.4 * tt, 1.4, 1.6), fov: 52, roll: 0.05 }),
    people: Array.from({ length: 16 }, (_, k) => bw(walker(k === 0 ? "kossuth" : `c${(k * 3) % 48}`, -18 + (k % 8) * 1.6 - Math.floor(k / 8) * 0.8, 0, 0.6 + Math.floor(k / 8) * 1.3, 1.4, tt, k === 0 ? "smile" : "grin", k, k !== 0))) }; },
  sellout: (s, f) => ({ ...DAY, dof: 3,
    cam: move({ pos: Bw(-5, 1.8, 4.0), look: Bw(-11, 2.0, 12), fov: 52, roll: -0.06 }, { pos: Bw(-7, 1.7, 5.0), look: Bw(-11.5, 1.9, 12), fov: 50, roll: 0.04 }, f, s.a, s.b, smooth, 0),
    people: [P("genin", Bw(-9.0, SW, 10.6), "laugh", 0, { wave: 0.9 }), ...Array.from({ length: 9 }, (_, k) => ({ who: `c${(k * 5 + 7) % 48}`, p: Bw(-10.6 - (k % 5) * 1.0, SW, 8.8 + Math.floor(k / 5) * 1.0), expr: (["grin", "laugh", "smile"] as Expr[])[k % 3], look: 1, wave: k % 2 ? 0.8 : undefined, extra: true }))],
    subjects: [["the shop sign", Bw(-11.2, 4.1, 11.82), 0.5]] }),
  // ...Genin sold the rest: he holds up the ticket again, and the camera lands on the hook's first frame (loop)
  end: (s, f) => ({ ...DAY, dof: 6, closeup: true, focus: TICKET,
    cam: move({ pos: [GEN[0] - 0.6, GEN[1] + 1.5, GEN[2] - 3.4], look: [GEN[0], GEN[1] + 1.35, GEN[2]], fov: 44, roll: 0.06 }, HOOK_CAM, f, s.a, s.b - 2, smooth, 0),
    people: [P("genin", GEN, "grin", 0, { hw: [TICKET] })], cards: [ticket(TICKET)] }),
};

/** every shot is hand-held: a slow sway on top of its move (none on the loop frames) */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  if (f < 2 || f >= TOTAL - 3) return { ...st, focus: st.focus ?? c.look };
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), sw = 0.0032 * Math.min(d, 60), id = s.id;
  const fade = Math.min(1, f / 8, (TOTAL - 3 - f) / 8);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + fade * sw * Math.sin(f * 0.21 + id), c.look[1] + fade * sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + fade * sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
const WHIP = new Set(["museum", "lind", "shop", "headline", "ship", "parade"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);

// ---------------- name tags and stamps ----------------
export type Item = { key: string; kind: "stamp" | "pill" | "call"; text: string; sub?: string; f0: number; f1: number; y: number; rot?: number; bg?: string; fg?: string; size?: number };
const B = (g: string) => SHOTS.find((x) => x.g === g)!.b;
const S0 = (g: string) => SHOTS.find((x) => x.g === g)!.a;
export const ITEMS = (): Item[] => ([
  { key: "225", kind: "call", text: "$225", f0: W(0, "$225"), f1: B("ticketclose"), y: 15, fg: "#7fd18b", size: 230 },
  { key: "ticket", kind: "pill", text: "ONE TICKET", sub: "Jenny Lind's first concert", f0: W(0, "concert"), f1: B("hall-bid"), y: 13, size: 64 },
  { key: "25", kind: "call", text: "$25", f0: W(1, "$25"), f1: B("next"), y: 15, fg: "#ffd166", size: 210 },
  { key: "1850", kind: "pill", text: "NEW YORK", sub: "1850", f0: A(2) + 4, f1: B("museum"), y: 12, size: 70 },
  { key: "barnum", kind: "pill", text: "P. T. BARNUM", sub: "the showman", f0: S0("barnum") + 4, f1: B("barnum"), y: 13, size: 66 },
  { key: "lind", kind: "pill", text: "JENNY LIND", sub: "Swedish singer", f0: S0("lind") + 3, f1: B("lind"), y: 13, size: 66 },
  { key: "auction", kind: "stamp", text: "AUCTION", f0: W(3, "auctioned"), f1: B("gavel"), y: 15, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 130 },
  { key: "genin", kind: "pill", text: "JOHN GENIN", sub: "hatter · next door to Barnum", f0: W(4, "Genin"), f1: B("shop"), y: 13, size: 64 },
  { key: "notbest", kind: "stamp", text: "NOT THE BEST SEAT", f0: W(5, "best") - 2, f1: B("seat"), y: 15, rot: 4, bg: "#2f2a3a", fg: "#ffffff", size: 82 },
  { key: "headline", kind: "call", text: "A HEADLINE", f0: W(7, "headline"), f1: B("headline"), y: 15, fg: "#ffd166", size: 150, rot: -4 },
  { key: "every", kind: "pill", text: "EVERY BIG PAPER", sub: "printed his name", f0: W(8, "important"), f1: B("newsboy"), y: 13, size: 62 },
  { key: "aGenin", kind: "call", text: "A GENIN?", f0: W(9, "Genin"), f1: B("peek"), y: 15, fg: "#ffd166", size: 160 },
  { key: "fortune", kind: "stamp", text: "HIS FORTUNE", f0: W(10, "fortune"), f1: B("queue"), y: 15, rot: -4, bg: "#2f9a57", fg: "#ffffff", size: 110 },
  { key: "1851", kind: "call", text: "1851", f0: W(11, "year"), f1: B("again"), y: 15, fg: "#ffd166", size: 200 },
  { key: "hero", kind: "pill", text: "A HUNGARIAN HERO", sub: "arrives in New York", f0: A(12) + 4, f1: B("ship"), y: 13, size: 60 },
  { key: "nobody", kind: "pill", text: "HATS NOBODY WANTED", f0: W(12, "nobody"), f1: B("pile"), y: 13, size: 60 },
  { key: "sold", kind: "stamp", text: "SOLD OUT", f0: W(14, "sold"), f1: TOTAL - 6, y: 15, rot: -5, bg: "#e0332e", fg: "#ffffff", size: 140 },
] as Item[]).filter((i) => i.f1 > i.f0);
