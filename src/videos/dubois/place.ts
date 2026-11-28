// The Dubois Short (Horse Creek, Wyoming Territory, 1889; and the town today): where things stand. Four sets far apart
// along x. In every set the cameras sit on the -z side looking toward +z, so world +x is screen LEFT.
//   river  the Horse Creek settlement: a dirt track along x, log cabins on its far side at screen right (the post office,
//          a store, homesteads), at screen left open sagebrush down to the creek; red badlands and the Absaroka and Wind
//          River mountains painted all round. Two dressings: 1889 and today (the welcome sign, a gravel road).
//   woods  the mission: a small white chapel with a cross and a log mission house on the prairie (Father Roberts).
//   room   one room, three dressings: the settlers' cabin (the meeting, the application), the office in Washington
//          (the application on the wall board: TIBO, then DUBOIS in red; the Idaho / Wyoming map) and a 1937 law office.
//   north  unused (kept from the world this was built from).
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "river" | "woods" | "room" | "north";
export const SET: Record<SetKey, V3> = { river: [0, 0, 0], woods: [400, 0, 0], room: [700, 0, 0], north: [1000, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const Rv = at("river"), Wd = at("woods"), Rm = at("room"), Nt = at("north");

// ---- the settlement on Horse Creek ----
/** the track runs along x between ST_Z0 and ST_Z1; cabins stand behind it (x < BLD_X1) from z = BLD_Z */
export const ST_Z0 = -2.5, ST_Z1 = 2.5, BLD_Z = 5.5, BLD_X1 = -5;
/** the creek: level ground to BANK_Z0, down to the bed by BANK_Z1, the water at WATER_Y, the far bank from FAR_Z */
export const BANK_Z0 = 17, BANK_Z1 = 20, WATER_Y = -1.15, FAR_Z = 30;
export const bankZ = (_x: number) => BANK_Z0;
/** ground height in the settlement (set-local x, z): flat by the cabins, the creek behind, the far bench rising beyond */
export const riverY = (x: number, z: number) => {
  const roll = 0.04 * Math.sin(x * 0.31 + z * 0.23);
  if (z < BANK_Z0) return z > ST_Z1 + 4 && x > -2 ? roll : 0;
  if (z < BANK_Z1) { const u = (z - BANK_Z0) / (BANK_Z1 - BANK_Z0); return -1.6 * u * u * (3 - 2 * u); }
  if (z < FAR_Z) return -1.6;
  return Math.min(3.0, -1.6 + (z - FAR_Z) * 0.42) + 0.3 * Math.sin(x * 0.07);
};
/** the post office cabin (Charles Smith's, its door) and the store; the hitching rail in front of the post office */
export const POST = { x: -13, z: BLD_Z }, STORE: V3 = [-24, 0, BLD_Z];
/** the welcome sign (today): beside the track at screen left, its face to the cameras */
export const WSIGN: V3 = [4.0, 0, 4.2];
/** the trail the mail rider comes in on: along x at z = TRAIL_Z on the open ground at screen left */
export const TRAIL_Z = 0;
export const RIVER_SUN: V3 = [-0.45, 0.62, -0.64];

// ---- the mission (the woods slot) ----
/** the chapel's front (door) at CHAPEL_Z, width CH_W, depth CH_D; the mission house to screen right of it */
export const CHAPEL_Z = 8, CH_W = 6, CH_D = 9, CH_H = 4.4, MHOUSE: V3 = [-10, 0, 9];
export const WOODS_SUN: V3 = [-0.4, 0.66, -0.62];

// ---- the room ----
export const ROOM = { w: 5.0, z0: -6, z1: 4.0, h: 3.4 };
/** the cabin's table (the meeting) and bar slot (a shelf); the office's wall board (MAP); the stove */
export const BAR = { z: 2.6, x0: -4.4, x1: 0.6, y: 1.1 }, TABLE: V3 = [1.6, 0, 0.2], MAP = { x: 0, y: 2.05, w: 2.6, h: 1.75 }, STOVE: V3 = [3.2, 0, 1.6];
/** the law office's desk (the 1937 interview) under the wall board */
export const DESK: V3 = [0, 0, 2.9], DESK_Y = 1.12;

// ---- the north (unused) ----
export const SHORE_Z = 22, LAKE_Y = -0.6, OUTCROP: V3 = [-3, 0, 7.5], PORTAL: V3 = [6, 0, 9.5];
export const northY = (x: number, z: number) => {
  const base = 0.05 * Math.sin(x * 0.7 + z * 0.4) + 0.04 * Math.sin(x * 1.9 - z * 1.3);
  if (z > SHORE_Z - 3) { const u = Math.min(1, (z - (SHORE_Z - 3)) / 4); return base * (1 - u) + (LAKE_Y - 0.6) * u * u * (3 - 2 * u); }
  return base;
};
export const NORTH_SUN: V3 = [-0.5, 0.42, -0.76];
