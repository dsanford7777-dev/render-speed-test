// The Toledo War Short (Ohio vs the Michigan Territory, 1835-36): where things stand. Four sets, far apart along x.
// In every set the cameras sit on the -z side looking toward +z, so world +x is screen LEFT.
//   river  Toledo, 1835: a dirt street, log and frame buildings on its far side (the tavern among them, at screen
//          right), and at screen left the bank dropping to the Maumee, a plank wharf and a moored schooner.
//   woods  Phillips Corners: a forest clearing with the survey line (stakes, a chain, a compass on its staff).
//   room   one room with three dressings: the tavern (bar, barrels, lanterns), Congress (columns, desks, the big map),
//          the Frostbitten Convention (log walls, a stove, frosted windows, benches).
//   north  the Upper Peninsula: a pine forest and a rocky Lake Superior shore with a copper outcrop and a mine portal,
//          in winter (snow, ice) or summer (the copper years).
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "river" | "woods" | "room" | "north";
export const SET: Record<SetKey, V3> = { river: [0, 0, 0], woods: [400, 0, 0], room: [700, 0, 0], north: [1000, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const Rv = at("river"), Wd = at("woods"), Rm = at("room"), Nt = at("north");

// ---- the river town ----
/** the street runs along x between ST_Z0 and ST_Z1; buildings stand behind it (x < BLD_X1) from z = BLD_Z */
export const ST_Z0 = -3, ST_Z1 = 3, BLD_Z = 5.5, BLD_X1 = -5;
/** the bank: level ground to BANK_Z0, down to the water level WATER_Y by BANK_Z1; the far bank from FAR_Z */
export const BANK_Z0 = 9, BANK_Z1 = 14, WATER_Y = -1.3, FAR_Z = 70;
/** where the bank starts dropping: BANK_Z0 at screen left (the wharf side), well back behind the buildings at screen right */
export const bankZ = (x: number) => { const u = Math.max(0, Math.min(1, (x + 2) / -7)); return BANK_Z0 + (34 - BANK_Z0) * u * u * (3 - 2 * u); };
/** ground height in the river set (set-local x, z) */
export const riverY = (x: number, z: number) => {
  const z0 = bankZ(x), z1 = z0 + (BANK_Z1 - BANK_Z0);
  if (z < z0) return 0;
  if (z < z1) { const u = (z - z0) / (z1 - z0); return -2.6 * u * u * (3 - 2 * u); }
  if (z < FAR_Z) return -2.6;
  return Math.min(1.5, -2.6 + (z - FAR_Z) * 0.45);
};
/** the tavern's front (its door) and the wharf (x range, how far it runs out over the water) */
export const TAVERN = { x: -13, z: BLD_Z }, WHARF = { x0: 9, x1: 13, z1: 26, y: 0.25 };
/** the schooner moored at the wharf's end */
export const SHIP: V3 = [20, WATER_Y, 27];
export const RIVER_SUN: V3 = [-0.45, 0.58, -0.68];

// ---- the woods ----
/** the survey line runs along x at z = LINE_Z; the compass on its staff; the clearing's radius */
export const LINE_Z = 6, COMPASS: V3 = [-2.2, 0, 5.4], CLEAR_R = 9;
export const WOODS_SUN: V3 = [-0.35, 0.62, -0.7];

// ---- the room ----
export const ROOM = { w: 5.0, z0: -6, z1: 4.0, h: 3.4 };
/** the tavern's bar (along the back wall) and its table; Congress's big map on the back wall; the convention's stove */
export const BAR = { z: 2.6, x0: -4.4, x1: 0.6, y: 1.1 }, TABLE: V3 = [1.6, 0, 0.2], MAP = { x: 0, y: 2.0, w: 3.6, h: 2.3 }, STOVE: V3 = [3.2, 0, 1.6];

// ---- the north ----
/** the shore runs along x at z = SHORE_Z (lake beyond); the copper outcrop and the mine portal in the rock face */
export const SHORE_Z = 22, LAKE_Y = -0.6, OUTCROP: V3 = [-3, 0, 7.5], PORTAL: V3 = [6, 0, 9.5];
export const northY = (x: number, z: number) => {
  const base = 0.05 * Math.sin(x * 0.7 + z * 0.4) + 0.04 * Math.sin(x * 1.9 - z * 1.3);
  if (z > SHORE_Z - 3) { const u = Math.min(1, (z - (SHORE_Z - 3)) / 4); return base * (1 - u) + (LAKE_Y - 0.6) * u * u * (3 - 2 * u); }
  return base;
};
export const NORTH_SUN: V3 = [-0.5, 0.42, -0.76];
