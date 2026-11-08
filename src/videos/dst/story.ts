// Cameras and lens per shot. Same grammar as the Fahrenheit short: slow push-ins, smootherstep glides between
// framings, big reframes are hard cuts. Keys sit on word onsets (wordAt) so they follow the narration.
import { FPS, SHOTS, wordAt } from "./timeline";

export type V3 = [number, number, number];
export const D0 = 6.0;
/** set origins: the farm out west on the meadow, the workshop (1916) east of town, the Congress hall further east */
export const FARM: V3 = [-300, D0, 70];
export const SHOP: V3 = [300, D0, 0];
export const HALL: V3 = [600, D0, 0];
export const F = (x: number, y: number, z: number): V3 => [FARM[0] + x, FARM[1] + y, FARM[2] + z];
export const S = (x: number, y: number, z: number): V3 => [SHOP[0] + x, SHOP[1] + y, SHOP[2] + z];
export const C = (x: number, y: number, z: number): V3 => [HALL[0] + x, HALL[1] + y, HALL[2] + z];
/** main street on the near bank: fronts at |x| = 6, houses from z = -46 */
export const ST = (x: number, y: number, z: number): V3 => [x, D0 + y, z];

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
const push = (pos: V3, look: V3, f: number, f0: number, rate = 0.0025, rest: Partial<Cam> = {}): Shot => {
  const k = Math.exp(-rate * Math.max(0, f - f0));
  return { pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest };
};
export const A = (id: number) => SHOTS[id - 1].a;
const on = (seg: number, w: string, dur = 24) => wordAt(seg, w) - Math.round(dur / 2);

// prop anchors shared with world.ts
export const FARM_CLOCK: V3 = F(1.15, 0, 2.2);          // post clock, face centre 2.12 m up
export const SHOP_CLOCK: V3 = S(0.75, 2.62, 2.92);      // on the workshop's back wall
export const SHOP_YEAR: V3 = S(-0.35, 3.02, 2.95);      // "1916" board
export const COAL: V3 = S(2.75, 0, 1.05);               // coal heap in front of the stove
export const BANNER: V3 = [0, D0 + 4.6, -45];
export const ST_CLOCK: V3 = ST(2.2, 0, -41.2);
export const STALL_Z = -52;
export const SALE: V3 = ST(-3.6, 0, STALL_Z), GREEN: V3 = ST(0.1, 0, STALL_Z - 0.4), GRILL: V3 = ST(3.4, 0, STALL_Z);
export const MONEY: V3 = ST(0.1, 2.35, STALL_Z - 2.2);

const keys = (): Record<number, Key[]> => {
  const c: Record<number, Key[]> = {};
  // 1 hook: the farmer glaring, the clock beside him; slow push
  c[1] = [{ f: 0, s: (f) => push(F(0.22, 1.6, -3.4), F(0.3, 1.5, 2.0), f, 0, 0.0018, { fov: 46 }) }];
  // 2 wider with the other farmers -> glide to the clock as it gets stamped on "banned"
  c[2] = [
    { f: A(2), s: (f) => push(F(-0.1, 2.0, -5.2), F(0.1, 1.45, 2.6), f, A(2), 0.002, { fov: 44 }) },
    { f: on(1, "banned", 18), dur: 18, s: (f) => push(F(1.15, 2.2, -0.9), F(1.15, 2.12, 2.1), f, on(1, "banned", 18), 0.003, { fov: 38 }) },
  ];
  // 3 1916, the workshop at night: year board, clock, stove with coal
  c[3] = [{ f: A(3), s: (f) => push(S(0.25, 1.9, -3.1), S(0.25, 1.95, 2.9), f, A(3), 0.0025, { fov: 44 }) }];
  // 4 close on the clock (the hand jumps an hour) -> down to the coal heap on "coal"
  c[4] = [
    { f: A(4), s: (f) => push(S(0.75, 2.6, 0.9), [SHOP_CLOCK[0], SHOP_CLOCK[1], SHOP_CLOCK[2]], f, A(4), 0.002, { fov: 40 }) },
    { f: on(3, "coal", 22), dur: 22, s: (f) => push(S(2.2, 1.45, -1.4), S(2.75, 0.45, 1.1), f, on(3, "coal", 22), 0.002, { fov: 42 }) },
  ];
  // 5 1918: the SAVE DAYLIGHT banner on the main street, people walk under it
  c[5] = [{ f: A(5), s: (f) => push([0.4, D0 + 1.8, -31.0], [0, D0 + 3.5, BANNER[2]], f, A(5), 0.002, { fov: 48 }) }];
  // 6 the cow and the clock
  c[6] = [{ f: A(6), s: (f) => push(F(1.85, 1.7, -4.6), F(1.85, 1.6, 2.4), f, A(6), 0.003, { fov: 42 }) }];
  // 7 dew on the hay -> glide to the MILK TRAIN sign on "milk"
  c[7] = [
    { f: A(7), s: (f) => push(F(-2.6, 1.45, 0.4), F(-3.4, 0.7, 4.4), f, A(7), 0.002, { fov: 44 }) },
    { f: wordAt(6, "milk") - 4, cut: true, s: (f) => push(F(-1.4, 1.55, 1.8), F(-1.55, 1.25, 6.2), f, wordAt(6, "milk") - 4, 0.002, { fov: 42 }) },
  ];
  // 8 farmers in the hall, CONGRESS board behind them
  c[8] = [{ f: A(8), s: (f) => push(C(0, 2.5, -6.0), C(0, 2.2, 4.0), f, A(8), 0.0018, { fov: 48 }) }];
  // 9 the repeal paper on the lectern, stamped VETOED
  c[9] = [{ f: A(9), s: (f) => push(C(0.0, 2.35, 3.45), C(0, 1.62, 4.4), f, A(9), 0.0015, { fov: 40 }) }];
  // 10 the senators cheer; the board flips to REPEALED! on "overrode"
  c[10] = [{ f: A(10), s: (f) => push(C(0, 2.7, -6.8), C(0, 2.3, 4.0), f, A(10), 0.0025, { fov: 46 }) }];
  // 11 the helper shrugs at the street clock
  c[11] = [{ f: A(11), s: (f) => push(ST(1.75, 1.75, -35.6), ST(1.75, 1.7, -41.0), f, A(11), 0.0018, { fov: 42 }) }];
  // 12 one stall per word: shops, golf, barbecue
  c[12] = [
    { f: A(12), s: (f) => push(ST(-3.6, 1.5, -48.4), ST(-3.6, 1.2, STALL_Z), f, A(12), 0.003, { fov: 40 }) },
    { f: on(11, "golf", 14), dur: 14, s: (f) => push(ST(0.1, 1.6, -48.0), ST(0.1, 0.9, STALL_Z), f, on(11, "golf", 14), 0.003, { fov: 40 }) },
    { f: on(11, "barbecue", 14), dur: 14, s: (f) => push(ST(3.4, 1.5, -48.6), ST(3.4, 0.9, STALL_Z), f, on(11, "barbecue", 14), 0.003, { fov: 40 }) },
  ];
  // 13 the green, then the $200,000,000 board pops up behind it
  c[13] = [{ f: A(13), s: (f) => push(ST(0.1, 1.75, -46.8), ST(0.1, 1.45, STALL_Z - 1.2), f, A(13), 0.002, { fov: 44 }) }];
  // 14 Halloween street seen across: jack-o'-lanterns on the doorsteps, kids walking past
  c[14] = [{ f: A(14), s: (f) => push(ST(4.2, 1.35, -56.5), ST(-6.0, 0.85, -60.0), f, A(14), 0.002, { fov: 46 }) }];
  // 15 slide along the back row of seats: a candy pumpkin on every one
  c[15] = [{ f: A(15), s: (f) => push(C(-6.4, 1.8, -2.5), C(-2.6, 0.45, -1.4), f, A(15), 0.002, { fov: 44 }) }];
  // 16 2005: daylight trick-or-treat under the banner
  c[16] = [{ f: A(16), s: (f) => push([-0.4, D0 + 1.7, -31.5], [0, D0 + 3.2, BANNER[2]], f, A(16), 0.002, { fov: 48 }) }];
  // 17 night: the sleepy helper holds up a candy pumpkin; punch in on "thank"
  c[17] = [
    { f: A(17), s: (f) => push(ST(0.15, 1.45, -37.4), ST(0.1, 1.3, -41.0), f, A(17), 0.002, { fov: 40 }) },
    { f: on(16, "thank", 18), dur: 18, s: (f) => push(ST(0.2, 1.38, -38.4), ST(0.18, 1.22, -41.0), f, on(16, "thank", 18), 0.0015, { fov: 40 }) },
  ];
  return c;
};
let CAMS: Record<number, Key[]> | null = null;
export const camAt = (id: number, f: number): Cam => { CAMS ??= keys(); return run(CAMS[id], f); };

/** lens blur per shot (px at 1080 x 1920 at infinity); 0 = all sharp */
export const DOF: Record<number, number> = { 1: 10, 2: 6, 3: 10, 4: 12, 5: 0, 6: 10, 7: 12, 8: 6, 9: 12, 10: 4, 11: 10, 12: 10, 13: 8, 14: 4, 15: 12, 16: 0, 17: 12 };
