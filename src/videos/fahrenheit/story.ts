// Cameras and lens per shot. Grammar from the bridge short (motion.md): continuous slow push-ins, symmetric
// smootherstep glides of 18-40 f between framings, big reframes are hard cuts. Keys sit on word onsets (wordAt), so
// they follow the narration when the voice timings change.
import { FPS, SHOTS, wordAt } from "./timeline";

export type V3 = [number, number, number];
export const D0 = 6.0;
/** the workshop room: centre x, floor y, centre z (props.ts buildShop) */
export const SHOP: V3 = [300, D0, 0];
export const S = (x: number, y: number, z: number): V3 => [SHOP[0] + x, SHOP[1] + y, SHOP[2] + z];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in: camera slides toward the look point, ~rate per frame since f0 */
const push = (pos: V3, look: V3, f: number, f0: number, rate = 0.0025, rest: Partial<Cam> = {}): Shot => {
  const k = Math.exp(-rate * Math.max(0, f - f0));
  return { pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest };
};
const A = (id: number) => SHOTS[id - 1].a;
/** glide centred on a word: starts dur/2 before it */
const on = (seg: number, w: string, dur = 24) => wordAt(seg, w) - Math.round(dur / 2);

// street sign + ship + square anchors (world.ts uses the same numbers)
export const SIGN: V3 = [-4.9, D0 + 3.65, 75];
export const SHIP_Z = -16;
export const shipX = (f: number) => -26 + 4.2 * ((f - A(10)) / FPS);
/** GO METRIC! banner strung across the near bank's main street (fronts at |x| = 6), seen from the quay end */
export const BANNER: V3 = [0, D0 + 4.6, -45];

const keys = (): Record<number, Key[]> => {
  const c: Record<number, Key[]> = {};
  // 1 hook: 3/4 wide of the bucket and the man -> glide in to the thermometer under his arm on "armpit"
  c[1] = [
    { f: 0, s: (f) => push(S(-1.0, 1.4, -4.4), S(-0.85, 1.0, 0), f, 0, 0.002, { fov: 42 }) },
    { f: on(0, "and", 30), dur: 30, s: (f) => push(S(-0.25, 1.5, -2.3), S(-0.38, 1.4, -0.05), f, on(0, "and", 30), 0.003, { fov: 38, roll: 0.04 }) },
  ];
  // 2 street of 1724: low along the street, glide up to the glassblower's sign
  c[2] = [
    { f: A(2), s: (f) => push([1.6, D0 + 1.8, 47], [-1.5, D0 + 3.0, 75], f, A(2), 0.002, { fov: 44 }) },
    { f: on(1, "Daniel", 30), dur: 30, s: (f) => push([-1.6, D0 + 3.3, 69.5], SIGN, f, on(1, "Daniel", 30), 0.003, { fov: 38 }) },
  ];
  // 3 the shelf of thermometers that disagree, slide along it to Fahrenheit frowning
  c[3] = [
    { f: A(3), s: (f) => ({ pos: [SHOP[0] - 2.6 + 1.2 * glide((f - A(3)) / 80), D0 + 1.95, 0.4], look: [SHOP[0] - 2.4 + 1.2 * glide((f - A(3)) / 80), D0 + 1.85, 2.8], fov: 40 }) },
    { f: on(2, "So", 28), dur: 28, s: (f) => push(S(-0.3, 1.6, -0.9), S(-0.5, 1.45, 2.05), f, on(2, "So", 28), 0.0025, { fov: 40 }) },
  ];
  // 4 Fahrenheit at the bucket, salt going in; push to the rod in the ice on "ammonium"
  c[4] = [
    { f: A(4), s: (f) => push(S(-0.75, 1.5, -3.7), S(-1.85, 0.95, 0.1), f, A(4), 0.0015, { fov: 44 }) },
    { f: wordAt(3, "Ice"), cut: true, s: (f) => push(S(-1.05, 0.95, -1.15), S(-1.38, 0.5, -0.2), f, wordAt(3, "Ice"), 0.003, { fov: 36, roll: -0.03 }) },
  ];
  // 5 board close-up: the 0
  c[5] = [{ f: A(5), s: (f) => push(S(0.58, 1.12, 0.0), S(0.62, 1.06, 1.03), f, A(5), 0.0035, { fov: 38 }) }];
  // 6 barrel (32) -> the man (96) on "Third"
  c[6] = [
    { f: A(6), s: (f) => push(S(2.25, 1.4, -4.4), S(2.3, 1.0, -0.4), f, A(6), 0.0015, { fov: 44 }) },
    { f: on(5, "Third", 30), dur: 30, s: (f) => push(S(1.95, 1.5, -3.4), S(1.95, 1.38, -0.75), f, on(5, "Third", 30), 0.0025, { fov: 40 }) },
  ];
  // 7 the board between Fahrenheit's hands: 32 then 96 painted on
  c[7] = [
    { f: A(7), s: (f) => push(S(0.2, 1.6, -2.1), S(0.3, 1.35, 1.4), f, A(7), 0.0012, { fov: 42 }) },
    { f: wordAt(6, "Ice"), cut: true, s: (f) => push(S(0.62, 1.42, 0.2), S(0.64, 1.38, 1.03), f, wordAt(6, "Ice"), 0.002, { fov: 38 }) },
    { f: on(6, "body", 24), dur: 24, s: (f) => push(S(0.62, 1.74, 0.2), S(0.64, 1.7, 1.03), f, on(6, "body", 24), 0.002, { fov: 38 }) },
  ];
  // 8 the shrug, straight to the lens
  c[8] = [{ f: A(8), s: (f) => push(S(0, 1.5, -3.1), S(0, 1.45, -0.4), f, A(8), 0.005, { fov: 40 }) }];
  // 9 "You see": candlelit bench -> overhead paper -> pull back -> the scale board
  c[9] = [
    { f: A(9), s: (f) => push(S(-0.4, 1.6, -1.0), S(0.0, 1.15, 1.2), f, A(9), 0.0015, { fov: 42 }) },
    { f: wordAt(8, "From"), cut: true, s: (f) => push(S(0.05, 2.75, 0.96), S(0.05, 0.925, 1.0), f, wordAt(8, "From"), 0.0015, { fov: 44 }) },
    { f: on(8, "No", 30), dur: 30, s: (f) => push(S(-0.35, 2.1, -1.2), S(0.0, 1.04, 1.4), f, on(8, "No", 30), 0.0012, { fov: 46, roll: 0.03 }) },
    { f: wordAt(8, "His"), cut: true, s: (f) => push(S(0.56, 1.56, -0.4), S(0.64, 1.5, 1.03), f, wordAt(8, "His"), 0.0015, { fov: 40 }) },
  ];
  // 10 the ship between two harbour towns (golden)
  c[10] = [{ f: A(10), s: (f) => push([shipX(f) - 15, D0 + 5.5, -33.5], [shipX(f) + 1, 4.5, SHIP_Z], f, A(10), 0.0015, { fov: 46 }) }];
  // 11 1975: the GO METRIC! banner, everyone walks past; pull back on "Americans simply didn't"
  c[11] = [
    { f: A(11), s: (f) => push([0.4, D0 + 1.8, -31.0], [0, D0 + 3.5, BANNER[2]], f, A(11), 0.002, { fov: 48 }) },
    { f: on(10, "Americans", 28), dur: 28, s: (f) => push([1.6, D0 + 2.8, -30.8], [0, D0 + 3.0, BANNER[2]], f, on(10, "Americans", 28), 0.001, { fov: 54, roll: -0.03 }) },
  ];
  // 12 kettle at the boil, the column races to 212; close in on the body mark as 96 rolls to 98.6
  c[12] = [
    { f: A(12), s: (f) => push(S(2.2, 2.1, -2.2), S(2.2, 1.7, 2.3), f, A(12), 0.0015, { fov: 46 }) },
    { f: on(11, "normal", 28), dur: 28, s: (f) => push(S(1.55, 1.62, 1.35), S(1.52, 1.55, 2.93), f, on(11, "normal", 28), 0.0015, { fov: 40 }) },
  ];
  // 13 deadpan; punch in on "The ruler did"
  c[13] = [
    { f: A(13), s: (f) => push(S(0.2, 1.5, -3.1), S(0.2, 1.45, -0.4), f, A(13), 0.0025, { fov: 40 }) },
    { f: on(12, "The", 18), dur: 18, s: (f) => push(S(0.2, 1.62, -2.0), S(0.2, 1.58, -0.4), f, on(12, "The", 18), 0.002, { fov: 36 }) },
  ];
  return c;
};
let CAMS: Record<number, Key[]> | null = null;
export const camAt = (id: number, f: number): Cam => { CAMS ??= keys(); return run(CAMS[id], f); };

/** lens blur per shot: cInf = blur disc radius (px at 1080 x 1920) at infinity, 0 = all sharp; focus = look point */
export const DOF: Record<number, number> = { 1: 12, 2: 0, 3: 10, 4: 12, 5: 14, 6: 10, 7: 12, 8: 10, 9: 12, 10: 0, 11: 6, 12: 12, 13: 12 };
