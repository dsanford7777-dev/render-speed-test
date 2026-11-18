// The Longyearbyen long-form's 3D shots: the Frozen Short's sets, cast and props (../frozen), re-shot for 16:9.
// Short specs are reused through R(): the camera's vertical field of view is narrowed so the framing matches the
// portrait shot's width (a 16:9 frame with the same vertical angle would see three times as much to each side).
// Shots of their own (variants, 1951, the town) are written out below with the same house kit (move/orbit/snap/kick).
import { SPECS as FS, St3, Cam, ShotDef as FShot, V3, smooth, expo, L3, move, orbit, snap, kick, secs, U, P, walker, add, breath, spray, digPose, TEAM, viruses, hookState, clamp01 } from "../frozen/story";
import { FPS, Gv, Qy, Wd, Ct, Ak, Lb, CROSS_Z, LID_Y, CUT, PIER, BENCH_Y, SCREEN, SCOPE, SET, SHORE_Z } from "../frozen/place";
import { ShotDef } from "./timeline";

const T = (k: number) => Math.round(k * FPS);
/** portrait -> landscape: keep roughly the portrait frame's width of view */
const vfov = (v: number) => (2 * Math.atan(0.74 * Math.tan((v * Math.PI) / 360)) * 180) / Math.PI;
const wide = (c: Cam): Cam => ({ ...c, fov: vfov(c.fov) });
const asF = (s: ShotDef): FShot => ({ id: s.id, g: s.g, a: s.a, b: s.b, k: "3d" });
/** a Short spec, re-shot for 16:9 */
const R = (k: string, mod?: (st: St3, s: ShotDef, f: number) => St3) => (s: ShotDef, f: number): St3 => {
  const st = FS[k](asF(s), f), w = { ...st, cam: wide(st.cam) };
  return mod ? mod(w, s, f) : w;
};
/** a long-form camera written directly in landscape terms (no conversion) */
const tt = (s: ShotDef, f: number) => secs(f - s.a);

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- cold open ----------------
  // 1998: the team at the graveyard under the tent; the digger starts
  team: (s, f) => { const d = digPose(tt(s, f));
    return { ...hookState(tt(s, f)), light: "grey", tent: true, dug: false, dof: 1, focus: Gv(0, 0.9, 1.6),
      cam: move({ pos: Gv(1.6, 1.9, -6.4), look: Gv(-0.2, 0.9, 1.8), fov: 40, roll: -0.04 }, { pos: Gv(0.6, 1.7, -5.4), look: Gv(-0.6, 0.9, 1.8), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [d.man("stern"), ...TEAM.map(([w, p, e]) => P(w, p, e, 0, { mask: true }))], tools: [d.tool],
      subjects: [["the team", Gv(0, 1.2, 0.4), 0.4], ["the crosses", Gv(0, 0.8, CROSS_Z), 0.3]] }; },
  hook: R("hook"),
  crosses: R("crosses"),
  virus: R("virus"),
  alive: R("alive", (st, s, f) => ({ ...st, cam: kick(st.cam, f, s.a + T(0.3), 0.8) })),
  sample: R("sample"),
  solid: R("solid", (st, s, f) => ({ ...st, cam: kick(st.cam, f, s.a + T(0.5), 0.8) })),
  shearsflash: R("shears"),
  town2: R("town2"),
  // the town from the pier, past the signpost
  townwide: R("town"),
  // ---------------- 1906-1918 ----------------
  // docks and houses: along the pier to the LONGYEAR CITY shed
  shed: (s, f) => ({ light: "quay", shipZ: -40, dof: 0, focus: Qy(-6.5, 5.2, SHORE_Z + 3.2),
    cam: move({ pos: Qy(-0.8, PIER.y + 2.2, -8), look: Qy(-5.5, 4.4, SHORE_Z + 3.2), fov: 38, roll: 0.04 }, { pos: Qy(-2.4, PIER.y + 2.4, 2), look: Qy(-6.5, 5.0, SHORE_Z + 3.2), fov: 36, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the shed sign", Qy(-6.5, 5.25, SHORE_Z + 3.2), 0.5]] }),
  // young men for the season: miners walk up the pier with their bags
  miners: (s, f) => { const t = tt(s, f), y = PIER.y, carry = (p: V3): V3 => add(p, 0.4, 0.75, 0);
    return { light: "quay", shipZ: 0, dof: 1, focus: Qy(0.3, y + 1.3, -6 + 1.1 * t),
      cam: move({ pos: Qy(2.4, y + 1.6, -15), look: Qy(0.6, y + 1.3, -7), fov: 38, roll: -0.04 }, { pos: Qy(2.2, y + 1.7, -11), look: Qy(0.4, y + 1.3, -3), fov: 36, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("miner1", Qy(0.9, y, -8.5 + 1.1 * t), "neutral", 1, { march: (t * 0.9) % 1 }), P("miner3", Qy(-0.2, y, -9.6 + 1.1 * t), "smile", 1, { march: (t * 0.9 + 0.4) % 1, hw: [carry(Qy(-0.2, y, -9.6 + 1.1 * t))] }), P("miner5", Qy(0.5, y, -11 + 1.1 * t), "neutral", 1, { march: (t * 0.9 + 0.7) % 1 })],
      puffs: [0, 1, 2].flatMap((i) => breath(Qy([0.9, -0.2, 0.5][i], y + 1.5, [-8.5, -9.6, -11][i] + 1.1 * t), t + i * 0.3, 0.7)), subjects: [["the miners", Qy(0.4, y + 1.3, -9.6 + 1.1 * t), 0.3]] }; },
  // ---------------- the last ship ----------------
  ship: R("ship"),
  sick: R("sick"),
  // the hospital: seven beds, every candle lit, the nurse going down the row
  ward: (s, f) => { const t = tt(s, f);
    return { light: "ward", candles: 7, day: 1, dof: 1, focus: Wd(0, 0.9, 3.2), key: Wd(0, 2.35, 0.6),
      cam: move({ pos: Wd(-1.2, 1.7, -4.6), look: Wd(0.4, 1.0, 3.2), fov: 44, roll: 0.04 }, { pos: Wd(0.4, 1.55, -3.8), look: Wd(0.2, 1.0, 3.2), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [walker("nurse", Wd(2.4, 0, 2.1)[0], 0, Wd(2.4, 0, 2.1)[2], -0.9, t, "nervous")],
      subjects: [["the beds", Wd(0, 0.6, 3.2), 0.3]] }; },
  week: R("week"),
  oldest: R("oldest"),
  // a new cemetery on the hillside: night, snow, two miners with lanterns where the graves will go
  hillside: (s, f) => { const t = tt(s, f);
    return { light: "night", snow: true, dug: false, lanterns: true, crosses: false, dof: 0, focus: Gv(0, 0.8, 2.0), key: Gv(3.9, 1.9, 0.6),
      cam: move({ pos: Gv(-0.9, 1.9, -4.6), look: Gv(0, 1.0, 2.0), fov: 40, roll: 0.04 }, { pos: Gv(-0.5, 1.7, -3.8), look: Gv(0, 1.0, 2.0), fov: 38, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("miner2", Gv(1.4, 0, 1.6), "stern", -1), P("miner4", Gv(-1.3, 0, 1.9), "nervous", 1)],
      puffs: [...breath(Gv(1.4, 1.5, 1.6), t), ...breath(Gv(-1.3, 1.5, 1.9), t + 0.5)], subjects: [["the graves", Gv(0, 0.3, 2.0), 0.4]] }; },
  frozen: R("frozen"),
  dynamite: R("dynamite"),
  boom: R("boom"),
  // seven crosses, all dated 1918: along the row in the snow, no tent
  crosses18: (s, f) => { const cam = move({ pos: Gv(-3.0, 0.45, -1.4), look: Gv(-2.0, 0.95, CROSS_Z), fov: 34, roll: 0.04 }, { pos: Gv(3.0, 0.45, -1.4), look: Gv(2.0, 0.95, CROSS_Z), fov: 34, roll: -0.04 }, f, s.a, s.b, smooth, 0);
    return { light: "grey", snow: false, dug: false, tent: false, dof: 2, focus: cam.look, cam, subjects: [["a cross", [cam.look[0], 0.8, CROSS_Z], 0.3]] }; },
  // left alone for eighty years: a slow push on the row at night, snow falling
  alone: (s, f) => ({ light: "night", snow: true, dug: false, tent: false, lanterns: false, dof: 1, focus: Gv(0, 0.8, CROSS_Z),
    cam: move({ pos: Gv(0.4, 1.3, -3.6), look: Gv(0, 0.8, CROSS_Z), fov: 36, roll: -0.03 }, { pos: Gv(0.2, 1.0, -2.2), look: Gv(0, 0.8, CROSS_Z), fov: 34, roll: 0.02 }, f, s.a, s.b, smooth, 0),
    subjects: [["the crosses", Gv(0, 0.8, CROSS_Z), 0.3]] }),
  // ---------------- a virus nobody kept ----------------
  millions: R("millions"),
  // left nothing behind but its victims: low over the field of crosses
  field2: (s, f) => ({ light: "twilight", snow: true, dug: false, field: true, dof: 0, focus: Gv(0, 0, -30),
    cam: move({ pos: Gv(4, 1.4, 4.0), look: Gv(2, 0.6, -24), fov: 40, roll: 0.05 }, { pos: Gv(-4, 1.6, 2.0), look: Gv(-2, 0.6, -26), fov: 40, roll: -0.04 }, f, s.a, s.b, smooth, 0) }),
  labwide: R("inside"),
  adig51: R("adig", (st) => ({ ...st, people: st.people?.map((q) => (q.who === "hultin" ? { ...q, who: "hultin51" } : q)) })),
  // he tried everything: the young Hultin at the microscope
  scope51: (s, f) => ({ light: "lab", parcel: null, dof: 2, focus: Lb(SCOPE[0], BENCH_Y + 0.3, SCOPE[2]),
    cam: orbit(asF(s), f, Lb(SCOPE[0] + 0.2, 1.25, SCOPE[2] - 0.2), [-30, -12], [2.6, 2.3], [0.25, 0.18], 40, [-0.05, 0.03]),
    people: [P("hultin51", Lb(SCOPE[0] + 0.55, 0, SCOPE[2] - 0.1), "stern", 1, { hw: [Lb(SCOPE[0] - 0.12, BENCH_Y + 0.22, SCOPE[2] - 0.08), Lb(SCOPE[0] + 0.12, BENCH_Y + 0.22, SCOPE[2] - 0.08)] })],
    subjects: [["the microscope", Lb(SCOPE[0], BENCH_Y + 0.3, SCOPE[2]), 0.2]] }),
  // the trail went cold: the graveyard at night, snow, nobody
  trail: (s, f) => ({ light: "night", snow: true, dug: false, tent: false, lanterns: false, dof: 0, focus: Gv(0, 0.8, CROSS_Z),
    cam: move({ pos: Gv(-5.5, 3.2, -8.5), look: Gv(0, 0.6, CROSS_Z), fov: 38, roll: 0.04 }, { pos: Gv(-3.5, 2.8, -9.0), look: Gv(0.5, 0.6, CROSS_Z), fov: 38, roll: -0.02 }, f, s.a, s.b, smooth, 0),
    subjects: [["the crosses", Gv(0, 0.8, CROSS_Z), 0.3]] }),
  // ---------------- the geographer, the dig ----------------
  diary: R("oldest", (st, s, f) => ({ ...st, cam: move({ pos: Wd(0.2, 1.75, -0.6), look: Wd(0.45, 1.08, 0.28), fov: 34, roll: 0.05 }, { pos: Wd(0.3, 1.6, -0.35), look: Wd(0.45, 1.08, 0.28), fov: 30, roll: -0.03 }, f, s.a, s.b, smooth, 0), closeup: true })),
  flags: R("flags"),
  suits: R("suits"),
  // strict containment: the tent over the graves, from outside
  tent: (s, f) => ({ light: "grey", tent: true, dug: false, dof: 0, focus: Gv(0, 1.5, 2.0),
    cam: move({ pos: Gv(4.5, 2.4, -10.5), look: Gv(0, 1.3, 2.0), fov: 40, roll: -0.04 }, { pos: Gv(2.5, 2.2, -9.0), look: Gv(0, 1.3, 2.0), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    people: [P("sci4", Gv(-2.6, 0, -0.6), "stern", 1, { mask: true }), P("lead", Gv(2.2, 0, -0.4), "neutral", -1, { mask: true })],
    subjects: [["the tent", Gv(0, 1.8, 2.0), 1.0]] }),
  radar: R("radar"),
  idea: R("idea"),
  dig: R("dig"),
  hit: R("hit", (st, s, f) => ({ ...st, cam: kick(st.cam, f, s.a + T(0.35), 1.0) })),
  shallow: R("shallow"),
  // either way, not in the permafrost: low along the cut, the coffins sitting above the frozen line
  above: R("shallow", (st, s, f) => ({ ...st, cam: move({ pos: Ct(2.2, -1.0, -4.8), look: Ct(0.2, -1.1, CUT.z), fov: 34, roll: -0.05 }, { pos: Ct(-1.8, -1.0, -4.6), look: Ct(-0.2, -1.1, CUT.z), fov: 34, roll: 0.04 }, f, s.a, s.b, smooth, 0) })),
  layer: R("layer"),
  summers: R("summers"),
  gone: R("gone", (st, s, f) => ({ ...st, cam: kick(st.cam, f, s.a + T(0.4), 0.8) })),
  // ---------------- Alaska, 1997 ----------------
  shears: R("shears", (st, s, f) => ({ ...st, cam: kick(st.cam, f, s.a + T(0.5), 0.8) })),
  plane: R("plane"),
  village: R("village"),
  adig: R("adig"),
  found: R("found"),
  mail: R("mail"),
  // the lab found the flu inside: the screen comes up partway through the shot
  reveal: (s, f) => { const on = f >= s.a + Math.round(0.45 * (s.b - s.a));
    return { light: "lab", parcel: { p: Lb(0.15, BENCH_Y, 3.35), yaw: 0.1, open: true }, done: on, dof: 2, focus: Lb(SCREEN[0], BENCH_Y + 0.25, SCREEN[2] - 0.26),
      cam: kick(snap(Lb(-0.5, 1.4, 0.4), Lb(-0.92, 1.2, 2.6), f, s.a, { fov: 36, roll: 0.05 }, 1.5, 5), f, s.a + Math.round(0.45 * (s.b - s.a)), 1.0),
      people: [P("path", Lb(-0.62, 0, 2.45), on ? "grin" : "shock", 1)], subjects: [["the screen", Lb(SCREEN[0], BENCH_Y + 0.25, SCREEN[2] - 0.26), 0.1]] }; },
  // ---------------- the rule, the end ----------------
  town2b: R("town2", (st, s, f) => ({ ...st, cam: move({ pos: Gv(2.5, 1.4, 5.0), look: Gv(-1, 0.6, -30), fov: 38, roll: -0.04 }, { pos: Gv(1.2, 1.9, 6.0), look: Gv(-1, 0.4, -30), fov: 38, roll: 0.03 }, f, s.a, s.b, smooth, 0) })),
  townwide2: R("town", (st, s, f) => ({ ...st, cam: move({ pos: Qy(1.2, PIER.y + 3.4, -6.0), look: Qy(-3.0, PIER.y + 3.0, 16), fov: 40, roll: 0.03 }, { pos: Qy(0.4, PIER.y + 3.0, -3.0), look: Qy(-3.5, PIER.y + 3.4, 16), fov: 38, roll: -0.03 }, f, s.a, s.b, smooth, 0) })),
  town2c: R("town2", (st, s, f) => ({ ...st, cam: move({ pos: Gv(-2.4, 3.6, 8.0), look: Gv(0.5, 0.2, -30), fov: 40, roll: 0.04 }, { pos: Gv(-1.0, 3.0, 7.0), look: Gv(0.5, 0.4, -30), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0) })),
  crosses3: (s, f) => { const cam = move({ pos: Gv(2.6, 0.5, -2.0), look: Gv(1.0, 0.95, CROSS_Z), fov: 36, roll: -0.04 }, { pos: Gv(-2.6, 0.5, -1.8), look: Gv(-1.0, 0.95, CROSS_Z), fov: 36, roll: 0.04 }, f, s.a, s.b, smooth, 0);
    return { light: "grey", snow: false, dug: false, tent: false, dof: 1, focus: cam.look, cam, subjects: [["the crosses", Gv(0, 0.8, CROSS_Z), 0.3]] }; },
  shallow2: R("shallow", (st, s, f) => ({ ...st, cam: move({ pos: Ct(-0.8, 0.0, -7.0), look: Ct(0, -1.0, CUT.z), fov: 38, roll: -0.04 }, { pos: Ct(-0.3, -0.6, -6.0), look: Ct(0, -1.1, CUT.z), fov: 36, roll: 0.03 }, f, s.a, s.b, smooth, 0) })),
  gone2: R("gone", (st, s, f) => ({ ...st, cam: move({ pos: Ct(-0.4, -0.3, -4.2), look: Ct(0, LID_Y - 0.2, CUT.z), fov: 34, roll: -0.05 }, { pos: Ct(-0.2, -0.5, -3.4), look: Ct(0, LID_Y - 0.2, CUT.z), fov: 32, roll: 0.03 }, f, s.a, s.b, smooth, 0) })),
  village2: R("village", (st, s, f) => ({ ...st, cam: move({ pos: Ak(5, 4.0, -11), look: Ak(0, 1.2, 6), fov: 40, roll: -0.04 }, { pos: Ak(8, 6.0, -13), look: Ak(-0.5, 0.8, 6), fov: 42, roll: 0.03 }, f, s.a, s.b, smooth, 0) })),
  shears2: R("shears"),
  // thumbnail: the seven crosses in the snow, one virus glowing over the cut ground in front
  thumb: () => { const st = hookState(0.4);
    return { ...st, light: "night", lanterns: true, key: Gv(3.9, 1.9, 0.6), tent: false, snow: true, dug: false, dof: 1, focus: Gv(-1.4, 1.0, 1.2),
      cam: { pos: Gv(0.9, 1.0, -2.0), look: Gv(-1.1, 1.0, 1.6), fov: 44, roll: 0.03 },
      cards: [...(st.cards ?? []), { kind: "virus", p: Gv(-0.55, 0.75, 1.2), spin: 0.2, s: 1.5 }, { kind: "virus", p: Gv(-0.1, 1.55, 1.9), spin: -0.3, s: 0.7 }] }; },
};
void expo; void L3; void spray; void viruses; void clamp01; void SET;

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0032 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip (scene changes) */
const WHIP = new Set(["ship", "week", "frozen", "millions", "labwide", "adig51", "idea", "plane", "mail", "town2b", "shed", "hillside", "trail", "village2"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
