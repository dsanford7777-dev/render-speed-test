// The Great Stink Short: where things stand, shared by the sets, the world and the shots.
// Four sets, each far from the others along x. In every set the cameras sit on the -z side looking toward +z,
// so world +x is screen LEFT.
//   room    a committee room in Parliament: three tall windows in the back wall (z = 5) looking onto the river
//   river   the Thames in front of Parliament: quay and jetty on the near side, the terrace wall and the building beyond
//   street  a poor court running down to the river: tenements, a parish pump, a gutter
//   sewer   the new brick sewer under the city: a vaulted tunnel running away along +z
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "room" | "river" | "street" | "sewer";
export const SET: Record<SetKey, V3> = { room: [0, 0, 0], river: [200, 0, 0], street: [400, 0, 0], sewer: [600, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const Rm = at("room"), Rv = at("river"), St = at("street"), Sw = at("sewer");

// ---- the room ----
/** half width, front wall z, back (window) wall z, ceiling height */
export const RM = { w: 6.5, z0: -8, z1: 5, h: 5.2 };
/** the three windows in the back wall: centres, width, sill and head heights */
export const WIN = { xs: [-3.7, 0, 3.7], w: 1.6, y0: 1.0, y1: 4.1 };
/** curtains hang just inside the window wall */
export const CURTAIN_Z = 4.78;
/** the clerks' table */
export const TABLE = { x0: -1.4, x1: 1.4, z0: 0.3, z1: 1.5, y: 0.86 };
/** the door in the -x wall (screen right): its centre z and half width */
export const DOOR = { z: -3.2, hw: 0.75 };
/** the barrel of chloride of lime and the buckets, front left */
export const LIME: V3 = [4.7, 0, -1.6];
/** the direction the sun comes FROM in the room (through the windows, toward the camera) */
export const ROOM_SUN: V3 = [-0.2, 0.62, 0.76];

// ---- the river ----
/** near quay edge z, terrace wall face z, terrace height, building front z */
export const RIVER = { zQuay: -4, zWall: 12, yTerrace: 3.2, zFacade: 16.5, yQuay: 0.5 };
/** water level: normal, and after the hot summer */
export const WATER = { high: -0.45, low: -1.75 };
/** the jetty the scientist stands on: half width, how far it runs out, deck height */
export const JETTY = { hw: 1.5, z1: 1.2, y: 0.5 };
/** sewer outfalls in the terrace wall: x of each, centre height */
export const OUTFALLS = [-13, -6.5, 0, 6.5, 13];
export const OUTFALL_Y = -0.35;
export const RIVER_SUN: V3 = [0.42, 0.62, -0.66];

// ---- the street ----
/** half width, near end z, far end (the arch to the river) z */
export const STREET = { w: 3.0, z0: -10, z1: 9 };
export const PUMP: V3 = [1.45, 0, 1.6];
export const STREET_SUN: V3 = [0.62, 0.74, 0.25];

// ---- the sewer ----
/** vault radius, wall height under the vault, channel half width, tunnel ends */
export const SEWER = { r: 2.4, wall: 1.5, ch: 0.85, z0: -8, z1: 64 };
/** hanging lanterns along the crown */
export const SEWER_LAMPS = [2, 10, 18, 26, 34, 42, 50];
