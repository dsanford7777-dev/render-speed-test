// Cameras and lens per shot. Same grammar as the earlier shorts (slow push-ins, smootherstep glides, big reframes are
// hard cuts), plus the Nov 9 pacing rules: punch-ins with a short camera shake on the hook and the ending.
// Keys sit on word onsets (wordAt) so they follow the narration.
import { FPS, SHOTS, wordAt } from "./timeline";

export type V3 = [number, number, number];
export const D0 = 6.0;
/** set origins, all on the near bank (river at z > -30 behind them; cameras look along +z) */
export const FARM_O: V3 = [-300, D0, -60];   // Cutlar's farm: barn, potato patch
export const HILL: V3 = [-260, D0, -46];     // the two flags on one hill
export const STAND: V3 = [-220, D0, -50];    // the standoff: pig between two lines, warship behind
export const QUAY: V3 = [-180, D0, -34];     // governor / admiral / pig board at the water's edge, ship behind
export const CAMPS: V3 = [-120, D0, -70];    // American Camp and English Camp on one meadow
export const GRAVE: V3 = [-60, D0, -62];     // the pig's grave
export const HALL: V3 = [600, D0, 0];        // the hall (Kaiser)
const at = (o: V3) => (x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
export const Fm = at(FARM_O), Hl = at(HILL), St = at(STAND), Q = at(QUAY), Cp = at(CAMPS), G = at(GRAVE), C = at(HALL);
/** the warship: on the river behind the standoff and the quay; sails in for shot 6 */
export const SHIP_Z = -17;

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
/** straight dolly from p0 to p1 over [f0, f1] (eased), look fixed or moving with it */
const dolly = (p0: V3, p1: V3, l0: V3, l1: V3, f: number, f0: number, f1: number, rest: Partial<Cam> = {}): Shot => {
  const u = smooth((f - f0) / Math.max(1, f1 - f0)), L = (a: V3, b: V3) => a.map((v, i) => v + (b[i] - v) * u) as V3;
  return { pos: L(p0, p1), look: L(l0, l1), ...rest };
};
export const A = (id: number) => SHOTS[id - 1].a;
export const B = (id: number) => SHOTS[id - 1].b;
const on = (seg: number, w: string, dur = 24) => wordAt(seg, w) - Math.round(dur / 2);

const keys = (): Record<number, Key[]> => {
  const c: Record<number, Key[]> = {};
  // 1 hook: the pig between the two lines, the warship's masts behind; punch in on "pig"
  c[1] = [
    { f: 0, s: (f) => push(St(0, 1.35, -7.2), St(0, 1.6, 0), f, 0, 0.0022, { fov: 50 }) },
    { f: wordAt(0, "pig") - 3, cut: true, s: (f) => push(St(0, 0.95, -2.6), St(0, 0.55, 0), f, wordAt(0, "pig") - 3, 0.003, { fov: 42 }) },
  ];
  // 2 the island: low under the two flags on the hill, glide from America's to Britain's
  c[2] = [
    { f: A(2), s: (f) => dolly(Hl(-1.0, 2.0, -7.5), Hl(1.0, 2.3, -6.6), Hl(-0.5, 3.6, 0), Hl(0.5, 3.6, 0), f, A(2), B(2), { fov: 46 }) },
  ];
  // 3 the farmer and the pig in his potatoes; snap to the pig on "pig", BANG on "shot" is a separate card
  c[3] = [
    { f: A(3), s: (f) => push(Fm(-0.15, 1.45, -7.6), Fm(-0.15, 0.95, -1.4), f, A(3), 0.002, { fov: 46 }) },
    { f: wordAt(2, "pig") - 3, cut: true, s: (f) => push(Fm(0.6, 0.9, -4.6), Fm(0.6, 0.45, -1.6), f, wordAt(2, "pig") - 3, 0.003, { fov: 42 }) },
    { f: wordAt(2, "potatoes") - 3, cut: true, s: (f) => push(Fm(0.5, 1.0, -3.9), Fm(0.5, 0.25, -1.4), f, wordAt(2, "potatoes") - 3, 0.003, { fov: 44 }) },
  ];
  // 4 the British officer holds up the ARREST ORDER; the farmer flinches
  c[4] = [{ f: A(4), s: (f) => push(Fm(-0.7, 1.45, -9.8), Fm(-0.7, 1.25, -4.0), f, A(4), 0.0025, { fov: 46 }) }];
  // 5 American soldiers march past behind their flag (seen across the column)
  c[5] = [{ f: A(5), s: (f) => dolly(St(-3, 1.3, -14.5), St(-1, 1.5, -13.0), St(-3, 1.3, -6), St(-1, 1.4, -6), f, A(5), B(5), { fov: 44 }) }];
  // 6 low over the water: the warship sails in and fills the frame
  c[6] = [{ f: A(6), s: (f) => push([-208, 1.6, -27.5], [-221, 4.6, SHIP_Z], f, A(6), 0.004, { fov: 50, roll: -0.03 }) }];
  // 7 the American line and its cannons; the "461" board pops up
  c[7] = [{ f: A(7), s: (f) => push(St(-5.4, 1.9, -9.8), St(-4.6, 1.6, 0.5), f, A(7), 0.0012, { fov: 46 }) }];
  // 8 across to the redcoats; the "2,140" board
  c[8] = [{ f: A(8), s: (f) => push(St(5.4, 1.9, -9.8), St(4.6, 1.6, 0.5), f, A(8), 0.0012, { fov: 46 }) }];
  // 9 the governor points across the water
  c[9] = [{ f: A(9), s: (f) => push(Q(-1.6, 1.55, -5.4), Q(-1.0, 1.75, 2.0), f, A(9), 0.0025, { fov: 44 }) }];
  // 10 the admiral shakes his head; NO board
  c[10] = [{ f: A(10), s: (f) => push(Q(1.4, 1.55, -5.0), Q(1.4, 1.6, 1.5), f, A(10), 0.003, { fov: 44 }) }];
  // 11 the pig and the "A WAR? OVER A PIG?" board
  c[11] = [{ f: A(11), s: (f) => push(Q(0.2, 1.2, -5.6), Q(0.2, 1.15, 0.5), f, A(11), 0.0025, { fov: 46 }) }];
  // 12 crane down over the two camps; the year counter in the middle
  c[12] = [{ f: A(12), s: (f) => dolly(Cp(0, 7.5, -18), Cp(0, 2.6, -10.5), Cp(0, 0.5, 2), Cp(0, 1.7, 1), f, A(12), B(12) - 10, { fov: 50 }) }];
  // 13 the Kaiser on the dais under the ARBITRATION board
  c[13] = [{ f: A(13), s: (f) => push(C(0.3, 2.0, -3.6), C(0.3, 2.2, 5.0), f, A(13), 0.0025, { fov: 50 }) }];
  // 14 the hill: Britain's flag comes down, America's goes up; push in on "America"
  c[14] = [
    { f: A(14), s: (f) => push(Hl(0, 1.5, -8.5), Hl(0, 2.8, 0), f, A(14), 0.002, { fov: 48 }) },
    { f: on(13, "America", 16), dur: 16, s: (f) => push(Hl(-0.6, 2.2, -5.5), Hl(-0.6, 3.0, 0), f, on(13, "America", 16), 0.002, { fov: 46 }) },
  ];
  // 15 crane over the empty field toward the little grave
  c[15] = [{ f: A(15), s: (f) => dolly(G(0, 4.0, -12), G(0, 1.5, -5.0), G(0, 0.3, 2), G(0, 0.5, 0), f, A(15), B(15), { fov: 46 }) }];
  // 16 "The pig.": punch in on the gravestone
  c[16] = [
    { f: A(16), s: (f) => push(G(0, 1.1, -3.4), G(0, 0.55, 0), f, A(16), 0.002, { fov: 42 }) },
    { f: wordAt(15, "pig") - 2, cut: true, s: (f) => push(G(0, 0.8, -2.0), G(0, 0.6, 0), f, wordAt(15, "pig") - 2, 0.0015, { fov: 42 }) },
  ];
  return c;
};
let CAMS: Record<number, Key[]> | null = null;
/** camera shakes: [shot, frame, strength]; 7-frame kicks that flip sign every frame */
const SHAKES = (): [number, number, number][] => [[1, wordAt(0, "pig") - 3, 1], [3, wordAt(2, "shot"), 0.8], [16, wordAt(15, "pig") - 2, 0.6]];
let SH: [number, number, number][] | null = null;
export const camAt = (id: number, f: number): Cam => {
  CAMS ??= keys(); SH ??= SHAKES();
  const c = run(CAMS[id], f);
  for (const [sid, f0, k] of SH) if (sid === id && f >= f0 && f < f0 + 7) {
    const d = f - f0, s = (d % 2 ? -1 : 1) * k * (1 - d / 7);
    c.pos = [c.pos[0] + 0.03 * s, c.pos[1] + 0.025 * s, c.pos[2]]; c.roll += 0.012 * s;
  }
  return c;
};
export const fps = FPS;

/** lens blur per shot (px at 1080 x 1920 at infinity); 0 = all sharp */
export const DOF: Record<number, number> = { 1: 6, 2: 4, 3: 10, 4: 8, 5: 6, 6: 0, 7: 6, 8: 6, 9: 8, 10: 8, 11: 8, 12: 0, 13: 6, 14: 4, 15: 4, 16: 10 };
