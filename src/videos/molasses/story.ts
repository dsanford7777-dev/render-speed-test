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
export const FIRE: V3 = M(-5, 0, -104);           // firehouse base centre (west side), front on x = MX - 1
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
    case 1: return -101 - 13 * u;
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

const L3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** progress through a shot (0..1), eased: the camera's sweep spans the whole shot */
const U = (id: number, f: number, ease = glide) => ease((f - SHOTS[id - 1].a) / Math.max(1, SHOTS[id - 1].b - SHOTS[id - 1].a));
/** a point on a circle around c: angle a (radians, 0 = due south of c, + = toward +x), radius r, height h above c */
const orb = (c: V3, r: number, h: number, a: number): V3 => [c[0] + r * Math.sin(a), c[1] + h, c[2] - r * Math.cos(a)];
const shake = (f: number, amp: number): V3 => [amp * Math.sin(f * 1.7), amp * 0.6 * Math.sin(f * 2.3 + 1), 0];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// Camera grammar here: every shot moves. Cranes rise to reveal size, orbits swing around a subject, the camera backs
// away from the wave as it comes, swoops push in on the payoff word. Big reframes are still hard cuts.
const keys = (): Record<number, Key[]> => {
  const c: Record<number, Key[]> = {};
  // 1 hook: low, the camera rises and swings toward the oncoming wave while people run at us
  c[1] = [{ f: 0, s: (f) => { const u = U(1, f, smooth); return { pos: L3(M(2.5, 0.8, -142), M(7.0, 3.4, -133), u), look: M(5, 5.0 + 0.6 * u, -112), fov: 56 - 4 * u, roll: 0.06 - 0.09 * u }; } }];
  // 2 crane up from the street to rooftop height: the tank is five stories tall
  c[2] = [{ f: A(2), s: (f) => { const u = U(2, f); return { pos: L3(M(7.5, 1.4, -100), M(5.0, 12.5, -90), u), look: L3(M(-14, 6, -50), M(-15, 12, -50), u), fov: 54 }; } }];
  // 3 truck along the tank's foot onto the gallons board
  c[3] = [{ f: A(3), s: (f) => { const u = U(3, f); return { pos: L3(M(5.0, 1.2, -55.0), M(2.8, 2.2, -49.8), u), look: L3(M(-2.6, 2.3, -47.8), M(-2.4, 2.15, -47.1), u), fov: 48 }; } }];
  // 4 orbit around the treasurer and his upside-down plan
  c[4] = [{ f: A(4), s: (f) => { const u = U(4, f, smooth); return { pos: orb(M(-1.5, 0, -56.4), 6.4 - 0.8 * u, 1.6, 1.42 - 0.42 * u), look: M(-1.45, 1.55, -56.4), fov: 44 }; } }];
  // 5 swoop in on TREASURER
  c[5] = [{ f: A(5), s: (f) => { const u = U(5, f); return { pos: L3(M(6.0, 3.2, -62.0), M(3.0, 1.75, -59.6), u), look: L3(M(-1.6, 1.4, -58.9), M(-1.6, 1.85, -58.9), u), fov: 44, roll: 0.05 * (1 - u) }; } }];
  // 6 crane down onto the hose; the X pops on "never"
  c[6] = [{ f: A(6), s: (f) => { const u = U(6, f); return { pos: L3(M(1.0, 4.2, -63.2), M(2.4, 1.1, -64.2), u), look: L3(M(-2.5, 0.2, -62.5), M(-2.4, 0.6, -62.5), u), fov: 46 }; } }];
  // 7 the calendar (slow arc), then cut to the tank's base as it bursts: pull back fast, with a shake
  c[7] = [
    { f: A(7), s: (f) => { const u = U(7, f, smooth); return { pos: orb(M(0.2, 0, -46.5), 4.4, 1.9, 1.3 - 0.35 * u), look: M(0.2, 1.75, -46.5), fov: 42 }; } },
    { f: wordAt(6, "burst") - 4, cut: true, s: (f) => { const k = smooth((f - wordAt(6, "burst") + 4) / 24), sh = Math.max(0, 1 - (f - wordAt(6, "burst")) / 30);
      return { pos: add(L3(M(5.5, 1.8, -55.0), M(10.0, 2.5, -57.0), k), shake(f, 0.12 * sh)), look: M(-4, 3.2, -52.2), fov: 50 + 6 * k }; } },
  ];
  // 8 the camera backs away as the wave comes on, tilting up to the 25 FT mark
  c[8] = [{ f: A(8), s: (f) => { const u = U(8, f, smooth); return { pos: L3(M(4.0, 1.4, -120), M(5.0, 2.4, -129), u), look: L3(M(7.2, 5.4, -100), M(7.5, 6.2, -102), u), fov: 54 }; } }];
  // 9 low and fast: the wave rushes at the lens past the 35 MPH sign, the camera stumbling backward
  c[9] = [{ f: A(9), s: (f) => { const u = U(9, f, (x) => x); return { pos: add(L3(M(3.5, 0.9, -137), M(4.5, 1.2, -143), u), shake(f, 0.05)), look: M(4.0, 2.8, -118), fov: 56, roll: 0.035 * Math.sin(f * 0.9) }; } }];
  // 10 arc across the firehouse front as it's knocked off its base -> crane up to the twisted span on "twisted"
  c[10] = [
    { f: A(10), s: (f) => { const u = U(10, f, smooth); return { pos: L3(M(7.5, 1.6, -112.5), M(7.2, 2.6, -109.5), u), look: M(-2.5, 4.2, -104.2), fov: 56 }; } },
    { f: on(9, "twisted", 26), dur: 26, s: (f) => push(M(2.6, 2.6, -131), M(7, 5.6, -120), f, on(9, "twisted", 26), 0.0015, { fov: 50 }) },
  ];
  // 11 descend from above over the glossy, thickening street
  c[11] = [{ f: A(11), s: (f) => { const u = U(11, f); return { pos: L3(M(2.2, 8.5, -152), M(3.0, 1.3, -140), u), look: L3(M(3.5, 0.0, -118), M(3.5, 0.4, -110), u), fov: 50 }; } }];
  // 12 orbit around the stuck cart and the hat
  c[12] = [{ f: A(12), s: (f) => { const u = U(12, f, smooth); return { pos: orb(M(2.2, 0, -91), 7.0, 1.9 - 0.4 * u, -0.45 + 0.5 * u), look: M(2.2, 0.5, -91), fov: 48 }; } }];
  // 13 back before: low and wide, sweeping up and around the whole tank
  c[13] = [{ f: A(13), s: (f) => { const u = U(13, f); return { pos: L3(M(10, 1.2, -84), M(5, 7.5, -76), u), look: L3(M(-14, 8, -50), M(-15, 6.5, -50), u), fov: 54 }; } }];
  // 14 slide down the wall with the drips
  c[14] = [{ f: A(14), s: (f) => { const u = U(14, f, smooth); return { pos: L3(M(1.0, 3.8, -51.4), M(0.7, 1.8, -50.8), u), look: L3(M(-4, 4.0, -52.4), M(-4, 2.1, -52.4), u), fov: 42 }; } }];
  // 15 dolly along the kids and their cups
  c[15] = [{ f: A(15), s: (f) => { const u = U(15, f, smooth); return { pos: L3(M(2.6, 1.3, -59.0), M(2.3, 1.45, -57.6), u), look: L3(M(-3.1, 1.0, -53.0), M(-3.1, 1.1, -52.3), u), fov: 52 }; } }];
  // 16 slow swing around the treasurer as he shrugs at the streaks
  c[16] = [{ f: A(16), s: (f) => { const u = U(16, f, smooth); return { pos: orb(M(-1.9, 0, -55.8), 5.6, 1.6, 0.95 + 0.3 * u), look: M(-1.9, 1.5, -55.8), fov: 44, roll: -0.03 * u }; } }];
  // 17 rise with the painter as the brown climbs the tank
  c[17] = [{ f: A(17), s: (f) => { const u = U(17, f); return { pos: L3(M(8.0, 1.6, -64), M(7.0, 4.6, -61), u), look: L3(M(-4, 5.0, -53.2), M(-4, 8.2, -53.2), u), fov: 54 }; } }];
  return c;
};
let CAMS: Record<number, Key[]> | null = null;
export const camAt = (id: number, f: number): Cam => { CAMS ??= keys(); return run(CAMS[id], f); };

/** lens blur per shot (px at 1080 x 1920 at infinity); 0 = all sharp */
export const DOF: Record<number, number> = { 1: 4, 2: 0, 3: 10, 4: 10, 5: 12, 6: 12, 7: 8, 8: 4, 9: 6, 10: 4, 11: 0, 12: 10, 13: 0, 14: 12, 15: 10, 16: 12, 17: 0 };
