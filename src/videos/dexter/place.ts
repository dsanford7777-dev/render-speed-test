// The Timothy Dexter Short (Newburyport, Massachusetts, 1790s): where things stand. Four sets, far apart along x.
// In every set the cameras sit on the -z side looking toward +z, so world +x is screen LEFT.
//   river  the port: a dirt street, clapboard stores on its far side (the tavern, Dexter's shop) and at screen left the
//          bank down to the river, a plank wharf and a moored schooner. Dressed three ways: Newburyport (day),
//          Newcastle (grey, coal heaps, the strike board) and the West Indies (palms, hot light, crates of bed warmers).
//   woods  Lord Dexter's mansion on High Street: the street, a fence, the great arch with three statues, rows of tall
//          columns with wooden statues on them, the white house with its cupola, gold eagle and minarets; a coffin.
//   room   one room, two dressings: the tavern (merchants) and Dexter's study (a standing desk, a page board).
//   north  unused here (kept from the world this was built from).
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
/** the cargo on the wharf: crates of bed warmers, the coal heap */
export const CRATES: V3 = [11, 0.25, 15.5], COALP: V3 = [11.2, 0.25, 20.5];
/** the islanders' cooking fire (West Indies dressing) and Dexter's shop door (with the rack of hides beside it) */
export const FIRE: V3 = [4.5, 0, 6.2], SHOP: V3 = [-24, 0, 5.5];
/** the schooner moored at the wharf's end */
export const SHIP: V3 = [20, WATER_Y, 27];
export const RIVER_SUN: V3 = [-0.45, 0.58, -0.68];

// ---- the mansion (the woods slot) ----
/** High Street runs along x between HS_Z0 and HS_Z1; the fence at FENCE_Z; the arch over the gate (pillars at +-ARCH_W/2,
 *  beam top at ARCH_H, the three statues stand on it); the path to the door; the house front at HOUSE_Z */
export const HS_Z0 = -9, HS_Z1 = -3, FENCE_Z = -2, ARCH_W = 4.6, ARCH_H = 5.0, ARCH_Z = -1.6, PATH_W = 1.3, HOUSE_Z = 18, HOUSE_W = 20, HOUSE_D = 10, HOUSE_H = 9.5;
/** the statue columns (15 ft): their x, z and the height a statue stands at */
export const COL_H = 4.6, COLS: [number, number][] = [[4.2, 2.5], [-4.2, 2.5], [8.4, 2.5], [-8.4, 2.5], [4.2, 7.5], [-4.2, 7.5], [8.4, 7.5], [-8.4, 7.5], [4.2, 12.5], [-4.2, 12.5], [8.4, 12.5], [-8.4, 12.5]];
/** which column carries Dexter's own statue (with his sign) */
export const DEX_COL = 4;
/** the coffin on its trestles in front of the door (the mock wake) */
export const COFFIN: V3 = [0, 0, 12.4];
export const LINE_Z = 6, COMPASS: V3 = [-2.2, 0, 5.4], CLEAR_R = 9;
export const WOODS_SUN: V3 = [-0.45, 0.6, -0.66];

// ---- the room ----
export const ROOM = { w: 5.0, z0: -6, z1: 4.0, h: 3.4 };
/** the tavern's bar (along the back wall) and its table; Congress's big map on the back wall; the convention's stove */
export const BAR = { z: 2.6, x0: -4.4, x1: 0.6, y: 1.1 }, TABLE: V3 = [1.6, 0, 0.2], MAP = { x: 0, y: 2.05, w: 2.6, h: 1.75 }, STOVE: V3 = [3.2, 0, 1.6];
/** the study's standing desk (front edge at DESK z - 0.35, top at DESK_Y) under the page board */
export const DESK: V3 = [0, 0, 2.9], DESK_Y = 1.12;

// ---- the north ----
/** the shore runs along x at z = SHORE_Z (lake beyond); the copper outcrop and the mine portal in the rock face */
export const SHORE_Z = 22, LAKE_Y = -0.6, OUTCROP: V3 = [-3, 0, 7.5], PORTAL: V3 = [6, 0, 9.5];
export const northY = (x: number, z: number) => {
  const base = 0.05 * Math.sin(x * 0.7 + z * 0.4) + 0.04 * Math.sin(x * 1.9 - z * 1.3);
  if (z > SHORE_Z - 3) { const u = Math.min(1, (z - (SHORE_Z - 3)) / 4); return base * (1 - u) + (LAKE_Y - 0.6) * u * u * (3 - 2 * u); }
  return base;
};
export const NORTH_SUN: V3 = [-0.5, 0.42, -0.76];
