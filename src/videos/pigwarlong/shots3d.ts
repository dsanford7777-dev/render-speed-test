// The long-form's 3D shots, as specs: for a shot key (timeline.ts `g`) and frame, the light, camera, props, cast and the
// subjects the narration is about (for the framing check). Sets come from the Short (../pigwar/story origins):
// the farm (Fm), the hill (Hl), the standoff field (St), the quay (Q), the camps (Cp), the field by the grave (G), the hall (C).
// Grammar: every shot moves (slow push-ins, dollies, cranes); punch-ins + a short shake on the hook and the big beats.
import { Expr } from "../bridge/toon";
import { V3, Fm, Hl, St, Q, Cp, G, C, SHIP_Z } from "../pigwar/story";
import { FPS, ShotDef, wordAt } from "./timeline";

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = { who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; side?: { phase: number; mirror: boolean; stride?: number } };
export type St3 = {
  light: "day" | "golden"; cam: Cam; dof?: number; focus?: V3;
  pig?: { p: V3; ry?: number; jump?: number; nod?: number; turn?: number; walk?: number } | null;
  bang?: V3 | null; bangScale?: number;
  ship?: V3 | null; ship2?: V3 | null; cannons?: number;
  hillUS?: number; hillUK?: number; campUS?: number; campUK?: number; march?: V3 | null;
  arrest?: boolean; no?: number; grave?: boolean; statue?: boolean; dock?: boolean;
  people?: Person3[]; closeup?: boolean;
  wipe?: { color: string; a: number };
  subjects?: [string, V3, number][];
};

// ---------------- helpers ----------------
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const glide = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };
const L3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const cam = (pos: V3, look: V3, fov = 42, roll = 0): Cam => ({ pos, look, fov, roll });
/** progress through the shot, eased */
const U = (s: ShotDef, f: number, e = glide) => e((f - s.a) / Math.max(1, s.b - s.a));
/** exponential push toward the look point from f0 */
const push = (pos: V3, look: V3, f: number, f0: number, rate = 0.0025, fov = 42, roll = 0): Cam => {
  const k = Math.exp(-rate * Math.max(0, f - f0));
  return cam([look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, fov, roll);
};
/** eased dolly over the whole shot */
const dolly = (s: ShotDef, f: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 42): Cam => { const u = U(s, f); return cam(L3(p0, p1, u), L3(l0, l1, u), fov); };
/** 7-frame camera kick at frame f0 */
const kick = (c: Cam, f: number, f0: number, k = 1): Cam => {
  if (f < f0 || f >= f0 + 7) return c;
  const d = f - f0, s = (d % 2 ? -1 : 1) * k * (1 - d / 7);
  return { ...c, pos: [c.pos[0] + 0.035 * s, c.pos[1] + 0.03 * s, c.pos[2]], roll: c.roll + 0.014 * s };
};
const t = (f: number) => f / FPS;
const blinkless = (e: Expr) => e;
/** hill surface height (the mound under the flags) at local (x, z) */
const hillY = (x: number, z: number) => -0.05 + 0.72 * Math.sqrt(Math.max(0, 1 - (x / 4.8) ** 2 - ((z - 0.5) / 4) ** 2));
const onHill = (x: number, z: number): V3 => Hl(x, hillY(x, z), z);
/** marchers along x: n people from x0 moving at sp m/s (dir +1/-1), spaced gap apart */
const marchers = (names: string[], at: (x: number, y: number, z: number) => V3, x0: number, z: number, f: number, f0: number, dir = 1, sp = 1.35, gap = 1.25, flagFirst = false) => {
  const tt = (f - f0) / FPS, people: Person3[] = [];
  let flag: V3 | null = null;
  names.forEach((n, k) => {
    const x = x0 + dir * (sp * tt - k * gap), dist = sp * tt + 20 - k * gap;
    people.push({ who: n, p: at(x, 0, z + (k % 2) * 0.45), expr: "stern", side: { phase: ((dist / 1.6) % 1 + 1) % 1, mirror: dir < 0, stride: 0.8 } });
    if (k === 0 && flagFirst) flag = at(x + dir * 0.45, 0, z + 0.15);
  });
  return { people, flag };
};
const line = (names: string[], at: (x: number, y: number, z: number) => V3, x0: number, dx: number, z: number, expr: Expr, look: number): Person3[] =>
  names.map((n, k) => ({ who: n, p: at(x0 + k * dx, 0, z + (k % 2) * 0.35), expr, look }));
const US4 = ["us0", "us1", "us2", "us3"], UK4 = ["uk0", "uk1", "uk2", "uk3"], US6 = ["us0", "us1", "us2", "us3", "us4", "us5"], UK6 = ["uk0", "uk1", "uk2", "uk3", "uk4", "uk5"];
const SHIP_AT: V3 = [-214, 0.6, SHIP_Z], SHIP2_AT: V3 = [-196, 0.6, SHIP_Z + 7];
const pigSt: V3 = St(0, 0, 0);

// ---------------- the standoff (cold open, chapter 4, the loop at the end) ----------------
const standoffWide = (s: ShotDef, f: number, loop = false): St3 => ({
  light: "day", dof: 3,
  cam: push(St(0, 2.1, -11.5), St(0, 1.4, 0), f, loop ? s.a : 0, 0.0016, 46),
  pig: { p: pigSt, turn: 0.25 * Math.sin(t(f) * 2.2) },
  ship: SHIP_AT, ship2: SHIP2_AT, cannons: 4,
  people: [...line(US4, St, -1.6, -0.9, 0.6, "stern", 1), ...line(UK4, St, 1.6, 0.9, 0.6, "stern", -1)],
  subjects: [["pig", St(0, 0.6, -0.3), 0.15]],
});

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  "open-standoff": (s, f) => standoffWide(s, f),
  loop: (s, f) => standoffWide(s, f, true),
  "hill-us": (s, f) => ({
    light: "day", dof: 4, hillUK: -1,
    cam: dolly(s, f, Hl(-2.2, 1.0, -9.5), Hl(0.6, 1.3, -8.6), Hl(-0.8, 1.9, 0), Hl(0.2, 2.0, 0), 44),
    people: [-3.0, -2.2, -0.4, 0.4, 1.4, 2.4].map((x, k): Person3 => ({ who: US6[k], p: onHill(x, -1.4 - (k % 2) * 0.4), expr: "stern", look: x < 0 ? 1 : -1 })),
    cannons: 0,
    subjects: [["US flag", Hl(-0.4, 3.6, 0), 0.3]],
  }),
  "ship-bay": (s, f) => ({
    light: "day", dof: 0,
    cam: push([-203, 7.6, -37], [-212, 4.4, SHIP_Z], f, s.a, 0.0018, 46),
    ship: SHIP_AT, ship2: SHIP2_AT,
    subjects: [["warship", [-213, 5, SHIP_Z], 0.5]],
  }),
  lines: (s, f) => ({
    light: "day", dof: 6,
    cam: push(St(2.6, 1.55, -4.8), St(2.6, 1.45, 0), f, s.a, 0.003, 40),
    people: [{ who: "officer", p: St(2.6, 0, -0.6), expr: "stern", look: -1 }, ...line(UK4, St, 3.6, 0.9, 1.4, "stern", -1)],
  }),
  "pig-reveal": (s, f) => {
    const fp = wordAt(5, "pig") - 3;
    const c = f < fp ? push(St(0, 1.5, -8.5), St(0, 1.2, 0), f, s.a, 0.002, 46) : kick(push(St(0, 0.95, -2.7), St(0, 0.55, 0), f, fp, 0.003, 42), f, fp, 1);
    return {
      light: "day", dof: 8, cam: c, closeup: true,
      pig: { p: pigSt, turn: 0.3 * Math.sin(t(f) * 2.2), nod: f > fp ? -0.12 : 0 },
      ship: SHIP_AT, cannons: 4,
      people: f < fp ? [...line(US4.slice(0, 2), St, -1.3, -0.8, 0.8, "stern", 1), ...line(UK4.slice(0, 2), St, 1.3, 0.8, 0.8, "stern", -1)] : [],
      subjects: [["pig", St(0, 0.6, -0.3), 0.15]],
    };
  },
  "island-quiet": (s, f) => ({
    light: "golden", dof: 0, grave: false,
    cam: dolly(s, f, G(-6, 3.4, -16), G(2, 2.6, -14), G(-2, 0.8, 10), G(3, 0.8, 10), 48),
  }),
  "pigs-wander": (s, f) => {
    const u = (f - s.a) / FPS, x = -3.2 + 0.55 * u;
    return {
      light: "day", dof: 6,
      cam: push(Fm(-0.6, 1.25, -8.2), Fm(-0.8, 0.7, -1.6), f, s.a, 0.0018, 42),
      pig: { p: Fm(x, 0, -2.4), ry: -Math.PI / 2, walk: u * 1.6, nod: 0.15 * Math.sin(u * 5) },
      subjects: [["pig", Fm(x, 0.6, -2.4), 0.15]],
    };
  },
  "cutlar-intro": (s, f) => ({
    light: "day", dof: 6,
    cam: push(Fm(-0.4, 1.5, -7.6), Fm(-0.9, 1.25, -2.0), f, s.a, 0.0025, 42),
    people: [{ who: "cutlar", p: Fm(-0.9, 0, -2.0), expr: "smile_closed", look: 1 }],
  }),
  "patch-pig": (s, f) => {
    const fp = wordAt(47, "pig");
    return {
      light: "day", dof: 8,
      cam: f < fp - 3 ? push(Fm(-0.15, 1.45, -7.6), Fm(-0.15, 0.95, -1.4), f, s.a, 0.002, 44) : push(Fm(0.3, 1.1, -5.4), Fm(0.4, 0.6, -1.6), f, fp - 3, 0.003, 42),
      pig: { p: Fm(0.6, 0, -1.6), ry: -0.35, nod: 0.25 + 0.2 * Math.sin(t(f) * 9) },
      people: [{ who: "cutlar", p: Fm(-1.0, 0, -2.3), expr: f > fp ? "shock" : "stern", look: 1 }],
      subjects: f > fp + 4 ? [["pig", Fm(0.6, 0.6, -1.9), 0.12]] : [],
    };
  },
  "pig-close": (s, f) => ({
    light: "day", dof: 10, closeup: true,
    cam: push(Fm(0.5, 1.0, -3.9), Fm(0.5, 0.3, -1.4), f, s.a, 0.003, 44),
    pig: { p: Fm(0.6, 0, -1.6), ry: -0.35, nod: 0.3 + 0.25 * Math.sin(t(f) * 10) },
    subjects: [["pig", Fm(0.6, 0.5, -1.9), 0.12]],
  }),
  shoot: (s, f) => {
    const fs = wordAt(51, "shot"), jump = f >= fs ? Math.max(0, Math.sin(clamp01((f - fs) / 9) * Math.PI)) : 0;
    return {
      light: "day", dof: 8,
      cam: kick(push(Fm(-0.2, 1.45, -7.2), Fm(-0.2, 1.0, -1.6), f, s.a, 0.0022, 44), f, fs, 0.8),
      pig: { p: Fm(0.6, 0, -1.6), ry: -0.35, jump, nod: f < fs ? 0.25 + 0.2 * Math.sin(t(f) * 9) : -0.15 },
      bang: f >= fs - 1 && f < fs + 16 ? Fm(-0.45, 1.75, -2.1) : null, bangScale: 0.4 + 0.75 * clamp01((f - fs + 1) / 4),
      people: [{ who: "cutlar", p: Fm(-0.9, 0, -2.0), expr: f >= fs ? "shock" : "stern", look: 1 }],
      subjects: [["pig", Fm(0.6, 0.6, -1.9), 0.12]],
    };
  },
  regret: (s, f) => ({
    light: "day", dof: 8,
    cam: push(Fm(-0.9, 1.5, -5.6), Fm(-0.9, 1.35, -2.0), f, s.a, 0.003, 40),
    people: [{ who: "cutlar_nr", p: Fm(-0.9, 0, -2.0), expr: "nervous", look: 0, headTilt: 0.08 }],
  }),
  arrest: (s, f) => ({
    light: "day", dof: 8, arrest: true,
    cam: push(Fm(-0.7, 1.45, -9.8), Fm(-0.7, 1.25, -4.0), f, s.a, 0.0025, 46),
    people: [{ who: "officer", p: Fm(-0.5, 0, -3.6), expr: "stern", look: -1 }, { who: "cutlar_nr", p: Fm(-1.6, 0, -3.9), expr: "nervous", look: 1, headTilt: 0.08 }],
    subjects: [["arrest order", Fm(0.05, 1.75, -3.3), 0.1]],
  }),
  "march-in": (s, f) => {
    const m = marchers(US6, St, -0.6, -6, f, s.a, 1, 1.35, 1.25, true);
    return { light: "day", dof: 6, cam: dolly(s, f, St(-3, 1.3, -14.5), St(-1, 1.5, -13.0), St(-3, 1.3, -6), St(-1, 1.4, -6), 44), people: m.people, march: m.flag };
  },
  landing: (s, f) => {
    const m = marchers(["pickett", ...US4], Q, -5.6, 1.0, f, s.a, 1, 1.2, 1.3, false);
    return { light: "day", dof: 4, cam: dolly(s, f, Q(-1.5, 2.0, -9.5), Q(0.5, 2.0, -9.0), Q(-3.5, 1.0, 2.5), Q(-1.5, 1.0, 2.5), 46), people: m.people, dock: true };
  },
  "ship-arrives": (s, f) => ({
    light: "day", dof: 0,
    cam: push([-208, 1.6, -27.5], [-221, 4.6, SHIP_Z], f, s.a, 0.004, 50, -0.03),
    ship: [-228 + 8 * smooth((f - s.a) / (s.b - s.a + 10)), 0.6, SHIP_Z],
    subjects: [["warship", [-225 + 8 * smooth((f - s.a) / (s.b - s.a + 10)), 5, SHIP_Z], 0.5]],
  }),
  "pickett-hill": (s, f) => ({
    light: "day", dof: 5, hillUK: -1,
    cam: push(Hl(-1.0, 1.25, -7.2), Hl(-1.2, 1.9, 0), f, s.a, 0.0022, 44),
    people: [{ who: "pickett", p: onHill(-1.7, -0.9), expr: "stern", look: 1 }, { who: "us1", p: onHill(0.2, -0.2), expr: "stern", look: -1 }, { who: "us2", p: onHill(-3.0, 0.2), expr: "stern", look: 1 }],
    subjects: [["US flag", Hl(-0.4, 3.6, 0), 0.3]],
  }),
  "pickett-stern": (s, f) => ({
    light: "day", dof: 8, hillUK: -1,
    cam: push(Hl(-1.6, 1.85, -4.4), Hl(-1.7, 1.75, -0.9), f, s.a, 0.003, 38),
    people: [{ who: "pickett", p: onHill(-1.7, -0.9), expr: "stern", look: 0 }],
  }),
  "uk-line": (s, f) => ({
    light: "day", dof: 5,
    cam: push(St(5.4, 1.9, -10.5), St(4.4, 1.7, 0.5), f, s.a, 0.0012, 46),
    ship: SHIP_AT, ship2: SHIP2_AT,
    people: line(UK6, St, 2.6, 0.9, 0.0, "stern", -1),
  }),
  "pig-field": (s, f) => ({
    light: "day", dof: 10,
    cam: push(St(0, 0.85, -3.6), St(0, 0.6, 0), f, s.a, 0.002, 42),
    pig: { p: pigSt, turn: 0.3 * Math.sin(t(f) * 1.8) },
    people: [...line(US4.slice(0, 3), St, -2.4, -0.9, 3.0, "stern", 1), ...line(UK4.slice(0, 3), St, 2.4, 0.9, 3.0, "stern", -1)],
    subjects: [["pig", St(0, 0.6, -0.3), 0.15]],
  }),
  governor: (s, f) => ({
    light: "day", dof: 8, ship: [-178, 0.6, SHIP_Z],
    cam: push(Q(-1.6, 1.55, -5.4), Q(-1.0, 1.75, 2.0), f, s.a, 0.0025, 44),
    people: [{ who: "governor", p: Q(-1.0, 0, 0), expr: "stern", look: 1, wave: 0.9 }],
  }),
  admiral: (s, f) => ({
    light: "day", dof: 8, ship: [-178, 0.6, SHIP_Z],
    cam: push(Q(1.6, 1.55, -6.0), Q(1.4, 1.6, 1.5), f, s.a, 0.0022, 44),
    people: [{ who: "admiral", p: Q(1.4, 0, 0), expr: "stern", look: -1 }],
  }),
  refuse: (s, f) => {
    const fr = wordAt(103, "refused"), sh = f >= fr - 4 ? (Math.floor((f - fr) / 5) % 2 ? 1 : -1) as -1 | 1 : 0;
    const pp = smooth((f - (fr - 3)) / 7);
    return {
      light: "day", dof: 8, ship: [-178, 0.6, SHIP_Z],
      cam: kick(push(Q(1.4, 1.55, -5.0), Q(1.4, 1.7, 1.5), f, s.a, 0.003, 44), f, fr, 0.7),
      no: pp <= 0.001 ? 0 : pp * (1 + 0.14 * Math.sin(clamp01((f - fr) / 10) * Math.PI)),
      people: [{ who: "admiral", p: Q(1.4, 0, 0), expr: "stern", facing: sh, look: sh }],
      subjects: f > fr + 8 ? [["NO board", Q(1.4, 2.55, 0.6), 0.1]] : [],
    };
  },
  "close-wide": (s, f) => ({
    light: "day", dof: 0,
    cam: dolly(s, f, St(-2, 6.5, -24), St(2, 5.0, -21), St(-1, 1.0, 2), St(1, 1.0, 2), 50),
    pig: { p: pigSt }, ship: SHIP_AT, ship2: SHIP2_AT, cannons: 4,
    people: [...line(US6, St, -1.6, -0.9, 0.6, "stern", 1), ...line(UK6, St, 1.6, 0.9, 0.6, "stern", -1)],
  }),
  "hill-us2": (s, f) => ({
    light: "day", dof: 4, hillUK: -1,
    cam: dolly(s, f, Hl(1.2, 1.4, -9.0), Hl(-0.8, 1.2, -9.6), Hl(0, 1.8, 0), Hl(-0.6, 1.9, 0), 44),
    people: [-3.0, -2.2, -0.4, 0.4, 1.4, 2.4].map((x, k): Person3 => ({ who: US6[k], p: onHill(x, -1.4 - (k % 2) * 0.4), expr: "stern", look: x < 0 ? 1 : -1 })),
  }),
  "ship-bay2": (s, f) => ({
    light: "day", dof: 0,
    cam: dolly(s, f, [-190, 7.4, -38], [-196, 7.8, -38], [-206, 4.2, SHIP_Z], [-209, 4.4, SHIP_Z], 48),
    ship: SHIP_AT, ship2: SHIP2_AT,
    subjects: [["warship", [-213, 5, SHIP_Z], 0.5]],
  }),
  "uk-line2": (s, f) => ({
    light: "day", dof: 6,
    cam: dolly(s, f, St(7.5, 1.7, -7.2), St(5.0, 1.7, -7.6), St(4.8, 1.5, 0.5), St(4.0, 1.5, 0.5), 42),
    ship: SHIP_AT, people: line(UK6, St, 2.6, 0.9, 0.0, "stern", -1),
  }),
  "pig-dead": (s, f) => ({
    light: "golden", dof: 8, grave: true,
    cam: push(G(0, 1.2, -4.2), G(0, 0.55, 0), f, s.a, 0.002, 42),
    subjects: [["grave", G(0, 0.6, -0.1), 0.1]],
  }),
  marines: (s, f) => {
    const m = marchers(UK6, Cp, -4.5, -5.0, f, s.a, 1, 1.3, 1.25);
    return { light: "day", dof: 4, cam: dolly(s, f, Cp(-2.5, 1.5, -15), Cp(-0.5, 1.6, -14), Cp(-2.5, 1.3, -4), Cp(-0.5, 1.3, -4), 44), people: m.people };
  },
  "camps-flags": (s, f) => ({
    light: "day", dof: 0,
    cam: dolly(s, f, Cp(0, 7.5, -18), Cp(0, 2.8, -11), Cp(0, 0.5, 2), Cp(0, 1.8, 1), 50),
    subjects: [["US flag", Cp(-1.4, 2.9, 1.6), 0.3], ["UK flag", Cp(1.7, 2.9, 1.6), 0.3]],
  }),
  "camps-quiet": (s, f) => ({
    light: "golden", dof: 0,
    cam: dolly(s, f, Cp(-6, 4.0, -16), Cp(6, 4.0, -16), Cp(-2, 1.0, 3), Cp(2, 1.0, 3), 48),
  }),
  "camps-friends": (s, f) => ({
    light: "day", dof: 6,
    cam: push(Cp(0, 1.55, -7.6), Cp(0, 1.35, -2.3), f, s.a, 0.0025, 42),
    people: [{ who: "us0", p: Cp(-0.9, 0, -2.3), expr: "smile", look: 1 }, { who: "uk0", p: Cp(0.9, 0, -2.3), expr: "smile", look: -1 }],
  }),
  "march-uk": (s, f) => {
    const m = marchers(UK4, Cp, 3.0, -4.6, f, s.a, -1, 1.3, 1.25);
    return { light: "day", dof: 4, cam: dolly(s, f, Cp(1.5, 1.5, -14.5), Cp(-0.5, 1.5, -14), Cp(1.5, 1.3, -3), Cp(-0.5, 1.3, -3), 44), people: m.people };
  },
  "march-us": (s, f) => {
    const m = marchers(US4, Cp, -3.0, -4.6, f, s.a, 1, 1.3, 1.25, true);
    return { light: "day", dof: 4, cam: dolly(s, f, Cp(-1.5, 1.5, -14.5), Cp(0.5, 1.5, -14), Cp(-1.5, 1.3, -3), Cp(0.5, 1.3, -3), 44), people: m.people, march: m.flag };
  },
  "camps-friends2": (s, f) => ({
    light: "golden", dof: 6,
    cam: dolly(s, f, Cp(-1.2, 1.5, -6.8), Cp(1.0, 1.5, -6.6), Cp(0, 1.35, -2.3), Cp(0, 1.35, -2.3), 42),
    people: [{ who: "us3", p: Cp(-0.9, 0, -2.3), expr: "smile", look: 1, wave: 0.8 }, { who: "uk2", p: Cp(0.9, 0, -2.3), expr: "smile", look: -1 }],
  }),
  "camps-peace": (s, f) => ({
    light: "golden", dof: 0,
    cam: dolly(s, f, Cp(0, 2.2, -12), Cp(0, 6.5, -17), Cp(0, 1.4, 1), Cp(0, 0.6, 3), 50),
    people: [{ who: "us0", p: Cp(-0.9, 0, -2.3), expr: "smile", look: 1 }, { who: "uk0", p: Cp(0.9, 0, -2.3), expr: "smile", look: -1 }],
  }),
  hall: (s, f) => ({
    light: "day", dof: 4,
    cam: push(C(0.3, 2.2, -6.5), C(0.3, 2.4, 5.0), f, s.a, 0.0018, 50),
    people: [{ who: "kaiser", p: C(1.05, 0.4, 4.0), expr: "stern" }],
    subjects: [["arbitration board", C(0, 3.1, 5.9), 0.3]],
  }),
  "kaiser-decides": (s, f) => {
    const fd = wordAt(175, "ruling");
    return {
      light: "day", dof: 6,
      cam: kick(push(C(0.6, 2.0, -3.4), C(0.8, 2.2, 5.0), f, s.a, 0.0025, 48), f, fd, 0.6),
      people: [{ who: "kaiser", p: C(1.05, 0.4, 4.0), expr: "stern", wave: f > fd ? 0.6 : undefined }],
    };
  },
  "flag-down": (s, f) => ({
    light: "golden", dof: 4,
    cam: push(Cp(2.2, 1.4, -6.4), Cp(1.6, 2.6, 1.6), f, s.a, 0.0018, 44),
    campUK: 1 - smooth((f - s.a - 10) / Math.max(20, (s.b - s.a) * 0.6)),
    subjects: [["UK flag pole", Cp(1.2, 2.2, 1.6), 0.2]],
  }),
  statue: (s, f) => {
    const a = -0.5 + 0.8 * U(s, f, smooth), r = 5.2;
    const c: V3 = G(4 + r * Math.sin(a), 1.9, -r * Math.cos(a));
    return {
      light: "day", dof: 8, statue: true,
      cam: cam(c, G(4, 1.05, 0), 40),
      subjects: [["statue", G(4, 1.4, -0.4), 0.1]],
    };
  },
};
void blinkless;
