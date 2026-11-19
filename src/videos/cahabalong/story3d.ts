// The Cahaba long-form's 3D shots: the Cahaba Short's sets, cast and props (../cahaba), re-shot for 16:9.
// Short specs are reused through R(): the camera's vertical field of view is narrowed so the framing matches the
// portrait shot's width. Shots of its own are written out below with the same house kit (move/orbit/snap/kick).
// As in the Short, nobody hurt is ever shown.
import { SPECS as FS, St3, Cam, ShotDef as FShot, V3, smooth, expo, move, orbit, snap, kick, secs, U, P, add, breath, ride, BANK3, ON_SPAN, TKEY, clamp01 } from "../cahaba/story";
import { FPS, Gg, Tw, Of, H, RIM_L, DESK, carPose } from "../cahaba/place";
import { ShotDef } from "./timeline";

const T = (k: number) => Math.round(k * FPS);
/** portrait -> landscape: keep roughly the portrait frame's width of view */
const vfov = (v: number) => (2 * Math.atan(0.74 * Math.tan((v * Math.PI) / 360)) * 180) / Math.PI;
const wide = (c: Cam): Cam => ({ ...c, fov: vfov(c.fov) });
const asF = (s: ShotDef): FShot => ({ id: s.id, g: s.g, a: s.a, b: s.b, k: "3d" });
/** a Short spec, re-shot for 16:9. Its word-timed kicks belong to the Short's narration, so they are dropped
 *  (the Short's spec is asked for the camera at a frame where no kick fires) and one is added at `kickAt` seconds. */
const R = (k: string, kickAt?: number, mod?: (st: St3, s: ShotDef, f: number) => St3) => (s: ShotDef, f: number): St3 => {
  const st = FS[k](asF(s), f), c = kickAt === undefined ? st.cam : kick(st.cam, f, s.a + T(kickAt), 0.9), w = { ...st, cam: wide(c) };
  return mod ? mod(w, s, f) : w;
};
const tt = (s: ShotDef, f: number) => secs(f - s.a);
const far = (st: St3, k: number): St3 => ({ ...st, cam: { ...st.cam, pos: [st.cam.look[0] + (st.cam.pos[0] - st.cam.look[0]) * k, st.cam.look[1] + (st.cam.pos[1] - st.cam.look[1]) * k, st.cam.look[2] + (st.cam.pos[2] - st.cam.look[2]) * k] as V3 } });

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  hook: R("hook"), reward: R("reward", 0.3), gang: R("gang"), never: R("never", 0.4),
  gave: (s, f) => { const u = U(asF(s), f), fall = 0.5 * clamp01((u - 0.25) / 0.75) ** 1.6;
    return { light: "morn", train: { x: ON_SPAN, fall, locked: true }, dof: 0, focus: Gg(10, H - 6, 0),
      cam: kick(move({ pos: Gg(20, H - 4, -78), look: Gg(14, H - 7, 0), fov: 36, roll: 0.03 }, { pos: Gg(15, H - 9, -72), look: Gg(12, H - 11, 0), fov: 38, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, s.a + Math.round(0.25 * (s.b - s.a)), 1.5) }; },
  drop: R("drop", 0.1), splash: R("splash", 0.05), jump: R("jump", 0.2), lived: R("lived"), dead: R("dead"),
  papers: R("papers"), fiends: R("fiends", 0.2), rail: R("rail", 0.5), three: R("three"), posted: R("posted"),
  locals: R("locals"), doubt: R("doubt", 0.3), miners: R("miners"), help: R("help"),
  letter: R("letter"), pay: R("pay", 0.4), tells: R("tells"), did: R("did", 0.3),
  young: R("young"), archive: R("archive"), records: R("records", 0.3), errors: R("errors", 0.5), story: R("story", 0.4),
  nothing: R("nothing"), everyone: R("everyone", 0.6),
  train: R("train"), bridge: R("bridge"), height: R("height"), river: R("river"), families: R("families"),
  ahead: R("ahead", 0.6), wheels: R("wheels"), lever: R("lever", 0.5),
  // ---------------- the long-form's own ----------------
  // the whole crossing again, from the other bank, slowly
  youngb: (s, f) => ({ light: "morn", dof: 0, focus: Gg(8, H - 5, 0),
    cam: orbit(asF(s), f, Gg(10, 14, 0), [-14, 4], [96, 88], [2, 6], 34, [0.03, -0.02]) }),
  // a coal town's main street by day
  townwide: (s, f) => ({ light: "townD", poster: "none", dof: 0, focus: Tw(4, 2, 2),
    cam: move({ pos: Tw(-9, 2.2, -13), look: Tw(5, 2.2, 3), fov: 36, roll: 0.03 }, { pos: Tw(-5, 1.9, -11), look: Tw(6, 2.4, 3), fov: 34, roll: -0.02 }, f, s.a, s.b, smooth, 0),
    people: [P("m2", Tw(3.2, 0, -1.6), "neutral", 1), P("wife2", Tw(4.4, 0, -1.2), "smile", -1), P("kid", Tw(5.3, 0, -1.9), "grin", -1)] }),
  townwide2: (s, f) => ({ light: "townD", poster: "none", dof: 0, focus: Tw(15, 2.5, 3),
    cam: move({ pos: Tw(6, 1.7, -12), look: Tw(15, 3.0, 3), fov: 34, roll: -0.03 }, { pos: Tw(9, 1.9, -10), look: Tw(15, 3.2, 3), fov: 32, roll: 0.02 }, f, s.a, s.b, smooth, 0),
    people: [P("m1", Tw(12.6, 0, 0.6), "neutral", 1), P("m3", Tw(13.8, 0, 0.9), "smile", -1)] }),
  // the whole train, side on, running along the trestle
  consist: (s, f) => { const u = U(asF(s), f), x = 96 - 26 * u;
    return { light: "morn", train: { x, speed: 9 }, dof: 0, focus: Gg(x + 22, H + 2, 0),
      cam: move({ pos: Gg(x + 20, H + 3.5, -44), look: Gg(x + 22, H + 1.5, 0), fov: 30, roll: 0.02 }, { pos: Gg(x + 16, H + 2.5, -40), look: Gg(x + 21, H + 1.5, 0), fov: 30, roll: -0.02 }, f, s.a, s.b, (v) => v, 0) }; },
  // men and timber: the same line, a train standing on it (the second wreck is told, not shown)
  consist2: (s, f) => ({ light: "dusk", train: { x: 110, locked: true }, dof: 0, focus: Gg(128, H + 2, 0),
    cam: move({ pos: Gg(96, H + 2.2, -9), look: Gg(122, H + 2.2, 0), fov: 40, roll: 0.04 }, { pos: Gg(99, H + 1.8, -8), look: Gg(122, H + 2.4, 0), fov: 38, roll: -0.03 }, f, s.a, s.b, smooth, 0) }),
  // the river at water level: shallow, stony
  shallow: (s, f) => ({ light: "morn", dof: 0, focus: Gg(0, 0.2, 10),
    cam: move({ pos: Gg(-3, 0.9, -34), look: Gg(1, 0.6, 0), fov: 38, roll: 0.03 }, { pos: Gg(-1, 0.7, -28), look: Gg(1, 2.5, 0), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0) }),
  // the timber trestle at the end of the iron
  trestle: (s, f) => ({ light: "morn", dof: 0, focus: Gg(60, H - 8, 0),
    cam: orbit(asF(s), f, Gg(60, H - 9, 0), [30, 14], [44, 38], [-8, -4], 38, [0.04, -0.03]) }),
  trestle2: (s, f) => ({ light: "morn", dof: 0, focus: Gg(64, H - 10, 0),
    cam: move({ pos: Gg(58, 12, -14), look: Gg(66, H - 4, 0), fov: 44, roll: -0.05 }, { pos: Gg(56, 10, -16), look: Gg(66, H - 2, 0), fov: 46, roll: 0.03 }, f, s.a, s.b, smooth, 0) }),
  // Frank White at the throttle, calm
  white: (s, f) => { const u = U(asF(s), f), x = 70 - 8 * u, p = ride(x, 0, 3.0, 0.1, 1.3);
    return { light: "morn", train: { x, speed: 9 }, cab: true, dof: 2, closeup: true, focus: add(p, 0, 1.5, 0),
      cam: move({ pos: add(p, -2.2, 1.9, -6.6), look: add(p, -0.3, 1.45, 0), fov: 24, roll: 0.03 }, { pos: add(p, -1.6, 1.7, -6.0), look: add(p, -0.2, 1.45, 0), fov: 23, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("engineer", p, "smile", -1, { low: true }), P("fireman", ride(x, 0, 4.0, 0.5, 1.3), "neutral", -1, { low: true })] }; },
  white2: (s, f) => { const u = U(asF(s), f), x = 40 - 3 * u, p = ride(x, 0, 3.0, 0.1, 1.3);
    return { light: "morn", train: { x, speed: 9 }, cab: true, dof: 2, closeup: true, focus: add(p, 0, 1.5, 0),
      cam: kick(snap(add(p, -1.4, 1.7, -5.4), add(p, -0.1, 1.5, 0), f, s.a, { fov: 22, roll: -0.04 }, 1.5, 5), f, s.a + T(0.5), 0.8),
      people: [P("engineer", p, tt(s, f) > 0.5 ? "shock" : "stern", -1, { low: true })] }; },
  wheels2: R("wheels", 0.2, (st) => far(st, 1.5)),
  // the Hanburys at a coach window: the conductor off duty, his wife, their two children
  hanbury: (s, f) => { const u = U(asF(s), f), x = 60 - 6 * u, c = carPose(x, 4, 0).p, cx = c[0];
    return { light: "morn", train: { x, speed: 6 }, dof: 1, focus: Gg(cx, H + 2.5, -1.3),
      cam: move({ pos: Gg(cx + 1.4, H + 2.9, -9.6), look: Gg(cx, H + 2.35, -1.3), fov: 22, roll: 0.02 }, { pos: Gg(cx - 1.0, H + 2.6, -9.0), look: Gg(cx, H + 2.35, -1.3), fov: 22, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("conductor", ride(x, 4, 0.65, -0.8, 1.1), "smile", -1, { low: true }), P("ora", ride(x, 4, -0.5, -0.8, 1.1), "smile", 1, { low: true }), P("kid", ride(x, 4, 1.85, -0.95, 1.72), "grin", -1, { low: true }), P("girl", ride(x, 4, -1.75, -0.95, 1.72), "laugh", 1, { low: true })] }; },
  lived2: (s, f) => { const p = Gg(14.4, 0.64, -9.2);
    return { light: "morn", wreck: true, dof: 1, focus: add(p, 0, 1.3, 0), cam: orbit(asF(s), f, add(p, 0, 1.2, 0), [-30, -6], [8.5, 7.5], [0.5, 0.3], 30, [0.03, -0.02]),
      people: [P("fireman", p, "relief", 1, { sling: true, hw: [add(p, -0.1, 1.0, -0.14)] })], puffs: breath(add(p, 0, 1.45, 0), tt(s, f)) }; },
  // the coaches were heated by stoves: a coach standing at the rim, its windows glowing
  coach: (s, f) => { const x = 104, c = carPose(x, 3, 0).p;
    return { light: "dusk", train: { x, locked: true }, dof: 1, focus: Gg(c[0], H + 2.4, -1.3),
      cam: move({ pos: Gg(c[0] + 5, H + 2.2, -11), look: Gg(c[0], H + 2.3, -1.3), fov: 30, roll: 0.03 }, { pos: Gg(c[0] + 2, H + 2.4, -9), look: Gg(c[0], H + 2.3, -1.3), fov: 28, roll: -0.02 }, f, s.a, s.b, smooth, 0) }; },
  // the wreck on fire in the river, evening coming on
  burn: (s, f) => ({ light: "dusk", wreck: true, dof: 0, focus: Gg(4, 8, 0),
    cam: kick(move({ pos: Gg(-8, 3, -46), look: Gg(4, 7, 0), fov: 40, roll: 0.04 }, { pos: Gg(-4, 6, -52), look: Gg(4, 10, 0), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0), f, s.a + 2, 0.8) }),
  burn2: (s, f) => ({ light: "dusk", wreck: true, dof: 0, focus: Gg(6, 14, 0),
    cam: orbit(asF(s), f, Gg(8, 14, 0), [10, -6], [88, 80], [0, 6], 36, [0.03, -0.03]) }),
  // a farmer on the rim, looking at the gap
  farmer: (s, f) => { const p = Gg(RIM_L + 6, H, -5.5);
    return { light: "morn", wreck: true, dof: 1, focus: add(p, 0, 1.4, 0),
      cam: move({ pos: add(p, 4.5, 2.0, -7.5), look: add(p, -6, 0.6, 3), fov: 40, roll: 0.03 }, { pos: add(p, 3.5, 1.8, -6.5), look: add(p, -8, 0.2, 3), fov: 42, roll: -0.03 }, f, s.a, s.b, smooth, 0),
      people: [P("farmer", p, tt(s, f) > 0.6 ? "shock" : "nervous", -1)] }; },
  // no trace of the three men: the same bank at dusk, nobody on it
  empty: (s, f) => ({ light: "dusk", wreck: true, dof: 1, focus: Gg(14.7, 1.4, -4.6),
    cam: move({ pos: Gg(-7.5, 1.7, -27), look: Gg(14.7, 1.35, -4.7), fov: 13, roll: 0.03 }, { pos: Gg(-5.5, 1.6, -25), look: Gg(14.7, 1.35, -4.7), fov: 11.5, roll: -0.02 }, f, s.a, s.b, smooth, 0) }),
  three2: (s, f) => ({ light: "dusk", wreck: true, dof: 1, focus: Gg(14.7, 1.4, -4.6),
    cam: orbit(asF(s), f, Gg(14.7, 1.2, -4.7), [-26, -8], [9, 8], [0.5, 0.4], 30, [0.03, -0.03]), people: BANK3.map(([w, p], i) => P(w, p, "stern", i === 0 ? 1 : -1)) }),
  letter2: R("letter", undefined, (st) => far(st, 0.75)),
  // the company's lawyers point to wreckers: the lawyer at the desk, a finger on the newspaper
  tells2: (s, f) => { const p = Of(0.3, 0, DESK.z + 0.85), np = Of(0.25, DESK.y + 0.42, DESK.z - 0.2);
    return { light: "rr", dof: 2, focus: Of(0.3, 1.2, DESK.z), key: Of(-0.7, 1.4, 1.0), news: [{ p: np, head: "did", s: 1.1, tilt: -0.5 }],
      cam: move({ pos: Of(-1.6, 1.7, -2.6), look: Of(0.3, 1.15, DESK.z), fov: 30, roll: 0.03 }, { pos: Of(-1.0, 1.5, -2.2), look: Of(0.3, 1.15, DESK.z), fov: 28, roll: -0.02 }, f, s.a, s.b, smooth, 0),
      people: [P("lawyer", p, "smile", 0, { low: true, hw: [add(np, 0.28, 0.1, 0)] })] }; },
  // today: only the stone piers stand in the river
  piers: (s, f) => ({ light: "today", ruin: true, dof: 0, focus: Gg(0, 10, 0), cam: orbit(asF(s), f, Gg(8, 11, 0), [18, 2], [84, 74], [0, 4], 36, [0.03, -0.02]) }),
  piers2: (s, f) => ({ light: "today", ruin: true, dof: 0, focus: Gg(-17, 12, 0),
    cam: move({ pos: Gg(-4, 1.2, -26), look: Gg(-14, 13, 0), fov: 46, roll: -0.04 }, { pos: Gg(-6, 1.0, -22), look: Gg(-15, 16, 0), fov: 48, roll: 0.03 }, f, s.a, s.b, smooth, 0) }),
  // the thumbnail: the hole in the bridge, smoke, the reward notice is added by the thumbnail script
  thumb: () => ({ light: "morn", wreck: true, dof: 0, focus: Gg(8, 16, 0), cam: { pos: Gg(30, 9, -70), look: Gg(4, 15, 0), fov: 36, roll: 0.03 } }),
};
void expo; void TKEY;

/** hand-held sway on every shot */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0026 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
const WHIP = new Set(["train", "gave", "papers", "three", "locals", "miners", "letter", "archive", "piers", "burn", "townwide"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
