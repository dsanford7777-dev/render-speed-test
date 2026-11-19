// The Cahaba bridge Short (the 1896 wreck, the reward, the robbers nobody could find): where things stand.
// Three sets, far apart along x. In every set the cameras sit on the -z side looking toward +z, so world +x is screen LEFT.
//   gorge   the Cahaba River crossing: the river along z at the bottom of a deep cut, the track along x on the deck 30 m
//           up. Three stone piers carry two iron spans (the two that fell); timber trestles run out to both rims.
//           The train comes from +x (screen left). Posed as the morning of the wreck, the evening after, or today
//           (only the stone piers left).
//   town    a street in a coal town: a brick wall with the reward notice, the newspaper office, a company store,
//           miners' houses. Night (lamps) or day.
//   office  one room, dressed as the railroad's office in 1896 (desk, safe, wall map, a lamp) or as a records room
//           today (steel shelves of boxes, a table, a desk lamp).
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "gorge" | "town" | "office";
export const SET: Record<SetKey, V3> = { gorge: [0, 0, 0], town: [400, 0, 0], office: [700, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const Gg = at("gorge"), Tw = at("town"), Of = at("office");

// ---- the gorge ----
/** rail height above the river */
export const H = 30;
/** the three stone piers (x), and the two iron spans between them: A is the main span over the river */
export const PIER_X = [51, 17, -17];
export const SPAN_A: [number, number] = [-17, 17], SPAN_B: [number, number] = [17, 51];
/** the rims: the deck meets the ground at these x; timber trestles fill the gaps to the piers */
export const RIM_L = 78, RIM_R = -44;
/** the river: half width of the water, and the gravel bank on the +x side where people stand */
export const RIVER_HW = 9.5;
export const BANK: V3 = [14.5, 0.55, -6];
const sm = (a: number, b: number, x: number) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
/** ground height across the gorge (before the small noise the set adds) */
export const groundY = (x: number) => x > 0
  ? (x < RIVER_HW ? -0.8 : x < 12 ? -0.8 + 1.35 * sm(RIVER_HW, 12, x) : x < 21 ? 0.55 + 0.5 * sm(12, 21, x) : 1.05 + (H - 1.05) * sm(21, RIM_L - 1, x))
  : (x > -RIVER_HW ? -0.8 : -0.8 + (H + 0.8) * sm(-RIVER_HW, RIM_R + 1, x));
/** the train: car lengths and the gaps between them, front (engine) first; x of a car's centre = trainX + CAR_AT[i] */
export const CARS = [{ k: "engine", len: 9.5 }, { k: "tender", len: 6 }, { k: "baggage", len: 11 }, { k: "coach", len: 13 }, { k: "coach", len: 13 }] as const;
export const CAR_AT = (() => { const out: number[] = []; let x = 0; CARS.forEach((c, i) => { x += i ? CARS[i - 1].len / 2 + 0.7 + c.len / 2 : 0; out.push(x); }); return out; })();
/** the engineer's spot in the cab, relative to the engine's centre (the cab is at the back of the engine, +x) */
export const CAB = { x: 3.3, y: 1.55, z: -0.55 };
export const GORGE_SUN: V3 = [0.55, 0.36, -0.75];

// ---- the town ----
/** the brick wall with the reward notice: the poster's centre, facing -z */
export const POSTER: V3 = [0, 2.25, 3.0];
export const WALL_Z = 3.06;
/** the lamp post by the wall */
export const TLAMP: V3 = [-2.3, 3.1, 1.9];
export const TOWN_SUN: V3 = [-0.5, 0.5, -0.7];

// ---- the office ----
export const ROOM = { w: 4.6, z0: -5.5, z1: 3.6, h: 3.1 };
/** the desk: top height, centre; the lamp on it */
export const DESK = { y: 0.8, x: 0, z: 1.2, hw: 1.15, hd: 0.55 };
export const DLAMP: V3 = [-0.8, 1.32, 1.35];

// ---- the fall ----
const c01 = (x: number) => Math.max(0, Math.min(1, x));
/** where car i is when the engine's centre is at x (set coordinates) and the collapse has run to `fall` (0 = on the
 *  rails, about 1.1 = everything in the river). p is the car's centre at rail level. */
export const carPose = (x: number, i: number, fall: number) => { const k = c01(fall * 1.4 - 0.1 * i), s = i % 2 ? -1 : 1;
  return { p: [x + CAR_AT[i] - 3 * k, H - (H - 1.6) * k * k, 0.8 * k * s] as V3, rz: 0.55 * k * (s > 0 ? 1 : -0.6), rx: 0.3 * k * s, on: k < 1 }; };
/** the two iron spans under the same collapse */
export const spanPose = (i: number, fall: number) => { const k = c01(fall * 1.4 - 0.05 - 0.15 * i), [a, c] = i ? SPAN_B : SPAN_A;
  return { p: [(a + c) / 2, H - (H - 4) * k * k, 0] as V3, rz: (i ? -0.35 : 0.3) * k, rx: 0.15 * k * (i ? 1 : -1), on: k < 1 }; };
