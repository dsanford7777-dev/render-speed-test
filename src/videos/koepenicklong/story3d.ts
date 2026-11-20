// The Koepenick long-form's 3D shots: the Koepenick Short's sets, cast and props (../koepenick), re-shot for 16:9.
// Short specs are reused through R(): the camera's vertical field of view is narrowed so the framing matches the
// portrait shot's width. Shots of its own are written out below with the same house kit (move/orbit/kick).
import { SPECS as FS, St3, Cam, ShotDef as FShot, V3, smooth, move, kick, secs, P, add, walker, salute, AP, MAYOR, specAt as fSpecAt } from "../koepenick/story";
import { FPS, St, Sq, Rm, WZ, PAVE, KERB, TZ, GATE, TABLE } from "../koepenick/place";
import { ShotDef } from "./timeline";

const T = (k: number) => Math.round(k * FPS);
/** portrait -> landscape: keep roughly the portrait frame's width of view */
const vfov = (v: number) => (2 * Math.atan(0.74 * Math.tan((v * Math.PI) / 360)) * 180) / Math.PI;
const wide = (c: Cam): Cam => ({ ...c, fov: vfov(c.fov) });
const asF = (s: ShotDef): FShot => ({ id: s.id, g: s.g, a: s.a, b: s.b, k: "3d" });
/** a Short spec, re-shot for 16:9. Its word-timed kicks belong to the Short's narration, so they fire wherever the
 *  Short's words fall (outside this shot: no kick); one is added at `kickAt` seconds. */
const R = (k: string, kickAt?: number, mod?: (st: St3, s: ShotDef, f: number) => St3) => (s: ShotDef, f: number): St3 => {
  const st = FS[k](asF(s), f), c = kickAt === undefined ? st.cam : kick(st.cam, f, s.a + T(kickAt), 0.9), w = { ...st, cam: wide(c) };
  return mod ? mod(w, s, f) : w;
};
const tt = (s: ShotDef, f: number) => secs(f - s.a);
const far = (st: St3, k: number): St3 => ({ ...st, cam: { ...st.cam, pos: [st.cam.look[0] + (st.cam.pos[0] - st.cam.look[0]) * k, st.cam.look[1] + (st.cam.pos[1] - st.cam.look[1]) * k, st.cam.look[2] + (st.cam.pos[2] - st.cam.look[2]) * k] as V3 } });
void fSpecAt;

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  mine: R("mine", 0.6), mayor: R("mayor"), bayonets: R("bayonets"), arrest: R("arrest", 0.3), count: R("count"), sign: R("sign"), warden: R("warden", 0.5),
  notoff: R("notoff"), shoe: R("shoe"), pieces: R("pieces"), laugh: R("laugh"), salute: R("salute", 0.4), hook: R("hook"), prison: R("prison"),
  checked: R("checked"), shops: R("shops"), dealer: R("dealer"), fit: R("fit"), swim: R("swim"), baths: R("baths"), order: R("order"), six: R("six"),
  beer: R("beer"), mark: R("mark"), train: R("train"), hall: R("hall"), gate: R("gate"), where: R("where"), hauled: R("hauled"), walk: R("walk"), suit: R("suit"),
  noid: R("noid"), caught: R("caught", 0.4), kaiser: R("kaiser", 0.8), swear: R("swear"), nopass: R("nopass", 0.5), lux: R("lux"), luxpass: R("luxpass"),
  // ---------------- the long-form's own ----------------
  // a Berlin street at noon: people going about, a wide slow pan along the fronts
  streetwide: (s, f) => { const t2 = tt(s, f);
    return { light: "noon", dof: 0, focus: St(4, 2, WZ - 2),
      people: [walker("p1", St(10, 0, 0)[0], PAVE, WZ - 1.6, -1.1, t2, "neutral"), walker("p3", St(7.5, 0, 0)[0], PAVE, WZ - 1.2, -0.9, t2, "smile"), walker("p4", St(-2, 0, 0)[0], 0, 3.2, 1.2, t2, "neutral"), P("boy", St(1.6, PAVE, KERB + 0.6), "grin", 0), P("g7", St(5.4, PAVE, WZ - 1.0), "stern", 0)],
      cam: move({ pos: St(12, 3.0, -9), look: St(6, 3.0, WZ), fov: 36, roll: 0.02 }, { pos: St(4, 2.6, -9), look: St(0, 3.2, WZ), fov: 36, roll: -0.02 }, f, s.a, s.b, smooth, 0) }; },
  // the same street, our man walking with nowhere to be registered
  streetwide2: (s, f) => { const t2 = tt(s, f);
    return { light: "noon", dof: 0, focus: St(2, 1.5, WZ - 1.5),
      people: [walker("voigt", St(5, 0, 0)[0], PAVE, WZ - 1.5, -0.9, t2, "neutral"), walker("p2", St(-6, 0, 0)[0], PAVE, WZ - 1.2, 1.0, t2, "neutral"), P("p5", St(-0.6, PAVE, KERB + 0.8), "smile", 0)],
      cam: move({ pos: St(5, 1.8, -5), look: St(3.5, 1.6, WZ - 1.5), fov: 34, roll: 0.02 }, { pos: St(2.5, 1.8, -5), look: St(1.5, 1.6, WZ - 1.5), fov: 34, roll: -0.02 }, f, s.a, s.b, smooth, 0) }; },
  // "a city full of soldiers": a squad marching past the shop fronts
  soldiers: (s, f) => { const t2 = tt(s, f), x0 = St(-2, 0, 0)[0];
    return { light: "noon", dof: 0, focus: St(3, 1.4, 3), people: [5, 6, 7, 8, 9, 10].map((n, k) => walker(`g${n}`, x0 - 1.2 * Math.floor(k / 2), 0, 2.6 + (k % 2) * 1.0, 1.4, t2, "neutral")),
      cam: move({ pos: St(5, 1.6, -6), look: St(2, 1.5, 3), fov: 38, roll: 0.03 }, { pos: St(6.5, 1.6, -5.5), look: St(3.5, 1.5, 3), fov: 38, roll: -0.02 }, f, s.a, s.b, smooth, 0) }; },
  // Koepenick's square, the whole town hall, a few townspeople; later the squad posted at the gate
  squarewide: (s, f) => { const t2 = tt(s, f), posted = s.s >= 34 && s.s < 40;
    return { light: "aft", dof: 0, gate: 0, focus: Sq(0, 4, TZ),
      people: posted ? [P("g1", Sq(GATE.x + 2.6, AP, TZ - 1.5), "stern", 0), P("g2", Sq(GATE.x - 2.6, AP, TZ - 1.5), "stern", 0), P("g3", Sq(GATE.x + 4.6, AP, TZ - 1.6), "stern", 0), P("g4", Sq(GATE.x - 4.6, AP, TZ - 1.6), "stern", 0), P("p3", Sq(-6, 0, 2), "shock", 1), P("p1", Sq(-5, 0, 2.6), "nervous", 1)]
        : [walker("p3", Sq(4, 0, 0)[0], 0, 3, -0.9, t2, "neutral"), walker("p2", Sq(-6, 0, 0)[0], 0, 1.5, 1.0, t2, "neutral")],
      cam: move({ pos: Sq(-3, 2.0, -16), look: Sq(-1, 6, TZ), fov: 40, roll: 0.02 }, { pos: Sq(1, 2.6, -15), look: Sq(0, 5.5, TZ), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0) }; },
  // "orders to take over the administration": the captain at the desk, the mayor standing, a guard at the door
  mayor2: R("mayor", undefined, (st) => far(st, 0.8)),
  // the station restaurant: the owner behind his table, remembering
  restaurant: (s, f) => { const p = Rm(0, 0, TABLE.z + 0.62);
    return { light: "pub", dof: 0.8, people: [P("dealer", p, "nervous", 0, { hw: [add(p, 0.3, 1.0, -0.4)] })], key: Rm(0.6, 2.6, 0.3), focus: add(p, 0, 1.4, 0),
      cam: move({ pos: Rm(0.6, 1.6, -2.4), look: add(p, 0, 1.3, 0), fov: 36, roll: 0.03 }, { pos: Rm(0.3, 1.55, -2.1), look: add(p, 0, 1.35, 0), fov: 36, roll: -0.02 }, f, s.a, s.b, smooth, 0) }; },
  // the papers again, wider: everybody on the pavement has one
  laugh2: R("laugh", undefined, (st) => far(st, 1.25)),
  // the thumbnail: the captain in front of the town hall gate, the guards either side, low and wide
  thumb: () => { const c = Sq(GATE.x + 0.6, AP, TZ - 3.4);
    return { light: "aft", dof: 0.8, gate: 0, focus: add(c, 0, 1.5, 0), people: [P("cap", c, "grin", 0), P("g1", Sq(GATE.x + 2.6, AP, TZ - 1.5), "stern", 0), P("g2", Sq(GATE.x - 2.6, AP, TZ - 1.5), "stern", 0)],
      cam: { pos: add(c, -1.6, 0.9, -3.6), look: add(c, -1.2, 1.9, 0), fov: 46, roll: 0.03 } }; },
};
void salute; void MAYOR;

export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0026 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.19 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.15 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.11 + 2.1 * id)] } };
};
const WHIP = new Set(["laugh", "swim", "six", "train", "hall", "hauled", "walk", "kaiser", "lux", "streetwide", "soldiers"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
