// The long-form's 3D shots, as specs: for a shot key (timeline.ts `g`) and frame, what the world looks like: light,
// camera, tank state, the wave, damage, props, cast, and the subject the narration is about (for the framing check).
// Built chapter by chapter; a 3D shot without a spec here still draws its placeholder.
// Grammar (same as the Shorts, framed for 16:9): every shot moves; slow push-ins, cranes, orbits; glide = smootherstep.
import { LightPreset } from "../bridge/lights";
import { Expr } from "../bridge/toon";
import { D0, MX, M, V3, TANK, WAVE, POLE, MPH, FIRE, EL, CART, DESK, PLAQUE, HOSE, JELL5, KIDS_AT } from "../molasses/story";
import { TANK_R, TANK_H } from "../molasses/props";
import { FPS, ShotDef, wordAt } from "./timeline";

/** the courtroom's centre: floating high above the set so only sky shows over its walls */
export const COURT: V3 = [MX, D0 + 120, -60];
export type Light3 = "day" | "golden" | "winter";
/** January 1919: the same daylight, cooler and paler */
export const WINTER: Partial<LightPreset> = { lit: [1.02, 1.06, 1.16], shade: [0.34, 0.38, 0.52], lift: [0.08, 0.1, 0.16], fog: "#d9e3ee" };

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person = {
  who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number;
  side?: { phase: number; mirror: boolean; stride?: number }; running?: boolean; cup?: boolean; brush?: boolean;
};
export type St = {
  light: Light3; cam: Cam; dof?: number; sunAz?: number; sunLook?: [number, number]; noSunDisc?: boolean;
  tank?: boolean; flood?: boolean; paint?: number; crack?: number; gush?: number;
  wave?: number | null; surge?: number; sheet?: boolean; fire?: number; twist?: number; el?: boolean; ship?: boolean; shipAt?: V3; pipe?: boolean;
  pole?: boolean; mph?: boolean; debris?: boolean; drips?: "seam" | "cups"; rivets?: number; flakes?: number; desk?: boolean; hose?: boolean; xMark?: number; /** 0..1: one rivet flying from the crack into the lens */ lungeRivet?: number; court?: boolean; park?: boolean;
  people?: Person[]; closeup?: boolean;
  /** a deliberate lunge at the lens: the framing check allows people this close */ lunge?: boolean;
  /** full-frame colour wipe over the 3D (0..1), e.g. the wave swallowing the lens */ wipe?: { color: string; a: number };
  subjects?: [string, V3, number][];
};

// ---------------- helpers ----------------
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const glide = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };
const lin = (x: number) => clamp01(x);
const L3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** progress through the shot, eased */
const U = (s: ShotDef, f: number, e = glide) => e((f - s.a) / Math.max(1, s.b - s.a));
/** a point on a circle around c (angle 0 = due south of c, + toward +x) */
const orb = (c: V3, r: number, h: number, a: number): V3 => [c[0] + r * Math.sin(a), c[1] + h, c[2] - r * Math.cos(a)];
const shake = (f: number, amp: number): V3 => [amp * Math.sin(f * 1.7), amp * 0.6 * Math.sin(f * 2.3 + 1), 0];
const cam = (pos: V3, look: V3, fov = 40, roll = 0): Cam => ({ pos, look, fov, roll });
/** 0 -> 1 over n frames starting at a word's onset (+ offset) */
const atWord = (f: number, seg: number, w: string, n = 14, off = 0) => smooth((f - wordAt(seg, w) - off) / n);

const FOLK = ["folk0", "folk1", "folk2", "folk3", "folk4"];
/** people walking up and down a lane pair along x (the quay) */
const walkersX = (names: string[], lanes: [number, number], span: [number, number], t: number): Person[] => names.map((n, k) => {
  const dir = k % 2 ? -1 : 1, lane = dir > 0 ? lanes[0] : lanes[1], sp = 1.2 + 0.1 * (k % 3), Ln = span[1] - span[0];
  const x0 = span[0] + ((k * 3.7) % Ln), u = span[0] + ((((x0 - span[0]) + dir * sp * t) % Ln) + Ln) % Ln, dist = (u - span[0]) * dir;
  return { who: n, p: [u, D0, lane], expr: "smile_closed", side: { phase: ((dist / 1.6) % 1 + 1) % 1, mirror: dir < 0, stride: 0.8 } };
});
/** people walking along the street (z), some each way */
const walkersZ = (names: string[], xs: [number, number], span: [number, number], t: number): Person[] => names.map((n, k) => {
  const dir = k % 2 ? -1 : 1, x = dir > 0 ? xs[0] : xs[1], sp = 1.15 + 0.1 * (k % 3), Ln = span[1] - span[0];
  const z0 = span[0] + ((k * 5.3) % Ln), z = span[0] + ((((z0 - span[0]) + dir * sp * t) % Ln) + Ln) % Ln, dist = (z - span[0]) * dir;
  return { who: n, p: [x, D0, z], expr: "smile_closed", side: { phase: ((dist / 1.6) % 1 + 1) % 1, mirror: dir > 0, stride: 0.8 } };
});

const wallPt = (y: number, dz = 0): V3 => [TANK[0] + TANK_R, D0 + y, TANK[2] + dz];
const TANK_TOP: V3 = [TANK[0] + TANK_R * 0.7, D0 + TANK_H * 0.75, TANK[2] - TANK_R * 0.6];

// ---------------- specs ----------------
type Spec = (s: ShotDef, f: number) => St;
export const SPECS: Record<string, Spec> = {
  // ===== cold open (rewritten) =====
  // frame 1: snap in on a brush slapping brown over a leaking seam
  "hook-brush": (s, f) => {
    const sn = glide((f - s.a) / 9), pk = 0.1 + 0.08 * smooth((f - s.a) / Math.max(1, s.b - s.a)), y = TANK_H * pk;
    const p: V3 = [TANK[0] + TANK_R + 0.7, D0 + Math.max(0, y - 1.3), TANK[2] - 1.2];
    return {
      light: "golden", el: false, paint: pk, drips: "seam", dof: 8, sunAz: 70,
      cam: cam(L3(M(7, 3.2, -45), [p[0] + 3.6, p[1] + 1.75, p[2] + 2.6], sn), L3(M(-4, 2.0, -52.6), [p[0] - 0.3, p[1] + 1.25, p[2]], sn), 40, -0.06 * (1 - sn)),
      people: [{ who: "painter", p, expr: "whistle", brush: true }],
      subjects: [["paint line", wallPt(y, -1.2), 0.5]],
    };
  },
  // January 1919: the brown tank splits, rivets shooting out, molasses bursting from the crack
  burst: (s, f) => {
    const u = (f - s.a) / Math.max(1, s.b - s.a), ck = smooth(u / 0.4), k = smooth((u - 0.1) / 0.5), sh = Math.max(0, 1 - u * 1.5);
    return {
      light: "winter", el: false, paint: 1, crack: ck, gush: smooth((u - 0.2) / 0.6), rivets: (f - s.a - 3) / FPS, dof: 4,
      cam: cam(add(L3(M(5.5, 1.8, -55.0), M(10.0, 2.5, -57.0), k), shake(f, 0.14 * sh)), M(-4, 3.4, -52.2), 50 + 6 * k),
      subjects: [["crack", wallPt(3, 0), 0.5]],
    };
  },
  // LUNGE: low in the street, the wave rushes the camera and swallows the frame
  "wave-lunge": (s, f) => {
    const u = (f - s.a) / Math.max(1, s.b - s.a), wz = -110 - 19 * smooth(u * 1.1), near = clamp01((u - 0.55) / 0.45);
    return {
      light: "winter", flood: true, wave: wz, surge: 1.05, mph: true, lunge: true, dof: 3,
      cam: cam(add(M(3.2, 1.0, -129.5), shake(f, 0.03 + 0.18 * near)), M(5.4, 3.6 + 2.5 * near, -112), 50 + 8 * near, 0.04 * near),
      wipe: { color: "#3a1a08", a: clamp01((u - 0.82) / 0.18) },
      subjects: u < 0.6 ? [["wave crest", [WAVE.x, D0 + WAVE.H * 0.85, wz + 0.5], 0.5]] : [],
    };
  },
  // a worker at the tank's foot, looking up at the streaked wall
  "worker-warn": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, dof: 8,
      cam: cam(L3(M(4.0, 1.3, -63.0), M(2.6, 1.7, -60.6), u), L3(M(-2, 2.6, -56.5), M(-3, 5.5, -55), u), 46),
      people: [{ who: "folk2", p: M(-1.4, 0, -57.6), expr: "nervous", look: -1, headTilt: -0.15 }],
      subjects: [["leak streaks", wallPt(5, -2), 0.5]],
    };
  },
  // LUNGE: the camera snaps into the worker's face as he warns them
  "worker-close": (s, f) => {
    const sn = glide((f - s.a) / 7), dr = smooth((f - s.a - 7) / Math.max(1, s.b - s.a - 7));
    return {
      light: "golden", el: false, dof: 14, closeup: true, lunge: true,
      cam: cam(add(L3(M(2.6, 1.7, -60.6), M(-0.55, 1.55, -58.7), sn), [0.05 * dr, 0, 0]), M(-1.4, 1.5, -57.6), 40, 0.04 * (1 - sn)),
      people: [{ who: "folk2", p: M(-1.4, 0, -57.6), expr: "shock", look: 0 }],
    };
  },

  // ===== cold open (first version; kept for reuse later) =====
  // frame 1: the wave fills the street, people running at the lens; the camera backs away low
  "wave-street": (s, f) => {
    const u = U(s, f, lin), wz = -101 - 9 * u, t = (f - s.a) / FPS;
    return {
      light: "winter", flood: true, wave: wz, surge: 0.95, debris: false, dof: 3,
      cam: cam(M(3.2, 1.3, -122 - 2.5 * u), M(5.8, 4.2, -104), 46, 0.03 - 0.02 * u),
      people: [0, 1, 2, 3].map((k) => ({ who: FOLK[k], p: [MX + [3.6, 6.8, 4.8, 8.2][k], D0 + 0.05 * Math.abs(Math.sin(t * 9 + k)), -112.5 - (k % 2) * 1.8 - t * (1.0 + 0.1 * k)] as V3, expr: "shock" as Expr, blink: 0, running: true })),
      subjects: [["wave crest", [WAVE.x, D0 + WAVE.H * 0.9, wz + 0.5], 0.5]],
    };
  },
  // low beside the 25 FT pole as the crest arrives, tilting up to the mark
  "wave-pole": (s, f) => {
    const u = U(s, f, smooth), wz = -92 - 10 * u;
    return {
      light: "winter", flood: true, wave: wz, pole: true, dof: 3,
      cam: cam(L3(M(9.3, 1.2, -117), M(9.3, 1.6, -121), u), L3(M(9.8, 5.0, -104), M(9.6, 7.2, -104), u), 44),
      subjects: [["25 FT mark", add(POLE, [0, 8.25, 0]), 0.2], ["wave crest", [WAVE.x, D0 + WAVE.H * 0.9, wz + 0.5], 0.5]],
    };
  },
  // under the curling crest, the camera backing away just ahead of it
  "wave-run": (s, f) => {
    const u = U(s, f, lin), wz = -103 - 14 * u, z = wz - 12.5;
    return {
      light: "winter", flood: true, wave: wz, mph: true, dof: 4,
      cam: cam(add(M(5.0, 0.8, z), shake(f, 0.04)), M(5.0, 6.6, z + 12.5), 52, 0.03 * Math.sin(f * 0.15)),
      subjects: [["wave crest", [WAVE.x, D0 + WAVE.H * 0.85, wz + 0.5], 0.5]],
    };
  },
  // arc across the firehouse front as the wave shoves it off its base
  "firehouse-shove": (s, f) => {
    const u = U(s, f, smooth);
    return {
      light: "winter", flood: true, sheet: true, debris: true, fire: smooth(((f - s.a) / Math.max(1, s.b - s.a) - 0.25) * 2.5), dof: 3,
      cam: cam(L3(M(8.0, 1.8, -114.5), M(7.6, 2.8, -110.0), u), M(-2.5, 4.0, -104.2), 44),
      subjects: [["firehouse", add(FIRE, [-1.0, 5.0, 0]), 0.5]],
    };
  },
  // up to the El span as it twists
  "el-twist": (s, f) => {
    const u = U(s, f, smooth);
    return {
      light: "winter", flood: true, sheet: true, debris: true, fire: 1, twist: smooth(((f - s.a) / Math.max(1, s.b - s.a)) * 2.2), dof: 3,
      cam: cam(L3(M(1.5, 2.6, -111), M(0.8, 7.2, -113), u), L3(M(8, 5.6, -120), M(8.5, 6.8, -120), u), 46),
      subjects: [["twisted span", [EL.x, D0 + EL.h, EL.bentZ], 0.5]],
    };
  },
  // the whole tank before the flood, its long brown streaks
  "tank-streaks": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, dof: 0,
      cam: cam(L3(M(7, 1.4, -68), M(5, 4.5, -61), u), L3(M(-14, 8, -50), M(-15, 7, -50), u), 50),
      subjects: [["tank streaks", wallPt(6, -3), 0.5]],
    };
  },
  // close: molasses oozing out of a seam
  "tank-leak-close": (s, f) => {
    const u = U(s, f, smooth);
    return {
      light: "golden", el: false, drips: "seam", dof: 10,
      cam: cam(L3(M(1.6, 3.9, -50.6), M(1.2, 2.2, -50.4), u), L3(M(-4, 4.0, -52.3), M(-4, 2.3, -52.3), u), 36),
      subjects: [["leaking seam", wallPt(2.9, -0.4), 0.2]],
    };
  },
  // the painter on his plank, brown climbing the wall
  "paint-brush": (s, f) => {
    const u = U(s, f), pk = 0.25 + 0.35 * smooth((f - s.a) / Math.max(1, s.b - s.a)), y = TANK_H * pk;
    const p: V3 = [TANK[0] + TANK_R + 0.7, D0 + Math.max(0, y - 1.3), TANK[2] - 1.2];
    return {
      light: "golden", el: false, paint: pk, dof: 6,
      cam: cam(L3(M(8, 1.8 + y * 0.3, -63), M(6.5, 2.4 + y * 0.45, -60), u), [TANK[0] + 2, D0 + y + 0.6, TANK[2] - 1.0], 42),
      people: [{ who: "painter", p, expr: "whistle", brush: true }],
      subjects: [["paint line", wallPt(y, -1.2), 0.5]],
    };
  },
  // high above the painter, looking down the wall as the brown climbs past the streaks
  "paint-high": (s, f) => {
    const u = U(s, f), pk = 0.45 + 0.2 * smooth((f - s.a) / Math.max(1, s.b - s.a)), y = TANK_H * pk;
    const p: V3 = [TANK[0] + TANK_R + 0.7, D0 + Math.max(0, y - 1.3), TANK[2] - 1.2];
    return {
      light: "golden", el: false, paint: pk, dof: 4,
      cam: cam(L3(M(2.5, 16.5, -48.5), M(1.6, 15.0, -51.0), u), [p[0] - 0.2, p[1] + 0.8, p[2] + 0.2], 44, 0.08),
      people: [{ who: "painter", p, expr: "whistle", brush: true }],
      subjects: [["paint line", wallPt(y, -1.2), 0.5]],
    };
  },
  // pull back from the painted wall: the whole tank brown, the streaks gone
  "streaks-vanish": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, paint: 1, dof: 0,
      cam: cam(L3(M(3.0, 3.2, -57), M(6.0, 5.0, -68), u), L3(M(-4, 5.5, -52.5), M(-15, 8, -50), u), 46),
      subjects: [["brown tank", wallPt(7, -2), 0.5]],
    };
  },
  // high over the waterfront, gliding toward the tank
  "waterfront-aerial": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", paint: 1, dof: 0,
      cam: cam(L3(M(16, 16, -100), M(10, 13, -88), u), L3(M(-14, 7, -48), M(-15, 8, -50), u), 44),
      people: walkersZ(FOLK, [MX + 3, MX + 6], [-110, -60], (f - s.a) / FPS),
      subjects: [["tank", TANK_TOP, 0.5]],
    };
  },

  // ===== 1. why Boston had a molasses tank =====
  // the tank on the quay, golden light, people tiny along its foot
  "tank-golden": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, dof: 0,
      cam: cam(L3(M(9, 1.4, -74), M(7, 3.0, -70), u), L3(M(-14, 9, -50), M(-15, 10, -50), u), 48),
      subjects: [["tank", TANK_TOP, 0.5]],
    };
  },
  // the empty quay before the tank: just the yard and the harbor
  "quay-empty": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", tank: false, dof: 0,
      cam: cam(L3(M(3, 11, -64), M(2, 10, -60), u), L3(M(-17, 0.5, -50), M(-18, 1, -48), u), 46),
      people: walkersZ(FOLK.slice(0, 3), [MX + 3, MX + 6], [-90, -60], (f - s.a) / FPS),
      subjects: [["empty yard", M(-16, 0, -50), 1]],
    };
  },
  // a ship at the quay, the pipe running from it up into the tank
  "ship-pump": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", pipe: true, shipAt: [MX - 18, 0.6, -21], dof: 0,
      cam: cam(L3(M(14, 7, -8), M(9, 6, -14), u), L3(M(-20, 4, -34), M(-19, 5, -38), u), 46),
      subjects: [["pipe", M(-18, 0.3, -35), 0.3]],
    };
  },
  // crane up the tank's full height
  "tank-crane": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", dof: 0,
      cam: cam(L3(M(2.5, 0.8, -66), M(3, 13, -74), u), L3(M(-6, 3, -54), M(-12, 13, -52), u), 50),
      subjects: [["tank", wallPt(TANK_H * 0.5, -2), 0.5]],
    };
  },

  // ===== 2. built by a treasurer =====
  // Arthur Jell at his desk beside the tank, ledger out, pleased with himself
  "jell-desk": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, desk: true, dof: 10,
      cam: cam(L3(M(6.0, 3.2, -62.0), M(3.0, 1.75, -59.6), u), L3(M(-1.6, 1.4, -58.9), M(-1.6, 1.85, -58.9), u), 40, 0.05 * (1 - u)),
      people: [{ who: "jell", p: JELL5, expr: "grin" }],
      subjects: [["TREASURER sign", PLAQUE, 0.1]],
    };
  },
  // snap-zoom onto the TREASURER plaque
  "plaque-snap": (s, f) => {
    const sn = glide((f - s.a) / 8), dr = smooth((f - s.a - 8) / Math.max(1, s.b - s.a - 8));
    return {
      light: "golden", el: false, desk: true, dof: 16, closeup: true,
      cam: cam(add(L3(M(4.0, 3.0, -61.5), add(PLAQUE, [2.1 - 0.25 * dr, 0.15, -0.6]), sn), [0, 0, 0]), PLAQUE, 34, 0.08 * (1 - sn) - 0.03 * dr),
      people: [{ who: "jell", p: JELL5, expr: "grin" }],
      subjects: [["TREASURER sign", PLAQUE, 0.1]],
    };
  },
  // "Jell skipped it": crane down onto the unused hose; a big red X slams on it
  "hose-x": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, hose: true, xMark: smooth((f - s.a - 6) / 7), dof: 8,
      cam: cam(L3(M(1.0, 4.2, -63.2), M(2.4, 1.1, -64.2), u), L3(M(-2.5, 0.2, -62.5), M(-2.4, 0.6, -62.5), u), 44),
      subjects: [["hose", add(HOSE, [0, 0.3, 0]), 0.1], ["red X", [HOSE[0] + 0.7, HOSE[1] + 0.55, HOSE[2] - 0.2], 0.1]],
    };
  },
  // molasses going straight in: crane up the pipe from the quay to the top of the tank
  "pour-in": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", pipe: true, shipAt: [MX - 18, 0.6, -21], el: false, dof: 0,
      cam: cam(L3(M(-10, 1.6, -33), M(-8, 15, -36), u), L3(M(-18, 2, -38), M(-18, 15, -42), u), 48, 0.04 * u),
      subjects: [["pipe", M(-18, 1 + u * 12, -39.5), 0.3]],
    };
  },
  // macro along a seam of rivets, sliding past them
  "rivets-macro": (s, f) => {
    const u = U(s, f, lin);
    return {
      light: "golden", el: false, dof: 10, closeup: true, sunAz: 160,
      cam: cam(wallPt(2.9 + 0.2 * u, -4.5 + 6 * u).map((v, i) => v + (i === 0 ? 1.4 : 0)) as V3, wallPt(2.9, -3.0 + 6 * u), 32, 0.12),
      subjects: [["rivet seam", wallPt(2.9, -3.0 + 6 * u), 0.05]],
    };
  },
  // "built to fail": the tank looming at dusk, a hard push in toward the base
  "tank-dusk": (s, f) => {
    const u = U(s, f, smooth), sn = glide((f - s.a) / 18);
    return {
      light: "golden", el: false, dof: 4, sunAz: 200,
      cam: cam(L3(M(9, 0.9, -78), M(3.5, 1.1, -63), sn * 0.6 + u * 0.4), L3(M(-12, 9, -52), M(-5, 6, -52), u), 50 - 6 * u, 0.06 * u),
      subjects: [["tank", wallPt(6, -2), 0.5]],
    };
  },

  // ===== 3. the warning signs =====
  // crane down from above the street onto the leaking tank
  "tank-wide": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, dof: 0,
      cam: cam(L3(M(4, 13, -68), M(5, 5.5, -63), u), L3(M(-14, 5, -50), M(-14, 7.5, -51), u), 50),
      people: walkersZ(FOLK.slice(0, 3), [MX + 2.5, MX + 6], [-80, -55], (f - s.a) / FPS),
      subjects: [["tank streaks", wallPt(6, -3), 0.5]],
    };
  },
  // low against the wall, looking up a seam as molasses beads out of it
  "seam-leak": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, drips: "seam", dof: 6, sunAz: 160,
      cam: cam(L3(M(0.4, 0.5, -48.4), M(0.1, 0.8, -49.4), u), L3(wallPt(4.0, -2.0), wallPt(4.6, -1.4), u), 46, -0.1),
      subjects: [["leaking seam", wallPt(3.4, -0.4), 0.2]],
    };
  },
  // tilt down a long brown streak, following it to the ground
  "streaks-run": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, drips: "seam", dof: 4, sunAz: 70,
      cam: cam(L3(M(2.4, 6.0, -55.5), M(2.0, 3.0, -55.0), u), L3(wallPt(8, -3.5), wallPt(2.6, -3.3), u), 44),
      subjects: [["streak", wallPt(4, -3.5), 0.3]],
    };
  },
  // neighbors stop in the street and stare up at the streaks
  neighbors: (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, dof: 4,
      cam: cam(L3(M(7.5, 1.3, -64), M(6.8, 1.5, -62), u), L3(M(-4, 2.6, -53), M(-6, 3.8, -52.5), u), 46),
      people: [
        { who: "folk0", p: M(1.6, 0, -57.2), expr: "shock", headTilt: -0.25 },
        { who: "folk3", p: M(2.8, 0, -58.8), expr: "nervous", headTilt: -0.2, look: -1 },
        { who: "folk4", p: M(0.6, 0, -59.8), expr: "dazed", headTilt: -0.3 },
      ],
      subjects: [["tank streaks", wallPt(6, -3), 0.5]],
    };
  },
  // families holding cans under the drips; slow orbit along the line
  cans: (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, drips: "cups", dof: 8, sunAz: 160,
      cam: cam(orb(M(-3.3, 0, -52.2), 4.4, 1.4, 1.15 + 0.5 * u), M(-3.6, 1.1, -52.2), 46),
      people: [
        { who: "folk1", p: KIDS_AT[0], expr: "smile", cup: true },
        { who: "kid1", p: KIDS_AT[1], expr: "grin", cup: true },
        { who: "folk3", p: KIDS_AT[2], expr: "smile_closed", cup: true },
      ],
      subjects: [["cups", [KIDS_AT[1][0] + 0.3, KIDS_AT[1][1] + 0.7, KIDS_AT[1][2]], 0.05]],
    };
  },
  // kids along the wall licking it like candy: low truck past them at kid height
  "kids-sticks": (s, f) => {
    const u = U(s, f, lin);
    return {
      light: "golden", el: false, drips: "seam", dof: 10, sunAz: 160,
      cam: cam(M(0.3, 0.85, -55.8 + 6.5 * u), M(-3.8, 0.95, -53.2 + 3.0 * u), 42),
      people: KIDS_AT.map((p, k) => ({ who: `kid${k}`, p, expr: (k === 1 ? "lick" : k === 0 ? "grin" : "laugh") as Expr })),
      subjects: [["kids", [KIDS_AT[1][0], KIDS_AT[1][1] + 0.8, KIDS_AT[1][2]], 0.1]],
    };
  },
  // the tank groans: low angle, the camera shuddering with it
  "tank-groan": (s, f) => {
    const u = U(s, f), q = 0.5 + 0.5 * Math.sin((f - s.a) * 0.45);
    return {
      light: "golden", el: false, dof: 0,
      cam: cam(add(L3(M(3.5, 0.6, -61), M(2.5, 0.7, -58.5), u), shake(f, 0.04 + 0.05 * q)), wallPt(11, -4), 50, 0.03 * Math.sin(f * 0.7)),
      subjects: [["tank", wallPt(8, -3), 0.5]],
    };
  },
  // Isaac Gonzales (the cold open's worker) walking up to the company desk with his report
  "gonzales-walk": (s, f) => {
    const u = U(s, f, lin), t = (f - s.a) / FPS, z = -66 + 6.2 * u, ph = ((t * 1.25 / 1.6) % 1 + 1) % 1;
    return {
      light: "golden", el: false, desk: true, dof: 6,
      cam: cam(M(4.6, 1.5, z + 3.2), M(0.4, 1.3, z - 1.0), 44),
      people: [{ who: "folk2", p: M(0.9, 0, z), expr: "nervous", side: { phase: ph, mirror: true, stride: 0.8 } }, { who: "jell", p: JELL5, expr: "grin" }],
    };
  },
  // flakes of rusting steel dropped on Jell's desk, Jell still grinning
  "steel-flakes": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, desk: true, flakes: smooth((f - s.a - 4) / 22), dof: 12,
      cam: cam(L3(M(1.6, 2.6, -57.2), M(0.9, 2.0, -57.8), u), L3(add(DESK, [-0.1, 0.8, 0]), add(DESK, [-0.4, 1.1, -0.3]), u), 42),
      people: [{ who: "jell", p: JELL5, expr: "grin" }, { who: "folk2", p: M(-0.6, 0, -60.7), expr: "nervous", look: -1 }],
      subjects: [["desk", add(DESK, [0, 0.86, 0]), 0.1]],
    };
  },
  // "In 1918, they painted it brown": crane out from the painter to the whole tank going brown
  painter: (s, f) => {
    const u = U(s, f), pk = 0.3 + 0.6 * smooth((f - s.a) / Math.max(1, s.b - s.a)), y = TANK_H * pk;
    const p: V3 = [TANK[0] + TANK_R + 0.7, D0 + Math.max(0, y - 1.3), TANK[2] - 1.2];
    return {
      light: "golden", el: false, paint: pk, dof: 0,
      cam: cam(L3([p[0] + 3.0, p[1] + 2.2, p[2] - 2.5], M(10, 10, -76), u), L3([p[0], p[1] + 1.0, p[2]], M(-14, 7, -50), u), 46),
      people: [{ who: "painter", p, expr: "whistle", brush: true }],
      subjects: [["paint line", wallPt(y, -1.2), 0.5]],
    };
  },

  // ===== 4. January 15, 1919 =====
  // the brown tank on a bitter January morning
  "tank-winter": (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, dof: 0,
      cam: cam(L3(M(3, 2.0, -70), M(3.4, 6.5, -66), u), L3(M(-14, 6, -50), M(-15, 9, -51), u), 48),
      subjects: [["tank", wallPt(7, -2), 0.5]],
    };
  },
  // the cold street: people hurrying, collars up
  "cold-street": (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, dof: 3,
      cam: cam(L3(M(2.0, 1.6, -96), M(2.4, 2.2, -90), u), L3(M(6, 2.5, -70), M(5, 3.5, -62), u), 46),
      people: walkersZ(FOLK.slice(0, 4), [MX + 3.2, MX + 1.6], [-82, -64], (f - s.a) / FPS).map((q) => ({ ...q, expr: "pained" as Expr })),
    };
  },
  // a ship at the quay pumping warm molasses up into the tank
  "ship-warm": (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, pipe: true, shipAt: [MX - 18, 0.6, -21], dof: 0,
      cam: cam(L3(M(6, 3, -14), M(2, 5, -20), u), L3(M(-18, 3, -30), M(-18, 9, -40), u), 46),
      subjects: [["pipe", M(-18, 4, -39.5), 0.3]],
    };
  },
  // "already too weak": low on the base, a slow push toward the bottom seam
  "tank-weak": (s, f) => {
    const u = U(s, f, smooth);
    return {
      light: "winter", paint: 1, dof: 5, sunAz: 160,
      cam: cam(L3(M(3.5, 0.5, -60), M(0.6, 0.6, -55.5), u), L3(wallPt(3, -3), wallPt(1.2, -1), u), 50, 0.05),
      subjects: [["base seam", wallPt(1.0, -1), 0.3]],
    };
  },
  // lunchtime in the unusual warmth: workers out on the street
  lunch: (s, f) => {
    const u = U(s, f);
    return {
      light: "day", paint: 1, dof: 4,
      cam: cam(L3(M(-1.0, 1.4, -78), M(0.0, 1.6, -74), u), L3(M(5, 1.6, -64), M(4, 2.8, -60), u), 46),
      people: [
        { who: "folk0", p: M(2.0, 0, -66.5), expr: "laugh" }, { who: "folk1", p: M(3.0, 0, -67.2), expr: "smile" },
        { who: "folk4", p: M(1.2, 0, -68.4), expr: "grin", look: 1 },
        ...walkersZ(["folk3"], [MX + 6.5, MX + 6.5], [-80, -64], (f - s.a) / FPS),
      ],
      subjects: [["tank", wallPt(7, -4), 0.5]],
    };
  },
  // kids playing near the tank
  "kids-play": (s, f) => {
    const u = U(s, f), t = (f - s.a) / FPS;
    return {
      light: "day", paint: 1, dof: 4,
      cam: cam(L3(M(5.5, 1.0, -70), M(5.0, 1.2, -67), u), M(-1, 1.6, -62), 46),
      people: walkersX(["kid0", "kid1", "kid2"], [-63.2, -64.6], [MX - 3, MX + 4], t * 1.8).map((q) => ({ ...q, expr: "laugh" as Expr })),
    };
  },
  // a deep rumble "like an elevated train": under the El, the camera trembling
  "el-rumble": (s, f) => {
    const u = U(s, f), q = smooth((f - s.a) / Math.max(1, s.b - s.a));
    return {
      light: "day", paint: 1, dof: 0,
      cam: cam(add(L3(M(7.0, 1.0, -86), M(7.0, 1.3, -82), u), shake(f, 0.02 + 0.06 * q)), L3(M(7, 6.5, -74), M(6, 6, -60), u), 56, 0.06 * q * Math.sin(f * 0.8)),
      subjects: [["El", [EL.x, D0 + EL.h, -76], 0.5]],
    };
  },
  // LUNGE: right at the seam as the rivets shoot out, straight at the lens
  "rivets-pop": (s, f) => {
    const u = (f - s.a) / Math.max(1, s.b - s.a), k = smooth(u / 0.3);
    return {
      light: "winter", paint: 1, crack: 0.2 + 0.25 * k, rivets: (f - s.a - 4) / FPS * 0.11, lunge: true, dof: 4, sunAz: 160,
      cam: cam(add(L3(M(3.4, 3.8, -51.2), M(1.9, 3.5, -51.8), k), shake(f, 0.03 + 0.08 * k)), wallPt(3.6, 0), 48, 0.06 * k),
      lungeRivet: clamp01((u - 0.62) / 0.3),
      wipe: { color: "#fff6dc", a: 0.85 * clamp01(1 - Math.abs(u - 0.93) / 0.05) },
      subjects: [["rivet seam", wallPt(3.4, 0), 0.1]],
    };
  },
  split: (s, f) => SPECS.burst(s, f),
  // two million gallons at once: high and wide as the burst tank empties into the street
  outpour: (s, f) => {
    const u = U(s, f), wz = -66 - 14 * smooth((f - s.a) / Math.max(1, s.b - s.a));
    return {
      light: "winter", paint: 1, flood: true, wave: wz, surge: 0.85, sheet: true, dof: 0,
      cam: cam(add(L3(M(8.5, 12, -94), M(8.0, 10, -87), u), shake(f, 0.03)), L3(M(-4, 3, -64), M(-2, 2, -72), u), 50),
      subjects: [["wave crest", [WAVE.x, D0 + WAVE.H * 0.8, wz + 0.5], 0.5]],
    };
  },
  "wave-25ft": (s, f) => SPECS["wave-pole"](s, f),
  "wave-35mph": (s, f) => SPECS["wave-run"](s, f),
  // steel panels flung out of the bursting tank: whip from the tank toward the El
  "steel-fling": (s, f) => {
    const u = (f - s.a) / Math.max(1, s.b - s.a), w = glide(u * 1.3);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, rivets: (f - s.a) / FPS * 0.8, debris: true, dof: 2,
      cam: cam(add(M(9.6, 2.0, -70), shake(f, 0.06)), L3(M(-6, 6, -56), M(7, 5.5, -96), w), 52, -0.08 + 0.16 * w),
    };
  },
  "el-car": (s, f) => SPECS["el-twist"](s, f),
  // the wave smashing into the houses along the street
  homes: (s, f) => {
    const u = (f - s.a) / Math.max(1, s.b - s.a), wz = -98 - 12 * smooth(u);
    return {
      light: "winter", paint: 1, flood: true, wave: wz, surge: 1, sheet: true, debris: true, dof: 2,
      cam: cam(add(M(-0.2, 1.4, -114), shake(f, 0.03 + 0.06 * u)), L3(M(-3, 4, -100), M(-2, 5, -104), u), 50, 0.04),
      subjects: [["wave crest", [WAVE.x, D0 + WAVE.H * 0.8, wz + 0.5], 0.5]],
    };
  },
  // the company's own desk swallowed: molasses over the street, the TREASURER sign sticking out
  offices: (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, desk: true, debris: true, dof: 6,
      cam: cam(L3(M(3.2, 0.9, -61.5), M(2.2, 1.2, -60.2), u), L3(add(PLAQUE, [0, -0.6, 0]), add(PLAQUE, [0, -0.2, 0]), u), 44, -0.06),
      subjects: [["TREASURER sign", PLAQUE, 0.1]],
    };
  },
  "firehouse-trap": (s, f) => SPECS["firehouse-shove"](s, f),
  // over the harbor looking back at the drowned waterfront
  "truck-harbor": (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, dof: 0,
      cam: cam(L3(M(14, 9, -12), M(10, 7.5, -18), u), L3(M(0, 1, -50), M(-2, 0.5, -60), u), 50),
      subjects: [["flooded street", M(4, 0.3, -70), 1]],
    };
  },
  // ===== 5. the real killer =====
  // high over the street: one glossy brown sheet where the wave passed
  "glossy-aerial": (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, fire: 1, twist: 1, dof: 0,
      cam: cam(L3(M(16, 24, -138), M(14, 19, -128), u), L3(M(4, 0, -98), M(4, 0, -96), u), 46, -0.05 + 0.05 * u),
      subjects: [["brown sheet", M(5, 0.35, -100), 1]],
    };
  },
  // low on the street: the wave has gone, everything still under the brown
  "wave-gone": (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, fire: 1, twist: 1, dof: 4,
      cam: cam(L3(M(3.2, 1.3, -132), M(3.0, 1.1, -126), u), L3(M(4, 1.0, -96), M(4, 0.9, -96), u), 44),
      subjects: [["brown sheet", M(4, 0.35, -105), 1]],
    };
  },
  // close and low over the surface, sliding toward the half-sunk cart as it sets
  thicken: (s, f) => {
    const u = U(s, f, smooth);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, dof: 8,
      cam: cam(L3(M(0.6, 1.1, -98.5), M(1.4, 0.8, -96.4), u), L3(add(CART, [0, 0.55, 0]), add(CART, [0, 0.45, 0]), u), 40, 0.04),
      subjects: [["cart", add(CART, [0, 0.6, 0]), 0.3]],
    };
  },
  // wide and far: figures sunk in the brown, unable to get up
  "stuck-wide": (s, f) => {
    const u = U(s, f);
    const P: [number, number][] = [[1.4, -101], [3.6, -103.5], [4.6, -100.2], [2.4, -106.0]];
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, fire: 1, twist: 1, dof: 0,
      cam: cam(L3(M(3.2, 4.2, -120), M(3.0, 3.6, -116), u), L3(M(3, 0.4, -102), M(3, 0.5, -102), u), 40),
      people: P.map(([x, z], i) => ({ who: FOLK[i], p: M(x, -0.45 - 0.1 * (i % 2), z), expr: (i % 2 ? "pained" : "nervous") as Expr, look: i % 2 ? 1 : -1, headTilt: 0.1 })),
      subjects: [["stuck people", M(5.5, 0.8, -102.5), 1]],
    };
  },
  // rescuers wading in from the west side, stuck to the knees
  "rescuers-stuck": (s, f) => {
    const u = U(s, f);
    const P: [number, number, number][] = [[1.0, -96, -0.3], [2.6, -98, -0.38], [4.4, -95.2, -0.42], [0.2, -99.5, -0.25]];
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, dof: 2,
      cam: cam(L3(M(0.2, 2.2, -88), M(0.6, 1.9, -90.5), u), L3(M(3, 0.9, -97), M(3.5, 0.9, -97.5), u), 42),
      people: P.map(([x, z, y], i) => ({ who: FOLK[(i + 2) % 5], p: M(x, y, z), expr: (i % 2 ? "stern" : "nervous") as Expr, look: i % 2 ? -1 : 1 })),
      subjects: [["rescuers", M(2.4, 0.9, -97), 1]],
    };
  },
  // the molasses closing around the cart's wheels: a slow, tightening push
  grip: (s, f) => {
    const u = U(s, f, lin);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, dof: 10, closeup: true,
      cam: cam(L3(M(0.8, 1.0, -96.6), M(1.4, 0.8, -95.4), u), add(CART, [0, 0.4, 0]), 38 - 4 * u, -0.05),
      subjects: [["cart", add(CART, [0, 0.5, 0]), 0.2]],
    };
  },
  // a line of cadets wading in, waist-deep
  "cadets-wade": (s, f) => {
    const u = U(s, f), t = (f - s.a) / FPS;
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, dof: 2,
      cam: cam(L3(M(3.4, 2.0, -84), M(3.2, 1.8, -86.5), u), L3(M(2.5, 0.9, -95), M(2.6, 0.9, -96), u), 44),
      people: [0, 1, 2, 3, 4].map((i) => ({ who: FOLK[i], p: M(0.6 + i * 0.95, -0.62 + 0.03 * Math.sin(t * 3 + i), -92 - i * 1.3 - 0.25 * t), expr: (i % 2 ? "stern" : "neutral") as Expr, look: -1 })),
      subjects: [["cadets", M(4.5, 0.9, -95), 1]],
    };
  },
  // grey harbor: a boat creeping across the water off the drowned waterfront
  "harbor-search": (s, f) => {
    const u = U(s, f, lin);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, shipAt: [MX - 26 + 6 * u, 0.6, -10], dof: 0,
      cam: cam(L3(M(12, 3.2, 2), M(9, 3.0, 0), u), L3(M(-22, 1.5, -12), M(-18, 1.5, -12), u), 42),
      subjects: [["boat", [MX - 26 + 6 * u, 3, -10], 1]],
    };
  },

  // ===== 6. the cleanup =====
  // fresh water does nothing: low over the shining surface, sliding sideways
  freshwater: (s, f) => {
    const u = U(s, f, lin);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, dof: 6,
      cam: cam(M(3.8 - 2.2 * u, 0.85, -90.5), M(2.5 - 2.2 * u, 0.4, -86), 40, 0.05),
      subjects: [["brown sheet", M(2.5 - 2.2 * u, 0.35, -86), 0.5]],
    };
  },
  // the fireboat at the quay, pumping harbor water up into the street
  fireboat: (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, pipe: true, shipAt: [MX - 18, 0.6, -21], dof: 0,
      cam: cam(L3(M(10, 6, -6), M(6, 5, -12), u), L3(M(-16, 3, -30), M(-6, 2, -48), u), 46),
      subjects: [["fireboat", M(-18, 3, -21), 1]],
    };
  },
  // crews walking the brown, scattering sand
  sand: (s, f) => {
    const u = U(s, f), t = (f - s.a) / FPS;
    return {
      light: "winter", paint: 1, flood: true, sheet: true, dof: 2,
      cam: cam(L3(M(2.0, 1.8, -80), M(2.4, 1.7, -83), u), L3(M(6, 1, -92), M(6, 1, -95), u), 44),
      people: walkersZ(FOLK.slice(1, 4), [MX + 4, MX + 7.5], [-100, -86], t).map((q) => ({ ...q, p: [q.p[0], D0 + 0.3, q.p[2]] as V3, expr: "stern" as Expr })),
      subjects: [["crews", M(5.5, 1, -93), 1]],
    };
  },

  // ===== 7. who's to blame =====
  // the company men outside the ruined office, shrugging it off
  boardroom: (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, desk: true, dof: 8,
      cam: cam(L3(M(4.5, 1.6, -63.5), M(3.2, 1.6, -62.2), u), L3(M(-1.2, 1.5, -60), M(-1.4, 1.6, -59.8), u), 42),
      people: [{ who: "jell", p: M(-1.5, 0.3, -60.2), expr: "smile_closed", look: 1 }, { who: "folk4", p: M(-0.2, 0.3, -61.2), expr: "neutral", look: -1 }],
      subjects: [["company men", M(-0.9, 1.5, -60.6), 0.5]],
    };
  },
  // the courtroom, wide: crane down the hall to the bench
  courtroom: (s, f) => {
    const u = U(s, f);
    return {
      light: "day", tank: false, court: true, dof: 0,
      cam: cam(L3(add(COURT, [3.5, 5.5, -12]), add(COURT, [2.2, 2.4, -8.5]), u), add(COURT, [0, 2.0, 4]), 48),
      people: COURT_CAST(false),
      subjects: [["bench", add(COURT, [0, 1.8, 4.4]), 1]],
    };
  },
  // the company's lawyer, pointing at the bomb theory
  lawyer: (s, f) => {
    const u = U(s, f, smooth);
    return {
      light: "day", tank: false, court: true, dof: 10,
      cam: cam(L3(add(COURT, [-2.4, 1.6, -5.2]), add(COURT, [-1.4, 1.6, -3.6]), u), add(COURT, [0.9, 1.5, -2.0]), 40, 0.04),
      people: COURT_CAST(true),
      subjects: [["lawyer", add(COURT, [0.9, 1.3, -2.0]), 0.5]],
    };
  },
  // the bench: the court appoints an auditor
  "court-appoint": (s, f) => {
    const u = U(s, f);
    return {
      light: "day", tank: false, court: true, dof: 8,
      cam: cam(L3(add(COURT, [2.0, 1.4, -3.5]), add(COURT, [1.0, 1.7, -1.2]), u), add(COURT, [0.6, 2.2, 4.4]), 44),
      people: COURT_CAST(false),
      subjects: [["bench", add(COURT, [0, 2.0, 4.4]), 0.5]],
    };
  },
  // Ogden at the bench, a slow orbit
  "ogden-bench": (s, f) => {
    const u = U(s, f);
    return {
      light: "day", tank: false, court: true, dof: 10, closeup: true,
      cam: cam(orb(add(COURT, [1.2, 0, 4.6]), 4.2, 1.9, -0.35 + 0.5 * u), add(COURT, [1.2, 1.7, 4.6]), 38),
      people: [COURT_CAST(false)[0]],
      subjects: [["Ogden", add(COURT, [1.2, 1.4, 4.6]), 0.3]],
    };
  },

  // ===== 8–9. after, and today =====
  // walking past a big building today
  building: (s, f) => {
    const u = U(s, f, lin), t = (f - s.a) / FPS;
    return {
      light: "day", tank: false, el: false, ship: false, dof: 4,
      cam: cam(M(5.0, 1.6, -70 - 4 * u), M(12, 2.6, -73 - 4 * u), 44),
      people: [{ who: "folk1", p: M(9.2, 0, -70.5 - 4.2 * u), expr: "smile_closed", side: { phase: (t * 0.8) % 1, mirror: false, stride: 0.8 } }],
      subjects: [["building", M(12, 3, -73 - 4 * u), 1]],
    };
  },
  // tilt up the face of the building
  "building-up": (s, f) => {
    const u = U(s, f, smooth);
    return {
      light: "day", tank: false, el: false, ship: false, dof: 0,
      cam: cam(M(8.0, 1.0, -76), L3(M(12, 2.5, -78), M(12, 9, -78.5), u), 52, 0.06 * u),
      subjects: [["building", M(12, 5, -78), 1]],
    };
  },
  // the North End street today: no El, no tank
  "northend-today": (s, f) => {
    const u = U(s, f);
    return {
      light: "day", tank: false, el: false, ship: false, dof: 0,
      cam: cam(L3(M(5, 8, -140), M(5, 4, -130), u), L3(M(4, 1, -80), M(4, 1.5, -80), u), 48),
      people: walkersZ(FOLK, [MX + 2.5, MX + 7.5], [-120, -85], (f - s.a) / FPS),
      subjects: [["street", M(5, 1, -100), 1]],
    };
  },
  // a hot summer day: people in the street in the glare
  "summer-street": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", tank: false, el: false, ship: false, dof: 3, noSunDisc: true,
      cam: cam(L3(M(3, 1.5, -112), M(3.5, 1.6, -108), u), M(6, 1.5, -95), 44),
      people: [{ who: "folk0", p: M(5, 0, -101), expr: "dazed", look: -1, headTilt: 0.12 }, { who: "folk3", p: M(7.2, 0, -103.5), expr: "neutral", look: 1 }, ...walkersZ(["folk2", "folk4"], [MX + 3, MX + 8], [-100, -90], (f - s.a) / FPS)],
      subjects: [["people", M(6, 1.2, -102), 1]],
    };
  },
  // a faint brown haze over the same street
  haze: (s, f) => {
    const u = U(s, f), a = 0.22 + 0.06 * Math.sin((f - s.a) / 9);
    return {
      light: "golden", tank: false, el: false, ship: false, dof: 3, noSunDisc: true,
      cam: cam(L3(M(3.5, 1.6, -108), M(4, 1.8, -104), u), M(6, 2.5, -90), 44),
      wipe: { color: "#8a5a2a", a },
      people: walkersZ(["folk2", "folk4"], [MX + 3, MX + 8], [-100, -90], (f - s.a) / FPS),
    };
  },
  // the empty quay where the tank stood
  "quay-empty-2": (s, f) => {
    const u = U(s, f);
    return {
      light: "day", tank: false, el: false, dof: 0,
      cam: cam(L3(M(3, 13, -62), M(1, 11, -58), u), L3(M(-16, 0.5, -52), M(-17, 0.5, -50), u), 46),
      subjects: [["empty quay", M(-16, 0, -52), 1]],
    };
  },
  // the site as a rail yard: the same empty ground, a long slow drift
  railyard: (s, f) => {
    const u = U(s, f, lin);
    return {
      light: "winter", tank: false, el: false, ship: false, dof: 0,
      cam: cam(M(3 - 6 * u, 15, -63), M(-16 - 4 * u, 0, -50), 48),
      subjects: [["site", M(-16, 0, -52), 1]],
    };
  },
  // today: the park on the tank's spot — ballfield, bocce, swings
  "park-today": (s, f) => {
    const u = U(s, f), t = (f - s.a) / FPS;
    return {
      light: "day", tank: false, el: false, ship: false, park: true, dof: 0,
      cam: cam(orb(add(TANK, [2, 0, 2]), 18, 10 - 3 * u, 0.7 + 0.35 * u), add(TANK, [4, 0.5, 0]), 46),
      people: [{ who: "kid0", p: add(TANK, [13, 0, 8.3]), expr: "laugh" }, { who: "kid1", p: add(TANK, [2, 0, -2.6]), expr: "grin", side: { phase: (t * 0.9) % 1, mirror: false } }, { who: "folk3", p: add(TANK, [13.2, 0, -3]), expr: "smile" }],
      subjects: [["park", add(TANK, [3, 0, 2]), 1]],
    };
  },
  // a slow drip of molasses: the cold open's leaking seam again
  drip: (s, f) => SPECS["tank-leak-close"](s, f),
  "wave-callback": (s, f) => SPECS["wave-run"](s, f),

  // ===== replacing archive slots without a license-safe photo =====
  // the busy North End street before the flood: crane down among the walkers
  "northend-1919": (s, f) => {
    const u = U(s, f);
    return {
      light: "golden", el: false, dof: 0,
      cam: cam(L3(M(5, 9, -135), M(4.5, 2.2, -124), u), L3(M(5, 1, -95), M(5, 1.6, -95), u), 48),
      people: walkersZ(FOLK, [MX + 3, MX + 7.5], [-118, -88], (f - s.a) / FPS),
      subjects: [["street", M(5, 1, -100), 1]],
    };
  },
  // the firehouse knocked off its base, sitting in the brown
  "firehouse-ruin": (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, fire: 1, twist: 1, dof: 2,
      cam: cam(L3(M(6.0, 1.6, -116), M(4.2, 2.2, -112), u), add(FIRE, [-1.6, 3.5, -0.8]), 44, 0.03),
      subjects: [["firehouse", add(FIRE, [-2.0, 4.0, -0.8]), 0.5]],
    };
  },
  // help arriving: people hurrying in along the street's edge
  rescue: (s, f) => {
    const u = U(s, f), t = (f - s.a) / FPS;
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, dof: 2,
      cam: cam(L3(M(3.0, 1.5, -76), M(3.2, 1.6, -80), u), L3(M(4, 1.2, -95), M(4, 1.2, -96), u), 46),
      people: walkersZ(FOLK.slice(0, 4), [MX + 2.4, MX + 4.2], [-96, -84], t * 1.4).map((q, i) => ({ ...q, p: [q.p[0], D0 + 0.3, q.p[2]] as V3, expr: (i % 2 ? "stern" : "nervous") as Expr })),
      subjects: [["rescuers", M(3.3, 1, -90), 1]],
    };
  },
  // the Navy training ship tied up at the quay
  nantucket: (s, f) => {
    const u = U(s, f);
    return {
      light: "winter", paint: 1, flood: true, sheet: true, shipAt: [MX - 18, 0.6, -21], dof: 0,
      cam: cam(L3(M(-2, 3, -6), M(-6, 4.5, -10), u), L3(M(-18, 4, -21), M(-19, 4.5, -22), u), 46),
      subjects: [["ship", M(-18, 4, -21), 1]],
    };
  },
  // weeks of work: crews out on the street
  workers: (s, f) => {
    const u = U(s, f, lin), t = (f - s.a) / FPS;
    return {
      light: "winter", paint: 1, flood: true, sheet: true, debris: true, fire: 1, twist: 1, dof: 0,
      cam: cam(M(2.6 + 1.5 * u, 6.5, -86 - 3 * u), M(5, 0.5, -106 - 3 * u), 46),
      people: walkersZ(FOLK, [MX + 2.6, MX + 7.0], [-110, -96], t).map((q) => ({ ...q, p: [q.p[0], D0 + 0.3, q.p[2]] as V3, expr: "stern" as Expr })),
      subjects: [["crews", M(5, 1, -103), 1]],
    };
  },
};
/** the judge on the bench, the lawyer standing in front, a couple of people at the desks */
const COURT_CAST = (lawyer: boolean): Person[] => [
  { who: "folk4", p: add(COURT, [1.2, 0.4, 4.6]), expr: "stern" },
  { who: "folk0", p: add(COURT, [0.9, 0, -2.0]), expr: lawyer ? "grin" : "neutral", look: lawyer ? 1 : 0 },
  { who: "folk1", p: add(COURT, [-4.2, 0, -1.2]), expr: "nervous", look: 1 },
  { who: "folk3", p: add(COURT, [4.3, 0, -1.6]), expr: "neutral", look: -1 },
];
void CART;
