// Cameras and lens per shot. Same grammar as the earlier shorts (slow push-ins, smootherstep glides, big reframes are
// hard cuts) plus the pacing rules: punch-ins with a short shake on the hook, the stamp and the cut.
// Two sets: the barber's shop (open-roofed room out on the meadow, open toward -z, cameras look +z) and the shop front
// on the town's main street (west row, fronts at x = -6, cameras look -x; screen right is -z).
import { FPS, SHOTS, wordAt } from "./timeline";

export type V3 = [number, number, number];
export const D0 = 6.0;
export const SHOP: V3 = [300, D0, 0];
export const S = (x: number, y: number, z: number): V3 => [SHOP[0] + x, SHOP[1] + y, SHOP[2] + z];
/** the pole / staff on the street: centre of the sleeve */
export const POLE: V3 = [-5.25, D0 + 2.25, 96.6];
export const P = (x: number, y: number, z: number): V3 => [POLE[0] + x, POLE[1] + y, POLE[2] + z];
/** the shop front panel (on the house front at x = -6) and its window sill */
export const FRONT = { x: -5.97, z0: 97.2, z1: 102.8, h: 3.85 };
export const SILL: V3 = [-5.76, D0 + 0.76, 99.07];
export const FLAG: V3 = [-4.35, D0, 95.85];

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
const dolly = (p0: V3, p1: V3, l0: V3, l1: V3, f: number, f0: number, f1: number, rest: Partial<Cam> = {}): Shot => {
  const u = smooth((f - f0) / Math.max(1, f1 - f0)), L = (a: V3, b: V3) => a.map((v, i) => v + (b[i] - v) * u) as V3;
  return { pos: L(p0, p1), look: L(l0, l1), ...rest };
};
export const A = (id: number) => SHOTS[id - 1].a;
export const B = (id: number) => SHOTS[id - 1].b;
const on = (seg: number, w: string, dur = 24) => wordAt(seg, w) - Math.round(dur / 2);

/** the hook framing: low on the street, the pole big in the upper half of the frame (the ending glides back to it) */
export const HOOK_POS: V3 = P(2.95, -0.8, -1.5), HOOK_LOOK: V3 = P(0, -0.3, -0.05);
const keys = (): Record<number, Key[]> => {
  const c: Record<number, Key[]> = {};
  // 1 hook: the spinning pole; punch in on "blood"
  c[1] = [
    { f: 0, s: (f) => push(HOOK_POS, HOOK_LOOK, f, 0, 0.001, { fov: 44 }) },
    { f: wordAt(1, "blood") - 3, cut: true, s: (f) => push(P(2.0, -0.6, -1.0), P(0, -0.5, 0), f, wordAt(1, "blood") - 3, 0.002, { fov: 42 }) },
  ];
  // 2 the barber behind his chair; the BARBER = SURGEON board above
  c[2] = [{ f: A(2), s: (f) => push(S(0.35, 1.6, -3.3), S(0.35, 1.55, 0.9), f, A(2), 0.0025, { fov: 46 }) }];
  // 3 the customer in the chair, the barber's icons above
  c[3] = [{ f: A(3), s: (f) => push(S(0, 1.35, -2.9), S(0, 1.45, 0.8), f, A(3), 0.0022, { fov: 46 }) }];
  // 4 close on the hand squeezing the staff
  c[4] = [{ f: A(4), s: (f) => push(S(0.15, 1.35, -1.95), S(0.15, 1.25, 0.35), f, A(4), 0.0018, { fov: 46 }) }];
  // 5 the bowl on the table: drops on "cut", fills on "ran"
  c[5] = [{ f: A(5), s: (f) => push(S(-1.35, 1.55, -0.85), S(-1.35, 1.05, 0.35), f, A(5), 0.0022, { fov: 44 }) }];
  // 6 the shop window from the street; punch in on "banned"
  c[6] = [
    { f: A(6), s: (f) => push([-3.0, D0 + 1.25, 98.0], [SILL[0], D0 + 0.5, SILL[2] + 0.35], f, A(6), 0.0018, { fov: 46 }) },
    { f: wordAt(8, "banned") - 3, cut: true, s: (f) => push([-2.9, D0 + 1.45, 98.6], [SILL[0], D0 + 0.95, SILL[2]], f, wordAt(8, "banned") - 3, 0.0015, { fov: 50 }) },
  ];
  // 7 the staff outside the shop with the bandages hanging to dry
  c[7] = [{ f: A(7), s: (f) => push(P(3.1, -0.75, -1.3), P(0, -0.2, 0.1), f, A(7), 0.0018, { fov: 46 }) }];
  // 8 the twist: slow push toward the sleeve (continues straight into 9 through the dissolve)
  const p8 = P(2.5, -0.55, -1.0), l8 = P(0, -0.1, 0);
  c[8] = [{ f: A(8), s: (f) => push(p8, l8, f, A(8), 0.0016, { fov: 44 }) }];
  c[9] = [{ f: A(9) - 10, s: (f) => push(p8, l8, f, A(8), 0.0016, { fov: 44 }) }];
  // 10 close on the stripes
  c[10] = [{ f: A(10), s: (f) => push(P(0.95, -0.05, -0.45), P(0, 0.0, 0), f, A(10), 0.002, { fov: 40 }) }];
  // 11 up to the ball on top; push in on "bowl"
  c[11] = [
    { f: A(11), s: (f) => push(P(2.1, 0.0, -1.0), P(0, 0.45, 0), f, A(11), 0.0018, { fov: 42 }) },
    { f: wordAt(14, "bowl") - 3, cut: true, s: (f) => push(P(1.3, 1.25, -0.6), P(0, 0.62, 0), f, wordAt(14, "bowl") - 3, 0.0015, { fov: 40 }) },
  ];
  // 12 the blue stripe and the flag, then glide back to the hook framing so the video loops
  c[12] = [
    { f: A(12), s: (f) => push(P(3.4, -0.75, -2.3), P(0, -0.3, -0.55), f, A(12), 0.0012, { fov: 48 }) },
    { f: B(12) - 40, dur: 34, s: () => ({ pos: HOOK_POS, look: HOOK_LOOK, fov: 44 }) },
  ];
  return c;
};
let CAMS: Record<number, Key[]> | null = null;
/** camera shakes: [shot, frame, strength]; 7-frame kicks that flip sign every frame */
const SHAKES = (): [number, number, number][] => [[1, wordAt(1, "blood") - 3, 1], [5, wordAt(5, "cut"), 0.6], [6, wordAt(8, "banned") - 3, 1]];
let SH: [number, number, number][] | null = null;
export const camAt = (id: number, f: number): Cam => {
  CAMS ??= keys(); SH ??= SHAKES();
  const c = run(CAMS[id], f);
  for (const [sid, f0, k] of SH) if (sid === id && f >= f0 && f < f0 + 7) {
    const d = f - f0, s = (d % 2 ? -1 : 1) * k * (1 - d / 7);
    c.pos = [c.pos[0], c.pos[1] + 0.025 * s, c.pos[2] + 0.03 * s]; c.roll += 0.012 * s;
  }
  return c;
};
export const fps = FPS;

/** lens blur per shot (px at 1080 x 1920 at infinity); 0 = all sharp */
export const DOF: Record<number, number> = { 1: 8, 2: 6, 3: 6, 4: 10, 5: 10, 6: 6, 7: 8, 8: 8, 9: 8, 10: 10, 11: 10, 12: 8 };
