// The Lake Peigneur long-form's 3D shots: the Peigneur Short's sets, cast and props (../peigneur), re-shot for 16:9.
// Short specs are reused through R(): the camera's vertical field of view is narrowed so the framing matches the
// portrait shot's width. Shots of its own are written out below with the same house kit (move/orbit/kick).
import { SPECS as FS, St3, Cam, ShotDef as FShot, V3, smooth, expo, move, orbit, kick, snap, secs, U, P, add, Rg, Lk, Mn, onGround, brake, home, sucked, onSkiff, splash, mistAt, inCage, TUGQ, SKIFF, DRILLER, FL, PADY, MINERS, clamp01 } from "../peigneur/story";
import { FPS, HOLE, RC, BARGES, HEADFRAME, CHIMNEY, HOUSE, CAGE, END_Z, BREACH, islandY } from "../peigneur/place";
import { ShotDef } from "./timeline";

const T = (k: number) => Math.round(k * FPS);
/** portrait -> landscape: keep roughly the portrait frame's width of view */
const vfov = (v: number) => (2 * Math.atan(0.74 * Math.tan((v * Math.PI) / 360)) * 180) / Math.PI;
const wide = (c: Cam): Cam => ({ ...c, fov: vfov(c.fov) });
const asF = (s: ShotDef): FShot => ({ id: s.id, g: s.g, a: s.a, b: s.b, k: "3d" });
/** a Short spec, re-shot for 16:9 (its word-timed kicks belong to the Short's narration; one is added at kickAt s) */
const R = (k: string, kickAt?: number, mod?: (st: St3, s: ShotDef, f: number) => St3) => (s: ShotDef, f: number): St3 => {
  const st = FS[k](asF(s), f), c = kickAt === undefined ? st.cam : kick(st.cam, f, s.a + T(kickAt), 0.9), w = { ...st, cam: wide(c) };
  return mod ? mod(w, s, f) : w;
};
const tt = (s: ShotDef, f: number) => secs(f - s.a);
/** pull the camera back (k > 1) along its line of sight */
const far = (st: St3, k: number): St3 => ({ ...st, cam: { ...st.cam, pos: [st.cam.look[0] + (st.cam.pos[0] - st.cam.look[0]) * k, st.cam.look[1] + (st.cam.pos[1] - st.cam.look[1]) * k, st.cam.look[2] + (st.cam.pos[2] - st.cam.look[2]) * k] as V3 } });
const HX = HOLE.x, HZ = HOLE.z;
const none = BARGES.map(() => null);

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  tilt: R("tilt"), off: R("off", undefined, (st) => ({ ...st, cam: { ...st.cam, pos: [st.cam.pos[0] - 3.2, st.cam.pos[1], st.cam.pos[2] + 0.6] as V3 } })), flip: R("flip", 1.2), vanish: R("vanish"), gone: R("gone"), entire: R("entire"), out: R("out"), calm: R("calm"), under: R("under", undefined, (st, s, f) => ({ ...st, cam: wide(move({ pos: Rg(-6, 30, -16), look: Rg(0, 12, 0), fov: 52, roll: 0.05 }, { pos: Rg(-3, 16, -12), look: Rg(0, FL, 0), fov: 50, roll: -0.06 }, f, s.a, s.b, expo, 0)) })),
  ten: R("ten"), fisher: R("fisher"), garden: R("garden"), mine: R("mine", 0.4), fifty: R("fifty"), drilling: R("drilling"), know: R("know"), jam: R("jam", 0.5),
  bit: R("bit", 0.8), pour: R("pour", 0.5), coming: R("coming"), cage: R("cage"), eight: R("eight"), nobody: R("nobody"), whirl: R("whirl"), barges: R("barges"),
  tug: R("tug", 0.5), trees: R("trees"), acres: R("acres", 0.6), crater: R("crater"), canal: R("canal"), falls: R("falls", 0.6), fill: R("fill"),
  pop: R("pop"), corks: R("corks", 0.5), blame: R("blame"), paid: R("paid", 0.4), today: R("today"), deep200: R("deep200"), crazy: R("crazy"),
  // the loud pops: under the deck, water jumping at the hull (timed to this shot)
  pops: (s, f) => { const tn = tt(s, f), hits = [0.1, 0.55, 1.0].map((x) => clamp01((tn - x) / 0.4)).filter((u) => u > 0 && u < 1);
    const st = FS.pops(asF(s), f); return { ...st, cam: wide(kick(kick(st.cam, f, s.a + T(0.1), 1.3), f, s.a + T(0.55), 1.3)), puffs: hits.flatMap((u, i) => splash(Rg(-16 + 6 * i, 0, -11 + 2 * i), u, 0.5, 8)) }; },
  // ---------------- the long-form's own ----------------
  // the rig leaning, close on the drill floor: the crew grabbing hold
  tiltclose: (s, f) => { const u = U(s, f), b = brake(1);
    return { light: "dawn", lake: { lv: 0, hole: 8, depth: 4, spin: 1 }, rig: { tilt: 0.06 + 0.04 * u, roll: 0.02 }, tools: [b.tool], dof: 1, focus: add(DRILLER, -1, 1.4, 0),
      cam: move({ pos: add(DRILLER, -3.6, 1.8, -6.6), look: add(DRILLER, -1.4, 1.5, 0), fov: 34, roll: 0.1 }, { pos: add(DRILLER, -3.2, 1.7, -6.0), look: add(DRILLER, -1.4, 1.4, 0), fov: 34, roll: 0.14 }, f, s.a, s.b, smooth, 0),
      people: [P("driller", DRILLER, "shock", -1, { hw: [b.knob] }), P("hand1", Rg(-1.4, FL, -4.6), "shock", 1, { wave: 1 })] }; },
  // the Jefferson house, round the other side, the oaks and moss
  garden2: (s, f) => { const hy = islandY(HOUSE.x, HOUSE.z);
    return { light: "dawn", lake: { lv: 0 }, rig: null, /* out of shot; its derrick's long dawn shadows read as wires across the lawn */ dof: 0, focus: Lk(HOUSE.x, hy + 6, HOUSE.z),
      cam: orbit(s, f, Lk(HOUSE.x, hy + 5, HOUSE.z), [-38, -18], [60, 54], [17, 22], 34, [0.04, -0.03]), subjects: [["the house", Lk(HOUSE.x, hy + 6, HOUSE.z - 6), 1]] }; },
  // the rooms: down a drift between the pillars, the lamps going off into the dark
  mineroom: (s, f) => ({ light: "mine", dof: 0, focus: Mn(-34, 6, -60), key: Mn(-34, 12.6, -40),
    cam: move({ pos: Mn(-34, 3, 26), look: Mn(-34, 7, -60), fov: 46, roll: 0.03 }, { pos: Mn(-34, 5, 14), look: Mn(-34, 6.5, -60), fov: 46, roll: -0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the drift", Mn(-34, 6, -60), 6]] }),
  // the crew at work on the floor, before
  crewwork: (s, f) => far(R("drilling")(s, f), 1.2),
  // ...and the rig began to tilt (from the other side)
  tilt2: (s, f) => { const u = U(s, f);
    return { light: "dawn", lake: { lv: 0, hole: 6 + 4 * u, depth: 4, spin: 1 }, rig: { tilt: 0.04 + 0.07 * smooth(u), roll: -0.03 * u, sink: 0.4 * u }, dof: 0, focus: Rg(0, 18, 0),
      cam: wide(move({ pos: Rg(46, 6, -64), look: Rg(0, 20, 0), fov: 56, roll: -0.02 }, { pos: Rg(42, 5, -58), look: Rg(0, 18, 0), fov: 56, roll: -0.09 }, f, s.a, s.b, smooth, 0)), subjects: [["the rig", Rg(0, 22, 0), 3]] }; },
  // the whole rig from the shore at dawn, the crew watching it lean
  rigwide: (s, f) => { const u = U(s, f), c = onGround(40, -92);
    return { light: "dawn", lake: { lv: 0, hole: 12, depth: 6, spin: 1.2 }, rig: { tilt: 0.12 + 0.08 * u, roll: 0.03, sink: 1 + 2 * u }, dof: 0, focus: Rg(0, 20, 0),
      cam: move({ pos: add(c, -6, 2.2, -8), look: Rg(0, 18, 0), fov: 30, roll: 0.03 }, { pos: add(c, -4, 2.0, -7), look: Rg(0, 16, 0), fov: 28, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("pusher", add(c, -1.2, 0, 0), "shock", 0), P("hand2", add(c, 1.2, 0, 0.4), "nervous", 0)], subjects: [["the rig", Rg(0, 18, 0), 3]] }; },
  // he looked around and thought, something is wrong: close on Leonce Viator
  fisherlook: (s, f) => { const fp = onSkiff(-0.6, 0.15);
    return { light: "dawn", lake: { lv: 0, hole: 10, depth: 5, spin: 1.2 }, rig: { tilt: 0.1, sink: 1 }, skiff: [...SKIFF], dof: 2, closeup: true, focus: add(fp, 0, 1.45, 0),
      cam: kick(snap(add(fp, 1.6, 1.6, -3.6), add(fp, 0, 1.45, 0), f, s.a, { fov: 38, roll: -0.05 }, 1.5, 5), f, s.a + T(0.4), 0.7),
      people: [P("fisher", fp, "nervous", 1, { low: true, hw: [add(fp, 0.35, 0.55, -0.55), add(fp, -0.3, 0.55, -0.55)] })] }; },
  // the water was moving, toward one spot: past the skiff, the water starting to turn round the rig
  swirlstart: (s, f) => { const u = U(s, f);
    return { light: "dawn", lake: { lv: 0, hole: 14 + 8 * u, depth: 8, spin: 1.4, pull: 1 }, rig: { tilt: 0.14 + 0.1 * u, sink: 2 + 3 * u }, skiff: [...SKIFF], dof: 0, focus: Rg(0, 4, 0),
      cam: move({ pos: Lk(SKIFF[0] - 9, 3.4, SKIFF[1] - 19), look: Lk((SKIFF[0] + HOLE.x) / 2, 3, (SKIFF[1] + HOLE.z) / 2), fov: 34, roll: 0.04 }, { pos: Lk(SKIFF[0] - 8.5, 3.6, SKIFF[1] - 21), look: Lk((SKIFF[0] + HOLE.x) / 2, 2, (SKIFF[1] + HOLE.z) / 2), fov: 32, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("fisher", onSkiff(-0.6, 0.15), "shock", 1, { low: true }), P("nephew", onSkiff(1.0, -0.1), "shock", 0, { low: true })], subjects: [["the turning water", Rg(-14, 0, -22), 4]] }; },
  // they pointed their little boat at the shore: the skiff running for the bank
  flee: (s, f) => { const u = U(s, f), x = SKIFF[0] - 40 * u, z = SKIFF[1] - 70 * u, yaw = 2.1, c = Math.cos(yaw), sn = Math.sin(yaw), on = (lx: number, lz: number): V3 => Lk(x + lx * c + lz * sn, 0.02, z - lx * sn + lz * c);
    return { light: "dawn", lake: { lv: 0, hole: 20, depth: 10, spin: 1.5 }, rig: { tilt: 0.3, sink: 6 }, skiff: [x, z, yaw], dof: 0, focus: on(0, 0),
      cam: move({ pos: Lk(x - 20, 5, z - 28), look: on(0, 0), fov: 34, roll: 0.05 }, { pos: Lk(x - 14, 4, z - 22), look: on(0, 0), fov: 34, roll: -0.04 }, f, s.a, s.b, smooth, 0),
      people: [P("fisher", on(-1.8, 0), "nervous", 0, { low: true }), P("nephew", on(0.8, 0), "shock", 0, { low: true })],
      puffs: [0, 1, 2, 3].map((i) => ({ p: on(-3.2 - i * 1.4, 0.3 * Math.sin(i * 2)), s: 1.2 + i * 0.6, c: [0.95, 0.96, 0.97] as [number, number, number], a: 0.6 - i * 0.12 })) }; },
  // water coming into the mine: wider, the jet and the room filling
  pour2: (s, f) => far(R("pour")(s, f), 1.5),
  // Randy LaSalle drove round the far corners: the foreman by the loader in a side drift, waving men out
  loader: (s, f) => { const c = Mn(30, 0, -36);
    return { light: "mine", mine: { front: -50, level: 0.08 }, dof: 1, focus: add(c, 0, 1.5, 0), key: Mn(34, 12.6, -34),
      cam: move({ pos: add(c, -4, 1.9, 9), look: add(c, 0, 1.6, 0), fov: 44, roll: 0.04 }, { pos: add(c, -3, 1.8, 8), look: add(c, 0, 1.6, 0), fov: 44, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("foreman", c, "stern", 1, { wave: 1 }), P("m5", add(c, 3.2, 0, -2.5), "shock", -1), P("m6", add(c, 4.4, 0, -3.6), "nervous", -1)], subjects: [["the foreman", add(c, 0, 1.5, 0), 0.4]] }; },
  // some had to get past water on the lower level: men wading toward the shaft, the water rising
  wade: (s, f) => { const u = U(s, f), lv = 0.3 + 0.3 * u;
    return { light: "mine", mine: { front: 30, level: lv }, dof: 1, focus: Mn(0, 1.5, 10), key: Mn(0, 12.6, 14),
      cam: move({ pos: Mn(1.5, 1.6, 24), look: Mn(0, 1.2, 4), fov: 46, roll: -0.04 }, { pos: Mn(1.2, 1.5, 22), look: Mn(0, 1.2, 4), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("m7", Mn(-1.2, 0, 12 - 4 * u), "nervous", 0, { low: true }), P("m8", Mn(1.0, 0, 8 - 4 * u), "stern", 0, { low: true }), P("m4", Mn(-0.4, 0, 4 - 4 * u), "nervous", 0, { low: true })], subjects: [["the miners", Mn(0, 1.4, 8), 0.4]] }; },
  // they went up, eight at a time: the cage rising out of the room
  eight2: (s, f) => { const u = U(s, f), up = 0.6 + 3 * u;
    return { light: "mine", mine: { gate: 1, cageY: up, front: 20, level: 0.2 }, dof: 1, focus: Mn(CAGE.x, 1.6 + up, CAGE.z), key: Mn(0, 12.6, END_Z - 6),
      cam: move({ pos: Mn(CAGE.x - 2, 1.4, CAGE.z - 9), look: Mn(CAGE.x, 3 + up * 0.6, CAGE.z), fov: 46, roll: -0.03 }, { pos: Mn(CAGE.x - 1.6, 1.2, CAGE.z - 8), look: Mn(CAGE.x, 4 + up * 0.7, CAGE.z), fov: 48, roll: 0.03 }, f, s.a, s.b, smooth, 0),
      people: inCage((i) => (i % 2 ? "relief" : "nervous"), 0.15 + up), subjects: [["the cage", Mn(CAGE.x, 1.4 + up, CAGE.z), 0.4]] }; },
  // a quarter of a mile wide: high and wide over the whirlpool
  entire2: (s, f) => { const hole = 74;
    return { light: "morn", lake: { lv: 0, hole, depth: 40, spin: 0.6 }, rig: null, barges: BARGES.map((b, i) => sucked(b, 0.5 + 0.03 * i, hole, 40)), tug: null, dof: 0, focus: Lk(HX, -8, HZ),
      cam: orbit(s, f, Lk(HX, -10, HZ), [150, 170], [300, 280], [220, 200], 40, [0.04, -0.03]), subjects: [["the whirlpool", Lk(HX, -6, HZ), 6]] }; },
  // air forced out of the mine: geysers out of the shaft by the headframe
  geyser: (s, f) => { const tn = tt(s, f), c = Lk(HEADFRAME.x, PADY, HEADFRAME.z);
    return { light: "morn", lake: { lv: -1.5, hole: 85, depth: 40, spin: 0.7, crater: true }, rig: null, tug: null, barges: none, slump: 1, dof: 0, focus: add(c, 0, 20, 0),
      cam: kick(move({ pos: add(c, -40, 6, -70), look: add(c, 0, 22, 0), fov: 38, roll: 0.04 }, { pos: add(c, -34, 5, -62), look: add(c, 0, 26, 0), fov: 40, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, s.a + T(0.3), 1.2),
      puffs: Array.from({ length: 24 }, (_, i) => { const u = (tn * 0.6 + i / 24) % 1; return { p: add(c, (i % 3 - 1) * 1.5 + 4 * u * Math.sin(i), 2 + 60 * u, (i % 2 ? 1 : -1) * 1.2), s: 3 + 14 * u, c: (i % 4 ? [0.94, 0.95, 0.96] : [0.8, 0.76, 0.7]) as [number, number, number], a: 0.85 * (1 - u) }; }),
      subjects: [["the headframe", add(c, 0, 14, 0), 2]] }; },
  // today, wide: the calm salt lake, the island, the chimney small in the water
  todaywide: (s, f) => ({ light: "today", today: true, lake: { lv: 0, crater: true }, rig: null, tug: null, barges: none, slump: 1, dof: 0, focus: Lk(150, 4, 140),
    cam: move({ pos: Lk(-30, 14, -90), look: Lk(150, 4, 140), fov: 36, roll: 0.02 }, { pos: Lk(-10, 12, -84), look: Lk(160, 4, 150), fov: 36, roll: -0.02 }, f, s.a, s.b, smooth, 0) }),
  // the brick chimney, close, low over the water
  chimney: (s, f) => ({ light: "today", today: true, lake: { lv: 0, crater: true }, rig: null, tug: null, barges: none, slump: 1, dof: 0, focus: Lk(CHIMNEY.x, 4, CHIMNEY.z),
    cam: move({ pos: Lk(CHIMNEY.x - 10, 1.4, CHIMNEY.z - 22), look: Lk(CHIMNEY.x, 5, CHIMNEY.z), fov: 40, roll: -0.04 }, { pos: Lk(CHIMNEY.x - 7, 1.2, CHIMNEY.z - 18), look: Lk(CHIMNEY.x, 5, CHIMNEY.z), fov: 40, roll: 0.03 }, f, s.a, s.b, smooth, 0),
    subjects: [["the chimney", Lk(CHIMNEY.x, 6, CHIMNEY.z), 1]] }),
  // the subscribe ask at the end: the lake today from the shore, calm
  calm2: (s, f) => { const c = onGround(-30, -96);
    return { light: "today", today: true, lake: { lv: 0, crater: true }, rig: null, tug: null, barges: none, slump: 1, dof: 0, focus: Lk(100, 6, 150),
      cam: move({ pos: add(c, -2, 2.2, -6), look: Lk(100, 6, 150), fov: 40, roll: 0.02 }, { pos: add(c, 2, 2.4, -5), look: Lk(110, 6, 150), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("local1", add(c, 1.2, 0, 0), "smile", 0), P("local2", add(c, -1.0, 0, 0.3), "smile", 0)] }; },
  // the thumbnail: the rig going over into the whirlpool, low and dramatic
  thumb: () => ({ light: "dawn", lake: { lv: 0, hole: 52, depth: 30, spin: 0.7 }, rig: { tilt: 0.42, roll: 0.12, sink: 6, dz: 2 }, barges: BARGES.map((b, i) => (i === 1 ? sucked(b, 0.15, 52, 30) : i === 4 ? sucked(b, 0.45, 52, 30) : i === 7 ? sucked(b, 0.3, 52, 30) : null)), dof: 0, focus: Rg(0, 8, 0),
    cam: { pos: Rg(30, 22, -84), look: Rg(24, 8, 4), fov: 40, roll: -0.05 } }),
};
void RC; void BREACH; void MINERS; void home; void mistAt; void expo; void TUGQ;

export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0026 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.19 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.15 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.11 + 2.1 * id)] } };
};
const WHIP = new Set(["off", "mine", "jam", "bit", "coming", "whirl", "gone", "canal", "pop", "today", "flee", "geyser"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
