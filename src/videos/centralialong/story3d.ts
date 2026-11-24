// The Centralia long-form's 3D shots: the Short's five sets and cast (../centralia), re-shot for 16:9.
// Short specs are reused through R(): the shot is played on the Short's own clock (so a kick or a fire that the Short
// timed to its words lands at the same moment after the cut), and the camera's vertical field of view is narrowed so the
// framing keeps roughly the portrait shot's width. sync moves one Short moment onto one word of this narration.
// The long-form's own shots are written for 16:9 directly (no narrowing). Cameras sit on the -z side looking toward +z
// (world +x is screen LEFT). Nobody is shown hurt.
import { SPECS as FS, SHOTS as SSH, St3, Cam, ShotDef as FShot, V3, clamp01, smooth, L3, move, orbit, kick, secs, P, walker, add, vent, roadSmoke, PORCH } from "../centralia/story";
import { wordAt as SW } from "../centralia/timeline";
import { Tw, Pt, Mn, Yd, Rm, HOLD, HEAP, HOLE, HOLE_R, GAS, OPENING, ROOM, crackZ } from "../centralia/place";
import { pitGround } from "../centralia/csets";
import { ShotDef, wordAt } from "./timeline";

const vfov = (v: number) => (2 * Math.atan(0.74 * Math.tan((v * Math.PI) / 360)) * 180) / Math.PI;
const wide = (c: Cam): Cam => ({ ...c, fov: vfov(c.fov) });
/** a Short spec, re-shot for 16:9 on the Short's clock; sync() = [this film's frame, the Short's frame] to line up */
const R = (k: string, mod?: (st: St3, s: ShotDef, f: number) => St3, sync?: () => [number, number]) => (s: ShotDef, f: number): St3 => {
  const S = SSH.find((x) => x.g === k)!, [lf, sf] = sync ? sync() : [s.a, S.a], off = sf - lf;
  const s2: FShot = { id: s.id, g: k, a: s.a + off, b: s.b + off, k: "3d" }, st = FS[k](s2, f + off), w = { ...st, cam: wide(st.cam) };
  return mod ? mod(w, s, f) : w;
};
const tt = (s: ShotDef, f: number) => secs(f - s.a);
/** pull the camera back (k > 1) along its line of sight */
const far = (st: St3, k: number): St3 => ({ ...st, cam: { ...st.cam, pos: L3(st.cam.look, st.cam.pos, k) } });
/** re-aim: tilt the look point by dy (m), or replace the subjects */
const tilt = (dy: number) => (st: St3): St3 => ({ ...st, cam: { ...st.cam, look: [st.cam.look[0], st.cam.look[1] + dy, st.cam.look[2]] as V3 } });
const subj = (sb: [string, V3, number][]) => (st: St3): St3 => ({ ...st, subjects: sb });
const HOUSE_FRONT: V3 = Tw(HOLD[0].x, 3.2, HOLD[0].z - 3.0);
const mv = (s: ShotDef, f: number, a: Partial<Cam> & { pos: V3; look: V3 }, b: Partial<Cam> & { pos: V3; look: V3 }) => move(a, b, f, s.a, s.b, smooth, 0);

const SW0 = 0.14; // sidewalk height
const SMOKE: [number, number, number] = [0.72, 0.72, 0.74], STEAM: [number, number, number] = [0.94, 0.95, 0.98], GASC: [number, number, number] = [0.7, 0.74, 0.66];
const HEAPC: V3 = Pt(HEAP[0], HEAP[1] + 0.9, HEAP[2]), FLOOR = HEAP[1];
const pgy = (lx: number, z: number) => pitGround(Pt(lx, 0, 0)[0], z);
const OPEN: V3 = Pt(OPENING[0], pgy(OPENING[0], OPENING[1]), OPENING[1]);
const CAP: V3 = Tw(GAS.x - 3.4, 0.18, 9.4); // one of the station's underground tank fill caps
const CODD: V3 = Tw(GAS.x - 3.2, 0.16, 9.95);
/** the yard after the hole opened: Todd in it, holding the roots */
const TODD_IN: V3 = Yd(HOLE[0], -1.05, HOLE[2] + 0.05), ROOT_L: V3 = Yd(HOLE[0] - HOLE_R * 0.9 + 0.1, -0.42, HOLE[2] + 0.18), ROOT_R: V3 = Yd(HOLE[0] - HOLE_R * 0.9, -0.22, HOLE[2] - 0.2);
/** a few smoke vents along the closed stretch of Route 61 (the graffiti road) */
const grafSmoke = (t0: number) => [26, 30.5, 35, 39].flatMap((x, i) => vent(Tw(x, 0.1, 0.5 * Math.sin(x)), t0, 3, 3.0, 0.4, 2.0, 0.4, SMOKE, 0.5, i + 3));

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  hook: R("hook"), years: R("years", (st) => subj([["the crack", Tw(2.2, 0.35, crackZ(2.2)), 0.4]])(st)), burning: R("burning"), under: R("under"), zip: R("zip"),
  tunnels: R("tunnels"), street: R("street"), council: R("council", tilt(-0.3)), dump: R("dump"), five: R("five"), heap: R("heap"), heap2: R("heap"),
  light: R("light"), light2: R("light"), hose: R("hose"), back: R("back"), reach: R("reach"), pitwide: R("pitwide"),
  under2: R("fire"), trench: R("trench"), flush: R("flush"), nothing: R("nothing"), yards: R("yards"), cellar: R("cellar"),
  boy: R("boy"), todd: R("todd"), fell: R("fell"), cousin: R("cousin", (st) => tilt(-0.1)(far(st, 1.4))), deep: R("deep"),
  money: R("money"), boxes: R("boxes"), houses: R("houses"), refused: R("refused"), refused2: R("refused", (st) => far(st, 1.35)),
  stay: R("stay", (st) => subj([["their house", HOUSE_FRONT, 1]])(st)), route: R("years", (st) => subj([["the crack", Tw(2.2, 0.35, crackZ(2.2)), 0.4]])(far(st, 1.15))), five2020: R("five2020"), fire: R("fire"),
  // the ground gives way on this narration's "gave"
  open: R("open", tilt(-0.3), () => [wordAt(28, "gave"), SW(6, "open")]),

  // ---------------- the long-form's own ----------------
  // Almost everyone who lived there is gone: the main street today, empty, smoke along the crack
  emptystreet: (s, f) => ({ light: "townT", dof: 0.6, focus: Tw(0, 1.2, 6), puffs: roadSmoke(tt(s, f)),
    cam: mv(s, f, { pos: Tw(18, 2.4, -9.5), look: Tw(-4, 1.8, 8), fov: 38, roll: 0.03 }, { pos: Tw(15, 2.2, -8.6), look: Tw(-5, 1.8, 8), fov: 38, roll: -0.02 }),
    subjects: [["the empty street", Tw(0, 1.0, 5), 4]] }),
  // The streets are still there, with nothing on them: the same road from its other end
  emptystreet2: (s, f) => ({ light: "townT", dof: 0.6, focus: Tw(2, 1.2, 4), puffs: roadSmoke(tt(s, f), 0.8),
    cam: mv(s, f, { pos: Tw(-20, 2.4, -8.5), look: Tw(6, 1.6, 7), fov: 38, roll: -0.03 }, { pos: Tw(-17.5, 2.2, -7.6), look: Tw(6, 1.6, 7), fov: 38, roll: 0.02 }),
    subjects: [["the empty street", Tw(0, 1.0, 5), 4]] }),
  // The houses are gone: grass lots where they stood, low along the far side
  lots: (s, f) => ({ light: "townT", dof: 0.8, focus: Tw(-31, 0.8, 12),
    cam: mv(s, f, { pos: Tw(-17, 1.5, 0.5), look: Tw(-31, 1.2, 12), fov: 36, roll: 0.03 }, { pos: Tw(-19, 1.5, 0.8), look: Tw(-32, 1.2, 12), fov: 36, roll: -0.02 }),
    subjects: [["the empty lots", Tw(-31, 0.5, 12), 5]] }),
  // ...one by one, the houses came down: the near side's lots, the camera drifting along them
  lots2: (s, f) => ({ light: "townT", dof: 0.8, focus: Tw(36, 0.8, 12),
    cam: mv(s, f, { pos: Tw(25, 3.2, 0), look: Tw(37, 2.2, 13), fov: 30, roll: -0.03 }, { pos: Tw(28.5, 3.2, 0), look: Tw(40.5, 2.2, 13), fov: 30, roll: 0.02 }),
    subjects: [["the empty lots", Tw(38, 0.5, 12), 5]] }),
  // When they're gone, the state gets the land: the holdouts' house alone among the lots, high and wide
  lots3: (s, f) => ({ light: "townT", dof: 0.5, focus: Tw(HOLD[0].x, 2.5, HOLD[0].z), puffs: roadSmoke(tt(s, f), 0.7),
    cam: mv(s, f, { pos: Tw(HOLD[0].x - 6, 4.5, -12), look: Tw(HOLD[0].x + 2, 2.4, HOLD[0].z), fov: 38, roll: 0.02 }, { pos: Tw(HOLD[0].x - 8, 6.5, -15), look: Tw(HOLD[0].x + 2, 2.4, HOLD[0].z), fov: 40, roll: -0.02 }),
    subjects: [["their house", HOUSE_FRONT, 3]] }),
  // For a hundred years, miners dug anthracite: two miners walking out of the dark tunnel toward us, picks on their shoulders
  miners: (s, f) => { const t0 = tt(s, f), p1 = Mn(0.55, 0, 6.6 - 0.8 * t0), p2 = Mn(-0.55, 0, 7.6 - 0.8 * t0);
    const pk = (p: V3, sx: number) => ({ g: add(p, 0.22 * sx, 1.32, -0.12), b: add(p, 0.5 * sx, 1.95, 0.35) });
    const a = pk(p1, 1), b = pk(p2, -1);
    return { light: "mineC", dof: 1, focus: add(p1, 0, 1.4, 0), key: add(p1, 0, 2.1, -0.6),
      people: [P("m1", p1, "neutral", 0, { march: (t0 * 1.4) % 1, hw: [a.g] }), P("m2", p2, "stern", 0, { march: (t0 * 1.4 + 0.5) % 1, hw: [b.g] })],
      tools: [{ kind: "pick", g: a.g, b: a.b }, { kind: "pick", g: b.g, b: b.b }],
      cam: mv(s, f, { pos: Mn(0.3, 1.5, -2.8), look: Mn(0, 1.3, 6), fov: 38, roll: 0.03 }, { pos: Mn(0.2, 1.45, -2.2), look: Mn(0, 1.3, 6), fov: 38, roll: -0.02 }),
      subjects: [["the miners", add(L3(p1, p2, 0.5), 0, 1.4, 0), 0.8]] }; },
  // ...next to the Odd Fellows Cemetery: from the near rim across the dump to the cemetery fence and its sign
  cemetery: (s, f) => ({ light: "pit", dof: 0.6, focus: Pt(2, pgy(2, 32) + 1.8, 32), puffs: vent(add(HEAPC, 1, 0.5, 0), secs(f), 3, 2, 0.4, 1.2, 0.3, SMOKE, 0.3, 2),
    cam: mv(s, f, { pos: Pt(-1.5, 2.6, 2.2), look: Pt(2, pgy(2, 32) + 1.4, 32), fov: 24, roll: 0.02 }, { pos: Pt(0.5, 2.5, 2.6), look: Pt(2, pgy(2, 32) + 1.6, 32), fov: 21, roll: -0.02 }),
    subjects: [["the cemetery sign", Pt(2, pgy(2, 32) + 2.2, 32), 0.6]] }),
  // What nobody had sealed off was an opening in the wall of that pit: smoke from the heap drifting into it
  opening: (s, f) => { const t0 = tt(s, f);
    return { light: "pit", dof: 1, focus: OPEN, heat: 0.3, key: HEAPC,
      puffs: Array.from({ length: 10 }, (_, i) => { const u = (t0 * 0.25 + i / 10) % 1; return { p: add(L3(add(HEAPC, -0.5, 0.4, 0), OPEN, u), 0.3 * Math.sin(i * 2.1), 0.4 * Math.sin(Math.PI * u), 0), s: 1.1 - 0.6 * u, c: SMOKE, a: 0.55 * Math.sin(Math.PI * u) }; }),
      cam: mv(s, f, { pos: Pt(-1.2, FLOOR + 1.8, 13.2), look: add(OPEN, 0.6, -0.3, 0), fov: 38, roll: 0.03 }, { pos: Pt(-2.6, FLOOR + 1.6, 16.6), look: add(OPEN, 0.2, -0.2, 0), fov: 36, roll: -0.02 }),
      subjects: [["the opening in the wall", OPEN, 0.8]] }; },
  // ...inspectors found deadly carbon monoxide in the mines: two men in the cold tunnel, a thin haze at their feet
  inspect: (s, f) => { const t0 = tt(s, f), p1 = Mn(0.55, 0, 5.2), p2 = Mn(-0.5, 0, 5.9);
    return { light: "mineC", dof: 1, focus: add(p1, 0, 1.4, 0), key: add(p1, 0.2, 2.1, -0.8),
      puffs: [-0.9, 0, 0.9].flatMap((x, i) => vent(Mn(x, 0.05, 6.4 + i * 0.6), t0, 4, 0.9, 0.5, 1.4, 0.4, GASC, 0.1, i)),
      people: [P("w1", p1, "nervous", -1), P("w2", p2, "stern", 1)],
      cam: mv(s, f, { pos: Mn(0.4, 1.5, -1.6), look: Mn(0, 1.2, 6), fov: 36, roll: -0.03 }, { pos: Mn(0.2, 1.45, -0.6), look: Mn(0, 1.2, 6), fov: 36, roll: 0.02 }),
      subjects: [["the two inspectors", add(L3(p1, p2, 0.5), 0, 1.4, 0), 0.8]] }; },
  // And the whole time, people just kept living there: the street, from the other side, people going about their day
  street2: (s, f) => { const t0 = tt(s, f);
    return { light: "town62", dof: 1, focus: Tw(1, 1.4, 5),
      people: [walker("man", 5.2, SW0, 4.7, -0.9, t0, "grin"), walker("kid", 4.4, SW0, 4.4, -0.9, t0, "grin"), P("wife", Tw(-0.6, SW0, 5.2), "laugh", -1), walker("m2", -3.5, SW0, 5.0, 1.0, t0, "neutral")],
      cam: mv(s, f, { pos: Tw(-5.5, 1.7, -3.0), look: Tw(3.5, 1.5, 6), fov: 38, roll: -0.03 }, { pos: Tw(-4.5, 1.6, -2.6), look: Tw(3.5, 1.5, 6), fov: 38, roll: 0.02 }),
      subjects: [["the people", Tw(1.5, 1.4, 5), 2]] }; },
  // in 1979 the mayor, John Coddington, who also ran the gas station: the station, Coddington by his tanks' fill caps
  gas: (s, f) => ({ light: "town62", dof: 0.8, focus: add(CODD, 0, 1.4, 0),
    people: [P("codd", CODD, "neutral", 1)],
    cam: mv(s, f, { pos: Tw(GAS.x - 5.5, 1.8, -2.5), look: Tw(GAS.x - 1.6, 1.9, 9.5), fov: 36, roll: 0.03 }, { pos: Tw(GAS.x - 4.8, 1.75, -1.8), look: Tw(GAS.x - 1.8, 1.9, 9.5), fov: 36, roll: -0.02 }),
    subjects: [["the gas station", Tw(GAS.x, 2.6, 11), 4], ["John Coddington", add(CODD, 0, 1.4, 0), 0.3]] }),
  // ...dipped a stick into one of his underground fuel tanks. It came up hot: close, the stick lifts out, heat off it
  dip: (s, f) => { const t0 = tt(s, f), up = smooth((f - wordAt(21, "came")) / 14), hand = add(CODD, 0.1, 0.95 + 0.35 * up, -0.35), end = add(CAP, 0, -0.55 + 1.0 * up, 0.1 * up);
    return { light: "town62", dof: 1.5, focus: L3(hand, end, 0.6), people: [P("codd", CODD, up > 0.4 ? "shock" : "stern", -1, { hw: [hand], headTilt: 0.18 })],
      tools: [{ kind: "stick", g: hand, b: end }],
      puffs: up > 0.2 ? vent(add(end, 0, 0.05, 0), t0, 3, 0.9, 0.12, 0.45, 0.4 * up, [0.92, 0.92, 0.94], 0.1, 1) : [],
      cam: mv(s, f, { pos: Tw(GAS.x - 3.7, 2.2, 5.0), look: Tw(GAS.x - 3.3, 0.85, 9.5), fov: 40, roll: -0.04 }, { pos: Tw(GAS.x - 3.65, 2.15, 5.3), look: Tw(GAS.x - 3.3, 0.85, 9.5), fov: 39, roll: 0.03 }),
      subjects: [["the stick", L3(hand, end, 0.5), 0.15], ["the fill cap", CAP, 0.1]] }; },
  // He lowered a thermometer down on a string: lower, at the cap, the string going down into the tank
  thermo: (s, f) => { const u = smooth((f - s.a) / Math.max(1, s.b - s.a)), hand = add(CODD, 0.05, 1.0, -0.4), end = add(CAP, 0, -0.2 - 0.8 * u, 0);
    return { light: "town62", dof: 2, focus: add(CAP, 0, 0.3, 0), people: [P("codd", CODD, "stern", -1, { hw: [hand], headTilt: 0.2 })],
      tools: [{ kind: "stick", g: hand, b: end }],
      cam: mv(s, f, { pos: Tw(GAS.x - 4.0, 1.7, 6.0), look: Tw(GAS.x - 3.3, 0.8, 9.5), fov: 44, roll: 0.04 }, { pos: Tw(GAS.x - 3.95, 1.7, 6.2), look: Tw(GAS.x - 3.3, 0.8, 9.5), fov: 43, roll: -0.03 }),
      subjects: [["the fill cap", CAP, 0.1]] }; },
  // By now, families had gas monitors in their homes: the monitor on the cellar wall, its red light on
  monitor: (s, f) => ({ light: "cellar", dof: 1.5, focus: Rm(0.75, 1.5, ROOM.z1), key: Rm(0.4, 2.35, 0.2),
    cam: mv(s, f, { pos: Rm(0.4, 1.45, 1.2), look: Rm(0.75, 1.5, ROOM.z1), fov: 34, roll: 0.03 }, { pos: Rm(0.55, 1.5, 2.0), look: Rm(0.75, 1.5, ROOM.z1), fov: 32, roll: -0.02 }),
    subjects: [["the gas monitor", Rm(0.75, 1.55, ROOM.z1 - 0.02), 0.25]] }),
  // People got headaches and felt dizzy: a man by the monitor, his hand to his head, a little gas round his feet
  dizzy: (s, f) => { const t0 = tt(s, f), p = Rm(-0.3, 0, 1.6);
    return { light: "cellar", dof: 1.5, focus: add(p, 0, 1.5, 0), key: Rm(0.4, 2.35, 0.2),
      puffs: vent(Rm(0.4, 0.02, 0.2), t0, 4, 1.2, 0.4, 1.2, 0.45, GASC, 0.25, 2),
      people: [P("man", p, "dazed", 0, { hw: [add(p, 0.2, 1.68, -0.12)], headTilt: 0.12 })],
      cam: mv(s, f, { pos: Rm(0.6, 1.55, -1.6), look: add(p, 0, 1.4, 0), fov: 34, roll: -0.04 }, { pos: Rm(0.45, 1.5, -1.1), look: add(p, 0, 1.42, 0), fov: 32, roll: 0.03 }),
      subjects: [["the man", add(p, 0, 1.5, 0), 0.2]] }; },
  // But the town couldn't agree: two neighbours on the sidewalk, one pointing, one shaking his head
  argue: (s, f) => { const p1 = Tw(2.0, SW0, 4.9), p2 = Tw(0.9, SW0, 5.0);
    return { light: "town62", dof: 1.2, focus: add(L3(p1, p2, 0.5), 0, 1.4, 0),
      people: [P("man", p1, "stern", -1, { hw: [add(p1, -0.5, 1.35, -0.25)] }), P("holdM", p2, "nervous", 1)],
      cam: mv(s, f, { pos: Tw(1.9, 1.6, 0.8), look: add(L3(p1, p2, 0.5), 0, 1.4, 0), fov: 34, roll: 0.03 }, { pos: Tw(1.2, 1.6, 1.3), look: add(L3(p1, p2, 0.5), 0, 1.4, 0), fov: 32, roll: -0.02 }),
      subjects: [["the two neighbours", add(L3(p1, p2, 0.5), 0, 1.4, 0), 0.6]] }; },
  // His cousin Eric heard him. The steam was so thick he could barely see him: Eric at the lip, peering down
  eric: (s, f) => { const t0 = tt(s, f), e = Yd(HOLE[0] - 0.15, 0, HOLE[2] - 0.95);
    return { light: "yardW", hole: "open", dof: 1, focus: add(e, 0, 1.1, 0.3),
      puffs: [...vent(Yd(HOLE[0] + 0.2, -0.6, HOLE[2] + 0.2), t0, 8, 2.6, 0.5, 1.9, 0.7, STEAM, 0.15, 8), ...vent(Yd(HOLE[0] - 0.2, -0.6, HOLE[2] + 0.4), t0, 5, 2.2, 0.6, 1.6, 0.6, STEAM, 0.1, 9)],
      people: [P("eric", e, "nervous", 1, { headTilt: 0.2 }), P("todd", TODD_IN, "shock", -1, { air: true, hw: [ROOT_L, ROOT_R] })],
      cam: mv(s, f, { pos: Yd(HOLE[0] + 2.4, 1.3, HOLE[2] - 3.8), look: Yd(HOLE[0], 0.75, HOLE[2] - 0.4), fov: 42, roll: -0.04 }, { pos: Yd(HOLE[0] + 2.0, 1.3, HOLE[2] - 3.4), look: Yd(HOLE[0], 0.75, HOLE[2] - 0.4), fov: 40, roll: 0.03 }),
      subjects: [["Eric", add(e, 0, 1.3, 0), 0.2], ["Todd's red cap", add(TODD_IN, 0, 1.75, 0), 0.1]] }; },
  // A boy had almost died in his own family's yard: the steaming hole, the family standing back, the camera pulling away
  yardafter: (s, f) => { const t0 = tt(s, f);
    return { light: "yardW", hole: "open", dof: 0.6, focus: Yd(HOLE[0], 0.4, HOLE[2]),
      puffs: vent(Yd(HOLE[0], -0.5, HOLE[2] + 0.1), t0, 7, 3.0, 0.4, 1.8, 0.6, STEAM, 0.2, 4),
      people: [P("man", Yd(-2.2, 0, 0.2), "shock", 1), P("wife", Yd(-2.9, 0, 0.8), "nervous", 1), P("kid", Yd(-1.6, 0, 0.0), "nervous", 1)],
      cam: mv(s, f, { pos: Yd(HOLE[0] + 1.5, 1.7, HOLE[2] - 6.0), look: Yd(-0.6, 0.8, 1.4), fov: 38, roll: 0.02 }, { pos: Yd(HOLE[0] + 2.4, 2.4, HOLE[2] - 8.6), look: Yd(-0.6, 0.8, 1.4), fov: 40, roll: -0.02 }),
      subjects: [["the sinkhole", Yd(HOLE[0], 0.3, HOLE[2]), 0.6], ["the family", Yd(-2.2, 1.3, 0.3), 1]] }; },
  // Meanwhile, that closed stretch of Route 61: the road beyond the town, its cracks smoking
  route2: (s, f) => ({ light: "townT", dof: 0.5, focus: Tw(32, 0.4, 1), puffs: grafSmoke(tt(s, f)),
    cam: mv(s, f, { pos: Tw(19, 3.0, -8.5), look: Tw(33, 0.3, 1.5), fov: 38, roll: 0.03 }, { pos: Tw(21, 2.7, -8.0), look: Tw(34, 0.3, 1.5), fov: 38, roll: -0.02 }),
    subjects: [["the road", Tw(31, 0.2, 1), 5]] }),
  // People came from all over to spray-paint the cracked, steaming road: low over the painted asphalt, two visitors walk it
  graffiti: (s, f) => { const t0 = tt(s, f), x = 27 + 0.9 * t0;
    return { light: "townT", dof: 0.8, focus: Tw(x + 3, 1.0, 1.6), puffs: grafSmoke(t0),
      people: [walker("r3", 36.5, 0.06, 2.0, -0.7, t0, "grin"), walker("r4", 37.3, 0.06, 2.6, -0.7, t0, "laugh")],
      cam: { pos: Tw(x - 2.2, 1.1, -3.4), look: Tw(x + 3, 0.2, 1.4), fov: 38, roll: 0.03 * Math.sin(t0 * 0.6) },
      subjects: [["the graffiti", Tw(x + 2, 0.1, 0.5), 2], ["the visitors", Tw(35, 1.2, 2.3), 0.6]] }; },
  // A church still stands on the hill: crane up from the empty road to the church above the trees
  church: (s, f) => ({ light: "townT", dof: 0.4, focus: Tw(-6, 12, 74), puffs: roadSmoke(tt(s, f), 0.6).filter((_, i) => i % 2 === 0),
    cam: mv(s, f, { pos: Tw(-2, 1.8, -2), look: Tw(-6, 10, 74), fov: 30, roll: 0.02 }, { pos: Tw(-3.5, 7, 6), look: Tw(-6, 12.5, 74), fov: 28, roll: -0.02 }),
    subjects: [["the church", Tw(-6, 13, 74), 4]] }),
  // ...tell me in the comments: the smoking road, wide, settling
  endhook: (s, f) => ({ light: "townT", dof: 0.6, focus: Tw(2, 0.6, 2), puffs: roadSmoke(tt(s, f)),
    cam: mv(s, f, { pos: Tw(-11, 2.8, -9.5), look: Tw(4, 0.9, 3.5), fov: 38, roll: -0.03 }, { pos: Tw(-9, 2.4, -8), look: Tw(4, 0.9, 3.5), fov: 38, roll: 0.02 }),
    subjects: [["the smoking crack", Tw(0, 0.4, crackZ(0)), 4], ["the holdout house", HOUSE_FRONT, 3]] }),
  // the thumbnail: low on the cracked road, smoke pouring up, the holdout house behind
  thumb: () => ({ light: "townT", dof: 1, focus: Tw(1.5, 0.6, 1.2), puffs: roadSmoke(2.2, 1.25),
    cam: { pos: Tw(-3.4, 1.1, -3.6), look: Tw(5, 1.4, 6), fov: 40, roll: 0.03 } }),
};
void clamp01; void orbit; void kick; void PORCH;

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0026 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
const WHIP = new Set(["years", "dump", "five", "hose", "under2", "trench", "yards", "boy", "money", "refused", "fire", "gas", "miners"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
