// The long-form's 3D shots, as specs: for a shot key (timeline.ts `g`) and frame, what the world looks like: light,
// camera, tank state, the wave, damage, props, cast, and the subject the narration is about (for the framing check).
// Built chapter by chapter; a 3D shot without a spec here still draws its placeholder.
// Grammar (same as the Shorts, framed for 16:9): every shot moves; slow push-ins, cranes, orbits; glide = smootherstep.
import { LightPreset } from "../bridge/lights";
import { Expr } from "../bridge/toon";
import { D0, MX, M, V3, TANK, WAVE, POLE, MPH, FIRE, EL, CART } from "../molasses/story";
import { TANK_R, TANK_H } from "../molasses/props";
import { FPS, ShotDef, wordAt } from "./timeline";

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
  pole?: boolean; mph?: boolean; debris?: boolean; drips?: "seam"; rivets?: number;
  people?: Person[]; closeup?: boolean;
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
  // ===== cold open =====
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
      light: "winter", flood: true, sheet: true, debris: true, fire: atWord(f, 2, "knocked", 14), dof: 3,
      cam: cam(L3(M(8.0, 1.8, -114.5), M(7.6, 2.8, -110.0), u), M(-2.5, 4.0, -104.2), 44),
      subjects: [["firehouse", add(FIRE, [-1.0, 5.0, 0]), 0.5]],
    };
  },
  // up to the El span as it twists
  "el-twist": (s, f) => {
    const u = U(s, f, smooth);
    return {
      light: "winter", flood: true, sheet: true, debris: true, fire: 1, twist: atWord(f, 2, "twisted", 16, -4), dof: 3,
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
};
void CART;
