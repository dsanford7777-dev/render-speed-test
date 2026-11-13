// Cameras and lens per shot for the Los Angeles clocks short. Built on the Lustig move kit (orbits, cranes, dives, snap
// zooms on cuts, Dutch tilts, whip pans, handheld sway): a new setup every ~1.5 s, nothing held still.
// Sets: the queue on the main street (HUG), the pulse yard out on the meadow (Yd: socket + 60 board; L: the Los Angeles
// corner with the 50 board and the knife switch; C: the post clock wired to a socket; R: the drummer), Hoover Dam (Dm),
// the room (S: kitchen, clock depot, power company), the field of clocks (F), the row of refrigerators (Fr), the old
// generator (G). Every set faces -z: cameras sit on the -z side and look toward +z.
import { FPS, SHOTS, wordAt } from "./timeline";

export type V3 = [number, number, number];
export const D0 = 6.0;
const at = (o: V3) => (x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
export const HUG: V3 = [0.5, D0, 104];
/** the queue behind him */
export const QUEUE: V3[] = [0, 1, 2, 3, 4, 5].map((k) => [0.5 + (k % 2 ? 0.6 : -0.5), D0, 105.9 + 1.45 * k]);
export const SALON: V3 = [300, D0, 300];
export const YARD: V3 = [-300, D0, 300];
export const Yd = at(YARD), L = at([-340, D0, 300]), C = at([-260, D0, 300]), R = at([-220, D0, 300]);
export const Dm = at([600, D0, 300]);
export const S = at(SALON);
export const F = at([-300, D0, 600]), Fr = at([-300, D0, 800]), G = at([-600, D0, 300]);
/** fixed places */
export const SOCKET: V3 = [SALON[0] - 3.9, D0 + 1.6, SALON[2] + 3.46], B60 = Yd(4.2, 2.6, 1.0), B50 = L(0.9, 2.3, 0.8), ANGELENO = L(-1.1, 0, 0), LEVER = L(2.9, 0, 0.2);
export const CLOCK = C(0, 2.69, -0.1), SOCKET2 = C(-3.4, 1.2, 0);
export const DRUMMER = R(0, 0, 0.35), DRUM = R(0, 0, -0.3);
export const DAM60 = Dm(0, 4.2, -10.3);
export const TOASTER = S(-0.6, 0.8, 0.55), BULB = S(1.6, 0.8, 0.6), TCLOCK = S(0.5, 1.07, 0.6);
export const WORKER = S(0.98, 0, 1.75), BOSS = S(1.4, 0, 1.75);
export const GEN = G(-1.6, 0, 0.6), G50 = G(1.15, 2.45, 0.6), ENGINEER = G(0.3, 0, -0.2);

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
  city: W(0, "city"), hand: W(0, "hand"), clocks: W(0, "clocks"),
  power: W(1, "power"), wall: W(1, "wall"), pulses: W(1, "pulses"),
  america: W(2, "America"), sixty: W(2, "60"), los: W(3, "Los"), fifty: W(3, "50"),
  cared: W(4, "cared"),
  hoover: W(5, "Hoover"), allNew: W(6, "new"), came: W(6, "came"), dam60: W(6, "60"),
  switched: W(7, "switched"),
  toastMind: W(8, "mind"), light: W(9, "Light"), bulbMind: W(9, "mind"),
  minded: W(10, "minded"),
  electric: W(11, "electric"), keep: W(11, "keep"), counts: W(12, "counts"), inWall: W(12, "wall"),
  drummer: W(13, "drummer"), following: W(13, "band"),
  speed: W(14, "Speed"), band: W(14, "band"), theClock: W(15, "clock"), twelve: W(15, "12"), every: W(15, "every"),
  carried: W(16, "carried"), depots: W(16, "depots"),
  rebuilt: W(17, "rebuilt"), sent: W(17, "sent"), within: W(17, "within"),
  rest: W(18, "rest"),
  n475: W(19, "475000"), fieldClocks: W(19, "clocks"),
  n58: W(20, "58000"), fridges: W(20, "refrigerators"),
  bill: W(21, "bill"), n34: W(21, "34"),
  third: W(22, "third"), made: W(22, "made"),
  decades: W(23, "decades"), someone: W(24, "someone"), p50: W(24, "50"), p60: W(24, "60"),
});
let MK: ReturnType<typeof marks> | null = null;
export const M = () => (MK ??= marks());
const LAST = 18;
/** the last 24 frames go back to the opening frame so the video loops */
export const LOOP_F = () => B(LAST) - 24;

// ---------------- things that move (cameras follow them, the world places them) ----------------
/** shot 12a: z of the first walker going down the main street with a clock (1.5 m/s) */
export const walkZ = (f: number) => 140 - 1.5 * (f - A(12)) / FPS;
/** shot 12b: z of the front marcher coming straight at the lens */
export const frontZ = (f: number) => { const f0 = M().depots - 2; return 109 - (109 - 102.9) * lin((f - f0) / Math.max(1, B(12) - f0)); };
/** shot 16: the camera's x sliding along the refrigerators */
export const fridgeX = (f: number) => -8 + 9 * smooth((f - A(16)) / Math.max(1, M().fridges - 2 - A(16)));
/** shot 17: x of the cash on the table (room coordinates): it slides away from the boss on "third" */
export const cashX = (f: number) => 1.4 - 2.9 * smooth((f - (M().third + 2)) / 64);

// ---------------- the cameras ----------------
/** the opening frame (the ending cuts back to it): the man and his clock, clock just above the middle of the frame */
const hook = (f: number): Cam => move(
  { pos: [HUG[0] + 0.75, D0 + 1.15, HUG[2] - 3.5], look: [HUG[0], D0 + 0.66, HUG[2]], fov: 44, roll: 0.06 },
  { pos: [HUG[0] + 0.5, D0 + 1.1, HUG[2] - 3.2], look: [HUG[0], D0 + 0.68, HUG[2]], fov: 44, roll: 0.03 }, f, 0, 40, expo, 0);
const keys = (): Record<number, Key[]> => {
  const c: Record<number, Key[]> = {}, m = M();
  /** where a face close-up aims: the chest, so the head sits in the upper half, clear of the captions */
  const head = (p: V3): V3 => [p[0], p[1] + 1.34, p[2]];
  // 1 hook: the man and his clock; crane out over the queue on "city"; low and wide up at him on "clocks"
  c[1] = [
    { f: 0, s: (f) => hook(f) },
    { f: m.hand - 2, cut: true, s: (f) => move({ pos: [3.4, D0 + 1.9, 100.6], look: [0.5, D0 + 1.2, 107.5], fov: 56, roll: -0.09 }, { pos: [4.8, D0 + 5.2, 98.6], look: [0.5, D0 + 0.6, 108.5], fov: 58, roll: 0.04 }, f, m.hand - 2, m.clocks - 3, smooth, 0) },
    { f: m.clocks - 2, cut: true, s: (f) => { const u = f - (m.clocks - 2); return { pos: [HUG[0] + 1.25 - 0.004 * u, D0 + 1.7, HUG[2] - 2.0 + 0.004 * u], look: [HUG[0] + 0.05, D0 + 0.95, HUG[2] - 0.1], fov: 50, roll: 0.12 }; } },
  ];
  // 2 snap zoom on the wall socket; swing round it as it pulses (aimed below it, so it sits above the captions)
  const sk: V3 = [SOCKET[0], SOCKET[1] - 0.45, SOCKET[2]], b60: V3 = [B60[0], B60[1] - 0.75, B60[2]], b50: V3 = [B50[0], B50[1] - 0.6, B50[2]];
  c[2] = [
    { f: A(2), s: (f) => snap([SOCKET[0] + 0.45, SOCKET[1] - 0.1, SOCKET[2] - 2.9], sk, f, A(2), { fov: 38, roll: -0.1 }) },
    { f: m.wall - 2, cut: true, s: (f) => { const u = smooth((f - (m.wall - 2)) / Math.max(1, B(2) - (m.wall - 2))); return orb(sk, 40 - 62 * u, 4.2 - 1.5 * u, 1.2 - 1.0 * u, { fov: 50, roll: 0.16 - 0.28 * u }); } },
  ];
  // 3 crane up to the blue 60 board; whip across to Los Angeles; snap to the red 50
  c[3] = [
    { f: A(3), s: (f) => move({ pos: Yd(-1.5, 0.5, -9.5), look: b60, fov: 66, roll: 0.2 }, { pos: Yd(4.9, 2.6, -4.4), look: b60, fov: 50, roll: -0.04 }, f, A(3), m.sixty + 8, expo, 0.001) },
    { f: m.los - 4, dur: 6, s: (f) => { const u = f - (m.los - 4); return { pos: L(1.7 - 0.006 * u, 1.35, -5.4 + 0.006 * u), look: L(0, 1.75, 0.4), fov: 52, roll: -0.07 }; } },
    { f: m.fifty - 2, cut: true, s: (f) => snap(L(1.6, 1.9, -4.2), b50, f, m.fifty - 2, { fov: 40, roll: 0.1 }) },
  ];
  // 4 his face: not bothered. Tilt flips on "cared"
  const an = head(ANGELENO);
  c[4] = [
    { f: A(4), s: (f) => snap([an[0] + 0.5, an[1] + 0.25, an[2] - 2.35], an, f, A(4), { fov: 33, roll: -0.12 }) },
    { f: m.cared - 2, cut: true, s: (f) => snap([an[0] - 0.45, an[1] + 0.2, an[2] - 2.2], an, f, m.cared - 2, { fov: 33, roll: 0.13 }, 1.25, 4) },
  ];
  // 5 Hoover Dam from its foot; from high above; snap to the 60 on the powerhouse
  c[5] = [
    { f: A(5), s: (f) => move({ pos: Dm(22, 1.2, -66), look: Dm(0, 20, 2), fov: 76, roll: 0.22 }, { pos: Dm(-3, 2.4, -31), look: Dm(0, 27, 2), fov: 70, roll: -0.03 }, f, A(5), m.allNew - 4, smooth, 0) },
    { f: m.allNew - 2, cut: true, s: (f) => move({ pos: Dm(-26, 66, -40), look: Dm(0, 20, 0), fov: 60, roll: -0.12 }, { pos: Dm(-12, 50, -46), look: Dm(0, 16, -2), fov: 60, roll: 0.02 }, f, m.allNew - 2, m.dam60 - 4, smooth, 0) },
    { f: m.dam60 - 3, cut: true, s: (f) => snap(Dm(2.0, 3.0, -22), Dm(0, 2.6, -10.3), f, m.dam60 - 3, { fov: 42, roll: 0.08 }, 1.6, 6) },
  ];
  // 6 the knife switch; snap to the board as it flips to 60
  c[6] = [
    { f: A(6), s: (f) => move({ pos: L(4.2, 1.0, -3.6), look: L(2.5, 1.3, 0.1), fov: 48, roll: 0.11 }, { pos: L(3.4, 1.25, -2.8), look: L(2.5, 1.35, 0.1), fov: 48, roll: 0.11 }, f, A(6), A(6) + 14, expo, 0.001) },
    { f: m.switched - 1, cut: true, s: (f) => snap(L(0.2, 1.9, -4.2), b50, f, m.switched - 1, { fov: 40, roll: -0.1 }) },
  ];
  // 7 the kitchen table: the toaster (toast shoots at the lens); snap to the bulb
  const tst: V3 = [TOASTER[0], TOASTER[1] - 0.02, TOASTER[2]], blb: V3 = [BULB[0], BULB[1] + 0.5, BULB[2]];
  c[7] = [
    { f: A(7), s: (f) => move({ pos: S(-1.5, 1.35, -1.5), look: tst, fov: 46, roll: -0.09 }, { pos: S(-1.05, 1.2, -0.8), look: tst, fov: 46, roll: -0.09 }, f, A(7), A(7) + 14, expo, 0.001) },
    { f: m.light - 2, cut: true, s: (f) => snap(S(2.0, 1.35, -1.0), blb, f, m.light - 2, { fov: 40, roll: 0.1 }) },
  ];
  // 8 the clock on the table: snap in, hands racing
  c[8] = [{ f: A(8), s: (f) => snap(S(0.78, 1.16, -1.0), TCLOCK, f, A(8), { fov: 38, roll: -0.12 }, 1.7, 6) }];
  // 9 the post clock and the socket it's wired to: orbit; then ride the wire from the socket up to the clock
  const cs: V3 = C(-0.9, 2.1, 0);
  c[9] = [
    { f: A(9), s: (f) => { const u = smooth((f - A(9)) / Math.max(1, m.counts - 4 - A(9))); return orb(cs, 30 - 38 * u, 7.4 - 1.2 * u, -1.0 + 0.5 * u, { fov: 54, roll: 0.09 - 0.13 * u }); } },
    { f: m.counts - 2, cut: true, s: (f) => move({ pos: C(-3.0, 1.35, -2.3), look: C(-3.4, 1.3, 0), fov: 46, roll: -0.1 }, { pos: C(-0.5, 2.5, -3.5), look: CLOCK, fov: 46, roll: 0.06 }, f, m.counts - 2, B(9) - 3, smooth, 0) },
  ];
  // 10 the drummer: orbit; snap to his face
  const dr: V3 = R(0, 1.25, 0.05);
  c[10] = [
    { f: A(10), s: (f) => { const u = smooth((f - A(10)) / Math.max(1, m.following - 4 - A(10))); return orb(dr, -24 + 44 * u, 3.9 - 0.6 * u, 0.25, { fov: 48, roll: 0.07 - 0.13 * u }); } },
    { f: m.following - 2, cut: true, s: (f) => snap(R(0.5, 1.6, -2.0), head(DRUMMER), f, m.following - 2, { fov: 34, roll: 0.12 }) },
  ];
  // 11 faster: low and wide on the drummer flailing; snap to the clock; swing under it as the hands spin
  c[11] = [
    { f: A(11), s: (f) => { const u = f - A(11); return { pos: R(-1.3 + 0.006 * u, 0.7, -2.5 + 0.004 * u), look: R(0, 1.25, 0.1), fov: 60, roll: -0.11 }; } },
    { f: m.theClock - 2, cut: true, s: (f) => snap(C(0.8, 2.4, -3.4), CLOCK, f, m.theClock - 2, { fov: 44, roll: 0.12 }, 1.7, 6) },
    { f: m.twelve - 2, cut: true, s: (f) => move({ pos: C(-2.8, 1.1, -5.0), look: CLOCK, fov: 58, roll: -0.15 }, { pos: C(-1.5, 1.6, -3.9), look: CLOCK, fov: 58, roll: -0.04 }, f, m.twelve - 2, B(11), smooth, 0) },
  ];
  // 12 tracking beside the walkers and their clocks; then they come straight at the lens
  c[12] = [
    { f: A(12), s: (f) => { const z = walkZ(f); return { pos: [5.6, D0 + 1.0, z + 0.1], look: [0.8, D0 + 1.1, z + 1.5], fov: 58, roll: 0.07 }; } },
    { f: m.depots - 2, cut: true, s: (f) => ({ pos: [0.9, D0 + 0.75, 100], look: [0.6, D0 + 1.15, frontZ(f)], fov: 60, roll: -0.06 }) },
  ];
  // 13 the depot bench; from further back as the clocks fly out; crane up and out over the room
  c[13] = [
    { f: A(13), s: (f) => move({ pos: S(1.6, 1.25, -2.9), look: S(0.5, 1.25, 1.2), fov: 52, roll: -0.08 }, { pos: S(1.0, 1.25, -2.2), look: S(0.5, 1.3, 1.2), fov: 52, roll: -0.08 }, f, A(13), A(13) + 14, expo, 0.001) },
    { f: m.sent - 2, cut: true, s: () => ({ pos: S(0.5, 1.15, -4.4), look: S(0.5, 1.5, 0.6), fov: 60, roll: 0.06 }) },
    { f: m.within - 2, cut: true, s: (f) => move({ pos: S(-0.4, 1.7, -1.6), look: S(0.3, 1.7, 1.75), fov: 52, roll: 0 }, { pos: S(-0.4, 3.8, -6.2), look: S(0.3, 1.8, 1.75), fov: 66, roll: 0.03 }, f, m.within - 2, B(13) - 2, expo, 0) },
  ];
  // 14 dive from high over the meadow down to the field of clocks
  c[14] = [{ f: A(14), s: (f) => move({ pos: F(-9, 15, -27), look: F(0, 0, 7), fov: 72, roll: 0.24 }, { pos: F(0, 6.0, -13), look: F(0, 0.6, 9), fov: 60, roll: 0 }, f, A(14), B(14) - 2, smooth, 0) }];
  // 15 rising orbit over the field; low skim across the clocks
  const fc: V3 = F(0, 0.5, 7);
  c[15] = [
    { f: A(15), s: (f) => { const u = smooth((f - A(15)) / Math.max(1, m.fieldClocks - 4 - A(15))); return orb(fc, -22 + 30 * u, 17 + 6 * u, 3 + 8 * u, { fov: 58, roll: 0.09 - 0.12 * u }); } },
    { f: m.fieldClocks - 2, cut: true, s: (f) => move({ pos: F(-10, 0.95, -2.2), look: F(0, 0.6, 6), fov: 66, roll: -0.13 }, { pos: F(-4, 0.95, -2.6), look: F(1, 0.6, 6), fov: 66, roll: -0.04 }, f, m.fieldClocks - 2, B(15), smooth, 0) },
  ];
  // 16 low wide slide along the refrigerators; snap to one of them
  c[16] = [
    { f: A(16), s: (f) => { const x = fridgeX(f); return { pos: Fr(x, 0.7, -3.3), look: Fr(x + 2.6, 1.05, 0), fov: 66, roll: 0.09 }; } },
    { f: m.fridges - 2, cut: true, s: (f) => snap(Fr(0.7, 1.45, -2.9), Fr(0, 1.0, 0), f, m.fridges - 2, { fov: 46, roll: -0.1 }) },
  ];
  // 17 the power company boss, low; ride with the cash as it slides away; snap to his face
  const bs = head(BOSS);
  c[17] = [
    { f: A(17), s: (f) => move({ pos: S(2.0, 0.95, -1.2), look: bs, fov: 40, roll: -0.1 }, { pos: S(1.7, 1.12, -0.55), look: bs, fov: 40, roll: -0.1 }, f, A(17), A(17) + 14, expo, 0.001) },
    { f: m.third - 2, cut: true, s: (f) => move({ pos: S(1.2, 1.7, -3.6), look: S(0.7, 1.15, 0.9), fov: 52, roll: 0.09 }, { pos: S(0.3, 1.4, -3.0), look: S(0.6, 1.15, 0.9), fov: 52, roll: -0.04 }, f, m.third - 2, m.made - 4, smooth, 0) },
    { f: m.made - 2, cut: true, s: (f) => snap(S(1.6, 1.6, -0.6), bs, f, m.made - 2, { fov: 33, roll: 0.11 }) },
  ];
  // 18 the old generator and its 50 board: orbit; the engineer; the two numbers; back to the hook frame
  const gc: V3 = G(0.2, 1.5, 0.4);
  c[18] = [
    { f: A(18), s: (f) => { const u = smooth((f - A(18)) / Math.max(1, m.someone - 4 - A(18))); return orb(gc, 28 - 40 * u, 6.4 - 1.0 * u, 0.2, { fov: 52, roll: 0.08 - 0.13 * u }); } },
    { f: m.someone - 2, cut: true, s: (f) => snap(G(0.8, 1.62, -2.55), head(ENGINEER), f, m.someone - 2, { fov: 34, roll: -0.11 }) },
    { f: m.p50 - 2, cut: true, s: (f) => snap(G(1.8, 2.0, -4.0), [G50[0], G50[1] - 0.6, G50[2]], f, m.p50 - 2, { fov: 42, roll: 0.1 }) },
    { f: LOOP_F(), cut: true, s: () => hook(0) },
  ];
  return c;
};
let CAMS: Record<number, Key[]> | null = null;
/** camera shakes: [shot, frame, strength]; 7-frame kicks that flip sign every frame */
const SHAKES = (): [number, number, number][] => {
  const m = M();
  return [[1, m.clocks - 2, 0.6], [2, A(2) + 4, 0.8], [3, m.fifty - 2, 0.6], [5, m.dam60 + 2, 1.1], [6, m.switched, 1.3], [7, m.toastMind + 6, 1.1],
    [8, m.minded + 5, 1.3], [11, m.twelve, 1.0], [12, B(12) - 5, 1.0], [13, m.sent + 12, 1.0], [15, m.n475, 1.0], [16, m.fridges - 2, 0.6], [17, m.n34 + 2, 1.3], [18, m.p50 - 2, 0.6]];
};
let SH: [number, number, number][] | null = null;
/** handheld sway per shot (1 = normal) */
const SWAY: Record<number, number> = { 5: 0.5, 12: 1.5, 14: 0.4, 15: 0.5 };
export const camAt = (id: number, f: number): Cam => {
  CAMS ??= keys(); SH ??= SHAKES();
  const c = run(CAMS[id], f);
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const sw = (id === LAST && f >= LOOP_F()) || (id === 1 && f < 2) ? 0 : (SWAY[id] ?? 1) * 0.0035 * Math.min(d, 12);
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
  return [[m.hand - 2, 0.6], [m.los - 1, 1], [A(5), 0.7], [A(7), 0.6], [A(9), 0.6], [A(12), 0.8], [m.depots - 2, 0.8], [A(14), 0.8], [A(14) + 10, 0.5], [A(16), 0.7], [A(17), 0.8], [A(18), 0.8]];
};
export const whipAt = (f: number) => { let k = 0; for (const [c, s] of WHIPS()) k = Math.max(k, s * Math.max(0, 1 - Math.abs(f - c) / 4)); return k; };

/** lens blur per shot (px at 1080 x 1920 at infinity); 0 = all sharp */
export const DOF: Record<number, number> = { 1: 5, 2: 8, 3: 5, 4: 9, 5: 0, 6: 7, 7: 8, 8: 9, 9: 4, 10: 6, 11: 5, 12: 3, 13: 5, 14: 0, 15: 0, 16: 3, 17: 8, 18: 5 };
