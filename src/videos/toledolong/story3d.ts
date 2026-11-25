// The Toledo War long-form's 3D shots: the Short's four sets and cast (../toledo), re-shot for 16:9.
// Short specs are reused through R(): the shot is played on the Short's own clock (so a kick or a musket shot that the
// Short timed to its words lands at the same moment after the cut), and the camera's vertical field of view is narrowed
// so the framing keeps roughly the portrait shot's width. The long-form's own shots are written for 16:9 directly.
// Cameras sit on the -z side looking toward +z (world +x is screen LEFT). Nobody is shown hurt.
import { SPECS as FS, SHOTS as SSH, St3, Cam, ShotDef as FShot, V3, smooth, L3, move, secs, P, walker, add, faceoff, hookState, MI_LINE, OH_LINE, TWO_P, ONE_P } from "../toledo/story";
import { Rv, Wd, Rm, Nt, TAVERN, WHARF, SHIP, COMPASS, TABLE, OUTCROP, PORTAL, northY } from "../toledo/place";
import { ShotDef } from "./timeline";

const vfov = (v: number) => (2 * Math.atan(0.74 * Math.tan((v * Math.PI) / 360)) * 180) / Math.PI;
const wide = (c: Cam): Cam => ({ ...c, fov: vfov(c.fov) });
/** a Short spec, re-shot for 16:9 on the Short's clock */
const R = (k: string, mod?: (st: St3, s: ShotDef, f: number) => St3) => (s: ShotDef, f: number): St3 => {
  const S = SSH.find((x) => x.g === k)!, off = S.a - s.a;
  const s2: FShot = { id: s.id, g: k, a: s.a + off, b: s.b + off, k: "3d" }, st = FS[k](s2, f + off), w = { ...st, cam: wide(st.cam) };
  return mod ? mod(w, s, f) : w;
};
const tt = (s: ShotDef, f: number) => secs(f - s.a);
/** pull the camera back (k > 1) along its line of sight */
const far = (st: St3, k: number): St3 => ({ ...st, cam: { ...st.cam, pos: L3(st.cam.look, st.cam.pos, k) } });
const mv = (s: ShotDef, f: number, a: Partial<Cam> & { pos: V3; look: V3 }, b: Partial<Cam> & { pos: V3; look: V3 }) => move(a, b, f, s.a, s.b, smooth, 0);
const ng = (x: number, z: number, y = 0): V3 => { const p = Nt(x, 0, z); return [p[0], northY(x, z) + y, z]; };
const BW = 0.22, WALK_Z = 4.4;
const LAMP_T: V3 = Rm(-0.2, 2.4, 0.4);

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  hook: R("hook"), mimarch: R("mimarch"), toledo: R("toledo"), fire: R("fire"), stab: R("stab"), knife: R("knife"), rich: R("rich"),
  survey: R("survey"), strip: R("strip"), mason: R("mason"), boy: R("boy"), lucas: R("lucas"), ambush: R("ambush"), duck: R("duck"), nobody: R("nobody"),
  one: R("one"), wood: R("wood"), tavern: R("tavern"), lived: R("lived"), ohio: R("ohio"), congress: R("congress"), deal: R("deal"), up: R("up"),
  furious: R("furious"), snow: R("snow"), no: R("no"), broke: R("broke"), frost: R("frost"), yes2: R("yes2"), copper: R("copper"), mine: R("mine"), port: R("port"),
  boy2: R("boy", (st) => far(st, 1.5)), mine2: R("mine", (st) => far(st, 1.3)),

  // ---------------- the long-form's own ----------------
  // There were drums. There were rifles: the Michigan column marching at the camera, low
  mimarch2: (s, f) => { const t0 = tt(s, f), ph = (t0 * 1.1 / 1.6) % 1;
    const row = (w: string, x: number, z0: number, k: number) => P(w, Rv(x, 0, z0 - 1.1 * t0), k ? "stern" : "grin", 0, { march: (ph + 0.5 * k) % 1 });
    return { light: "river", dof: 1, focus: Rv(-6, 1.3, 3.0 - 1.1 * t0),
      people: [row("mi1", -5.5, 3.6, 0), row("mi2", -6.5, 3.6, 1), row("mi3", -5.5, 5.2, 1), row("mi4", -6.5, 5.2, 0)],
      cam: mv(s, f, { pos: Rv(-4.2, 0.7, -3.6), look: Rv(-6.2, 1.5, 4), fov: 38, roll: 0.04 }, { pos: Rv(-4.6, 0.75, -3.9), look: Rv(-6.2, 1.5, 3), fov: 38, roll: -0.03 }),
      subjects: [["the militia", Rv(-6, 1.3, 3.2 - 1.1 * t0), 0.5]] }; },
  // And near the mouth of the river sat a town: the town from the wharf side, high, the street running away
  toledo2: (s, f) => ({ light: "river", dof: 0, focus: Rv(-14, 2, 5),
    people: [P("t3", Rv(-21.5, BW, WALK_Z), "grin", 1), P("t4", Rv(-22.4, BW, WALK_Z + 0.3), "smile", -1), walker("t1", -8, BW, WALK_Z, -0.9, tt(s, f))],
    cam: mv(s, f, { pos: Rv(12, 6.5, 10), look: Rv(-16, 1, 3), fov: 34, roll: 0.02 }, { pos: Rv(11, 5.5, 8), look: Rv(-17, 1.2, 3), fov: 34, roll: -0.02 }),
    subjects: [["the town", Rv(-14, 3, 7), 3]] }),
  // Why fight over a swampy strip of land? Low over the river bank, the Maumee wide and slow
  river: (s, f) => ({ light: "river", dof: 0.5, focus: Rv(6, -1, 30),
    cam: mv(s, f, { pos: Rv(2, 1.0, 6), look: Rv(8, -0.6, 40), fov: 40, roll: 0.03 }, { pos: Rv(4, 1.2, 7), look: Rv(10, -0.6, 40), fov: 40, roll: -0.02 }),
    subjects: [["the river", Rv(6, -1.3, 32), 4]] }),
  // ...Toledo was the prize: the schooner and the wharf from the water side
  toledo3: (s, f) => ({ light: "river", dof: 0.6, focus: Rv(SHIP[0], 2, SHIP[2]),
    people: [P("t2", Rv(11.4, WHARF.y, 19.5), "grin", 1), P("t3", Rv(10.6, WHARF.y, 22.5), "smile", -1, { wave: 0.5 })],
    cam: mv(s, f, { pos: Rv(-2, 2.4, 10), look: Rv(16, 1.2, 24), fov: 36, roll: 0.03 }, { pos: Rv(-1, 3.0, 11), look: Rv(17, 1.4, 25), fov: 36, roll: -0.02 }),
    subjects: [["the schooner", Rv(SHIP[0] - 4, 2, SHIP[2]), 1.5]] }),
  // Lucas called out about 600 militia: Ohio's men in the street, Lucas reviewing them
  lucas2: (s, f) => { const t0 = tt(s, f), p = Rv(-21, 0, 0.0);
    return { light: "river", dof: 1, focus: Rv(-21, 1.4, 2),
      people: [P("lucas", p, "stern", -1, { wave: 0.6 }), ...["oh1", "oh2", "oh3", "oh4"].map((w, i) => P(w, Rv(-19.6 - i * 1.1, 0, 2.4 + (i % 2) * 0.3), i === 2 ? "grin" : "stern", 0))],
      cam: mv(s, f, { pos: Rv(-20.5, 1.6, -4.6), look: Rv(-21.2, 1.4, 2), fov: 40, roll: 0.03 }, { pos: Rv(-21.5, 1.6, -4.2 + 0.1 * t0), look: Rv(-21.2, 1.4, 2), fov: 40, roll: -0.02 }),
      subjects: [["the Ohio militia", Rv(-21.2, 1.3, 2.4), 1], ["Lucas", add(p, 0, 1.4, 0), 0.2]] }; },
  // An Ohio survey crew was re-marking Ohio's line: wide on the clearing, the stakes running off
  survey2: (s, f) => ({ light: "woods", dof: 0.6, focus: Wd(COMPASS[0], 1.2, COMPASS[2]),
    people: [P("sv1", Wd(COMPASS[0] - 0.45, 0, COMPASS[2] + 0.15), "neutral", -1), P("sv2", Wd(-1.2, 0, 7.6), "whistle", 1), P("sv3", Wd(-3.4, 0, 9.0), "neutral", 1)],
    cam: mv(s, f, { pos: Wd(3.5, 1.9, -1.0), look: Wd(-2.5, 1.0, 7), fov: 36, roll: -0.02 }, { pos: Wd(2.5, 1.8, -0.4), look: Wd(-2.6, 1.0, 7), fov: 36, roll: 0.02 }),
    subjects: [["the survey crew", Wd(-2.2, 1.3, 6.5), 1]] }),
  // ...and reported an armed force of several hundred men: Michigan's column, wide, marching
  mimarch3: (s, f) => { const t0 = tt(s, f), ph = (t0 * 1.1 / 1.6) % 1, xs = [-0.6, 0.6], zs = [3, 4.6, 6.2, 7.8];
    const men = zs.flatMap((z0, r) => xs.map((x, c) => P(["mi1", "mi2", "mi3", "mi4"][(r + c) % 4], Rv(x, 0, z0 - 1.1 * t0), r % 2 ? "stern" : "neutral", 0, { march: (ph + 0.5 * ((r + c) % 2)) % 1 })));
    return { light: "river", dof: 0.6, focus: Rv(0, 1.3, 4),
      people: men, cam: mv(s, f, { pos: Rv(1.5, 2.6, -5.5), look: Rv(0, 1.2, 4.5), fov: 38, roll: 0.02 }, { pos: Rv(1.0, 2.4, -5.0), look: Rv(0, 1.2, 4.0), fov: 38, roll: -0.02 }),
      subjects: [["the column", Rv(0, 1.3, 4), 1]] }; },
  // Then came the Stickneys: the tavern, One and Two at their table, the barman
  tavern0: (s, f) => ({ light: "tavern", dof: 0.8, focus: add(L3(TWO_P, ONE_P, 0.5), 0, 1.4, 0), key: LAMP_T,
    people: [P("two", TWO_P, "grin", -1), P("one", ONE_P, "laugh", 1), P("barman", Rm(0.1, 0, 3.2), "smile", 1)],
    cam: mv(s, f, { pos: Rm(-1.6, 1.7, -3.6), look: add(L3(TWO_P, ONE_P, 0.5), 0, 1.3, 0), fov: 38, roll: 0.03 }, { pos: Rm(-1.1, 1.65, -3.2), look: add(L3(TWO_P, ONE_P, 0.5), 0, 1.3, 0), fov: 38, roll: -0.02 }),
    subjects: [["One and Two", add(L3(TWO_P, ONE_P, 0.5), 0, 1.4, 0), 0.6]] }),
  // Two ran off into Ohio: out along the board walk, away from the tavern
  tworun: (s, f) => { const t0 = tt(s, f), w = walker("two", TAVERN.x - 1.5, BW, 3.6, -2.4, t0, "grin");
    return { light: "river", dof: 1, focus: add(w.p, 0, 1.3, 0), people: [w],
      cam: { pos: add(w.p, 2.6, 1.5, -4.8), look: add(w.p, -0.6, 1.2, 0.5), fov: 38, roll: 0.02 * Math.sin(t0) },
      subjects: [["Two", add(w.p, 0, 1.3, 0), 0.2]] }; },
  // The new county's court ... held a session by candlelight: two judges and a clerk at the tavern table, lanterns low
  court: (s, f) => { const j1 = Rm(TABLE[0] + 0.3, 0, TABLE[2] + 0.95), j2 = Rm(TABLE[0] - 0.6, 0, TABLE[2] + 1.0), cl = Rm(TABLE[0] + 1.1, 0, TABLE[2] + 0.5);
    return { light: "tavern", dof: 1, focus: Rm(TABLE[0], 1.3, TABLE[2] + 0.8), key: Rm(TABLE[0], 1.4, TABLE[2] - 0.2),
      people: [P("cg1", j1, "stern", -1), P("cg3", j2, "neutral", 1, { hw: [Rm(TABLE[0] - 0.3, 0.82, TABLE[2] + 0.2)] }), P("d3", cl, "nervous", -1)],
      cards: [0, 1].map((i) => ({ kind: "paper" as const, p: Rm(TABLE[0] - 0.2 + i * 0.35, 0.8, TABLE[2] + 0.1), spin: i * 0.6, s: 1, flat: true })),
      cam: mv(s, f, { pos: Rm(TABLE[0] - 0.4, 1.5, -3.0), look: Rm(TABLE[0], 1.2, TABLE[2] + 0.8), fov: 38, roll: 0.03 }, { pos: Rm(TABLE[0] - 0.2, 1.45, -2.6), look: Rm(TABLE[0], 1.2, TABLE[2] + 0.8), fov: 38, roll: -0.02 }),
      subjects: [["the court", Rm(TABLE[0], 1.3, TABLE[2] + 0.9), 0.6]] }; },
  // Then someone shouted that the Michigan militia was coming. The judges ran for it
  court2: (s, f) => { const t0 = tt(s, f), go = smooth(t0 / 0.6), j1 = Rm(TABLE[0] + 0.3 - 1.6 * go, 0, TABLE[2] + 0.95 - 0.5 * go), j2 = Rm(TABLE[0] - 0.6 - 1.8 * go, 0, TABLE[2] + 1.0 - 0.3 * go);
    return { light: "tavern", dof: 1, focus: Rm(TABLE[0] - 0.6, 1.3, TABLE[2] + 0.8), key: Rm(TABLE[0], 1.4, TABLE[2] - 0.2),
      people: [P("cg1", j1, "shock", -1, { tilt: 0.12 * go }), P("cg3", j2, "shock", -1, { tilt: 0.1 * go })],
      cards: [0, 1, 2].map((i) => ({ kind: "paper" as const, p: Rm(TABLE[0] - 0.3 + i * 0.3 - 0.6 * go, 0.8 + 0.9 * go * (0.6 + 0.3 * i) - 1.2 * go * go * 0.6, TABLE[2] + 0.1), spin: i + 3 * t0, s: 1 })),
      cam: mv(s, f, { pos: Rm(TABLE[0] - 0.8, 1.5, -3.0), look: Rm(TABLE[0] - 0.6, 1.2, TABLE[2] + 0.8), fov: 40, roll: -0.04 }, { pos: Rm(TABLE[0] - 1.0, 1.5, -2.8), look: Rm(TABLE[0] - 0.9, 1.2, TABLE[2] + 0.8), fov: 40, roll: 0.03 }),
      subjects: [["the judges", Rm(TABLE[0] - 0.8, 1.3, TABLE[2] + 0.9), 0.8]] }; },
  // He removed Mason from office: Mason alone in the tavern
  masonsad: (s, f) => { const mp = Rm(0.4, 0, 1.4);
    return { light: "tavern", dof: 1, focus: add(mp, 0, 1.5, 0), key: LAMP_T, people: [P("mason", mp, "nervous", 0, { headTilt: -0.15 })],
      cam: mv(s, f, { pos: add(mp, 0.6, 1.5, -2.9), look: add(mp, 0, 1.4, 0), fov: 36, roll: 0.03 }, { pos: add(mp, 0.4, 1.5, -2.5), look: add(mp, 0, 1.45, 0), fov: 36, roll: -0.02 }),
      subjects: [["Mason", add(mp, 0, 1.5, 0), 0.2]] }; },
  // And then Michigan looked north: the Upper Peninsula in winter, the camera rising over the shore
  snow2: (s, f) => ({ light: "northW", dof: 0, focus: Nt(-14, 2, 14), cards: [],
    cam: mv(s, f, { pos: Nt(-6, 1.6, -4), look: Nt(-14, 3, 16), fov: 40, roll: 0.02 }, { pos: Nt(-6, 4.5, -6), look: Nt(-16, 2.4, 18), fov: 42, roll: -0.02 }),
    subjects: [["the snowy pines", Nt(-14, 4, 13), 2]] }),
  // Prospectors poured into the woods: two of them on the shore by the outcrop
  prospect: (s, f) => { const t0 = tt(s, f), w1 = walker("pros", Nt(1.5, 0, 0)[0], 0, 4.2, -0.8, t0, "grin"), w2 = walker("mn1", Nt(2.6, 0, 0)[0], 0, 4.8, -0.8, t0, "neutral");
    return { light: "northS", dof: 1, focus: Nt(-0.5, 1.2, 4.5), people: [w1, w2],
      cam: mv(s, f, { pos: Nt(-1.5, 1.5, -1.6), look: Nt(0.2, 1.2, 5), fov: 38, roll: 0.03 }, { pos: Nt(-2.0, 1.5, -1.4), look: Nt(-0.6, 1.2, 5), fov: 38, roll: -0.02 }),
      subjects: [["the prospectors", Nt(0.5 - 0.8 * t0, 1.3, 4.5), 0.6]] }; },
  // The frozen wilderness ... one of the richest pieces of ground in America: summer, the mine and the lake, wide
  north: (s, f) => ({ light: "northS", dof: 0, focus: Nt(2, 2, 12),
    people: [P("mn1", ng(PORTAL[0] + 0.5, PORTAL[2] - 2.4), "grin", 0), P("mn2", ng(PORTAL[0] - 1.3, PORTAL[2] - 3.4), "laugh", 1)],
    cam: mv(s, f, { pos: Nt(-6, 3.0, -9), look: Nt(3, 2, 12), fov: 40, roll: 0.02 }, { pos: Nt(-7, 4.4, -11), look: Nt(2, 2.2, 13), fov: 42, roll: -0.02 }),
    subjects: [["the mine", ng(PORTAL[0], PORTAL[2], 1.5), 1], ["the lake", Nt(-12, -0.5, 36), 4]] }),
  // Toledo did fine too: the wharf busy, the schooner in
  port2: (s, f) => { const st = SPECS.toledo3(s, f); return { ...st, people: [...(st.people ?? []), P("t1", Rv(12.0, WHARF.y, 17), "laugh", 1)] }; },
  // And every November, the two states still go to war: the face-off again, from behind the Ohio line
  hook2: (s, f) => ({ ...hookState(), light: "river", dof: 1, focus: Rv(0, 1.3, 3),
    cam: mv(s, f, { pos: Rv(-1.8, 1.6, -4.4), look: Rv(0.2, 1.3, 3.5), fov: 38, roll: -0.03 }, { pos: Rv(-1.4, 1.6, -3.9), look: Rv(0.2, 1.3, 3.5), fov: 38, roll: 0.02 }),
    subjects: [["the Michigan militia", add(MI_LINE[0][1], 0, 1.4, 0), 0.2], ["the Ohio militia", add(OH_LINE[0][1], 0, 1.4, 0), 0.2]] }),
  // So, who really won? The street, the two lines, settling wide
  endhook: (s, f) => ({ light: "river", dof: 0.5, focus: Rv(0, 1.2, 3), people: faceoff("neutral", "neutral"),
    cam: mv(s, f, { pos: Rv(0.4, 3.2, -6.5), look: Rv(0, 1.1, 3.5), fov: 40, roll: 0.02 }, { pos: Rv(0.2, 4.2, -8), look: Rv(0, 1.0, 3.5), fov: 42, roll: -0.02 }),
    subjects: [["the two militias", Rv(0, 1.2, 2.5), 1]] }),
  // the thumbnail: the face-off, low and close
  thumb: () => ({ ...hookState(), light: "river", dof: 1, focus: Rv(0, 1.3, 1.5), cam: { pos: Rv(0.1, 1.2, -3.0), look: Rv(0, 1.45, 3), fov: 44, roll: 0.02 } }),
};
void OUTCROP;
/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0026 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
const WHIP = new Set(["mimarch", "fire", "stab", "survey", "mason", "lucas2", "ambush", "wood", "congress", "furious", "snow2", "copper", "port2"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
