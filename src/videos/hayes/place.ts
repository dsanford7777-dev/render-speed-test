// The Frank Hayes Short (#22): where everything is. Four sets spread along x (only the one in shot is switched on).
// Cameras sit on the -z side looking toward +z, so world +x is screen LEFT. On the track the horses run toward -x:
// left to right on screen, the grandstand behind them.
//   track   Belmont Park, 1923: the turf steeplechase course (z -22..-2) with brush fences, the dirt main track behind
//           it (z 6..28), the grandstand beyond (z 36..), the finish post and the judges' stand at x = 0
//   stable  a barn aisle, stalls both sides, the door at the far end open to the morning
//   weigh   the jockeys' weighing room: the big dial scale, the clerk's desk
//   grave   Holy Cross Cemetery, Brooklyn: rows of headstones on a slope, trees, an iron fence
export type V3 = [number, number, number];
export const FPS = 30;
export const SET = { track: [0, 0, 0] as V3, stable: [2000, 0, 0] as V3, weigh: [3000, 0, 0] as V3, grave: [4000, 0, 0] as V3 };
export const Tk = (x: number, y: number, z: number): V3 => [SET.track[0] + x, y, z];
export const Sb = (x: number, y: number, z: number): V3 => [SET.stable[0] + x, y, z];
export const Wr = (x: number, y: number, z: number): V3 => [SET.weigh[0] + x, y, z];
export const Gv = (x: number, y: number, z: number): V3 => [SET.grave[0] + x, y, z];

// ---- the track ----
/** the turf course: the horses' line runs along z = LANE (lanes 1..5 step 2.2 m toward the stand) */
export const TURF = { z0: -22, z1: -2 };
export const LANE = (k: number) => -16 + k * 2.2;
export const DIRT = { z0: 6, z1: 28 };
export const STAND = { z0: 36, x0: -70, x1: 150, h: 16 };
/** the brush fences along the turf course (x); the last one before the finish is LAST */
export const FENCES = [380, 250, 120];
export const LAST = 120;
/** the finish post (on the stand-side rail of the turf course) and the judges' stand just past it, in the strip
 *  between the two tracks. Sweet Kiss pulled up about 100 yards past the line, near the judges' stand. */
export const POST = { x: 0, z: -1.2 };
export const JUDGES = { x: -78, z: 2.2 };
/** where Frank came off: just short of the judges' stand */
export const FALL = { x: -70, z: LANE(2) };
/** the ground is flat on the course; it rises a little behind the stand and on the infield's far side */
export const trackY = (x: number, z: number) => (z > 70 ? Math.min(14, (z - 70) * 0.25) : 0) + (z < -60 ? Math.min(8, (-60 - z) * 0.06) : 0) + 0 * x;

// ---- the stable: an aisle along z, stalls each side (x = +-2.6 .. +-5.6), the door at z = 34 ----
export const AISLE = { hw: 1.8, z0: -14, z1: 34, h: 4.2, stall: 3.4 };
/** the stall fronts on each side: k = 0.. along the aisle */
export const STALL_Z = (k: number) => -10 + k * AISLE.stall;

// ---- the weighing room ----
export const ROOM = { w: 9, d: 8, h: 3.6 };
export const SCALE = { x: 0.8, z: 2.2 };

// ---- the cemetery ----
export const HILL = (x: number, z: number) => 0.03 * z + 0.4 * Math.sin(x * 0.05) + 0.3 * Math.sin(z * 0.07 + 1.1);
export const GRAVE = { x: 0, z: 6 };
