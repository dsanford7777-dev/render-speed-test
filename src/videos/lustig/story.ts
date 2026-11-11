// Cameras and lens per shot for the Lustig short. This one is built on MOVES, not creeping push-ins: orbits, cranes,
// dives, corkscrews, long-lens slides, snap zooms (cut + 5-frame settle), Dutch tilts, whip pans, a little handheld
// sway on everything. Target: a new setup every ~1.5 s, 35+ setups in the short (the Ricks Clips rhythm).
// Sets: the tower at the far end of the main street (TC), Lustig's pitch in front of it (LU0), the hotel salon out on
// the meadow (SALON, open toward -z, cameras look +z), the main street (x = -6..6, runs along z), the quay (QUAY).
import { FPS, SHOTS, wordAt } from "./timeline";

export type V3 = [number, number, number];
export const D0 = 6.0;
/** tower base centre, and points relative to it */
export const TC: V3 = [0, D0, 240];
export const T = (x: number, y: number, z: number): V3 => [TC[0] + x, TC[1] + y, TC[2] + z];
/** where Lustig stands in front of the tower, and where Poisson stands alone later */
export const LU0: V3 = [10, D0, 200];
export const BUYER: V3 = [11.3, D0, 200.3];
export const PO: V3 = [6, D0, 206];
export const SALON: V3 = [300, D0, 300];
export const S = (x: number, y: number, z: number): V3 => [SALON[0] + x, SALON[1] + y, SALON[2] + z];
export const QUAY: V3 = [40, D0, 33.6];
/** salon places: Lustig beside the table, the three dealers behind it, the letter and the model on it */
export const LU_S: V3 = S(-3.0, 0, 1.2);
export const DEALERS: V3[] = [S(-0.9, 0, 1.75), S(0.5, 0, 1.75), S(1.9, 0, 1.75)];
export const LU_LEAN: V3 = S(-1.55, 0, 1.75);
export const LETTER: V3 = S(1.6, 0.815, 0.6);
export const MODEL: V3 = S(0.5, 0.8, 0.6);
export const CASH: V3 = S(-0.9, 0.8, 0.5);
export const CAPONE: V3 = S(1.4, 0, 1.75), LU_C: V3 = S(-0.4, 0, 1.75);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
/** fast start, soft landing (swoops, crash zooms) */
export const expo = (u: number) => { const x = clamp01(u); return x >= 1 ? 1 : 1 - Math.pow(2, -9 * x); };
const lin = clamp01;
const rad = (d: number) => (d * Math.PI) / 180;

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const L3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const mix = (a: Cam, b: Cam, k: number): Cam => ({ pos: L3(a.pos, b.pos, k), look: L3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};

// ---------------- the moves ----------------
/** travel from setup a to setup b between f0 and f1, then keep creeping toward the subject so nothing is ever still */
const move = (a: Shot, b: Shot, f: number, f0: number, f1: number, ease: (u: number) => number = expo, creep = 0.0012): Cam => {
  const c = mix(full(a), full(b), ease((f - f0) / Math.max(1, f1 - f0)));
  const k = 1 - Math.exp(-creep * Math.max(0, f - f1));
  return { ...c, pos: L3(c.pos, c.look, k) };
};
/** circle a point: angle a (degrees, 0 = camera on the -z side, + = toward +x), radius r, camera height h above the centre */
const orb = (c: V3, a: number, r: number, h: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [c[0] + r * Math.sin(rad(a)), c[1] + h, c[2] - r * Math.cos(rad(a))], look: c, ...rest });
/** snap zoom: used on a cut. Starts further back and wider, lands in n frames, then creeps in */
const snap = (pos: V3, look: V3, f: number, f0: number, rest: Partial<Cam> = {}, back = 1.5, n = 5): Cam => {
  const far: V3 = [look[0] + (pos[0] - look[0]) * back, look[1] + (pos[1] - look[1]) * back, look[2] + (pos[2] - look[2]) * back];
  const fov = rest.fov ?? 40;
  return move({ pos: far, look, ...rest, fov: fov * 1.25 }, { pos, look, ...rest, fov }, f, f0, f0 + n, expo, 0.0015);
};
export const A = (id: number) => SHOTS[id - 1].a;
export const B = (id: number) => SHOTS[id - 1].b;

// ---------------- frame marks (word onsets), shared by cameras, world and overlays ----------------
const W = (seg: number, w: string) => wordAt(seg, w);
const marks = () => ({
  sold: W(0, "sold"), scrap: W(0, "scrap"),
  victor: W(2, "Victor"), paris: W(2, "Paris"), afford: W(2, "afford"), standing: W(2, "standing"),
  fake: W(3, "fake"), letters: W(3, "letters"),
  luxury: W(4, "luxury"),
  tower: W(5, "tower"), down: W(5, "down"),
  thousand: W(6, "thousand"), iron: W(6, "iron"), tell: W(7, "Tell"), no: W(7, "no"),
  andre: W(8, "André"), nervous: W(8, "nervous"),
  asked: W(10, "asked"), bribe: W(10, "bribe"),
  settled: W(11, "settled"), only: W(12, "Only"), corrupt: W(12, "corrupt"),
  paid: W(13, "paid"),
  suitcase: W(14, "suitcase"),
  papers: W(15, "papers"), every: W(15, "every"), day: W(15, "day"), nothing: W(16, "Nothing"),
  again: W(19, "again"),
  america: W(21, "America"),
  capone: W(22, "Capone"), handed: W(22, "handed"), fifty: W(22, "fifty"),
  gave: W(23, "gave"), got: W(24, "and"), reward: W(24, "reward"), honesty: W(24, "honesty"),
});
let MK: ReturnType<typeof marks> | null = null;
export const M = () => (MK ??= marks());
/** the last 24 frames go back to the opening frame so the video loops */
export const LOOP_F = () => B(19) - 24;

// ---------------- things that move (cameras follow them, the world places them) ----------------
/** shot 5: the dealers' z as they march in toward the salon (salon coordinates) */
export const dealersZ = (f: number) => -9.5 + 2.7 * (f - A(5)) / FPS;
/** shot 12a: Lustig's z running down the main street away from the tower (8 m/s) */
export const runZ = (f: number) => 150 - 8 * (f - A(12)) / FPS;
/** shot 12b: running straight at the lens */
export const frontZ = (f: number) => { const f0 = M().suitcase - 2; return 128 - (128 - 102.7) * lin((f - f0) / Math.max(1, B(12) - f0)); };
/** shot 17: the gendarme's z charging down the street */
export const copZ = (f: number) => 140 - (140 - 121.9) * Math.pow(lin((f - A(17)) / Math.max(1, B(17) - 2 - A(17))), 1.25);
/** shot 19: x of the cash on the table (salon coordinates): over to Lustig on "handed", back on "gave" */
export const cashX = (f: number) => 1.4 - 1.8 * smooth((f - M().handed) / 14) + 1.8 * smooth((f - M().gave) / 12);

// ---------------- the cameras ----------------
/** the opening frame (the ending cuts back to it) */
const hook = (f: number): Cam => {
  const u = expo(f / 26), a = 34 - 16 * u, r = 86 - 20 * u;
  const c = full(orb(T(0, 37 + 2 * u, 0), a, r, 1.4 + 1.6 * u - (37 + 2 * u), { fov: 66, roll: 0.05 * (1 - u) }));
  return c;
};
const keys = (): Record<number, Key[]> => {
  const c: Record<number, Key[]> = {}, m = M();
  // 1 hook: swing round the whole tower while the SOLD stamp lands; then under the legs looking straight up, spinning
  c[1] = [
    { f: 0, s: (f) => hook(f) },
    { f: m.scrap - 2, cut: true, s: (f) => { const u = f - (m.scrap - 2); return { pos: T(6 - 0.03 * u, 1.2 + 0.03 * u, -6 + 0.03 * u), look: T(0, 58, 0.5), fov: 78, roll: -0.55 + 0.022 * u }; } },
  ];
  // 2 snap zoom onto Lustig's grin, tilted
  c[2] = [{ f: A(2), s: (f) => snap([LU0[0] + 0.95, D0 + 1.72, LU0[2] - 2.45], [LU0[0], D0 + 1.62, LU0[2]], f, A(2), { fov: 34, roll: 0.12 }) }];
  // 3 orbit round Lustig and his newspaper; whip up to the tower and crane up its side; top-down from the summit
  const n3: V3 = [LU0[0], D0 + 1.3, LU0[2]];
  c[3] = [
    { f: A(3), s: (f) => { const u = smooth((f - A(3)) / Math.max(1, m.paris - 6 - A(3))); return orb(n3, 28 - 36 * u, 3.1 - 0.6 * u, 0.25 - 0.1 * u, { fov: 44, roll: 0.05 - 0.08 * u }); } },
    { f: m.paris - 4, dur: 6, s: (f) => move({ pos: T(30, 3, -30), look: T(0, 22, 0), fov: 60, roll: -0.08 }, { pos: T(34, 40, -34), look: T(0, 44, 0), fov: 56, roll: 0.04 }, f, m.paris - 4, m.standing - 4, smooth, 0) },
    { f: m.standing - 2, cut: true, s: (f) => move({ pos: T(-44, 1.6, -50), look: T(0, 40, 0), fov: 70, roll: 0.34 }, { pos: T(-30, 2.2, -35), look: T(0, 40, 0), fov: 70, roll: 0.2 }, f, m.standing - 2, m.standing + 14, expo, 0) },
  ];
  // 4 corkscrew down onto the forged letter; then low across the table as the envelopes fly at the lens
  c[4] = [
    { f: A(4), s: (f) => move({ pos: [LETTER[0] + 0.15, LETTER[1] + 2.4, LETTER[2] - 1.4], look: LETTER, fov: 46, roll: 0.75 }, { pos: [LETTER[0] + 0.1, LETTER[1] + 1.2, LETTER[2] - 0.62], look: LETTER, fov: 46, roll: 0 }, f, A(4), A(4) + 20, expo, 0.002) },
    { f: m.letters - 2, cut: true, s: (f) => { const u = f - (m.letters - 2); return { pos: [LETTER[0] + 0.5, D0 + 1.02, SALON[2] - 0.9 - 0.012 * u], look: [LETTER[0], D0 + 1.0, LETTER[2]], fov: 58, roll: -0.06 }; } },
  ];
  // 5 backing away in front of the dealers as they march in under the arch; then crane up and out over the salon
  c[5] = [
    { f: A(5), s: (f) => { const z = dealersZ(f); return { pos: S(0.3, 0.8, z + 5.0), look: S(0, 1.4, z), fov: 58, roll: -0.05 }; } },
    { f: m.luxury - 3, cut: true, s: (f) => move({ pos: S(-0.6, 1.7, -1.5), look: S(-0.6, 1.7, 1.75), fov: 52 }, { pos: S(-0.6, 3.4, -4.4), look: S(-0.6, 1.8, 1.75), fov: 66, roll: 0.03 }, f, m.luxury - 3, m.luxury + 21, expo, 0) },
  ];
  // 6 low under Lustig's chin; then the model tower topples at the lens
  c[6] = [
    { f: A(6), s: (f) => move({ pos: S(-2.2, 0.85, -1.3), look: [LU_S[0], D0 + 1.6, LU_S[2]], fov: 40, roll: 0.09 }, { pos: S(-2.5, 1.05, -0.5), look: [LU_S[0], D0 + 1.6, LU_S[2]], fov: 40, roll: 0.09 }, f, A(6), A(6) + 16, expo, 0.001) },
    { f: m.tower - 2, cut: true, s: (f) => { const u = f - (m.tower - 2); return { pos: S(0.5, 1.2 + 0.002 * u, -1.25 - 0.006 * u), look: S(0.5, 1.3, 0.6), fov: 52, roll: -0.04 }; } },
  ];
  // 7 long lens sliding across the dealers' faces; snap to Lustig: shh
  c[7] = [
    { f: A(7), s: (f) => { const x = -1.6 + 4.2 * smooth((f - A(7)) / Math.max(1, m.tell - 4 - A(7))); return { pos: S(x, 1.6, -2.2), look: S(x, 1.58, 1.75), fov: 24 }; } },
    { f: m.tell - 2, cut: true, s: (f) => snap(S(-2.72, 1.6, -1.0), [LU_S[0], D0 + 1.62, LU_S[2]], f, m.tell - 2, { fov: 32, roll: -0.1 }) },
  ];
  // 8 the three dealers; snap to Poisson; flip the tilt on "nervous"
  const po: V3 = [DEALERS[0][0], D0 + 1.58, DEALERS[0][2]];
  c[8] = [
    { f: A(8), s: (f) => move({ pos: S(0.5, 1.5, -4.6), look: S(0.5, 1.5, 1.75), fov: 62 }, { pos: S(0.5, 1.5, -4.2), look: S(0.5, 1.5, 1.75), fov: 62 }, f, A(8), m.andre - 3, lin, 0) },
    { f: m.andre - 3, cut: true, s: (f) => snap(S(-0.72, 1.56, -0.5), po, f, m.andre - 3, { fov: 32, roll: -0.12 }) },
    { f: m.nervous - 2, cut: true, s: (f) => snap(S(-1.12, 1.52, -0.45), po, f, m.nervous - 2, { fov: 32, roll: 0.14 }, 1.25, 4) },
  ];
  // 9 orbit round Lustig leaning in to Poisson; then square on as the hat comes at the lens
  const pair: V3 = S(-1.225, 1.5, 1.75);
  c[9] = [
    { f: A(9), s: (f) => { const u = smooth((f - A(9)) / Math.max(1, m.asked - 4 - A(9))); return orb(pair, 26 - 44 * u, 3.5 - 0.5 * u, 0, { fov: 46, roll: 0.06 - 0.1 * u }); } },
    { f: m.asked - 2, cut: true, s: (f) => { const u = f - (m.asked - 2); return { pos: S(-1.2, 1.38, -0.75 - 0.004 * u), look: S(-1.25, 1.45, 1.75), fov: 54, roll: 0.04 }; } },
  ];
  // 10 Poisson close: nervous, then relief (snap, tilt flipped); rising orbit out as he reasons it through
  c[10] = [
    { f: A(10), s: (f) => snap(S(-0.8, 1.56, -0.55), po, f, A(10), { fov: 33, roll: -0.08 }, 1.2, 4) },
    { f: m.settled - 2, cut: true, s: (f) => snap(S(-1.0, 1.56, -0.5), po, f, m.settled - 2, { fov: 33, roll: 0.1 }) },
    { f: m.only - 2, cut: true, s: (f) => {
      const u = smooth((f - (m.only - 2)) / Math.max(1, B(10) - (m.only - 2)));
      const cc: V3 = [po[0] - 0.35 * u, po[1] - 0.08 + 0.1 * u, po[2]];
      return orb(cc, -24 + 44 * u, 2.4 + 1.5 * u, 0.9 * u, { fov: 40 + 12 * u, roll: -0.08 + 0.14 * u });
    } },
  ];
  // 11 the cash slams down
  c[11] = [{ f: A(11), s: (f) => move({ pos: S(-0.5, 1.05, -0.9), look: [CASH[0], D0 + 0.95, CASH[2]], fov: 50, roll: 0.1 }, { pos: S(-0.62, 1.0, -0.6), look: [CASH[0], D0 + 0.95, CASH[2]], fov: 50, roll: 0.1 }, f, A(11), A(11) + 14, expo, 0.001) }];
  // 12 tracking beside the run; then he runs straight at the lens with the tower behind him
  c[12] = [
    { f: A(12), s: (f) => { const z = runZ(f); return { pos: [4.8, D0 + 0.85, z - 1.4], look: [0.8, D0 + 1.15, z - 0.5], fov: 56, roll: 0.08 }; } },
    { f: m.suitcase - 2, cut: true, s: (f) => ({ pos: [0.9, D0 + 0.7, 100], look: [0.6, D0 + 1.15, frontZ(f)], fov: 62, roll: -0.07 }) },
  ];
  // 13 Vienna: swoop in over the river to the newspaper; snap to his eyes
  const q: V3 = [QUAY[0], D0 + 1.42, QUAY[2]];
  c[13] = [
    { f: A(13), s: (f) => move({ pos: [44, D0 + 4.0, 21], look: q, fov: 46, roll: -0.07 }, { pos: [40.5, D0 + 1.62, 30.9], look: q, fov: 46, roll: 0 }, f, A(13), A(13) + 24, expo, 0.0008) },
    { f: m.nothing - 2, cut: true, s: (f) => snap([40.18, D0 + 1.62, 31.35], [QUAY[0], D0 + 1.6, QUAY[2]], f, m.nothing - 2, { fov: 32, roll: 0.08 }) },
  ];
  // 14 Poisson alone under the tower: crane up and away until he's tiny
  c[14] = [{ f: A(14), s: (f) => move({ pos: [6.6, D0 + 2.2, 203.4], look: [PO[0], D0 + 1.5, PO[2]], fov: 42, roll: 0.05 }, { pos: [11, D0 + 15, 187], look: [4.5, D0 + 7, 214], fov: 60, roll: -0.03 }, f, A(14) + 6, B(14) - 4, smooth, 0) }];
  // 15 dive from high over the river down the main street toward the tower
  c[15] = [{ f: A(15), s: (f) => move({ pos: [-25, D0 + 55, -40], look: T(0, 36, 0), fov: 72, roll: 0.2 }, { pos: [0, D0 + 2.4, 150], look: T(0, 30, 0), fov: 60, roll: 0 }, f, A(15), B(15) - 2, smooth, 0) }];
  // 16 low orbit round Lustig and the new buyer, FOR SALE sign and tower above them
  const sale: V3 = [10.65, D0 + 1.9, 200.15];
  c[16] = [{ f: A(16), s: (f) => { const u = smooth((f - A(16)) / Math.max(1, B(16) - A(16))); return orb(sale, 32 - 34 * u, 4.8 - 1.0 * u, -1.1 + 0.2 * u, { fov: 62, roll: 0.1 - 0.14 * u }); } }];
  // 17 the gendarmes charge the lens
  c[17] = [{ f: A(17), s: (f) => ({ pos: [0, D0 + 0.95, 119.5], look: [0, D0 + 1.3, copZ(f)], fov: 58, roll: 0.05 }) }];
  // 18 crash zoom to the top hat he left behind; whip away on "America"
  const hat: V3 = [LU0[0], D0 + 0.2, LU0[2]];
  c[18] = [
    { f: A(18), s: (f) => move({ pos: [12.6, D0 + 3.2, 193.5], look: hat, fov: 54, roll: -0.08 }, { pos: [10.55, D0 + 0.55, 198.5], look: hat, fov: 42, roll: 0.04 }, f, A(18), A(18) + 9, expo, 0.001) },
    { f: m.america - 1, dur: 7, s: () => ({ pos: [10.55, D0 + 0.9, 198.5], look: [-30, D0 + 4, 215], fov: 50, roll: 0.1 }) },
  ];
  // 19 Chicago: low on Capone; the cash slides over and back (camera rides with it); the reward; Lustig; loop
  const cap: V3 = [CAPONE[0], D0 + 1.6, CAPONE[2]];
  c[19] = [
    { f: A(19), s: (f) => move({ pos: S(2.0, 0.95, -1.1), look: cap, fov: 40, roll: -0.1 }, { pos: S(1.7, 1.12, -0.45), look: cap, fov: 40, roll: -0.1 }, f, A(19), A(19) + 14, expo, 0.001) },
    { f: m.handed - 2, cut: true, s: (f) => { const x = cashX(f); return { pos: S(x + 0.2, 1.04, -0.95), look: S(x, 0.92, 0.55), fov: 50, roll: 0.05 }; } },
    { f: m.got - 2, cut: true, s: (f) => { const u = f - (m.got - 2); return { pos: S(1.55, 1.5, -0.95 - 0.004 * u), look: S(1.4, 1.58, 1.75), fov: 40, roll: -0.05 }; } },
    { f: m.honesty - 3, cut: true, s: (f) => snap(S(-0.25, 1.6, -0.5), [LU_C[0], D0 + 1.62, LU_C[2]], f, m.honesty - 3, { fov: 32, roll: 0.12 }) },
    { f: LOOP_F(), cut: true, s: () => hook(0) },
  ];
  return c;
};
let CAMS: Record<number, Key[]> | null = null;
/** camera shakes: [shot, frame, strength]; 7-frame kicks that flip sign every frame */
const SHAKES = (): [number, number, number][] => {
  const m = M();
  return [[1, m.sold, 1.2], [1, m.scrap - 2, 0.5], [4, m.fake, 0.8], [6, m.down + 7, 1.3], [7, m.no, 1], [8, m.andre - 3, 0.5], [9, m.bribe + 2, 1],
    [10, m.settled - 2, 0.5], [11, m.paid, 1.3], [12, B(12) - 5, 1], [17, B(17) - 9, 1.3], [18, A(18) + 8, 0.8], [19, m.reward + 6, 1.1], [19, m.honesty - 3, 0.5]];
};
let SH: [number, number, number][] | null = null;
/** handheld sway per shot (1 = normal); the charge is rougher, the long-lens slide and the loop frame are steady */
const SWAY: Record<number, number> = { 7: 0.4, 12: 1.6, 17: 3 };
export const camAt = (id: number, f: number): Cam => {
  CAMS ??= keys(); SH ??= SHAKES();
  const c = run(CAMS[id], f);
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const sw = (id === 19 && f >= LOOP_F()) || (id === 1 && f < 2) ? 0 : (SWAY[id] ?? 1) * 0.0035 * d;
  c.look = [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)];
  for (const [sid, f0, k] of SH) if (sid === id && f >= f0 && f < f0 + 7) {
    const e = f - f0, s = (e % 2 ? -1 : 1) * k * (1 - e / 7), a = 0.012 * Math.max(1.2, Math.min(40, d));
    c.pos = [c.pos[0], c.pos[1] + a * s, c.pos[2] + 0.6 * a * s]; c.roll += 0.014 * s;
  }
  return c;
};
export const fps = FPS;

/** frames where the picture gets a sideways motion blur (whip pans and whip cuts): centre frame, strength 0..1 */
export const WHIPS = (): [number, number][] => {
  const m = M();
  return [[m.paris - 1, 1], [m.letters - 2, 0.6], [m.suitcase - 2, 1], [A(13), 0.7], [A(15), 0.8], [A(15) + 10, 0.5], [A(18), 0.6], [m.america + 2, 1], [A(19), 1], [m.handed + 7, 0.5], [m.gave + 6, 0.6]];
};
export const whipAt = (f: number) => { let k = 0; for (const [c, s] of WHIPS()) k = Math.max(k, s * Math.max(0, 1 - Math.abs(f - c) / 4)); return k; };

/** lens blur per shot (px at 1080 x 1920 at infinity); 0 = all sharp */
export const DOF: Record<number, number> = { 1: 0, 2: 9, 3: 5, 4: 6, 5: 5, 6: 8, 7: 9, 8: 8, 9: 7, 10: 8, 11: 9, 12: 3, 13: 7, 14: 3, 15: 0, 16: 3, 17: 4, 18: 8, 19: 8 };
