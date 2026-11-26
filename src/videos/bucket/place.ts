// The War of the Bucket Short (Bologna vs Modena, 1325): where things stand. Three sets, far apart along x.
// In every set the cameras sit on the -z side looking toward +z, so world +x is screen LEFT.
//   gate  Bologna from outside: the brick city wall along x with square (Guelph) merlons, the Porta San Felice gate
//         tower in the middle, the towers of the city rising behind; in front, the road out of the gate, the road
//         along the wall where Modena runs its race, and the stone well with its wooden bucket (screen left of the gate).
//   hill  the hill country west of Bologna: a hill with a castle on its flat top (Monteveglio, and in the wide shots
//         the castle of Zappolino above the slope where the armies meet), the plain below, the Panaro river off to
//         screen left for the night crossing. Lit at night (September), at sunset (the battle) or on a grey day (January).
//   room  one tall room with four dressings: the tower room in Modena where the bucket hangs on its chain (frescoed
//         walls, a starry vault), the Pope's hall, the Emperor's hall, and the poet's study (1600s).
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "gate" | "hill" | "room";
export const SET: Record<SetKey, V3> = { gate: [0, 0, 0], hill: [500, 0, 0], room: [1100, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const Gt = at("gate"), Hl = at("hill"), Rm = at("room");

// ---- the gate ----
/** the wall's face is at WALL_Z (it runs along x), its body is WALL_T thick; the walk behind the parapet is at WALK_Y */
export const WALL_Z = 16, WALL_T = 2.6, WALL_H = 8.4, PARA_H = 1.1, MERLON_H = 1.2, WALK_Y = 8.4;
/** the gate tower straddles the wall at x = 0: its front face at TOWER_Z, the arch GATE_W wide and GATE_H high */
export const TOWER_W = 11, TOWER_Z = 13.6, TOWER_H = 17, GATE_W = 4.2, GATE_H = 6.2;
/** the road out of the gate runs toward -z; the road along the wall (the race) runs along x at RACE_Z */
export const ROAD_W = 6, RACE_Z = 5.5, RACE_W = 7;
/** the well: a round stone well with two posts, a beam and a windlass; its rope hangs the bucket at WELL_HOOK */
export const WELL: V3 = [10.5, 0, 0.5], WELL_R = 0.95, WELL_H = 0.85;
export const WELL_HOOK: V3 = [WELL[0], 1.62, WELL[2]];
export const GATE_SUN: V3 = [-0.42, 0.62, -0.66];

// ---- the hill ----
/** the hill: a flat top of radius HILL_TOP at HILL_Y around HILL_C, sloping to the plain by HILL_R */
export const HILL_C: [number, number] = [0, 64], HILL_TOP = 20, HILL_R = 58, HILL_Y = 17;
/** the castle on top: a square curtain wall CASTLE_S across, its gatehouse facing -z at CASTLE_GZ */
export const CASTLE_S = 26, CASTLE_H = 9, CASTLE_GZ = HILL_C[1] - CASTLE_S / 2, CASTLE_GATE_W = 3.4, CASTLE_GATE_H = 4.6;
/** the Panaro: a river along z at RIVER_X (screen left of the hill), RIVER_W wide, its water at RIVER_Y */
export const RIVER_X = 74, RIVER_W = 14, RIVER_Y = -1.0;
const sm = (u: number) => { const k = Math.max(0, Math.min(1, u)); return k * k * (3 - 2 * k); };
/** ground height in the hill set (set-local x, z) */
export const hillY = (x: number, z: number) => {
  const d = Math.hypot(x - HILL_C[0], (z - HILL_C[1]) * 0.9);
  const hill = HILL_Y * (1 - sm((d - HILL_TOP) / (HILL_R - HILL_TOP)));
  const roll = 0.35 * Math.sin(x * 0.11 + z * 0.07) + 0.25 * Math.sin(x * 0.23 - z * 0.17) + 0.06 * Math.sin(x * 1.3 + z * 0.9);
  const rd = Math.abs(x - RIVER_X), bank = rd < RIVER_W / 2 + 4 ? -(1 - sm((rd - RIVER_W / 2) / 4)) * 2.2 : 0;
  return Math.max(hill, 0) + roll * (1 - 0.6 * sm((HILL_TOP - d) / 6)) + bank;
};
export const NIGHT_SUN: V3 = [0.35, 0.55, 0.75];   // the moon, up behind the castle, screen right
export const DUSK_SUN: V3 = [-0.78, 0.18, 0.6];    // the sun low in the west, behind the hill at screen left
export const GREY_SUN: V3 = [-0.3, 0.8, -0.45];

// ---- the room ----
export const ROOM = { w: 5.2, z0: -7, z1: 4.2, h: 6.2 };
/** the bucket hangs at the room's centre on its chain from the vault */
export const HANG: V3 = [0, 2.25, 1.0];
/** the dais and its throne (Pope / Emperor) against the back wall; the poet's desk */
export const THRONE: V3 = [0, 0.45, 3.2], DESK: V3 = [0.6, 0, 1.6];
