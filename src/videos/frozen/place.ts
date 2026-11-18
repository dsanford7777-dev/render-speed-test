// The Frozen Graves Short (Longyearbyen, the 1918 flu, the 1998 dig, Hultin in Alaska): where things stand.
// Six sets, each far from the others along x. In every set the cameras sit on the -z side looking toward +z,
// so world +x is screen LEFT.
//   grave   the hillside cemetery above Longyear City: seven white crosses in the top row, a fence, coal-cableway
//           trestles on the slope, the mountain behind. Posed as 1918 (snow, night, lanterns), 1998 (bare scree, the
//           white tent, the dig) or today (snow, blue twilight).
//   quay    the coal quay in 1918: a timber pier on pilings, the steamship Forsete alongside, coal heaps and a store shed
//   ward    the company hospital at night: seven iron beds, a candle by each, a hanging lamp, a stove
//   cut     the ground cut open like a diorama: the thawing top layer, the frozen layer under it, the coffins
//   alaska  Brevig Mission, 1997: tundra, small houses, a church, the mass grave under two big crosses, a bush plane
//   lab     a pathology lab, 1997: benches, a microscope, a freezer, a computer reading out the virus
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "grave" | "quay" | "ward" | "cut" | "alaska" | "lab";
export const SET: Record<SetKey, V3> = { grave: [0, 0, 0], quay: [200, 0, 0], ward: [400, 0, 0], cut: [600, 0, 0], alaska: [800, 0, 0], lab: [1000, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const Gv = at("grave"), Qy = at("quay"), Wd = at("ward"), Ct = at("cut"), Ak = at("alaska"), Lb = at("lab");

// ---- the cemetery ----
/** the seven crosses (x of each, all at z = CROSS_Z) */
export const CROSS_X = [2.7, 1.8, 0.9, 0, -0.9, -1.8, -2.7];
export const CROSS_Z = 3.25;
/** the pit the 1998 team dug in front of the crosses, its depth, and where the coffin lids were found */
export const PIT = { x0: -3.15, x1: 3.15, z0: 0.85, z1: 3.0, d: 1.25 };
export const LID_Y = -0.82;
/** the terrace is flat to z = HILL_Z, then the hillside climbs */
export const HILL_Z = 8, HILL_K = 0.42;
export const hillY = (z: number) => (z <= HILL_Z ? 0 : HILL_K * (z - HILL_Z));
/** the white tent of 1998 */
export const TENT = { x0: -3.7, x1: 3.7, z0: 0.3, z1: 3.9, eave: 1.95, ridge: 2.75 };
/** the radar cart's path across the graves */
export const RADAR_Z = 2.0;
/** the sun in the grave set: low, from behind the camera's right shoulder (1998), the lantern side at night */
export const GRAVE_SUN: V3 = [-0.55, 0.42, -0.72];

// ---- the quay ----
/** pier deck height, half width, near and far ends; the shore starts at z = SHORE_Z */
export const PIER = { y: 1.25, hw: 2.6, z0: -34, z1: 14 };
export const SHORE_Z = 14;
/** the ship lies along the pier on its +x side (screen left): hull x span, z span, deck height above the water */
export const SHIP = { x0: 3.3, x1: 9.5, z0: -28, z1: 6, deck: 3.3 };
/** where the gangway comes down onto the pier */
export const GANG: V3 = [2.4, 1.25, -8];
export const QUAY_SUN: V3 = [0.5, 0.32, -0.8];

// ---- the ward ----
/** half width, front wall z, back wall z, height */
export const WARD = { w: 5.6, z0: -6, z1: 4.6, h: 3.2 };
/** the seven beds along the back wall: x of each; the candle stools stand at the bed head's left */
export const BED_X = [4.2, 2.8, 1.4, 0, -1.4, -2.8, -4.2];
export const BED_Z = 3.2;

// ---- the cut ----
/** the block of ground: half width, front face z, top, the frozen layer's top, bottom */
export const CUT = { w: 4.4, z: -0.6, top: 0, ice: -1.2, bot: -3.1 };

// ---- Alaska ----
/** the mass grave: centre, the pit Hultin dug, the two crosses */
export const MASS: V3 = [0, 0, 3.5];
export const APIT = { x0: -1.3, x1: 1.3, z0: 2.2, z1: 4.6, d: 1.9 };
export const ALASKA_SUN: V3 = [0.45, 0.38, -0.8];

// ---- the lab ----
export const LAB = { w: 5.2, z0: -6, z1: 4.0, h: 3.0 };
/** the bench top height and the microscope / monitor spots */
export const BENCH_Y = 0.92;
export const SCOPE: V3 = [0.9, 0.92, 2.6];
export const SCREEN: V3 = [-1.1, 0.92, 2.9];
