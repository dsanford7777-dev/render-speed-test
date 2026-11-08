// Cameras and lens per shot. Same grammar as the earlier shorts: slow push-ins, smootherstep glides between framings,
// big reframes are hard cuts. Keys sit on word onsets (wordAt) so they follow the narration.
// The set is its own waterfront street far east of the old town (x ~ 800, near bank): the tank stands on the quay,
// Commercial Street runs south from it (along -z) under the elevated railway. Cameras mostly look north (+z) toward
// the harbor, or west (-x) at the tank's street side.
import { SHOTS, wordAt } from "./timeline";

export type V3 = [number, number, number];
export const D0 = 6.0;
export const MX = 800;
/** set coordinates: x relative to the set, y above the street, z absolute (the river starts at z = -30) */
export const M = (x: number, y: number, z: number): V3 => [MX + x, D0 + y, z];
export const TANK: V3 = M(-16, 0, -52);           // tank base centre; street face at x = MX - 4
export const STREET = { x0: MX + 1, x1: MX + 9, z0: -36.5, z1: -160 };
export const EL = { x: MX + 7, h: 5.2, z0: -40, z1: -152, bentZ: -120 };
export const FIRE: V3 = M(15, 0, -104);           // firehouse base centre, front on x = MX + 11
export const WAVE = { x: MX + 5, w: 24, H: 7.6 };

// props
export const GALLONS: V3 = M(-2.4, 2.1, -47);
export const EASEL: V3 = M(-1.7, 0, -55.6);
export const JELL4: V3 = M(-1.25, 0, -57.4);
export const DESK: V3 = M(-0.9, 0, -58.8);
export const PLAQUE: V3 = M(-2.3, 2.45, -58.8);
export const JELL5: V3 = M(-1.75, 0, -59.2);
export const HOSE: V3 = M(-2.5, 0, -62.6);
export const CAL: V3 = M(0.2, 2.3, -46.5);
export const POLE: V3 = M(10.2, 0, -104);
export const MPH: V3 = M(1.6, 2.5, -123);
export const CART: V3 = M(3.0, -0.22, -92);
export const HAT: V3 = M(0.9, 0.36, -89.6);
export const KIDS_AT: V3[] = [M(-3.3, 0, -50.6), M(-3.3, 0, -52.2), M(-3.3, 0, -53.8)];
export const JELL16: V3 = M(-1.7, 0, -56.4);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };

/** wave front (absolute z) per shot and frame; the wave runs south (-z) down the street */
export const waveFront = (id: number, f: number): number | null => {
  const s = SHOTS[id - 1], u = (f - s.a) / Math.max(1, s.b - s.a);
  switch (id) {
    case 1: return -110 - 9 * u;
    case 8: return -90 - 12 * u;
    case 9: return -104 - 22 * u;
    default: return null;
  }
};

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

const keys = (): Record<number, Key[]> => {
  const c: Record<number, Key[]> = {};
  // 1 hook: low in the street, the wave towering toward the lens, people running at us
  c[1] = [{ f: 0, s: (f) => push(M(5, 1.3, -138), M(5, 5.2, -112), f, 0, 0.0016, { fov: 54 }) }];
  // 2 the tank by the harbor, people tiny at its foot
  c[2] = [{ f: A(2), s: (f) => push(M(12, 2.2, -96), M(-14, 7.5, -50), f, A(2), 0.0018, { fov: 54 }) }];
  // 3 the gallons board at the tank's foot
  c[3] = [{ f: A(3), s: (f) => push(M(3.2, 2.0, -50.4), M(-2.4, 2.15, -47.1), f, A(3), 0.002, { fov: 44 }) }];
  // 4 the treasurer and his upside-down plan
  c[4] = [{ f: A(4), s: (f) => push(M(5.2, 1.6, -59.4), M(-1.5, 1.45, -56.4), f, A(4), 0.002, { fov: 42 }) }];
  // 5 TREASURER over his desk of coins
  c[5] = [{ f: A(5), s: (f) => push(M(3.6, 1.7, -59.6), M(-1.6, 1.75, -58.9), f, A(5), 0.002, { fov: 42 }) }];
  // 6 the hose; the X pops on "never"
  c[6] = [{ f: A(6), s: (f) => push(M(2.6, 1.3, -64.0), M(-2.5, 0.6, -62.5), f, A(6), 0.002, { fov: 44 }) }];
  // 7 the calendar, then cut to the tank's base as it bursts
  c[7] = [
    { f: A(7), s: (f) => push(M(4.2, 1.9, -48.1), M(0.2, 1.75, -46.5), f, A(7), 0.002, { fov: 42 }) },
    { f: wordAt(6, "burst") - 4, cut: true, s: (f) => push(M(11, 2.0, -57), M(-4, 3.4, -52.2), f, wordAt(6, "burst") - 4, 0.0012, { fov: 54 }) },
  ];
  // 8 the wave against the 25 FT pole
  c[8] = [{ f: A(8), s: (f) => push(M(4.5, 2.0, -127), M(6.5, 4.8, -98), f, A(8), 0.0015, { fov: 52 }) }];
  // 9 low and fast: the wave rushes at the lens past the 35 MPH sign
  c[9] = [{ f: A(9), s: (f) => ({ pos: M(4, 0.9, -141), look: M(4.0, 2.8, -118), fov: 56, roll: 0.03 * Math.sin(f * 0.9) }) }];
  // 10 the firehouse slides off its base -> glide up to the twisted span of the El on "twisted"
  c[10] = [
    { f: A(10), s: (f) => push(M(0.5, 2.2, -119), M(12, 3.6, -105), f, A(10), 0.0015, { fov: 52 }) },
    { f: on(9, "twisted", 26), dur: 26, s: (f) => push(M(3.0, 2.4, -138), M(7, 5.4, -120), f, on(9, "twisted", 26), 0.0015, { fov: 48 }) },
  ];
  // 11 the street under a glossy sheet of molasses
  c[11] = [{ f: A(11), s: (f) => push(M(2.0, 3.0, -150), M(3.5, 0.3, -112), f, A(11), 0.0015, { fov: 50 }) }];
  // 12 the cart and the hat, stuck fast
  c[12] = [{ f: A(12), s: (f) => push(M(1.4, 1.8, -99.0), M(2.2, 0.55, -91.0), f, A(12), 0.002, { fov: 48 }) }];
  // 13 back before: the tank whole, golden light
  c[13] = [{ f: A(13), s: (f) => push(M(11, 2.0, -80), M(-14, 7.0, -50), f, A(13), 0.002, { fov: 52 }) }];
  // 14 close on the leaking seams
  c[14] = [{ f: A(14), s: (f) => push(M(0.8, 2.4, -50.6), M(-4, 2.7, -52.4), f, A(14), 0.002, { fov: 42 }) }];
  // 15 kids with tin cups under the drips
  c[15] = [{ f: A(15), s: (f) => push(M(1.4, 1.35, -57.2), M(-3.2, 1.05, -52.2), f, A(15), 0.002, { fov: 50 }) }];
  // 16 the treasurer shrugs at the streaks
  c[16] = [{ f: A(16), s: (f) => push(M(3.6, 1.6, -58.6), M(-1.9, 1.5, -55.6), f, A(16), 0.002, { fov: 44 }) }];
  // 17 the painter covers the tank in brown
  c[17] = [{ f: A(17), s: (f) => push(M(7.5, 2.6, -63), M(-4.0, 6.8, -53.2), f, A(17), 0.0015, { fov: 54 }) }];
  return c;
};
let CAMS: Record<number, Key[]> | null = null;
export const camAt = (id: number, f: number): Cam => { CAMS ??= keys(); return run(CAMS[id], f); };

/** lens blur per shot (px at 1080 x 1920 at infinity); 0 = all sharp */
export const DOF: Record<number, number> = { 1: 4, 2: 0, 3: 10, 4: 10, 5: 12, 6: 12, 7: 8, 8: 4, 9: 6, 10: 4, 11: 0, 12: 10, 13: 0, 14: 12, 15: 10, 16: 12, 17: 0 };
