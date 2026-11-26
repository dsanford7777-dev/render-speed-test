// The War of the Bucket long-form's 3D shots: the Short's three sets and cast (../bucket), re-shot for 16:9.
// Short specs are reused through R(): the shot is played on the Short's own clock (so a kick timed to a word lands at the
// same moment after the cut), and the camera's vertical field of view is narrowed so the framing keeps roughly the
// portrait shot's width. The long-form's own shots are written for 16:9 directly.
// Cameras sit on the -z side looking toward +z (world +x is screen LEFT). Nobody is shown hurt.
import { SPECS as FS, SHOTS as SSH, St3, Cam, ShotDef as FShot, V3, smooth, L3, move, secs, P, walker, add, hg, hy, MO1_WELL, BUCKET_AT_WELL, GATE_C, BK_C, WIN_T } from "../bucket/story";
import { Gt, Hl, WELL, TOWER_Z, GATE_H } from "../bucket/place";
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
const HX = Hl(0, 0, 0)[0];

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  hook: R("hook"), battle: R("battle"), walls: R("walls"), modena: R("modena"), hate1: R("hate1"), hate2: R("hate2"), pope: R("pope"), emperor: R("emperor"),
  night: R("night"), traitors: R("traitors"), handed: R("handed"), furious: R("furious"), army: R("army"), few: R("few"), decree: R("decree"), bona: R("bona"),
  rebel: R("rebel", (st) => far(st, 1.3)), forgive: R("forgive", (st) => { const w = far(st, 1.45); return { ...w, cam: { ...w.cam, look: [w.cam.look[0], w.cam.look[1] - 0.3, w.cam.look[2]] } }; }), zappo: R("zappo"), sunset: R("sunset"), feint: R("feint"), ride: R("ride"), behind: R("behind", (st) => far(st, 1.25)), flee: R("flee"),
  ran: R("ran"), toll: R("toll"), chase: R("chase"), outside: R("outside", (st) => ({ ...st, cam: { ...st.cam, look: [st.cam.look[0], st.cam.look[1] - 1.4, st.cam.look[2]] } })), race: R("race"), rub: R("rub"), well: R("well"), grab: R("grab"), prize: R("prize"),
  jan: R("jan"), kept: R("kept"), poet: R("poet"), book: R("book"), starts: R("starts"), version: R("version"), still: R("still"),
  army2: R("army", (st) => far(st, 1.25)),

  // ---------------- the long-form's own ----------------
  // In July, Bolognese troops raid Modenese fields: a file of Bologna's men tramping across the open country, side on
  trample: (s, f) => { const t0 = tt(s, f), x0 = HX - 4;
    const men = ["bo1", "bo2", "bo3", "bo4"].map((w, i) => { const x = x0 - i * 1.6, z = -18 + (i % 2) * 0.7; return walker(w, x, hy(x + 1.3 * t0, z), z, 1.3, t0, i % 2 ? "grin" : "stern"); });
    return { light: "field", dof: 1, focus: add(men[1].p, 0, 1.4, 0), people: men,
      cam: mv(s, f, { pos: hg(-4.0, -26, 1.6), look: hg(-6.4, -18, 1.4), fov: 34, roll: 0.03 }, { pos: hg(1.0, -26, 1.7), look: hg(-1.4, -18, 1.4), fov: 34, roll: -0.02 }),
      subjects: [["Bologna's men", add(men[1].p, 0, 1.4, 0), 0.5]] }; },
  // In August, two weeks wrecking Modenese land: the column seen from the front, marching through the grass at us
  trample2: (s, f) => { const t0 = tt(s, f), ph = (t0 * 1.2 / 1.6) % 1;
    const row = (w: string, x: number, z0: number, k: number) => P(w, hg(x, z0 - 1.2 * t0), k ? "stern" : "grin", 0, { march: (ph + 0.5 * k) % 1 });
    return { light: "field", dof: 1, focus: hg(-6, -14 - 1.2 * t0, 1.4), people: [row("bo1", -5.4, -12, 0), row("bo2", -6.6, -12, 1), row("bo3", -5.4, -10.4, 1), row("bo4", -6.6, -10.4, 0)],
      cam: mv(s, f, { pos: hg(-6, -21, 0.8), look: hg(-6, -12, 1.6), fov: 38, roll: 0.04 }, { pos: hg(-6.2, -21.4, 0.85), look: hg(-6, -13, 1.6), fov: 38, roll: -0.03 }),
      subjects: [["Bologna's men", hg(-6, -11.5 - 1.2 * t0, 1.4), 0.5]] }; },
  // ...Over a castle: Monteveglio by night, Modena's flag now on the keep
  castleM: (s, f) => ({ light: "night", dof: 0, focus: add(GATE_C, 0, 6, 6), castleGate: 1, flag: "modena",
    cam: mv(s, f, { pos: hg(10, 18, 4), look: hg(0, 60, 14), fov: 36, roll: 0.03 }, { pos: hg(8, 22, 4.5), look: hg(0, 60, 15), fov: 34, roll: -0.02 }),
    subjects: [["the castle", add(GATE_C, 0, 6, -1.6), 3], ["Modena's flag", hg(0, 69.6, 25.6), 1.5]] }),
  // its own militia...: Bologna's front rank close, the rest of the army behind them
  ranks: (s, f) => { const ps: V3[] = [hg(1.2, 8.3), hg(-0.3, 8.0), hg(-1.8, 8.4)];
    return { light: "field", dof: 1, focus: add(ps[1], 0, 1.5, 0), army: { bolo: { state: "stand", u: 0, hide: (_i, p) => p[2] < 11.5 && Math.abs(p[0] - HX) < 4 } },
      people: [P("bo1", ps[0], "stern", -1), P("bo3", ps[1], "grin", 0), P("bo2", ps[2], "stern", 1)],
      cam: mv(s, f, { pos: hg(0.5, 3.4, 1.7), look: add(ps[1], 0, 1.55, 0), fov: 36, roll: -0.03 }, { pos: hg(-0.3, 3.8, 1.7), look: add(ps[1], 0, 1.55, 0), fov: 34, roll: 0.03 }),
      subjects: [["Bologna's soldiers", add(ps[1], 0, 1.5, 0), 0.4]] }; },
  // Many of those foot soldiers are townsmen: a slow pan along the ranks
  ranks2: (s, f) => ({ light: "field", dof: 0.6, focus: hg(-2, 12, 4), army: { bolo: { state: "stand", u: 0 } },
    cam: mv(s, f, { pos: hg(14, 2, 4.5), look: hg(6, 14, 4), fov: 32, roll: 0.02 }, { pos: hg(-10, 2, 4.5), look: hg(-14, 14, 4), fov: 32, roll: -0.02 }),
    subjects: [] }),
  // Mantua and Ferrara send men too: Modena's few marching, side on
  modmarch: (s, f) => { const t0 = tt(s, f);
    return { light: "field", dof: 0, focus: hg(0, -6, 1.5), army: { mode: { state: "march", u: t0 } },
      cam: mv(s, f, { pos: hg(32, -2, 3.5), look: hg(0, -7, 1.5), fov: 34, roll: 0.03 }, { pos: hg(32, 1, 3.8), look: hg(0, -4, 1.5), fov: 34, roll: -0.02 }),
      subjects: [["Modena's army", hg(0, -6 + 1.2 * t0, 1.5), 3]] }; },
  // The Modenese come to break the siege: Modena's ranks marching on, low and close
  modmarch2: (s, f) => { const t0 = tt(s, f) + 2;
    return { light: "field", dof: 0.6, focus: hg(10, -4, 1.5), army: { mode: { state: "march", u: t0 } },
      cam: mv(s, f, { pos: hg(24, -1, 1.2), look: hg(10, -5, 1.6), fov: 36, roll: -0.04 }, { pos: hg(23, 1, 1.3), look: hg(9, -3, 1.6), fov: 36, roll: 0.03 }),
      subjects: [["Modena's men", hg(12, -5 + 1.2 * t0, 1.5), 2]] }; },
  // The Bolognese march out and besiege Monteveglio: Bologna's army spread below the castle, the castle above it
  siege: (s, f) => ({ light: "field", dof: 0, focus: hg(0, 30, 8), flag: "modena", army: { bolo: { state: "stand", u: 0 } },
    cam: mv(s, f, { pos: hg(-30, -14, 6), look: hg(0, 40, 12), fov: 38, roll: -0.03 }, { pos: hg(-26, -18, 9), look: hg(0, 40, 13), fov: 38, roll: 0.02 }),
    subjects: [["the castle", add(GATE_C, 0, 6, -1.6), 3], ["Bologna's army", hg(0, 22, 9), 6]] }),
  // ...they send men off to meet it: Bolognese hurrying off at dusk, side on
  detach: (s, f) => { const t0 = tt(s, f), x0 = HX + 6;
    const men = ["bo2", "bo4", "bo1"].map((w, i) => { const x = x0 + i * 1.7, z = 6 + (i % 2) * 0.8; return walker(w, x, hy(x - 2.4 * t0, z), z, -2.4, t0, i === 1 ? "nervous" : "stern"); });
    return { light: "dusk", dof: 1, focus: add(men[0].p, 0, 1.4, 0), people: men, army: { bolo: { state: "stand", u: 0, hide: (_i, p) => p[2] < 13 } },
      cam: { pos: [men[1].p[0] - 1.5, men[1].p[1] + 1.6, men[1].p[2] - 8.5], look: add(men[1].p, 0, 1.4, 0), fov: 36, roll: 0.03 * Math.sin(t0 * 2) },
      subjects: [["Bologna's men", add(men[0].p, 0, 1.4, 0), 0.5]] }; },
  // The fighting is heavy: Modena's ranks march up into Bologna's at the foot of the slope, side on
  clash: (s, f) => { const t0 = tt(s, f) + 7;
    return { light: "dusk", dof: 0.5, focus: hg(0, 4, 2.5), army: { bolo: { state: "stand", u: 0 }, mode: { state: "march", u: t0 } },
      cam: mv(s, f, { pos: hg(38, 2, 5), look: hg(0, 4, 2.5), fov: 30, roll: 0.03 }, { pos: hg(37, 5, 5.5), look: hg(0, 6, 2.6), fov: 30, roll: -0.02 }),
      subjects: [["the armies", hg(0, 6, 2.5), 4]] }; },
  // the opening and closing bucket, framed at screen left so the subscribe card and mascot (right) stay clear of it
  hookL: (s, f) => ({ light: "tower", dof: 1, closeup: true, focus: BK_C, key: WIN_T, cam: mv(s, f, { pos: add(BK_C, -0.9, -0.1, -1.9), look: add(BK_C, -0.9, -0.12, 0), fov: 40, roll: 0.03 }, { pos: add(BK_C, -0.85, -0.08, -1.7), look: add(BK_C, -0.85, -0.1, 0), fov: 40, roll: -0.02 }), subjects: [["the bucket", BK_C, 0.25]] }),
  // the thumbnail: the bucket on its chain, big, at screen left (the headline goes on the right)
  thumb: () => ({ light: "tower", dof: 1, closeup: true, focus: BK_C, key: WIN_T, cam: { pos: add(BK_C, -0.75, 0.05, -1.55), look: add(BK_C, -0.75, -0.02, 0), fov: 42, roll: 0.02 }, subjects: [["the bucket", BK_C, 0.1]] }),
  // ...outside one of the city gates, the Porta San Felice, there's a well: wide, the gate and the well together
  wellwide: (s, f) => ({ light: "day", dof: 0, focus: Gt(5, 3, 6), gate: 0, rope: 0.25, bucket: { p: BUCKET_AT_WELL },
    cam: mv(s, f, { pos: Gt(14, 2.2, -12), look: Gt(4, 2.4, 8), fov: 40, roll: 0.03 }, { pos: Gt(12, 2.4, -10.5), look: Gt(4, 2.6, 8), fov: 40, roll: -0.02 }),
    subjects: [["the gate", Gt(0, GATE_H, TOWER_Z), 1.5], ["the well", Gt(WELL[0], 1.2, WELL[2]), 0.8]] }),
};
void MO1_WELL;

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0028 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
/** a sideways blur on the cuts that whip */
const WHIP = new Set(["walls", "pope", "trample", "night", "ranks", "few", "sunset", "zappo", "ride", "flee", "chase", "race", "jan", "kept", "poet"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
