// The Captain of Koepenick Short (1906: a shoemaker in a junk-shop uniform takes over a town hall): where things stand.
// Three sets, far apart along x. In every set the cameras sit on the -z side looking toward +z, so world +x is screen LEFT.
//   street  a Berlin street at noon: a row of stucco fronts along z = WZ (the junk dealer, the tailor, the gate of the
//           army swimming baths, the station), cobbles, a pavement, an advertising column, lamp posts.
//   square  the town square in Koepenick in the afternoon: the red-brick town hall along z = TZ with its tower, its arched
//           gate (two iron leaves that open) and, beside the gate, the board that lists the offices inside (no passport
//           office), cobbles, lamps, trees, houses either side.
//   room    one room dressed five ways: the junk shop, the beer hall (the hook), the mayor's office (also the treasury),
//           the Kaiser's study, the Luxembourg passport counter.
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "street" | "square" | "room";
export const SET: Record<SetKey, V3> = { street: [0, 0, 0], square: [400, 0, 0], room: [700, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const St = at("street"), Sq = at("square"), Rm = at("room");

// ---- the street ----
/** the house fronts, the kerb, the pavement height */
export const WZ = 8, KERB = 5.6, PAVE = 0.16;
/** door centres along the fronts (x): junk dealer, tailor, the baths gate, the station entrance */
export const JUNK_X = 11, TAILOR_X = 4, BATHS_X = -4.5, STATION_X = -15;
/** the advertising column */
export const COLUMN: V3 = [0.6, 0, 5.0];
export const STREET_SUN: V3 = [0.45, 0.8, -0.4];

// ---- the square ----
/** the town hall front, the gate (centre x, width, height), the board of offices beside it */
export const TZ = 12, GATE = { x: 0, w: 3.6, h: 4.6 }, BOARD: V3 = [3.1, 2.0, TZ - 0.06];
/** the tower (x of its centre) */
export const TOWER_X = -7;
export const SQUARE_SUN: V3 = [-0.55, 0.55, -0.62];

// ---- the room ----
export const ROOM = { w: 4.6, z0: -5.5, z1: 3.6, h: 3.4 };
/** the desk (mayor, Kaiser, passport counter use it): top height, centre, half sizes */
export const DESK = { y: 0.8, x: 0, z: 1.2, hw: 1.15, hd: 0.55 };
/** the beer-hall table (long, across x) */
export const TABLE = { y: 0.78, x: 0, z: 0.6, hw: 2.0, hd: 0.45 };
/** the junk dealer's counter */
export const COUNTER = { y: 0.95, x: 0.4, z: 1.4, hw: 1.6, hd: 0.4 };
