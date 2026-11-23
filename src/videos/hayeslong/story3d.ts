// The Frank Hayes long-form's 3D shots: the Short's sets, horses and cast (../hayes), re-shot for 16:9.
// Short specs are reused through R(): the camera's vertical field of view is narrowed so the framing keeps roughly the
// portrait shot's width. The race shots that the Short timed to its own words (lead, sway, finish, slid) are re-timed
// here to this narration's words. Shots of its own are written out below with the same house kit.
import { SPECS as FS, St3, Cam, ShotDef as FShot, V3, clamp01, smooth, move, orbit, kick, secs, U, P, add, run, field, kickUp, fans, otherStalls, IN, AIS, SC, V_RACE, leadAt, swayAt, finishAt, slidAt, Rider, HorseSt } from "../hayes/story";
import { FPS, Tk, Wr, LANE, FENCES, LAST, POST, TURF, DIRT, STABLE_YARD } from "./place";
import { ShotDef, wordAt } from "./timeline";

const T = (k: number) => Math.round(k * FPS);
/** portrait -> landscape: keep roughly the portrait frame's width of view */
const vfov = (v: number) => (2 * Math.atan(0.74 * Math.tan((v * Math.PI) / 360)) * 180) / Math.PI;
const wide = (c: Cam): Cam => ({ ...c, fov: vfov(c.fov) });
const asF = (s: ShotDef): FShot => ({ id: s.id, g: s.g, a: s.a, b: s.b, k: "3d" });
/** a Short spec, re-shot for 16:9 */
const R = (k: string, kickAt?: number, mod?: (st: St3, s: ShotDef, f: number) => St3) => (s: ShotDef, f: number): St3 => {
  const st = FS[k](asF(s), f), c = kickAt === undefined ? st.cam : kick(st.cam, f, s.a + T(kickAt), 0.9), w = { ...st, cam: wide(c) };
  return mod ? mod(w, s, f) : w;
};
const W16 = (st: St3): St3 => ({ ...st, cam: wide(st.cam) });
const tt = (s: ShotDef, f: number) => secs(f - s.a);
/** pull the camera back (k > 1) along its line of sight */
const far = (st: St3, k: number): St3 => ({ ...st, cam: { ...st.cam, pos: [st.cam.look[0] + (st.cam.pos[0] - st.cam.look[0]) * k, st.cam.look[1] + (st.cam.pos[1] - st.cam.look[1]) * k, st.cam.look[2] + (st.cam.pos[2] - st.cam.look[2]) * k] as V3 } });
/** Frank walking a horse cool in the yard outside the barn at evening, the lead rope in his hand */
const coolWalk = (s: ShotDef, f: number, k: number, horseK: number): St3 => { const t0 = tt(s, f), x = 6 - 1.3 * t0, z = STABLE_YARD.z, h: HorseSt = { k: horseK, p: [STABLE_YARD.x + x, 0, z], yaw: Math.PI, gait: "walk", phase: (6 - x) / 1.7 + k, head: -0.1 };
  const fp: V3 = [STABLE_YARD.x + x - 1.5, 0, z - 0.9];
  return { light: "eve", horses: [h], dof: 1.4, focus: add(fp, 0, 1.4, 0),
    people: [P("frank", fp, "smile", 1, { side: { phase: (t0 * 1.6) % 1, mirror: false, stride: 0.8, carry: add(fp, 0.6, 1.2, 0.6) } })],
    cam: wide(move({ pos: add(fp, 1.0, 1.7, -7.6), look: add(fp, 0.6, 1.2, 1), fov: 46, roll: 0.03 }, { pos: add(fp, 0.4, 1.6, -7.0), look: add(fp, 0.4, 1.2, 1), fov: 46, roll: -0.02 }, f, s.a, s.b, smooth, 0)),
    subjects: [["Frank", add(fp, 0, 1.5, 0), 0.3], ["the horse", add(h.p, 0, 1.5, 0), 1]] }; };
/** a horse over a fence, tracked from the side at walking pace past it (slow: v m/s) */
const overFence = (s: ShotDef, f: number, fx: number, k: number, v: number, rider: Partial<Rider> = {}, d = 11): St3 => { const t0 = tt(s, f), x = fx + 6 - v * t0, h = [run(k, x, "gallop", 2, rider)];
  return { light: "day", horses: h, dof: 1.2, focus: add(h[0].p, 0, 1.6, 0), puffs: kickUp(h[0], t0),
    cam: wide(move({ pos: IN(x - 0.3, 2.2, LANE(2) - d), look: IN(x - 0.6, 1.4, LANE(2)), fov: 44, roll: -0.03 }, { pos: IN(x - 0.6, 2.1, LANE(2) - d + 0.6), look: IN(x - 0.8, 1.4, LANE(2)), fov: 44, roll: 0.03 }, f, s.a, s.b, smooth, 0)),
    subjects: [["the horse", add(h[0].p, 0, 1.5, 0), 1]] }; };

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  hook: R("hook"), never: R("never"), firstwin: R("firstwin"), dead: R("dead"), when: R("when"), strange: R("strange"),
  barn: R("barn"), frank: R("frank"), trained: R("trained"), stalls: R("stalls"), dream: R("dream"), longshot: R("longshot"), boss: R("boss"),
  fences: R("fences", undefined, (st) => ({ ...st, horses: st.horses?.slice(0, 1) })), belmont: R("belmont"), problem: R("problem"), carry: R("carry"), heavy: R("heavy", undefined, (st) => far(st, 1.3)), starve: R("starve", undefined, (st) => far({ ...st, cam: { ...st.cam, look: [st.cam.look[0], st.cam.look[1] + 0.12, st.cam.look[2]] as V3 } }, 1.45)), ran: R("ran"), water: R("water"),
  made: R("made", undefined, (st) => far(st, 1.25)), start: R("start", 0.3), judges: R("judges"), doctor: R("doctor"), heart: R("heart"), before: R("before"), after: R("after"),
  grave: R("grave"), silks: R("silks"), jump: R("jump"),
  // ---------------- re-timed to this narration ----------------
  lead: (s, f) => W16(leadAt(s, f, wordAt(25, "ahead"))),
  sway: (s, f) => W16(swayAt(s, f, 1e9, 1e9)),
  dip: (s, f) => W16(swayAt({ a: s.a - T(1.2), b: s.b }, f, wordAt(28, "dipped"), wordAt(28, "recovered"))),
  finish: (s, f) => W16(finishAt(s, f, wordAt(29, "first"))),
  slid: (s, f) => { const st = slidAt(s, f, wordAt(33, "toppled") - 1, wordAt(33, "onto") + 4); return far(W16({ ...st, cam: { ...st.cam, look: [st.cam.look[0], st.cam.look[1] + 0.45, st.cam.look[2]] as V3 } }), 1.2); },
  // ---------------- the long-form's own ----------------
  // walked them cool after somebody else rode them to a win: the yard outside the barn, evening
  coolwalk: (s, f) => coolWalk(s, f, 0, 6), coolwalk2: (s, f) => coolWalk(s, f, 0.4, 7),
  // a horse running flat out has to lift off, clear the fence, and land: one jump, slowly
  jumpslow: (s, f) => overFence(s, f, FENCES[0], 3, 5.5, {}, 10),
  // ...again and again: the next fence, two horses
  jumpb: (s, f) => { const t0 = tt(s, f), fx = FENCES[1], x = fx + 10 - 12 * t0, h = [run(2, x, "gallop", 2), run(4, x + 5, "gallop", 3)];
    return { light: "day", horses: h, dof: 0.8, focus: IN(fx, 1.6, LANE(2)), puffs: [...kickUp(h[0], t0), ...kickUp(h[1], t0)],
      cam: wide(move({ pos: IN(fx - 9, 2.4, LANE(2) - 12), look: IN(fx + 1, 1.4, LANE(2) + 1), fov: 44, roll: 0.03 }, { pos: IN(fx - 8, 2.3, LANE(2) - 11.4), look: IN(fx, 1.4, LANE(2) + 1), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0)),
      subjects: [["the fence", IN(fx, 1.0, LANE(2)), 0.6]] }; },
  // and the rider has to stay on through every landing: close on a rider as his horse lands
  landing: (s, f) => overFence(s, f, FENCES[2], 4, 7.5, { expr: "nervous" }, 7.5),
  // Sweet Kiss over a fence in the race, Frank tight to her neck
  kissjump: (s, f) => overFence(s, f, FENCES[1], 0, 9, { expr: "stern" }, 9),
  // ...and the field went off over the fences: the five over the first fence, from behind and to the side
  belmont2: (s, f) => { const t0 = tt(s, f), fx = FENCES[0], x = fx + 14 - 13 * t0, h = field(x, 0);
    return { light: "day", horses: h, dof: 0.6, focus: IN(fx, 1.6, LANE(3)), puffs: h.flatMap((q) => kickUp(q, t0, 3)),
      cam: wide(move({ pos: IN(fx + 22, 3.2, LANE(3) - 14), look: IN(fx, 1.4, LANE(3)), fov: 42, roll: 0.03 }, { pos: IN(fx + 18, 3.0, LANE(3) - 13), look: IN(fx - 2, 1.4, LANE(3)), fov: 42, roll: -0.02 }, f, s.a, s.b, smooth, 0)),
      subjects: [["the field", IN(x, 1.5, LANE(2)), 2]] }; },
  // ...and Frank stayed on her back: the hook's tracking shot, earlier in the race
  hook2: (s, f) => { const st = FS.hook(asF(s), f - s.a); return { ...st, cam: wide(st.cam) }; },
  // He got to ride exactly one of his own: the hook again, the field behind
  hook3: (s, f) => { const st = FS.hook(asF(s), f - s.a + 30); return { ...st, cam: wide(st.cam) }; },
  // And that's when people saw something wrong: the crowd at the far rail
  saw: (s, f) => { const fx = 60;
    return { light: "day", dof: 1.5, focus: IN(fx, 1.6, DIRT.z1 + 1.3), people: fans(fx),
      cam: wide(move({ pos: IN(fx + 1.2, 1.6, DIRT.z1 - 5.6), look: IN(fx, 1.5, DIRT.z1 + 1.3), fov: 44, roll: 0.03 }, { pos: IN(fx + 0.8, 1.6, DIRT.z1 - 4.9), look: IN(fx, 1.55, DIRT.z1 + 1.3), fov: 42, roll: -0.02 }, f, s.a, s.b, smooth, 0)),
      subjects: [["the crowd", IN(fx, 1.6, DIRT.z1 + 1.3), 0.4]] }; },
  // An easy win, the paper said: the run past the post from further back, Gimme well behind
  firstwin2: (s, f) => { const t0 = tt(s, f), x = -4 - 13 * t0, h = field(x, 6, [{ pose: 0.45, expr: "neutral" }]);
    return { light: "day", horses: h, dof: 0.6, focus: add(h[0].p, 0, 1.6, 0),
      cam: wide(move({ pos: IN(x - 2, 3.0, -38), look: IN(x + 1, 1.4, LANE(2)), fov: 40, roll: 0.03 }, { pos: IN(x - 3, 2.8, -37), look: IN(x, 1.4, LANE(2)), fov: 40, roll: -0.02 }, f, s.a, s.b, smooth, 0)),
      subjects: [["Sweet Kiss", add(h[0].p, 0, 1.5, 0), 1]] }; },
  // Attendants started hurrying toward him: two men in white coats running in from the rail; Frank still up, slumped
  attend: (s, f) => { const t0 = tt(s, f), x = -62 - 1.4 * t0, h = run(0, x, "walk", 2, { pose: 0.95, expr: "neutral" }), ax = x - 6 + 2.6 * t0;
    return { light: "day", horses: [h], dof: 0.8, focus: add(h.p, 0, 1.6, 0),
      people: [P("att1", IN(ax, LANE(2) - 4.5 + 0.8 * t0), "nervous", 0, { side: { phase: (t0 * 2.6) % 1, mirror: true, stride: 1.1 } }), P("att2", IN(ax - 1.4, LANE(2) - 5.5 + 0.8 * t0), "nervous", 0, { side: { phase: (t0 * 2.6 + 0.4) % 1, mirror: true, stride: 1.1 } })],
      cam: wide(move({ pos: IN(x - 2, 2.6, LANE(2) - 16), look: IN(x - 2.5, 1.2, LANE(2) - 2), fov: 44, roll: 0.03 }, { pos: IN(x - 2.4, 2.5, LANE(2) - 15), look: IN(x - 3, 1.2, LANE(2) - 2), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0)),
      subjects: [["Frank", add(h.p, 0.1, 2.0, 0.3), 0.5]] }; },
  // One account says he sweated it off in a hot box: Frank's head out of the top of the cabinet, steam
  hotbox: (s, f) => { const t0 = tt(s, f), hb: V3 = Wr(3.6, 0, 1.2);
    return { light: "room", needle: 0, dof: 1.5, focus: add(hb, 0, 1.6, 0),
      people: [P("frank", add(hb, 0, 0.36, 0), "nervous", -1, { low: true })],
      puffs: Array.from({ length: 8 }, (_, i) => { const u = (t0 * 0.5 + i / 8) % 1; return { p: add(hb, (i % 3 - 1) * 0.3 + 0.1 * u, 1.6 + 0.9 * u, (i % 2 ? 0.25 : -0.25)), s: 0.25 + 0.5 * u, c: [0.95, 0.95, 0.95] as [number, number, number], a: 0.45 * (1 - u) }; }),
      cam: wide(move({ pos: add(hb, -1.6, 1.7, -3.4), look: add(hb, 0, 1.3, 0), fov: 46, roll: 0.03 }, { pos: add(hb, -1.3, 1.7, -3.0), look: add(hb, 0, 1.35, 0), fov: 46, roll: -0.02 }, f, s.a, s.b, smooth, 0)),
      subjects: [["Frank's head", add(hb, 0, 2.0, 0), 0.2]] }; },
  // Nobody can say exactly when his heart stopped: the post again, from the other side of the course
  strange2: (s, f) => W16({ light: "day", dof: 1, focus: IN(POST.x, 3.6, POST.z), cam: orbit(s, f, IN(POST.x, 3.0, POST.z), [20, 6], [13, 12], [0.8, 1.2], 44, [-0.03, 0.02]), subjects: [["the finish post", IN(POST.x, 4.5, POST.z), 0.4]] }),
  // Tell me in the comments: the empty course at evening, the post and the stand
  endpost: (s, f) => W16({ light: "eve", dof: 0.6, focus: IN(POST.x, 3, POST.z), cam: move({ pos: IN(POST.x - 14, 3.0, -30), look: IN(POST.x + 4, 3.0, POST.z), fov: 46, roll: 0.02 }, { pos: IN(POST.x - 12, 2.8, -27), look: IN(POST.x + 3, 3.0, POST.z), fov: 46, roll: -0.02 }, f, s.a, s.b, smooth, 0),
    subjects: [["the finish post", IN(POST.x, 4.5, POST.z), 0.4]] }),
  // the legend's version: halfway round, Frank already folded flat over her neck, still in the saddle all the way
  legendride: (s, f) => { const t0 = tt(s, f), x = 260 - 15 * t0, h = field(x, 2.6, [{ pose: 1, expr: "neutral" }]), k0 = h[0];
    return { light: "day", horses: h, dof: 1, focus: add(k0.p, 0, 1.8, 0), puffs: [...kickUp(h[0], t0), ...kickUp(h[1], t0 + 0.3)],
      cam: wide(move({ pos: add(k0.p, -1.0, 2.1, -10.4), look: add(k0.p, -0.6, 1.1, 0), fov: 44, roll: 0.03 }, { pos: add(k0.p, -1.8, 2.0, -9.6), look: add(k0.p, -0.8, 1.1, 0), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0)),
      subjects: [["Frank", add(k0.p, 0, 2.1, 0.3), 0.5]] }; },
  // What isn't a legend is the result: the board and the judges' stand together, both whole in the frame
  counted: (s, f) => { const bx = -86, st = FS.counted(asF(s), f);
    return { ...st, cam: wide(move({ pos: IN(bx + 5, 3.4, -26), look: IN(bx + 4.5, 3.4, 2), fov: 44, roll: 0.02 }, { pos: IN(bx + 4.6, 3.5, -24), look: IN(bx + 4.2, 3.5, 2), fov: 44, roll: -0.02 }, f, s.a, s.b, smooth, 0)) }; },
  // the thumbnail: Sweet Kiss at the post, Frank folded over her neck, the stand full behind
  thumb: (s, f) => { const x = 3.4, h = field(x, 3.0, [{ pose: 0.75, expr: "neutral" }]), k0 = h[0];
    return { light: "day", horses: h, dof: 1.2, focus: add(k0.p, 0, 1.8, 0), cam: { pos: add(k0.p, -2.2, 2.0, -8.6), look: add(k0.p, -1.6, 1.75, 0), fov: 30, roll: -0.02 } }; },
};
void clamp01; void U; void otherStalls; void AIS; void SC; void Tk; void LAST; void TURF; void V_RACE;

/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0026 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
const WHIP = new Set(["barn", "boss", "problem", "start", "jump", "finish", "judges", "doctor", "grave", "kissjump", "belmont2"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
