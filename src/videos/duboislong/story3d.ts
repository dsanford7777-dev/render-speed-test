// The Dubois long-form's 3D shots: the Short's four sets and cast (../dubois), re-shot for 16:9.
// Short specs are reused through R(): the shot is played on the Short's own clock (so a kick timed to a word lands at the
// same moment after the cut), and the camera's vertical field of view is narrowed so the framing keeps roughly the
// portrait shot's width. The long-form's own shots are written for 16:9 directly.
// Cameras sit on the -z side looking toward +z (world +x is screen LEFT).
import { SPECS as FS, SHOTS as SSH, St3, Cam, ShotDef as FShot, V3, smooth, L3, move, orbit, secs, P, horse, add, head, hookState, PO, POSIGN, SIGN_MAN, SIGN_TOP, HOOK_POS, HOOK_LOOK, TBL, LAMP_K, WIN_K, BOARD, FRED, ROB, SH1, SH2, SHK, Ms } from "../dubois/story";
import { Rv, Rm, POST, BLD_Z, WSIGN, TABLE, DESK, DESK_Y, MAP, CHAPEL_Z, MHOUSE, riverY } from "../dubois/place";
/** a horse on the settlement ground at set-local x, z */
const gy = (x: number, z: number) => riverY(x, z);
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
/** aim the camera lower (subjects sit higher in frame, clear of the captions) */
const up = (st: St3, dy: number): St3 => ({ ...st, cam: { ...st.cam, look: add(st.cam.look, 0, -dy, 0) } });
const mv = (s: ShotDef, f: number, a: Partial<Cam> & { pos: V3; look: V3 }, b: Partial<Cam> & { pos: V3; look: V3 }) => move(a, b, f, s.a, s.b, smooth, 0);
const DESK_P: V3 = Rm(DESK[0] - 0.05, 0, DESK[2] - 0.75);

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  hook: R("hook", (st) => far(st, 1.25)), tourist: R("tourist"), stare: R("stare"), today: R("today"),
  // ...on purpose (16:9): from the far side of the track, the sign well out of frame
  purpose: (s, f) => ({ ...hookState("grin"), light: "today", dof: 1, closeup: true, focus: head(SIGN_MAN), people: [P("local", SIGN_MAN, "grin", 0, { headTilt: 0.12 })],
    cam: mv(s, f, { pos: add(SIGN_MAN, -2.7, 1.3, -0.5), look: head(SIGN_MAN, 1.3), fov: 36, roll: -0.03 }, { pos: add(SIGN_MAN, -2.5, 1.3, -0.45), look: head(SIGN_MAN, 1.3), fov: 36, roll: 0.02 }),
    subjects: [["the local", head(SIGN_MAN), 0.2]] }) as St3,
  valley: R("valley"), roberts: R("roberts", (st) => far(st, 1.4)), fred: R("fred", (st) => far(st, 1.4)), ranchers: R("ranchers"), miles: R("miles"), mail: R("mail"), wanted: R("wanted"),
  write: R("write"), mission: R("mission"), nick: R("nick", (st) => far(st, 1.2)), tibo: R("tibo"), clerk: R("clerk"), red: R("red", (st) => far(st, 1.7)), letter: R("letter", (st) => far(st, 1.2)), who: R("who"),
  himself: R("himself"), friend: R("friend", (st) => far(st, 1.15)), congress: R("congress"), barely: R("barely", (st) => far(st, 1.35)), map: R("map"),
  town: R("town"), twist: R("twist", (st) => far(st, 1.4)), boys: R("boys", (st) => far(st, 1.4)), shout: R("shout", (st) => far(st, 1.2)), every: R("every"), wink: R("wink", (st) => far(st, 1.4)),
  butch: R("butch"), creek: R("creek", (st) => far(st, 1.35)),
  // ---------------- the long-form's own ----------------
  // the subscribe ask (card on the right): the local at the sign, kept to the left of frame
  hookL: (s, f) => ({ ...hookState("grin"), light: "today", dof: 0.6, focus: head(SIGN_MAN),
    cam: mv(s, f, { pos: add(SIGN_MAN, -1.6, 1.4, -4.0), look: add(SIGN_MAN, -1.0, 1.75, 1.2), fov: 38, roll: 0.02 }, { pos: add(SIGN_MAN, -1.4, 1.4, -3.6), look: add(SIGN_MAN, -0.9, 1.75, 1.2), fov: 38, roll: -0.02 }) }) as St3,
  // ...the end ask: the same, from the other side
  hookR: (s, f) => ({ ...hookState("laugh"), light: "today", dof: 0.6, focus: head(SIGN_MAN),
    cam: mv(s, f, { pos: add(SIGN_MAN, -1.7, 1.35, -3.8), look: add(SIGN_MAN, -1.05, 1.7, 1.2), fov: 38, roll: -0.02 }, { pos: add(SIGN_MAN, -1.5, 1.35, -3.4), look: add(SIGN_MAN, -0.95, 1.7, 1.2), fov: 38, roll: 0.02 }) }) as St3,
  // In the late 1880s, the upper Wind River valley: a slow wide pan over the creek, the cabins small, the peaks
  valley2: (s, f) => ({ light: "valley", dof: 0, focus: Rv(-10, 2, 20), posign: false,
    cam: mv(s, f, { pos: Rv(30, 9, -18), look: Rv(-20, 2, 30), fov: 40, roll: 0.02 }, { pos: Rv(22, 10, -20), look: Rv(-30, 2.5, 30), fov: 40, roll: -0.02 }),
    subjects: [["the valley", Rv(-10, 1, 24), 4]] }),
  // ...red badlands and mountains: low over the sage toward the striped buttes and the peaks
  badlands: (s, f) => ({ light: "valley", dof: 0, focus: Rv(40, 2, 60), posign: false,
    cam: mv(s, f, { pos: Rv(12, 0.9, -6), look: Rv(40, 3.5, 60), fov: 36, roll: -0.02 }, { pos: Rv(16, 1.2, -6), look: Rv(46, 4.0, 60), fov: 36, roll: 0.02 }),
    subjects: [["the far bench", Rv(40, 2, 50), 8]] }),
  // ...raising cattle and horses: the corral, two horses in it, a rancher at the rails
  corral: (s, f) => { const p = Rv(18, gy(18, 6.3), 6.3);
    return { light: "valley", dof: 0.4, focus: Rv(20, 1.2, 10), posign: false, people: [P("r2", p, "grin", -1)],
      horses: [{ k: 2, p: Rv(22, gy(22, 10.5), 10.5), yaw: Math.PI, gait: "stand", phase: 0, head: 0.6 }, { k: 3, p: Rv(16, gy(16, 11.8), 11.8), yaw: 0.3, gait: "walk", phase: tt(s, f) * 0.9, head: 0.2 }],
      cam: mv(s, f, { pos: Rv(19.5, 1.6, -0.6), look: Rv(19.5, 1.2, 10), fov: 38, roll: 0.02 }, { pos: Rv(17.5, 1.7, -0.4), look: Rv(18.5, 1.2, 10), fov: 38, roll: -0.02 }),
      subjects: [["the rancher", head(p), 0.2], ["the horses", Rv(22, 1.4, 10.5), 0.6]] }; },
  // For about a year, settlers packed the mail from the fort: the rider unloads the sack at Smith's cabin
  mail2: (s, f) => { const h = { k: 0, p: Rv(POST.x + 5.4, 0, 3.2), yaw: Math.PI, gait: "stand" as const, phase: 0, head: 0.3 }, a = PO(1.2, 3.6), r = PO(2.4, 2.9), hand = add(r, -0.3, 1.2, -0.3);
    return { light: "valley", dof: 0.6, focus: L3(head(a), head(r), 0.5), posign: false, horses: [h], people: [P("rider", r, "grin", 1, { hw: [hand] }), P("smith", a, "grin", -1)],
      cards: [{ kind: "sack", p: add(hand, -0.05, 0.0, -0.05), spin: 0.1, s: 1 }],
      cam: mv(s, f, { pos: add(a, 1.0, 1.5, -5.5), look: add(L3(a, r, 0.5), 1.0, 1.2, 0), fov: 40, roll: 0.02 }, { pos: add(a, 0.8, 1.5, -5.0), look: add(L3(a, r, 0.5), 1.0, 1.2, 0), fov: 40, roll: -0.02 }),
      subjects: [["Smith", head(a), 0.2], ["the mail sack", add(hand, -0.05, 0, -0.05), 0.15]] }; },
  // ...the cabin of a rancher named Charles Smith: Smith at his door
  smithdoor: (s, f) => { const a = PO(-0.4, 4.6);
    return { light: "valley", dof: 0.7, focus: head(a), posign: false, people: [P("smith", a, "grin", 0, { wave: 0.6 })],
      cam: mv(s, f, { pos: add(a, 0.6, 1.4, -4.2), look: add(a, 0.2, 1.6, 1.0), fov: 38, roll: -0.02 }, { pos: add(a, 0.4, 1.4, -3.8), look: add(a, 0.2, 1.6, 1.0), fov: 38, roll: 0.02 }),
      subjects: [["Charles Smith", head(a), 0.2]] }; },
  // ...a post office needs a name / the meeting on Horse Creek: five men round the table in the cabin, the old trapper among them
  meeting: (s, f) => { const tb = TBL, a = Rm(TABLE[0] - 0.95, 0, TABLE[2] - 0.35), b = Rm(TABLE[0] + 0.95, 0, TABLE[2] - 0.25), c = Rm(TABLE[0] - 0.55, 0, TABLE[2] + 0.75), d = Rm(TABLE[0] + 0.5, 0, TABLE[2] + 0.85), e = Rm(TABLE[0] + 0.05, 0, TABLE[2] + 1.25);
    return { light: "cabin", dof: 0.7, focus: add(tb, 0, 0.7, 0.4), key: LAMP_K, people: [P("smith", a, "grin", 1), P("simpson", b, "neutral", -1), P("r1", c, "grin", 1), P("trapper", d, "laugh", -1), P("r3", e, "neutral", 0)],
      cards: [{ kind: "paper", p: add(tb, -0.12, 0.012, -0.12), spin: 0.2, s: 1.4, flat: true }],
      cam: orbit({ id: s.id, g: s.g, a: s.a, b: s.b, k: "3d" }, f, add(tb, 0, 0.8, 0.45), [-18, 10], [4.8, 4.5], [0.75, 0.6], 40),
      subjects: [["the settlers", add(tb, 0, 0.9, 0.5), 0.6]] }; },
  // He arrived in a winter... : the chapel and the mission house on the prairie, wide
  chapel: (s, f) => ({ light: "mission", dof: 0, focus: Ms(-3, 4, CHAPEL_Z + 3),
    cam: mv(s, f, { pos: Ms(10, 2.4, CHAPEL_Z - 16), look: Ms(-3, 4.0, CHAPEL_Z + 3), fov: 38, roll: 0.02 }, { pos: Ms(6, 3.4, CHAPEL_Z - 17), look: Ms(-4, 4.5, CHAPEL_Z + 3), fov: 38, roll: -0.02 }),
    subjects: [["the chapel", Ms(0, 3, CHAPEL_Z - 0.4), 1], ["the mission house", Ms(MHOUSE[0], 1.6, MHOUSE[2] - 0.1), 1]] }),
  // ...and he served the homesteaders on Horse Creek, too: Roberts with Smith before the cabin
  visit: (s, f) => { const a = PO(0.6, 3.6), b = PO(-0.5, 3.5);
    return { light: "valley", dof: 0.8, focus: L3(head(a), head(b), 0.5), posign: false, people: [P("roberts", a, "grin", -1, { facing: -1 }), P("smith", b, "grin", 1, { facing: 1 })],
      cam: mv(s, f, { pos: add(L3(a, b, 0.5), 0.6, 1.4, -4.2), look: add(L3(a, b, 0.5), 0, 1.35, 0.4), fov: 38, roll: 0.02 }, { pos: add(L3(a, b, 0.5), 0.3, 1.4, -3.8), look: add(L3(a, b, 0.5), 0, 1.35, 0.4), fov: 38, roll: -0.02 }),
      subjects: [["Roberts", head(a), 0.2], ["Smith", head(b), 0.2]] }; },
  // So the settlers picked Tibo: the settlers nod together before the cabin
  town2: (s, f) => { const a = PO(1.2, 3.8), b = PO(0.0, 3.5), c = PO(-1.2, 3.9);
    return { light: "valley", dof: 0.6, focus: head(b), posign: false, people: [P("smith", a, "grin", -1), P("r1", b, "grin", 0), P("wife1", c, "grin", 1)],
      cam: mv(s, f, { pos: add(b, 1.4, 1.3, -5.2), look: add(b, 0, 1.6, 0.8), fov: 38, roll: -0.02 }, { pos: add(b, 1.0, 1.3, -4.7), look: add(b, 0, 1.6, 0.8), fov: 38, roll: 0.02 }),
      subjects: [["the settlers", head(b), 0.4]] }; },
  // ...with Charles Smith as its first postmaster: Smith under the new sign, proud
  postmaster: (s, f) => { const a = PO(0.2, 4.4);
    return { light: "valley", dof: 0.6, focus: head(a), people: [P("smith", a, "grin", 0, { headTilt: -0.08 })],
      cam: mv(s, f, { pos: add(a, 0.4, 1.0, -4.6), look: add(a, 0.1, 2.3, 1.0), fov: 40, roll: 0.02 }, { pos: add(a, 0.3, 1.1, -4.2), look: add(a, 0.1, 2.3, 1.0), fov: 40, roll: -0.02 }),
      subjects: [["Smith", head(a), 0.2], ["the post office sign", POSIGN, 0.3]] }; },
  // ...Smith couldn't even write: Smith squints at the form, Simpson takes the pen
  write2: (s, f) => { const a = Rm(TABLE[0] - 0.25, 0, TABLE[2] - 0.8), b = Rm(TABLE[0] + 0.65, 0, TABLE[2] - 0.45);
    return { light: "cabin", dof: 1, focus: head(b), key: LAMP_K, people: [P("simpson", a, "grin", 0), P("smith", b, "nervous", 1, { headTilt: 0.15 })],
      cards: [{ kind: "paper", p: add(TBL, -0.12, 0.012, -0.12), spin: 0.2, s: 1.4, flat: true }],
      cam: mv(s, f, { pos: add(b, 0.9, 1.35, -3.2), look: add(L3(a, b, 0.5), 0.2, 1.25, 0), fov: 38, roll: 0.02 }, { pos: add(b, 0.7, 1.35, -2.9), look: add(L3(a, b, 0.5), 0.2, 1.25, 0), fov: 38, roll: -0.02 }),
      subjects: [["Smith", head(b), 0.2], ["Simpson", head(a), 0.2]] }; },
  // ...a young man named Billy Simpson: Simpson, close, writing
  simpson: (s, f) => { const a = Rm(TABLE[0] - 0.25, 0, TABLE[2] - 0.8), hand = add(TBL, -0.2, 0.04, -0.3);
    return { light: "cabin", dof: 1, focus: head(a), key: LAMP_K, people: [P("simpson", a, "grin", 0, { hw: [hand], headTilt: 0.12 })],
      cards: [{ kind: "paper", p: add(TBL, -0.12, 0.012, -0.12), spin: 0.2, s: 1.4, flat: true }],
      cam: mv(s, f, { pos: add(a, 0.6, 1.3, -2.6), look: add(a, 0.3, 1.25, 0.2), fov: 36, roll: -0.02 }, { pos: add(a, 0.5, 1.3, -2.4), look: add(a, 0.3, 1.25, 0.2), fov: 36, roll: 0.02 }),
      subjects: [["Billy Simpson", head(a), 0.2]] }; },
  // In 1937, Billy Simpson, by then a lawyer in Jackson: old Simpson at his desk, the newspaper on the board behind
  lawyer: (s, f) => ({ light: "office", dof: 0.5, focus: head(DESK_P), key: Rm(DESK[0] - 0.55, DESK_Y + 0.6, DESK[2] + 0.1), page: "news", people: [P("simpsonold", DESK_P, "grin", 0)],
    cam: mv(s, f, { pos: Rm(-1.0, 1.5, DESK[2] - 5.2), look: Rm(-0.1, 1.7, DESK[2]), fov: 38, roll: 0.02 }, { pos: Rm(-0.7, 1.55, DESK[2] - 4.6), look: Rm(-0.1, 1.72, DESK[2]), fov: 38, roll: -0.02 }),
    subjects: [["Simpson", head(DESK_P), 0.2], ["the newspaper", BOARD, 0.3]] }),
  // ...a family named Dubois he knew in Colorado: old Simpson remembering, close
  lawyer2: (s, f) => ({ light: "office", dof: 1, focus: head(DESK_P), key: Rm(DESK[0] - 0.55, DESK_Y + 0.6, DESK[2] + 0.1), page: "news", people: [P("simpsonold", DESK_P, "whistle", 1, { headTilt: 0.1 })],
    cam: mv(s, f, { pos: add(DESK_P, 1.1, 1.3, -3.8), look: add(DESK_P, 0.3, 1.55, 0.3), fov: 38, roll: -0.02 }, { pos: add(DESK_P, 1.0, 1.3, -3.5), look: add(DESK_P, 0.3, 1.55, 0.3), fov: 38, roll: 0.02 }),
    subjects: [["Simpson", head(DESK_P), 0.2]] }),
  // ...an excited old French trapper, shouting: the woods! the woods!: the trapper, close, arms up
  trapper: (s, f) => { const d = Rm(TABLE[0] + 0.5, 0, TABLE[2] + 0.85);
    return { light: "cabin", dof: 1, focus: head(d), key: LAMP_K, people: [P("trapper", d, "laugh", 0, { wave: 1, headTilt: 0.1 })],
      cam: mv(s, f, { pos: add(d, 0.6, 1.35, -2.9), look: add(d, 0.25, 1.4, 0.2), fov: 36, roll: 0.03 }, { pos: add(d, 0.5, 1.35, -2.6), look: add(d, 0.25, 1.4, 0.2), fov: 36, roll: -0.03 }),
      subjects: [["the trapper", head(d), 0.2]] }; },
  // When Idaho became a state, he became its senator: Dubois, chest out, kept left
  fredL: (s, f) => ({ light: "capitol", dof: 0.8, focus: head(FRED), key: WIN_K, page: "map", people: [P("dubois", FRED, "grin", 0, { headTilt: -0.1 })],
    cam: mv(s, f, { pos: add(FRED, -0.9, 1.35, -3.2), look: add(FRED, -0.55, 1.45, 0.5), fov: 36, roll: 0.02 }, { pos: add(FRED, -0.8, 1.35, -2.9), look: add(FRED, -0.5, 1.45, 0.5), fov: 36, roll: -0.02 }),
    subjects: [["Fred Dubois", head(FRED), 0.2]] }),
  // So the people of Dubois said boys: the settlers, wider, before the post office
  town3: R("town", (st) => far(st, 1.2)),
  // To this day, signs in town spell it out: the sign today, the DOO-BOYS plate, close and low
  signL: (s, f) => ({ light: "today", dof: 0.4, focus: Rv(WSIGN[0], 1.9, WSIGN[2]), plate: true,
    cam: mv(s, f, { pos: Rv(WSIGN[0] + 0.6, 1.4, WSIGN[2] - 4.8), look: Rv(WSIGN[0], 1.9, WSIGN[2]), fov: 44, roll: 0.02 }, { pos: Rv(WSIGN[0] + 0.3, 1.45, WSIGN[2] - 4.3), look: Rv(WSIGN[0], 1.9, WSIGN[2]), fov: 44, roll: -0.02 }),
    subjects: [["the town's sign", SIGN_TOP, 0.3], ["the plate", Rv(WSIGN[0], 1.15, WSIGN[2] - 0.15), 0.2]] }),
  // ...maybe it's just how cowboys read the word: two ranchers squint at the post office sign
  cowboys: (s, f) => { const a = PO(0.5, 2.4), b = PO(-0.6, 2.3);
    return { light: "valley", dof: 0.6, focus: L3(head(a), head(b), 0.5), people: [P("r2", a, "nervous", 0, { headTilt: 0.15 }), P("r3", b, "nervous", 0, { headTilt: -0.12 })],
      cam: mv(s, f, { pos: add(L3(a, b, 0.5), 0.4, 1.2, -4.0), look: add(L3(a, b, 0.5), 0, 2.2, 2.0), fov: 40, roll: 0.02 }, { pos: add(L3(a, b, 0.5), 0.2, 1.2, -3.6), look: add(L3(a, b, 0.5), 0, 2.2, 2.0), fov: 40, roll: -0.02 }),
      subjects: [["the ranchers", L3(head(a), head(b), 0.5), 0.3], ["the post office sign", POSIGN, 0.3]] }; },
  // The little post office also had an interesting new neighbor: a rider far off across the creek, coming in
  butchfar: (s, f) => { const x = 30 - 2.0 * tt(s, f);
    return { light: "valley", dof: 0, focus: Rv(x, 4, 38.5), horses: [horse(1, Rv(x, 0, 0)[0], gy(x, 38.5), 38.5, -2.0, "walk", "butch", "grin"), horse(2, Rv(x + 3.0, 0, 0)[0], gy(x + 3, 39.6), 39.6, -2.0, "walk", null), horse(3, Rv(x + 5.6, 0, 0)[0], gy(x + 5.6, 38.9), 38.9, -2.0, "walk", null)],
      cam: mv(s, f, { pos: Rv(POST.x + 14, 1.8, 6), look: Rv(24, 4.2, 38.5), fov: 36, roll: 0.02 }, { pos: Rv(POST.x + 14, 1.9, 6.5), look: Rv(20, 4.2, 38.5), fov: 36, roll: -0.02 }),
      subjects: [["the rider", Rv(x, gy(x, 38.5) + 2.2, 38.5), 0.6]] }; },
  // ...and a love of horse racing: Butch's horses trotting past along the bank, low
  herd: (s, f) => { const x = 14 - 3.0 * tt(s, f);
    return { light: "valley", dof: 0.3, focus: Rv(x, 1.6, 10.6), horses: [horse(1, Rv(x, 0, 0)[0], gy(x, 10.6), 10.6, -3.0, "trot", "butch", "grin"), horse(2, Rv(x + 2.8, 0, 0)[0], gy(x + 2.8, 11.9), 11.9, -3.0, "trot", null), horse(3, Rv(x + 5.4, 0, 0)[0], gy(x + 5.4, 11.0), 11.0, -3.0, "trot", null)],
      cam: mv(s, f, { pos: Rv(13, 0.8, 3.0), look: Rv(12, 1.6, 10.6), fov: 38, roll: -0.02 }, { pos: Rv(14 - 3.0 * secs(s.b - s.a) + 1.0, 0.8, 3.2), look: Rv(14 - 3.0 * secs(s.b - s.a) + 0.6, 1.6, 10.6), fov: 38, roll: 0.02 }),
      subjects: [["the horses", Rv(x + 2.8, 1.4, 11.9), 0.6]] }; },
  // He and a partner, Al Hainer, started a ranch on Horse Creek: Butch and Hainer by the corral
  ranch: (s, f) => { const a = Rv(16.5, gy(16.5, 5.8), 5.8), b = Rv(15.3, gy(15.3, 5.6), 5.6);
    return { light: "valley", dof: 0.7, focus: L3(head(a), head(b), 0.5), people: [P("butch", a, "grin", -1, { facing: -1 }), P("hainer", b, "neutral", 1, { facing: 1 })],
      horses: [{ k: 2, p: Rv(19, gy(19, 10.5), 10.5), yaw: Math.PI, gait: "stand", phase: 0, head: 0.6 }],
      cam: mv(s, f, { pos: add(L3(a, b, 0.5), 0.8, 1.4, -4.2), look: add(L3(a, b, 0.5), 0.2, 1.35, 0.6), fov: 38, roll: 0.02 }, { pos: add(L3(a, b, 0.5), 0.5, 1.4, -3.8), look: add(L3(a, b, 0.5), 0.2, 1.35, 0.6), fov: 38, roll: -0.02 }),
      subjects: [["Butch Cassidy", head(a), 0.2], ["Al Hainer", head(b), 0.2]] }; },
  // Neversweat was a tiny post office about 15 miles away: the valley again, empty, wide
  valley3: (s, f) => ({ light: "valley", dof: 0, focus: Rv(50, 2, 50),
    cam: mv(s, f, { pos: Rv(-6, 4.5, -10), look: Rv(50, 3, 60), fov: 38, roll: 0.02 }, { pos: Rv(-2, 5.0, -11), look: Rv(56, 3.2, 60), fov: 38, roll: -0.02 }),
    subjects: [["the valley", Rv(40, 2, 50), 8]] }),
  // Dubois finally became an incorporated town in 1914 / today: crane over the sign and the old cabins
  todaywide: (s, f) => ({ light: "today", dof: 0, focus: Rv(-6, 2, 6), people: [P("local", SIGN_MAN, "grin", 1, { extra: true }), P("local2", add(SIGN_MAN, -1.3, 0, 0.4), "grin", -1, { extra: true })],
    cam: mv(s, f, { pos: Rv(14, 3.0, -12), look: Rv(-6, 2.0, 8), fov: 40, roll: 0.02 }, { pos: Rv(12, 8.0, -14), look: Rv(-8, 1.2, 10), fov: 40, roll: -0.02 }),
    subjects: [["the town", Rv(-10, 2, 6), 3]] }),
  // And Tibo? It never made it onto a map: the chapel at the mission, Roberts and his friends, a last look
  chapel2: (s, f) => ({ light: "mission", dof: 0.3, focus: head(ROB), people: [P("roberts", ROB, "grin", 1), P("sh1", SH1, "grin", -1), P("sh2", SH2, "grin", -1), P("shkid", SHK, "laugh", 1)],
    cam: mv(s, f, { pos: Ms(1.4, 1.4, CHAPEL_Z - 8.0), look: Ms(0.2, 1.75, CHAPEL_Z - 1.5), fov: 36, roll: 0.02 }, { pos: Ms(0.8, 1.45, CHAPEL_Z - 7.4), look: Ms(0.1, 1.75, CHAPEL_Z - 1.5), fov: 36, roll: -0.02 }),
    subjects: [["Roberts", head(ROB), 0.2]] }),
  // the thumbnail: the local under the town's sign, grinning
  thumb: () => ({ ...hookState("grin"), light: "today", dof: 0.6, focus: head(SIGN_MAN), cam: { pos: add(SIGN_MAN, 1.35, 1.55, -2.6), look: add(SIGN_MAN, 0.95, 2.0, 1.0), fov: 46, roll: 0.02 } }) as St3,
};
void HOOK_POS; void HOOK_LOOK; void MAP; void up;
/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0026 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
const WHIP = new Set(["valley", "write", "tibo", "mission", "clerk", "fred", "who", "twist", "town", "today", "butch", "valley2", "meeting", "lawyer", "chapel", "butchfar", "todaywide"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
