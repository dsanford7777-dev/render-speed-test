// The Centralia Short (the dump fire of May 27, 1962 that became a mine fire, the 1981 sinkhole, the buyout): where
// things stand. Five sets, far apart along x. In every set the cameras sit on the -z side looking toward +z, so world +x
// is screen LEFT.
//   town   the main street: asphalt road, a brick block with the borough sign and the post office, frame houses both
//          sides, the hill behind. 1962 (whole), or today (most houses gone, grass lots, the road cracked and smoking).
//   pit    the town dump in an old strip-mine pit beside the cemetery: rock walls in layers with a black coal seam,
//          a heap of rubbish at the bottom, the fire company's truck on the rim; a trench and a borehole further along.
//   mine   one old mine tunnel: coal walls, timber sets, rails; cold and dark (the old mines) or burning (the fire).
//   yard   a back yard in winter (Feb 14, 1981): the back of a house, a fence, an old tree; the sinkhole opens by it.
//   room   one room, dressed as the borough council's room (1962) or as a house cellar (gas through the floor).
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "town" | "pit" | "mine" | "yard" | "room";
export const SET: Record<SetKey, V3> = { town: [0, 0, 0], pit: [400, 0, 0], mine: [700, 0, 0], yard: [1000, 0, 0], room: [1300, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const Tw = at("town"), Pt = at("pit"), Mn = at("mine"), Yd = at("yard"), Rm = at("room");

// ---- the town ----
/** the road runs along x; its near kerb at z = ROAD_Z0, far kerb ROAD_Z1; the brick block's front at FRONT_Z */
export const ROAD_Z0 = -4, ROAD_Z1 = 4, WALK_Z = 4.15, FRONT_Z = 7;
/** the big crack across the road (today): centre and length along x, its line wanders in z */
export const CRACK: V3 = [0, 0, 0];
export const crackZ = (x: number) => 0.9 * Math.sin(x * 0.45) + 0.35 * Math.sin(x * 1.3 + 1);
/** the two holdout houses (today) and their porches */
export const HOLD = [{ x: 13, z: 11 }, { x: -16, z: 12 }];
/** John Coddington's gas station (1962 town, far side of the street) */
export const GAS = { x: -31, z: 7 };
export const TOWN_SUN: V3 = [-0.5, 0.55, -0.66];

// ---- the pit ----
/** the pit: an ellipse (radii RX, RZ) round PIT_C, DEPTH deep; walls steep, floor flat; the seam band in the wall */
export const PIT_C: V3 = [0, 0, 16], RX = 17, RZ = 11, DEPTH = 9;
export const SEAM: [number, number] = [-6.2, -4.6];
const sm = (a: number, b: number, x: number) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
/** ground height in the pit set (set-local x, z) before the small noise */
export const pitY = (x: number, z: number) => { const r = Math.hypot((x - PIT_C[0]) / RX, (z - PIT_C[2]) / RZ); return -DEPTH * (1 - sm(0.62, 1.0, r)); };
/** the rubbish heap on the pit floor */
export const HEAP: V3 = [2, -DEPTH, 18];
/** the rim where the firemen stand (near side, toward the camera) and the truck */
export const RIM: V3 = [0, 0, 16 - RZ - 1.5];
export const TRUCK: V3 = [8, 0, RIM[2] - 2.2];
/** the trench and the borehole (later years), off to screen right (-x) */
export const TRENCH: V3 = [-34, 0, 4], BORE: V3 = [-46, 0, 2];
export const PIT_SUN: V3 = [-0.45, 0.6, -0.66];

// ---- the mine ----
/** the tunnel runs along +z from the camera end: half width, height, length */
export const TUN = { hw: 1.6, h: 2.4, z0: -6, z1: 60 };

// ---- the yard ----
/** the house's back wall at z = HOUSE_Z; the tree; the sinkhole beside it */
export const HOUSE_Z = 9, TREE: V3 = [2.2, 0, 3.2], HOLE: V3 = [0.6, 0, 2.4], HOLE_R = 0.62;
export const YARD_SUN: V3 = [-0.4, 0.5, -0.76];

// ---- the room ----
export const ROOM = { w: 4.6, z0: -5.5, z1: 3.6, h: 3.0 };
export const DESK = { y: 0.8, x: 0, z: 1.2, hw: 1.3, hd: 0.55 };
